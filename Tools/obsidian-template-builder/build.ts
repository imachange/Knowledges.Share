import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript'; // TypeScriptコンパイラをインポート

// ソースとなるTypeScriptテンプレートファイルがあるディレクトリ
const sourceDir = path.join(__dirname, 'src');
// 部品となるJavaScript/TypeScriptファイルがあるモジュールディレクトリ
const modulesDir = path.join(sourceDir, 'modules');
// 変換後の.mdファイルを出力するディレクトリ
const outputDir = path.join(__dirname, '../../Config/Archetypes');

console.log(`ソースディレクトリ: ${sourceDir}`);
console.log(`モジュールディレクトリ: ${modulesDir}`);
console.log(`出力ディレクトリ: ${outputDir}`);

// 出力ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
    console.log(`出力ディレクトリ ${outputDir} を作成します。`);
    fs.mkdirSync(outputDir, { recursive: true });
}

// TypeScriptのコンパイルオプションを設定
const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext, // 最新のECMAScript機能を使用
    module: ts.ModuleKind.CommonJS, // モジュール形式はCommonJS (Node.js環境向け)
    // その他のオプションはtsconfig.jsonで管理されるため、ここでは最小限に
};

/**
 * 指定されたTypeScriptファイルをJavaScriptにトランスパイルします。
 * エラーがあればコンソールに出力し、nullを返します。
 * @param filePath トランスパイルするファイルのパス
 * @returns トランスパイルされたJavaScriptコード、またはエラーの場合はnull
 */
function transpileTsFile(filePath: string): string | null {
    const tsCode = fs.readFileSync(filePath, 'utf8');
    const transpiled = ts.transpileModule(tsCode, { compilerOptions: compilerOptions });

    // トランスパイル結果にエラーがあるかチェック
    if (transpiled.diagnostics && transpiled.diagnostics.length > 0) {
        transpiled.diagnostics.forEach(diagnostic => {
            if (diagnostic.file) {
                const { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
                const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                console.error(`  ${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
            } else {
                console.error(`  ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
            }
        });
        console.error(`${filePath} のトランスパイルにエラーがあります。`);
        return null;
    }
    return transpiled.outputText;
}

// --- モジュールファイルの処理 ---
let allModulesJsCode = '';
if (fs.existsSync(modulesDir)) {
    console.log(`モジュールディレクトリ ${modulesDir} を読み込み中...`);
    const moduleFiles = fs.readdirSync(modulesDir);

    moduleFiles.forEach(moduleFile => {
        // .ts ファイルのみを処理
        if (path.extname(moduleFile) === '.ts') {
            const moduleFilePath = path.join(modulesDir, moduleFile);
            console.log(`  モジュールを変換中: ${moduleFile}`);
            const transpiledModuleCode = transpileTsFile(moduleFilePath);
            if (transpiledModuleCode) {
                // 各モジュールのJSコードを結合
                allModulesJsCode += transpiledModuleCode + '\n';
            }
        }
    });
    if (allModulesJsCode) {
        console.log('すべてのモジュールが変換され、結合されました。');
    } else {
        console.log('モジュールディレクトリに有効なTypeScriptファイルが見つかりませんでした。');
    }
} else {
    console.log('モジュールディレクトリが見つかりませんでした。モジュールは結合されません。');
}

// --- メインテンプレートファイルの処理 ---
fs.readdir(sourceDir, (err, files) => {
    if (err) {
        console.error('ソースディレクトリの読み込みエラー:', err);
        return;
    }

    files.forEach(file => {
        // 'modules' ディレクトリ自体はスキップ
        if (file === 'modules') {
            return;
        }

        // .ts ファイルのみを処理 (メインテンプレート)
        if (path.extname(file) === '.ts') {
            const tsFilePath = path.join(sourceDir, file);
            // 出力する.mdファイルの名前を決定 (例: dailyNote.ts -> Daily Note.md)
            const mdFileName = file.replace(/\.ts$/, '.md')
                                   .replace(/([A-Z])/g, ' $1') // キャメルケースをスペース区切りに変換
                                   .replace(/^./, str => str.toUpperCase()); // 先頭を大文字に

            const mdOutputFilePath = path.join(outputDir, mdFileName);

            const transpiledMainCode = transpileTsFile(tsFilePath);

            if (transpiledMainCode === null) {
                console.error(`${file} のトランスパイルに失敗しました。MDファイルは生成されません。`);
                return;
            }

            // モジュールコードとメインテンプレートコードを結合
            // モジュールコードをメインテンプレートコードの前に配置します。
            const finalJsCode = allModulesJsCode + transpiledMainCode;

            // Obsidianテンプレートの形式に整形
            // 結合されたJavaScriptコードを <%* と -%> で囲む
            const templateContent = `<%*\n${finalJsCode.trim()}\n-%>`;

            // .mdファイルとして出力
            fs.writeFile(mdOutputFilePath, templateContent, 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error(`${mdFileName} の書き込みエラー:`, writeErr);
                    return;
                }
                console.log(`成功: ${file} を ${mdFileName} に変換しました。`);
            });
        }
    });
});

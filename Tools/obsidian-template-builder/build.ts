import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript'; // TypeScriptコンパイラをインポート

// ソースとなるTypeScriptテンプレートファイルがあるディレクトリ
const sourceDir = path.join(__dirname, 'src');
// 変換後の.mdファイルを出力するディレクトリ
// build.tsから見て '../../Config/Archetypes' は 'Share/Config/Archetypes' を指します
const outputDir = path.join(__dirname, '../../Config/Archetypes');

console.log(`ソースディレクトリ: ${sourceDir}`);
console.log(`出力ディレクトリ: ${outputDir}`);

// 出力ディレクトリが存在しない場合は作成
if (!fs.existsSync(outputDir)) {
    console.log(`出力ディレクトリ ${outputDir} を作成します。`);
    fs.mkdirSync(outputDir, { recursive: true });
}

// TypeScriptのコンパイルオプションを設定
// テンプレートのJavaScriptはシンプルなESNext形式で出力したい
const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext, // 最新のECMAScript機能を使用
    module: ts.ModuleKind.CommonJS, // モジュール形式はCommonJS (Node.js環境向け)
    // その他のオプションはtsconfig.jsonで管理されるため、ここでは最小限に
};

fs.readdir(sourceDir, (err, files) => {
    if (err) {
        console.error('ソースディレクトリの読み込みエラー:', err);
        return;
    }

    files.forEach(file => {
        // .ts ファイルのみを処理
        if (path.extname(file) === '.ts') {
            const tsFilePath = path.join(sourceDir, file);
            // 出力する.mdファイルの名前を決定 (例: dailyNote.ts -> Daily Note.md)
            const mdFileName = file.replace(/\.ts$/, '.md')
                                   .replace(/([A-Z])/g, ' $1') // キャメルケースをスペース区切りに変換
                                   .replace(/^./, str => str.toUpperCase()); // 先頭を大文字に

            const mdOutputFilePath = path.join(outputDir, mdFileName);

            fs.readFile(tsFilePath, 'utf8', (readErr, tsCode) => {
                if (readErr) {
                    console.error(`${file} の読み込みエラー:`, readErr);
                    return;
                }

                console.log(`変換中: ${file}`);

                // TypeScriptコードをJavaScriptにトランスパイル
                const transpiled = ts.transpileModule(tsCode, {
                    compilerOptions: compilerOptions
                });

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
                    console.error(`${file} のトランスパイルにエラーがあります。MDファイルは生成されません。`);
                    return; // エラーがあればMDファイルは生成しない
                }

                // Obsidianテンプレートの形式に整形
                // トランスパイルされたJavaScriptコードを <%* と -%> で囲む
                const templateContent = `<%*\n${transpiled.outputText.trim()}\n-%>`;

                // .mdファイルとして出力
                fs.writeFile(mdOutputFilePath, templateContent, 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error(`${mdFileName} の書き込みエラー:`, writeErr);
                        return;
                    }
                    console.log(`成功: ${file} を ${mdFileName} に変換しました。`);
                });
            });
        }
    });
});

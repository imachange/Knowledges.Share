import { defineConfig, Plugin } from 'vite';
import * as path from 'path';
import * as fs from 'fs';
import { globSync } from 'glob'; // globSyncはファイルパターンマッチングに便利

// Obsidianテンプレートのファイル名変換ロジック
function convertTemplateFilenameToObsidianStyle(filename: string): string {
    return filename
        .replace(/\.js$/, '.md') // .js拡張子を.mdに変換 (Viteの出力は.jsになるため)
        .replace(/([A-Z])/g, ' $1') // キャメルケースをスペース区切りに変換
        .replace(/^./, str => str.toUpperCase()); // 先頭を大文字に
}

// Obsidianテンプレートラッパー＆リネームプラグイン
function obsidianTemplatePlugin(): Plugin {
    return {
        name: 'obsidian-template-wrapper-and-renamer',

        // RollupのgenerateBundleフックを使用
        // バンドルが生成される直前に介入し、内容とファイル名を変更します。
        generateBundle(options, bundle) {
            for (const fileName in bundle) {
                const chunk = bundle[fileName];

                // Archetypes/ フォルダからのエントリーポイントのみを処理（テンプレートファイル）
                // scripts/ フォルダからのファイルは別の処理で扱います
                // chunk.fileName は output.entryFileNames で指定されたパスになるため、
                // ここでは 'Archetypes/' で始まるかを確認します。
                if (chunk.type === 'chunk' && chunk.fileName.startsWith('Archetypes/') && chunk.fileName.endsWith('.js')) {
                    // 最終的なJavaScriptコードを <%* と -%> で囲む
                    const wrappedCode = `<%*\n${chunk.code.trim()}\n-%>`;

                    // チャンクの内容を更新
                    chunk.code = wrappedCode;

                    // ファイル名をObsidianテンプレート形式に変換
                    // 例: Archetypes/dailyNote.js -> Archetypes/Daily Note.md
                    const originalBaseName = path.basename(chunk.fileName, '.js'); // 例: dailyNote
                    const newFileName = 'Archetypes/' + convertTemplateFilenameToObsidianStyle(originalBaseName); // Archetypes/ を再度付与

                    // 新しいファイル名でチャンクを再登録し、古いチャンクを削除
                    delete bundle[fileName]; // 古いエントリを削除
                    chunk.fileName = newFileName; // ファイル名を更新
                    bundle[newFileName] = chunk; // 新しいエントリを追加

                    console.log(`✅ テンプレート変換: ${fileName} -> ${newFileName}`);
                }
            }
        },
    };
}

// Viteの設定を定義
export default defineConfig({
    plugins: [
        obsidianTemplatePlugin() // カスタムプラグインを登録
    ],
    build: {
        // 出力ディレクトリをクリーンアップ
        emptyOutDir: true,

        rollupOptions: {
            // 複数のエントリーポイントを定義
            input: {
                // テンプレートファイルのエントリーポイント (src/ フォルダ内)
                // src/modules は import されるため、ここには含めません
                ...globSync(path.resolve(__dirname, 'src/*.ts')).reduce((acc, filePath) => {
                    const name = path.basename(filePath, path.extname(filePath));
                    if (name !== 'modules') { // 'modules' ディレクトリ自体はエントリーポイントにしない
                        acc[name] = filePath; // <-- ここを修正: 'src/' プレフィックスを削除
                    }
                    return acc;
                }, {} as Record<string, string>),

                // スクリプトファイルのエントリーポイント (scripts/ フォルダ内)
                ...globSync(path.resolve(__dirname, 'scripts/*.ts')).reduce((acc, filePath) => {
                    const name = path.basename(filePath, path.extname(filePath));
                    acc[name] = filePath; // <-- ここを修正: 'scripts/' プレフィックスを削除
                    return acc;
                }, {} as Record<string, string>),
            },

            output: {
                // 出力パスとファイル名の制御
                // 各エントリーポイントの出力先をカスタマイズします
                entryFileNames: (chunkInfo) => {
                    // src/ フォルダからのエントリーポイントは Archetypes/ へ
                    // chunkInfo.facadeModuleId は元のファイルパス全体になるため、
                    // src/ または scripts/ のどちらから来たかを確認します。
                    if (chunkInfo.facadeModuleId?.startsWith(path.resolve(__dirname, 'src'))) {
                        return `Archetypes/[name].md`; // Archetypes/ サブディレクトリへ
                    }
                    // scripts/ フォルダからのエントリーポイントは Scripts/ へ
                    else if (chunkInfo.facadeModuleId?.startsWith(path.resolve(__dirname, 'scripts'))) {
                        return `Scripts/[name].js`; // Scripts/ サブディレクトリへ
                    }
                    // その他のチャンク（共有モジュールなど）
                    return '[name].js';
                },
                chunkFileNames: 'chunks/[name]-[hash].js', // 分割されたチャンクのファイル名
                assetFileNames: 'assets/[name]-[hash].[ext]', // その他のアセット

                // 各エントリーポイントの出力ディレクトリを制御
                // ViteのoutDirは一つしか指定できないため、Rollupの出力パスで調整します
                // `Share/Config` を共通の出力ディレクトリとする
                dir: path.resolve(__dirname, '../../Config'),

                // スクリプトのミニファイを無効化
                minifyInternalExports: false,
                compact: false,
            },
        },
    },
});

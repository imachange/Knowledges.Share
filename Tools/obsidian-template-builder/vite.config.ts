import { defineConfig, Plugin } from 'vite';
import * as path from 'path';
import * as fs from 'fs';

// Obsidainテンプレートのファイル名変換ロジック
function convertFilenameToObsidianStyle(filename: string): string {
    return filename
        .replace(/\.js$/, '.md') // .js拡張子を.mdに変換 (Viteの出力は.jsになるため)
        .replace(/([A-Z])/g, ' $1') // キャメルケースをスペース区切りに変換
        .replace(/^./, str => str.toUpperCase()); // 先頭を大文字に
}

// Obsidianテンプレートラッパープラグイン
function obsidianTemplatePlugin(): Plugin {
    return {
        name: 'obsidian-template-wrapper',

        // RollupのgenerateBundleフックを使用
        // バンドルが生成される直前に介入し、内容とファイル名を変更します。
        generateBundle(options, bundle) {
            for (const fileName in bundle) {
                const chunk = bundle[fileName];

                // チャンクがコードチャンク（JavaScriptファイル）であることを確認
                if (chunk.type === 'chunk' && chunk.fileName.endsWith('.js')) {
                    // 最終的なJavaScriptコードを <%* と -%> で囲む
                    const wrappedCode = `<%*\n${chunk.code.trim()}\n-%>`;

                    // チャンクの内容を更新
                    chunk.code = wrappedCode;

                    // ファイル名をObsidianテンプレート形式に変換
                    const newFileName = convertFilenameToObsidianStyle(chunk.fileName);

                    // 新しいファイル名でチャンクを再登録し、古いチャンクを削除
                    // これにより、Vite/Rollupが正しいファイル名で出力します。
                    delete bundle[fileName]; // 古いエントリを削除
                    chunk.fileName = newFileName; // ファイル名を更新
                    bundle[newFileName] = chunk; // 新しいエントリを追加

                    console.log(`✅ Transformed ${fileName} to ${newFileName}`);
                }
            }
        },
    };
}

// Viteの設定を定義
export default defineConfig({
    plugins: [obsidianTemplatePlugin()], // カスタムプラグインを登録
    build: {
        // 出力ディレクトリ
        outDir: path.resolve(__dirname, '../../Config/Archetypes'),
        emptyOutDir: true, // ビルド前に出力ディレクトリをクリーンアップ

        rollupOptions: {
            // 各テンプレートファイルをRollupの入力エントリーポイントとして定義
            // src/modules内のファイルは、importされることで自動的にバンドル・ツリーシェイクされます。
            input: fs.readdirSync(path.resolve(__dirname, 'src')).filter(file => {
                // 'modules' ディレクトリ自体はエントリーポイントから除外
                // '.ts' ファイルのみをエントリーポイントとする
                return file.endsWith('.ts') && file !== 'modules';
            }).map(file => path.resolve(__dirname, 'src', file)),

            output: {
                // ファイル名を変更するロジックはプラグインで行うため、
                // ここではデフォルトのファイル名パターンを使用します。
                // プラグインが generateBundle で介入し、最終的なファイル名を変更します。
                entryFileNames: '[name].js', // 例: dailyNote.js
                chunkFileNames: 'chunks/[name]-[hash].js', // 分割されたチャンクのファイル名
                assetFileNames: 'assets/[name]-[hash].[ext]', // その他のアセット
            },
        },
        // Rollupの警告を制御（必要に応じて）
        // rollupOptions: {
        //   onwarn(warning, warn) {
        //     // 'use client' や 'use server' の警告を無視するなど
        //     if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        //       return;
        //     }
        //     warn(warning);
        //   },
        // },
    },
});

// Share/tools/obsidian-template-builder/types/global-shims.d.ts

// 開発をブロックしないための、一時的なグローバル変数宣言
// これらはObsidianテンプレートの実行環境で提供されますが、
// TypeScriptの型チェックを一時的に無効化するためにany型で宣言します。

/** ObsidianのAppオブジェクト */
declare const app: any;

/** TemplaterのAPIオブジェクト */
declare const tp: any;

/** DataviewのAPIオブジェクト */
declare const dv: any;

/** Templaterの出力バッファ */
declare const tR: any;

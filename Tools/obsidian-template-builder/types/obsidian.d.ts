// Share/tools/obsidian-template-builder/types/dataview.d.ts

// Dataview API の型定義
// これはDataviewのドキュメントや実際の使用例に基づいて拡張できます。
declare namespace Dataview {
    interface Core {
        /** クエリーにマッチするページのコレクションを返す */
        pages(query?: string): any; // DataviewのPagesオブジェクトの型は複雑なので、anyで簡易的に
        /** 与えられたデータからテーブルを生成 */
        table(headers: string[], data: any[][]): string;
        /** 与えられたデータからリストを生成 */
        list(data: any[]): string;
        /** 与えられたデータからタスクリストを生成 */
        taskList(data: any[], groupByFile?: boolean): string;
        /** DataviewのAPIバージョン */
        api: any;
        /** Dataviewの設定 */
        settings: any;
        /** ObsidianのAppオブジェクトへの参照 */
        app: import("obsidian").App; // obsidian-apiからApp型をインポート
        /** データソースを登録する */
        registerDataInterface(interface: string, data: any): void;
        /** クエリー結果をソートする */
        sort<T>(array: T[], field: string, direction?: "asc" | "desc"): T[];
        /** クエリー結果をグループ化する */
        group<T>(array: T[], field: string): { key: any, rows: T[] }[];
        /** 値をレンダリングする */
        renderValue(value: any, originFile: string, container: HTMLElement, options?: any): void;
        // ... 他のメソッドやプロパティも追加
    }
}

// グローバル変数として `dv` を宣言
declare const dv: Dataview.Core;

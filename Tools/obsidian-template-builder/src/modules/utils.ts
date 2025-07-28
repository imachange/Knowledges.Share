export function helloWorld() {
    console.log("Hello, World!");
}

// Share/tools/obsidian-template-builder/src/modules/helperFunctions.ts

/**
 * 指定された文字列を大文字に変換します。
 * @param text 変換する文字列
 * @returns 大文字に変換された文字列
 */
export function toUpperCaseHelper(text: string): string {
    return text.toUpperCase();
}

/**
 * ランダムなUUIDを生成します。
 * @returns UUID文字列
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

    // 他のヘルパー関数も同様に export します。
    
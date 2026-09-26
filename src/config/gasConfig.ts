// src/config/gasConfig.ts

// 1箇所書き換えるだけで全てのfetchが更新されるようにします
export const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbxbvIlzAgZEeeW0lQ8jGXddwrozlYTmpljgYTNTwW8DTDapR4899zyToExMewNv53YP/exec';

// シート名を切り替えるヘルパー関数を用意しておくと便利です
export const getGasUrl = (sheetName?: string) => {
    return sheetName ? `${GAS_BASE_URL}?sheet=${sheetName}` : GAS_BASE_URL;
};
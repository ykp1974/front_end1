// src/config/gasConfig.ts

// 1箇所書き換えるだけで全てのfetchが更新されるようにします
export const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbyWDeWXdvZnfJ2HeIo4lq4otf2Zx1353NKZWmIr7Wsh2XF-0OgRUqxIbj5S682l8iUI/exec';

// シート名を切り替えるヘルパー関数を用意しておくと便利です
export const getGasUrl = (sheetName?: string) => {
    return sheetName ? `${GAS_BASE_URL}?sheet=${sheetName}` : GAS_BASE_URL;
};
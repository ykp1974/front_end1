// src/config/gasConfig.ts

// 1箇所書き換えるだけで全てのfetchが更新されるようにします
export const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbwYqzHL7kRJ1ue3P3M06UJC0EZWb2ugjuIfn9nQtTm9z1eftJackMBYFzxeqr2xCQp0/exec';

// シート名を切り替えるヘルパー関数を用意しておくと便利です
export const getGasUrl = (sheetName?: string) => {
    return sheetName ? `${GAS_BASE_URL}?sheet=${sheetName}` : GAS_BASE_URL;
};
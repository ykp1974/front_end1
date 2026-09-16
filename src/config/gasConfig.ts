// src/config/gasConfig.ts

// 1箇所書き換えるだけで全てのfetchが更新されるようにします
export const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbwIHu3jd5d6OO6ns3RO8ULa8RJyhLvtqdxV0TjjtO0hZhtf17Jvd-ZBxirggKEjI8yA/exec';

// シート名を切り替えるヘルパー関数を用意しておくと便利です
export const getGasUrl = (sheetName?: string) => {
    return sheetName ? `${GAS_BASE_URL}?sheet=${sheetName}` : GAS_BASE_URL;
};
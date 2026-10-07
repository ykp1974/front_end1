// src/config/gasConfig.ts

// 1箇所書き換えるだけで全てのfetchが更新されるようにします
export const GAS_BASE_URL = 'https://script.google.com/macros/s/AKfycbzmHH58c4uYxNejK_P2g6kFy6Bzj6KXc_e0MnYzmG3kaTVoHPVR9LyK_58nXdcDyZ0/exec';

// シート名を切り替えるヘルパー関数を用意しておくと便利です
export const getGasUrl = (sheetName?: string) => {
    return sheetName ? `${GAS_BASE_URL}?sheet=${sheetName}` : GAS_BASE_URL;
};
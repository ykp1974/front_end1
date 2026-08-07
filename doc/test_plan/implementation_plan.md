# 自動テスト導入およびテストコード作成計画

本プロジェクト（DecisionLoggerのフロントエンド）の各モジュールに対して、自動テスト環境を導入し、テストコード一式を作成する計画です。

## 1. ゴール
Vite + React + TypeScript プロジェクトに自動テスト（Vitest + React Testing Library）を導入し、ビジネスロジック（storage）および各画面（RecordListPage / RecordFormPage / RecordDetailPage）のテストコードを作成・実行可能にする。

## 2. 前提
- **テストフレームワーク**: Vitest（Viteと親和性が高く、高速）
- **DOMテストライブラリ**: React Testing Library + `@testing-library/jest-dom` + `jsdom`
- **対象環境**: ローカル開発環境（Windows）

## 3. タスク分解

1. `package.json` へのテスト関連パッケージのインストール
2. Vitest/jsdom 設定ファイルの作成および `vite.config.ts` へのテスト設定追加
3. `tsconfig.json` もしくは `tsconfig.app.json` へのテストファイルの型定義サポート追加
4. `src/services/storage.ts` の単体テスト作成 (`src/services/__tests__/storage.test.ts`)
   - `localStorage` のモックを使用
   - `GAS` への fetch 処理のモック
   - `loadRecords`, `saveRecords`, `addRecord`, `getRecordById`, `getRecordsByTicker`, `deleteRecord` のテスト
5. `src/pages/RecordListPage.tsx` のコンポーネントテスト作成 (`src/pages/__tests__/RecordListPage.test.tsx`)
   - GASからデータをフェッチしてテーブル表示する動作のモックテスト
   - ローディング状態、エラー状態のテスト
6. `src/pages/RecordFormPage.tsx` のコンポーネントテスト作成 (`src/pages/__tests__/RecordFormPage.test.tsx`)
   - フォーム入力とバリデーション、送信イベント（GASポスト）の動作テスト
7. `src/pages/RecordDetailPage.tsx` のコンポーネントテスト作成 (`src/pages/__tests__/RecordDetailPage.test.tsx`)
   - 特定のレコードを取得・表示する動作テスト
8. テストのローカル実行による動作確認と微調整

## 4. 影響範囲
- **新規追加ファイル**:
  - `front_end1/vitest.config.ts` (あるいは `vite.config.ts` へのマージ)
  - `front_end1/src/test/setup.ts` (テストの共通セットアップ: `jest-dom` インポート等)
  - 各種テストファイル (`*.test.ts`, `*.test.tsx`)
- **変更ファイル**:
  - `front_end1/package.json`
  - `front_end1/vite.config.ts`
  - `front_end1/tsconfig.app.json` もしくは `tsconfig.json`

## 5. リスクと対策

| リスク | 対策 |
| :--- | :--- |
| GASへのHTTP通信 (`fetch`) がテスト実行時に実際に発生して不安定になる | `global.fetch` を Vitest の `vi.stubGlobal` もしくは `msw` 等でモック化する |
| `react-router-dom` の `Link` や `useParams` がコンポーネント単体でエラーを起こす | テスト用コンポーネントを `MemoryRouter` でラップしてレンダリングする |

## 6. Done条件
- `npm run test` コマンドで全テストケース（最低限: storageロジック、一覧画面、登録画面、詳細画面）がパスすること。
- 現行の機能・画面レイアウト・挙動に影響（デグレーション）を与えていないこと。

## 7. 実行手順

- [ ] 1. テスト関連パッケージのインストール
- [ ] 2. テスト設定ファイル（Vitest設定、setupファイル）の作成
- [ ] 3. `tsconfig` の更新
- [ ] 4. Storage サービスのテスト作成
- [ ] 5. 一覧画面 (`RecordListPage`) のテスト作成
- [ ] 6. 登録画面 (`RecordFormPage`) のテスト作成
- [ ] 7. 詳細画面 (`RecordDetailPage`) のテスト作成
- [ ] 8. テスト実行と結果確認

## 8. ローカルで必要なコマンド候補
```bash
# パッケージインストール
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event

# テスト実行
npm run test
```

---

# Next Handoff

```markdown
### 役割
Planner -> Coder/Tester

### 目的
VitestとReact Testing Libraryの環境構築およびテストコード実装

### 成果物
- 計画承認が得られ次第、テストパッケージの追加および設定、テストコードの実装に移ります。
```

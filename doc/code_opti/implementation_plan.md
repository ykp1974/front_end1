# コード最適化・リファクタリング計画

本プロジェクトのフロントエンドコードを構造化プログラミングの思想に基づき、保守性と可読性を高めつつ、冗長性を排除する形で最適化する計画です。

## 1. ゴール
既存の機能、デザイン、レイアウトを完全に維持し、テストスイートをパスさせながら、フロントエンドの実装（特に `RecordFormPage.tsx` および `RecordDetailPage.tsx`）から冗長な記述や付け焼き刃的な重複ロジックを整理・最適化する。

## 2. 前提
- **非破壊リファクタリング**: UI構造、クラス名、スタイル、APIエンドポイントとの通信仕様は一切変更しない。
- **堅牢な検証**: 最適化前後に `pnpm run test` を実行し、既存テストがすべてパスすることを担保する。

## 3. タスク分解

1. **`RecordFormPage.tsx` の最適化**:
   - `handleChange` 内の条件分岐を構造化し、`tickerSelector` の場合とその他のフィールド入力処理を整理。
   - CSVパースロジック (`fetchLatestPrice`) の例外処理や文字列置換処理における型安全性の改善。
   - `crypto.randomUUID()` はそのまま維持しつつ、レコード生成部分の可読性向上。
2. **`RecordDetailPage.tsx` の最適化**:
   - `profit` 計算部分 (`currentPrice !== '' ? ...`) の簡素化。
   - 関連レコードのフィルタリング処理をすっきりと記述。
3. **ローカル環境でのテストによる回帰テストの実行**:
   - `pnpm run test` でリファクタリング後も全テストが通ることを確認。

## 4. 影響範囲
- **変更ファイル**:
  - `front_end1/src/pages/RecordFormPage.tsx`
  - `front_end1/src/pages/RecordDetailPage.tsx`

## 5. リスクと対策

| リスク | 対策 |
| :--- | :--- |
| `handleChange` の分岐を変更することで、一部の自動入力（ティッカー情報）が動かなくなる | リファクタリング後、既存の `RecordFormPage.test.tsx` テストに加え、必要に応じて手動でも入力挙動を確認する |

## 6. Done条件
- 全体的なロジックの可読性が向上していること。
- `pnpm run test` コマンドで全テストケースが正常にパスすること。
- 既存の画面レイアウトや機能に影響がないこと。

## 7. 実行手順

- [ ] 1. `RecordFormPage.tsx` のリファクタリングと最適化
- [ ] 2. `RecordDetailPage.tsx` のリファクタリングと最適化
- [ ] 3. `pnpm run test` を実行してデグレーションがないか確認

## 8. ローカルで必要なコマンド候補
```bash
# テスト実行確認
pnpm run test
```

---

# Next Handoff

```markdown
### 役割
Planner -> Coder

### 目的
計画に基づき、`RecordFormPage.tsx` および `RecordDetailPage.tsx` のコード最適化を実施

### 成果物
- 最適化されたtsxファイル群
- テスト実行による正常パス確認
```

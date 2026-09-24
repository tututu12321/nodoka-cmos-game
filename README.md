# 蟹谷のどかと学ぶ CMOSアナログ集積回路

ブラウザだけで動くキャラクター型の回路教材です。

## 起動

`start.htm` を開きます。

GitHub Pagesで公開する場合は、`start.htm` を `index.html` に複製してリポジトリ直下へ置く構成でも動かせます。

## データ管理

`data/dialogues.csv` はセリフです。現在20000件です。若手女性エンジニアの自然な会話調に調整しています。

`data/poses.csv` は立ち絵表示定義です。現在500通りです。画像そのものを500枚複製せず、背景透過の基礎画像と表示パラメータを組み合わせています。

`data/events.csv` は日付イベントです。

`assets/images/base` は基礎立ち絵です。ここを差し替えるだけで複数の表示定義へ反映できます。

## CSVを編集した後

ローカルの `start.htm` を直接開く場合はブラウザの制約があるため、fallbackファイルも更新します。

```bash
python tools/build_fallback.py
```

GitHub PagesではCSVを直接読み込みます。

## JavaScript構成

`config.js` は定数設定です。

`csv.js` はCSV解析です。

`data_loader.js` はCSVとfallbackの読込です。

`state.js` は状態管理です。

`character.js` は立ち絵表示と移動です。

`dialogue.js` はセリフ表示です。

`events.js` は日付イベントです。

`main.js` は画面操作の統合です。

## GitHub Pages

リポジトリへ一式を配置し、Settings の Pages で main branch と root を指定します。

## セリフ方針

回路設計者としての技術内容は維持しつつ、わたし、かな、だよ、してみよっか、などを使う自然な若手女性エンジニアの会話調にしています。過度に幼い口調にはしていません。

# 📊 e-Stat データダウンロードMCPサーバー (DRAFT)

> ⚠️ **このプロジェクトは現在ドラフト版です。本番環境での使用は推奨されません。**

日本政府統計の総合窓口「e-Stat」APIを活用するModel Context Protocol (MCP)サーバーです。Claudeから日本の統計データに簡単にアクセスできます。

## 🚀 主要機能

- 📋 **統計データ検索** - キーワードで統計表を検索
- 📈 **統計データ取得** - 指定した統計表の実データをダウンロード
- 📝 **メタデータ取得** - 統計表の項目定義や分類情報を取得
- 🔍 **リアルタイム検索** - 最新の政府統計データにアクセス

## 📦 インストールと設定

### 1. リポジトリのクローン
```bash
git clone https://github.com/shimizu/data-download-mcp-server-template.git
cd data-download-mcp-server-template
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. e-Stat API設定 🔑
1. 📝 [e-Stat API利用登録](https://www.e-stat.go.jp/api/)でアカウント作成
2. 🆔 アプリケーションIDを取得
3. 🔧 APIキーを設定:

```bash
# APIキー設定ファイルを作成
cp src/config/api-keys.example.js src/config/api-keys.js

# api-keys.jsを編集してアプリケーションIDを設定
# eStat: 'your_application_id_here' を実際のIDに変更
```

**重要**: `src/config/api-keys.js` はGitHubにpushされません（.gitignoreで保護）

### 4. サーバー起動 ⚡
```bash
# MCPサーバーを起動
npm start

# MCP Inspectorで開発・テスト
npm run dev
```

### 5. Claude Codeでの設定 🤖
Claude Codeの設定でMCPサーバーを登録:
```json
{
  "mcpServers": {
    "e-stat": {
      "command": "node",
      "args": ["/path/to/e-stat-mcp-server/src/index.js"]
    }
  }
}
```

## 💬 Claudeでの使用例

### 📊 人口統計データの検索
```
人口に関する統計データを検索してください
```

### 🏢 企業統計の取得
```
「事業所・企業統計調査」のデータを検索して、
最新の調査結果を取得してください
```

### 🌾 農業センサスの分析
```
農業センサスの統計表を検索し、
都道府県別の農家数データを取得して分析してください
```

### 📈 経済統計の時系列分析
```
GDP関連の統計データを検索し、
過去5年間の推移を取得してグラフ化してください
```

## 🛠️ 利用可能なツール

### 🔍 e_stat_search
統計データを検索します

**パラメータ:**
- `searchWord` (string): 検索キーワード
- `statsField` (string, optional): 統計分野コード
- `collectArea` (string, optional): 地域コード
- `limit` (number, optional): 取得件数 (1-100, デフォルト: 10)

**使用例:**
```json
{
  "searchWord": "人口",
  "limit": 20
}
```

### 📈 e_stat_get_data
指定した統計表の実データを取得します

**パラメータ:**
- `dataSetId` (string, required): 統計表ID
- `limit` (number, optional): 取得件数 (1-10000, デフォルト: 1000)
- `startPosition` (number, optional): 取得開始位置
- `metaGetFlg` (string, optional): メタデータ取得フラグ (Y/N)

**使用例:**
```json
{
  "dataSetId": "0003448237",
  "limit": 500
}
```

### 📝 e_stat_get_meta
統計表のメタデータを取得します

**パラメータ:**
- `dataSetId` (string, required): 統計表ID
- `explanationGetFlg` (string, optional): 解説情報取得フラグ (Y/N)

**使用例:**
```json
{
  "dataSetId": "0003448237"
}
```

### 👋 hello
動作確認用のシンプルなツール

### 🔗 test_connection
HTTP接続テスト用ツール

## 📋 レスポンス形式

### 🔍 検索結果
```json
{
  "success": true,
  "data": {
    "total": 150,
    "count": 10,
    "datasets": [
      {
        "@id": "0003448237",
        "TITLE": "令和2年国勢調査 人口等基本集計",
        "GOV_ORG": "総務省",
        "STATISTICS_NAME": "国勢調査",
        "CYCLE": "5年",
        "SURVEY_DATE": "202010"
      }
    ]
  },
  "metadata": {
    "tool": "e_stat_search",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### 📈 統計データ
```json
{
  "success": true,
  "data": {
    "dataSetId": "0003448237",
    "title": "令和2年国勢調査 人口等基本集計",
    "dataCount": "50000",
    "retrievedCount": 1000,
    "data": [
      {
        "@unit": "人",
        "@cat01": "001",
        "@area": "01000",
        "$": "1234567"
      }
    ]
  }
}
```

## 🗂️ プロジェクト構造

```
📁 e-stat-mcp-server/
├── 📄 src/
│   ├── 🎯 index.js              # エントリーポイント
│   ├── 🔌 adapters/             # APIアダプター
│   │   └── 📊 e-stat/
│   │       ├── EStatClient.js   # e-Stat APIクライアント
│   │       └── config.js        # 設定ファイル
│   ├── 🖥️ server/               # MCPサーバー実装
│   │   ├── DataDownloadServer.js
│   │   └── config.js
│   ├── ⚙️ core/                 # 基底クラス
│   │   ├── DataSourceClient.js
│   │   └── ToolBase.js
│   └── 🛠️ tools/                # MCPツール
│       ├── index.js
│       ├── e_stat_search.js
│       ├── e_stat_get_data.js
│       ├── e_stat_get_meta.js
│       ├── hello.js
│       └── test_connection.js
├── 🔒 .env.example              # 環境変数テンプレート
├── 📦 package.json
├── 📖 README.md
└── 📝 CLAUDE.md
```

## 🚨 注意事項

- 🆔 **APIキー必須**: e-Stat APIアプリケーションIDが必要です
- 📊 **データ制限**: 1回のリクエストで最大10,000件まで取得可能
- 🚫 **レート制限**: APIの利用規約に従って適切な間隔でリクエストしてください
- 🔒 **セキュリティ**: `src/config/api-keys.js`は絶対にコミットしないでください（.gitignoreで保護済み）

## 🆘 トラブルシューティング

### APIキーエラー
```
e-Stat API key is not configured
```
→ `src/config/api-keys.js`ファイルを確認してAPIキーが正しく設定されているか確認

### 接続エラー
```
timeout of 30000ms exceeded
```
→ ネットワーク接続とe-Stat APIサービス状況を確認

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

Issues、Pull Requests大歓迎です！

---

Made with ❤️ for Japanese Government Statistics Analysis
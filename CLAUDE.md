# CLAUDE.md

このファイルは、汎用データダウンロードMCPサーバーテンプレートでClaude Code (claude.ai/code)が作業を行う際のガイダンスを提供します。

## プロジェクト概要

様々なデータソース（API、データベース、ファイル等）からデータを取得し、構造化された形式で返すMCP (Model Context Protocol)サーバーのテンプレートです。**Claude Codeに最適化された設計**により、AIエージェントが効率的にMCPサーバーを開発できるよう工夫されています。

### テンプレートの特徴
- **即座に動作**: テンプレートのままでもMCPサーバーとして機能
- **シンプルな構造**: 理解しやすい最小限のアーキテクチャ  
- **拡張可能**: 任意のデータソースに簡単に対応可能
- **実行権限設定済み**: `src/index.js`に実行権限が付与済み

## クイックスタート

### 1. 基本動作確認
```bash
# 依存関係をインストール
npm install

# MCPサーバーを起動（テンプレートのまま動作）
npm start

# MCP Inspectorで開発・テスト
npm run dev
```

### 2. Claude CodeでMCP登録
1. **サーバー登録**: Claude Codeの設定でMCPサーバーを登録
2. **パス設定**: 絶対パス `/path/to/data-download-mcp-server-template/src/index.js` を使用
3. **接続確認**: hello、test_connectionツールが使用可能になることを確認

## 含まれるサンプルツール

テンプレートには以下のシンプルなツールが含まれており、即座に動作確認できます：

- **hello**: Hello Worldレスポンス（MCP動作確認用）
- **test_connection**: HTTP接続テスト（汎用版）

## 主要コンポーネント

### シンプルな構造
- **エントリーポイント**: `src/index.js` - 実行権限付きの起動点
- **メインサーバー**: `src/server/DataDownloadServer.js` - 汎用MCPサーバー実装
- **コア抽象化**: `src/core/` - DataSourceClient、ToolBase基底クラス
- **ツールシステム**: `src/tools/` - プラグイン型ツール実装

### 実際のディレクトリ構造
```
data-download-mcp-server-template/
├── src/
│   ├── index.js                    # エントリーポイント（実行権限付き）
│   ├── server/
│   │   ├── DataDownloadServer.js   # 汎用MCPサーバークラス
│   │   └── config.js              # 設定テンプレート
│   ├── core/
│   │   ├── DataSourceClient.js    # データソースクライアント基底クラス
│   │   └── ToolBase.js            # ツール基底クラス
│   └── tools/
│       ├── index.js               # ツール登録システム
│       ├── hello.js               # サンプルツール
│       └── test_connection.js     # 接続テストツール
├── docs/                          # ドキュメント
├── package.json                   # 最小限の依存関係
└── README.md                      # 使用方法
```

## 開発コマンド

### 基本コマンド
```bash
# MCPサーバーを起動
npm start

# MCP Inspectorでテスト（開発時推奨）
npm run dev
```

## 重要な実装パターン

### 新しいツールの追加
```javascript
// tools/my-tool.js
import { ToolBase } from '../core/ToolBase.js';

class MyTool extends ToolBase {
  constructor() {
    super();
    this.name = 'my_tool';
  }

  getSchema() {
    return {
      name: 'my_tool',
      description: 'カスタムツールの説明',
      inputSchema: {
        type: 'object',
        properties: {
          param: { type: 'string', description: 'パラメータ' }
        }
      }
    };
  }

  async execute(args) {
    // ツールの実装
    const result = `処理結果: ${args.param}`;
    return this.formatResponse(result);
  }
}

// エクスポート
const myTool = new MyTool();
export const myToolSchema = myTool.getSchema();
export const myTool = async (args) => await myTool.execute(args);
```

### データソースクライアント実装
```javascript
// adapters/my-api/MyApiClient.js
import { DataSourceClient } from '../../core/DataSourceClient.js';

export class MyApiClient extends DataSourceClient {
  constructor(config) {
    super(config);
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  async testConnection() {
    try {
      await this.httpRequest({ url: `${this.baseUrl}/health` });
      return { status: 'connected', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }

  async query(params) {
    // API固有のクエリ実装
    return await this.httpRequest({
      url: `${this.baseUrl}/api/data`,
      params: params
    });
  }
}
```

## Claude Code開発ガイドライン

### 段階的開発フロー

#### ステップ1: テンプレート動作確認（5分）
1. `npm install`で依存関係をインストール
2. `npm start`でサーバー起動確認
3. Claude CodeでMCP登録・接続確認
4. helloツール、test_connectionツールの動作確認

#### ステップ2: データソース分析（10分）
1. 対象APIの仕様を調査
2. 認証方式の確認
3. エンドポイントとパラメータの把握

#### ステップ3: アダプター実装（20-30分）
1. `src/adapters/my-api/`ディレクトリを作成
2. `DataSourceClient`を継承してクライアント実装
3. 認証とHTTPリクエスト処理を追加

#### ステップ4: ツール実装（15-20分）
1. `src/tools/my-data-tool.js`を作成
2. `ToolBase`を継承してツール実装
3. `src/tools/index.js`に登録

#### ステップ5: テスト・検証（5-10分）
1. `npm start`で動作確認
2. `npm run dev`でMCP Inspectorテスト
3. エラーハンドリングの確認

### ベストプラクティス

#### 効率的な開発のコツ
1. **小さく始める** - 最初は基本的な機能のみ実装
2. **段階的にテスト** - 各ステップで動作確認
3. **エラーメッセージを確認** - ログから問題を特定
4. **シンプルに保つ** - 複雑な機能は後から追加

#### 一般的な実装パターン
- **REST API**: HTTP認証 + JSON レスポンス処理
- **GraphQL**: クエリ構築 + スキーマベース型定義  
- **データベース**: 接続管理 + SQL/NoSQLクエリ
- **ファイル**: ローカルファイル読み込み + パース処理

## トラブルシューティング

### よくある問題と解決策

#### 1. 実行権限エラー（EACCES）
**問題**: `spawn src/index.js EACCES`エラー
**解決**: `chmod +x src/index.js`で実行権限を付与

#### 2. モジュール読み込みエラー
**問題**: `Cannot find module`エラー
**解決**: `npm install`で依存関係を再インストール

#### 3. MCP接続失敗
**問題**: Claude Codeでサーバーに接続できない
**解決**: 
- 絶対パスを使用
- `npm start`で単体動作を確認
- ポートの競合確認

#### 4. ツールが表示されない
**問題**: 新しいツールがClaude Codeで表示されない
**解決**: 
- `src/tools/index.js`に正しく登録されているか確認
- サーバーを再起動

### デバッグ方法

#### ログ確認
- サーバー起動時のコンソール出力を確認
- エラーメッセージの詳細を読む
- MCP Inspectorでリアルタイムテスト

#### 段階的テスト
1. `npm start`で基本動作確認
2. `npm run dev`でMCP Inspector使用
3. 個別ツールの動作確認
4. エラーケースのテスト

## 依存関係

### 最小限の依存関係
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.6.0",
    "axios": "^1.7.2"
  }
}
```

### 追加可能な依存関係
- **データベース**: `mysql2`, `mongodb`, `sqlite3`
- **認証**: `jsonwebtoken`, `passport`
- **ユーティリティ**: `lodash`, `moment`, `uuid`
- **バリデーション**: `joi`, `yup`, `ajv`

---

このテンプレートを使用することで、Claude Codeは効率的にMCPサーバーを開発でき、開発者は最小限の手間で高品質なサーバーを構築できます。
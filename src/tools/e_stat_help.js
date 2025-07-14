import { ToolBase } from '../core/ToolBase.js';

class EStatHelpTool extends ToolBase {
  constructor() {
    super();
    this.name = 'e_stat_help';
  }

  getSchema() {
    return {
      name: 'e_stat_help',
      description: 'e-Stat MCPサーバーの使い方とツールの詳細説明を表示します',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'ヘルプトピック',
            enum: [
              'overview',      // 概要
              'workflow',      // 基本ワークフロー  
              'search',        // 検索機能
              'data',          // データ取得
              'meta',          // メタデータ
              'download',      // ダウンロード
              'debug',         // デバッグ
              'examples',      // 使用例
              'parameters',    // パラメータ詳細
              'troubleshooting' // トラブルシューティング
            ],
            default: 'overview'
          },
          format: {
            type: 'string',
            description: '出力形式',
            enum: ['text', 'markdown'],
            default: 'text'
          }
        }
      }
    };
  }

  async execute(args) {
    try {
      const topic = args.topic || 'overview';
      const format = args.format || 'text';
      
      const helpContent = this.getHelpContent(topic);
      
      return this.formatResponse({
        topic,
        content: helpContent,
        format,
        timestamp: new Date().toISOString()
      }, {
        tool: this.name,
        version: '1.0.0'
      });
    } catch (error) {
      return this.formatResponse({
        error: error.message,
        success: false
      });
    }
  }

  getHelpContent(topic) {
    const helpTopics = {
      overview: this.getOverview(),
      workflow: this.getWorkflow(),
      search: this.getSearchHelp(),
      data: this.getDataHelp(),
      meta: this.getMetaHelp(),
      download: this.getDownloadHelp(),
      debug: this.getDebugHelp(),
      examples: this.getExamples(),
      parameters: this.getParameters(),
      troubleshooting: this.getTroubleshooting()
    };

    return helpTopics[topic] || helpTopics.overview;
  }

  getOverview() {
    return `
📊 e-Stat MCPサーバー ヘルプ

このMCPサーバーは日本政府統計の総合窓口「e-Stat」APIを活用して、
Claudeから直接統計データにアクセスできるツールセットです。

🛠️ 利用可能なツール:
• e_stat_search     - 統計データ検索
• e_stat_get_data   - 統計データ取得
• e_stat_get_meta   - メタデータ取得
• e_stat_download   - データダウンロード
• e_stat_debug      - 接続・動作確認
• e_stat_help       - このヘルプ

💡 基本的な使い方:
1. e_stat_search で統計表を検索
2. e_stat_get_meta でデータ構造を確認
3. e_stat_get_data で実データを取得

詳細は各トピックをご確認ください:
- workflow: 基本ワークフロー
- examples: 実用的な使用例
- troubleshooting: トラブルシューティング
    `;
  }

  getWorkflow() {
    return `
🔄 e-Stat API 基本ワークフロー

【ステップ1: 統計表の検索】
e_stat_search を使用して目的の統計表を見つけます。

例: 人口統計を検索
{
  "searchWord": "人口",
  "statsCode": "00200521",  // 国勢調査
  "limit": 10
}

【ステップ2: メタデータの確認】
e_stat_get_meta で統計表の構造を理解します。

例: 統計表の詳細情報を取得
{
  "dataSetId": "0003448237"
}

【ステップ3: データの取得】
e_stat_get_data で実際の数値データを取得します。

例: 東京都の人口データを取得
{
  "dataSetId": "0003448237",
  "cdArea": "13000",        // 東京都
  "cdTime": "2020000000",   // 2020年
  "limit": 500
}

💡 効率的なデータ取得のコツ:
• 最初は小さなlimit値でテスト
• 地域や時間軸で絞り込んでからデータ取得
• 大量データは自動的にファイル保存される
    `;
  }

  getSearchHelp() {
    return `
🔍 e_stat_search - 統計データ検索

【基本的な使い方】
統計表を検索してデータセットIDを特定します。

【主要パラメータ】
• searchWord: 検索キーワード (例: "人口", "労働力")
• statsCode: 政府統計コード (例: "00200521"=国勢調査)
• statsField: 統計分野 (例: "02"=人口・世帯)
• collectArea: 地域区分 ("1"=全国, "2"=都道府県, "3"=市区町村)
• surveyYears: 調査年月 (例: "2020", "202001-202012")
• limit: 取得件数 (デフォルト10, 最大100000)

【検索のコツ】
1. キーワード検索から始める
2. 統計コードで絞り込む
3. 調査年月で期間を限定
4. 地域区分で対象を明確化

【出力】
• 20件以下: MCPレスポンスで表示
• 20件超: 自動的にファイル保存

【使用例】
国勢調査の人口関連データを検索:
{
  "searchWord": "人口",
  "statsCode": "00200521",
  "surveyYears": "2020",
  "limit": 20
}
    `;
  }

  getDataHelp() {
    return `
📈 e_stat_get_data - 統計データ取得

【基本的な使い方】
指定した統計表IDから実際の数値データを取得します。

【必須パラメータ】
• dataSetId: 統計表ID (検索で取得したID)

【絞り込みパラメータ】
🌍 地域事項:
• lvArea, cdArea, cdAreaFrom, cdAreaTo
  例: "cdArea": "13000" (東京都)

⏰ 時間軸事項:
• lvTime, cdTime, cdTimeFrom, cdTimeTo
  例: "cdTime": "2020000000" (2020年)

📊 表章事項:
• lvTab, cdTab, cdTabFrom, cdTabTo
  例: "cdTab": "001" (人口数)

👥 分類事項:
• lvCat01, cdCat01, lvCat02, cdCat02
  例: "cdCat01": "001" (男性)

【制御パラメータ】
• limit: 取得件数 (デフォルト1000, 最大10000)
• startPosition: 開始位置
• metaGetFlg: メタデータ取得 ("Y"/"N")
• replaceSpChar: 特殊文字置換 ("0"-"3")

【出力】
• 100件以下: MCPレスポンスで表示
• 100件超: 自動的にファイル保存

【実用例】
東京都の2020年男性人口:
{
  "dataSetId": "0003448237",
  "cdArea": "13000",
  "cdTime": "2020000000", 
  "cdCat01": "001",
  "limit": 100
}
    `;
  }

  getMetaHelp() {
    return `
📝 e_stat_get_meta - メタデータ取得

【基本的な使い方】
統計表の構造・項目定義・分類情報を取得します。
データ取得前に必ず確認することを推奨します。

【パラメータ】
• dataSetId: 統計表ID (必須)
• explanationGetFlg: 解説情報取得 ("Y"/"N")

【取得できる情報】
📋 基本情報:
• 統計表タイトル
• 調査実施機関
• 調査周期
• 調査年月

🏗️ データ構造:
• tab (表章事項): 測定項目 (人口数、世帯数等)
• area (地域事項): 地域コード (都道府県、市区町村)
• time (時間軸事項): 調査時点
• cat01-15 (分類事項): その他分類 (性別、年齢等)

【活用方法】
1. データ取得前の構造確認
2. 絞り込み条件の特定
3. 分類コードの確認
4. データの解釈・理解

【使用例】
{
  "dataSetId": "0003448237",
  "explanationGetFlg": "Y"
}

💡 ヒント:
メタデータを確認してから適切な絞り込み条件を
e_stat_get_dataで指定してください。
    `;
  }

  getDownloadHelp() {
    return `
💾 e_stat_download - データダウンロード

【基本的な使い方】
統計データを取得してファイルに保存します。
大量データの一括処理に適しています。

【操作モード】
• search_and_download: 検索してダウンロード
• download_data: データセットIDから直接ダウンロード
• download_with_meta: データ+メタデータをダウンロード

【パラメータ】
• operation: 操作モード
• outputPath: 保存先パス (必須)
• format: ファイル形式 ("json"/"csv")
• searchWord: 検索キーワード (search_and_download時)
• dataSetId: 統計表ID (download系操作時)
• limit: 取得件数
• includeMetadata: メタデータ含有フラグ

【使用例】

1) 検索してダウンロード:
{
  "operation": "search_and_download",
  "searchWord": "人口推計",
  "outputPath": "./downloads/population_search.json",
  "limit": 50
}

2) データを直接ダウンロード:
{
  "operation": "download_data", 
  "dataSetId": "0003448237",
  "outputPath": "./downloads/population_data.csv",
  "format": "csv",
  "limit": 5000
}

3) メタデータ付きダウンロード:
{
  "operation": "download_with_meta",
  "dataSetId": "0003448237", 
  "outputPath": "./downloads/full_data.json"
}

💡 推奨用途:
• 大量データの取得
• 定期的なデータ収集
• CSVでの外部ツール連携
    `;
  }

  getDebugHelp() {
    return `
🔧 e_stat_debug - 接続・動作確認

【基本的な使い方】
e-Stat APIの接続状況やレスポンス形式を確認します。
問題が発生した際の診断に使用してください。

【テストタイプ】
• connection: 基本接続テスト
• minimal_search: 最小限の検索テスト
• api_info: API設定情報表示

【パラメータ】
• testType: テストの種類
• searchWord: 検索テスト用キーワード

【使用例】

1) 基本接続確認:
{
  "testType": "connection"
}

2) 検索動作確認:
{
  "testType": "minimal_search",
  "searchWord": "人口"
}

3) API設定確認:
{
  "testType": "api_info"
}

【確認項目】
✅ APIキー設定状況
✅ ネットワーク接続
✅ レスポンス形式
✅ エラーメッセージ詳細

💡 トラブル時の使用手順:
1. connection で基本接続確認
2. minimal_search で最小検索テスト
3. api_info で設定情報確認
4. エラーメッセージを確認して対処
    `;
  }

  getExamples() {
    return `
💡 実用的な使用例

【例1: 人口統計の分析】
# ステップ1: 人口関連統計を検索
e_stat_search {
  "searchWord": "人口推計",
  "statsCode": "00200524",
  "limit": 10
}

# ステップ2: データ構造を確認
e_stat_get_meta {
  "dataSetId": "取得したID"
}

# ステップ3: 都道府県別データを取得
e_stat_get_data {
  "dataSetId": "取得したID",
  "lvArea": "2",         // 都道府県レベル
  "cdTime": "2020000000", // 2020年
  "limit": 100
}

【例2: 経済統計の時系列分析】
# GDP関連データの検索
e_stat_search {
  "searchWord": "国内総生産",
  "surveyYears": "2015-2025",
  "limit": 20
}

# 時系列データの取得
e_stat_get_data {
  "dataSetId": "取得したID",
  "lvTime": "1-3",       // 時系列の詳細レベル
  "cdArea": "00000",     // 全国
  "limit": 200
}

【例3: 地域別労働統計】
# 労働力調査の検索
e_stat_search {
  "searchWord": "労働力調査",
  "collectArea": "2",    // 都道府県
  "limit": 15
}

# 関東地方のデータ取得
e_stat_get_data {
  "dataSetId": "取得したID",
  "cdAreaFrom": "08000", // 茨城県から
  "cdAreaTo": "14000",   // 神奈川県まで
  "cdCat01": "001",      // 男性
  "limit": 500
}

【例4: 大量データの一括ダウンロード】
e_stat_download {
  "operation": "download_with_meta",
  "dataSetId": "0003448237",
  "outputPath": "./downloads/census_full_data.json",
  "limit": 10000,
  "includeMetadata": true
}

💡 効率的な分析手順:
1. 広い検索から始めて対象を絞り込み
2. メタデータで構造を理解
3. 小さなサンプルでテスト
4. 本格的なデータ取得・分析
    `;
  }

  getParameters() {
    return `
⚙️ パラメータ詳細ガイド

【地域事項パラメータ】
• lvArea: 階層レベル
  - "1": 都道府県レベル
  - "2": 市区町村レベル  
  - "1-2": レベル1から2まで
• cdArea: 地域コード
  - "13000": 東京都
  - "13101": 千代田区
  - "00000": 全国
• cdAreaFrom/To: 地域コード範囲

【時間軸事項パラメータ】
• lvTime: 時間階層レベル
• cdTime: 時間コード
  - "2020000000": 2020年
  - "202001000000": 2020年1月
• cdTimeFrom/To: 時間コード範囲

【表章事項パラメータ】
• lvTab: 表章階層レベル
• cdTab: 表章コード
  - "001": 人口数
  - "002": 世帯数
• cdTabFrom/To: 表章コード範囲

【分類事項パラメータ】
• lvCat01: 分類1階層レベル
• cdCat01: 分類1コード
  - "001": 男性
  - "002": 女性
  - "003": 不詳
• cdCat01From/To: 分類1コード範囲

【政府統計コード】
• 00200521: 国勢調査
• 00200524: 人口推計
• 00200531: 労働力調査
• 00200533: 家計調査
• 00200544: 消費者物価指数

【統計分野コード】
• 02: 人口・世帯
• 03: 労働・賃金
• 04: 家計・物価
• 05: 住宅・土地・建設
• 07: 企業・家計・経済
• 08: 運輸・観光
• 09: 情報通信・科学技術
• 10: 教育・文化・スポーツ・生活
• 11: 行財政
• 12: 司法・安全・環境

【日付形式】
• yyyy: 年単位 (例: "2020")
• yyyymm: 月単位 (例: "202001")
• yyyymmdd: 日単位 (例: "20200101")
• 範囲指定: "20200101-20201231"
    `;
  }

  getTroubleshooting() {
    return `
🚨 トラブルシューティング

【よくある問題と解決策】

🔴 問題1: 「統計表ID（statsDataId）を指定して下さい」
解決策: 正しい統計表IDを使用してください
• e_stat_search で有効なIDを取得
• IDは"0003448237"のような形式

🔴 問題2: 「timeout of 30000ms exceeded」
解決策: 
• limit値を小さくして再試行
• インターネット接続を確認
• e_stat_debug で接続テスト

🔴 問題3: 「該当するデータが存在しません」
解決策:
• 絞り込み条件を緩和
• e_stat_get_meta でデータ構造確認
• 検索キーワードを変更

🔴 問題4: トークン制限エラー
解決策: 自動解決済み
• 大量データは自動的にファイル保存
• outputPathパラメータを指定

🔴 問題5: APIキーエラー
解決策:
• src/config/api-keys.js の設定確認
• e-Stat APIアプリケーションID取得
• e_stat_debug で設定確認

【デバッグ手順】
1. e_stat_debug で基本接続確認
2. 簡単な検索でテスト
3. メタデータで構造確認
4. 小さなlimit値から開始
5. 段階的に条件を追加

【パフォーマンス改善】
• 適切な絞り込み条件を使用
• 不要なメタデータ取得を避ける
• ページネーション活用
• ファイル保存で大量データ処理

【サポート情報】
• e-Stat API仕様: https://www.e-stat.go.jp/api/
• 政府統計コード一覧: 検索画面で確認
• MCP仕様: claude.ai/code

💡 不明な点があれば:
1. e_stat_help で該当トピック確認
2. e_stat_debug で動作確認
3. 小さなサンプルでテスト実行
    `;
  }
}

const eStatHelpTool = new EStatHelpTool();
export const eStatHelpToolSchema = eStatHelpTool.getSchema();
export const eStatHelp = async (args) => await eStatHelpTool.execute(args);
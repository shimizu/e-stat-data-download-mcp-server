import { ToolBase } from '../core/ToolBase.js';
import { EStatClient } from '../adapters/e-stat/EStatClient.js';
import { EStatFileHandler } from '../utils/file-handler.js';

class EStatSearchTool extends ToolBase {
  constructor() {
    super();
    this.name = 'e_stat_search';
    this.client = new EStatClient();
  }

  getSchema() {
    return {
      name: 'e_stat_search',
      description: 'e-Stat APIを使用して統計データを検索します（20件超は自動的にファイル保存）',
      inputSchema: {
        type: 'object',
        properties: {
          searchWord: {
            type: 'string',
            description: '検索キーワード（統計表名や内容の一部）'
          },
          outputPath: {
            type: 'string',
            description: '保存先ファイルパス（オプション）例: ./downloads/search_results.json'
          },
          format: {
            type: 'string',
            enum: ['json', 'csv'],
            default: 'json',
            description: 'ファイル出力形式（outputPath指定時のみ有効）'
          },
          statsField: {
            type: 'string',
            description: '統計分野コード（2桁: 大分類, 4桁: 小分類）'
          },
          statsCode: {
            type: 'string',
            description: '政府統計コード（5桁: 作成機関, 8桁: 政府統計コード）'
          },
          collectArea: {
            type: 'string',
            description: '集計地域区分（1: 全国, 2: 都道府県, 3: 市区町村）',
            enum: ['1', '2', '3']
          },
          surveyYears: {
            type: 'string',
            description: '調査年月（yyyy: 単年, yyyymm: 単月, yyyymm-yyyymm: 範囲）'
          },
          openYears: {
            type: 'string',
            description: '公開年月（yyyy: 単年, yyyymm: 単月, yyyymm-yyyymm: 範囲）'
          },
          searchKind: {
            type: 'string',
            description: '検索データ種別（1: 統計情報, 2: 小地域・地域メッシュ）',
            enum: ['1', '2'],
            default: '1'
          },
          explanationGetFlg: {
            type: 'string',
            description: '解説情報有無（Y: 取得する, N: 取得しない）',
            enum: ['Y', 'N'],
            default: 'Y'
          },
          statsNameList: {
            type: 'string',
            description: '統計調査名指定（Y: 統計調査名一覧）',
            enum: ['Y']
          },
          startPosition: {
            type: 'number',
            description: 'データ取得開始位置（1から始まる行番号）',
            minimum: 1
          },
          updatedDate: {
            type: 'string',
            description: '更新日付（yyyy: 単年, yyyymm: 単月, yyyymmdd: 単日, yyyymmdd-yyyymmdd: 範囲）'
          },
          limit: {
            type: 'number',
            description: '取得件数（デフォルト: 10, 最大: 100000）',
            minimum: 1,
            maximum: 100000
          }
        }
      }
    };
  }

  async execute(args) {
    try {
      const params = {
        searchWord: args.searchWord,
        statsField: args.statsField,
        statsCode: args.statsCode,
        collectArea: args.collectArea,
        surveyYears: args.surveyYears,
        openYears: args.openYears,
        searchKind: args.searchKind || '1',
        explanationGetFlg: args.explanationGetFlg || 'Y',
        statsNameList: args.statsNameList,
        startPosition: args.startPosition,
        updatedDate: args.updatedDate,
        limit: Math.min(args.limit || 10, 100000)
      };

      // 空のパラメータを除去
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key];
        }
      });

      const response = await this.client.getStatsList(params);
      
      // デバッグ: レスポンス構造を確認
      process.stderr.write(`[DEBUG] Full response type: ${typeof response}\n`);
      process.stderr.write(`[DEBUG] Response keys: ${response ? Object.keys(response).join(', ') : 'null'}\n`);
      
      // レスポンスの処理
      if (response && response.GET_STATS_LIST && response.GET_STATS_LIST.RESULT) {
        const result = response.GET_STATS_LIST.RESULT;
        
        if (result.STATUS !== 0) {
          throw new Error(`e-Stat API Error: ${result.ERROR_MSG || 'Unknown error'}`);
        }

        const dataSets = response.GET_STATS_LIST.DATALIST_INF?.TABLE_INF || [];
        
        const data = {
          total: result.TOTAL_NUMBER,
          count: dataSets.length,
          datasets: Array.isArray(dataSets) ? dataSets : [dataSets]
        };

        const metadata = {
          searchParams: params,
          apiStatus: result.STATUS
        };

        // 大量検索結果の場合は自動的にファイル保存
        const resultCount = data.count;
        const shouldSaveToFile = args.outputPath || resultCount > 20;
        
        if (shouldSaveToFile) {
          const outputPath = args.outputPath || `./downloads/e_stat_search_${Date.now()}.json`;
          return await EStatFileHandler.handleDataWithOptionalFile({
            data,
            outputPath,
            format: args.format || 'json',
            dataType: '検索結果',
            metadata,
            toolName: this.name
          });
        }

        // 小さな検索結果のみMCP応答として返す
        return this.formatResponse({
          ...data,
          notice: `検索結果: ${resultCount}件 (20件以下のためMCPレスポンスとして返却)`
        }, metadata);
      } else {
        // レスポンス構造が予期しない場合の詳細情報
        const errorInfo = {
          responseExists: !!response,
          responseType: typeof response,
          responseKeys: response ? Object.keys(response) : [],
          hasGetStatsList: !!(response && response.GET_STATS_LIST),
          responsePreview: response ? JSON.stringify(response).substring(0, 1000) : null
        };
        
        process.stderr.write(`[ERROR] Unexpected response structure: ${JSON.stringify(errorInfo)}\n`);
        throw new Error(`Unexpected response format from e-Stat API. Response type: ${typeof response}, Keys: ${response ? Object.keys(response).join(', ') : 'null'}`);
      }
    } catch (error) {
      return this.formatResponse({
        error: error.message,
        success: false,
        errorType: error.constructor.name,
        httpStatus: error.response?.status,
        httpData: error.response?.data
      }, {
        searchParams: args
      });
    }
  }
}

const eStatSearchTool = new EStatSearchTool();
export const eStatSearchToolSchema = eStatSearchTool.getSchema();
export const eStatSearch = async (args) => await eStatSearchTool.execute(args);
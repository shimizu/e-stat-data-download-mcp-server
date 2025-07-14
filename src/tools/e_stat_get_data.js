import { ToolBase } from '../core/ToolBase.js';
import { EStatClient } from '../adapters/e-stat/EStatClient.js';
import { EStatFileHandler } from '../utils/file-handler.js';

class EStatGetDataTool extends ToolBase {
  constructor() {
    super();
    this.name = 'e_stat_get_data';
    this.client = new EStatClient();
  }

  getSchema() {
    return {
      name: 'e_stat_get_data',
      description: 'e-Stat APIを使用して指定した統計表の実データを取得します（100件超は自動的にファイル保存）',
      inputSchema: {
        type: 'object',
        properties: {
          dataSetId: {
            type: 'string',
            description: '統計表ID（必須）'
          },
          outputPath: {
            type: 'string',
            description: '保存先ファイルパス（オプション）例: ./downloads/data.json'
          },
          format: {
            type: 'string',
            enum: ['json', 'csv'],
            default: 'json',
            description: 'ファイル出力形式（outputPath指定時のみ有効）'
          },
          limit: {
            type: 'number',
            description: '取得件数（デフォルト: 1000, 最大: 10000）',
            minimum: 1,
            maximum: 10000
          },
          startPosition: {
            type: 'number',
            description: '取得開始位置（デフォルト: 1）',
            minimum: 1
          },
          metaGetFlg: {
            type: 'string',
            description: 'メタデータ取得フラグ（Y/N、デフォルト: Y）',
            enum: ['Y', 'N']
          },
          cntGetFlg: {
            type: 'string', 
            description: 'データ件数取得フラグ（Y/N、デフォルト: Y）',
            enum: ['Y', 'N']
          },
          sectionHeaderFlg: {
            type: 'string',
            description: 'セクションヘッダフラグ（1/2、デフォルト: 1）',
            enum: ['1', '2']
          },
          // 地域事項絞り込みパラメータ
          lvArea: {
            type: 'string',
            description: '地域事項 階層レベル（例: "1", "1-2", "-2", "2-"）'
          },
          cdArea: {
            type: 'string',
            description: '地域事項 単一コード（カンマ区切りで100個まで指定可能）'
          },
          cdAreaFrom: {
            type: 'string',
            description: '地域事項 コードFrom（範囲の開始位置）'
          },
          cdAreaTo: {
            type: 'string',
            description: '地域事項 コードTo（範囲の終了位置）'
          },
          // 時間軸事項絞り込みパラメータ
          lvTime: {
            type: 'string',
            description: '時間軸事項 階層レベル（例: "1", "1-2", "-2", "2-"）'
          },
          cdTime: {
            type: 'string',
            description: '時間軸事項 単一コード（カンマ区切りで100個まで指定可能）'
          },
          cdTimeFrom: {
            type: 'string',
            description: '時間軸事項 コードFrom（範囲の開始位置）'
          },
          cdTimeTo: {
            type: 'string',
            description: '時間軸事項 コードTo（範囲の終了位置）'
          },
          // 表章事項絞り込みパラメータ
          lvTab: {
            type: 'string',
            description: '表章事項 階層レベル（例: "1", "1-2", "-2", "2-"）'
          },
          cdTab: {
            type: 'string',
            description: '表章事項 単一コード（カンマ区切りで100個まで指定可能）'
          },
          cdTabFrom: {
            type: 'string',
            description: '表章事項 コードFrom（範囲の開始位置）'
          },
          cdTabTo: {
            type: 'string',
            description: '表章事項 コードTo（範囲の終了位置）'
          },
          // 分類事項絞り込みパラメータ (一部のみ、必要に応じて拡張)
          lvCat01: {
            type: 'string',
            description: '分類事項01 階層レベル'
          },
          cdCat01: {
            type: 'string',
            description: '分類事項01 単一コード'
          },
          cdCat01From: {
            type: 'string',
            description: '分類事項01 コードFrom'
          },
          cdCat01To: {
            type: 'string',
            description: '分類事項01 コードTo'
          },
          lvCat02: {
            type: 'string',
            description: '分類事項02 階層レベル'
          },
          cdCat02: {
            type: 'string',
            description: '分類事項02 単一コード'
          },
          // 追加パラメータ
          annotationGetFlg: {
            type: 'string',
            description: '注釈情報有無（Y/N、デフォルト: Y）',
            enum: ['Y', 'N']
          },
          replaceSpChar: {
            type: 'string',
            description: '特殊文字の置換（0: 置換しない, 1: 0に置換, 2: NULLに置換, 3: NAに置換）',
            enum: ['0', '1', '2', '3']
          }
        },
        required: ['dataSetId']
      }
    };
  }

  async execute(args) {
    try {
      const params = {
        dataSetId: args.dataSetId,
        limit: Math.min(args.limit || 1000, 10000),
        startPosition: args.startPosition || 1,
        metaGetFlg: args.metaGetFlg || 'Y',
        cntGetFlg: args.cntGetFlg || 'Y',
        sectionHeaderFlg: args.sectionHeaderFlg || '1'
      };

      const response = await this.client.getStatsData(params);
      
      // レスポンスの処理
      if (response && response.GET_STATS_DATA && response.GET_STATS_DATA.RESULT) {
        const result = response.GET_STATS_DATA.RESULT;
        
        if (result.STATUS !== 0) {
          throw new Error(`e-Stat API Error: ${result.ERROR_MSG || 'Unknown error'}`);
        }

        const statisticalData = response.GET_STATS_DATA.STATISTICAL_DATA;
        const dataInf = statisticalData?.DATA_INF;
        const classInf = statisticalData?.CLASS_INF?.CLASS_OBJ;
        const dataList = statisticalData?.DATA_INF?.VALUE || [];

        const data = {
          dataSetId: args.dataSetId,
          title: dataInf?.TITLE || 'No title',
          lastUpdate: dataInf?.LAST_UPDATE_DATE,
          dataCount: result.TOTAL_NUMBER,
          retrievedCount: Array.isArray(dataList) ? dataList.length : (dataList ? 1 : 0),
          classInfo: classInf,
          data: Array.isArray(dataList) ? dataList : (dataList ? [dataList] : [])
        };

        const metadata = {
          requestParams: params,
          apiStatus: result.STATUS,
          hasMoreData: parseInt(result.TOTAL_NUMBER) > (params.startPosition + params.limit - 1)
        };

        // 大量データの場合は自動的にファイル保存
        const dataCount = data.retrievedCount;
        const shouldSaveToFile = args.outputPath || dataCount > 100;
        
        if (shouldSaveToFile) {
          const outputPath = args.outputPath || `./downloads/e_stat_data_${args.dataSetId}_${Date.now()}.json`;
          return await EStatFileHandler.handleDataWithOptionalFile({
            data,
            outputPath,
            format: args.format || 'json',
            dataType: '統計データ',
            metadata,
            toolName: this.name
          });
        }

        // 小さなデータのみMCP応答として返す
        return this.formatResponse({
          ...data,
          notice: `データ件数: ${dataCount}件 (100件以下のためMCPレスポンスとして返却)`
        }, metadata);
      } else {
        throw new Error('Unexpected response format from e-Stat API');
      }
    } catch (error) {
      return this.formatResponse({
        error: error.message,
        success: false
      }, {
        requestParams: args
      });
    }
  }
}

const eStatGetDataTool = new EStatGetDataTool();
export const eStatGetDataToolSchema = eStatGetDataTool.getSchema();
export const eStatGetData = async (args) => await eStatGetDataTool.execute(args);
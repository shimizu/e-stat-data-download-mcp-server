import { ToolBase } from '../core/ToolBase.js';
import { EStatClient } from '../adapters/e-stat/EStatClient.js';
import { EStatFileHandler } from '../utils/file-handler.js';

class EStatDownloadTool extends ToolBase {
  constructor() {
    super();
    this.name = 'e_stat_download';
    this.client = new EStatClient();
  }

  getSchema() {
    return {
      name: 'e_stat_download',
      description: 'e-Stat APIから統計データを取得してファイルに保存します',
      inputSchema: {
        type: 'object',
        properties: {
          operation: {
            type: 'string',
            description: '実行する操作',
            enum: ['search_and_download', 'download_data', 'download_with_meta'],
            default: 'download_data'
          },
          searchWord: {
            type: 'string',
            description: '検索キーワード（search_and_download時に使用）'
          },
          dataSetId: {
            type: 'string', 
            description: '統計表ID（download_data, download_with_meta時に必須）'
          },
          outputPath: {
            type: 'string',
            description: '保存先ファイルパス（例: ./downloads/population_data.json）'
          },
          format: {
            type: 'string',
            enum: ['json', 'csv'],
            default: 'json',
            description: '出力形式'
          },
          limit: {
            type: 'number',
            description: '取得件数（1-10000、デフォルト: 1000）',
            minimum: 1,
            maximum: 10000
          },
          includeMetadata: {
            type: 'boolean',
            description: 'メタデータも含めて保存するか',
            default: false
          }
        },
        required: ['outputPath']
      }
    };
  }

  async execute(args) {
    try {
      const { 
        operation = 'download_data',
        searchWord,
        dataSetId,
        outputPath,
        format = 'json',
        limit = 1000,
        includeMetadata = false
      } = args;

      if (!EStatFileHandler.validateFilePath(outputPath)) {
        throw new Error('Invalid file path. Only .json, .csv, .txt files are allowed.');
      }

      let data, metadata = {};

      switch (operation) {
        case 'search_and_download':
          if (!searchWord) {
            throw new Error('searchWord is required for search_and_download operation');
          }
          data = await this.searchAndDownload(searchWord, limit);
          metadata = { operation, searchWord, searchLimit: limit };
          break;

        case 'download_data':
          if (!dataSetId) {
            throw new Error('dataSetId is required for download_data operation');
          }
          data = await this.downloadData(dataSetId, limit, includeMetadata);
          metadata = { operation, dataSetId, dataLimit: limit, includeMetadata };
          break;

        case 'download_with_meta':
          if (!dataSetId) {
            throw new Error('dataSetId is required for download_with_meta operation');
          }
          data = await this.downloadWithMetadata(dataSetId, limit);
          metadata = { operation, dataSetId, dataLimit: limit };
          break;

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return await EStatFileHandler.handleDataWithOptionalFile({
        data,
        outputPath,
        format,
        dataType: '統計',
        metadata,
        toolName: this.name
      });

    } catch (error) {
      return this.formatResponse({
        error: error.message,
        success: false
      }, {
        requestParams: args
      });
    }
  }

  async searchAndDownload(searchWord, limit) {
    // まず検索を実行
    const searchResponse = await this.client.getStatsList({
      searchWord,
      limit: Math.min(limit, 100) // 検索は最大100件
    });

    if (!searchResponse?.GET_STATS_LIST?.RESULT) {
      throw new Error('Invalid search response from e-Stat API');
    }

    const result = searchResponse.GET_STATS_LIST.RESULT;
    if (result.STATUS !== 0) {
      throw new Error(`e-Stat API Error: ${result.ERROR_MSG || 'Unknown error'}`);
    }

    const dataSets = searchResponse.GET_STATS_LIST.DATALIST_INF?.TABLE_INF || [];
    const searchResults = Array.isArray(dataSets) ? dataSets : [dataSets];

    return {
      searchResults,
      total: result.TOTAL_NUMBER,
      count: searchResults.length,
      searchWord
    };
  }

  async downloadData(dataSetId, limit, includeMetadata) {
    const dataResponse = await this.client.getStatsData({
      dataSetId,
      limit: Math.min(limit, 10000)
    });

    if (!dataResponse?.GET_STATS_DATA?.RESULT) {
      throw new Error('Invalid data response from e-Stat API');
    }

    const result = dataResponse.GET_STATS_DATA.RESULT;
    if (result.STATUS !== 0) {
      throw new Error(`e-Stat API Error: ${result.ERROR_MSG || 'Unknown error'}`);
    }

    const statisticalData = dataResponse.GET_STATS_DATA.STATISTICAL_DATA;
    const dataInf = statisticalData?.DATA_INF;
    const dataList = statisticalData?.DATA_INF?.VALUE || [];

    let responseData = {
      dataSetId,
      title: dataInf?.TITLE || 'No title',
      lastUpdate: dataInf?.LAST_UPDATE_DATE,
      dataCount: result.TOTAL_NUMBER,
      retrievedCount: Array.isArray(dataList) ? dataList.length : (dataList ? 1 : 0),
      data: Array.isArray(dataList) ? dataList : (dataList ? [dataList] : [])
    };

    // メタデータも含める場合
    if (includeMetadata) {
      const classInf = statisticalData?.CLASS_INF?.CLASS_OBJ;
      responseData.classInfo = classInf;
    }

    return responseData;
  }

  async downloadWithMetadata(dataSetId, limit) {
    // データとメタデータを並行取得
    const [dataResponse, metaResponse] = await Promise.all([
      this.client.getStatsData({ dataSetId, limit: Math.min(limit, 10000) }),
      this.client.getMetaInfo({ dataSetId })
    ]);

    // データ処理
    if (!dataResponse?.GET_STATS_DATA?.RESULT) {
      throw new Error('Invalid data response from e-Stat API');
    }

    const dataResult = dataResponse.GET_STATS_DATA.RESULT;
    if (dataResult.STATUS !== 0) {
      throw new Error(`e-Stat Data API Error: ${dataResult.ERROR_MSG || 'Unknown error'}`);
    }

    // メタデータ処理
    if (!metaResponse?.GET_META_INFO?.RESULT) {
      throw new Error('Invalid metadata response from e-Stat API');
    }

    const metaResult = metaResponse.GET_META_INFO.RESULT;
    if (metaResult.STATUS !== 0) {
      throw new Error(`e-Stat Meta API Error: ${metaResult.ERROR_MSG || 'Unknown error'}`);
    }

    const statisticalData = dataResponse.GET_STATS_DATA.STATISTICAL_DATA;
    const dataInf = statisticalData?.DATA_INF;
    const dataList = statisticalData?.DATA_INF?.VALUE || [];

    const metaInfo = metaResponse.GET_META_INFO.METADATA_INF;
    const tableInf = metaInfo?.TABLE_INF;
    const classInf = metaInfo?.CLASS_INF?.CLASS_OBJ;

    return {
      dataSetId,
      title: dataInf?.TITLE || 'No title',
      lastUpdate: dataInf?.LAST_UPDATE_DATE,
      dataCount: dataResult.TOTAL_NUMBER,
      retrievedCount: Array.isArray(dataList) ? dataList.length : (dataList ? 1 : 0),
      data: Array.isArray(dataList) ? dataList : (dataList ? [dataList] : []),
      metadata: {
        tableInfo: {
          id: tableInf?.['@id'],
          title: tableInf?.TITLE,
          cycle: tableInf?.CYCLE,
          surveyDate: tableInf?.SURVEY_DATE,
          openDate: tableInf?.OPEN_DATE
        },
        classInfo: Array.isArray(classInf) ? classInf : (classInf ? [classInf] : []),
        explanation: metaInfo?.EXPLANATION
      }
    };
  }
}

const eStatDownloadTool = new EStatDownloadTool();
export const eStatDownloadToolSchema = eStatDownloadTool.getSchema();
export const eStatDownload = async (args) => await eStatDownloadTool.execute(args);
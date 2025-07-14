import { ToolBase } from '../core/ToolBase.js';
import { EStatClient } from '../adapters/e-stat/EStatClient.js';

class EStatDebugTool extends ToolBase {
  constructor() {
    super();
    this.name = 'e_stat_debug';
    this.client = new EStatClient();
  }

  getSchema() {
    return {
      name: 'e_stat_debug',
      description: 'e-Stat APIの接続とレスポンスをデバッグします',
      inputSchema: {
        type: 'object',
        properties: {
          testType: {
            type: 'string',
            enum: ['connection', 'minimal_search', 'api_info'],
            description: 'テストタイプ',
            default: 'connection'
          },
          searchWord: {
            type: 'string',
            description: '検索キーワード（minimal_search用）',
            default: '人口'
          }
        }
      }
    };
  }

  async execute(args) {
    try {
      const { testType = 'connection', searchWord = '人口' } = args;

      switch (testType) {
        case 'connection':
          return await this.testBasicConnection();
        
        case 'minimal_search':
          return await this.testMinimalSearch(searchWord);
        
        case 'api_info':
          return await this.getApiInfo();
        
        default:
          throw new Error(`Unknown test type: ${testType}`);
      }
    } catch (error) {
      return this.formatResponse({
        error: error.message,
        success: false,
        stack: error.stack
      }, {
        testType: args.testType,
        debugInfo: true
      });
    }
  }

  async testBasicConnection() {
    process.stderr.write('[DEBUG] Testing basic e-Stat API connection...\n');
    
    try {
      // 最小限のパラメータでAPI接続テスト
      const response = await this.client.getStatsList({ limit: 1 });
      
      return this.formatResponse({
        status: 'success',
        message: 'e-Stat API connection successful',
        responseType: typeof response,
        hasData: !!response,
        dataKeys: response ? Object.keys(response) : [],
        responsePreview: response ? JSON.stringify(response).substring(0, 500) + '...' : null
      }, {
        testType: 'connection',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return this.formatResponse({
        status: 'failed',
        error: error.message,
        errorType: error.constructor.name,
        httpStatus: error.response?.status,
        httpData: error.response?.data
      }, {
        testType: 'connection',
        timestamp: new Date().toISOString()
      });
    }
  }

  async testMinimalSearch(searchWord) {
    process.stderr.write(`[DEBUG] Testing minimal search with keyword: ${searchWord}\n`);
    
    try {
      const response = await this.client.getStatsList({
        searchWord: searchWord,
        limit: 3
      });

      const analysisResult = this.analyzeResponse(response);

      return this.formatResponse({
        status: 'success',
        searchWord: searchWord,
        ...analysisResult
      }, {
        testType: 'minimal_search',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      return this.formatResponse({
        status: 'failed',
        searchWord: searchWord,
        error: error.message,
        errorType: error.constructor.name,
        httpStatus: error.response?.status,
        httpData: error.response?.data
      }, {
        testType: 'minimal_search',
        timestamp: new Date().toISOString()
      });
    }
  }

  async getApiInfo() {
    return this.formatResponse({
      apiConfig: {
        baseUrl: this.client.baseUrl,
        appId: this.client.appId ? this.client.appId.substring(0, 8) + '...' : 'NOT SET',
        timeout: this.client.config?.timeout,
        headers: this.client.httpClient?.defaults?.headers
      },
      endpoints: {
        getStatsList: `${this.client.baseUrl}getStatsList`,
        getStatsData: `${this.client.baseUrl}getStatsData`,
        getMetaInfo: `${this.client.baseUrl}getMetaInfo`
      }
    }, {
      testType: 'api_info',
      timestamp: new Date().toISOString()
    });
  }

  analyzeResponse(response) {
    const analysis = {
      responseType: typeof response,
      isObject: typeof response === 'object',
      isNull: response === null,
      hasData: !!response
    };

    if (response && typeof response === 'object') {
      analysis.topLevelKeys = Object.keys(response);
      analysis.responseStructure = this.getObjectStructure(response);
      
      // e-Stat特有の構造をチェック
      if (response.GET_STATS_LIST) {
        analysis.eStatStructure = 'Detected GET_STATS_LIST structure';
        analysis.result = response.GET_STATS_LIST.RESULT;
        analysis.dataList = response.GET_STATS_LIST.DATALIST_INF;
      } else {
        analysis.eStatStructure = 'Non-standard e-Stat structure';
      }
    }

    return analysis;
  }

  getObjectStructure(obj, maxDepth = 2, currentDepth = 0) {
    if (currentDepth >= maxDepth || obj === null || typeof obj !== 'object') {
      return typeof obj;
    }

    if (Array.isArray(obj)) {
      return `Array[${obj.length}]`;
    }

    const structure = {};
    for (const [key, value] of Object.entries(obj)) {
      structure[key] = this.getObjectStructure(value, maxDepth, currentDepth + 1);
    }
    return structure;
  }
}

const eStatDebugTool = new EStatDebugTool();
export const eStatDebugToolSchema = eStatDebugTool.getSchema();
export const eStatDebug = async (args) => await eStatDebugTool.execute(args);
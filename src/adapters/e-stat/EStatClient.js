import { DataSourceClient } from '../../core/DataSourceClient.js';
import { eStatConfig } from './config.js';

export class EStatClient extends DataSourceClient {
  constructor(config = {}) {
    super({
      timeout: eStatConfig.timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'e-Stat-MCP/1.0'
      },
      ...config
    });
    
    this.appId = config.appId || eStatConfig.appId;
    this.baseUrl = config.baseUrl || eStatConfig.baseUrl;
    
    if (!this.appId) {
      throw new Error('e-Stat Application ID is required. Please set up src/config/api-keys.js');
    }
  }
  
  async testConnection() {
    try {
      const response = await this.getStatsList({ limit: 1 });
      return {
        status: 'connected',
        message: 'e-Stat API connection successful',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async getStatsList(params = {}) {
    const queryParams = this._buildParams({
      ...params,
      limit: params.limit || eStatConfig.defaultLimit
    });
    
    const url = `${this.baseUrl}json/${eStatConfig.endpoints.getStatsList}`;
    return await this.httpRequest({
      method: 'GET',
      url,
      params: queryParams
    });
  }
  
  async getStatsData(params = {}) {
    if (!params.dataSetId) {
      throw new Error('dataSetId is required for getStatsData');
    }
    
    // dataSetIdをstatsDataIdに変換してAPIに送信
    const { dataSetId, ...otherParams } = params;
    const queryParams = this._buildParams({
      ...otherParams,
      statsDataId: dataSetId,
      limit: Math.min(params.limit || eStatConfig.defaultLimit, eStatConfig.maxLimit)
    });
    
    const url = `${this.baseUrl}json/${eStatConfig.endpoints.getStatsData}`;
    return await this.httpRequest({
      method: 'GET',
      url,
      params: queryParams
    });
  }
  
  async getMetaInfo(params = {}) {
    if (!params.dataSetId) {
      throw new Error('dataSetId is required for getMetaInfo');
    }
    
    // dataSetIdをstatsDataIdに変換してAPIに送信
    const { dataSetId, ...otherParams } = params;
    const queryParams = this._buildParams({
      ...otherParams,
      statsDataId: dataSetId
    });
    
    const url = `${this.baseUrl}json/${eStatConfig.endpoints.getMetaInfo}`;
    return await this.httpRequest({
      method: 'GET',
      url,
      params: queryParams
    });
  }
  
  async query(params, options = {}) {
    const operation = options.operation || 'getStatsList';
    
    switch (operation) {
      case 'getStatsList':
        return await this.getStatsList(params);
      case 'getStatsData':
        return await this.getStatsData(params);
      case 'getMetaInfo':
        return await this.getMetaInfo(params);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
  
  _buildParams(params = {}) {
    return {
      appId: this.appId,
      dataFormat: eStatConfig.dataFormat,
      ...params
    };
  }
}
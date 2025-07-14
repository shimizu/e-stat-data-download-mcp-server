// DataSourceClient.js
// データソースクライアントの基底クラス

import axios from 'axios';

export class DataSourceClient {
  constructor(config = {}) {
    this.config = config;
    
    // HTTPクライアントの初期化
    this.httpClient = axios.create({
      timeout: config.timeout || 30000,
      headers: config.headers || {}
    });
  }
  
  /**
   * データソースへの接続をテスト（サブクラスで実装必須）
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented by subclass');
  }
  
  /**
   * クエリの実行（サブクラスで実装必須）
   */
  async query(params, options = {}) {
    throw new Error('query() must be implemented by subclass');
  }
  
  /**
   * HTTPリクエストの実行（共通処理）
   */
  async httpRequest(options) {
    try {
      // デバッグ情報をstderrに出力
      process.stderr.write(`[DEBUG] Request URL: ${options.url}\n`);
      process.stderr.write(`[DEBUG] Request Method: ${options.method}\n`);
      if (options.params) {
        process.stderr.write(`[DEBUG] Request Params: ${JSON.stringify(options.params)}\n`);
      }
      
      const response = await this.httpClient.request(options);
      
      // レスポンス情報をデバッグ出力
      process.stderr.write(`[DEBUG] Response Status: ${response.status}\n`);
      process.stderr.write(`[DEBUG] Response Headers: ${JSON.stringify(response.headers)}\n`);
      
      return response.data;
    } catch (error) {
      // エラー情報も詳細に出力
      process.stderr.write(`[ERROR] HTTP Request failed: ${error.message}\n`);
      if (error.response) {
        process.stderr.write(`[ERROR] Response Status: ${error.response.status}\n`);
        process.stderr.write(`[ERROR] Response Data: ${JSON.stringify(error.response.data)}\n`);
      }
      throw error;
    }
  }
}
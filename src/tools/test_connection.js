// test_connection.js
// 汎用接続テストツール

import { ToolBase } from '../core/ToolBase.js';

class TestConnectionTool extends ToolBase {
  constructor() {
    super();
    this.name = 'test_connection';
  }

  getSchema() {
    return {
      name: 'test_connection',
      title: 'Test Connection',
      description: 'サーバー/API接続をテストします（汎用版）',
      inputSchema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'テスト対象のURL（オプション、設定されている場合はそのURLをテスト）'
          }
        }
      }
    };
  }

  async execute(args) {
    try {
      const testUrl = args.url || 'https://httpbin.org/get';
      
      // シンプルなHTTP接続テスト
      const response = await fetch(testUrl, {
        method: 'GET',
        timeout: 10000
      });
      
      const status = response.ok ? 'success' : 'failed';
      const result = {
        url: testUrl,
        status: status,
        http_status: response.status,
        response_time: 'N/A'
      };
      
      return this.formatResponse(result, {
        test_type: 'http_connection',
        description: 'Basic HTTP connection test'
      });
      
    } catch (error) {
      const result = {
        url: args.url || 'default',
        status: 'failed',
        error: error.message
      };
      
      return this.formatResponse(result, {
        test_type: 'http_connection',
        description: 'Connection test failed'
      });
    }
  }
}

// ツールのインスタンスを作成
const testConnectionTool = new TestConnectionTool();

// スキーマとハンドラーをエクスポート
export const testConnectionToolSchema = testConnectionTool.getSchema();
export const testConnection = async (args) => {
  return await testConnectionTool.execute(args);
};
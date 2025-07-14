// DataDownloadServer.js
// 汎用データダウンロードMCPサーバークラス

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializedNotificationSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

import { toolSchemas, executeTool } from '../tools/index.js';

export class DataDownloadServer {
  constructor(serverInfo = {}) {
    // MCPサーバーのインスタンスを作成
    this.server = new Server(
      {
        name: serverInfo.name || 'data-download-server',
        version: serverInfo.version || '1.0.0',
      },
      {
        capabilities: {
          tools: {},  // ツール機能を有効化
        },
      }
    );

    // ツールハンドラーの設定
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // 初期化完了通知のハンドラー
    this.server.setNotificationHandler(InitializedNotificationSchema, async () => {
      // 初期化完了（ログ出力なし）
    });

    // 利用可能なツールのリストを返すハンドラー
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolSchemas
    }));

    // ツール実行のハンドラー
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // 引数検証
        if (args && typeof args !== 'object') {
          throw new McpError(
            ErrorCode.InvalidParams, 
            'Invalid arguments format',
            { tool: name, received: typeof args }
          );
        }
        
        return await executeTool(name, args || {});
      } catch (error) {
        // 既にMcpErrorの場合はそのまま再投げ
        if (error instanceof McpError) {
          throw error;
        }
        
        // ネットワークエラー
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          throw new McpError(
            ErrorCode.InternalError,
            'Network connection failed',
            { tool: name, networkError: error.code }
          );
        }
        
        // 検証エラー
        if (error.message?.includes('validation') || error.message?.includes('invalid')) {
          throw new McpError(
            ErrorCode.InvalidParams,
            error.message,
            { tool: name, args: args }
          );
        }
        
        // タイムアウトエラー
        if (error.message?.includes('timeout')) {
          throw new McpError(
            ErrorCode.RequestTimeout,
            'Request timed out',
            { tool: name }
          );
        }
        
        // その他のエラー
        throw new McpError(
          ErrorCode.InternalError,
          error.message || 'Unknown error occurred',
          { 
            tool: name, 
            errorType: error.constructor.name
          }
        );
      }
    });
  }

  // MCPサーバーの起動
  async run() {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      // サーバー起動成功（stderrにログ出力）
      process.stderr.write('MCP server started successfully\n');
    } catch (error) {
      process.stderr.write(`MCP server startup failed: ${error.message}\n`);
      process.exit(1);
    }
  }
}
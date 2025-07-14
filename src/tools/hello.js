// hello.js
// シンプルなHello Worldツール（テンプレート動作確認用）

import { ToolBase } from '../core/ToolBase.js';

class HelloTool extends ToolBase {
  constructor() {
    super();
    this.name = 'hello';
  }

  getSchema() {
    return {
      name: 'hello',
      title: 'Hello World Tool',
      description: 'シンプルなHello Worldレスポンス（テンプレート動作確認用）',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: '名前（オプション）'
          }
        }
      }
    };
  }

  async execute(args) {
    const name = args.name || 'World';
    const message = `Hello ${name}!`;
    
    return this.formatResponse(message, {
      input: args,
      description: 'テンプレート用のシンプルなサンプルツールです'
    });
  }
}

// ツールのインスタンスを作成
const helloTool = new HelloTool();

// スキーマとハンドラーをエクスポート
export const helloToolSchema = helloTool.getSchema();
export const hello = async (args) => {
  return await helloTool.execute(args);
};
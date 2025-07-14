// ToolBase.js
// MCPツールの基底クラス

export class ToolBase {
  constructor() {
    this.name = 'base_tool'; // サブクラスでオーバーライド
  }
  
  /**
   * MCPツールスキーマの定義（サブクラスで実装必須）
   */
  getSchema() {
    throw new Error('getSchema() must be implemented by subclass');
  }
  
  /**
   * ツールの実行（サブクラスで実装必須）
   */
  async execute(args) {
    throw new Error('execute() must be implemented by subclass');
  }
  
  /**
   * 統一されたレスポンスフォーマット
   */
  formatResponse(data, metadata = {}) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: data,
            metadata: {
              tool: this.name,
              timestamp: new Date().toISOString(),
              ...metadata
            }
          }, null, 2)
        }
      ]
    };
  }
}
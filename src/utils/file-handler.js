import fs from 'fs/promises';
import path from 'path';

/**
 * e-Stat統計データをファイルに保存するユーティリティ
 */
export class EStatFileHandler {
  
  /**
   * 統計データをファイルに保存
   * @param {Object} data - 統計データ
   * @param {string} outputPath - 出力ファイルパス
   * @param {string} format - 出力形式 ('json', 'csv')
   * @returns {Object} 保存結果
   */
  static async saveStatisticalData(data, outputPath, format = 'json') {
    try {
      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(outputPath);
      await fs.mkdir(dir, { recursive: true });
      
      let content;
      let fileSize;
      
      if (format === 'csv') {
        content = this.convertToCSV(data);
        fileSize = Buffer.byteLength(content, 'utf8');
        await fs.writeFile(outputPath, content, 'utf8');
      } else {
        content = JSON.stringify(data, null, 2);
        fileSize = Buffer.byteLength(content, 'utf8');
        await fs.writeFile(outputPath, content, 'utf8');
      }
      
      return {
        success: true,
        path: outputPath,
        size: this.formatFileSize(fileSize),
        bytes: fileSize,
        format: format,
        recordCount: this.getRecordCount(data)
      };
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }
  
  /**
   * 統計データをCSV形式に変換
   * @param {Object} data - 統計データ
   * @returns {string} CSV文字列
   */
  static convertToCSV(data) {
    if (!data || !data.data) {
      return '';
    }
    
    // データが配列の場合
    if (Array.isArray(data.data)) {
      const rows = data.data;
      if (rows.length === 0) return '';
      
      // ヘッダー行を作成
      const headers = Object.keys(rows[0]);
      const csvContent = [
        headers.join(','),
        ...rows.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // CSV用にエスケープ
            return typeof value === 'string' && value.includes(',') 
              ? `"${value.replace(/"/g, '""')}"` 
              : value;
          }).join(',')
        )
      ].join('\n');
      
      return csvContent;
    }
    
    // e-Stat APIの特殊な形式の場合
    if (data.data && data.data.data) {
      const statisticalData = data.data.data;
      
      if (Array.isArray(statisticalData)) {
        // VALUE要素を展開してCSVに変換
        const csvRows = [
          'unit,cat01,cat02,cat03,area,time,value' // 一般的なe-Statの列
        ];
        
        statisticalData.forEach(item => {
          const row = [
            item['@unit'] || '',
            item['@cat01'] || '',
            item['@cat02'] || '',
            item['@cat03'] || '',
            item['@area'] || '',
            item['@time'] || '',
            item['$'] || ''
          ].join(',');
          csvRows.push(row);
        });
        
        return csvRows.join('\n');
      }
    }
    
    return JSON.stringify(data, null, 2); // フォールバック
  }
  
  /**
   * データレコード数を取得
   * @param {Object} data - 統計データ
   * @returns {number} レコード数
   */
  static getRecordCount(data) {
    if (!data) return 0;
    
    if (Array.isArray(data.data)) {
      return data.data.length;
    }
    
    if (data.data && Array.isArray(data.data.data)) {
      return data.data.data.length;
    }
    
    if (data.data && data.data.retrievedCount) {
      return data.data.retrievedCount;
    }
    
    return 1;
  }
  
  /**
   * ファイルサイズを人間が読みやすい形式に変換
   * @param {number} bytes - バイト数
   * @returns {string} フォーマットされたサイズ
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * ファイルパスの妥当性をチェック
   * @param {string} filePath - ファイルパス
   * @returns {boolean} 妥当性
   */
  static validateFilePath(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      return false;
    }
    
    // 危険なパスをチェック
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
      return false;
    }
    
    // 拡張子チェック
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.json', '.csv', '.txt'];
    
    return allowedExtensions.includes(ext);
  }
  
  /**
   * 統合的なファイル保存処理（MCP応答付き）
   * @param {Object} params - パラメータ
   * @returns {Object} MCP形式のレスポンス
   */
  static async handleDataWithOptionalFile(params) {
    const {
      data,
      outputPath,
      format = 'json',
      dataType,
      metadata = {},
      toolName
    } = params;
    
    // ファイル出力が指定されている場合
    if (outputPath) {
      if (!this.validateFilePath(outputPath)) {
        throw new Error('Invalid file path. Only .json, .csv, .txt files are allowed and path traversal is not permitted.');
      }
      
      const result = await this.saveStatisticalData(data, outputPath, format);
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            status: 'success',
            message: `${dataType}データをファイルに保存しました`,
            file: result.path,
            size: result.size,
            recordCount: result.recordCount,
            format: result.format,
            ...metadata
          }, null, 2)
        }]
      };
    }
    
    // ファイル出力が指定されていない場合は通常のMCP応答
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          data: data,
          metadata: {
            tool: toolName,
            timestamp: new Date().toISOString(),
            ...metadata
          }
        }, null, 2)
      }]
    };
  }
}
// api-keys.example.js
// APIキー設定テンプレート

/**
 * APIキー設定
 * 使用方法：
 * 1. このファイルをapi-keys.jsとしてコピー: cp api-keys.example.js api-keys.js
 * 2. api-keys.jsを編集して実際のAPIキーを設定
 * 3. api-keys.jsはGitにコミットされません
 */

export const apiKeys = {
  // e-Stat API アプリケーションID
  // https://www.e-stat.go.jp/api/ で取得してください
  eStat: 'your_e_stat_application_id_here',
  
  // 将来的に他のAPIを追加する場合
  // openData: 'your_opendata_api_key_here',
  // resas: 'your_resas_api_key_here'
};
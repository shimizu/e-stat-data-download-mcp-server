// index.js
// ツール統合・エクスポート

import { helloToolSchema, hello } from './hello.js';
import { testConnectionToolSchema, testConnection } from './test_connection.js';
import { eStatSearchToolSchema, eStatSearch } from './e_stat_search.js';
import { eStatGetDataToolSchema, eStatGetData } from './e_stat_get_data.js';
import { eStatGetMetaToolSchema, eStatGetMeta } from './e_stat_get_meta.js';
import { eStatDownloadToolSchema, eStatDownload } from './e_stat_download.js';
import { eStatDebugToolSchema, eStatDebug } from './e_stat_debug.js';
import { eStatHelpToolSchema, eStatHelp } from './e_stat_help.js';

// すべてのツールスキーマをエクスポート
export const toolSchemas = [
  helloToolSchema,
  testConnectionToolSchema,
  eStatSearchToolSchema,
  eStatGetDataToolSchema,
  eStatGetMetaToolSchema,
  eStatDownloadToolSchema,
  eStatDebugToolSchema,
  eStatHelpToolSchema
];

// ツール実行関数のマッピング
export const toolHandlers = {
  'hello': hello,
  'test_connection': testConnection,
  'e_stat_search': eStatSearch,
  'e_stat_get_data': eStatGetData,
  'e_stat_get_meta': eStatGetMeta,
  'e_stat_download': eStatDownload,
  'e_stat_debug': eStatDebug,
  'e_stat_help': eStatHelp
};

// ツール実行のディスパッチャー
export async function executeTool(toolName, args) {
  const handler = toolHandlers[toolName];
  if (!handler) {
    throw new Error(`Unknown tool: ${toolName}`);
  }
  
  return await handler(args);
}
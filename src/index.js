#!/usr/bin/env node
// index.js
// エントリーポイント

import { DataDownloadServer } from './server/DataDownloadServer.js';

// サーバーインスタンスの作成と起動
const server = new DataDownloadServer({
  name: 'data-download-server-template',
  version: '1.0.0'
});

server.run().catch(console.error);
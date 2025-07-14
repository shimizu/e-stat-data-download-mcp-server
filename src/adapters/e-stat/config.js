import { apiKeys } from '../../config/api-keys.js';

export const eStatConfig = {
  appId: apiKeys.eStat,
  baseUrl: 'http://api.e-stat.go.jp/rest/3.0/app/',
  timeout: 30000,
  defaultLimit: 1000,
  maxLimit: 10000,
  
  endpoints: {
    getStatsList: 'getStatsList',
    getStatsData: 'getStatsData', 
    getMetaInfo: 'getMetaInfo'
  },
  
  dataFormat: 'json'
};

if (!eStatConfig.appId || eStatConfig.appId === 'your_e_stat_application_id_here') {
  process.stderr.write('e-Stat API key is not configured. Please set up src/config/api-keys.js\n');
  process.stderr.write('Copy src/config/api-keys.example.js to src/config/api-keys.js and edit it.\n');
}
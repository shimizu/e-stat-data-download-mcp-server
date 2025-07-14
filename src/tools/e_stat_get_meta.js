import { ToolBase } from '../core/ToolBase.js';
import { EStatClient } from '../adapters/e-stat/EStatClient.js';

class EStatGetMetaTool extends ToolBase {
  constructor() {
    super();
    this.name = 'e_stat_get_meta';
    this.client = new EStatClient();
  }

  getSchema() {
    return {
      name: 'e_stat_get_meta',
      description: 'e-Stat APIを使用して指定した統計表のメタデータ（項目定義、分類情報等）を取得します',
      inputSchema: {
        type: 'object',
        properties: {
          dataSetId: {
            type: 'string',
            description: '統計表ID（必須）'
          },
          explanationGetFlg: {
            type: 'string',
            description: '解説情報取得フラグ（Y/N、デフォルト: Y）',
            enum: ['Y', 'N']
          }
        },
        required: ['dataSetId']
      }
    };
  }

  async execute(args) {
    try {
      const params = {
        dataSetId: args.dataSetId,
        explanationGetFlg: args.explanationGetFlg || 'Y'
      };

      const response = await this.client.getMetaInfo(params);
      
      // レスポンスの処理
      if (response && response.GET_META_INFO && response.GET_META_INFO.RESULT) {
        const result = response.GET_META_INFO.RESULT;
        
        if (result.STATUS !== 0) {
          throw new Error(`e-Stat API Error: ${result.ERROR_MSG || 'Unknown error'}`);
        }

        const metaInfo = response.GET_META_INFO.METADATA_INF;
        const tableInf = metaInfo?.TABLE_INF;
        const classInf = metaInfo?.CLASS_INF?.CLASS_OBJ;

        // クラス情報を整理
        const classObjects = Array.isArray(classInf) ? classInf : (classInf ? [classInf] : []);
        const formattedClasses = classObjects.map(cls => ({
          id: cls['@id'],
          name: cls['@name'],
          classes: Array.isArray(cls.CLASS) ? cls.CLASS : (cls.CLASS ? [cls.CLASS] : [])
        }));

        return this.formatResponse({
          dataSetId: args.dataSetId,
          tableInfo: {
            id: tableInf?.['@id'],
            title: tableInf?.TITLE,
            cycle: tableInf?.CYCLE,
            surveyDate: tableInf?.SURVEY_DATE,
            openDate: tableInf?.OPEN_DATE,
            smallArea: tableInf?.SMALL_AREA
          },
          classInfo: formattedClasses,
          explanation: metaInfo?.EXPLANATION
        }, {
          requestParams: params,
          apiStatus: result.STATUS
        });
      } else {
        throw new Error('Unexpected response format from e-Stat API');
      }
    } catch (error) {
      return this.formatResponse({
        error: error.message,
        success: false
      }, {
        requestParams: args
      });
    }
  }
}

const eStatGetMetaTool = new EStatGetMetaTool();
export const eStatGetMetaToolSchema = eStatGetMetaTool.getSchema();
export const eStatGetMeta = async (args) => await eStatGetMetaTool.execute(args);
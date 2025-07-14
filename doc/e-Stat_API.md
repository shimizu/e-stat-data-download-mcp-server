# e-Stat API マニュアル 3.0 - 

## 基本情報
- **提供元**: 独立行政法人 統計センター
- **API名称**: 政府統計の総合窓口（e-Stat）API機能

## 1. API機能の種類

### 1.1 統計表情報取得
- **機能**: 政府統計の総合窓口（e-Stat）で提供している統計表の情報を取得
- **特徴**: リクエストパラメータの指定により条件を絞った情報の取得が可能

### 1.2 メタ情報取得
- **機能**: 指定した統計表IDに対応するメタ情報（表章事項、分類事項、地域事項等）を取得

### 1.3 統計データ取得
- **機能**: 指定した統計表ID又はデータセットIDに対応する統計データ（数値データ）を取得

### 1.4 データセット登録
- **機能**: 統計データを取得する際の取得条件を登録
- **特徴**: 統計データの取得における絞り込み条件を「データセット」として指定することで、取得条件を省略可能

### 1.5 データセット参照
- **機能**: 登録されているデータセットの絞り込み条件等を参照
- **特徴**: データセットIDが指定されていない場合は、利用者が使用できるデータセットの一覧が参照可能

### 1.6 データカタログ情報取得
- **機能**: 政府統計の総合窓口（e-Stat）で提供している統計表ファイルおよび統計データベースの情報を取得
- **特徴**: 統計表情報取得機能同様に、リクエストパラメータの指定により条件を絞った情報の取得が可能

### 1.7 統計データ一括取得
- **機能**: 複数の統計表ID又はデータセットIDを指定して一括で統計データ（数値データ）を取得

## 2. APIの利用方法

### 2.1 統計表情報取得

#### エンドポイント

```
http(s)://api.e-stat.go.jp/rest/<バージョン>/app/json/getStatsList?<パラメータ群>
```

#### HTTPメソッド
- GET

### 2.2 メタ情報取得

#### エンドポイント

```
# JSON形式
http(s)://api.e-stat.go.jp/rest/<バージョン>/app/json/getMetaInfo?<パラメータ群>

```

#### HTTPメソッド
- GET

### 2.3 統計データ取得

#### エンドポイント
```
# JSON形式
http(s)://api.e-stat.go.jp/rest/<バージョン>/app/json/getStatsData?<パラメータ群>
```

#### HTTPメソッド
- GET

### 2.4 データセット登録

#### エンドポイント
```
http(s)://api.e-stat.go.jp/rest/<バージョン>/app/postDataset
```

#### HTTPメソッド
- POST

#### Content-Type
- application/x-www-form-urlencoded

### 2.5 データセット参照

#### エンドポイント
```
# JSON形式
http(s)://api.e-stat.go.jp/rest/<バージョン>/app/json/refDataset?<パラメータ群>

```

#### HTTPメソッド
- GET

### 2.6 データカタログ情報取得

#### エンドポイント
```
# JSON形式
http(s)://api.e-stat.go.jp/rest/<バージョン>/app/json/getDataCatalog?<パラメータ群>
```

#### HTTPメソッド
- GET

### 2.7 統計データ一括取得

#### エンドポイント
```
# JSON形式
http(s)://api.e-stat.go.jp/rest/<バージョン>/app/json/getStatsDatas?<パラメータ群>
```

#### HTTPメソッド
- POST

## 3. APIパラメータ

### 3.1 全API共通パラメータ

| パラメータ名 | 意味 | 必須 | 設定内容・設定可能値 |
|---|---|---|---|
| appId | アプリケーションID | 〇 | 取得したアプリケーションIDを指定 |
| lang | 言語 | － | J：日本語 (省略値)<br>E：英語 |

### 3.2 統計表情報取得パラメータ

| パラメータ名 | 意味 | 必須 | 設定内容・設定可能値 |
|---|---|---|---|
| surveyYears | 調査年月 | － | yyyy：単年検索<br>yyyymm：単月検索<br>yyyymm-yyyymm：範囲検索 |
| openYears | 公開年月 | － | 調査年月と同様 |
| statsField | 統計分野 | － | 数値2桁：統計大分類で検索<br>数値4桁：統計小分類で検索 |
| statsCode | 政府統計コード | － | 数値5桁：作成機関で検索<br>数値8桁：政府統計コードで検索 |
| searchWord | 検索キーワード | － | 任意の文字列。AND、OR、NOT指定可能 |
| searchKind | 検索データ種別 | － | 1：統計情報(省略値)<br>2：小地域・地域メッシュ |
| collectArea | 集計地域区分 | － | 1：全国<br>2：都道府県<br>3：市区町村 |
| explanationGetFlg | 解説情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| statsNameList | 統計調査名指定 | － | Y：統計調査名一覧 |
| startPosition | データ取得開始位置 | － | 1から始まる行番号 |
| limit | データ取得件数 | － | 省略時は10万件 |
| updatedDate | 更新日付 | － | yyyy：単年検索<br>yyyymm：単月検索<br>yyyymmdd：単日検索<br>yyyymmdd-yyyymmdd：範囲検索 |
| callback | コールバック関数 | △ | JSONP形式の場合は必須 |

### 3.3 メタ情報取得パラメータ

| パラメータ名 | 意味 | 必須 | 設定内容・設定可能値 |
|---|---|---|---|
| statsDataId | 統計表ID | 〇 | 統計表情報取得で得られる統計表ID |
| explanationGetFlg | 解説情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| callback | コールバック関数 | △ | JSONP形式の場合は必須 |

### 3.4 統計データ取得パラメータ

| パラメータ名 | 意味 | 必須 | 設定内容・設定可能値 |
|---|---|---|---|
| dataSetId | データセットID | △ | データセット登録で登録したデータセットID |
| statsDataId | 統計表ID | △ | 統計表情報取得で得られる統計表ID |
| lvTab | 表章事項 階層レベル | － | X：指定階層レベルのみ<br>X-X：指定階層レベルの範囲<br>-X：階層レベル1から指定階層レベル<br>X-：指定階層レベルから階層レベル9 |
| cdTab | 表章事項 単一コード | － | カンマ区切りで100個まで指定可能 |
| cdTabFrom | 表章事項 コードFrom | － | 範囲の開始位置 |
| cdTabTo | 表章事項 コードTo | － | 範囲の終了位置 |
| lvTime | 時間軸事項 階層レベル | － | 表章事項と同様 |
| cdTime | 時間軸事項 単一コード | － | 表章事項と同様 |
| cdTimeFrom | 時間軸事項 コードFrom | － | 表章事項と同様 |
| cdTimeTo | 時間軸事項 コードTo | － | 表章事項と同様 |
| lvArea | 地域事項 階層レベル | － | 表章事項と同様 |
| cdArea | 地域事項 単一コード | － | 表章事項と同様 |
| cdAreaFrom | 地域事項 コードFrom | － | 表章事項と同様 |
| cdAreaTo | 地域事項 コードTo | － | 表章事項と同様 |
| lvCat01～15 | 分類事項01～15 階層レベル | － | 表章事項と同様 |
| cdCat01～15 | 分類事項01～15 単一コード | － | 表章事項と同様 |
| cdCat01From～15 | 分類事項01～15 コードFrom | － | 表章事項と同様 |
| cdCat01To～15 | 分類事項01～15 コードTo | － | 表章事項と同様 |
| startPosition | データ取得開始位置 | － | 1から始まる行番号 |
| limit | データ取得件数 | － | 省略時は10万件 |
| metaGetFlg | メタ情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| cntGetFlg | 件数取得フラグ | － | Y：件数のみ取得<br>N：件数及び統計データを取得 (省略値) |
| explanationGetFlg | 解説情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| annotationGetFlg | 注釈情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| replaceSpChar | 特殊文字の置換 | － | 0：置換しない（デフォルト）<br>1：0（ゼロ）に置換<br>2：NULL（空文字)に置換<br>3：NA（文字列）に置換 |
| callback | コールバック関数 | △ | JSONP形式の場合は必須 |
| sectionHeaderFlg | セクションヘッダフラグ | － | 1：セクションヘッダを出力する (省略値)<br>2：セクションヘッダを取得しない |

#### 特別なキーワード
- min：最小値
- max：最大値

### 3.5 データセット登録パラメータ

| パラメータ名 | 意味 | 必須 | 設定内容・設定可能値 |
|---|---|---|---|
| dataSetId | データセットID | △ | 30文字以内の半角英数字と'-'、'_'、'.'、'@'のみ使用可 |
| statsDataId | 統計表ID | △ | 統計表情報取得で得られる統計表ID |
| openSpecified | 公開可否 | － | 0：公開不可 (省略値)<br>1：公開可 |
| processMode | 処理モード | － | E：登録・更新 (省略値)<br>D：削除 |
| dataSetName | データセット名 | － | 全角で256文字まで |

※ 絞り込み条件パラメータは統計データ取得と同様

### 3.6 データセット参照パラメータ

| パラメータ名 | 意味 | 必須 | 設定内容・設定可能値 |
|---|---|---|---|
| dataSetId | データセットID | － | 省略時は利用可能なデータセットの一覧を取得 |
| collectArea | 集計地域区分 | － | 1：全国<br>2：都道府県<br>3：市区町村 |
| explanationGetFlg | 解説情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| callback | コールバック関数 | △ | JSONP形式の場合は必須 |

### 3.7 データカタログ情報取得パラメータ

| パラメータ名 | 意味 | 必須 | 設定内容・設定可能値 |
|---|---|---|---|
| surveyYears | 調査年月 | － | 統計表情報取得と同様 |
| openYears | 公開年月 | － | 統計表情報取得と同様 |
| statsField | 統計分野 | － | 統計表情報取得と同様 |
| statsCode | 政府統計コード | － | 統計表情報取得と同様 |
| searchWord | 検索キーワード | － | 統計表情報取得と同様 |
| collectArea | 集計地域区分 | － | 統計表情報取得と同様 |
| explanationGetFlg | 解説情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| dataType | 検索データ形式 | － | XLS：EXCELファイル<br>CSV：CSVファイル<br>PDF：PDFファイル<br>XML：XMLファイル<br>XLS_REP：EXCELファイル（閲覧用）<br>DB：統計データベース |
| startPosition | データ取得開始位置 | － | 1から始まる番号 |
| catalogId | カタログID | － | 検索するカタログID |
| resourceId | カタログリソースID | － | 検索するカタログリソースID |
| limit | データ取得件数 | － | 省略時は100データセット |
| updatedDate | 更新日付 | － | 統計表情報取得と同様 |
| callback | コールバック関数 | △ | JSONP形式の場合は必須 |

### 3.8 統計データ一括取得パラメータ

| パラメータ名 | 意味 | 必須 | 設定内容・設定可能値 |
|---|---|---|---|
| metaGetFlg | メタ情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| explanationGetFlg | 解説情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| annotationGetFlg | 注釈情報有無 | － | Y：取得する (省略値)<br>N：取得しない |
| replaceSpChar | 特殊文字の置換 | － | 統計データ取得と同様 |
| sectionHeaderFlg | セクションヘッダフラグ | － | 統計データ取得と同様 |
| statsDatasSpec | 統計データ一括取得パラメータリスト | ○ | JSON形式の文字列 |

#### statsDatasSpecの記述例
```json
[
  {
    "statsDataId": "0003084821",
    "lvTab": "1-2",
    "cdCat01": "01"
  },
  {
    "statsDataId": "0005084822",
    "cdAreaFrom": "01000",
    "cdAreaTo": "02000"
  }
]
```

## 4. APIの出力データ

### 4.1 全API共通

#### 4.1.1 RESULT タグ
- STATUS: 処理結果コード（0～2：正常終了、100以上：エラー）
- ERROR_MSG: エラーメッセージ
- DATE: 出力日時

#### 4.1.2 処理結果コード

| 結果コード | HTTPステータス | メッセージ |
|---|---|---|
| 0 | 200 | 正常に終了しました。 |
| 1 | 200 | 絞り込み条件に該当するデータが存在しません。 |
| 2 | 200 | 登録件数の上限を超えました。 |
| 100 | 403 | 認証に失敗しました。 |
| 101 | 400 | 登録されていないIDが指定されています。 |
| 102 | 400 | 指定されたデータが存在しません。 |
| 103 | 400 | 該当するメタ情報が存在しません。 |
| 104 | 400 | 該当する統計データが存在しません。 |
| 105 | 400 | 該当するデータセットが存在しません。 |
| 200～299 | 500 | サーバエラー |
| 300～401 | 400/500 | 各種エラー |

### 4.2 出力形式

#### XML形式
```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<ルートタグ名>
  <RESULT>
    <STATUS>処理結果コード</STATUS>
    <ERROR_MSG>メッセージ</ERROR_MSG>
    <DATE>出力日時</DATE>
  </RESULT>
  <PARAMETER>
    <!-- 受信パラメータ -->
  </PARAMETER>
  <出力データ部>
    <!-- API毎の出力内容 -->
  </出力データ部>
</ルートタグ名>
```

#### JSON形式
- XML形式のデータを変換
- 全角文字はユニコードエスケープ
- 特殊文字（<, >, &, =, '）もユニコードエスケープ
- ダブルクォート(")とバックスラッシュ(\\)はバックスラッシュでエスケープ

#### CSV形式
- ダブルクォート文字(")でクォート
- 項目の区切りはカンマ文字(,)
- ダブルクォートはダブルクォートでエスケープ

## パラメータ記述規則

1. パラメータ形式: `パラメータ名=値`
2. 複数パラメータ: `パラメータ名=値&パラメータ名=値&...`
3. URLエンコード: 必須（文字コードUTF-8）
4. GET: URLの<パラメータ群>に配置
5. POST: リクエストボディに配置



e-Stat APIで目的のデータを取得するための一般的なリクエストの流れを説明します。
基本的なリクエストの流れ
1. 統計表の検索・特定
統計表情報取得 (getStatsList)
↓
目的の統計表IDを特定
2. メタ情報の確認
メタ情報取得 (getMetaInfo)
↓
データの構造・項目を理解
3. データの取得
統計データ取得 (getStatsData)
↓
実際の数値データを取得
具体的な手順
ステップ1: 統計表を探す
httpGET /rest/3.0/app/json/getStatsList?appId=YOUR_APP_ID&searchWord=人口&statsCode=00200521
目的:

キーワードや統計コードで統計表を検索
取得できる情報: 統計表ID、表題、調査年月など

重要なパラメータ:

searchWord: キーワード検索（例: "人口", "労働力"）
statsCode: 政府統計コード（例: 00200521=国勢調査）
surveyYears: 調査年月で絞り込み

ステップ2: データ構造を確認
httpGET /rest/3.0/app/json/getMetaInfo?appId=YOUR_APP_ID&statsDataId=0003090287
目的:

統計表の詳細な構造を理解
各項目のコードと名称を確認

確認すべき情報:

tab (表章事項): 測定する項目（人口数、世帯数など）
area (地域事項): 地域コード（都道府県、市区町村）
time (時間軸事項): 調査時点
cat01-15 (分類事項): その他の分類（性別、年齢など）

ステップ3: データを取得
httpGET /rest/3.0/app/json/getStatsData?appId=YOUR_APP_ID&statsDataId=0003090287&cdArea=13000&cdTime=2020000000
目的:

実際の統計数値を取得
必要に応じて絞り込み条件を指定

絞り込みパラメータの例:

cdArea=13000: 東京都のみ
cdTime=2020000000: 2020年のみ
lvTab=1: 表章事項の第1階層のみ

効率的なデータ取得のコツ
1. データセットの活用
頻繁に使う絞り込み条件は、データセットとして登録しておくと便利です。
httpPOST /rest/3.0/app/postDataset
Content-Type: application/x-www-form-urlencoded

appId=YOUR_APP_ID&statsDataId=0003090287&cdArea=13000,14000,11000,12000
2. 一括取得の活用
複数の統計表から同時にデータを取得する場合：
httpPOST /rest/3.0/app/json/getStatsDatas
Content-Type: application/x-www-form-urlencoded

appId=YOUR_APP_ID&statsDatasSpec=[{"statsDataId":"0003090287","cdArea":"13000"},{"statsDataId":"0003084821","cdArea":"13000"}]
実践例：東京都の人口データを取得
1. 国勢調査の統計表を検索
bash# 国勢調査（statsCode=00200521）の人口関連統計表を検索
curl "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsList?appId=YOUR_APP_ID&statsCode=00200521&searchWord=人口"
2. メタ情報を確認
bash# 統計表ID: 0000000001 のメタ情報を取得
curl "https://api.e-stat.go.jp/rest/3.0/app/json/getMetaInfo?appId=YOUR_APP_ID&statsDataId=0000000001"
3. 東京都のデータを取得
bash# 東京都（13000）の最新データを取得
curl "https://api.e-stat.go.jp/rest/3.0/app/json/getStatsData?appId=YOUR_APP_ID&statsDataId=0000000001&cdArea=13000"
注意点

データ量の確認: cntGetFlg=Yを使って先に件数を確認
段階的な絞り込み: 最初は大まかに検索し、徐々に条件を絞る
制限事項:

1回のリクエストで最大10万件
limitパラメータで件数制御
startPositionで続きから取得



このような流れで、目的のデータに効率的にアクセスできます。
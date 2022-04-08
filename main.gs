function doGet(e) {
  let page = e.parameter.page;
  if (!page) {
    page = 'index';
  }

  const template = HtmlService.createTemplateFromFile(page);
  if (!(page === 'index')) {
    template.name = e.parameter.name;
    template.password = e.parameter.password;
  }
  return template.evaluate();
}

// ↓passwordの入力画面で、これを使ってURLを変えたかった
// const passwordCheck = () => {
//   let pagename = "aa"
//   if(password==input){
//     pagename = "set"
//   }else{
//     pagename = "erro"
//   }
//   return pagename
// }

//  URLを取得する
function getAppUrl() {
  return ScriptApp.getService().getUrl();
}

//スプレッドシート名取得
const getSheet = () => {
  return SpreadsheetApp.openById('1-JzVdJLXQZAP9IvkTt5zDGArDDAircSc2AcdsX4XJlY');
}

// スプレッドのシート名取得
const getSheetName = (sheet, name) => {
  const sheetName = sheet.getSheetByName(name);
  return sheetName
}

// データを使いやすくする。ex.[I am fuma]→["I","am","fuma"]
const organize = (datas) => {
  const newDatas = [];
  let forDatas = datas;
  // 配列でないものを配列にする。　ex.I am fuma→[I am fuma]
  if (!(Array.isArray(forDatas))) {
    forDatas = [forDatas];
    console.log("配列に変換")
  }
  for (let i = 0; i < forDatas.length; i++) {
    // String=配列から出す
    const dataSplid = (String(forDatas[i])).split(' ');
    newDatas.push(dataSplid.slice(0, 5));
  }
  return newDatas;
  // [ 'Wed', 'Apr', '06', '2022', '04:54:26' ]
}

// 現在時刻を○○:○○に書き換える
const time = () => {
  const currentTime = organize(new Date)[0].slice(4, 5);
  console.log(currentTime)
  const timeWithOutSeconds = (String(currentTime)).split(':').slice(0, 2);
  const timeForStumping = `${timeWithOutSeconds[0]}:${timeWithOutSeconds[1]}`;
  return timeForStumping;
}

//書き込む行の検索
const findeTargetRow = (dates, today) => {
  let organaizeDatas = organize(dates);
  let targetRow;
  // 現在時刻の時間の要素を消す
  let todayWithOutTime = organize(today)[0].slice(0, 4);
  let datesWithOutTime = [];
  for (let i = 0; i < organaizeDatas.length; i++) {
    // 受け取ったdatasの時間の要素を消す
    datesWithOutTime[i] = organaizeDatas[i].slice(0, 4)
    // console.log(todayWithOutTime);
    // console.log(datesWithOutTime[i]);
    // JSON文字列で比較
    if (JSON.stringify(datesWithOutTime[i]) == JSON.stringify(todayWithOutTime)) {
      targetRow = i + 3;
      break;
    }
  }
  return targetRow;
}

//書き込む列の検索
const findeTargetColumn = (kinds) => {
  let targetRow;
  switch (kinds) {
    case '出勤':
      targetRow = "G";
      break;
    case '退勤':
      targetRow = "H";
      break;
    case '休憩開始':
      targetRow = "I";
      break;
    case '休憩終了':
      targetRow = "J";
      break;
  }
  return targetRow;
}

// 打刻を行う
const stamping = (kinds, name) => {
  //スプレッドシートを指定
  const sheet = getSheet();
  //スプレッドシートのシート名
  const sheetName = getSheetName(sheet, name);
  const lastRow = sheetName.getLastRow();
  const dates = sheetName.getRange(`D3:D${lastRow}`).getValues();
  // 今日の日付と一致する行を取得
  const row = findeTargetRow(dates, new Date());
  // 引数と一致する列を取得
  const column = findeTargetColumn(kinds);
  // セル取得
  const cell = sheetName.getRange(`${column + row}`);
  // 打刻
  const current = time();
  cell.setValue(current);
  return true;
}

const test = () => {
  console.log(organize(new Date()))
}



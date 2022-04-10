function doGet(e) {
  let page = e.parameter.page;
  if (!page) {
    page = 'index';

  }

  const template = HtmlService.createTemplateFromFile(page)
  if (!(page === 'index')) {
    template.name = e.parameter.name;
    template.password = e.parameter.password;
  }
  return template.evaluate().addMetaTag('viewport', 'width=device-width, initial-scale=1');
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
  }
  for (let i = 0; i < forDatas.length; i++) {
    // String=配列から出す
    const dataSplid = (String(forDatas[i])).split(' ');
    newDatas.push(dataSplid.slice(0, 5));
  }
  return newDatas;
  // [ 'Wed', 'Apr', '06', '2022', '04:54:26' ]
}

// 時刻を○○:○○に書き換える
const time = (date) => {
  const currentTime = organize(date)[0].slice(4, 5);
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


// メール送信(トリガーを作るときに引数を指定できなかったため周りくどくになってしまった。)
const sendMail = () => {
  //スプレッドシートを指定
  const sheet = getSheet();
  // スプレッドシートのシートを全て取得する。
  const sheets = sheet.getSheets();
  // シートを一枚づつ確認する。
  for (let i = 0; i < sheets.length; i++) {
    // シートの最終行を取得する。
    let lastRow = sheets[i].getLastRow();
    // シートの日付を取得する。
    let dates = sheets[i].getRange(`D3:D${lastRow}`).getValues();
    // 今日の日付と一致する行を取得する。
    const row = findeTargetRow(dates, new Date());
    // 出勤予定時間を取得する。
    const attendanceTime = time(sheets[i].getRange(`E${row}`).getValue());
    // 退勤予定時間を取得する。
    const leavingTime = time(sheets[i].getRange(`F${row}`).getValue());
    // シートの名前を取得する。
    const sheetName = sheets[i].getSheetName();
    if (attendanceTime == time(new Date)) {
      // member.jsよりメンバー情報を呼び出し、objectに入れて回す。
      members().forEach((object) => {
        if (object.name == sheetName) {
          let address = object.mail;
          // メールを送る
          MailApp.sendEmail(
            address,
            "打刻について",
            "出勤時間です。打刻を忘ていませんか？"
          );
          console.log(object.mail);
        }
      });
    } else if (leavingTime == time(new Date)) {
      members().forEach((object) => {
        if (object.name == sheetName) {
          let address = object.mail;
          MailApp.sendEmail(
            address,
            "打刻について",
            "退勤時間です。打刻を忘ていませんか？"
          );
        }
      });
    }
  }
}

// メール送信を行うトリガーを作る。
const setTrigger = () => {
  const sheet = getSheet();
  const sheets = sheet.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    let lastRow = sheets[i].getLastRow();
    let dates = sheets[i].getRange(`D3:D${lastRow}`).getValues();
    const row = findeTargetRow(dates, new Date());
    const attendanceTime = sheets[i].getRange(`E${row}`).getValue();
    const leavingTime = sheets[i].getRange(`F${row}`).getValue();
    const sheetName = sheets[i].getSheetName();
    console.log(sheetName);

    if (!(attendanceTime === "")) {
      const dataSplid = (String(time(attendanceTime))).split(':');
      let setTime = new Date();
      setTime.setHours(dataSplid[0]);
      setTime.setMinutes(dataSplid[1]);
      ScriptApp.newTrigger('sendMail').timeBased().at(setTime).create();
      console.log("出勤");
      console.log(setTime)
    }

    if (!(leavingTime === "")) {
      const dataSplid = (String(time(leavingTime))).split(':');
      let setTime = new Date();
      setTime.setHours(dataSplid[0]);
      setTime.setMinutes(dataSplid[1]);
      ScriptApp.newTrigger('sendMail').timeBased().at(setTime).create();
      console.log("退勤");
    }

  }

  // 本日分のdayTriggerを削除する。
  const triggers = ScriptApp.getProjectTriggers();
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() == "dayTrigger") {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  // 明日分のdayTriggerを作る。
  let setTime = new Date();
  setTime.setDate(setTime.getDate() + 1)
  setTime.setHours(00);
  setTime.setMinutes(00);
  ScriptApp.newTrigger('dayTrigger').timeBased().at(setTime).create();
}

// 日付が変わったときにsetTeiger()を呼び出す。
const dayTrigger = () => {
  const triggers = ScriptApp.getProjectTriggers();
  // 使ったtriggerを消す。
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() == "sendMail") {
      ScriptApp.deleteTrigger(trigger);
    }
  }
  setTrigger();
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
  console.log(row);

  // 引数と一致する列を取得
  const column = findeTargetColumn(kinds);
  // セル取得
  const cell = sheetName.getRange(`${column + row}`);
  // 打刻
  const current = time(new Date);
  cell.setValue(current);
  return Browser.msgBox("yayay")
}


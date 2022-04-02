function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

//スプレッドシート名取得
const getSheet = () => {
  return SpreadsheetApp.openById('1-JzVdJLXQZAP9IvkTt5zDGArDDAircSc2AcdsX4XJlY');
}

let today = new Date();

// console.log(today);

// スプレッドのシート名取得
const getSheetName = (sheet) => {
  const sheetName = sheet.getSheetByName("福當 楓茉");
  return sheetName
}
// const aa = getSheet();
// console.log(aa);
//書き込む行の検索
const findeTargetRow = (dates, today) => {
  const index = dates.findIndex((date) => {
    return date[date.length - 1].toLocaleString() === today.toLocaleString()
  })
  return index + 7
}

// creat();

const test = () => {
  //スプレッドシートを指定
  const sheet = getSheet();
  //スプレッドシートのシート名
  const sheetName = getSheetName(sheet);
  //スプレッドシートの日付取得
  const dates = sheetName.getRange('A7:A37').getValues();

  //現在の日付と合致する行を取得
  const row = findeTargetRow(dates, new Date(new Date().setHours(0, 0, 0, 0)));

  // 出勤時間のセル取得
  const attendanceTimeCell = sheetName.getRange(`C${row}`)

  //記録
  attendanceTimeCell.setValue("test")

}

test();

// ============================================================
// 16Bussy Invitational — Google Sheets Roster Backend
// ============================================================
// PASTE THIS ENTIRE FILE into Google Apps Script (Extensions > Apps Script)
// Then deploy as a web app (see README for step-by-step instructions)
// ============================================================

const SHEET_NAME = "Roster";
const HEADERS = ["id", "name", "handicap", "ghin", "airport", "arrival", "departure", "carPlans"];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const participants = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    // Parse handicap back to number
    if (obj.handicap !== "" && obj.handicap !== null) {
      obj.handicap = Number(obj.handicap);
      if (isNaN(obj.handicap)) obj.handicap = null;
    } else {
      obj.handicap = null;
    }
    return obj;
  }).filter(p => p.name); // skip empty rows

  return ContentService
    .createTextOutput(JSON.stringify({ participants }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = getOrCreateSheet();
  const body = JSON.parse(e.postData.contents);
  const { action, participant } = body;

  if (action === "add") {
    const row = HEADERS.map(h => participant[h] || "");
    sheet.appendRow(row);
  }

  if (action === "update") {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(participant.id)) {
        const row = HEADERS.map(h => participant[h] || "");
        sheet.getRange(i + 1, 1, 1, HEADERS.length).setValues([row]);
        break;
      }
    }
  }

  if (action === "delete") {
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][0]) === String(participant.id)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 靈感收藏盒 - Google Apps Script 後端處理程序
 *
 * 部署指引：
 * 1. 在 Google 試算表內點擊「擴充功能」 > 「Apps Script」
 * 2. 貼入以下完整程式碼並儲存
 * 3. 點擊「部署」 > 「新增部署」 > 「網頁應用程式」
 * 4. 誰可以存取設定為「任何人 (Anyone)」
 *
 * 安全說明：
 * 程式內含 SECRET_TOKEN 驗證，請確保與 .env.local 一致
 */

var LIBRARY_V2_SHEET_NAME = "library_v2";
var PROMPT_LIBRARY_SHEET_NAME = "prompt_library";
// 若已知舊版工作表名稱，請直接填在這裡，例如 "Sheet1"。
// 若留空，程式會自動選第一張非 library_v2 且非 prompt_library 的工作表作為舊資料流落點。
var LEGACY_SHEET_NAME = "";
var LIBRARY_V2_HEADERS = [
  "id",
  "input_type",
  "raw_input",
  "source_title",
  "source_url",
  "created_at",
  "source_platform",
  "content_type",
  "summary",
  "key_points",
  "tags",
  "use_case",
  "topic_category",
  "confidence_level",
  "parse_status"
];
var PROMPT_LIBRARY_HEADERS = [
  "id",
  "prompt_category",
  "prompt_text",
  "created_at",
  "updated_at",
  "source_type",
  "prompt_title"
];

function getOrCreateSheetByName(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  return sheet;
}

function getLegacySheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (LEGACY_SHEET_NAME) {
    var namedSheet = spreadsheet.getSheetByName(LEGACY_SHEET_NAME);
    if (namedSheet) {
      return namedSheet;
    }
  }

  var sheets = spreadsheet.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== LIBRARY_V2_SHEET_NAME && sheets[i].getName() !== PROMPT_LIBRARY_SHEET_NAME) {
      return sheets[i];
    }
  }

  return spreadsheet.getActiveSheet();
}

function ensureLibraryV2Headers(sheet) {
  var currentHeaders = sheet
    .getRange(1, 1, 1, LIBRARY_V2_HEADERS.length)
    .getValues()[0];
  var shouldRewriteHeaders = false;

  for (var i = 0; i < LIBRARY_V2_HEADERS.length; i++) {
    if (currentHeaders[i] !== LIBRARY_V2_HEADERS[i]) {
      shouldRewriteHeaders = true;
      break;
    }
  }

  if (shouldRewriteHeaders) {
    sheet.getRange(1, 1, 1, LIBRARY_V2_HEADERS.length).setValues([LIBRARY_V2_HEADERS]);
  }
}

function ensurePromptLibraryHeaders(sheet) {
  var currentHeaders = sheet
    .getRange(1, 1, 1, PROMPT_LIBRARY_HEADERS.length)
    .getValues()[0];
  var shouldRewriteHeaders = false;

  for (var i = 0; i < PROMPT_LIBRARY_HEADERS.length; i++) {
    if (currentHeaders[i] !== PROMPT_LIBRARY_HEADERS[i]) {
      shouldRewriteHeaders = true;
      break;
    }
  }

  if (shouldRewriteHeaders) {
    sheet.getRange(1, 1, 1, PROMPT_LIBRARY_HEADERS.length).setValues([PROMPT_LIBRARY_HEADERS]);
  }
}

function doGet(e) {
  // 安全驗證碼：需與您的 .env.local 中的 GOOGLE_GAS_SECRET 一致
  var SECRET_TOKEN = "KEEP_EVERY_SECRET_123"; 
  
  // 安全性檢查
  if (e.parameter.secret !== SECRET_TOKEN) {
    return ContentService.createTextOutput("Unauthorized").setStatusCode(401);
  }

  // 判斷是否要求指令寶庫 prompt_library
  if (e.parameter.sheet_name === PROMPT_LIBRARY_SHEET_NAME) {
    var promptLibrarySheet = getOrCreateSheetByName(PROMPT_LIBRARY_SHEET_NAME);
    ensurePromptLibraryHeaders(promptLibrarySheet);
    var data = promptLibrarySheet.getDataRange().getValues();
    
    // 若分頁為空 (僅標題或全空)
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var jsonData = [];
    for (var i = 1; i < data.length; i++) {
      jsonData.push({
        id: data[i][0] || "",
        prompt_category: data[i][1] || "",
        prompt_text: data[i][2] || "",
        created_at: data[i][3] || "",
        updated_at: data[i][4] || "",
        source_type: data[i][5] || "",
        prompt_title: data[i][6] || ""
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 判斷是否要求新版 library_v2
  if (e.parameter.sheet_name === LIBRARY_V2_SHEET_NAME) {
    var libraryV2Sheet = getOrCreateSheetByName(LIBRARY_V2_SHEET_NAME);
    ensureLibraryV2Headers(libraryV2Sheet);
    var data = libraryV2Sheet.getDataRange().getValues();
    
    // 若分頁為空 (僅標題或全空)
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var jsonData = [];
    for (var i = 1; i < data.length; i++) {
      jsonData.push({
        id: data[i][0] || "",
        input_type: data[i][1] || "",
        raw_input: data[i][2] || "",
        source_title: data[i][3] || "",
        source_url: data[i][4] || "",
        created_at: data[i][5] || "",
        source_platform: data[i][6] || "",
        content_type: data[i][7] || "",
        summary: data[i][8] || "",
        key_points: data[i][9] || "",
        tags: data[i][10] || "",
        use_case: data[i][11] || "",
        topic_category: data[i][12] || "",
        confidence_level: data[i][13] || "",
        parse_status: data[i][14] || ""
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify(jsonData))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 舊版預設分支
  var sheet = getLegacySheet();
  var data = sheet.getDataRange().getValues();
  
  // 若分頁為空 (僅標題或全空)
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 將資料轉為物件陣列 (假設第一列是 Header)
  var jsonData = [];
  for (var i = 1; i < data.length; i++) {
    jsonData.push({
      time: data[i][0] || "",
      title: data[i][1] || "",
      tags: data[i][2] || "",
      source: data[i][3] || ""
    });
  }

  return ContentService.createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  // 安全驗證碼：需與您的 .env.local 中的 GOOGLE_GAS_SECRET 一致
  var SECRET_TOKEN = "KEEP_EVERY_SECRET_123"; 
  
  var data = JSON.parse(e.postData.contents);
  
  // 安全性檢查
  if (data.token !== SECRET_TOKEN) {
    return ContentService.createTextOutput("Unauthorized").setStatusCode(401);
  }

  // 支援整張工作表批次覆寫 (action = overwrite_sheet)
  if (data.action === "overwrite_sheet") {
    if (data.sheet_name === LIBRARY_V2_SHEET_NAME) {
      var libraryV2Sheet = getOrCreateSheetByName(LIBRARY_V2_SHEET_NAME);
      libraryV2Sheet.clearContents();
      ensureLibraryV2Headers(libraryV2Sheet);
      
      if (data.rows && data.rows.length > 0) {
        var range = libraryV2Sheet.getRange(2, 1, data.rows.length, LIBRARY_V2_HEADERS.length);
        range.setValues(data.rows);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 
        "result": "success", 
        "action": "overwrite_sheet",
        "count": data.rows ? data.rows.length : 0 
      })).setMimeType(ContentService.MimeType.JSON);
    } else if (data.sheet_name === PROMPT_LIBRARY_SHEET_NAME) {
      var promptLibrarySheet = getOrCreateSheetByName(PROMPT_LIBRARY_SHEET_NAME);
      promptLibrarySheet.clearContents();
      ensurePromptLibraryHeaders(promptLibrarySheet);
      
      if (data.rows && data.rows.length > 0) {
        var range = promptLibrarySheet.getRange(2, 1, data.rows.length, PROMPT_LIBRARY_HEADERS.length);
        range.setValues(data.rows);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 
        "result": "success", 
        "action": "overwrite_sheet",
        "count": data.rows ? data.rows.length : 0 
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Unsupported sheet for overwrite" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 支援更新單一 Row 資料 (action = update_row)
  if (data.action === "update_row") {
    if (data.sheet_name === LIBRARY_V2_SHEET_NAME) {
      var libraryV2Sheet = getOrCreateSheetByName(LIBRARY_V2_SHEET_NAME);
      ensureLibraryV2Headers(libraryV2Sheet);
      var sheetData = libraryV2Sheet.getDataRange().getValues();
      var targetId = data.id;
      var foundRowIndex = -1;

      for (var i = 1; i < sheetData.length; i++) {
        if (String(sheetData[i][0]) === String(targetId)) {
          foundRowIndex = i + 1; // Google Sheets 是 1-indexed 且加上標題行
          break;
        }
      }

      if (foundRowIndex !== -1) {
        var range = libraryV2Sheet.getRange(foundRowIndex, 1, 1, LIBRARY_V2_HEADERS.length);
        range.setValues([[
          data.id || "",
          data.input_type || "",
          data.raw_input || "",
          data.source_title || "",
          data.source_url || "",
          data.created_at || "",
          data.source_platform || "",
          data.content_type || "",
          data.summary || "",
          data.key_points || "",
          data.tags || "",
          data.use_case || "",
          data.topic_category || "",
          data.confidence_level || "",
          data.parse_status || ""
        ]]);
        return ContentService.createTextOutput(JSON.stringify({ "result": "success", "action": "update_row" }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "ID not found: " + targetId }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else if (data.sheet_name === PROMPT_LIBRARY_SHEET_NAME) {
      var promptLibrarySheet = getOrCreateSheetByName(PROMPT_LIBRARY_SHEET_NAME);
      ensurePromptLibraryHeaders(promptLibrarySheet);
      var sheetData = promptLibrarySheet.getDataRange().getValues();
      var targetId = data.id;
      var foundRowIndex = -1;

      for (var i = 1; i < sheetData.length; i++) {
        if (String(sheetData[i][0]) === String(targetId)) {
          foundRowIndex = i + 1;
          break;
        }
      }

      if (foundRowIndex !== -1) {
        var range = promptLibrarySheet.getRange(foundRowIndex, 1, 1, PROMPT_LIBRARY_HEADERS.length);
        range.setValues([[
          data.id || "",
          data.prompt_category || "",
          data.prompt_text || "",
          data.created_at || "",
          data.updated_at || "",
          data.source_type || "",
          data.prompt_title || ""
        ]]);
        return ContentService.createTextOutput(JSON.stringify({ "result": "success", "action": "update_row" }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "ID not found: " + targetId }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Unsupported sheet for update" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 支援刪除單一 Row 資料 (action = delete_row)
  if (data.action === "delete_row") {
    if (data.sheet_name === LIBRARY_V2_SHEET_NAME || data.sheet_name === PROMPT_LIBRARY_SHEET_NAME) {
      var targetSheet = getOrCreateSheetByName(data.sheet_name);
      var sheetData = targetSheet.getDataRange().getValues();
      var targetId = data.id;
      var foundRowIndex = -1;

      for (var i = 1; i < sheetData.length; i++) {
        if (String(sheetData[i][0]) === String(targetId)) {
          foundRowIndex = i + 1; // 1-indexed + header row
          break;
        }
      }

      if (foundRowIndex !== -1) {
        targetSheet.deleteRow(foundRowIndex);
        return ContentService.createTextOutput(JSON.stringify({ "result": "success", "action": "delete_row" }))
          .setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "ID not found: " + targetId }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": "Unsupported sheet for delete" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (data.sheet_name === LIBRARY_V2_SHEET_NAME) {
    var libraryV2Sheet = getOrCreateSheetByName(LIBRARY_V2_SHEET_NAME);
    ensureLibraryV2Headers(libraryV2Sheet);

    libraryV2Sheet.appendRow([
      data.id || "",
      data.input_type || "",
      data.raw_input || "",
      data.source_title || "",
      data.source_url || "",
      data.created_at || "",
      data.source_platform || "",
      data.content_type || "",
      data.summary || "",
      data.key_points || "",
      data.tags || "",
      data.use_case || "",
      data.topic_category || "",
      data.confidence_level || "",
      data.parse_status || ""
    ]);
  } else if (data.sheet_name === PROMPT_LIBRARY_SHEET_NAME) {
    var promptLibrarySheet = getOrCreateSheetByName(PROMPT_LIBRARY_SHEET_NAME);
    ensurePromptLibraryHeaders(promptLibrarySheet);

    promptLibrarySheet.appendRow([
      data.id || "",
      data.prompt_category || "",
      data.prompt_text || "",
      data.created_at || "",
      data.updated_at || "",
      data.source_type || "",
      data.prompt_title || ""
    ]);
  } else {
    // 舊資料流固定寫回舊工作表，避免受到目前 active sheet 影響
    var sheet = getLegacySheet();

    // 按照順序寫入資料：時間、標題、標籤、連結
    sheet.appendRow([
      data.time,
      data.title,
      data.tags,
      data.source
    ]);
  }
  
  // 回傳成功訊息
  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

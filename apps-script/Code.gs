// SISTEM TUGASAN PDPR SKTD — BACKEND LENGKAP v3
// Gantikan Code.gs asal. Jangan tambah doGet/doPost pendua.
var SPREADSHEET_ID = '16kLuWnLZECEtTKD50XTbXVAHIKcgwHvzesC-vuF3DV0';
var DRIVE_FOLDER_ID = '13YwZnpAOfPNUKVO04Gdu4Tt1Q7Dedszh';

function pdprJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
function pdprDate_(value) {
  return value instanceof Date ? Utilities.formatDate(value, 'Asia/Kuala_Lumpur', 'yyyy-MM-dd') : String(value || '');
}
function pdprReadTasks_(ss) {
  var sheet = ss.getSheetByName('Tugasan');
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow()-1, 13).getValues().map(function(row) {
    return {id:String(row[0]||''),tarikh:pdprDate_(row[1]),guru:String(row[2]||''),kelas:String(row[3]||''),subjek:String(row[4]||''),tajuk:String(row[5]||''),t1Ayat:String(row[6]||''),t1Video:String(row[7]||''),t1Kuiz:String(row[8]||''),t2Ayat:String(row[9]||''),t2Video:String(row[10]||''),t2Kuiz:String(row[11]||''),timestamp:row[12] instanceof Date ? row[12].toISOString() : String(row[12]||'')};
  }).filter(function(t) { return t.id; });
}
function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var tasks = pdprReadTasks_(ss);
    // Muat semula tugasan tanpa menunggu penerbitan CSV dan tanpa mengambil data murid.
    if (e && e.parameter && e.parameter.action === 'listTasks') return pdprJson_({status:'success',tasks:tasks});
    var sheetSub = ss.getSheetByName('Penghantaran');
    var submissions = [];
    if (sheetSub && sheetSub.getLastRow()>1) {
      submissions = sheetSub.getRange(2,1,sheetSub.getLastRow()-1,9).getValues().map(function(row) {
        return {id:String(row[0]||''),taskId:String(row[1]||''),tarikh:pdprDate_(row[2]),kelas:String(row[3]||''),namaMurid:String(row[4]||''),subjek:String(row[5]||''),status:String(row[6]||''),gambarUrl:String(row[7]||''),timestamp:row[8] instanceof Date ? row[8].toISOString() : String(row[8]||'')};
      });
    }
    return pdprJson_({status:'success',tasks:tasks,submissions:submissions});
  } catch(err) { return pdprJson_({status:'error',message:err.toString()}); }
}
function doPost(e) {
  try {
    var contents=e && e.postData ? e.postData.contents : null;
    if (!contents) throw new Error('Tiada data POST ditemui.');
    var data=JSON.parse(contents);
    if (data.action==='updateTask' || data.action==='deleteTask') return pdprHandleTaskEdit(e);
    var ss=SpreadsheetApp.openById(SPREADSHEET_ID);
    if (data.action==='saveTask') {
      var lock=LockService.getScriptLock();lock.waitLock(20000);
      try {
        var sheetTugasan=ss.getSheetByName('Tugasan') || ss.insertSheet('Tugasan');
        if(sheetTugasan.getLastRow()===0) sheetTugasan.appendRow(['ID','Tarikh','Guru','Kelas','Subjek','Tajuk','T1_Ayat','T1_Video','T1_Kuiz','T2_Ayat','T2_Video','T2_Kuiz','Timestamp']);
        var id=data.id || ('task-'+Date.now());
        // Elak baris berulang apabila penghantaran yang sama dicuba semula.
        if (sheetTugasan.getLastRow()>1) {
          var ids=sheetTugasan.getRange(2,1,sheetTugasan.getLastRow()-1,1).getValues();
          if(ids.some(function(row){return String(row[0])===id;})) throw new Error('ID tugasan sudah wujud. Muat semula untuk menyemaknya.');
        }
        sheetTugasan.appendRow([id,data.tarikh||'',data.guru||'',data.kelas||'',data.subjek||'',data.tajuk||'',data.t1Ayat||'',data.t1Video||'',data.t1Kuiz||'',data.t2Ayat||'',data.t2Video||'',data.t2Kuiz||'',new Date().toISOString()]);
        SpreadsheetApp.flush();
        return pdprJson_({ok:true,status:'success',action:'saveTask',id:id,message:'Tugasan berjaya disimpan.'});
      } finally {lock.releaseLock();}
    }
    if (data.action==='submitStudent') {
      var sheetSub=ss.getSheetByName('Penghantaran') || ss.insertSheet('Penghantaran');
      if(sheetSub.getLastRow()===0) sheetSub.appendRow(['ID','TaskId','Tarikh','Kelas','NamaMurid','Subjek','Status','GambarUrl','Timestamp']);
      var imgUrl='';
      if(data.gambarBase64) {
        try {
          var folder=DriveApp.getFolderById(DRIVE_FOLDER_ID);
          var rawBase64=data.gambarBase64;
          if(rawBase64.indexOf(',')!==-1) rawBase64=rawBase64.split(',')[1];
          var bytes=Utilities.base64Decode(rawBase64);
          var mimeType=data.mimeType||'image/jpeg';
          var fileName='Bukti_'+(data.namaMurid||'Murid').replace(/\s+/g,'_')+'_'+Date.now()+'.jpg';
          var blob=Utilities.newBlob(bytes,mimeType,fileName);
          var file=folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
          imgUrl='https://lh3.googleusercontent.com/d/'+file.getId();
        } catch(driveErr) {Logger.log('Ralat muat naik gambar ke Drive: '+driveErr.toString());}
      }
      sheetSub.appendRow(['sub-'+Date.now(),data.taskId||'',data.tarikh||'',data.kelas||'',data.namaMurid||'',data.subjek||'','SELESAI',imgUrl,new Date().toISOString()]);
      return pdprJson_({status:'success',message:'Penghantaran murid berjaya disimpan.',imgUrl:imgUrl});
    }
    return pdprJson_({status:'error',ok:false,message:'Tindakan (action) tidak dikenali.',error:'Tindakan (action) tidak dikenali.'});
  } catch(err) {return pdprJson_({status:'error',ok:false,message:err.toString(),error:err.message});}
}

function pdprHandleTaskEdit(e) {
  var data;
  try { data = JSON.parse(e.postData.contents); } catch (_) { return null; }
  if (['updateTask', 'deleteTask'].indexOf(data.action) < 0) return null;
  function result(body) { return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON); }
  var lock = LockService.getScriptLock();
  try {
    var props = PropertiesService.getScriptProperties();
    var password = props.getProperty('PDPR_TEACHER_PASSWORD') || 'JBA1077';
    if (typeof data.password !== 'string' || data.password !== password) throw new Error('Kata laluan guru tidak sah.');
    if (typeof data.id !== 'string' || !data.id.trim()) throw new Error('ID tugasan diperlukan.');
    lock.waitLock(20000);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Tugasan');
    if (!sheet) throw new Error('Sheet Tugasan tidak ditemui.');
    var range = sheet.getDataRange();
    var values = range.getValues();
    var headers = values[0].map(function(v) { return String(v).toLowerCase().replace(/[^a-z0-9]/g, ''); });
    var idColumn = headers.indexOf('id');
    if (idColumn < 0) throw new Error('Kolum ID tidak ditemui.');
    var matches = [];
    for (var r = 1; r < values.length; r++) if (String(values[r][idColumn]) === data.id) matches.push(r + 1);
    if (matches.length !== 1) throw new Error(matches.length ? 'ID tugasan berulang. Pemadaman/kemas kini dibatalkan.' : 'Tugasan tidak ditemui. Muat semula senarai.');
    var row = matches[0];
    if (data.action === 'deleteTask') {
      sheet.deleteRow(row);
    } else {
      var task = data.task;
      if (!task || typeof task !== 'object') throw new Error('Butiran tugasan diperlukan.');
      var keys = ['tarikh','guru','kelas','subjek','tajuk','t1Ayat','t1Video','t1Kuiz','t2Ayat','t2Video','t2Kuiz'];
      var columns = keys.map(function(key) { return headers.indexOf(key.toLowerCase()); });
      if (columns.some(function(c) { return c < 0; })) throw new Error('Struktur kolum tugasan tidak sepadan. Semak kod Apps Script asal.');
      keys.forEach(function(key, i) {
        if (typeof task[key] !== 'string' || task[key].length > 45000) throw new Error('Nilai tidak sah: ' + key);
        if (i < 5 && !task[key].trim()) throw new Error('Medan wajib: ' + key);
        if ((/Video|Kuiz/).test(key) && task[key] && !/^https?:\/\//i.test(task[key])) throw new Error('Pautan mesti bermula https:// atau http://.');
      });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(task.tarikh)) throw new Error('Tarikh tidak sah.');
      // Preserve formulas and all unrelated columns. Escape formula-like input.
      var rowRange = sheet.getRange(row, 1, 1, headers.length);
      var rowValues = rowRange.getValues()[0];
      var formulas = rowRange.getFormulas()[0];
      for (var c = 0; c < rowValues.length; c++) if (formulas[c]) rowValues[c] = formulas[c];
      keys.forEach(function(key, i) { var text = task[key].trim(); rowValues[columns[i]] = /^[=+@-]/.test(text) ? "'" + text : text; });
      var timestampColumn = headers.indexOf('timestamp');
      if (timestampColumn >= 0) rowValues[timestampColumn] = new Date();
      rowRange.setValues([rowValues]);
    }
    SpreadsheetApp.flush();
    return result({ok:true, status:'success', action:data.action, id:data.id});
  } catch (err) {
    return result({ok:false, error:err.message || 'Operasi gagal.'});
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

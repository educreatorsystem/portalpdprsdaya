/**
 * PDPR SK TAMAN DAYA — backend serasi dengan PDPR_SKTD_PWA_GitHub.zip
 * Gantikan keseluruhan Code.gs. Jangan tambah doGet/doPost pendua.
 * Jalankan semakTetapan() sekali, kemudian kemas kini deployment Web app.
 * Frontend lama menggunakan no-cors: semak hasil simpan melalui CSV/Sheet.
 * Kod login JBA1077 dalam frontend bukan pengesahan identiti di pelayan.
 */
var PDPR = {
  spreadsheetId: '16kLuWnLZECEtTKD50XTbXVAHIKcgwHvzesC-vuF3DV0',
  folderId: '13YwZnpAOfPNUKVO04Gdu4Tt1Q7Dedszh',
  tasksGid: 925149612,
  submissionsGid: 1661504502,
  studentsGid: 288612582,
  maxImageBytes: 5 * 1024 * 1024
};
var TASK_HEADERS = ['ID','Tarikh','Guru','Kelas','Subjek','Tajuk','T1_Ayat','T1_Video','T1_Kuiz','T2_Ayat','T2_Video','T2_Kuiz','Timestamp'];
var SUB_HEADERS = ['ID','TaskId','Tarikh','Kelas','NamaMurid','Subjek','Status','GambarUrl','Timestamp'];

function doGet() {
  return json_({status:'success', message:'Backend PDPR SK Taman Daya aktif.', version:'4.1'});
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Tiada data POST diterima.');
    if (e.postData.contents.length > 7500000) throw new Error('Data terlalu besar. Had gambar ialah 5 MB.');
    var data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Format data tidak sah.');
    if (['save_tugasan','delete_tugasan','submit_murid'].indexOf(data.action) < 0) throw new Error('Tindakan tidak dikenali.');
    lock.waitLock(30000);
    var ss = SpreadsheetApp.openById(PDPR.spreadsheetId);
    var result;
    if (data.action === 'save_tugasan') result = saveTask_(ss, data);
    if (data.action === 'delete_tugasan') result = deleteTask_(ss, data);
    if (data.action === 'submit_murid') result = submitStudent_(ss, data);
    SpreadsheetApp.flush();
    return json_(result);
  } catch (error) {
    console.error(error.message);
    return json_({status:'error', message:error.message});
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// Semakan konfigurasi sahaja: tidak mengubah atau memadam rekod.
function semakTetapan() {
  var ss = SpreadsheetApp.openById(PDPR.spreadsheetId);
  var task = sheet_(ss, PDPR.tasksGid);
  var sub = sheet_(ss, PDPR.submissionsGid);
  schema_(task, TASK_HEADERS);
  schema_(sub, SUB_HEADERS);
  roster_(ss);
  var folder = DriveApp.getFolderById(PDPR.folderId);
  console.log('Tetapan OK. Sheet: ' + ss.getName() + '; Tugasan: ' + task.getName() + '; Penghantaran: ' + sub.getName() + '; Folder: ' + folder.getName());
}

function saveTask_(ss, d) {
  var sheet = sheet_(ss, PDPR.tasksGid);
  schema_(sheet, TASK_HEADERS);
  var id = text_(d.id) || 'TUG-' + Utilities.getUuid();
  var kelas = required_(d.kelas, 'Kelas').toUpperCase();
  var roster = roster_(ss);
  if (!roster.some(function(r){return r.kelas === kelas;})) throw new Error('Kelas tidak ditemui dalam senarai murid: ' + kelas);
  var row = [id, date_(d.tarikh), required_(d.namaGuru,'Nama guru'), kelas,
    required_(d.subjek,'Subjek'), required_(d.tajuk,'Tajuk'), required_(d.t1Ayat,'Arahan tugasan 1'),
    url_(d.t1Video), url_(d.t1Kuiz), text_(d.t2Ayat), url_(d.t2Video), url_(d.t2Kuiz), timestamp_()];
  var rows = sheet.getDataRange().getDisplayValues();
  var index = findId_(rows, id);
  var editing = d.isEdit === true || d.isEdit === 'true';
  if (editing && index < 0) throw new Error('Tugasan untuk diedit tidak ditemui. Muat semula data.');
  if (!editing && index >= 0) return {status:'success', id:id, duplicate:true};
  var target = index >= 0 ? index + 1 : sheet.getLastRow() + 1;
  sheet.getRange(target,1,1,row.length).setValues([row.map(cell_)]);
  return {status:'success', id:id, message:editing?'Tugasan dikemas kini.':'Tugasan disimpan.'};
}

function deleteTask_(ss, d) {
  var id = required_(d.id,'ID tugasan');
  var sheet = sheet_(ss, PDPR.tasksGid);
  schema_(sheet, TASK_HEADERS);
  var index = findId_(sheet.getDataRange().getDisplayValues(), id);
  if (index < 0) return {status:'deleted', id:id, alreadyAbsent:true};
  sheet.deleteRow(index + 1);
  // Rekod penghantaran murid dan fail Drive tidak dipadam secara automatik.
  return {status:'deleted', id:id};
}

function submitStudent_(ss, d) {
  var taskSheet = sheet_(ss, PDPR.tasksGid);
  var sheet = sheet_(ss, PDPR.submissionsGid);
  schema_(taskSheet, TASK_HEADERS); schema_(sheet, SUB_HEADERS);
  var nama = required_(d.namaMurid,'Nama murid').toUpperCase();
  var kelas = required_(d.kelas,'Kelas').toUpperCase();
  if (!roster_(ss).some(function(r){return r.nama === nama && r.kelas === kelas;})) throw new Error('Nama murid tidak sepadan dengan kelas dalam senarai murid.');
  var tasks = taskSheet.getDataRange().getDisplayValues().slice(1);
  // PWA sedia ada menghantar tarikh, kelas, subjek dan tajuk; TaskId boleh digunakan oleh versi baharu.
  var matches = tasks.filter(function(r){
    if (text_(d.taskId)) return r[0] === text_(d.taskId) && text_(r[3]).toUpperCase() === kelas;
    return date_(r[1]) === date_(d.tarikh) && text_(r[3]).toUpperCase() === kelas &&
      text_(r[4]).toUpperCase() === text_(d.subjek).toUpperCase() && text_(r[5]) === text_(d.tajuk);
  });
  if (matches.length !== 1) throw new Error('Tugasan tidak ditemui atau terdapat tugasan serupa. Muat semula data dan semak ID tugasan.');
  var task = matches[0];
  var rows = sheet.getDataRange().getDisplayValues();
  for (var i=1;i<rows.length;i++) {
    if (rows[i][1] === task[0] && text_(rows[i][3]).toUpperCase() === kelas && text_(rows[i][4]).toUpperCase() === nama) {
      return {status:'success', id:rows[i][0], duplicate:true, imageUrl:rows[i][7], message:'Penghantaran ini sudah direkodkan.'};
    }
  }
  var file = null;
  try {
    if (text_(d.imageBase64)) file = uploadImage_(d.imageBase64);
    var id = 'SUB-' + Utilities.getUuid();
    var imageUrl = file ? file.getUrl() : '';
    sheet.getRange(sheet.getLastRow()+1,1,1,9).setValues([[
      id, task[0], date_(task[1]), kelas, nama, task[4], 'SELESAI', imageUrl, timestamp_()
    ].map(cell_)]);
    return {status:'success', id:id, taskId:task[0], imageUrl:imageUrl};
  } catch (err) {
    if (file) { try { file.setTrashed(true); } catch (cleanupError) { console.error('Fail gambar belum dipautkan kepada rekod.'); } }
    throw err;
  }
}

function uploadImage_(data) {
  var match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(String(data));
  if (!match) throw new Error('Gambar mesti berformat JPG, PNG atau WebP.');
  var bytes = Utilities.base64Decode(match[2]);
  if (!bytes.length || bytes.length > PDPR.maxImageBytes) throw new Error('Saiz gambar mesti antara 1 bait hingga 5 MB.');
  var ext = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[match[1]];
  var blob = Utilities.newBlob(bytes,match[1],'BUKTI_'+Utilities.getUuid()+'.'+ext);
  // Fail mewarisi akses folder. Tidak menjadikan gambar murid awam secara automatik.
  return DriveApp.getFolderById(PDPR.folderId).createFile(blob);
}

function roster_(ss) {
  var rows = sheet_(ss, PDPR.studentsGid).getDataRange().getDisplayValues();
  var h = rows[0].map(key_);
  var k = h.indexOf('KELAS'), n = h.indexOf('NAMAMURID');
  if (k < 0 || n < 0) throw new Error('Sheet murid memerlukan lajur KELAS dan NAMA MURID.');
  return rows.slice(1).map(function(r){return {kelas:text_(r[k]).toUpperCase(), nama:text_(r[n]).toUpperCase()};});
}
function sheet_(ss, gid) {
  var sheet = ss.getSheets().filter(function(s){return s.getSheetId() === gid;})[0];
  if (!sheet) throw new Error('Tab dengan gid '+gid+' tidak ditemui. Semak ID Google Sheet dalam konfigurasi.');
  return sheet;
}
function schema_(sheet, expected) {
  var actual = sheet.getRange(1,1,1,expected.length).getDisplayValues()[0];
  for (var i=0;i<expected.length;i++) {
    if (key_(actual[i]) !== key_(expected[i])) throw new Error('Susunan lajur '+sheet.getName()+' tidak sepadan. Lajur '+(i+1)+' mestilah '+expected[i]+'. Tiada data ditulis.');
  }
}
function findId_(rows,id) { for(var i=1;i<rows.length;i++){if(rows[i][0]===id)return i;} return -1; }
function text_(v) { return v == null ? '' : String(v).trim(); }
function key_(v) { return text_(v).toUpperCase().replace(/[^A-Z0-9]/g,''); }
function required_(v,label) { v=text_(v); if(!v)throw new Error(label+' wajib diisi.'); if(v.length>40000)throw new Error(label+' terlalu panjang.'); return v; }
function date_(v) {
  var s=text_(v), m=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if(m)s=m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(Date.parse(s)) || new Date(s+'T00:00:00Z').toISOString().slice(0,10)!==s)throw new Error('Tarikh tidak sah. Gunakan YYYY-MM-DD.');
  return s;
}
function url_(v) { v=text_(v); if(v && !/^https?:\/\/\S+$/i.test(v))throw new Error('Pautan mesti bermula dengan https:// atau http://.'); return v; }
function cell_(v) { v=text_(v); return /^[=+@-]/.test(v) ? "'"+v : v; }
function timestamp_() { return Utilities.formatDate(new Date(),'Asia/Kuala_Lumpur',"yyyy-MM-dd'T'HH:mm:ssXXX"); }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }

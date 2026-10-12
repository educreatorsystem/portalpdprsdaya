/** PdPR SKTD — backend v4. Gantikan Code.gs, jangan tambah doGet/doPost pendua.
 * Buka Apps Script melalui Google Sheet asal dan jalankan setup() sekali.
 * Kata laluan tidak diletakkan dalam fail laman GitHub.
 */
var PDPR = {tasks:925149612, submissions:1661504502, students:288612582};
var TASK_FIELDS=['id','tarikh','guru','kelas','subjek','tajuk','t1Ayat','t1Video','t1Kuiz','t2Ayat','t2Video','t2Kuiz','timestamp'];
var SUB_FIELDS=['id','taskId','tarikh','kelas','namaMurid','subjek','status','gambarUrl','timestamp'];
var HEADERS={id:'ID',tarikh:'Tarikh',guru:'Guru',kelas:'Kelas',subjek:'Subjek',tajuk:'Tajuk',t1Ayat:'T1_Ayat',t1Video:'T1_Video',t1Kuiz:'T1_Kuiz',t2Ayat:'T2_Ayat',t2Video:'T2_Video',t2Kuiz:'T2_Kuiz',timestamp:'Timestamp',taskId:'TaskId',namaMurid:'NamaMurid',status:'Status',gambarUrl:'GambarUrl'};
function props_(){return PropertiesService.getScriptProperties();}
function setup(){
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  if(!ss)throw Error('Buka Apps Script melalui Extensions dalam Google Sheet asal, atau tetapkan SPREADSHEET_ID dalam Script Properties.');
  props_().setProperty('SPREADSHEET_ID',ss.getId());
  props_().setProperty('GURU_PASSWORD','JBA1077');
  var tasks=sheet_(PDPR.tasks),subs=sheet_(PDPR.submissions);sheet_(PDPR.students);
  schema_(tasks,TASK_FIELDS);schema_(subs,SUB_FIELDS);
  var info=rows_(tasks,TASK_FIELDS);
  info.forEach(function(r){if(!r.id&&r.tarikh&&r.kelas){r.id='task-'+Utilities.getUuid();write_(tasks,r._row,r,TASK_FIELDS);}});
  if(!props_().getProperty('UPLOAD_FOLDER_ID'))props_().setProperty('UPLOAD_FOLDER_ID',DriveApp.createFolder('Bukti Tugasan PdPR SKTD').getId());
  console.log('Persediaan siap. Deploy web app sebagai Me, akses Anyone.');
}
function sheet_(gid){var id=props_().getProperty('SPREADSHEET_ID');if(!id)throw Error('Jalankan setup() dalam Apps Script dahulu.');var s=SpreadsheetApp.openById(id).getSheets().filter(function(s){return s.getSheetId()===gid;})[0];if(!s)throw Error('Tab dengan gid '+gid+' tidak ditemui. Gunakan Google Sheet asal atau kemas kini PDPR.');return s;}
function key_(v){return String(v||'').trim().toLowerCase().replace(/[\s_]/g,'');}
function norm_(v){return String(v||'').trim().toLowerCase();}
function schema_(s,fields){var cols=Math.max(s.getLastColumn(),1),h=s.getRange(1,1,1,cols).getDisplayValues()[0];if(h.every(function(v){return !v;}))h=[];fields.forEach(function(f){if(h.map(key_).indexOf(key_(HEADERS[f]))<0){h.push(HEADERS[f]);s.getRange(1,h.length).setValue(HEADERS[f]);}});return h;}
function date_(v){if(v instanceof Date)return Utilities.formatDate(v,'Asia/Kuala_Lumpur','yyyy-MM-dd');var s=String(v||'').trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);var m=s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);return m?m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2):s;}
function rows_(s,fields){var all=s.getDataRange().getValues(),h=(all.shift()||[]).map(key_);return all.map(function(row,i){var o={_row:i+2};fields.forEach(function(f){var j=h.indexOf(key_(HEADERS[f])),v=j<0?'':row[j];o[f]=f==='tarikh'?date_(v):(v instanceof Date?v.toISOString():String(v==null?'':v));});return o;}).filter(function(o){return fields.some(function(f){return o[f];});});}
function clean_(o){var c={};Object.keys(o).forEach(function(k){if(k!=='_row')c[k]=o[k];});return c;}
function textCell_(v){var s=String(v==null?'':v);return /^[=+@-]/.test(s)?"'"+s:s;}
function write_(s,row,o,fields){var h=schema_(s,fields).map(key_);fields.forEach(function(f){var col=h.indexOf(key_(HEADERS[f]))+1;s.getRange(row,col).setNumberFormat('@').setValue(textCell_(o[f]));});}
function authorized_(token){return !!token&&CacheService.getScriptCache().get('session:'+token)==='teacher';}
function requireTeacher_(p){if(!authorized_(p.token))throw Error('Sesi tamat atau akses tidak sah. Sila log masuk semula.');}
function response_(data,cb){var json=JSON.stringify(data).replace(/</g,'\\u003c');if(cb&&/^pdpr_[a-zA-Z0-9_]+$/.test(cb))return ContentService.createTextOutput(cb+'('+json+');').setMimeType(ContentService.MimeType.JAVASCRIPT);return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);}
function doGet(e){var p=e.parameter||{},result;try{
 if(p.action==='receipt'){if(!/^[a-zA-Z0-9-]{30,80}$/.test(p.requestId||''))throw Error('ID permintaan tidak sah.');var receipt=CacheService.getScriptCache().get('receipt:'+p.requestId);result=receipt?JSON.parse(receipt):{state:'pending'};}
 else if(p.action==='bootstrap'){result={ok:true,tasks:rows_(sheet_(PDPR.tasks),TASK_FIELDS).map(clean_),submissions:authorized_(p.token)?rows_(sheet_(PDPR.submissions),SUB_FIELDS).map(clean_):[]};}
 else if(p.action==='studentStatus'){result={ok:true,submissions:rows_(sheet_(PDPR.submissions),SUB_FIELDS).filter(function(s){return norm_(s.namaMurid)===norm_(p.namaMurid)&&s.kelas===p.kelas&&s.tarikh===p.tarikh;}).map(function(s){var o=clean_(s);o.gambarUrl='';return o;})};}
 else throw Error('Gunakan backend PdPR v4 dan jalankan setup().');
 }catch(err){result={ok:false,error:err.message};}return response_(result,p.callback);}
function doPost(e){var p={},result,lock=LockService.getScriptLock();try{
 p=JSON.parse(e.postData.contents);if(!/^[a-zA-Z0-9-]{30,80}$/.test(p.requestId||''))throw Error('ID permintaan tidak sah.');
 lock.waitLock(30000);var cache=CacheService.getScriptCache(),prior=cache.get('receipt:'+p.requestId);if(prior)return response_(JSON.parse(prior));
 result=mutate_(p);SpreadsheetApp.flush();
 }catch(err){result={ok:false,error:err.message};}
 finally{if(result&&p.requestId)CacheService.getScriptCache().put('receipt:'+p.requestId,JSON.stringify(result),600);if(lock.hasLock())lock.releaseLock();}
 return response_(result);
}
function mutate_(p){var cache=CacheService.getScriptCache();
 if(p.action==='login'){var expected=props_().getProperty('GURU_PASSWORD');if(!expected)throw Error('Jalankan setup() dahulu.');if(p.password!==expected)throw Error('Kata laluan salah.');var token=Utilities.getUuid()+Utilities.getUuid();cache.put('session:'+token,'teacher',21600);return {ok:true,token:token};}
 if(p.action==='logout'){if(p.token)cache.remove('session:'+p.token);return {ok:true};}
 if(p.action==='submitStudent')return submit_(p);
 requireTeacher_(p);
 var s=sheet_(PDPR.tasks),tasks=rows_(s,TASK_FIELDS),old=tasks.filter(function(t){return t.id===p.id;})[0];
 if(p.action==='deleteTask'){if(old)s.deleteRow(old._row);return {ok:true,id:p.id};}
 if(p.action!=='saveTask'&&p.action!=='editTask')throw Error('Tindakan tidak dikenali.');
 if(p.action==='editTask'&&!old)throw Error('Tugasan tidak ditemui. Muat semula rekod.');
 if(p.action==='saveTask'&&old)return {ok:true,task:clean_(old)};
 var t={};TASK_FIELDS.forEach(function(f){t[f]=String(p[f]||'').trim();});
 ['id','tarikh','guru','kelas','subjek','tajuk','t1Ayat'].forEach(function(k){if(!t[k])throw Error('Medan '+k+' diperlukan.');});
 if(!/^\d{4}-\d{2}-\d{2}$/.test(t.tarikh))throw Error('Tarikh tidak sah.');
 ['t1Video','t1Kuiz','t2Video','t2Kuiz'].forEach(function(k){if(t[k]&&!/^https?:\/\//i.test(t[k]))throw Error('Pautan mestilah http atau https.');});
 TASK_FIELDS.forEach(function(k){if(t[k].length>12000)throw Error('Teks tugasan terlalu panjang.');});
 t.timestamp=new Date().toISOString();write_(s,old?old._row:s.getLastRow()+1,t,TASK_FIELDS);return {ok:true,task:t};
}
function submit_(p){
 var task=rows_(sheet_(PDPR.tasks),TASK_FIELDS).filter(function(t){return t.id===p.taskId;})[0];if(!task)throw Error('Tugasan telah dipadam atau tidak ditemui. Muat semula halaman.');
 var name=String(p.namaMurid||'').trim();if(!name)throw Error('Pilih nama murid.');
 var data=sheet_(PDPR.students).getDataRange().getDisplayValues(),h=data.shift().map(key_),ni=h.findIndex(function(x){return x.indexOf('nama')>=0;}),ki=h.findIndex(function(x){return x.indexOf('kelas')>=0;});
 if(ni<0||ki<0||!data.some(function(r){return norm_(r[ni])===norm_(name)&&norm_(r[ki])===norm_(task.kelas);}))throw Error('Nama murid tidak sepadan dengan kelas tugasan.');
 var s=sheet_(PDPR.submissions),old=rows_(s,SUB_FIELDS).filter(function(r){return norm_(r.namaMurid)===norm_(name)&&(r.taskId===task.id||(r.tarikh===task.tarikh&&r.kelas===task.kelas&&r.subjek===task.subjek));})[0];
 if(old){var existing=clean_(old);existing.gambarUrl='';return {ok:true,duplicate:true,submission:existing};}
 var url='',uploadedFile=null;
 if(p.gambarBase64){var match=String(p.gambarBase64).match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/);if(!match)throw Error('Format gambar tidak sah.');var bytes=Utilities.base64Decode(match[2]);if(bytes.length>3*1024*1024)throw Error('Gambar melebihi 3 MB.');var folder=props_().getProperty('UPLOAD_FOLDER_ID');if(!folder)throw Error('Folder gambar belum disediakan. Jalankan setup().');uploadedFile=DriveApp.getFolderById(folder).createFile(Utilities.newBlob(bytes,match[1],'PDPR-'+Utilities.getUuid()+'.'+match[1].split('/')[1]));url=uploadedFile.getUrl();}
 var o={id:'sub-'+Utilities.getUuid(),taskId:task.id,tarikh:task.tarikh,kelas:task.kelas,namaMurid:name,subjek:task.subjek,status:'SELESAI',gambarUrl:url,timestamp:new Date().toISOString()};
 try{write_(s,s.getLastRow()+1,o,SUB_FIELDS);}catch(err){if(uploadedFile)uploadedFile.setTrashed(true);throw err;}
 var publicResult=clean_(o);publicResult.gambarUrl='';return {ok:true,submission:publicResult};
}

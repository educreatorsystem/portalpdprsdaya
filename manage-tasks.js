// Mutations are applied locally only after an explicit success response from Apps Script.
let taskMutationBusy=false;
let editingTaskId=null;
const taskFields=[['tarikh','Tarikh','date'],['guru','Nama guru','text'],['kelas','Kelas','text'],['subjek','Subjek','text'],['tajuk','Tajuk','text'],['t1Ayat','Arahan tugasan 1','textarea'],['t1Video','Pautan video 1','url'],['t1Kuiz','Pautan kuiz 1','url'],['t2Ayat','Arahan tugasan 2','textarea'],['t2Video','Pautan video 2','url'],['t2Kuiz','Pautan kuiz 2','url']];
const editor=document.createElement('dialog');editor.id='taskEditor';editor.setAttribute('aria-labelledby','taskEditorTitle');
const form=document.createElement('form');
const editorHeader=document.createElement('div');editorHeader.className='task-editor-header';
editorHeader.innerHTML='<span class="manage-eyebrow">KEMAS KINI PEMBELAJARAN</span><h2 id="taskEditorTitle"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i> Edit Tugasan</h2><p>Perbetulkan maklumat dan simpan perubahan anda.</p>';
form.append(editorHeader);
const editorBody=document.createElement('div');editorBody.className='task-editor-body';form.append(editorBody);
let fieldGroup;
for(const [index,[key,label,type]] of taskFields.entries()){
 if(index===0||index===5||index===8){const group=document.createElement('fieldset');group.className='task-field-group';const legend=document.createElement('legend');legend.textContent=index===0?'01 / Maklumat utama':index===5?'02 / Aktiviti pertama':'03 / Aktiviti kedua';group.append(legend);fieldGroup=document.createElement('div');fieldGroup.className='task-fields-grid';group.append(fieldGroup);editorBody.append(group);}
 const wrapper=document.createElement('label');wrapper.className='task-edit-field'+(key==='tajuk'||type==='textarea'?' task-field-wide':'');wrapper.textContent=label;
 const field=document.createElement(type==='textarea'?'textarea':'input');if(type!=='textarea')field.type=type;field.name=key;field.required=['tarikh','guru','kelas','subjek','tajuk'].includes(key);if(type==='textarea')field.rows=4;if(type==='url')field.placeholder='https://';wrapper.append(field);fieldGroup.append(wrapper);
}
const errorBox=document.createElement('p');errorBox.setAttribute('role','status');errorBox.className='task-edit-error';editorBody.append(errorBox);
const actions=document.createElement('div');actions.className='task-edit-actions task-editor-footer';const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Batal';cancel.onclick=closeTaskEditor;const save=document.createElement('button');save.type='submit';save.textContent='Simpan Pembetulan';actions.append(cancel,save);form.append(actions);editor.append(form);document.body.append(editor);
editor.addEventListener('cancel',e=>{e.preventDefault();closeTaskEditor();});
function closeTaskEditor(){if(taskMutationBusy)return;editor.close();editingTaskId=null;}
function syncManagedFilters(){
 for(const [id,key,label] of [['manageFilterKelas','kelas','Semua kelas'],['manageFilterGuru','guru','Semua guru'],['manageFilterSubjek','subjek','Semua subjek']]){
  const select=document.getElementById(id);const selected=select.value;
  const values=[...new Set(taskList.map(t=>String(t[key]||'')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ms',{numeric:true}));
  if(selected&&!values.includes(selected))values.push(selected);
  if(select.dataset.options===JSON.stringify(values))continue;
  select.replaceChildren(new Option(label,''));for(const value of values)select.add(new Option(value,value));select.value=selected;select.dataset.options=JSON.stringify(values);
 }
}
function filterManagedTasks(tasks,filters){
 const q=filters.q.trim().toLocaleLowerCase();
 return tasks.filter(t=>(!filters.kelas||t.kelas===filters.kelas)&&(!filters.guru||t.guru===filters.guru)&&(!filters.subjek||t.subjek===filters.subjek)&&(!filters.tarikh||t.tarikh===filters.tarikh)&&[t.guru,t.kelas,t.subjek,t.tajuk,t.tarikh].join(' ').toLocaleLowerCase().includes(q));
}
function managedText(tag,text,className){const element=document.createElement(tag);element.textContent=text;if(className)element.className=className;return element;}
function renderManagedTasks(){
 const list=document.getElementById('manageTaskList');if(!list)return;list.replaceChildren();if(!isGuruLoggedIn)return;syncManagedFilters();
 const filters={q:document.getElementById('manageTaskSearch').value,kelas:document.getElementById('manageFilterKelas').value,guru:document.getElementById('manageFilterGuru').value,subjek:document.getElementById('manageFilterSubjek').value,tarikh:document.getElementById('manageFilterTarikh').value};
 const rows=filterManagedTasks(taskList,filters).slice().sort((a,b)=>String(b.tarikh).localeCompare(String(a.tarikh)));
 document.getElementById('manageTaskStatus').textContent=rows.length+' daripada '+taskList.length+' tugasan';
 if(!rows.length){const empty=document.createElement('div');empty.className='manage-empty';empty.innerHTML='<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><h4>Tiada tugasan ditemui</h4><p>Cuba kelas atau kata kunci lain, atau reset penapis.</p>';list.append(empty);return;}
 for(const task of rows){
  const card=document.createElement('article');card.className='managed-task';
  const top=document.createElement('div');top.className='managed-card-top';top.append(managedText('span',task.kelas||'Tiada kelas','managed-class'),managedText('span',task.subjek||'Tugasan','managed-subject'));card.append(top);
  card.append(managedText('h4',task.tajuk||'Tanpa tajuk','managed-title'));
  const meta=document.createElement('div');meta.className='managed-meta';for(const [icon,text] of [['fa-user',task.guru],['fa-calendar-days',task.tarikh]]){const line=document.createElement('p');const i=document.createElement('i');i.className='fa-solid '+icon;i.setAttribute('aria-hidden','true');line.append(i,document.createTextNode(text||'—'));meta.append(line);}card.append(meta);
  const buttons=document.createElement('div');buttons.className='task-edit-actions managed-card-actions';for(const [label,icon,callback] of [['Edit tugasan','fa-pen-to-square',()=>openTaskEditor(task.id)],['Padam','fa-trash-can',()=>deleteManagedTask(task.id)]]){const button=document.createElement('button');button.type='button';const i=document.createElement('i');i.className='fa-solid '+icon;i.setAttribute('aria-hidden','true');button.append(i,document.createTextNode(' '+label));button.className=label==='Padam'?'task-delete':'task-edit';button.setAttribute('aria-label',label+': '+task.tajuk);button.disabled=taskMutationBusy||!task.id;button.addEventListener('click',callback);buttons.append(button);}card.append(buttons);list.append(card);
 }
}
function openTaskEditor(id){if(!isGuruLoggedIn||taskMutationBusy)return;const task=taskList.find(t=>t.id===id);if(!task)return;editingTaskId=id;for(const [key] of taskFields)form.elements.namedItem(key).value=task[key]||'';errorBox.textContent='';editor.showModal();}
async function requestTaskMutation(payload){if(!isGuruLoggedIn)throw Error('Sila log masuk guru semula.');if(!navigator.onLine)throw Error('Sambung internet untuk mengubah tugasan.');const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);try{const response=await fetch(APPSCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...payload,password:GURU_PASSWORD}),signal:controller.signal,redirect:'follow'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();if(data.ok!==true||data.action!==payload.action||data.id!==payload.id)throw Error(data.error||data.message||'Apps Script belum menyokong Edit/Padam. Pasang kod tambahan dan deploy versi baharu.');return data;}catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw Error('Pengesahan pelayan tidak diterima. Perubahan mungkin telah diproses. Semak Google Sheet dan muat semula sebelum mencuba lagi.');throw e;}finally{clearTimeout(timeout);}}
function refreshTaskViews(){renderManagedTasks();loadMuridTugasan();renderRumusan();loadSemakanMuridTable();}
form.addEventListener('submit',async event=>{event.preventDefault();if(taskMutationBusy||!editingTaskId)return;const id=editingTaskId;const task=Object.fromEntries(taskFields.map(([key])=>[key,form.elements.namedItem(key).value.trim()]));if(['tarikh','guru','kelas','subjek','tajuk'].some(k=>!task[k])){errorBox.textContent='Lengkapkan medan wajib.';return;}taskMutationBusy=true;save.disabled=true;cancel.disabled=true;renderManagedTasks();errorBox.textContent='Menyimpan pembetulan...';try{await requestTaskMutation({action:'updateTask',id,task});taskLoadSequence++;const index=taskList.findIndex(t=>t.id===id);if(index>=0)taskList[index]={...taskList[index],...task,id};editor.close();editingTaskId=null;showToast('Pembetulan disahkan oleh pelayan.','success');}catch(e){errorBox.textContent=e.message;}finally{taskMutationBusy=false;save.disabled=false;cancel.disabled=false;refreshTaskViews();}});
async function deleteManagedTask(id){if(!isGuruLoggedIn||taskMutationBusy)return;const task=taskList.find(t=>t.id===id);if(!task)return;if(!confirm('Padam tugasan “'+task.tajuk+'” ('+task.kelas+') oleh '+task.guru+'?\nTugasan ini akan dipadam dari Google Sheet. Rekod penghantaran murid terdahulu dikekalkan.'))return;taskMutationBusy=true;renderManagedTasks();try{await requestTaskMutation({action:'deleteTask',id});taskLoadSequence++;taskList=taskList.filter(t=>t.id!==id);showToast('Pemadaman disahkan oleh pelayan.','success');}catch(e){showToast(e.message,'danger');}finally{taskMutationBusy=false;refreshTaskViews();}}
document.getElementById('manageTaskSearch').addEventListener('input',renderManagedTasks);
for(const id of ['manageFilterKelas','manageFilterGuru','manageFilterSubjek','manageFilterTarikh'])document.getElementById(id).addEventListener('change',renderManagedTasks);
document.getElementById('resetManagedFilters').addEventListener('click',()=>{for(const id of ['manageTaskSearch','manageFilterKelas','manageFilterGuru','manageFilterSubjek','manageFilterTarikh'])document.getElementById(id).value='';renderManagedTasks();});
document.getElementById('refreshManagedTasks').addEventListener('click',()=>{if(taskMutationBusy)return;if(!navigator.onLine){showToast('Sambung internet untuk memuatkan data.','warning');return;}document.getElementById('manageTaskStatus').textContent='Memuatkan tugasan...';fetchTugasanCSV();});
renderManagedTasks();

let installPrompt = null;
function requireConnection(){ if(navigator.onLine)return true; alert('Anda sedang luar talian. Sambungkan internet sebelum menghantar, menyimpan atau memadam rekod.'); return false; }
const state=document.getElementById('pwa-state'), install=document.getElementById('pwa-install'), update=document.getElementById('pwa-update');
function showNetwork(){ state.textContent=navigator.onLine?'Dalam talian • Data daripada Google Sheet':'Luar talian • Internet diperlukan untuk rekod dan penghantaran'; }
showNetwork(); window.addEventListener('offline',showNetwork); window.addEventListener('online',()=>{showNetwork();if(typeof fetchExternalData==='function')fetchExternalData();});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;});
install.addEventListener('click',async()=>{if(installPrompt){await installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;}else{alert('Buka pautan GitHub Pages secara terus. Pada iPhone/iPad: buka Safari → Kongsi → Tambah ke Skrin Utama. Pada Android/komputer: buka menu pelayar → Pasang aplikasi / Add to Home screen. Pilihan bergantung pada pelayar.');}});
function installed(){install.hidden=true;}
if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone)installed();
window.addEventListener('appinstalled',installed);
if('serviceWorker' in navigator && window.isSecureContext){
 window.addEventListener('load',async()=>{try{
 const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
 function offer(){if(reg.waiting){update.hidden=false;update.onclick=()=>reg.waiting.postMessage({type:'SKIP_WAITING'});}}
 offer();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)offer();});});
 let reloaded=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!reloaded&& !update.hidden){reloaded=true;location.reload();}});
 }catch(error){state.textContent+=' • Mod luar talian belum tersedia';console.warn(error);}});
}

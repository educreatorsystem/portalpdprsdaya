# Sistem PdPR SK Taman Daya — versi baharu

Kata laluan guru: **JBA1077** (disemak oleh Apps Script).

## Kandungan pakej
- `github/`: muat naik SEMUA kandungannya ke akar repositori GitHub.
- `apps-script/Code.gs`: backend baharu untuk ditampal dalam Apps Script. Jangan muat naik folder ini ke repositori awam.
- `HTML-PENUH-GOOGLE-SITES.html`: keseluruhan UI dalam satu fail untuk tampal di Google Sites → Embed → Embed code. Versi ini memerlukan internet dan backend yang sama; gunakan versi GitHub untuk pemasangan PWA.
- `EMBED-GOOGLE-SITES.html`: iframe ringkas yang memaparkan versi GitHub Pages. Ini pilihan disyorkan supaya kemas kini GitHub terus muncul di Google Sites.

## 1. Pasang backend (WAJIB untuk fungsi baharu)
1. Buka Google Sheet asal yang digunakan oleh sistem ini. Simpan salinan sandaran dahulu.
2. Pilih **Extensions → Apps Script**. Simpan salinan kod asal; gantikan kandungan Code.gs dengan `apps-script/Code.gs`. Elakkan fungsi doGet/doPost pendua dalam fail lain.
3. Jalankan fungsi **setup** sekali dan berikan kebenaran yang diminta.
4. Setup menyimpan ID Google Sheet aktif, menetapkan kata laluan JBA1077, menyediakan folder bukti gambar, menambah kolum diperlukan tanpa memadam kolum lain, dan memberi ID kepada tugasan lama yang belum ber-ID.
5. **Deploy → Manage deployments → Edit (ikon pensel) → New version → Deploy** untuk mengekalkan URL sedia ada. Jika belum ada web app, gunakan **Deploy → New deployment → Web app**. Pilih **Execute as: Me**, akses **Anyone** jika dibenarkan akaun sekolah.
6. Jika URL /exec berubah, ubah `APPSCRIPT_URL` dalam `github/config.js`. Untuk versi HTML penuh, ubah nilai yang sama dalam fail HTML itu.
7. URL asal telah dikekalkan dalam pakej, tetapi URL tersebut perlu menjalankan Code.gs baharu. Backend asal tidak mempunyai kontrak API baharu ini.

**Tab Google Sheet yang digunakan (gid asal daripada lampiran):**
- Tugasan: 925149612
- Penghantaran: 1661504502
- Nama murid / kelas: 288612582

Kolum murid mesti mempunyai tajuk yang mengandungi NAMA dan KELAS. Jika menggunakan sheet lain, kemas kini gid dalam Code.gs serta URL CSV di config.js. Jangan guna ID published CSV `2PACX...` sebagai Spreadsheet ID.

Folder gambar baharu kekal peribadi. Kongsi folder bukti dengan akaun guru yang perlu melihat gambar melalui Drive; pautan gambar tidak dibuka kepada umum oleh kod ini. Jika mahu guna folder sedia ada, tetapkan `UPLOAD_FOLDER_ID` dalam Project Settings → Script Properties. Jangan padam folder sedia ada.

## 2. Publish di GitHub Pages
1. Cipta atau buka repositori GitHub cikgu.
2. Upload **kandungan** folder `github/` ke root: index.html, app.js, config.js, styles.css, sw.js, manifest.webmanifest dan folder icons. Jangan hanya upload index.html.
3. Commit, kemudian buka **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
4. Tunggu URL Pages tersedia, kemudian buka pautan HTTPS tersebut.
5. Selepas kemas kini, jika versi lama masih muncul, tutup dan buka aplikasi semula serta muat semula halaman.

## 3. Embed dalam Google Sites
Pilihan A (disyorkan): buka `EMBED-GOOGLE-SITES.html`, gantikan **kedua-dua** URL `https://USERNAME.github.io/NAMA-REPOSITORI/` dengan URL Pages sebenar. Salin kod, buka Google Sites → Insert → Embed → Embed code → Next → Insert. Besarkan ruang embed, kemudian Publish.

Pilihan B: salin seluruh kandungan `HTML-PENUH-GOOGLE-SITES.html` ke Embed code. Ini versi satu fail; ia tidak memasang service worker dalam Google Sites. Jika URL Apps Script berubah, ubah dalam HTML penuh juga.

## 4. Pasang PWA
- Android/komputer: buka URL GitHub Pages secara terus dalam pelayar yang menyokong pemasangan, kemudian tekan **Pasang App** atau gunakan menu pemasangan pelayar.
- iPhone/iPad: buka URL GitHub Pages dalam Safari → Kongsi → Add to Home Screen.
- Dalam Google Sites, tekan **Buka aplikasi / Pasang PWA** untuk membuka halaman asal. Pemasangan dilakukan melalui halaman GitHub Pages.
- Manifest, ikon 192/512, ikon maskable, ikon Apple dan service worker disediakan.
- Offline: rangka UI boleh dibuka selepas kunjungan pertama dalam talian. Data murid, tugasan dan simpanan memerlukan internet. Tiada barisan penghantaran offline; aplikasi tidak mendakwa simpanan berjaya ketika offline.

## 5. Edit dan padam tugasan
- Login melalui Portal Guru, Rekod Tugasan atau Rumusan menggunakan **JBA1077**.
- Rekod Tugasan mempunyai tapisan tarikh, kelas, subjek, guru dan carian tajuk.
- **Edit tugasan** membuka borang lengkap; tekan **Simpan perubahan**.
- **Padam** memerlukan pengesahan. Tugasan dikeluarkan daripada Google Sheet; rekod penghantaran murid terdahulu dikekalkan. Pemadaman ini tidak mempunyai Undo dalam aplikasi.
- Perubahan tajuk, arahan dan pautan kekal menggunakan ID tugasan sama. Jika menukar tarikh/kelas/subjek, rekod penghantaran lama mengekalkan butiran sejarahnya; untuk tugasan baharu kepada kelas lain, cipta tugasan baharu.
- Semua guru menggunakan akses bersama, jadi guru yang login boleh mengurus semua tugasan.

## 6. Status simpanan dan penghantaran
- Popup menunggu pengesahan resit daripada pelayan; respons no-cors sahaja tidak dianggap berjaya.
- Jika status belum disahkan, muat semula rekod sebelum menghantar semula kerana operasi mungkin telah selesai di pelayan.
- Apps Script menggunakan LockService untuk mengelakkan penghantaran murid berganda, termasuk dua penghantaran serentak.
- Rekod sama ialah murid + ID tugasan, atau murid + kelas + tarikh + subjek. Murid tidak boleh menghantar semula subjek yang sama pada hari tersebut.
- Nama murid disemak dengan senarai nama kelas pada pelayan. Pemilihan nama bukan akaun murid berpassword.
- Gambar JPG/PNG/WebP maksimum 3 MB, pilihan.
- Sesi guru disimpan dalam memori halaman dan perlu login semula selepas halaman dimuat semula. Sesi pelayan tamat selewat-lewatnya selepas enam jam, atau lebih awal jika cache dibersihkan.
- Ruang Rumusan merangkumi tugasan, guru, kelas dan bilangan penghantaran, serta jadual tugasan dan bukti murid.

## Semakan sebelum digunakan
Kod JavaScript disemak sintaks dan backend diuji dengan simulasi untuk login, sekatan akses, cipta, edit, padam, semakan nama dan pencegahan duplikasi. Sambungan sebenar ke akaun Google, deploy, hak akses folder dan paparan Google Sites perlu diuji selepas pemasangan. Tiada rekod sebenar sekolah diubah semasa penyediaan pakej ini.

Rujukan teknikal:
- https://developers.google.com/apps-script/guides/content
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable

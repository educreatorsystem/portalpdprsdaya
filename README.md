# Versi 4 — Paparan pengurusan tugasan

Header gradient, kad tugasan, borang edit berbahagian, penapis kelas/guru/subjek/tarikh serta carian kata kunci. Penapis boleh digabungkan dan direset. Kemas kini fail laman di GitHub; Apps Script versi 3 tidak perlu diubah.

# PdPR SKTD — Versi 3: Edit dan Padam

Kod Apps Script lengkap disertakan dalam `apps-script/Code.gs`. Ikuti `apps-script/PANDUAN_EDIT_PADAM.md` sebelum menggantikan fail laman di GitHub. Tiada kod tambahan berasingan diperlukan.

# PdPR SK Taman Daya — PWA

## Terbitkan melalui GitHub Pages
1. Ekstrak ZIP ini.
2. Cipta repository GitHub, contohnya `pdpr-sktd`.
3. Muat naik SEMUA kandungan folder ini termasuk folder `assets`. Pastikan `index.html` berada terus di akar repository, bukan di dalam folder tambahan. Jangan muat naik ZIP sahaja.
4. Settings → Pages → Build and deployment → Source: Deploy from a branch.
5. Pilih branch `main`, folder `/(root)` dan Save.
6. Tunggu penerbitan selesai dan buka URL yang dipaparkan oleh GitHub Pages.

Panduan rasmi: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Pasang aplikasi
Android / komputer: buka URL GitHub Pages secara terus dalam pelayar yang menyokong pemasangan. Tekan Pasang aplikasi apabila tersedia, atau gunakan menu pemasangan pelayar.
iPhone / iPad: Safari → Kongsi → Add to Home Screen.
PWA memerlukan HTTPS (GitHub Pages menyediakannya). Membuka index.html melalui file:// atau memasukkannya dalam iframe Google Sites tidak memasang PWA.

## Fungsi dan batas
- Kata laluan guru dikekalkan mengikut tetapan terdahulu.
- ID Google Sheet, folder Drive dan URL Apps Script asal dikekalkan. Senarai tugasan kini dibaca terus dari Apps Script.
- Reka bentuk gradient, hover, paparan responsif, ikon buku dan tanda semak.
- Selepas dibuka secara dalam talian dan cache siap, rangka aplikasi boleh dibuka semula di luar talian.
- Data Google Sheets, video, imej bukti, logo sekolah dan penghantaran memerlukan internet. Data murid tidak disimpan dalam cache PWA. Tiada barisan penghantaran luar talian.
- Butang pemasangan bergantung kepada sokongan pelayar; panduan manual disediakan.
- Kemas kini: muat naik fail baharu dan tukar `v3` dalam sw.js kepada `v4` (dan seterusnya). Apabila tersedia, pengguna boleh memilih Kemas kini tersedia; simpan borang dahulu.

## Nota pelaksanaan sedia ada
Login guru masih disemak di JavaScript sisi pelayar, jadi kata laluan dapat dilihat dalam kod sumber. Ini bukan pengesahan pelayan. Untuk kawalan akses sebenar, sahkan pengguna dan operasi tulis di pelayan/Apps Script.
Penghantaran murid asal menggunakan Apps Script no-cors; respons kejayaan pelayan bagi penghantaran murid tidak dapat dibaca oleh pelayar. Simpan tugasan guru, edit dan padam kini memerlukan respons JSON kejayaan pelayan. Semak rekod dalam Google Sheet selepas penghantaran pertama di domain baharu. Ujian pakej ini tidak menghantar data sebenar.

## Fail
index.html: sistem penuh
manifest.webmanifest: identiti dan ikon PWA
sw.js: cache rangka aplikasi
pwa.js: pemasangan, status sambungan dan kemas kini
assets/: gaya, pustaka dan ikon setempat

Tailwind CSS v3 runtime dan PapaParse 5.3.2 (MIT); Font Awesome Free 6.4.0 (CSS: MIT; font: SIL OFL 1.1). Ikon aplikasi SVG dilukis khas untuk pakej ini.

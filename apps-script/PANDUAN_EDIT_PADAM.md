# Pemasangan versi 6 — kod lengkap

1. Buka projek Apps Script asal. Gantikan seluruh kandungan Code.gs dengan kandungan fail Code.gs dalam folder ini.
2. Jika pernah memasang TaskEditing.gs versi 2, padam fail itu kerana fungsinya kini digabungkan dalam Code.gs. Pastikan hanya satu doGet, satu doPost dan satu pdprHandleTaskEdit.
3. ID Google Sheet dan folder Drive telah diisi mengikut kod asal cikgu. Tiada Script Property spreadsheet diperlukan.
4. Simpan, kemudian kemas kini deployment Web App sedia ada kepada versi baharu (Deploy → Manage deployments → Edit → New version → Deploy). Kekalkan akses dan URL /exec yang digunakan sistem asal.
5. Gantikan fail laman GitHub dengan kandungan pakej ini: index.html, manage-tasks.js, pwa.js, sw.js, manifest.webmanifest, folder assets dan .nojekyll. Folder apps-script hanya untuk editor Apps Script, bukan untuk GitHub.
6. Buka laman atau PWA, pilih Kemas kini tersedia jika muncul. Log masuk guru dengan kata laluan sedia ada JBA1077.
7. Di tab Rekod Tugasan, cari tajuk/nama guru/kelas/subjek. Tekan Edit → buat pembetulan → Simpan Pembetulan. Untuk memadam, tekan Padam dan sahkan.
8. Uji dengan satu tugasan percubaan. Semak rekod dalam Google Sheet selepas simpan, edit dan padam. Pakej diuji dengan simulasi; sambungan deployment sekolah belum diuji secara langsung.

## Perubahan
- Edit/Padam beroperasi pada Sheet Tugasan berdasarkan ID unik, bukan tajuk atau kedudukan baris.
- Edit mengekalkan ID asal. Padam tidak memadam Sheet Penghantaran atau gambar bukti dalam Drive.
- Kunci pelayan mengelakkan operasi edit/padam/simpan bertindih ketika menulis baris.
- ID pendua atau tidak ditemui ditolak supaya baris lain tidak terubah.
- Senarai tugasan dibaca terus dari Apps Script, termasuk senarai kosong selepas tugasan terakhir dipadam.
- Simpan tugasan baharu, edit dan padam menunggu respons kejayaan pelayan. Jika respons hilang selepas pelayan memproses permintaan, semak Sheet dan tekan Muat semula sebelum mencuba lagi.
- Fungsi asal penghantaran murid dan muat naik gambar Drive dikekalkan.

## Akaun guru
Sistem asal menggunakan satu kata laluan bersama. Semua guru yang log masuk boleh mengurus semua tugasan; carian nama bukan sekatan pemilikan. Pengasingan akses setiap guru memerlukan akaun individu.
Kod v6 menggunakan JBA1077 secara terus dan tidak membaca Script Property PDPR_TEACHER_PASSWORD.

## Jika ralat
- Semak bahawa deployment dikemas kini, bukan sekadar menekan Save pada kod.
- Jangan ubah URL /exec jika menggunakan deployment yang sama. Jika deployment baharu dibuat, gantikan APPSCRIPT_URL dalam index.html dengan URL baharu.
- Semak akses Web App membenarkan pengguna laman menggunakannya dan akaun pelaksana mempunyai akses Sheet/Drive.
- Kod menggunakan nama tab tepat Tugasan dan Penghantaran, dengan susunan 13 dan 9 kolum asal.

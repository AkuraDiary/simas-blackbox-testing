Feature: FR-REL-01, FR-REL-02, FR-REL-03 & FR-REL-04 Pembuatan Draf, Review Bertingkat, dan Revisi Surat Terbitan Balasan
  Sebagai Staf Unit / Pimpinan
  Saya ingin dapat menerbitkan surat balasan resmi atas permohonan pemohon, mengajukan review bertingkat, serta mengelola revisi draf balasan
  Agar surat balasan yang diterbitkan valid, akurat, dan sesuai dengan mandat unit kerja

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  @negative @fr-rel-01
  Scenario: TC-ALT-FR-REL-01-A - Tombol Aksi Terbitkan Surat Balasan Tidak Ditampilkan pada Surat Bukan Pengajuan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Langsung" pada tabel surat masuk
    And Staf Unit membuka detail surat masuk biasa
    And Staf Unit memeriksa ketersediaan menu aksi "Kelola Surat"
    Then Aksi "Terbitkan Surat Balasan" tidak ditampilkan untuk surat bertipe selain pengajuan

  @positive @fr-rel-01
  Scenario: TC-FR-REL-01-A - Staf Unit Membuat Draf Surat Terbitan Balasan dari Pengajuan Rujukan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Kelola Surat"
    And Staf Unit mengklik aksi "Terbitkan Surat Balasan"
    Then Sistem mengalihkan pengguna ke formulir pembuatan surat terbitan "/internal/surats/create"
    And Formulir menampilkan identitas rujukan surat pengajuan
    And Formulir menampilkan banner penerima dokumen terbitan "PENERIMA DOKUMEN TERBITAN:"
    When Staf Unit mengisi perihal surat terbitan dengan timestamp dinamis "Surat Jawaban Rekomendasi Terbitan"
    And Staf Unit mengklik tombol form "Simpan Draft"
    Then Sistem menampilkan notifikasi sukses penyimpanan draf surat terbitan

  @negative @fr-rel-02
  Scenario: TC-ALT-FR-REL-02-A - Validasi Gagal Kirim Draf Terbitan Saat Form Wajib Belum Lengkap
    When Staf Unit mengakses halaman pembuatan surat terbitan baru "/internal/surats/create?tipe_surat=TERBITAN"
    And Staf Unit mengosongkan perihal surat terbitan
    And Staf Unit mengklik tombol aksi kirim pengajuan surat
    Then Sistem menahan submit form dan menampilkan validasi error pada perihal

  @positive @fr-rel-02
  Scenario: TC-FR-REL-02-A - Staf Unit Mengajukan Draf Surat Terbitan ke Alur Persetujuan Bertingkat
    When Staf Unit mengakses halaman surat keluar "/internal/surats"
    And Staf Unit membuka draf surat terbitan yang baru dibuat
    And Staf Unit mengklik tombol aksi kirim pengajuan surat
    Then Sistem menampilkan modal konfirmasi pengiriman surat terbitan
    When Staf Unit mengisi catatan pengantar terbitan "Mohon arahan dan persetujuan draf surat balasan resmi"
    And Staf Unit mengonfirmasi pengiriman draf terbitan
    Then Sistem menampilkan notifikasi bahwa surat berhasil diajukan untuk persetujuan

  @negative @fr-rel-03-reverse
  Scenario: TC-ALT-FR-REL-03-REVERSE-A - Validasi Wajib Isi Alasan Saat Mengembalikan Draf Terbitan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Semua" pada tabel surat masuk
    And Staf Unit membuka draf surat terbitan yang sedang diproses review
    And Staf Unit membuka dropdown aksi "Kembalikan / Tolak"
    And Staf Unit memilih opsi kembalikan "Kembalikan ke Langkah Sebelumnya"
    Then Modal pengembalian surat terbuka
    When Staf Unit mengosongkan alasan pengembalian dan mengklik submit
    Then Sistem menahan submit dan mewajibkan pengisian alasan pengembalian

  @positive @fr-rel-03-reverse
  Scenario: TC-FR-REL-03-REVERSE-A - Pimpinan Mengembalikan Draf Surat Terbitan ke Penyusun untuk Koreksi Redaksi
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Semua" pada tabel surat masuk
    And Staf Unit membuka draf surat terbitan yang sedang diproses review
    And Staf Unit membuka dropdown aksi "Kembalikan / Tolak"
    And Staf Unit memilih opsi kembalikan "Kembalikan ke Langkah Sebelumnya"
    Then Modal pengembalian surat terbuka
    When Staf Unit mengisi alasan pengembalian "Tolong perbaiki redaksi konsideran menimbang pada naskah balasan"
    And Staf Unit mengonfirmasi pengembalian surat
    Then Sistem menampilkan notifikasi sukses pengembalian surat

  @positive @fr-rel-04-revise
  Scenario: TC-FR-REL-04-REVISE-A - Penyusun Memperbarui Redaksi Konten Draf Terbitan Pasca Dikembalikan
    When Staf Unit mengakses halaman surat keluar "/internal/surats"
    And Staf Unit membuka draf surat terbitan yang dikembalikan
    And Staf Unit mengklik tombol edit surat
    When Staf Unit memperbarui perihal surat terbitan dengan catatan " [Revisi Disetujui]"
    And Staf Unit mengklik tombol form "Simpan Draft"
    Then Sistem menampilkan notifikasi sukses penyimpanan draf surat terbitan

  @negative @fr-rel-04-revise
  Scenario: TC-ALT-FR-REL-04-REVISE-A - Sistem Mencegah Pengeditan Konten Terbitan yang Sudah Berstatus Selesai
    When Staf Unit mengakses halaman surat keluar "/internal/surats"
    And Staf Unit membuka surat terbitan yang sudah berstatus "SELESAI" jika ada
    Then Sistem memastikan form edit dinonaktifkan atau hanya tampilan pratinjau yang tersedia

  @negative @fr-rel-03-approve
  Scenario: TC-ALT-FR-REL-03-APPROVE-A - Akses Persetujuan Terbitan Ditolak Bagi Pengguna di Luar Alur
    Given Staf Unit telah login dengan akun "stafflogistik" dan kata sandi "password123"
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    Then Sistem memastikan staf di luar alur terbitan tidak dapat mengeksekusi persetujuan naskah

  @positive @fr-rel-03-approve
  Scenario: TC-FR-REL-03-APPROVE-A - Pimpinan Menyetujui Draf Surat Terbitan Balasan
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Semua" pada tabel surat masuk
    And Staf Unit membuka draf surat terbitan yang sedang diproses review
    And Staf Unit membuka dropdown aksi "Proses Surat"
    And Staf Unit memilih opsi persetujuan pengajuan yang tersedia
    Then Sistem menampilkan modal persetujuan pengajuan
    When Staf Unit mengisi catatan persetujuan "Draf surat balasan disetujui untuk penomoran resmi"
    And Staf Unit mengonfirmasi persetujuan pengajuan
    Then Sistem menampilkan notifikasi sukses persetujuan surat

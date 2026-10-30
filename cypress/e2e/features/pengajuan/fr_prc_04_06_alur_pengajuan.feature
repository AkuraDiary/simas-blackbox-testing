Feature: FR-PRC-04, FR-PRC-05 & FR-PRC-06 Alur Penerusan, Persetujuan, Pengembalian, dan Penyelesaian Pengajuan
  Sebagai Staf Unit / Pejabat berwenang
  Saya ingin dapat memproses pengajuan masuk melalui penerusan bertingkat, persetujuan, pengembalian, revisi, atau penyelesaian mandiri
  Agar siklus pemrosesan permohonan surat berjalan akuntabel sesuai tata kelola institusi

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  @negative @fr-prc-04
  Scenario: TC-ALT-FR-PRC-04-A - Validasi Penolakan Saat Unit Tujuan Penerusan Dikosongkan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Proses Surat"
    And Staf Unit memilih opsi proses "Teruskan Saja (Tanpa Setuju)"
    Then Modal penerusan surat terbuka
    When Staf Unit mengosongkan unit tujuan dan mengklik submit penerusan
    Then Sistem menolak submit dan menampilkan pesan error validasi penerusan

  @positive @fr-prc-04
  Scenario: TC-FR-PRC-04-A - Staf Unit Meneruskan Surat Pengajuan ke Unit Kerja Lain
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Proses Surat"
    And Staf Unit memilih opsi proses "Teruskan Saja (Tanpa Setuju)"
    Then Modal penerusan surat terbuka
    When Staf Unit memilih unit tujuan penerusan dan memasukkan catatan "Mohon diverifikasi kelayakan berkas akademik"
    And Staf Unit mengonfirmasi penerusan surat
    Then Sistem menampilkan notifikasi sukses penerusan surat

  @negative @fr-prc-05-reverse
  Scenario: TC-ALT-FR-PRC-05-REVERSE-A - Validasi Mandatory Catatan Alasan Saat Mengembalikan Pengajuan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Kembalikan / Tolak"
    And Staf Unit memilih opsi kembalikan "Kembalikan ke Langkah Sebelumnya"
    Then Modal pengembalian surat terbuka
    When Staf Unit mengosongkan alasan pengembalian dan mengklik submit
    Then Sistem menahan submit dan mewajibkan pengisian alasan pengembalian

  @positive @fr-prc-05-reverse
  Scenario: TC-FR-PRC-05-REVERSE-A - Pejabat Mengembalikan Surat Pengajuan ke Langkah Sebelumnya
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Kembalikan / Tolak"
    And Staf Unit memilih opsi kembalikan "Kembalikan ke Langkah Sebelumnya"
    Then Modal pengembalian surat terbuka
    When Staf Unit mengisi alasan pengembalian "Data pendukung belum lengkap dari unit pengusul"
    And Staf Unit mengonfirmasi pengembalian surat
    Then Sistem menampilkan notifikasi sukses pengembalian surat

  @negative @fr-prc-05-revise
  Scenario: TC-ALT-FR-PRC-05-REVISE-A - Validasi Mandatory Alasan Saat Melakukan Revisi Total Pengajuan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Kembalikan / Tolak"
    And Staf Unit memilih opsi kembalikan "Kembalikan ke Pembuat Awal (Reset)"
    Then Modal pengembalian total terbuka
    When Staf Unit mengosongkan alasan revisi total dan mengklik submit
    Then Sistem menahan submit dan menampilkan validasi alasan revisi wajib diisi

  @positive @fr-prc-05-revise
  Scenario: TC-FR-PRC-05-REVISE-A - Staf Mengembalikan Surat Pengajuan ke Pembuat Awal untuk Revisi Total
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Kembalikan / Tolak"
    And Staf Unit memilih opsi kembalikan "Kembalikan ke Pembuat Awal (Reset)"
    Then Modal pengembalian total terbuka
    When Staf Unit mengisi alasan revisi total "Format naskah wajib disesuaikan dengan template resmi"
    And Staf Unit mengonfirmasi revisi total pengajuan
    Then Sistem menampilkan notifikasi pengembalian revisi total ke pembuat

  @negative @fr-prc-05-approve
  Scenario: TC-ALT-FR-PRC-05-APPROVE-A - Aksi Persetujuan Dinonaktifkan untuk Pengguna di Luar Hak Akses
    Given Staf Unit telah login dengan akun "stafflogistik" dan kata sandi "password123"
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    Then Tabel menampilkan data pengajuan atau antrean kosong unit logistik
    And Tombol aksi persetujuan tidak dapat diakses untuk surat yang bukan wewenang logistik

  @positive @fr-prc-05-approve
  Scenario: TC-FR-PRC-05-APPROVE-A - Pejabat Berwenang Menyetujui Tahapan Pengajuan Surat
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Proses Surat"
    And Staf Unit memilih opsi persetujuan pengajuan yang tersedia
    Then Sistem menampilkan modal persetujuan pengajuan
    When Staf Unit mengisi catatan persetujuan "Pengajuan telah diverifikasi dan disetujui"
    And Staf Unit mengonfirmasi persetujuan pengajuan
    Then Sistem menampilkan notifikasi sukses persetujuan surat

  @positive @fr-prc-06
  Scenario: TC-FR-PRC-06-A - Staf Menyelesaikan Pengajuan Surat Secara Mandiri Tanpa Terbitan
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    And Staf Unit membuka dropdown aksi "Proses Surat"
    And Staf Unit memilih opsi penyelesaian surat "Finalisasi & Selesai"
    Then Sistem menampilkan modal finalisasi pengajuan
    When Staf Unit mengisi catatan finalisasi "Pengajuan permohonan selesai diproses dan diarsipkan"
    And Staf Unit mengonfirmasi finalisasi pengajuan
    Then Sistem menampilkan notifikasi bahwa pengajuan berhasil diselesaikan

  @negative @fr-prc-06
  Scenario: TC-ALT-FR-PRC-06-A - Sistem Mencegah Penyelesaian Ulang pada Pengajuan yang Telah Berstatus Selesai
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit membuka salah satu surat pengajuan yang berstatus "SELESAI" jika ada
    Then Sistem memastikan aksi proses surat tidak lagi mengizinkan finalisasi ganda

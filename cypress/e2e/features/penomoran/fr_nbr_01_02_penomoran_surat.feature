Feature: FR-NBR-01 & FR-NBR-02 Pengelolaan Nomor Surat dan Pengaturan Nomor Backdate
  Sebagai Staf / Pegawai Unit Kerja
  Saya ingin dapat menetapkan nomor surat resmi, mengatur nomor sisipan manual, dan mengelola tanggal backdate
  Agar penomoran surat berjalan tertib sesuai standar institusi dan kebutuhan administratif

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  @positive @fr-nbr-01
  Scenario: TC-FR-NBR-01-A - Menetapkan Nomor Surat Otomatis Berdasarkan Format Unit Aktif
    Given Staf Unit membuka detail surat keluar untuk penomoran
    When Staf Unit membuka menu dropdown "Kelola Surat" dan memilih aksi "Beri Nomor Surat"
    Then Sistem menampilkan modal "Penomoran Surat"
    When Staf Unit memilih format penomoran aktif
    And Staf Unit menekan tombol konfirmasi nomor surat pada modal
    Then Sistem menampilkan notifikasi sukses penetapan nomor surat
    And Halaman detail menampilkan nomor surat resmi yang telah terpasang

  @positive @fr-nbr-01
  Scenario: TC-FR-NBR-01-B - Menetapkan Nomor Surat Kustom atau Sisipan Manual Tanpa Menaikkan Counter
    Given Staf Unit membuka detail surat keluar untuk penomoran
    When Staf Unit membuka menu dropdown "Kelola Surat" dan memilih aksi "Beri Nomor Surat"
    Then Sistem menampilkan modal "Penomoran Surat"
    When Staf Unit memilih format penomoran aktif
    And Staf Unit mengaktifkan toggle sisipan manual dengan nomor "045.A"
    And Staf Unit memastikan checkbox naikkan counter tidak dicentang
    And Staf Unit menekan tombol konfirmasi nomor surat pada modal
    Then Sistem menampilkan notifikasi sukses penetapan nomor surat
    And Halaman detail menampilkan nomor surat yang memuat sisipan manual "045.A"

  @negative @fr-nbr-01
  Scenario: TC-ALT-FR-NBR-01-A - Validasi Gagal Submit Saat Field Wajib Nomor Surat Dikosongkan
    Given Staf Unit membuka detail surat keluar untuk penomoran
    When Staf Unit membuka menu dropdown "Kelola Surat" dan memilih aksi "Beri Nomor Surat"
    Then Sistem menampilkan modal "Penomoran Surat"
    When Staf Unit mengaktifkan mode manual dan mengosongkan teks nomor surat final
    And Staf Unit menekan tombol konfirmasi nomor surat pada modal
    Then Sistem menolak penetapan nomor dan modal tetap menampilkan pesan validasi error

  @positive @fr-nbr-02
  Scenario: TC-FR-NBR-02-A - Menetapkan Nomor Surat Bertanggal Mundur dengan Alasan Audit Valid
    Given Staf Unit membuka detail surat keluar untuk penomoran
    When Staf Unit membuka menu dropdown "Kelola Surat" dan memilih aksi "Beri Nomor Surat"
    Then Sistem menampilkan modal "Penomoran Surat"
    When Staf Unit memilih format penomoran aktif
    And Staf Unit memilih tanggal surat mundur ke tanggal lampau
    And Staf Unit mengisi alasan backdate "Kebutuhan kelengkapan berkas audit akreditasi institusi"
    And Staf Unit menekan tombol konfirmasi nomor surat pada modal
    Then Sistem menampilkan notifikasi sukses penetapan nomor surat
    And Halaman detail menampilkan nomor surat resmi yang telah terpasang

  @negative @fr-nbr-02
  Scenario: TC-ALT-FR-NBR-02-A - Validasi Mandatory Alasan Backdate Saat Memilih Tanggal Mundur
    Given Staf Unit membuka detail surat keluar untuk penomoran
    When Staf Unit membuka menu dropdown "Kelola Surat" dan memilih aksi "Beri Nomor Surat"
    Then Sistem menampilkan modal "Penomoran Surat"
    When Staf Unit memilih format penomoran aktif
    And Staf Unit memilih tanggal surat mundur ke tanggal lampau
    And Staf Unit mengosongkan field alasan backdate
    And Staf Unit menekan tombol konfirmasi nomor surat pada modal
    Then Sistem menolak penetapan nomor dan menampilkan validasi error alasan backdate wajib diisi

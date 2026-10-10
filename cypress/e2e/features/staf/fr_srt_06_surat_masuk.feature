Feature: FR-SRT-06 & FR-PRC-01 Penerimaan Surat Masuk dan Pengajuan Masuk Staf Unit
  Sebagai Staf Unit kerja
  Saya ingin dapat melihat daftar surat masuk dan menyaring surat pengajuan yang diterima unit saya
  Agar dokumen masuk dapat dipantau dan ditindaklanjuti dengan tertib

  @positive @fr-srt-06
  Scenario: TC-FR-SRT-06-A - Staf Unit Mengakses Halaman Surat Masuk dan Memeriksa Kelengkapan Tabel
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    Then Sistem menampilkan tabel Surat Masuk dengan tab filter kategori:
      | Semua | Langsung | Disposisi | Pengajuan |
    And Sistem menampilkan tabel Surat Masuk dengan kolom-kolom utama:
      | Perihal & Pengirim | Tipe | Status Surat | Tanggal Masuk | Status Baca |

  @negative @fr-srt-06
  Scenario: TC-ALT-FR-SRT-06-A - Akses Langsung Halaman Surat Masuk Tanpa Autentikasi Ditolak
    Given Pengguna belum login dan membersihkan sesi browser
    When Pengguna mengakses langsung URL surat masuk "/internal/surat-masuk"
    Then Sistem menolak akses dan mengalihkan pengguna ke halaman login "/login"

  @positive @fr-prc-01
  Scenario: TC-FR-PRC-01-A - Staf Unit Memfilter dan Melihat Daftar Surat Masuk Kategori Pengajuan
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"
    And Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    When Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    Then Tabel hanya menampilkan daftar surat masuk bertipe "Pengajuan"

Feature: FR-PRC-01, FR-PRC-02 & FR-PRC-03 Pemrosesan Surat Masuk Pengajuan dan Pemeriksaan Lampiran
  Sebagai Staf Unit kerja / Pejabat penerima
  Saya ingin dapat memfilter surat pengajuan, melihat lembar detail lengkap, dan memeriksa berkas lampiran pemohon
  Agar permohonan yang masuk dari pemohon dapat diverifikasi keabsahan dokumennya sebelum ditindaklanjuti

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  @positive @fr-prc-01
  Scenario: TC-FR-PRC-01-A - Staf Unit Memfilter dan Melihat Daftar Surat Masuk Kategori Pengajuan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    Then Tabel hanya menampilkan daftar surat masuk bertipe "Pengajuan"

  @negative @fr-prc-01
  Scenario: TC-ALT-FR-PRC-01-A - Menampilkan Pesan Status Kosong Saat Filter Pencarian Pengajuan Tidak Menemukan Data
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit memasukkan kata kunci acak yang tidak terdaftar "PencarianFiktif999XYZ" pada kotak pencarian
    Then Tabel menampilkan pesan status kosong "Tidak Ada Data Surat"

  @positive @fr-prc-02
  Scenario: TC-FR-PRC-02-A - Staf Unit Membuka dan Memeriksa Lembar Detail Surat Pengajuan
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    Then Sistem membuka halaman detail surat masuk
    And Halaman detail surat menampilkan panel informasi pengirim
    And Halaman detail surat menampilkan tipe surat pengajuan
    And Halaman detail surat menampilkan section "Perjalanan Surat"

  @negative @fr-prc-02
  Scenario: TC-ALT-FR-PRC-02-A - Akses Detail Pengajuan dengan ID Fiktif Menghasilkan Respons 404 Not Found
    When Staf Unit mengakses langsung URL detail surat fiktif "/internal/surat-masuk/99999999"
    Then Sistem menampilkan respons error 404 Not Found

  @positive @fr-prc-03
  Scenario: TC-FR-PRC-03-A - Staf Unit Membuka Modal Pratinjau dan Mengunduh Berkas Lampiran Pemohon
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit mengklik salah satu baris surat masuk pengajuan pada tabel
    Then Sistem memeriksa keberadaan section lampiran berkas pemohon
    When Staf Unit mengklik tombol pratinjau lampiran berkas jika tersedia
    Then Sistem menampilkan modal preview berkas "#preview-modal" atau memverifikasi link unduh berkas

  @negative @fr-prc-03
  Scenario: TC-ALT-FR-PRC-03-A - Menampilkan Keterangan Tidak Ada Berkas pada Surat Pengajuan Tanpa Lampiran
    When Staf Unit mengakses halaman surat masuk "/internal/surat-masuk"
    And Staf Unit mengklik tab filter "Pengajuan" pada tabel surat masuk
    And Staf Unit membuka detail surat pengajuan tanpa lampiran
    Then Halaman detail menampilkan keterangan "Tidak ada berkas lampiran pada surat ini."

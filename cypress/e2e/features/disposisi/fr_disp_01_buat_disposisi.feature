Feature: FR-DISP-01 Melakukan Disposisi Surat
  Sebagai Pimpinan Unit di SIMAS
  Saya ingin dapat mendisposisikan surat masuk antar-unit atau internal staf
  Agar pendelegasian tugas dan instruksi tindak lanjut surat berjalan secara terstruktur

  Background:
    Given Saya login ke sistem sebagai "pakrektor"
    And Saya mengakses halaman surat masuk

  @positive @disposisi @eksternal
  Scenario: TC-FR-DISP-01-A Disposisi Surat Antar-Unit Kerja (Eksternal)
    When Saya membuka detail surat masuk pengajuan yang belum didisposisikan
    And Saya membuka modal disposisi dari menu Kelola Surat
    And Saya memilih tipe disposisi "EKSTERNAL"
    And Saya memilih unit tujuan disposisi "Kemahasiswaan"
    And Saya memilih jenis instruksi disposisi "tindaklanjuti"
    And Saya memilih sifat disposisi "penting"
    And Saya mengisi catatan disposisi "Mohon ditindaklanjuti untuk koordinasi naskah dinas antar-unit."
    And Saya menekan tombol submit pada modal disposisi
    Then Saya harus melihat notifikasi "Disposisi berhasil"
    And Status surat harus bertransisi menjadi "DIPROSES"
    And Linimasa surat harus mencantumkan disposisi ke "Kemahasiswaan"

  @positive @disposisi @internal
  Scenario: TC-FR-DISP-01-B Disposisi Surat Internal Unit ke Staf Bawahan
    When Saya membuka detail surat masuk pengajuan yang belum didisposisikan
    And Saya membuka modal disposisi dari menu Kelola Surat
    And Saya memilih tipe disposisi "INTERNAL"
    And Saya memilih staf internal tujuan disposisi yang tersedia
    And Saya memilih jenis instruksi disposisi "koordinasikan"
    And Saya memilih sifat disposisi "biasa"
    And Saya mengisi catatan disposisi "Delegasi tugas tindak lanjut staf internal."
    And Saya menekan tombol submit pada modal disposisi
    Then Saya harus melihat notifikasi "Disposisi berhasil"
    And Linimasa surat harus mencantumkan disposisi internal

  @negative @disposisi @validation
  Scenario: TC-ALT-FR-DISP-01-A Validasi Form Disposisi Kosong (Negative)
    When Saya membuka detail surat masuk pertama yang tersedia
    And Saya membuka modal disposisi dari menu Kelola Surat
    And Saya menekan tombol submit pada modal disposisi
    Then Form modal disposisi tidak boleh terkirim dan menampilkan pesan validasi

  @negative @disposisi @authorization
  Scenario: TC-ALT-FR-DISP-01-B Pembatasan Otorisasi Disposisi Staf Biasa (Boundary)
    Given Saya membersihkan sesi login
    And Saya login ke sistem sebagai "arasy"
    When Saya mengakses halaman surat masuk
    Then Tombol atau menu aksi "Disposisikan" tidak boleh tersedia

Feature: FR-DISP-02 Merespon dan Menindaklanjuti Disposisi Surat
  Sebagai Staf atau Unit Penerima Disposisi
  Saya ingin dapat memperbarui progres dan menuntaskan tindak lanjut disposisi
  Agar pimpinan pemberi disposisi mengetahui perkembangan penyelesaian tugas

  Background:
    Given Saya login ke sistem sebagai "budisantoso"
    And Saya mengakses halaman surat masuk

  @positive @disposisi @respon
  Scenario: TC-FR-DISP-02-A Menindaklanjuti Disposisi dengan Progres Sedang Diproses
    When Saya membuka tab "Disposisi" pada tabel surat masuk
    And Saya membuka detail surat disposisi yang aktif
    And Saya menekan tombol aksi "Tindaklanjuti Disposisi"
    And Saya memilih status respon disposisi "Sedang Diproses"
    And Saya mengisi catatan respon disposisi "Sedang dalam tahap koordinasi berkas."
    And Saya menekan tombol simpan respon disposisi
    Then Saya harus melihat notifikasi "Disposisi diperbarui"

  @negative @disposisi @respon @validation
  Scenario: TC-ALT-FR-DISP-02-A Validasi Form Respon Disposisi Kosong (Negative)
    When Saya membuka tab "Disposisi" pada tabel surat masuk
    And Saya membuka detail surat disposisi yang aktif
    And Saya menekan tombol aksi "Tindaklanjuti Disposisi"
    And Saya mengosongkan status respon disposisi
    And Saya menekan tombol simpan respon disposisi
    Then Form respon disposisi tidak boleh terkirim

  @positive @disposisi @respon @selesai
  Scenario: TC-FR-DISP-02-B Menyelesaikan Tugas Disposisi (Status Selesai)
    When Saya membuka tab "Disposisi" pada tabel surat masuk
    And Saya membuka detail surat disposisi yang aktif
    And Saya menekan tombol aksi "Tindaklanjuti Disposisi"
    And Saya memilih status respon disposisi "Selesai"
    And Saya mengisi catatan respon disposisi "Seluruh tugas disposisi telah selesai dilaksanakan."
    And Saya menekan tombol simpan respon disposisi
    Then Saya harus melihat notifikasi "Disposisi diperbarui"

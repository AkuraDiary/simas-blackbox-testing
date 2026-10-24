Feature: FR-SRT-09 s/d FR-SRT-11 dan FR-TTD-01 Alur Linimasa, Respon Dokumen, dan Tanda Tangan Elektronik
  Sebagai Pejabat dan Staf Pengguna SIMAS
  Saya ingin dapat memantau linimasa perjalanan surat, menanggapi surat internal, mengunduh berkas, serta membubuhkan TTE dan QR pengesahan
  Agar seluruh alur persuratan terdokumentasi secara transparan, memiliki kekuatan hukum elektronik, dan dapat diakses dengan mudah

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  Scenario: TC-FR-SRT-09-A - Staf dan Pimpinan melihat riwayat linimasa perjalanan surat secara komprehensif
    Given Pimpinan membuka salah satu surat masuk yang tersedia
    When Pimpinan memeriksa section linimasa "PERJALANAN SURAT"
    Then Sistem menampilkan tahapan perjalanan surat meliputi riwayat pembuatan dan distribusi surat

  Scenario: TC-FR-SRT-11-A - Pengguna mengakses pratinjau dan mengunduh dokumen surat
    Given Pimpinan membuka salah satu surat masuk yang tersedia
    When Pimpinan memeriksa area dokumen naskah surat dan lampiran
    Then Sistem menyediakan akses tampilan dokumen naskah serta berkas lampiran surat

  Scenario: TC-FR-TTD-01-A - Pimpinan mengatur metode visual tanda tangan digital atau QR pada lembar surat
    Given Pimpinan membuka salah satu surat masuk yang sedang diproses
    When Pimpinan membuka grup aksi "Proses Surat"
    And Pimpinan memilih aksi pengaturan tanda tangan digital
    And Pimpinan memilih metode pengesahan "QR Code Verifikasi Sistem (Otomatis)"
    And Pimpinan memastikan opsi tampilkan nama penandatangan aktif
    And Pimpinan menerapkan pengaturan tanda tangan ke lembar surat
    Then Sistem menampilkan notifikasi sukses penyiapan TTD "TTD Diterapkan ke Surat"

  Scenario: TC-FR-TTD-01-B - Pimpinan melakukan finalisasi dan pengesahan akhir surat
    Given Pimpinan membuka salah satu surat masuk yang sedang diproses
    When Pimpinan membuka grup aksi "Proses Surat"
    And Pimpinan memilih aksi "Finalisasi & Selesai"
    And Pimpinan mengisi catatan persetujuan akhir dengan "Naskah telah diverifikasi dan disahkan secara resmi QA"
    And Pimpinan menekan tombol konfirmasi finalisasi surat
    Then Sistem menampilkan notifikasi sukses finalisasi "Berhasil Difinalisasi"

  Scenario: TC-FR-SRT-10-A - Staf menanggapi dan menyelesaikan surat internal langsung
    Given Pimpinan membuka salah satu surat masuk yang sedang diproses
    When Pimpinan memilih aksi tanggapi dan selesaikan internal
    And Pimpinan mengisi catatan balasan penyelesaian dengan "Agenda koordinasi telah selesai ditindaklanjuti secara internal QA"
    And Pimpinan menekan tombol submit catatan penyelesaian
    Then Sistem menampilkan notifikasi surat diselesaikan atau terproses

Feature: FR-SRT-05 Mengembalikan dan Menolak Surat Dinas Elektronik (Backtrack & Revisi)
  Sebagai Pejabat Verifikator atau Pimpinan Unit
  Saya ingin dapat mengembalikan surat ke langkah sebelumnya, mengembalikan total ke pembuat draf, atau menolak surat
  Agar draf surat yang belum memenuhi standar dapat direvisi atau dibatalkan secara akuntabel

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  Scenario: TC-ALT-FR-SRT-05-A - Modal pengembalian surat menolak submit jika alasan pengembalian kosong
    Given Pimpinan membuka salah satu surat masuk yang sedang diproses
    When Pimpinan membuka grup aksi "Kembalikan / Tolak"
    And Pimpinan memilih aksi "Kembalikan ke Langkah Sebelumnya"
    And Pimpinan mengosongkan teks alasan pengembalian pada modal
    And Pimpinan menekan tombol submit modal pengembalian
    Then Form modal menampilkan validasi bahwa alasan pengembalian wajib diisi
    And Pimpinan membatalkan modal pengembalian surat

  Scenario: TC-FR-SRT-05-A - Pimpinan mengembalikan surat ke langkah verifikator sebelumnya
    Given Pimpinan membuka salah satu surat masuk yang sedang diproses
    When Pimpinan membuka grup aksi "Kembalikan / Tolak"
    And Pimpinan memilih aksi "Kembalikan ke Langkah Sebelumnya"
    And Pimpinan mengisi alasan pengembalian dengan "Terdapat data permohonan yang perlu divalidasi ulang QA"
    And Pimpinan menekan tombol submit modal pengembalian
    Then Sistem menampilkan notifikasi sukses pengembalian "Surat dikembalikan ke unit sebelumnya"

  Scenario: TC-FR-SRT-05-B - Pimpinan mengembalikan surat secara total ke pembuat awal untuk revisi
    Given Pimpinan membuka salah satu surat masuk yang sedang diproses
    When Pimpinan membuka grup aksi "Kembalikan / Tolak"
    And Pimpinan memilih aksi "Kembalikan ke Pembuat Awal (Reset)"
    And Pimpinan mengisi alasan revisi total dengan "Format dan substansi dokumen perlu direvisi total QA"
    And Pimpinan menekan tombol submit modal pengembalian
    Then Sistem menampilkan notifikasi sukses revisi "Surat dikembalikan secara total ke pembuat"

  Scenario: TC-FR-SRT-05-C - Pimpinan menolak surat persetujuan secara permanen
    Given Pimpinan membuka salah satu surat masuk yang sedang diproses
    When Pimpinan membuka grup aksi "Kembalikan / Tolak"
    And Pimpinan memilih aksi "Tolak Surat Sepenuhnya"
    And Pimpinan mengisi alasan penolakan permanen dengan "Permohonan tidak dapat disetujui karena tidak sesuai alokasi program kerja QA"
    And Pimpinan mengonfirmasi penolakan permanen pada modal
    Then Sistem menampilkan notifikasi penolakan "Surat pengajuan ditolak permanen"

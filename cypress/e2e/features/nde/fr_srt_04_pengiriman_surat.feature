Feature: FR-SRT-04 Mengirim dan Meneruskan Surat Dinas Elektronik
  Sebagai Staf Unit atau Pengirim Surat
  Saya ingin dapat mengirimkan surat dinas langsung ke unit tujuan atau melalui jalur persetujuan khusus
  Agar naskah dinas dapat didistribusikan secara resmi dan diproses oleh unit/pejabat yang berwenang

  Background:
    Given Staf Unit telah login dengan akun "pakrektor" dan kata sandi "password"

  Scenario: TC-FR-SRT-04-A - Staf mengirimkan surat dinas langsung ke unit tujuan
    Given Staf Unit berada di halaman pembuatan surat "/internal/surats/create"
    When Staf Unit memilih metode pembuatan "scratch"
    And Staf Unit mengisi field perihal dengan judul unik "Surat Koordinasi Langsung QA"
    And Staf Unit memilih unit tujuan pertama yang tersedia
    And Staf Unit mengisi konten naskah surat dengan "Dengan hormat, bersama ini kami sampaikan permohonan koordinasi program kerja antar unit."
    And Staf Unit menekan tombol aksi "Kirim / Pengajuan"
    And Staf Unit mengisi catatan pengiriman pada modal dengan "Mohon ditindaklanjuti segera oleh unit terkait"
    And Staf Unit mengonfirmasi pengiriman surat pada modal
    Then Sistem menampilkan notifikasi sukses pengiriman surat "Surat berhasil dikirim untuk diproses"
    And Sistem mengalihkan pengguna ke halaman surat keluar "/internal/surats?scope=keluar"
    And Surat yang baru dikirim dengan judul unik tersebut tercatat pada sistem

  Scenario: TC-ALT-FR-SRT-04-A - Pengiriman surat ditolak jika unit tujuan dan alur persetujuan kosong
    Given Staf Unit berada di halaman pembuatan surat "/internal/surats/create"
    When Staf Unit memilih metode pembuatan "scratch"
    And Staf Unit mengisi field perihal dengan judul unik "Surat Uji Validasi Tujuan Kosong QA"
    And Staf Unit memastikan unit tujuan dan jalur persetujuan dalam keadaan kosong
    And Staf Unit menekan tombol aksi "Kirim / Pengajuan"
    And Staf Unit mengonfirmasi pengiriman surat pada modal
    Then Sistem menolak pengiriman dan menampilkan notifikasi peringatan tujuan "Tujuan Surat Tidak Boleh Kosong"

  Scenario: TC-FR-SRT-04-B - Pengirim mengajukan surat dinas melalui Jalur Persetujuan Khusus berjenjang
    Given Staf Unit berada di halaman pembuatan surat "/internal/surats/create"
    When Staf Unit memilih metode pembuatan "scratch"
    And Staf Unit mengisi field perihal dengan judul unik "Draf Keputusan Bersama QA"
    And Staf Unit menambahkan jalur persetujuan khusus untuk jabatan pimpinan
    And Staf Unit mengisi konten naskah surat dengan "Draf keputusan bersama untuk ditinjau dan disahkan oleh pimpinan institusi."
    And Staf Unit menekan tombol aksi "Kirim / Pengajuan"
    And Staf Unit mengisi catatan pengiriman pada modal dengan "Draf diajukan untuk proses review dan persetujuan pimpinan"
    And Staf Unit mengonfirmasi pengiriman surat pada modal
    Then Sistem menampilkan notifikasi sukses pengiriman surat "Surat berhasil dikirim untuk diproses"
    And Sistem mengalihkan pengguna ke halaman surat keluar "/internal/surats?scope=keluar"
    And Surat dengan jalur persetujuan tersebut tercatat dengan status diproses

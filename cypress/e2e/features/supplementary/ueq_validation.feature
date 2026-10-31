Feature: SUPP-UEQ-01 Validasi Data Master UNIK & Akun Pengguna Evaluasi UEQ
  Sebagai Tim Validasi Sistem & Penguji Penjaminan Mutu
  Saya ingin memverifikasi keabsahan 14 akun persona UEQ, ketersediaan 3 template resmi UNIK, dan siklus pembuatan naskah dinas
  Agar data master UNIK terkonfirmasi valid, fungsional, dan bersih tanpa meninggalkan residu pengujian

  @positive @ueq @auth @supp-ueq-01
  Scenario: TC-SUPP-UEQ-01 - Autentikasi 14 Akun Pengguna Persona UEQ Universitas Kadiri
    Given Pengguna berada di halaman login "/internal/login"
    When Pengguna memverifikasi autentikasi 14 akun persona UEQ dengan kata sandi "password123":
      | username         | role_indicator                          |
      | rektor           | Ir. Djoko Rahardjo, MP                  |
      | warek2           | Drs. Ir. Sigit Winarto, S.T., M.T.      |
      | staff.rektorat   | Maya Indriani, S.Kom.                   |
      | kepala.baku      | Ahmad Fauzi, S.E., M.M.                 |
      | staff.baku       | Rina Wahyuni, A.Md.                     |
      | kepala.baak      | Dra. Hj. Sri Lestari, M.Pd.             |
      | kepala.bapsi     | Hendra Wijaya, S.Kom., M.Cs.            |
      | dekan.ft         | Ir. Bambang Suryono, M.T.               |
      | staff.ft         | Dedy Pratama, S.T.                      |
      | dekan.fik        | Dr. apt. Nurhayati, M.Farm.             |
      | staff.fik        | Siti Aminah, A.Md.Keb.                  |
      | direktur.lppm    | Prof. Dr. Sugeng Rahayu, M.Si.          |
      | kepala.ppm       | Dr. Eko Wahyudi, S.T., M.T.             |
      | kepala.kerjasama | Linda Kusuma, S.Sos., M.Si.             |
    Then Seluruh 14 akun persona berhasil terotentikasi dan mengakses dashboard internal

  @positive @ueq @templates @supp-ueq-02
  Scenario: TC-SUPP-UEQ-02 - Akses Formulir Surat dan Ketersediaan 3 Template Resmi UNIK
    Given Staf Unit telah login dengan akun "staff.fik" dan kata sandi "password123"
    When Staf Unit mengakses halaman pembuatan surat keluar "/internal/surats/create"
    And Staf Unit memilih metode pembuatan "template"
    Then Sistem menampilkan pilihan 3 template resmi UNIK:
      | nama_template                                                    |
      | Surat Pemberitahuan Sterilisasi Ruang & Kegiatan Operasional     |
      | Surat Pemberitahuan Penyesuaian Status Keaktifan Dosen (SISTER)  |
      | Surat Pemberitahuan Libur & Cuti Bersama                         |
    When Staf Unit memilih template resmi "Surat Pemberitahuan Sterilisasi Ruang & Kegiatan Operasional"
    Then Banner template terpilih menampilkan nama template dan tombol unduh file word
    And Form me-render field variabel dinamis template sterilisasi ruang
    When Staf Unit mengisi perihal surat dengan "Uji Validasi Template UNIK - Sterilisasi Lab QA"
    And Staf Unit memilih unit tujuan pertama jika belum terisi
    And Staf Unit mengisi seluruh field variabel template yang wajib
    And Staf Unit menekan tombol "Simpan Draft"
    Then Sistem menampilkan notifikasi sukses "Draft berhasil disimpan"
    And Sistem mengalihkan kembali ke daftar draft surat "/internal/surats?scope=draft"
    And Draft surat dengan perihal "Uji Validasi Template UNIK - Sterilisasi Lab QA" muncul pada tabel draft surat

  @teardown @ueq @supp-ueq-03
  Scenario: TC-SUPP-UEQ-03 - Teardown Pembersihan Draft Uji & Konfirmasi Integritas Master Data
    Given Staf Unit telah login dengan akun "staff.fik" dan kata sandi "password123"
    When Staf Unit menghapus draft surat dengan perihal "Uji Validasi Template UNIK - Sterilisasi Lab QA" jika ada
    Then Draft surat pengujian "Uji Validasi Template UNIK - Sterilisasi Lab QA" tidak ada lagi di tabel draft surat
    And Seluruh data master UNIK tetap utuh dan tidak terpengaruh siklus pengujian

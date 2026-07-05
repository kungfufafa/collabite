import type { LegalDocument } from '@/content/legal/types';

export const privacyPolicyDocument: LegalDocument = {
    title: 'Kebijakan Privasi',
    description:
        'Kebijakan ini menjelaskan bagaimana Collabite mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan platform kami.',
    lastUpdated: '5 Juli 2026',
    sections: [
        {
            id: 'pendahuluan',
            title: '1. Pendahuluan',
            paragraphs: [
                'Collabite ("kami") berkomitmen melindungi privasi pengguna platform kolaborasi UMKM dan content creator. Kebijakan Privasi ini berlaku untuk seluruh layanan Collabite, termasuk situs web, portal UMKM, portal Creator, dan fitur terkait.',
                'Dengan mendaftar atau menggunakan Collabite, Anda menyetujui pengumpulan dan penggunaan informasi sesuai kebijakan ini. Jika Anda tidak setuju, mohon tidak menggunakan layanan kami.',
            ],
        },
        {
            id: 'data-yang-dikumpulkan',
            title: '2. Data yang Kami Kumpulkan',
            paragraphs: [
                'Kami mengumpulkan data yang Anda berikan secara langsung saat registrasi, melengkapi profil, membuat campaign, berkolaborasi, mengirim pesan, atau menghubungi dukungan.',
            ],
            listItems: [
                'Identitas akun: nama, alamat email, kata sandi (disimpan dalam bentuk terenkripsi), dan peran (UMKM, Creator, atau Admin).',
                'Profil UMKM: nama usaha, deskripsi, logo, produk, dan informasi kontak bisnis.',
                'Profil Creator: foto profil, headline, kota, kategori, portofolio, dan dokumen verifikasi.',
                'Data kolaborasi: campaign, permintaan kerja sama, pesan, submission konten, ulasan, dan bukti pembayaran manual (jika fitur diaktifkan).',
                'Data teknis: alamat IP, jenis perangkat, log aktivitas, dan cookie sesi untuk keamanan serta autentikasi.',
            ],
        },
        {
            id: 'penggunaan-data',
            title: '3. Cara Kami Menggunakan Data',
            paragraphs: [
                'Data pribadi digunakan untuk menjalankan layanan Collabite, termasuk:',
            ],
            listItems: [
                'Membuat dan mengelola akun Anda.',
                'Menghubungkan UMKM dengan Creator melalui campaign dan kolaborasi.',
                'Menampilkan profil publik Creator dan UMKM sesuai pengaturan visibilitas.',
                'Mengirim notifikasi in-app dan email terkait aktivitas akun.',
                'Memverifikasi identitas Creator dan mencegah penyalahgunaan platform.',
                'Menjaga keamanan, mencegah fraud, dan memenuhi kewajiban hukum.',
            ],
        },
        {
            id: 'berbagi-data',
            title: '4. Berbagi Data dengan Pihak Ketiga',
            paragraphs: [
                'Collabite tidak menjual data pribadi Anda. Data dapat dibagikan dalam situasi terbatas berikut:',
            ],
            listItems: [
                'Antar pengguna platform: informasi profil dan konten kolaborasi yang relevan dengan pihak yang terlibat.',
                'Penyedia infrastruktur: hosting, email, dan penyimpanan file yang membantu operasional layanan.',
                'Kewajiban hukum: jika diwajibkan oleh peraturan perundang-undangan atau proses hukum yang sah.',
            ],
        },
        {
            id: 'penyimpanan-dan-keamanan',
            title: '5. Penyimpanan dan Keamanan',
            paragraphs: [
                'Data disimpan selama akun aktif dan sesuai kebutuhan operasional atau kewajiban hukum. Kami menerapkan langkah keamanan teknis dan organisasi, termasuk enkripsi kata sandi, kontrol akses berbasis peran, dan URL bertanda tangan untuk file privat.',
                'Meskipun kami berupaya melindungi data Anda, tidak ada sistem yang sepenuhnya aman. Segera hubungi kami jika Anda mencurigai akses tidak sah ke akun Anda.',
            ],
        },
        {
            id: 'hak-pengguna',
            title: '6. Hak Anda',
            paragraphs: [
                'Sesuai peraturan perlindungan data yang berlaku, Anda dapat:',
            ],
            listItems: [
                'Mengakses dan memperbarui data profil melalui pengaturan akun.',
                'Meminta penghapusan akun dengan menghubungi tim Collabite.',
                'Menarik persetujuan pemrosesan data tertentu, sejauh tidak mengganggu layanan inti platform.',
                'Mengajukan pertanyaan atau keluhan terkait privasi melalui kontak resmi kami.',
            ],
        },
        {
            id: 'cookie',
            title: '7. Cookie dan Teknologi Serupa',
            paragraphs: [
                'Collabite menggunakan cookie sesi dan token autentikasi yang diperlukan agar Anda tetap login dan platform berfungsi dengan aman. Kami tidak menggunakan cookie pelacakan iklan pihak ketiga pada versi MVP ini.',
            ],
        },
        {
            id: 'perubahan',
            title: '8. Perubahan Kebijakan',
            paragraphs: [
                'Kami dapat memperbarui Kebijakan Privasi ini sewaktu-waktu. Perubahan material akan diinformasikan melalui platform atau email. Tanggal pembaruan terakhir tercantum di bagian atas halaman ini.',
            ],
        },
        {
            id: 'kontak',
            title: '9. Kontak',
            paragraphs: [
                'Untuk pertanyaan privasi atau permintaan terkait data pribadi, hubungi kami di hello@collabite.my.id.',
            ],
        },
    ],
};

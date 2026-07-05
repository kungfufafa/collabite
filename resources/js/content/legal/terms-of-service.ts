import type { LegalDocument } from '@/content/legal/types';

export const termsOfServiceDocument: LegalDocument = {
    title: 'Syarat dan Ketentuan',
    description:
        'Syarat dan Ketentuan ini mengatur penggunaan platform Collabite oleh UMKM, Creator, dan pengunjung. Harap baca dengan saksama sebelum mendaftar.',
    lastUpdated: '5 Juli 2026',
    sections: [
        {
            id: 'pendahuluan',
            title: '1. Pendahuluan',
            paragraphs: [
                'Selamat datang di Collabite. Dengan mengakses atau menggunakan platform ini, Anda setuju terikat oleh Syarat dan Ketentuan ("Ketentuan") berikut.',
                'Collabite adalah platform yang memfasilitasi kolaborasi antara UMKM dan content creator untuk pembuatan dan pengelolaan campaign konten promosi. Collabite bukan pihak dalam kontrak kerja antara UMKM dan Creator, kecuali dinyatakan lain secara eksplisit.',
            ],
        },
        {
            id: 'akun-dan-eligibilitas',
            title: '2. Akun dan Eligibilitas',
            paragraphs: [
                'Untuk menggunakan Collabite, Anda harus:',
            ],
            listItems: [
                'Berusia minimal 18 tahun atau memiliki persetujuan wali yang sah.',
                'Memberikan informasi registrasi yang akurat dan terkini.',
                'Memilih satu peran akun (UMKM atau Creator) dan tidak membuat akun ganda untuk tujuan manipulasi.',
                'Menjaga kerahasiaan kredensial login dan bertanggung jawab atas aktivitas di akun Anda.',
            ],
        },
        {
            id: 'penggunaan-platform',
            title: '3. Penggunaan Platform',
            paragraphs: [
                'Anda setuju untuk tidak:',
            ],
            listItems: [
                'Mengunggah konten ilegal, menyesatkan, mengandung kebencian, atau melanggar hak pihak ketiga.',
                'Menyalahgunakan fitur pesan, ulasan, atau verifikasi.',
                'Mencoba mengakses data atau akun pengguna lain tanpa izin.',
                'Menggunakan bot, scraping, atau metode otomatis yang mengganggu layanan.',
                'Menyamar sebagai pihak lain atau memberikan identitas palsu.',
            ],
        },
        {
            id: 'campaign-dan-kolaborasi',
            title: '4. Campaign dan Kolaborasi',
            paragraphs: [
                'UMKM bertanggung jawab atas keakuratan brief campaign, deadline, dan deliverable yang ditetapkan. Creator bertanggung jawab atas kualitas dan keaslian konten yang diserahkan.',
                'Collabite menyediakan alat komunikasi, submission, dan review, namun tidak menjamin hasil bisnis tertentu dari setiap kolaborasi. Pembatalan kolaborasi mengikuti alur dan status yang tersedia di platform.',
            ],
        },
        {
            id: 'pembayaran',
            title: '5. Pembayaran',
            paragraphs: [
                'Pada versi MVP, Collabite tidak menyediakan payment gateway atau escrow. Jika fitur pembayaran manual diaktifkan, UMKM dan Creator tetap bertanggung jawab atas kesepakatan nominal, metode transfer, dan konfirmasi di luar atau melalui alur bukti yang disediakan platform.',
                'Collabite tidak bertanggung jawab atas sengketa finansial antar pengguna yang terjadi di luar mekanisme resmi platform.',
            ],
        },
        {
            id: 'konten-dan-hak-cipta',
            title: '6. Konten dan Hak Kekayaan Intelektual',
            paragraphs: [
                'Pengguna tetap memegang hak atas konten yang mereka unggah. Dengan mengunggah ke Collabite, Anda memberikan lisensi terbatas kepada kami untuk menampilkan, menyimpan, dan memproses konten tersebut guna menjalankan layanan.',
                'Hak penggunaan konten hasil kolaborasi antara UMKM dan Creator diatur oleh kesepakatan mereka, kecuali diatur lain dalam campaign atau submission yang disetujui di platform.',
            ],
        },
        {
            id: 'moderasi-dan-penangguhan',
            title: '7. Moderasi dan Penangguhan',
            paragraphs: [
                'Collabite berhak meninjau, menyembunyikan, atau menangguhkan akun serta konten yang melanggar Ketentuan, kebijakan komunitas, atau hukum yang berlaku. Keputusan moderasi dapat diambil oleh tim Admin untuk menjaga keamanan ekosistem.',
            ],
        },
        {
            id: 'penafian',
            title: '8. Penafian Jaminan',
            paragraphs: [
                'Platform disediakan "sebagaimana adanya". Collabite tidak memberikan jaminan bahwa layanan bebas gangguan, bebas error, atau selalu tersedia. Kami berupaya menjaga uptime dan keamanan, namun tidak dapat menjamin hasil spesifik dari setiap kolaborasi.',
            ],
        },
        {
            id: 'batas-tanggung-jawab',
            title: '9. Batas Tanggung Jawab',
            paragraphs: [
                'Sejauh diizinkan hukum, Collabite tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data, kehilangan pendapatan, atau sengketa antar pengguna yang timbul dari penggunaan platform.',
            ],
        },
        {
            id: 'perubahan-dan-hukum',
            title: '10. Perubahan Ketentuan dan Hukum yang Berlaku',
            paragraphs: [
                'Kami dapat memperbarui Ketentuan ini. Penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan Anda terhadap versi terbaru.',
                'Ketentuan ini diatur oleh hukum Republik Indonesia. Sengketa akan diselesaikan melalui musyawarah terlebih dahulu; jika tidak tercapai, melalui pengadilan yang berwenang di Indonesia.',
            ],
        },
        {
            id: 'kontak',
            title: '11. Kontak',
            paragraphs: [
                'Pertanyaan terkait Syarat dan Ketentuan dapat dikirim ke hello@collabite.my.id.',
            ],
        },
    ],
};

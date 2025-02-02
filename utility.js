function formatMasaPajak(value){
    // Daftar nama bulan dalam Bahasa Indonesia
    const bulan = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const year = value.substring(0, 4); // Ambil 4 karakter pertama (tahun)
    const monthIndex = parseInt(value.substring(4, 6), 10) - 1; // Ambil 2 karakter berikutnya (bulan)
    return `${bulan[monthIndex]} ${year}`;
}
function formatCurrency(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
function formatDate(dateString){
    return dateString === '-' ? '-'
        : new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
};
function toLowerKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => toLowerKeys(item));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            acc[key.toLowerCase()] = toLowerKeys(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}
function transformDataPemeriksaan(data){
    return data.agg_fiscalyear
        .flatMap((fiscal) =>
            fiscal.details.map((detail) => {
                // Extract data
                const year = fiscal.fiscalyear;
                const jenispemeriksaan = detail.lp2.nm_jns_pemeriksaan; // Lowercase
                const namajenispajakpemeriksaan = detail.lp2.nm_kd_jns_pjk_pemeriksaan; // Lowercase
                const namaKodePemeriksaan = detail.lp2.nm_kd_pemeriksaan ? detail.lp2.nm_kd_pemeriksaan : '';
                const masaPajakAwal = detail.lp2.id_ms_th_pjk_awal
                const masaPajakAkhir = detail.lp2.id_ms_th_pjk_akhir
                const noSp3 = detail.lp2.no_sp3
                // Handle timPemeriksa: Include all unique combinations of nip, nama, and jabatan
                const timpemeriksa = detail.lp2.tims.tim_pemeriksa.map((tim) => ({
                    nip: tim.nip,
                    nama: tim.nama,
                    jabatan: tim.jabatan,
                    noSp2: tim.no_sp2,
                }));

                // Extract hasil_pemeriksaan
                const lppDtl = detail.lpp.lpp_dtls.lpp_dtl;
                const hasilpemeriksaan = Array.isArray(lppDtl)
                    ? lppDtl.map((hasil) => ({
                        id_lpp_d: hasil.id_lpp_d,
                        kd_jns_pjk: hasil.kd_jns_pjk,
                        jml_pokok_pjk: hasil.jml_pokok_pjk,
                        jml_sanksi_adm: hasil.jml_sanksi_adm,
                    }))
                    : lppDtl
                        ? [
                            {
                                id_lpp_d: lppDtl.id_lpp_d,
                                kd_jns_pjk: lppDtl.kd_jns_pjk,
                                jml_pokok_pjk: lppDtl.jml_pokok_pjk,
                                jml_sanksi_adm: lppDtl.jml_sanksi_adm,
                            },
                        ]
                        : [];

                return {
                    year,
                    jenispemeriksaan,
                    namaKodePemeriksaan,
                    noSp3,
                    masaPajakAwal,
                    masaPajakAkhir,
                    namajenispajakpemeriksaan,
                    timpemeriksa,
                    hasilpemeriksaan,
                };
            })
        )
        .sort((a, b) => a.year - b.year); // Sort by year
};

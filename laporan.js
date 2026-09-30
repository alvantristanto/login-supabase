// =========================================
// LAPORAN.JS
// =========================================


// Grafik aktif
let pemasukanChart = null;


// =========================================
// FORMAT RUPIAH
// =========================================

function formatRupiah(nominal) {

    return "Rp " +
        Number(nominal || 0)
            .toLocaleString("id-ID");

}


// =========================================
// AMBIL DATA INVOICE
// =========================================

async function getInvoiceDataLaporan() {

    try {

        const {
            data: userData,
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError || !userData.user) {

            console.error(
                "User belum login:",
                userError
            );

            return [];

        }


        const userId =
            userData.user.id;


        const {
            data,
            error
        } = await supabaseClient
            .from("invoices")
            .select("*")
            .eq("user_id", userId)
            .order("tanggal", {
                ascending: true
            });


        if (error) {

            console.error(
                "Gagal mengambil data invoice:",
                error
            );

            return [];

        }


        return data || [];

    }

    catch (error) {

        console.error(
            "Terjadi kesalahan:",
            error
        );

        return [];

    }

}


// =========================================
// LOAD LAPORAN
// =========================================

async function loadReportLaporan(
    statusFilter = "semua"
) {

    const reportList =
        document.getElementById(
            "reportList"
        );


    if (!reportList) {

        return;

    }


    reportList.innerHTML =
        "Memuat laporan...";


    let data =
        await getInvoiceDataLaporan();


    // =========================================
    // FILTER STATUS
    // =========================================

    if (statusFilter !== "semua") {

        data =
            data.filter(
                invoice =>
                    invoice.status === statusFilter
            );

    }


    // =========================================
    // HITUNG RINGKASAN
    // =========================================

    const totalInvoice =
        data.length;


    let totalPendapatan = 0;

    let totalPemasukan = 0;

    let totalDP = 0;

    let totalLunas = 0;

    let totalBelumBayar = 0;


    data.forEach(
        invoice => {

            const total =
                Number(
                    invoice.total
                ) || 0;


            const nominalDP =
                Number(
                    invoice.nominal_dp
                ) || 0;


            // Total semua invoice
            totalPendapatan += total;


            // LUNAS
            if (
                invoice.status === "Lunas"
            ) {

                totalLunas++;

                totalPemasukan +=
                    total;

            }


            // DP
            else if (
                invoice.status === "DP"
            ) {

                totalDP +=
                    nominalDP;


                totalPemasukan +=
                    nominalDP;

            }


            // BELUM BAYAR
            else if (
                invoice.status ===
                "Belum Bayar"
            ) {

                totalBelumBayar++;

            }

        }
    );


    // =========================================
    // TAMPILKAN RINGKASAN
    // =========================================

    const totalPemasukanElement =
        document.getElementById(
            "totalPemasukan"
        );


    const totalDPElement =
        document.getElementById(
            "totalDP"
        );


    const totalBelumBayarElement =
        document.getElementById(
            "totalBelumBayar"
        );


    const totalInvoiceElement =
        document.getElementById(
            "totalInvoice"
        );


    const totalPendapatanElement =
        document.getElementById(
            "totalPendapatan"
        );


    const totalLunasElement =
        document.getElementById(
            "totalLunas"
        );


    const jumlahBelumBayarElement =
        document.getElementById(
            "jumlahBelumBayar"
        );


    if (totalPemasukanElement) {

        totalPemasukanElement.textContent =
            formatRupiah(
                totalPemasukan
            );

    }


    if (totalDPElement) {

        totalDPElement.textContent =
            formatRupiah(
                totalDP
            );

    }


    if (totalBelumBayarElement) {

        totalBelumBayarElement.textContent =
            totalBelumBayar;

    }


    if (totalInvoiceElement) {

        totalInvoiceElement.textContent =
            totalInvoice;

    }


    if (totalPendapatanElement) {

        totalPendapatanElement.textContent =
            formatRupiah(
                totalPendapatan
            );

    }


    if (totalLunasElement) {

        totalLunasElement.textContent =
            totalLunas;

    }


    if (jumlahBelumBayarElement) {

        jumlahBelumBayarElement.textContent =
            totalBelumBayar;

    }


    // =========================================
    // DATA KOSONG
    // =========================================

    if (
        !data ||
        data.length === 0
    ) {

        reportList.innerHTML =
            "<p>Belum ada data invoice.</p>";

        return;

    }


    // =========================================
    // BUAT TABEL LAPORAN
    // =========================================

    let html = `

        <table class="report-table">

            <thead>

                <tr>

                    <th>No. Invoice</th>

                    <th>Tanggal</th>

                    <th>Customer</th>

                    <th>Produk/Jasa</th>

                    <th>Total</th>

                    <th>Status</th>

                </tr>

            </thead>

            <tbody>

    `;


    data.forEach(
        invoice => {

            html += `

                <tr>

                    <td>
                        ${invoice.nomor_invoice || "-"}
                    </td>


                    <td>
                        ${invoice.tanggal || "-"}
                    </td>


                    <td>
                        ${invoice.customer || "-"}
                    </td>


                    <td>
                        ${invoice.produk_jasa || "-"}
                    </td>


                    <td class="report-total">

                        ${formatRupiah(
                            invoice.total
                        )}

                    </td>


                    <td>

                        ${invoice.status || "-"}

                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    reportList.innerHTML =
        html;

}


// =========================================
// LOAD GRAFIK
// =========================================

async function loadChartLaporan() {

    const filter =
        document.getElementById(
            "filterLaporan"
        );


    const tanggalMulai =
        document.getElementById(
            "tanggalMulai"
        );


    const tanggalSelesai =
        document.getElementById(
            "tanggalSelesai"
        );


    const canvas =
        document.getElementById(
            "pemasukanChart"
        );


    if (
        !filter ||
        !tanggalMulai ||
        !tanggalSelesai ||
        !canvas
    ) {

        console.error(
            "Elemen grafik tidak ditemukan."
        );

        return;

    }


    // Pastikan Chart.js sudah dimuat
    if (
        typeof Chart === "undefined"
    ) {

        console.error(
            "Chart.js belum berhasil dimuat."
        );

        return;

    }


    const periode =
        filter.value;


    let data =
        await getInvoiceDataLaporan();


    // =========================================
    // FILTER TANGGAL
    // =========================================

    if (
        tanggalMulai.value
    ) {

        data =
            data.filter(
                invoice =>
                    invoice.tanggal >=
                    tanggalMulai.value
            );

    }


    if (
        tanggalSelesai.value
    ) {

        data =
            data.filter(
                invoice =>
                    invoice.tanggal <=
                    tanggalSelesai.value
            );

    }


    // =========================================
    // KELOMPOKKAN DATA
    // =========================================

    const kelompokData = {};


    data.forEach(
        invoice => {

            if (
                !invoice.tanggal
            ) {

                return;

            }


            let label;


            // HARIAN
            if (
                periode === "harian"
            ) {

                label =
                    invoice.tanggal;

            }


            // BULANAN
            else {

                label =
                    invoice.tanggal.substring(
                        0,
                        7
                    );

            }


            let pemasukan = 0;


            // Invoice Lunas
            if (
                invoice.status ===
                "Lunas"
            ) {

                pemasukan =
                    Number(
                        invoice.total
                    ) || 0;

            }


            // Invoice DP
            else if (
                invoice.status ===
                "DP"
            ) {

                pemasukan =
                    Number(
                        invoice.nominal_dp
                    ) || 0;

            }


            if (
                !kelompokData[label]
            ) {

                kelompokData[label] = 0;

            }


            kelompokData[label] +=
                pemasukan;

        }
    );


    const labels =
        Object.keys(
            kelompokData
        ).sort();


    const values =
        labels.map(
            label =>
                kelompokData[label]
        );


    // =========================================
    // HAPUS GRAFIK LAMA
    // =========================================

    if (
        pemasukanChart
    ) {

        pemasukanChart.destroy();

    }


    // =========================================
    // BUAT GRAFIK BARU
    // =========================================

    pemasukanChart =
        new Chart(
            canvas,
            {

                type:
                    "bar",


                data: {

                    labels:
                        labels,


                    datasets: [

                        {

                            label:
                                "Pemasukan",


                            data:
                                values,


                            borderWidth:
                                1

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero:
                                true,


                            ticks: {

                                callback:
                                    function(
                                        value
                                    ) {

                                        return (
                                            "Rp " +
                                            Number(
                                                value
                                            ).toLocaleString(
                                                "id-ID"
                                            )
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


// =========================================
// FILTER STATUS
// =========================================

const filterButtonLaporan =
    document.getElementById(
        "filterButton"
    );


if (
    filterButtonLaporan
) {

    filterButtonLaporan.addEventListener(
        "click",
        function() {

            const statusElement =
                document.getElementById(
                    "filterStatus"
                );


            if (
                !statusElement
            ) {

                return;

            }


            loadReportLaporan(
                statusElement.value
            );

        }
    );

}

// =========================================
// FILTER GRAFIK
// =========================================

const filterBtn =
    document.getElementById(
        "filterBtn"
    );


if (
    filterBtn
) {

    filterBtn.addEventListener(
        "click",
        function() {

            loadChartLaporan();

        }
    );

}

// =========================================
// PREVIEW CETAK
// =========================================

const previewPrintBtn =
    document.getElementById(
        "previewPrintBtn"
    );


if (previewPrintBtn) {

    previewPrintBtn.addEventListener(
        "click",
        async function () {

            // Ambil data invoice
            const data =
                await getInvoiceDataLaporan();


            // Ambil ringkasan
            const totalPemasukan =
                document.getElementById(
                    "totalPemasukan"
                ).textContent;


            const totalDP =
                document.getElementById(
                    "totalDP"
                ).textContent;


            const totalBelumBayar =
                document.getElementById(
                    "totalBelumBayar"
                ).textContent;


            const totalInvoice =
                document.getElementById(
                    "totalInvoice"
                ).textContent;


            const totalPendapatan =
                document.getElementById(
                    "totalPendapatan"
                ).textContent;


            const totalLunas =
                document.getElementById(
                    "totalLunas"
                ).textContent;


            // Tanggal saat ini
            const tanggalCetak =
                new Date()
                    .toLocaleDateString(
                        "id-ID",
                        {
                            day: "2-digit",
                            month: "long",
                            year: "numeric"
                        }
                    );


            // Buat tabel invoice
            let tabelInvoice = "";


            if (data.length === 0) {

                tabelInvoice = `
                    <p>
                        Belum ada data invoice.
                    </p>
                `;

            }

            else {

                tabelInvoice = `

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    No. Invoice
                                </th>

                                <th>
                                    Tanggal
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Produk/Jasa
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                `;


                data.forEach(
                    invoice => {

                        tabelInvoice += `

                            <tr>

                                <td>
                                    ${invoice.nomor_invoice || "-"}
                                </td>

                                <td>
                                    ${invoice.tanggal || "-"}
                                </td>

                                <td>
                                    ${invoice.customer || "-"}
                                </td>

                                <td>
                                    ${invoice.produk_jasa || "-"}
                                </td>

                                <td>
                                    ${formatRupiah(
                                        invoice.total
                                    )}
                                </td>

                                <td>
                                    ${invoice.status || "-"}
                                </td>

                            </tr>

                        `;

                    }
                );


                tabelInvoice += `

                        </tbody>

                    </table>

                `;

            }


            // Buka halaman preview
            const previewWindow =
                window.open(
                    "",
                    "_blank"
                );


            if (!previewWindow) {

                alert(
                    "Popup diblokir oleh browser."
                );

                return;

            }


            // Tulis halaman preview
            previewWindow.document.write(`

                <!DOCTYPE html>

                <html lang="id">

                <head>

                    <meta charset="UTF-8">

                    <title>
                        Preview Laporan
                    </title>


                    <style>

                        * {

                            box-sizing:
                                border-box;

                        }


                        body {

                            font-family:
                                Arial,
                                sans-serif;

                            padding:
                                40px;

                            color:
                                #222;

                        }


                        .header {

                            text-align:
                                center;

                            margin-bottom:
                                30px;

                        }


                        .header h1 {

                            margin-bottom:
                                10px;

                        }


                        .tanggal {

                            color:
                                #666;

                        }


                        .summary {

                            display:
                                grid;

                            grid-template-columns:
                                repeat(
                                    3,
                                    1fr
                                );

                            gap:
                                15px;

                            margin-bottom:
                                30px;

                        }


                        .box {

                            border:
                                1px solid #ddd;

                            border-radius:
                                10px;

                            padding:
                                15px;

                        }


                        .box h3 {

                            margin-top:
                                0;

                            font-size:
                                14px;

                        }


                        .box p {

                            font-size:
                                20px;

                            font-weight:
                                bold;

                            margin-bottom:
                                0;

                        }


                        table {

                            width:
                                100%;

                            border-collapse:
                                collapse;

                            margin-top:
                                20px;

                        }


                        th,
                        td {

                            border:
                                1px solid #ddd;

                            padding:
                                10px;

                            text-align:
                                left;

                        }


                        th {

                            background:
                                #f2f2f2;

                        }


                        .buttons {

                            margin-top:
                                30px;

                            text-align:
                                center;

                        }


                        button {

                            padding:
                                12px 25px;

                            cursor:
                                pointer;

                        }


                        @media print {

                            .buttons {

                                display:
                                    none;

                            }


                            body {

                                padding:
                                    0;

                            }

                        }


                        @media screen and (
                            max-width: 700px
                        ) {

                            .summary {

                                grid-template-columns:
                                    1fr;

                            }

                        }

                    </style>

                </head>


                <body>


                    <div class="header">

                        <h1>
                            Laporan Pemasukan
                        </h1>


                        <p class="tanggal">

                            Tanggal laporan:
                            ${tanggalCetak}

                        </p>

                    </div>


                    <!-- RINGKASAN -->

                    <div class="summary">


                        <div class="box">

                            <h3>
                                Total Pemasukan
                            </h3>

                            <p>
                                ${totalPemasukan}
                            </p>

                        </div>


                        <div class="box">

                            <h3>
                                Total DP
                            </h3>

                            <p>
                                ${totalDP}
                            </p>

                        </div>


                        <div class="box">

                            <h3>
                                Belum Bayar
                            </h3>

                            <p>
                                ${totalBelumBayar}
                            </p>

                        </div>


                        <div class="box">

                            <h3>
                                Total Invoice
                            </h3>

                            <p>
                                ${totalInvoice}
                            </p>

                        </div>


                        <div class="box">

                            <h3>
                                Total Pendapatan
                            </h3>

                            <p>
                                ${totalPendapatan}
                            </p>

                        </div>


                        <div class="box">

                            <h3>
                                Invoice Lunas
                            </h3>

                            <p>
                                ${totalLunas}
                            </p>

                        </div>


                    </div>


                    <h2>
                        Daftar Invoice
                    </h2>


                    ${tabelInvoice}


                    <div class="buttons">

                        <button
                            onclick="window.print()"
                        >
                            🖨 Print Laporan
                        </button>

                    </div>


                </body>

                </html>

            `);


            previewWindow.document.close();

        }
    );

}

// =========================================
// PRINT
// =========================================

const printBtn =
    document.getElementById(
        "printBtn"
    );


if (printBtn) {

    printBtn.addEventListener(
        "click",
        function() {

            window.print();

        }
    );

}

// =========================================
// DOWNLOAD PDF
// =========================================

const downloadPdfBtn =
    document.getElementById(
        "downloadPdfBtn"
    );


if (
    downloadPdfBtn
) {

    downloadPdfBtn.addEventListener(
        "click",
        function() {

            if (
                !window.jspdf
            ) {

                alert(
                    "Library PDF belum berhasil dimuat."
                );

                return;

            }


            const {
                jsPDF
            } =
                window.jspdf;


            const doc =
                new jsPDF();


            const totalPemasukan =
                document.getElementById(
                    "totalPemasukan"
                ).textContent;


            const totalDP =
                document.getElementById(
                    "totalDP"
                ).textContent;


            const totalBelumBayar =
                document.getElementById(
                    "totalBelumBayar"
                ).textContent;


            doc.setFontSize(
                20
            );


            doc.text(
                "Laporan Pemasukan",
                20,
                20
            );


            doc.setFontSize(
                12
            );


            doc.text(
                "Total Pemasukan: " +
                totalPemasukan,
                20,
                45
            );


            doc.text(
                "Total DP: " +
                totalDP,
                20,
                60
            );


            doc.text(
                "Belum Bayar: " +
                totalBelumBayar,
                20,
                75
            );


            doc.save(
                "laporan-pemasukan.pdf"
            );

        }
    );

}

// =========================================
// KIRIM EMAIL
// =========================================

const emailBtnLaporan =
    document.getElementById("emailBtn");

if (emailBtnLaporan) {

    emailBtnLaporan.addEventListener(
        "click",
        function () {

            const totalPemasukanElement =
                document.getElementById(
                    "totalPemasukan"
                );

            const totalPemasukan =
                totalPemasukanElement
                    ? totalPemasukanElement.textContent
                    : "Rp 0";


            const subject =
                encodeURIComponent(
                    "Laporan Pemasukan"
                );


            const body =
                encodeURIComponent(
                    "Halo,\n\n" +
                    "Berikut informasi laporan pemasukan.\n\n" +
                    "Total Pemasukan: " +
                    totalPemasukan +
                    "\n\n" +
                    "Terima kasih."
                );


            window.open(
    "https://mail.google.com/mail/?view=cm&fs=1" +
    "&su=" + subject +
    "&body=" + body,
    "_blank"
);

        }
    );

}

// =========================================
// COPY LINK
// =========================================

const copyLinkBtn =
    document.getElementById(
        "copyLinkBtn"
    );


if (
    copyLinkBtn
) {

    copyLinkBtn.addEventListener(
        "click",
        async function() {

            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );


                alert(
                    "Link berhasil disalin."
                );

            }

            catch (
                error
            ) {

                console.error(
                    error
                );


                // Cadangan jika clipboard gagal
                const textArea =
                    document.createElement(
                        "textarea"
                    );


                textArea.value =
                    window.location.href;


                document.body.appendChild(
                    textArea
                );


                textArea.select();


                document.execCommand(
                    "copy"
                );


                document.body.removeChild(
                    textArea
                );


                alert(
                    "Link berhasil disalin."
                );

            }

        }
    );

}


// =========================================
// JALANKAN SAAT HALAMAN DIBUKA
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await loadReportLaporan();

        await loadChartLaporan();

    }
);
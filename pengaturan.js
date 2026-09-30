// =========================================
// PENGATURAN.JS
// =========================================


// =========================================
// AMBIL DATA PENGATURAN
// =========================================

async function loadPengaturan() {

    const namaBank =
        document.getElementById(
            "namaBank"
        );


    const noRek =
        document.getElementById(
            "noRek"
        );


    const namaRekening =
        document.getElementById(
            "namaRekening"
        );


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("pengaturan")
            .select("*")
            .limit(1);


        if (error) {

            console.error(
                "Gagal mengambil pengaturan:",
                error
            );

            return;

        }


        if (
            data &&
            data.length > 0
        ) {

            const pengaturan =
                data[0];


            if (namaBank) {

                namaBank.value =
                    pengaturan.nama_bank || "";

            }


            if (noRek) {

                noRek.value =
                    pengaturan.no_rek || "";

            }


            if (namaRekening) {

                namaRekening.value =
                    pengaturan.nama_rekening || "";

            }

        }

    }

    catch (error) {

        console.error(
            "Terjadi kesalahan:",
            error
        );

    }

}


// =========================================
// SIMPAN PENGATURAN
// =========================================

const settingsForm =
    document.getElementById(
        "settingsForm"
    );


if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const namaBank =
                document.getElementById(
                    "namaBank"
                ).value.trim();


            const noRek =
                document.getElementById(
                    "noRek"
                ).value.trim();


            const namaRekening =
                document.getElementById(
                    "namaRekening"
                ).value.trim();


            const settingsMessage =
                document.getElementById(
                    "settingsMessage"
                );


            if (settingsMessage) {

                settingsMessage.textContent =
                    "Menyimpan...";

            }


            try {

                // Cek apakah data sudah ada
                const {
                    data: dataLama,
                    error: errorCek
                } = await supabaseClient
                    .from("pengaturan")
                    .select("*")
                    .limit(1);


                if (errorCek) {

                    console.error(
                        errorCek
                    );

                    throw errorCek;

                }


                let error;


                // =========================================
                // JIKA DATA SUDAH ADA → UPDATE
                // =========================================

                if (
                    dataLama &&
                    dataLama.length > 0
                ) {

                    const id =
                        dataLama[0].id;


                    const hasil =
                        await supabaseClient
                            .from("pengaturan")
                            .update({

                                nama_bank:
                                    namaBank,

                                no_rek:
                                    noRek,

                                nama_rekening:
                                    namaRekening

                            })
                            .eq(
                                "id",
                                id
                            );


                    error =
                        hasil.error;

                }


                // =========================================
                // JIKA BELUM ADA → INSERT
                // =========================================

                else {

                    const hasil =
                        await supabaseClient
                            .from("pengaturan")
                            .insert([

                                {

                                    nama_bank:
                                        namaBank,

                                    no_rek:
                                        noRek,

                                    nama_rekening:
                                        namaRekening

                                }

                            ]);


                    error =
                        hasil.error;

                }


                if (error) {

                    throw error;

                }


                if (settingsMessage) {

                    settingsMessage.textContent =
                        "Pengaturan berhasil disimpan.";

                }


                // Muat ulang data
                loadPengaturan();

            }

            catch (error) {

                console.error(
                    "Gagal menyimpan:",
                    error
                );


                if (settingsMessage) {

                    settingsMessage.textContent =
                        "Gagal menyimpan pengaturan.";

                }

            }

        }
    );

}


// =========================================
// JALANKAN SAAT HALAMAN DIBUKA
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadPengaturan();

    }
);
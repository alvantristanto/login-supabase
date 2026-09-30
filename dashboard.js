// =========================================
// KONFIGURASI SUPABASE
// =========================================

const SUPABASE_URL =
    "https://vlgfkajzlgujfqlcixrn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_tDOY85-rzUERbhEN3WzCoA_bP5Xs6hQ";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================================
// CEK AKSES LOGIN
// =========================================

async function cekAkses() {

    const {
        data: userData,
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !userData.user) {

        window.location.href =
            "index.html";

        return;
    }


    const user =
        userData.user;


    const {
        data: profile,
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();


    if (profileError || !profile) {

        alert(
            "Data role pengguna tidak ditemukan."
        );

        await supabaseClient.auth.signOut();

        window.location.href =
            "index.html";

        return;
    }


    const role =
        profile.role;


    // =========================================
    // TAMPILKAN EMAIL USER
    // =========================================

    const userEmail =
        document.getElementById(
            "userEmail"
        );


    if (userEmail) {

        userEmail.textContent =
            "Email: " + user.email;
    }


    // =========================================
    // CEK HALAMAN YANG SEDANG DIBUKA
    // =========================================

    const halamanSekarang =
        window.location.pathname;


    // =========================================
    // HALAMAN KHUSUS ADMIN
    // =========================================

    const halamanAdmin = [

        "admin.html",

        "invoice.html",

        "customer.html",

        "produk.html",

        "laporan.html"

    ];


    const adalahHalamanAdmin =
        halamanAdmin.some(
            halaman =>
                halamanSekarang.endsWith(
                    halaman
                )
        );


    if (
        adalahHalamanAdmin &&
        role !== "admin"
    ) {

        alert(
            "Akses ditolak. Halaman ini khusus Admin."
        );

        window.location.href =
            "index.html";

        return;
    }


    // =========================================
    // HALAMAN KHUSUS SALES
    // =========================================

    if (
        halamanSekarang.endsWith(
            "sales.html"
        )
    ) {

        if (role !== "sales") {

            alert(
                "Akses ditolak. Halaman ini khusus Sales."
            );

            window.location.href =
                "index.html";

            return;
        }
    }

}


// =========================================
// LOGOUT
// =========================================

async function logout() {

    const {
        error
    } = await supabaseClient
        .auth
        .signOut();


    if (error) {

        alert(
            "Logout gagal: " +
            error.message
        );

        return;
    }


    window.location.href =
        "index.html";
}


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );

}


// =========================================
// PENGATURAN
// TABEL: pengaturan
// =========================================

async function loadSettings() {

    const settingsForm =
        document.getElementById(
            "settingsForm"
        );


    if (!settingsForm) {
        return;
    }


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


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        console.error(
            "User belum login:",
            userError
        );

        return;
    }


    const userId =
        userData.user.id;


    const {
        data,
        error
    } = await supabaseClient
        .from("pengaturan")
        .select("*")
        .eq(
            "user_id",
            userId
        )
        .maybeSingle();


    if (error) {

        console.error(
            "Gagal mengambil pengaturan:",
            error
        );

        return;
    }


    if (data) {

        namaBank.value =
            data.nama_bank || "";


        noRek.value =
            data.no_rek || "";


        namaRekening.value =
            data.nama_rekening || "";
    }

}


// =========================================
// SIMPAN PENGATURAN
// =========================================

async function saveSettings(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "settingsMessage"
        );


    const namaBank =
        document.getElementById(
            "namaBank"
        )
        .value
        .trim();


    const noRek =
        document.getElementById(
            "noRek"
        )
        .value
        .trim();


    const namaRekening =
        document.getElementById(
            "namaRekening"
        )
        .value
        .trim();


    if (
        !namaBank ||
        !noRek ||
        !namaRekening
    ) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Semua data wajib diisi.";
        }

        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Anda belum login.";
        }

        return;
    }


    const userId =
        userData.user.id;


    // =========================================
    // CEK DATA PENGATURAN
    // =========================================

    const {
        data: existingData,
        error: existingError
    } = await supabaseClient
        .from("pengaturan")
        .select("id")
        .eq(
            "user_id",
            userId
        )
        .maybeSingle();


    if (existingError) {

        console.error(
            existingError
        );

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Gagal memeriksa data.";
        }

        return;
    }


    let result;


    // =========================================
    // UPDATE
    // =========================================

    if (existingData) {

        result =
            await supabaseClient
                .from("pengaturan")
                .update({

                    nama_bank:
                        namaBank,

                    no_rek:
                        noRek,

                    nama_rekening:
                        namaRekening,

                    updated_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    existingData.id
                );

    }


    // =========================================
    // INSERT
    // =========================================

    else {

        result =
            await supabaseClient
                .from("pengaturan")
                .insert({

                    user_id:
                        userId,

                    nama_bank:
                        namaBank,

                    no_rek:
                        noRek,

                    nama_rekening:
                        namaRekening

                });

    }


    if (result.error) {

        console.error(
            "Gagal menyimpan:",
            result.error
        );


        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Gagal menyimpan pengaturan.";
        }

        return;
    }


    if (message) {

        message.style.color =
            "green";

        message.textContent =
            "Pengaturan berhasil disimpan!";
    }

}


const settingsForm =
    document.getElementById(
        "settingsForm"
    );


if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        saveSettings
    );


    loadSettings();

}


// =========================================
// INVOICE
// =========================================

async function saveInvoice(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "invoiceMessage"
        );


    const nomorInvoice =
        document.getElementById(
            "nomorInvoice"
        )
        .value
        .trim();


    const tanggal =
        document.getElementById(
            "tanggalInvoice"
        )
        .value;


    const customer =
        document.getElementById(
            "customer"
        )
        .value
        .trim();


    const produkJasa =
        document.getElementById(
            "produkJasa"
        )
        .value
        .trim();


    const jumlah =
        Number(
            document.getElementById(
                "jumlah"
            )
            .value
        );


    const hargaInput =
        document.getElementById(
            "harga"
        );


    const harga =
        Number(
            hargaInput.value
                .replace(
                    /\./g,
                    ""
                )
        );


    const status =
        document.getElementById(
            "status"
        )
        .value;


    const nominalDPInput =
        document.getElementById(
            "nominalDP"
        );


    const nominalDP =
        nominalDPInput
            ? Number(
                nominalDPInput.value
                    .replace(
                        /\./g,
                        ""
                    )
            )
            : 0;


    const total =
        jumlah * harga;


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Sesi login tidak ditemukan.";
        }

        return;
    }


    const userId =
        userData.user.id;


    const form =
    document.getElementById(
        "invoiceForm"
    );


const editingId =
    form.dataset.editingId;


let error;


// =========================================
// UPDATE INVOICE
// =========================================

if (editingId) {

    const result =
        await supabaseClient
            .from("invoices")
            .update({

                nomor_invoice:
                    nomorInvoice,

                tanggal:
                    tanggal,

                customer:
                    customer,

                produk_jasa:
                    produkJasa,

                jumlah:
                    jumlah,

                harga:
                    harga,

                total:
                    total,

                status:
                    status,

                nominal_dp:
                    status === "DP"
                        ? nominalDP
                        : 0

            })
            .eq(
                "id",
                editingId
            )
            .eq(
                "user_id",
                userId
            );


    error =
        result.error;

}


// =========================================
// TAMBAH INVOICE BARU
// =========================================

else {

    const result =
        await supabaseClient
            .from("invoices")
            .insert({

                user_id:
                    userId,

                nomor_invoice:
                    nomorInvoice,

                tanggal:
                    tanggal,

                customer:
                    customer,

                produk_jasa:
                    produkJasa,

                jumlah:
                    jumlah,

                harga:
                    harga,

                total:
                    total,

                status:
                    status,

                nominal_dp:
                    status === "DP"
                        ? nominalDP
                        : 0

            });


    error =
        result.error;

}


    if (error) {

        console.error(
            error
        );


        if (message) {

            message.style.color =
                "red";

            message.textContent =
                "Gagal menyimpan invoice.";
        }

        return;
    }


   if (message) {

    message.style.color =
        "green";

    message.textContent =
        editingId
            ? "Invoice berhasil diperbarui."
            : "Invoice berhasil disimpan.";
}


    document.getElementById(
        "invoiceForm"
    )
    .reset();

form.dataset.editingId =
    "";

    const jumlahInput =
        document.getElementById(
            "jumlah"
        );

        const submitButton =
    document.querySelector(
        "#invoiceForm button[type='submit']"
    );


if (submitButton) {

    submitButton.textContent =
        "Simpan Invoice";

}


    if (jumlahInput) {

        jumlahInput.value =
            1;
    }


    await loadInvoices();

}


// =========================================
// TAMPILKAN INVOICE
// =========================================

async function loadInvoices() {

    const invoiceList =
        document.getElementById(
            "invoiceList"
        );


    if (!invoiceList) {
        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        invoiceList.textContent =
            "User belum login.";

        return;
    }


    const userId =
        userData.user.id;


    const {
        data,
        error
    } = await supabaseClient
        .from("invoices")
        .select("*")
        .eq(
            "user_id",
            userId
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            error
        );

        invoiceList.textContent =
            "Gagal mengambil data invoice.";

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        invoiceList.textContent =
            "Belum ada invoice.";

        return;
    }


    let html = `

        <table class="invoice-table">

            <thead>

                <tr>

                    <th>No. Invoice</th>
                    <th>Tanggal</th>
                    <th>Customer</th>
                    <th>Produk/Jasa</th>
                    <th>Jumlah</th>
                    <th>Harga</th>
                    <th>Total</th>
                    <th>DP</th>
                    <th>Status</th>
                    <th>Aksi</th>

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

                    <td>
                        ${invoice.jumlah || 0}
                    </td>

                    <td>

                        Rp ${Number(
                            invoice.harga || 0
                        ).toLocaleString("id-ID")}

                    </td>

                    <td>

                        Rp ${Number(
                            invoice.total || 0
                        ).toLocaleString("id-ID")}

                    </td>

                    <td>

                        Rp ${Number(
                            invoice.nominal_dp || 0
                        ).toLocaleString("id-ID")}

                    </td>

                    <td>

                        <span class="status">

                            ${invoice.status || "-"}

                        </span>

                    </td>

 <td class="invoice-actions">

    <button onclick="editInvoice('${invoice.id}')">
        🖊 Edit
    </button>

   <button
    class="invoice-delete"
    onclick="deleteInvoice('${invoice.id}')"
>
    🗑 Hapus
</button>

</td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    invoiceList.innerHTML =
        html;

}


const invoiceForm =
    document.getElementById(
        "invoiceForm"
    );


if (invoiceForm) {

    invoiceForm.addEventListener(
        "submit",
        saveInvoice
    );


    loadInvoices();

}


// =========================================
// FORMAT HARGA INVOICE
// =========================================

const hargaInput =
    document.getElementById(
        "harga"
    );


if (hargaInput) {

    hargaInput.addEventListener(
        "input",
        function () {

            let angka =
                this.value.replace(
                    /\D/g,
                    ""
                );


            if (angka === "") {

                this.value =
                    "";

                return;
            }


            this.value =
                Number(
                    angka
                )
                .toLocaleString(
                    "id-ID"
                );

        }
    );

}


// =========================================
// HAPUS INVOICE
// =========================================

async function deleteInvoice(invoiceId) {

    const yakin =
        confirm(
            "Apakah kamu yakin ingin menghapus invoice ini?"
        );


    if (!yakin) {
        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "Sesi login tidak ditemukan."
        );

        window.location.href =
            "index.html";

        return;
    }


    const userId =
        userData.user.id;


    const {
        error
    } = await supabaseClient
        .from("invoices")
        .delete()
        .eq(
            "id",
            invoiceId
        )
        .eq(
            "user_id",
            userId
        );


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal menghapus invoice: " +
            error.message
        );

        return;
    }


    alert(
        "Invoice berhasil dihapus."
    );


    await loadInvoices();

}
// =========================================
// EDIT INVOICE
// =========================================

async function editInvoice(invoiceId) {


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "Sesi login tidak ditemukan."
        );

        return;

    }


    const userId =
        userData.user.id;


    // =========================================
    // AMBIL DATA INVOICE
    // =========================================

    const {
        data,
        error
    } = await supabaseClient
        .from("invoices")
        .select("*")
        .eq(
            "id",
            invoiceId
        )
        .eq(
            "user_id",
            userId
        )
        .single();


    if (error) {

        console.error(
            error
        );


        alert(
            "Gagal mengambil data invoice."
        );

        return;

    }


    // =========================================
    // MASUKKAN DATA KE FORM
    // =========================================

    document.getElementById(
        "nomorInvoice"
    )
    .value =
        data.nomor_invoice || "";


    document.getElementById(
        "tanggalInvoice"
    )
    .value =
        data.tanggal || "";


    document.getElementById(
        "customer"
    )
    .value =
        data.customer || "";


    document.getElementById(
        "produkJasa"
    )
    .value =
        data.produk_jasa || "";


    document.getElementById(
        "jumlah"
    )
    .value =
        data.jumlah || 1;


    document.getElementById(
        "harga"
    )
    .value =
        Number(
            data.harga || 0
        )
        .toLocaleString(
            "id-ID"
        );


    document.getElementById(
        "status"
    )
    .value =
        data.status || "";


    document.getElementById(
        "nominalDP"
    )
    .value =
        Number(
            data.nominal_dp || 0
        )
        .toLocaleString(
            "id-ID"
        );


    // =========================================
    // AKTIFKAN MODE EDIT
    // =========================================

    const form =
        document.getElementById(
            "invoiceForm"
        );


    form.dataset.editingId =
        invoiceId;


    // =========================================
    // UBAH TULISAN TOMBOL
    // =========================================

    const submitButton =
        document.querySelector(
            "#invoiceForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.textContent =
            "Update Invoice";

    }


    // =========================================
    // SCROLL KE FORM
    // =========================================

    form.scrollIntoView({

        behavior:
            "smooth"

    });


}


// =========================================
// CUSTOMER - SIMPAN DAN UPDATE
// =========================================

async function saveCustomer(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "customerMessage"
        );


    const nama =
        document.getElementById(
            "customerNama"
        )
        .value
        .trim();


    const noHp =
        document.getElementById(
            "customerNoHp"
        )
        .value
        .trim();


    const email =
        document.getElementById(
            "customerEmail"
        )
        .value
        .trim();


    const alamat =
        document.getElementById(
            "customerAlamat"
        )
        .value
        .trim();


    const catatan =
        document.getElementById(
            "customerCatatan"
        )
        .value
        .trim();


    if (!nama) {

        message.style.color =
            "red";

        message.textContent =
            "Nama customer wajib diisi.";

        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        message.style.color =
            "red";

        message.textContent =
            "Sesi login tidak ditemukan.";

        return;
    }


    const userId =
        userData.user.id;


    const form =
        document.getElementById(
            "customerForm"
        );


    const editingId =
        form.dataset.editingId;


    let error;


    // =========================================
    // UPDATE CUSTOMER
    // =========================================

    if (editingId) {

        const result =
            await supabaseClient
                .from("customers")
                .update({

                    nama:
                        nama,

                    no_hp:
                        noHp,

                    email:
                        email,

                    alamat:
                        alamat,

                    catatan:
                        catatan

                })
                .eq(
                    "id",
                    editingId
                )
                .eq(
                    "user_id",
                    userId
                );


        error =
            result.error;

    }


    // =========================================
    // TAMBAH CUSTOMER
    // =========================================

    else {

        const result =
            await supabaseClient
                .from("customers")
                .insert({

                    user_id:
                        userId,

                    nama:
                        nama,

                    no_hp:
                        noHp,

                    email:
                        email,

                    alamat:
                        alamat,

                    catatan:
                        catatan

                });


        error =
            result.error;

    }


    if (error) {

        console.error(
            error
        );


        message.style.color =
            "red";


        message.textContent =
            "Gagal menyimpan customer.";

        return;
    }


    message.style.color =
        "green";


    message.textContent =
        editingId
            ? "Customer berhasil diperbarui."
            : "Customer berhasil disimpan.";


    form.reset();


    form.dataset.editingId =
        "";


    const submitButton =
        document.querySelector(
            "#customerForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.textContent =
            "Simpan Customer";
    }


    await loadCustomers();

}


// =========================================
// TAMPILKAN CUSTOMER
// =========================================

async function loadCustomers() {

    const customerList =
        document.getElementById(
            "customerList"
        );


    if (!customerList) {
        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        customerList.textContent =
            "User belum login.";

        return;
    }


    const userId =
        userData.user.id;


    const {
        data,
        error
    } = await supabaseClient
        .from("customers")
        .select("*")
        .eq(
            "user_id",
            userId
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            error
        );


        customerList.textContent =
            "Gagal mengambil data customer.";

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        customerList.textContent =
            "Belum ada customer.";

        return;
    }


    let html = `

        <table class="customer-table">

            <thead>

                <tr>

                    <th>Nama</th>
                    <th>No. HP</th>
                    <th>Email</th>
                    <th>Alamat</th>
                    <th>Catatan</th>
                    <th>Aksi</th>

                </tr>

            </thead>

            <tbody>

    `;


    data.forEach(
        customer => {

            html += `

                <tr>

                    <td>
                        ${customer.nama}
                    </td>

                    <td>
                        ${customer.no_hp || "-"}
                    </td>

                    <td>
                        ${customer.email || "-"}
                    </td>

                    <td>
                        ${customer.alamat || "-"}
                    </td>

                    <td>
                        ${customer.catatan || "-"}
                    </td>

                    <td>

                        <button
                            class="customer-edit"
                            onclick="editCustomer(${customer.id})"
                        >

                            ✏️ Edit

                        </button>

                        <button
                            class="customer-delete"
                            onclick="deleteCustomer(${customer.id})"
                        >

                            🗑 Hapus

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    customerList.innerHTML =
        html;

}


// =========================================
// EDIT CUSTOMER
// =========================================

async function editCustomer(customerId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("customers")
        .select("*")
        .eq(
            "id",
            customerId
        )
        .single();


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal mengambil data customer."
        );

        return;
    }


    document.getElementById(
        "customerNama"
    )
    .value =
        data.nama || "";


    document.getElementById(
        "customerNoHp"
    )
    .value =
        data.no_hp || "";


    document.getElementById(
        "customerEmail"
    )
    .value =
        data.email || "";


    document.getElementById(
        "customerAlamat"
    )
    .value =
        data.alamat || "";


    document.getElementById(
        "customerCatatan"
    )
    .value =
        data.catatan || "";


    const form =
        document.getElementById(
            "customerForm"
        );


    form.dataset.editingId =
        customerId;


    const submitButton =
        document.querySelector(
            "#customerForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.textContent =
            "Update Customer";
    }


    form.scrollIntoView({

        behavior:
            "smooth"

    });

}


// =========================================
// HAPUS CUSTOMER
// =========================================

async function deleteCustomer(customerId) {

    const yakin =
        confirm(
            "Apakah kamu yakin ingin menghapus customer ini?"
        );


    if (!yakin) {
        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "Sesi login tidak ditemukan."
        );

        return;
    }


    const userId =
        userData.user.id;


    const {
        error
    } = await supabaseClient
        .from("customers")
        .delete()
        .eq(
            "id",
            customerId
        )
        .eq(
            "user_id",
            userId
        );


    if (error) {

        console.error(
            error
        );


        alert(
            "Gagal menghapus customer: " +
            error.message
        );

        return;
    }


    alert(
        "Customer berhasil dihapus."
    );


    await loadCustomers();

}


const customerForm =
    document.getElementById(
        "customerForm"
    );


if (customerForm) {

    customerForm.addEventListener(
        "submit",
        saveCustomer
    );


    loadCustomers();

}


// =========================================
// PRODUK / JASA - SIMPAN
// =========================================

async function saveProduct(event) {

    event.preventDefault();


    const message =
        document.getElementById(
            "productMessage"
        );


    const nama =
        document.getElementById(
            "productNama"
        )
        .value
        .trim();


    const jenis =
        document.getElementById(
            "productJenis"
        )
        .value;


    const harga =
        Number(

            document
                .getElementById(
                    "productHarga"
                )
                .value
                .replace(
                    /\./g,
                    ""
                )

        );


    const deskripsi =
        document.getElementById(
            "productDeskripsi"
        )
        .value
        .trim();


    if (
        !nama ||
        !jenis
    ) {

        message.style.color =
            "red";

        message.textContent =
            "Nama dan jenis wajib diisi.";

        return;
    }


    if (
        isNaN(harga) ||
        harga < 0
    ) {

        message.style.color =
            "red";

        message.textContent =
            "Harga tidak valid.";

        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        message.style.color =
            "red";

        message.textContent =
            "Sesi login tidak ditemukan.";

        return;
    }


    const userId =
        userData.user.id;


    const form =
        document.getElementById(
            "productForm"
        );


    const editingId =
        form.dataset.editingId;


    let error;


    // UPDATE
    if (editingId) {

        const result =
            await supabaseClient
                .from("products")
                .update({

                    nama:
                        nama,

                    jenis:
                        jenis,

                    harga:
                        harga,

                    deskripsi:
                        deskripsi,

                    updated_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    editingId
                )
                .eq(
                    "user_id",
                    userId
                );


        error =
            result.error;

    }


    // INSERT
    else {

        const result =
            await supabaseClient
                .from("products")
                .insert({

                    user_id:
                        userId,

                    nama:
                        nama,

                    jenis:
                        jenis,

                    harga:
                        harga,

                    deskripsi:
                        deskripsi

                });


        error =
            result.error;

    }


    if (error) {

        console.error(
            error
        );


        message.style.color =
            "red";


        message.textContent =
            "Gagal menyimpan produk/jasa.";

        return;
    }


    message.style.color =
        "green";


    message.textContent =
        editingId
            ? "Produk/jasa berhasil diperbarui."
            : "Produk/jasa berhasil disimpan.";


    form.reset();


    form.dataset.editingId =
        "";


    const submitButton =
        document.querySelector(
            "#productForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.textContent =
            "Simpan Produk / Jasa";
    }


    await loadProducts();

}


// =========================================
// TAMPILKAN PRODUK
// =========================================

async function loadProducts() {

    const productList =
        document.getElementById(
            "productList"
        );


    if (!productList) {
        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        productList.textContent =
            "User belum login.";

        return;
    }


    const userId =
        userData.user.id;


    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .eq(
            "user_id",
            userId
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            error
        );


        productList.textContent =
            "Gagal mengambil data produk/jasa.";

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        productList.textContent =
            "Belum ada produk/jasa.";

        return;
    }


    let html = `

        <table class="product-table">

            <thead>

                <tr>

                    <th>Nama</th>
                    <th>Jenis</th>
                    <th>Harga</th>
                    <th>Deskripsi</th>
                    <th>Aksi</th>

                </tr>

            </thead>

            <tbody>

    `;


    data.forEach(
        product => {

            html += `

                <tr>

                    <td>
                        ${product.nama}
                    </td>

                    <td>
                        ${product.jenis}
                    </td>

                    <td>

                        Rp ${Number(
                            product.harga || 0
                        ).toLocaleString("id-ID")}

                    </td>

                    <td>
                        ${product.deskripsi || "-"}
                    </td>

                    <td>

                        <button
                            class="product-edit"
                            onclick="editProduct(${product.id})"
                        >

                            ✏️ Edit

                        </button>

                        <button
                            class="product-delete"
                            onclick="deleteProduct(${product.id})"
                        >

                            🗑 Hapus

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    productList.innerHTML =
        html;

}


// =========================================
// EDIT PRODUK
// =========================================

async function editProduct(productId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .eq(
            "id",
            productId
        )
        .single();


    if (error) {

        console.error(
            error
        );

        alert(
            "Gagal mengambil data produk/jasa."
        );

        return;
    }


    document.getElementById(
        "productNama"
    )
    .value =
        data.nama || "";


    document.getElementById(
        "productJenis"
    )
    .value =
        data.jenis || "";


    document.getElementById(
        "productHarga"
    )
    .value =
        Number(
            data.harga || 0
        )
        .toLocaleString(
            "id-ID"
        );


    document.getElementById(
        "productDeskripsi"
    )
    .value =
        data.deskripsi || "";


    const form =
        document.getElementById(
            "productForm"
        );


    form.dataset.editingId =
        productId;


    const submitButton =
        document.querySelector(
            "#productForm button[type='submit']"
        );


    if (submitButton) {

        submitButton.textContent =
            "Update Produk / Jasa";
    }


    form.scrollIntoView({

        behavior:
            "smooth"

    });

}


// =========================================
// HAPUS PRODUK
// =========================================

async function deleteProduct(productId) {

    const yakin =
        confirm(
            "Apakah kamu yakin menghapus produk/jasa ini?"
        );


    if (!yakin) {
        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        alert(
            "Sesi login tidak ditemukan."
        );

        return;
    }


    const userId =
        userData.user.id;


    const {
        error
    } = await supabaseClient
        .from("products")
        .delete()
        .eq(
            "id",
            productId
        )
        .eq(
            "user_id",
            userId
        );


    if (error) {

        console.error(
            error
        );


        alert(
            "Gagal menghapus produk/jasa: " +
            error.message
        );

        return;
    }


    alert(
        "Produk/jasa berhasil dihapus."
    );


    await loadProducts();

}


// =========================================
// FORMAT HARGA PRODUK
// =========================================

const productHargaInput =
    document.getElementById(
        "productHarga"
    );


if (productHargaInput) {

    productHargaInput.addEventListener(
        "input",
        function () {

            let angka =
                this.value.replace(
                    /\D/g,
                    ""
                );


            if (angka === "") {

                this.value =
                    "";

                return;
            }


            this.value =
                Number(
                    angka
                )
                .toLocaleString(
                    "id-ID"
                );

        }
    );

}


const productForm =
    document.getElementById(
        "productForm"
    );


if (productForm) {

    productForm.addEventListener(
        "submit",
        saveProduct
    );


    loadProducts();

}


// =========================================
// LAPORAN DASAR
// =========================================

async function loadReport(
    statusFilter = "semua"
) {

    const reportList =
        document.getElementById(
            "reportList"
        );


    if (!reportList) {
        return;
    }


    const {
        data: userData,
        error: userError
    } = await supabaseClient
        .auth
        .getUser();


    if (
        userError ||
        !userData.user
    ) {

        reportList.textContent =
            "User belum login.";

        return;
    }


    const userId =
        userData.user.id;


    let query =
        supabaseClient
            .from("invoices")
            .select("*")
            .eq(
                "user_id",
                userId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (
        statusFilter !== "semua"
    ) {

        query =
            query.eq(
                "status",
                statusFilter
            );
    }


    const {
        data,
        error
    } = await query;


    if (error) {

        console.error(
            error
        );


        reportList.textContent =
            "Gagal mengambil data laporan.";

        return;
    }


    // =========================================
    // RINGKASAN
    // =========================================

    const totalInvoice =
        data.length;


    let totalPendapatan =
        0;


    let totalLunas =
        0;


    let totalBelumBayar =
        0;


    data.forEach(
        invoice => {

            const total =
                Number(
                    invoice.total
                ) || 0;


            totalPendapatan +=
                total;


            if (
                invoice.status ===
                "Lunas"
            ) {

                totalLunas++;

            }

            else {

                totalBelumBayar++;

            }

        }
    );


    const totalInvoiceElement =
        document.getElementById(
            "totalInvoice"
        );


    if (totalInvoiceElement) {

        totalInvoiceElement.textContent =
            totalInvoice;
    }


    const totalPendapatanElement =
        document.getElementById(
            "totalPendapatan"
        );


    if (totalPendapatanElement) {

        totalPendapatanElement.textContent =
            "Rp " +
            totalPendapatan.toLocaleString(
                "id-ID"
            );
    }


    const totalLunasElement =
        document.getElementById(
            "totalLunas"
        );


    if (totalLunasElement) {

        totalLunasElement.textContent =
            totalLunas;
    }


    const totalBelumBayarElement =
        document.getElementById(
            "jumlahBelumBayar"
        );


    if (totalBelumBayarElement) {

        totalBelumBayarElement.textContent =
            totalBelumBayar;
    }


    if (
        !data ||
        data.length === 0
    ) {

        reportList.innerHTML =
            "<p>Belum ada data invoice.</p>";

        return;
    }


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

                        Rp ${Number(
                            invoice.total || 0
                        ).toLocaleString("id-ID")}

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


const filterButton =
    document.getElementById(
        "filterButton"
    );


if (filterButton) {

    filterButton.addEventListener(
        "click",
        function () {

            const status =
                document
                    .getElementById(
                        "filterStatus"
                    )
                    .value;


            loadReport(
                status
            );

        }
    );


    loadReport();

}


// =========================================
// TAMPILKAN INFORMASI REKENING
// DI HALAMAN INVOICE
// =========================================

async function loadInvoicePaymentInfo() {

    const namaBankElement =
        document.getElementById(
            "invoiceNamaBank"
        );


    const noRekElement =
        document.getElementById(
            "invoiceNoRek"
        );


    const namaRekeningElement =
        document.getElementById(
            "invoiceNamaRekening"
        );


    if (
        !namaBankElement ||
        !noRekElement ||
        !namaRekeningElement
    ) {

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("pengaturan")
        .select(
            `
            nama_bank,
            no_rek,
            nama_rekening
            `
        )
        .limit(1)
        .maybeSingle();


    if (error) {

        console.error(
            "Gagal mengambil data rekening:",
            error
        );


        namaBankElement.textContent =
            "-";


        noRekElement.textContent =
            "-";


        namaRekeningElement.textContent =
            "-";


        return;
    }


    if (!data) {

        namaBankElement.textContent =
            "Belum diatur";


        noRekElement.textContent =
            "Belum diatur";


        namaRekeningElement.textContent =
            "Belum diatur";


        return;
    }


    namaBankElement.textContent =
        data.nama_bank || "-";


    noRekElement.textContent =
        data.no_rek || "-";


    namaRekeningElement.textContent =
        data.nama_rekening || "-";

}


// =========================================
// JALANKAN CEK AKSES
// =========================================

cekAkses();


// =========================================
// JALANKAN DATA REKENING INVOICE
// =========================================

loadInvoicePaymentInfo();
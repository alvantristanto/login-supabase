// ============================================================
// SALES.JS
// Sistem Sales - Customer, Produk, Invoice
// ============================================================


// ============================================================
// KONFIGURASI SUPABASE
// ============================================================

const SUPABASE_URL =
    "https://vlgfkajzlgujfqlcixrn.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_tDOY85-rzUERbhEN3WzCoA_bP5Xs6hQ";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ============================================================
// VARIABEL MODE EDIT
// ============================================================

let editingProductId = null;
let editingCustomerId = null;


// ============================================================
// HELPER USER LOGIN
// ============================================================

async function getCurrentSalesUser() {

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error || !data || !data.user) {
        return null;
    }

    return data.user;
}


// ============================================================
// CEK USER LOGIN DAN ROLE SALES
// ============================================================

async function checkSalesUser() {

    const user = await getCurrentSalesUser();

    if (!user) {

        window.location.href = "index.html";

        return null;
    }


    const {
        data: profile,
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();


    if (profileError || !profile) {

        console.error(
            "Profile tidak ditemukan:",
            profileError
        );

        alert(
            "Data profile tidak ditemukan."
        );

        window.location.href = "index.html";

        return null;
    }


    if (profile.role !== "sales") {

        alert(
            "Halaman ini hanya untuk Sales."
        );

        window.location.href = "index.html";

        return null;
    }


    const userEmail =
        document.getElementById("userEmail");


    if (userEmail) {

        userEmail.textContent =
            user.email || "";
    }


    return user;
}


// ============================================================
// LOGOUT
// ============================================================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            const {
                error
            } = await supabaseClient
                .auth
                .signOut();


            if (error) {

                console.error(
                    "Gagal logout:",
                    error
                );

                alert(
                    "Gagal logout."
                );

                return;
            }


            window.location.href =
                "index.html";
        }
    );
}


// ============================================================
// REFERENSI SECTION DAN MENU
// ============================================================

const customerMenu =
    document.getElementById(
        "customerMenu"
    );

const daftarCustomerMenu =
    document.getElementById(
        "daftarCustomerMenu"
    );

const invoiceMenu =
    document.getElementById(
        "invoiceMenu"
    );

const daftarInvoiceMenu =
    document.getElementById(
        "daftarInvoiceMenu"
    );

const produkMenu =
    document.getElementById(
        "produkMenu"
    );


const customerSection =
    document.getElementById(
        "customer"
    );

const daftarCustomerSection =
    document.getElementById(
        "daftarCustomer"
    );

const invoiceSection =
    document.getElementById(
        "invoice"
    );

const daftarInvoiceSection =
    document.getElementById(
        "daftarInvoice"
    );

const produkSection =
    document.getElementById(
        "produk"
    );


// ============================================================
// NAVIGASI
// ============================================================

function hideAllSalesSections() {

    const sections = [
        customerSection,
        daftarCustomerSection,
        invoiceSection,
        daftarInvoiceSection,
        produkSection
    ];


    sections.forEach(
        function (section) {

            if (section) {

                section.style.display =
                    "none";
            }
        }
    );
}


function removeAllSalesActive() {

    const menus = [
        customerMenu,
        daftarCustomerMenu,
        invoiceMenu,
        daftarInvoiceMenu,
        produkMenu
    ];


    menus.forEach(
        function (menu) {

            if (menu) {

                menu.classList.remove(
                    "active"
                );
            }
        }
    );
}


function openSalesSection(
    section,
    menu,
    callback
) {

    hideAllSalesSections();

    removeAllSalesActive();


    if (section) {

        section.style.display =
            "block";
    }


    if (menu) {

        menu.classList.add(
            "active"
        );
    }


    if (typeof callback === "function") {

        callback();
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// MENU CUSTOMER
// ============================================================

if (customerMenu) {

    customerMenu.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openSalesSection(
                customerSection,
                customerMenu
            );
        }
    );
}


// ============================================================
// MENU DAFTAR CUSTOMER
// ============================================================

if (daftarCustomerMenu) {

    daftarCustomerMenu.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openSalesSection(
                daftarCustomerSection,
                daftarCustomerMenu,
                loadSalesCustomers
            );
        }
    );
}


// ============================================================
// MENU INVOICE
// ============================================================

if (invoiceMenu) {

    invoiceMenu.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openSalesSection(
                invoiceSection,
                invoiceMenu
            );
        }
    );
}


// ============================================================
// MENU DAFTAR INVOICE
// ============================================================

if (daftarInvoiceMenu) {

    daftarInvoiceMenu.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openSalesSection(
                daftarInvoiceSection,
                daftarInvoiceMenu,
                loadSalesInvoice
            );
        }
    );
}


// ============================================================
// MENU PRODUK
// ============================================================

if (produkMenu) {

    produkMenu.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            openSalesSection(
                produkSection,
                produkMenu,
                loadSalesProducts
            );
        }
    );
}


// ============================================================
// FORMAT RUPIAH
// ============================================================

function formatRupiahSales(nominal) {

    return "Rp " +
        Number(nominal || 0)
            .toLocaleString("id-ID");
}


// ============================================================
// AMBIL ANGKA DARI FORMAT RUPIAH
// ============================================================

function parseNominalSales(value) {

    return Number(
        String(value || "")
            .replace(/[^0-9]/g, "")
    ) || 0;
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// ============================================================
// CUSTOMER / CLIENT
// ============================================================
// ============================================================


// ============================================================
// FORM CUSTOMER
// ============================================================

const salesCustomerForm =
    document.getElementById(
        "salesCustomerForm"
    );


if (salesCustomerForm) {

    salesCustomerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const message =
                document.getElementById(
                    "salesCustomerMessage"
                );


            const user =
                await getCurrentSalesUser();


            if (!user) {

                if (message) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "User belum login.";
                }

                return;
            }


            const unitInput =
                document.getElementById(
                    "unitClient"
                );

            const namaInput =
                document.getElementById(
                    "namaClient"
                );

            const alamatInput =
                document.getElementById(
                    "alamatClient"
                );

            const noHpInput =
                document.getElementById(
                    "noHpClient"
                );

            const emailInput =
                document.getElementById(
                    "emailClient"
                );


            const unitClient =
                unitInput
                    ? unitInput.value.trim()
                    : "";

            const namaClient =
                namaInput
                    ? namaInput.value.trim()
                    : "";

            const alamatClient =
                alamatInput
                    ? alamatInput.value.trim()
                    : "";

            const noHpClient =
                noHpInput
                    ? noHpInput.value.trim()
                    : "";

            const emailClient =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            if (
                unitClient === "" ||
                namaClient === ""
            ) {

                if (message) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "Unit dan Nama Client wajib diisi.";
                }

                return;
            }


            const customerData = {

                unit_client:
                    unitClient,

                nama:
                    namaClient,

                alamat:
                    alamatClient,

                no_hp:
                    noHpClient,

                email:
                    emailClient
            };


            let error = null;


            // ====================================================
            // MODE EDIT
            // ====================================================

            if (editingCustomerId) {

                const result =
                    await supabaseClient
                        .from("sales_customers")
                        .update(customerData)
                        .eq(
                            "id",
                            editingCustomerId
                        )
                        .eq(
                            "user_id",
                            user.id
                        );

                error =
                    result.error;
            }


            // ====================================================
            // MODE TAMBAH
            // ====================================================

            else {

                customerData.user_id =
                    user.id;


                const result =
                    await supabaseClient
                        .from("sales_customers")
                        .insert(
                            customerData
                        );

                error =
                    result.error;
            }


            // ====================================================
            // ERROR
            // ====================================================

            if (error) {

                console.error(
                    "Gagal menyimpan client:",
                    error
                );


                if (message) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "Gagal menyimpan client: " +
                        error.message;
                }

                return;
            }


            // ====================================================
            // BERHASIL
            // ====================================================

            if (message) {

                message.style.color =
                    "green";

                message.textContent =
                    editingCustomerId
                        ? "Client berhasil diperbarui!"
                        : "Client berhasil disimpan!";
            }


            salesCustomerForm.reset();

            editingCustomerId =
                null;


            const submitButton =
                salesCustomerForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.textContent =
                    "Simpan Customer";
            }


            await loadSalesCustomers();
        }
    );
}


// ============================================================
// LOAD DAFTAR CUSTOMER
// ============================================================

async function loadSalesCustomers() {

    const customerList =
        document.getElementById(
            "salesCustomerList"
        );


    if (!customerList) {

        return;
    }


    customerList.innerHTML =
        "Memuat data client...";


    const user =
        await getCurrentSalesUser();


    if (!user) {

        customerList.innerHTML =
            "User belum login.";

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("sales_customers")
        .select("*")
        .eq(
            "user_id",
            user.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Gagal mengambil data client:",
            error
        );

        customerList.innerHTML =
            "Gagal memuat data client.";

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        customerList.innerHTML = `

            <div class="empty-state">

                <h3>Belum ada client</h3>

                <p>
                    Silakan tambahkan client terlebih dahulu.
                </p>

            </div>

        `;

        return;
    }


    let html = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>No</th>

                        <th>Unit / Nama Klien</th>

                        <th>Nama</th>

                        <th>Alamat</th>

                        <th>No. HP</th>

                        <th>Email</th>

                        <th>Tanggal</th>

                        <th>Aksi</th>

                    </tr>

                </thead>

                <tbody>

    `;


    data.forEach(
        function (customer, index) {

            const tanggal =
                customer.created_at
                    ? new Date(
                        customer.created_at
                    ).toLocaleDateString(
                        "id-ID"
                    )
                    : "-";


            html += `

                <tr>

                    <td>
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.unit_client || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.nama || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.alamat || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.no_hp || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.email || "-"
                        )}
                    </td>

                    <td>
                        ${tanggal}
                    </td>

                    <td class="aksi-customer">

                        <button
                            type="button"
                            class="edit-button"
                            onclick="editSalesCustomer('${customer.id}')"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            type="button"
                            class="delete-button"
                            onclick="deleteSalesCustomer('${customer.id}')"
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

        </div>

    `;


    customerList.innerHTML =
        html;
}


// ============================================================
// EDIT CUSTOMER
// ============================================================

async function editSalesCustomer(
    customerId
) {

    const user =
        await getCurrentSalesUser();


    if (!user) {

        alert(
            "User belum login."
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("sales_customers")
        .select("*")
        .eq(
            "id",
            customerId
        )
        .eq(
            "user_id",
            user.id
        )
        .single();


    if (error) {

        console.error(
            "Gagal mengambil data client:",
            error
        );

        alert(
            "Gagal mengambil data client."
        );

        return;
    }


    editingCustomerId =
        customerId;


    const unitInput =
        document.getElementById(
            "unitClient"
        );

    const namaInput =
        document.getElementById(
            "namaClient"
        );

    const alamatInput =
        document.getElementById(
            "alamatClient"
        );

    const noHpInput =
        document.getElementById(
            "noHpClient"
        );

    const emailInput =
        document.getElementById(
            "emailClient"
        );


    if (unitInput) {

        unitInput.value =
            data.unit_client || "";
    }


    if (namaInput) {

        namaInput.value =
            data.nama || "";
    }


    if (alamatInput) {

        alamatInput.value =
            data.alamat || "";
    }


    if (noHpInput) {

        noHpInput.value =
            data.no_hp || "";
    }


    if (emailInput) {

        emailInput.value =
            data.email || "";
    }


    const submitButton =
        salesCustomerForm
            ? salesCustomerForm.querySelector(
                "button[type='submit']"
            )
            : null;


    if (submitButton) {

        submitButton.textContent =
            "Update Customer";
    }


    openSalesSection(
        customerSection,
        customerMenu
    );
}


// ============================================================
// HAPUS CUSTOMER
// ============================================================

async function deleteSalesCustomer(
    customerId
) {

    const yakin =
        confirm(
            "Apakah Anda yakin ingin menghapus client ini?"
        );


    if (!yakin) {

        return;
    }


    const user =
        await getCurrentSalesUser();


    if (!user) {

        alert(
            "User belum login."
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("sales_customers")
        .delete()
        .eq(
            "id",
            customerId
        )
        .eq(
            "user_id",
            user.id
        )
        .select();


    if (error) {

        console.error(
            "Gagal menghapus client:",
            error
        );

        alert(
            "Gagal menghapus client: " +
            error.message
        );

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        alert(
            "Client tidak ditemukan atau Anda tidak memiliki izin."
        );

        return;
    }


    alert(
        "Client berhasil dihapus!"
    );


    await loadSalesCustomers();
}


// ============================================================
// ============================================================
// PRODUK / JASA
// ============================================================
// ============================================================


// ============================================================
// TOMBOL TAMBAH PRODUK
// ============================================================

const tambahProdukBtn =
    document.getElementById(
        "tambahProdukBtn"
    );

const produkFormContainer =
    document.getElementById(
        "produkFormContainer"
    );


const salesProductForm =
    document.getElementById(
        "salesProductForm"
    );


if (
    tambahProdukBtn &&
    produkFormContainer
) {

    tambahProdukBtn.addEventListener(
        "click",
        function () {

            editingProductId =
                null;


            if (salesProductForm) {

                salesProductForm.reset();
            }


            const submitButton =
                salesProductForm
                    ? salesProductForm.querySelector(
                        "button[type='submit']"
                    )
                    : null;


            if (submitButton) {

                submitButton.textContent =
                    "Simpan Produk";
            }


            produkFormContainer.style.display =
                "block";
        }
    );
}


// ============================================================
// FORMAT HARGA PRODUK
// ============================================================

const hargaProdukInput =
    document.getElementById(
        "hargaProduk"
    );


if (hargaProdukInput) {

    hargaProdukInput.addEventListener(
        "input",
        function () {

            const angka =
                parseNominalSales(
                    hargaProdukInput.value
                );


            hargaProdukInput.value =
                angka.toLocaleString(
                    "id-ID"
                );
        }
    );
}


// ============================================================
// SIMPAN / EDIT PRODUK
// ============================================================

if (salesProductForm) {

    salesProductForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                await getCurrentSalesUser();


            if (!user) {

                alert(
                    "User belum login."
                );

                return;
            }


            const kodeInput =
                document.getElementById(
                    "kodeProduk"
                );

            const namaInput =
                document.getElementById(
                    "namaProduk"
                );

            const kategoriInput =
                document.getElementById(
                    "kategoriProduk"
                );

            const hargaInput =
                document.getElementById(
                    "hargaProduk"
                );

            const stokInput =
                document.getElementById(
                    "stokProduk"
                );

            const gambarInput =
                document.getElementById(
                    "gambarProduk"
                );

            const statusInput =
                document.getElementById(
                    "statusProduk"
                );


            const productData = {

                kode_produk:
                    kodeInput
                        ? kodeInput.value.trim()
                        : "",

                nama_produk:
                    namaInput
                        ? namaInput.value.trim()
                        : "",

                kategori:
                    kategoriInput
                        ? kategoriInput.value
                        : "",

                harga:
                    hargaInput
                        ? parseNominalSales(
                            hargaInput.value
                        )
                        : 0,

                stok:
                    stokInput
                        ? Number(
                            stokInput.value
                        ) || 0
                        : 0,

                gambar_url:
                    gambarInput
                        ? gambarInput.value.trim()
                        : "",

                status:
                    statusInput
                        ? statusInput.value
                        : ""
            };


            if (
                productData.kode_produk === "" ||
                productData.nama_produk === ""
            ) {

                alert(
                    "Kode produk dan nama produk wajib diisi."
                );

                return;
            }


            let error = null;


            // ====================================================
            // MODE EDIT
            // ====================================================

            if (editingProductId) {

                const result =
                    await supabaseClient
                        .from("sales_products")
                        .update(productData)
                        .eq(
                            "id",
                            editingProductId
                        )
                        .eq(
                            "user_id",
                            user.id
                        );


                error =
                    result.error;
            }


            // ====================================================
            // MODE TAMBAH
            // ====================================================

            else {

                productData.user_id =
                    user.id;


                const result =
                    await supabaseClient
                        .from("sales_products")
                        .insert([
                            productData
                        ]);


                error =
                    result.error;
            }


            // ====================================================
            // ERROR
            // ====================================================

            if (error) {

                console.error(
                    "Gagal menyimpan produk:",
                    error
                );

                alert(
                    "Gagal menyimpan produk: " +
                    error.message
                );

                return;
            }


            // ====================================================
            // BERHASIL
            // ====================================================

            alert(
                editingProductId
                    ? "Produk berhasil diperbarui!"
                    : "Produk berhasil ditambahkan!"
            );


            salesProductForm.reset();

            editingProductId =
                null;


            const submitButton =
                salesProductForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.textContent =
                    "Simpan Produk";
            }


            if (produkFormContainer) {

                produkFormContainer.style.display =
                    "none";
            }


            await loadSalesProducts();
        }
    );
}


// ============================================================
// EDIT PRODUK
// ============================================================

async function editSalesProduct(
    productId
) {

    const user =
        await getCurrentSalesUser();


    if (!user) {

        alert(
            "User belum login."
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("sales_products")
        .select("*")
        .eq(
            "id",
            productId
        )
        .eq(
            "user_id",
            user.id
        )
        .single();


    if (error) {

        console.error(
            "Gagal mengambil produk:",
            error
        );

        alert(
            "Gagal mengambil data produk."
        );

        return;
    }


    editingProductId =
        productId;


    const kodeInput =
        document.getElementById(
            "kodeProduk"
        );

    const namaInput =
        document.getElementById(
            "namaProduk"
        );

    const kategoriInput =
        document.getElementById(
            "kategoriProduk"
        );

    const hargaInput =
        document.getElementById(
            "hargaProduk"
        );

    const stokInput =
        document.getElementById(
            "stokProduk"
        );

    const gambarInput =
        document.getElementById(
            "gambarProduk"
        );

    const statusInput =
        document.getElementById(
            "statusProduk"
        );


    if (kodeInput) {

        kodeInput.value =
            data.kode_produk || "";
    }


    if (namaInput) {

        namaInput.value =
            data.nama_produk || "";
    }


    if (kategoriInput) {

        kategoriInput.value =
            data.kategori || "";
    }


    if (hargaInput) {

        hargaInput.value =
            Number(
                data.harga || 0
            ).toLocaleString(
                "id-ID"
            );
    }


    if (stokInput) {

        stokInput.value =
            data.stok || 0;
    }


    if (gambarInput) {

        gambarInput.value =
            data.gambar_url || "";
    }


    if (statusInput) {

        statusInput.value =
            data.status || "";
    }


    if (produkFormContainer) {

        produkFormContainer.style.display =
            "block";
    }


    const submitButton =
        salesProductForm
            ? salesProductForm.querySelector(
                "button[type='submit']"
            )
            : null;


    if (submitButton) {

        submitButton.textContent =
            "Update Produk";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// HAPUS PRODUK
// ============================================================

async function deleteSalesProduct(
    productId
) {

    const yakin =
        confirm(
            "Apakah Anda yakin ingin menghapus produk ini?"
        );


    if (!yakin) {

        return;
    }


    const user =
        await getCurrentSalesUser();


    if (!user) {

        alert(
            "User belum login."
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("sales_products")
        .delete()
        .eq(
            "id",
            productId
        )
        .eq(
            "user_id",
            user.id
        )
        .select();


    if (error) {

        console.error(
            "Gagal menghapus produk:",
            error
        );

        alert(
            "Gagal menghapus produk: " +
            error.message
        );

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        alert(
            "Produk tidak ditemukan atau Anda tidak memiliki izin."
        );

        return;
    }


    alert(
        "Produk berhasil dihapus!"
    );


    await loadSalesProducts();
}


// ============================================================
// LOAD PRODUK
// ============================================================

async function loadSalesProducts() {

    const productList =
        document.getElementById(
            "salesProductList"
        );


    const cariProdukInput =
        document.getElementById(
            "cariProduk"
        );

    const filterKategori =
        document.getElementById(
            "filterKategori"
        );


    if (!productList) {

        return;
    }


    productList.innerHTML =
        "Memuat produk...";


    const user =
        await getCurrentSalesUser();


    if (!user) {

        productList.innerHTML =
            "User belum login.";

        return;
    }


    let query =
        supabaseClient
            .from("sales_products")
            .select("*")
            .eq(
                "user_id",
                user.id
            );


    const kategoriDipilih =
        filterKategori
            ? filterKategori.value
            : "";


    const kataKunci =
        cariProdukInput
            ? cariProdukInput.value.trim()
            : "";


    if (kategoriDipilih) {

        query =
            query.eq(
                "kategori",
                kategoriDipilih
            );
    }


    const {
        data,
        error
    } = await query
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Gagal mengambil produk:",
            error
        );

        productList.innerHTML =
            "Gagal memuat produk.";

        return;
    }


    let filteredData =
        data || [];


    // ========================================================
    // FILTER PENCARIAN DI BROWSER
    // ========================================================

    if (kataKunci) {

        const keyword =
            kataKunci.toLowerCase();


        filteredData =
            filteredData.filter(
                function (product) {

                    const kode =
                        String(
                            product.kode_produk || ""
                        ).toLowerCase();

                    const nama =
                        String(
                            product.nama_produk || ""
                        ).toLowerCase();


                    return (
                        kode.includes(keyword) ||
                        nama.includes(keyword)
                    );
                }
            );
    }


    if (
        filteredData.length === 0
    ) {

        productList.innerHTML =
            "Belum ada produk.";

        return;
    }


    let html = "";


    filteredData.forEach(
        function (product) {

            const harga =
                Number(
                    product.harga || 0
                ).toLocaleString(
                    "id-ID"
                );


            const namaProduk =
                escapeHTML(
                    product.nama_produk || "-"
                );

            const kodeProduk =
                escapeHTML(
                    product.kode_produk || "-"
                );

            const kategori =
                escapeHTML(
                    product.kategori || "-"
                );

            const status =
                escapeHTML(
                    product.status || "-"
                );

            const gambar =
                product.gambar_url || "";


            html += `

                <div class="produk-card">

                    <div class="produk-image">

                        ${
                            gambar
                                ? `
                                    <img
                                        src="${escapeHTML(gambar)}"
                                        alt="${namaProduk}"
                                    >
                                `
                                : `
                                    <div class="no-image">
                                        📦
                                    </div>
                                `
                        }

                    </div>


                    <div class="produk-info">

                        <h3>
                            ${namaProduk}
                        </h3>


                        <p>
                            <strong>Kode:</strong>
                            ${kodeProduk}
                        </p>


                        <p>
                            <strong>Kategori:</strong>
                            ${kategori}
                        </p>


                        <p class="harga-produk">
                            Rp ${harga}
                        </p>


                        <p>
                            <strong>Stok:</strong>
                            ${Number(
                                product.stok || 0
                            )}
                        </p>


                        <p>
                            <strong>Status:</strong>
                            ${status}
                        </p>


                        <div class="produk-aksi">

                            <button
                                type="button"
                                class="edit-button"
                                onclick="editSalesProduct('${product.id}')"
                            >
                                ✏️ Edit
                            </button>


                            <button
                                type="button"
                                class="delete-button"
                                onclick="deleteSalesProduct('${product.id}')"
                            >
                                🗑 Hapus
                            </button>

                        </div>

                    </div>

                </div>

            `;
        }
    );


    productList.innerHTML =
        html;
}


// ============================================================
// PENCARIAN PRODUK
// ============================================================

const cariProduk =
    document.getElementById(
        "cariProduk"
    );


if (cariProduk) {

    cariProduk.addEventListener(
        "input",
        function () {

            loadSalesProducts();
        }
    );
}


// ============================================================
// FILTER KATEGORI
// ============================================================

const filterKategori =
    document.getElementById(
        "filterKategori"
    );


if (filterKategori) {

    filterKategori.addEventListener(
        "change",
        function () {

            loadSalesProducts();
        }
    );
}


// ============================================================
// ============================================================
// INVOICE
// ============================================================
// ============================================================


// ============================================================
// REFERENSI FORM INVOICE
// ============================================================

const salesInvoiceForm =
    document.getElementById(
        "salesInvoiceForm"
    );

const qtyInput =
    document.getElementById(
        "qty"
    );

const hargaSatuanInput =
    document.getElementById(
        "hargaSatuan"
    );

const pajakInput =
    document.getElementById(
        "pajak"
    );

const totalInvoiceSalesInput =
    document.getElementById(
        "totalInvoiceSales"
    );


// ============================================================
// HITUNG TOTAL INVOICE
// ============================================================

function hitungTotalInvoiceSales() {

    if (
        !qtyInput ||
        !hargaSatuanInput ||
        !pajakInput ||
        !totalInvoiceSalesInput
    ) {

        return;
    }


    const qty =
        Number(
            qtyInput.value
        ) || 0;


    const hargaSatuan =
        parseNominalSales(
            hargaSatuanInput.value
        );


    const pajak =
        Number(
            pajakInput.value
        ) || 0;


    const total =
        qty *
        hargaSatuan;


    const nilaiPajak =
        total *
        (
            pajak / 100
        );


    const totalDenganPajak =
        total +
        nilaiPajak;


    totalInvoiceSalesInput.value =
        formatRupiahSales(
            totalDenganPajak
        );
}


// ============================================================
// EVENT QTY
// ============================================================

if (qtyInput) {

    qtyInput.addEventListener(
        "input",
        hitungTotalInvoiceSales
    );
}


// ============================================================
// EVENT HARGA SATUAN
// ============================================================

if (hargaSatuanInput) {

    hargaSatuanInput.addEventListener(
        "input",
        function () {

            const angka =
                parseNominalSales(
                    hargaSatuanInput.value
                );


            hargaSatuanInput.value =
                angka.toLocaleString(
                    "id-ID"
                );


            hitungTotalInvoiceSales();
        }
    );
}


// ============================================================
// EVENT PAJAK
// ============================================================

if (pajakInput) {

    pajakInput.addEventListener(
        "input",
        hitungTotalInvoiceSales
    );
}


// ============================================================
// SIMPAN / EDIT INVOICE
// ============================================================

if (salesInvoiceForm) {

    salesInvoiceForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const message =
                document.getElementById(
                    "salesInvoiceMessage"
                );


            const user =
                await getCurrentSalesUser();


            if (!user) {

                if (message) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "User belum login.";
                }

                return;
            }


            const kodeBarangInput =
                document.getElementById(
                    "kodeBarang"
                );

            const keteranganInput =
                document.getElementById(
                    "keterangan"
                );

            const statusInput =
                document.getElementById(
                    "statusInvoiceSales"
                );


            const kodeBarang =
                kodeBarangInput
                    ? kodeBarangInput.value.trim()
                    : "";

            const keterangan =
                keteranganInput
                    ? keteranganInput.value.trim()
                    : "";

            const qty =
                qtyInput
                    ? Number(qtyInput.value) || 0
                    : 0;

            const hargaSatuan =
                hargaSatuanInput
                    ? parseNominalSales(
                        hargaSatuanInput.value
                    )
                    : 0;

            const pajak =
                pajakInput
                    ? Number(
                        pajakInput.value
                    ) || 0
                    : 0;

            const status =
                statusInput
                    ? statusInput.value
                    : "";


            const total =
                qty *
                hargaSatuan;


            const nilaiPajak =
                total *
                (
                    pajak / 100
                );


            const totalDenganPajak =
                total +
                nilaiPajak;


            const editingId =
                salesInvoiceForm.dataset.editingId;


            const invoiceData = {

                kode_barang_jasa:
                    kodeBarang,

                keterangan:
                    keterangan,

                jumlah:
                    qty,

                harga_satuan:
                    hargaSatuan,

                total:
                    total,

                pajak:
                    pajak,

                total_dengan_pajak:
                    totalDenganPajak,

                status:
                    status
            };


            let error = null;


            // ====================================================
            // MODE EDIT
            // ====================================================

            if (editingId) {

                const result =
                    await supabaseClient
                        .from("sales_invoices")
                        .update(invoiceData)
                        .eq(
                            "id",
                            editingId
                        )
                        .eq(
                            "user_id",
                            user.id
                        );


                error =
                    result.error;
            }


            // ====================================================
            // MODE TAMBAH
            // ====================================================

            else {

                invoiceData.user_id =
                    user.id;

                invoiceData.nomor_invoice =
                    "INV-" +
                    Date.now();


                const result =
                    await supabaseClient
                        .from("sales_invoices")
                        .insert(
                            invoiceData
                        );


                error =
                    result.error;
            }


            // ====================================================
            // ERROR
            // ====================================================

            if (error) {

                console.error(
                    "Gagal menyimpan invoice:",
                    error
                );


                if (message) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "Gagal menyimpan invoice: " +
                        error.message;
                }

                return;
            }


            // ====================================================
            // BERHASIL
            // ====================================================

            if (message) {

                message.style.color =
                    "green";

                message.textContent =
                    editingId
                        ? "Invoice berhasil diperbarui!"
                        : "Invoice berhasil disimpan!";
            }


            salesInvoiceForm.reset();


            if (qtyInput) {

                qtyInput.value =
                    1;
            }


            if (pajakInput) {

                pajakInput.value =
                    0;
            }


            if (totalInvoiceSalesInput) {

                totalInvoiceSalesInput.value =
                    "Rp 0";
            }


            const nomorInvoiceInput =
                document.getElementById(
                    "nomorInvoiceSales"
                );


            if (nomorInvoiceInput) {

                nomorInvoiceInput.value =
                    "Otomatis";
            }


            delete salesInvoiceForm.dataset.editingId;


            const submitButton =
                salesInvoiceForm.querySelector(
                    "button[type='submit']"
                );


            if (submitButton) {

                submitButton.textContent =
                    "Simpan Invoice";
            }
        }
    );
}


// ============================================================
// EDIT INVOICE
// ============================================================

async function editSalesInvoice(
    invoiceId
) {

    const user =
        await getCurrentSalesUser();


    if (!user) {

        alert(
            "Sesi login tidak ditemukan."
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("sales_invoices")
        .select("*")
        .eq(
            "id",
            invoiceId
        )
        .eq(
            "user_id",
            user.id
        )
        .single();


    if (error) {

        console.error(
            "Gagal mengambil invoice:",
            error
        );

        alert(
            "Gagal mengambil data invoice."
        );

        return;
    }


    const nomorInvoiceInput =
        document.getElementById(
            "nomorInvoiceSales"
        );

    const kodeBarangInput =
        document.getElementById(
            "kodeBarang"
        );

    const keteranganInput =
        document.getElementById(
            "keterangan"
        );

    const statusInput =
        document.getElementById(
            "statusInvoiceSales"
        );


    if (nomorInvoiceInput) {

        nomorInvoiceInput.value =
            data.nomor_invoice || "";
    }


    if (kodeBarangInput) {

        kodeBarangInput.value =
            data.kode_barang_jasa || "";
    }


    if (keteranganInput) {

        keteranganInput.value =
            data.keterangan || "";
    }


    if (qtyInput) {

        qtyInput.value =
            data.jumlah || 1;
    }


    if (hargaSatuanInput) {

        hargaSatuanInput.value =
            Number(
                data.harga_satuan || 0
            ).toLocaleString(
                "id-ID"
            );
    }


    if (pajakInput) {

        pajakInput.value =
            data.pajak || 0;
    }


    if (statusInput) {

        statusInput.value =
            data.status || "Draft";
    }


    hitungTotalInvoiceSales();


    salesInvoiceForm.dataset.editingId =
        invoiceId;


    const submitButton =
        salesInvoiceForm.querySelector(
            "button[type='submit']"
        );


    if (submitButton) {

        submitButton.textContent =
            "Update Invoice";
    }


    openSalesSection(
        invoiceSection,
        invoiceMenu
    );
}


// ============================================================
// HAPUS INVOICE
// ============================================================

async function deleteSalesInvoice(
    invoiceId
) {

    const yakin =
        confirm(
            "Yakin ingin menghapus invoice ini?"
        );


    if (!yakin) {

        return;
    }


    const user =
        await getCurrentSalesUser();


    if (!user) {

        alert(
            "Sesi login tidak ditemukan."
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("sales_invoices")
        .delete()
        .eq(
            "id",
            invoiceId
        )
        .eq(
            "user_id",
            user.id
        )
        .select();


    if (error) {

        console.error(
            "Gagal menghapus invoice:",
            error
        );

        alert(
            "Gagal menghapus invoice: " +
            error.message
        );

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        alert(
            "Invoice tidak ditemukan atau Anda tidak memiliki izin."
        );

        return;
    }


    alert(
        "Invoice berhasil dihapus!"
    );


    await loadSalesInvoice();
}


// ============================================================
// LOAD DAFTAR INVOICE
// ============================================================

async function loadSalesInvoice() {

    const invoiceList =
        document.getElementById(
            "salesInvoiceList"
        );


    if (!invoiceList) {

        return;
    }


    invoiceList.innerHTML =
        "Memuat data invoice...";


    const user =
        await getCurrentSalesUser();


    if (!user) {

        invoiceList.innerHTML =
            "User belum login.";

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("sales_invoices")
        .select("*")
        .eq(
            "user_id",
            user.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Gagal mengambil invoice:",
            error
        );

        invoiceList.innerHTML =
            "Gagal memuat data invoice.";

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        invoiceList.innerHTML =
            "Belum ada invoice.";

        return;
    }


    let html = `

        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>No. Invoice</th>

                        <th>Kode Barang/Jasa</th>

                        <th>Keterangan</th>

                        <th>Qty</th>

                        <th>Harga Satuan</th>

                        <th>Pajak</th>

                        <th>Total</th>

                        <th>Total + Pajak</th>

                        <th>Status</th>

                        <th>Aksi</th>

                    </tr>

                </thead>

                <tbody>

    `;


    data.forEach(
        function (invoice) {

            html += `

                <tr>

                    <td>
                        ${escapeHTML(
                            invoice.nomor_invoice || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            invoice.kode_barang_jasa || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            invoice.keterangan || "-"
                        )}
                    </td>

                    <td>
                        ${Number(
                            invoice.jumlah || 0
                        )}
                    </td>

                    <td>
                        Rp ${Number(
                            invoice.harga_satuan || 0
                        ).toLocaleString(
                            "id-ID"
                        )}
                    </td>

                    <td>
                        ${Number(
                            invoice.pajak || 0
                        )}%
                    </td>

                    <td>
                        Rp ${Number(
                            invoice.total || 0
                        ).toLocaleString(
                            "id-ID"
                        )}
                    </td>

                    <td>
                        Rp ${Number(
                            invoice.total_dengan_pajak || 0
                        ).toLocaleString(
                            "id-ID"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            invoice.status || "-"
                        )}
                    </td>

                    <td class="aksi-invoice">

                        <button
                            type="button"
                            onclick="editSalesInvoice('${invoice.id}')"
                            class="edit-button"
                        >
                            ✏️ Edit
                        </button>


                        <button
                            type="button"
                            onclick="deleteSalesInvoice('${invoice.id}')"
                            class="delete-button"
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

        </div>

    `;


    invoiceList.innerHTML =
        html;
}


// ============================================================
// FUNGSI KE WINDOW
// Supaya onclick="" pada HTML bisa menjalankan fungsi
// ============================================================

window.editSalesCustomer =
    editSalesCustomer;

window.deleteSalesCustomer =
    deleteSalesCustomer;

window.editSalesProduct =
    editSalesProduct;

window.deleteSalesProduct =
    deleteSalesProduct;

window.editSalesInvoice =
    editSalesInvoice;

window.deleteSalesInvoice =
    deleteSalesInvoice;


// ============================================================
// INISIALISASI
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const user =
            await checkSalesUser();


        if (!user) {

            return;
        }


        // Pastikan total invoice dihitung
        hitungTotalInvoiceSales();
    }
);
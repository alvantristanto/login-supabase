// ========================================
// KONFIGURASI SUPABASE
// ========================================

const SUPABASE_URL = "https://vlgfkajzlgujfqlcixrn.supabase.co";
const SUPABASE_KEY = "sb_publishable_tDOY85-rzUERbhEN3WzCoA_bP5Xs6hQ";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ========================================
// ELEMENT HTML
// ========================================

const tombolLogin = document.getElementById("loginBtn");
const message = document.getElementById("message");


// ========================================
// PROSES LOGIN
// ========================================

if (tombolLogin) {

    tombolLogin.addEventListener("click", async function () {

        // Ambil input email
        const email = document
            .getElementById("email")
            .value
            .trim();

        // Ambil input password
        const password = document
            .getElementById("password")
            .value;


        // ========================================
        // VALIDASI INPUT
        // ========================================

        if (email === "" || password === "") {

            message.style.color = "red";
            message.textContent = "Email dan Password wajib diisi!";

            return;
        }


        // ========================================
        // STATUS LOGIN
        // ========================================

        message.style.color = "black";
        message.textContent = "Sedang login...";


        // ========================================
        // LOGIN SUPABASE AUTHENTICATION
        // ========================================

        const {
            data: authData,
            error: authError
        } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


        // ========================================
        // CEK LOGIN
        // ========================================

        if (authError) {

            message.style.color = "red";
            message.textContent =
                "Login gagal: " + authError.message;

            return;
        }


        // Pastikan data user tersedia
        if (!authData || !authData.user) {

            message.style.color = "red";
            message.textContent =
                "Data pengguna tidak ditemukan.";

            return;
        }


        // ========================================
        // AMBIL ROLE DARI TABEL PROFILES
        // ========================================

        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();


        // ========================================
        // CEK PROFILE
        // ========================================

        if (profileError || !profile) {

            message.style.color = "red";
            message.textContent =
                "Profile/role pengguna tidak ditemukan.";

            return;
        }


        // ========================================
        // REDIRECT BERDASARKAN ROLE
        // ========================================

        if (profile.role === "admin") {

            window.location.href = "admin.html";

        } else if (profile.role === "sales") {

            window.location.href = "sales.html";

        } else {

            message.style.color = "red";
            message.textContent =
                "Role pengguna tidak dikenali.";
        }

    });

}
// Tandai bahwa JavaScript aktif (dipakai untuk pindah halaman dan animasi)
document.documentElement.classList.add("js");

// Nomor WhatsApp kedai (format internasional, tanpa + dan tanpa 0 di depan)
var NOMOR_WA = "6282312488235";

function buatPesan(item) {
  if (item === "umum") {
    return "Halo Bakmie Djoeang, saya mau pesan. Boleh tahu menu yang tersedia hari ini?";
  }
  return "Halo Bakmie Djoeang, saya mau pesan " + item + ". Jumlah: ... Atas nama: ...";
}

function bukaWhatsApp(item) {
  var url = "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(buatPesan(item));
  window.open(url, "_blank");
}

// Semua tombol dengan atribut data-pesan membuka WhatsApp
var tombolPesan = document.querySelectorAll("[data-pesan]");
for (var i = 0; i < tombolPesan.length; i++) {
  tombolPesan[i].addEventListener("click", function () {
    bukaWhatsApp(this.getAttribute("data-pesan"));
  });
}

// ---------- Pindah halaman (Beranda, Menu, Testimoni, Kontak) ----------
var daftarHalaman = document.querySelectorAll(".halaman");
var tautanNav = document.querySelectorAll(".nav-links a");
var tombolNav = document.querySelector(".nav-toggle");
var daftarNav = document.querySelector(".nav-links");
var pengamat = null;

function tutupNavPonsel() {
  daftarNav.classList.remove("buka");
  tombolNav.setAttribute("aria-expanded", "false");
  tombolNav.innerHTML = "&#9776;";
}

function amatiReveal(halaman) {
  var elemen = halaman.querySelectorAll(".reveal:not(.tampil)");
  for (var k = 0; k < elemen.length; k++) {
    if (pengamat) { pengamat.observe(elemen[k]); } else { elemen[k].classList.add("tampil"); }
  }
}

function tampilkanHalaman(id) {
  var ada = false;
  for (var a = 0; a < daftarHalaman.length; a++) {
    if (daftarHalaman[a].id === id) { ada = true; }
  }
  if (!ada) { id = "beranda"; }

  var aktif = null;
  for (var b = 0; b < daftarHalaman.length; b++) {
    var cocok = daftarHalaman[b].id === id;
    daftarHalaman[b].classList.toggle("aktif", cocok);
    if (cocok) { aktif = daftarHalaman[b]; }
  }
  for (var c = 0; c < tautanNav.length; c++) {
    if (tautanNav[c].getAttribute("data-halaman") === id) {
      tautanNav[c].setAttribute("aria-current", "page");
    } else {
      tautanNav[c].removeAttribute("aria-current");
    }
  }
  document.title = aktif.getAttribute("data-judul") + " - Bakmie Djoeang Madiun";
  window.scrollTo(0, 0);
  tutupNavPonsel();
  amatiReveal(aktif);
}

if ("IntersectionObserver" in window) {
  pengamat = new IntersectionObserver(function (entri) {
    for (var j = 0; j < entri.length; j++) {
      if (entri[j].isIntersecting) {
        entri[j].target.classList.add("tampil");
        pengamat.unobserve(entri[j].target);
      }
    }
  }, { threshold: 0.12 });
}

function bacaHash() {
  tampilkanHalaman(window.location.hash.replace("#", "") || "beranda");
}

window.addEventListener("hashchange", bacaHash);
bacaHash();

// ---------- Menu hamburger di ponsel ----------
tombolNav.addEventListener("click", function () {
  var terbuka = daftarNav.classList.toggle("buka");
  tombolNav.setAttribute("aria-expanded", terbuka ? "true" : "false");
  tombolNav.innerHTML = terbuka ? "&#10005;" : "&#9776;";
});

// ---------- Foto: jika file belum ada, bagian foto disembunyikan ----------
function sembunyikanFoto(img) {
  var tombol = img.closest(".foto-tombol");
  if (tombol) { tombol.remove(); }
}

var fotoMenu = document.querySelectorAll(".foto-menu");
for (var f = 0; f < fotoMenu.length; f++) {
  fotoMenu[f].addEventListener("error", function () { sembunyikanFoto(this); });
  if (fotoMenu[f].complete && fotoMenu[f].naturalWidth === 0) {
    sembunyikanFoto(fotoMenu[f]);
  }
}

// Logo: jika file logo belum ada, sembunyikan gambarnya
var gambarLogo = document.querySelectorAll(".logo-img, .hero-logo");
for (var g = 0; g < gambarLogo.length; g++) {
  gambarLogo[g].addEventListener("error", function () { this.style.display = "none"; });
  if (gambarLogo[g].complete && gambarLogo[g].naturalWidth === 0) { gambarLogo[g].style.display = "none"; }
}

// ---------- Foto menu diperbesar ----------
var lightbox = document.getElementById("lightbox");
var lightboxImg = lightbox.querySelector(".lightbox-img");
var tombolTutup = lightbox.querySelector(".lightbox-tutup");

function tutupLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = "";
}

document.addEventListener("click", function (e) {
  var tombolFoto = e.target.closest(".foto-tombol");
  if (tombolFoto) {
    var gambar = tombolFoto.querySelector("img");
    lightboxImg.src = tombolFoto.getAttribute("data-besar");
    lightboxImg.alt = gambar ? gambar.alt : "";
    lightbox.hidden = false;
    tombolTutup.focus();
  } else if (e.target === lightbox) {
    tutupLightbox();
  }
});

tombolTutup.addEventListener("click", tutupLightbox);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !lightbox.hidden) { tutupLightbox(); }
});

// Tahun otomatis di footer
document.getElementById("tahun").textContent = new Date().getFullYear();

// =====================================================
// TAMBAHAN: keranjang, animasi mie pipih, dan FAQ
// =====================================================

// ---------- Keranjang pesanan ----------
var KUNCI_KERANJANG = "bakmie-keranjang";
var keranjang = {};

function bacaKeranjang() {
  try {
    var data = window.localStorage.getItem(KUNCI_KERANJANG);
    if (data) { keranjang = JSON.parse(data) || {}; }
  } catch (err) { keranjang = {}; }
}

function simpanKeranjang() {
  try { window.localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(keranjang)); } catch (err) { /* abaikan */ }
}

function rupiah(angka) {
  return "Rp " + angka.toLocaleString("id-ID");
}

var tombolBukaKeranjang = document.getElementById("keranjang-buka");
var panelKeranjang = document.getElementById("keranjang-panel");
var kartuKeranjang = panelKeranjang.querySelector(".keranjang-kartu");
var daftarKeranjang = document.getElementById("keranjang-daftar");

function hitungKeranjang() {
  var jumlah = 0, total = 0;
  for (var nama in keranjang) {
    jumlah += keranjang[nama].qty;
    total += keranjang[nama].qty * keranjang[nama].harga;
  }
  return { jumlah: jumlah, total: total };
}

function gambarKeranjang() {
  var ringkas = hitungKeranjang();
  document.getElementById("k-jumlah").textContent = ringkas.jumlah;
  document.getElementById("k-total").textContent = rupiah(ringkas.total);
  document.getElementById("k-total-panel").textContent = rupiah(ringkas.total);
  tombolBukaKeranjang.hidden = ringkas.jumlah === 0;
  kartuKeranjang.classList.toggle("kosong", ringkas.jumlah === 0);

  daftarKeranjang.innerHTML = "";
  for (var nama in keranjang) {
    var baris = document.createElement("li");
    baris.className = "k-baris";

    var info = document.createElement("div");
    var teksNama = document.createElement("div");
    teksNama.className = "k-nama";
    teksNama.textContent = nama;
    var teksHarga = document.createElement("div");
    teksHarga.className = "k-harga";
    teksHarga.textContent = rupiah(keranjang[nama].harga * keranjang[nama].qty);
    info.appendChild(teksNama);
    info.appendChild(teksHarga);

    var qty = document.createElement("div");
    qty.className = "k-qty";
    var kurang = document.createElement("button");
    kurang.type = "button";
    kurang.textContent = "\u2212";
    kurang.setAttribute("aria-label", "Kurangi " + nama);
    kurang.setAttribute("data-ubah", nama);
    kurang.setAttribute("data-arah", "-1");
    var angka = document.createElement("span");
    angka.textContent = keranjang[nama].qty;
    var tambah = document.createElement("button");
    tambah.type = "button";
    tambah.textContent = "+";
    tambah.setAttribute("aria-label", "Tambah " + nama);
    tambah.setAttribute("data-ubah", nama);
    tambah.setAttribute("data-arah", "1");
    qty.appendChild(kurang);
    qty.appendChild(angka);
    qty.appendChild(tambah);

    baris.appendChild(info);
    baris.appendChild(qty);
    daftarKeranjang.appendChild(baris);
  }
}

function ubahJumlah(nama, arah) {
  if (!keranjang[nama]) { return; }
  keranjang[nama].qty += arah;
  if (keranjang[nama].qty <= 0) { delete keranjang[nama]; }
  simpanKeranjang();
  gambarKeranjang();
  if (hitungKeranjang().jumlah === 0) { tutupKeranjang(); }
}

function bukaKeranjang() {
  panelKeranjang.hidden = false;
  panelKeranjang.querySelector(".k-tutup").focus();
}

function tutupKeranjang() {
  panelKeranjang.hidden = true;
}

function buatPesanKeranjang() {
  var baris = ["Halo Bakmie Djoeang, saya mau pesan:"];
  for (var nama in keranjang) {
    baris.push("- " + keranjang[nama].qty + "x " + nama + " (" + rupiah(keranjang[nama].harga * keranjang[nama].qty) + ")");
  }
  baris.push("Total: " + rupiah(hitungKeranjang().total));
  var pemesan = document.getElementById("nama-pemesan").value.replace(/^\s+|\s+$/g, "");
  baris.push("Atas nama: *" + pemesan.replace(/\*/g, "") + "*");
  baris.push("No. telepon: " + rapikanTelepon(document.getElementById("telp-pemesan").value));
  baris.push("*No. Antrian: " + NOMOR_ANTRIAN + "*");
  baris.push("Jenis pesanan: " + jenisTerpilih());
  if (jenisTerpilih() === "Take Away") { baris.push("Jam ambil: *" + jamAmbilTerpilih() + "*"); }
  baris.push("Pembayaran: QRIS (bukti bayar saya kirim di chat ini)");
  baris.push("Mohon dikonfirmasi, terima kasih.");
  return baris.join("\n");
}

// ---------- Pemberitahuan singkat ----------
var kotakToast = document.getElementById("toast");
var waktuToast = null;

function tampilkanToast(teks) {
  kotakToast.textContent = teks;
  kotakToast.classList.add("tampil");
  clearTimeout(waktuToast);
  waktuToast = setTimeout(function () { kotakToast.classList.remove("tampil"); }, 1800);
}

// ---------- Animasi kecil sesuai menu (jatuh dari atas) ----------
var lapisanMie = document.getElementById("mie-hujan");
var tanpaGerak = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function acak(min, maks) { return min + Math.random() * (maks - min); }

// Bentuk-bentuk kecil (SVG). Tiap bentuk punya perbandingan lebar : tinggi sendiri.
var BENTUK = {
  lebar: { r: 60 / 26, svg: '<svg viewBox="0 0 60 26" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14 C10 2 16 2 22 14 S34 26 40 14 S52 2 56 12" stroke="#c9a24d" stroke-width="9"/><path d="M4 14 C10 2 16 2 22 14 S34 26 40 14 S52 2 56 12" stroke="#f6e3b4" stroke-width="6"/><path d="M4 14 C10 2 16 2 22 14 S34 26 40 14 S52 2 56 12" stroke="#fffaf0" stroke-width="1.6" opacity="0.8"/></g></svg>' },
  kecil: { r: 60 / 26, svg: '<svg viewBox="0 0 60 26" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round"><path d="M3 8 q4 -8 8 0 t8 0 t8 0 t8 0 t8 0 t8 0" stroke="#d9b565" stroke-width="3"/><path d="M3 8 q4 -8 8 0 t8 0 t8 0 t8 0 t8 0 t8 0" stroke="#f8e8b8" stroke-width="1.2"/><path d="M3 18 q4 -8 8 0 t8 0 t8 0 t8 0 t8 0 t8 0" stroke="#d9b565" stroke-width="3"/><path d="M3 18 q4 -8 8 0 t8 0 t8 0 t8 0 t8 0 t8 0" stroke="#f8e8b8" stroke-width="1.2"/></g></svg>' },
  rebus: { r: 40 / 34, svg: '<svg viewBox="0 0 40 34" xmlns="http://www.w3.org/2000/svg"><path d="M5 22 C5 11 15 7 20 12 C25 7 35 11 35 22 C35 29 27 32 20 32 C13 32 5 29 5 22 Z" fill="#fdf1dc" stroke="#cfae7a" stroke-width="1.8"/><path d="M11 15 q3 -6 7 -2 M22 13 q4 -5 8 2" fill="none" stroke="#cfae7a" stroke-width="1.5" stroke-linecap="round"/><path d="M13 24 q7 5 14 0" fill="none" stroke="#e7d2ae" stroke-width="1.6" stroke-linecap="round"/></svg>' },
  goreng: { r: 40 / 36, svg: '<svg viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg"><path d="M4 9 Q20 4 36 10 Q30 26 20 33 Q10 26 4 9 Z" fill="#f0b043" stroke="#c4801c" stroke-width="1.8" stroke-linejoin="round"/><g fill="#fbd88b"><circle cx="14" cy="13" r="1.8"/><circle cx="24" cy="15" r="1.6"/><circle cx="19" cy="22" r="1.8"/><circle cx="27" cy="20" r="1.3"/></g></svg>' },
  bakso: { r: 1, svg: '<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="12" fill="#b56e2b" stroke="#7f4513" stroke-width="1.8"/><g fill="#d8954a"><circle cx="10" cy="11" r="2"/><circle cx="19" cy="9" r="1.6"/><circle cx="20" cy="19" r="2"/><circle cx="11" cy="20" r="1.5"/></g><path d="M8 12 Q10 6 16 6" fill="none" stroke="#e9b36f" stroke-width="2" stroke-linecap="round"/></svg>' },
  air: { r: 24 / 32, svg: '<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C12 2 3 14 3 21 C3 27 7.5 30 12 30 C16.5 30 21 27 21 21 C21 14 12 2 12 2 Z" fill="#a8defa" stroke="#3f9fd1" stroke-width="1.6"/><path d="M8 20 Q8 25 12 26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' },
  teh: { r: 24 / 32, svg: '<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C12 2 3 14 3 21 C3 27 7.5 30 12 30 C16.5 30 21 27 21 21 C21 14 12 2 12 2 Z" fill="#c98232" stroke="#8a4d12" stroke-width="1.6"/><path d="M8 20 Q8 25 12 26" fill="none" stroke="#f0c58a" stroke-width="2" stroke-linecap="round"/></svg>' },
  tarik: { r: 24 / 32, svg: '<svg viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C12 2 3 14 3 21 C3 27 7.5 30 12 30 C16.5 30 21 27 21 21 C21 14 12 2 12 2 Z" fill="#e8cba0" stroke="#b0814a" stroke-width="1.6"/><path d="M8 20 Q8 25 12 26" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' },
  busa: { r: 1, svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" fill="#fff6e6" stroke="#d8b98a" stroke-width="1.6"/><path d="M7 11 Q8 7 12 7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' },
  lemon: { r: 1, svg: '<svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><circle cx="17" cy="17" r="15" fill="#f6e052" stroke="#d9b61b" stroke-width="2"/><circle cx="17" cy="17" r="12" fill="#fff3a8"/><path d="M17 17 L17 5 M17 17 L25.5 8.5 M17 17 L29 17 M17 17 L25.5 25.5 M17 17 L17 29 M17 17 L8.5 25.5 M17 17 L5 17 M17 17 L8.5 8.5" stroke="#f2cf3a" stroke-width="1.4"/></svg>' },
  jeruk: { r: 1, svg: '<svg viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg"><circle cx="17" cy="17" r="15" fill="#f5a31c" stroke="#d67a08" stroke-width="2"/><circle cx="17" cy="17" r="12" fill="#ffd38a"/><path d="M17 17 L17 5 M17 17 L25.5 8.5 M17 17 L29 17 M17 17 L25.5 25.5 M17 17 L17 29 M17 17 L8.5 25.5 M17 17 L5 17 M17 17 L8.5 8.5" stroke="#f08e10" stroke-width="1.4"/></svg>' },
  daun: { r: 30 / 24, svg: '<svg viewBox="0 0 30 24" xmlns="http://www.w3.org/2000/svg"><path d="M3 20 C4 8 14 3 27 3 C26 15 18 22 3 20 Z" fill="#7db356" stroke="#4f8133" stroke-width="1.5"/><path d="M4 19 L22 7" stroke="#4f8133" stroke-width="1.2" fill="none"/></svg>' }
};

// Daftar bentuk dan ukuran (lebar, dalam piksel) untuk tiap jenis menu. Sengaja kecil.
var KONFIG_ANIMASI = {
  "mie-lebar":      { jumlah: 8,  bentuk: ["lebar"], ukuran: [42, 56] },
  "mie-kecil":      { jumlah: 9,  bentuk: ["kecil"], ukuran: [40, 52] },
  "pangsit-rebus":  { jumlah: 8,  bentuk: ["rebus"], ukuran: [24, 34] },
  "pangsit-goreng": { jumlah: 8,  bentuk: ["goreng"], ukuran: [24, 34] },
  "bakso-goreng":   { jumlah: 9,  bentuk: ["bakso"], ukuran: [18, 26] },
  "air":            { jumlah: 10, bentuk: ["air"], ukuran: [13, 20] },
  "teh":            { jumlah: 10, bentuk: ["teh"], ukuran: [13, 20] },
  "teh-lemon":      { jumlah: 9,  bentuk: ["lemon", "teh"], ukuran: [18, 26] },
  "teh-kampul":     { jumlah: 9,  bentuk: ["teh", "daun"], ukuran: [16, 24] },
  "teh-tarik":      { jumlah: 10, bentuk: ["tarik", "busa"], ukuran: [14, 22] },
  "jeruk":          { jumlah: 9,  bentuk: ["jeruk"], ukuran: [18, 26] }
};

function buatBentuk(nama, lebarPx) {
  var tempat = document.createElement("div");
  tempat.innerHTML = BENTUK[nama].svg;
  var svg = tempat.firstChild;
  svg.setAttribute("width", lebarPx);
  svg.setAttribute("height", Math.round(lebarPx / BENTUK[nama].r));
  svg.setAttribute("class", "jatuh-item");
  return svg;
}

function jatuhkanItem(jenis) {
  var cfg = KONFIG_ANIMASI[jenis];
  if (tanpaGerak || !cfg || !lapisanMie.animate) { return; }
  var lebar = window.innerWidth, tinggi = window.innerHeight;
  var jumlah = lebar < 600 ? Math.max(5, cfg.jumlah - 3) : cfg.jumlah;
  for (var i = 0; i < jumlah; i++) {
    var nama = cfg.bentuk[Math.floor(Math.random() * cfg.bentuk.length)];
    var el = buatBentuk(nama, Math.round(acak(cfg.ukuran[0], cfg.ukuran[1])));
    el.style.left = Math.round(acak(0.04, 0.92) * lebar) + "px";
    lapisanMie.appendChild(el);

    var jarak = tinggi * acak(0.3, 0.55);
    var ayun = acak(-24, 24);
    var pk = cfg.putar === undefined ? 1 : cfg.putar;
    var putar0 = acak(-30, 30) * pk;
    var putar1 = putar0 + acak(-70, 70) * pk;
    var gerak = el.animate([
      { transform: "translate(0px, -50px) rotate(" + putar0 + "deg)", opacity: 0, offset: 0 },
      { opacity: 1, offset: 0.15 },
      { opacity: 1, offset: 0.7 },
      { transform: "translate(" + ayun + "px, " + jarak + "px) rotate(" + putar1 + "deg)", opacity: 0, offset: 1 }
    ], { duration: acak(1000, 1700), delay: acak(0, 300), easing: "cubic-bezier(0.3, 0.1, 0.5, 1)", fill: "both" });
    gerak.onfinish = (function (node) { return function () { node.remove(); }; })(el);
  }
}

// ---------- Tombol Tambah di menu ----------
var tombolTambah = document.querySelectorAll("[data-tambah]");
for (var t = 0; t < tombolTambah.length; t++) {
  tombolTambah[t].addEventListener("click", function () {
    var nama = this.getAttribute("data-tambah");
    var harga = parseInt(this.getAttribute("data-harga"), 10);
    if (!keranjang[nama]) { keranjang[nama] = { harga: harga, qty: 0 }; }
    keranjang[nama].qty += 1;
    simpanKeranjang();
    gambarKeranjang();
    jatuhkanItem(this.getAttribute("data-animasi"));
    tampilkanToast("Ditambahkan: " + nama);
    tombolBukaKeranjang.classList.remove("goyang");
    void tombolBukaKeranjang.offsetWidth;
    tombolBukaKeranjang.classList.add("goyang");
  });
}

tombolBukaKeranjang.addEventListener("click", bukaKeranjang);
panelKeranjang.querySelector(".k-tutup").addEventListener("click", tutupKeranjang);
panelKeranjang.addEventListener("click", function (e) {
  if (e.target === panelKeranjang) { tutupKeranjang(); return; }
  var ubah = e.target.getAttribute("data-ubah");
  if (ubah) { ubahJumlah(ubah, parseInt(e.target.getAttribute("data-arah"), 10)); }
});
document.getElementById("k-kosongkan").addEventListener("click", function () {
  keranjang = {};
  simpanKeranjang();
  gambarKeranjang();
  tutupKeranjang();
});
// ---------- Pengecekan isian sebelum kirim (getar + suara jika ada yang kurang) ----------
var kolomNama = document.getElementById("nama-pemesan");
var kolomTelp = document.getElementById("telp-pemesan");
var galatNama = document.getElementById("galat-nama");
var galatTelp = document.getElementById("galat-telp");
var konteksSuara = null;

// Ubah nomor ke bentuk 08xxxxxxxxxx (buang spasi, tanda hubung, dan awalan +62 atau 62)
function rapikanTelepon(teks) {
  var angka = teks.replace(/[^\d+]/g, "");
  if (angka.indexOf("+62") === 0) { angka = "0" + angka.slice(3); }
  else if (angka.indexOf("62") === 0) { angka = "0" + angka.slice(2); }
  return angka.replace(/\D/g, "");
}

function pesanGalatTelepon(teks) {
  var angka = rapikanTelepon(teks);
  if (angka.length === 0) { return "Nomor telepon belum diisi."; }
  if (angka.indexOf("08") !== 0) { return "Nomor telepon harus diawali 08."; }
  if (angka.length < 11) { return "Nomor telepon baru " + angka.length + " angka. Harus 11 atau 12 angka."; }
  if (angka.length > 12) { return "Nomor telepon terlalu panjang (" + angka.length + " angka). Harus 11 atau 12 angka."; }
  return "";
}

function tandaiGalat(kolom, kotak, pesan) {
  kotak.textContent = pesan;
  kotak.hidden = pesan === "";
  kolom.classList.toggle("salah", pesan !== "");
  if (pesan) { kolom.setAttribute("aria-invalid", "true"); } else { kolom.removeAttribute("aria-invalid"); }
}

// Bunyi "deret-deret" tiga kali, dibuat dengan Web Audio (tanpa file suara)
function bunyiDeret() {
  try {
    var Konteks = window.AudioContext || window.webkitAudioContext;
    if (!Konteks) { return; }
    if (!konteksSuara) { konteksSuara = new Konteks(); }
    if (konteksSuara.state === "suspended") { konteksSuara.resume(); }
    var mulai = konteksSuara.currentTime;
    for (var n = 0; n < 3; n++) {
      var t = mulai + n * 0.17;
      var osilator = konteksSuara.createOscillator();
      var saring = konteksSuara.createBiquadFilter();
      var volume = konteksSuara.createGain();
      osilator.type = "sawtooth";
      osilator.frequency.setValueAtTime(145, t);
      saring.type = "lowpass";
      saring.frequency.value = 900;
      volume.gain.setValueAtTime(0.0001, t);
      volume.gain.exponentialRampToValueAtTime(0.16, t + 0.015);
      volume.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osilator.connect(saring);
      saring.connect(volume);
      volume.connect(konteksSuara.destination);
      osilator.start(t);
      osilator.stop(t + 0.13);
    }
  } catch (err) { /* suara tidak tersedia, abaikan */ }
}

function getarkan(elemen) {
  if (tanpaGerak || !elemen.animate) { return; }
  elemen.animate([
    { transform: "translateX(0)" }, { transform: "translateX(-10px)" }, { transform: "translateX(10px)" },
    { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(-5px)" },
    { transform: "translateX(5px)" }, { transform: "translateX(0)" }
  ], { duration: 520, easing: "ease-in-out" });
}

function ingatkanKurang(kolomPertama, daftarGetar) {
  bunyiDeret();
  if (navigator.vibrate) { navigator.vibrate([120, 60, 120, 60, 120]); }
  getarkan(kartuKeranjang);
  for (var v = 0; v < daftarGetar.length; v++) { getarkan(daftarGetar[v]); }
  if (kolomPertama) { kolomPertama.focus(); }
}

function periksaPesanan() {
  var pesanNama = kolomNama.value.replace(/^\s+|\s+$/g, "").length < 2 ? "Nama pemesan belum diisi." : "";
  var pesanTelp = pesanGalatTelepon(kolomTelp.value);
  tandaiGalat(kolomNama, galatNama, pesanNama);
  tandaiGalat(kolomTelp, galatTelp, pesanTelp);
  var pesanJenis = jenisTerpilih() ? "" : "Pilih Dine In atau Take Away.";
  tandaiJenis(pesanJenis);
  var pesanAmbil = (jenisTerpilih() === "Take Away" && !jamAmbilTerpilih()) ? "Pilih jam pengambilan." : "";
  tandaiAmbil(pesanAmbil);
  var salah = [];
  if (pesanNama) { salah.push(kolomNama); }
  if (pesanTelp) { salah.push(kolomTelp); }
  if (pesanJenis) { salah.push(kelompokJenis); }
  if (pesanAmbil) { salah.push(kolomJam); }
  if (hitungKeranjang().jumlah === 0) {
    ingatkanKurang(null, []);
    return false;
  }
  if (salah.length > 0) {
    ingatkanKurang(salah[0] === kelompokJenis ? kelompokJenis.querySelector("input") : salah[0], salah);
    return false;
  }
  return true;
}

// Hapus tanda salah begitu pengguna mulai mengetik lagi
kolomNama.addEventListener("input", function () { tandaiGalat(kolomNama, galatNama, ""); });
kolomTelp.addEventListener("input", function () {
  this.value = this.value.replace(/[^\d+\s-]/g, "");
  tandaiGalat(kolomTelp, galatTelp, "");
});

document.getElementById("k-kirim").addEventListener("click", function () {
  if (!periksaPesanan()) { return; }
  NOMOR_ANTRIAN = buatNomorAntrian();
  var url = "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(buatPesanKeranjang());
  window.open(url, "_blank");
  tampilkanQris();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !panelKeranjang.hidden) { tutupKeranjang(); }
});

bacaKeranjang();
gambarKeranjang();

// ---------- FAQ (buka dan tutup jawaban) ----------
var tombolFaq = document.querySelectorAll(".faq-tombol");
for (var q = 0; q < tombolFaq.length; q++) {
  tombolFaq[q].addEventListener("click", function () {
    var item = this.closest(".faq-item");
    var terbuka = item.classList.toggle("buka");
    this.setAttribute("aria-expanded", terbuka ? "true" : "false");
  });
}


// ---------- Foto tampak depan kedai: ganti kotak kosong jika file sudah ada ----------
var kotakFotoKedai = document.getElementById("foto-kedai");
if (kotakFotoKedai) {
  var fotoKedai = kotakFotoKedai.querySelector("img");
  var tandaiAda = function () { kotakFotoKedai.classList.add("ada"); };
  fotoKedai.addEventListener("load", tandaiAda);
  if (fotoKedai.complete && fotoKedai.naturalWidth > 0) { tandaiAda(); }
}


// =====================================================
// REVISI 2: latar hidup, gelas minuman, pakcoy dan jamur,
// Dine In / Take Away, QRIS, dan barcode halal
// =====================================================

// ---------- Latar hidup: mangkok bakmie melayang pelan di belakang halaman ----------
var SVG_MANGKOK = '<svg viewBox="0 0 140 130" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
  '<g class="bm-uap" fill="none" stroke="#8a6a4a" stroke-width="3.5" stroke-linecap="round">' +
    '<path class="u1" d="M50 36 C42 28 58 22 50 8"/><path class="u2" d="M70 34 C62 24 80 18 70 2"/><path class="u3" d="M90 36 C82 28 98 22 90 8"/></g>' +
  '<g class="bm-sumpit" stroke-linecap="round"><path d="M98 8 L72 70" stroke="#5a3b2a" stroke-width="3.2"/><path d="M108 12 L80 72" stroke="#7a5238" stroke-width="3.2"/></g>' +
  '<g fill="none" stroke-linecap="round" class="bm-mie">' +
    '<path d="M22 62 C30 40 48 40 56 56 S78 72 86 52 S108 40 120 60" stroke="#c9a24d" stroke-width="8"/>' +
    '<path d="M22 62 C30 40 48 40 56 56 S78 72 86 52 S108 40 120 60" stroke="#f6e3b4" stroke-width="5"/>' +
    '<path d="M30 58 C42 38 58 46 66 60 S90 64 100 48" stroke="#f6e3b4" stroke-width="4"/></g>' +
  '<path d="M92 58 C96 42 118 36 128 46 C122 58 108 62 92 58 Z" fill="#6fa84a" stroke="#4f8133" stroke-width="2"/>' +
  '<path d="M96 56 L122 46" stroke="#cfe8a8" stroke-width="2.5" fill="none"/>' +
  '<path d="M8 58 H132 C132 96 104 116 70 116 C36 116 8 96 8 58 Z" fill="#a32a2a" stroke="#6e1818" stroke-width="2.5"/>' +
  '<path d="M8 58 H132" stroke="#c9a24d" stroke-width="4"/><path d="M18 72 H122" stroke="#c9a24d" stroke-width="2" stroke-dasharray="2 5"/>' +
  '<g fill="#f3e7d0"><circle cx="38" cy="90" r="4"/><circle cx="70" cy="98" r="4.5"/><circle cx="102" cy="90" r="4"/></g>' +
  '<rect x="50" y="114" width="40" height="9" rx="3" fill="#8e2323"/></svg>';

var POSISI_MANGKOK = [
  { l: 2,  t: 12, w: 150, dx: 34,  dy: 70,  r0: -8,  r1: 6,   dur: 17, tunda: 0 },
  { l: 82, t: 6,  w: 130, dx: -38, dy: 84,  r0: 7,   r1: -6,  dur: 21, tunda: -6 },
  { l: 88, t: 46, w: 170, dx: -30, dy: -60, r0: -5,  r1: 9,   dur: 19, tunda: -3 },
  { l: -3, t: 54, w: 140, dx: 40,  dy: -50, r0: 6,   r1: -8,  dur: 23, tunda: -10 },
  { l: 9,  t: 82, w: 120, dx: 46,  dy: -40, r0: -9,  r1: 5,   dur: 18, tunda: -4 },
  { l: 78, t: 80, w: 150, dx: -44, dy: -36, r0: 8,   r1: -5,  dur: 22, tunda: -12 },
  { l: 44, t: 90, w: 110, dx: 30,  dy: -56, r0: -4,  r1: 8,   dur: 20, tunda: -8 }
];

(function buatLatarHidup() {
  var wadah = document.getElementById("latar-hidup");
  if (!wadah) { return; }
  var hp = window.innerWidth < 600;
  var daftar = hp ? POSISI_MANGKOK.slice(0, 5) : POSISI_MANGKOK;
  for (var m = 0; m < daftar.length; m++) {
    var p = daftar[m];
    var el = document.createElement("div");
    el.className = "mk";
    el.style.left = p.l + "%";
    el.style.top = p.t + "%";
    el.style.width = Math.round(p.w * (hp ? 0.68 : 1)) + "px";
    el.style.setProperty("--dx", p.dx + "px");
    el.style.setProperty("--dy", p.dy + "px");
    el.style.setProperty("--r0", p.r0 + "deg");
    el.style.setProperty("--r1", p.r1 + "deg");
    el.style.setProperty("--dur", p.dur + "s");
    el.style.setProperty("--tunda", p.tunda + "s");
    el.innerHTML = SVG_MANGKOK;
    wadah.appendChild(el);
  }
})();

// ---------- Gelas berisi sesuai menu (menggantikan tetesan air) ----------
// Semua gelas memakai kerangka yang sama (28 x 40) supaya serasi.
function buatGelas(o) {
  var gelas = '<path d="M3 5 H25 L22.4 37 Q22.2 38.6 20.6 38.6 H7.4 Q5.8 38.6 5.6 37 Z" fill="' + o.cair + '"/>';
  if (o.busa) { gelas += '<path d="M3.4 5 C2 2 6 0.6 8 2.4 C9.5 0 14 0.2 15 2.4 C17 0.6 21 0.8 21.4 3 C24 2.6 25.4 4.4 24.8 5.4 Z" fill="#fff3df" stroke="#e2c79a" stroke-width="0.7"/>'; }
  gelas += '<g fill="#ffffff" fill-opacity="0.6" stroke="#ffffff" stroke-opacity="0.8" stroke-width="0.5">' +
    '<rect x="7.5" y="10" width="6" height="6" rx="1.2" transform="rotate(-12 10 13)"/><rect x="14.5" y="16" width="6" height="6" rx="1.2" transform="rotate(14 17 19)"/><rect x="8.5" y="22.5" width="5.5" height="5.5" rx="1.2" transform="rotate(8 11 25)"/></g>';
  gelas += '<path d="M3 5 H25 L22.4 37 Q22.2 38.6 20.6 38.6 H7.4 Q5.8 38.6 5.6 37 Z" fill="none" stroke="' + o.tepi + '" stroke-width="1.5" stroke-linejoin="round"/>';
  gelas += '<path d="M6.6 8 L8.3 33" stroke="#ffffff" stroke-opacity="0.75" stroke-width="1.6" stroke-linecap="round" fill="none"/>';
  return '<svg viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">' + (o.belakang || '') + gelas + (o.depan || '') + '</svg>';
}

var IRISAN_LEMON = '<g transform="translate(23 7)"><circle r="6.2" fill="#f6e052" stroke="#d9b61b" stroke-width="1"/><circle r="4.6" fill="#fff3a8"/><path d="M0 0V-4.6M0 0L3.3 -3.3M0 0H4.6M0 0L3.3 3.3M0 0V4.6M0 0L-3.3 3.3M0 0H-4.6M0 0L-3.3 -3.3" stroke="#f2cf3a" stroke-width="0.7"/></g>';
var IRISAN_JERUK = '<g transform="translate(23 7)"><circle r="6.2" fill="#f5a31c" stroke="#d67a08" stroke-width="1"/><circle r="4.6" fill="#ffd38a"/><path d="M0 0V-4.6M0 0L3.3 -3.3M0 0H4.6M0 0L3.3 3.3M0 0V4.6M0 0L-3.3 3.3M0 0H-4.6M0 0L-3.3 -3.3" stroke="#f08e10" stroke-width="0.7"/></g>';
var IRISAN_NIPIS = '<g transform="translate(23 7)"><circle r="6.2" fill="#8cc152" stroke="#5e9230" stroke-width="1"/><circle r="4.6" fill="#d9efa8"/><path d="M0 0V-4.6M0 0L3.3 -3.3M0 0H4.6M0 0L3.3 3.3M0 0V4.6M0 0L-3.3 3.3M0 0H-4.6M0 0L-3.3 -3.3" stroke="#a9d36d" stroke-width="0.7"/></g>';
var SEREH = '<path d="M18 4 L22.5 -8" stroke="#a6c46a" stroke-width="2.6" stroke-linecap="round"/>';
var SEDOTAN = '<path d="M16 6 L19 -9" stroke="#4a2f22" stroke-width="2.2" stroke-linecap="round"/>';

BENTUK.gelasAir    = { r: 28 / 40, svg: buatGelas({ cair: "#cdeefc", tepi: "#4fa6d6" }) };
BENTUK.gelasTeh    = { r: 28 / 40, svg: buatGelas({ cair: "#b4651a", tepi: "#7a3f0e" }) };
BENTUK.gelasLemon  = { r: 28 / 40, svg: buatGelas({ cair: "#d9962f", tepi: "#9a5f12", depan: IRISAN_LEMON }) };
BENTUK.gelasKampul = { r: 28 / 40, svg: buatGelas({ cair: "#c0762a", tepi: "#85500f", belakang: SEREH, depan: IRISAN_NIPIS }) };
BENTUK.gelasTarik  = { r: 28 / 40, svg: buatGelas({ cair: "#c98d5c", tepi: "#8d5a31", busa: true, belakang: SEDOTAN }) };
BENTUK.gelasJeruk  = { r: 28 / 40, svg: buatGelas({ cair: "#f7a81b", tepi: "#c9740a", depan: IRISAN_JERUK }) };

// ---------- Pakcoy dan jamur (untuk menu spesial) ----------
BENTUK.pakcoy = { r: 34 / 40, svg: '<svg viewBox="0 0 34 40" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M11 38 C7 30 6 21 8 14 C10 8 24 8 26 14 C28 21 27 30 23 38 Z" fill="#e3f0c4" stroke="#9cc063" stroke-width="1.4"/>' +
  '<path d="M17 38 V16" stroke="#b9d68a" stroke-width="1.4" fill="none"/>' +
  '<path d="M8 17 C-1 14 -1 3 8 2 C16 0 22 1 26 3 C35 5 34 15 26 17 C22 12 12 12 8 17 Z" fill="#4f9a3a" stroke="#357226" stroke-width="1.4" stroke-linejoin="round"/>' +
  '<path d="M17 14 V4 M17 12 L10 6 M17 12 L24 6" stroke="#8fcf6e" stroke-width="1" fill="none"/></svg>' };

BENTUK.jamur = { r: 32 / 30, svg: '<svg viewBox="0 0 32 30" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M12 16 H20 L19 28 Q16 29.5 13 28 Z" fill="#e6d2a8" stroke="#b9a070" stroke-width="1.3" stroke-linejoin="round"/>' +
  '<path d="M2.5 17 C2.5 4 29.5 4 29.5 17 Z" fill="#8b5a3a" stroke="#5a3820" stroke-width="1.6" stroke-linejoin="round"/>' +
  '<path d="M7 12 Q10 7 15 7" stroke="#c18a5f" stroke-width="2" fill="none" stroke-linecap="round"/>' +
  '<g fill="#b27a50"><circle cx="21" cy="11" r="1.3"/><circle cx="16" cy="13.5" r="1.1"/><circle cx="24.5" cy="14.5" r="1"/></g></svg>' };

KONFIG_ANIMASI["mie-lebar-spesial"] = { jumlah: 11, bentuk: ["lebar", "pakcoy", "jamur", "lebar", "pakcoy", "jamur"], ukuran: [30, 50] };
KONFIG_ANIMASI["mie-kecil-spesial"] = { jumlah: 11, bentuk: ["kecil", "pakcoy", "jamur", "kecil", "pakcoy", "jamur"], ukuran: [30, 50] };

KONFIG_ANIMASI["air"]        = { jumlah: 8, bentuk: ["gelasAir"],    ukuran: [26, 36], putar: 0.35 };
KONFIG_ANIMASI["teh"]        = { jumlah: 8, bentuk: ["gelasTeh"],    ukuran: [26, 36], putar: 0.35 };
KONFIG_ANIMASI["teh-lemon"]  = { jumlah: 9, bentuk: ["gelasLemon", "gelasLemon", "lemon"], ukuran: [26, 36], putar: 0.35 };
KONFIG_ANIMASI["teh-kampul"] = { jumlah: 9, bentuk: ["gelasKampul", "gelasKampul", "daun"], ukuran: [26, 36], putar: 0.35 };
KONFIG_ANIMASI["teh-tarik"]  = { jumlah: 8, bentuk: ["gelasTarik"],  ukuran: [26, 36], putar: 0.35 };
KONFIG_ANIMASI["jeruk"]      = { jumlah: 9, bentuk: ["gelasJeruk", "gelasJeruk", "jeruk"], ukuran: [26, 36], putar: 0.35 };

// ---------- Dine In / Take Away ----------
var kelompokJenis = document.getElementById("grup-jenis");
var galatJenis = document.getElementById("galat-jenis");

function jenisTerpilih() {
  var r = document.querySelector('input[name="jenis-pesanan"]:checked');
  return r ? r.value : "";
}

function tandaiJenis(pesan) {
  galatJenis.textContent = pesan;
  galatJenis.hidden = pesan === "";
  kelompokJenis.classList.toggle("salah", pesan !== "");
}

kelompokJenis.addEventListener("change", function () { tandaiJenis(""); });

// ---------- QRIS: barcode muncul di akhir, setelah pesanan dikirim ----------
var panelQris = document.getElementById("qris-panel");
var QRIS_TERAKHIR = { nama: "", total: 0 };

function tampilkanQris() {
  QRIS_TERAKHIR.nama = kolomNama.value.replace(/^\s+|\s+$/g, "");
  QRIS_TERAKHIR.total = hitungKeranjang().total;
  document.getElementById("qris-total").textContent = rupiah(QRIS_TERAKHIR.total);
  document.getElementById("qris-jenis").textContent = jenisTerpilih() + (jenisTerpilih() === "Take Away" ? ", ambil jam " + jamAmbilTerpilih() : "");
  document.getElementById("qris-antrian").textContent = NOMOR_ANTRIAN;
  panelQris.hidden = false;
  panelQris.querySelector(".qris-tutup").focus();
}

function tutupQris() { panelQris.hidden = true; }

panelQris.querySelector(".qris-tutup").addEventListener("click", tutupQris);
panelQris.addEventListener("click", function (e) { if (e.target === panelQris) { tutupQris(); } });

document.getElementById("qris-bukti").addEventListener("click", function () {
  var teks = "Halo Bakmie Djoeang, saya sudah bayar via QRIS untuk pesanan atas nama " + QRIS_TERAKHIR.nama +
    " (No. Antrian " + NOMOR_ANTRIAN + ") sebesar " + rupiah(QRIS_TERAKHIR.total) + ". Bukti pembayarannya saya lampirkan di chat ini.";
  window.open("https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(teks), "_blank");
});

document.getElementById("qris-selesai").addEventListener("click", function () {
  var ringkas = { antrian: NOMOR_ANTRIAN, jenis: jenisTerpilih(), jam: jamAmbilTerpilih() };
  keranjang = {};
  simpanKeranjang();
  gambarKeranjang();
  kolomNama.value = "";
  kolomTelp.value = "";
  var pilihan = document.querySelectorAll('input[name="jenis-pesanan"]');
  for (var z = 0; z < pilihan.length; z++) { pilihan[z].checked = false; }
  kolomJam.value = "";
  grupAmbil.hidden = true;
  tutupQris();
  tutupKeranjang();
  tampilkanTerimaKasih(ringkas);
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !panelQris.hidden) { tutupQris(); }
});


// ---------- Nomor antrian: 01, 02, 03 ... lalu kembali ke 01 saat ganti hari (WIB) ----------
var NOMOR_ANTRIAN = "";

function dua(n) { return (n < 10 ? "0" : "") + n; }

function tanggalWIB() {
  var w = new Date(Date.now() + 7 * 3600 * 1000);
  return w.getUTCFullYear() + "-" + dua(w.getUTCMonth() + 1) + "-" + dua(w.getUTCDate());
}

function buatNomorAntrian() {
  var tgl = tanggalWIB();
  var no = 0;
  try {
    var simpan = JSON.parse(localStorage.getItem("bd_antrian") || "null");
    if (simpan && simpan.tanggal === tgl) { no = simpan.no; }
  } catch (e) { no = 0; }
  no++;
  try { localStorage.setItem("bd_antrian", JSON.stringify({ tanggal: tgl, no: no })); } catch (e) { /* tetap lanjut */ }
  return dua(no);
}

// ---------- Take Away: pilih jam pengambilan ----------
var grupAmbil = document.getElementById("grup-ambil");
var kolomJam = document.getElementById("jam-ambil");
var galatAmbil = document.getElementById("galat-ambil");

function jamAmbilTerpilih() { return kolomJam.value; }

function tandaiAmbil(pesan) {
  galatAmbil.textContent = pesan;
  galatAmbil.hidden = pesan === "";
  kolomJam.classList.toggle("salah", pesan !== "");
}

// pilihan tiap 15 menit, 11.00 sampai 21.00; jam yang sudah lewat hari ini dinonaktifkan
function isiPilihanJam() {
  var wib = new Date(Date.now() + 7 * 3600 * 1000);
  var sekarang = wib.getUTCHours() * 60 + wib.getUTCMinutes();
  var dipilih = kolomJam.value;
  kolomJam.innerHTML = '<option value="">Pilih jam pengambilan</option>';
  for (var m = 11 * 60; m <= 21 * 60; m += 15) {
    var teks = dua(Math.floor(m / 60)) + ":" + dua(m % 60);
    var opsi = document.createElement("option");
    opsi.value = teks;
    opsi.textContent = teks;
    if (m < sekarang + 10) { opsi.disabled = true; }
    kolomJam.appendChild(opsi);
  }
  if (dipilih) { kolomJam.value = dipilih; }
}

kelompokJenis.addEventListener("change", function () {
  var takeAway = jenisTerpilih() === "Take Away";
  grupAmbil.hidden = !takeAway;
  if (takeAway) { isiPilihanJam(); } else { kolomJam.value = ""; tandaiAmbil(""); }
});

kolomJam.addEventListener("change", function () { tandaiAmbil(""); });


// ---------- Layar terima kasih: GIF lucu + suara (setelah menekan Selesai) ----------
var panelTk = document.getElementById("tk-panel");

// Denting naik tiga nada (Web Audio), lalu ucapan "Terima kasih" lewat suara perangkat bila tersedia
function bunyiTerimaKasih() {
  try {
    var Konteks = window.AudioContext || window.webkitAudioContext;
    if (Konteks) {
      if (!konteksSuara) { konteksSuara = new Konteks(); }
      if (konteksSuara.state === "suspended") { konteksSuara.resume(); }
      var nada = [659.25, 783.99, 1046.5];
      for (var n = 0; n < nada.length; n++) {
        var t = konteksSuara.currentTime + n * 0.14;
        var osi = konteksSuara.createOscillator();
        var vol = konteksSuara.createGain();
        osi.type = "sine";
        osi.frequency.setValueAtTime(nada[n], t);
        vol.gain.setValueAtTime(0.0001, t);
        vol.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
        osi.connect(vol);
        vol.connect(konteksSuara.destination);
        osi.start(t);
        osi.stop(t + 0.4);
      }
    }
  } catch (err) { /* denting tidak tersedia, abaikan */ }
  try {
    if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
      window.speechSynthesis.cancel();
      var ucap = new window.SpeechSynthesisUtterance("Terima kasih! Pesananmu kami tunggu ya.");
      ucap.lang = "id-ID";
      ucap.rate = 1;
      ucap.pitch = 1.15;
      window.setTimeout(function () { window.speechSynthesis.speak(ucap); }, 520);
    }
  } catch (err2) { /* suara ucapan tidak tersedia, abaikan */ }
}

function tampilkanTerimaKasih(ringkas) {
  document.getElementById("tk-antrian").textContent = ringkas.antrian;
  var info = ringkas.jenis ? " (" + ringkas.jenis + (ringkas.jam ? ", ambil jam " + ringkas.jam : "") + ")" : "";
  document.getElementById("tk-info").textContent = info;
  // muat ulang GIF supaya animasinya mulai dari awal tiap kali tampil
  document.getElementById("tk-gif").src = "gambar/terima-kasih.gif?t=" + Date.now();
  panelTk.hidden = false;
  document.getElementById("tk-tutup").focus();
  bunyiTerimaKasih();
}

function tutupTerimaKasih() {
  panelTk.hidden = true;
  try { if (window.speechSynthesis) { window.speechSynthesis.cancel(); } } catch (err) { /* abaikan */ }
}

document.getElementById("tk-tutup").addEventListener("click", tutupTerimaKasih);
panelTk.addEventListener("click", function (e) { if (e.target === panelTk) { tutupTerimaKasih(); } });
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panelTk.hidden) { tutupTerimaKasih(); } });


// =====================================================
// REVISI: Keranjang Favorit (simpan dulu, pesan nanti)
// =====================================================
var KUNCI_FAVORIT = "bakmie-favorit";
var favorit = {};

function bacaFavorit() {
  try {
    var data = window.localStorage.getItem(KUNCI_FAVORIT);
    if (data) { favorit = JSON.parse(data) || {}; }
  } catch (err) { favorit = {}; }
}

function simpanFavorit() {
  try { window.localStorage.setItem(KUNCI_FAVORIT, JSON.stringify(favorit)); } catch (err) { /* abaikan */ }
}

var tombolBukaFavorit = document.getElementById("favorit-buka");
var panelFavorit = document.getElementById("favorit-panel");
var daftarFavorit = document.getElementById("favorit-daftar");
var tombolLove = [];

function jumlahFavorit() {
  var n = 0;
  for (var k in favorit) { n++; }
  return n;
}

var SVG_LOVE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C1 8.4 2.9 5 6.2 5c2 0 3.6 1.1 4.6 2.7h.4C12.2 6.1 13.8 5 15.8 5c3.3 0 5.2 3.4 3.8 6.7C19.5 16.4 12 21 12 21z" stroke-linejoin="round"/></svg>';

// Ikon hati di pojok foto setiap menu
(function pasangIkonHati() {
  var tombol = document.querySelectorAll("[data-tambah]");
  for (var i = 0; i < tombol.length; i++) {
    var item = tombol[i].closest(".menu-item");
    if (!item) { continue; }
    var nama = tombol[i].getAttribute("data-tambah");
    var love = document.createElement("button");
    love.type = "button";
    love.className = "btn-love";
    love.setAttribute("data-favorit", nama);
    love.setAttribute("data-harga", tombol[i].getAttribute("data-harga"));
    love.setAttribute("aria-pressed", "false");
    love.setAttribute("aria-label", "Simpan " + nama + " ke favorit");
    love.innerHTML = SVG_LOVE;
    item.appendChild(love);
    tombolLove.push(love);
  }
})();

function gambarFavorit() {
  var n = jumlahFavorit();
  document.getElementById("f-jumlah").textContent = n;
  tombolBukaFavorit.hidden = n === 0;
  document.getElementById("favorit-kosong").hidden = n !== 0;
  document.getElementById("favorit-aksi").hidden = n === 0;

  for (var i = 0; i < tombolLove.length; i++) {
    var nama = tombolLove[i].getAttribute("data-favorit");
    var aktif = !!favorit[nama];
    tombolLove[i].setAttribute("aria-pressed", aktif ? "true" : "false");
    tombolLove[i].setAttribute("aria-label", (aktif ? "Hapus " : "Simpan ") + nama + (aktif ? " dari favorit" : " ke favorit"));
  }

  daftarFavorit.innerHTML = "";
  for (var nm in favorit) {
    var baris = document.createElement("li");
    baris.className = "k-baris";
    var info = document.createElement("div");
    var teksNama = document.createElement("div");
    teksNama.className = "k-nama";
    teksNama.textContent = nm;
    var teksHarga = document.createElement("div");
    teksHarga.className = "k-harga";
    teksHarga.textContent = rupiah(favorit[nm].harga);
    info.appendChild(teksNama);
    info.appendChild(teksHarga);

    var aksi = document.createElement("div");
    aksi.className = "f-aksi";
    var pesan = document.createElement("button");
    pesan.type = "button";
    pesan.className = "btn btn-kecil";
    pesan.textContent = "Pesan";
    pesan.setAttribute("data-f-pesan", nm);
    pesan.setAttribute("aria-label", "Pesan " + nm);
    var hapus = document.createElement("button");
    hapus.type = "button";
    hapus.className = "f-hapus";
    hapus.textContent = "\u2715";
    hapus.setAttribute("data-f-hapus", nm);
    hapus.setAttribute("aria-label", "Hapus " + nm + " dari favorit");
    aksi.appendChild(pesan);
    aksi.appendChild(hapus);

    baris.appendChild(info);
    baris.appendChild(aksi);
    daftarFavorit.appendChild(baris);
  }
}

function ubahFavorit(nama, harga) {
  if (favorit[nama]) {
    delete favorit[nama];
    tampilkanToast("Dihapus dari favorit: " + nama);
  } else {
    favorit[nama] = { harga: harga };
    tampilkanToast("Disimpan di favorit: " + nama);
  }
  simpanFavorit();
  gambarFavorit();
  if (jumlahFavorit() === 0) { tutupFavorit(); }
}

function masukkanKePesanan(nama, harga) {
  if (!keranjang[nama]) { keranjang[nama] = { harga: harga, qty: 0 }; }
  keranjang[nama].qty += 1;
}

function goyangKeranjang() {
  tombolBukaKeranjang.classList.remove("goyang");
  void tombolBukaKeranjang.offsetWidth;
  tombolBukaKeranjang.classList.add("goyang");
}

function bukaFavorit() {
  panelFavorit.hidden = false;
  panelFavorit.querySelector(".k-tutup").focus();
}

function tutupFavorit() { panelFavorit.hidden = true; }

for (var li = 0; li < tombolLove.length; li++) {
  tombolLove[li].addEventListener("click", function () {
    ubahFavorit(this.getAttribute("data-favorit"), parseInt(this.getAttribute("data-harga"), 10));
    this.classList.remove("pop");
    void this.offsetWidth;
    this.classList.add("pop");
  });
}

tombolBukaFavorit.addEventListener("click", bukaFavorit);
panelFavorit.querySelector(".k-tutup").addEventListener("click", tutupFavorit);
panelFavorit.addEventListener("click", function (e) {
  if (e.target === panelFavorit) { tutupFavorit(); return; }
  var pesan = e.target.getAttribute("data-f-pesan");
  var hapus = e.target.getAttribute("data-f-hapus");
  if (pesan && favorit[pesan]) {
    masukkanKePesanan(pesan, favorit[pesan].harga);
    simpanKeranjang();
    gambarKeranjang();
    goyangKeranjang();
    tampilkanToast("Masuk Keranjang Pesanan: " + pesan);
  } else if (hapus) {
    delete favorit[hapus];
    simpanFavorit();
    gambarFavorit();
    if (jumlahFavorit() === 0) { tutupFavorit(); }
  }
});

document.getElementById("favorit-semua").addEventListener("click", function () {
  for (var nm in favorit) { masukkanKePesanan(nm, favorit[nm].harga); }
  simpanKeranjang();
  gambarKeranjang();
  goyangKeranjang();
  tutupFavorit();
  tampilkanToast("Semua favorit masuk Keranjang Pesanan");
  bukaKeranjang();
});

document.getElementById("favorit-kosongkan").addEventListener("click", function () {
  favorit = {};
  simpanFavorit();
  gambarFavorit();
  tutupFavorit();
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !panelFavorit.hidden) { tutupFavorit(); }
});

// Tombol Favorit selalu duduk tepat di atas tombol Keranjang Pesanan;
// kalau keranjang pesanan belum tampil, ia turun ke posisi paling bawah.
function sesuaikanPosisiFavorit() {
  tombolBukaFavorit.classList.toggle("tanpa-keranjang", tombolBukaKeranjang.hidden);
}
if (window.MutationObserver) {
  new MutationObserver(sesuaikanPosisiFavorit).observe(tombolBukaKeranjang, { attributes: true, attributeFilter: ["hidden"] });
}

bacaFavorit();
gambarFavorit();
sesuaikanPosisiFavorit();


// =====================================================
// REVISI 5: FAQ di sisi kiri (isi disalin dari halaman FAQ)
// =====================================================
(function pasangFaqSamping() {
  var tombol = document.getElementById("faq-samping-buka");
  var panel = document.getElementById("faq-samping-panel");
  var daftar = document.getElementById("faq-samping-daftar");
  if (!tombol || !panel || !daftar) { return; }

  var butir = document.querySelectorAll("#faq .faq-item");
  for (var i = 0; i < butir.length; i++) {
    var tanya = butir[i].querySelector(".faq-tombol");
    var jawab = butir[i].querySelector(".faq-isi");
    if (!tanya || !jawab) { continue; }
    var d = document.createElement("details");
    d.className = "faq-s-item";
    var s = document.createElement("summary");
    s.textContent = tanya.textContent;
    var isi = document.createElement("div");
    isi.className = "faq-s-jawab";
    isi.innerHTML = jawab.innerHTML;
    d.appendChild(s);
    d.appendChild(isi);
    daftar.appendChild(d);
  }

  function buka() {
    panel.hidden = false;
    tombol.setAttribute("aria-expanded", "true");
    panel.querySelector(".k-tutup").focus();
  }
  function tutup() {
    panel.hidden = true;
    tombol.setAttribute("aria-expanded", "false");
  }

  tombol.addEventListener("click", buka);
  panel.querySelector(".k-tutup").addEventListener("click", tutup);
  panel.addEventListener("click", function (e) { if (e.target === panel) { tutup(); } });
  panel.querySelector(".faq-samping-lengkap").addEventListener("click", tutup);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { tutup(); } });
})();

const form = document.getElementById("formTransaksi");
const daftar = document.getElementById("daftarTransaksi");

let transaksi = JSON.parse(
  localStorage.getItem("dompetku")
) || [];

document.getElementById("tanggal").value =
  new Date().toLocaleDateString("en-CA");

function rupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
}

function simpanData() {
  localStorage.setItem("dompetku", JSON.stringify(transaksi));
}

function tampilkanData() {
  daftar.replaceChildren();

  let totalMasuk = 0;
  let totalKeluar = 0;

  transaksi.forEach(function(item) {
    if (item.jenis === "pemasukan") {
      totalMasuk += item.nominal;
    } else {
      totalKeluar += item.nominal;
    }
  });

  document.getElementById("pemasukan").textContent =
    rupiah(totalMasuk);

  document.getElementById("pengeluaran").textContent =
    rupiah(totalKeluar);

  document.getElementById("saldo").textContent =
    rupiah(totalMasuk - totalKeluar);

  const kata = document.getElementById("pencarian")
    .value.toLowerCase();

  const hasil = transaksi.filter(function(item) {
    return item.keterangan.toLowerCase().includes(kata) ||
      item.kategori.toLowerCase().includes(kata);
  });

  document.getElementById("pesanKosong").hidden =
    hasil.length !== 0;

  hasil.forEach(function(item) {
    const baris = document.createElement("tr");

    function tambahSel(nilai, kelas = "") {
      const sel = document.createElement("td");
      sel.textContent = nilai;
      sel.className = kelas;
      baris.appendChild(sel);
      return sel;
    }

    tambahSel(item.tanggal);
    tambahSel(item.keterangan);
    tambahSel(item.kategori);

    tambahSel(
      item.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran",
      item.jenis === "pemasukan" ? "masuk" : "keluar"
    );

    tambahSel(rupiah(item.nominal));

    const aksi = tambahSel("");

    const tombolEdit = document.createElement("button");
    tombolEdit.textContent = "Edit";
    tombolEdit.className = "edit";
    tombolEdit.addEventListener("click", function() {
      editData(item.id);
    });

    const tombolHapus = document.createElement("button");
    tombolHapus.textContent = "Hapus";
    tombolHapus.className = "hapus";
    tombolHapus.addEventListener("click", function() {
      hapusData(item.id);
    });

    aksi.append(tombolEdit, tombolHapus);
    daftar.appendChild(baris);
  });
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const id = document.getElementById("id").value;
  const nominal = Number(
    document.getElementById("nominal").value
  );

  if (!Number.isSafeInteger(nominal) || nominal <= 0) {
    alert("Nominal harus berupa bilangan bulat positif.");
    return;
  }

  const data = {
    id: id || String(Date.now()) + Math.random(),
    tanggal: document.getElementById("tanggal").value,
    keterangan: document.getElementById("keterangan").value.trim(),
    kategori: document.getElementById("kategori").value,
    jenis: document.getElementById("jenis").value,
    nominal: nominal
  };

  if (!data.tanggal || !data.keterangan) {
    alert("Tanggal dan keterangan wajib diisi.");
    return;
  }

  if (id) {
    transaksi = transaksi.map(function(item) {
      return item.id === id ? data : item;
    });
  } else {
    transaksi.push(data);
  }

  simpanData();
  tampilkanData();
  resetForm();
});

function editData(id) {
  const item = transaksi.find(function(data) {
    return data.id === id;
  });

  if (!item) return;

  document.getElementById("id").value = item.id;
  document.getElementById("tanggal").value = item.tanggal;
  document.getElementById("keterangan").value = item.keterangan;
  document.getElementById("kategori").value = item.kategori;
  document.getElementById("jenis").value = item.jenis;
  document.getElementById("nominal").value = item.nominal;

  document.getElementById("judulForm").textContent =
    "Edit Transaksi";

  document.getElementById("tombolSimpan").textContent =
    "Simpan Perubahan";

  document.getElementById("tombolBatal").hidden = false;

  form.scrollIntoView({ behavior: "smooth" });
}

function hapusData(id) {
  if (!confirm("Yakin ingin menghapus transaksi ini?")) {
    return;
  }

  transaksi = transaksi.filter(function(item) {
    return item.id !== id;
  });

  simpanData();
  tampilkanData();
  resetForm();
}

function resetForm() {
  form.reset();
  document.getElementById("id").value = "";

  document.getElementById("judulForm").textContent =
    "Tambah Transaksi";

  document.getElementById("tombolSimpan").textContent =
    "Tambah Transaksi";

  document.getElementById("tombolBatal").hidden = true;

  document.getElementById("tanggal").value =
    new Date().toLocaleDateString("en-CA");
}

document.getElementById("tombolBatal").addEventListener(
  "click", resetForm
);

document.getElementById("pencarian").addEventListener(
  "input", tampilkanData
);

tampilkanData();
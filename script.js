const API_BASE = 'https://dummyjson.com/products';

const formProduk = document.getElementById('form-produk');
const inputId = document.getElementById('input-id');
const inputNama = document.getElementById('input-nama');
const inputHarga = document.getElementById('input-harga');
const btnSubmit = document.getElementById('btn-submit');
const btnBatal = document.getElementById('btn-batal');
const daftarProduk = document.getElementById('daftar-produk');
const errorMessage = document.getElementById('error-message');

let stateProduk = [];

function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
}

function tampilkanError(pesan) {
    errorMessage.textContent = pesan;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function resetForm() {
    formProduk.reset();
    inputId.value = '';
    btnSubmit.textContent = 'Tambah Data';
    btnBatal.style.display = 'none';
}

function renderDOM() {
    daftarProduk.innerHTML = '';
    for (const produk of stateProduk) {
        const li = document.createElement('li');
        
        const teks = document.createElement('span');
        teks.innerHTML = `<strong>${produk.title}</strong> - ${formatRupiah(produk.price)}`;
        
        const divAksi = document.createElement('div');
        divAksi.className = 'aksi-btn';

        const btnEdit = document.createElement('button');
        btnEdit.textContent = 'Edit';
        btnEdit.className = 'btn-edit';
        btnEdit.onclick = () => siapkanEdit(produk.id);

        const btnHapus = document.createElement('button');
        btnHapus.textContent = 'Hapus';
        btnHapus.className = 'btn-hapus';
        btnHapus.onclick = () => hapusData(produk.id);

        divAksi.appendChild(btnEdit);
        divAksi.appendChild(btnHapus);
        li.appendChild(teks);
        li.appendChild(divAksi);
        daftarProduk.appendChild(li);
    }
}

function siapkanEdit(id) {
    const produk = stateProduk.find(p => p.id === id);
    if (produk) {
        inputId.value = produk.id;
        inputNama.value = produk.title;
        inputHarga.value = produk.price;
        btnSubmit.textContent = 'Simpan Perubahan';
        btnBatal.style.display = 'block';
    }
}

async function ambilDataAwal() {
    try {
        const response = await fetch(`${API_BASE}?limit=5`);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        await response.json();
        
        stateProduk = [
            { id: 1, title: 'Semen Portland 50kg', price: 65000 },
            { id: 2, title: 'Cat Tembok Putih 5kg', price: 120000 },
            { id: 3, title: 'Paku Beton 5cm (1 Kotak)', price: 25000 },
            { id: 4, title: 'Pipa PVC 1/2 Inch', price: 15000 },
            { id: 5, title: 'Besi Beton Polos 8mm', price: 45000 }
        ];
        renderDOM();
    } catch (error) {
        tampilkanError(`Gagal memuat data awal: ${error.message}`);
    }
}

async function tambahData(title, price) {
    try {
        const response = await fetch(`${API_BASE}/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, price })
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const dataBaru = await response.json();
        stateProduk.unshift(dataBaru);
        renderDOM();
        resetForm();
    } catch (error) {
        tampilkanError(`Gagal menambah data: ${error.message}`);
    }
}

async function editData(id, title, price) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, price })
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const dataUpdate = await response.json();
        const index = stateProduk.findIndex(p => p.id === id);
        if (index !== -1) {
            stateProduk[index] = dataUpdate;
            renderDOM();
        }
        resetForm();
    } catch (error) {
        tampilkanError(`Gagal mengedit data: ${error.message}`);
    }
}

async function hapusData(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        if (data.isDeleted) {
            stateProduk = stateProduk.filter(p => p.id !== id);
            renderDOM();
        }
    } catch (error) {
        tampilkanError(`Gagal menghapus data: ${error.message}`);
    }
}

formProduk.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = inputId.value;
    const title = inputNama.value;
    const price = Number(inputHarga.value);

    if (id) {
        await editData(Number(id), title, price);
    } else {
        await tambahData(title, price);
    }
});

btnBatal.addEventListener('click', resetForm);

ambilDataAwal();
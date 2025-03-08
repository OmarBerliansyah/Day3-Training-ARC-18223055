// @ts-nocheck
import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, remove } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDq8B1oxJDWx78mnhzaqusN_fyrwi27vi8",
  authDomain: "ayam-6f36d.firebaseapp.com",
  projectId: "ayam-6f36d",
  storageBucket: "ayam-6f36d.firebasestorage.app",
  messagingSenderId: "31971534704",
  appId: "1:31971534704:web:4fb8080de318b31f860656",
  measurementId: "G-J1Y7FMTB38",
  databaseURL: "https://ayam-6f36d-default-rtdb.asia-southeast1.firebasedatabase.app" 
};

const app_firebase = initializeApp(firebaseConfig);
const database = getDatabase(app_firebase);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const kendaraanData = [
  {"plat_nomor":"AB-2171-AT","tahun_pembelian":2021,"warna_kendaraan":"Biru","merk_kendaraan":"Mitsubishi L300"},
  {"plat_nomor":"AB-6141-GO","tahun_pembelian":2018,"warna_kendaraan":"Biru","merk_kendaraan":"Isuzu Elf"},
  {"plat_nomor":"AB-7578-WE","tahun_pembelian":2019,"warna_kendaraan":"Abu-abu","merk_kendaraan":"Toyota Hilux"},
  {"plat_nomor":"AB-7889-AW","tahun_pembelian":2019,"warna_kendaraan":"Silver","merk_kendaraan":"Yamaha NMAX"},
  {"plat_nomor":"AB-8860-MW","tahun_pembelian":2022,"warna_kendaraan":"Merah","merk_kendaraan":"Daihatsu Gran Max"},
  {"plat_nomor":"AB-9336-NV","tahun_pembelian":2021,"warna_kendaraan":"Putih","merk_kendaraan":"Daihatsu Gran Max"},
  {"plat_nomor":"AG-1230-YS","tahun_pembelian":2022,"warna_kendaraan":"Silver","merk_kendaraan":"Kawasaki KLX"},
  {"plat_nomor":"AG-2886-VL","tahun_pembelian":2023,"warna_kendaraan":"Abu-abu","merk_kendaraan":"Kawasaki KLX"},
  {"plat_nomor":"B-1750-KR","tahun_pembelian":2019,"warna_kendaraan":"Silver","merk_kendaraan":"Toyota Hilux"},
  {"plat_nomor":"B-2549-FO","tahun_pembelian":2019,"warna_kendaraan":"Hitam","merk_kendaraan":"Yamaha Aerox"}
];

async function initializeFirebaseData() {
  try {
    const kendaraanRef = ref(database, 'kendaraan');
    const snapshot = await get(kendaraanRef);
    
    if (!snapshot.exists()) {
      console.log("Initializing Firebase database with default data...");
      
      const updates = {};
      kendaraanData.forEach(kendaraan => {
        const { plat_nomor, ...data } = kendaraan;
        updates[`kendaraan/${plat_nomor}`] = data;
      });
      
      await update(ref(database), updates);
      console.log("Database initialized successfully!");
    }

    else {
      console.log("Database already contains data, skipping initialization.");
    }
  } 
  
  catch (error) {
    console.error("Error initializing database:", error);
  }
}

initializeFirebaseData();

app.get('/api/check-db', async (req, res) => {
  try {
    const rootRef = ref(database);
    await get(rootRef);
    res.json({ connected: true });
  }

  catch (error) {
    console.error("Database connection error:", error);
    res.json({ connected: false, error: error.message });
  }
});

app.get('/api/kendaraan', async (req, res) => {
  try {
    console.log("GET /api/kendaraan dipanggil");
    
    const kendaraanRef = ref(database, 'kendaraan');
    const snapshot = await get(kendaraanRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const kendaraanArray = Object.keys(data).map(key => ({
        plat_nomor: key,
        ...data[key]
      }));
      
      res.json(kendaraanArray);
    } 
    
    else {
      res.json([]);
    }
  } 


  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
  }
});

app.get('/api/kendaraan/:plat', async (req, res) => {
  const plat = req.params.plat;
  
  try {
    const kendaraanRef = ref(database, `kendaraan/${plat}`);
    const snapshot = await get(kendaraanRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      res.json({
        plat_nomor: plat,
        ...data
      });
    } 
    
    else {
      res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    }
  } 
  
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengambil data" });
  }
});

app.post('/api/kendaraan', async (req, res) => {
  const { plat_nomor, tahun_pembelian, warna_kendaraan, merk_kendaraan } = req.body;
  
  if (!plat_nomor || !tahun_pembelian || !warna_kendaraan || !merk_kendaraan) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }
  
  try {
    const kendaraanRef = ref(database, `kendaraan/${plat_nomor}`);
    const snapshot = await get(kendaraanRef);
    
    if (snapshot.exists()) {
      return res.status(400).json({ message: 'Plat nomor sudah terdaftar' });
    }
    
    await set(kendaraanRef, {
      tahun_pembelian,
      warna_kendaraan,
      merk_kendaraan
    });
    
    res.status(201).json({ success: true });
  } 
  
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat menambah data" });
  }
});

app.put('/api/kendaraan/:plat', async (req, res) => {
  const plat = req.params.plat;
  const { tahun_pembelian, warna_kendaraan, merk_kendaraan } = req.body;
  
  try {
    const kendaraanRef = ref(database, `kendaraan/${plat}`);
    const snapshot = await get(kendaraanRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    }
    
    const updates = {};
    if (tahun_pembelian !== undefined) updates.tahun_pembelian = tahun_pembelian;
    if (warna_kendaraan !== undefined) updates.warna_kendaraan = warna_kendaraan;
    if (merk_kendaraan !== undefined) updates.merk_kendaraan = merk_kendaraan;
    
    await update(kendaraanRef, updates);
    
    res.json({ success: true });
  } 
  
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengupdate data" });
  }
});

app.delete('/api/kendaraan/:plat', async (req, res) => {
  const plat = req.params.plat;
  
  try {
    const kendaraanRef = ref(database, `kendaraan/${plat}`);
    const snapshot = await get(kendaraanRef);
    
    if (!snapshot.exists()) {
      return res.status(404).json({ message: 'Kendaraan tidak ditemukan' });
    }
    
    await remove(kendaraanRef);
    
    res.json({ success: true });
  } 
  
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus data" });
  }
});

app.post('/api/tambah-koin', (req, res) => {
  res.json({ success: true });
});

app.post('/api/reset', async (req, res) => {
  try {
    const updates = {};
    
    kendaraanData.forEach(kendaraan => {
      const { plat_nomor, ...data } = kendaraan;
      updates[`kendaraan/${plat_nomor}`] = data;
    });
    
    await update(ref(database), updates);
    
    res.json({ success: true, message: 'Data kendaraan telah direset' });
  } 
  
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat reset data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan pada port ${PORT}`);
});

export {};
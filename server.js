const express = require('express');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Data paths
const CONFIG_PATH = path.join(__dirname, 'data', 'config.json');
const KAYITLAR_PATH = path.join(__dirname, 'data', 'kayitlar.json');

// Helper functions
function getConfig() {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function getKayitlar() {
    if (!fs.existsSync(KAYITLAR_PATH)) {
        fs.writeFileSync(KAYITLAR_PATH, JSON.stringify([]), 'utf8');
    }
    return JSON.parse(fs.readFileSync(KAYITLAR_PATH, 'utf8'));
}

function saveKayit(kayit) {
    const kayitlar = getKayitlar();
    kayitlar.push(kayit);
    fs.writeFileSync(KAYITLAR_PATH, JSON.stringify(kayitlar, null, 2), 'utf8');
}

// Ana sayfa - Admin Panel
app.get('/', (req, res) => {
    const config = getConfig();
    const kayitlar = getKayitlar();
    res.render('admin', { config, kayitlar });
});

// Kontrol Formu Sayfası
app.get('/form/:tip', (req, res) => {
    const tip = req.params.tip;
    const config = getConfig();
    
    if (!config[tip]) {
        return res.status(404).send('Kontrol tipi bulunamadı');
    }
    
    res.render('form', {
        tip,
        kontrol: config[tip],
        lokanta_adi: config.ayarlar.lokanta_adi,
        personeller: config.personeller || []
    });
});

// Form Gönderimi
app.post('/form/:tip/gonder', async (req, res) => {
    const tip = req.params.tip;
    const config = getConfig();
    
    if (!config[tip]) {
        return res.status(404).json({ success: false, message: 'Kontrol tipi bulunamadı' });
    }
    
    const now = new Date();
    const tarih = now.toLocaleDateString('tr-TR');
    const saat = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    const cevaplar = config[tip].maddeler.map((madde, index) => ({
        madde,
        cevap: req.body[`madde_${index}`] || 'HAYIR'
    }));
    
    const kayit = {
        id: Date.now(),
        kontrol_tipi: tip,
        kontrol_tipi_baslik: config[tip].baslik,
        personel: req.body.personel || '',
        tarih,
        saat,
        timestamp: now.toISOString(),
        cevaplar,
        not: req.body.not || ''
    };
    
    saveKayit(kayit);
    
    res.json({ success: true, message: 'Kontrol kaydedildi!' });
});

// QR Kod Oluşturma
app.get('/qr/:tip', async (req, res) => {
    const tip = req.params.tip;
    const config = getConfig();
    const baseUrl = req.query.url || `${req.protocol}://${req.get('host')}`;
    const formUrl = `${baseUrl}/form/${tip}`;
    
    try {
        const qrDataUrl = await QRCode.toDataURL(formUrl, {
            width: 400,
            margin: 2,
            color: { dark: '#1a1a2e', light: '#ffffff' }
        });
        res.json({ 
            success: true, 
            qr: qrDataUrl, 
            url: formUrl,
            baslik: config[tip]?.baslik || tip
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// QR Kodları Sayfası
app.get('/qr-kodlar', async (req, res) => {
    const config = getConfig();
    const baseUrl = req.query.url || `${req.protocol}://${req.get('host')}`;
    
    const qrKodlar = [];
    const tipler = ['sabah_acilis', 'aksam_kapanis', 'tuvalet_kontrol'];
    
    for (const tip of tipler) {
        if (config[tip]) {
            const formUrl = `${baseUrl}/form/${tip}`;
            const qrDataUrl = await QRCode.toDataURL(formUrl, {
                width: 300,
                margin: 2,
                color: { dark: '#1a1a2e', light: '#ffffff' }
            });
            qrKodlar.push({
                tip,
                baslik: config[tip].baslik,
                icon: config[tip].icon,
                qr: qrDataUrl,
                url: formUrl
            });
        }
    }
    
    res.render('qr-kodlar', { qrKodlar, lokanta_adi: config.ayarlar.lokanta_adi });
});

// Excel Export
app.get('/export/excel', async (req, res) => {
    const kayitlar = getKayitlar();
    const config = getConfig();
    
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Mega Yıldız QR Kontrol Sistemi';
    
    const tipler = {
        sabah_acilis: 'Sabah Açılış',
        aksam_kapanis: 'Akşam Kapanış',
        tuvalet_kontrol: 'Tuvalet Kontrol'
    };
    
    for (const [tip, baslik] of Object.entries(tipler)) {
        const tipKayitlar = kayitlar.filter(k => k.kontrol_tipi === tip);
        const worksheet = workbook.addWorksheet(baslik);
        
        const headers = ['Tarih', 'Saat', 'Personel'];
        if (config[tip]) {
            config[tip].maddeler.forEach((m, i) => headers.push(`Madde ${i + 1}`));
        }
        headers.push('Not');
        
        worksheet.addRow(headers);
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1a1a2e' }
        };
        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        
        tipKayitlar.forEach(kayit => {
            const row = [kayit.tarih, kayit.saat, kayit.personel || '-'];
            kayit.cevaplar.forEach(c => row.push(c.cevap));
            row.push(kayit.not || '-');
            
            const addedRow = worksheet.addRow(row);
            
            kayit.cevaplar.forEach((c, i) => {
                if (c.cevap === 'HAYIR') {
                    addedRow.getCell(4 + i).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF6B6B' }
                    };
                }
            });
        });
        
        worksheet.columns.forEach(column => { column.width = 15; });
        
        if (config[tip]) {
            const maddelerRow = ['', '', ''];
            config[tip].maddeler.forEach(m => maddelerRow.push(m.substring(0, 50)));
            maddelerRow.push('');
            worksheet.insertRow(2, maddelerRow);
            worksheet.getRow(2).font = { italic: true, size: 9 };
        }
    }
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Kontrol_Kayitlari_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
});

// Personel Yönetimi
app.post('/personel/ekle', (req, res) => {
    const config = getConfig();
    const { isim } = req.body;
    
    if (!config.personeller) config.personeller = [];
    if (isim && !config.personeller.includes(isim)) {
        config.personeller.push(isim);
        saveConfig(config);
    }
    
    res.json({ success: true, personeller: config.personeller });
});

app.post('/personel/sil', (req, res) => {
    const config = getConfig();
    const { isim } = req.body;
    
    if (config.personeller) {
        config.personeller = config.personeller.filter(p => p !== isim);
        saveConfig(config);
    }
    
    res.json({ success: true, personeller: config.personeller });
});

// API
app.get('/api/kayitlar', (req, res) => {
    const kayitlar = getKayitlar();
    const tip = req.query.tip;
    res.json(tip ? kayitlar.filter(k => k.kontrol_tipi === tip) : kayitlar);
});

// Sunucuyu başlat
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════╗
║  🌟 MEGA YILDIZ AİLE LOKANTASI                ║
║     QR KONTROL SİSTEMİ v2.0                   ║
║                                                ║
║  📍 http://localhost:${PORT}                    ║
║  📱 QR Kodlar: /qr-kodlar                     ║
╚════════════════════════════════════════════════╝
    `);
});

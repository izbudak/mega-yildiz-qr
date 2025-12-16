# 🌟 Mega Yıldız Aile Lokantası - QR Kontrol Sistemi

Lokantanız için profesyonel QR kodlu kontrol ve denetim sistemi.

## 📋 Özellikler

- **3 Farklı Kontrol Formu:**
  - ☀️ Sabah Açılış Rutinleri (17 madde)
  - 🌙 Akşam Kapanış Rutinleri (17 madde)
  - 🚿 Tuvalet Kontrol Listesi (16 madde)

- **QR Kod Sistemi:** Her kontrol tipi için ayrı QR kod
- **Mobil Uyumlu:** Telefondan kolay kullanım
- **Excel Export:** Tüm kayıtları Excel olarak indirin
- **E-mail Bildirimi:** Kontrol sonrası otomatik bildirim
- **Admin Paneli:** Kayıtları takip edin, personel yönetin

## 🚀 Kurulum

### 1. Gereksinimler
- Node.js 18+ 
- npm

### 2. Kurulum Adımları

```bash
# Proje klasörüne gidin
cd mega-yildiz-qr

# Bağımlılıkları yükleyin
npm install

# Sunucuyu başlatın
npm start
```

### 3. Sunucuya Erişim

Sunucu başladıktan sonra:
- **Admin Panel:** http://localhost:3000
- **QR Kodlar:** http://localhost:3000/qr-kodlar

## 📱 Kullanım

### QR Kodları Yazdırma
1. http://localhost:3000/qr-kodlar adresine gidin
2. "Yazdır" butonuna tıklayın
3. QR kodları lokantanın uygun yerlerine asın:
   - Sabah Açılış → Giriş kapısı yanı
   - Akşam Kapanış → Kasa arkası
   - Tuvalet Kontrol → Tuvalet girişi

### Personel Ekleme
1. Admin paneline gidin
2. "Personel Yönetimi" bölümünü bulun
3. İsim yazıp "Ekle" butonuna tıklayın

### Kayıtları İndirme
1. Admin panelinde "Excel İndir" butonuna tıklayın
2. Tüm kontrol kayıtları Excel dosyası olarak inecek

## 📧 E-mail Bildirimi Ayarlama

E-mail bildirimi için Gmail kullanıyorsanız:

1. Google hesabınızda "Uygulama Şifresi" oluşturun
2. Sunucuyu başlatırken ortam değişkenlerini ayarlayın:

```bash
EMAIL_USER=sizin-email@gmail.com EMAIL_PASS=uygulama-sifresi npm start
```

## 🌐 Sunucuya Yükleme (Deployment)

### Render.com (Ücretsiz)

1. GitHub'a projeyi yükleyin
2. render.com'da yeni Web Service oluşturun
3. Repository'yi bağlayın
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variables ekleyin (opsiyonel):
   - EMAIL_USER
   - EMAIL_PASS

### Railway.app

1. railway.app'e giriş yapın
2. "New Project" → "Deploy from GitHub"
3. Repository seçin
4. Otomatik deploy olacaktır

### VPS (DigitalOcean, Hetzner vb.)

```bash
# Sunucuya bağlanın
ssh root@sunucu-ip

# Node.js yükleyin
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Projeyi klonlayın
git clone https://github.com/kullanici/mega-yildiz-qr.git
cd mega-yildiz-qr

# PM2 ile başlatın (sürekli çalışması için)
npm install -g pm2
npm install
pm2 start server.js --name "qr-kontrol"
pm2 save
pm2 startup
```

## 📁 Dosya Yapısı

```
mega-yildiz-qr/
├── server.js           # Ana sunucu dosyası
├── package.json        # Proje yapılandırması
├── data/
│   ├── config.json     # Ayarlar ve kontrol maddeleri
│   └── kayitlar.json   # Kontrol kayıtları
├── views/
│   ├── admin.ejs       # Admin panel sayfası
│   ├── form.ejs        # Kontrol formu sayfası
│   └── qr-kodlar.ejs   # QR kod yazdırma sayfası
└── public/             # Statik dosyalar
```

## ⚙️ Özelleştirme

### Kontrol Maddelerini Değiştirme
`data/config.json` dosyasını düzenleyin:

```json
{
  "sabah_acilis": {
    "baslik": "Sabah Açılış Rutinleri",
    "maddeler": [
      "Yeni madde 1",
      "Yeni madde 2"
    ]
  }
}
```

### Bildirim Ayarlarını Değiştirme
`data/config.json` içindeki `ayarlar` bölümünü düzenleyin:

```json
{
  "ayarlar": {
    "lokanta_adi": "Mega Yıldız Aile Lokantası",
    "bildirim_email": "yeni-email@gmail.com",
    "bildirim_telefon": "0555 555 55 55",
    "bildirim_kisi": "Yeni İsim"
  }
}
```

## 🔒 Güvenlik Önerileri

- Sunucuyu HTTPS ile çalıştırın
- Admin paneline şifre koruması ekleyin (gerekirse)
- Düzenli yedekleme yapın

## 📞 Destek

Sorularınız için: ismail.izbudak17@gmail.com

---
© 2024 Mega Yıldız Aile Lokantası - Tüm hakları saklıdır.

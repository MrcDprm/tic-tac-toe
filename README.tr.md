# Tic-Tac-Toe

[English](README.md) | **Türkçe**

Sade HTML, CSS ve JavaScript ile yazılmış bir XOX (tic-tac-toe) oyunu. Klasik 3×3 oyunu oynayabilir ya da tahta dolana kadar her 3'lünün puan getirdiği 4×4 veya 5×5 tahtaya geçebilirsin. Aynı cihazda bir arkadaşınla ya da üç zorluk seviyesi olan bilgisayara karşı oynanır.

**Canlı demo:** [tictactoe.miracdeprem.com](https://tictactoe.miracdeprem.com)

![Bilgisayara karşı klasik 3×3 oyun](docs/screenshot-classic.png)

## Özellikler

- **Üç tahta boyutu**
  - **3×3** klasik kuralla oynanır: ilk 3'lüyü yapan kazanır.
  - **4×4 ve 5×5** puan kuralıyla oynanır: her yeni 3'lü 1 puan getirir ve çizgi tahtada kalır. Tahta dolunca çok puanı olan kazanır.
- **İki rakip türü**
  - Aynı cihazda bir arkadaş.
  - Üç seviyeli bilgisayar:
    - **Kolay** rastgele oynar.
    - **Orta** kazanma fırsatını kaçırmaz, tehditleri engeller, ara sıra hata yapar.
    - **Zor** alfa-beta budamalı minimax kullanır ve 3×3'te hiç kaybetmez.
- **Adil turlar:** Başlayan oyuncu her turda değişir.
- **Eşleşmeye göre skor**
  - Her tahta, rakip ve zorluk birleşiminin kendi skoru vardır; zorluk değiştirince skorlar karışmaz ya da silinmez.
  - Skorlar ve ayarlar sayfa yenilense de korunur.
- **Erişilebilir**
  - Tamamen klavyeyle oynanabilir (Tab + Enter).
  - Her hücrenin ekran okuyucu etiketi vardır.
  - Sıra ve sonuç sesli duyurulur.
  - Sistemdeki "hareketi azalt" ayarına uyar.
- **Türkçe ve İngilizce**, [portfolyo sitemle](https://www.miracdeprem.com) uyumlu **koyu ve açık tema**.
- **Duyarlı tasarım:** Masaüstünde iki sütun, telefonda tek sütun.
- **Geri bildirim:** Küçük bir düğme; ad (isteğe bağlı), e-posta ya da telefon ve mesaj içeren formu açar. Mesaj portfolyo sitem üzerinden doğrudan bana ulaşır.

## Ekran Görüntüleri

| 4×4 puan modu | Açık tema, 5×5 | Telefon |
|---|---|---|
| ![Çizgileri çizilmiş 4×4 tahta](docs/screenshot-scoring.png) | ![Türkçe arayüz, açık tema, 5×5 tahta](docs/screenshot-light.png) | ![Telefon görünümü](docs/screenshot-mobile.png) |

## Kullanılan Teknolojiler

- HTML, CSS, JavaScript (ES modülleri, framework yok, derleme adımı yok)
- Node.js'in yerleşik test aracı (`node --test`), 22 birim testi
- Yayın: Vercel

## Kurulum ve Çalıştırma

[tictactoe.miracdeprem.com](https://tictactoe.miracdeprem.com) adresinden çevrim içi oynayabilir ya da kendi bilgisayarında çalıştırabilirsin:

```bash
git clone https://github.com/MrcDprm/tic-tac-toe.git
cd tic-tac-toe
python -m http.server 5173
```

Sonra `http://localhost:5173` adresini aç. ES modülleri `file://` üzerinden yüklenmediği için yerel bir sunucu gerekir; herhangi bir statik sunucu olur.

Testleri çalıştırmak için (Node.js 20 veya üstü):

```bash
npm test
```

### Proje yapısı

```
src/game.js        Oyun kuralları: tahta, hamle, çizgiler, puan, oyun sonu
src/ai.js          Bilgisayar oyuncusu (kolay, orta, minimax)
src/storage.js     Ayarlar ve skorlar (localStorage, doğrulamalı)
src/i18n.js        Türkçe ve İngilizce metinler
src/theme.js       Tema değiştirme
src/theme-init.js  Kayıtlı temayı sayfa çizilmeden önce uygular
src/main.js        Hepsini sayfaya bağlar
tests/             Kurallar, yapay zekâ ve kayıt için birim testleri
```

## Öğrendiklerim

- **Kuralları sayfadan ayırmak.** Bütün oyun kuralları `game.js` içinde ve sayfadan habersiz. Sayfa sadece oyunun o anki durumunu çiziyor. Bu sayede kuralları tarayıcı olmadan Node'da test edebildim; 4×4 ve 5×5 tahtaları eklemek de sadece kuralları değiştirmek demekti.
- **Değişmez durum.** Bir hamle eski oyun durumunu hiç değiştirmiyor, yenisini döndürüyor. Geçersiz hamleyi anlamak kolaylaştı (aynı nesne geri geliyor). Bilgisayar da hamleleri geri almak zorunda kalmadan deneyebildi.
- **Alfa-beta budamalı minimax.** Zor seviyedeki bilgisayar, her hamlesine benim vereceğim en iyi cevabı hayal ederek ileriye bakıyor. Alfa-beta budama, akıllı bir rakibin asla izin vermeyeceği dalları atlıyor; umut veren hamleleri önce denemek daha da fazlasını atlatıyor. 3×3'te oyunun sonuna kadar bakıyor ve hiç kaybetmiyor. Büyük tahtalarda birkaç hamle sonra durup açık çizgileri sayarak durumu tahmin ediyor.
- **Rastgeleliği test etmek.** Kolay ve orta seviye rastgele sayı kullanıyor. Testlere tohumlu bir rastgele sayı üreteci verdim; böylece her çalıştırmada aynı "rastgele" oyunlar oynanıyor ve sonuçlar tekrarlanabiliyor.
- **Kayıtlı veriye güvenmemek.** `localStorage`'dan okunan her şey bozuk olabilir ya da elle değiştirilmiş olabilir. Her değer izin verilen değerler listesiyle karşılaştırılıyor ve sadece bilinen alanlar kaydediliyor.
- **Metni güvenle yazmak.** Her şey `innerHTML` yerine `textContent` ve `createElement` ile yazılıyor; hiçbir metin HTML olarak çalışamıyor.
- **CSS değişkenleriyle tema.** Renkler bir kez değişken olarak tanımlanıyor. Açık tema sadece bu değerleri değiştiriyor, sayfanın geri kalanı kendiliğinden uyuyor. Küçük bir betik kayıtlı temayı sayfa çizilmeden önce uyguluyor; yanlış temanın bir an görünmesi engelleniyor.
- **SVG ile çizim.** Puan getiren çizgiler tahtanın üstündeki SVG çizgileri. SVG koordinatlarını hücre başına 1 birim yapınca hesap basitleşti: bir hücrenin merkezi sadece `sütun + 0.5, satır + 0.5`.
- **Erişilebilirlik ayrıntıları.** `disabled` ile `aria-disabled` arasındaki farkı öğrendim: `disabled` olan buton klavye odağını kaybediyor. Oyuncunun tahtadaki yerini korumak için `aria-disabled` kullandım.

## Gelecek Planları

- Bilgisayara karşı O olarak oynamayı seçebilmek
- Son hamleyi geri alma
- İsteğe bağlı ses efektleri

## Lisans

[MIT](LICENSE)

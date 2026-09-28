# Tic-Tac-Toe

[English](README.md) | **Türkçe**

Sade HTML, CSS ve JavaScript ile yazılmış, iki oyunculu modu ve bilgisayara karşı modu olan XOX (tic-tac-toe) oyunu.

> Geliştirme sürüyor. Aşağıdaki plan, proje v1.0'a ulaştığında tam README'ye dönüşecek.

## Özellikler (plan)

**MVP**
- [ ] Aynı cihazda iki oyunculu mod
- [ ] Kazanma ve beraberlik kontrolü, kazanan çizgi vurgulanır
- [ ] Skor tablosu (X, O, beraberlik), sayfa yenilense de korunur
- [ ] Bilgisayara karşı: kolay (rastgele) ve yenilmez (minimax)
- [ ] Kimin başlayacağını seçme; her turda başlayan oyuncu değişir
- [ ] Klavyeyle oynama (ok tuşları + Enter ya da 1-9 tuşları) ve ekran okuyucu duyuruları
- [ ] Telefon ve masaüstüne uyumlu tasarım, açık ve koyu tema
- [ ] Oyun mantığı ayrı bir modülde, Node'un yerleşik test aracıyla test edilir
- [ ] Vercel'de yayında

**Sonra eklenecekler**
- Çevrim içi çok oyunculu mod
- Daha büyük tahtalar (4×4, 5×5)
- Ses efektleri

## Kullanılan Teknolojiler

- HTML, CSS, JavaScript (ES modülleri, framework yok, derleme adımı yok)
- Birim testleri için `node --test`
- Yayın için Vercel

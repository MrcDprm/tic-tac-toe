// Sayfa çizilmeden önce kayıtlı temayı uygular (kara tahta seçiliyken defterin bir an yanıp sönmemesi için).
try {
  if (JSON.parse(localStorage.getItem('ttt-settings'))?.theme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }
} catch {
  // Depolama kapalıysa varsayılan defter görünümü kalır
}
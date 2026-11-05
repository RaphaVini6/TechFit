// Exibe uma mensagem na página (elemento #msg) em vez de usar alert().
function showMessage(text, type) {
  const el = document.getElementById('msg');
  if (!el) return;
  el.textContent = text;
  el.className = 'msg msg--' + (type || 'error');
  el.hidden = false;
}

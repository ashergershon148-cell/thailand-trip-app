async function loadGzB64Parts(prefix, n) {
  let b64 = '';
  for (let i = 0; i < n; i++) {
    b64 += (await (await fetch(prefix + '.p' + i)).text()).trim();
  }
  const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([bin]).stream().pipeThrough(ds);
  const text = await new Response(stream).text();
  const s = document.createElement('script');
  s.textContent = text;
  document.body.appendChild(s);
}
(async () => {
  try {
    await loadGzB64Parts('data.js.b64', 4);
    await loadGzB64Parts('app.js.b64', 4);
  } catch (e) {
    document.body.innerHTML = '<p dir="rtl" style="padding:2rem;font-family:sans-serif">שגיאה בטעינת האפליקציה: ' + e + '</p>';
    console.error(e);
  }
})();

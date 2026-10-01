async function loadGzB64(url) {
  const b64 = (await (await fetch(url)).text()).trim();
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
    await loadGzB64('data.js.b64');
    await loadGzB64('app.js.b64');
  } catch (e) {
    document.body.innerHTML = '<p dir="rtl" style="padding:2rem;font-family:sans-serif">שגיאה בטעינת האפליקציה: ' + e + '</p>';
    console.error(e);
  }
})();

const title = document.getElementById('overlayTitle');
const message = document.getElementById('overlayMessage');
const progress = document.getElementById('loadingProgress');
const button = document.getElementById('startButton');

// Let the loading UI paint before importing modules that construct model templates.
const paint = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
async function boot() {
  try {
    await paint();
    const { prepareMission } = await import('./main.js');
    await prepareMission(async (percent, status) => {
      progress.value = percent;
      message.textContent = status;
      await paint();
    });
    document.body.classList.remove('loading');
    progress.hidden = true;
    title.textContent = 'Lunar Expedition';
    message.textContent = 'Search the ruined outpost for 8 salvage materials, then return to the marked landing pad before your suit fails.';
    document.getElementById('controlsHelp').hidden = false;
    button.disabled = false;
    button.textContent = 'Launch Expedition';
  } catch (error) {
    console.error('Mission preparation failed', error);
    title.textContent = 'A misszió előkészítése sikertelen';
    message.textContent = 'Ellenőrizd az internetkapcsolatot és a böngésző WebGL-támogatását, majd próbáld újra.';
    progress.hidden = true;
    button.disabled = false;
    button.textContent = 'Újrapróbálás';
    button.onclick = () => window.location.reload();
  }
}
boot();

(function () {
  'use strict';
  const root = document.documentElement;
  const pages = Array.from(document.querySelectorAll('[data-view]'));
  const routeMap = {beranda:'beranda',tentang:'tentang',pengalaman:'tentang',portfolio:'portfolio',riset:'riset',kontak:'kontak',games:'games'};
  const names = {beranda:'Kamar Nestiara',tentang:'Tentang & Pengalaman',portfolio:'Portfolio Sistem',riset:'Riset Akademik',kontak:'Kontak',games:'Games'};
  let activeView = 'beranda';
  let sourceHotspot = null;
  let soundEnabled = false;
  let audio = null;
  let ringTimer = null;
  const soundButton = document.getElementById('room-sound');
  const previews = document.getElementById('board-previews');
  window.PORTFOLIO_DATA.systems.forEach(system => { const span = document.createElement('span'); span.className = 'board-preview'; const img = document.createElement('img'); img.src = system.cover.startsWith('assets/') ? system.cover.replace(/\.png$/i, '.webp') : system.cover; img.alt = ''; img.loading = 'lazy'; const caption = document.createElement('small'); caption.textContent = system.title.split(' — ')[0].replace('Learning Management System', 'LMS'); span.append(img,caption); previews.appendChild(span); });
  function route(focus) {
    let hash = 'beranda';
    try { hash = decodeURIComponent(location.hash.slice(1) || 'beranda'); } catch (_) {}
    activeView = routeMap[hash] || 'beranda';
    pages.forEach(page => { page.hidden = page.dataset.view !== activeView; });
    root.classList.add('room-mode');
    root.classList.toggle('room-view', activeView === 'beranda');
    document.title = `${names[activeView]} — Nestiara`;
    document.querySelectorAll('#navigation a').forEach(link => { const key = link.hash.slice(1); const selected = key === hash || (activeView === 'beranda' && key === 'beranda'); link.classList.toggle('active', selected); if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); });
    const page = pages.find(p => !p.hidden);
    // Sections revealed in a prior visit remain visible on return.
    if (page) page.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    window.scrollTo({top:0,behavior:'auto'});
    if (focus) requestAnimationFrame(() => {
      if (activeView === 'beranda' && sourceHotspot && sourceHotspot.isConnected) { sourceHotspot.focus({preventScroll:true}); sourceHotspot = null; }
      else {
        const specific = hash === 'pengalaman' ? document.getElementById(hash) : null;
        const heading = specific ? specific.querySelector('h2') : page && page.querySelector('h1,h2');
        if (heading) { heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true}); }
        if (specific) specific.scrollIntoView({behavior:'auto',block:'start'});
      }
    });
    scheduleRing();
  }
  document.querySelectorAll('.room-stage a,.room-dock a').forEach(link => link.addEventListener('click', () => { sourceHotspot = link; }));
  window.addEventListener('hashchange', () => route(true));
  // Sound only starts after the visitor explicitly enables it.
  function stopRinging() { if (ringTimer) clearTimeout(ringTimer); ringTimer = null; }
  function playRing() {
    if (!soundEnabled || !audio || document.hidden || activeView !== 'beranda') return;
    if (audio.state !== 'running') return;
    const start = audio.currentTime;
    [0,.18,.5,.68].forEach((delay, i) => { const osc = audio.createOscillator(); const gain = audio.createGain(); osc.type = 'sine'; osc.frequency.value = i % 2 ? 740 : 620; gain.gain.setValueAtTime(0,start+delay); gain.gain.linearRampToValueAtTime(.025,start+delay+.015); gain.gain.exponentialRampToValueAtTime(.001,start+delay+.13); osc.connect(gain); gain.connect(audio.destination); osc.start(start+delay); osc.stop(start+delay+.15); });
  }
  function scheduleRing() { stopRinging(); if (!soundEnabled || document.hidden || activeView !== 'beranda') return; ringTimer = setTimeout(() => { playRing(); scheduleRing(); },10000); }
  soundButton.addEventListener('click', async () => {
    if (soundEnabled) { soundEnabled = false; stopRinging(); }
    else {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) { soundButton.textContent = 'Suara tidak didukung'; soundButton.disabled = true; return; }
      try { if (!audio) audio = new Context(); await audio.resume(); soundEnabled = true; playRing(); scheduleRing(); }
      catch (_) { soundButton.textContent = 'Suara tidak dapat diaktifkan'; return; }
    }
    soundButton.textContent = soundEnabled ? 'Suara: Aktif' : 'Suara: Nonaktif';
    soundButton.setAttribute('aria-pressed',String(soundEnabled));
  });
  document.addEventListener('visibilitychange', scheduleRing);
  window.addEventListener('pagehide',stopRinging);
  route(false);
})();

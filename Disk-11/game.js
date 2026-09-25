/* Area 51 – offline reconstruction from the supplied Mission Disk 11 video.
 * Two-times-upscaled scene layers, resolution-independent vector lettering,
 * 60 fps region-composited animations and independent rules.
 * The source playthrough was recorded at 640 x 480.
 * No server, network calls, libraries, or original executable are required.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('screen'), ctx = canvas.getContext('2d', { alpha: false });
  const UPSCALE = 2;
  const stage = $('stage'), controls = $('commands'), choice = $('choice');
  const buttons = [...controls.querySelectorAll('button')];
  const images = {}, videos = new Map();
  const names = [
    'room-lit', 'room-dark', 'ship-lit', 'ship-dark', 'tank-empty-lit', 'tank-empty-dark',
    'door-open-lit', 'door-open-dark', 'tank-base-empty-lit', 'tank-base-empty-dark',
    'intermission-bg', 'credits'
  ];
  let state = Area51Rules.initial();
  let mode = 'loading', modeStart = performance.now(), active = null, epoch = 0;
  let result = null, reportName = 'intro', paused = false, pausedAt = 0;
  let muted = false, enlarged = true, loaded = false, reportComplete = false;
  let currentStatus = '', resumeVideo = false, resumeAudio = false;
  const transmission = new Audio('assets/transmission.ogg');
  transmission.preload = 'auto';
  transmission.volume = 0.6;
  const FILTER_DARK = 'brightness(0.70) saturate(0.67)';

  function status(text) {
    if (text !== currentStatus) { currentStatus = text; $('status').textContent = text; }
  }
  function showError(message) {
    stopMedia(); mode = 'error'; controls.hidden = true; choice.hidden = true;
    $('loading').hidden = true; $('error-detail').textContent = message; $('error').hidden = false;
    status('Laden fehlgeschlagen.');
  }
  function loadImage(name) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => { images[name] = img; resolve(); };
      img.onerror = () => reject(new Error('Fehlende oder unlesbare Datei: assets/' + name + '.png'));
      img.src = 'assets/' + name + '.png';
    });
  }
  function stopMedia() {
    epoch++;
    for (const video of videos.values()) {
      video.onended = null; video.onplaying = null; video.onerror = null;
      video.pause();
    }
    transmission.pause(); transmission.currentTime = 0;
    active = null; paused = false; $('resume').hidden = true;
  }
  function updateControls(displayState = state) {
    controls.hidden = mode !== 'playing';
    choice.hidden = mode !== 'retry';
    const text = {
      lights: displayState.lights ? 'Lights off' : 'Lights on',
      ship: displayState.raised ? 'Lower ship' : 'Raise ship',
      tank: displayState.tank ? 'Drain tank' : 'Fill tank',
      doors: displayState.doors ? 'Close doors' : 'Open doors'
    };
    for (const b of buttons) {
      b.disabled = Boolean(active) && !['restart', 'quit'].includes(b.dataset.command);
      if (text[b.dataset.command]) b.textContent = text[b.dataset.command];
    }
    stage.setAttribute('aria-busy', Boolean(active));
  }
  function setMode(next) {
    mode = next; modeStart = performance.now(); reportComplete = false;
    updateControls();
  }
  function beginMission(banner = true) {
    stopMedia(); state = Area51Rules.initial(); result = null;
    setMode(banner ? 'banner' : 'playing');
    status('Befehle unten anklicken. H: Hilfe · F: Vollbild');
    canvas.focus({ preventScroll: true });
  }
  function newAttempt() {
    stopMedia(); state = Area51Rules.initial(); setMode('cool');
    status('Neue Mission …');
  }
  function openRetry(kind) {
    stopMedia(); result = kind; setMode('retry');
    status('Grün: erneut spielen · Rot: beenden');
  }
  function quit() {
    stopMedia(); setMode('credits');
    status('Klicken oder Enter: zum Anfang. Zum Beenden das Fenster schließen.');
  }
  function playTransmission() {
    transmission.currentTime = 0; transmission.muted = muted;
    transmission.play().catch(() => {});
  }
  function showReport(outcome) {
    stopMedia(); result = outcome; reportName = 'report-' + outcome;
    setMode('report'); playTransmission();
    status('Übertragung … Klicken oder Enter: weiterlesen');
  }
  function advance() {
    if (paused) return resume();
    if (mode === 'intro') {
      if (!reportComplete && performance.now() - modeStart < 3700) {
        modeStart -= 5000; reportComplete = true;
      } else { transmission.pause(); beginMission(); }
    } else if (mode === 'report') {
      if (!reportComplete) { modeStart -= 5000; reportComplete = true; }
      else openRetry(result);
    } else if (mode === 'credits') {
      stopMedia(); reportName = 'intro'; setMode('intro'); playTransmission();
      status('Klicken oder Enter: Mission beginnen');
    } else if (mode === 'cool' || mode === 'banner') beginMission(false);
  }
  function pause() {
    if (paused || !loaded || mode === 'error') return;
    paused = true; pausedAt = performance.now();
    resumeVideo = Boolean(active && !active.video.paused);
    resumeAudio = !transmission.paused;
    if (active) active.video.pause();
    transmission.pause(); $('resume').hidden = false;
    status('Pause. Klicken oder „Weiter“ wählen.');
  }
  function resume() {
    if (!paused) return;
    modeStart += performance.now() - pausedAt; paused = false;
    $('resume').hidden = true;
    if (active && resumeVideo) active.video.play().catch(() => pause());
    if (resumeAudio) transmission.play().catch(() => {});
    status(active ? 'Private Jones führt den Befehl aus …' : 'Befehle unten anklicken. H: Hilfe · F: Vollbild');
  }
  function obtainVideo(name) {
    if (videos.has(name)) return videos.get(name);
    const video = document.createElement('video');
    video.preload = 'auto'; video.playsInline = true;
    video.volume = 0.8; video.src = 'assets/' + name + '.webm';
    videos.set(name, video); return video;
  }
  function execute(command) {
    if (!loaded || mode !== 'playing') return;
    if (paused) { resume(); return; }
    if (command === 'restart') return openRetry('restart');
    if (command === 'quit') return quit();
    if (active) return;
    const action = Area51Rules.plan(state, command);
    if (!action) return;
    if (action.refusal) { status(action.refusal); return; }
    const token = ++epoch, video = obtainVideo(action.clip);
    video.pause(); video.currentTime = 0; video.muted = muted;
    active = { ...action, from: { ...state }, video, ready: false, token };
    status('Private Jones führt den Befehl aus …'); updateControls();
    video.onplaying = () => {
      if (active && active.token === token) active.ready = true;
    };
    video.onerror = () => {
      if (epoch === token) showError('Die Animation assets/' + action.clip + '.webm konnte nicht abgespielt werden. Öffne index.html in Firefox oder Chromium.');
    };
    video.onended = () => {
      if (epoch !== token || !active) return;
      state = { ...action.target }; active = null; video.onended = null;
      updateControls();
      if (action.outcome) showReport(action.outcome);
      else status(command === 'load' ? 'Munition geladen. Nächsten Befehl wählen.' : 'Befehle unten anklicken. H: Hilfe · F: Vollbild');
    };
    // Call play directly in the user's gesture; local media needs no web server.
    video.play().catch(error => {
      if (epoch !== token || error.name === 'AbortError') return;
      if (error.name === 'NotAllowedError') {
        resumeVideo = true; pause(); resumeVideo = true;
        status('Zum Start der Animation einmal „Weiter“ klicken.');
      } else showError('Animation nicht verfügbar: assets/' + action.clip + '.webm (' + error.name + ')');
    });
  }

  function drawImage(name, x = 0, y = 0) {
    ctx.drawImage(images[name], x * UPSCALE, y * UPSCALE);
  }
  function scene(s) {
    const light = s.lights ? 'lit' : 'dark';
    drawImage('room-' + light);
    if (s.doors) drawImage('door-open-' + light, 264, 0);
    if (s.raised) drawImage('ship-' + light, 294, 180);
    if (!s.tank) {
      drawImage('tank-empty-' + light, 0, 58);
      drawImage('tank-base-empty-' + light, 0, 444);
    }
  }
  function clipRegion(video, rect, darken = false) {
    const [x, y, w, h] = rect;
    ctx.save();
    if (darken) ctx.filter = FILTER_DARK;
    ctx.drawImage(video, x, y, w, h,
      x * UPSCALE, y * UPSCALE, w * UPSCALE, h * UPSCALE);
    ctx.restore();
  }
  function displayState() {
    if (!active || !active.ready) return state;
    const s = { ...active.from }, time = active.video.currentTime;
    const moments = {
      'lights-on': 1.2, 'lights-off': 1.57,
      raise: 5.6, lower: 5.6, 'doors-open': 1.1, 'doors-close': 1.1,
      drain: 5.4, fill: 5.1
    };
    if (time >= (moments[active.clip] ?? Infinity)) Object.assign(s, active.target);
    return s;
  }
  function animatedScene() {
    const s = displayState();
    scene(s);
    const a = active;
    if (a && a.ready && a.video.readyState >= 2 && !a.video.seeking) {
      const v = a.video, darken = !a.from.lights;
      if (a.command === 'lights') {
        // Only Jones' route is dynamic; all independent scene states survive.
        clipRegion(v, [184, 300, 110, 80]);
      } else if (a.command === 'ship') {
        clipRegion(v, [240, 180, 400, 264], darken);
      } else if (a.command === 'doors') {
        clipRegion(v, [264, 0, 226, 160], darken);
      } else if (a.command === 'load') {
        clipRegion(v, [240, 300, 400, 144], darken);
      } else if (a.command === 'tank') {
        clipRegion(v, [0, 58, 184, 386], darken);
        clipRegion(v, [184, 300, 110, 144], darken);
      } else if (a.command === 'launch') {
        clipRegion(v, [214, 0, 426, 444], darken && a.clip !== 'launch-dark');
      }
    }
  }
  function scrollReport(now) {
    const progress = Math.min(1, (now - modeStart) / 4200);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (progress >= 1) {
      reportComplete = true;
      status(mode === 'intro' ? 'Klicken oder Enter: Mission beginnen' : 'Klicken oder Enter: weiter');
    }
    return progress;
  }
  function render(now) {
    if (!loaded || paused || mode === 'error') { requestAnimationFrame(render); return; }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = 'none';
    let progress = 1, visualMode = mode;
    if (mode === 'playing') animatedScene();
    else if (mode === 'intro' || mode === 'report') progress = scrollReport(now);
    else if (mode === 'retry') drawImage('intermission-bg');
    else if (mode === 'credits') {
      drawImage('credits');
      // Retain the original ship and logos while typesetting the small print.
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 320, 1280, 310);
      ctx.fillRect(0, 770, 1280, 80);
    }
    else if (mode === 'cool') {
      drawImage('intermission-bg'); if (now - modeStart > 1100) beginMission();
    } else if (mode === 'banner') {
      drawImage('intermission-bg'); if (now - modeStart > 900) { setMode('playing'); }
    }
    Area51Type.render(visualMode, visualMode === 'playing' ? displayState() : state, reportName, result, progress);
    requestAnimationFrame(render);
  }
  function resize() {
    const full = Boolean(document.fullscreenElement);
    const maxW = innerWidth - (full ? 0 : innerWidth < 680 ? 16 : 32);
    const maxH = innerHeight - (full ? 48 : innerWidth < 680 ? 110 : 90);
    const available = Math.max(0.2, Math.min(maxW / 640, maxH / 480));
    const scale = enlarged || full || available < 1 ? available : Math.floor(available);
    stage.style.width = Math.round(640 * scale) + 'px';
    stage.style.height = Math.round(480 * scale) + 'px';
    $('zoom').textContent = enlarged ? 'Pixelgröße' : 'Vergrößern';
  }
  function toggleSound() {
    muted = !muted;
    for (const v of videos.values()) v.muted = muted;
    transmission.muted = muted;
    $('sound').textContent = muted ? 'Ton aus' : 'Ton an';
    $('sound').setAttribute('aria-pressed', String(!muted));
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await $('game').requestFullscreen();
    } catch { status('Vollbild ist hier nicht verfügbar. Mit „Vergrößern“ passt sich das Spiel ans Fenster an.'); }
  }
  function help() { pause(); $('help-dialog').showModal(); }

  buttons.forEach(b => b.addEventListener('click', () => {
    execute(b.dataset.command); canvas.focus({ preventScroll: true });
  }));
  canvas.addEventListener('click', advance);
  $('try-again').addEventListener('click', newAttempt);
  $('pull-plug').addEventListener('click', quit);
  $('sound').addEventListener('click', toggleSound);
  $('resume').addEventListener('click', resume);
  $('zoom').addEventListener('click', () => { enlarged = !enlarged; $('zoom').setAttribute('aria-pressed', String(enlarged)); resize(); });
  $('fullscreen').addEventListener('click', toggleFullscreen);
  $('help').addEventListener('click', help);
  $('help-dialog').addEventListener('close', resume);
  $('reload').addEventListener('click', () => location.reload());
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  document.addEventListener('fullscreenchange', resize);
  window.addEventListener('resize', resize);
  document.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.altKey || event.metaKey || $('help-dialog').open) return;
    const key = event.key.toLowerCase();
    const element = event.target;
    if (['enter', ' '].includes(key) && element.tagName === 'BUTTON') return;
    if (key === 'f') { event.preventDefault(); toggleFullscreen(); return; }
    if (key === 'm') { toggleSound(); return; }
    if (key === 'h') { help(); return; }
    if (paused) { if (key === 'enter' || key === ' ') { event.preventDefault(); resume(); } return; }
    if (mode === 'playing') {
      const command = { l: 'lights', t: 'tank', u: 'ship', o: 'doors', a: 'load', r: 'restart', q: 'quit', enter: 'launch' }[key];
      if (command) { event.preventDefault(); execute(command); }
    } else if (mode === 'retry') {
      if (key === 'enter' || key === 'r') { event.preventDefault(); newAttempt(); }
      else if (key === 'q' || key === 'escape') quit();
    } else if (key === 'enter' || key === ' ') { event.preventDefault(); advance(); }
  });

  // Read-only diagnostics make the native file:// build testable without cheats.
  window.Area51 = Object.freeze({
    snapshot: () => ({ mode, state: { ...state }, action: active?.clip || null, result, paused, muted, loaded })
  });
  resize();
  Promise.all(names.map(loadImage)).then(() => {
    loaded = true; $('loading').hidden = true; setMode('intro');
    status('Klicken oder Enter: Mission beginnen'); requestAnimationFrame(render);
  }).catch(error => showError(error.message));
})();

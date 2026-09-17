const tracks = [
  { name: 'CAN IT!', genre: 'GARAGE GROOVE', bpm: '120 BPM', desc: 'Metal District / 02:48', color: '#ff9f43', index: '01' },
  { name: 'PAPER JAM', genre: 'LO-FI FOLD', bpm: '96 BPM', desc: 'Cardboard City / 03:12', color: '#9ee8c0', index: '02' },
  { name: 'GLASS HOUSE', genre: 'NEON BREAKS', bpm: '140 BPM', desc: 'Bottle Boulevard / 02:24', color: '#7fc9ff', index: '03' }
];

const $ = (selector) => document.querySelector(selector);
const trackName = $('#track-name');
let activeTrack = 0;
let audioContext;
let deferredInstallPrompt;
let demoRunning = false;
let demoScore = 0;
let demoCombo = 0;
const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let keySequence = [];

function makeWaveform() {
  const waveform = $('#waveform');
  waveform.innerHTML = '';
  for (let i = 0; i < 38; i += 1) {
    const bar = document.createElement('i');
    bar.style.height = `${12 + Math.abs(Math.sin(i * 1.7)) * 32}px`;
    waveform.append(bar);
  }
}

function updateTrack() {
  const track = tracks[activeTrack];
  trackName.textContent = track.name;
  $('#track-genre').textContent = track.genre;
  $('#track-bpm').textContent = track.bpm;
  $('#track-desc').textContent = track.desc;
  $('#track-index').textContent = track.index;
  $('#track-count').textContent = `${track.index} / 03`;
  $('#track-art').style.background = track.color;
  makeWaveform();
}

function tone(frequency = 220, duration = 0.08) {
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = 'square';
  gain.gain.setValueAtTime(0.04, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function triggerPop(text, x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const pop = $('#pop-word');
  pop.textContent = text;
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  pop.classList.remove('show');
  void pop.offsetWidth;
  pop.classList.add('show');
  tone(text === 'PERFECT!' ? 520 : 320);
}

function startBeatPulse() {
  document.documentElement.style.setProperty('--beat-duration', `${60 / 120}s`);
  setInterval(() => {
    document.body.classList.remove('beat-pulse');
    void document.body.offsetWidth;
    document.body.classList.add('beat-pulse');
  }, 500);
}

function setupDemo() {
  const dialog = $('#demo-dialog');
  $('#demo-button').addEventListener('click', () => dialog.showModal());
  $('#close-dialog').addEventListener('click', () => dialog.close());
  $('#start-demo').addEventListener('click', () => {
    demoRunning = true;
    demoScore = 0;
    demoCombo = 0;
    $('#demo-score').textContent = '000000';
    $('#demo-combo').textContent = '0';
    $('#beat-ring span').textContent = 'HIT!';
    tone(440, .16);
  });
  document.addEventListener('keydown', (event) => {
    keySequence.push(event.key);
    keySequence = keySequence.slice(-konami.length);
    if (keySequence.join(',') === konami.join(',')) openBackroom();
    if (!demoRunning || event.key === 'Tab') return;
    demoCombo += 1;
    demoScore += 100 * demoCombo;
    $('#demo-score').textContent = String(demoScore).padStart(6, '0');
    $('#demo-combo').textContent = String(demoCombo);
    const ring = $('#beat-ring');
    ring.classList.remove('hit');
    void ring.offsetWidth;
    ring.classList.add('hit');
    triggerPop(demoCombo % 5 === 0 ? 'PERFECT!' : 'GREAT!', window.innerWidth / 2 - 70, window.innerHeight / 2 - 50);
  });
}

function setupInteractions() {
  document.querySelectorAll('.mechanic-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      const words = { perfect: 'PERFECT!', great: 'GREAT!', recycle: 'RECYCLE!' };
      triggerPop(words[card.dataset.sfx], event.clientX, event.clientY);
    });
  });
  $('#prev-track').addEventListener('click', () => { activeTrack = (activeTrack + tracks.length - 1) % tracks.length; updateTrack(); tone(180); });
  $('#next-track').addEventListener('click', () => { activeTrack = (activeTrack + 1) % tracks.length; updateTrack(); tone(280); });
  $('#play-track').addEventListener('click', (event) => {
    const button = event.currentTarget;
    button.textContent = button.textContent === '▶' ? '❚❚' : '▶';
    if (button.textContent === '❚❚') tone(440, .2);
  });
  $('#sound-toggle').addEventListener('click', (event) => {
    const enabled = event.currentTarget.getAttribute('aria-pressed') === 'true';
    event.currentTarget.setAttribute('aria-pressed', String(!enabled));
    event.currentTarget.textContent = enabled ? '♪' : '♫';
    if (!enabled) tone(392, .15);
  });
  const facts = [
    ['79%', 'de los residuos del océano\npodrían evitarse con mejores\nhábitos de consumo.'],
    ['65%', 'de la energía se ahorra al\nreciclar una lata de aluminio\nen vez de producirla.'],
    ['700', 'años puede tardar una botella\nde plástico en desaparecer\nsi nadie la recicla.']
  ];
  let factIndex = 0;
  $('#fact-button').addEventListener('click', () => {
    factIndex = (factIndex + 1) % facts.length;
    $('#stat-number').textContent = facts[factIndex][0];
    document.querySelector('.stat-main span').innerHTML = facts[factIndex][1].replaceAll('\n', '<br>');
    triggerPop('NEW FACT!', window.innerWidth * .65, window.innerHeight * .55);
  });
}

function openBackroom() {
  const overlay = $('#backroom');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('backroom-mode');
  tone(90, .4);
}

function setupSecret() {
  const open = () => openBackroom();
  $('#secret-crack').addEventListener('click', open);
  $('#secret-crack').addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') open(); });
  $('#footer-secret').addEventListener('click', open);
  $('#close-backroom').addEventListener('click', () => {
    $('#backroom').classList.remove('open');
    $('#backroom').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('backroom-mode');
  });
  $('#backroom-beat').addEventListener('click', () => tone(75 + Math.random() * 100, .25));
}

function setupInstall() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });
  $('#install-button').addEventListener('click', async () => {
    if (!deferredInstallPrompt) {
      triggerPop('OPEN MENU ⋮', window.innerWidth * .6, 100);
      return;
    }
    deferredInstallPrompt.prompt();
    deferredInstallPrompt = null;
  });
}

function setupParticles() {
  const canvas = $('#particle-canvas');
  const context = canvas.getContext('2d');
  const particles = Array.from({ length: 34 }, (_, index) => ({ x: Math.random(), y: Math.random(), size: 2 + index % 5, speed: .0002 + Math.random() * .0004, hue: index % 2 ? '#ff635c' : '#e8ff4f' }));
  const resize = () => { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; context.scale(devicePixelRatio, devicePixelRatio); };
  const render = () => {
    context.clearRect(0, 0, innerWidth, innerHeight);
    particles.forEach((particle) => {
      particle.y -= particle.speed;
      if (particle.y < -.05) particle.y = 1.05;
      context.fillStyle = particle.hue;
      context.fillRect(particle.x * innerWidth, particle.y * innerHeight, particle.size, particle.size);
    });
    requestAnimationFrame(render);
  };
  addEventListener('resize', resize);
  resize();
  render();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

updateTrack();
startBeatPulse();
setupDemo();
setupInteractions();
setupSecret();
setupInstall();
setupParticles();
registerServiceWorker();

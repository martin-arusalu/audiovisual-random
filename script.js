var bpm = 120;
var voices = 16;
var decay = 2;
var C = [0, 1, 3, 5, 6, 8, 10, 12, 13, 15, 17, 18, 20, 22, 24, 25, 27, 29, 30, 32, 34, 36, 37];
var t;
var oscillators = [];
var gains = [];
var beat = 1000 / (bpm / 60);
var duration = [beat * 4, beat * 2, beat];
var interval;
var audioCtx;
var distortion;
var ww = window.innerWidth;
var wh = window.innerHeight;
var svg = Snap("#soundSvg");
var curX = ww / 2;
var curY = wh / 2;
var shape;
var previousNote = 500;
var previousVolume = 0.5;
var bodyElem = document.querySelector('body');

svg.attr('viewBox', "0 0 " + ww + " " + wh);

function main() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  distortion = audioCtx.createWaveShaper();
  distortion.curve = makeDistortionCurve(400);
  distortion.oversample = '4x';
  for (i = 1; i <= voices; i++) {
    oscillator = audioCtx.createOscillator()
    oscillators.push(oscillator);
    gain = audioCtx.createGain();
    gains.push(gain);
  }
  start();
}

main()

document.onclick = () => audioCtx.resume();

function makeDistortionCurve(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for (; i < n_samples; ++i) {
    x = i * 2 / n_samples - 1;
    curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
  }
  return curve;
};

function start() {
  //heli
  for (i = 0; i < oscillators.length; i++) {
    oscillators[i].connect(gains[i]);
    gains[i].connect(audioCtx.destination);
    oscillators[i].start();
    gains[i].gain.value = 0;
  }
  //helid
  var sounds = [];
  sounds.push(0);
  for (i = -21; i <= 15; i++) {
    var sound = Math.round(43200 * (Math.pow(Math.pow(2, (1 / 12)), i))) / 100;
    sounds.push(sound);
  }

  function randomTone(oscillator, gain, count) {
    gain.gain.value = 0;
    interval = duration[rn(duration.length)];
    var attack = duration[2] / 500;
    var volume = rnf(1);
    if (previousVolume > 0.5 && volume < previousVolume) {
      volume += (previousVolume - volume) / 1.1;
    } else if (previousVolume <= 0.5 && volume > previousVolume) {
      volume -= (volume - previousVolume) / 1.1;
    }
    previousVolume = volume;
    gain.gain.setTargetAtTime(volume, audioCtx.currentTime, attack);
    gain.gain.setTargetAtTime(0, audioCtx.currentTime + attack, decay);
    oscillator.frequency.value = sounds[C[rn(C.length)]];
    visualize(oscillator.frequency.value, interval, volume);
    count++
    if (oscillators.length <= count) count = 0;
    t = setTimeout(function () {
      randomTone(oscillators[count], gains[count], count);
    }, interval);
  }
  randomTone(oscillators[0], gains[0], 0);

  // Visualizing
  function visualize(note, duration, volume) {
    shape = svg.path(getPath(note, volume));
    shape.attr('pathLength', 1);
    shape.attr('stroke', "rgba(255,255,255," + volume + ")");
    shape.node.style = (`animation:${duration}ms draw forwards`)
    svg.add(shape);
  }

  function getPath(note, volume) {
    var xc = curX + (rnf(400) - 200);
    var yc = curY + (rnf(400) - 200);
    var shape = "M" + curX + " " + curY + " C " + xc + " " + yc;
    var newX = curX + (rnf(400) - 200);
    if (newX < (ww / 2) && newX < curX) {
      newX += (curX - newX) / 2;
    } else if (newX > (ww / 2) && newX > curX) {
      newX -= (newX - curX) / 2;
    }
    curX = newX;
    curY = curY + (((previousNote - note) * 0.5));
    previousNote = note;
    xc = curX + (rnf(400) - 200);
    yc = curY + (rnf(400) - 200);
    shape += ", " + xc + " " + yc;
    return shape + ", " + curX + " " + curY;
  }

  function rn(max = 1) {
    return Math.floor(Math.random() * max);
  }

  function rnf(max = 1) {
    return Math.random() * max;
  }

}
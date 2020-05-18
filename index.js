const gui = new dat.GUI();

let cols;
let rows;

const params = {
  inc: 0.02,
  numParticles: 3000,
  angleOffset: Math.PI * 4,
};

gui.add(params, 'inc', 0.002, 0.1, 0.002);
gui.add(params, 'numParticles', 1000, 4000, 100);
gui.add(params, 'angleOffset', Math.PI / 2, Math.PI * 24, Math.PI / 2);

let resolution = 10;
let particles;
let flowField;
let palette;

function setupField() {
  particles = [];
  flowField = new Array(cols * rows);
  for (let i = 0; i < params.numParticles; i++) {
    particles.push(makeParticle());
  }

  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    xoff = 0;
    for (let x = 0; x < cols; x++) {
      const index = x + y * cols;
      const angle = noise(xoff, yoff, frameCount) * params.angleOffset;
      const v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowField[index] = v; //store all of the vectors calculated into flow field
      xoff += params.inc;
    }
    yoff += params.inc;
  }
}

function reset() {
  clear();
  setupField();
  palette = choosePalette();
}

function mouseClicked(evt) {
  if (evt.target.nodeName === 'CANVAS') {
    reset();
  }
}

gui.onChange(reset);

function setup() {
  palette = choosePalette();
  createCanvas(windowWidth, windowHeight);
  cols = floor(width / resolution);
  rows = floor(height / resolution);
  setupField();
}

function draw() {
  beginShape();
  particles.forEach(p => {
    followField(p);
    edgeParticle(p);
    paintParticle(p);
    updateParticle(p);
  });
}

function makeParticle() {
  const pos = createVector(random(width), random(height));
  return {
    pos,
    vel: createVector(0, 0),
    acc: createVector(0, 0),
    color: random(palette),
  };
}

function choosePalette() {
  return random([
    ['#eff3c6', '#77d8d8', '#4cbbb9', '#0779e4'],
    ['#f1e3cb', '#f9b384', '#ca5116', '#581c0c'],
    ['#f0f5f9', '#c9d6df', '#52616b', '#1e2022'],
    ['#cefff1', '#ace7ef', '#a6acec', '#a56cc1'],
  ]);
}

function updateParticle(p) {
  p.vel.add(p.acc);
  p.vel.limit(1);
  p.pos.add(p.vel);
  p.acc.mult(0);
}

function edgeParticle(p) {
  if (p.pos.x > width) {
    p.pos.x = 0;
  }
  if (p.pos.x < 0) {
    p.pos.x = width;
  }
  if (p.pos.y < 0) {
    p.pos.y = height;
  }
  if (p.pos.y > height) {
    p.pos.y = 0;
  }
}

function paintParticle(p) {
  stroke(p.color);
  strokeWeight(1);
  point(p.pos.x, p.pos.y);
}

function followField(p) {
  const x = floor(p.pos.x / resolution);
  const y = floor(p.pos.y / resolution);
  const index = x + y * cols;
  const force = flowField[index];
  p.acc.add(force);
}

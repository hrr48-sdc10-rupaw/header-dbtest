const fs = require('fs');

const fill = [
  'Dog', 'Mine', 'Anime', 'Star', 'Dark', 'Craft', 'Murder', 'Doom'
];

const studios = [
  'Gizzard Entertainment',
  'The Department of Homeland Security',
  'Regis Philbin',
  'A Liberal Arts Degree',
  'Vladimir Putin'
];

const names = [
  "% Hard 2: % Harder",
  '%!',
  '%Craft',
  '% Eternal',
  '% Payne',
  'Maximum %',
  '% Fox 64'
];

const descs = [
  "You are dead. Not beeg souprise.",
  "Snake? Snake? Snaaaaaaake!",
  "Snooker Simulator 2013 is our most engaging title yet.",
  "The FitnessGram Pacer test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter Pacer test will begin in 30 seconds.",
  "What's Obama's last name?"
];



/*
const seed = 328490;
const rand = mulberry32(seed);
const randi = n => Math.floor(rand() * n);
const randa = a => a[randi(a.length)];
const makename = () => randa(names).split('%').join(randa(fill));
const makeimg = () => 'https://via.placeholder.com/640x360/' + randi(2147483647).toString().padStart(6, '0');
*/

const BATCH_SIZE = 10000;

module.exports.makestores = function() {
  const aiget = a => Math.floor(Math.random() * a.length);
  const out = fs.openSync('store_meta', 'w');
  const buf = Buffer.alloc(BATCH_SIZE* 3 * 5);
  var b = 0;
  while (b < 10000000) {
    for (let i = 0; i < BATCH_SIZE; i++) {
      const off = i * 5;
      buf.writeUInt8(aiget(names), off);
      buf.writeUInt8(aiget(fill), off + 1)
      buf.writeUInt8(aiget(descs), off + 2);
      buf.writeUInt8(aiget(studios), off + 3);
      buf.writeUInt8(aiget(studios), off + 4);
      b++;
    }
    fs.writeSync(out, buf, 0, BATCH_SIZE * 5);
  }
  fs.closeSync(out);

  const out_img = fs.openSync('store_img', 'w');
  var b = 0;
  while (b < 10000000) {
    for (let i = 0; i < BATCH_SIZE; i++) {
      for (let x = 0; x < 5; x++) {
        const off = (i + x) * 3;
        buf.writeUInt8(Math.floor(Math.random() * 256), off);
        buf.writeUInt8(Math.floor(Math.random() * 256), off + 1);
        buf.writeUInt8(Math.floor(Math.random() * 256), off + 2);
      }
      b++;
    }
    fs.writeSync(out_img, buf, 0, BATCH_SIZE * 3 * 5);
  }
  fs.closeSync(out_img);
}

const StoreEntry = class {
  constructor(name, blurb, pub, dev) {
    this.name = name;
    this.blurb = blurb;
    this.pub = pub;
    this.dev = dev;
  }
};

module.exports.getstore = function() {
  const file = fs.openSync('store_meta', 'r');
  var i = 0;
  var off = 0;
  var open = true;
  const buf = Buffer.alloc(BATCH_SIZE * 5);
  return function() {
    if (i >= 10000000) {
      if (open) {
        open = false;
        fs.closeSync(file);
        buf = null;
      }
      return null;
    } else if (i % BATCH_SIZE === 0) {
      fs.readSync(file, buf, 0, 100000 * 5);
      off = 0;
    }
    const name = names[buf.readUInt8(off)];
    const param = fill[buf.readUInt8(off + 1)];
    const desc = descs[buf.readUInt8(off + 2)];
    const pub = studios[buf.readUInt8(off + 3)];
    const dev = studios[buf.readUInt8(off + 4)];
    off += 5;
    i++;
    return new StoreEntry(
      name.split('%').join(param),
      desc,
      pub,
      dev
    );
  }
}
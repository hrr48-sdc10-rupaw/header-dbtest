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

const templates = [
  "% Hard 2: % Harder",
  '% Legacy',
  '%Craft',
  '% Eternal',
  '% Payne',
  'Maximum %',
  '% Fox 64',
  '% From Outer Space'
];

const names = fill.map(t => templates.map(x => x.split('%').join(t)))
  .reduce((a, b) => a.concat(b));

const descs = [
  "You are dead. Not beeg souprise.",
  "Snake? Snake? Snaaaaaaake!",
  "Snooker Simulator 2013 is our most engaging title yet.",
  "The FitnessGram Pacer test is a multistage aerobic capacity test that progressively gets more difficult as it continues. The 20 meter Pacer test will begin in 30 seconds.",
  "What's Obama's last name?"
];

const BATCH_SIZE = 10000;
const META_SIZE = 8;
const IMG_SIZE = 15;
const ENTRIES = 10000000;

module.exports.makestores = function() {
  const aiget = a => Math.floor(Math.random() * a.length);
  const out = fs.openSync('store_meta', 'w');
  const buf = Buffer.alloc(BATCH_SIZE * IMG_SIZE);
  var b = 0;
  while (b < ENTRIES) {
    for (let i = 0; i < BATCH_SIZE; i++) {
      const off = i * 8;
      buf.writeUInt8(aiget(names), off);
      buf.writeUInt8(aiget(descs), off + 1);
      buf.writeUInt8(aiget(studios), off + 2);
      buf.writeUInt8(aiget(studios), off + 3);
      buf.writeUInt32LE(Math.floor(Math.random() * 0xFFFFFFFF), off + 4);
      b++;
    }
    fs.writeSync(out, buf, 0, BATCH_SIZE * META_SIZE);
  }
  fs.closeSync(out);

  const out_img = fs.openSync('store_img', 'w');
  var b = 0;
  while (b < ENTRIES) {
    for (let i = 0; i < BATCH_SIZE; i++) {
      for (let x = 0; x < 5; x++) {
        const off = i * 3 * x;
        buf.writeUInt8(Math.floor(Math.random() * 256), off);
        buf.writeUInt8(Math.floor(Math.random() * 256), off + 1);
        buf.writeUInt8(Math.floor(Math.random() * 256), off + 2);
      }
      b++;
    }
    fs.writeSync(out_img, buf, 0, BATCH_SIZE * IMG_SIZE);
  }
  fs.closeSync(out_img);
};

module.exports.getstore = function() {
  const file = fs.openSync('store_meta', 'r');
  var i = 0;
  var open = true;
  var buf = Buffer.alloc(BATCH_SIZE * META_SIZE);
  return function() {
    return new Promise((yes, no) => {
      if (i >= ENTRIES) {
        if (open) {
          open = false;
          fs.closeSync(file);
          buf = null;
        }
        return yes(null);
      }
      const data = [];
      fs.readSync(file, buf, 0, BATCH_SIZE * META_SIZE);
      var off = 0;
      for (let x = 0; x < BATCH_SIZE && i < 10000000; x++) {
        const name = names[buf.readUInt8(off)];
        const desc = descs[buf.readUInt8(off + 1)];
        const pub = studios[buf.readUInt8(off + 2)];
        const dev = studios[buf.readUInt8(off + 3)];
        const tag = buf.readInt32LE(off + 4);
        off += META_SIZE;
        data.push({
          id: i,
          name: name,
          blurb: desc,
          publisher: pub,
          developer: dev,
          tags: tag
        });
        i++;
      }
      return yes(data);
    });
  }
}

const RSIZE = 10000000 * 5;
module.exports.getimgstore = function() {
  const file = fs.openSync('store_img', 'r');
  var i = 0;
  var open = true;
  var buf = Buffer.alloc(BATCH_SIZE * IMG_SIZE);
  return function() {
    return new Promise((yes, _) => {
      if (i >= RSIZE) {
        if (open) {
          open = false;
          fs.closeSync(file);
          buf = null;
        }
        return yes(null);
      }
      const data = [];
      fs.readSync(file, buf, 0, BATCH_SIZE * IMG_SIZE);
      var off = 0;
      for (let x = 0; x < BATCH_SIZE && i <= RSIZE; x++) {
        const r = buf.readUInt8(off);
        const g = buf.readUInt8(off + 1)
        const b = buf.readUInt8(off + 2)
        const col = (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
        const id = Math.floor(i / 5);
        off += 3;
        data.push({gid: id, url: `https://via.placeholder.com/640x360/${col}`});
        i++;
      }
      return yes(data);
    });
  }
}
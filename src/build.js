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
  '%!',
  '%Craft',
  '% Eternal',
  '% Payne',
  'Maximum %',
  '% Fox 64'
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

module.exports.makestores = function() {
  const aiget = a => Math.floor(Math.random() * a.length);
  const out = fs.openSync('store_meta', 'w');
  const buf = Buffer.alloc(BATCH_SIZE * 3 * 5);
  var b = 0;
  while (b < 10000000) {
    for (let i = 0; i < BATCH_SIZE; i++) {
      const off = i * 4;
      buf.writeUInt8(aiget(names), off);
      buf.writeUInt8(aiget(descs), off + 1);
      buf.writeUInt8(aiget(studios), off + 2);
      buf.writeUInt8(aiget(studios), off + 3);
      b++;
    }
    fs.writeSync(out, buf, 0, BATCH_SIZE * 4);
  }
  fs.closeSync(out);

  const out_img = fs.openSync('store_img', 'w');
  var b = 0;
  while (b < 10000000 * 5) {
    for (let i = 0; i < BATCH_SIZE; i++) {
      const off = i * 3;
      buf.writeUInt8(Math.floor(Math.random() * 256), off);
      buf.writeUInt8(Math.floor(Math.random() * 256), off + 1);
      buf.writeUInt8(Math.floor(Math.random() * 256), off + 2);
      b++;
    }
    fs.writeSync(out_img, buf, 0, BATCH_SIZE * 3 * 5);
  }
  fs.closeSync(out_img);
};

module.exports.getstore = function() {
  const file = fs.openSync('store_meta', 'r');
  var i = 0;
  var open = true;
  var buf = Buffer.alloc(BATCH_SIZE * 4);
  return function() {
    return new Promise((yes, no) => {
      if (i >= 10000000) {
        if (open) {
          open = false;
          fs.closeSync(file);
          buf = null;
        }
        return yes(null);
      }
      const data = [];
      fs.readSync(file, buf, 0, BATCH_SIZE * 4);
      var off = 0;
      for (let x = 0; x < BATCH_SIZE && i <= 10000000; x++) {
        const name = names[buf.readUInt8(off)];
        const desc = descs[buf.readUInt8(off + 1)];
        const pub = studios[buf.readUInt8(off + 2)];
        const dev = studios[buf.readUInt8(off + 3)];
        off += 4;
        data.push({id: i, name: name, blurb: desc, publisher: pub, developer: dev });
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
  var buf = Buffer.alloc(BATCH_SIZE * 3 * 5);
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
      fs.readSync(file, buf, 0, BATCH_SIZE * 3 * 5);
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
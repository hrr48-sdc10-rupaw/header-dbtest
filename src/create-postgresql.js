const pg = require('pg');
const pg = require('pg-promise');
const db = require('./config.js');
const build = require('./build.js');

const client = new pg.Client(db.PG_DB_INFO);
client.connect()
.then(() => client.query(`DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS media;
CREATE TABLE IF NOT EXISTS games (
  id integer PRIMARY KEY,
  name text,
  blurb text,
  pub text,
  dev text
);
CREATE TABLE IF NOT EXISTS media (
  gid integer,
  url text
)`))
.then(async () => {
  const start = Date.now();
  const next = build.getstore();
  var ops = [];
  var x = next();
  for (let i = 0; x; i++) {
    ops.push(client.query(`INSERT INTO games(id, name, blurb, pub, dev) VALUES($1, $2, $3, $4, $5) RETURNING *;`,
      [i, x.name, x.blurb, x.pub, x.dev]));
    if(ops.length >= 10000) {
      await Promise.all(ops);
      ops = [];
      console.log(`${i} done`);
    }
    x = next();
  }
  Promise.all(ops).then(() => console.log(Date.now() - start));
})
.then(() => client.end())
.catch(why => {
  console.log(why);
  client.end();
});
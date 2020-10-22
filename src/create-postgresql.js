const pg = require('pg');
const pgp = require('pg-promise')({});
const db = require('./config.js');
const build = require('./build.js');

const tbl = new pgp.helpers.ColumnSet([
  'id',
  'name',
  'blurb',
  'publisher',
  'developer'
], {table: 'games'});

const client = pgp(db.PG_DB_INFO);
client.any(`DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS media;
CREATE TABLE IF NOT EXISTS games (
  id integer PRIMARY KEY,
  name text,
  blurb text,
  publisher text,
  developer text
);
CREATE TABLE IF NOT EXISTS media (
  gid integer,
  url text
)`)
.then(() => {
  const next = build.getstore();
  var i = 0
  return client.tx('massive-insert', t => {
    const push = data => {if (data) {
      console.log(`Batch ${i++} done`)
      return t.none(pgp.helpers.insert(data, tbl));
    }}
    return t.sequence(_ => next().then(push).catch(why => console.log(why)));
  });
})
.then(data => console.log(data))
//.then(data => console.log(`batches: ${data.total}, time: ${data.duration}`))
//.then(() => client.end())
.catch(why => {
  console.log(why);
  client.end();
});
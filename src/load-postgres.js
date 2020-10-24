const pgp = require('pg-promise')({});
const db = require('./config.js');
const build = require('./build.js');

const tbmeta = new pgp.helpers.ColumnSet([
  'id',
  'name',
  'blurb',
  'publisher',
  'developer'
], {table: 'games'});

const tbmedia = new pgp.helpers.ColumnSet([
  'gid',
  'url'
], {table: 'media'});

const pushbulk = function(next, table) {
  return client.tx('massive-insert', t => {
    const push = data => {if (data) { //this doesn't work as a ternary for some reason
      return t.none(pgp.helpers.insert(data, table));
    }}
    return t.sequence(_ => next().then(push).catch(why => console.log(why)));
  });
};

const client = pgp(db.PG_DB_INFO);
client.any(`
DROP TABLE IF EXISTS games CASCADE;
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
  CONSTRAINT fk_gid FOREIGN KEY(gid) REFERENCES games(id),
  url text
);
CREATE UNIQUE INDEX idx_games
ON games (id);
CREATE INDEX idx_media
ON media (gid);`
)
.then(() => pushbulk(build.getstore(), tbmeta))
.then(() => pushbulk(build.getimgstore(), tbmedia))
.catch(why => console.log(why));
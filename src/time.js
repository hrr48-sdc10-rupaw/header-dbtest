const pg = require('pg');
const db = require('./config.js');

const client = new pg.Client(db.PG_DB_INFO);

client.connect()
.then(async () => {
  const then = new Date().getTime();
  const pics = await client.query('SELECT * FROM media WHERE gid = 90004');
  const meta = await client.query('SELECT * FROM games WHERE id = 90004');
  const now = new Date().getTime();
  console.log(meta.rows);
  console.log(pics.rows);
  console.log(`${now - then}ms`);
})
.catch(why => console.error(why))
.finally(() => client.end());

module.exports.client = client;
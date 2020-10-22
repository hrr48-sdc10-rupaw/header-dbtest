Testing Cassandra and Postgres at high loads.

1. npm run build
2. npm run load-postgres | npm run load cassandra

config.js:
DB_INFO = { user, password, database, host, port, max: (max parallel connections)}
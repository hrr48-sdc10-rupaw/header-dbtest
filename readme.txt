Testing Postgres access time with 10,000,000 entries.

1. npm run build
2. npm run load-postgres
3. npm run test

config.js:
DB_INFO = { user, password, database, host, port, max: (max parallel connections)}
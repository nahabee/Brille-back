import mysql, { Pool } from 'mysql2';

// importe la variable d'environnement
let databaseUrl: string = process.env.CLEARDB_DATABASE_URL || '';
// retire le type de base de données
databaseUrl = databaseUrl.substring(8);
// who doesn't love some good old effective Regex ?
const [user, password, host, database] = databaseUrl.split(
  /[:@/?)<>{}[\]\r\n/\\]+/
);

// object pool creation
const pool: Pool = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// exporte l'objet pool pour l'utiliser ailleurs
export default pool;

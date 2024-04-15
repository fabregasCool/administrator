import mysql from 'mysql';

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'naiity_db_fil_actu1',
});

//base de données à prendre en compte

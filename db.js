import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
});

export default db;

export async function initializeDB(req, res, next) {
	const sql =
		'CREATE TABLE IF NOT EXISTS Users (id int NOT NULL AUTO_INCREMENT, firstName varchar(255), lastName varchar(255), email varchar(255), password varchar(255), avatar varchar(255), PRIMARY KEY (id))';

	try {
		const [result] = await db.execute(sql);
		next();
	} catch (error) {
		console.error(error);
		res.end();
	}
}

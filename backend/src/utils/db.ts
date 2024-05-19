import mysql, { Connection, RowDataPacket, QueryResult } from "mysql2";

export const connection: Connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "",
	database: "Trackit-test2",
	port: 3310,
});

//funzionalità mysql2 per usare placeholder nominativi anziché "?"
connection.config.namedPlaceholders = true;

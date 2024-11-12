import sqlite3 from "sqlite3";

let db = new sqlite3.Database("./stores/currency.db", sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to the database!");
});
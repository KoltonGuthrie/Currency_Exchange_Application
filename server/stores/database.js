import sqlite3 from "sqlite3";

const SELECT_RATE_BY_DATE = "SELECT * FROM rate WHERE date = ?;";

let db = new sqlite3.Database("./stores/currency.db", sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to the database!");
});

function getAllRatesByDate(date, cb) {
    db.all(SELECT_RATE_BY_DATE, [date], (err, rows) => {
		if (err) {
			console.error(err.message);
			cb(err, null);
		} else {
			cb(null, rows);
		}
    });
}

export {
    getAllRatesByDate
};
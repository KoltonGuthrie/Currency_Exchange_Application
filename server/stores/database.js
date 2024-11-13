import sqlite3 from "sqlite3";
import { formatDate } from "../utils/format_date.js";

const SELECT_RATE_BY_DATE = "SELECT * FROM rate WHERE date = ?;";

const CONVERT_TO_FROM = `
						SELECT r1.currency_id AS "from",r3.currency_id AS "to",r1.date, 1 / r2.rate * r3.rate AS converted_rate
						FROM rate AS r1
						JOIN rate AS r2 ON r1.date = r2.date AND r2.currency_id = r1.currency_id
						JOIN rate AS r3 ON r1.date = r3.date AND r3.currency_id = ?
						WHERE r1.currency_id = ? AND r1.date = ?`;

const SELECT_CURRENCY_BY_ID = "SELECT * FROM currency WHERE _id = ?;";


let db = new sqlite3.Database("./stores/currency.db", sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to the database!");
});

function isCurrency(id, cb) {
	db.get(SELECT_CURRENCY_BY_ID, id, (err, row) => {
		return cb(row && !err);
	})
}

function getConversionRateToFrom({date = formatDate(new Date()), to, from}, cb) {
    db.get(CONVERT_TO_FROM, [to, from, date], (err, row) => {
		if (err) {
			console.error(err.message);
			return cb(err, null);
		} else {
			return cb(null, row);
		}
    });
}

function getAllRatesByDate(date, cb) {
    db.all(SELECT_RATE_BY_DATE, [date], (err, rows) => {
		if (err) {
			console.error(err.message);
			returncb(err, null);
		} else {
			return cb(null, rows);
		}
    });
}

export {
    getAllRatesByDate,
	getConversionRateToFrom,
	isCurrency
};
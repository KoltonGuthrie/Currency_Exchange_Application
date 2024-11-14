import sqlite3 from "sqlite3";
import { formatDate } from "../utils/format_date.js";
import { getExchangeRates } from "../utils/get_exchange_rates.js"

const SELECT_RATE_BY_DATE = "SELECT * FROM rate WHERE date = ?;";

const CONVERT_TO_FROM = `
						SELECT r1.currency_id AS "from",r3.currency_id AS "to",r1.date, r3.rate / r2.rate * r4.rate AS converted_rate
						FROM rate AS r1
						JOIN rate AS r2 ON r1.date = r2.date AND r2.currency_id = r1.currency_id
						JOIN rate AS r3 ON r1.date = r3.date AND r3.currency_id = "EUR" -- This is the default that the db is in
						JOIN rate AS r4 ON r1.date = r4.date AND r4.currency_id = ?
						WHERE r1.currency_id = ? AND r1.date = ?`;

const SELECT_CURRENCY_BY_ID = "SELECT * FROM currency WHERE _id = ?;";

const INSERT_PARTIAL_QUERY = "INSERT INTO rate (currency_id, rate, date) VALUES ";

const SELECT_CONVERSION_DATE = "SELECT * FROM rate WHERE date = ? LIMIT 1;"

let db = new sqlite3.Database("./stores/currency.db", sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to the database!");
});

function hasConversionDate(date = formatDate(new Date()), cb) {
	db.get(SELECT_CONVERSION_DATE, date, (err, row) => {
		return cb(!err && row)
	});
}

/*
Can't do this. Date may have been updated but currency was null at time.

const SELECT_HAS_CONVERSION = "SELECT * FROM rate WHERE (currency_id = ? OR currency_id = ?) AND date = ?;";

function hasConversion({date = formatDate(new Date()), to, from}, cb) {
	db.all(SELECT_HAS_CONVERSION, [to, from, date], (err, rows) => {
		return cb(!err && rows.length >= 2)
	});
}
*/

function isCurrency(id, cb) {
	db.get(SELECT_CURRENCY_BY_ID, id, (err, row) => {
		return cb(row && !err);
	});
}

function addRates(json, cb) {
	let arr = [];

	for(const key of Object.keys(json.rates)) {
		const value = json.rates[key];
		arr.push([key, value, json.date])
	}

	let parameters = [];
	arr.map((_) => { _.map((el) => parameters.push(el)) });

	let sql = INSERT_PARTIAL_QUERY + arr.map((_) => '(?, ?, ?)').join(', ');

	db.run(sql, parameters, function (err) {
		if (err) {
			console.error(err.message);
			return cb(err, 0)
		}

		return cb(null, this.changes)
	});
}


function getConversionRateToFrom({date = formatDate(new Date()), to, from}, cb) {
	hasConversionDate(date, (HAS_CONV) => {
		if(!HAS_CONV) {
			getExchangeRates(date, (err, data) => {
				if(err) {
					console.error(err.message);
					return cb(err, null);
				}

				addRates(data, (err, changes) => {
					if(err) {
						console.error(err.message);
						return cb(err, null);
					}

					console.log("Made " + changes + " changes!");

					db.get(CONVERT_TO_FROM, [to, from, date], (err, row) => {
						if (err) {
							console.error(err.message);
							return cb(err, null);
						} else {
							return cb(null, row);
						}
					});

				});

			});
		} else {
			db.get(CONVERT_TO_FROM, [to, from, date], (err, row) => {
				if (err) {
					console.error(err.message);
					return cb(err, null);
				} else {
					return cb(null, row);
				}
			});
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
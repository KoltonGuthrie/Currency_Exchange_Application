import sqlite3 from "sqlite3";
import { formatDate } from "../utils/format_date.js";
import { getExchangeRates, getExchangeSymbols } from "../utils/get_exchange_rates.js";

const CREATE_CURRENCY_TABLE = "CREATE TABLE IF NOT EXISTS currency (_id text primary key, description text);";

const CREATE_RATE_TABLE =
	"CREATE TABLE IF NOT EXISTS rate (currency_id text, date date, rate float, foreign key (currency_id) references currency (_id), primary key (currency_id, date));";

const SELECT_RATE_BY_DATE = "SELECT * FROM rate WHERE date = ?;";

const CONVERT_TO_FROM = `
	SELECT r1.currency_id AS "from",r3.currency_id AS "to",r1.date, r3.rate / r2.rate * r4.rate AS converted_rate
	FROM rate AS r1
	JOIN rate AS r2 ON r1.date = r2.date AND r2.currency_id = r1.currency_id
	JOIN rate AS r3 ON r1.date = r3.date AND r3.currency_id = "EUR" -- This is the default that the db is in
	JOIN rate AS r4 ON r1.date = r4.date AND r4.currency_id = ?
	WHERE r1.currency_id = ? AND r1.date = ?`;

const SELECT_CURRENCY_BY_ID = "SELECT * FROM currency WHERE _id = ?;";

const INSERT_CURRENCY_PARTIAL_QUERY = "INSERT INTO currency (_id, description) VALUES ";

const INSERT_RATE_PARTIAL_QUERY = "INSERT INTO rate (currency_id, rate, date) VALUES ";

const SELECT_CONVERSION_DATE = "SELECT * FROM rate WHERE date = ? LIMIT 1;";

const SELECT_ALL_CURRENCY = "SELECT * FROM currency;";

let db = new sqlite3.Database("./stores/currency.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log("Connected to the database!");
});

db.serialize(() => {
	db.run(CREATE_CURRENCY_TABLE);
	db.run(CREATE_RATE_TABLE);

	db.get(SELECT_ALL_CURRENCY, (err, row) => {
		if (err) throw err;

		if (!row) {
			// No data in currency. Add symbols
			getExchangeSymbols((err, data) => {
				if (err) throw err;

				if (data && data.success) {
					let arr = [];

					for (const key of Object.keys(data.symbols)) {
						const value = data.symbols[key];
						arr.push([key, value]);
					}

					let parameters = [];
					arr.map((_) => {
						_.map((el) => parameters.push(el));
					});

					let sql = INSERT_CURRENCY_PARTIAL_QUERY + arr.map((_) => "(?, ?)").join(", ");

					db.run(sql, parameters, function (err) {
						if (err) {
							throw err;
						}

						console.log("Added " + this.changes + " currency symbols to database");
					});
				}
			});
		}
	});
});

function getAllCurrency(cb) {
	db.all(SELECT_ALL_CURRENCY, (err, rows) => {
		if (err) console.error(err);
		return cb(err, rows);
	});
}

function hasConversionDate(date = formatDate(new Date()), cb) {
	db.get(SELECT_CONVERSION_DATE, date, (err, row) => {
		return cb(!err && row);
	});
}

function isCurrency(id, cb) {
	db.get(SELECT_CURRENCY_BY_ID, id, (err, row) => {
		return cb(row && !err);
	});
}

function addRates(json, cb) {
	let arr = [];

	for (const key of Object.keys(json.rates)) {
		const value = json.rates[key];
		arr.push([key, value, json.date]);
	}

	let parameters = [];
	arr.map((_) => {
		_.map((el) => parameters.push(el));
	});

	let sql = INSERT_RATE_PARTIAL_QUERY + arr.map((_) => "(?, ?, ?)").join(", ");

	db.run(sql, parameters, function (err) {
		if (err) {
			console.error(err.message);
			return cb(err, 0);
		}

		return cb(null, this.changes);
	});
}

function getConversionRateToFrom({ date = formatDate(new Date()), to, from }, cb) {
	hasConversionDate(date, (HAS_CONV) => {
		if (!HAS_CONV) {
			getExchangeRates(date, (err, data) => {
				if (err) {
					return cb(err, null);
				}

				if (!data) {
					let error = { message: "No data was returned from external api." };
					return cb(error, null);
				}

				if (data.error) {
					return cb(data.error, null);
				}

				if (!data.rates) {
					let error = { message: "No rates were returned from external api." };
					return cb(error, null);
				}

				addRates(data, (err, changes) => {
					if (err) {
						console.error(err.message);
						return cb(err, null);
					}

					console.log("Made " + changes + " changes!");

					db.get(CONVERT_TO_FROM, [to, from, date], (err, row) => {
						if (err) {
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

export { getAllRatesByDate, getConversionRateToFrom, isCurrency, getAllCurrency };

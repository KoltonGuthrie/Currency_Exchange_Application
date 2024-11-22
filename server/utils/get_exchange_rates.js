import http from "node:http";
import { formatDate } from "./format_date.js";
import "dotenv/config";

let API_KEY = null;

function getAPIKey() {
	if (API_KEY) return API_KEY;

	if (process.env.API_KEY) {
		API_KEY = process.env.API_KEY;
		return process.env.API_KEY;
	}

	console.error("No API_KEY enviroment variable set!");

	return null;
}

export function getExchangeRates(date = formatDate(new Date()), cb) {
	const API_KEY = getAPIKey();

	if (!API_KEY) {
		return cb({ message: "No API_KEY found." }, null);
	}

	const getOptions = {
		hostname: "api.apilayer.com",
		path: "/exchangerates_data/" + date,
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			apiKey: API_KEY,
		},
	};

	const req = http.request(getOptions, (res) => {
		let chunks = [];
		console.log(`Status: ${res.statusCode}`);
		res.setEncoding("utf8");
		res.on("data", (chunk) => {
			chunks.push(chunk);
		});
		res.on("end", () => {
			let json = JSON.parse(chunks.join(""));
			return cb(null, json);
		});
	});

	req.on("error", (err) => {
		console.error(`Error: ${e.message}`);
		return cb(err.message, null);
	});

	req.end();
}

export function getExchangeSymbols(cb) {
	const API_KEY = getAPIKey();

	if (!API_KEY) {
		return cb({ message: "No API_KEY found." }, null);
	}

	const getOptions = {
		hostname: "api.apilayer.com",
		path: "/exchangerates_data/symbols",
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			apiKey: API_KEY,
		},
	};

	const req = http.request(getOptions, (res) => {
		let chunks = [];
		console.log(`Status: ${res.statusCode}`);
		res.setEncoding("utf8");
		res.on("data", (chunk) => {
			chunks.push(chunk);
		});
		res.on("end", () => {
			let json = JSON.parse(chunks.join(""));
			return cb(null, json);
		});
	});

	req.on("error", (err) => {
		console.error(`Error: ${e.message}`);
		return cb(err.message, null);
	});

	req.end();
}

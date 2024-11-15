import http from "node:http";
import { formatDate } from "./format_date.js";

export function getExchangeRates(date = formatDate(new Date()), cb) {
	const getOptions = {
		hostname: "api.apilayer.com",
		path: "/exchangerates_data/" + date,
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			apiKey: process.env.API_KEY,
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

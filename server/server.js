import express from "express";
import cors from "cors";
import * as Database from "./stores/database.js";
import { formatDate } from "./utils/format_date.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/", express.static("public"));

/*

Date is optional
https://api.apilayer.com/exchangerates_data/convert?to={to}&from={from}&amount={amount}&date={YYYY-MM-DD}"

{
  "date": "2018-02-22",
  "historical": "",
  "info": {
    "rate": 148.972231,
    "timestamp": 1519328414
  },
  "query": {
    "amount": 25,
    "from": "GBP",
    "to": "JPY"
  },
  "result": 3724.305775,
  "success": true
}
*/

app.get("/api/exchange/convert", (req, res) => {
	const result = { success: false, error: "Internal Server Error." };
	res.setHeader("Content-Type", "application/json");

	const CONVERT_TO = req.query.to;
	const CONVERT_FROM = req.query.from;
	const CONVERT_AMOUNT = req.query.amount;
	const CONVERT_DATE = req.query.date || formatDate(new Date());

	if (!CONVERT_TO || !CONVERT_FROM || !CONVERT_AMOUNT || !CONVERT_DATE) {
		result.error = "Query 'to', 'from' and 'amount' are required!";
		return res.send(result);
	}

	Database.isCurrency(CONVERT_TO, (IS_CUR) => {
		if (!IS_CUR) {
			result.error = CONVERT_TO + " is not a value currency!";
			return res.send(result);
		}

		Database.isCurrency(CONVERT_FROM, (IS_CUR) => {
			if (!IS_CUR) {
				result.error = CONVERT_FROM + " is not a value currency!";
				return res.send(result);
			}

			Database.getConversionRateToFrom({ date: CONVERT_DATE, to: CONVERT_TO, from: CONVERT_FROM }, (err, row) => {
				if (err) {
					console.error(err);
					result.error = err.message;

					return res.send(result);
				}

				if (!row) {
					result.error = "Failed to find conversion... This should NEVER happen!";

					return res.send(result);
				}

				result.success = true;
				result.error = undefined;
				result.query = {
					to: CONVERT_TO,
					from: CONVERT_FROM,
					amount: CONVERT_AMOUNT,
				};
				result.info = {
					rate: row.converted_rate,
				};
				result.date = CONVERT_DATE;
				result.result = row.converted_rate * CONVERT_AMOUNT;

				return res.send(result);
			});
		});
	});
});

export default app;

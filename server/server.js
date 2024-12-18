import express from "express";
import cors from "cors";
import * as Database from "./stores/database.js";
import { formatDate } from "./utils/format_date.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/", express.static("public"));

app.get("/api/exchange/symbols", (req, res) => {
	const result = { success: false, error: "Internal Server Error." };
	res.setHeader("Content-Type", "application/json");
	res.status(500);

	Database.getAllCurrency((err, rows) => {
		if (err) {
			result.error = err.message;

			return res.send(result);
		}
		if (!rows || rows.length <= 0) {
			return res.send(result);
		}

		let json = {};
		rows.map((el) => (json[el._id] = el.description));

		result.error = undefined;
		result.success = true;
		result.symbols = json;

		res.status(200);
		return res.send(result);
	});
});

app.get("/api/exchange/convert", (req, res) => {
	const result = { success: false, error: "Internal Server Error." };
	res.setHeader("Content-Type", "application/json");
	res.status(500);

	const CONVERT_TO = req.query.to;
	const CONVERT_FROM = req.query.from;
	const CONVERT_AMOUNT = req.query.amount;
	const CONVERT_DATE = req.query.date || formatDate(new Date());

	if (!CONVERT_TO || !CONVERT_FROM || !CONVERT_AMOUNT || !CONVERT_DATE) {
		result.error = "Query 'to', 'from' and 'amount' are required!";

		res.status(400);
		return res.send(result);
	}

	Database.isCurrency(CONVERT_TO, (IS_CUR) => {
		if (!IS_CUR) {
			result.error = CONVERT_TO + " is not a value currency!";

			res.status(400);
			return res.send(result);
		}

		Database.isCurrency(CONVERT_FROM, (IS_CUR) => {
			if (!IS_CUR) {
				result.error = CONVERT_FROM + " is not a value currency!";

				res.status(400);
				return res.send(result);
			}

			Database.getConversionRateToFrom({ date: CONVERT_DATE, to: CONVERT_TO, from: CONVERT_FROM }, (err, row) => {
				if (err) {
					console.error(err);
					result.error = err.message;

					res.status(400);
					return res.send(result);
				}

				if (!row) {
					result.error = "Your query did not return any results. Please try again.";

					res.status(400);
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

				res.status(200);
				return res.send(result);
			});
		});
	});
});

export default app;

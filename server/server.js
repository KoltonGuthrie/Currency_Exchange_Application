import express from "express";
import cors from 'cors'
import * as Database from "./stores/database.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use('/', express.static('public'));

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

app.get('/api/exchange/convert', (req, res) => {
    const result = {success: false, error: "Internal Server Error."};

    console.log(req.query)

    const CONVERT_TO = req.query.to;
    const CONVERT_FROM = req.query.from;
    const CONVERT_AMOUNT = req.query.amount;
    const CONVERT_DATE = req.query.date || new Date().toISOString().split('T')[0];

    if(!CONVERT_TO || !CONVERT_FROM || !CONVERT_AMOUNT || !CONVERT_DATE) {
        result.error = "Query 'to', 'from' and 'amount' are required!";
        return res.send(result);
    }

    result.success = true;
    result.error = undefined;
    result.query = {
        to: CONVERT_TO,
        from: CONVERT_FROM,
        amount: CONVERT_AMOUNT,
        date: req.query.date
    }
    result.date = CONVERT_DATE;

    res.send(result)


});

export default app;
import * as Database from "./../stores/database.js";
import { formatDate } from "./../utils/format_date.js";

import express from "express";

const router = express.Router();

router.get("/symbols", async (req, res) => {
	const result = { success: false, error: "Internal Server Error." };
	res.setHeader("Content-Type", "application/json");

	try {
		const rows = await new Promise((resolve, reject) => {
			Database.getAllCurrency((err, data) => {
				if (err) return reject(err);
				resolve(data);
			});
		});

		if (!rows || rows.length <= 0) {
			return res.status(500).json(result);
		}

		const symbols = {};
		rows.forEach((el) => {
			symbols[el._id] = el.description;
		});

		result.success = true;
		result.error = undefined;
		result.symbols = symbols;

		return res.status(200).json(result);
	} catch (err) {
		result.error = err.message;
		return res.status(500).json(result);
	}
});

router.get("/convert", async (req, res) => {
	res.setHeader("Content-Type", "application/json");
	const response = { success: false, error: "Internal Server Error" };

	try {
		const { to: convertTo, from: convertFrom, amount, date = formatDate(new Date()) } = req.query;

		// Validate required query parameters
		if (!convertTo || !convertFrom || !amount) {
			response.error = "Query parameters 'to', 'from', and 'amount' are required";
			return res.status(400).json(response);
		}

		// Validate amount is a number
		const convertAmount = parseFloat(amount);
		if (isNaN(convertAmount)) {
			response.error = "Amount must be a valid number";
			return res.status(400).json(response);
		}

		// Check if currency is valid
		const [isToCurrencyValid, isFromCurrencyValid] = await Promise.all([
			new Promise((resolve) => {
				Database.isCurrency(convertTo, (isValid) => resolve(isValid));
			}),
			new Promise((resolve) => {
				Database.isCurrency(convertFrom, (isValid) => resolve(isValid));
			}),
		]);

		if (!isToCurrencyValid) {
			response.error = `${convertTo} is not a valid currency`;
			return res.status(400).json(response);
		}

		if (!isFromCurrencyValid) {
			response.error = `${convertFrom} is not a valid currency`;
			return res.status(400).json(response);
		}

		// Get conversion rate
		const conversion = await new Promise((resolve, reject) => {
			Database.getConversionRateToFrom({ date, to: convertTo, from: convertFrom }, (err, row) =>
				err ? reject(err) : resolve(row)
			);
		});

		if (!conversion) {
			response.error = "No conversion rate found for the specified currencies and date";
			return res.status(400).json(response);
		}

		// Success response
		response.success = true;
		response.error = undefined;
		response.query = {
			to: convertTo,
			from: convertFrom,
			amount: convertAmount,
		};
		response.info = { rate: conversion.converted_rate };
		response.date = date;
		response.result = conversion.converted_rate * convertAmount;

		return res.status(200).json(response);
	} catch (error) {
		console.error("Conversion error:", error);
		response.error = error.message || "Internal Server Error";
		return res.status(500).json(response);
	}
});

export default router;

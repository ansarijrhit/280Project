const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.use(cors({origin: true}));

app.get("/mealitems",(request, response) => {
	const getMealItems = async () => {
		try {
			const { data } = await axios.get(
				'https://rose-hulman.cafebonappetit.com/cafe/cafe/'
			);
			const $ = cheerio.load(data);
			const mealItems = [];

			$('button.site-panel__daypart-item-title').each((_idx, el) => {
				const mealItem = $(el).text().replace(/[\n\t]+/gm, "");
				mealItems.push(mealItem);
			});

			return mealItems;
		} catch (error) {
			throw error;
		}
	}
	getMealItems().then((mealItems) => response.send({"list": mealItems}));
});

exports.api = functions.https.onRequest(app);
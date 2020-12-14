const functions = require('firebase-functions');

const cors = require('cors');
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');


const app = express();
app.use(cors({origin: true}));

exports.api = functions.https.onRequest((request, response) => {
	const getMealItems = async () => {
		try {
			this.url = await getLegacyURL();
			const { data } = await axios.get(
				"" + this.url 
				// "https://legacy.cafebonappetit.com/weekly-menu/308467"
				// "https://legacy.cafebonappetit.com/print-menu/cafe/1374/menu/days/20-20-2020/pgbrks/0/"
			);
			const $ = cheerio.load(data);
			const mealItems = [];

			$('div > p').each((_idx, el) => {
				const mealItem = $($(el).contents().get(0)).text().replace(/[\n\t]+/gm, "");
				mealItems.push(mealItem);
			});
			mealItems.splice(mealItems.length-3);
			console.log(mealItems);
			return mealItems;
		} catch (error) {
			throw error;
		}
    }
    
    response.setHeader("Access-Control-Allow-Origin", "*");
	getMealItems().then((mealItems) => response.send({"list": mealItems}));
});

const getLegacyURL = async () => {
	try {
		const { data } = await axios.get(
			'https://rose-hulman.cafebonappetit.com/cafe/cafe/'
		);
		const $ = cheerio.load(data);
		const url = $(`a:contains('Today's Menu')`).attr('href');
		console.log(url);
		return url;
	} catch (error) {
		throw error;
	}
}
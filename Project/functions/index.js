// const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.use(cors({origin: true}));

exports.api = functions.https.onRequest((request, response) => {
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
    
    response.header("Access-Control-Allow-Origin", "*");
	getMealItems().then((mealItems) => response.send({"list": mealItems}));
});
// const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require('firebase-functions');

const axios = require('axios');
const cheerio = require('cheerio');

exports.api = functions.https.onRequest((request, response) => {
	const getMealItems = async () => {
		try {
			this.url = await getLegacyURL();//.then(() => {}).catch((err) => {console.log(err);});
			const { data } = await axios.get(
				"" + this.url
				// 'https://rose-hulman.cafebonappetit.com/cafe/cafe/'
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
    
    response.header("Access-Control-Allow-Origin", "*");
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
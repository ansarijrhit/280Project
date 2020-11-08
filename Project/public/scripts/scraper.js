const axios = require('axios');
const cheerio = require('cheerio');

const getMealItems = async () => {
	try {
		const { data } = await axios.get(
			'https://rose-hulman.cafebonappetit.com/cafe/cafe/'
		);
		const $ = cheerio.load(data);
		const mealItems = [];

		$('button.site-panel__daypart-item-title').each((_idx, el) => {
			const mealItem = $(el).text()
		    mealItems.push(mealItem)
		});

		return mealItems;
	} catch (error) {
		throw error;
	}
};
getMealItems().then((mealItems) => console.log(mealItems));
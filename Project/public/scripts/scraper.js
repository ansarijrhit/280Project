let cheerio = require('cheerio');
let $ = cheerio.load('https://rose-hulman.cafebonappetit.com/cafe/cafe/');

// //*[contains(concat( " ", @class, " " ), concat( " ", "station-title-inline-block", " " ))]//*[contains(concat( " ", @class, " " ), concat( " ", "site-panel__daypart-item-title", " " ))]


let mealItemList = [];

$('.list.items .item').each(function(index, element) {
    let header = $(element).find('.site-panel__daypart-item-title');
    mealItemList[index] = $(header).text();
});

console.log(mealItemList);
var rhit2 = rhit2 || {};

rhit2.fbReviewManager = null;

function htmlToElement(html){
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }

rhit2.FbReviewManager = class {
	constructor() {
        // this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("Reviews");
		console.log("Ref2: " + this._ref);
        this._unsubscribe = null;
	}
	add(item, restaurant, score, review) {
		this._ref.add({
			
		})
		.then(function (docRef) {
			console.log("boi");
		})
		.catch(function (error) {
			console.log("errrrrror");
		});
	}
	beginListening(changeListener){
    	let query = this._ref.orderBy("lastTouched", 'desc');

		this._unsubscribe = query
		.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
			console.log(this._documentSnapshots);
			changeListener();
		});
	}
	stopListening(){
		this._unsubscribe();
	}
	
	get length(){
		return this._documentSnapshots.length;
	}
	getItemAtIndex(index){
		const docSnapshot = this._documentSnapshots[index];
		const item = new rhit2.Review(
			docSnapshot.id,
			docSnapshot.get("Item"),
			docSnapshot.get("Restaurant"),
			docSnapshot.get("Review"),
			docSnapshot.get("Score"),
			docSnapshot.get("lastTouched"),
			docSnapshot.get("user"),
		);
		return item;
    }
    getItemByName(name){
            return this._ref.doc(name);
    }
}

rhit2.Review = class {
	constructor(id, item, restaurant, review, score, lastTouched, user){
        this.id = id;
        this.item = item;
        this.restaurant = restaurant;
        this.review = review;
        this.score = score;
        this.lastTouched = lastTouched;
        this.user = user;
	}
}

rhit2.DetailPageController = class {
    constructor() {
        rhit2.fbReviewManager = new rhit2.FbReviewManager();

        this.updateList();
		rhit2.fbReviewManager.beginListening(this.updateList.bind(this));
    }

    updateList() {
		console.log("update List!");

		const newList = htmlToElement('<div id= "reviews"></div>');

		for(let i = 0; i < rhit2.fbReviewManager.length; i++){
            const review = rhit2.fbReviewManager.getItemAtIndex(i);
			const newCard = this._createReview(review);

			// newCard.onclick = (event) => {
			// 	window.location.href = `/item.html?id=${item.id}`;
			// };

			newList.appendChild(newCard);	
		}
		//Remove old container
		const oldList = document.querySelector("#reviews");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		//Put in the new container
		oldList.parentElement.appendChild(newList);
	}

    _createReview(review){
        return htmlToElement(`<div id = "review">
        <h2 id = "title">Review by ${review.user} (${review.score})</h2>
        <p id = "meat">${review.review}</p>
        </div>`);
    }
}

rhit2.main = function() {
    new rhit2.DetailPageController();
}

rhit2.main();
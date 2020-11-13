var rhit2 = rhit2 || {};

rhit2.fbReviewManager = null;

rhit2.aggregate = 0;
rhit2.scores = [];

rhit2.selectedReview = null;
rhit2.createReview = true;

function htmlToElement(html){
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }

  function titleCase(str) {
	let result = str[ 0 ].toUpperCase();

  for ( let i = 1; i < str.length; i++ ) {
    if ( str[ i - 1 ] === ' ' ) {
      result += str[ i ].toUpperCase();
    } else {
      result += str[ i ];
    }
  }

  return result;
}

rhit2.FbReviewManager = class {
	constructor() {
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection("Reviews");
        this._unsubscribe = null;
	}
	add(item, restaurant, score, review, user) {
		this._ref.add({
			"Item": item,
			"Restaurant": restaurant,
			"Score": score,
			"Review": review,
			"lastTouched": firebase.firestore.Timestamp.now(),
			"user": user
		})
		.then(function (docRef) {
			console.log("Successful add");
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
			// console.log(this._documentSnapshots);
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
	delete(reviewId){ 
		this._ref.doc(reviewId).delete().then(function() {
			rhit2.createReview = true;
			console.log("Document successfully deleted!");
			document.querySelector("#fab").disabled = false;
			
			rhit2.aggregate = 0;
			if(!rhit2.scores.length == 0){
				for(let i = 0; i < rhit2.scores.length; i++){
					rhit2.aggregate += rhit2.scores[i];
				}
				rhit2.aggregate /= (rhit2.scores.length);

			
			}

			document.querySelector("#foodNameHere2").innerHTML = rhit.foodName + " (" + rhit2.aggregate + ")";
		}).catch(function(error) {
			console.error("Error removing document: ", error);
		});
	}

	update(id, rating, review) {
		
		this._ref = firebase.firestore().collection("Reviews").doc(id).update({
			"Score": rating,
			"Review": review,
			"lastTouched": firebase.firestore.Timestamp.now()
		})
		.then(function () {
			console.log("hi");
		})
		.catch(function (error) {
			console.log("hi2");
		});
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

		this.uid = rhit.uid;

		document.querySelector("#submitReview").onclick = (event) => {
			var score = parseInt($('#radios input:radio:checked').val());
			rhit2.fbReviewManager.add(rhit.foodName, rhit.selectedMenu, score, document.querySelector("#reviewExplain").value, this.uid);
			console.log("Review Submit");
			document.querySelector("#reviewExplain").value = "";
		}

		document.querySelector("#submitDeleteReview").onclick = (event) => {
			rhit2.fbReviewManager.delete(rhit2.selectedReview.id);
		}

		document.querySelector("#submitEditReview").onclick = (event) => {
			var score = parseInt($('#editRadios input:radio:checked').val());
			rhit2.fbReviewManager.update(rhit2.selectedReview.id, score, document.querySelector("#editReviewExplain").value);
		}
    }

    updateList() {
		const newList = htmlToElement('<div id= "reviews"></div>');
		rhit2.scores = [];
		rhit2.aggregate = 0;
		for(let i = 0; i < rhit2.fbReviewManager.length; i++){
			const review = rhit2.fbReviewManager.getItemAtIndex(i);
			if(review.item != rhit.foodName){
				continue;
			}
			if(review.restaurant != rhit.selectedMenu){
				continue;
			}
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
		rhit2.scores.push(review.score);
		rhit2.aggregate = 0;
		for(let i = 0; i < rhit2.scores.length; i++){
			rhit2.aggregate += rhit2.scores[i];
		}
		rhit2.aggregate /= (rhit2.scores.length);
		document.querySelector("#foodNameHere2").innerHTML = rhit.foodName + " (" + rhit2.aggregate + ")";

		if(review.user == this.uid){
			rhit2.selectedReview = review;
			document.querySelector("#fab").disabled = true;

			document.querySelector("#editReviewExplain").innerHTML = review.review;


			return htmlToElement(`<div id = "review">
				<h2 id = "title">Review by ${review.user} (${review.score}) <button id = "reviewOption editReview" type = "button" class = "edit btn bmd-btn-fab" data-toggle="modal" data-target="#editReviewDialog">
				<i class = "edit material-icons">edit</i> 
				</button> 
				<button id = "reviewOption deleteReview" type = "button" class = "delete btn bmd-btn-fab" data-toggle="modal" data-target="#deleteReviewDialog">
				<i class = "material-icons">delete</i>
				</button></h2>
				<p id = "meat">${review.review}</p>
				</div>`);
		}

        return htmlToElement(`<div id = "review">
        <h2 id = "title">Review by ${review.user} (${review.score})</h2>
        <p id = "meat">${review.review}</p>
		</div>`);
	}

	
}

rhit2.MyReviewsPageController = class {
	constructor() {
        rhit2.fbReviewManager = new rhit2.FbReviewManager();

        this.updateList();
		rhit2.fbReviewManager.beginListening(this.updateList.bind(this));

		const urlParams = new URLSearchParams(window.location.search);
		this.uid = urlParams.get('uid');
		console.log("MyReviewsPageController: " + this.uid);
		document.querySelector("#title").href = `/list.html?menu=Dining%20Hall&uid=${this.uid}`;

		document.querySelector("#menuDiningHall").onclick = (event) => {
			rhit.selectedMenu = "Dining Hall";
			window.location.href = `/list.html?menu=${rhit.selectedMenu}&uid=${rhit.fbAuthManager.uid}`;
			
		}
		document.querySelector("#menuChaunceys").onclick = (event) => {
			rhit.selectedMenu = "Chauncey's";
			window.location.href = `/list.html?menu=${rhit.selectedMenu}&uid=${rhit.fbAuthManager.uid}`;
			
		}
		document.querySelector("#menuRoseGardens").onclick = (event) => {
			rhit.selectedMenu = "Rose Gardens";
			window.location.href = `/list.html?menu=${rhit.selectedMenu}&uid=${rhit.fbAuthManager.uid}`;
			
		}
    }

    updateList() {
		console.log("update List!");

		const newList = htmlToElement('<div id= "reviews"></div>');
		rhit2.scores = [];
		rhit2.aggregate = 0;
		for(let i = 0; i < rhit2.fbReviewManager.length; i++){
			const review = rhit2.fbReviewManager.getItemAtIndex(i);
			if(review.user != this.uid){
				continue;
			}
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

	_createReview(review) {
		return htmlToElement(`<div id = "review">
        <h2 id = "title"><a href = "/item.html?name=${review.item}&menu=${review.restaurant}">Review of ${titleCase(review.item)} by ${review.user} (${review.score})</a></h2>
        <p id = "meat">${review.review}</p>
		</div>`);
	}
}

rhit2.main = function() {
	if(document.querySelector("#myReviewsPage")){
		new rhit2.MyReviewsPageController();
	}
}

rhit2.main();
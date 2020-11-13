var rhit = rhit || {};

rhit.FB_KEY_AGGREGATE = "Aggregate";
rhit.FB_KEY_CALORIES = "Calories";
rhit.fbAuthManager = null;
rhit.fbItemManager = null;

rhit.listPageController = null;

rhit.updateDiningHall = false;

rhit.dailyMeals = [];

rhit.foodName = null;

rhit.selectedMenu = "";

rhit.uid = null;


function htmlToElement(html){
  var template = document.createElement('template');
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

function titleCase(str) {
	// var splitStr = str.toLowerCase().split(" ");

	// for (var i = 0; i < splitStr.length; i++) {
	// 	if (splitStr.length[i] < splitStr.length) {
	// 	splitStr[i].charAt(0).toUpperCase();
	// 	}

	// 	str = splitStr.join(" ");
	// }

	// return str;
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

rhit.ListPageController = class {
	constructor() {
		// rhit.dailyMeals = await rhit.getDailyMeals();
		rhit.getDailyMeals();
		const urlParams = new URLSearchParams(window.location.search);
		rhit.selectedMenu = urlParams.get('menu');
		this._uid = urlParams.get('uid');
		rhit.fbItemManager = new rhit.FbItemManager(this._uid);

		document.querySelector("#title").href = `/list.html?menu=${rhit.selectedMenu}&uid=${rhit.fbAuthManager.uid}`;

		document.querySelector("#menuDiningHall").onclick = (event) => {
			rhit.selectedMenu = "Dining Hall";
			window.location.href = `/list.html?menu=${rhit.selectedMenu}&uid=${rhit.fbAuthManager.uid}`;
			this.updateView();
		}
		document.querySelector("#menuChaunceys").onclick = (event) => {
			rhit.selectedMenu = "Chauncey's";
			window.location.href = `/list.html?menu=${rhit.selectedMenu}&uid=${rhit.fbAuthManager.uid}`;
			this.updateView();
		}
		document.querySelector("#menuRoseGardens").onclick = (event) => {
			rhit.selectedMenu = "Rose Gardens";
			window.location.href = `/list.html?menu=${rhit.selectedMenu}&uid=${rhit.fbAuthManager.uid}`;
			this.updateView();
		}

		document.querySelector("#menuSignOut").onclick = (event) => {
			rhit.fbAuthManager.signOut();
		}

		this.updateView();
		rhit.fbItemManager.beginListening(this.updateList.bind(this));

		document.querySelector("#menuMyReviews").onclick = (event) => {
			window.location.href = `/myReviews.html?uid=${this._uid}`
			new rhit2.MyReviewsPageController(this._uid);
		}
	}

	updateView() {
    document.querySelector("#locationTitle").text = rhit.selectedMenu;
    document.querySelector("#location").innerHTML = rhit.selectedMenu;
  }
  
  _createItem(item) {
	  this.name = titleCase(item.name);
	//   if(this.name.length > 30){
	// 	  this.name = this.name.substring(0, 30) + "...";
	//   }
		return htmlToElement(`<div class = "col-6 col-md-4 col-lg-3" id="item" align="center">
      <a href = "/item.html?name=${item.name}&menu=${rhit.selectedMenu}" id = "meal">${this.name}</a></div>`);
	}

	updateList() {
		const newList = htmlToElement('<div class = "row" id="meals"></div>');


		if(rhit.selectedMenu == "Dining Hall" && rhit.updateDiningHall){
			for(let j = 0; j < rhit.dailyMeals.length; j++){
				const meal = rhit.dailyMeals[j];
				// if(!rhit.excludedItems.includes(meal)){
					rhit.fbItemManager.add(meal);
				// }
			}
			rhit.updateDiningHall = false;
		}
		
		for(let i = 0; i < rhit.fbItemManager.length; i++){
			const item = rhit.fbItemManager.getItemAtIndex(i);
			if(rhit.selectedMenu == "Dining Hall" && !rhit.dailyMeals.includes(item.name)){
				continue;
			}
			const newCard = this._createItem(item);

			newCard.onclick = (event) => {
				window.location.href = `/item.html?id=${item.id}`;
			};

			newList.appendChild(newCard);	
		}

		//Remove old container
		const oldList = document.querySelector("#meals");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		//Put in the new container
		oldList.parentElement.appendChild(newList);
	}


}

rhit.FbItemManager = class {
	constructor(uid) {
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.selectedMenu);
		// console.log("Ref: " + this._ref + " " + rhit.selectedMenu);
		this._unsubscribe = null;
	}
	add(item) {
		this._ref.doc(item).set({
			Name: item
		})
		.catch(function (error) {
			console.log(error);
		});
	}
	beginListening(changeListener){
    	let query = this._ref.orderBy("Name", 'asc');

		this._unsubscribe = query
		.onSnapshot((querySnapshot) => {
			this._documentSnapshots = querySnapshot.docs;
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
		const item = new rhit.Item(
			docSnapshot.id,
			docSnapshot.get(rhit.FB_KEY_AGGREGATE),
			docSnapshot.get(rhit.FB_KEY_CALORIES)
		);
		return item;
	}
	getItemByName(name){
		return this._ref.doc(name);
	}
}

rhit.Item = class {
	constructor(name, aggregate, calories){
		this.name = name;
		this.aggregate = aggregate;
		this.calories = calories;
	}
}
    
rhit.LoginPageController = class {
	constructor() {
    console.log("Login Page Controller");
		rhit.startFirebaseUI();
		document.querySelector("#roseFireButton").onclick = (event) => {
			rhit.fbAuthManager.signIn();
    };
  }
}

rhit.FbAuthManager = class {
	constructor() {
		this._user = null;
	}
	beginListening(changeListener) {
		console.log("FBAuthManager Begin Listening");

		firebase.auth().onAuthStateChanged((user) => {
			this._user = user;
			changeListener();
		});
	}
	signIn() {
		// Please note this needs to be the result of a user interaction
		// (like a button click) otherwise it will get blocked as a popup
		Rosefire.signIn("59e42f50-71c8-4279-80b9-ed47e1a19709", (err, rfUser) => {
			if (err) {
				console.log("Rosefire error!", err);
				return;
			}
			console.log("Rosefire success!", rfUser);
			
			firebase.auth().signInWithCustomToken(rfUser.token).catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				if(errorCode === 'auth/invalid-custom-token'){
					alert('The token you provided is not valid');
				}
				else{
					console.error("Custom auth error", errorCode, errorMessage)
				}
			});
		});

  
	}
	signOut() {
		firebase.auth().signOut().catch((error) => {
			console.log("Sign out error");
		});
	}
	get isSignedIn() {
		return !!this._user;
	}
	get uid() {
		return this._user.uid;
	}
}

rhit.DetailPageController = class {
  constructor(uid) {
	this._uid = uid;
	rhit.uid = uid;
    const urlParams = new URLSearchParams(window.location.search);
	rhit.foodName = urlParams.get('name');
	rhit.selectedMenu = urlParams.get('menu');
	rhit.fbItemManager = new rhit.FbItemManager();

	new rhit2.DetailPageController();

	this.foodItem = rhit.fbItemManager.getItemByName(rhit.foodName);
	this.foodItem.get().then(function(doc) {
		if (doc.exists) {
			document.querySelector("#foodNameHere2").innerHTML = rhit.foodName + " (" + rhit2.aggregate + ")";
		} else {
			// doc.data() will be undefined in this case
			console.log("No such document!");
		}
	}).catch(function(error) {
		console.log("Error getting document:", error);
	});
	document.querySelector("#foodNameHereTitle").text = rhit.foodName;
	if(rhit.foodName.length > 50){
		document.querySelector("#foodNameHere").innerHTML = rhit.foodName.substring(0, 50) + "...";
	}
	else{
		document.querySelector("#foodNameHere").innerHTML = rhit.foodName;
	}
	document.querySelector("#foodNameHere").href = `/list.html?menu=${rhit.selectedMenu}&uid=${this._uid}`;

	document.querySelector("#menuSignOut").onclick = (event) => {
		rhit.fbAuthManager.signOut();
	}

	document.querySelector("#menuMyReviews").onclick = (event) => {
		window.location.href = `/myReviews.html?uid=${this._uid}`
	}
  }

}

rhit.startFirebaseUI = function() {
	// FirebaseUI config.
	var uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
        //   firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
      };

    // Initialize the FirebaseUI Widget using Firebase.
    const ui = new firebaseui.auth.AuthUI(firebase.auth());
    console.log(ui);
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	
  	rhit.fbAuthManager = new rhit.FbAuthManager();
	rhit.fbAuthManager.beginListening(() => {

		rhit.checkForRedirects();

		rhit.initializePage();

	});
};

rhit.checkForRedirects = function() {
	if(document.querySelector("#loginPage") && rhit.fbAuthManager.isSignedIn){
		window.location.href = `/list.html?menu=Dining%20Hall&uid=${rhit.fbAuthManager.uid}`;
	}
	if(!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn){
		window.location.href = "/";
	}
};

rhit.initializePage = function() {
	if(document.querySelector("#listPage")){
		rhit.uid = rhit.fbAuthManager.uid;
		rhit.selectedMenu = "Dining Hall";
		rhit.listPageController = new rhit.ListPageController();
	}

	else if(document.querySelector("#detailPage")){
		rhit.uid = rhit.fbAuthManager.uid;
		const queryString = window.location.search
		const urlParams = new URLSearchParams(queryString);
		const uid = urlParams.get("uid");
		new rhit.DetailPageController(rhit.fbAuthManager.uid);
	}

	else if(document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
}

rhit.getDailyMeals = async () => {
	fetch(`http://localhost:5001/ansarij-brunojchris-mealrating/us-central1/api/mealitems`)
	.then(response => {
		return response.json();})
	.then(data => {
		rhit.dailyMeals = data.list;
		rhit.updateDiningHall = true;
		rhit.listPageController.updateList();
		rhit.listPageController.updateView();
	})
	.catch((err) => console.log("Error: " + err));
}


rhit.main();
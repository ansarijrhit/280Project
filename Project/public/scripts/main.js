var rhit = rhit || {};

rhit.FB_COLLECTION_CHAUNCEYS = "Chauncey's";
rhit.fbAuthManager = null;

rhit.selectedMenu = "Dining Hall";

rhit.listPageController = class {
	constructor() {

    // this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_CHAUNCEYS);

    // console.log(this._ref);
    document.querySelector("#menuDiningHall").onclick = (event) => {
			rhit.selectedMenu = "Dining Hall";
      console.log("dining hall");
      window.location.href = `/list.html?menu=${rhit.selectedMenu}`;
      this.updateView();
		}
    document.querySelector("#menuChaunceys").onclick = (event) => {
			rhit.selectedMenu = "Chaunceys";
      console.log("chunkys");
      window.location.href = `/list.html?menu=${rhit.selectedMenu}`;
      this.updateView();
		}
    document.querySelector("#menuRoseGardens").onclick = (event) => {
			rhit.selectedMenu = "Rose Gardens";
      console.log("not dining hall");
      window.location.href = `/list.html?menu=${rhit.selectedMenu}`;
      this.updateView();
		}
	}

	updateView() {
    document.querySelector("#locationTitle").text = rhit.selectedMenu;
    document.querySelector("#location").innerHTML = rhit.selectedMenu;
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
			console.log(this._user);
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
			
			// TODO: Use the rfUser.token with your server.
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

rhit.startFirebaseUI = function() {
	// FirebaseUI config.
	var uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
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
		window.location.href = "/list.html";
	}
	if(!document.querySelector("#loginPage") && !rhit.fbAuthManager.isSignedIn){
		window.location.href = "/";
	}
};

rhit.initializePage = function() {
  // if(document.querySelector("#mainPage")){
  //   new rhit.mainPageManager();
  // }
  // else if(document.querySelector("#loginPage")){
  //   new rhit.LoginPageController
  // }
  const urlParams = new URLSearchParams(window.location.search);
	if(document.querySelector("#listPage")){
		console.log("You are on the list page.");
		const uid = urlParams.get("uid");
		new rhit.listPageController();
	}

	else if(document.querySelector("#detailPage")){

		const queryString = window.location.search
		const urlParams = new URLSearchParams(queryString);
		new rhit.DetailPageController();
	}

	else if(document.querySelector("#loginPage")) {
		console.log("You are on the login page.");
		new rhit.LoginPageController();
	}
}

rhit.main();

/**
 * @fileoverview
 * Provides the JavaScript interactions for all pages.
 *
 * @author 
 * PUT_YOUR_NAME_HERE
 */

/** namespace. */
var rhit = rhit || {};

rhit.FB_COLLECTION_CHAUNCEYS = "Chauncey's";

rhit.selectedMenu = "Dining Hall";

rhit.mainPageManager = class {
	constructor() {

    // this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_CHAUNCEYS);

    // console.log(this._ref);
    document.querySelector("#menuDiningHall").onclick = (event) => {
			rhit.selectedMenu = "Dining Hall";
      console.log("dining hall");
      this.updateView();
		}
    document.querySelector("#menuChaunceys").onclick = (event) => {
			rhit.selectedMenu = "Chauncey's";
      console.log("chunkys");
      this.updateView();
		}
    document.querySelector("#menuRoseGardens").onclick = (event) => {
			rhit.selectedMenu = "Rose Gardens";
      console.log("not dining hall");
      this.updateView();
		}
	}

	updateView() {
    document.querySelector("#locationTitle").text = rhit.selectedMenu;
    document.querySelector("#location").innerHTML = rhit.selectedMenu;
	}
}

/* Main */
/** function and class syntax examples */
rhit.main = function () {
	if(document.querySelector("#mainPage")){
    console.log("hi");
    new rhit.mainPageManager();
  }
};

rhit.main();

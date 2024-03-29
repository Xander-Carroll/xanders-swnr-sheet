//This script: 
//	adds new item and actor sheets to the SWNR system.
//  adds new options to the settings menu.
//  changes foundry's CSS if needed.

//Imports used for the custom swnr sheets.
import {XandersSwnActorSheet} from "./actor-sheet.js";
import {XandersSwnItemSheet} from "./item-sheet.js";
import {preloadXandersTemplates} from "./utils.js";

//This function will be called when foundry is initalizing.
Hooks.once("init", () => {
	//Making sure that the module is being used with the right system.
	if (game.system.id === "swnr"){
		//Adding the character sheet.
		Actors.registerSheet("xander", XandersSwnActorSheet);

		//Adding the item sheet.
		Items.registerSheet("xander", XandersSwnItemSheet);

		//Adding module spesific settings.
		registerSystemSettings();

		//Will add css to the page depending on module settings.
		injectCSS();

		//Loads handelbars partials.
		preloadXandersTemplates();

		//Registers an extreamly useful handelbars helper.
		Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
			return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
		});
	}
});

//Adds module spesific settings.
function registerSystemSettings(){
	game.settings.register("xanders-swnr-sheet", "changeAllBackgrounds", {
		config: true,
		scope: "world",
		name: "Change All Backgrounds",
		hint: "This will give the background of all popups and chat messages a more sci-fi texture.",
		type: Boolean,
		default: true,
		onChange: debouncedReload
	});

	game.settings.register("xanders-swnr-sheet", "changePauseButton", {
		config: true,
		scope: "world",
		name: "Change Pause Button",
		hint: "This will change the standard pause button into a more sci-fi one.",
		type: Boolean,
		default: true,
		onChange: debouncedReload
	});
}

//Will add style elements to foundry's CSS based on system settings.
function injectCSS() {
    let innerHTML = '';
    let style = document.createElement("style");
    style.id = "xanders-swnr-sheet-css-changes";
    
	//Changes sheet and chat backgrounds if needed.
	if (game.settings.get("xanders-swnr-sheet", "changeAllBackgrounds")) {
        innerHTML += `
            /* Replaces the standard parchment background */
            .window-app .window-content, .chat-message{
                background: url("modules/xanders-swnr-sheet/img/backgrounds/hexellence.webp");
                background-color: rgb(243,243,243);

				--color-shadow-primary: rgb(5, 99, 150);
            }
        `;
    }

	//Changes the pause button if needed.
	if(game.settings.get("xanders-swnr-sheet", "changePauseButton")){
		innerHTML += `
		/* Replaces the standard pause button with a more sci-fi one */
			#pause img {
				content: url("modules/xanders-swnr-sheet/img/icons/pause-icon.svg");	
			}
		`;
	}

	//Applies the CSS changes.
    style.innerHTML = innerHTML;
    if (innerHTML != '')
        document.querySelector("head").appendChild(style);
}
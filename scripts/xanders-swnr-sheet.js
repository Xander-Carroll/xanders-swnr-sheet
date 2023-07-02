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
		hint: "This will give the background of all popups a more sci-fi texture.",
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
			.window-app section.window-content,
			.window-app section.window-content .dialog-content,
			.window-app section.window-content .dialog-buttons{
				background: url("modules/xanders-swnr-sheet/img/backgrounds/hexellence.webp");
				background-color: rgb(233,233,233);
				color: black;
	
				--color-shadow-primary: rgb(5, 99, 150);
			}

			.window-app section.window-content aside{
				background-color: rgb(255, 255, 255, 0.3);
			}

			/* Changes colors to make fields readable */
			.window-app#module-management section.window-content{
				color: none;
			}

			.window-app#module-management section.window-content label{
				color: black;
			}

			.window-app section.window-content p.notes{
				color: #464646 !important;
				margin-top: 3px;
				font-size: 13px;
			}

			.window-app section.window-content .border{
				border: none;
				font-weight: bolder;
				font-size: 20px;
				border-bottom: 1px solid black;
			}

			.window-app section.window-content button{
				background: #d4d5d6;
				color: black;
				border-radius: 3px;
				border: 1px solid var(--color-border-light-tertiary);
			}

			.window-app section.window-content select{
				border: 1px solid var(--color-border-light-tertiary);
				border-radius: 3px;
				background-color: rgba(0, 0, 0, 0.05);
			}

			.window-app section.window-content select option{
				background-color: var(--color-bg-option);
				color: black;
				border-radius: 0px;
			}

			.window-app section.window-content input{
				background-color: rgba(0, 0, 0, 0.05);
				border: 1px solid var(--color-border-light-tertiary);
				border-radius: 3px;
				text-align: left;
			}

			.window-app section.window-content input[type=range]{
				border: none;
				background: none;
			}

			.window-app section.window-content hr{
				border-color: #b5b3a4;
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
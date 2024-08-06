//This script: 
//	adds new item and actor sheets to the SWNR system.
//  adds interactivity with new chat messages.
//  adds new options to the settings menu.
//  changes foundry's CSS if needed.

//Imports used for the custom swnr sheets.
import {XandersSwnActorSheet} from "./actor-sheet.js";
import {XandersSwnItemSheet} from "./item-sheet.js";
import {preloadXandersTemplates, createRollItemMacro, rollItemMacro} from "./utils.js";
import {addChatListener} from "./chat.js";

//This function will be called when foundry is initalizing.
Hooks.once("init", async () => {
	//Making sure that the module is being used with the right system.
	if (game.system.id === "swnr"){
		//Adding the character sheet.
		Actors.registerSheet("xander", XandersSwnActorSheet);

		//Adding the item sheet.
		Items.registerSheet("xander", XandersSwnItemSheet);

		//Adding module spesific settings.
		registerSystemSettings();

		//Will add css to the page depending on module settings.
		await injectCSS();

		//Loads handelbars partials.
		preloadXandersTemplates();

		//Registers an extreamly useful handelbars helper.
		Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
			return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
		});
		Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
			return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
		});

		//Adds function to global space.
		game.xswnr = {rollItem: rollItemMacro};
	}
});

//This function will be called after foundry is initalized.
Hooks.once("ready", async () => {
	//When an item is dragged to the hotbar, this function is called.
	Hooks.on("hotbarDrop", (bar, data, slot) => {createRollItemMacro(data, slot); return false;});
})

//This function is used to make chat messages interactive.
Hooks.on("renderChatMessage", (message, html, data) => addChatListener(message, html, data));

//Adds module spesific settings.
function registerSystemSettings(){
	game.settings.register("xanders-swnr-sheet", "changeAllBackgrounds", {
		config: true,
		scope: "world",
		name: "Change UI",
		hint: "This will overhaul the UI giving popups a more sci-fi texture.",
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

	game.settings.register("xanders-swnr-sheet", "removeRerollButton", {
		config: true,
		scope: "world",
		name: "Remove Reroll Button",
		hint: "This will remove the reroll button on chat cards created by the default swnr system.",
		type: Boolean,
		default: true,
		onChange: debouncedReload
	});

	game.settings.register("xanders-swnr-sheet", "blueSelectColor", {
		config: true,
		scope: "world",
		name: "Use Blue Select Color",
		hint: "This will change the default orange around buttons, and other elements to a cooler blue.",
		type: Boolean,
		default: true,
		onChange: debouncedReload
	});

	game.settings.register("xanders-swnr-sheet", "itemCardScrub", {
		config: true,
		scope: "world",
		name: "Sanatize GM Item Details",
		hint: "Will hide the item card details of GM rolls from players.",
		type: Boolean,
		default: false
	});

	game.settings.register("xanders-swnr-sheet", "itemCardsCollapsed", {
		config: true,
		scope: "client",
		name: "Item Cards Collapsed By Default",
		hint: "This option will automatically collapse item card descriptions in the chat.",
		type: Boolean,
		default: false	
	});
}

//Will add style elements to foundry's CSS based on system settings.
async function injectCSS() {
    let innerHTML = '';
    let style = document.createElement("style");
    style.id = "xanders-swnr-sheet-css-changes";
    
	//Changes sheet and chat backgrounds if needed.
	if (game.settings.get("xanders-swnr-sheet", "changeAllBackgrounds")) {
		try{
			const response = await fetch("modules/xanders-swnr-sheet/styles/xanders-swnr-ui.css");
			const css = await response.text();
			innerHTML += css;
		}catch{
			console.error("Could not load [xanders-swnr-ui.css]. UI Will remain unchanged.");
		}
        
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

	//Removes the reroll button from chat cards if needed.
	if(game.settings.get("xanders-swnr-sheet", "removeRerollButton")){
		innerHTML += `
		/* Removes the reroll button from roll chat cards. */
			span.dmgBtn-container {
				display: none;
			}
		`;
	}

	//Changes the hilights and scrollbar from orange to blue.
	if(game.settings.get("xanders-swnr-sheet", "blueSelectColor")){
		innerHTML += `
		/* Changes some of foundry's default colors. */
			:root{
				--color-shadow-primary: #003182;
				--color-shadow-highlight: #1377a2;
				--color-border-highlight: #005f98;
				--color-border-highlight-alt: #007ecc;
			}

			::-webkit-scrollbar-thumb{
				background: #050b4e;
			}
		`;
	}

	//Applies the CSS changes.
    style.innerHTML = innerHTML;
    if (innerHTML != '')
        document.querySelector("head").appendChild(style);
}
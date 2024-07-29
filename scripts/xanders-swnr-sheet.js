//This script: 
//	adds new item and actor sheets to the SWNR system.
//  adds interactivity with new chat messages.
//  adds new options to the settings menu.
//  changes foundry's CSS if needed.

//Imports used for the custom swnr sheets.
import {XandersSwnActorSheet} from "./actor-sheet.js";
import {XandersSwnItemSheet} from "./item-sheet.js";
import {preloadXandersTemplates} from "./utils.js";
import {addChatListener} from "./chat.js";


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
		Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
			return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
		});
	}
});

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
function injectCSS() {
    let innerHTML = '';
    let style = document.createElement("style");
    style.id = "xanders-swnr-sheet-css-changes";
    
	//Changes sheet and chat backgrounds if needed.
	if (game.settings.get("xanders-swnr-sheet", "changeAllBackgrounds")) {
        innerHTML += `
			/* The new font needs changed on everything. */
			body.game{
				font-family: var(--font-primary);
			}
			
			.swnr{
				/* ... Except for the default old SWNR sheet. */
				font-family: "Gayathri";
			}

			section.window-content:not(.cq){
				font-size: var(--font-size-14);
			}

			/* The new font needs changed for the chat messages. */
			.chat-message h4{
				font-family: var(--font-primary);
				font-weight: normal;
			}

            /* Replaces the standard parchment background */
			.window-app section.window-content:not(.cq),
			.window-app section.window-content .dialog-content,
			.window-app section.window-content .dialog-buttons{
				background: url("modules/xanders-swnr-sheet/img/backgrounds/hexellence.webp");
				background-color: rgb(233,233,233);
				color: black;
	
				--color-shadow-primary: rgb(5, 99, 150);
				--color-text-dark-primary: #3c3c3c;
				--color-underline-header: rgb(71, 71, 71);
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

			.window-app section.window-content .border:not(.rounded-md){
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

			.window-app section.window-content button:focus{
				outline: none;
			}

			.window-app section.window-content select:not(.rounded-md){
				border: 1px solid var(--color-border-light-tertiary);
				border-radius: 3px;
				background-color: rgba(0, 0, 0, 0.05);
				padding:0px 3px;
			}

			.window-app section.window-content .dialog-content p:not(.notes){
				margin: 7px 0px;
				line-height: 13px;
			}

			.window-app section.window-content .dialog-content h4{
				margin: 7px 0px;
				line-height: 13px;
			}

			.window-app section.window-content select option{
				background-color: var(--color-bg-option);
				color: black;
				border-radius: 0px;
				padding-left: 0px;
				padding-right: 0px;
			}

			.window-app section.window-content input:not(.subfield, .bottom-border, .borderless, .xanders-input, .rounded-md){
				background-color: rgba(0, 0, 0, 0.05);
				border: 1px solid var(--color-border-light-tertiary);
				border-radius: 3px;
				text-align: left;
				margin: 0px;
				padding:0px 3px;
			}

			.window-app section.window-content button.file-picker + input[type="text"]{
				margin-left: -3px;
			}

			.window-app section.window-content .range-value{
				border: 1px solid var(--color-border-light-tertiary);
			}

			.window-app section.window-content input[type=range]{
				border: none;
				background: none;
			}

			.window-app section.window-content input[type=color]{
				padding: 1px;
			}

			.window-app section.window-content .item.active{
				text-shadow: 0 0 10px var(--color-shadow-primary);
			}

			.window-app section.window-content hr{
				border-color: #868685;
			}

			.window-app section.window-content textarea{
				background-color: rgba(0, 0, 0, 0.05);
				border: 1px solid #868685;
			}

			.directory .directory-header .header-search input {
				color: black;
			}

			/* Fixing the bullet points and numbered list in item descriptions.*/
			.window-app section.window-content ul{
				list-style: disc;
			}

			.window-app section.window-content ol{
				list-style: decimal;
			}

			.window-app section.window-content h1{
				font-size: 2em;
    			border-bottom: 2px solid var(--color-underline-header);
			}

			.window-app section.window-content h2{
				font-size: 1.5em;
    			border-bottom: 1px solid var(--color-underline-header);
			}

			/* Fixing the bullet points and numbered list on the old charachter and item sheets.*/
			.window-app.swnr section.window-content ul{
				list-style: none;
			}

			.window-app.swnr section.window-content ol{
				list-style: none;
			}

			/* Adding more padding between buttons.*/
			.window-app button {
				margin: 0.125rem 0rem 0.125rem;
				padding: 0.125rem 6px 0.125rem;
				line-height: 28px;
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
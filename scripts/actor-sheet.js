//Extends the basic ActorSheet with some very simple modifications

 export class XandersSwnActorSheet extends ActorSheet {

    //@override
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["xanders-swnr", "xanders-actor-sheet"],
            width: 600,
            height: 720,
            tabs: [{ 
                navSelector: ".sheet-tabs", 
                contentSelector: ".sheet-body", 
                initial: "attributes" 
            }]
        });
    }

    //@override
    activateListeners(html){
        super.activateListeners(html);

        //None of the stuff below here needs to happen if the player dosen't 
        //have permission to edit the sheet.
        if (!this.isEditable) return;

        html.find('.lock-button').click(async (event) => {
            this.actor.update({"system.xIsLocked": !this.actor.system.xIsLocked});
        });

        html.find('.save-throw-button').on("click", this._onSaveThrow.bind(this));

    }

    //@override
    getData() {
        // Retrieve the data structure from the base sheet.
        const context = super.getData();

        //Creating a more easily accsessed system variable.
        const system = context.actor.system;
        context.system = system;

        //Creates an xIsLocked variable on the actor if it does not have one.
        if(this.actor.system.xIsLocked == null){
            this.actor.system.xIsLocked = true;
        }

        //Force locks the sheet if the viewer is not an owner and adds the value to the context.
        context.system.xIsLocked = this.actor.system.xIsLocked || !context.owner;

        //Adding a variable that will be used to set the health-bar width to the context.
        const health = context.system.health;
        let percentage = Math.floor(health.value * 100 / health.max);
        percentage = Math.min(percentage, 100);
        percentage = Math.max(percentage, 0);
        context.system.health.percentage = percentage;

        //Uncomment this line to see what data can be accsessed in the handelbars sheet.
        //console.log(context);
    
        return context;
    }

    //Called when one of the three saving throw buttons is pressed.
    async _onSaveThrow(event){
        //Getting the type of saving throw. 'evasion', 'mental', or 'physical'.
        event.preventDefault();
        const saveType = event.currentTarget.dataset.saveType;

        //Opening a dialog to prompt the player to add modifiers etc.
        let saveData = await _saveThrowDialog(saveType);

        //If the dialog was canceled(closed) the roll needs cancelled.
        if(saveData.cancelled){
            return;
        }

        //Adding data to the saving throw.
        saveData.target = this.actor.system.save[saveType];

        if(saveData.rollMode === "CURRENT"){
            saveData.rollMode = game.settings.get("core", "rollMode");
        }else{
            saveData.rollMode = CONST.DICE_ROLL_MODES[saveData.rollMode];
        }

        //Detrming the proper roll formula to use.
        let rollFormula = "1d20";
        if(saveData.modifier !== ''){
            let firstSymbol = saveData.modifier.charAt(0);

            if(firstSymbol !== '+' && firstSymbol !== '-'){
                rollFormula = rollFormula + "+" + saveData.modifier;
            }else{
                rollFormula = rollFormula + saveData.modifier;
            }
        }

        //Creating a roll with the proper roll formula.
        const roll = new Roll(rollFormula, {target: saveData.target});

        //If the roll does not evaluate, it was because the player entered a bad modifier.
        try{
            await roll.roll({async: true});
        }catch (error){
            ui.notifications.error("Saving Throw: [" + saveData.modifier + "] is not a valid modifier!");
            return;
        }

        //Getting the roll as HTML.
        let rollContent = await roll.render();

        let templateData = {
            saved: false
        };

        if(roll.total >= saveData.target){
            templateData.saved = true;
        };

        //Getting the saving throw chat as HTML.
        let templateContent = await renderTemplate("modules/xanders-swnr-sheet/scripts/templates/chats/save-throw-chat.html", templateData);

        // Sets the basic information needed for the chat message.        
        let messageData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({actor:this.actor}),
            roll: JSON.stringify(roll),
            content: rollContent + templateContent,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            flavor: "v" + saveData.target + " " + toTitleCase(saveType) + " saving throw"
        };

        // Creates the chat message with the given data.
        let message = await getDocumentClass("ChatMessage").create(messageData);

        //Changes the roll mode of the chat message.
        await getDocumentClass("ChatMessage").applyRollMode(messageData, saveData.rollMode);
        await message.update(messageData);
    }

    //@override
    get template() {
        return `modules/xanders-swnr-sheet/scripts/templates/actors/actor-${this.actor.type}-sheet.html`;
    }

}

//Called when a saving throw is made to give the user a chance to add modifiers.
async function _saveThrowDialog(saveType){
    const template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/save-throw-dialog.html"
    const html = await renderTemplate(template, {});

    return new Promise(resolve => {
        const data = {
            title: toTitleCase(saveType) + " Saving Throw",
            content: html,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: html => resolve(_processSaveThrowOptions(html))
                }
            },
            default: "roll",
            close: () => resolve({cancelled: true}) 
        }

        new Dialog(data, null).render(true);
    });
}

//Parses the information found in a savingThrowDialog into a dictionary.
function _processSaveThrowOptions(html){
    const rollType = html.find('[name="rollmode"]')[0].value;
    const modifier = html.find('[name="modifier"]')[0].value;

    return {
        modifier: modifier,
        rollMode: rollType
    }
}

//Turns a given string into a title-case version of that string.
function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}
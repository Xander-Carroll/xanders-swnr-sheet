//Extends the basic ActorSheet with some very simple modifications

import { initSkills, toTitleCase} from "./utils.js";

export class XandersSwnActorSheet extends ActorSheet {

    //The menu that will be opened when an item is right clicked and the sheet is unlocked.
    unlockedItemContextMenu = [
        {
            name: "Edit",
            icon: '<i class="fas fa-edit"></i>',
            callback: element => {
                const skill = this.actor.getEmbeddedDocument("Item", element.data("item-id"));
                skill.sheet.render(true);
            }
        },
        {
            name: "Delete",
            icon: '<i class="fas fa-trash"></i>',
            callback: element => {
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
            }
        }
    ];

    //The menu that will be opened when an item is right clicked and the sheet is unlocked.
    lockedItemContextMenu = [
        {
            name: "Edit",
            icon: '<i class="fas fa-edit"></i>',
            callback: element => {
                const skill = this.actor.getEmbeddedDocument("Item", element.data("item-id"));
                skill.sheet.render(true);
            }
        }
    ];

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

        //Return if the player can't edt the sheet.
        if (!this.isEditable) return;

        //If the lock button is clicked, the sheet lock is toggeled.
        html.find('.lock-button').click(async (event) => {
            this.actor.update({"system.xIsLocked": !this.actor.system.xIsLocked});
        });

        //If a saving throw button is clicked, a save dialog is opened.
        html.find('.save-throw-button').on("click", this._onSaveThrow.bind(this));

        //If a skill is clicked a skill check dialog is opened.
        html.find('.skill-clickable').on("click", this._onSkillCheck.bind(this));

        //If the add skill buttons are clicked.
        html.find('.add-skill-clickable').on("click", this._onSkillAdd.bind(this));

        //If an item is clicked.
        html.find('.item-clickable').on("click", this._onItemExpand.bind(this));

        //Adding context menu when skills or items are right clicked.
        if(this.actor.system.xIsLocked){
            new ContextMenu(html, '.skill-choice', this.lockedItemContextMenu);
            new ContextMenu(html, '.item-choice', this.lockedItemContextMenu);
        }else{
            new ContextMenu(html, '.skill-choice', this.unlockedItemContextMenu);
            new ContextMenu(html, '.item-choice', this.unlockedItemContextMenu);
        }   
        
    }

    //@override
    getData() {
        // Retrieve the data structure from the base sheet.
        let context = super.getData();

        //Creating a more easily accsessed system variable.
        const system = context.actor.system;
        context.system = system;

        //Creates an xIsLocked variable on the actor if it does not have one.
        if(this.actor.system.xIsLocked == null){
            this.actor.system.xIsLocked = true;
        }

        //Force locks the sheet if the viewer is not an owner and adds the value to the context.
        context.system.xIsLocked = this.actor.system.xIsLocked || !context.owner;

        //Modifies the context into something that is more readable by handelbars.
        context = this._parseActorData(context);
        context = this._parseItemData(context);

        //Uncomment this line to see what data can be accsessed in the handelbars sheet.
        console.log(context);
    
        return context;
    }

    //Will edit context.sytem to format the actor data in a way that is better suited for handelbars.
    _parseActorData(context){
        //Adding a variable that will be used to set the health-bar width to the context.
        const health = context.system.health;
        let hPercentage = Math.floor(health.value * 100 / health.max);
        hPercentage = Math.min(hPercentage, 100);
        hPercentage = Math.max(hPercentage, 0);
        context.system.health.percentage = hPercentage;
    
        //Adding a variable that will be used to set the strain-bar width to the context.
        const strain = context.system.systemStrain;
        let sPercentage = Math.floor(strain.value * 100 / strain.max);
        sPercentage = Math.min(sPercentage, 100);
        sPercentage = Math.max(sPercentage, 0);
        context.system.systemStrain.percentage = sPercentage;

        //Creating a string that will dispaly attribute modifiers with a + or -
        for(let i=0; i<6; i++){
            //The identifier "str", "dex", "con", etc.
            let attributeString = Object.keys(context.system.stats)[i]; 

            //Adds a new variable modString to each stat which contains the modifier as it should be displayed on the character sheet.
            context.system.stats[attributeString].modString = context.system.stats[attributeString].mod >= 0 ? "+" + context.system.stats[attributeString].mod : context.system.stats[attributeString].mod;
        }
    
        return context;
    }

    //Will edit context.items to format the items in a way that is better suited for handelbars.
    _parseItemData(context){
        //New item arrays where items are sorted by type.
        context.skills = [];
        context.weapons = [];
        context.actualItems = [];

        //Adding variables to the items that will be used by the sheet.
        for(var i=0; i<context.items.length; i++){
            //Adding an xIsLocked variable to the items
            context.items[i].system.xIsLocked = context.system.xIsLocked;

            //Editing Skills
            if(context.items[i].type === "skill"){            
                //Creating a rankString varaible which does not show -1.
                context.items[i].system.rankString = context.items[i].system.rank.toString();
                if(context.items[i].system.rankString === "-1"){
                    context.items[i].system.rankString = "-";
                }

                //Creating a mod variable which will add the default stat if one is chosen.
                let stat = context.items[i].system.defaultStat;
                if(stat === "ask"){
                    context.items[i].system.mod = context.items[i].system.rank.toString();
                }else{
                    context.items[i].system.mod = (context.items[i].system.rank + context.system.stats[stat].mod).toString();
                }
                
                if(parseInt(context.items[i].system.mod) >= 0){
                    context.items[i].system.mod = "+" + context.items[i].system.mod;
                }
            
                //Adding the skill to context.skills
                context.skills[context.skills.length] = context.items[i];
            }
        
            //Editing Weapons
            if(context.items[i].type === "weapon"){
                //Used to determine if the wepons section should be displayed on the sheet.
                context.system.hasWeapons = true;

                //Adding the weapon to context.weapons
                context.weapons[context.weapons.length] = context.items[i];
            }

            //Editing Items
            if(context.items[i].type === "item"){
                //Used to determine if the item section should be displayed on the sheet.
                context.system.hasItems = true;

                //Adding the weapon to context.weapons
                context.actualItems[context.actualItems.length] = context.items[i];
            }
        }

        //Determines wether the add skills buttons should be displayed 
        if(!context.system.xIsLocked || (context.skills.length == 0 && context.owner)){
            context.system.displayAddSkillButtons = true;
        }else{
            context.system.displayAddSkillButtons = false;
        }

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

        //Getting the roll data results.
        let rollMessage = await _generateRoll("1d20", saveData, this);

        //Cancelling the roll if the user used an invalid modifier.
        if(rollMessage.error){
            return;
        }

        //Extra data which will be used by handelbars when displaying the saving throw.
        let templateData = {};
        let d20Result = rollMessage.roll.terms[0].total;
        templateData.saved = d20Result !== 1 && (d20Result === 20 || (rollMessage.roll.total >= saveData.target));

        //Getting the extra saving throw chat piece as HTML.
        let templateContent = await renderTemplate("modules/xanders-swnr-sheet/scripts/templates/chats/save-throw-chat.html", templateData);

        // Sets more basic information needed for the chat message. 
        rollMessage.data.content = rollMessage.data.content + templateContent;
        rollMessage.data.flavor = "v" + saveData.target + " " + toTitleCase(saveType) + " saving throw";

        // Creates the chat message with the given data.
        let message = await getDocumentClass("ChatMessage").create(rollMessage.data);

        //Changes the roll mode of the chat message.
        await getDocumentClass("ChatMessage").applyRollMode(rollMessage.data, saveData.rollMode);
        await message.update(rollMessage.data);
    }

    //Called when a skill from the attributes tab is clicked.
    async _onSkillCheck(event){
        event.preventDefault();

        //Getting the skill that was clicked.
        const skill = this.actor.getEmbeddedDocument("Item", event.currentTarget.dataset.itemId);
        skill.system.stats = this.actor.system.stats;

        //Creating a dialog so that the player can choose how they want to roll.
        let checkData = await _skillCheckDialog(skill);

        //If the dialog was canceled(closed) the roll needs cancelled.
        if(checkData.cancelled){
            return;
        }

        //Adding modifiers to the role. rollData.modifier.
        let skillMod = skill.system.rank.toString();
        let attribMod = this.actor.system.stats[checkData.attribute].mod.toString();
        
        //Ensuring that the right signs are used in the roll formula.
        if(skillMod.charAt(0) !== '-'){
            skillMod = "+" + skillMod;
        }
        if(attribMod.charAt(0) !== '-'){
            attribMod = "+" + attribMod;
        }
        checkData.modifier = checkData.modifier + attribMod + skillMod;

        //Getting the roll data results.
        let rollMessage = await _generateRoll(checkData.pool, checkData, this);

        //Cancelling the roll if the user used an invalid modifier.
        if (rollMessage.error){
            return;
        }

        // Sets more basic information needed for the chat message. 
        rollMessage.data.flavor = skill.name + " (" + checkData.attribute + ") skill check";

        // Creates the chat message with the given data.
        let message = await getDocumentClass("ChatMessage").create(rollMessage.data);

        //Changes the roll mode of the chat message.
        await getDocumentClass("ChatMessage").applyRollMode(rollMessage.data, checkData.rollMode);
        await message.update(rollMessage.data);
    }

    //Called when one of the add/remove skills buttons is pressed.
    async _onSkillAdd(event){
        event.preventDefault();

        //Getting the button that was pressed.
        const buttonType = event.currentTarget.dataset.addSkill;

        //If the remove option was pressed.
        if(buttonType === 'remove'){
            let applyChanges = false;

            new Dialog({
                title: `Delete All Skills?`,
                content: `
                  <form>
                    <p>Are you sure you want to delete all skills?</p>
                  </form>
                  `,
                buttons: {
                  yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: `Delete All Skills`,
                    callback: () => applyChanges = true
                  },
                  no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: `Cancel`
                  },
                },
                default: "no",
                close: html => {
                    if (applyChanges) {
                        let skillIds = [];
                        const items = this.actor.getEmbeddedCollection("Item");
            
                        items.forEach(item =>{
                            if(item.type === 'skill'){
                                skillIds.push(item._id);
                            }
                        });
            
                        this.actor.deleteEmbeddedDocuments("Item", skillIds);
                    }
                }
            }).render(true);
        }else{
            initSkills(this.actor, buttonType);
        }
    }

    async _onItemExpand(event){
        event.preventDefault();

        //Getting the skill that was clicked.
        const item = this.actor.getEmbeddedDocument("Item", event.currentTarget.dataset.itemId);
        console.log(item);
    }

    //@override
    get template() {
        return `modules/xanders-swnr-sheet/scripts/templates/actors/actor-${this.actor.type}-sheet.html`;
    }

}

//Retruns a rollData object and a roll object from the spesified data.
async function _generateRoll(baseDie, rollData, sheet){
    //Determing what role mode should be used.
    if(rollData.rollMode === "CURRENT"){
        rollData.rollMode = game.settings.get("core", "rollMode");
    }else{
        rollData.rollMode = CONST.DICE_ROLL_MODES[rollData.rollMode];
    }

    //Detrming the proper roll formula to use.
    let rollFormula = baseDie;
    if(rollData.modifier !== ''){
        let firstSymbol = rollData.modifier.charAt(0);

        if(firstSymbol !== '+' && firstSymbol !== '-'){
            rollFormula = rollFormula + "+" + rollData.modifier;
        }else{
            rollFormula = rollFormula + rollData.modifier;
        }
    }

    //Creating a roll with the proper roll formula.
    const roll = new Roll(rollFormula, {target: rollData.target});

    //If the roll does not evaluate, it was because the player entered a bad modifier.
    try{
        await roll.roll({async: true});
    }catch (error){
        ui.notifications.error("[" + rollData.modifier + "] is not a valid modifier!");
        return {error: true};
    }

    //Getting the roll as HTML.
    let rollContent = await roll.render();

    // Sets the basic information needed for the chat message.        
    let messageData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({actor:sheet.actor}),
        roll: JSON.stringify(roll),
        content: rollContent,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };

    return {data: messageData, roll:roll};
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

//Called when a skill check is made to give the user a chance to add modifiers.
async function _skillCheckDialog(skill){
    //Creating an html template from the dialog.
    const template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/skill-check-dialog.html"
    const html = await renderTemplate(template, skill);

    //Creating the dialog and rendering it.
    return new Promise(resolve => {
        const data = {
            title: skill.name + " Skill Check",
            content: html,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: html => resolve(_processSkillCheckOptions(html, skill.system.defaultStat, skill.system.pool))
                }
            },
            default: "roll",
            close: () => resolve({cancelled: true}) 
        }

        new Dialog(data, null).render(true);
    });
}

//Parses the information found in a skillCheckDialog into a dictionary.
function _processSkillCheckOptions(html, stat, pool){
    const rollType = html.find('[name="rollmode"]')[0].value;
    const modifier = html.find('[name="modifier"]')[0].value;
    let attribute = stat;
    let dicePool = pool;

    attribute = html.find('[name="attribute"]')[0].value;

    dicePool = html.find('[name="pool"]')[0].value;

    return {
        modifier: modifier,
        rollMode: rollType,
        attribute: attribute,
        pool: dicePool
    }
}
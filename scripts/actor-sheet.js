//Extends the basic ActorSheet with some very simple modifications

import { initSkills, toTitleCase} from "./utils.js";

export class XandersSwnActorSheet extends ActorSheet {

    //The menu that will be opened when an item is right clicked.
    itemContextMenu = [
        {
            name: ` <div style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-edit"></i>
                        &nbsp;
                        <p class="context-text">Edit Item</p>
                    </div>
                    <hr/>`,
            icon: '',
            callback: element => {
                const item = this.actor.getEmbeddedDocument("Item", element.data("item-id"));
                item.sheet.render(true);
            }
        },
        {
            name: ` <div style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-bookmark"></i>
                        &nbsp;
                        <p class="context-text">Favorite Item</p>
                    </div>`,
            icon: '',
            callback: element => {
                const item = this.actor.getEmbeddedDocument("Item", element.data("item-id"));
                this.actor.updateEmbeddedDocuments("Item", [{_id: element.data("item-id"), system:{favorite: !item.system.favorite}}]);
            }
        },
        {
            name: ` <div class="context-delete" style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-trash"></i>
                        &nbsp;
                        <p class="context-text">Delete Item</p>
                    </div>`,
            icon: '',
            callback: element => {
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
            }
        }
    ];

    //The menu that will be opened when a favorited item is right clicked.
    itemContextMenuFavorite = [
        {
            name: ` <div style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-edit"></i>
                        &nbsp;
                        <p class="context-text">Edit Item</p>
                    </div>
                    <hr/>`,
            icon: '',
            callback: element => {
                const item = this.actor.getEmbeddedDocument("Item", element.data("item-id"));
                item.sheet.render(true);
            }
        },
        {
            name: ` <div class="context-favorited" style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-bookmark"></i>
                        &nbsp;
                        <p class="context-text">Unfavorite Item</p>
                    </div>`,
            icon: '',
            callback: element => {
                const item = this.actor.getEmbeddedDocument("Item", element.data("item-id"));
                this.actor.updateEmbeddedDocuments("Item", [{_id: element.data("item-id"), system:{favorite: !item.system.favorite}}]);
            }
        },
        {
            name: ` <div class="context-delete" style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-trash"></i>
                        &nbsp;
                        <p class="context-text">Delete Item</p>
                    </div>`,
            icon: '',
            callback: element => {
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
            }
        }
    ];

    //The menu that will be opened when a skill is right clicked.
    skillContextMenu = [
        {
            name: ` <div style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-edit"></i>
                        &nbsp;
                        <p class="context-text">Edit Skill</p>
                    </div>
                    <hr/>`,
            icon: '',
            callback: element => {
                const item = this.actor.getEmbeddedDocument("Item", element.data("item-id"));
                item.sheet.render(true);
            }
        },
        {
            name: ` <div class="context-delete" style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-trash"></i>
                        &nbsp;
                        <p class="context-text">Delete Skill</p>
                    </div>`,
            icon: '',
            callback: element => {
                this.actor.deleteEmbeddedDocuments("Item", [element.data("item-id")]);
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
        html.find('.item-clickable').on("click", async (event) => {
            event.preventDefault();
            const item = this.actor.getEmbeddedDocument("Item", event.currentTarget.dataset.itemId);
            item.system.expanded = item.system.expanded === null ? false : item.system.expanded;
            this.actor.updateEmbeddedDocuments("Item", [{_id: event.currentTarget.dataset.itemId, system:{expanded: !item.system.expanded}}]);
        });

        html.find('.item-image-clickable').on("click", this._onItemUse.bind(this));

        //Adding context menu when skills or items are right clicked.
        new ContextMenu(html, '.skill-choice', this.skillContextMenu);
        new ContextMenu(html, '.item-choice-regular', this.itemContextMenu);
        new ContextMenu(html, '.item-choice-favorite', this.itemContextMenuFavorite);
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

        //Creating variables which will be used on the inventory tab to determine which sections should be displayed.
        context.system.hasItems = this.actor.itemTypes.item.length > 0;
        context.system.hasWeapons = this.actor.itemTypes.weapon.length > 0;
        context.system.hasArmor = this.actor.itemTypes.armor.length > 0;

        //Creating an array which contains all of the items which have been favorited.
        context.system.favoriteItems = {};
        context.system.favoriteItems.armor = this.actor.itemTypes.armor.filter(item => item.system.favorite === true);
        context.system.favoriteItems.item = this.actor.itemTypes.item.filter(item => item.system.favorite === true);
        context.system.favoriteItems.weapon = this.actor.itemTypes.weapon.filter(item => item.system.favorite === true);

        //Creating booleans which will be used by handelbars to determine if item lists should be displayed.
        context.system.favoriteItems.hasArmor = context.system.favoriteItems.armor.length > 0;
        context.system.favoriteItems.hasItem = context.system.favoriteItems.item.length > 0;
        context.system.favoriteItems.hasWeapon = context.system.favoriteItems.weapon.length > 0;

        //Creating a rankString varaible which does not shows a - instead of -1 for skill level.
        for(let i=0; i<this.actor.itemTypes.skill.length; i++){
            this.actor.itemTypes.skill[i].system.rankString = this.actor.itemTypes.skill[i].system.rank.toString();
            if(this.actor.itemTypes.skill[i].system.rankString === "-1"){
                this.actor.itemTypes.skill[i].system.rankString = "-";
            }
        }

        //Creating an attack bonus variable and a damage variable on weapons.
        for(let i=0; i<this.actor.itemTypes.weapon.length; i++){
            let weapon = this.actor.itemTypes.weapon[i];
            let skill = this.actor.getEmbeddedDocument("Item", weapon.system.skill);
            let skillPunchMod = 0;

            //The attribute bonus is the better of the two listed attribute modifiers.
            let attributeBonus = this.actor.system.stats[weapon.system.stat].mod;
            if(weapon.system.secondStat !== "none"){
                attributeBonus = Math.max(attributeBonus, this.actor.system.stats[weapon.system.secondStat].mod);
            }

            //If the skill is set, then the rank will be used, if the skill is unset, then the rank is 0.
            if(typeof skill === "undefined"){
                skill = {system:{rank:0}};
            }else{
                //Punch attacks add their skill modifier to the damage roll.
                if (skill.name === "Punch" || skill.name === "punch"){
                    skillPunchMod = skill.system.rank;
                }

                //If an attack skill is untrained, the character takes -2 instead of just -1 to hit.
                if (skill.rank == -1){
                    skill.rank = -2;
                }
            }

            //Calculating the weapon attack bonus, and adding a + sign in front of the string if needed.
            let fullBonusInt = this.actor.system.ab + weapon.system.ab + skill.system.rank + attributeBonus;
            let fullBonusString = fullBonusInt >= 0 ? "+" + String(fullBonusInt) : fullBonusInt;

            //Calculating the weapon damage, and adding a + sign in front of the string if needed.
            let fullDamageInt = skillPunchMod + attributeBonus;
            let fullDamageString = fullDamageInt >= 0 ? "+" + String(fullDamageInt) : fullDamageInt;

            this.actor.itemTypes.weapon[i].system.fullAttackBonus = fullBonusString;
            this.actor.itemTypes.weapon[i].system.fullDamage = weapon.system.damage + fullDamageString;
        }

        //Deleting items that aren't allowed on the sheet, and warning the user about it.
        for(let i=0; i<context.items.length; i++){
            let itemType = context.items[i].type;
            if(itemType !== "skill" && itemType !== "weapon" && itemType !== "armor" && itemType !== "item"){
                ui.notifications.error("[" + context.items[i].name + "] is not allowed on this sheet and was removed.");
                this.actor.deleteEmbeddedDocuments("Item", [context.items[i]._id]);
            }
        }

        //Determines if the add skills buttons should be displayed.
        if(!context.system.xIsLocked || (this.actor.itemTypes.skill.length == 0 && context.owner)){
            context.system.displayAddSkillButtons = true;
        }else{
            context.system.displayAddSkillButtons = false;
        }

        //Returning the newly parsed context.
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

    //Called when an item's image is clicked. (When the item should be used).
    async _onItemUse(event){
        event.preventDefault();

        //Getting the button that was pressed.
        const item = this.actor.getEmbeddedDocument("Item", event.currentTarget.dataset.itemId);

        console.log(item);

        //Creating an html template from the dialog.
        let templateContent = await renderTemplate("modules/xanders-swnr-sheet/scripts/templates/chats/item-card-chat.html", item);

        //Creating a chat message once the settings are all changed.
        const chatMessageData = {
            content: templateContent,
            speaker: {actor: this.actor.id},
            isOwner: true
        };

        ChatMessage.create(chatMessageData);

        await getDocumentClass("ChatMessage").applyRollMode(chatMessageData, game.settings.get("core", "rollMode"));
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
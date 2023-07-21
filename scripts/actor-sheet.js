// Implements all of the important functionality for the new actor sheets.
import { initSkills, toTitleCase, useItem, generateRoll} from "./utils.js";

export class XandersSwnActorSheet extends ActorSheet {

    //The menu that will be opened when an item is right clicked.
    itemContextMenu = [
        {
            name: ` <div style="display:flex; flex-direction:row; align-items:center;">
                        <i class="context-image fas fa-edit"></i>
                        &nbsp;
                        <p class="context-text">Edit Item</p>
                    </div>`,
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
                    </div>`,
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
                    </div>`,
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
        //console.log(context);
    
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
        //Makes the item lists and adds the hasItem booleans.
        context.system.favoriteItems = {};
        context.system.itemTypes = {};
        Object.keys(context.actor.itemTypes).forEach(key => {
            let uppercaseKey = key.charAt(0).toUpperCase() + key.slice(1);

            //Sorting the items
            context.system.itemTypes[key] = context.actor.itemTypes[key].sort((item1, item2) => {
                if(item1.sort < item2.sort){ 
                    return -1;
                }else if (item1.sort > item2.sort){
                    return 1;
                }
                return 0;
            });

            //Adding a hasType boolean field indicating if the character sheet contains each type of item.
            context.system["has" + uppercaseKey] = context.system.itemTypes[key].length > 0;

            //Adding an array with the favorited items of every type.
            context.system.favoriteItems[key] = context.system.itemTypes[key].filter(item => item.system.favorite === true);

            //Adding a hasFavoriteType boolean field indicating if the character sheet cotains favorited items of each type.
            context.system.favoriteItems["has" + uppercaseKey] = context.system.favoriteItems[key].length > 0;
        });

        //Creating a rankString varaible which shows a - instead of -1 on skill items.
        for(let i=0; i<context.system.itemTypes.skill.length; i++){
            context.system.itemTypes.skill[i].system.rankString = context.system.itemTypes.skill[i].system.rank.toString();
            if(context.system.itemTypes.skill[i].system.rankString === "-1"){
                context.system.itemTypes.skill[i].system.rankString = "-";
            }
        }

        //Creating an attack bonus variable and a damage variable on weapons.
        for(let i=0; i<context.system.itemTypes.weapon.length; i++){
            let weapon = context.system.itemTypes.weapon[i];
            let skill = context.actor.getEmbeddedDocument("Item", weapon.system.skill);
            let skillPunchMod = 0;
            let skillMod = -2;

            //The attribute bonus is the better of the two listed attribute modifiers.
            let attributeBonus = context.actor.system.stats[weapon.system.stat].mod;
            if(weapon.system.secondStat !== "none"){
                attributeBonus = Math.max(attributeBonus, context.actor.system.stats[weapon.system.secondStat].mod);
            }

            //If the skill is set, then the rank will be used, if the skill is unset, then the rank is 0.
            if(typeof skill != "undefined"){
                //Punch attacks add their skill modifier to the damage roll.
                if (skill.name === "Punch" || skill.name === "punch"){
                    skillPunchMod = skill.system.rank;
                }

                //If an attack skill is untrained, the character takes -2 instead of just -1 to hit.
                if (skill.system.rank != -1){
                    skillMod = skill.system.rank;
                }
            }

            //Calculating the weapon attack bonus, and adding a + sign in front of the string if needed.
            let fullBonusInt = context.actor.system.ab + weapon.system.ab + skillMod + attributeBonus;
            let fullBonusString = fullBonusInt >= 0 ? "+" + String(fullBonusInt) : fullBonusInt;

            //Calculating the weapon damage, and adding a + sign in front of the string if needed.
            let fullDamageInt = skillPunchMod + attributeBonus;
            let fullDamageString = fullDamageInt >= 0 ? "+" + String(fullDamageInt) : fullDamageInt;

            //Adding the damage and attack bonus string to the sheet.
            let itemId = context.system.itemTypes.weapon[i].id;
            this.actor.getEmbeddedDocument("Item", itemId).update({system:{
                                                                            fullAttackBonus: fullBonusString,
                                                                            fullDamage: weapon.system.damage + fullDamageString,
                                                                            damageBonus: fullDamageString
                                                                        }});
        }

        //Adds a level string and alternate description string to foci items.
        for(let i=0; i<context.system.itemTypes.focus.length; i++){
            //Setting the item to use the system.details field instead of system.description for summaries and chat cards.
            context.system.itemTypes.focus[i].system.usingDetails = true;

            //Adding a levelString field to the item data for display in the item details.
            context.system.itemTypes.focus[i].system.levelString = context.system.itemTypes.focus[i].system.level === "" ? "None" : context.system.itemTypes.focus[i].system.level;

            context.system.itemTypes.focus[i].system.details = "<b><u>Description: </u></b>" + context.system.itemTypes.focus[i].system.description;

            if(context.system.itemTypes.focus[i].system.level !== ""){
                context.system.itemTypes.focus[i].system.details = context.system.itemTypes.focus[i].system.details + "<p></p><b><u>Level 1: </u></b>" + context.system.itemTypes.focus[i].system.level1;

                if(context.system.itemTypes.focus[i].system.level !== "1"){
                    context.system.itemTypes.focus[i].system.details = context.system.itemTypes.focus[i].system.details + "<p></p><b><u>Level 2: </u></b>" + context.system.itemTypes.focus[i].system.level2;
                }
            }
        }

        //Adds an alternate description string to cyberware items.
        for(let i=0; i<context.system.itemTypes.cyberware.length; i++){
            //Setting the item to use the system.details field instead of system.description for summaries and chat cards.
            context.system.itemTypes.cyberware[i].system.usingDetails = true;

            context.system.itemTypes.cyberware[i].system.details = "<b><u>Description: </u></b>" + context.system.itemTypes.cyberware[i].system.description + "<p></p><b><u>Effect: </u></b>" + context.system.itemTypes.cyberware[i].system.effect;
        }

        //Deleting items that aren't allowed on the sheet, and warning the user about it.
        for(let i=0; i<context.items.length; i++){
            let itemType = context.items[i].type;
            if(itemType !== "skill" && itemType !== "weapon" && itemType !== "armor" && itemType !== "item" && itemType !== "power"
                && itemType !== "cyberware" && itemType !== "focus" && itemType !== "class"){
                ui.notifications.error("[" + context.items[i].name + "] is not allowed on this sheet and was removed.");
                this.actor.deleteEmbeddedDocuments("Item", [context.items[i]._id]);
            }
        }

        //Determines if the add skills buttons should be displayed.
        if(!context.system.xIsLocked || (context.system.itemTypes.skill.length == 0 && context.owner)){
            context.system.displayAddSkillButtons = true;
        }else{
            context.system.displayAddSkillButtons = false;
        }

        //Returning the newly parsed context.
        return context;
    }

    //Called when an item is drag n' dropped on the sheet.
    _onSortItem(event, itemData){
        //Getting a list of all the items of the same type.
        const source = this.actor.getEmbeddedDocument("Item", itemData._id);
        const siblings = this.actor.items.filter(i => {
            return (i.type === source.type) && (i._id !== source._id);
        });

        //Getting the target (the item that was dropped on to).
        const dropTarget = event.target.closest(".item[data-item-id]");
        const targetId = dropTarget ? dropTarget.dataset.itemId : null;
        const target = siblings.find(s => s.data._id === targetId);

        //Ensuring that we are sorting items of the same type.
        if (!target || (source.type !== target.type)) return;

        //Sorting the items.
        const sortUpdates = SortingHelpers.performIntegerSort(source, {target:target, siblings:siblings});
        const updateData = sortUpdates.map(u => {
            const update = u.update;
            update._id = u.target.data._id;
            return update;
        });

        this.actor.updateEmbeddedDocuments("Item", updateData);
    }

    //Called when one of the three saving throw buttons is pressed.
    async _onSaveThrow(event){
        //Getting the type of saving throw. 'evasion', 'mental', or 'physical'.
        event.preventDefault();
        const saveType = event.currentTarget.dataset.saveType;

        //Opening a dialog to prompt the player to add modifiers etc.
        let saveData = await _saveThrowDialog(saveType);

        //If the dialog was canceled(closed) the roll needs cancelled.
        if(saveData.cancelled) return;

        //Adding data to the saving throw.
        saveData.target = this.actor.system.save[saveType];

        //Getting the roll data results.
        let rollMessage = await generateRoll("1d20", saveData, this);

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
        let rollMessage = await generateRoll(checkData.pool, checkData, this);

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

        useItem(item, this.actor.id);
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
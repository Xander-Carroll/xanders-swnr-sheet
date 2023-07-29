// Implements all of the important functionality for the new actor sheets.
import { initSkills, useItem, makeSavingThrow, makeSkillCheck, calculateBarPercentage} from "./utils.js";

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

    //These values will determine what fields are shown in the player's inventory for differnt item types.
    inventoryDisplayFields = {
        armor: {
            encumbrance: true,
            tl: true,
            quantity: true
        },
        class: {
            class: true,
            source: true
        },
        cyberware: {
            disabled: true,
            strain: true,
            tl: true
        },
        focus: {
            source: true,
            level: true
        },
        item: {
            encumbrance: true,
            tl: true,
            quantity: true
        },
        power: {
            effort: true,
            source: true
        },
        weapon: {
            encumbrance: true,
            ammo: true,
            tl: true,
            quantity: true
        }
    };

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

        //When an inventory item has the reload button pressed.
        html.find('.item-reload-button').on("click", this._onReloadButton.bind(this));

        //When one of the buttons on the player's portrait are pressed.
        html.find('.portrait-button').on("click", this._onPortraitButton.bind(this));

        //If a saving throw button is clicked, a save dialog is opened.
        html.find('.save-throw-button').on("click", this._onSaveThrow.bind(this));

        //If a skill is clicked a skill check dialog is opened.
        html.find('.skill-clickable').on("click", this._onSkillCheck.bind(this));

        //If the add skill buttons are clicked.
        html.find('.add-skill-clickable').on("click", this._onSkillAdd.bind(this));

        //If an item is clicked.
        html.find('.item-clickable').on("click", this._onItemExpand.bind(this));

        //When an inventory item's portrait image is clicked.
        html.find('.item-image-clickable').on("click", this._onItemUse.bind(this));

        //When an item's quantity input is changed.
        html.find('.inventory-quantity input').on("change", this._onItemQuantityChange.bind(this));

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

        if(context.actor.type != "character") return;

        //Force locks the sheet if the viewer is not an owner and adds the value to the context.
        context.system.xIsLocked = this.actor.system.xIsLocked || !context.owner;

        //Modifies the context into something that is more readable by handelbars.
        context = this._parseItemData(context);
        context = this._parseActorData(context);

        //Uncomment this line to see what data can be accsessed in the handelbars sheet.
        //console.log(context);
    
        return context;
    }

    //Will edit context.sytem to format the actor data in a way that is better suited for handelbars.
    _parseActorData(context){
        //Adding a variable that will be used to set the health-bar width to the context.
        const health = context.system.health;
        context.system.health.percentage = calculateBarPercentage(health.value, health.max);
    
        //Adding a variable that will be used to set the strain-bar width to the context.
        const strain = context.system.systemStrain;
        context.system.systemStrain.percentage = calculateBarPercentage(strain.value, strain.max);

        //Adding a variable that will be used to set the expierence-bar width to the context.
        const level = context.system.level;
        context.system.level.percentage = calculateBarPercentage(level.exp, level.expToLevel);

        //Adding a variable that will be used to set the encumbrance-bar widths to the context.
        const encumbrance = context.system.encumbrance;
        context.system.encumbrance.ready.percentage = calculateBarPercentage(encumbrance.ready.value, encumbrance.ready.max);
        context.system.encumbrance.stowed.percentage = calculateBarPercentage(encumbrance.stowed.value, encumbrance.stowed.max);

        //Creating a string that will dispaly attribute modifiers with a + or -
        for(let i=0; i<6; i++){
            //The identifier "str", "dex", "con", etc.
            let attributeString = Object.keys(context.system.stats)[i]; 

            //Adds a new variable modString to each stat which contains the modifier as it should be displayed on the character sheet.
            context.system.stats[attributeString].modString = context.system.stats[attributeString].mod >= 0 ? "+" + context.system.stats[attributeString].mod : context.system.stats[attributeString].mod;

            this.actor.update({system: {stats: context.system.stats}});
        }

        //Adding the inventoryDisplayFields property to the context.
        context.system.inventoryDisplayFields = this.inventoryDisplayFields;

        //Determines if the add skills buttons should be displayed.
        if(!context.system.xIsLocked || (context.system.itemTypes.skill.length == 0 && context.owner)){
            context.system.displayAddSkillButtons = true;
        }else{
            context.system.displayAddSkillButtons = false;
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

        //Parsing Skill Items
        for(let i=0; i<context.system.itemTypes.skill.length; i++){
            context.system.itemTypes.skill[i].system.rankString = context.system.itemTypes.skill[i].system.rank.toString();
            if(context.system.itemTypes.skill[i].system.rankString === "-1"){
                context.system.itemTypes.skill[i].system.rankString = "-";
            }
        }

        //Parsing Weapon Items
        for(let i=0; i<context.system.itemTypes.weapon.length; i++){
            let weapon = context.system.itemTypes.weapon[i];
            let skill = context.actor.getEmbeddedDocument("Item", weapon.system.skill);
            let skillPunchMod = 0;
            let skillMod = -2;
            let skillModString = 0;

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

                skillModString = skill.system.rank.toString();
                if(skillModString.charAt(0) != '-') skillModString = "+" + skillModString;

                //If an attack skill is untrained, the character takes -2 instead of just -1 to hit.
                if (skill.system.rank != -1){
                    skillMod = skill.system.rank;
                }
            }

            let currentSave = context.system.itemTypes.weapon[i].system.save;
            if (currentSave && currentSave != "") context.system.itemTypes.weapon[i].system.saveString = currentSave.charAt(0).toUpperCase() + currentSave.slice(1);

            //Calculating the weapon attack bonus, and adding a + sign in front of the string if needed.
            let fullBonusInt = context.actor.system.ab + weapon.system.ab + skillMod + attributeBonus;
            let fullBonusString = fullBonusInt >= 0 ? "+" + String(fullBonusInt) : fullBonusInt;

            //Calculating the weapon damage, and adding a + sign in front of the string if needed.
            let fullDamageInt = skillPunchMod + attributeBonus;
            let fullDamageString = fullDamageInt >= 0 ? "+" + String(fullDamageInt) : fullDamageInt;

            //Adding the damage and attack bonus string to the sheet.
            let itemExtraData = {
                fullAttackBonus: fullBonusString,
                fullDamage: weapon.system.damage + fullDamageString,
                damageBonus: fullDamageString,
                skillMod: skillModString
            }

            let itemId = context.system.itemTypes.weapon[i].id;
            this.actor.getEmbeddedDocument("Item", itemId).update({system:itemExtraData});
        }

        //Parsing Focus Items
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

        //Parsing Cyberware Items
        for(let i=0; i<context.system.itemTypes.cyberware.length; i++){
            //Setting the item to use the system.details field instead of system.description for summaries and chat cards.
            context.system.itemTypes.cyberware[i].system.usingDetails = true;
            context.system.itemTypes.cyberware[i].system.details = "<b><u>Description: </u></b>" + context.system.itemTypes.cyberware[i].system.description + "<p></p><b><u>Effect: </u></b>" + context.system.itemTypes.cyberware[i].system.effect;
            
            if (!context.system.itemTypes.cyberware[i].system.disabled) context.system.itemTypes.cyberware[i].system.location = "readied";

            if (context.system.itemTypes.cyberware[i].system.disabled){
                context.system.systemStrain.cyberware = context.system.systemStrain.cyberware - context.system.itemTypes.cyberware[i].system.strain;
                context.system.systemStrain.max = context.system.systemStrain.max + context.system.itemTypes.cyberware[i].system.strain;
            } 
        }

        //Parsing Power Items
        for(let i=0; i<context.system.itemTypes.power.length; i++){
            if (context.system.itemTypes.power[i].system.prepared) context.system.itemTypes.power[i].system.location = "readied";

            let currentEffort = context.system.itemTypes.power[i].system.effort;
            if (currentEffort && currentEffort != "") context.system.itemTypes.power[i].system.effortString = currentEffort.charAt(0).toUpperCase() + currentEffort.slice(1);

            let currentSave = context.system.itemTypes.power[i].system.save;
            if (currentSave && currentSave != "") context.system.itemTypes.power[i].system.saveString = currentSave.charAt(0).toUpperCase() + currentSave.slice(1);

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

    //Called when an inventory item's reload button is pressed.
    async _onReloadButton(event){
        event.preventDefault();

        //Getting the weapon that needs reloaded.
        const weaponId = event.currentTarget.dataset.itemId;
        const weapon = this.actor.getEmbeddedDocument("Item", weaponId);

        //Updating the weapon ammo properties.
        let updateData = {system: {ammo: {value: Math.max(weapon.system.ammo.value, weapon.system.ammo.max)}}};
        weapon.update(updateData);

        //Warning the user if they are reloading a full weapon.
        if(weapon.system.ammo.value >= weapon.system.ammo.max){
            ui.notifications.warn("You just reloaded a weapon that was already full!");
        }

        //Sets the basic information needed for the chat message.        
        let messageData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker({actor:this.actor}),
            flavor: this.actor.name + " reloaded " + weapon.name,
            content: updateData.system.ammo.value.toString() + "/" + weapon.system.ammo.max.toString() + " in magazine."
        };

        //Adds "Long Reload" text to apropriate weapons.
        if(weapon.system.ammo.longReload) messageData.content = "<p><b>Long Reload</b></p>" + messageData.content;

        // Creates the chat message with the given data.
        let message = await getDocumentClass("ChatMessage").create(messageData);

        //Changes the roll mode of the chat message.
        await getDocumentClass("ChatMessage").applyRollMode(messageData, game.settings.get("core", "rollMode"));
        await message.update(messageData);
    }

    //Called when one of the buttons on the player's portrait are clicked.
    async _onPortraitButton(event){
        event.preventDefault();
        const type = event.currentTarget.dataset.type;

        console.log(type);
    }

    //Called when one of the three saving throw buttons is pressed.
    async _onSaveThrow(event){
        //Getting the type of saving throw. 'evasion', 'mental', or 'physical'.
        event.preventDefault();
        const saveType = event.currentTarget.dataset.saveType;

        makeSavingThrow(this.actor._id, saveType);
    }

    //Called when a skill from the attributes tab is clicked.
    async _onSkillCheck(event){
        event.preventDefault();
        const itemId = event.currentTarget.dataset.itemId;

        makeSkillCheck(this.actor._id, itemId)
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

        useItem(this.actor.id, item);
    }

    //Called when the title of an inventory item is clicked.
    async _onItemExpand(event){
        event.preventDefault();
        
        if(event.currentTarget.classList.contains('unclickable')) return;

        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.getEmbeddedDocument("Item", itemId);

        // Toggles the body of the item between visible and hidden.
        const body = $(event.currentTarget).closest('.inventory-item').children('.inventory-item-body')[0];
        if(body.classList.contains("undisplayed")){
            body.classList.remove("undisplayed");
        }else{
            body.classList.add("undisplayed");
        }

        event.currentTarget.classList.add("unclickable");

        //Waits for the animation to finish playing, and then updates the sheet.
        setTimeout(()=>{
            item.update({system:{expanded: !item.system.expanded}});
        }, 300);
    }

    //Called when an items quantity input is changed.
    async _onItemQuantityChange(event){
        event.preventDefault();

        //Getting the input field so that the size of the input can be resized.
        let input = event.currentTarget;

        //Getting the item object and updating it.
        this.actor.getEmbeddedDocument("Item", input.dataset.itemId).update({system:{quantity: parseInt(input.value)}});
    }

    //@override
    get template() {
        return `modules/xanders-swnr-sheet/scripts/templates/actors/actor-${this.actor.type}-sheet.html`;
    }

}
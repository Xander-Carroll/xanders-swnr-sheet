// Implements all of the important functionality for the new actor sheets.
import { initSkills, useItem, makeSavingThrow, makeSkillCheck, makeMoraleCheck, calculateBarPercentage, generateRoll} from "./utils.js";

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
                        <p class="context-text">Edit Item</p>
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
                        <p class="context-text">Delete Item</p>
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
            quantity: true,
            location: true
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
        edge: {
            source: true
        },
        focus: {
            source: true,
            level: true
        },
        item: {
            encumbrance: true,
            tl: true,
            quantity: true,
            location: true
        },
        power: {
            effort: true,
            source: true
        },
        weapon: {
            encumbrance: true,
            ammo: true,
            tl: true,
            quantity: true,
            location: true
        }
    };

    //These values will determine what item types are allowed on what actors.
    allowedItems = {
        character: {
            class: true,
            armor: true,
            weapon: true,
            power: true,
            focus: true,
            item: true,
            cyberware: true,
            skill: true,
            shipWeapon: false,
            shipDefense: false,
            shipFitting: false,
            asset: false,
            edge: true,
            program: false
        },
        npc: {
            class: false,
            armor: true,
            weapon: true,
            power: true,
            focus: true,
            item: true,
            cyberware: true,
            skill: false,
            shipWeapon: false,
            shipDefense: false,
            shipFitting: false,
            asset: false,
            edge: false,
            program: false
        },
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

        if(this.actor.type == "character"){
            //When an inventory item has the favorite button pressed.
            html.find('.item-bookmark-button').on("click", this._onBookmarkButton.bind(this));

            //If a skill level up button is pressed.
            html.find('.skill-level-button').on("click", this._onSkillLevelUp.bind(this));

            //If the add skill buttons are clicked.
            html.find('.add-skill-clickable').on("click", this._onSkillAdd.bind(this));
        }else if(this.actor.type === "npc"){
            //When an NPC's morale button is clicked.
            html.find('.morale-clickable').on("click", this._onMoraleCheck.bind(this));

            //Called when an NPC's hit dice are changed.
            html.find('.hit-dice-input').on("change", this._onHitDiceStringChange.bind(this));
        }

        //If the lock button is clicked, the sheet lock is toggeled.
        html.find('.lock-button').click(async (event) => {
            this.actor.update({"system.xIsLocked": !this.actor.system.xIsLocked});
        });

        //If a skill is clicked a skill check dialog is opened.
        html.find('.skill-clickable').on("click", this._onSkillCheck.bind(this));

        //When an inventory item has the reload button pressed.
        html.find('.item-reload-button').on("click", this._onReloadButton.bind(this));

        //When an inventory item has the location button pressed.
        html.find('.item-location-button').on("click", this._onLocationButton.bind(this));

        //When an inventory item has the edit button pressed.
        html.find('.item-edit-button').on("click", this._onItemEditButton.bind(this));

        //When one of the buttons on the player's portrait are pressed.
        html.find('.portrait-button').on("click", this._onPortraitButton.bind(this));

        //If a saving throw button is clicked, a save dialog is opened.
        html.find('.save-throw-button').on("click", this._onSaveThrow.bind(this));

        //If an item is clicked.
        html.find('.item-clickable').on("click", this._onItemExpand.bind(this));

        //When an inventory item's portrait image is clicked.
        html.find('.item-image-clickable').on("click", this._onItemUse.bind(this));

        //When an item's quantity input is changed.
        html.find('.inventory-quantity input').on("change", this._onItemQuantityChange.bind(this));

        //Called when HP, Strain, or Money values are updated.
        html.find('.health-input.current-value, .strain-input.current-value, .money-container input.xanders-input, .xp-input.current-value').on("change", this._onLazyCalculation.bind(this));

        //Adding context menu when skills or items are right clicked.
        if(this.actor.type === "character"){
            new ContextMenu(html, '.skill-choice', this.skillContextMenu);
            new ContextMenu(html, '.item-choice-regular', this.itemContextMenu);
            new ContextMenu(html, '.item-choice-favorite', this.itemContextMenuFavorite);
        }else{
            new ContextMenu(html, '.item-choice-regular, .item-choice-favorite', this.skillContextMenu);
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

        //Creates a bioLabel variable on the actor if it does not have one.
        if(this.actor.system.bioLabel == null){
            this.actor.system.bioLabel = "Biography";
        }

        if(context.actor.type !== "character" && context.actor.type !== "npc") return context;

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

        //Adding a variable that will be used to set the effort-bar width to the context.
        const effort = context.system.effort;
        context.system.effort.percentage = calculateBarPercentage(effort.value, effort.max);

        //Adding the inventoryDisplayFields property to the context.
        context.system.inventoryDisplayFields = this.inventoryDisplayFields;

        //Adds a field to determine if the actor is linked or unlinked.
        context.system.actorLink = this.actor.token?.actorLink ?? true;

        //Parsing data based on the kind of sheet that is open.
        if(this.actor.type == "character") context = this._parseCharacterActorData(context);
        if(this.actor.type == "npc") context = this._parseNpcActorData(context);

        return context;
    }

    //Called from the _parseActorData function if the actor type is "character".
    _parseCharacterActorData(context){
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
        context.system.encumbrance.ready.over = encumbrance.ready.value > encumbrance.ready.max;
        context.system.encumbrance.stowed.over = encumbrance.stowed.value > encumbrance.stowed.max;

        //Determines if the portrait button should be glowing.
        context.system.canLevelUp = context.system.level.value > context.system.health_max_modified;

        //Creating a string that will dispaly attribute modifiers with a + or -
        for(let i=0; i<6; i++){
            //The identifier "str", "dex", "con", etc.
            let attributeString = Object.keys(context.system.stats)[i]; 
        
            //Adds a new variable modString to each stat which contains the modifier as it should be displayed on the character sheet.
            context.system.stats[attributeString].modString = context.system.stats[attributeString].mod >= 0 ? "+" + context.system.stats[attributeString].mod : context.system.stats[attributeString].mod;
        }

        //Determines if the add skills buttons should be displayed.
        if(!context.system.xIsLocked || (context.system.itemTypes.skill.length == 0 && context.owner)){
            context.system.displayAddSkillButtons = true;
        }else{
            context.system.displayAddSkillButtons = false;
        }

        return context;
    }

    //Called from the _parseActorData function if the actor type is "npc".
    _parseNpcActorData(context){
        //Calculation for saving throws: context.system.saves = 15 - Math.floor(context.system.hitDice/2);
        context.system.skillBonusModString = context.system.skillBonus >= 0 ? "+" + context.system.skillBonus : context.system.skillBonus;

        return context;
    }

    //Will edit context.items to format the items in a way that is better suited for handelbars.
    _parseItemData(context){
        //Deleting items that aren't allowed on the sheet, and warning the user about it.
        for(let i=0; i<context.items.length; i++){
            let itemType = context.items[i].type;

            if(this.allowedItems[this.actor.type][itemType] === false){
                ui.notifications.error("[" + context.items[i].name + "] is not allowed on this sheet and was removed.");
                this.actor.deleteEmbeddedDocuments("Item", [context.items[i]._id]);
            }
        }

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
            if(this.actor.type !== "character") break;

            let currentSave = context.system.itemTypes.weapon[i].system.save;
            if (currentSave && currentSave != "") context.system.itemTypes.weapon[i].system.saveString = currentSave.charAt(0).toUpperCase() + currentSave.slice(1);
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
            context.system.itemTypes.cyberware[i].system.details = "<b><u>Description:</u></b> " + context.system.itemTypes.cyberware[i].system.description + "<p></p><b><u>Effect:</u></b> " + context.system.itemTypes.cyberware[i].system.effect;
            
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

    //Called when an inventory item's location button is pressed.
    async _onLocationButton(event){
        event.preventDefault();
        
        //Getting the item that needs its location changed.
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.getEmbeddedDocument("Item", itemId);

        //Toggling the item's location.
        var location = "readied";
        if(item.system.location === "readied") location = "stowed";
        if(item.system.location === "stowed") location = "other";

        //Updating the item properties.
        let updateData = {system: {location: location}};
        item.update(updateData);
    }

    //Called when an inventory item's edit button is pressed.
    async _onItemEditButton(event){
        event.preventDefault();
        
        //Getting the item that needs its location changed.
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.getEmbeddedDocument("Item", itemId);

        //Opening the item sheet.
        item.sheet.render(true);
    }

    //Called when an inventory item's bookmark button is pressed.
    async _onBookmarkButton(event){
        event.preventDefault();
        
        //Getting the item that needs its favorite status changed.
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor.getEmbeddedDocument("Item", itemId);

        //Updating the item properties.
        let updateData = {system: {favorite: !item.system.favorite}};
        item.update(updateData);
    }

    //Called when one of the buttons on the player's portrait are clicked.
    async _onPortraitButton(event){
        event.preventDefault();
        const type = event.currentTarget.dataset.type;

        if(type==="rest"){
            let applyChanges = false, scene = false, night = false;

            new Dialog({
                title: `Rest: ` + this.actor.name,
                content: `
                  <form>
                    <p>What kind of rest would you like to perform?</p>
                    <p>HP, strain, and effort will be adjusted as needed.</p>
                  </form>
                  `,
                buttons: {
                  scene: {
                    icon: "<i class='fas fa-hourglass-end'></i>",
                    label: `Scene Ended`,
                    callback: () => {scene = true; applyChanges=true;}
                  },
                  night: {
                    icon: "<i class='fas fa-bed'></i>",
                    label: `A Night's Rest`,
                    callback: () => {night = true; applyChanges=true;}
                  },
                },
                close: html => {
                    if (applyChanges) {
                        var chatContent = "";

                        //If the scene rest button was clicked, then the scene effort is reset.
                        if(scene){
                            this.actor.update({system:{effort:{scene:0}}});
                            chatContent = `<p>${this.actor.name} finished a scene rest.</p>`;

                        //If the night's rest button was clicked, then HP, Strain, and Effort are changed.
                        }else if(night){
                            const newStrain = Math.max(this.actor.system.systemStrain.value - 1, 0);
                            const hpRestored = (this.actor.type === "character") ? this.actor.system.level.value : this.actor.system.hitDice;
                            const newHP = Math.min(this.actor.system.health.value + hpRestored, this.actor.system.health.max);

                            this.actor.update({system:{
                                systemStrain:{value:newStrain},
                                health:{value:newHP},
                                effort:{scene:0,day:0},
                            }});

                            chatContent = `<p>${this.actor.name} finished a night's rest.</p>`
                        }

                        //Creating a chat message that says the actor rested.
                        ChatMessage.create({
                            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                            content: chatContent,
                        });
                    }
                }
            }).render(true);
        }else if(type==="level-up"){

            if(this.actor.system.level.value <= this.actor.system.health_max_modified){
                ui.notifications.warn("Level-Up has already been applied for level " + this.actor.system.level.value + ".");
            }

            var applyChanges = false;
            new Dialog({
                title: `Roll HP For Level ${this.actor.system.level.value}?`,
                content: `
                  <form>
                    <p>Are you sure you want to roll HP for level ${this.actor.system.level.value}?</p>
                  </form>
                  `,
                buttons: {
                  yes: {
                    icon: "<i class='fas fa-check'></i>",
                    label: `Reroll HP`,
                    callback: () => applyChanges = true
                  },
                  no: {
                    icon: "<i class='fas fa-times'></i>",
                    label: `Cancel`
                  },
                },
                default: "no",
                close: async html => {
                    if (applyChanges) {
                        const currentHp = this.actor.system.health.max;
                        const level = this.actor.system.level.value;

                        const seperator = (this.actor.system.stats.con.mod < 0) ? "" : "+";
                        const perLevel = `max(${this.actor.system.hitDie} ${seperator} ${this.actor.system.stats.con.mod}, 1)`;

                        const formulaArray = Array(level).fill(perLevel);
                        const formula = formulaArray.join("+");


                        let rollMessage = await generateRoll(formula, {rollMode: "CURRENT"}, this);

                        //Cancelling the roll if the user used an invalid modifier.
                        if (rollMessage.error){
                            return;
                        }
                    
                        //Variables for later.
                        var newHp = rollMessage.roll._total;
                        var rollElements = $(rollMessage.data.content);

                        //Replcing the ugly roll formula.
                        rollElements.find("div.dice-formula").replaceWith(`<div class="dice-formula">${level} × ${perLevel}</div>`);

                        //If the new roll is lower than the old HP, the chat card needs updated. 
                        if(rollMessage.roll._total <= currentHp && level > 1){
                            const oldRoll = rollElements.find("h4").text();
                            rollElements.find("h4").replaceWith(`<h4 class="dice-total"><s>${oldRoll}</s> → ${currentHp+1}</h4>`);

                            newHp = currentHp+1;
                        }

                        //Adding text to the card.
                        rollMessage.data.content = `<div class="dice-roll">${rollElements.html()}</div>`;
                        rollMessage.data.content = `<p>${this.actor.name} rolled hitpoints for level ${level}!</p>` + rollMessage.data.content;

                        // Creates the chat message with the given data.
                        await getDocumentClass("ChatMessage").create(rollMessage.data);

                        //Updating the actor's HP.
                        this.actor.update({system:{
                            health_max_modified: this.actor.system.health_max_modified ? Math.max(level, this.actor.system.health_max_modified) : level,
                            health: {max: newHp, value: this.actor.system.health.value+(newHp-currentHp)}
                        }});
                    }
                }
            }).render(true);
        }
    }

    //Called when an NPC's rollable morale button is clicked.
    async _onMoraleCheck(event){
        event.preventDefault();

        makeMoraleCheck(this);
    }

    //Called when one of the three saving throw buttons is pressed.
    async _onSaveThrow(event){
        //Getting the type of saving throw. 'evasion', 'mental', 'physical', or 'npc'.
        event.preventDefault();
        const saveType = event.currentTarget.dataset.saveType;

        makeSavingThrow(this, saveType);
    }

    //Called when a skill's level up button is pressed.
    async _onSkillLevelUp(event){
        event.preventDefault();
        
        //Getting the skill that needs leveled.
        const skillId = event.currentTarget.dataset.itemId;
        const skill = this.actor.getEmbeddedDocument("Item", skillId);

        //Making sure the actor is a high enough level to upgrade the skill. 
        const rank = skill.system.rank;
        if (rank > 0) {
            const lvl = this.actor.system.level.value;
            if (rank == 1 && lvl < 3) {
                ui.notifications.warn("Must be at least level 3 to upgrade this skill.");
                return;
            }else if (rank == 2 && lvl < 6) {
                ui.notifications.warn("Must be at least level 6 to upgrade this skill.");
                return;
            }else if (rank == 3 && lvl < 9) {
                ui.notifications.warn("Must be at least level 9 to upgrade this skill.");
                return;
            }else if (rank > 3) {
                ui.notifications.warn("Cannot auto-level this skill above +4.");
                return;
            }
        }

        //Making sure that the actor has enough skill points to upgrade the skill.
        const skillCost = rank + 2;
        const isPsy = skill.system.source.toLocaleLowerCase() ===
            game.i18n.localize("swnr.skills.labels.psionic").toLocaleLowerCase() ? true : false;
        const skillPointsAvail = isPsy ? this.actor.system.unspentPsySkillPoints + this.actor.system.unspentSkillPoints : this.actor.system.unspentSkillPoints;
        if (skillCost > skillPointsAvail) {
            ui.notifications.warn(`Not enough skill points. Have: ${skillPointsAvail}, Need: ${skillCost}`);
            return;
        }else if (isNaN(skillPointsAvail)) {
            ui.notifications.warn("Skill points not set");
            return;
        }

        //Remove the skill points from the actor.
        await skill.update({ "data.rank": rank + 1 });
        if (isPsy) {
            const newPsySkillPoints = Math.max(0, this.actor.system.unspentPsySkillPoints - skillCost);
            let newSkillPoints = this.actor.system.unspentSkillPoints;
            if (skillCost > this.actor.system.unspentPsySkillPoints) {
                //Not enough psySkillPoints, dip into regular
                newSkillPoints -= skillCost - this.actor.system.unspentPsySkillPoints;
            }
            await this.actor.update({
                "system.unspentSkillPoints": newSkillPoints,
                "system.unspentPsySkillPoints": newPsySkillPoints,
            });
            ui.notifications.info(`Removed ${skillCost} skill point(s).`);
        }else{
            const newSkillPoints = this.actor.system.unspentSkillPoints - skillCost;
            await this.actor.update({ "system.unspentSkillPoints": newSkillPoints });
            ui.notifications.info(`Removed ${skillCost} skill point(s)`);
        }

    }

    //Called when a skill from the attributes tab is clicked.
    async _onSkillCheck(event){
        event.preventDefault();
        const itemId = event.currentTarget.dataset.itemId;

        makeSkillCheck(this, itemId)
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

        item.roll(event.shiftKey);
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

    //Called when HP, Strain, or Money are updated.
    async _onLazyCalculation(event){
        event.preventDefault();

        //Getting the name of the property that is being edited, and the value that it was edited to.
        const name = event.currentTarget.dataset.name;
        const value = event.currentTarget.value;
        const keyValues = name.split('.');

        //Becuase the uer can enter any text, they may have entered something stupid.
        let intValue;
        try{
            intValue = eval(value);
        }catch (e){}

        //Getting the value that was there before the new input.
        let oldValue = keyValues.reduce((o,k) => o[k], this.actor.system);

        //Determing if the old value should be used (input was invalid), if the new input should be added, subtracted, or used raw.
        let newValue = oldValue;
        if(value === "0" || intValue === 0 || (value && intValue)){
            const sign = value.charAt(0);

            if(sign === '+' || sign === '-'){
                newValue = oldValue + intValue;
            }else{
                newValue = intValue;
            }
        }

        //Building the new system structure that will be used to update the actor.
        let system = {};
        let currentKey = system;
        for (let i=0; i<keyValues.length; i++){
            if(i < keyValues.length-1){
                currentKey[keyValues[i]] = {};
                currentKey = currentKey[keyValues[i]];
            }else{
                currentKey[keyValues[i]] = newValue;
            }
        }

        //Updating the value to newValue.
        if(newValue != oldValue) this.actor.update({system});
        event.currentTarget.value = newValue;
    }

    //Called when an NPC's hit dice are changed.
    async _onHitDiceStringChange(event){
        event.preventDefault();

        //The value that the hit-dice box was changed to.
        const value = event.currentTarget.value.replace(/\s/g,'');

        //Different formats the string could be in.
        const bothExpression = /^\d+d\d+$/;     //A regular expression that matches both dice and quantity. ex 2d6.
        const quantityExpression = /^\d+$/;     //A regular expression that matches just quantity. ex 6.
        const diceExpression = /^d\d+$/;        //A regular expression that matches just dice type. ex d6.

        //Getting the quantity and type of hit dice.
        var quantity = ["1"];
        var dice = ["d8"];
        if(bothExpression.exec(value) !== null){
            quantity = /^\d+/.exec(value);
            dice = /d\d+$/.exec(value);
        }else if(quantityExpression.exec(value)){
            quantity = /^\d+$/.exec(value);
        }else if(diceExpression.exec(value)){
            dice = /d\d+$/.exec(value);
        }else{
            event.currentTarget.value = this.actor.system.hitDice + this.actor.system.hitDie;
            ui.notifications.warn("Hit dice could not be read.");
            return;
        }

        //Setting the value in the box to the correct format.
        event.currentTarget.value = quantity + dice;

        //Updating the hit dice values on the actor.
        this.actor.update({system:{
            hitDie: dice[0],
            hitDice: Number(quantity[0])
        }});
    }

    //@override
    get template() {
        return `modules/xanders-swnr-sheet/scripts/templates/actors/actor-${this.actor.type}-sheet.html`;
    }

}
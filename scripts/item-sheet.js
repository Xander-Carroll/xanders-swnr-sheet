//Extends the basic ItemSheet with some very simple modifications

import { useItem } from "./utils.js";

export class XandersSwnItemSheet extends ItemSheet {

    //@override
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["xanders-swnr", "xanders-item-sheet"],
            width: 520,
            height: 480,
            tabs: [{ 
                navSelector: ".sheet-tabs", 
                contentSelector: ".item-main-window", 
                initial: "description" 
            }]
        });
    }

    //@override
    activateListeners(html){
        super.activateListeners(html);

        //Return if the player can't edt the sheet.
        if (!this.isEditable) return;

        //If an item is clicked.
        html.find('.item-image-clickable').on("click", this._onItemUse.bind(this));

    }

    //@override
    getData() {
        // Retrieve the data structure from the base sheet.
        const context = super.getData();

        //Creating a more easily accsessed system variable.
        const system = context.item.system;
        context.system = system;
        
        //Uncomment this line to see what data can be accsessed in the handelbars sheet.
        //console.log(context);
    
        //Weapon type is not a property for the core system, so it needs to be added.
        if (context.type === "weapon" && typeof context.system.type === 'undefined'){
            context.system.type = "melee";
        }

        //If the item is in a compendium, its buttons shouldn't be active.
        if(context.item.compendium){
            context.owner = false;
        }

        return context;
    }

    //@override
    get template() {
        return `modules/xanders-swnr-sheet/scripts/templates/items/item-${this.item.type}-sheet.html`;
    }

    //Called when an item's roll symbol is clicked. (When the item should be used).
    async _onItemUse(event){
        event.preventDefault();

        //If the user is not an owner of the item, they shouldn't be abe to roll it.
        if(!this.object.isOwner) return;

        //If the item is an embedded item, use that actor, if it is not an embedded item, use the current token.
        let actor = ChatMessage.getSpeaker().actor;        
        if(this.object.isEmbedded){
            actor = this.actor;
        }
        
        //If the item is not embedded and no token is selected, give a warning.
        if(!actor){
            ui.notifications.warn("You must have a token selected to use this item!");
            return;
        }

        //Use the item with the given actor.
        useItem(this.object, actor);
    }

}
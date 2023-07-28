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
        html.find('.item-image-clickable i').on("click", this._onItemUse.bind(this));

    }

    //@override
    getData() {
        // Retrieve the data structure from the base sheet.
        const context = super.getData();

        //Creating a more easily accsessed system variable.
        const system = context.item.system;
        context.system = system;
        context.type = context.data.type;
    
        //If the item is in a compendium, its buttons shouldn't be active.
        if(!context.item.isEmbedded){
            context.owner = false;
        }

        //Weapon type is not a property for the core system, so it needs to be added.
        if (context.type === "weapon" && typeof context.system.type === 'undefined'){
            context.system.type = "melee";
        }

        //Power Attribute and skillId are not properties of the core syste, and need to be added.
        if(context.type === "power"){
            //The core item sheet should have its skill value matched to update the new item sheet's value.
            if (context.system.skillId && context.system.attribute){
                let newSkill = context.system.attribute + "/" + this.object.actor.getEmbeddedDocument("Item", context.system.skillId).name;
                context.system.skill = newSkill;

                this.object.update({system:{skill:newSkill}});

            //But if the new item sheet doesn't have a value and the old one does, then the old sheets value is used.
            }else if(!context.system.skillId && !context.system.attribute && context.system.skill){
                let values = context.system.skill.split('/');
                if(values.length == 2){
                    let skillItem = this.actor ? this.actor.items.find(entry => {
                        return entry.name.toLowerCase() === values[1].toLowerCase() && entry.type === "skill";
                    }) : "";

                    if(skillItem && !skillItem.length){
                        context.system.skillId = skillItem._id;
                        context.system.attribute = values[1].toLowerCase();
    
                        this.object.update({system:{skillId:skillItem._id, attribute:values[0].toLowerCase()}});
                    }else{
                        ui.notifications.warn("The core sheet skill format couldn't be parsed.");
                    }
                }else{
                    ui.notifications.warn("The core sheet skill format couldn't be parsed.");
                }
            }
            console.log(context);
        }

        //Uncomment this line to see what data can be accsessed in the handelbars sheet.
        //console.log(context);

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
        let actor = this.actor;        
        
        //Use the item with the given actor.
        useItem(actor._id, this.object);
    }

}
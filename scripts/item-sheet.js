//Extends the basic ItemSheet with some very simple modifications

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
    
        if (typeof context.system.type === 'undefined'){
            context.system.type = "melee";
        }

        //Adds a boolean used to determine if the foci item sheet should have one description box or two.
        if(context.item.type == "focus"){
            context.system.isClassAbility = context.system.level === "";
        }

        return context;
    }

    //@override
    get template() {
        return `modules/xanders-swnr-sheet/scripts/templates/items/item-${this.item.type}-sheet.html`;
    }

}
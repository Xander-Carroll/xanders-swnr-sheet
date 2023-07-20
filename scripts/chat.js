// Adds interactivity with new xandersSWNR chat messages.

// FOR DEVELOPMENT: 
// Potentially useful event data retrevial code.
// let itemId = event.currentTarget.dataset.itemId;
// let ownerId = event.currentTarget.dataset.ownerId;
// let itemType = event.currentTarget.dataset.itemType;

// Adds hooks to new chat cards.
export function addChatListener(message, html, data){
    if(message.flags.xSwnrInteractive){
        //Auto-collapsing the item card if the apropriate setting is turned on.
        if(game.settings.get("xanders-swnr-sheet", "itemCardsCollapsed")){
            html.find(".card-content").hide();
        }

        //Hiding the roll buttons if the player does not own the chat card.
        console.log(data);
        if(!data.author.isOwner){
            html.find(".chat-card-buttons").hide();
        }

        //Hook used for making item cards collapse when their name is clicked.
        html.on('click', '.xanders-swnr p[id="item-name"]', (event) =>{
            onItemCollapse(event, html);
        });

        //Hook used for rolling attack and damage rolls on item cards.
        html.on('click', '.xanders-swnr .chat-card-buttons button', (event) =>{
            onChatButtonPress(event, html);
        });
    }
}

// Called when an item cards collapsed state should be toggeled.
async function onItemCollapse(event, html){
    event.preventDefault();    

    //Getting the div that should be hidden when the card is collapsed.
    let content = html.find(".card-content");
    
    //Toggeling the display state of the hidden block.
    content.css('display', content.css('display') === "none" ? "block" : "none");
}

// Called when a button is pressed on a chat card.
async function onChatButtonPress(event, html){
    event.preventDefault();

    //The type of button that was pressed.
    let type = event.currentTarget.dataset.type;

    console.log("Pressed [" + type + "] Button!");
    let rollData = await _weaponRollDialog(type);

    if(rollData.cancelled) return;
}

//Called when the user makes an attack roll or damage roll.
async function _weaponRollDialog(rollType){
    let template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/attack-roll-dialog.html"
    const html = await renderTemplate(template, {});
    let title = "Roll";

    if(rollType === "attack"){
        title = "Attack Roll";
    }else{
        title = "Damage Roll";
        template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/damage-roll-dialog.html"
    }

    return new Promise(resolve => {
        const data = {
            title: title,
            content: html,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: html => resolve(_processWeaponRoll(html))
                }
            },
            default: "roll",
            close: () => resolve({cancelled: true}) 
        }
    
        new Dialog(data, null).render(true);
    });
}

function _processWeaponRoll(html){
    console.log("Processing");

    return {};
}
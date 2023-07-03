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

        //Hook used for making item cards collapse when their name is clicked.
        html.on('click', '.xanders-swnr p[id="item-name"]', (event) =>{
            onItemCollapse(event, html);
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


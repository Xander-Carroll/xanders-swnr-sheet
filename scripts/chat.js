// Adds interactivity with new xandersSWNR chat messages.

// FOR DEVELOPMENT: 
// Potentially useful event data retrevial code.
// let itemId = event.currentTarget.dataset.itemId;
// let ownerId = event.currentTarget.dataset.ownerId;
// let itemType = event.currentTarget.dataset.itemType;

import { generateRoll } from "./utils.js";

// Adds hooks to new chat cards.
export function addChatListener(message, html, data){
    if(message.flags.xSwnrInteractive){
        //Auto-collapsing the item card if the apropriate setting is turned on.
        if(game.settings.get("xanders-swnr-sheet", "itemCardsCollapsed")){
            html.find(".card-content").hide();
        }

        //Hiding the roll buttons if the player does not own the chat card.
        if(!data.author.isOwner){
            html.find(".chat-card-buttons").hide();
        }

        //Hook used for making item cards collapse when their name is clicked.
        html.on('click', '.xanders-swnr p[id="item-name"]', (event) =>{
            onItemCollapse(event, html);
        });

        //Hook used for rolling attack and damage rolls on item cards.
        html.on('click', '.xanders-swnr .attack-button, .xanders-swnr .damage-button', (event) =>{
            onChatWeaponButtonPress(event, html);
        });

        //Hook used for rolling attack and damage rolls on item cards.
        html.on('click', '.xanders-swnr .save-throw-button', (event) =>{
            onChatSaveButtonPress(event, html);
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

// Called when a button is pressed on a weapon chat card.
async function onChatWeaponButtonPress(event, html){
    event.preventDefault();

    //The type of button that was pressed.
    let type = event.currentTarget.dataset.type;
    let itemId = event.currentTarget.dataset.itemId;
    let ownerId = event.currentTarget.dataset.ownerId;

    let wasBurstDamage = false;
    if (type == "burst"){
        type = "damage";
        wasBurstDamage = true;
    }

    //Creating the dialog and getting player input.
    let rollData = await _weaponRollDialog(type, itemId, ownerId);
    if(rollData.cancelled) return;

    //Getting the actor and weapon involved with the attack.
    let actor = game.actors.get(ownerId);
    let weapon = actor.getEmbeddedDocument("Item", itemId);

    //Consuming one piece of ammunition.
    let ammoConsumption = 1;
    if (rollData.burstFire == true) ammoConsumption = 3;
    if((rollData.consumeAmmo && weapon.system.ammo.value < ammoConsumption && weapon.system.ammo.type !== "infinite") || (weapon.system.ammo.type === "none" && rollData.consumeAmmo)){
        ui.notifications.warn("You don't have enough ammo to use this weapon!");
        return;
    }else if (rollData.consumeAmmo && weapon.system.ammo.type !== "infinite"){
        weapon.update({system:{ammo:{value:weapon.system.ammo.value-ammoConsumption}}});
    }

    //Adding modifiers to the role.
    let dialogMod;
    if(type === "attack" || type === "damage"){
        dialogMod = rollData.modifier;

        if(dialogMod.charAt(0) !== '-' && dialogMod.charAt(0) !== ""){
            dialogMod = "+" + dialogMod;
        }
    }

    //Creating the overall roll modifier and damage dice.
    let dice = "1d20";
    if(type === "attack"){
        rollData.modifier = weapon.system.fullAttackBonus + dialogMod;

        //If the attack roll was made with burst then the roll gets +2.
        if(rollData.burstFire) rollData.modifier = rollData.modifier + "+2";
    }else if (type === "damage"){
        rollData.modifier = weapon.system.damageBonus + dialogMod;
        dice = weapon.system.damage;

        //If the skill boosts damage property is selected, then the skillMod should be added to the result.
        if(weapon.system.skillBoostsDamage) rollData.modifier = rollData.modifier + weapon.system.skillMod;

        //If the burst damage was rolled then +2 is added to the damage.
        if(wasBurstDamage) rollData.modifier = rollData.modifier + "+2";
    }else if (type === "shock"){
        rollData.modifier = '';
        dice = weapon.system.shock.dmg.toString();

        //If the skill boosts shock property is selected, then the skillMod should be added to the result.
        if(weapon.system.skillBoostsShock) dice = dice + weapon.system.skillMod;
    }

    //Getting the roll data results.
    let rollMessage = await generateRoll(dice, rollData, actor.sheet);

    //Cancelling the roll if the user used an invalid modifier.
    if (rollMessage.error){
        return;
    }

    //If a burst attack was made then that should be put on the item card.
    if(wasBurstDamage) type = "Burst Damage";
    if(rollData.burstFire) type = "Burst Attack"

    // Adding the flavor text.
    rollMessage.data.flavor = weapon.name + " - " + type.charAt(0).toUpperCase() + type.substr(1) + " Roll";

    // Creates the chat message with the given data.
    let message = await getDocumentClass("ChatMessage").create(rollMessage.data);
    
    //Changes the roll mode of the chat message.
    await getDocumentClass("ChatMessage").applyRollMode(rollMessage.data, rollData.rollMode);
    await message.update(rollMessage.data);
}

// Called when a saving throw button is pressed on a chat card.
async function onChatSaveButtonPress(event, html){
    let itemId = event.currentTarget.dataset.itemId;

    console.log(itemId);
}


//Called when the user makes an attack roll or damage roll.
async function _weaponRollDialog(rollType, itemId, ownerId){
    //Getting the actor and item for the rolled weapon.
    let actor = game.actors.get(ownerId);
    let item = actor.getEmbeddedDocument("Item", itemId);

    //Adding the actor's skill data to the item.
    item.system.skillList = actor.itemTypes.skill;

    //Setting the title of the dialog and creating the html template.
    let template; let title;
    if(rollType === "attack"){
        title = "Attack Roll";
        template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/attack-roll-dialog.html"
    }else if(rollType === "damage"){
        title = "Damage Roll";
        template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/damage-roll-dialog.html"
    }else if(rollType === "shock"){
        return {};
    }
    const html = await renderTemplate(template, item);

    //Creating and rendering the dialog.
    return new Promise(resolve => {
        const data = {
            title: title,
            content: html,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: html => resolve(_processWeaponRoll(html, rollType))
                }
            },
            default: "roll",
            close: () => resolve({cancelled: true}) 
        }
    
        new Dialog(data, null).render(true);
    });
}

//Processes the options givn in a weapon roll dialog.
function _processWeaponRoll(html, rollType){
    const rollMode = html.find('[name="rollmode"]')[0].value;
    const modifier = html.find('[name="modifier"]')[0].value;
    const consumeAmmo = html.find('[name="consume-ammo"]').is(":checked");
    const burstFire = html.find('[name="burst-fire"]').is(":checked");
    
    let returnData = {
        modifier: modifier,
        rollMode: rollMode,
        consumeAmmo: consumeAmmo,
        burstFire: burstFire
    };

    if (rollType === "attack"){
        returnData.skill = html.find('[name="skill"]')[0].value;
    }

    return returnData;
}
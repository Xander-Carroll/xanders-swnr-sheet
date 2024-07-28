// Adds interactivity with new xandersSWNR chat messages.

// FOR DEVELOPMENT: 
// Potentially useful event data retrevial code.
// let itemId = event.currentTarget.dataset.itemId;
// let ownerId = event.currentTarget.dataset.ownerId;
// let itemType = event.currentTarget.dataset.itemType;

import { generateRoll, makeSavingThrow, makeSkillCheck} from "./utils.js";

// Adds hooks to new chat cards.
export function addChatListener(message, html, data){
    if(message.flags.xSwnrInteractive){
        //Auto-collapsing the item card if the apropriate setting is turned on.
        if(game.settings.get("xanders-swnr-sheet", "itemCardsCollapsed") || (game.settings.get("xanders-swnr-sheet", "itemCardScrub") && data.author.isGM && !game.user.isGM)){
            html.find(".card-content").hide();
        }

        //Hiding the roll buttons if the player does not own the chat card.
        if(!data.author.isOwner){
            html.find(".chat-card-buttons").hide();
        }

        //Hook used for making item cards collapse when their name is clicked.
        html.on('click', '.xanders-swnr p[id="item-name"]', (event) =>{
            onItemCollapse(event, html, data);
        });

        //Hook used for rolling attack and damage rolls on item cards.
        html.on('click', '.xanders-swnr .attack-button, .xanders-swnr .damage-button, .xanders-swnr .shock-button, .xanders-swnr .burst-damage-button', (event) =>{
            onChatWeaponButtonPress(event);
        });

        //Hook used for rolling attack and damage rolls on item cards.
        html.on('click', '.xanders-swnr .save-throw-button', (event) =>{
            onChatSaveButtonPress(event);
        });

        //Hook used for rolling power cards.
        html.on('click', '.xanders-swnr .power-skill-button, .xanders-swnr .power-roll-button, .xanders-swnr .power-effort-button', (event) =>{
            onChatPowerButtonPress(event);
        });
    }
}

// Called when an item cards collapsed state should be toggeled.
async function onItemCollapse(event, html, data){
    event.preventDefault();    

    //If the scrubItemDetails setting is on, then players should not be able to uncollapse item cards.
    if (game.settings.get("xanders-swnr-sheet", "itemCardScrub") && data.author.isGM && !game.user.isGM) return;

    //Getting the div that should be hidden when the card is collapsed.
    let content = html.find(".card-content");
    
    //Toggeling the display state of the hidden block.
    content.css('display', content.css('display') === "none" ? "block" : "none");
}

// Called when a saving throw button is pressed on a chat card.
async function onChatSaveButtonPress(event){
    let type = event.currentTarget.dataset.type;

    let actor;

    const token = game.canvas.tokens.get(ChatMessage.getSpeaker().token);
    if(token) actor = token.actor;
    if(!actor) actor = game.actors.get(ChatMessage.getSpeaker().actor);
    
    if(!actor){
        ui.notifications.warn("You don't have an actor or token selected!");
        return;
    }

    if(actor.type !== "npc" && actor.type !== "character"){
        ui.notifications.warn("The given token can't make saving throws!");
        return;
    }

    if(actor.type === "npc") type = "npc";

    makeSavingThrow(actor.id, type);
}

// Called when a button is pressed on a power chat card.
async function onChatPowerButtonPress(event){
    const itemId = event.currentTarget.dataset.itemId;
    const ownerId = event.currentTarget.dataset.ownerId;
    const type = event.currentTarget.dataset.type;

    if(type === "skill-button"){
        const power = game.actors.get(ownerId).getEmbeddedDocument("Item", itemId);
        const skillId = power.system.skillId;

        let actor;
        const token = game.canvas.tokens.get(ChatMessage.getSpeaker().token);
        if(token) actor = token.actor;
        if(!actor) actor = game.actors.get(ChatMessage.getSpeaker().actor);

        if(!actor){
            ui.notifications.warn("You don't have an actor or token selected!");
            return;
        };

        makeSkillCheck(actor.id, skillId, power.system.attribute);
    }else if(type === "roll-button"){
        const owner = game.actors.get(ownerId);
        const power = owner.getEmbeddedDocument("Item", itemId);

        let rollData = await _weaponRollDialog("power", itemId, ownerId);

        if(rollData.cancelled) return;

        let rollMessage = await generateRoll(power.system.roll, rollData, owner.sheet);

        // Sets more basic information needed for the chat message. 
        rollMessage.data.flavor = power.name + " Roll";

        // Creates the chat message with the given data.
        let message = await getDocumentClass("ChatMessage").create(rollMessage.data);

        //Changes the roll mode of the chat message.
        await getDocumentClass("ChatMessage").applyRollMode(rollMessage.data, rollData.rollMode);
        await message.update(rollMessage.data);
    }else{
        const actor = game.actors.get(ownerId);

        if(actor.system.effort.value <= 0){
            ui.notifications.warn("You are out of effort to expend.");
            return;
        }else{
            let system = {effort:{}};
            system.effort[type] = actor.system.effort[type] + 1;
            actor.update({system: system});

            //Creating a chat message that says the actor rested.
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({actor: actor}),
                content: `<p>${actor.name} used "${actor.getEmbeddedDocument("Item", itemId).name}".</p><p>1 ${type} effort expended.</p>`, 
            });
        }
        
    }
}

// Called when a button is pressed on a weapon chat card.
async function onChatWeaponButtonPress(event){
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
        template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/generic-roll-dialog.html"
    }else if(rollType === "power"){
        title = "Power Roll";
        template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/generic-roll-dialog.html"
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
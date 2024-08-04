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
        //Getting the power item that was used.
        const power = game.actors.get(ownerId).getEmbeddedDocument("Item", itemId);
        const skillString = power.system.skill;

        //Getting the actor that pressed the button.
        let actor;
        const token = game.canvas.tokens.get(ChatMessage.getSpeaker().token);
        if(token) actor = token.actor;
        if(!actor) actor = game.actors.get(ChatMessage.getSpeaker().actor);

        if(!actor){
            ui.notifications.warn("You don't have an actor or token selected!");
            return;
        };

        if(actor.type === "character"){
            //Splitting the skill string into two useable parts.
            var values = skillString.split("/");
            if(values.length !== 2){
                ui.notifications.warn("The Attribute/Skill field can not be read.");
                return;
            }

            let skillItem = actor.items.find(entry => {
                return entry.name.toLowerCase() === values[1].toLowerCase() && entry.type === "skill";
            });

            if(skillItem && !skillItem.length){
                makeSkillCheck(actor.id, skillItem._id, values[0]);
            }else{
                ui.notifications.warn("The Attribute/Skill field can not be read.");
                return;
            }
        }else{
            makeSkillCheck(actor.id, "", "");
        }
        
        
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

    //Getting the actor and weapon involved with the attack.
    let actor = game.actors.get(ownerId);
    let weapon = actor.getEmbeddedDocument("Item", itemId);

    //Handling burst weapon attacks.
    let wasBurstDamage = false;
    if (type == "burst"){
        type = "damage";
        wasBurstDamage = true;
    }

    //Creating the dialog and getting player input.
    let rollData = await _weaponRollDialog(type, itemId, ownerId);
    if(rollData.cancelled) return;

    //Handling ammo.
    if(rollData.consumeAmmo){
        let ammoConsumption = 1;
        if (rollData.burstFire == true) ammoConsumption = 3;

        if((weapon.system.ammo.value < ammoConsumption && weapon.system.ammo.type !== "infinite") || (weapon.system.ammo.type === "none" && rollData.consumeAmmo)){
            ui.notifications.warn("You don't have enough ammo to use this weapon!");
            return;
        }else if (weapon.system.ammo.type !== "infinite"){
            weapon.update({system:{ammo:{value:weapon.system.ammo.value-ammoConsumption}}});
        }
    }
    
    //Adding modifiers to the role.
    let dialogMod;
    if(type === "attack" || type === "damage"){
        dialogMod = rollData.modifier;

        if(dialogMod.charAt(0) !== '-' && dialogMod.charAt(0) !== ""){
            dialogMod = "+" + dialogMod;
        }
    }

    //Calculating weapon modifiers.
    let skill = actor.getEmbeddedDocument("Item", weapon.system.skill);

    let skillPunchMod = 0;
    let skillMod = -2;
    let skillModString = 0;

    //If the skill is set, then the rank will be used, if the skill is unset, then the rank is 0.
    if(typeof skill != "undefined"){
        //Punch attacks add their skill modifier to the damage roll.
        if (skill.name.toUpperCase() === "PUNCH"){
            skillPunchMod = skill.system.rank;
        }
        
        skillModString = skill.system.rank.toString();
        if(skillModString.charAt(0) != '-') skillModString = "+" + skillModString;
        
        //If an attack skill is untrained, the character takes -2 instead of just -1 to hit.
        if (skill.system.rank != -1){
            skillMod = skill.system.rank;
        }
    }

    //The attribute bonus is the better of the two listed attribute modifiers.
    let attributeBonus = context.actor.system.stats[weapon.system.stat].mod;
    if(weapon.system.secondStat !== "none"){
        attributeBonus = Math.max(attributeBonus, context.actor.system.stats[weapon.system.secondStat].mod);
    }

    //Calculating the weapon attack bonus, and adding a + sign in front of the string if needed.
    let fullBonusInt = actor.system.ab + weapon.system.ab + skillMod + attributeBonus;
    let fullBonusString = fullBonusInt >= 0 ? "+" + String(fullBonusInt) : fullBonusInt;

    //Calculating the weapon damage, and adding a + sign in front of the string if needed.
    let fullDamageInt = skillPunchMod + attributeBonus;
    let fullDamageString = fullDamageInt >= 0 ? "+" + String(fullDamageInt) : fullDamageInt;

    //Creating the overall roll modifier and damage dice.
    let dice = "1d20";
    if(type === "attack"){
        rollData.modifier = fullBonusString + dialogMod;

        //If the attack roll was made with burst then the roll gets +2.
        if(rollData.burstFire) rollData.modifier = rollData.modifier + "+2";
    }else if (type === "damage"){
        rollData.modifier = fullDamageString + dialogMod;
        dice = weapon.system.damage;

        //If the skill boosts damage property is selected, then the skillMod should be added to the result.
        if(weapon.system.skillBoostsDamage) rollData.modifier = rollData.modifier + skillModString;

        //If the burst damage was rolled then +2 is added to the damage.
        if(wasBurstDamage) rollData.modifier = rollData.modifier + "+2";
    }else if (type === "shock"){
        rollData.modifier = '';
        dice = weapon.system.shock.dmg.toString();

        //If the skill boosts shock property is selected, then the skillMod should be added to the result.
        if(weapon.system.skillBoostsShock) dice = dice + skillModString;
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
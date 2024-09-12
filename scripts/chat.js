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

    //Getting the actor that created the chat card.
    const token = game.canvas.tokens.get(ownerId);
    let owner = game.actors.get(ownerId);
    if(token) owner = token.actor;
    
    //Returning if an actor could not be found.
    if(!owner){
        ui.notifications.warn("Can't find the actor that created this chat card!");
        return;
    }

    //Getting the power that was used.
    const power = owner.getEmbeddedDocument("Item", itemId);

    if(type === "skill-button"){        
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
        let rollData = await _weaponRollDialog("power", itemId, owner);

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
        if(owner.system.effort.value <= 0){
            ui.notifications.warn("You are out of effort to expend.");
            return;
        }else{
            let system = {effort:{}};
            system.effort[type] = owner.system.effort[type] + 1;
            owner.update({system: system});

            //Creating a chat message that says the actor rested.
            await ChatMessage.create({
                speaker: ChatMessage.getSpeaker({actor: owner}),
                content: `<p>${owner.name} used "${owner.getEmbeddedDocument("Item", itemId).name}".</p><p>1 ${type} effort expended.</p>`, 
            });
        }
    }
}

// Called when a button is pressed on a weapon chat card.
async function onChatWeaponButtonPress(event){
    event.preventDefault();

    //The type of button that was pressed.
    let type = event.currentTarget.dataset.type;
    const itemId = event.currentTarget.dataset.itemId;
    const ownerId = event.currentTarget.dataset.ownerId;

    //Getting the actor that created the chat card.
    const token = game.canvas.tokens.get(ownerId);
    let actor = game.actors.get(ownerId);
    if(token) actor = token.actor;

    //Returning if an actor could not be found.
    if(!actor){
        ui.notifications.warn("Can't find the actor that created this chat card!");
        return;
    } 

    let rollData = {};

    if(type === "attack") rollData = await _makeAttackRoll(actor, itemId);
    else if(type === "shock") rollData = await _makeShockRoll(actor, itemId);
    else if(type === "damage") rollData = await _makeDamageRoll(actor, itemId, false);
    else if(type === "burst") rollData = await _makeDamageRoll(actor, itemId, true);

    if(!rollData) return;

    //Getting the roll data results.
    let rollMessage = await generateRoll(rollData.dice, rollData, actor.sheet);

    //Cancelling the roll if the user used an invalid modifier.
    if (rollMessage.error){
        return;
    }
    
    // Adding the flavor text.
    if(rollData.burstFire) type = "Burst Attack";
    rollMessage.data.flavor = rollData.weaponName + " - " + type.charAt(0).toUpperCase() + type.substr(1) + " Roll";

    // Creates the chat message with the given data.
    let message = await getDocumentClass("ChatMessage").create(rollMessage.data);
    
    //Changes the roll mode of the chat message.
    await getDocumentClass("ChatMessage").applyRollMode(rollMessage.data, rollData.rollMode);
    await message.update(rollMessage.data);
}

//Called when the user clicks a weapon's attack roll button.
async function _makeAttackRoll(actor, itemId){
    const weapon = actor.getEmbeddedDocument("Item", itemId);
    
    //Getting most of the roll data.
    let rollData = await _weaponRollDialog("attack", itemId, actor);
    if(rollData.cancelled) return false;

    //Setting more roll data.
    rollData.dice = "1d20";
    rollData.weaponName = weapon.name;

    console.log(rollData);

    //Determining the final modifier string.
    let abString = ((actor.system.ab >= 0) ? "+" : "") + String(actor.system.ab);           //The ab with a + sign if needed.
    let weaponAbString = ((weapon.system.ab >= 0) ? "+" : "") + String(weapon.system.ab);   //The weapon ab with a + sign if needed.
    let burstBonusString = (rollData.burstFire) ? "+2" : "";                                //Burst fire provides a +2 to hit.
    let skillLevelString = "";
    let attributeModString = "";

    if(actor.type === "character"){
        let skill = actor.getEmbeddedDocument("Item", weapon.system.skill);

        if(rollData.skill !== ""){
            skill = actor.getEmbeddedDocument("Item", rollData.skill);
        }
        
        
        //Untrained skills take a -2 to hit. And adding a + sign if needed.
        skillLevelString = "-2";
        if(skill){
            if (skill.system.rank !== -1) skillLevelString = skill.system.rank;
            skillLevelString = ((skillLevelString >= 0) ? "+" : "") + String(skillLevelString);
        }

        //The attribute mod is the higher of the two stats.
        const attributeMod = (weapon.system.secondStat !== "none") ? Math.max(actor.system.stats[weapon.system.stat].mod, actor.system.stats[weapon.system.secondStat].mod) : actor.system.stats[weapon.system.stat].mod;
        attributeModString = ((attributeMod >= 0) ? "+" : "") + String(attributeMod);
    }

    //Handling ammo consumption.
    if(rollData.consumeAmmo){
        const ammoConsumption = (rollData.burstFire == true) ? 3 : 1;
                
        if((weapon.system.ammo.type !== "infinite" && weapon.system.ammo.value < ammoConsumption) || (weapon.system.ammo.type === "none" && rollData.consumeAmmo)){
            ui.notifications.warn("You don't have enough ammo to use this weapon!");
            return;
        }else if (weapon.system.ammo.type !== "infinite"){
            weapon.update({system:{ammo:{value:weapon.system.ammo.value-ammoConsumption}}});
        }
    }

    //Setting the final modifier string.
    if(rollData.modifier && rollData.modifier.charAt(0) !== '-' && rollData.modifier.charAt(0) !== "") rollData.modifier = "+" + rollData.modifier;     //Adding a + sign if needed.
    rollData.modifier = rollData.modifier + abString + weaponAbString + burstBonusString + skillLevelString + attributeModString;                       //Setting the final modifier.

    //Returning the roll data.
    return rollData;
}

//Called when the user clicks a weapon's shock damage button.
async function _makeShockRoll(actor, itemId){
    const weapon = actor.getEmbeddedDocument("Item", itemId);
    let modifierString = "";

    //If the "shock adds skill" checkbox is checked.
    if(weapon.system.skillBoostsShock){
        if(actor.type === "character"){
            const skill = actor.getEmbeddedDocument("Item", weapon.system.skill);
            
            //Untrained skills take a -2 to hit. And adding a + sign if needed.
            modifierString = "-2";
            if(skill){
                if (skill.system.rank !== -1) modifierString = String(skill.system.rank);
            }
        }else if(actor.type === "npc"){
            const skillLevel = actor.system.skillBonus;
            modifierString = ((skillLevel >= 0) ? "+" : "") + String(skillLevel);
        }
    }

    return {
        dice: String(weapon.system.shock.dmg),
        modifier: modifierString,
        rollMode: "CURRENT",
        weaponName: weapon.name
    };
}

//Called when the user clicks a weapon's damage button.
async function _makeDamageRoll(actor, itemId, wasBurst){
    const weapon = actor.getEmbeddedDocument("Item", itemId);
    
    //Getting most of the roll data.
    let rollData = await _weaponRollDialog("damage", itemId, actor);
    if(rollData.cancelled) return false;

    //Setting more roll data.
    rollData.dice = weapon.system.damage;
    rollData.weaponName = weapon.name;

    //Determining the final modifier string.
    let burstBonusString = (wasBurst) ? "+2" : "";        //Burst fire provides a +2 to hit.
    let skillLevelString = "";
    let attributeModString = "";
    let damageBonusString = "";

    if(actor.type === "character"){
        const skill = actor.getEmbeddedDocument("Item", weapon.system.skill);
        
        //If the "damage adds skill" checkbox is checked, or if the skill is "punch", the skill level is added to the roll.
        if(weapon.system.skillBoostsDamage || (skill && skill.name.toUpperCase() === "PUNCH")){
            //Untrained skills take a -2 to hit. And adding a + sign if needed.
            skillLevelString = "-2";
            if(skill){
                if (skill.system.rank !== -1){
                    const skillLevel = skill.system.rank;
                    if (skillLevel >= 0) skillLevelString = "+" + String(skillLevel);
                } 
                
            }
        }
        
        //The attribute mod is the higher of the two stats.
        const attributeMod = (weapon.system.secondStat !== "none") ? Math.max(actor.system.stats[weapon.system.stat].mod, actor.system.stats[weapon.system.secondStat].mod) : actor.system.stats[weapon.system.stat].mod;
        attributeModString = ((attributeMod >= 0) ? "+" : "") + String(attributeMod);
    }else if(actor.type === "npc"){
        //NPCs have a damage bonus field.
        const damageBonus = actor.system.attacks.bonusDamage;
        damageBonusString = ((damageBonus >= 0) ? "+" : "") + String(damageBonus);

        //Adding the NPC's trained skill level if the check box is checked.
        if(weapon.system.skillBoostsDamage){
            const skillLevel = actor.system.skillBonus;
            skillLevelString = ((skillLevel >= 0) ? "+" : "") + String(skillLevel);
        }
    }

    //Setting the final modifier string.
    if(rollData.modifier && rollData.modifier.charAt(0) !== '-' && rollData.modifier.charAt(0) !== "") rollData.modifier = "+" + rollData.modifier;     //Adding a + sign if needed.
    rollData.modifier = rollData.modifier + attributeModString + skillLevelString + burstBonusString + damageBonusString;                               //Setting the final modifier.

    //Returning the roll data.
    return rollData;
}

//Called when the user makes an attack roll or damage roll.
async function _weaponRollDialog(rollType, itemId, actor){
    //Getting the actor and item for the rolled weapon.
    let item = actor.getEmbeddedDocument("Item", itemId);

    //Adding the actor's skill data to the item.
    item.system.skillList = actor.itemTypes.skill;
    item.system.actorType = actor.type;

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
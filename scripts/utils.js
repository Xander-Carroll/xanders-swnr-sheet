//The skills from the book.
const skills = {
    revised: [
        "administer",
        "connect",
        "exert",
        "fix",
        "heal",
        "know",
        "lead",
        "notice",
        "perform",
        "pilot",
        "program",
        "punch",
        "shoot",
        "sneak",
        "stab",
        "survive",
        "talk",
        "trade",
        "work"
    ],
    psychic: [
        "biopsionics",
        "metapsionics",
        "precognition",
        "telekinesis",
        "telepathy",
        "teleportation"
    ],
    magic: [
        "know-magic", 
        "use-magic", 
        "sunblade", 
        "fight"
    ],
    newItem: [
        "New Skill"
    ]
}

//The descriptions that will be added to the recommended skills from the book.
const revisedDescriptions = {
    administer: "<p>Manage an organization, handle paperwork, analyze records, and keep an institution functioning on a daily basis. Roll it for bureaucratic expertise, organizational management, legal knowledge, dealing with government agencies, and understanding how institutions really work.</p>",
    connect: "<p>Find people who can be helpful to your purposes and get them to cooperate with you. Roll it to make useful connections with others, find people you know, know where to get illicit goods and services, and be familiar with foreign cultures and languages. You can use it in place of Talk for persuading people you find via this skill.</p>",
    exert: "<p>Apply trained speed, strength, or stamina in some feat of physical exertion. Roll it to run, jump, lift, swim, climb, throw, and so forth. You can use it as a combat skill when throwing things, though it doesn’t qualify as a combat skill for other ends.</p>",
    fix: "<p>Create and repair devices both simple and complex. How complex will depend on your character’s background; a lostworlder blacksmith is going to need some study time before he’s ready to fix that broken fusion reactor, though he can do it eventually. Roll it to fix things, build things, and identify what something is supposed to do.</p>",
    heal: "<p>Employ medical and psychological treatment for the injured or disturbed. Roll it to cure diseases, stabilize the critically injured, treat psychological disorders, or diagnose illnesses.</p>",
    know: "<p>Know facts about academic or scientific fields. Roll it to understand planetary ecologies, remember relevant history, solve science mysteries, and know the basic facts about rare or esoteric topics.</p>",
    lead: "<p>Convince others to also do whatever it is you’re trying to do. Talk might persuade them that following you is smart, but Lead can make them do it even when they think it’s a bad idea. Roll it to lead troops in combat, convince others to follow you, or maintain morale and discipline.</p>",
    notice: "<p>Spot anomalies or interesting facts about your environment. Roll it for searching places, detecting ambushes, spotting things, and reading the emotional state of other people.</p>",
    perform: "<p>Exhibit some performative skill. Roll it to dance, sing, orate, act, or otherwise put on a convincing or emotionally moving performance.</p>",
    pilot: "<p>Use this skill to pilot vehicles or ride beasts. Roll it to fly spaceships, drive vehicles, ride animals, or tend to basic vehicle repair. This skill doesn’t help you with things entirely outside the scope of your background or experience, though with some practice a PC can expand their expertise.</p>",
    program: "<p>Operating or hacking computing and communications hardware. Roll it to program or hack computers, control computer-operated hardware, operate communications tech, or decrypt things.</p>",
    punch: "<p>Use it as a combat skill when fighting unarmed. If your PC means to make a habit of this rather than as a recourse of desperation, you should take the Unarmed Fighter focus described later.</p>",
    shoot: "<p>Use it as a combat skill when using ranged weaponry, whether hurled rocks, bows, laser pistols, combat rifles, or ship’s gunnery.</p>",
    sneak: "<p>Move without drawing notice. Roll it for stealth, disguise, infiltration, manual legerdemain, pickpocketing, and the defeat of security measures.</p>",
    stab: "<p>Use it as a combat skill when wielding melee weapons, whether primitive or complex.</p>",
    survive: "<p>Obtain the basics of food, water, and shelter in hostile environments, along with avoiding their natural perils. Roll it to handle animals, navigate difficult terrain, scrounge urban resources, make basic tools, and avoid wild beasts or gangs.</p>",
    talk: "<p>Convince other people of the facts you want them to believe. What they do with that conviction may not be completely predictable. Roll it to persuade, charm, or deceive others in conversation.</p>",
    trade: "<p>Find what you need on the market and sell what you have. Roll it to sell or buy things, figure out where to purchase hard-to-get or illicit goods, deal with customs agents, or run a business.</p>",
    work: "<p>This is a catch-all skill for professions not represented by other skills. Roll it to work at a particular profession, art, or trade.</p>"
}

//The descriptions that will be added to the psychic skill from the book.
const psychicDescriptions = {
    biopsionics: "<p>Master powers of physical repair, body augmentation, and shapeshifting.</p>",
    metapsionics: "<p>Master powers that nullify, boost, and shape the use of other psychic abilities.</p>",
    precognition: "<p>Master the ability to sense future events and control probability.</p>",
    telekinesis: "<p>Master the remote control of kinetic energy to move objects and fabricate force constructs.</p>",
    telepathy: "<p>Master the reading and influencing of other sapient minds.</p>",
    teleportation: "<p>Master the arts of physical translocation of yourself and allies.</p>"
}

//Paths to the default images which should be used for the revised skill list.
const revisedImages = {
    administer: "icons/skills/trades/academics-merchant-scribe.webp",
    connect: "icons/skills/social/diplomacy-handshake-blue.webp",
    exert: "icons/skills/movement/figure-running-gray.webp",
    fix: "icons/skills/trades/construction-carpentry-hammer.webp",
    heal: "icons/magic/life/heart-area-circle-red-green.webp",
    know: "icons/skills/trades/academics-study-reading-book.webp",
    lead: "icons/sundries/flags/banner-flag-blue.webp",
    notice: "icons/magic/perception/eye-ringed-glow-angry-small-teal.webp",
    perform: "icons/skills/trades/music-notes-sound-blue.webp",
    pilot: "icons/magic/air/air-pressure-shield-blue.webp",
    program: "icons/commodities/tech/console-steel.webp",
    punch: "icons/skills/melee/unarmed-punch-fist.webp",
    shoot: "icons/weapons/guns/gun-pistol-flintlock.webp",
    sneak: "icons/magic/movement/trail-streak-impact-blue.webp",
    stab: "icons/weapons/daggers/dagger-black.webp",
    survive: "icons/environment/wilderness/tree-spruce.webp",
    talk: "icons/skills/social/diplomacy-handshake.webp",
    trade: "icons/commodities/currency/coin-embossed-cobra-gold.webp",
    work: "icons/tools/smithing/hammer-sledge-steel-grey.webp"
}

//Paths to the default images which should be used for the psychic skill list.
const psychicImages = {
    biopsionics: "icons/magic/defensive/illusion-evasion-echo-purple.webp",
    metapsionics: "icons/magic/control/energy-stream-link-teal.webp", 
    precognition: "icons/magic/time/clock-stopwatch-white-blue.webp",
    telekinesis: "icons/magic/movement/abstract-ribbons-red-orange.webp",
    telepathy: "icons/magic/sonic/explosion-shock-sound-wave.webp",
    teleportation: "icons/magic/movement/trail-streak-pink.webp"
}

// TOOL FUNCTIONS.

//Adds all of the skills from the skills array onto the actor.
export function initSkills(actor, skillType){
    let skillsToAdd = [];

    skills[skillType].forEach(skillName => {
        let skill = {
            type: "skill",
            name: toTitleCase(skillName),
            data: {
                rank: -1,
                pool: "ask",
                source: "Swn",
                dice: "2d6"
            }
        }

        //Sets the descriptions for SWNR recomended skills.
        if(skillType === "revised"){
            skill.data.description = revisedDescriptions[skillName];
            skill.img = revisedImages[skillName];
            skill.data.source = "Swnr";
        }

        //Sets the descriptions for SWNR psychic skills.
        if(skillType === "psychic"){
            skill.data.description = psychicDescriptions[skillName];
            skill.img = psychicImages[skillName];
            skill.data.source = "Psionic";
        }

        skillsToAdd.push(skill);
    });

    ui.notifications.info("Adding skills. This may take a moment.");
    actor.createEmbeddedDocuments("Item", skillsToAdd);
}

//Turns a given string into a title-case version of that string.
export function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

//Will return the value of the bar as a percentage of the maximum, constrained between 0 and 100.
export function calculateBarPercentage(value, max){
    let percentage = Math.floor(value * 100 / max);
    percentage = Math.min(percentage, 100);
    percentage = Math.max(percentage, 0);
    
    return percentage;
}

//Used to load all of the handelbars templates ahead of time.
export const preloadXandersTemplates = async function () {
    const list = await fetch("modules/xanders-swnr-sheet/scripts/templates/templates.json");
    const files = await list.json();
    return loadTemplates(files);
};

// FUNCTIONS FOR MACROS.
export async function createRollItemMacro(data, slot){
    //We can only drop items.
    if(data.type !== "Item") return;

    //Getting the item.
    const item = await Item.implementation.fromDropData(data);

    //Making sure the user owns the item.
    if(!item){
        ui.notifications.warn("You can only create macro buttons for owned items.");
        return;
    } 

    //Setting the macro data.
    const macroData = { 
        type: "script", 
        scope: "actor" ,
        name: item.name,
        img: item.img,
        command: `game.xswnr.rollItem("${item.id}")`,
        flags: {"xswnr.itemMacro": true}
    };

    const macro = await Macro.create(macroData);
    game.user.assignHotbarMacro(macro, slot);
}

//Can be called from macros within Foundry vtt to use an item with the given id.
export function rollItemMacro(itemId){
    //Getting the actor which used the macro.
    let actor;
    const speaker = ChatMessage.getSpeaker();
    if(speaker.token) actor = game.actors.tokens[speaker.token];
    if(!actor) actor = game.actors.get(speaker.actor);

    //If we couldn't get the actor we stop.
    if(!actor){
        ui.notifications.warn("No actor selected.");
        return;
    };

    //Getting the matching item - and using it.
    const item = actor.getEmbeddedDocument("Item", itemId);
    if(item == null){
        ui.notifications.warn(`An item with the given id could not be found [${itemId}]`);
        return;
    }

    useItem(actor.sheet, item);
}

// FUNCTIONS FOR GENERATING ROLLS AND DIALOGS

//Retruns a rollData object and a roll object from the spesified data.
export async function generateRoll(baseDie, rollData, sheet){
    //Determing what role mode should be used.
    if(rollData.rollMode === "CURRENT"){
        rollData.rollMode = game.settings.get("core", "rollMode");
    }else{
        rollData.rollMode = CONST.DICE_ROLL_MODES[rollData.rollMode];
    }

    //Detrming the proper roll formula to use.
    let rollFormula = baseDie;
    if(rollData.modifier && rollData.modifier !== ''){
        let firstSymbol = rollData.modifier.charAt(0);

        if(firstSymbol !== '+' && firstSymbol !== '-'){
            rollFormula = rollFormula + "+" + rollData.modifier;
        }else{
            rollFormula = rollFormula + rollData.modifier;
        }
    }

    //Creating a roll with the proper roll formula.
    const roll = new Roll(rollFormula, {target: rollData.target});

    //If the roll does not evaluate, it was because the player entered a bad modifier.
    try{
        await roll.roll({async: true});
    }catch (error){
        ui.notifications.error("[" + rollData.modifier + "] is not a valid modifier!");
        return {error: true};
    }

    //Getting the roll as HTML.
    let rollContent = await roll.render();

    // Sets the basic information needed for the chat message.        
    let messageData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker({actor:sheet.actor}),
        roll: JSON.stringify(roll),
        content: rollContent,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL
    };

    return {data: messageData, roll:roll};
}

//Will create a chat message for the given item spoken by the given actor.
export async function useItem(sheet, item){
    item.ownerId = (sheet.document.isToken) ? sheet.token.id : item.parent.id;

    //Creating an html template from the dialog.
    let templateContent = await renderTemplate("modules/xanders-swnr-sheet/scripts/templates/chats/item-card-chat.html", item);

    //Creating a chat message once the settings are all changed.
    const chatMessageData = {
        content: templateContent,
        speaker: {actor: sheet.actor.id},
        isOwner: true,
        flags: {
            xSwnrInteractive: true
        }
    };

    ChatMessage.create(chatMessageData);

    await getDocumentClass("ChatMessage").applyRollMode(chatMessageData, game.settings.get("core", "rollMode"));
}

//Will make a saving throw for the given actor of the given save type.
export async function makeSavingThrow(sheet, saveType){
    //Getting the actor that the roll was made with.
    const actor = sheet.actor;

    //Opening a dialog to prompt the player to add modifiers etc.
    let saveData = await _genericRollDialog(toTitleCase(saveType) + " Saving Throw: " + actor.name);

    //If the dialog was canceled(closed) the roll needs cancelled.
    if(saveData.cancelled) return;

    //Adding data to the saving throw.
    saveData.target = saveType === "npc" ? actor.system.saves : actor.system.save[saveType];

    //Getting the roll data results.
    let rollMessage = await generateRoll("1d20", saveData, actor.sheet);

    //Cancelling the roll if the user used an invalid modifier.
    if(rollMessage.error){
        return;
    }

    //Extra data which will be used by handelbars when displaying the saving throw.
    let templateData = {};
    let d20Result = rollMessage.roll.terms[0].total;
    templateData.saved = d20Result !== 1 && (d20Result === 20 || (rollMessage.roll.total >= saveData.target));

    //Getting the extra saving throw chat piece as HTML.
    let templateContent = await renderTemplate("modules/xanders-swnr-sheet/scripts/templates/chats/save-throw-chat.html", templateData);

    // Sets more basic information needed for the chat message. 
    if(saveType === "npc") saveType = "";

    rollMessage.data.content = rollMessage.data.content + templateContent;
    rollMessage.data.flavor = "v" + saveData.target + " " + toTitleCase(saveType) + " saving throw";

    // Creates the chat message with the given data.
    let message = await getDocumentClass("ChatMessage").create(rollMessage.data);

    //Changes the roll mode of the chat message.
    await getDocumentClass("ChatMessage").applyRollMode(rollMessage.data, saveData.rollMode);
    await message.update(rollMessage.data);
}

//Will make a skill check for the given actor with the given skill id.
export async function makeSkillCheck(sheet, itemId, overrideAttribute){
    //Getting the actor that this skill belongs to.
    const actor = sheet.actor;

    //The skill data that will be passed to the dialog.
    let skill = {};
    if(actor.type === "character"){
        //Getting the skill that was clicked.
        skill = actor.getEmbeddedDocument("Item", itemId);
        skill.system.stats = actor.system.stats;
        if(overrideAttribute) skill.system.defaultStat = overrideAttribute;
    }else if(actor.type === "npc"){
        const modString = actor.system.skillBonusModString ? actor.system.skillBonusModString : actor.system.skillBonus;
        skill = {
            name: "Npc",
            system: {
                skillBonusModString: modString
            }
        };
    }
    skill.system.actorType = actor.type;

    //Creating a dialog so that the player can choose how they want to roll.
    let checkData = await _skillCheckDialog(skill, actor.name);

    //If the dialog was canceled(closed) the roll needs cancelled.
    if(checkData.cancelled){
        return;
    }

    if(actor.type === "character"){
        //Adding modifiers to the role. rollData.modifier.
        let skillMod = skill.system.rank.toString();
        let attribMod = actor.system.stats[checkData.attribute].mod.toString();
        
        //Ensuring that the right signs are used in the roll formula.
        if(skillMod.charAt(0) !== '-'){
            skillMod = "+" + skillMod;
        }
        if(attribMod.charAt(0) !== '-'){
            attribMod = "+" + attribMod;
        }

        checkData.modifier = attribMod + skillMod + checkData.modifier;
    }else if(actor.type === "npc"){
        let attribMod = 0;
        if(checkData.attribute !== "untrained"){
            attribMod = checkData.attribute;
            checkData.attribute = "trained";
        } 

        checkData.modifier = attribMod + checkData.modifier;
    }

    //Getting the roll data results.
    let rollMessage = await generateRoll(checkData.pool, checkData, actor.sheet);

    //Cancelling the roll if the user used an invalid modifier.
    if (rollMessage.error){
        return;
    }

    // Sets more basic information needed for the chat message. 
    rollMessage.data.flavor = skill.name + " (" + checkData.attribute + ") skill check";

    // Creates the chat message with the given data.
    let message = await getDocumentClass("ChatMessage").create(rollMessage.data);

    //Changes the roll mode of the chat message.
    await getDocumentClass("ChatMessage").applyRollMode(rollMessage.data, checkData.rollMode);
    await message.update(rollMessage.data);
}

//Called when a skill check is made to give the user a chance to add modifiers.
async function _skillCheckDialog(skill, actorName){
    //Creating an html template from the dialog.
    const template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/skill-check-dialog.html"
    const html = await renderTemplate(template, skill);

    //Creating the dialog and rendering it.
    return new Promise(resolve => {
        const data = {
            title: skill.name + " Skill Check: " + actorName,
            content: html,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: html => resolve(_processSkillCheckOptions(html, skill.system.defaultStat, skill.system.pool))
                }
            },
            default: "roll",
            close: () => resolve({cancelled: true}) 
        }

        new Dialog(data, null).render(true);
    });
}

//Parses the information found in a skillCheckDialog into a dictionary.
function _processSkillCheckOptions(html, stat, pool){
    const rollType = html.find('[name="rollmode"]')[0].value;
    const modifier = html.find('[name="modifier"]')[0].value;
    let attribute = stat;
    let dicePool = pool;

    attribute = html.find('[name="attribute"]')[0].value;

    dicePool = html.find('[name="pool"]')[0].value;

    return {
        modifier: modifier,
        rollMode: rollType,
        attribute: attribute,
        pool: dicePool
    }
}

//Will make a morale check for the given actor.
export async function makeMoraleCheck(sheet){
    //Getting the actor that this skill belongs to.
    const actor = sheet.actor;

    //Creating a dialog so that the player can choose how they want to roll.
    let checkData = await _genericRollDialog("Morale Check: " + actor.name);

    //If the dialog was canceled(closed) the roll needs cancelled.
    if(checkData.cancelled) return;

    //Getting the roll data results.
    let rollMessage = await generateRoll("2d6", checkData, actor.sheet);

    //Cancelling the roll if the user used an invalid modifier.
    if(rollMessage.error){
        return;
    }

    //Extra data which will be used by handelbars when displaying the saving throw.
    let templateData = {};
    let rollResult = rollMessage.roll.terms[0].total;
    templateData.saved = rollResult <= actor.system.moralScore;

    //Getting the extra saving throw chat piece as HTML.
    let templateContent = await renderTemplate("modules/xanders-swnr-sheet/scripts/templates/chats/save-throw-chat.html", templateData);

    // Sets more basic information needed for the chat message. 
    rollMessage.data.content = rollMessage.data.content + templateContent;
    rollMessage.data.flavor = "v" + actor.system.moralScore + " " + " morale check";

    // Creates the chat message with the given data.
    let message = await getDocumentClass("ChatMessage").create(rollMessage.data);

    //Changes the roll mode of the chat message.
    await getDocumentClass("ChatMessage").applyRollMode(rollMessage.data, checkData.rollMode);
    await message.update(rollMessage.data);

}

//Called when a generic roll is made to give the user a chance to add modifiers.
async function _genericRollDialog(dialogTitle){
    //Creating an html template from the dialog.
    const template = "modules/xanders-swnr-sheet/scripts/templates/dialogs/generic-roll-dialog.html";
    const html = await renderTemplate(template);

    //Creating the dialog and rendering it.
    return new Promise(resolve => {
        const data = {
            title: dialogTitle,
            content: html,
            buttons: {
                roll: {
                    label: "Roll",
                    callback: html => resolve(_processGenericRollOptions(html))
                }
            },
            default: "roll",
            close: () => resolve({cancelled: true}) 
        }

        new Dialog(data, null).render(true);
    });
}

//Processes the options givn in a weapon roll dialog.
function _processGenericRollOptions(html){
    const rollType = html.find('[name="rollmode"]')[0].value;
    const modifier = html.find('[name="modifier"]')[0].value;

    return {
        modifier: modifier,
        rollMode: rollType
    }
}
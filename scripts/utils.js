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
                source: "swnr",
                dice: "2d6"
            }
        }

        //Sets the descriptions for SWNR recomended skills.
        if(skillType === "revised"){
            skill.data.description = revisedDescriptions[skillName];
            skill.img = revisedImages[skillName];
        }

        //Sets the descriptions for SWNR psychic skills.
        if(skillType === "psychic"){
            skill.data.description = psychicDescriptions[skillName];
            skill.img = psychicImages[skillName];
        }

        skillsToAdd.push(skill);
    });

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
    if(rollData.modifier !== ''){
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
export async function useItem(item, actorId){
    //Creating an html template from the dialog.
    let templateContent = await renderTemplate("modules/xanders-swnr-sheet/scripts/templates/chats/item-card-chat.html", item);

    //Creating a chat message once the settings are all changed.
    const chatMessageData = {
        content: templateContent,
        speaker: {actor: actorId},
        isOwner: true,
        flags: {
            xSwnrInteractive: true
        }
    };

    ChatMessage.create(chatMessageData);

    await getDocumentClass("ChatMessage").applyRollMode(chatMessageData, game.settings.get("core", "rollMode"));
}

//Used to load all of the handelbars templates ahead of time.
export const preloadXandersTemplates = async function () {
    const list = await fetch("modules/xanders-swnr-sheet/scripts/templates/templates.json");
    const files = await list.json();
    return loadTemplates(files);
};
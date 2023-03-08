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
                source: skillType,
                dice: "2d6"
            }
        }

        //Sets the descriptions for SWNR recomended skills.
        if(skillType === "revised"){
            skill.data.description = revisedDescriptions[skillName];
        }

        //Sets the descriptions for SWNR psychic skills.
        if(skillType === "psychic"){
            skill.data.description = psychicDescriptions[skillName];
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
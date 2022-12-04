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
        "knowMagic", 
        "useMagic", 
        "sunblade", 
        "fight"
    ],
    newItem: [
        "New Skill"
    ]
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
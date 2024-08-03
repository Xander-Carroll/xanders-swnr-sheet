# Xander's SWNR Sheet
This module is an add-on for WintersleepAI's *Stars Without Number* system.$`^1`$ It provides new Actor and Item sheets inspired by the Tidy5e Sheets module.$`^2`$ While Wintersleep's system has basic support for Cities Without Number, this module does not (yet). In future releases, CWN support will be optionaly available.

- See the [Release Notes](RELEASES.md) for information on recent changes.
- See the [Project Board](https://github.com/users/Xander-Carroll/projects/1) for information on planned changes.

## Currently Supported Sheets
**Actors:**
- [x] Character
- [x] Npc
- [ ] Ship
- [ ] Mech
- [ ] Drone
- [ ] Vehicle
- [ ] Faction
- [ ] Cyberdeck

**Items:**
- [x] Class
- [x] Armor
- [x] Weapon
- [x] Power
- [x] Focus
- [x] Item
- [x] Cyberware
- [x] Skill
- [ ] shipWeapon
- [ ] shipDefense
- [ ] shipFitting
- [ ] Asset
- [x] Edge
- [ ] Program 

## Features
These sheets contain many features most of which are not present with the base sheets. Some of these features include:

### Sheet Edit Lock
The edit lock lets users lock down input fields that are not commonley used. It also allows the user to make changes like levling up skills and adding items.

### Item Favorites
Player Character sheets support favoriting items. This puts items on the front page for easy access.

### Lazy Money, HP, Strain, Effort, Etc
Do math directly in the input fields for HP, money, etc. ex) A value of "3+4" will evaluate to "7" when entered in the HP input field.

### Incompatible item prevention
If the user trys to add an invalid item type to a sheet, the item will be removed. ex) a PC sheet can not have a shipWeapon added. 

### Using all item types from sheets
Every item on a sheet can be "rolled" to chat. Some item types such as Weapons and Powers will have additional functionality when they have been rolled.

### A complete astetic overhaul.
Every sheet has been remodeled from the ground up taking inspiration from the Tidy5e sheet module.

## Updated Foundry User Interface
The user interface can be optionally altered to match the new sheets. Dialogs and other Window Apps have been given a new look.

## Future Development
Missing sheets are also always on the TODO list.

*Mandatory PSA:* I maintain this module in my spare time. As a student, this means that the module will recieve most of it's updates in the summer and progress is slow. For any developer's out there: Pull Requests are welcome.

## References
1. https://github.com/wintersleepAI/foundry-swnr
2. https://github.com/kgar/foundry-vtt-tidy-5e-sheets

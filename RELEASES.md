# Xander's SWNR Sheet *Release Notes*

## v1.1.2: Bug Fixes
Thursday September 12th, 2024

A small update to fix several issues.
- The stat "boost" field updates the correct value.
- Attack roll modifiers bug fixed.
- Skill checks with 3d6 and 4d6 now use kh2.
- The attack roll dialog "skill" option was fixed.

## v1.1.1: Renameable Credits
Monday August 12th, 2024

A small update to support renameable credit fields.
- Debt, Balance, and Owed text can be changed when the sheet is unlocked.

## v1.1.0: Unlinked Token Support
Tuesday August 6th, 2024

- Unlinked token support was fixed.
  - Unlinked tokens can now make attack/damage/shock rolls.
  - Unlinked token sheets now have a red outline to make it more clear that they are unlinked.
- Item macro support.
  - Items can be drag and dropped onto the macro bar for quick access.
  - The default SWNR macros are no longer created.
- Code quality improvements.
  - Several update() calls were removed to improve performance.
  - The attack/damage/shock roll buttons were re-written.
  - The inventroy item location button code was improved.
- CSS and styling improvements.
  - Chrome scrollbars were fixed.
  - The cyberware sheet was remodeled (a seperate tab for the effects text).
  - Changed the font in several places.
  - The styling for macro sheets was improved.
- Other Bug Fixes.
  - Fixed a bug where item images could not be edited when they wern't attached to a sheet.

## v1.0.0: Initial Release
Tuesday July 30th, 2024

This was the first release of the module! The bare minimum functionality was present here including:
- **Actor Sheets**
  - Player Character
  - NPC
- **Item Sheets**
  - Class Sheet
  - Armor
  - Weapon
  - Power
  - Focus
  - Item
  - Cyberware
  - Skill
  - Edge

The **New Sheets** include many convience and automation features including:
- Sheet Edit Lock
- Item Favorites
- Lazy Money, HP, Strain, Effort, Etc.
- Incompatible item prevention.
- Using all item types from sheets.
- A complete astetic overhaul.

The **User Interface** (CSS) overhaul was implemented here to give the system a more sci-fi feeling. The changes are optional (can be toggeled from the module settings menu). Additionaly, a new pause button was (optionaly) included.

Many **Chat Messages** have been modified to be more functional. Item cards can have their description collapsed, and many items (like weapons and powers) have additional functionality through their chat cards.

Many *many* other **smaller features** were added to get the sheet functional. And many more features are planned for future releases.
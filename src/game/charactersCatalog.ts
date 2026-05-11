/**
 * Stable IDs keyed to concept-sheet rows/cols (designer reference: public/art/characters-ref.png).
 */

export type CharacterId =
  | 'r1_c01_witch'
  | 'r1_c02_chef'
  | 'r1_c03_jester'
  | 'r1_c04_rapper'
  | 'r1_c05_clown'
  | 'r1_c06_hipster'
  | 'r1_c07_zombie'
  | 'r1_c08_ballerina'
  | 'r1_c09_cupid'
  | 'r1_c10_cheerleader'
  | 'r2_c01_devil'
  | 'r2_c02_caveman'
  | 'r2_c03_elf'
  | 'r2_c04_santa'
  | 'r2_c05_trucker'
  | 'r2_c06_biker'
  | 'r2_c07_prisoner'
  | 'r2_c08_swimsuit'
  | 'r2_c09_pirate'
  | 'r2_mash_raider'
  | 'r3_c01_frankenstein'
  | 'r3_c02_police'
  | 'r3_c03_lumberjack'
  | 'r3_c04_leather'
  | 'r3_c05_vampire'
  | 'r3_c06_cowboy'
  | 'r3_c07_knight'
  | 'r3_c08_sailor'
  | 'r3_c09_viking'
  | 'r3_c10_cavewoman'
  | 'r4_c01_monkey'
  | 'r4_c02_cow'
  | 'r4_c03_moose'
  | 'r4_c04_bunny'
  | 'r4_c05_kangaroo'
  | 'r4_c06_unicorn'
  | 'r4_c07_dino'
  | 'r4_c08_bear'
  | 'r4_c09_yeti'
  | 'r5_c01_swimmer';

export type CharacterCatalogEntry = {
  id: CharacterId;
  displayName: string;
  /** Human-readable sheet cell note */
  sheetRef: string;
};

export const CHARACTER_CATALOG: CharacterCatalogEntry[] = [
  {
    id: 'r1_c01_witch',
    displayName: 'Witch',
    sheetRef: 'Row 1, col 1'
  },
  { id: 'r1_c02_chef', displayName: 'Chef', sheetRef: 'Row 1, col 2' },
  { id: 'r1_c03_jester', displayName: 'Jester', sheetRef: 'Row 1, col 3' },
  { id: 'r1_c04_rapper', displayName: 'Rapper', sheetRef: 'Row 1, col 4' },
  { id: 'r1_c05_clown', displayName: 'Clown', sheetRef: 'Row 1, col 5' },
  {
    id: 'r1_c06_hipster',
    displayName: 'Hipster',
    sheetRef: 'Row 1, col 6'
  },
  { id: 'r1_c07_zombie', displayName: 'Zombie', sheetRef: 'Row 1, col 7' },
  {
    id: 'r1_c08_ballerina',
    displayName: 'Ballerina',
    sheetRef: 'Row 1, col 8'
  },
  { id: 'r1_c09_cupid', displayName: 'Cupid', sheetRef: 'Row 1, col 9' },
  {
    id: 'r1_c10_cheerleader',
    displayName: 'Cheerleader',
    sheetRef: 'Row 1, col 10'
  },

  { id: 'r2_c01_devil', displayName: 'Devil', sheetRef: 'Row 2, col 1' },
  {
    id: 'r2_c02_caveman',
    displayName: 'Caveman',
    sheetRef: 'Row 2, col 2'
  },
  { id: 'r2_c03_elf', displayName: 'Elf', sheetRef: 'Row 2, col 3' },
  { id: 'r2_c04_santa', displayName: 'Santa', sheetRef: 'Row 2, col 4' },
  {
    id: 'r2_c05_trucker',
    displayName: 'Trucker',
    sheetRef: 'Row 2, col 5'
  },
  { id: 'r2_c06_biker', displayName: 'Biker', sheetRef: 'Row 2, col 6' },
  {
    id: 'r2_c07_prisoner',
    displayName: 'Prisoner',
    sheetRef: 'Row 2, col 7'
  },
  {
    id: 'r2_c08_swimsuit',
    displayName: 'Lifeguard',
    sheetRef: 'Row 2, col 8'
  },
  { id: 'r2_c09_pirate', displayName: 'Pirate', sheetRef: 'Row 2, col 9' },
  {
    id: 'r2_mash_raider',
    displayName: 'Raider',
    sheetRef: 'Devil + pirate mash (default rival)'
  },

  {
    id: 'r3_c01_frankenstein',
    displayName: 'Frankenstein',
    sheetRef: 'Row 3, col 1'
  },
  { id: 'r3_c02_police', displayName: 'Officer', sheetRef: 'Row 3, col 2' },
  {
    id: 'r3_c03_lumberjack',
    displayName: 'Lumberjack',
    sheetRef: 'Row 3, col 3'
  },
  {
    id: 'r3_c04_leather',
    displayName: 'Rider',
    sheetRef: 'Row 3, col 4'
  },
  {
    id: 'r3_c05_vampire',
    displayName: 'Vampire',
    sheetRef: 'Row 3, col 5'
  },
  { id: 'r3_c06_cowboy', displayName: 'Cowboy', sheetRef: 'Row 3, col 6' },
  { id: 'r3_c07_knight', displayName: 'Knight', sheetRef: 'Row 3, col 7' },
  { id: 'r3_c08_sailor', displayName: 'Sailor', sheetRef: 'Row 3, col 8' },
  { id: 'r3_c09_viking', displayName: 'Viking', sheetRef: 'Row 3, col 9' },
  {
    id: 'r3_c10_cavewoman',
    displayName: 'Cavewoman',
    sheetRef: 'Row 3, col 10'
  },

  { id: 'r4_c01_monkey', displayName: 'Monkey', sheetRef: 'Row 4, col 1' },
  { id: 'r4_c02_cow', displayName: 'Cow', sheetRef: 'Row 4, col 2' },
  { id: 'r4_c03_moose', displayName: 'Moose', sheetRef: 'Row 4, col 3' },
  { id: 'r4_c04_bunny', displayName: 'Bunny', sheetRef: 'Row 4, col 4' },
  {
    id: 'r4_c05_kangaroo',
    displayName: 'Kangaroo',
    sheetRef: 'Row 4, col 5'
  },
  {
    id: 'r4_c06_unicorn',
    displayName: 'Unicorn',
    sheetRef: 'Row 4, col 6'
  },
  { id: 'r4_c07_dino', displayName: 'Dino', sheetRef: 'Row 4, col 7' },
  { id: 'r4_c08_bear', displayName: 'Bear', sheetRef: 'Row 4, col 8' },
  { id: 'r4_c09_yeti', displayName: 'Yeti', sheetRef: 'Row 4, col 9' },

  {
    id: 'r5_c01_swimmer',
    displayName: 'Tubeman',
    sheetRef: 'Row 5 (idle / inner tube)'
  }
];

export const DEFAULT_PLAYER_CHARACTER_ID: CharacterId = 'r1_c09_cupid';
export const DEFAULT_ENEMY_CHARACTER_ID: CharacterId = 'r2_mash_raider';

export const CHARACTER_IDS = CHARACTER_CATALOG.map((c) => c.id) as CharacterId[];

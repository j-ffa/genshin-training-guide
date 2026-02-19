/**
 * levelTables.js
 *
 * Hardcoded game data that genshin-db doesn't provide:
 * the EXP and Mora costs to level characters and weapons.
 *
 * Sources: Genshin Impact community wikis and spreadsheets.
 * These are fixed values that don't change between game patches
 * (only new level caps would require an update, which hasn't happened
 * since launch).
 *
 * ─────────────────────────────────────────────────────────────────
 * HOW CHARACTER LEVELLING COSTS WORK IN GENSHIN:
 *
 * Characters need EXP points to level up. EXP is provided by books:
 *   - Hero's Wit         = 20,000 EXP, costs 4,000 Mora
 *   - Adventurer's Exp   =  5,000 EXP, costs 1,000 Mora
 *   - Wanderer's Advice  =  1,000 EXP, costs   200 Mora
 *
 * Mora cost = EXP needed × 0.2  (4000 Mora per 20000 EXP = 0.2)
 *
 * We store cumulative EXP from Level 1 to each level cap milestone.
 * To get the EXP needed for a range, subtract the two cumulative values.
 * ─────────────────────────────────────────────────────────────────
 */

// ──────────────────────────────────────────────────────────
// Character level-up EXP (cumulative from Level 1)
// ──────────────────────────────────────────────────────────

/**
 * Total EXP needed to bring a character from Level 1 to the given level cap.
 * Keys are the level cap milestones used as ascension targets.
 */
export const CHARACTER_CUMULATIVE_EXP = {
  1:  0,
  20: 120_175,
  40: 578_325,
  50: 1_121_825,
  60: 1_893_275,
  70: 2_929_275,
  80: 4_291_775,
  90: 6_091_675,
}

/**
 * Computes the EXP and Mora needed to level a character from currentLevel to targetLevel.
 * Returns { exp, mora, heroWits } where heroWits is the Hero's Wit equivalent (rounded up).
 *
 * currentLevel and targetLevel must be keys in CHARACTER_CUMULATIVE_EXP.
 */
export function getCharacterLevelUpCosts(currentLevel, targetLevel) {
  const fromExp = CHARACTER_CUMULATIVE_EXP[currentLevel] ?? 0
  const toExp   = CHARACTER_CUMULATIVE_EXP[targetLevel]  ?? 0
  const exp     = Math.max(0, toExp - fromExp)
  const mora    = Math.ceil(exp * 0.2)
  // Round up to whole Hero's Wits (20,000 EXP each)
  const heroWits = Math.ceil(exp / 20_000)

  return { exp, mora, heroWits }
}

// ──────────────────────────────────────────────────────────
// Weapon level-up EXP (cumulative from Level 1)
// ──────────────────────────────────────────────────────────

/**
 * Weapon EXP is provided by enhancement ores:
 *   - Mystic Enhancement Ore     = 10,000 EXP, costs 0 Mora (obtained from ores/Parametric Transformer)
 *   - Fine Enhancement Ore       =  2,000 EXP, costs 0 Mora
 *   - Enhancement Ore            =    400 EXP, costs 0 Mora
 *
 * Additionally, there is a Mora cost per ore used:
 *   - Mystic Enhancement Ore: 50 Mora each
 *   - Fine Enhancement Ore:   10 Mora each
 *   - Enhancement Ore:         2 Mora each
 * → Mora rate = EXP × 0.005 (50 Mora per 10,000 EXP)
 *
 * Weapon EXP requirements also scale with rarity — 5★ weapons need more EXP.
 * For simplicity we show the Mystic Enhancement Ore count (rounded up)
 * and approximate Mora cost.
 *
 * Note: These are per-phase cumulative values for a 5★ weapon.
 * 4★ and lower weapons have lower EXP requirements but same milestone structure.
 * We display the 5★ values as the "worst case" planning figure.
 */
export const WEAPON_5STAR_CUMULATIVE_EXP = {
  1:  0,
  20: 404_000,
  40: 1_589_500,
  50: 2_974_500,
  60: 4_936_500,
  70: 7_490_500,
  80: 10_768_500,
  90: 14_941_500,
}

export const WEAPON_4STAR_CUMULATIVE_EXP = {
  1:  0,
  20: 218_000,
  40:  831_500,
  50: 1_521_500,
  60: 2_510_500,
  70: 3_819_500,
  80: 5_491_500,
  90: 7_658_500,
}

export const WEAPON_3STAR_CUMULATIVE_EXP = {
  1:  0,
  20:  98_000,
  40: 361_000,
  50: 643_000,
  60: 1_048_000,
  70: 1_574_000,
  80: 2_239_000,
  90: 3_092_000,
}

/**
 * Returns the EXP, Mora, and Mystic Enhancement Ore count to level
 * a weapon from currentLevel to targetLevel.
 * rarity: 3, 4, or 5 (defaults to 5 if unrecognised)
 */
export function getWeaponLevelUpCosts(currentLevel, targetLevel, rarity = 5) {
  const table =
    rarity === 3 ? WEAPON_3STAR_CUMULATIVE_EXP :
    rarity === 4 ? WEAPON_4STAR_CUMULATIVE_EXP :
                   WEAPON_5STAR_CUMULATIVE_EXP

  const fromExp = table[currentLevel] ?? 0
  const toExp   = table[targetLevel]  ?? 0
  const exp     = Math.max(0, toExp - fromExp)
  // Mora cost ≈ EXP × 0.005 (50 Mora per Mystic Enhancement Ore at 10,000 EXP)
  const mora = Math.ceil(exp * 0.005)
  // Round up to whole Mystic Enhancement Ores (10,000 EXP each)
  const mysticOres = Math.ceil(exp / 10_000)

  return { exp, mora, mysticOres }
}

// ──────────────────────────────────────────────────────────
// Artifact levelling costs
// ──────────────────────────────────────────────────────────

/**
 * Artifact levelling uses "artifact fodder" (other artifacts fed into it)
 * and Mora. The exact cost depends on the rarity and level of the fodder,
 * which is highly variable.
 *
 * For planning purposes, we show the MORA cost only (the main bottleneck),
 * using the cost to level a 5★ artifact from +0 to the target level.
 *
 * Mora costs for a 5★ artifact (cumulative from +0):
 */
export const ARTIFACT_5STAR_CUMULATIVE_MORA = {
  0:  0,
  4:  2_700,
  8:  10_200,
  12: 24_050,
  16: 47_950,
  20: 88_800,
}

/**
 * Returns the Mora cost to level a single 5★ artifact from currentLevel to targetLevel.
 */
export function getArtifactLevelCost(currentLevel, targetLevel) {
  const fromMora = ARTIFACT_5STAR_CUMULATIVE_MORA[currentLevel] ?? 0
  const toMora   = ARTIFACT_5STAR_CUMULATIVE_MORA[targetLevel]  ?? 0
  return Math.max(0, toMora - fromMora)
}

/**
 * Cumulative Artifact EXP (fodder XP) needed to level a 5★ artifact from +0.
 * Source: Genshin Impact community wiki.
 */
export const ARTIFACT_5STAR_CUMULATIVE_XP = {
  0:  0,
  4:  16_300,
  8:  66_650,
  12: 189_325,
  16: 436_675,
  20: 871_500,
}

/**
 * Returns the artifact fodder XP needed to level a 5★ artifact from currentLevel to targetLevel.
 */
export function getArtifactXpCost(currentLevel, targetLevel) {
  const fromXp = ARTIFACT_5STAR_CUMULATIVE_XP[currentLevel] ?? 0
  const toXp   = ARTIFACT_5STAR_CUMULATIVE_XP[targetLevel]  ?? 0
  return Math.max(0, toXp - fromXp)
}

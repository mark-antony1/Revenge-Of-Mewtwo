export const CONTRACT_ADDRESS = '0xDf6a2872dC39F6c5994944bC224e5CeC82C7ba33'

export const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
		moveName: characterData.moveName,
		critChance: characterData.critChance,
		defense: characterData.defense
  };
};

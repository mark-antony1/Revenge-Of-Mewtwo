export const CONTRACT_ADDRESS = '0x3DED648eF0f4C056BB44E7c99E9fFCe3fED547Fd'

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

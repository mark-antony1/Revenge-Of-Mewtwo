export const CONTRACT_ADDRESS = '0xc03304ACb1b5f7FEeD886f8EBE9d217A0e504a1E'

export const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
		moveName: characterData.moveName,
		critChance: characterData.critChance.toNumber(),
		defense: characterData.defense.toNumber(),
    tokenId: characterData.tokenId && characterData.tokenId.toNumber()
  };
};

export const transformCharacterDatas = (characterDatas) => {
  return characterDatas.map(characterData => transformCharacterData(characterData))
}

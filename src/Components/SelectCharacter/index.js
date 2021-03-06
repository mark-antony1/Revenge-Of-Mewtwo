import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData, transformCharacterDatas } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from '../LoadingIndicator';

const SelectCharacter = ({ setCharacterNFTs, setShouldShowSelectCharacters, characterNFTs }) => {
	const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
	const [mintingCharacter, setMintingCharacter] = useState(false);

	const mintCharacterNFTAction = (characterId) => async () => {
		try {
			if (gameContract) {
				setMintingCharacter(true);
				console.log('Minting character in progress...');
				const mintTxn = await gameContract.mintCharacterNFT(characterId);
				await mintTxn.wait();
				console.log('mintTxn:', mintTxn);
				setMintingCharacter(false);
			}
		} catch (error) {
			console.warn('MintCharacterAction Error:', error);
			setMintingCharacter(false);
			alert(error)
		}
	};

	useEffect(() => {
		const { ethereum } = window;
	
		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const gameContract = new ethers.Contract(
				CONTRACT_ADDRESS,
				myEpicGame.abi,
				signer
			);
	
			setGameContract(gameContract);
		} else {
			console.log('Ethereum object not found');
		}
	}, []);

	useEffect(() => {
		const getCharacters = async () => {
			try {
				// console.log('Getting contract characters to mint');
	
				const charactersTxn = await gameContract.getAllDefaultCharacters();
				// console.log('charactersTxn:', charactersTxn);
	
				const characters = charactersTxn.map((characterData) =>
					transformCharacterData(characterData)
				);
	
				setCharacters(characters);
			} catch (error) {
				console.error('Something went wrong fetching characters:', error);
			}
		};

		const onCharacterMint = async (sender, tokenId, characterIndex) => {
			console.log(
				`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
			);
	
			if (gameContract && characters.length > 0) {
				const txn = await gameContract.checkIfUserHasNFTs();
				console.log("txn", txn)
				if (txn.length > 0) {
					console.log('User has character NFT');
					setCharacterNFTs(transformCharacterDatas(txn));
				} else {
					console.log('No NFTs found');
				}
			}
		};
	
		if (gameContract) {
			getCharacters();
			gameContract.on('CharacterNFTMinted', onCharacterMint);
		}

		return () => {
			if (gameContract) {
				gameContract.off('CharacterNFTMinted', onCharacterMint);
			}
		};
	}, [gameContract, characters, setCharacterNFTs]);

	const renderCharacters = () =>
		characters.map((character, index) => (
			<div className="character-item" key={character.name}>
				<div className="name-container">
					<p>{character.name}</p>
				</div>
				<img src={character.imageURI} alt={character.name} />
					<p>HP: {character.hp + ", Defense: " + character.defense + ", Crit Chance: " + character.critChance}</p>
					<p>Move: {character.moveName + ", Damage: " + character.attackDamage}</p>
					<p>{character.name}</p>
				<button
					type="button"
					className="character-mint-button"
					onClick={mintCharacterNFTAction(index)}
				>{`Mint ${character.name}`}</button>
			</div>
		));

  return (
    <div className="select-character-container">
      <h2>Mint Your Pokemon Team!.</h2>
			{mintingCharacter && (
				<div className="loading">
					<div className="indicator">
						<LoadingIndicator />
						<p>Minting In Progress...</p>
					</div>
					<iframe title='title' src="https://giphy.com/embed/e0fBwrA1jHnksgns2e" width="480" height="272" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>
				</div>
			)}
			{characters.length > 0 && (
				<div className="character-grid">{renderCharacters()}</div>
			)}
			{characterNFTs && characterNFTs.length > 0 &&
				<button className='cta-button' style={{backgroundColor: '#a200d6', marginTop: '10px'}} onClick={() => setShouldShowSelectCharacters(false)}>
					Go To Arena
				</button>
			}
    </div>
  );
};

export default SelectCharacter;
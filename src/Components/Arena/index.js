import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator';

/*
 * We pass in our characterNFT metadata so we can a cool card in our UI
 */
const Arena = ({ characterNFTs, setCharacterNFTs, setShouldShowSelectCharacters }) => {
  // State
  const [gameContract, setGameContract] = useState(null);
	const [boss, setBoss] = useState(null);
	const [attackState, setAttackState] = useState('');
	const [showToastBoss, setShowToastBoss] = useState(false);
	const [showToastCharacter, setShowToastCharacter] = useState(false);
	const [attackingCharacterIndex, setAttackingCharacterIndex] = useState(null);


	const runAttackAction = async (tokenId, characterIndex) => {
		try {
			if (gameContract) {
				console.log('attacking with character at index', characterIndex);
				setAttackingCharacterIndex(characterIndex)
				console.log(characterNFTs[characterIndex].name + ' is Attacking mewtwo...');
				const attackTxn = await gameContract.attackBossV2(tokenId);
				await attackTxn.wait();
				console.log("attacking character index in runAttackAction", attackingCharacterIndex)
				setAttackState('hit');

				setShowToastBoss(true);
				setTimeout(() => {
					setShowToastBoss(false);
					setShowToastCharacter(true);
					setTimeout(() => {
						setShowToastCharacter(false);
						setAttackState('');
						setAttackingCharacterIndex(null)
					},10000)
				}, 10000);

			}
		} catch (error) {
			console.error('Error attacking boss:', error);
			setAttackState('');
		}
	};


  // UseEffects
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
		const fetchBoss = async () => {
			const bossTxn = await gameContract.getBigBoss();
			console.log('Boss:', bossTxn);
			setBoss(transformCharacterData(bossTxn));
		};
	
		if (gameContract) {
			fetchBoss();
		}
	}, [gameContract]);

	useEffect(() => {
			/*
		* Setup logic when this event is fired off
		*/
		const onAttackComplete = (newBossHp, newPlayerHp, tokenId) => {
			console.log('newBossHp', newBossHp, "newplayerhp", newPlayerHp, "tokenId", tokenId)
			const bossHp = newBossHp.toNumber();
			const playerHp = newPlayerHp.toNumber();
			const attackingTokenId = tokenId.toNumber();


			console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

			/*
			* Update both player and boss Hp
			*/
			setBoss((prevState) => {
					return { ...prevState, hp: bossHp };
			});

			setCharacterNFTs((prevState) => {
					console.log("prev", prevState)
					const newPokemonState = prevState.map(pokemon => {
						if(pokemon.tokenId !== attackingTokenId) {
							return pokemon
						} else {
							return {
								...pokemon,
								hp: newPlayerHp,
							}
						}
					})
					console.log('newPoke state', newPokemonState)
					return newPokemonState;
			});
		};

		const fetchBoss = async () => {
				const bossTxn = await gameContract.getBigBoss();
				console.log('Boss:', bossTxn);
				setBoss(transformCharacterData(bossTxn));
		};

		if (gameContract) {
				fetchBoss();
				gameContract.on('AttackComplete', onAttackComplete);
		}

		/*
		* Make sure to clean up this event when this component is removed
		*/
		return () => {
				if (gameContract) {
						gameContract.off('AttackComplete', onAttackComplete);
				}
		}
}, [gameContract, setCharacterNFTs]);


  return (
    <div className="arena-container">
			{boss && characterNFTs && attackingCharacterIndex && (
				<div>
					<div id="toast" className={showToastBoss ? 'show' : ''}>
						<div id="desc">
							<div>{`💥 ${boss.name} was hit for ${characterNFTs[attackingCharacterIndex].attackDamage}!`}</div><br/>
							<div>{boss.hp === 0 ? boss.name + " fainted!" : ""}</div>
						</div>
					</div>
					<div id="toast" className={showToastCharacter ? 'show' : ''}>
						<div id="desc">
							<div>{`💥 ${characterNFTs[attackingCharacterIndex].name} was hit for ${boss.attackDamage}!`}</div><br/>
							<div>{characterNFTs[attackingCharacterIndex].hp === 0 ? characterNFTs[attackingCharacterIndex].name + " fainted!" : ""}</div>
						</div>
					</div>
				</div>
			)}
			{boss && (
				<div className="boss-container">
					<div className={`boss-content ${attackState}`}>
						<h2>🔥 {boss.name} 🔥</h2>
						<div className="image-content">
							<img src={boss.imageURI} alt={`Boss ${boss.name}`} />
							<div className="health-bar">
								<progress value={boss.hp} max={boss.maxHp} />
								<p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
							</div>
						</div>
					</div>
					{attackState === 'attacking' && (
						<div className="loading-indicator">
							<LoadingIndicator />
							<p>Attacking ⚔️</p>
						</div>
					)}
				</div>
			)}

			<h2 >Need More Pokemon?</h2>
			{characterNFTs && characterNFTs.length > 0 &&
				<button className='cta-button' style={{backgroundColor: '#a200d6'}} onClick={() => setShouldShowSelectCharacters(true)}>
					Click Here
				</button>
			}

			{characterNFTs && boss && 
				<div className="players-container">
					<div className="player-container">
						<h2>Your Team</h2>
						<div style={{display: 'flex', flexWrap: 'wrap'}}>
							{console.log("characterNFTs", characterNFTs) || characterNFTs.map((characterNFT, characterIndex) => 
								<div key={characterIndex}>
									<div className="player" style={{margin: '20px'}}>
										<div className="image-content">
											<h2>{characterNFT.name}</h2>
											<img
												src={characterNFT.imageURI}
												alt={`Character ${characterNFT.name}`}
											/>
											<div className="health-bar">
												<progress value={characterNFT.hp} max={characterNFT.maxHp} />
												<p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
											</div>
										</div>
										<div className="stats">
											<h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
										</div>
									</div>
									<div className="attack-container">
										<button className="cta-button" onClick={() => runAttackAction(characterNFT.tokenId, characterIndex)}>
											{`💥 Use ${characterNFT.moveName} on ${boss.name}`}
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			}
    </div>
  );
};

export default Arena;
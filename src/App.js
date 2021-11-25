import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import SelectCharacter from './Components/SelectCharacter';
import myEpicGame from './utils/MyEpicGame.json';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants'
import { ethers } from 'ethers';
import './App.css';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';



// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const RINKEBY_NETWORK_ID = '0x4'

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRinkebyNetwork, setIsRinkebyNetwork] = useState(true);


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        ethereum.on('chainChanged', checkIfWalletIsConnected);
        if(chainId !== RINKEBY_NETWORK_ID) {
          setIsRinkebyNetwork(false)
          setIsLoading(false)
          setCharacterNFT(null)
          setCurrentAccount(null)
          return
        }
  
        const accounts = await ethereum.request({ method: 'eth_accounts' });
  
        if (accounts.length !== 0) {
          const account = accounts[0];
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      } 
  
    } catch (error) {
      console.log(error)
    }
    
    setIsLoading(false);
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }

      setIsLoading(false);
    };
  
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

    useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
  
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }

      setIsLoading(false);
    };
  
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  const renderConnectButtonText = () => {
    if (!isRinkebyNetwork) {
      return "Please Connect To Rinkeby"
    } else {
      return currentAccount ? "Account " + currentAccount : 'Connect Wallet To Get Started'
    }

  }

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!currentAccount) {
      return <div className="connect-wallet-container">
        <img
          src="http://img02.deviantart.net/5c28/i/2016/222/d/b/my_kanto_pokemon_team_by_pokeminecraftfav-dadf9vu.png"
          alt="Ash Team Pic"
        />
        <button
          disabled={!isRinkebyNetwork}
          className="cta-button connect-wallet-button"
          style={isRinkebyNetwork ? {} : {background: "gray"}}
          onClick={connectWalletAction}
        >
          {renderConnectButtonText()}
        </button>
      </div>
    } else if (currentAccount && !characterNFT){
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT}/>;
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Revenge of Mewtwo ⚔️</p>
          <p className="sub-text">Build up a team to protect the Kanto region from Mewtwo!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;

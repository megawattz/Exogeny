// Check if MetaMask is installed

import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";
import * as utils from "./utils.mjs";

const EVMchains = {
    arbitrumOne: "0xa4b1",         // Arbitrum One
    arbitrumRinkeby: "0x66eeb",    // Arbitrum Rinkeby Testnet
    avalanche: "0xa86a",           // Avalanche C-Chain
    AVAX: "0xa86a",           	   // Avalanche C-Chain
    avalancheFuji: "0xa869",       // Avalanche Fuji C-Chain (Testnet)
    binanceSmartChain: "0x38",     // Binance Smart Chain Mainnet
    BNB: "0x38",     // Binance Smart Chain Mainnet
    bscTestnet: "0x61",            // Binance Smart Chain Testnet
    celo: "0xa4ec",                // Celo Mainnet
    celoAlfajores: "0xaef3",       // Celo Alfajores Testnet
    cronos: "0x19",                // Cronos Mainnet
    cronosTestnet: "0x152",        // Cronos Testnet
    ethereum: "0x1",               // Ethereum Mainnet
    ETH: "0x1",                    // Ethereum Mainnet
    sepolia: "0xaa36a7",	   // Sepolia (ethereum Testnet)
    fantom: "0xfa",                // Fantom Opera
    FTM: "0xfa",                // Fantom Opera
    fantomTestnet: "0xfa2",        // Fantom Testnet
    goerli: "0x5",                 // Goerli Testnet
    harmony: "0x63564c40",         // Harmony Mainnet
    harmonyTestnet: "0x6357d2e0",  // Harmony Testnet
    kovan: "0x2a",                 // Kovan Testnet
    moonbaseAlpha: "0x507",        // Moonbase Alpha Testnet
    moonriver: "0x505",            // Moonriver
    mumbai: "0x13881",             // Mumbai Testnet (Polygon)
    optimism: "0xa",               // Optimism
    optimismKovan: "0x45",         // Optimism Kovan
    polygon: "0x89",               // Polygon Mainnet
    MATIC: "0x89",               // Polygon Mainnet
    rinkeby: "0x4",                // Rinkeby Testnet
    ropsten: "0x3",                // Ropsten Testnet
};

export const web3utils = {
    Provider: {},  // default to ethereum
    
    CallFunction: async function(contractAddress, abi, functionName, ...params) {
        try {
            // Request account access
            //await window.ethereum.request({ method: 'eth_requestAccounts' });
	    
            // Create a new provider and signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []); // Request account access if needed
            const signer = provider.getSigner();

            // Create contract instance
            const contract = new ethers.Contract(contractAddress, abi, signer);

            // Call the specified function with the provided parameters
            const result = await contract[functionName](...params);

            //console.log(`Result of ${functionName}:`, result);
            return result;
        } catch (error) {
            console.error(error.message);
            throw error;
        }
    },
    
    WalletAddress: async function() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access if needed
                await window.ethereum.request({ method: 'eth_requestAccounts' });
		
                // Create a new provider
                const provider = new ethers.providers.Web3Provider(window.ethereum);
		web3utils.Provider = provider;
		
                // Get the signer
                const signer = provider.getSigner();
		
                // Get the wallet address
                const walletAddress = await signer.getAddress();

                return walletAddress;
            } catch (error) {
                console.error('Error getting wallet address:', error);
                throw error;
            }
        } else {
            console.error('MetaMask is not installed.');
            throw new Error('MetaMask is not installed.');
        }
	
    },
    
    ConnectWallet: async function(chain) {
	if (typeof window.ethereum !== 'undefined') {
	    console.log('Ethereum wallet is detected!');

	    // Use the request method to ask for the 'eth_accounts' permission
	    var accounts;
	    try {
		accounts = await window.ethereum.request({
		    method: 'eth_requestAccounts',
		    params: [{'chainId': chain}]
		})	
	    } catch(error) {
		console.error(`Error connecting to wallet:${error}`);
		throw error; // Handle any errors that occur during the request
	    }
	    
	    if (accounts.length > 0) {
		const account = accounts[0];
		console.log('Connected account:', account);
		this.CurrentChainId = chain; // if we connected successfully, store this chain
		return account;
		// You can now use this account to interact with the Ethereum blockchain
	    } else {
		console.error('No accounts found.');
		throw new Error("No accounts in your wallet");
	    }
	} else {
	    // Ethereum wallet is not available
	    console.error('Please install an Ethereum wallet like MetaMask to use this feature.');
	    throw new Error('Please install an Ethereum wallet like MetaMask to use this feature.');
	}	
    },
    
    ChainId: function(chainName) {
	const chainId = EVMchains[chainName];
	if (!chainId)
	    throw new Error(`Unknown chain: ${chainName}`);
    	return chainId;
    },
    
    GetNFTs: async function(wallet, contractAddress)
    {
	// get the metadata base URL on the IPFS file system
	let abi = [ "function uri(uint256 _id) external view returns (string memory)" ];
	const nftsURI = await web3utils.CallFunction(contractAddress, abi, "uri", 0);
	//console.log(`Contract IPFS base URL: ${nftsURI}`);

	// get a list of NFTs owned by this user
	abi = ["function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory)"];
	const nfts = Array.from({ length: 200 }, (_, i) => i + 1);
	let accounts = [];
	nfts.forEach(() => {
	    accounts.push(wallet);
	});
	const allNFTs = await web3utils.CallFunction(contractAddress, abi, "balanceOfBatch", accounts, nfts);
	//console.log(`All NFTS: ${allNFTs}`);
	let ownedNFTs = []
	for (let id in allNFTs) {
	    const count = allNFTs[id].toNumber();
	    if ( count > 0)
		ownedNFTs.push(id);
	}
	//console.log(`Owned NFTS: ${ownedNFTs}`);
	//console.log(`Owned NFTS: ${ownedNFTs.length}`);
	// get the metadata associated with each NFT
	const NFTmetadata = [];
	let promises = [];
	for (let nftid of ownedNFTs) {
	    let idstring = parseInt(nftid).toString(16);
	    let url = nftsURI.replace("{id}", idstring.padStart(64, '0'));
	    //console.log(url);
      	    let p = fetch(url).then(response => response.json()).then((data) => NFTmetadata.push(data)).catch(console.error); // NFTmetadata.push).catch(console.error);
	    promises.push(p);
	}
	await Promise.all(promises)
	return NFTmetadata;	
    },
    
    FetchNFTs: async function(wallet, contractAddress, callback)
    {
	// get the metadata base URL on the IPFS file system
	let abi = [ "function uri(uint256 _id) external view returns (string memory)" ];
	const nftsURI = await web3utils.CallFunction(contractAddress, abi, "uri", 0);
	//console.log(`Contract IPFS base URL: ${nftsURI}`);

	// get a list of NFTs owned by this user
	abi = ["function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory)"];
	const nfts = Array.from({ length: 1000 }, (_, i) => i + 1);
	let accounts = [];
	nfts.forEach(() => {
	    accounts.push(wallet);
	});
	const allNFTs = await web3utils.CallFunction(contractAddress, abi, "balanceOfBatch", accounts, nfts);
	//console.log(`All NFTS: ${allNFTs}`);
	let ownedNFTs = []
	for (let id in allNFTs) {
	    const count = allNFTs[id].toNumber();
	    if ( count > 0)
		ownedNFTs.push(id);
	}
	//console.log(`Owned NFTS: ${ownedNFTs}`);
	//console.log(`Owned NFTS: ${ownedNFTs.length}`);
	// get the metadata associated with each NFT
	const NFTmetadata = [];
	for (let nftid of ownedNFTs) {
	    let idstring = parseInt(nftid).toString(16);
	    let url = nftsURI.replace("{id}", idstring.padStart(64, '0'));
      	    let p = fetch(url)
		.then(response => response.json())
	    	.then(callback)
		.catch(console.error); // NFTmetadata.push).catch(console.error);
	}
    },
    
    GetNFTids: async function(wallet, contractAddress)
    {
	// get a list of NFTs owned by this user
	let abi = ["function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory)"];
	const nfts = Array.from({ length: 1000 }, (_, i) => i + 1);
	let accounts = [];
	nfts.forEach(() => {
	    accounts.push(wallet);
	});
	const allNFTs = await web3utils.CallFunction(contractAddress, abi, "balanceOfBatch", accounts, nfts);
	//console.log(`All NFTS: ${allNFTs}`);
	let ownedNFTs = []
	for (let id in allNFTs) {
	    const count = allNFTs[id].toNumber();
	    if ( count > 0)
		ownedNFTs.push(id);
	}
	return ownedNFTs;
    },
    
    FetchNFT: async function(wallet, contractAddress, tokenid)
    {
	// get the metadata base URL on the IPFS file system
	let abi = [ "function uri(uint256 _id) external view returns (string memory)" ];
	const nftsURI = await web3utils.CallFunction(contractAddress, abi, "uri", 0);
	// get how many of an NFT (token) this user owns
	abi = ["function balanceOf(address account, uint256 id) external view returns (uint256)"];
	const howmany = await web3utils.CallFunction(contractAddress, abi, "balanceOf", wallet, tokenid);
	if (howmany < 1)
	    return {};
	let idstring = tokenid.toString(16);
	let url = nftsURI.replace("{id}", idstring.padStart(64, '0'));
      	let nft = await fetch(url)
	    .then(response => response.json())
	    .catch(console.error); // NFTmetadata.push).catch(console.error);
    	return nft;
    }
}

// Check if MetaMask is installed

import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";

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
    CurrentChainId: 0x1,  // default to ethereum
    GetNFTs: async function(wallet, chainId, contractAddress) {
	try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create a new provider and signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
	    const walletAddress = signer.getAddress();
	    
            // ERC1155 contract address and ABI
            const abi = [
                "function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external view returns (uint256[] memory)"
            ];
	    
            // Create contract instance
            const contract = new ethers.Contract(contractAddress, abi, signer);
	    
            // Example token IDs and corresponding wallet addresses
	    if (!this.ContractNFTs)
		this.ContractNFTs = Array.from({ length: 1000 }, (_, i) => i + 1);
	    const ownerAddresses = this.ContractNFTs.map(() => wallet);
	    
            // Call balanceOfBatch
            const balances = await contract.balanceOfBatch(ownerAddresses, this.ContractNFTs);
	    
            // Display the balances
            const result = this.ContractNFTs.map((tokenId, index) => ({
                tokenId: tokenId,
                count: balances[index].toNumber()
            })).filter(item => item.count > 0);
	    
            console.log(`Owned NFTs: ${JSON.stringify(result, null, 2)}`);
        } catch (error) {
            console.error('Failed to retrieve NFTs:', error);
            throw error;
        }	
    },
    ConnectWallet: async function(chain) {
	chain = chain || this.CurrentChainId;
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
    }
}


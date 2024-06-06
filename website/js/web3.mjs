// Check if MetaMask is installed

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
    GetNFTs: async function(wallet, chainId, contract) {
        try {
            // Switch to the specified chain
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ 'chainId': chainId }], // Chain ID must be in hexadecimal
            });

            // Get the balance of NFTs (using the ERC-721 balanceOf function signature)
	    //const balanceMethod = '0x70a08231'; // balanceOf ABI signature
	    const balanceMethod = '0x4e1273f4'; // balanceOfBatch ABI identifier
            const balanceParams = wallet.toLowerCase().padStart(64, '0'); // 32 bytes hex format
            const balanceData = balanceMethod + balanceParams;

            const balance = await window.ethereum.request({
                method: 'eth_call',
                params: [{
                    to: contract,
                    data: balanceData
                }, 'latest']
            });

            // Convert the balance result from hex to number
            const tokenCount = parseInt(balance, 16);
            const nfts = [];

            // Loop to get each NFT ID owned by the wallet
            for (let i = 0; i < tokenCount; i++) {
                const tokenOfOwnerByIndexMethod = '0x2f745c59'; // tokenOfOwnerByIndex ABI signature
                const indexParams = i.toString(16).padStart(64, '0');
                const tokenData = tokenOfOwnerByIndexMethod + balanceParams + indexParams;

                const tokenId = window.ethereum.request({
                    method: 'eth_call',
                    params: [{
                        to: contract,
                        data: tokenData
                    }, 'latest']
                });

                // Convert token ID from hex to number
                nfts.push(parseInt(tokenId, 16));
            }

            console.log(`NFTs owned by ${wallet}:`, nfts);
            return nfts;
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


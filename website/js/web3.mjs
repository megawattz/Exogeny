// Check if MetaMask is installed
export const web3utils = {
    GetNFTS: function(wallet, chainId, contract) {
        try {
            // Switch to the specified chain
            window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }], // Chain ID must be in hexadecimal
            });

            // Get the balance of NFTs (using the ERC-721 balanceOf function signature)
            const balanceMethod = '0x70a08231'; // balanceOf ABI signature
            const balanceParams = wallet.toLowerCase().padStart(64, '0'); // 32 bytes hex format
            const balanceData = balanceMethod + balanceParams;

            const balance = window.ethereum.request({
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
    ConnectWallet: function() {
	if (typeof window.ethereum !== 'undefined') {
	    console.log('Ethereum wallet is detected!');

	    // Use the request method to ask for the 'eth_accounts' permission
	    window.ethereum.request({ method: 'eth_requestAccounts' })
		.then(accounts => {
		    if (accounts.length > 0) {
			const account = accounts[0];
			console.log('Connected account:', account);
			// You can now use this account to interact with the Ethereum blockchain
		    } else {
			console.log('No accounts found.');
		    }
		})
		.catch(error => {
		    // Handle any errors that occur during the request
		    console.error('Error connecting to wallet:', error);
		});
	} else {
	    // Ethereum wallet is not available
	    console.error('Please install an Ethereum wallet like MetaMask to use this feature.');
	}
    }
}


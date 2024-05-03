// Check if MetaMask is installed
export const web3utils = {
    // Function to connect to the user's Ethereum wallet
    ConnectWallet: function() {
	// First, check if the Ethereum object is available in the window
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


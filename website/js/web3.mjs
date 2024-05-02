
// Check if MetaMask is installed
function ConnectWallet() {
    if (typeof web3.ethereum !== 'undefined') {
	const web3 = new Web3(window.web3);

	// Request user permission to connect
	web3.eth.requestAccounts()
            .then((accounts) => {
		const connectedAccount = accounts[0];
		console.log('Connected account:', connectedAccount);
		// You can now use the connected account for further interactions
            })
            .catch((error) => {
		console.error('Error connecting Wallet:', error.message);
		alert(`Error connecting wallet: ${error.message}`);
            });
    } else {
	console.error('Wallet not installed.');
    }	
}
	alert(`Wallet not installed`)
    }
}

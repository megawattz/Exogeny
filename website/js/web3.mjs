// Load Moralis library from the internet (CDN)
const script = document.createElement("script");
script.src = "https://unpkg.com/moralis@0.0.1/dist/moralis.min.js"; // Replace with the latest version
document.head.appendChild(script);

// Function to get all NFTs owned by a wallet
async function getAllNFTsForWallet(appid) {
    try {
        // Initialize Moralis
        await Moralis.start({ appId: "40404f45-4281-485b-b2fe-b7b39b3ba25c" }); // Replace with your Moralis app ID

        // Prompt the user to connect their wallet
        const user = await Moralis.authenticate();

        // Get NFTs owned by the connected wallet
        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            chain: "0x1", // Ethereum Mainnet (adjust for other chains)
            address: user.get("ethAddress"),
            mediaItems: false, // Set to true if you want media data
        });

        // Extract relevant NFT information (e.g., token IDs, contract addresses)
        const nftsOwned = response.result.map((nft) => ({
            tokenAddress: nft.token_address,
            tokenId: nft.token_id,
            contractType: nft.contract_type,
            // Add other relevant fields as needed
        }));

        return nftsOwned;
    } catch (error) {
        console.error("Error fetching NFTs:", error);
        return [];
    }
}

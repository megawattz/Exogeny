// Alchemy Functions (web3 API)
import { Network, Alchemy) from 'alchemy-sdk');                                                                                              

var AlchemyKey = "OXQ9OL4CNS6zMahKZlQyIaV8Zdkqpctp";
var AlchemyServer = "https://polygon-mumbai.g.alchemy.com/v2/OXQ9OL4CNS6zMahKZlQyIaV8Zdkqpctp";

const Alchemy = new alchemy.

// get NFTs
export function getNfts(walletAddress, options) {
    return alchemy.getNftsForOwner(walletAdress, options)
}

const Alchemy = new alchemy.

// get NFTs
export function getNfts(walletAddress, options) {
    return alchemy.getNftsForOwner(walletAdress, options)
}

// WalletConnect functions Web3 wallet functions
import { WalletConnectModalAuth } from "@walletconnect/modal-auth-html";

export const modal = new WalletConnectModalAuth({
    projectId,
    metadata: {
      name: `process.env.get("APPNAME")`,
      description: "My Dapp description",
      url: "https://my-dapp.com",
      icons: ["https://my-dapp.com/logo.png"],
    },
  });
  
  // 4. Sign In
  async function onSignIn() {
    try {
      const data = await modal.signIn({ statement: "Login" });
      console.info(data);
    } catch (err) {
      console.error(err);
    }
  }
  
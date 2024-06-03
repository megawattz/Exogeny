// generic utility functions
export function ezhash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5 - hash) + str.charCodeAt(i);
        hash = hash * hash; // Convert to 32bit integer
    }
    return hash;
}

export function extractDomain(hostname) {
    if (!hostname)
	hostname = window.location.hostname;
    const match = hostname.match(/(?:.*\.)?(\w+)(?:\.\w+)?$/);
    return match ? match[1] : null;
}

export function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/; max-age=${365*86400}; domain=${extractDomain()}; secure`;
    return document.cookie;
}

export function getCookie(name) {
    let hits = document.cookie.match(`${name}=([^;]*)`);
    if (!hits)
	return null;
    return hits[1];
}

var Config = {
    "zoom_factor": 1.5,
    "unfocus_system_label_opacity": 0.3,
    "focus_system_label_opacity": 1,
    "system_sphere_radius": 12,
    "system_sphere_opacity": 0.1,
    "galaxy_diameter": 2000,
    "light_year_units": 5,
    "ipfs_gateway": "https://ipfs.io/",
};

var sector = getCookie("sector") || "nebular";

export async function LoadPlanets(configOut, planetsOut) {
    // load config
    await fetch('configs/galaxy.json', { headers: {'Cache-Control':'no-cache'} })
    	.then((response) => response.json())
    	.then((data) => Object.assign(configOut, data))
    	.then(() => console.log(configOut))
    	.catch((error) => console.error(error))

    // load planets
    await fetch(`configs/${sector}/planets.json`)
    	.then((response) => response.json())
    	.then((data) => Object.assign(planetsOut, data))
        .then(() => console.log(planetsOut))
    	.then(fetch(`configs/${sector}/planets.json`)
	      .then((response) => response.json())	
	      .then((data) => { planetsOut = data } ))
}		

export async function FetchJSON(url) {
    return fetch(url, { headers: {'Cache-Control':'no-cache'} })
    	.then((response) => response.json())
    	.then((data) => Object.assign(configOut, data))
    	.then(() => console.log(configOut))
    	.catch((error) => console.error(error))
}

export function RandomInt(low, high) {
    let diff = Math.abs(high - low);
    return Math.floor(Math.random() * diff + low);
}

export async function connectWallet(whichNetwork) {
    if (window.ethereum) {
	let web3 = new Web3(window.ethereum);
	//window.ethererum.enable();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const networkId = await window.ethereum.request({ method: 'net_version' });
	if (networkId != whichNetwork)
	    throw new Error(`You must connect your wallet to network: {whichNetwork}`);
        console.log("Connected to network ID:", networkId);
        return accounts[0]; // Returns the first account
    } else {
        throw new Error("You need to install a cryptocurrency wallet")
    }
}

import * as abis from './standard-abi.mjs';

export async function getTokenURI(chain, contractAddress, tokenId) {
    const userAddress = await connectWallet(chain); // Make sure the user is connected
    if (!userAddress)
	throw new Error("Wallet not connected");
    let web3 = new Web3(window.ethereum);
    let abi = abis.abis['erc1155'];
    const contract = new web3.eth.Contract(abi, contractAddress);
    const tokenURI = await contract.methods.uri(tokenId).call();
    return tokenURI.replace('{id}', tokenId.toString(16).padStart(64, '0'))
}

export async function fetchNFTMetadata(tokenURI) {
    const url = tokenURI;
    const response = await fetch(tokenURI);
    const metadata = await response.json();
    console.log("NFT Metadata:", metadata);
       return metadata;
}

export async function getNFTMetadata(chain, contractAddress, tokenId) {
    const tokenURI = await getTokenURI(chain, contractAddress, tokenId);
    if (tokenURI) {
        const metadata = await fetchNFTMetadata(tokenURI);
        return metadata;
    }
    return null;
}


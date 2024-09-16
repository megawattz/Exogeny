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
    if (hostname.match(/^\d+\.\d+\.\d+\.\d+/))
	return null;
    const match = hostname.match(/(?:.*\.)?(\w+)(?:\.\w+)?$/);
    return match ? match[1] : null;
}

export function setCookie(name, value, options) {
    let newcookie = `${name}=${value}; path=/; max-age=${365*86400}`;
    document.cookie = newcookie;
    return document.cookie;
}

export function getCookie(name) {
    let hits = document.cookie.match(`${name}=([^;]*)`);
    if (!hits)
	return null;
    return hits[1];
}

export function modulo(dividend, divisor) {
      return ((dividend % divisor) + divisor) % divisor;
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

await fetch('configs/galaxy.json', { headers: {'Cache-Control':'no-cache'} })
    .then((response) => response.json())
    .then((data) => Config = data)
    .catch(console.error)

var sector = getCookie("sector") || "nebular";

export async function LoadPlanets(planetsOut) {
    // load planets
    return fetch(`configs/${sector}/planets.json`)
    	.then((response) => response.json())
	.then((data) => {
	    if (planetsOut) planetsOut = data;
	    return data;
	});
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

// capitalize each word in a phrase and replace _ with ' '
export function titleize(sentence) {
    try {
	const words = `${sentence}`.split(/[_ ]+/);
	let fixup = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
	fixup = fixup.join(' ');
	// capitalize roman numerals
	fixup = fixup.replace(/[xiv]*[xiv]+(?![a-hj-uwyz])/gi, (s) => s.toUpperCase());
	return fixup;
    } catch(exc) {
	return "";
    }
}

export function fromRoman(roman) {
    const map = {
	"Prime": 1,
	"I": 1,
	"II": 2,
	"III": 3,
	"IV": 4,
	"V": 5,
	"VI": 6,
	"VII": 7,
	"VIII": 8,
	"IX": 9,
	"X": 10,
	"XI": 11,
	"XII": 12,
	"XIII": 13,
	"XIV": 14,
	"XV": 15,
	"XVI": 16,
	"XVII": 17,
	"XVIII": 18,
	"XIX": 19,
	"XX": 20,
	"XXI": 21,
	"XXII": 22,
	"prime": 1,
	"i": 1,
	"ii": 2,
	"iii": 3,
	"iv": 4,
	"v": 5,
	"vi": 6,
	"vii": 7,
	"viii": 8,
	"ix": 9,
	"x": 10,
	"xi": 11,
	"xii": 12,
	"xiii": 13,
	"xiv": 14,
	"xv": 15,
	"xvi": 16,
	"xvii": 17,
	"xviii": 18,
	"xix": 19,
	"xx": 20,
	"xxi": 21,
	"xxii": 22
    };
    return map[roman] || roman;
}

export function fromRomanEmbedded(str) {
    function romanOnly(all, white, roman) {
	return " " + fromRoman(roman);
    }
    
    let rval = str.replace(/(\s)([xiv]*[xiv]+)(?![a-hj-uwyz])/gi, romanOnly);
    return rval;
}

export function toRoman(arabic) {
    const map = {
	"1": "Prime",
	"2":"II",
	"3":"III",
	"4":"IV",
	"5":"V",
	"6":"VI",
	"7":"VII",
	"8":"VIII",
	"9":"IX",
	"10":"X",
	"11":"XI",
	"12":"XII",
	"13":"XIII",
	"14":"XIV",
	"15":"XV",
	"16":"XVI",
	"17":"XVII",
	"18":"XVIII",
	"19":"XIX",
	"20":"XX",
	"21":"XXI",
	"22":"XXII"
    };
    return map[arabic] || arabic;
}

export function ordinal(place) {
    const map = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th"];
    return map[place] || "";
}

export function sprintf() {
    let args = Array.from(arguments);
    let str = args[0];
    for (let key in args) {
	str = str.replaceAll('{'+key+'}', args[key]);
    }
    return str;
};

export function fadein(element, seconds) {
    let step = 1/(seconds * 10); // updates opacity every 100 milliseconds
    var op = 0;
    var timer = setInterval(function() {
        if (op >= 0.9) {
	    op = 1;
	    clearInterval(timer);
	}
	op += step;
	element.style.opacity = op;
	console.log(op);
    }, 100);
}

export function fadeout(element, seconds) {
    let step = 1/(seconds * 10); // updates opacity every 100 milliseconds
    var op = element.style.opacity;
    var timer = setInterval(function() {
        if (op <= 0.01) {
	    op = 0;
	    clearInterval(timer);
	}
	op -= step;
	element.style.opacity = op;
    }, 100);
}

export function randomPlanet() {
    if (!Planets || Planets.length < 1) {
	loadPlanets();
	return "video/planet_852f9f7e-eb5e-4df0-be17-5f8c76da2ec4.mp4";
    }
    let pcount = Planets.length;
    let index = Math.floor(Math.random() * pcount);
    return Planets[index].planet_video;
}

export function randomCulture() {
    let cultures = [
	"adventurous.png",
	"cooperative.png",
	"egalitarian.png",
	"hive.png",
	"organized.png",
	"military.png",
	"practical.png",
	"religious.png",
	"selfless.png"
    ];
    let index = Math.floor(Math.random() * cultures.length);
    return cultures[index];
}

var defaultGateway = new RegExp("http.?://ipfs.moralis.io:2053/");

export function fixupIPFS(url, configs) {
    configs = configs || Config;
    let fixed = url;
    if (fixed.startsWith("http")) {
	fixed = url.replace(defaultGateway, configs.ipfs_gateway);
	fixed = fixed.replace("IPFS_GATEWAY", configs.ipfs_gateway);
    } else {
	fixed = configs.ipfs_gateway + url;
    }
    return fixed;
}

export function show(item) {
    item.style.visibility = 'visible';
    item.style.display = 'block';
}
	  
export function hide(item) {
    item.style.visibility = 'hidden';
    item.style.display = 'none';
}

export function modalAlert (divhtml) {
    // Get the modal
    var modal = document.createElement("div");
    modal.innerHTML = divhtml;
    Object.assign(modal.style, { fontSize: '3vh', position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
				 width: "auto",  height: "auto", textAlign: "center"});
    
    document.body.appendChild(modal);

    /*
    var button = document.createElement("button");
    Object.assign(button.style, {height: "4vh", width: "10vw"})
    modal.appendChild(button);

    // When the user clicks on <span> (x), close the modal
    button.onclick = function() {
	modal.style.display = "none";
    }
    */
    
    // When the user clicks anywhere outside of the modal, close it
    modal.onclick = function(event) {
	modal.style.display = "none";
    }
}

export function truncate_to_decimals(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.trunc(num * factor) / factor;
}

export function trapkeys(element) {
    // Add event listeners to keep the events within the input field
    element.addEventListener('keydown', function(event) {
        event.stopPropagation(); // Stops the event from propagating
    });

    element.addEventListener('keyup', function(event) {
        event.stopPropagation(); // Stops the event from propagating
    });

    element.addEventListener('keypress', function(event) {
        event.stopPropagation(); // Stops the event from propagating
    });
}

export function planetprice(planet) {
    let base = planet.resources_value - 250;
    let amount = (base * base * base) / 1000.37;
    return amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}
	  

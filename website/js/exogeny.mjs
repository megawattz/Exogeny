// Check if MetaMask is installed

//import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";
import { ethers } from "./ethers.mjs"

import * as utils from './utils.mjs';

export const exogeny = {
    AttributesOfInterest: [
	{ key: 'official_designation',	value: 'Official Name'},
	{ key: 'parent_star',		value: 'Star'},
	{ key: 'star_system',		value: 'Star System'},
	{ key: 'atmosphere', 		value: 'Primary Atmosphere'},
	{ key: 'planet_type',		value: 'Geology/Climate'},
	{ key: 'industrial_minerals', 	value: 'Industrial Minerals'},
	{ key: 'high_temperature_minerals', value: 'Refractory Minerals'},
	{ key: 'radioactives', 		value: 'Radioactive Minerals'},
	{ key: 'rare_minerals', 		value: 'Rare Minerals'},
	{ key: 'specialized_minerals',	value: 'Specialized Minerals'},
	{ key: 'exotic_resources',	value: 'Exotic Resources'},
	{ key: 'relics', 			value: 'Relics'},
	{ key: 'biological_resources',	value: 'Biological Resources'},
	{ key: 'tokenid',		value: 'NFT Token Index in Collection'},
	{ key: 'artist', 		value: 'Artist'}
    ],
    ConfigData: { // defaults
	"zoom_factor": 1.5,
	"unfocus_system_label_opacity": 0.8,
	"focus_system_label_opacity": 1,
	"system_sphere_radius": 20,
	"system_sphere_opacity": 0.4,
	"galaxy_diameter": 2100,
	"light_year_units": 5,
	"opensea_template":"https://testnets.opensea.io/assets/chain/contract/tokenid",
	"ipfs_gateway": "https://ipfs.io/",
	"exogeny_server": "http://localhost:2080",
	"event_cycle": 3600,
	"tritanium44_perday": 1,
    },
    ContractToSector : {},
    SectorToContract: {},
    GetConfig: function(key) {
	return this.ConfigData[key];
    },
    IPFSURL: function(url) {
	return url.replace("https://ipfs.moralis.io:2053/", this.GetConfig('ipfs_gateway'));
    },
    FormatObject: function(planet, format, map) {
	map = map || exogeny.AttributesOfInterest;
	var readout = '';
	map.forEach(function(map) {
	    if (map.key in planet) {
		readout += utils.sprintf(format, map.title, planet[map.key], map.key);
	    }
	});	
	return readout;
    },
    FormatPlanetData: function(planet, format, map) {
	map = map || exogeny.AttributesOfInterest;
	var readout = '';
	if (!planet.attribmap) {
	    planet.attribmap = planet.attribmap || {};
	    for (let val of planet.attributes) {
		planet.attribmap[val.trait_type] = val.value;
	    }	
	}
	if (!format)
	    return planet.attribmap;
	
	map.forEach(function(map) {
	    const value = planet.attribmap[map.key];
	    readout += utils.sprintf(format, map.value, utils.titleize(value));
	});	
	return readout;
    },
    LoadConfig: function(config) {
	Object.assign(exogeny.ConfigData, config); // merge external config data which takes precendence if there's a matching key
	Object.entries(config.sectors).forEach(([sector, info]) => {
	    exogeny.ContractToSector[info.contractid] = info;
	    exogeny.SectorToContract[sector] = info;
	});
    },
    SectorData: function(sectorName) {
	return exogeny.ConfigData.sectors[sectorName] || "unknown_sector " + sectorName;
    },
    Contract: function(contractId) {
	return exogeny.ContractToSector[contractId] || "unknown_contract " + contractId;
    },
    ServerRequest: async function(command, params) {  //params are "key=value","key=value","key=value"
	let server = this.GetConfig('exogeny_server');
	let exogenyauth = localStorage.getItem("exogenyauth");
	let queries = []
	Object.entries(params).forEach(([key, value]) => {
	    queries.push(`${key}=${encodeURIComponent(value)}`);
	});
	let request = `${server}/${command}?exogenyauth=${exogenyauth}&${queries.join('&')}`;
	console.log(`Server Request: ${request}`);
	let response = await fetch(request);
	return response;
    },
    Authenticate: async function(exogeny_server) {
	let response= await this.ServerRequest(`authenticate`, {});
	if (response.status == 401) {
	    localStorage.removeItem("exogenyauth")
	    return null;
	}
	return response.headers.get('wallet')
    },
    EmailPre: async function(exogeny_server, emailaddress) {
	let result = await this.ServerRequest('emailpre', {email: emailaddress});
	return result;
    },
    EmailLogin: async function(exogeny_server, emailaddress, verification) {
	let result = await this.ServerRequest('emaillogin', {email: emailaddress, verification: verification});
	return result;
    },
    Login: async function(exogeny_server) {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []); // Request account access if needed
            const signer = provider.getSigner();
            const address = await signer.getAddress();
	    
            // Message to sign
            const message = 'ExogenyLogin';
            const signature = await signer.signMessage(message);
	    
            // Send the address and signature to the server for verification
            const response = await fetch(`${exogeny_server}/login?address=${address}&message=${message}&signature=${signature}&exogenyauth=${utils.getCookie("exogenyauth")}`);
	    const headers = response.headers;
	    headers.forEach((value, key) => {
		if (key == 'exogenyauth') {
		    //utils.setCookie("exogenyauth", value);
		    localStorage.setItem("exogenyauth", value);
		}
	    });	
	    return response.status;
        } else {
            console.error("Authenticate failed");
        }
	return null
    }
}

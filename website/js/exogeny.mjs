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
    ConfigData: {},
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
	    const value = planet[map.key];
	    if (map.key in planet)
		readout += utils.sprintf(format, map.value, planet[map.key]);
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
	exogeny.ConfigData = config;
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
    ServerRequest: async function(command, ...params) {  //params are "key=value","key=value","key=value"
	let server = this.GetConfig('exogeny_server');
	let exogenyauth = localStorage.getItem("exogenyauth");
	let request = `${server}/${command}?exogenyauth=${exogenyauth}&${params.join('&')}`;
	let response = await fetch(request);
	return response;
    },
    Authenticate: async function(exogeny_server) {
	let response= await this.ServerRequest(`authenticate`);
	if (response.status == 401) {
	    localStorage.removeItem("exogenyauth")
	    return null;
	}
	return response.headers.get('wallet')
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
            alert('You need to install a crypto wallet like MetaMask');
        }
	return null
    },
    
}

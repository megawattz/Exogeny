// Check if MetaMask is installed

import * as utils from './utils.mjs';

export const exogeny = {
    AttributesOfInterest: [
	{ key: 'official_designation',	value: 'Official Name'},
	{ key: 'indigenous_lifeform',	value: 'Dominant Indigenous Lifeform'},
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
    }
}

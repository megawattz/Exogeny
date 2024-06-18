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
    FormatPlanetData: function(planet, format, map) {
	map = map || exogeny.AttributesOfInterest;
	var readout = '';
	if (!planet.attribmap) {
	    planet.attribmap = {}
	    for (let val of planet.attributes) {
		planet.attribmap[val.trait_type] = val.value;
	    }	
	}
	map.forEach(function(map) {
	    const value = planet.attribmap[map.key];
	    readout += utils.sprintf(format, map.value, utils.titleize(value));
	});	
	return readout;
    },
    LoadConfig: function(config) {
	exogeny.ConfigData = config;
	config.sectors.forEach((sectorName) => {
	    exogeny.ContractToSector[sectorName] = exogeny.ConfigData.sectors[sectorName];
	});
    },
    SectorData: function(sectorName) {
	return exogeny.ConfigData.sectors[sectorName] || "unknown_sector " + sectorName;
    },
    Contract: function(contractId) {
	return exogeny.ContractToSector[contractId] || "unknown_contract " + contractId;
    }
}



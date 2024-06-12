// Check if MetaMask is installed

import * as utils from './utils.mjs';

export const exogeny = {
    DefaultAttributeMap: [
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
	{ key: 'artist', 			value: 'Artist'}
    ],
    FormatPlanetData: function(planet, format, map) {
	map = map || exogeny.DefaultAttributeMap;
	var readout = '';
	if (!planet.attribmap) {
	    planet.attribmap = {}
	    for (let val of planet.attributes) {
		planet.attribmap[val.trait_type] = val.value;
	      }	
	    planet.attribmap.official_designation = planet.name.replace('0', 'Rogue');
	}
	map.forEach(function(attrib) {
	    const title = planet.attribmap[attrib.key];
	    readout += utils.sprintf(format, utils.titleize(attrib.key), utils.titleize(title));
	});	
	return readout;
    }
}


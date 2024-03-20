
// Texts which explain what is being looked at
const Labels = {
    "system":"Star System: Group of stars. Double click to zoom in. ESC or Shift Double Click to zoom out.",
    "star":"Right click to see planet information. Alpha is the first star in the star system. Beta the second, Gamma the third etc",
    "lifeform":"The dominant indigenous intelligent life form on the planet (there could be more than one and there may be undercover, Galactic Federation agents present in the photographs)",
    "planet":"A mass, smaller than a star but quite large in human terms that orbit stars and host life (in this game anyway)",
    "official":"The official name of the planet composed of Star Index (greek letter), Star System, then Planet Index (orbital order)",
    "planet_type":"The overall type of the planet",
    "atmosphere":"The predominant gas which composes the atmosphere (but not necessarily the only one present)",
    "resources":"The total resources available on the planet (out of 800 max)",
    "industrials":"Abundant materials use in manufacturing and building infrastructure",
    "refractories":"Tough materials need for high temperature tools and materials needed to work with other materials",
    "radioactives":"Materials that can be used to initiate nuclear reactions",
    "rare":"Rare materials",
    "specialized":"Materials which have no substitutes and are required for important uses",
    "biologicals":"Materials derived from living things, or the living things themselves",
    "exotics":"Materials unique to this planet, not available anywhere else",
    "relics":"High tech items left behind after the collapse of a previous civilization",
    "designation":"Planets are named StarIndex (which star in system)  StarSystem (group of closely related stars) PlanetIndex (which orbital position around the star)"
};

function getLabel(key) {
    return Labels[key] || key;
}

export {getLabel};

// "external_url": "https://exoplaneteer.com/planetdetail.html?identity=a9cc59da-c6d8-4441-aebf-19ad992d1bc8&designation=Alpha%20Giabroni%20V&chain=80001&contract=0x9261025eA365fbaa60623143e03F177ab35565BD&tokenid=256&
import * as utils from "./utils.mjs";

function planetStats(stats) {
    let name  = `${stats['parent_star']} ${stats['orbital_position']}`;
    stats['official'] = name.replace('_', ' ');

    var nameMap = [
	{"galactic_catalog":"Galactic Catalog Id"},
	{"official": "Official Designation"},
        {"planet_type": "Planet Type"},
	{"moons":"Moons"},
	{"atmosphere":"Primary Atmosphere"},
	{"indigenous_lifeform":"Dominant Indigenous Lifeform"},
	{"evaluation": "Evaluation1"},
	{"evaluation2":"Evaluation2"},
	{"natural_resources_rating":"Natural Resources Summary"},
	{"rare_minerals":"Rare Minerals"},
	{"radioactives":"Radioactive Minerals"},
	{"high_temperature_minerals":"Refractory Minerals"},
	{"industrial_minerals":"Industrial Minerals"},
	{"specialized_minerals":"Specialized Minerals"},
	{"biological_resources":"Biological Resources"},
	{"exotic_resources":"Exotic Resources"},
	{"relics":"Relics"},
    ]

    var fictions = {
	"Tech Level": `${utils.RandomInt(0, 3)}`,
	"Population": `${utils.RandomInt(1,90)} million`,
	"Tritanium-44 Production": `${utils.RandomInt(0,100)}/day`,
	"Last Price": `${utils.RandomInt(1, 10)/10} ETH`
    };

    var readout = '<h2 style="text-align: left;">Planet Stats</h2>';

    for (let attr of nameMap) {
	for (let k in attr) {
	    let display = attr[k];
	    if (display)
		readout += `${display}: <b>${stats[k]}</b><br>`;
	}
    };

    Object.keys(fictions).forEach(function(e) {
	readout += `${e}: <b>${fictions[e]}</b><br>`;
    });
    readout += `</p>\n`;
    return readout;
}

var stats = {};

window.moveRelative = function(offset) {
    // move forward and backward in token ids
    let hits = window.location.href.match(/tokenid=(\d+)/);
    let next = parseInt(hits[1], 10) + offset;
    let next_loc = window.location.href.replace(/tokenid=(\d+)/, `tokenid=${next}`);
    window.location.href = next_loc;
}	

export async function Load(chain, contract, tokenid, callback) {
    var config = await fetch('configs/galaxy.json', { headers: {'Cache-Control':'no-cache'} })
    	.then((response) => response.json())
    
    utils.getNFTMetadata(chain, contract, tokenid)
	.then((metadata) => callback(metadata))
	.then((metadata) => console.log(metadata))
	.catch((error) => console.error(error))
}	

// planet is the JSON metadata obtained from the NFT on IPFS
export function planetDetailDiv(planet, config) {
    for (let item of planet.attributes) {
	stats[item['trait_type']] = item['value']
    }

    let newPlanetDiv = document.createElement('div');

    let ipfsURL = planet.animation_url;

    newPlanetDiv.innerHTML = `<video id="planetVideo" loop autoplay muted src="${ipfsURL}" onclick="this.paused ? play() : pause();" preload="none"
	style="position: absolute; top 50%; left 50%; object-fit: cover; height: 100%; width: 100%; margin: none; padding: none; transition: opacity 4s ease-in-out; z-index: 0;">
	</video>`;

    // Planet Stats
    let upperLeft = document.createElement("div");
    Object.assign(upperLeft.style, {position: "absolute", top: "12%", left: "2%", fontSize: '2vh'});
    upperLeft.innerHTML = planetStats(stats);
    newPlanetDiv.appendChild(upperLeft);

    // Life Form Icon and Pic
    let upperRight = document.createElement("div");
    Object.assign(upperRight.style, {position: "absolute", height: "12%", width: "8%", top: "6%", right: "2%"});
    upperRight.innerHTML = `<img style="top: 0%; height: 100%; width: 100%; border-radius: 50%;" src="${planet.image}"></img><span>Lifeform</span>`;

    upperRight.addEventListener('mousedown', function() {
	Object.assign(upperRight.style, {width: '100%', height: '100%', top: "0%"} )
    });

    upperRight.addEventListener('mouseup', function() {
	Object.assign(upperRight.style, {position: "absolute", height: "12%", width: "8%", top: "6%", right: "2%"})
    });

    newPlanetDiv.appendChild(upperRight);

    let lifeformImage = document.createElement("img");
    lifeformImage.src = planet.lifeform_image;
    Object.assign(lifeformImage.style, {pointerEvents: 'auto', visibility: 'hidden', display: 'none', position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 20})
    newPlanetDiv.appendChild(lifeformImage);

    let lifeformIcon = document.createElement("img");
    lifeformIcon.src = `image/${planet.lifeform}.png`;
    Object.assign(lifeformIcon.style, {height: "100%"});

    let previousLink = document.createElement("div")
    previousLink.innerHTML = `<button title="Previous Planet" style="border-radius: 50%;" onclick="window.moveRelative(-1)"><</button>`;
    Object.assign(previousLink.style, {pointerEvents: 'auto', position: 'absolute', left: '2%', bottom: '10%'});
    newPlanetDiv.appendChild(previousLink);

    let nextLink = document.createElement("div")
    nextLink.innerHTML = `<button title="Next Planet" style="border-radius: 50%;" onclick="window.moveRelative(1)">></button>`;
    Object.assign(nextLink.style, {pointerEvents: 'auto', position: 'absolute', right: '2%', bottom: '10%'});
    newPlanetDiv.appendChild(nextLink);

    if (config) {
	let lowerLeft = document.createElement("div");
	let opensea = config.opensea_template.replace('chain', planet.chain).replace('contract', planet.contract).replace('tokenid', planet.tokenid);
	lowerLeft.innerHTML = `<a title="See planet on OpenSea NFT Marketplace" href="${opensea}">See ${stats.official} price and owner on OpenSea</a>`;
	Object.assign(lowerLeft.style, {position: "absolute", bottom: "2%", left: "2%" });
	newPlanetDiv.appendChild(lowerLeft);
    }
    
    return newPlanetDiv;
}


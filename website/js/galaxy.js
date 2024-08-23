import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import * as utils from './utils.mjs';
import * as labels from './labels.mjs';

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

var sector = utils.getCookie("sector") || "helatrobus";

//fetch('url-to-json-file.json').then(response => response.json()).then(data => console.log(data));

// load planets
fetch('configs/galaxy.json', { headers: {'Cache-Control':'no-cache'} })
    .then((response) => response.json())
    .then((data) => Object.assign(Config, data))
    .then(() => console.log(Config))
    .catch((error) => console.error(error))

function getElement(id) {
    return document.getElementById(id);
}

var Container = document.body

// Renderer
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
Container.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
Object.assign(renderer.domElement.style, {backgroundImage: 'url(images/stars.jpg)', backgroundSize: "cover", position: 'absolute', top: 0, left: 0});
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

// Textures
var coloredStars = {};
let textureLoader = new THREE.TextureLoader();
let starImage = textureLoader.load('images/star_small_trans.png');
let spriteMaterial = new THREE.SpriteMaterial({"map": starImage});

// labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
Object.assign(labelRenderer.domElement.style, {position: 'absolute', zIndex: 1, top: '0px', pointerEvents: 'none', fontFamily: 'Arial, san-serif'});
Container.appendChild(labelRenderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, Config.galaxy_diameter);
camera.position.set(0, 0, Config.galaxy_diameter/2);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true;
controls.autoRotate = true;
controls.update();

var Systems = {};
var Keydown = {};

// utilties

function wipe(obj) {
    if (!obj)
	return null;
    if (!obj.children)
	return null;
    while (obj.children.length > 0) {
        wipe(obj.children[0]);
        obj.remove(obj.children[0]);
    }
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
    if (obj.texture) obj.texture.dispose();
    scene.remove(obj);
    return null;
}

// offset individual stars from their system center
function StarLocation(planet) {
    let star = planet.star_index + planet.star_system;
    let location = planet.location;
    let coords = [location.x, location.y, location.z];

    for(let idx = 0; idx < coords.length; ++idx) {
	let adjust = star.charCodeAt(idx) % 30 - 15;
	coords[idx] += adjust;
    }

    return {"x":coords[0], "y":coords[1], "z":coords[2]};
}

function addLabel(labelee, location, content, offset, color, font_size, title) {
    offset = offset || 0;
    const label = document.createElement("p");
    label.className = "label";
    Object.assign( label.style, { color: color || `rgb(255,255,255,1}`, fontSize: font_size || '0.8vw', pointerEvents: 'auto'});
    label.innerHTML = content;
    label.title = labels.getLabel(title);
    const cPointLabel = new CSS2DObject(label);
    cPointLabel.position.set(location.x + offset, location.y + offset, location.z + offset);

    label.addEventListener('contextmenu', function(event) {
	event.preventDefault();
	popupSystem(labelee);
    });

    label.addEventListener('mousedown', function(event) {
	if (event.which != 1)
	    return;
	if (Keydown[17]) {
	    lineDraw(labelee)
	    return;
	}
	zoomin(labelee);
	focus(labelee);
    });

    label.addEventListener('mouseup', function(event) {
	event.preventDefault();
    });

    // what object is this label labelling?
    label.labelee = labelee;

    return cPointLabel;
}

function atmoscolor(atmosphere, opacity) {
    const temp = atmosphere.split(",")
    opacity = opacity || 1;
    return `rgb(${Math.round(temp[0] * 100)}, ${Math.round(temp[1] * 100)}, ${Math.round(temp[2] * 100)}, ${opacity})`;
}

// INFO DISPLAY FLEXBOX
// Popup Dialog list of windows
var Popup = document.createElement("div");
Popup.className = "popup";
Container.appendChild(Popup);
Object.assign(Popup.style, {left: 0, top: '10vh', width: '30vw', zIndex: 40, height: '100%', position: 'absolute', visibility: 'hidden', display: 'none', background: 'transparent'});

window.popDown = function() {
    if (Popup.style.visibility == 'hidden')
	return false; // not showing already?
    Popup.style.visibility = 'hidden';
    Popup.style.display = 'none';
    Popup.class = "popup";
    return true;
}

function fixupIPFS(url) {
    let fixed = url.replace("https://ipfs.moralis.io:2053/", Config.ipfs_gateway);
    return fixed;
}

function roundTo(num, places) {
    const factor = Math.pow(10, places);
    return Math.floor(num * factor)/factor;
}

function popupSystem(star) {
    let game;
    try {
	game = star.userData.game;
    } catch(ex) {
	console.error(ex);
	return
    }

    if (!star.userData.game.planets)
	return;

    let contents = `<p/><div style="width: 100%; text-align: left;">
	<div class="tableName">Star: ${game.official_designation}</div>
	<div class="close clickable" onclick='window.popDown()'>x</div>
	<table class="solarSystem">
	<tr>
	<th title="${labels.getLabel('official')}">Planets</th>
	<th title="${labels.getLabel('lifeform')}">Life<br>Form</th>
	<th title="${labels.getLabel('planet_type')}">Type</th>
	<th title="${labels.getLabel('atmosphere')}">Atmosphere</th>
	</tr>\n`;
    let planet;
    for (let index in game.planets) {
	planet = game.planets[index];
	contents += `
		<tr>
		<td><a href='javascript:window.planetVideo(${JSON.stringify(planet)});window.setPlanetDetail(${JSON.stringify(planet)})'>${planet.star_index} ${planet.star_system} ${index}</a></td>
		<td><a href='javascript:window.lifeformImage(${JSON.stringify(planet)})'><img style="height: 1.5vw; border-radius: 1vw; border: 1px solid rgb(247,136,79);" src="images/${planet.lifeform}.png"></td-->
		<td>${planet.planet_type}</td>
		<td style="color: ${atmoscolor(planet.atmosphere)};">${planet.atmosphere_composition}</td>
		</tr>\n`;
    }

    contents += "</table></div>";
    contents += '<div id="planetDetail"></div>';

    window.setPlanetDetail = function(planet) {
	 let detail = `<p><div>Planet ${planet.star_index} ${planet.star_system} ${planet.planet_index} Resources</dev>
    <table class="planetDetail">
    <tr><td title="${labels.getLabel('industrials')}" id="industrials">Industrial Minerals</td><td class="number">${planet.industrials}</td></tr>
    <tr><td title="${labels.getLabel('refractories')}" id="refractories">Refractory Materials</td><td class="number">${planet.refractories}</td></tr>
    <tr><td title="${labels.getLabel('radioactives')}" id="radioactives">Radioactive Resources</td><td class="number">${planet.radioactives}</td></tr>
    <tr><td title="${labels.getLabel('rare')}" id="rare">Rare Resources</td><td class="number">${planet.rare}</td></tr>
    <tr><td title="${labels.getLabel('specialized')}" id="specialized">Specialized Resources</td><td class="number">${planet.specialized}</td></tr>
    <tr><td title="${labels.getLabel('exotics')}" id="exotics">Exotic Resources</td><td class="number">${planet.exotics}</td></tr>
    <tr><td title="${labels.getLabel('biologicals')}" id="biologicals">Biological Materials</td><td class="number">${planet.biologicals}</td></tr>
    <tr><td title="${labels.getLabel('relics')}" id="relics">Relics</td><td class="number">${planet.relics}</td></tr>
    <tr>
        <td><a target="_blank" href="${Config.opensea_template.replace('chain', planet.chain).replace('contract', Config.contract).replace('tokenid', planet.tokenid)}">Purchase planet</a></td>
        <td>0.3 ETH</td>
    </tr>
    </table>`;
	 let planetDiv = getElement("planetDetail");
	 planetDiv.innerHTML = detail;
    }

    Popup.innerHTML = contents;
    Popup.style.padding = '0.5vw';
    Popup.style.display = 'block';
    Popup.style.visibility = 'visible';
}

// Legend
var Legend = document.createElement("div");
Legend.className = "legend";
Object.assign(Legend.style, {position: "absolute", bottom: '1vh', right: '1vw'});
Container.appendChild(Legend);
Legend.innerHTML = `
<table class="legend">
<tr><th>Command</th><th>Action</th></tr>
<tr><td>Click Drag</td><td>rotate galaxy</td></tr>
<tr><td>Click</td><td>zoom in</td></tr>
<tr><td class="clickable" onclick='javascript:window.zoomclose()'>Shift Click</td><td>zoom out</td></tr>
<tr><td class="clickable" onclick='javascript:window.zoomclose()'>ESC key</td><td>zoom out</td></tr>
<tr><td>Right Click</td><td>information</td></tr>
<tr><td>Control Click</td><td>ruler</td><tr>
</table>`;

// Messages
var Messages = document.createElement("div");
Messages.className = "messages";
Messages.addEventListener('click', clearLine);
Object.assign(Messages.style, {position: "absolute", bottom: '1vh', left: '1vw', padding: '0.2vw'});
Container.appendChild(Messages);

function message(msg, timeout) {
    Messages.innerHTML = msg;
}

// lifeform window
var Lifeform = document.createElement("div");
Lifeform.className = "lifeformPopup";
Object.assign(Lifeform.style, {
    position: 'absolute', top: 0, right: 0, zIndex: 30, visibility: 'hidden', display: 'none',
    width: '100%', height: '100%', alignIitems: 'center', justifyContent: 'center', 'margin': 'none', 'padding': 'none'
});
Container.appendChild(Lifeform);

window.lifeformImage = function(planet) {
    let lifeformImage = `${fixupIPFS(planet.lifeform_image)}`;
    Lifeform.innerHTML = `<div class="close clickable" onclick='window.lifeformDown()'>x</div>
	<img src="${lifeformImage}" id="lifeformImage" class="lifeformImage rounded">`;
    let annotation = document.createElement("div")
    Lifeform.appendChild(annotation);
    Object.assign(annotation.style, {position: 'absolute', size: '+1', zIndex: 40, bottom: '5%', right: '5%'});
    annotation.innerHTML = `Dominant Intelligent Indigenous Lifeform of ${planet.star_index} ${planet.star_system} ${planet.planet_index}`;
    planetDown();
    Lifeform.style.visibility = 'visible';
    Lifeform.style.display = 'block';
    render();
}

window.lifeformDown = function() {
    if (Lifeform.style.visibility == 'hidden')
	return false; // not showing already?
    Lifeform.style.visibility = 'hidden';
    Lifeform.style.display = 'none';
    return true;
}

// planet video window
var Planet = document.createElement("div");
Planet.className = "planetPopup";
Object.assign(Planet.style, {
    position: "absolute", top: 0, left: 0, zIndex: 30, visibility: 'hidden', display: 'none',
    width: '100%', height: '100%', alignIitems: 'center', justifyContent: 'center', 'margin': 'none', 'padding': 'none'
});
Container.appendChild(Planet);

window.planetVideo = function(planet) {
    var poster = `planets/planet_${planet.identity}.gif`;
    Planet.innerHTML = `<div class="close clickable" onclick='window.planetDown()'>x</div>
	<video src="${fixupIPFS(planet.planet_video)}" class="planetVideo" id="planetVideoId" autoplay loop  onplay="this.currentTime=6;" preload="metadata" style="position: relative;"></video>`;
    getElement("planetVideoId").style.height = window.innerHeight;

    /*
    let upperLeft = document.createElement("div");
    upperLeft.innerHTML = `<img style="width: 3vw; margin: 0;" title="${labels.getLabel('resources')}" src="images/resources.png"><br>${planet.resources_value}`;
    Object.assign(upperLeft.style, {position: "absolute", top: "1%", left: "2%"});
    Planet.appendChild(upperLeft);
    */

    let upperRight = document.createElement("div");
    upperRight.innerHTML = `<a title="${labels.getLabel('lifeform')}" href='javascript:window.lifeformImage(${JSON.stringify(planet)})'><img style="width: 4vw;" src="images/${planet.lifeform}.png"></a>`;
    Object.assign(upperRight.style, {position: "absolute", top: "2%", right: "3%"});
    Planet.appendChild(upperRight);

    let lowerLeft = document.createElement("div");
    lowerLeft.innerHTML = `${planet.star_index} ${planet.star_system}`;
    Object.assign(lowerLeft.style, {position: "absolute", bottom: "2%", left: "2%" });
    Planet.appendChild(lowerLeft);

    let lowerRight = document.createElement("div");
    lowerRight.innerHTML = `${planet.planet_index}`;
    Object.assign(lowerRight.style, {position: "absolute", bottom: "2%", right: "4%"});
    Planet.appendChild(lowerRight);
    lifeformDown();

    Planet.style.display = 'inline-block';
    Planet.style.visibility =  'visible';
    let target = controls.target;
}

window.planetDown = function() {
    if (Planet.style.visibility == 'hidden')
	return false; // not showing already?
    Planet.style.visibility = 'hidden';
    Planet.style.display = 'none';
    return true;
}

var Focused;

function focus(object) {
    let stars;
    try {
	stars = object.userData.game.stars;
	if (!stars) {
	    return;
	}
    } catch (ex) {
	console.error(ex);
	return; // if this object doesn't have stars, ignore
    }

    if (Focused)
	unfocus(Focused);

    object.userData.game.label.element.style.color = 'rgb(255,255,255,1.0)';
    for (let name in stars) {
	let star = stars[name];
	scene.add(star);
	scene.add(star.userData.game.label);
    }

    Focused = object
}

function unfocus() {
    var stars = Focused.userData.game.stars;
    if (!stars)
	return;
    Focused.userData.game.label.element.style.color = `rgb(255,255,255,${Config.unfocus_system_label_opacity}`;
    for (let name in stars) {
	let star = stars[name];
	scene.remove(star);
	scene.remove(star.userData.game.label);
    }
    Focused = null;
}

var Systems = {};

function loadPlanets(planets) {
    const system_radius = Config.system_sphere_radius;
    planets.forEach(planet => {
	if (! Systems[planet.star_system]) {
	    const geometry = new THREE.SphereGeometry(system_radius * 2, 32, 32); // change size as needed
	    const temp = planet.atmosphere.split(",")
	    const color = atmoscolor(planet.atmosphere, Config.unfocus_system_sphere_opacity);
	    const material = new THREE.MeshBasicMaterial({"color": color, "transparent": true, "opacity": Config.system_sphere_opacity}); // or any color
	    const systemMesh = new THREE.Mesh(geometry, material);

	    systemMesh.userData.game = {
		"inhabited": 0,
		"starcount": 0,
		"name": planet.star_system,
		"official_designation": `${planet.star_system}`,
		"location": planet.location,
		"label": addLabel(systemMesh, planet.location, `${planet.star_system}<br>System`, 0, `rgb(255,255,255,${Config.unfocus_system_label_opacity})`, '0.7vw', labels.getLabel("system")),
		"stars":  {}
	    };

	    systemMesh.position.set(planet.location.x, planet.location.y, planet.location.z);
	    scene.add(systemMesh);
	    scene.add(systemMesh.userData.game.label);

	    // master tree of meshes
	    Systems[planet.star_system] = systemMesh;
	}

	const system = Systems[planet.star_system];
	system.userData.game.inhabited += 1;

	if (! system.userData.game.stars[planet.star_index]) {
	    let official_designation = `${planet.star_index} ${planet.star_system}`;
	    const color = atmoscolor(planet.atmosphere);
	    const starLocation = StarLocation(planet);
	    const spriteMaterial = new THREE.SpriteMaterial({"map": starImage, "color": color});
	    const starSprite = new THREE.Sprite(spriteMaterial);
	    starSprite.userData.game = {
		"planetcount": 0,
		"name": planet.star_index,
		"official_designation": official_designation,
		"location": starLocation,
		"label": addLabel(starSprite, starLocation,
				  (planet.star_index == "Alpha") ? `${planet.star_index} ${planet.star_system}` : planet.star_index,
				  0.4, color, null, labels.getLabel("star")),
		"planets": {}
	    };

	    starSprite.position.set(starLocation.x, starLocation.y, starLocation.z);
	    //scene.add(starSprite);
	    system.userData.game.stars[planet.star_index] = starSprite;
	}

	const star = system.userData.game.stars[planet.star_index];
	star.userData.game.planetcount += 1;
	star.userData.game.planets[planet.planet_index] = planet;
	system.userData.game.planetcount += 1;

    });
};

/*
function animate() {
    requestAnimationFrame( animate );
    labelRenderer.render(scene, camera);
    renderer.render( scene, camera );
}

renderer.setAnimationLoop(animate);
*/

function render() {
    labelRenderer.render(scene, camera);
    renderer.render( scene, camera );
}

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

const Raycaster = new THREE.Raycaster();
const Mouse = new THREE.Vector2();

const LineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const LineGeometry = new THREE.BufferGeometry();
var Ruler = null;
var LineAnchor = null;

function clearLine() {
    LineAnchor = wipe(LineAnchor);
    Ruler = wipe(Ruler);
    message("");
    render();
}

function lineDraw(mesh) {
    if (!mesh) {
	clearLine()
	return;
    }

    if (!LineAnchor) {
	LineAnchor = new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z);
	message(`anchor ${mesh.userData.game.official_designation}`);
	render();
	return;
    }

	// wipe out any previous ruler
    Ruler = wipe(Ruler);
    let look = getIntersect(event);
    LineGeometry.setFromPoints([LineAnchor, mesh.position]);
    Ruler = new THREE.Line(LineGeometry, LineMaterial);
    scene.add(Ruler);
    message(`${Math.floor(LineAnchor.distanceTo(mesh.position)/Config.light_year_units)} light years`);
    render();
}

function getIntersect(event) {
    // Normalize the mouse position from -1 to +1 for both axes
    Mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    Mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    Raycaster.setFromCamera(Mouse, camera);

    //console.log(`mouse x:${mouse.x} y:${mouse.y}`);

    // Calculate objects intersecting the picking ray
    let intersects = Raycaster.intersectObjects(scene.children);

    if (intersects.length < 1)
	return null;

    return intersects[intersects.length - 1];
}

window.zoomclose = function() {
    if (window.planetDown())
	return;
    if (window.lifeformDown())
	return;
    if (window.popDown())
	return;
    window.zoomout();
}

window.zoomout = function() {
    let target = controls.target;
    camera.position.set(
	camera.position.x - (target.x - camera.position.x) * 12,
	camera.position.y - (target.y - camera.position.y) * 12,
	camera.position.z - (target.z - camera.position.z) * 12
    );
    var limit = Config.galaxy_diameter;
    if (camera.position.x > limit || camera.position.y > limit || camera.position.z > limit) {
	camera.position.set(0, 0, Config.galaxy_diameter/2);
	camera.lookAt(0, 0, 0);
    }
    render();
    controls.update();
}

function zoomin(target_object) {
    let point = target_object.position;
    camera.lookAt(point); // point camera at it
    controls.target.set(point.x, point.y, point.z); // change center of world
    controls.update();

    // --------------------
    // zoom in or out on mouse mousedown
    camera.position.set(
	camera.position.x + (point.x - camera.position.x)/Config.zoom_factor,
	camera.position.y + (point.y - camera.position.y)/Config.zoom_factor,
	camera.position.z + (point.z - camera.position.z)/Config.zoom_factor
    );

    let distance = camera.position.distanceTo(target_object.position);
    if (distance < 2) {
	popupSystem(target_object);
    }
    
    render();
    //console.log("camera:", camera.position);
}

window.addEventListener('mousemove', function(event) {
    render();
});

renderer.domElement.addEventListener('mousedown', function(event) {
    if (event.which != 1)
	return;

    let target = getIntersect(event);

    if (Keydown[17]) {
	if (!target) {
	    lineDraw(null)
	} else {
	    lineDraw(target.object)
	}
	render();
	return;
    }

    // not object, return.
    if (!target) {
	if (Keydown[16]) {
	    window.zoomout();
	}
	render();
	return
    }

    zoomin(target.object);

    controls.update();

    let distance = camera.position.distanceTo(target.object.position);
    if (distance < 40) {
	focus(target.object);
    }
    render();
});

renderer.domElement.addEventListener('contextmenu', function(event) {
    let intersect = getIntersect(event)
    if (!intersect)
	return;
    popupSystem(intersect.object);
})

window.addEventListener('mouseup', function(event) {
    event.preventDefault();
});

// set up document wide event handlers
window.addEventListener('keydown', function(event) {
    console.log(`key ${event.keyCode} pressed`);
    Keydown[event.keyCode] = true;

    if (event.keyCode == 27) {
	clearLine();
	window.zoomclose();
    }
});

window.addEventListener('keyup', function(event) {
    Keydown[event.keyCode] = false;
    //console.log(`key ${event.keyCode} released`);
});

// load planets
fetch(`configs/${sector}/sector.json`)
    .then((response) => response.json())
    .then((data) => Object.assign(Config, data))
    .then(fetch(`configs/${sector}/planets.json`)
	  .then((response) => response.json())	
	  .then((data) => loadPlanets(data)))
	  

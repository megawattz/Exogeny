import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import * as utils from './utils.mjs';

var config = {
    "zoom_factor": 1.1
};

// Renderer
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
Object.assign(renderer.domElement.style, {backgroundImage: 'url(images/skybox2.jpg)', position: 'absolute', top: 0, left: 0});
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
document.body.appendChild(labelRenderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 1000);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = true;
controls.autoRotate = true;
controls.update();

var Systems = {};
var Keydown = {};

// utilties

function element(id) {
    return document.getElementById(id);
}

// set up document wide event handlers
window.addEventListener('keydown', function(event) {
    console.log(`key ${event.keyCode} pressed`);
    Keydown[event.keyCode] = true;
    
    if (event.keyCode == 27) {
	if (window.planetDown())
	    return;
	if (window.lifeformDown())
	    return;
    	if (window.popDown())
	    return;
    }
});

window.addEventListener('keyup', function(event) {
    Keydown[event.keyCode] = false;
    //console.log(`key ${event.keyCode} released`);
});

// offset individual stars from their system center
function StarLocation(planet) {
    let star = planet.star_index + planet.star_system;
    let location = planet.location;
    let coords = [location.x, location.y, location.z];

    for(let idx = 0; idx < coords.length; ++idx) {
	let adjust = star.charCodeAt(idx) % 12 - 6;
	coords[idx] += adjust;
    }

    return {"x":coords[0], "y":coords[1], "z":coords[2]};
}

function addLabel(location, content, offset, color, fontSize) {
    offset = offset || 0;
    const label = document.createElement("p");
    label.className = "label";
    label.style.color = color || 'white';
    //label.style.visibility = 'visible';
    label.style.fontSize = fontSize || '0.8vw';
    label.textContent = content;
    const cPointLabel = new CSS2DObject(label);
    cPointLabel.position.set(location.x + offset, location.y + offset, location.z + offset);
    return cPointLabel;
}

function atmoscolor(atmosphere) {
    const temp = atmosphere.split(",")
    return `rgb(${temp[0] * 100}, ${temp[1] * 100}, ${temp[2] * 100})`;
}

// lifeform window
var Lifeform = document.createElement("div");
Lifeform.className = "lifeformPopup";
Object.assign(Lifeform.style, {position: "absolute", top: 0, right: '0%', width: '70%', zIndex: 40, visibility: 'hidden', display: 'none'});
document.body.appendChild(Lifeform);

window.lifeformImage = function(planet) {
    Lifeform.innerHTML = `<img src="${planet.lifeform_image}" id="lifeformImage" width="100%" class="lifeFormImage" style="position: relative;">`;
    let annotation = document.createElement("div")
    annotation.innerHTML = `Dominant Indigenous Lifeform of ${planet.star_index} ${planet.star_system} ${planet.planet_index}`;
    Lifeform.style.visibility = 'visible';
    Lifeform.style.display = 'block';
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
Object.assign(Planet.style, {position: "absolute", top: 0, right: '0%', width: '70%', height: '100%', zIndex: 30, visibility: 'hidden', display: 'none'});
document.body.appendChild(Planet);

window.planetVideo = function(planet) {
    Planet.innerHTML = `<video src="${planet.planet_video}" id="planetVideo" autoplay loop  onplay="this.currentTime=6;" preload="metadata" style="width: 100%; position: relative;"></video>`;

    let upperRight = document.createElement("div");
    upperRight.innerHTML = `<img style="width: 4vw;" src="images/${planet.lifeform}.png">`;
    Object.assign(upperRight.style, {position: "absolute", top: "2%", right: "5%"});
    Planet.appendChild(upperRight);

    let lowerLeft = document.createElement("div");
    lowerLeft.innerHTML = `${planet.star_index} ${planet.star_system}`;
    Object.assign(lowerLeft.style, {position: "absolute", bottom: "1%", left: "2%" });
    Planet.appendChild(lowerLeft);

    let lowerRight = document.createElement("div");
    lowerRight.innerHTML = `${planet.planet_index}`;
    Object.assign(lowerRight.style, {position: "absolute", bottom: "1%", right: "5%"});
    Planet.appendChild(lowerRight);

    Planet.style.display = 'block';
    Planet.style.visibility =  'visible';
    let target = controls.target;
    //cPlanetDiv.position.set(target.x, target.y, target.z);
}

window.planetDown = function() {
    if (Planet.style.visibility == 'hidden')
	return false; // not showing already?
    Planet.style.visibility = 'hidden';
    Planet.style.display = 'none';
    return true;
}

// Popup Dialog list of windows
var Popup = document.createElement("div");
Popup.className = "popup rounded";
document.body.appendChild(Popup);
Object.assign(Popup.style, {left: 0, top: 0, width: '30%', position: 'absolute', visibility: 'hidden', display: 'none', draggable: 'true'});

window.popDown = function() {
    if (Popup.style.visibility == 'hidden')
	return false; // not showing already?
    Popup.style.visibility = 'hidden';
    Popup.style.display = 'none';
    return true;
}

function popupSystem(star) {
    let game = star.object.userData.game;
    let contents = `<span style="float: left;" onClick='window.popDown()'> X </span>
	<div style="width: 100%; text-align: center;">
	<h2>Star: ${game.official_designation}<h2>
	<h3>${game.planetcount} Inhabited Planets</h3>
    </div>`;
    contents += `<table class="poptable"><tr>
	<th>Official<br>Designation</th>
	<th>Type</th>
	<th>Atmosphere</th>
	<th>Life<br>form</th>
	<th style="text-align: right;">Resources</th>
	</tr>\n`;
    for (let index in game.planets) {
	let planet = game.planets[index];
	contents += `
		<tr>
		<td onClick='window.planetVideo(${JSON.stringify(planet)})' class="name">${planet.star_index} ${planet.star_system} ${index}</td>
		<td>${planet.planet_type}</td>
		<td style="color: ${atmoscolor(planet.atmosphere)};">${planet.atmosphere_composition}</td>
		<td onClick='window.lifeformImage(${JSON.stringify(planet)})'>&nbsp;&nbsp;<img class="icon" src="images/${planet.lifeform}.png"></td-->
		<td style="text-align: right;">${planet.resources_value}</td></tr>\n`;
    }
    contents += "</table>";
    Popup.innerHTML = contents;
    Popup.style.display = 'block'
    Popup.style.visibility = 'visible';
}

var Focused;

function focus(object) {
    var stars = object.userData.game.stars;
    if (!stars)
	return;
    if (Focused)
	unfocus(Focused);
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
    for (let name in stars) {
	let star = stars[name];
	scene.remove(star);
	scene.remove(star.userData.game.label);
    }
    Focused = null;
}

var Systems = {};

function loadPlanets(planets) {
    const system_radius = 5
    planets.forEach(planet => {
	if (! Systems[planet.star_system]) {
	    const geometry = new THREE.SphereGeometry(system_radius * 2, 32, 32); // change size as needed
	    const temp = planet.atmosphere.split(",")
	    const color = `rgb(${temp[0] * 100}, ${temp[1] * 100}, ${temp[2] * 100})`;
	    const material = new THREE.MeshBasicMaterial({"color": color, "transparent": true, opacity: 0.1}); // or any color
	    const systemMesh = new THREE.Mesh(geometry, material);

	    systemMesh.userData.game = {
		"inhabited": 0,
		"starcount": 0,
		"name": planet.star_system,
		"official_designation": `${planet.star_system}`,
		"location": planet.location,
		"label": addLabel(planet.location, planet.star_system, system_radius, 'white', '0.6w'),
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
	    const temp = planet.atmosphere.split(",")
	    const color = `rgb(${temp[0] * 100}, ${temp[1] * 100}, ${temp[2] * 100})`;
	    const starLocation = StarLocation(planet);
	    const spriteMaterial = new THREE.SpriteMaterial({"map": starImage, "color": color});
	    const starSprite = new THREE.Sprite(spriteMaterial);
	    starSprite.userData.game = {
		"planetcount": 0,
		"name": planet.star_index,
		"official_designation": official_designation,
		"location": starLocation,
		"label": addLabel(starLocation, official_designation, 0.4, color),
		"planets": {}
	    };

	    starSprite.position.set(starLocation.x, starLocation.y, starLocation.z);
	    //scene.add(starSprite);
	    system.userData.game.stars[planet.star_index] = starSprite;
	    system.userData.game.starcount += 1;
	}

	const star = system.userData.game.stars[planet.star_index];

	star.userData.game.planets[planet.planet_index] = planet;
	system.userData.game.planetcount += 1;

    });
};

function animate() {
    requestAnimationFrame( animate );
    labelRenderer.render(scene, camera);
    renderer.render( scene, camera );
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function getIntersects(event) {
    // Normalize the mouse position from -1 to +1 for both axes
    mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    //console.log(`mouse x:${mouse.x} y:${mouse.y}`);

    // Calculate objects intersecting the picking ray
    return raycaster.intersectObjects(scene.children);
}

function zoomout() {
    let target = controls.target;
    camera.position.set(
	camera.position.x - (target.x - camera.position.x) * 12,
	camera.position.y - (target.y - camera.position.y) * 12,
	camera.position.z - (target.z - camera.position.z) * 12
    );
    if (camera.position.x > 500 || camera.position.y > 500 || camera.position.z > 500) {
	camera.position.set(0, 0, 500);
	camera.lookAt(0, 0, 0)
    }
    controls.update();
}

function zoomin(event) {
    const intersects = getIntersects(event)

    // not object, return. Don't zoom in on nothing.
    if (intersects.length < 1)
	return;

    // get the rearmost target (only way to zoom in on objects behind other objects)
    var target = intersects[intersects.length - 1]

    camera.lookAt(target.point); // point camera at it
    controls.target.set(target.point.x, target.point.y, target.point.z); // center of world
    controls.update();

    // --------------------
    // zoom in or out on mouse click
    camera.position.set(
	camera.position.x + (target.point.x - camera.position.x)/config.zoom_factor,
	camera.position.y + (target.point.y - camera.position.y)/config.zoom_factor,
	camera.position.z + (target.point.z - camera.position.z)/config.zoom_factor
    );

    //console.log("camera:", camera.position);

    let distance = camera.position.distanceTo(target.point);
    if (distance < 20) {
	focus(target.object);
    }	
    
    //---------------

    intersects.forEach(function(intersect) {
	let o = intersect.object;
	//console.log(JSON.stringify(o));
    });
}

renderer.domElement.addEventListener('dblclick', function(event) {
    let intersects = getIntersects(event)
    // not object, return.
    if (intersects.length < 1) {
	zoomout();
	return;
    }

    if (Keydown[16]) // shift key
	zoomout();
    else
	zoomin(event);
})

renderer.domElement.addEventListener('contextmenu', function(event) {
    let intersects = getIntersects(event)
    // not object, return.
    if (intersects.length < 1)
	return;

    var star = intersects[intersects.length - 1];
    popupSystem(star);
})

// load planets
fetch("planets.json").then((response) => response.json())
    .then((data) => loadPlanets(data))
    .then(() => animate())
    .catch((err) => alert(err.message));

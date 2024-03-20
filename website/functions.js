var Planets;

function loadPlanets() {
    fetch("planets.json")
	.then(response => response.json())
	.then(data => Planets = data)
	.catch((error) => console.log(`failed to load planets ${error}`));
}

function fadein(element, seconds) {
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

function fadeout(element, seconds) {
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

function randomPlanet() {
    if (!Planets || Planets.length < 1) {
	loadPlanets();
	return "video/planet_852f9f7e-eb5e-4df0-be17-5f8c76da2ec4.mp4";
    }
    let pcount = Planets.length;
    let index = Math.floor(Math.random() * pcount);
    return Planets[index].planet_video;
}

function randomLifeform() {
    if (!Planets || Planets.length < 1) {
	loadPlanets();
	return "lifeforms/lifeform_00e030aa-ddbf-4f37-bd49-42a4d756d6b1.png";
    }
    let pcount = Planets.length;
    let index = Math.floor(Math.random() * pcount);
    return Planets[index].lifeform_image;
}

function randomCulture() {
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





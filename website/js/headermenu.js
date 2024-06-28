function extractDomain(hostname) {
    if (!hostname)
	hostname = window.location.hostname;
    if (hostname.match(/^\d+\.\d+\.\d+\.\d+/))
	return null;
    const match = hostname.match(/(?:.*\.)?(\w+)(?:\.\w+)?$/);
    return match ? match[1] : null;
}

function setCookie(name, value, options) {
    document.cookie = `${name}=${value}; path=/; max-age=${365*86400}`;
    const domain = extractDomain();
    if (domain)
	document.cookie += `; domain=${domain}`
    return document.cookie;
}

function getCookie(name) {
    let hits = document.cookie.match(`${name}=([^;]*)`);
    if (!hits)
	return null;
    return hits[1];
}

function titleize(sentence) {
    try {
	const words = `${sentence}`.split(/[_ ]+/);
	let fixup = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
	return fixup.join(' ')
    } catch(exc) {
	return "";
    }
}

document.getElementById("navheader").innerHTML = `
      <div class="container-fluid">
	<a class="navbar-brand" href="home.html">
	  <img style="width: 30vw; margin-right: 0; pad-right: 0;" src="image/ExoPlaneteer.png">
	</a>
	<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
	  <span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarNavDropdown">
	  <ul class="navbar-nav bg-transparent">
	    <li class="nav-item dropdown">
	      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
		Intro
	      </a>
	      <ul class="dropdown-menu bg-black" aria-labelledby="navbarDropdownMenuLink">
		<li><a class="dropdown-item" href="home.html">Introduction Start Here</a></li>
		<li><a class="dropdown-item" href="planets.html">Planets</a></li>
		<li><a class="dropdown-item" href="lifeforms.html">Lifeforms</a></li>
		<li><a class="dropdown-item" href="cultures.html">Cultures</a></li>
	      </ul>
	    </li>

	    <li class="nav-item dropdown">
	      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
		Sectors
	      </a>
	      <ul id="sectors" class="dropdown-menu bg-black" aria-labelledby="navbarDropdownMenuLink">
	      </ul>
	    </li>

	    <li class="nav-item dropdown">
	      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
		Planets
	      </a>
	      <ul class="dropdown-menu bg-black" aria-labelledby="navbarDropdownMenuLink">
		<li><a class="dropdown-item" href="gallery.html">All Planets in Sector</a></li>
		<li><a class="dropdown-item" href="screensaver.html">All Planets Screensaver</a></li>
		<li><a class="dropdown-item" href="myplanets.html">My Planets Screensaver</a></li>
		<li><a class="dropdown-item" href="mygallery.html">My Planets in Sector</a></li>	
		<li><a class="dropdown-item" href="galaxy.html">3D Map</a></li>
	      </ul>
	    </li>

	    <li class="nav-item dropdown">
	      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
		About
	      </a>
	      <ul class="dropdown-menu bg-black" aria-labelledby="navbarDropdownMenuLink">
		<li><a class="dropdown-item" href="faq.html">FAQ</a></li>
		<li><a class="dropdown-item" href="info.html">Contact</a></li>
		<li><a class="dropdown-item" href="roadmap.html">Roadmap</a></li>
	      </ul>
	    </li>

	  </ul>
	</div>
      </div>`;

var Config = {};

let currentSector = getCookie("sector") || "concord";
setCookie("sector", currentSector);

await fetch('configs/galaxy.json', { headers: {'Cache-Control':'no-cache'} })
    .then((response) => response.json())
    .then((data) => {
	Config = data;
        let sectorlist = document.getElementById("sectors");
        for (const sector in data.sectors) {
	    const info = data.sectors[sector]
            let item = document.createElement("li");
	    item.style.cssText = "color: white";
	    item.className = "dropdown-item";
	    let href = document.createElement("a")
	    href.addEventListener('click', function () {setCookie("sector", sector)})
	    href.text = titleize(sector);
	    Object.assign(href.style, {textDecoration: "none"});
	    if (sector == currentSector)
		Object.assign(href.style, {color: "green"});
	    href.href = 'gallery.html';
	    item.appendChild(href);
	    item.title = info.Description;
            sectorlist.appendChild(item);
	}
    })
    .catch((error) => console.log(error))

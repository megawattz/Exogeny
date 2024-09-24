function extractDomain(hostname) {
    if (!hostname)
	hostname = window.location.hostname;
    if (hostname.match(/^\d+\.\d+\.\d+\.\d+/))
	return null;
    const match = hostname.match(/(?:.*\.)?(\w+)(?:\.\w+)?$/);
    return match ? match[1] : null;
}

function setCookie(name, value, options) {
    let newcookie = `${name}=${value}; path=/; max-age=${365*86400}`;
    document.cookie = newcookie;
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
      <div class="container-fluid" style="margin: 0 auto; z-index: 100";>
	<a class="navbar-brand" href="/screensaver">
	  <img style="width: clamp(360px, 28vw, 28vw); margin-right: 0; pad-right: 0;" src="/media/images/ExoPlaneteer.png">
	</a>
	<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
	  <span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarNavDropdown">
	  <ul class="navbar-nav nav-top bg-transparent">

	    <li class="nav-item dropdown">
	      <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                 Planet Maker
	      </a>
	      <ul class="dropdown-menu bg-black" aria-labelledby="navbarDropdownMenuLink">
		<li><a class="dropdown-item nav-link" href="/editplanet">Edit/Create Planets</a></li>
		<li><a class="dropdown-item nav-link" href="/myplanets">Browse Planets</a></li>
		<li><a class="dropdown-item nav-link" href="/allgallery">Screen Saver 1</a></li>
		<li><a class="dropdown-item nav-link" href="/screensaver">Screen Saver 2</a></li>
	      </ul>
	    </li>
	  </ul>
	</div>
      </div>`;


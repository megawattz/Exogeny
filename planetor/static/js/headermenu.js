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
      <div class="container-fluid" style="position: fixed; left: 1vh; top: 1vh; margin: 0 auto; z-index: 100";>
	<a class="navbar-brand" href="/screensaver">
	  <img style="width: clamp(360px, 20vw, 20vw); margin-right: 0; pad-right: 0;" src="/media/images/ExoPlaneteer.png">
	</a>
	<button class="navbar-toggler" type="button" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
	  <span class="navbar-toggler-icon"></span>
	</button>
	<div class="collapse navbar-collapse" id="navbarNavDropdown">
	  <ul class="navbar-nav nav-top bg-transparent">
		<a class="nav-link" href="/editplanet">Edit</a>
		<a class="nav-link" href="/myplanets">Browse</a>
		<a class="nav-link" href="/mygallery">Gallery</a>
		<a class="nav-link" href="/lifeforms">Lifeforms</a>
		<a class="nav-link" href="/screensaver">Screen Saver</a>
		<a class="nav-link" href="/website/gallery.html">Website</a>
	  </ul>
	</div>
      </div>`;


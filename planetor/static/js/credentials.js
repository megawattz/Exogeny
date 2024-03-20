/* get and set session cookie */

function getCookie(name) {
    if (document.cookie == null)
	return null;
    const fetch_cookie = RegExp(name+"=([^;]+)");
    if (fetch_cookie == null)
        return null;
    const values = document.cookie.match(fetch_cookie);
    if (values == null)
	return null;
    return values[1];
}

function setCookie(name, value) {
    var cookie = `${name}=${value}; path=/; max-age=31622400; SameSite=Lax`;
    document.cookie = cookie;
}

function login() {
    var planeteer = getCookie("planeteer");
    console.log(`Has Existing Credentials:${planeteer}`)
    if (planeteer == null) {
	planeteer = `${Math.round(Date.now()/86400/60)}`;
	setCookie("planeteer", planeteer)
	console.log(`Needed new Credentials:${planeteer}`)
    }
    Credentials = planeteer;
    Userdata = {}
    $.ajax({
	url: `/dbread?table=user&row=${Credentials}`,
	success: function(data) {
	    console.log(data)
	    Userdata = data.read
	}			
    });	
}

var Credentials = null;

login();




const serverUrl = "https://5zl5fqtuk6jb.usemoralis.com:2053/server";
const appId = "qdUtkLkNRoZZLVyPYNABPjO09Xj2364FjLa0qStV";

Moralis.start({ serverUrl, appId });

User = Moralis.User.current();

/** Add from here down */
function Login() {
    //User = Moralis.User.current();
    if (!User) {
	try {
	    User = Moralis.authenticate({ signingMessage: "Signed In" });
	    if (User) {
		console.log(User);
		console.log(User.get("ethAddress"));
	    }
	} catch (error) {
	    alert("Install Metamask: https://metamask.io/");
	}
    }
    UpdateButton()
}

async function Logout() {
    await Moralis.User.logOut();
    console.log("logged out");
    User = null
    UpdateButton()
}

var button_metamask = document.getElementById('btn-metamask');

async function UpdateButton() {
    if (!User) {
	button_metamask.innerHTML = "Connect Metamask";
	button_metamask.onclick = Login;
    }
    else
    {
	button_metamask.innerHTML = "Disconnect Metamask";
	button_metamask.onclick = Logout;
    }
}

UpdateButton();

function getCookie(User) {
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


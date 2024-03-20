// DO NOT CHECK THIS INTO GITHUB

var Data = {
    credentials:
    {
	serverUrl: "https://dzgjbvdm9qze.usemoralis.com:2053/server",
	appId: "e1U1jaKoihW5hFcKd0RJBQPDyNkNQgQArVZsMp0s",
	masterKey: "0eQYmiLRxFS0jcBguz12MnuuScpeDnkazgfVvefB"
    }
};

function parseqs(qs) {
    results = {}
    qs.replace(/[?&]([^=]+)=([^&]*)/g, function(all, key, value) {
        results[key]= value;
    });
    return results;
}

var params = parseqs(window.location.search);

// this calls the funcion in the context of the calling javascript, so it has to have a function with the right name
params['func'](Data[params['which']]);




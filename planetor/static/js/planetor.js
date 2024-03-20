// Planetor Functions

var Explanations = {
    "sun_color":"The color of the sun, and the brightness (the three numbers are Red, Green and Blue strengths)",
    "planet_size":"Radius in thousand kilometers",
    "planet":"The surface appearance of the planet, probably the most critical element of its appearance",
    "clouds":"The pattern of the clouds",
    "clouds_density":"How thick the clouds are, the higher the number the less dense so 1 is totally transparent, and 0 is opaque",
    "atmosphere":"What the atmosphere is composed of, the most important factor in the planets color",
    "atmosphere_density":"How thick the atmosphere is, like clouds, the higher the number the less thick with 1 being totally transparent",
    "camera_location":"Where is the camera shooting the scene positioned on an x, y, z cooordinate system",
    "star_system":"The base name of the planet",
    "star_index":"Most start systems have mulitple stars, labeled with greek letters.",
    "planet_index":"Which planet position from the star using Roman numerals, lowest numbers are closest",
    "background":"The background image",
    "moons":"How many moons does this planet have?"
}

var Options = {};

var called = 0;

function generate(Options, form) {
    var form = document.getElementById("edit");
    inputs = form.getElementsByTagName("input");
    var query = "";
    for (i in inputs) {
        element = inputs[i];
        if (element.type != 'checkbox')
            continue;
        if (element.checked) // true means "I want to change this, so send empty string to regenerate randomly"
            element.value = "";
        query += `&${element.name}=${element.value}`;
    }
    console.log("attempting to execute generate_planet ")

    if (called++)
	return;

    $(document).ready(function() {
        $.ajax({
            url: `/generate_planet?${query}`, //The URL you defined in urls.py
            success: function(data) {
                console.log(data)
                catchOptions(data);  // sendint this, returns javascript code that executes ...
            }
        });
    });
}

function catchOptions(incoming_options) {
    called = 0;
    var form = document.getElementById("edit");
    for (var key in incoming_options['checkboxes']) {
        value = incoming_options['checkboxes'][key];
        var check = document.getElementById(key)

	if (!check) {
            check = document.createElement('input')
            check.type = "checkbox";
            check.name = key;
            check.id = key;
            check.label = key;
            form.appendChild(check);
        }
	
	check.checked = false;
        check.value = value;
        check.title = Explanations[key]
	
        var label = `${key}_label`;
        var text = document.getElementById(label);
        if (!text) {
            text = document.createElement('text');
            text.id = label;
            form.appendChild(text);
            form.appendChild(document.createElement("br"))
        }
        text.textContent = ` ${key} ${value}`;
    }
    form.appendChild(document.createElement("br"))
    
    var butt = document.getElementById("generate");
    if (!butt) {
        butt = document.createElement('input');
        butt.type = "button";
        butt.onclick = generate;
        butt.value = "Apply Choices";
        butt.style = "background-color: black; color: white;";
        butt.id = "generate";
        form.appendChild(butt)
    }
    var planet = document.getElementById("planetDisplay");
    if (planet) {
	planet_file = `/media/stills/planet_${incoming_options['identity']}.gif`;
        planet.style.backgroundImage =`url(${planet_file})`;
    }
    Options = incoming_options;
}

if (Object.keys(Options).length == 0)
    console.log("attempting to execute generate(Options) for the first time")
generate(Options);

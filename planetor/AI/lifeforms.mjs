#!/usr/bin/node

import * as fs from 'fs';
import Replicate from "/usr/lib/node_modules/replicate/index.js";
import { fetchArgs } from "/app/planetor/tools/utils.mjs";

const Specials = [
    "cute critters, bear, a chickadee, a squirrel, a rabbit, a mouse, a deer, a racoon, a fox dancing around a christmas tree and an altar",
    "a xenomorph and a yauta fighting"
];

function getSpecial(terrain) {
    var foreground = randomMember(Specials);
    return `a ${terrain} landscape with ${foreground}`;
}

// Things to block in images
const Negatives = {
    "Gaseous":"((human)),child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit",
    "Blob":"child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit",
    "Plant":"child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit",
    "Fungoid":"child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit",
    "Aquatic":"child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit",
    "Aerial":"children,adults,teens,child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit",
    "Cephalopoid":"child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit",
    "Insectoid":"child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit",
    "Reptilian":"child,children,humans,people,men,women,man,woman,person,gun,soldier,business suit,human",
    "Quadruped":"child,children,(((human body))),woman,people,men,women,man,person,gun,soldier,business suit,((nudity)),((naked)),((ugly)),((morbid)),((mutilated)),[out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck)))",
    "Humanoid":"((4 legs)) ((exactly human)),child,children,((human)),woman,people,person,gun,soldier,business suit,((nudity)),((naked)),((ugly)), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck)))",
    "Human":"((nudity)),((naked)),((ugly)), ((morbid)), ((mutilated)), [out of frame], extra fingers, mutated hands, ((poorly drawn hands)), ((poorly drawn face)), (((mutation))), (((deformed))), ((ugly)), blurry, ((bad anatomy)), (((bad proportions))), ((extra limbs)), cloned face, (((disfigured))), out of frame, ugly, ((extra hands)), extra limbs, (bad anatomy), gross proportions, (malformed limbs), ((missing arms)), ((missing legs)), (((extra arms))), (((extra legs))), mutated hands, (fused fingers), (too many fingers), (((long neck)))"
};

const Descriptions = {
    "Gaseous":[
	"small clouds of colored smoke with distinct shape",
	"smokey monsters in various colors with distinct shape billowing smoke"
    ],
    "Blob":[
	"irregular shape blobs of jello"
    ],
    "Plant":[
	"variably colored trees or shrubs with leaves"
    ],
    "Fungoid":[
	"unusual, mobile mushrooms showing signs of higher intelligence",
	"unusual, mobile fungus showing signs of higher intelligence",
    ],
    "Aquatic":[
	"humanoids adapted to living in water, with fins and gills, using primitive tools",
	"reptiles adapted to living in water, with fins and gills, using primitive tools",
	"insectoids adapted to living in water, with fins and gills, using primitive tools",
	"alien floating eyeball dangling appendages underwater using primitive tools",
	"quadrupeds adapted to living in water, with fins and gills, and opposing thumbs, using primitive tools",
	"alien, sea serpents, male and female, underwater using primitive tools"
    ],
    "Aerial":[
	"alien flying small dragons",
	"alien birds reading scrolls",
	"alien pufferfish as birds, floating in the air",
	"alien pterodactyls reading books"
    ],
    "Cephalopoid":[
	"large, alien multilegged cephalopod halfway submerged using tools",
	"large, alien multilegged octopus using tools devices halfway submerged",
	"large, alien steampunk jellyfish with many tentacles halfway submerged using tools",
	"large, alien multilegged squid with primitive tools in arms halfway submerged",
	"large, alien multilegged hexapod wearing a promitive helmet and/or gloves"
    ],
    "Insectoid":[
	"alien looking insects standing upright studying reading materials, wearing adornment",
	"alien crusaceans like exotically formed crabs, lobsters and crawfish using primitive tools made from underwater materials, wearing adornment",
	"alien spiders using tools, wearing adornment befitting spiders",
	"alien creatures based on, but not exactly like, the attackers from a quite place",
	"exotic random selection from every insect alien in movies and television, multiple creatures, including both male and female or asexual members, holding primitive tools, weapons or reading materials",
	"large, alien halo pod infector like wearing jewelry and carrying primitive weapons",
	"large, alien non-aquatic crustaceans wearing jewelry and carrying primitive weapons",
	"large, alien halo flood infector like wearing jewelry and carrying primitive weapons",
	"alien looking insects standing upright using primitive, artificial tools, wearing adornment",
	"adult male and female xenomorph-like aliens, in clothes, using primitive tools, ((homogenous skin color over entire body)) ((matching eyes))",
    ],
    "Reptilian":[
	"alien halo sangheili like wearing clothing, jewelry and carrying primitive weapons",
	//"alien herbivore dinosaurs, standing erect, with opposable thumbs, scaly skin, wearing ancient garments, holding primitive tools",
	"alien roman reptiles with opposable thumbs, with scaly skin in erect posture wearing ancient, garments from a variety of ancient cultures, holding primitive tools",
	"alien roman alligators with opposable thumbs, standing erect, with scaly skin in erect posture wearing ancient, garments from a variety of ancient cultures, holding primitive tools",
	"alien babylonian reptiles with opposable thumbs, with scaly skin in erect posture wearing ancient, garments from a variety of ancient cultures, holding primitive tools",
	"alien exotic random selection from every reptilian alien in movies and television, multiple creatures, including both male and female or asexual members, holding primitive tools, weapons or reading materials",
	"alien exotic random selection from every small dragon alien in movies and television, multiple creatures, including both male and female or asexual members, holding primitive tools, weapons or reading materials",
	"alien exotic frogs with opposable thumbs, standing erect, adorned in ancient, primitive gear, reading scrolls",
	"alien dragons wearing jewelry and carrying primitive weapons",
	"alien eqyptian reptiles with opposable thumbs, with scaly skin in erect posture wearing ancient, garments from a variety of ancient cultures, holding primitive tools"
    ],
    "Quadruped":[
	"alien, large, 4 legged, standing erect, unlike any known Earth species, wearing strange clothes, holding primitive tools",
	"alien, large cat-like creatures, standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive clothes, holding primitive tools",
	"alien ungulates standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive clothes, holding primitive tools or reading",
	"alien mustelids standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive clothes, holding primitive tools or reading",
	"alien, jumble of many different creatures, standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive clothes, holding primitive tools",
	"large, alien felines standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive cat clothes, holding primitive tools",
	"large, alien weasels standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive cat clothes, holding primitive tools",
	"alien canines, standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive dog clothes, holding primitive tools",
	"alien rodent-like creatures, standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive dog clothes, holding primitive tools",
	"alien mammals standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive clothes, holding primitive tools or reading",
	"four legged alien monstrosity standing erect, with opposable thumbs, mixed male and female, wearing ancient, primitive clothes, holding primitive tools or reading"
    ],
    "Humanoid": [
	"exotic adult male and female yeti-aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic adult male and female orc-like aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic adult male and female cryptids aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic adult male and female humanoid alien Djinn, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic adult male and female humanoid aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic stocky, adult male and female humanoid aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic random selection from every two legged, upright standing, humanoid, mammal alien species in movies and television and media, multiple creatures, including both male and female or asexual members",
	"exotic adult male and female halfling-like aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic adult male and female elf-like aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic adult male and female gnome-like aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic adult male and female gizmo-like aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))",
	"exotic hairy, adult male and female humanoid aliens, in clothes, using primitive tools, in archaic clothing, consistent skin color between head and body ((matching eyes, two arms))"
    ],
    "Human":[
	"((closeup)) of human-like exotically beautiful females and males, with unique characteristics, clothed in incongruent clothing, from ancient northern european nations wild, creative hairstyles  ((identical, well formed eyes))",
	"((closeup)) of human-like exotically beautiful females and males, each with unique characteristics, clothed in incorrect clothing, from ancient asian nations fully clothed wild, creative hairstyles  ((identical, well formed eyes))",
	"((closeup)) of human-like exotically beautiful females and males, each with unique characteristics, clothed in incorrect clothing, from ancient african nations fully clothed wild, creative hairstyles  ((identical, well formed eyes))",
	"((closeup)) of human-like exotically beautiful females and males, each with unique characteristics, clothed in incorrect clothing, from ancient latin nations fully clothed wild, creative hairstyles  ((identical, well formed eyes))",
	"human-like exotically beautiful female and male, fully clothed in primitive, animal skins, wild designs with no limits, mixed race in various percentages of any of the races on Earth ((well formed faces)) ((supermodel physique)) ((identical, well formed eyes))",
	"((closeup)) of human-like exotically beautiful female and male, each with unique characteristics, clothed in incorrect clothing, wild, creative hairstyles, fully clothed in ancient, alien designs,  ((identical, well formed eyes))",
	"((closeup)) of human-like exotically beautiful females and males, each with unique characteristics, clothed in incorrect clothing, wild, creative hairstyles, in wild clothes each with ancient, alien design,  ((identical, well formed eyes))",
	"((closeup)) of human-like exotically beautiful females and males, each with unique characteristics, clothed in incorrect clothing, wild, creative hairstyles, in animal skin clothes from a variety of pre-historic cultures, ",
	"((closeup)) of human-like exotically beautiful females and males, each with unique characteristics, clothed in incorrect clothing, of the same stock but mixed from various human races from every continent, fully clothed in ancient, incorrect, traditional clothes,  ((identical, well formed eyes))"
    ]
}

function randomInt(max, min) {
    if (!min)
	min = 0;
    let rando = Math.floor(Math.random() * (max - min) + min);
    return rando;
}

function randomMember(lst) { // pick a random item from a list
    if (lst.length == 0)
	return null;

    return lst[randomInt(lst.length)]
}

function randomMemberExp(list, base = 2) {
    const max = Math.floor(Math.pow(base, list.length));
    const choice = Math.floor(Math.random() * (max + 1));
    let item;
    try {
        item = Math.trunc(Math.log(choice) / Math.log(base));
    } catch (e) {
        // log of 0 not possible so just choose the most common choice
        item = list.length - 1;
    }
    return list[item];
}

function getDescription(name) {
    var desc = Descriptions[name]
    if (!desc)
	return name;
    var choice = randomMember(desc) || name;
    return choice;
}

const Atmospheres = {
    "sulfur_dioxide":"yellow",
    "nitrous_oxide":"light green",
    "nitrogen_dioxide":"light orange",
    "krypton":"light magenta",
    "hydrogen_iodide":"dark purple",
    "hydrogen_chloride":"light green",
    "hydrogen_bromide":"pink",
    "argon":"light purple",
    "acetylene":"orange",
    "phosphine":"aqua",
    "neon":"light orange",
    "oxygen":"dark blue",
    "bromine":"red",
    "iodine":"purple",
    "carbon_dioxide":"light orange",
    "chlorine":"yellow green",
    "nitrogen":"lavender",
    "ozone": "cyan",
    "water_vapor":"baby blue",
    "ammonia":"light green",
    "nitrosyl_bromide":"deep red",
    "TFNM":"sky blue"
}

function getAtmosphere(name) {
    return Atmospheres[name] || name;
}

const Extras = [
    "spooky alien landscape",
    "meteors",
    "bubbles of colored gas",
    "with slimy skin",
    "stormy",
    "raining",
    "snowing",
    "tornado",
    "foggy",
    "sandstorm",
    "companion creatures",
    "windy",
    "multiple suns",
    "overcast",
    "storm clouds",
    "halo around sun",
    "floating plant life",
    "dawn",
    "dusk",
    "sunset",
    "starry sky",
    "nighttime"
];

function getExtra() {
    var choice = randomMemberExp(Extras, 2);
    return choice;
}

const Actions = [
    "in front of a statue worshipping",
    "building something",
    "playing a sport",
    "fighting a battle with primitive weapons",
    "using primitive tools",
    "playing primitive, alien musical instruments",
    "writing something",
    "brandishing primitive weapons",
    "doing chores",
    "doing field work",
    "tending a fire",
    "hunting",
    "farming",
    "fishing",
    "gathering nuts and berries",
    "running",
    "resting",
    "sleeping",
    "having a party",
    "listening to a lecture",
    "reading primitive materials"
];

function getAction() {
    var choice = randomMember(Actions);
    return choice;
}

const Terrains = {
    "terrestrial":[
	"in front of a vista of forests, rivers, lakes and mountains in the distance",
	"in front of a large fjord",
	"in front of a deep, cozy forest",
	"in a primitive village",
	"in a vast open plain",
	"in a shattered surface",
	"surrounded by ancient ruins",
	"in the open sea with waves and wind",
	"overlooking an inland sea with islands and ocean in the distance",
	"in a lushly vegetated valley surrounded by high peaks in the distance",
	"in front of a deep canyon"
    ],
    "oceanic":[
	"mixture of ocean and land",
	"a vista of islands and ocean",
	"on a beach"
    ],
    "aquatic":[
	"all water ocean"
    ],
    "desert":[
	"vast open areas of dry shrubbery or sand",
	"vista of endless rolling sand dunes into the distance"
    ],
    "volcanic": [
	"volcanoes spewing magma and lakes of lava and smoke filled atmosphere",
	"fractured terrain with rivers of molten lava and smoke filled atmosphere"
    ],
    "forest":[
	"lush forests of massive trees",
	"lush jungle of tropical vegetation"
    ],
    "gasgiant":[
	"multiple swirling tornadoes of colorful gases",
	"multple swirling, colorful clouds",
	"thunderheads of swirling, colorful gases"
    ],
    "ice": [
	"antarctic terrain"
    ],
    "rocky":[
	"boulders and fractured rock as well as a variety of other terrain",
	"smooth as glass lakes of frozen magma broken with spewing geysers"
    ],
    "savanna":[
	"wide open grassland"
    ],
    "special": [
	"7 or so furry critters around a christmas tree and manger"
    ]
}

function getTerrain(name) {
    var group = Terrains[name]
    if (!group)
    	return name;
    var choice = randomMember(group) || name;
    return choice;
}

function Run() {
    const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN,
    });

    var [params, freeargs] = fetchArgs(process.argv.slice(2), {
	"extras":"any extra elements you want to add",
	"specsfile":"planet parameters file",
	"mood":"cute, scary, playful, busy, friendly, etc.",
	"model":"which stable duffusion model to use",
	"identity":"not required. Used to label ps lines"
    });

    let specs = JSON.parse(fs.readFileSync(params['specsfile']));
    
    var prompt = freeargs[0];
    var negative = "";
    var LifeForm = specs['lifeform'];

    if (!prompt)
	prompt = `
three to five ((photorealistic)) members of intelligent ${getDescription(LifeForm)}, closeup and ((((facing camera)))) ${getAction()},
${getAtmosphere(specs['atmosphere_composition'])} sky, dramatic background, high resolution, 
photorealistic ${specs['planet_type']} landscape ${getTerrain(specs['planet_type'])} and ${getExtra()} 
((skin color pastel variation of ${getAtmosphere(specs['atmosphere_composition'])} )) ((Safe for Work)) entire body same skin type and color, 
eye color complementary to skin perfectly round eye iris ((each individual should be slightly unique from each other)) 
((homogenous skin color over entire body))
as if photographed by nikon SLR camera f/8
`;

    if (specs["lifeform"] == "special" || specs["lifeform"] == "Special")
    {
	prompt = getSpecial();
    }
    else
    {
    	negative = `${Negatives[LifeForm]},((high tech)),((plastic)),((glass)),((metal))`;
    }

    // do not send messages to standard out, only the final output goes to standard out
    //const model = params['model'] || "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4"
    const model = params['model'] || "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
    const input = {
	prompt: prompt,
	negative_prompt: negative,
	width: 1024,
	height: 768,
	color_depth: 4
    };

    console.error("sending request to stable diffusion\n", input);

    var output = replicate.run(model, { input }).then((d) => console.log(d[0]));
}

try {
    Run();
}
catch(ex) {
    console.error(ex);
}



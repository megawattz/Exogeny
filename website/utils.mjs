



function ezhash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5 - hash) + str.charCodeAt(i);
        hash = hash * hash; // Convert to 32bit integer
    }
    return hash;
}

export {ezhash}


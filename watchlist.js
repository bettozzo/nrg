const { createClient } = supabase
const supabaseConnection = createClient('https://gxyzupxvwiuhyjtbbwmb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4eXp1cHh2d2l1aHlqdGJid21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTkzMTMsImV4cCI6MjAzMTg3NTMxM30.4r45EIXsyGCFnsmyx9IcZPFF0NpxFuOrDvf4ghdgdEs')

const userid = new URLSearchParams(window.location.search).get("userid")
const mediaInfo = await getWatchlist();
const userPlatforms = await getUserPlatforms();

document.getElementById("titolo").textContent = "Ecco la tua lista, " + userid + " !"
async function getWatchlist() {
    let { data, error } = await supabaseConnection
        .from('watchlist')
        .select('mediaid(mediaID, is_film, titolo, sinossi, poster_path), is_local')
        .eq("userid", userid)
    return data
}
async function getDoveVedereMedia(mediaId) {
    let { data, error } = await supabaseConnection
        .from('DoveVedereMedia')
        .select('mediaID, piattaforma(nome, logo_path)')
        .eq("mediaID", mediaId)

    let validPlatforms = []
    for (const platform of data) {
        if (userPlatforms.map((userP) => platform.piattaforma.nome == userP.piattaformaNome)) {
            validPlatforms.push(platform.piattaforma.logo_path)
        }
    }
    return validPlatforms
}
async function getUserPlatforms() {
    let { data, error } = await supabaseConnection
        .from('PiattaformeDiUser')
        .select('piattaformaNome')
        .eq("userId", userid)
    return data
}


document.getElementById("titolo").textContent = "Ecco la tua lista, " + userid + " !"

for (const media of mediaInfo) {
    const newDiv = document.createElement("div");
    newDiv.className = "divMedia"

    const leftDiv = document.createElement("div");
    leftDiv.className = "divLeft"
    let poster = preparePoster(media.mediaid.poster_path)
    let titolo = prepareTitolo(media.mediaid.titolo)
    leftDiv.appendChild(poster);
    leftDiv.appendChild(titolo);
    
    const rightDiv = document.createElement("div");
    rightDiv.className = "divRight"
    let piattaforme = await preparePiattaforme(media.mediaid.mediaID);
    rightDiv.appendChild(piattaforme);

    newDiv.appendChild(leftDiv);
    newDiv.appendChild(rightDiv);
    document.body.appendChild(newDiv)
}

async function preparePiattaforme(mediaId) {
    const doveVedereMedia = await getDoveVedereMedia(mediaId);

    const newDiv = document.createElement("div");
    newDiv.className = "divProvider"
    for (const provider of doveVedereMedia) {
        const logoProvider = document.createElement("img");
        logoProvider.src = provider
        logoProvider.className = "provider"
        newDiv.appendChild(logoProvider);
    }
    return newDiv
}

function prepareTitolo(titoloTxt) {
    const titolo = document.createElement("p");
    titolo.textContent = titoloTxt
    titolo.className = "titoloMedia"
    return titolo
}

function preparePoster(path) {
    const poster = document.createElement("img");
    poster.src = path
    poster.className = "poster"
    return poster
}


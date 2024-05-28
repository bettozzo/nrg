const { createClient } = supabase
const supabaseConnection = createClient('https://gxyzupxvwiuhyjtbbwmb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4eXp1cHh2d2l1aHlqdGJid21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTkzMTMsImV4cCI6MjAzMTg3NTMxM30.4r45EIXsyGCFnsmyx9IcZPFF0NpxFuOrDvf4ghdgdEs')

const userid = new URLSearchParams(window.location.search).get("userid")
const mediaInfo = await getWatchlist();
const userPlatforms = await getUserPlatforms();
const cronologia = await getCronologia();

document.getElementById("titolo").textContent = "Ecco la tua lista, " + userid + " !"
async function getWatchlist() {
    let { data, error } = await supabaseConnection
        .from('watchlist')
        .select('id, mediaid(mediaID, is_film, titolo, sinossi, poster_path), is_local')
        .eq("userid", userid)
    return data.sort(compareWatchList)
}
function compareWatchList(a, b) {
    if (a.id < b.id) {
        return -1;
    } else {
        return 1;
    }
}
async function getDoveVedereMedia(mediaId) {
    let { data, error } = await supabaseConnection
        .from('DoveVedereMedia')
        .select('mediaID, piattaforma(nome, logo_path)')
        .eq("mediaID", mediaId)

    let validPlatforms = []
    for (const platform of data) {
        if (userPlatforms.map((userP) => platform.piattaforma.nome == userP.piattaformaNome)) {
            validPlatforms.push(platform.piattaforma)
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
async function getCronologia() {
    let { data, error } = await supabaseConnection
        .from('CronologiaMedia')
        .select('mediaId(mediaID, is_film, titolo, sinossi, poster_path), dataVisione')
        .eq("userid", userid)
    return data.sort(compareCronologia)
}
function compareCronologia(a, b) {
    if (a.dataVisione < b.dataVisione) {
        return 1;
    } else if (a.dataVisione > b.dataVisione) {
        return -1;
    }
    return 0;
}

async function deleteFromWatchlist(mediaid) {
    let { data, error } = await supabaseConnection
        .from('watchlist')
        .delete()
        .eq("userid", userid)
        .eq("mediaid", mediaid)
}
async function insertToCronologia(mediaid) {
    const { data, error } = await supabaseConnection
        .from('CronologiaMedia')
        .insert([
            { "userid": userid, "mediaId": mediaid },
        ])
        .select()
}

async function markAsSeen(mediaid) {
    deleteFromWatchlist(mediaid);
    insertToCronologia(mediaid);
}


document.getElementById("titolo").textContent = "Ecco la tua lista, " + userid + " !"

/* Prepare watchlist */
for (const media of mediaInfo) {
    var newDiv = await prepareGenericMediaDiv(media.mediaid)

    const middleDiw = document.createElement("div");
    middleDiw.className = "divMiddle"
    let buttonDelete = document.createElement("button");
    buttonDelete.textContent = "RIMUOVI"
    buttonDelete.className = "deleteBtn"
    let buttonSeen = document.createElement("button");
    buttonSeen.textContent = "VISTO"
    buttonSeen.className = "seenBtn"

    middleDiw.appendChild(buttonDelete)
    middleDiw.appendChild(buttonSeen)
    newDiv.appendChild(middleDiw);

    const rightDiv = document.createElement("div");
    rightDiv.className = "divRight"
    let piattaforme = await preparePiattaforme(media.mediaid.mediaID);
    rightDiv.appendChild(piattaforme);
    newDiv.appendChild(rightDiv);

    //show films first
    if (!media.mediaid.is_film) {
        newDiv.style.display = "none"
        newDiv.className += " TV"
    } else {
        newDiv.className += " film"
    }
    document.getElementById("watchlist").appendChild(newDiv)

    buttonSeen.addEventListener("click", () => {
        markAsSeen(media.mediaid.mediaID)
        let mediaDiv = document.getElementsByClassName(media.mediaid.mediaID)[0]
        middleDiw.style.display = "none"
        rightDiv.style.display = "none"

        const rightDivAfterSeen = document.createElement("div");
        rightDivAfterSeen.className = "divRight"
        const dataVisione = document.createElement("p");
        var date = new Date()
        dataVisione.textContent = date.getDate() + "/" + (1+date.getMonth()) + "/" + date.getFullYear()
        rightDivAfterSeen.appendChild(dataVisione);

        mediaDiv.appendChild(rightDivAfterSeen)
        let cronologia = document.getElementById("cronologia")
        cronologia.insertBefore(mediaDiv, cronologia.firstChild)
    })

    buttonDelete.addEventListener("click", () =>{
        deleteFromWatchlist(media.mediaid.mediaID)
        let mediaDiv = document.getElementsByClassName(media.mediaid.mediaID)[0]
        mediaDiv.parentNode.removeChild(mediaDiv)
    })
}

/* Prepare cronologia */
document.getElementById("cronologia").style.display = "none";
for (const media of cronologia) {
    var newDiv = await prepareGenericMediaDiv(media.mediaId)
    const rightDiv = document.createElement("div");
    rightDiv.className = "divRight"
    const dataVisione = document.createElement("p");
    var text = media.dataVisione.split("-");
    dataVisione.textContent = text[2] + "/" + text[1] + "/" + text[0]
    rightDiv.appendChild(dataVisione);
    newDiv.appendChild(rightDiv);
    document.getElementById("cronologia").appendChild(newDiv)
}

async function prepareGenericMediaDiv(media) {
    const newDiv = document.createElement("div");
    newDiv.className = "divMedia"
    newDiv.className += " " + media.mediaID

    const leftDiv = document.createElement("div");
    leftDiv.className = "divLeft"
    let poster = preparePoster(media.poster_path)
    let titolo = prepareTitolo(media.titolo)
    leftDiv.appendChild(poster);
    leftDiv.appendChild(titolo);

    newDiv.appendChild(leftDiv);
    return newDiv
}

async function preparePiattaforme(mediaId) {
    const doveVedereMedia = await getDoveVedereMedia(mediaId);

    const newDiv = document.createElement("div");
    newDiv.className = "divProvider"
    for (const provider of doveVedereMedia) {
        const linkToPlatofrm = document.createElement("a");
        linkToPlatofrm.href = prepareLink(provider.nome)
        linkToPlatofrm.target = "_blank"
        const logoProvider = document.createElement("img");
        logoProvider.src = provider.logo_path
        logoProvider.alt = provider.nome
        logoProvider.title = provider.nome
        logoProvider.className = "provider"
        linkToPlatofrm.appendChild(logoProvider)
        newDiv.appendChild(linkToPlatofrm);
    }
    return newDiv
}
function prepareLink(nome) {
    switch (nome) {
        case "Netflix": return "https://www.netflix.com/browse";
        case "Disney Plus": return "https://www.disneyplus.com/it-it";
        case "Rai Play": return "https://www.raiplay.it/";
        case "Crunchyroll": return "https://www.crunchyroll.com/it/";
        case "Amazon Prime Video": return "https://www.primevideo.com/";
    }
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

let filmTab = document.getElementById("filmTab");
let tvTab = document.getElementById("SeriesTab");
let cronTab = document.getElementById("cronologiaTab");

filmTab.addEventListener("click", function () {
    toggleFilmOrTv(true);
    clearTabLayoutActive(filmTab)
})

tvTab.addEventListener("click", function () {
    toggleFilmOrTv(false);
    clearTabLayoutActive(tvTab)
})

cronTab.addEventListener("click", async function () {
    clearTabLayoutActive(cronTab)
    document.getElementById("cronologia").style.removeProperty("display");
    document.getElementById("watchlist").style.display = "none";
})


function clearTabLayoutActive(pressedButton) {
    filmTab.className = filmTab.className.replace(" active", "")
    tvTab.className = tvTab.className.replace(" active", "")
    cronTab.className = cronTab.className.replace(" active", "")
    pressedButton.className += " active"
}

function toggleFilmOrTv(showFilm) {
    var i, tabcontent;
    document.getElementById("cronologia").style.display = "none";
    document.getElementById("watchlist").style.removeProperty("display");

    tabcontent = document.getElementsByClassName("divMedia");
    for (i = 0; i < tabcontent.length; i++) {
        if (showFilm) {
            if (tabcontent[i].className.includes("film") && tabcontent[i].style.display == "none") {
                tabcontent[i].style.removeProperty("display");
            } else if (tabcontent[i].className.includes("TV")) {
                tabcontent[i].style.display = "none"
            }
        } else {
            if (tabcontent[i].className.includes("TV") && (tabcontent[i].style.display == "none")) {
                tabcontent[i].style.removeProperty("display");
            } else if (tabcontent[i].className.includes("film")) {
                tabcontent[i].style.display = "none"
            }
        }

    }
}


document.getElementById("logoff").addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("./index.html");
})
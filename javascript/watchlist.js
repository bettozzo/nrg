import * as remoteDao from "./remoteDBDao.js";


document.getElementById("logoff").addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("./index.html");
})

const userid = new URLSearchParams(window.location.search).get("userid")
const mediaInfo = await remoteDao.getWatchlist();
const cronologia = await remoteDao.getCronologia();

document.getElementById("titolo").textContent = "Ecco la tua lista, " + userid + " !"


//show films first
document.getElementById("watchlistSeries").style.display = "none"

/* Prepare watchlist */
for (const media of mediaInfo) {
    var newDiv = await prepareGenericMediaDiv(media.mediaid)

    const rightDiv = document.createElement("div");
    rightDiv.className = "divRight"
    let piattaforme = await preparePiattaforme(media.mediaid.mediaID, media.is_local);
    rightDiv.appendChild(piattaforme);

    const middleDiv = document.createElement("div");
    middleDiv.className = "divMiddle"
    middleDiv.appendChild(prepareDeleteBtn(media))
    middleDiv.appendChild(prepareSeenBtn(media, middleDiv, rightDiv))

    newDiv.appendChild(middleDiv);
    newDiv.appendChild(rightDiv);

    if (!media.mediaid.is_film) {
        newDiv.className += " TV"
        document.getElementById("watchlistSeries").appendChild(newDiv)
    } else {
        newDiv.className += " film"
        document.getElementById("watchlistFilm").appendChild(newDiv)
    }

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

function prepareSeenBtn(media, middleDiv, rightDiv) {
    let buttonSeen = document.createElement("button");
    buttonSeen.textContent = "VISTO"
    buttonSeen.className = "seenBtn"
    buttonSeen.addEventListener("click", () => {
        seenBtnOnClick(media, middleDiv, rightDiv)
    })
    return buttonSeen;
}

function prepareDeleteBtn(media) {
    let buttonDelete = document.createElement("button");
    buttonDelete.textContent = "RIMUOVI"
    buttonDelete.className = "deleteBtn"

    buttonDelete.addEventListener("click", () => {
        deleteFromWatchlist(media.mediaid.mediaID)
        let mediaDiv = document.getElementsByClassName(media.mediaid.mediaID)[0]
        mediaDiv.parentNode.removeChild(mediaDiv)
    })
    return buttonDelete;
}

function seenBtnOnClick(media, middleDiw, rightDiv) {
    remoteDao.markAsSeen(media.mediaid.mediaID)
    let mediaDiv = document.getElementsByClassName(media.mediaid.mediaID)[0]
    middleDiw.style.display = "none"
    rightDiv.style.display = "none"

    const rightDivAfterSeen = document.createElement("div");
    rightDivAfterSeen.className = "divRight"
    const dataVisione = document.createElement("p");
    var date = new Date()
    var month = 1 + date.getMonth()
    if (month.toString().length < 2) {
        month = "0" + month
    }
    dataVisione.textContent = date.getDate() + "/" + month + "/" + date.getFullYear()
    rightDivAfterSeen.appendChild(dataVisione);

    mediaDiv.appendChild(rightDivAfterSeen)
    let cronologia = document.getElementById("cronologia")
    cronologia.insertBefore(mediaDiv, cronologia.firstChild)
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

async function preparePiattaforme(mediaId, is_local) {
    const doveVedereMedia = await remoteDao.getDoveVedereMedia(mediaId);

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
    if (is_local) {
        const logoProvider = document.createElement("img");
        logoProvider.src = "./images/vhs.png"
        logoProvider.alt = "In locale"
        logoProvider.title = "In locale"
        logoProvider.className = "provider"
        newDiv.appendChild(logoProvider);
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
    if (path != null) {
        poster.src = path
    } else {
        poster.src = "./images/missing_poster.png"
    }
    poster.className = "poster"
    return poster
}

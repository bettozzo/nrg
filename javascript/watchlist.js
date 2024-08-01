import * as remoteDao from "./remoteDBDao.js";


document.getElementById("logoff").addEventListener("click", () => {
    localStorage.clear();
    window.location.replace("./index.html");
})

const userid = localStorage.getItem("username")
document.getElementById("titolo").textContent = "Ecco la tua lista, " + userid + " !"

setupWatchlist();
setupCronologia();

async function setupWatchlist() {
    const mediaInfo = await remoteDao.getWatchlist();
    const filmTab = document.getElementById("watchlistFilm");
    const seriesTab = document.getElementById("watchlistSeries");
    /* Prepare watchlist */
    mediaInfo.forEach(media => {
        var baseDiv = document.createElement("div");
        baseDiv.className = "divMedia";
        baseDiv.onclick = function () {
            let url = new URL("dettaglio.html", window.location.href);
            url.searchParams.append("mediaId", media.mediaId);

            sessionStorage.setItem("media", JSON.stringify(media));

            window.location.href = url;
        };


        /*    poster    */
        var posterImg = document.createElement("img");
        posterImg.className = "poster";
        posterImg.src = media.poster_path;
        baseDiv.appendChild(posterImg)

        /*    titolo    */
        var titolo = document.createElement("p");
        titolo.className = "titoloMedia"
        titolo.textContent = media.titolo;
        baseDiv.appendChild(titolo);

        /*    piattaforme    */
        var piattaforme = document.createElement("div");
        piattaforme.className = "providerDiv"
        for (let i = 0; i < media.piattaforme.length; i++) {
            var piattaforma = document.createElement("img");
            piattaforma.src = media.piattaforme[i].piattaformaLogo
            piattaforma.className = "provider";
            piattaforma.onclick = function () { openLink(media.piattaforme[i].piattaformaNome) };
            piattaforme.append(piattaforma);
        }
        if (media.is_local) {
            var piattaforma = document.createElement("img");
            piattaforma.src = "./images/vhs.png"
            piattaforma.className = "provider";
            piattaforme.append(piattaforma);
        }
        baseDiv.append(piattaforme);

        if (media.is_film) {
            filmTab.appendChild(baseDiv);
        } else {
            seriesTab.appendChild(baseDiv);
        }
    })
}

function openLink(piattaforma) {
    let url;
    switch (piattaforma) {
        case "Netflix": url = "https://www.netflix.com/browse"; break;
        case "Disney Plus": url = "https://www.disneyplus.com/it-it"; break;
        case "Rai Play": url = "https://www.raiplay.it/"; break;
        case "Crunchyroll": url = "https://www.crunchyroll.com/it/"; break;
        case "Amazon Prime Video": url = "https://www.primevideo.com/"; break;
    }
    window.open(url, "_blank");
}


async function setupCronologia() {
    const cronologia = await remoteDao.getCronologia();
    const cronologiaTab = document.getElementById("cronologia");

    cronologia.forEach(data => {
        const titolo = data.titolo;
        const poster_path = data.poster_path;
        const dataVisione = data.dataVisione;

        var baseDiv = document.createElement("div");
        baseDiv.className = "divMedia";

        /*    poster    */
        var posterImg = document.createElement("img");
        posterImg.className = "poster";
        posterImg.src = poster_path;
        baseDiv.appendChild(posterImg)

        /*    titolo    */
        var titoloEl = document.createElement("p");
        titoloEl.className = "titoloMedia"
        titoloEl.textContent = titolo;
        baseDiv.appendChild(titoloEl);

        /*    data visione    */
        var dataVisioneEl = document.createElement("p");
        dataVisioneEl.className = "info-data-visione"

        let date = new Date(dataVisione);
        let day = date.getDate();
        var month = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
            "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"][date.getMonth()];
        let year = date.getFullYear();

        let formattedDate = day + " " + month + " " + year;
        dataVisioneEl.textContent = formattedDate;
        baseDiv.appendChild(dataVisioneEl);

        cronologiaTab.appendChild(baseDiv);
    })
}
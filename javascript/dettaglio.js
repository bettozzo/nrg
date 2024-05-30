import { getDoveVedereMedia, getMedia } from "./remoteDBDao.js";

let titolo = document.getElementById("titolo");
let poster = document.getElementById("poster");
let sinossi = document.getElementById("sinossi");


const mediaID = new URLSearchParams(window.location.search).get("mediaID")
const isLocal = new URLSearchParams(window.location.search).get("islocal")

let media = (await getMedia(mediaID))[0];

titolo.textContent = media.titolo
poster.src = media.poster_path
sinossi.textContent = media.sinossi
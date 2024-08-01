import { Media } from "./Media.js";
import { deleteFromWatchlist, markAsSeen } from "./remoteDBDao.js";

const titolo = document.getElementById("titolo");
const poster = document.getElementById("poster");
const sinossi = document.getElementById("sinossi");
const btnSeen = document.getElementById("btn-seen");
const btnDelete = document.getElementById("btn-delete");


let _media = JSON.parse(sessionStorage.getItem("media"));
let media = new Media(
    _media.mediaId,
    _media.is_film,
    _media.titolo,
    _media.poster_path,
    _media.piattaforme,
    _media.is_local,
    _media.sinossi
)

titolo.textContent = media.titolo
poster.src = media.poster_path
sinossi.textContent = media.sinossi

btnSeen.onclick = async function () { await markAsSeen(media.mediaId); history.back(); }
btnDelete.onclick = async function () { await deleteFromWatchlist(media.mediaId); history.back(); }

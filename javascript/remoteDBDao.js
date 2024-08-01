import { Media } from "./Media.js";
const { createClient } = supabase;
const supabaseConnection = createClient(
	"https://gxyzupxvwiuhyjtbbwmb.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4eXp1cHh2d2l1aHlqdGJid21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTkzMTMsImV4cCI6MjAzMTg3NTMxM30.4r45EIXsyGCFnsmyx9IcZPFF0NpxFuOrDvf4ghdgdEs"
);
const userid = localStorage.getItem("username")


export async function getWatchlist() {
	let { data, error } = await supabaseConnection.rpc("get_full_details_media").eq("userid", userid);
	let medias = [];

	for (let index in data) {
		let sameIdOnes = data.filter(it => it.mediaid == data[index].mediaid);

		let maybePiattaforme = [];
		sameIdOnes.map(it => {
			if (it.nome != null)
				maybePiattaforme.push({ "piattaformaNome": it.nome, "piattaformaLogo": it.logo_path })
		})

		let media = new Media(
			data[index].mediaid,
			data[index].is_film,
			data[index].titolo,
			data[index].poster_path,
			maybePiattaforme,
			data[index].is_local,
			data[index].sinossi,
		);
		medias.push(media);
	}
	medias = getUniqueMedias(medias);
	return medias
}

function getUniqueMedias(medias) {
	let unique = [];
	for (let i = 0; i < medias.length - 1; i++) {
		unique.push(new Media(
			medias[i].mediaId,
			medias[i].is_film,
			medias[i].titolo,
			medias[i].poster_path,
			medias[i].piattaforme,
			medias[i].is_local,
			medias[i].sinossi
		));
		for (let j = i + 1; j < medias.length; j++) {
			if (medias[i].mediaId == medias[j].mediaId) {
				unique.pop();
				break;
			}
		}
	}
	return unique;
}










export async function getCronologia() {
	let { data, error } = await supabaseConnection
		.from("CronologiaMedia")
		.select(
			"mediaId(mediaID, titolo, poster_path), dataVisione"
		)
		.eq("userid", userid);

	let cronologia = [];
	for (let index in data) {
		cronologia.push({
			"titolo": data[index].mediaId.titolo,
			"poster_path": data[index].mediaId.poster_path,
			"dataVisione": data[index].dataVisione
		});
	}

	return cronologia.sort(compareCronologia);
}
function compareCronologia(a, b) {
	if (a.dataVisione < b.dataVisione) {
		return 1;
	} else if (a.dataVisione > b.dataVisione) {
		return -1;
	}
	return 0;
}








export async function markAsSeen(mediaid) {
	await insertToCronologia(mediaid);
	await deleteFromWatchlist(mediaid);
}

export async function deleteFromWatchlist(mediaid) {
	let { data, error } = await supabaseConnection
		.from("watchlist")
		.delete()
		.eq("userid", userid)
		.eq("mediaid", mediaid);

}

async function insertToCronologia(mediaid) {
	const { data, error } = await supabaseConnection
		.from("CronologiaMedia")
		.insert([{ userid: userid, mediaId: mediaid }])
		.select();
}

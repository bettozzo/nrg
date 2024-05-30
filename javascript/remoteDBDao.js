const { createClient } = supabase
const supabaseConnection = createClient('https://gxyzupxvwiuhyjtbbwmb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4eXp1cHh2d2l1aHlqdGJid21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTkzMTMsImV4cCI6MjAzMTg3NTMxM30.4r45EIXsyGCFnsmyx9IcZPFF0NpxFuOrDvf4ghdgdEs')
const userid = new URLSearchParams(window.location.search).get("userid")

export async function markAsSeen(mediaid) {
    deleteFromWatchlist(mediaid);
    insertToCronologia(mediaid);
}

export async function getWatchlist() {
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

export async function getMedia(mediaID) {
    let { data, error } = await supabaseConnection
        .from('Media')
        .select('mediaID, is_film, titolo, sinossi, poster_path')
        .eq("mediaID",mediaID )
    return data.sort(compareWatchList)
}

export async function getDoveVedereMedia(mediaId) {
    let { data, error } = await supabaseConnection
        .from('DoveVedereMedia')
        .select('mediaID, piattaforma(nome, logo_path)')
        .eq("mediaID", mediaId)

    let validPlatforms = []
    const userPlatforms = await getUserPlatforms();
    for (const platform of data) {
        if (userPlatforms.map((userP) => platform.piattaforma.nome == userP.piattaformaNome)) {
            validPlatforms.push(platform.piattaforma)
        }
    }
    return validPlatforms
}
export async function getUserPlatforms() {
    let { data, error } = await supabaseConnection
        .from('PiattaformeDiUser')
        .select('piattaformaNome')
        .eq("userId", userid)
    return data
}

export async function getCronologia() {
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

export async function deleteFromWatchlist(mediaid) {
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

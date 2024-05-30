const { createClient } = supabase
const supabaseConnection = createClient('https://gxyzupxvwiuhyjtbbwmb.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4eXp1cHh2d2l1aHlqdGJid21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTkzMTMsImV4cCI6MjAzMTg3NTMxM30.4r45EIXsyGCFnsmyx9IcZPFF0NpxFuOrDvf4ghdgdEs')


async function login(username) {
    let { data, error } = await supabaseConnection
        .from('Users')
        .select('*')
        .eq("userId", username)

    return data.length != 0
}

const storedUsername = localStorage.getItem("username");
if (storedUsername != null) {
    window.location.replace("./watchlist.html?userid=" + storedUsername);
}


document.getElementById("submitBtn").addEventListener("click", async function () {
    let username = document.getElementById("username").value
    let canLog = await login(username);
    if (canLog) {
        localStorage.setItem("username", username);
        window.location.replace("./watchlist.html?userid=" + username);
    }
})

const isMobile = navigator.userAgentData.mobile;
if (isMobile) {
    document.getElementById("submitBtn").style.display = "none"
    alert("Il sito non è pensato per essere visto da dispositivi mobili\nProva a collegarti da un computer")
}
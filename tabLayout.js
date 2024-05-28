
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
document.addEventListener("DOMContentLoaded", () => {

const songs = [
    {
        title: "SoundHelix Song 1",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        cover: "covers/music1.jpg"
    },
    {
        title: "SoundHelix Song 2",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        cover: "covers/music2.jpg"
    },
    {
        title: "SoundHelix Song 3",
        artist: "SoundHelix",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        cover: "covers/music3.jpg"
    }
]

/* elements */
const audio = document.getElementById("audio-player")
const playBtn = document.getElementById("play")
const prevBtn = document.getElementById("prev")
const nextBtn = document.getElementById("next")

const title = document.getElementById("player-title")
const artist = document.getElementById("player-artist")
const cover = document.getElementById("cover")

const progressBar = document.getElementById("progress-bar")
const currentTimeEl = document.getElementById("current-time")
const durationEl = document.getElementById("duration")

const cards = document.querySelectorAll(".music-card")
const titles = document.querySelectorAll(".music-title")
const artists = document.querySelectorAll(".music-artist")
const favButtons = document.querySelectorAll(".fav-btn")
const playlistButtons = document.querySelectorAll(".playlist-btn")
const btnPlaylists = document.getElementById("btn-playlists")
const btnFavorites = document.getElementById("btn-favorites")
const btnHome = document.getElementById("btn-home")
const btnSearch = document.getElementById("btn-search")
const searchInput = document.getElementById("search-input")

let favorites = JSON.parse(localStorage.getItem("favorites")) || []
let playlist = JSON.parse(localStorage.getItem("playlist")) || []
let currentSong = 0
let activeFilter = "all"
let searchQuery = ""

/* populate cards */
songs.forEach((song, index) => {
    if (titles[index] && artists[index]) {
        titles[index].textContent = song.title
        artists[index].textContent = song.artist
    }
})

/* load music */
function loadSong(index) {
    const song = songs[index]

    audio.src = song.src
    title.textContent = song.title
    artist.textContent = song.artist
    cover.src = song.cover

    highlightCard(index)
}

/* play/pause */
function playSong() {
    audio.play()
}

function pauseSong() {
    audio.pause()
}

if (audio && playBtn) {
    audio.addEventListener("play", () => {
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
    })

    audio.addEventListener("pause", () => {
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
    })

    playBtn.addEventListener("click", () => {
        audio.paused ? playSong() : pauseSong()
    })
}

/* next/prev */
if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
        currentSong = (currentSong + 1) % songs.length
        loadSong(currentSong)
        playSong()
    })

    prevBtn.addEventListener("click", () => {
        currentSong = (currentSong - 1 + songs.length) % songs.length
        loadSong(currentSong)
        playSong()
    })
}

/* auto next */
audio.addEventListener("ended", () => {
    nextBtn.click()
})

/* cards */
cards.forEach((card, index) => {
    card.addEventListener("click", () => {
        currentSong = index
        loadSong(index)
        playSong()
    })
})

/* progress bar */
audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return

    const progress = (audio.currentTime / audio.duration) * 100
    progressBar.value = progress

    currentTimeEl.textContent = formatTime(audio.currentTime)
    durationEl.textContent = formatTime(audio.duration)
})

progressBar.addEventListener("input", () => {
    if (!audio.duration) return
    audio.currentTime = (progressBar.value / 100) * audio.duration
})

function formatTime(time) {
    const min = Math.floor(time / 60)
    const sec = Math.floor(time % 60)
    return `${min}:${sec < 10 ? "0" : ""}${sec}`
}

/* fav + playlist */

function updateFavoriteIcons() {
    favButtons.forEach((btn, index) => {
        if (favorites.includes(index)) {
            btn.innerHTML = '<i class="fa-solid fa-heart"></i>'
        } else {
            btn.innerHTML = '<i class="fa-regular fa-heart"></i>'
        }
    })
}

function updatePlaylistIcons() {
    playlistButtons.forEach((btn, index) => {
        if (playlist.includes(index)) {
            btn.innerHTML = '<i class="fa-solid fa-minus"></i>'
        } else {
            btn.innerHTML = '<i class="fa-solid fa-plus"></i>'
        }
    })
}

favButtons.forEach((btn, index) => {
    if (favorites.includes(index)) {
        btn.innerHTML = '<i class="fa-solid fa-heart"></i>'
    }

    btn.addEventListener("click", (e) => {
        e.stopPropagation()

        if (favorites.includes(index)) {
            favorites = favorites.filter(i => i !== index)
        } else {
            favorites.push(index)
        }

        localStorage.setItem("favorites", JSON.stringify(favorites))
        updateFavoriteIcons()
        filterAndRenderCards()
    })
})

playlistButtons.forEach((btn, index) => {
    if (playlist.includes(index)) {
        btn.innerHTML = '<i class="fa-solid fa-circle-minus"></i>'
    }

    btn.addEventListener("click", (e) => {
        e.stopPropagation()

        if (playlist.includes(index)) {
            playlist = playlist.filter(i => i !== index)
        } else {
            playlist.push(index)
        }

        localStorage.setItem("playlist", JSON.stringify(playlist))
        updatePlaylistIcons()
        filterAndRenderCards()
    })
})

function filterAndRenderCards() {
    cards.forEach((card, index) => {
        const titleMatch = songs[index].title.toLowerCase().includes(searchQuery)
        const artistMatch = songs[index].artist.toLowerCase().includes(searchQuery)
        const matchSearch = !searchQuery || titleMatch || artistMatch
        const matchesFavorites = activeFilter !== "favorites" || favorites.includes(index)
        const matchesPlaylist = activeFilter !== "playlist" || playlist.includes(index)
        const matchesFilter = matchesFavorites && matchesPlaylist

        card.style.display = matchSearch && matchesFilter ? "flex" : "none"
    })

    ensureCurrentSongVisible()
}

function ensureCurrentSongVisible() {
    const currentCard = cards[currentSong]

    if (currentCard && currentCard.style.display === "none") {
        const visibleIndex = Array.from(cards).findIndex(card => card.style.display !== "none")

        if (visibleIndex !== -1) {
            currentSong = visibleIndex
            loadSong(currentSong)
        } else {
            audio.pause()
            highlightCard(-1)
        }
    }
}

function showFavoritesOnly() {
    activeFilter = "favorites"
    filterAndRenderCards()
}

function showPlaylistOnly() {
    activeFilter = "playlist"
    filterAndRenderCards()
}

function showAllSongs() {
    activeFilter = "all"
    searchQuery = ""

    if (searchInput) {
        searchInput.value = ""
    }

    filterAndRenderCards()
}

if (btnFavorites) {
    btnFavorites.addEventListener("click", showFavoritesOnly)
}

if (btnPlaylists) {
    btnPlaylists.addEventListener("click", showPlaylistOnly)
}

if (btnHome) {
    btnHome.addEventListener("click", showAllSongs)
}

if (btnSearch) {
    btnSearch.addEventListener("click", () => {
        if (searchInput) {
            searchInput.focus()
        }
        activeFilter = "all"
        filterAndRenderCards()
    })
}

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase()
        activeFilter = "all"
        filterAndRenderCards()
    })
}

/* cards */
function highlightCard(index) {
    cards.forEach(card => card.classList.remove("active"))
    if (cards[index]) cards[index].classList.add("active")
}

/* start */
updateFavoriteIcons()
filterAndRenderCards()
loadSong(currentSong)

})
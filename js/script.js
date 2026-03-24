const songs = [
    {
        title: "Nome da Música",
        artist: "Artista",
        src: "music/music1.mp3",
        cover: "covers/music1.jpg"
    },
    {
        title: "Outra Música",
        artist: "Artista",
        src: "music/music2.mp3",
        cover: "covers/music2.jpg"
    },
    {
        title: "Mais uma Música",
        artist: "Artista",
        src: "music/music3.mp3",
        cover: "covers/music3.jpg"
    }
];

const audio = document.getElementById("audio-player")
const playBtn = document.getElementById("play")
const prevBtn = document.getElementById("prev")
const nextBtn = document.getElementById("next")

const title = document.getElementById("player-title")
const artist = document.getElementById("player-artist")
const cover = document.getElementById("cover")

const cards = document.querySelectorAll(".music-card")

let currentSong = 0

/* load music function */

function loadSong(index) {
    const song = songs[index]

    audio.src = song.src
    title.textContent = song.title
    artist.textContent = song.artist
    cover.src = song.cover
}

/* play/pause */

function playSong() {
    audio.play()
    isPlaying = true
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
}

function pauseSong() {
    audio.pause()
    isPlaying = false
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
}

let isPlaying = false

playBtn.addEventListener("click", () => {
    if (audio.paused) {
        playSong()
    } else {
        pauseSong()
    }
})

/* next/prev */

nextBtn.addEventListener("click", () => {
    currentSong++

    if (currentSong >= songs.length) {
        currentSong = 0
    }

    loadSong(currentSong)
    playSong()
})

prevBtn.addEventListener("click", () => {
    currentSong--

    if (currentSong < 0) {
        currentSong = songs.length - 1
    }

    loadSong(currentSong)
    playSong()
})

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

loadSong(currentSong)
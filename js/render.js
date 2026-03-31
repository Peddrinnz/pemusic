/* Filtra músicas de acordo com a busca */
export function getVisibleSongEntries(songs, { searchQuery, activeFilter, favorites, playlist }) {
    return songs
        .map((song, index) => ({ song, index }))
        .filter(({ song }) => {
            const matchesQuery =
                !searchQuery ||
                song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                song.artist.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesFilter =
                activeFilter === "all" ||
                (activeFilter === "favorites" && favorites.includes(song.id)) ||
                (activeFilter === "playlist" && playlist.includes(song.id))
            return matchesQuery && matchesFilter
        })
}

/* Cria os cards de música na interface e define eventos dos botões */
export function renderSongCards(musicList, songs, state, handlers) {
    if (!musicList) return

    const visibleSongs = getVisibleSongEntries(songs, state)
    musicList.innerHTML = ""

    if (visibleSongs.length === 0) {
        musicList.innerHTML = '<p class="no-results">Nenhuma música disponível para esses filtros.</p>'
        return
    }

    visibleSongs.forEach(({ song, index }) => {
        const card = document.createElement("div")
        card.className = "music-card"
        card.dataset.index = index
        if (index === state.currentSong) {
            card.classList.add("active")
        }

        const coverSrc = song.cover || 'covers/music1.jpg'
        const titleText = song.title || 'Sem título'
        const artistText = song.artist || 'Artista desconhecido'

        card.innerHTML = `
            <img src="${coverSrc}" alt="Capa da música">
            <h3 class="music-title">${titleText}</h3>
            <p class="music-artist">${artistText}</p>
            <div class="music-buttons">
                <button class="play-btn" title="Tocar música">
                    <i class="fa-solid fa-play"></i>
                </button>
                <button class="fav-btn" title="Favoritar música">
                    <i class="${state.favorites.includes(song.id) ? "fa-solid fa-heart" : "fa-regular fa-heart"}"></i>
                </button>
                <button class="playlist-btn" title="${state.playlist.includes(song.id) ? "Remover da playlist" : "Adicionar à playlist"}">
                    <i class="fa-solid ${state.playlist.includes(song.id) ? "fa-circle-minus" : "fa-circle-plus"}"></i>
                </button>
            </div>
        `

        const playButton = card.querySelector(".play-btn")
        const favButton = card.querySelector(".fav-btn")
        const playlistButton = card.querySelector(".playlist-btn")

        card.addEventListener("click", () => handlers.onSelect(song, index))

        if (playButton) {
            playButton.addEventListener("click", (event) => {
                event.stopPropagation()
                handlers.onSelect(song, index)
                handlers.onPlay()
            })
        }

        if (favButton) {
            favButton.addEventListener("click", (event) => {
                event.stopPropagation()
                handlers.onToggleFavorite(song)
            })
        }

        if (playlistButton) {
            playlistButton.addEventListener("click", (event) => {
                event.stopPropagation()
                handlers.onTogglePlaylist(song)
            })
        }

        musicList.appendChild(card)
    })
}

/* Marca a música que está sendo reproduzida */
export function highlightActiveCard(musicList, currentSong) {
    const cards = musicList.querySelectorAll(".music-card")
    cards.forEach((card) => {
        card.classList.toggle("active", Number(card.dataset.index) === currentSong)
    })
}

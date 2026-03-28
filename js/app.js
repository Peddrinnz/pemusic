import { searchDeezer } from './deezer.js'
import { renderSongCards, getVisibleSongEntries, highlightActiveCard } from './render.js'
import { createPlayer } from './player.js'

document.addEventListener('DOMContentLoaded', async () => {
    const audio = document.getElementById('audio-player')
    const playBtn = document.getElementById('play')
    const prevBtn = document.getElementById('prev')
    const nextBtn = document.getElementById('next')
    const titleEl = document.getElementById('player-title')
    const artistEl = document.getElementById('player-artist')
    const coverEl = document.getElementById('cover')
    const progressBar = document.getElementById('progress-bar')
    const currentTimeEl = document.getElementById('current-time')
    const durationEl = document.getElementById('duration')
    const musicList = document.getElementById('music-list')
    const btnPlaylists = document.getElementById('btn-playlists')
    const btnFavorites = document.getElementById('btn-favorites')
    const btnHome = document.getElementById('btn-home')
    const btnSearch = document.getElementById('btn-search')
    const searchInput = document.getElementById('search-input')
    const userGreeting = document.getElementById('user-greeting')
    const logoutBtn = document.getElementById('logout')
    const volumeBar = document.getElementById('volume-bar')

    let favorites = JSON.parse(localStorage.getItem('favorites')) || []
    let playlist = JSON.parse(localStorage.getItem('playlist')) || []
    let songs = []
    let activeFilter = 'all'
    let searchQuery = ''
    let searchTimeout = null

    const session = JSON.parse(localStorage.getItem('peMusicSession') || 'null')

    const player = createPlayer({
        audio,
        playBtn,
        prevBtn,
        nextBtn,
        progressBar,
        currentTimeEl,
        durationEl,
        titleEl,
        artistEl,
        coverEl,
    })

    player.setOptions({
        onNext: () => {
            const visible = getVisibleSongEntries(songs, { searchQuery, activeFilter, favorites, playlist }).map((item) => item.index)
            player.nextSong(visible)
            render()
        },
        onPrevious: () => {
            const visible = getVisibleSongEntries(songs, { searchQuery, activeFilter, favorites, playlist }).map((item) => item.index)
            player.previousSong(visible)
            render()
        },
    })

    function redirectToLogin() {
        window.location.href = 'login.html'
    }

    function requireLogin() {
        if (!session) {
            redirectToLogin()
            return false
        }

        if (userGreeting) {
            userGreeting.textContent = `Olá, ${session.name}`
        }

        return true
    }

    if (!requireLogin()) return

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('peMusicSession')
            redirectToLogin()
        })
    }

    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }

    function savePlaylist() {
        localStorage.setItem('playlist', JSON.stringify(playlist))
    }

    function render() {
        renderSongCards(musicList, songs, {
            searchQuery,
            activeFilter,
            favorites,
            playlist,
            currentSong: player.getCurrentSong(),
        }, {
            onSelect: (index) => {
                player.loadSong(index)
                player.play()
                highlightActiveCard(musicList, index)
            },
            onPlay: () => player.play(),
            onToggleFavorite: (index) => {
                const song = songs[index]
                if (!song) return
                if (favorites.includes(song.id)) {
                    favorites = favorites.filter((id) => id !== song.id)
                } else {
                    favorites.push(song.id)
                }
                saveFavorites()
                render()
            },
            onTogglePlaylist: (index) => {
                const song = songs[index]
                if (!song) return
                if (playlist.includes(song.id)) {
                    playlist = playlist.filter((id) => id !== song.id)
                } else {
                    playlist.push(song.id)
                }
                savePlaylist()
                render()
            },
        })
    }

    async function searchAndRender(query) {
        if (musicList) {
            musicList.innerHTML = '<p class="loading">Carregando músicas...</p>'
        }

        try {
            songs = await searchDeezer(query)
            player.setSongs(songs)

            if (songs.length > 0) {
                player.loadSong(0)
            } else {
                if (titleEl) titleEl.textContent = 'Nenhuma música encontrada'
                if (artistEl) artistEl.textContent = ''
                if (coverEl) coverEl.src = 'covers/music1.jpg'
                if (audio) audio.src = ''
            }

            render()
        } catch (error) {
            if (musicList) {
                musicList.innerHTML = '<p class="error">Não foi possível carregar resultados da Deezer. Tente novamente mais tarde.</p>'
            }
        }
    }

    function updateFilter(filter) {
        activeFilter = filter
        render()
    }

    if (btnFavorites) {
        btnFavorites.addEventListener('click', () => updateFilter('favorites'))
    }

    if (btnPlaylists) {
        btnPlaylists.addEventListener('click', () => updateFilter('playlist'))
    }

    if (btnHome) {
        btnHome.addEventListener('click', () => {
            activeFilter = 'all'
            searchQuery = ''
            if (searchInput) searchInput.value = ''
            searchAndRender('pop')
        })
    }

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            if (searchInput) searchInput.focus()
            activeFilter = 'all'
        })
    }

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            searchQuery = event.target.value.trim()
            activeFilter = 'all'
            if (searchTimeout) clearTimeout(searchTimeout)
            searchTimeout = setTimeout(() => searchAndRender(searchQuery || 'pop'), 600)
        })
    }

    if (volumeBar) {
        volumeBar.addEventListener('input', (event) => {
            const value = Number(event.target.value)
            if (!Number.isNaN(value)) {
                player.setVolume(value / 100)
            }
        })
    }

    await searchAndRender('pop')
})

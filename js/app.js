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
    const pageTitle = document.getElementById('page-title')
    const userGreeting = document.getElementById('user-greeting')
    const logoutBtn = document.getElementById('logout')
    const menuToggle = document.getElementById('menu-toggle')
    const sidebar = document.querySelector('.sidebar')
    const sidebarBackdrop = document.querySelector('.sidebar-backdrop')
    const volumeBar = document.getElementById('volume-bar')

    function normalizeStoredSongs(storedValue) {
        if (!Array.isArray(storedValue)) return []
        return storedValue.map((entry) => {
            if (entry && typeof entry === 'object' && entry.id) {
                return entry
            }
            return { id: entry }
        })
    }

    function getSongIds(list) {
        return list.map((item) => item.id).filter(Boolean)
    }

    function getDisplaySongs() {
        if (activeFilter === 'favorites') return favorites
        if (activeFilter === 'playlist') return playlist
        return searchResults
    }

    function buildSongMap(...lists) {
        const songMap = new Map()
        lists.flat().forEach((song) => {
            if (song && song.id) {
                const existing = songMap.get(song.id)
                if (!existing || (song.title && song.artist)) {
                    songMap.set(song.id, { ...existing, ...song })
                }
            }
        })
        return songMap
    }

    function enrichSavedSongs(savedSongs, lookupMap) {
        return savedSongs.map((song) => {
            if (!song || !song.id) return song
            return lookupMap.get(song.id) || song
        })
    }

    function updatePageTitle(filter) {
        if (!pageTitle) return
        if (filter === 'favorites') pageTitle.textContent = 'Favoritos'
        else if (filter === 'playlist') pageTitle.textContent = 'Playlists'
        else if (filter === 'search') pageTitle.textContent = 'Buscar'
        else pageTitle.textContent = 'Suas músicas'
    }

    let favorites = normalizeStoredSongs(JSON.parse(localStorage.getItem('favorites')) || [])
    let playlist = normalizeStoredSongs(JSON.parse(localStorage.getItem('playlist')) || [])
    let searchResults = []
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
            const visible = getVisibleSongEntries(getDisplaySongs(), { searchQuery, activeFilter, favorites: getSongIds(favorites), playlist: getSongIds(playlist) }).map((item) => item.index)
            player.nextSong(visible)
            render()
        },
        onPrevious: () => {
            const visible = getVisibleSongEntries(getDisplaySongs(), { searchQuery, activeFilter, favorites: getSongIds(favorites), playlist: getSongIds(playlist) }).map((item) => item.index)
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

    if (menuToggle && sidebar && sidebarBackdrop) {
        const toggleSidebar = () => {
            sidebar.classList.toggle('sidebar-open')
            sidebarBackdrop.classList.toggle('active')
        }

        menuToggle.addEventListener('click', toggleSidebar)
        sidebarBackdrop.addEventListener('click', toggleSidebar)

        sidebar.querySelectorAll('li').forEach((item) => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 960) {
                    sidebar.classList.remove('sidebar-open')
                    sidebarBackdrop.classList.remove('active')
                }
            })
        })
    }

    function saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }

    function savePlaylist() {
        localStorage.setItem('playlist', JSON.stringify(playlist))
    }

    function render() {
        const displaySongs = getDisplaySongs()
        const favoritesIds = getSongIds(favorites)
        const playlistIds = getSongIds(playlist)

        player.setSongs(displaySongs)

        renderSongCards(musicList, displaySongs, {
            searchQuery,
            activeFilter,
            favorites: favoritesIds,
            playlist: playlistIds,
            currentSong: player.getCurrentSong(),
        }, {
            onSelect: (song, index) => {
                player.loadSong(song)
                player.play()
                highlightActiveCard(musicList, index)
            },
            onPlay: () => player.play(),
            onToggleFavorite: (song) => {
                if (!song) return
                const alreadyFavorite = favorites.some((item) => item.id === song.id)
                if (alreadyFavorite) {
                    favorites = favorites.filter((item) => item.id !== song.id)
                } else {
                    favorites.push(song)
                }
                saveFavorites()
                render()
            },
            onTogglePlaylist: (song) => {
                if (!song) return
                const alreadyInPlaylist = playlist.some((item) => item.id === song.id)
                if (alreadyInPlaylist) {
                    playlist = playlist.filter((item) => item.id !== song.id)
                } else {
                    playlist.push(song)
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
            searchResults = await searchDeezer(query)

            const knownSongs = buildSongMap(searchResults, favorites, playlist)
            favorites = enrichSavedSongs(favorites, knownSongs)
            playlist = enrichSavedSongs(playlist, knownSongs)

            if (activeFilter === 'all') {
                player.setSongs(searchResults)

                if (searchResults.length > 0) {
                    player.loadSong(0)
                } else {
                    if (titleEl) titleEl.textContent = 'Nenhuma música encontrada'
                    if (artistEl) artistEl.textContent = ''
                    if (coverEl) coverEl.src = 'covers/music1.jpg'
                    if (audio) audio.src = ''
                }
            }

            render()
        } catch (error) {
            if (musicList) {
                musicList.innerHTML = '<p class="error">Não foi possível carregar resultados da Deezer. Tente novamente mais tarde.</p>'
            }
        }
    }

    function updateFilter(filter, titleLabel) {
        activeFilter = filter
        updatePageTitle(titleLabel || filter)
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
            updatePageTitle('all')
            searchAndRender('pop')
        })
    }

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            if (searchInput) searchInput.focus()
            updateFilter('all', 'search')
        })
    }

    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            searchQuery = event.target.value.trim()
            activeFilter = 'all'
            updatePageTitle(searchQuery ? 'search' : 'all')
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

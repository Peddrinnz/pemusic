/* Cria o player de áudio e gerencia seus controles e estado */
export function createPlayer({
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
}) {
    const state = {
        songs: [],
        currentSong: 0,
    }

    if (audio) {
        audio.volume = 0.8
        audio.addEventListener("play", () => {
            if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>'
        })

        audio.addEventListener("pause", () => {
            if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>'
        })

        audio.addEventListener("timeupdate", () => {
            if (!audio.duration) return
            const progress = (audio.currentTime / audio.duration) * 100
            if (progressBar) progressBar.value = progress
            if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime)
            if (durationEl) durationEl.textContent = formatTime(audio.duration)
        })
    }

    if (progressBar) {
        progressBar.addEventListener("input", (event) => {
            if (!audio || !audio.duration) return
            const value = Number(event.target.value)
            audio.currentTime = (value / 100) * audio.duration
        })
    }

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (!audio) return
            audio.paused ? play() : pause()
        })
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (options?.onPrevious) options.onPrevious()
        })
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (options?.onNext) options.onNext()
        })
    }

    let options = {}

    function setOptions(newOptions) {
        options = { ...options, ...newOptions }
    }

    function setSongs(newSongs) {
        state.songs = newSongs
    }

    /* Carrega uma música no elemento de áudio e atualiza os dados da interface */
    function loadSong(indexOrSong) {
        const song = typeof indexOrSong === 'number' ? state.songs[indexOrSong] : indexOrSong
        if (!song || !audio) return

        const index = typeof indexOrSong === 'number'
            ? indexOrSong
            : state.songs.findIndex((item) => item.id === song.id)

        if (index === -1) return

        state.currentSong = index
        audio.src = song.preview
        if (titleEl) titleEl.textContent = song.title
        if (artistEl) artistEl.textContent = song.artist
        if (coverEl) coverEl.src = song.cover
    }

    /* Toca o áudio carregado */
    function play() {
        if (!audio || !audio.src) return
        audio.play()
    }

    /* Pausa o áudio atual */
    function pause() {
        if (!audio) return
        audio.pause()
    }

    /* Ajusta o volume do player */
    function setVolume(value) {
        if (!audio) return
        audio.volume = Math.min(1, Math.max(0, value))
    }

    function getCurrentSong() {
        return state.currentSong
    }

    function setCurrentSong(index) {
        state.currentSong = index
    }

    function getSongs() {
        return state.songs
    }

    /* Avança para a próxima música dentro das músicas visíveis */
    function nextSong(visibleIndices) {
        if (!visibleIndices.length) return
        const currentIndex = visibleIndices.indexOf(state.currentSong)
        const nextIndex = currentIndex === -1 || currentIndex === visibleIndices.length - 1 ? visibleIndices[0] : visibleIndices[currentIndex + 1]
        loadSong(nextIndex)
        play()
    }

    /* Volta para a música anterior dentro das músicas visíveis */
    function previousSong(visibleIndices) {
        if (!visibleIndices.length) return
        const currentIndex = visibleIndices.indexOf(state.currentSong)
        const prevIndex = currentIndex <= 0 ? visibleIndices[visibleIndices.length - 1] : visibleIndices[currentIndex - 1]
        loadSong(prevIndex)
        play()
    }

    /* Formata um tempo em segundos */
    function formatTime(time) {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
    }

    return {
        setOptions,
        setSongs,
        loadSong,
        play,
        pause,
        setVolume,
        getCurrentSong,
        setCurrentSong,
        nextSong,
        previousSong,
    }
}

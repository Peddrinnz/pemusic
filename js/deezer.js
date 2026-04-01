/* Faz uma requisição JSONP para carregar dados da API Deezer */
export function jsonpFetch(url) {
    return new Promise((resolve, reject) => {
        const callbackName = `deezerCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`

        window[callbackName] = (data) => {
            delete window[callbackName]
            document.body.removeChild(script)
            resolve(data)
        }

        const script = document.createElement("script")
        script.src = `${url}&output=jsonp&callback=${callbackName}`
        script.onerror = () => {
            delete window[callbackName]
            document.body.removeChild(script)
            reject(new Error("Não foi possível carregar os dados da Deezer."))
        }

        document.body.appendChild(script)
    })
}

/* Busca músicas na Deezer e converte o resultado para o formato do app */
export async function searchDeezer(query) {
    const searchTerm = query.trim() || "pop"
    const encoded = encodeURIComponent(searchTerm)
    const result = await jsonpFetch(`https://api.deezer.com/search?q=${encoded}`)

    return (result.data || []).map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist?.name || "Desconhecido",
        cover: track.album?.cover_medium || "covers/music1.jpg",
        preview: track.preview || "",
    }))
}

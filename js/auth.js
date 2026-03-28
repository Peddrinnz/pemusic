document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".auth-form")
    const path = window.location.pathname.toLowerCase()
    const storedUser = JSON.parse(localStorage.getItem("peMusicUser") || "null")
    const activeSession = JSON.parse(localStorage.getItem("peMusicSession") || "null")

    if ((path.endsWith("login.html") || path.endsWith("register.html")) && activeSession) {
        window.location.href = "index.html"
        return
    }

    if (!form) return

    form.addEventListener("submit", (event) => {
        event.preventDefault()

        const data = Object.fromEntries(new FormData(form).entries())
        const email = data.email?.trim() || ""
        const password = data.password?.trim() || ""

        if (!email || !password) {
            alert("Por favor preencha todos os campos obrigatórios.")
            return
        }

        if (path.endsWith("register.html")) {
            const name = data.name?.trim() || ""
            const confirmPassword = data.confirmPassword?.trim() || ""

            if (!name) {
                alert("Por favor informe o nome.")
                return
            }

            if (password !== confirmPassword) {
                alert("As senhas não coincidem.")
                return
            }

            if (storedUser && storedUser.email === email) {
                alert("Este email já está cadastrado. Faça login ou use outro email.")
                return
            }

            const newUser = { name, email, password }
            localStorage.setItem("peMusicUser", JSON.stringify(newUser))
            localStorage.removeItem("peMusicSession")
            alert("Cadastro realizado com sucesso! Faça login.")
            window.location.href = "login.html"
            return
        }

        if (path.endsWith("login.html")) {
            if (!storedUser || storedUser.email !== email || storedUser.password !== password) {
                alert("Email ou senha incorretos. Verifique suas credenciais ou cadastre-se.")
                return
            }

            localStorage.setItem("peMusicSession", JSON.stringify(storedUser))
            alert(`Bem-vindo de volta, ${storedUser.name}!`)
            window.location.href = "index.html"
            return
        }
    })
})
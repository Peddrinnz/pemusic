document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".auth-form")
    const path = window.location.pathname.toLowerCase()

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

            localStorage.setItem("peMusicUser", JSON.stringify({ name, email }))
            alert("Cadastro realizado com sucesso! Faça login.")
            window.location.href = "login.html"
            return
        }

        if (path.endsWith("login.html")) {
            const userRegistered = JSON.parse(localStorage.getItem("peMusicUser") || "null")

            if (!userRegistered || userRegistered.email !== email) {
                alert("Conta não encontrada. Verifique suas credenciais ou cadastre-se.")
                return
            }

            if (userRegistered && userRegistered.email === email) {
                alert(`Bem-vindo de volta, ${userRegistered.name}!`)
                window.location.href = "index.html"
                return
            }
        }

        alert("Formulário enviado")
    })
})
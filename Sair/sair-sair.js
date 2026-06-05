/* ==========================================================
   LOGOUT
========================================================== */

function abrirModalLogout() {

    document
        .getElementById("modalLogout")
        .classList.add("show");

    document
        .getElementById("logoutHora")
        .innerText =
        new Date().toLocaleString("pt-BR");
}

function fecharModalLogout() {

    document
        .getElementById("modalLogout")
        .classList.remove("show");
}

/* ==========================================================
   AUDITORIA
========================================================== */

function registrarLogout() {

    const logs =
        JSON.parse(
            localStorage.getItem("gmed_logs")
        ) || [];

    logs.unshift({

        usuario:
            localStorage.getItem("usuario") ||
            "Administrador",

        acao: "LOGOUT",

        data:
            new Date().toLocaleString("pt-BR"),

        descricao:
            "Usuário encerrou sessão"

    });

    localStorage.setItem(
        "gmed_logs",
        JSON.stringify(logs)
    );
}

/* ==========================================================
   SAIR
========================================================== */

function realizarLogout() {

    registrarLogout();

    document
        .getElementById("modalLogout")
        .classList.remove("show");

    document
        .getElementById("logoutLoading")
        .classList.add("show");

    setTimeout(() => {

        sessionStorage.clear();

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "usuarioLogado"
        );

        window.location.href =
            "login.html";

    }, 1500);
}
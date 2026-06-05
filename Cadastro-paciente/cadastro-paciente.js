// ================================
// cadastro-paciente.js
// CRUD Local + Abas + Idade + ViaCEP
// ================================

// Banco Local
let pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];

let modo = "";
let pacienteSelecionado = null;

// ================================
// INICIALIZAÇÃO
// ================================
document.addEventListener("DOMContentLoaded", () => {
    carregarTabela();
    configurarEventos();
    gerarCodigo();
});

// ================================
// EVENTOS
// ================================
function configurarEventos() {
    document.getElementById("btnNovo").addEventListener("click", novoPaciente);
    document.getElementById("btnSalvar").addEventListener("click", salvarPaciente);
    document.getElementById("btnEditar").addEventListener("click", editarPaciente);
    document.getElementById("btnExcluir").addEventListener("click", excluirPaciente);
    document.getElementById("btnSair").addEventListener("click", sair);

    document.getElementById("cpf").addEventListener("input", mascaraCPF);
    document.getElementById("tel1").addEventListener("input", mascaraTelefone);
    document.getElementById("cep").addEventListener("input", mascaraCEP);

    document
        .getElementById("dataNascimento")
        .addEventListener("change", calcularIdade);

    document
        .querySelectorAll(".uppercase")
        .forEach(input => {
            input.addEventListener("input", e => {
                e.target.value = e.target.value.toUpperCase();
            });
        });
}

// ================================
// CONTROLE DE ABAS
// ================================
function openTab(evt, tabId) {

    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    document.querySelectorAll(".tab-link").forEach(btn => {
        btn.classList.remove("active");
    });

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// ================================
// NOVO
// ================================
function novoPaciente() {
    limparFormulario();
    habilitarCampos(true);

    modo = "novo";
    pacienteSelecionado = null;

    gerarCodigo();

    document.getElementById("btnSalvar").disabled = false;
    document.getElementById("btnEditar").disabled = true;
    document.getElementById("btnExcluir").disabled = true;

    document.getElementById("nome").focus();
}

// ================================
// SALVAR
// ================================
function salvarPaciente() {

    const nome = document.getElementById("nome").value.trim();

    if (!nome) {
        alert("Informe o nome do paciente.");
        return;
    }

    const paciente = {
        id: document.getElementById("codigo").value,
        nome: document.getElementById("nome").value,
        dataNascimento: document.getElementById("dataNascimento").value,
        idade: document.getElementById("idade").value,
        cpf: document.getElementById("cpf").value,
        telefone: document.getElementById("tel1").value,
        email: document.getElementById("email").value,
        cep: document.getElementById("cep").value,
        endereco: document.getElementById("endereco").value
    };

    if (modo === "novo") {

        pacientes.push(paciente);

    } else if (modo === "editar") {

        const indice = pacientes.findIndex(
            p => p.id === pacienteSelecionado
        );

        if (indice !== -1) {
            pacientes[indice] = paciente;
        }
    }

    localStorage.setItem(
        "pacientes",
        JSON.stringify(pacientes)
    );

    carregarTabela();

    alert("Registro gravado com sucesso.");

    limparFormulario();
    habilitarCampos(false);

    document.getElementById("btnSalvar").disabled = true;
    document.getElementById("btnEditar").disabled = true;
    document.getElementById("btnExcluir").disabled = true;

    gerarCodigo();
}

// ================================
// EDITAR
// ================================
function editarPaciente() {

    if (!pacienteSelecionado) {
        alert("Selecione um paciente.");
        return;
    }

    modo = "editar";

    habilitarCampos(true);

    document.getElementById("btnSalvar").disabled = false;
}

// ================================
// EXCLUIR
// ================================
function excluirPaciente() {

    if (!pacienteSelecionado) {
        alert("Selecione um paciente.");
        return;
    }

    if (!confirm("Deseja excluir este paciente?")) {
        return;
    }

    pacientes = pacientes.filter(
        p => p.id !== pacienteSelecionado
    );

    localStorage.setItem(
        "pacientes",
        JSON.stringify(pacientes)
    );

    carregarTabela();

    limparFormulario();
    habilitarCampos(false);

    document.getElementById("btnEditar").disabled = true;
    document.getElementById("btnExcluir").disabled = true;
    document.getElementById("btnSalvar").disabled = true;

    pacienteSelecionado = null;

    alert("Paciente excluído.");
}

// ================================
// TABELA
// ================================
function carregarTabela() {

    const tbody =
        document.getElementById("corpoTabelaPacientes");

    tbody.innerHTML = "";

    pacientes.forEach(paciente => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${paciente.id}</td>
            <td>${paciente.nome}</td>
            <td>${paciente.cpf}</td>
            <td>${paciente.telefone}</td>
        `;

        tr.addEventListener("click", () => {
            selecionarPaciente(paciente);
        });

        tbody.appendChild(tr);
    });
}

// ================================
// SELECIONAR
// ================================
function selecionarPaciente(paciente) {

    pacienteSelecionado = paciente.id;

    document.getElementById("codigo").value =
        paciente.id;

    document.getElementById("nome").value =
        paciente.nome;

    document.getElementById("dataNascimento").value =
        paciente.dataNascimento;

    document.getElementById("idade").value =
        paciente.idade;

    document.getElementById("cpf").value =
        paciente.cpf;

    document.getElementById("tel1").value =
        paciente.telefone;

    document.getElementById("email").value =
        paciente.email;

    document.getElementById("cep").value =
        paciente.cep;

    document.getElementById("endereco").value =
        paciente.endereco;

    document.getElementById("btnEditar").disabled = false;
    document.getElementById("btnExcluir").disabled = false;

    habilitarCampos(false);
}

// ================================
// IDADE
// ================================
// function calcularIdade() {

//     const data =
//         document.getElementById("dataNascimento").value;

//     if (!data) return;

//     const nascimento = new Date(data);
//     const hoje = new Date();

//     let idade =
//         hoje.getFullYear() - nascimento.getFullYear();

//     const mes =
//         hoje.getMonth() - nascimento.getMonth();

//     if (
//         mes < 0 ||
//         (mes === 0 &&
//             hoje.getDate() < nascimento.getDate())
//     ) {
//         idade--;
//     }

//     document.getElementById("idade").value =
//         idade + " anos";
// }


function calcularIdade() {

    const dataNascimento =
        document.getElementById("dataNascimento").value;

    if (!dataNascimento) {
        document.getElementById("idade").value = "";
        return;
    }

    const nascimento = new Date(dataNascimento);
    const hoje = new Date();

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    let dias = hoje.getDate() - nascimento.getDate();

    if (dias < 0) {
        meses--;

        const diasMesAnterior = new Date(
            hoje.getFullYear(),
            hoje.getMonth(),
            0
        ).getDate();

        dias += diasMesAnterior;
    }

    if (meses < 0) {
        anos--;
        meses += 12;
    }

    document.getElementById("idade").value =
        `${anos} ano${anos !== 1 ? "s" : ""}, ` +
        `${meses} mese${meses !== 1 ? "s" : ""} e ` +
        `${dias} dia${dias !== 1 ? "s" : ""}`;
}

// ================================
// VIA CEP
// ================================
async function buscaCEP() {

    const cep =
        document.getElementById("cep").value
            .replace(/\D/g, "");

    if (cep.length !== 8) return;

    try {

        const resposta =
            await fetch(
                `https://viacep.com.br/ws/${cep}/json/`
            );

        const dados =
            await resposta.json();

        if (dados.erro) {
            alert("CEP não encontrado.");
            return;
        }

        document.getElementById("endereco").value =
            `${dados.logradouro} - ${dados.bairro} - ${dados.localidade}/${dados.uf}`;

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao consultar o CEP."
        );
    }
}

// ================================
// HABILITAR CAMPOS
// ================================
function habilitarCampos(status) {

    const campos = [
        "nome",
        "dataNascimento",
        "cpf",
        "tel1",
        "email",
        "cep",
        "endereco"
    ];

    campos.forEach(id => {
        document.getElementById(id).disabled = !status;
    });
}

// ================================
// LIMPAR
// ================================
function limparFormulario() {

    document.getElementById("pacienteForm").reset();

    document.getElementById("codigo").value = "";
    document.getElementById("idade").value = "";
}

// ================================
// GERAR CÓDIGO
// ================================
function gerarCodigo() {

    let novoCodigo = 1;

    if (pacientes.length > 0) {

        novoCodigo =
            Math.max(
                ...pacientes.map(
                    p => Number(p.id)
                )
            ) + 1;
    }

    document.getElementById("codigo").value =
        novoCodigo.toString().padStart(5, "0");
}

// ================================
// SAIR
// ================================
function sair() {

    if (history.length > 1) {
        history.back();
    } else {
        window.close();
    }
}

// ================================
// MÁSCARA CPF
// ================================
function mascaraCPF(e) {

    let v =
        e.target.value.replace(/\D/g, "");

    v = v.replace(
        /(\d{3})(\d)/,
        "$1.$2"
    );

    v = v.replace(
        /(\d{3})(\d)/,
        "$1.$2"
    );

    v = v.replace(
        /(\d{3})(\d{1,2})$/,
        "$1-$2"
    );

    e.target.value = v;
}

// ================================
// MÁSCARA TELEFONE
// ================================
function mascaraTelefone(e) {

    let v =
        e.target.value.replace(/\D/g, "");

    if (v.length <= 10) {

        v = v.replace(
            /(\d{2})(\d)/,
            "($1) $2"
        );

        v = v.replace(
            /(\d{4})(\d)/,
            "$1-$2"
        );

    } else {

        v = v.replace(
            /(\d{2})(\d)/,
            "($1) $2"
        );

        v = v.replace(
            /(\d{5})(\d)/,
            "$1-$2"
        );
    }

    e.target.value = v;
}

// ================================
// MÁSCARA CEP
// ================================
function mascaraCEP(e) {

    let v =
        e.target.value.replace(/\D/g, "");

    v = v.replace(
        /(\d{5})(\d)/,
        "$1-$2"
    );

    e.target.value = v;
}
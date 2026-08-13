'use strict';

const medicos = [
    {
        id: 1,
        nome: 'Dr. Carlos Eduardo Silva',
        conselho: 'CRM 12345-GO',
        especialidade: 'Cardiologia',
        status: 'Ativo'
    },
    {
        id: 2,
        nome: 'Dra. Ana Paula Mendes',
        conselho: 'CRM 24680-GO',
        especialidade: 'Dermatologia',
        status: 'Ativo'
    },
    {
        id: 3,
        nome: 'Dr. Roberto Lima Ferreira',
        conselho: 'CRM 35791-GO',
        especialidade: 'Ortopedia e Traumatologia',
        status: 'Ativo'
    }
];

let medicoSelecionadoId = null;
let modoFormulario = null;

const form = document.getElementById('medicoForm');
const btnNovo = document.getElementById('btnNovo');
const btnSalvar = document.getElementById('btnSalvar');
const btnEditar = document.getElementById('btnEditar');
const btnExcluir = document.getElementById('btnExcluir');
const btnSair = document.getElementById('btnSair');
const tabela = document.getElementById('corpoTabelaMedicos');
const filtro = document.getElementById('filtroMedicos');
const toastContainer = document.getElementById('toastContainer');

const camposEditaveis = [
    'nome',
    'cpf',
    'dataNasc',
    'sexo',
    'email',
    'celular',
    'siglaConselho',
    'numeroConselho',
    'ufConselho',
    'especialidadesTexto',
    'dom',
    'seg',
    'ter',
    'qua',
    'qui',
    'sex',
    'sab',
    'periodoMatutino',
    'periodoVespertino',
    'periodoNoturno',
    'matInicio',
    'matFim',
    'vespInicio',
    'vespFim',
    'notInicio',
    'notFim',
    'tempoConsulta',
    'intervaloConsulta',
    'maxEncaixes',
    'maxPacientesDia',
    'unidade',
    'bloqueioInicio',
    'bloqueioFim',
    'motivoBloqueio',
    'observacoesAgenda',
    'valorConsulta',
    'status'
];

function openTab(event, tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-hidden', 'true');
    });

    buttons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
    });

    const selectedTab = document.getElementById(tabId);

    if (!selectedTab) {
        return;
    }

    selectedTab.classList.add('active');
    selectedTab.setAttribute('aria-hidden', 'false');

    if (event?.currentTarget) {
        event.currentTarget.classList.add('active');
        event.currentTarget.setAttribute('aria-selected', 'true');
    }
}

window.openTab = openTab;

function setCamposEditaveis(enabled) {
    camposEditaveis.forEach(id => {
        const campo = document.getElementById(id);

        if (campo) {
            campo.disabled = !enabled;
        }
    });
}

function limparFormulario() {
    form.reset();

    document.getElementById('medicoId').value = '';
    document.getElementById('idadeTempoVida').value = '';

    document.querySelectorAll('.field').forEach(field => {
        field.classList.remove('is-invalid');
    });
}

function iniciarNovoMedico() {
    modoFormulario = 'novo';
    medicoSelecionadoId = null;

    limparFormulario();
    limparSelecaoTabela();
    setCamposEditaveis(true);

    document.getElementById('nome').focus();
    atualizarBotoes();

    mostrarToast('Novo cadastro iniciado.', 'success');
}

function iniciarEdicao() {
    if (medicoSelecionadoId === null) {
        mostrarToast('Selecione um médico para editar.', 'warning');
        return;
    }

    modoFormulario = 'edicao';
    setCamposEditaveis(true);

    document.getElementById('nome').focus();

    atualizarBotoes();
    mostrarToast('Modo de edição ativado.', 'info');
}

function salvarMedico() {
    const nome = document.getElementById('nome');
    const nomeValor = nome.value.trim();

    if (!nomeValor) {
        nome.classList.add('is-invalid');
        nome.focus();

        mostrarToast(
            'Informe o nome completo do profissional.',
            'error'
        );

        return;
    }

    nome.classList.remove('is-invalid');

    const numeroConselho = document
        .getElementById('numeroConselho')
        .value
        .trim();

    const especialidade = document
        .getElementById('especialidadesTexto')
        .value
        .trim() || 'Não informada';

    const status = document.getElementById('status').value === 'I'
        ? 'Inativo'
        : 'Ativo';

    if (modoFormulario === 'novo') {
        const novoMedico = {
            id: obterProximoId(),
            nome: nomeValor,
            conselho: numeroConselho
                ? `CRM ${numeroConselho}-GO`
                : 'Não informado',
            especialidade,
            status
        };

        medicos.push(novoMedico);
        medicoSelecionadoId = novoMedico.id;

        mostrarToast(
            'Médico cadastrado com sucesso.',
            'success'
        );
    }

    if (modoFormulario === 'edicao') {
        const medico = medicos.find(
            item => item.id === medicoSelecionadoId
        );

        if (medico) {
            medico.nome = nomeValor;
            medico.conselho = numeroConselho
                ? `CRM ${numeroConselho}-GO`
                : 'Não informado';
            medico.especialidade = especialidade;
            medico.status = status;
        }

        mostrarToast(
            'Cadastro atualizado com sucesso.',
            'success'
        );
    }

    modoFormulario = null;
    setCamposEditaveis(false);

    renderizarTabela(filtro.value);
    selecionarLinha(medicoSelecionadoId);
    atualizarBotoes();
}

function excluirMedico() {
    if (medicoSelecionadoId === null) {
        mostrarToast(
            'Selecione um médico para excluir.',
            'warning'
        );

        return;
    }

    const medico = medicos.find(
        item => item.id === medicoSelecionadoId
    );

    if (!medico) {
        return;
    }

    const confirmou = window.confirm(
        `Deseja realmente excluir o cadastro de ${medico.nome}?`
    );

    if (!confirmou) {
        return;
    }

    const index = medicos.findIndex(
        item => item.id === medicoSelecionadoId
    );

    if (index >= 0) {
        medicos.splice(index, 1);
    }

    medicoSelecionadoId = null;
    modoFormulario = null;

    limparFormulario();
    limparSelecaoTabela();
    setCamposEditaveis(false);
    renderizarTabela(filtro.value);
    atualizarBotoes();

    mostrarToast(
        'Cadastro excluído com sucesso.',
        'success'
    );
}

function selecionarMedico(id) {
    const medico = medicos.find(
        item => item.id === id
    );

    if (!medico) {
        return;
    }

    medicoSelecionadoId = medico.id;
    modoFormulario = null;

    preencherFormulario(medico);
    setCamposEditaveis(false);
    selecionarLinha(id);
    atualizarBotoes();

    mostrarToast(
        `${medico.nome} selecionado.`,
        'info'
    );
}

function preencherFormulario(medico) {
    limparFormulario();

    document.getElementById('medicoId').value = medico.id;
    document.getElementById('nome').value = medico.nome;
    document.getElementById('siglaConselho').value = 'CRM';
    document.getElementById('numeroConselho').value =
        medico.conselho.replace(/\D/g, '');
    document.getElementById('especialidadesTexto').value =
        medico.especialidade;
    document.getElementById('status').value =
        medico.status === 'Ativo' ? 'A' : 'I';
}

function renderizarTabela(termo = '') {
    const busca = termo.trim().toLowerCase();

    const lista = medicos.filter(medico => {
        const conteudo = [
            medico.id,
            medico.nome,
            medico.conselho,
            medico.especialidade,
            medico.status
        ]
            .join(' ')
            .toLowerCase();

        return conteudo.includes(busca);
    });

    tabela.innerHTML = '';

    if (lista.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="empty-cell">
                    Nenhum médico encontrado.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach(medico => {
        const linha = document.createElement('tr');

        linha.className = 'table-row';
        linha.dataset.id = medico.id;
        linha.tabIndex = 0;
        linha.setAttribute('role', 'button');
        linha.setAttribute(
            'aria-label',
            `Selecionar ${medico.nome}`
        );

        linha.innerHTML = `
            <td>${medico.id}</td>

            <td>
                <strong>${escaparHtml(medico.nome)}</strong>
                <small>Profissional de saúde</small>
            </td>

            <td>${escaparHtml(medico.conselho)}</td>

            <td>${escaparHtml(medico.especialidade)}</td>

            <td>
                <span class="status-badge">
                    ${escaparHtml(medico.status)}
                </span>
            </td>
        `;

        linha.addEventListener('click', () => {
            selecionarMedico(medico.id);
        });

        linha.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selecionarMedico(medico.id);
            }
        });

        tabela.appendChild(linha);
    });

    if (medicoSelecionadoId !== null) {
        selecionarLinha(medicoSelecionadoId);
    }
}

function selecionarLinha(id) {
    document.querySelectorAll('.table-row').forEach(linha => {
        const ativa = Number(linha.dataset.id) === Number(id);

        linha.classList.toggle('active', ativa);

        if (ativa) {
            linha.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    });
}

function limparSelecaoTabela() {
    document.querySelectorAll('.table-row').forEach(linha => {
        linha.classList.remove('active');
    });
}

function atualizarBotoes() {
    const possuiSelecao = medicoSelecionadoId !== null;
    const podeSalvar =
        modoFormulario === 'novo' ||
        modoFormulario === 'edicao';

    btnSalvar.disabled = !podeSalvar;
    btnEditar.disabled = !possuiSelecao;
    btnExcluir.disabled = !possuiSelecao;
}

function obterProximoId() {
    if (medicos.length === 0) {
        return 1;
    }

    return Math.max(
        ...medicos.map(medico => medico.id)
    ) + 1;
}

function calcularIdade() {
    const dataNascimento =
        document.getElementById('dataNasc').value;

    const campoIdade =
        document.getElementById('idadeTempoVida');

    if (!dataNascimento) {
        campoIdade.value = '';
        return;
    }

    const nascimento =
        new Date(`${dataNascimento}T00:00:00`);

    const hoje = new Date();

    let idade =
        hoje.getFullYear() - nascimento.getFullYear();

    const diferencaMes =
        hoje.getMonth() - nascimento.getMonth();

    if (
        diferencaMes < 0 ||
        (
            diferencaMes === 0 &&
            hoje.getDate() < nascimento.getDate()
        )
    ) {
        idade--;
    }

    campoIdade.value =
        idade >= 0 ? `${idade} anos` : '';
}

function mostrarToast(mensagem, tipo = 'info') {
    const estilos = {
        success: 'toast-success',
        error: 'toast-error',
        warning: 'toast-warning',
        info: 'toast-info'
    };

    const icones = {
        success: 'fa-circle-check',
        error: 'fa-circle-exclamation',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    const toast = document.createElement('div');

    toast.className = `
        toast
        ${estilos[tipo] || estilos.info}
    `;

    toast.innerHTML = `
        <i class="fa-solid ${icones[tipo] || icones.info}"
            aria-hidden="true"></i>

        <span>${escaparHtml(mensagem)}</span>

        <button type="button"
            aria-label="Fechar notificação">
            <i class="fa-solid fa-xmark"
                aria-hidden="true"></i>
        </button>
    `;

    toast
        .querySelector('button')
        .addEventListener('click', () => {
            removerToast(toast);
        });

    toastContainer.appendChild(toast);

    window.setTimeout(() => {
        removerToast(toast);
    }, 3500);
}

function removerToast(toast) {
    if (!toast || toast.classList.contains('is-leaving')) {
        return;
    }

    toast.classList.add('is-leaving');

    window.setTimeout(() => {
        toast.remove();
    }, 180);
}

function escaparHtml(valor) {
    return String(valor)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

btnNovo.addEventListener('click', iniciarNovoMedico);
btnSalvar.addEventListener('click', salvarMedico);
btnEditar.addEventListener('click', iniciarEdicao);
btnExcluir.addEventListener('click', excluirMedico);

btnSair.addEventListener('click', () => {
    window.location.href = '../Menu-Principal.html';
});

filtro.addEventListener('input', event => {
    renderizarTabela(event.target.value);
});

document
    .getElementById('dataNasc')
    .addEventListener('change', calcularIdade);

form.addEventListener('submit', event => {
    event.preventDefault();
    salvarMedico();
});

setCamposEditaveis(false);
renderizarTabela();
atualizarBotoes();
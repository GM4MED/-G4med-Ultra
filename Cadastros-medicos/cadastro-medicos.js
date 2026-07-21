const STORAGE_KEY = 'gm4_medicos_cadastrados';

const form = document.getElementById('medicoForm');
const btnNovo = document.getElementById('btnNovo');
const btnSalvar = document.getElementById('btnSalvar');
const btnEditar = document.getElementById('btnEditar');
const btnExcluir = document.getElementById('btnExcluir');
const corpoTabela = document.getElementById('corpoTabelaMedicos');
const campoBusca = document.querySelector('.grid-search input');

let medicos = carregarMedicos();
let medicoSelecionadoId = null;
let modoFormulario = 'visualizacao';

const campos = [
    'medicoId',
    'nome',
    'cpf',
    'dataNasc',
    'idadeTempoVida',
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
    'horaAgendamentoInicio',
    'horaAgendamentoFim',
    'intervaloGradeAgendamento',
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
    'bloqueioParcialData',
    'bloqueioParcialInicio',
    'bloqueioParcialFim',
    'motivoBloqueioParcial',
    'observacoesAgenda',
    'valorConsulta',
    'status'
];

const camposSomenteLeitura = ['medicoId', 'idadeTempoVida'];

function $(id) {
    return document.getElementById(id);
}

function openTab(event, tabId) {
    document.querySelectorAll('.tab-content').forEach(function (tab) {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-link').forEach(function (button) {
        button.classList.remove('active');
    });

    const tabSelecionada = $(tabId);
    if (tabSelecionada) {
        tabSelecionada.classList.add('active');
    }

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

function carregarMedicos() {
    const dados = localStorage.getItem(STORAGE_KEY);
    return dados ? JSON.parse(dados) : [];
}

function salvarMedicos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicos));
}

function gerarCodigoAutomatico() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const segundo = String(agora.getSeconds()).padStart(2, '0');
    const milissegundo = String(agora.getMilliseconds()).padStart(3, '0');

    return `MED-${ano}${mes}${dia}-${hora}${minuto}${segundo}${milissegundo}`;
}

function calcularIdadeTempoVida() {
    const campoData = $('dataNasc');
    const campoIdade = $('idadeTempoVida');

    if (!campoData || !campoIdade || !campoData.value) {
        if (campoIdade) campoIdade.value = '';
        return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const nascimento = new Date(campoData.value + 'T00:00:00');

    if (nascimento > hoje) {
        campoIdade.value = 'Data inválida';
        return;
    }

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    let dias = hoje.getDate() - nascimento.getDate();

    if (dias < 0) {
        meses--;
        const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
        dias += ultimoDiaMesAnterior;
    }

    if (meses < 0) {
        anos--;
        meses += 12;
    }

    campoIdade.value = `${anos} ${anos === 1 ? 'ano' : 'anos'}, ${meses} ${meses === 1 ? 'mês' : 'meses'} e ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

function habilitarFormulario(habilitado) {
    campos.forEach(function (id) {
        const campo = $(id);
        if (!campo || camposSomenteLeitura.includes(id)) return;
        campo.disabled = !habilitado;
    });
}

function configurarBotoes() {
    const editando = modoFormulario === 'novo' || modoFormulario === 'edicao';
    const temSelecionado = Boolean(medicoSelecionadoId);

    btnNovo.disabled = editando;
    btnSalvar.disabled = !editando;
    btnEditar.disabled = editando || !temSelecionado;
    btnExcluir.disabled = editando || !temSelecionado;
}

function limparFormulario() {
    form.reset();
    $('medicoId').value = gerarCodigoAutomatico();
    $('idadeTempoVida').value = '';
    $('tempoConsulta').value = '30';
    $('intervaloConsulta').value = '0';
    $('intervaloGradeAgendamento').value = '30';
    $('maxEncaixes').value = '0';
    $('status').value = 'A';
}

function valorCampo(id) {
    const campo = $(id);
    if (!campo) return '';
    return campo.type === 'checkbox' ? campo.checked : campo.value.trim();
}

function preencherCampo(id, valor) {
    const campo = $(id);
    if (!campo) return;

    if (campo.type === 'checkbox') {
        campo.checked = Boolean(valor);
        return;
    }

    campo.value = valor ?? '';
}

function coletarDadosFormulario() {
    const medico = {};

    campos.forEach(function (id) {
        if (id === 'idadeTempoVida') return;
        medico[id] = valorCampo(id);
    });

    return medico;
}

function preencherFormulario(medico) {
    campos.forEach(function (id) {
        if (id === 'idadeTempoVida') return;
        preencherCampo(id, medico[id]);
    });

    calcularIdadeTempoVida();
}

function validarFormulario() {
    if (!$('nome').value.trim()) {
        alert('Informe o nome completo do profissional.');
        $('nome').focus();
        return false;
    }

    if ($('dataNasc').value) {
        const nascimento = new Date($('dataNasc').value + 'T00:00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        if (nascimento > hoje) {
            alert('A data de nascimento não pode ser maior que a data atual.');
            $('dataNasc').focus();
            return false;
        }
    }

    if ($('horaAgendamentoInicio').value && $('horaAgendamentoFim').value) {
        if ($('horaAgendamentoFim').value < $('horaAgendamentoInicio').value) {
            alert('O último horário do agendamento não pode ser menor que o primeiro horário.');
            $('horaAgendamentoFim').focus();
            return false;
        }
    }

    return true;
}

function textoConselho(medico) {
    const partes = [medico.siglaConselho, medico.numeroConselho, medico.ufConselho].filter(Boolean);
    return partes.length ? partes.join(' / ') : '-';
}

function textoEspecialidade(medico) {
    return medico.especialidadesTexto || '-';
}

function textoStatus(medico) {
    return medico.status === 'I' ? 'Inativo' : 'Ativo';
}

function classeStatus(medico) {
    return medico.status === 'I' ? 'status-inactive' : 'status-active';
}

function renderizarTabela() {
    const filtro = campoBusca.value.trim().toLowerCase();
    const medicosFiltrados = medicos.filter(function (medico) {
        return [
            medico.medicoId,
            medico.nome,
            medico.siglaConselho,
            medico.numeroConselho,
            medico.especialidadesTexto
        ].join(' ').toLowerCase().includes(filtro);
    });

    corpoTabela.innerHTML = '';

    medicosFiltrados.forEach(function (medico) {
        const linha = document.createElement('tr');
        linha.dataset.id = medico.medicoId;

        if (medico.medicoId === medicoSelecionadoId) {
            linha.classList.add('selected');
        }

        linha.innerHTML = `
            <td>${medico.medicoId}</td>
            <td>${medico.nome || '-'}</td>
            <td>${textoConselho(medico)}</td>
            <td>${textoEspecialidade(medico)}</td>
            <td><span class="status-badge ${classeStatus(medico)}">${textoStatus(medico)}</span></td>
        `;

        linha.addEventListener('click', function () {
            selecionarMedico(medico.medicoId);
        });

        corpoTabela.appendChild(linha);
    });
}

function selecionarMedico(id) {
    const medico = medicos.find(function (item) {
        return item.medicoId === id;
    });

    if (!medico) return;

    medicoSelecionadoId = id;
    modoFormulario = 'visualizacao';
    preencherFormulario(medico);
    habilitarFormulario(false);
    configurarBotoes();
    renderizarTabela();
}

function iniciarNovoCadastro() {
    medicoSelecionadoId = null;
    modoFormulario = 'novo';
    limparFormulario();
    habilitarFormulario(true);
    configurarBotoes();
    renderizarTabela();
    $('nome').focus();
}

function iniciarEdicao() {
    if (!medicoSelecionadoId) return;

    modoFormulario = 'edicao';
    habilitarFormulario(true);
    configurarBotoes();
    $('nome').focus();
}

function gravarMedico() {
    if (!validarFormulario()) return;

    const medico = coletarDadosFormulario();

    if (modoFormulario === 'novo') {
        medicos.push(medico);
        medicoSelecionadoId = medico.medicoId;
    }

    if (modoFormulario === 'edicao') {
        medicos = medicos.map(function (item) {
            return item.medicoId === medico.medicoId ? medico : item;
        });
        medicoSelecionadoId = medico.medicoId;
    }

    salvarMedicos();
    modoFormulario = 'visualizacao';
    habilitarFormulario(false);
    configurarBotoes();
    renderizarTabela();
    alert('Cadastro gravado com sucesso.');
}

function excluirMedico() {
    if (!medicoSelecionadoId) return;

    const confirma = confirm('Deseja excluir o médico selecionado?');
    if (!confirma) return;

    medicos = medicos.filter(function (medico) {
        return medico.medicoId !== medicoSelecionadoId;
    });

    salvarMedicos();
    medicoSelecionadoId = null;
    modoFormulario = 'visualizacao';
    limparFormulario();
    habilitarFormulario(false);
    configurarBotoes();
    renderizarTabela();
}

function aplicarMascaras() {
    $('cpf').addEventListener('input', function () {
        this.value = this.value
            .replace(/\D/g, '')
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    });

    $('celular').addEventListener('input', function () {
        this.value = this.value
            .replace(/\D/g, '')
            .slice(0, 11)
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    });

    $('valorConsulta').addEventListener('input', function () {
        const numero = Number(this.value.replace(/\D/g, '')) / 100;
        this.value = numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    });
}

function iniciarPagina() {
    habilitarFormulario(false);
    limparFormulario();
    configurarBotoes();
    renderizarTabela();
    aplicarMascaras();

    $('dataNasc').addEventListener('input', calcularIdadeTempoVida);
    $('dataNasc').addEventListener('change', calcularIdadeTempoVida);

    btnNovo.addEventListener('click', iniciarNovoCadastro);
    btnSalvar.addEventListener('click', gravarMedico);
    btnEditar.addEventListener('click', iniciarEdicao);
    btnExcluir.addEventListener('click', excluirMedico);
    campoBusca.addEventListener('input', renderizarTabela);
}

document.addEventListener('DOMContentLoaded', iniciarPagina);

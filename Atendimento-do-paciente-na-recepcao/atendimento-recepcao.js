const STORAGE_KEY = 'gm4_atendimentos_recepcao';

const especialidadesPorMedico = {
    'Dr. Ricardo Silva': 'Cardiologia',
    'Dra. Ana Beatriz': 'Dermatologia',
    'Dr. Marcos Pereira': 'Ortopedia'
};

let atendimentos = carregarAtendimentos();
let indiceAtual = -1;
let modoFormulario = 'visualizacao';

const campos = [
    'pacienteId',
    'cpf',
    'nomePaciente',
    'dataNasc',
    'celular',
    'convenio',
    'carteirinha',
    'validadeConvenio',
    'dataAtendimento',
    'horaChegada',
    'tipoAtendimento',
    'procedimento',
    'medico',
    'especialidade',
    'numeroSenha',
    'prioridade',
    'pacientePresente',
    'docsConferidos',
    'convenioValido',
    'autorizacaoRealizada',
    'lgpdAceita',
    'obsAtendimento'
];

const camposSomenteLeitura = ['pacienteId', 'especialidade', 'numeroSenha'];

function $(id) {
    return document.getElementById(id);
}

function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(function (tab) {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-link').forEach(function (button) {
        button.classList.remove('active');
    });

    const tabSelecionada = $(tabName);
    if (tabSelecionada) {
        tabSelecionada.classList.add('active');
    }

    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add('active');
    }
}

function carregarAtendimentos() {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (dados) {
        return JSON.parse(dados);
    }

    return [
        {
            id: 1,
            senha: 'G-001',
            hora: '08:30',
            paciente: 'JOAO MODESTO DA SILVA',
            tipo: 'Consulta',
            medico: 'Dr. Ricardo Silva',
            especialidade: 'Cardiologia',
            status: 'Aguardando',
            cpf: '123.456.789-00',
            dataNasc: '1985-05-20',
            celular: '(11) 98888-7777',
            convenio: 'Unimed',
            carteirinha: '987654321',
            validade: '12/28',
            dataAtendimento: dataHoje(),
            procedimento: '',
            prioridade: 'Normal',
            pacientePresente: false,
            docsConferidos: false,
            convenioValido: false,
            autorizacaoRealizada: false,
            lgpdAceita: false,
            obsAtendimento: ''
        },
        {
            id: 2,
            senha: 'P-002',
            hora: '08:45',
            paciente: 'MARIA OLIVEIRA SANTOS',
            tipo: 'Exame',
            medico: 'Dra. Ana Beatriz',
            especialidade: 'Dermatologia',
            status: 'Em Atendimento',
            cpf: '222.333.444-55',
            dataNasc: '1992-10-12',
            celular: '(21) 97777-6666',
            convenio: 'Particular',
            carteirinha: '-',
            validade: '-',
            dataAtendimento: dataHoje(),
            procedimento: 'Hemograma',
            prioridade: 'Normal',
            pacientePresente: true,
            docsConferidos: true,
            convenioValido: true,
            autorizacaoRealizada: false,
            lgpdAceita: true,
            obsAtendimento: ''
        },
        {
            id: 3,
            senha: 'E-003',
            hora: '09:00',
            paciente: 'PEDRO ALCANTARA',
            tipo: 'Urgência',
            medico: 'Dr. Marcos Pereira',
            especialidade: 'Ortopedia',
            status: 'Finalizado',
            cpf: '999.888.777-66',
            dataNasc: '1970-01-30',
            celular: '(31) 96666-5555',
            convenio: 'bradesco',
            carteirinha: '888222111',
            validade: '06/27',
            dataAtendimento: dataHoje(),
            procedimento: '',
            prioridade: 'Emergencial',
            pacientePresente: true,
            docsConferidos: true,
            convenioValido: true,
            autorizacaoRealizada: true,
            lgpdAceita: true,
            obsAtendimento: ''
        }
    ];
}

function salvarAtendimentos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atendimentos));
}

function dataHoje() {
    return new Date().toISOString().slice(0, 10);
}

function horaAgora() {
    return new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function proximoId() {
    const maiorId = atendimentos.reduce(function (maior, atendimento) {
        return Math.max(maior, Number(atendimento.id) || 0);
    }, 0);

    return maiorId + 1;
}

function proximaSenha(prioridade) {
    const prefixo = prioridade === 'Emergencial' ? 'E' : prioridade === 'Normal' ? 'G' : 'P';
    const numero = atendimentos.length + 1;
    return `${prefixo}-${String(numero).padStart(3, '0')}`;
}

function statusClasse(status) {
    if (status === 'Em Atendimento') return 'status-attending';
    if (status === 'Finalizado') return 'status-completed';
    return 'status-waiting';
}

function textoBuscaAtendimento(atendimento) {
    return [
        atendimento.senha,
        atendimento.hora,
        atendimento.paciente,
        atendimento.tipo,
        atendimento.medico,
        atendimento.status,
        atendimento.cpf
    ].join(' ').toLowerCase();
}

function renderizarFila() {
    const corpo = $('corpoTabelaAtendimentos');
    const busca = $('inputBusca') ? $('inputBusca').value.trim().toLowerCase() : '';

    if (!corpo) return;

    corpo.innerHTML = '';

    atendimentos.forEach(function (atendimento, index) {
        if (busca && !textoBuscaAtendimento(atendimento).includes(busca)) return;

        const tr = document.createElement('tr');
        tr.dataset.index = index;
        tr.addEventListener('click', function () {
            selecionarAtendimento(index);
        });

        if (index === indiceAtual) {
            tr.classList.add('selected');
        }

        tr.innerHTML = `
            <td><strong>${atendimento.senha || '-'}</strong></td>
            <td>${atendimento.hora || '-'}</td>
            <td><strong>${atendimento.paciente || '-'}</strong></td>
            <td>${atendimento.tipo || '-'}</td>
            <td>${atendimento.medico || '-'}</td>
            <td><span class="status-badge ${statusClasse(atendimento.status)}">${atendimento.status || 'Aguardando'}</span></td>
        `;

        corpo.appendChild(tr);
    });
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

function atendimentoParaFormulario(atendimento) {
    preencherCampo('pacienteId', atendimento.id);
    preencherCampo('cpf', atendimento.cpf);
    preencherCampo('nomePaciente', atendimento.paciente);
    preencherCampo('dataNasc', atendimento.dataNasc);
    preencherCampo('celular', atendimento.celular);
    preencherCampo('convenio', atendimento.convenio);
    preencherCampo('carteirinha', atendimento.carteirinha);
    preencherCampo('validadeConvenio', atendimento.validade);
    preencherCampo('dataAtendimento', atendimento.dataAtendimento || dataHoje());
    preencherCampo('horaChegada', atendimento.hora);
    preencherCampo('tipoAtendimento', atendimento.tipo);
    preencherCampo('procedimento', atendimento.procedimento);
    preencherCampo('medico', atendimento.medico);
    preencherCampo('especialidade', atendimento.especialidade);
    preencherCampo('numeroSenha', atendimento.senha);
    preencherCampo('prioridade', atendimento.prioridade || 'Normal');
    preencherCampo('pacientePresente', atendimento.pacientePresente);
    preencherCampo('docsConferidos', atendimento.docsConferidos);
    preencherCampo('convenioValido', atendimento.convenioValido);
    preencherCampo('autorizacaoRealizada', atendimento.autorizacaoRealizada);
    preencherCampo('lgpdAceita', atendimento.lgpdAceita);
    preencherCampo('obsAtendimento', atendimento.obsAtendimento);
}

function formularioParaAtendimento() {
    const prioridade = valorCampo('prioridade') || 'Normal';
    const idAtual = valorCampo('pacienteId');
    const id = idAtual === 'NOVO' ? proximoId() : Number(idAtual);
    const senhaAtual = valorCampo('numeroSenha');

    return {
        id,
        senha: senhaAtual || proximaSenha(prioridade),
        hora: valorCampo('horaChegada'),
        paciente: valorCampo('nomePaciente').toUpperCase(),
        tipo: valorCampo('tipoAtendimento'),
        medico: valorCampo('medico'),
        especialidade: valorCampo('especialidade'),
        status: 'Aguardando',
        cpf: valorCampo('cpf'),
        dataNasc: valorCampo('dataNasc'),
        celular: valorCampo('celular'),
        convenio: valorCampo('convenio'),
        carteirinha: valorCampo('carteirinha'),
        validade: valorCampo('validadeConvenio'),
        dataAtendimento: valorCampo('dataAtendimento'),
        procedimento: valorCampo('procedimento'),
        prioridade,
        pacientePresente: valorCampo('pacientePresente'),
        docsConferidos: valorCampo('docsConferidos'),
        convenioValido: valorCampo('convenioValido'),
        autorizacaoRealizada: valorCampo('autorizacaoRealizada'),
        lgpdAceita: valorCampo('lgpdAceita'),
        obsAtendimento: valorCampo('obsAtendimento')
    };
}

function selecionarAtendimento(index) {
    const atendimento = atendimentos[index];
    if (!atendimento) return;

    indiceAtual = index;
    modoFormulario = 'visualizacao';
    atendimentoParaFormulario(atendimento);
    desabilitarCampos();
    configurarBotoes();
    atualizarNavegacao();
    renderizarFila();
}

function habilitarCampos() {
    campos.forEach(function (id) {
        const campo = $(id);
        if (!campo || camposSomenteLeitura.includes(id)) return;
        campo.disabled = false;
    });
}

function desabilitarCampos() {
    campos.forEach(function (id) {
        const campo = $(id);
        if (!campo) return;
        campo.disabled = true;
    });
}

function configurarBotoes() {
    const editando = modoFormulario === 'novo' || modoFormulario === 'edicao';
    const temSelecionado = indiceAtual >= 0;

    $('btnNovo').disabled = editando;
    $('btnSalvar').disabled = !editando;
    $('btnEditar').disabled = editando || !temSelecionado;
    $('btnExcluir').disabled = editando || !temSelecionado;
    $('btnImprimir').disabled = editando || !temSelecionado;
}

function atualizarNavegacao() {
    $('btnAnterior').disabled = indiceAtual <= 0;
    $('btnProximo').disabled = indiceAtual === -1 || indiceAtual >= atendimentos.length - 1;
}

function limparFormularioNovo() {
    $('atendimentoForm').reset();
    preencherCampo('pacienteId', 'NOVO');
    preencherCampo('dataAtendimento', dataHoje());
    preencherCampo('horaChegada', horaAgora());
    preencherCampo('prioridade', 'Normal');
    preencherCampo('numeroSenha', proximaSenha('Normal'));
    preencherCampo('especialidade', '');
}

function iniciarNovo() {
    indiceAtual = -1;
    modoFormulario = 'novo';
    limparFormularioNovo();
    habilitarCampos();
    configurarBotoes();
    atualizarNavegacao();
    renderizarFila();

    const primeiraAba = document.querySelector('.tab-link');
    if (primeiraAba) primeiraAba.click();
    $('cpf').focus();
}

function iniciarEdicao() {
    if (indiceAtual < 0) return;

    modoFormulario = 'edicao';
    habilitarCampos();
    configurarBotoes();
    $('cpf').focus();
}

function validarFormulario() {
    if (!valorCampo('nomePaciente')) {
        alert('Por favor, preencha o nome do paciente.');
        $('nomePaciente').focus();
        return false;
    }

    if (!valorCampo('dataAtendimento')) {
        alert('Informe a data do atendimento.');
        $('dataAtendimento').focus();
        return false;
    }

    if (!valorCampo('horaChegada')) {
        alert('Informe o horário de chegada.');
        $('horaChegada').focus();
        return false;
    }

    return true;
}

function salvarFormulario() {
    if (!validarFormulario()) return;

    const dados = formularioParaAtendimento();

    if (modoFormulario === 'novo') {
        atendimentos.push(dados);
        indiceAtual = atendimentos.length - 1;
        alert('Atendimento registrado com sucesso!');
    }

    if (modoFormulario === 'edicao') {
        const statusAnterior = atendimentos[indiceAtual]?.status || 'Aguardando';
        atendimentos[indiceAtual] = {
            ...dados,
            status: statusAnterior
        };
        alert('Atendimento atualizado com sucesso!');
    }

    salvarAtendimentos();
    modoFormulario = 'visualizacao';
    atendimentoParaFormulario(atendimentos[indiceAtual]);
    desabilitarCampos();
    configurarBotoes();
    atualizarNavegacao();
    renderizarFila();
}

function excluirAtendimento() {
    if (indiceAtual < 0) return;

    const confirmou = confirm('Deseja cancelar este atendimento?');
    if (!confirmou) return;

    atendimentos.splice(indiceAtual, 1);
    salvarAtendimentos();
    indiceAtual = -1;
    modoFormulario = 'visualizacao';
    $('atendimentoForm').reset();
    desabilitarCampos();
    configurarBotoes();
    atualizarNavegacao();
    renderizarFila();
}

function preencherEspecialidade() {
    const medico = valorCampo('medico');
    preencherCampo('especialidade', especialidadesPorMedico[medico] || '');
}

function atualizarSenhaPorPrioridade() {
    if (modoFormulario !== 'novo') return;
    preencherCampo('numeroSenha', proximaSenha(valorCampo('prioridade')));
}

function imprimirFicha() {
    if (indiceAtual < 0 && modoFormulario !== 'novo') {
        alert('Selecione ou grave um atendimento antes de imprimir.');
        return;
    }

    window.print();
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

    $('validadeConvenio').addEventListener('input', function () {
        this.value = this.value
            .replace(/\D/g, '')
            .slice(0, 4)
            .replace(/(\d{2})(\d)/, '$1/$2');
    });
}

function configurarEventos() {
    $('btnNovo').addEventListener('click', iniciarNovo);
    $('btnSalvar').addEventListener('click', salvarFormulario);
    $('btnEditar').addEventListener('click', iniciarEdicao);
    $('btnExcluir').addEventListener('click', excluirAtendimento);
    $('btnImprimir').addEventListener('click', imprimirFicha);

    $('btnAnterior').addEventListener('click', function () {
        if (indiceAtual > 0) selecionarAtendimento(indiceAtual - 1);
    });

    $('btnProximo').addEventListener('click', function () {
        if (indiceAtual < atendimentos.length - 1) selecionarAtendimento(indiceAtual + 1);
    });

    $('medico').addEventListener('change', preencherEspecialidade);
    $('prioridade').addEventListener('change', atualizarSenhaPorPrioridade);
    $('inputBusca').addEventListener('input', renderizarFila);

    const btnBuscar = document.querySelector('.grid-search button');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', renderizarFila);
    }
}

function iniciarPagina() {
    renderizarFila();
    desabilitarCampos();
    configurarBotoes();
    atualizarNavegacao();
    aplicarMascaras();
    configurarEventos();
}

document.addEventListener('DOMContentLoaded', iniciarPagina);
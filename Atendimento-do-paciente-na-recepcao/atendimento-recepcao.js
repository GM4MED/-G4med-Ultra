'use strict';

/*
 * Atendimento do Paciente na Recepção
 * Sistema GM4
 *
 * Funcionalidades:
 * - Controle da toolbar
 * - CRUD com localStorage
 * - Navegação entre registros
 * - Busca por paciente, CPF ou senha
 * - Geração automática de ID e senha
 * - Checklist de recepção
 * - Impressão da ficha
 * - Compatibilidade com a função inline openTab(event, tabId)
 */

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'G4Med_atendimentos_recepcao';

    const state = {
        registros: [],
        registroSelecionadoId: null,
        modo: 'visualizacao', // visualizacao | novo | edicao
        resultadoBusca: []
    };

    const elementos = {
        form: document.getElementById('atendimentoForm'),

        btnNovo: document.getElementById('btnNovo'),
        btnSalvar: document.getElementById('btnSalvar'),
        btnEditar: document.getElementById('btnEditar'),
        btnExcluir: document.getElementById('btnExcluir'),
        btnImprimir: document.getElementById('btnImprimir'),
        btnAnterior: document.getElementById('btnAnterior'),
        btnProximo: document.getElementById('btnProximo'),

        inputBusca: document.getElementById('inputBusca'),
        btnBuscar: document.querySelector('.grid-search button'),

        tabela: document.getElementById('tabelaAtendimentos'),
        corpoTabela: document.getElementById('corpoTabelaAtendimentos'),

        pacienteId: document.getElementById('pacienteId'),
        cpf: document.getElementById('cpf'),
        nomePaciente: document.getElementById('nomePaciente'),
        dataNasc: document.getElementById('dataNasc'),
        celular: document.getElementById('celular'),
        convenio: document.getElementById('convenio'),
        carteirinha: document.getElementById('carteirinha'),
        validadeConvenio: document.getElementById('validadeConvenio'),

        dataAtendimento: document.getElementById('dataAtendimento'),
        horaChegada: document.getElementById('horaChegada'),
        tipoAtendimento: document.getElementById('tipoAtendimento'),
        procedimento: document.getElementById('procedimento'),
        medico: document.getElementById('medico'),
        especialidade: document.getElementById('especialidade'),
        numeroSenha: document.getElementById('numeroSenha'),
        prioridade: document.getElementById('prioridade'),
        obsAtendimento: document.getElementById('obsAtendimento'),

        pacientePresente: document.getElementById('pacientePresente'),
        docsConferidos: document.getElementById('docsConferidos'),
        convenioValido: document.getElementById('convenioValido'),
        autorizacaoRealizada: document.getElementById('autorizacaoRealizada'),
        lgpdAceita: document.getElementById('lgpdAceita')
    };

    inicializar();

    function inicializar() {
        state.registros = carregarRegistros();
        state.resultadoBusca = [...state.registros];

        configurarEventos();
        atualizarTabela();
        atualizarToolbar();
        setFormEditable(false);

        // Deixa a primeira aba ativa mesmo quando o HTML não vier com o estado correto.
        abrirAbaInicial();

        // Preenche automaticamente a especialidade ao selecionar o médico.
        atualizarEspecialidade();
    }

    function configurarEventos() {
        elementos.btnNovo.addEventListener('click', iniciarNovoRegistro);
        elementos.btnSalvar.addEventListener('click', salvarRegistro);
        elementos.btnEditar.addEventListener('click', iniciarEdicao);
        elementos.btnExcluir.addEventListener('click', excluirRegistro);
        elementos.btnImprimir.addEventListener('click', imprimirFicha);
        elementos.btnAnterior.addEventListener('click', () => navegarRegistro(-1));
        elementos.btnProximo.addEventListener('click', () => navegarRegistro(1));

        elementos.inputBusca.addEventListener('input', aplicarBusca);
        elementos.btnBuscar.addEventListener('click', aplicarBusca);

        elementos.form.addEventListener('submit', event => {
            event.preventDefault();
            salvarRegistro();
        });

        elementos.medico.addEventListener('change', atualizarEspecialidade);

        elementos.prioridade.addEventListener('change', () => {
            if (state.modo === 'novo') {
                elementos.numeroSenha.value = gerarNumeroSenha(elementos.prioridade.value);
            }
        });

        elementos.cpf.addEventListener('input', aplicarMascaraCPF);
        elementos.celular.addEventListener('input', aplicarMascaraCelular);
        elementos.validadeConvenio.addEventListener('input', aplicarMascaraValidade);

        // Delegação de eventos para as linhas criadas dinamicamente.
        elementos.corpoTabela.addEventListener('click', event => {
            const linha = event.target.closest('tr[data-id]');

            if (!linha) {
                return;
            }

            selecionarRegistro(linha.dataset.id);
        });
    }

    /*
     * Tabs
     *
     * A função fica exposta no objeto window porque o HTML fornecido
     * chama openTab(event, 'dados-paciente') diretamente via onclick.
     */
    window.openTab = function openTab(event, tabId) {
        const conteudos = document.querySelectorAll('.tab-content');
        const abas = document.querySelectorAll('.tab-link');

        conteudos.forEach(conteudo => {
            conteudo.classList.toggle('active', conteudo.id === tabId);
        });

        abas.forEach(aba => {
            aba.classList.remove('active');
            aba.setAttribute('aria-selected', 'false');
        });

        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
            event.currentTarget.setAttribute('aria-selected', 'true');
        } else {
            const abaCorrespondente = Array.from(abas).find(aba => {
                return aba.getAttribute('onclick')?.includes(`'${tabId}'`);
            });

            abaCorrespondente?.classList.add('active');
            abaCorrespondente?.setAttribute('aria-selected', 'true');
        }
    };

    function abrirAbaInicial() {
        const primeiraAba = document.querySelector('.tab-link');
        const primeiroConteudo = document.querySelector('.tab-content');

        document.querySelectorAll('.tab-content').forEach(conteudo => {
            conteudo.classList.remove('active');
        });

        document.querySelectorAll('.tab-link').forEach(aba => {
            aba.classList.remove('active');
            aba.setAttribute('aria-selected', 'false');
        });

        primeiraAba?.classList.add('active');
        primeiraAba?.setAttribute('aria-selected', 'true');
        primeiroConteudo?.classList.add('active');
    }

    function iniciarNovoRegistro() {
        state.modo = 'novo';
        state.registroSelecionadoId = null;

        limparFormulario();

        const agora = new Date();

        elementos.pacienteId.value = gerarIdPaciente();
        elementos.dataAtendimento.value = formatarDataInput(agora);
        elementos.horaChegada.value = formatarHoraInput(agora);
        elementos.prioridade.value = 'Normal';
        elementos.numeroSenha.value = gerarNumeroSenha('Normal');

        setFormEditable(true);
        atualizarToolbar();

        elementos.nomePaciente.focus();
    }

    function iniciarEdicao() {
        const registro = obterRegistroSelecionado();

        if (!registro) {
            informar('Selecione um atendimento para editar.');
            return;
        }

        state.modo = 'edicao';
        setFormEditable(true);
        atualizarToolbar();
        elementos.nomePaciente.focus();
    }

    function salvarRegistro() {
        if (!['novo', 'edicao'].includes(state.modo)) {
            informar('Clique em "Novo" ou "Editar" antes de gravar.');
            return;
        }

        const registro = coletarFormulario();

        if (!validarRegistro(registro)) {
            return;
        }

        if (state.modo === 'novo') {
            state.registros.push(registro);
            state.registroSelecionadoId = registro.id;
            informar('Atendimento cadastrado com sucesso.');
        } else {
            const indice = state.registros.findIndex(item => {
                return item.id === state.registroSelecionadoId;
            });

            if (indice === -1) {
                informar('Não foi possível localizar o atendimento para atualização.');
                return;
            }

            state.registros[indice] = {
                ...state.registros[indice],
                ...registro,
                atualizadoEm: new Date().toISOString()
            };

            informar('Atendimento atualizado com sucesso.');
        }

        salvarRegistros();
        state.modo = 'visualizacao';
        state.resultadoBusca = obterRegistrosFiltrados();

        atualizarTabela();
        carregarRegistroSelecionado();
        setFormEditable(false);
        atualizarToolbar();
    }

    function excluirRegistro() {
        const registro = obterRegistroSelecionado();

        if (!registro) {
            informar('Selecione um atendimento para excluir.');
            return;
        }

        const confirmou = window.confirm(
            `Deseja realmente excluir o atendimento de ${registro.nomePaciente}?`
        );

        if (!confirmou) {
            return;
        }

        state.registros = state.registros.filter(item => item.id !== registro.id);
        state.registroSelecionadoId = null;
        state.modo = 'visualizacao';

        salvarRegistros();
        state.resultadoBusca = obterRegistrosFiltrados();

        limparFormulario();
        atualizarTabela();
        setFormEditable(false);
        atualizarToolbar();

        informar('Atendimento excluído com sucesso.');
    }

    function selecionarRegistro(id) {
        const registro = state.registros.find(item => item.id === id);

        if (!registro) {
            return;
        }

        state.registroSelecionadoId = id;
        state.modo = 'visualizacao';

        preencherFormulario(registro);
        setFormEditable(false);
        atualizarTabela();
        atualizarToolbar();
    }

    function navegarRegistro(direcao) {
        const lista = state.resultadoBusca.length
            ? state.resultadoBusca
            : state.registros;

        if (!lista.length) {
            return;
        }

        const indiceAtual = lista.findIndex(item => {
            return item.id === state.registroSelecionadoId;
        });

        let novoIndice = indiceAtual + direcao;

        if (indiceAtual === -1) {
            novoIndice = direcao > 0 ? 0 : lista.length - 1;
        }

        if (novoIndice < 0 || novoIndice >= lista.length) {
            return;
        }

        selecionarRegistro(lista[novoIndice].id);
    }

    function coletarFormulario() {
        return {
            id: elementos.pacienteId.value.trim() || gerarIdPaciente(),
            cpf: elementos.cpf.value.trim(),
            nomePaciente: elementos.nomePaciente.value.trim().toUpperCase(),
            dataNasc: elementos.dataNasc.value,
            celular: elementos.celular.value.trim(),
            convenio: elementos.convenio.value,
            carteirinha: elementos.carteirinha.value.trim(),
            validadeConvenio: elementos.validadeConvenio.value.trim(),

            dataAtendimento: elementos.dataAtendimento.value,
            horaChegada: elementos.horaChegada.value,
            tipoAtendimento: elementos.tipoAtendimento.value,
            procedimento: elementos.procedimento.value.trim(),
            medico: elementos.medico.value,
            especialidade: elementos.especialidade.value,
            numeroSenha: elementos.numeroSenha.value.trim(),
            prioridade: elementos.prioridade.value,

            checklist: {
                pacientePresente: elementos.pacientePresente.checked,
                docsConferidos: elementos.docsConferidos.checked,
                convenioValido: elementos.convenioValido.checked,
                autorizacaoRealizada: elementos.autorizacaoRealizada.checked,
                lgpdAceita: elementos.lgpdAceita.checked
            },

            obsAtendimento: elementos.obsAtendimento.value.trim(),
            status: 'Aguardando',
            criadoEm: new Date().toISOString()
        };
    }

    function preencherFormulario(registro) {
        elementos.pacienteId.value = registro.id || '';
        elementos.cpf.value = registro.cpf || '';
        elementos.nomePaciente.value = registro.nomePaciente || '';
        elementos.dataNasc.value = registro.dataNasc || '';
        elementos.celular.value = registro.celular || '';
        elementos.convenio.value = registro.convenio || '';
        elementos.carteirinha.value = registro.carteirinha || '';
        elementos.validadeConvenio.value = registro.validadeConvenio || '';

        elementos.dataAtendimento.value = registro.dataAtendimento || '';
        elementos.horaChegada.value = registro.horaChegada || '';
        elementos.tipoAtendimento.value = registro.tipoAtendimento || '';
        elementos.procedimento.value = registro.procedimento || '';
        elementos.medico.value = registro.medico || '';
        elementos.especialidade.value = registro.especialidade || '';
        elementos.numeroSenha.value = registro.numeroSenha || '';
        elementos.prioridade.value = registro.prioridade || 'Normal';

        elementos.pacientePresente.checked = Boolean(
            registro.checklist?.pacientePresente
        );
        elementos.docsConferidos.checked = Boolean(
            registro.checklist?.docsConferidos
        );
        elementos.convenioValido.checked = Boolean(
            registro.checklist?.convenioValido
        );
        elementos.autorizacaoRealizada.checked = Boolean(
            registro.checklist?.autorizacaoRealizada
        );
        elementos.lgpdAceita.checked = Boolean(
            registro.checklist?.lgpdAceita
        );

        elementos.obsAtendimento.value = registro.obsAtendimento || '';
    }

    function limparFormulario() {
        elementos.form.reset();

        elementos.pacienteId.value = '';
        elementos.numeroSenha.value = '';
        elementos.especialidade.value = '';

        document.querySelectorAll('#atendimentoForm input[type="checkbox"]')
            .forEach(checkbox => {
                checkbox.checked = false;
            });
    }

    function validarRegistro(registro) {
        if (!registro.nomePaciente) {
            informar('Informe o nome do paciente.');
            elementos.nomePaciente.focus();
            return false;
        }

        if (!registro.cpf) {
            informar('Informe o CPF do paciente.');
            elementos.cpf.focus();
            return false;
        }

        if (!registro.dataAtendimento) {
            informar('Informe a data do atendimento.');
            elementos.dataAtendimento.focus();
            return false;
        }

        if (!registro.horaChegada) {
            informar('Informe o horário de chegada.');
            elementos.horaChegada.focus();
            return false;
        }

        if (!registro.tipoAtendimento) {
            informar('Selecione o tipo de atendimento.');
            elementos.tipoAtendimento.focus();
            return false;
        }

        if (!registro.medico) {
            informar('Selecione o médico responsável.');
            elementos.medico.focus();
            return false;
        }

        if (!registro.numeroSenha) {
            informar('A senha do atendimento não foi gerada.');
            return false;
        }

        return true;
    }

    function setFormEditable(editavel) {
        const camposEditaveis = document.querySelectorAll(
            '#atendimentoForm input:not([readonly]), ' +
            '#atendimentoForm select, ' +
            '#atendimentoForm textarea'
        );

        camposEditaveis.forEach(campo => {
            campo.disabled = !editavel;
        });

        // Os checkboxes do checklist não estavam disabled no HTML original.
        document.querySelectorAll(
            '#atendimentoForm input[type="checkbox"]'
        ).forEach(checkbox => {
            checkbox.disabled = !editavel;
        });

        // Campos sempre controlados automaticamente pelo sistema.
        elementos.pacienteId.disabled = true;
        elementos.numeroSenha.disabled = true;
        elementos.especialidade.disabled = true;
    }

    function atualizarToolbar() {
        const possuiSelecao = Boolean(state.registroSelecionadoId);
        const editando = state.modo === 'novo' || state.modo === 'edicao';

        elementos.btnSalvar.disabled = !editando;
        elementos.btnEditar.disabled = !possuiSelecao || editando;
        elementos.btnExcluir.disabled = !possuiSelecao || editando;

        const lista = state.resultadoBusca.length
            ? state.resultadoBusca
            : state.registros;

        const indiceAtual = lista.findIndex(item => {
            return item.id === state.registroSelecionadoId;
        });

        elementos.btnAnterior.disabled =
            !possuiSelecao || editando || indiceAtual <= 0;

        elementos.btnProximo.disabled =
            !possuiSelecao ||
            editando ||
            indiceAtual === -1 ||
            indiceAtual >= lista.length - 1;

        elementos.btnImprimir.disabled = !possuiSelecao && state.modo !== 'novo';
    }

    function atualizarTabela() {
        const registros = obterRegistrosFiltrados();

        state.resultadoBusca = registros;

        if (!registros.length) {
            elementos.corpoTabela.innerHTML = `
                <tr class="empty-row">
                    <td colspan="6">
                        Nenhum atendimento encontrado.
                    </td>
                </tr>
            `;

            atualizarToolbar();
            return;
        }

        elementos.corpoTabela.innerHTML = registros.map(registro => {
            const selecionado = registro.id === state.registroSelecionadoId;
            const statusClasse = gerarClasseStatus(registro.status);

            return `
                <tr
                    data-id="${escapeHTML(registro.id)}"
                    class="${selecionado ? 'selected' : ''}"
                    tabindex="0"
                    aria-selected="${selecionado}"
                >
                    <td>
                        <span class="senha-badge ${gerarClassePrioridade(registro.prioridade)}">
                            ${escapeHTML(registro.numeroSenha || '-')}
                        </span>
                    </td>
                    <td>${escapeHTML(registro.horaChegada || '-')}</td>
                    <td>
                        <strong>${escapeHTML(registro.nomePaciente || '-')}</strong>
                        <small>${escapeHTML(registro.cpf || '')}</small>
                    </td>
                    <td>${escapeHTML(registro.tipoAtendimento || '-')}</td>
                    <td>${escapeHTML(registro.medico || '-')}</td>
                    <td>
                        <span class="status-badge ${statusClasse}">
                            ${escapeHTML(registro.status || 'Aguardando')}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        atualizarToolbar();
    }

    function aplicarBusca() {
        atualizarTabela();
    }

    function obterRegistrosFiltrados() {
        const termo = elementos.inputBusca.value
            .trim()
            .toLowerCase();

        if (!termo) {
            return [...state.registros];
        }

        return state.registros.filter(registro => {
            const camposPesquisaveis = [
                registro.nomePaciente,
                registro.cpf,
                registro.numeroSenha,
                registro.medico,
                registro.tipoAtendimento
            ];

            return camposPesquisaveis.some(campo => {
                return normalizarTexto(campo).includes(normalizarTexto(termo));
            });
        });
    }

    function carregarRegistroSelecionado() {
        const registro = obterRegistroSelecionado();

        if (registro) {
            preencherFormulario(registro);
        }
    }

    function obterRegistroSelecionado() {
        return state.registros.find(registro => {
            return registro.id === state.registroSelecionadoId;
        });
    }

    function imprimirFicha() {
        let registro = obterRegistroSelecionado();

        if (!registro && state.modo === 'novo') {
            registro = coletarFormulario();
        }

        if (!registro || !registro.nomePaciente) {
            informar('Selecione ou preencha um atendimento antes de imprimir.');
            return;
        }

        const janelaImpressao = window.open(
            '',
            '_blank',
            'width=800,height=700'
        );

        if (!janelaImpressao) {
            informar('Permita pop-ups no navegador para imprimir a ficha.');
            return;
        }

        const checklist = registro.checklist || {};

        janelaImpressao.document.write(`
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>Ficha de Atendimento - ${escapeHTML(registro.numeroSenha)}</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 32px;
                        color: #172033;
                        font-family: Arial, sans-serif;
                        background: #fff;
                    }

                    .ficha {
                        max-width: 760px;
                        margin: 0 auto;
                    }

                    .cabecalho {
                        display: flex;
                        justify-content: space-between;
                        gap: 24px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #172033;
                    }

                    h1 {
                        margin: 0 0 6px;
                        font-size: 22px;
                    }

                    h2 {
                        margin: 24px 0 10px;
                        font-size: 15px;
                        border-bottom: 1px solid #ccd3df;
                        padding-bottom: 6px;
                    }

                    .senha {
                        min-width: 120px;
                        padding: 14px;
                        text-align: center;
                        border: 2px solid #172033;
                        border-radius: 8px;
                        font-size: 24px;
                        font-weight: bold;
                    }

                    .grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px 24px;
                    }

                    .item {
                        padding: 6px 0;
                    }

                    .label {
                        display: block;
                        color: #667085;
                        font-size: 11px;
                        text-transform: uppercase;
                    }

                    .valor {
                        font-size: 14px;
                    }

                    ul {
                        padding-left: 20px;
                    }

                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <main class="ficha">
                    <header class="cabecalho">
                        <div>
                            <h1>Ficha de Atendimento</h1>
                            <div>Sistema G4Med — Recepção</div>
                        </div>
                        <div class="senha">
                            ${escapeHTML(registro.numeroSenha || '-')}
                        </div>
                    </header>

                    <h2>Dados do paciente</h2>
                    <section class="grid">
                        ${itemFicha('Código ID', registro.id)}
                        ${itemFicha('CPF', registro.cpf)}
                        ${itemFicha('Paciente', registro.nomePaciente)}
                        ${itemFicha('Data de nascimento', formatarDataBR(registro.dataNasc))}
                        ${itemFicha('Celular', registro.celular)}
                        ${itemFicha('Convênio', obterNomeConvenio(registro.convenio))}
                    </section>

                    <h2>Dados do atendimento</h2>
                    <section class="grid">
                        ${itemFicha('Data', formatarDataBR(registro.dataAtendimento))}
                        ${itemFicha('Hora de chegada', registro.horaChegada)}
                        ${itemFicha('Tipo', registro.tipoAtendimento)}
                        ${itemFicha('Procedimento', registro.procedimento)}
                        ${itemFicha('Médico', registro.medico)}
                        ${itemFicha('Especialidade', registro.especialidade)}
                        ${itemFicha('Prioridade', registro.prioridade)}
                        ${itemFicha('Status', registro.status)}
                    </section>

                    <h2>Checklist da recepção</h2>
                    <ul>
                        <li>Paciente presente: ${checklist.pacientePresente ? 'Sim' : 'Não'}</li>
                        <li>Documentos conferidos: ${checklist.docsConferidos ? 'Sim' : 'Não'}</li>
                        <li>Convênio válido: ${checklist.convenioValido ? 'Sim' : 'Não'}</li>
                        <li>Autorização realizada: ${checklist.autorizacaoRealizada ? 'Sim' : 'Não'}</li>
                        <li>LGPD aceita: ${checklist.lgpdAceita ? 'Sim' : 'Não'}</li>
                    </ul>

                    <h2>Observações</h2>
                    <p>${escapeHTML(registro.obsAtendimento || 'Nenhuma observação registrada.')}</p>
                </main>

                <script>
                    window.addEventListener('load', () => {
                        window.print();
                    });
                <\/script>
            </body>
            </html>
        `);

        janelaImpressao.document.close();
    }

    function itemFicha(label, valor) {
        return `
            <div class="item">
                <span class="label">${escapeHTML(label)}</span>
                <span class="valor">${escapeHTML(valor || '-')}</span>
            </div>
        `;
    }

    function atualizarEspecialidade() {
        const especialidades = {
            'Dr. Ricardo Silva': 'Cardiologia',
            'Dra. Ana Beatriz': 'Clínica Geral',
            'Dr. Marcos Pereira': 'Ortopedia'
        };

        elementos.especialidade.value =
            especialidades[elementos.medico.value] || '';
    }

    function gerarIdPaciente() {
        const data = new Date();
        const parteData = [
            data.getFullYear(),
            String(data.getMonth() + 1).padStart(2, '0'),
            String(data.getDate()).padStart(2, '0')
        ].join('');

        const sufixo = String(Date.now()).slice(-5);

        return `PAC-${parteData}-${sufixo}`;
    }

    function gerarNumeroSenha(prioridade) {
        const prefixo = prioridade === 'Normal' ? 'G' : 'P';

        const numerosUtilizados = state.registros
            .map(registro => registro.numeroSenha || '')
            .filter(senha => senha.startsWith(`${prefixo}-`))
            .map(senha => Number(senha.split('-')[1]))
            .filter(numero => Number.isInteger(numero));

        const maiorNumero = numerosUtilizados.length
            ? Math.max(...numerosUtilizados)
            : 0;

        return `${prefixo}-${String(maiorNumero + 1).padStart(3, '0')}`;
    }

    function carregarRegistros() {
        try {
            const registrosSalvos = localStorage.getItem(STORAGE_KEY);

            if (!registrosSalvos) {
                return [];
            }

            const registros = JSON.parse(registrosSalvos);

            return Array.isArray(registros) ? registros : [];
        } catch (erro) {
            console.error('Erro ao carregar atendimentos:', erro);
            informar('Não foi possível carregar os atendimentos salvos.');
            return [];
        }
    }

    function salvarRegistros() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.registros));
        } catch (erro) {
            console.error('Erro ao salvar atendimentos:', erro);
            informar(
                'Não foi possível salvar os dados. Verifique o armazenamento do navegador.'
            );
        }
    }

    function formatarDataInput(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');

        return `${ano}-${mes}-${dia}`;
    }

    function formatarHoraInput(data) {
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');

        return `${horas}:${minutos}`;
    }

    function formatarDataBR(data) {
        if (!data || !data.includes('-')) {
            return data || '-';
        }

        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function obterNomeConvenio(valor) {
        const opcao = Array.from(elementos.convenio.options)
            .find(item => item.value === valor || item.textContent === valor);

        return opcao?.textContent || valor || '-';
    }

    function gerarClassePrioridade(prioridade) {
        const classes = {
            Normal: 'senha-normal',
            Idoso: 'senha-preferencial',
            Gestante: 'senha-preferencial',
            PCD: 'senha-preferencial',
            Emergencial: 'senha-emergencial'
        };

        return classes[prioridade] || 'senha-normal';
    }

    function gerarClasseStatus(status) {
        const classes = {
            Aguardando: 'status-aguardando',
            'Em atendimento': 'status-atendimento',
            Finalizado: 'status-finalizado',
            Cancelado: 'status-cancelado'
        };

        return classes[status] || 'status-aguardando';
    }

    function normalizarTexto(valor) {
        return String(valor || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function escapeHTML(valor) {
        return String(valor ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function aplicarMascaraCPF(event) {
        let valor = event.target.value.replace(/\D/g, '').slice(0, 11);

        valor = valor
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

        event.target.value = valor;
    }

    function aplicarMascaraCelular(event) {
        let valor = event.target.value.replace(/\D/g, '').slice(0, 11);

        if (valor.length <= 10) {
            valor = valor
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            valor = valor
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2');
        }

        event.target.value = valor;
    }

    function aplicarMascaraValidade(event) {
        let valor = event.target.value.replace(/\D/g, '').slice(0, 4);

        if (valor.length > 2) {
            valor = `${valor.slice(0, 2)}/${valor.slice(2)}`;
        }

        event.target.value = valor;
    }

    function informar(mensagem) {
        /*
         * Troque por um componente de toast institucional caso o GM4
         * já possua um sistema próprio de notificações.
         */
        window.alert(mensagem);
    }
});
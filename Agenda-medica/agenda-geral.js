'use strict';

document.addEventListener('DOMContentLoaded', () => {
    /*
     * =========================================================
     * CONFIGURAÇÕES E DADOS BASE
     * =========================================================
     */

    const STORAGE_KEY = 'g4med.agenda.agendamentos.v1';

    const HORARIO_INICIAL = 8 * 60;   // 08:00
    const HORARIO_FINAL = 18 * 60;    // 18:00
    const INTERVALO = 30;             // Grade de 30 em 30 minutos

    const STATUS_LABELS = {
        agendado: 'Agendado',
        confirmado: 'Confirmado',
        espera: 'Em Espera',
        atendido: 'Atendido',
        cancelado: 'Cancelado',
        'nao-compareceu': 'Não Compareceu'
    };

    const STATUS_CLASSES = {
        agendado: 'agendado',
        confirmado: 'confirmado',
        espera: 'espera',
        atendido: 'atendido',
        cancelado: 'cancelado',
        'nao-compareceu': 'nao-compareceu'
    };

    const TIPO_LABELS = {
        presencial: 'Presencial',
        online: 'Online',
        retorno: 'Retorno',
        procedimento: 'Procedimento'
    };

    const MEDICOS = {
        '1': {
            id: '1',
            nome: 'Dr. Carlos Silva',
            especialidade: 'Cardiologia',
            especialidadeId: 'cardio'
        },
        '2': {
            id: '2',
            nome: 'Dra. Ana Paula',
            especialidade: 'Dermatologia',
            especialidadeId: 'derma'
        },
        '3': {
            id: '3',
            nome: 'Dr. Roberto Lima',
            especialidade: 'Ortopedia e Traumatologia',
            especialidadeId: 'orto'
        }
    };

    /*
     * =========================================================
     * ELEMENTOS DA INTERFACE
     * =========================================================
     */

    const elements = {
        btnPrev: document.querySelector('#btn-prev'),
        btnNext: document.querySelector('#btn-next'),
        btnToday: document.querySelector('#btn-today'),

        currentDateLabel: document.querySelector('#current-date-label'),
        currentWeekday: document.querySelector('#current-weekday'),

        filterMedico: document.querySelector('#filter-medico'),
        filterEspecialidade: document.querySelector('#filter-especialidade'),

        agendaHeader: document.querySelector('#agenda-header'),
        agendaBody: document.querySelector('#agenda-body'),

        btnNovo: document.querySelector('#btn-novo-agendamento'),

        modalAgendamento: document.querySelector('#modal-agendamento'),
        modalAcoes: document.querySelector('#modal-acoes'),

        form: document.querySelector('#form-agendamento'),
        modalTitulo: document.querySelector('#modal-titulo'),

        btnModalClose: document.querySelector('#modal-close'),
        btnModalAcoesClose: document.querySelector('#modal-acoes-close'),
        btnCancelar: document.querySelector('#btn-cancelar'),
        btnGravar: document.querySelector('#btn-gravar'),

        detalhesAgendamento: document.querySelector('#agendamento-detalhes'),
        toastContainer: document.querySelector('#toast-container')
    };

    const fields = {
        id: document.querySelector('#agendamento-id'),
        paciente: document.querySelector('#paciente-nome'),
        medico: document.querySelector('#agendamento-medico'),
        data: document.querySelector('#agendamento-data'),
        hora: document.querySelector('#agendamento-hora'),
        duracao: document.querySelector('#agendamento-duracao'),
        tipo: document.querySelector('#agendamento-tipo'),
        convenio: document.querySelector('#agendamento-convenio'),
        status: document.querySelector('#agendamento-status'),
        observacoes: document.querySelector('#agendamento-obs'),
        lembrete: document.querySelector('#agendamento-lembrete')
    };

    /*
     * =========================================================
     * ESTADO DA APLICAÇÃO
     * =========================================================
     */

    let dataAtual = inicioDoDia(new Date());
    let agendamentoSelecionadoId = null;
    let ultimoElementoFocado = null;

    let agendamentos = carregarAgendamentos();

    /*
     * =========================================================
     * INICIALIZAÇÃO
     * =========================================================
     */

    inicializar();

    function inicializar() {
        aplicarAcessibilidadeBasica();
        configurarEventos();
        renderizarAgenda();
    }

    function configurarEventos() {
        elements.btnPrev?.addEventListener('click', () => alterarData(-1));
        elements.btnNext?.addEventListener('click', () => alterarData(1));
        elements.btnToday?.addEventListener('click', irParaHoje);

        elements.filterMedico?.addEventListener('change', renderizarAgenda);
        elements.filterEspecialidade?.addEventListener('change', renderizarAgenda);

        elements.btnNovo?.addEventListener('click', () => {
            abrirModalNovo();
        });

        elements.btnModalClose?.addEventListener('click', fecharModalAgendamento);
        elements.btnModalAcoesClose?.addEventListener('click', fecharModalAcoes);
        elements.btnCancelar?.addEventListener('click', fecharModalAgendamento);

        elements.btnGravar?.addEventListener('click', salvarAgendamento);

        elements.form?.addEventListener('submit', event => {
            event.preventDefault();
            salvarAgendamento();
        });

        document.querySelectorAll('.modal__overlay').forEach(overlay => {
            overlay.addEventListener('click', event => {
                const modal = event.currentTarget.closest('.modal');

                if (modal?.id === 'modal-acoes') {
                    fecharModalAcoes();
                }

                if (modal?.id === 'modal-agendamento') {
                    fecharModalAgendamento();
                }
            });
        });

        document.querySelectorAll('.modal__acao').forEach(botao => {
            botao.addEventListener('click', () => {
                executarAcao(botao.dataset.acao);
            });
        });

        document.addEventListener('keydown', tratarTecladoGlobal);
    }

    /*
     * =========================================================
     * NAVEGAÇÃO DE DATAS
     * =========================================================
     */

    function alterarData(dias) {
        const novaData = new Date(dataAtual);
        novaData.setDate(novaData.getDate() + dias);

        dataAtual = inicioDoDia(novaData);
        renderizarAgenda();
    }

    function irParaHoje() {
        dataAtual = inicioDoDia(new Date());
        renderizarAgenda();
        exibirToast('Agenda posicionada em hoje.', 'info');
    }

    function atualizarCabecalhoData() {
        const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(dataAtual);

        const diaSemana = new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long'
        }).format(dataAtual);

        elements.currentDateLabel.textContent = capitalizar(dataFormatada);
        elements.currentWeekday.textContent = capitalizar(diaSemana);
    }

    /*
     * =========================================================
     * RENDERIZAÇÃO DA AGENDA
     * =========================================================
     */

    function renderizarAgenda() {
        atualizarCabecalhoData();
        renderizarCabecalhoMedicos();
        renderizarCorpoAgenda();
    }

    function renderizarCabecalhoMedicos() {
        if (!elements.agendaHeader) return;

        const medicosVisiveis = obterMedicosFiltrados();

        elements.agendaHeader.innerHTML = `
            <div class="agenda__col-time">Horário</div>
            ${medicosVisiveis.map(medico => `
                <div class="agenda__col-prof" data-medico="${medico.id}">
                    <span class="agenda__prof-nome">${escapeHTML(medico.nome)}</span>
                    <span class="agenda__prof-esp">${escapeHTML(medico.especialidade)}</span>
                </div>
            `).join('')}
        `;

        elements.agendaHeader.style.setProperty(
            '--quantidade-medicos',
            medicosVisiveis.length || 1
        );
    }

    function renderizarCorpoAgenda() {
        if (!elements.agendaBody) return;

        const medicosVisiveis = obterMedicosFiltrados();
        const agendamentosDoDia = obterAgendamentosDoDia();

        if (!medicosVisiveis.length) {
            elements.agendaBody.innerHTML = `
                <div class="agenda__empty">
                    Nenhum médico corresponde aos filtros selecionados.
                </div>
            `;
            return;
        }

        const linhas = [];

        for (
            let minutos = HORARIO_INICIAL;
            minutos <= HORARIO_FINAL;
            minutos += INTERVALO
        ) {
            const horario = minutosParaHora(minutos);

            linhas.push(`
                <div class="agenda__calendar-row" data-horario="${horario}">
                    <div class="agenda__time-cell">
                        <span>${horario}</span>
                    </div>

                    ${medicosVisiveis.map(medico => {
                const agendamento = encontrarAgendamentoNoHorario(
                    agendamentosDoDia,
                    medico.id,
                    minutos
                );

                return `
                            <div
                                class="agenda__slot"
                                data-medico="${medico.id}"
                                data-minutos="${minutos}"
                            >
                                ${agendamento
                        ? criarCardAgendamento(agendamento)
                        : ''}
                            </div>
                        `;
            }).join('')}
                </div>
            `);
        }

        elements.agendaBody.innerHTML = linhas.join('');

        elements.agendaBody
            .querySelectorAll('[data-agendamento-id]')
            .forEach(card => {
                card.addEventListener('click', () => {
                    abrirModalAcoes(card.dataset.agendamentoId);
                });
            });
    }

    function criarCardAgendamento(agendamento) {
        const status = STATUS_CLASSES[agendamento.status] || 'agendado';
        const statusLabel = STATUS_LABELS[agendamento.status] || 'Agendado';
        const tipoLabel = TIPO_LABELS[agendamento.tipo] || agendamento.tipo;

        const duracao = Number(agendamento.duracao) || 30;
        const linhasOcupadas = Math.max(1, Math.ceil(duracao / INTERVALO));

        return `
            <article
                class="agenda__appointment agenda__appointment--${status}"
                data-agendamento-id="${escapeHTML(agendamento.id)}"
                tabindex="0"
                role="button"
                aria-label="Agendamento de ${escapeHTML(agendamento.paciente)} às ${escapeHTML(agendamento.hora)}"
                style="--appointment-height: ${linhasOcupadas * 100}%"
            >
                <div class="agenda__appointment-time">
                    ${escapeHTML(agendamento.hora)}
                </div>

                <div class="agenda__appointment-content">
                    <strong>${escapeHTML(agendamento.paciente)}</strong>
                    <span>${escapeHTML(tipoLabel)}</span>
                    <small>${escapeHTML(statusLabel)}</small>
                </div>

                ${agendamento.tipo === 'online'
                ? '<i class="fa-solid fa-video agenda__appointment-icon" title="Teleconsulta"></i>'
                : ''}
            </article>
        `;
    }

    function obterMedicosFiltrados() {
        const medicoSelecionado = elements.filterMedico?.value || '';
        const especialidadeSelecionada = elements.filterEspecialidade?.value || '';

        return Object.values(MEDICOS).filter(medico => {
            const correspondeAoMedico =
                !medicoSelecionado || medico.id === medicoSelecionado;

            const correspondeAEspecialidade =
                !especialidadeSelecionada ||
                medico.especialidadeId === especialidadeSelecionada;

            return correspondeAoMedico && correspondeAEspecialidade;
        });
    }

    function obterAgendamentosDoDia() {
        const data = formatarDataISO(dataAtual);
        const especialidadeSelecionada = elements.filterEspecialidade?.value || '';
        const medicoSelecionado = elements.filterMedico?.value || '';

        return agendamentos.filter(agendamento => {
            const medico = MEDICOS[agendamento.medicoId];

            if (!medico) return false;

            return (
                agendamento.data === data &&
                (!medicoSelecionado || agendamento.medicoId === medicoSelecionado) &&
                (!especialidadeSelecionada ||
                    medico.especialidadeId === especialidadeSelecionada)
            );
        });
    }

    function encontrarAgendamentoNoHorario(lista, medicoId, minutos) {
        return lista.find(agendamento => {
            const inicio = horaParaMinutos(agendamento.hora);
            return (
                agendamento.medicoId === medicoId &&
                inicio === minutos
            );
        });
    }

    /*
     * =========================================================
     * MODAL DE NOVO / EDIÇÃO
     * =========================================================
     */

    function abrirModalNovo() {
        limparFormulario();

        fields.data.value = formatarDataISO(dataAtual);
        fields.status.value = 'agendado';
        fields.duracao.value = '30';
        fields.tipo.value = 'presencial';
        fields.convenio.value = 'particular';
        fields.lembrete.checked = true;

        elements.modalTitulo.innerHTML = `
            <i class="fa-solid fa-calendar-plus"></i>
            Novo Agendamento
        `;

        abrirModal(elements.modalAgendamento, '#paciente-nome');
    }

    function abrirModalEdicao(agendamento) {
        if (!agendamento) return;

        fields.id.value = agendamento.id;
        fields.paciente.value = agendamento.paciente;
        fields.medico.value = agendamento.medicoId;
        fields.data.value = agendamento.data;
        fields.hora.value = agendamento.hora;
        fields.duracao.value = agendamento.duracao;
        fields.tipo.value = agendamento.tipo;
        fields.convenio.value = agendamento.convenio || 'particular';
        fields.status.value = agendamento.status;
        fields.observacoes.value = agendamento.observacoes || '';
        fields.lembrete.checked = Boolean(agendamento.lembrete);

        elements.modalTitulo.innerHTML = `
            <i class="fa-solid fa-pen"></i>
            Editar Agendamento
        `;

        abrirModal(elements.modalAgendamento, '#paciente-nome');
    }

    function salvarAgendamento() {
        const dados = obterDadosFormulario();

        if (!validarAgendamento(dados)) {
            return;
        }

        const indiceExistente = agendamentos.findIndex(
            agendamento => agendamento.id === dados.id
        );

        if (indiceExistente >= 0) {
            agendamentos[indiceExistente] = {
                ...agendamentos[indiceExistente],
                ...dados,
                atualizadoEm: new Date().toISOString()
            };

            persistirAgendamentos();
            fecharModalAgendamento();
            renderizarAgenda();
            exibirToast('Agendamento atualizado com sucesso!', 'success');
            return;
        }

        const novoAgendamento = {
            ...dados,
            id: gerarId(),
            criadoEm: new Date().toISOString()
        };

        agendamentos.push(novoAgendamento);
        persistirAgendamentos();

        dataAtual = dataStringParaDate(novoAgendamento.data);

        fecharModalAgendamento();
        renderizarAgenda();
        exibirToast('Agendamento criado com sucesso!', 'success');
    }

    function obterDadosFormulario() {
        return {
            id: fields.id.value.trim(),
            paciente: fields.paciente.value.trim(),
            medicoId: fields.medico.value,
            data: fields.data.value,
            hora: fields.hora.value,
            duracao: Number(fields.duracao.value) || 30,
            tipo: fields.tipo.value,
            convenio: fields.convenio.value,
            status: fields.status.value || 'agendado',
            observacoes: fields.observacoes.value.trim(),
            lembrete: fields.lembrete.checked
        };
    }

    function validarAgendamento(dados) {
        limparErrosFormulario();

        const obrigatorios = [
            ['paciente', fields.paciente, 'Informe o nome do paciente.'],
            ['medico', fields.medico, 'Selecione um médico.'],
            ['data', fields.data, 'Informe a data do agendamento.'],
            ['hora', fields.hora, 'Informe o horário.'],
            ['tipo', fields.tipo, 'Selecione o tipo de atendimento.']
        ];

        let formularioValido = true;

        obrigatorios.forEach(([, campo, mensagem]) => {
            if (!campo.value.trim()) {
                marcarErro(campo, mensagem);
                formularioValido = false;
            }
        });

        if (!formularioValido) {
            exibirToast('Preencha os campos obrigatórios.', 'warning');
            return false;
        }

        const minutos = horaParaMinutos(dados.hora);
        const fim = minutos + dados.duracao;

        if (
            Number.isNaN(minutos) ||
            minutos < HORARIO_INICIAL ||
            fim > HORARIO_FINAL
        ) {
            marcarErro(
                fields.hora,
                `O horário deve estar entre 08:00 e ${minutosParaHora(HORARIO_FINAL - dados.duracao)}.`
            );

            exibirToast('Horário fora do funcionamento da agenda.', 'warning');
            return false;
        }

        const existeConflito = agendamentos.some(agendamento => {
            if (
                agendamento.id === dados.id ||
                agendamento.data !== dados.data ||
                agendamento.medicoId !== dados.medicoId ||
                agendamento.status === 'cancelado'
            ) {
                return false;
            }

            const inicioExistente = horaParaMinutos(agendamento.hora);
            const fimExistente =
                inicioExistente + Number(agendamento.duracao || 30);

            return minutos < fimExistente && fim > inicioExistente;
        });

        if (existeConflito) {
            marcarErro(
                fields.hora,
                'Já existe um agendamento conflitante para este médico.'
            );

            exibirToast('Existe conflito de horário para este médico.', 'warning');
            return false;
        }

        return true;
    }

    function limparFormulario() {
        elements.form?.reset();
        fields.id.value = '';
        limparErrosFormulario();
    }

    /*
     * =========================================================
     * MODAL DE AÇÕES
     * =========================================================
     */

    function abrirModalAcoes(id) {
        const agendamento = obterAgendamentoPorId(id);

        if (!agendamento) return;

        agendamentoSelecionadoId = id;
        renderizarDetalhesAgendamento(agendamento);

        abrirModal(elements.modalAcoes, '#modal-acoes-close');
    }

    function renderizarDetalhesAgendamento(agendamento) {
        const medico = MEDICOS[agendamento.medicoId];
        const statusLabel = STATUS_LABELS[agendamento.status] || agendamento.status;

        elements.detalhesAgendamento.innerHTML = `
            <div class="modal__detail-main">
                <strong>${escapeHTML(agendamento.paciente)}</strong>
                <span>${escapeHTML(statusLabel)}</span>
            </div>

            <dl class="modal__detail-list">
                <div>
                    <dt>Médico</dt>
                    <dd>${escapeHTML(medico?.nome || 'Não informado')}</dd>
                </div>

                <div>
                    <dt>Especialidade</dt>
                    <dd>${escapeHTML(medico?.especialidade || 'Não informada')}</dd>
                </div>

                <div>
                    <dt>Data e horário</dt>
                    <dd>${formatarDataCurta(agendamento.data)} às ${escapeHTML(agendamento.hora)}</dd>
                </div>

                <div>
                    <dt>Atendimento</dt>
                    <dd>${escapeHTML(TIPO_LABELS[agendamento.tipo] || agendamento.tipo)}</dd>
                </div>

                <div>
                    <dt>Convênio</dt>
                    <dd>${escapeHTML(agendamento.convenio || 'Particular')}</dd>
                </div>
            </dl>

            ${agendamento.observacoes
                ? `<p class="modal__detail-observacao">
                    <strong>Observações:</strong>
                    ${escapeHTML(agendamento.observacoes)}
                </p>`
                : ''}
        `;
    }

    function executarAcao(acao) {
        const agendamento = obterAgendamentoPorId(agendamentoSelecionadoId);

        if (!agendamento) {
            fecharModalAcoes();
            return;
        }

        switch (acao) {
            case 'confirmar':
                alterarStatus(agendamento, 'confirmado');
                break;

            case 'espera':
                alterarStatus(agendamento, 'espera');
                break;

            case 'atender':
                alterarStatus(agendamento, 'atendido');
                break;

            case 'cancelar':
                alterarStatus(agendamento, 'cancelado');
                break;

            case 'excluir':
                excluirAgendamento(agendamento);
                break;

            case 'editar':
                fecharModalAcoes();
                abrirModalEdicao(agendamento);
                break;

            case 'teleconsulta':
                iniciarTeleconsulta(agendamento);
                break;

            case 'prontuario':
                acessarProntuario(agendamento);
                break;

            case 'financeiro':
                acessarFinanceiro(agendamento);
                break;

            default:
                exibirToast('Ação não reconhecida.', 'warning');
        }
    }

    function alterarStatus(agendamento, novoStatus) {
        agendamento.status = novoStatus;
        agendamento.atualizadoEm = new Date().toISOString();

        persistirAgendamentos();
        fecharModalAcoes();
        renderizarAgenda();

        exibirToast(
            `Status alterado para ${STATUS_LABELS[novoStatus]}.`,
            'success'
        );
    }

    function excluirAgendamento(agendamento) {
        const desejaExcluir = window.confirm(
            `Excluir o agendamento de ${agendamento.paciente}?`
        );

        if (!desejaExcluir) return;

        agendamentos = agendamentos.filter(
            item => item.id !== agendamento.id
        );

        persistirAgendamentos();
        fecharModalAcoes();
        renderizarAgenda();

        exibirToast('Agendamento excluído com sucesso.', 'success');
    }

    function iniciarTeleconsulta(agendamento) {
        fecharModalAcoes();

        if (agendamento.tipo !== 'online') {
            exibirToast(
                'Este agendamento não está configurado como teleconsulta.',
                'warning'
            );
            return;
        }

        /*
         * Integração futura:
         * window.open(`/teleconsulta?id=${encodeURIComponent(agendamento.id)}`);
         */

        window.dispatchEvent(new CustomEvent('g4med:teleconsulta', {
            detail: agendamento
        }));

        exibirToast('Sala de teleconsulta acionada.', 'info');
    }

    function acessarProntuario(agendamento) {
        window.dispatchEvent(new CustomEvent('g4med:prontuario', {
            detail: agendamento
        }));

        exibirToast(
            `Prontuário de ${agendamento.paciente} solicitado.`,
            'info'
        );
    }

    function acessarFinanceiro(agendamento) {
        window.dispatchEvent(new CustomEvent('g4med:financeiro', {
            detail: agendamento
        }));

        exibirToast(
            `Financeiro do agendamento de ${agendamento.paciente} solicitado.`,
            'info'
        );
    }

    /*
     * =========================================================
     * CONTROLE DOS MODAIS E ACESSIBILIDADE
     * =========================================================
     *
     * O foco é colocado dentro do modal, o Escape fecha a janela
     * e o foco retorna ao elemento que abriu o modal.
     * Esses comportamentos são importantes em diálogos modais
     * acessíveis. [1][2]
     */

    function abrirModal(modal, seletorFoco) {
        if (!modal) return;

        ultimoElementoFocado = document.activeElement;

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        const elementoFoco = modal.querySelector(seletorFoco);

        window.setTimeout(() => {
            elementoFoco?.focus();
        }, 0);
    }

    function fecharModalAgendamento() {
        fecharModal(elements.modalAgendamento);
    }

    function fecharModalAcoes() {
        fecharModal(elements.modalAcoes);
        agendamentoSelecionadoId = null;
    }

    function fecharModal(modal) {
        if (!modal) return;

        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');

        const algumModalAberto =
            document.querySelector('.modal.is-open');

        if (!algumModalAberto) {
            document.body.classList.remove('modal-open');
        }

        if (ultimoElementoFocado && typeof ultimoElementoFocado.focus === 'function') {
            ultimoElementoFocado.focus();
        }
    }

    function tratarTecladoGlobal(event) {
        const modalAberto = document.querySelector('.modal.is-open');

        if (!modalAberto) return;

        if (event.key === 'Escape') {
            event.preventDefault();

            if (modalAberto.id === 'modal-acoes') {
                fecharModalAcoes();
            } else {
                fecharModalAgendamento();
            }

            return;
        }

        if (event.key === 'Tab') {
            manterFocoNoModal(event, modalAberto);
        }

        if (
            event.key === 'Enter' &&
            event.target.matches('.agenda__appointment')
        ) {
            event.preventDefault();
            abrirModalAcoes(event.target.dataset.agendamentoId);
        }
    }

    function manterFocoNoModal(event, modal) {
        const elementosFocaveis = [
            ...modal.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ].filter(elemento => elemento.offsetParent !== null);

        if (!elementosFocaveis.length) return;

        const primeiro = elementosFocaveis[0];
        const ultimo = elementosFocaveis[elementosFocaveis.length - 1];

        if (event.shiftKey && document.activeElement === primeiro) {
            event.preventDefault();
            ultimo.focus();
        } else if (!event.shiftKey && document.activeElement === ultimo) {
            event.preventDefault();
            primeiro.focus();
        }
    }

    function aplicarAcessibilidadeBasica() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.setAttribute('aria-hidden', 'true');
        });

        elements.agendaBody?.setAttribute(
            'aria-live',
            'polite'
        );
    }

    /*
     * =========================================================
     * TOASTS
     * =========================================================
     */

    function exibirToast(mensagem, tipo = 'info', duracao = 3500) {
        if (!elements.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${tipo}`;
        toast.setAttribute('role', 'status');

        const icones = {
            success: 'fa-circle-check',
            warning: 'fa-triangle-exclamation',
            error: 'fa-circle-xmark',
            info: 'fa-circle-info'
        };

        toast.innerHTML = `
            <i class="fa-solid ${icones[tipo] || icones.info}" aria-hidden="true"></i>
            <span>${escapeHTML(mensagem)}</span>
            <button type="button" class="toast__close" aria-label="Fechar notificação">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;

        elements.toastContainer.appendChild(toast);

        const remover = () => {
            toast.classList.add('is-leaving');

            window.setTimeout(() => {
                toast.remove();
            }, 250);
        };

        toast.querySelector('.toast__close').addEventListener('click', remover);

        window.setTimeout(() => {
            if (document.body.contains(toast)) {
                remover();
            }
        }, duracao);
    }

    /*
     * =========================================================
     * LOCAL STORAGE
     * =========================================================
     */

    function carregarAgendamentos() {
        try {
            const dadosSalvos = localStorage.getItem(STORAGE_KEY);

            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);

                if (Array.isArray(dados)) {
                    return dados;
                }
            }
        } catch (erro) {
            console.warn('Não foi possível carregar os agendamentos:', erro);
        }

        const dadosIniciais = criarAgendamentosDemonstracao();
        salvarAgendamentos(dadosIniciais);

        return dadosIniciais;
    }

    function persistirAgendamentos() {
        salvarAgendamentos(agendamentos);
    }

    function salvarAgendamentos(dados) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
        } catch (erro) {
            console.warn('Não foi possível salvar os agendamentos:', erro);
            exibirToast(
                'Não foi possível persistir os dados neste navegador.',
                'error'
            );
        }
    }

    function criarAgendamentosDemonstracao() {
        const hoje = formatarDataISO(new Date());

        return [
            {
                id: gerarId(),
                paciente: 'Mariana Oliveira',
                medicoId: '1',
                data: hoje,
                hora: '08:30',
                duracao: 30,
                tipo: 'presencial',
                convenio: 'unimed',
                status: 'confirmado',
                observacoes: '',
                lembrete: true,
                criadoEm: new Date().toISOString()
            },
            {
                id: gerarId(),
                paciente: 'João Pereira',
                medicoId: '2',
                data: hoje,
                hora: '09:00',
                duracao: 45,
                tipo: 'online',
                convenio: 'particular',
                status: 'agendado',
                observacoes: 'Paciente solicitou teleconsulta.',
                lembrete: true,
                criadoEm: new Date().toISOString()
            },
            {
                id: gerarId(),
                paciente: 'Fernanda Costa',
                medicoId: '3',
                data: hoje,
                hora: '10:30',
                duracao: 30,
                tipo: 'retorno',
                convenio: 'amil',
                status: 'espera',
                observacoes: '',
                lembrete: false,
                criadoEm: new Date().toISOString()
            }
        ];
    }

    /*
     * =========================================================
     * VALIDAÇÃO VISUAL
     * =========================================================
     */

    function marcarErro(campo, mensagem) {
        campo.classList.add('is-invalid');
        campo.setAttribute('aria-invalid', 'true');
        campo.setAttribute('title', mensagem);
    }

    function limparErrosFormulario() {
        document
            .querySelectorAll('.is-invalid')
            .forEach(campo => {
                campo.classList.remove('is-invalid');
                campo.removeAttribute('aria-invalid');
                campo.removeAttribute('title');
            });
    }

    /*
     * =========================================================
     * UTILITÁRIOS
     * =========================================================
     */

    function obterAgendamentoPorId(id) {
        return agendamentos.find(agendamento => agendamento.id === id);
    }

    function gerarId() {
        if (window.crypto?.randomUUID) {
            return crypto.randomUUID();
        }

        return `agendamento-${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}`;
    }

    function inicioDoDia(data) {
        const resultado = new Date(data);
        resultado.setHours(0, 0, 0, 0);
        return resultado;
    }

    function formatarDataISO(data) {
        const ano = data.getFullYear();
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const dia = String(data.getDate()).padStart(2, '0');

        return `${ano}-${mes}-${dia}`;
    }

    function dataStringParaDate(dataString) {
        const [ano, mes, dia] = dataString.split('-').map(Number);
        return new Date(ano, mes - 1, dia);
    }

    function formatarDataCurta(dataString) {
        return new Intl.DateTimeFormat('pt-BR').format(
            dataStringParaDate(dataString)
        );
    }

    function horaParaMinutos(hora) {
        if (!hora || !hora.includes(':')) return NaN;

        const [horas, minutos] = hora.split(':').map(Number);

        return (horas * 60) + minutos;
    }

    function minutosParaHora(minutos) {
        const horas = Math.floor(minutos / 60);
        const minutosRestantes = minutos % 60;

        return `${String(horas).padStart(2, '0')}:${String(
            minutosRestantes
        ).padStart(2, '0')}`;
    }

    function capitalizar(texto) {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    function escapeHTML(valor) {
        return String(valor ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
});
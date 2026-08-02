/**
 * ==========================================================
 * agenda.js - Módulo de Agenda G4med (ES6+ Modular)
 * ==========================================================
 */

(() => {
    'use strict';

    /* ==========================================================
       CONFIGURAÇÃO E ESTADO
       ========================================================== */
    const MEDICOS = [
        { id: 1, nome: 'Dr. Carlos Silva', especialidade: 'Cardiologia' },
        { id: 2, nome: 'Dra. Ana Paula', especialidade: 'Dermatologia' },
        { id: 3, nome: 'Dr. Roberto Lima', especialidade: 'Ortopedia' }
    ];

    const STATUS_CONFIG = {
        agendado: { label: 'Agendado', cor: '#3b82f6' },
        confirmado: { label: 'Confirmado', cor: '#10b981' },
        espera: { label: 'Em Espera', cor: '#f59e0b' },
        atendido: { label: 'Atendido', cor: '#8b5cf6' },
        cancelado: { label: 'Cancelado', cor: '#ef4444' },
        'nao-compareceu': { label: 'Não Compareceu', cor: '#6b7280' }
    };

    const TIPO_LABELS = {
        presencial: 'Presencial',
        online: 'Online',
        retorno: 'Retorno',
        procedimento: 'Procedimento'
    };

    const TIPO_ICONES = {
        presencial: 'fa-user',
        online: 'fa-video',
        retorno: 'fa-rotate-left',
        procedimento: 'fa-syringe'
    };

    const DIAS_SEMANA = [
        'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
        'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];

    const MESES = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Estado da aplicação
    let agendamentos = [
        { id: 101, paciente: 'João Pereira', medicoId: 1, data: '2026-06-23', hora: '08:00', duracao: 30, tipo: 'presencial', status: 'confirmado', convenio: 'Unimed', obs: '' },
        { id: 102, paciente: 'Maria Souza', medicoId: 2, data: '2026-06-23', hora: '08:30', duracao: 30, tipo: 'retorno', status: 'agendado', convenio: 'Particular', obs: '' },
        { id: 103, paciente: 'Pedro Oliveira', medicoId: 1, data: '2026-06-23', hora: '09:00', duracao: 60, tipo: 'procedimento', status: 'espera', convenio: 'SulAmérica', obs: '' },
        { id: 104, paciente: 'Ana Lima', medicoId: 3, data: '2026-06-23', hora: '09:30', duracao: 30, tipo: 'online', status: 'agendado', convenio: 'Bradesco', obs: '' },
        { id: 105, paciente: 'Carlos Mendes', medicoId: 2, data: '2026-06-23', hora: '10:00', duracao: 30, tipo: 'presencial', status: 'cancelado', convenio: 'Unimed', obs: '' },
        { id: 106, paciente: 'Fernanda Rocha', medicoId: 1, data: '2026-06-23', hora: '10:30', duracao: 30, tipo: 'retorno', status: 'atendido', convenio: 'Particular', obs: '' },
        { id: 107, paciente: 'Bruno Alves', medicoId: 3, data: '2026-06-23', hora: '11:00', duracao: 45, tipo: 'presencial', status: 'nao-compareceu', convenio: 'Unimed', obs: '' }
    ];

    let currentDate = new Date(2026, 5, 23);
    let selectedAg = null;
    let nextId = 108;

    /* ==========================================================
       UTILITÁRIOS
       ========================================================== */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const toISODate = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const formatDataExtenso = (d) =>
        `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;

    /* ==========================================================
       INICIALIZAÇÃO
       ========================================================== */
    function init() {
        // Define a data atual do sistema ao inicializar a aplicação pela primeira vez
        currentDate = new Date();

        bindEvents();
        renderAgenda();
    }

    /* ==========================================================
       EVENT LISTENERS
       ========================================================== */
    function bindEvents() {
        // Navegação de datas
        $('#btn-prev').addEventListener('click', () => navigateDate(-1));
        $('#btn-next').addEventListener('click', () => navigateDate(1));
        $('#btn-today').addEventListener('click', () => {
            currentDate = new Date();
            renderAgenda();
        });

        // Filtros
        $('#filter-medico').addEventListener('change', renderAgenda);
        $('#filter-especialidade').addEventListener('change', renderAgenda);

        // Modal Novo Agendamento
        $('#btn-novo-agendamento').addEventListener('click', () => openModal('modal-agendamento'));
        $('#modal-close').addEventListener('click', () => closeModal('modal-agendamento'));
        $('#btn-cancelar').addEventListener('click', () => closeModal('modal-agendamento'));
        $('#btn-gravar').addEventListener('click', gravarAgendamento);

        // Modal Ações
        $('#modal-acoes-close').addEventListener('click', () => closeModal('modal-acoes'));
        $$('.modal__acao').forEach(btn => {
            btn.addEventListener('click', () => executarAcao(btn.dataset.acao));
        });

        // Fechar modal ao clicar no overlay
        $$('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal__overlay')) closeModal(modal.id);
            });
        });

        // Tecla ESC fecha modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                $$('.modal[aria-hidden="false"]').forEach(m => closeModal(m.id));
            }
        });
    }

    /* ==========================================================
       NAVEGAÇÃO DE DATAS
       ========================================================== */
    function navigateDate(dir) {
        currentDate.setDate(currentDate.getDate() + dir);
        renderAgenda();
    }

    /* ==========================================================
       RENDERIZAÇÃO DA GRADE
       ========================================================== */
    function renderAgenda() {
        const dataStr = toISODate(currentDate);

        // 1 & 3 & 4. Formata e captura os elementos do HTML pelos IDs para inserir os valores atualizados
        const dateLabel = $('#current-date-label');
        const weekdayLabel = $('#current-weekday');

        if (dateLabel && weekdayLabel) {
            // Formata a data por extenso usando as configurações locais (Ex: "24 de junho de 2026")
            const opcoesData = { day: 'numeric', month: 'long', year: 'numeric' };
            let dataFormatada = currentDate.toLocaleDateString('pt-BR', opcoesData);

            // Capitaliza a primeira letra do mês
            dataFormatada = dataFormatada.replace(/de ([a-z])/i, (match, letra) => `de ${letra.toUpperCase()}`);

            // Formata o dia da semana (Ex: "quarta-feira")
            const opcoesSemana = { weekday: 'long' };
            let diaSemana = currentDate.toLocaleDateString('pt-BR', opcoesSemana);

            // Capitaliza a primeira letra do dia da semana (Ex: "Quarta-feira")
            diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);

            // 5. Insere os valores atualizados nos elementos HTML
            dateLabel.textContent = dataFormatada;
            weekdayLabel.textContent = diaSemana;
        }

        const medicosFiltrados = getMedicosFiltrados();
        const horarios = gerarHorarios();

        // Renderiza header
        const header = $('#agenda-header');
        header.innerHTML = `
      <div class="agenda__col-time">Horário</div>
      ${medicosFiltrados.map(m => `
        <div class="agenda__col-prof" data-medico="${m.id}">
          <span class="agenda__prof-nome">${m.nome}</span>
          <span class="agenda__prof-esp">${m.especialidade}</span>
        </div>
      `).join('')}
    `;
        header.style.gridTemplateColumns = `5rem repeat(${medicosFiltrados.length}, 1fr)`;

        // Renderiza body
        const body = $('#agenda-body');
        body.innerHTML = '';

        horarios.forEach(hora => {
            const row = document.createElement('div');
            row.className = 'agenda__row';
            row.style.gridTemplateColumns = `5rem repeat(${medicosFiltrados.length}, 1fr)`;

            let html = `<div class="agenda__slot-time">${hora}</div>`;

            medicosFiltrados.forEach(med => {
                const ag = agendamentos.find(a =>
                    a.medicoId === med.id && a.data === dataStr && a.hora === hora
                );

                if (ag) {
                    html += renderCard(ag);
                } else {
                    html += `
            <div class="agenda__slot-cell"
                 data-medico="${med.id}"
                 data-hora="${hora}"
                 ondrop="Agenda.drop(event)"
                 ondragover="Agenda.allowDrop(event)"
                 ondragleave="Agenda.leaveDrop(event)"></div>
          `;
                }
            });

            row.innerHTML = html;
            body.appendChild(row);
        });
    }

    function gerarHorarios() {
        const horarios = [];
        for (let h = 8; h < 18; h++) {
            horarios.push(`${String(h).padStart(2, '0')}:00`);
            horarios.push(`${String(h).padStart(2, '0')}:30`);
        }
        return horarios;
    }

    function getMedicosFiltrados() {
        const med = $('#filter-medico').value;
        const esp = $('#filter-especialidade').value;
        return MEDICOS.filter(m =>
            (!med || m.id == med) && (!esp || m.especialidade.toLowerCase().includes(esp))
        );
    }

    /* ==========================================================
       CARD DE AGENDAMENTO
       ========================================================== */
    function renderCard(ag) {
        const icone = TIPO_ICONES[ag.tipo] || 'fa-user';
        const tipoLbl = TIPO_LABELS[ag.tipo] || ag.tipo;
        const statusCls = `agenda__card--${ag.status}`;

        return `
      <div class="agenda__slot-cell">
        <article class="agenda__card ${statusCls}"
                 draggable="true"
                 data-id="${ag.id}"
                 onclick="Agenda.abrirAcoes(${ag.id})"
                 ondragstart="Agenda.drag(event)">
          <header class="agenda__card-paciente">
            <i class="fa-solid ${icone}"></i>
            ${ag.paciente}
          </header>
          <p class="agenda__card-info">${ag.convenio} · ${ag.duracao}min</p>
          <span class="agenda__card-badge agenda__card-badge--${ag.tipo}">${tipoLbl}</span>
        </article>
      </div>
    `;
    }

    /* ==========================================================
       DRAG & DROP
       ========================================================== */
    function allowDrop(ev) {
        ev.preventDefault();
        ev.currentTarget.classList.add('agenda__slot-cell--dragover');
    }

    function leaveDrop(ev) {
        ev.currentTarget.classList.remove('agenda__slot-cell--dragover');
    }

    function drag(ev) {
        ev.dataTransfer.setData('text/plain', ev.target.dataset.id);
        ev.dataTransfer.effectAllowed = 'move';
    }

    function drop(ev) {
        ev.preventDefault();
        ev.currentTarget.classList.remove('agenda__slot-cell--dragover');

        const id = parseInt(ev.dataTransfer.getData('text/plain'));
        const medicoId = parseInt(ev.currentTarget.dataset.medico);
        const hora = ev.currentTarget.dataset.hora;
        const dataStr = toISODate(currentDate);

        const ag = agendamentos.find(a => a.id === id);
        if (!ag) return;

        // Verifica conflito
        const conflito = agendamentos.find(a =>
            a.id !== id && a.medicoId === medicoId && a.data === dataStr && a.hora === hora
        );
        if (conflito) {
            showToast('Conflito de horário! O médico já possui agendamento neste horário.', 'error');
            return;
        }

        ag.medicoId = medicoId;
        ag.hora = hora;
        ag.data = dataStr;
        renderAgenda();
        showToast('Agendamento reagendado com sucesso!', 'success');
    }

    /* ==========================================================
       MODAIS
       ========================================================== */
    function openModal(id) {
        const modal = typeof id === 'string' ? $(`#${id}`) : id;
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Foco no primeiro input
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }

    function closeModal(id) {
        const modal = typeof id === 'string' ? $(`#${id}`) : id;
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    /* ==========================================================
       CRUD - GRAVAR
       ========================================================== */
    function gravarAgendamento() {
        const paciente = $('#paciente-nome').value.trim();
        const medicoId = parseInt($('#agendamento-medico').value);
        const data = $('#agendamento-data').value;
        const hora = $('#agendamento-hora').value;
        const duracao = parseInt($('#agendamento-duracao').value);
        const tipo = $('#agendamento-tipo').value;
        const convenio = $('#agendamento-convenio').value;
        const status = $('#agendamento-status').value;
        const obs = $('#agendamento-obs').value;
        const lembrete = $('#agendamento-lembrete').checked;
        const editId = parseInt($('#agendamento-id').value) || 0;

        // Validação
        if (!paciente || !medicoId || !data || !hora) {
            showToast('Preencha os campos obrigatórios (*)', 'error');
            return;
        }

        // Verifica conflito (exceto no próprio registro em edição)
        const conflito = agendamentos.find(a =>
            a.id !== editId && a.medicoId === medicoId && a.data === data && a.hora === hora
        );
        if (conflito) {
            showToast('Conflito: este horário já está ocupado para o médico selecionado.', 'error');
            return;
        }

        if (editId) {
            // Update
            const idx = agendamentos.findIndex(a => a.id === editId);
            if (idx > -1) {
                agendamentos[idx] = { ...agendamentos[idx], paciente, medicoId, data, hora, duracao, tipo, status, convenio, obs };
                showToast('Agendamento atualizado com sucesso!', 'success');
            }
        } else {
            // Create
            agendamentos.push({
                id: nextId++, paciente, medicoId, data, hora, duracao, tipo, status, convenio, obs
            });
            showToast('Agendamento gravado com sucesso!', 'success');
        }

        if (lembrete) {
            showToast(`Lembrete agendado para ${paciente} (48h e 2h antes)`, 'info');
        }

        closeModal('modal-agendamento');
        $('#form-agendamento').reset();
        $('#agendamento-id').value = '';
        $('#modal-titulo').innerHTML = '<i class="fa-solid fa-calendar-plus"></i> Novo Agendamento';
        renderAgenda();
    }

    /* ==========================================================
       AÇÕES DO AGENDAMENTO
       ========================================================== */
    function abrirAcoes(id) {
        selectedAg = agendamentos.find(a => a.id === id);
        if (!selectedAg) return;

        const ag = selectedAg;
        const med = MEDICOS.find(m => m.id === ag.medicoId);
        const cfg = STATUS_CONFIG[ag.status];

        $('#agendamento-detalhes').innerHTML = `
      <strong>${ag.paciente}</strong><br>
      ${med?.nome || ''} · ${ag.data} ${ag.hora}<br>
      ${cfg?.label || ag.status} · ${ag.convenio}
    `;

        openModal('modal-acoes');
    }

    function ejecutarAcao(acao) {
        if (!selectedAg) return;
        const ag = selectedAg;

        switch (acao) {
            case 'confirmar':
                ag.status = 'confirmado';
                showToast('Consulta confirmada!', 'success');
                break;
            case 'espera':
                ag.status = 'espera';
                showToast('Paciente movido para sala de espera.', 'info');
                break;
            case 'atender':
                ag.status = 'atendido';
                showToast('Atendimento registrado.', 'success');
                break;
            case 'teleconsulta':
                showToast('Iniciando teleconsulta...', 'info');
                window.open(`https://meet.example.com/${ag.id}`, '_blank');
                break;
            case 'prontuario':
                showToast('Abrindo prontuário do paciente...', 'info');
                break;
            case 'financeiro':
                showToast(
                    ag.convenio === 'Particular'
                        ? 'Pendência: Aguardando pagamento'
                        : 'Cobrança via convênio',
                    'info'
                );
                break;
            case 'editar':
                closeModal('modal-acoes');
                preencherFormEdicao(ag);
                openModal('modal-agendamento');
                return;
            case 'cancelar':
                if (confirm('Deseja realmente cancelar este agendamento?')) {
                    ag.status = 'cancelado';
                    showToast('Agendamento cancelado.', 'info');
                }
                break;
            case 'excluir':
                if (confirm('ATENÇÃO: Exclusão lógica (registro será marcado como inativo). Deseja continuar?')) {
                    ag.status = 'cancelado';
                    showToast('Registro inativado com sucesso.', 'success');
                }
                break;
        }

        closeModal('modal-acoes');
        renderAgenda();
    }

    function preencherFormEdicao(ag) {
        $('#agendamento-id').value = ag.id;
        $('#paciente-nome').value = ag.paciente;
        $('#agendamento-medico').value = ag.medicoId;
        $('#agendamento-data').value = ag.data;
        $('#agendamento-hora').value = ag.hora;
        $('#agendamento-duracao').value = ag.duracao;
        $('#agendamento-tipo').value = ag.tipo;
        $('#agendamento-convenio').value = ag.convenio;
        $('#agendamento-status').value = ag.status;
        $('#agendamento-obs').value = ag.obs || '';

        $('#modal-titulo').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Agendamento';
    }

    /* ==========================================================
       TOAST NOTIFICATIONS
       ========================================================== */
    function showToast(msg, type = 'info') {
        const container = $('#toast-container');
        const toast = document.createElement('div');

        const iconMap = {
            success: 'fa-circle-check',
            error: 'fa-circle-xmark',
            info: 'fa-circle-info'
        };

        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
      <i class="fa-solid ${iconMap[type] || 'fa-circle-info'}"></i>
      <span>${msg}</span>
    `;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    /* ==========================================================
       EXPOSIÇÃO PÚBLICA (para atributos inline onclick/ondrag)
       ========================================================== */
    window.Agenda = {
        allowDrop,
        leaveDrop,
        drag,
        drop,
        abrirAcoes
    };

    // Inicializa quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
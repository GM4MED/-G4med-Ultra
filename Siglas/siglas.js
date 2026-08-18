/* =============================================
   CADASTRO DE SIGLAS - G4MED
   JavaScript Funcional - Versão com Dropdown
   Design System: Shadcn/UI + teal-600
   ============================================= */

// =============================================
// ESTADO GLOBAL
// =============================================
let siglasData = [];
let filteredSiglas = [];
let siglaAtual = null;
let modoEdicao = false;
let siglaParaExcluir = null;
let currentTheme = 'light';

// Siglas pré-cadastradas para o dropdown
const siglasPreCadastradas = [
    { codigo: 'SUS', descricao: 'Sistema Único de Saúde' },
    { codigo: 'AMB', descricao: 'Associação Médica Brasileira' },
    { codigo: 'TCE', descricao: 'Termo de Consentimento Esclarecido' },
    { codigo: 'UTI', descricao: 'Unidade de Terapia Intensiva' },
    { codigo: 'PS', descricao: 'Pronto Socorro' },
    { codigo: 'CRM', descricao: 'Conselho Regional de Medicina' },
    { codigo: 'COREN', descricao: 'Conselho Regional de Enfermagem' },
    { codigo: 'ANVISA', descricao: 'Agência Nacional de Vigilância Sanitária' },
    { codigo: 'ANS', descricao: 'Agência Nacional de Saúde Suplementar' },
    { codigo: 'DATASUS', descricao: 'Departamento de Informática do SUS' },
    { codigo: 'SIA', descricao: 'Sistema de Informações Ambulatoriais' },
    { codigo: 'SIH', descricao: 'Sistema de Informações Hospitalares' },
    { codigo: 'SIM', descricao: 'Sistema de Informações sobre Mortalidade' },
    { codigo: 'SINASC', descricao: 'Sistema de Informações sobre Nascidos Vivos' },
    { codigo: 'PNI', descricao: 'Programa Nacional de Imunizações' },
    { codigo: 'SAE', descricao: 'Serviço de Atendimento Especializado' },
    { codigo: 'CTA', descricao: 'Centro de Testagem e Aconselhamento' },
    { codigo: 'UBS', descricao: 'Unidade Básica de Saúde' },
    { codigo: 'UPA', descricao: 'Unidade de Pronto Atendimento' },
    { codigo: 'SAMU', descricao: 'Serviço de Atendimento Móvel de Urgência' },
];

// Dados simulados (em produção, viriam do backend)
const mockSiglas = [
    { id: 'S-001', sigla: 'SUS', obs: 'Sistema Único de Saúde', status: 'ativo', criadoEm: '2026-08-15T10:00:00' },
    { id: 'S-002', sigla: 'AMB', obs: 'Associação Médica Brasileira', status: 'ativo', criadoEm: '2026-08-14T14:30:00' },
    { id: 'S-003', sigla: 'TCE', obs: 'Termo de Consentimento Esclarecido', status: 'ativo', criadoEm: '2026-08-13T09:15:00' },
    { id: 'S-004', sigla: 'UTI', obs: 'Unidade de Terapia Intensiva', status: 'ativo', criadoEm: '2026-08-12T16:45:00' },
    { id: 'S-005', sigla: 'PS', obs: 'Pronto Socorro', status: 'inativo', criadoEm: '2026-08-10T11:20:00' },
    { id: 'S-006', sigla: 'CRM', obs: 'Conselho Regional de Medicina', status: 'ativo', criadoEm: '2026-08-08T08:00:00' },
];

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar ícones Lucide
    lucide.createIcons();

    // Carregar dados
    siglasData = [...mockSiglas];
    filteredSiglas = [...siglasData];

    // Popular tabela
    renderTable();

    // Atualizar KPIs
    updateKPIs();

    // Gerar ID automático
    gerarIdAutomatico();

    // Configurar event listeners
    configurarEventListeners();

    // Atualizar footer
    updateFooter();

    // Inicializar toggle de status
    initStatusToggle();

    // Inicializar combobox de sigla
    initSiglaCombobox();

    console.log('Sistema de Cadastro de Siglas inicializado!');
});

// =============================================
// INICIALIZAR COMBOBOX / DROPDOWN SIGLA
// =============================================
function initSiglaCombobox() {
    const inputSigla = document.getElementById('sigla');
    const combobox = document.getElementById('siglaCombobox');
    const dropdown = document.getElementById('siglaDropdown');
    const trigger = combobox.querySelector('.combobox-trigger');
    const searchInput = document.getElementById('siglaSearch');
    const list = document.getElementById('siglaList');

    if (!inputSigla || !dropdown || !list) return;

    // Renderizar lista inicial
    renderSiglaList(siglasPreCadastradas);

    // Abrir/fechar dropdown ao clicar no trigger
    if (trigger) {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown();
        });
    }

    // Abrir dropdown ao clicar no input
    inputSigla.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDropdown();
    });

    // Filtrar lista ao digitar
    inputSigla.addEventListener('input', function (e) {
        const value = e.target.value.toUpperCase();
        filterSiglaList(value);

        // Validar campo
        validateSiglaField(value);
    });

    // Buscar no dropdown
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const value = e.target.value.toUpperCase();
            filterSiglaList(value);
        });
    }

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', function (e) {
        if (!combobox.contains(e.target)) {
            closeDropdown();
        }
    });

    // Fechar com ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    // Selecionar opção com Enter
    inputSigla.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const activeOption = list.querySelector('li.active');
            if (activeOption) {
                selectSiglaOption(activeOption.dataset.codigo);
            } else {
                closeDropdown();
            }
        }
    });

    // Navegação com setas
    inputSigla.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!dropdown.hidden) {
                highlightNextOption();
            } else {
                openDropdown();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightPrevOption();
        }
    });

    // Funções auxiliares
    function toggleDropdown() {
        if (dropdown.hidden) {
            openDropdown();
        } else {
            closeDropdown();
        }
    }

    function openDropdown() {
        dropdown.hidden = false;
        inputSigla.setAttribute('aria-expanded', 'true');
        searchInput.value = '';
        renderSiglaList(siglasPreCadastradas);

        // Focar no search
        setTimeout(() => searchInput.focus(), 100);
    }

    function closeDropdown() {
        dropdown.hidden = true;
        inputSigla.setAttribute('aria-expanded', 'false');
        inputSigla.focus();
    }

    function renderSiglaList(siglas) {
        list.innerHTML = '';

        if (siglas.length === 0) {
            list.innerHTML = `
                <li style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    <i data-lucide="inbox" style="width: 32px; height: 32px; margin: 0 auto 0.5rem; opacity: 0.5;"></i>
                    Nenhuma sigla encontrada
                </li>
            `;
            lucide.createIcons();
            return;
        }

        siglas.forEach(sigla => {
            const li = document.createElement('li');
            li.dataset.codigo = sigla.codigo;
            li.setAttribute('role', 'option');
            li.innerHTML = `
                <span class="sigla-code">${sigla.codigo}</span>
                <span class="sigla-desc">${sigla.descricao}</span>
            `;

            li.addEventListener('click', function () {
                selectSiglaOption(sigla.codigo);
            });

            li.addEventListener('mouseenter', function () {
                clearActiveOptions();
                this.classList.add('active');
            });

            list.appendChild(li);
        });

        lucide.createIcons();
    }

    function filterSiglaList(termo) {
        if (!termo) {
            renderSiglaList(siglasPreCadastradas);
            return;
        }

        const filtered = siglasPreCadastradas.filter(sigla =>
            sigla.codigo.includes(termo) ||
            sigla.descricao.toUpperCase().includes(termo)
        );

        renderSiglaList(filtered);
    }

    function selectSiglaOption(codigo) {
        inputSigla.value = codigo;
        validateSiglaField(codigo);
        closeDropdown();
    }

    function clearActiveOptions() {
        list.querySelectorAll('li.active').forEach(li => {
            li.classList.remove('active');
        });
    }

    function highlightNextOption() {
        const items = Array.from(list.querySelectorAll('li'));
        const activeIndex = items.findIndex(li => li.classList.contains('active'));
        const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;

        clearActiveOptions();
        items[nextIndex].classList.add('active');
        items[nextIndex].scrollIntoView({ block: 'nearest' });
    }

    function highlightPrevOption() {
        const items = Array.from(list.querySelectorAll('li'));
        const activeIndex = items.findIndex(li => li.classList.contains('active'));
        const prevIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;

        clearActiveOptions();
        items[prevIndex].classList.add('active');
        items[prevIndex].scrollIntoView({ block: 'nearest' });
    }
}

// =============================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// =============================================
function configurarEventListeners() {
    // Topbar
    const toggleTheme = document.getElementById('toggleTheme');
    if (toggleTheme) {
        toggleTheme.addEventListener('click', toggleThemeMode);
    }

    // Page actions
    const btnExport = document.getElementById('btnExport');
    const btnPrint = document.getElementById('btnPrint');

    if (btnExport) {
        btnExport.addEventListener('click', exportCSV);
    }

    if (btnPrint) {
        btnPrint.addEventListener('click', printPage);
    }

    // Form
    const siglaForm = document.getElementById('siglaForm');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnGravar = document.getElementById('btnGravar');
    const inputSigla = document.getElementById('sigla');
    const inputObs = document.getElementById('obs');

    if (siglaForm) {
        siglaForm.addEventListener('submit', function (e) {
            e.preventDefault();
            gravarSigla();
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarFormulario);
    }

    if (btnGravar) {
        btnGravar.addEventListener('click', gravarSigla);
    }

    // Campo Sigla - Validação em tempo real
    if (inputSigla) {
        // Converter para maiúsculas e validar caracteres
        inputSigla.addEventListener('input', function (e) {
            // Converter para maiúsculas
            let value = this.value.toUpperCase();

            // Remover caracteres especiais e espaços (apenas letras, números e underline)
            value = value.replace(/[^A-Z0-9_]/g, '');

            // Limitar a 20 caracteres
            if (value.length > 20) {
                value = value.substring(0, 20);
            }

            // Atualizar valor
            this.value = value;

            // Validar em tempo real
            validateSiglaField(value);
        });

        // Validar ao perder foco
        inputSigla.addEventListener('blur', function () {
            validateSiglaField(this.value);
        });
    }

    // Campo Observação - Contador de caracteres
    if (inputObs) {
        inputObs.addEventListener('input', updateObsCounter);
    }

    // Card actions
    const searchSigla = document.getElementById('searchSigla');
    const filtroStatus = document.getElementById('filtroStatus');

    if (searchSigla) {
        searchSigla.addEventListener('input', searchSiglas);
    }

    if (filtroStatus) {
        filtroStatus.addEventListener('change', filterByStatus);
    }

    // Modal Delete
    const delCancel = document.getElementById('delCancel');
    const delConfirm = document.getElementById('delConfirm');
    const delModal = document.getElementById('delModal');

    if (delCancel) {
        delCancel.addEventListener('click', closeDeleteModal);
    }

    if (delConfirm) {
        delConfirm.addEventListener('click', confirmDelete);
    }

    if (delModal) {
        delModal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeDeleteModal();
            }
        });
    }
}

// =============================================
// INICIALIZAR TOGGLE DE STATUS
// =============================================
function initStatusToggle() {
    const statusSelect = document.getElementById('status');
    if (!statusSelect) return;

    // Criar wrapper para o toggle
    const toggleWrapper = document.createElement('div');
    toggleWrapper.className = 'status-toggle-wrapper';
    toggleWrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.5rem;
    `;

    // Label "Ativo"
    const labelAtivo = document.createElement('span');
    labelAtivo.textContent = 'Ativo';
    labelAtivo.style.cssText = `
        font-size: 0.8125rem;
        font-weight: 500;
        color: ${statusSelect.value === 'ativo' ? '#10b981' : '#64748b'};
        transition: color 0.2s ease;
    `;
    labelAtivo.id = 'labelAtivo';

    // Toggle switch
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'status-toggle';
    toggle.setAttribute('aria-label', 'Alternar status');
    toggle.setAttribute('aria-pressed', statusSelect.value === 'ativo');
    toggle.style.cssText = `
        position: relative;
        width: 52px;
        height: 28px;
        border-radius: 14px;
        background: ${statusSelect.value === 'ativo' ? '#10b981' : '#ef4444'};
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
    `;
    toggle.id = 'statusToggle';

    // Knob do toggle
    const knob = document.createElement('span');
    knob.style.cssText = `
        position: absolute;
        top: 3px;
        left: ${statusSelect.value === 'ativo' ? '27px' : '3px'};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #ffffff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        transition: left 0.2s ease;
    `;
    knob.id = 'toggleKnob';

    toggle.appendChild(knob);

    // Label "Inativo"
    const labelInativo = document.createElement('span');
    labelInativo.textContent = 'Inativo';
    labelInativo.style.cssText = `
        font-size: 0.8125rem;
        font-weight: 500;
        color: ${statusSelect.value === 'inativo' ? '#ef4444' : '#64748b'};
        transition: color 0.2s ease;
    `;
    labelInativo.id = 'labelInativo';

    toggleWrapper.appendChild(labelAtivo);
    toggleWrapper.appendChild(toggle);
    toggleWrapper.appendChild(labelInativo);

    // Inserir após o select
    statusSelect.parentElement.appendChild(toggleWrapper);

    // Esconder o select original (mas manter para envio do form)
    statusSelect.style.display = 'none';

    // Event listener do toggle
    toggle.addEventListener('click', function () {
        const isAtivo = statusSelect.value === 'ativo';
        const newValue = isAtivo ? 'inativo' : 'ativo';

        // Atualizar select
        statusSelect.value = newValue;

        // Atualizar toggle visual
        const newKnobLeft = newValue === 'ativo' ? '27px' : '3px';
        const newBg = newValue === 'ativo' ? '#10b981' : '#ef4444';

        knob.style.left = newKnobLeft;
        toggle.style.background = newBg;
        toggle.setAttribute('aria-pressed', newValue === 'ativo');

        // Atualizar labels
        labelAtivo.style.color = newValue === 'ativo' ? '#10b981' : '#64748b';
        labelInativo.style.color = newValue === 'inativo' ? '#ef4444' : '#64748b';
    });
}

// =============================================
// VALIDAÇÃO DO CAMPO SIGLA
// =============================================
function validateSiglaField(value) {
    const inputSigla = document.getElementById('sigla');
    const inputWrap = inputSigla.closest('.input-wrap');

    // Remover estados anteriores
    inputWrap.classList.remove('error', 'success');

    // Validar
    if (!value || value.trim() === '') {
        // Campo vazio - remover todos os estados
        return;
    }

    if (value.length < 2) {
        // Muito curto
        inputWrap.classList.add('error');
        showFieldError(inputSigla, 'Sigla deve ter pelo menos 2 caracteres');
        return false;
    }

    if (value.length > 20) {
        // Muito longo (não deve acontecer devido ao limitador)
        inputWrap.classList.add('error');
        showFieldError(inputSigla, 'Sigla deve ter no máximo 20 caracteres');
        return false;
    }

    // Válido
    inputWrap.classList.add('success');
    clearFieldError(inputSigla);
    return true;
}

function showFieldError(input, message) {
    // Remover erro anterior se existir
    clearFieldError(input);

    // Criar elemento de erro
    const errorEl = document.createElement('small');
    errorEl.className = 'field-error';
    errorEl.style.cssText = `
        display: block;
        font-size: 0.75rem;
        color: #ef4444;
        margin-top: 0.375rem;
        animation: slideDown 0.2s ease;
    `;
    errorEl.textContent = message;
    errorEl.id = 'error-' + input.id;

    // Inserir após o input
    input.closest('.field').appendChild(errorEl);
}

function clearFieldError(input) {
    const existingError = document.getElementById('error-' + input.id);
    if (existingError) {
        existingError.remove();
    }
}

// =============================================
// FUNÇÕES DE TABELA
// =============================================
function renderTable() {
    const tbody = document.getElementById('corpoTabela');
    tbody.innerHTML = '';

    if (filteredSiglas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: #94a3b8;">
                    <i data-lucide="inbox" style="width: 48px; height: 48px; margin: 0 auto 1rem; display: block; opacity: 0.5;"></i>
                    Nenhum registro encontrado
                </td>
            </tr>
        `;
        lucide.createIcons();
        return;
    }

    filteredSiglas.forEach(sigla => {
        const tr = document.createElement('tr');
        tr.dataset.id = sigla.id;

        tr.innerHTML = `
            <td>${sigla.id}</td>
            <td><strong>${sigla.sigla}</strong></td>
            <td>${sigla.obs || '—'}</td>
            <td>
                <span class="status-badge ${sigla.status}">
                    <span class="status-dot"></span>
                    ${sigla.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>${formatDate(sigla.criadoEm)}</td>
            <td>
                <button class="action-btn" onclick="editSigla('${sigla.id}')" aria-label="Editar" title="Editar">
                    <i data-lucide="edit-2"></i>
                </button>
            </td>
        `;

        // Adicionar evento de clique na linha
        tr.addEventListener('click', function (e) {
            if (!e.target.closest('.action-btn')) {
                selectSigla(sigla.id);
            }
        });

        tbody.appendChild(tr);
    });

    lucide.createIcons();

    // Atualizar contador
    document.getElementById('showing').textContent = filteredSiglas.length;
    document.getElementById('totalRows').textContent = siglasData.length;
}

function selectSigla(siglaId) {
    // Remove active de todas as linhas
    const rows = document.querySelectorAll('#corpoTabela tr');
    rows.forEach(row => row.classList.remove('active'));

    // Adiciona active na linha selecionada
    const selectedRow = document.querySelector(`#corpoTabela tr[data-id="${siglaId}"]`);
    if (selectedRow) {
        selectedRow.classList.add('active');
    }

    // Carrega dados para edição
    editSigla(siglaId);
}

// =============================================
// FUNÇÕES DE FILTRO E BUSCA
// =============================================
function searchSiglas() {
    const termo = document.getElementById('searchSigla').value.toLowerCase();
    const filtroStatus = document.getElementById('filtroStatus').value;

    filteredSiglas = siglasData.filter(sigla => {
        const matchSearch = !termo ||
            sigla.sigla.toLowerCase().includes(termo) ||
            (sigla.obs && sigla.obs.toLowerCase().includes(termo));

        const matchStatus = !filtroStatus || sigla.status === filtroStatus;

        return matchSearch && matchStatus;
    });

    renderTable();
    updateKPIs();
}

function filterByStatus() {
    searchSiglas(); // Reutiliza a lógica de busca
}

// =============================================
// FUNÇÕES DE KPI
// =============================================
function updateKPIs() {
    const total = filteredSiglas.length;
    const ativas = filteredSiglas.filter(s => s.status === 'ativo').length;
    const inativas = filteredSiglas.filter(s => s.status === 'inativo').length;

    // Última edição (simulado)
    const ultimaEdicao = siglasData.length > 0 ?
        new Date(Math.max(...siglasData.map(s => new Date(s.criadoEm)))) : null;

    document.getElementById('kpiTotal').textContent = total;
    document.getElementById('kpiAtivas').textContent = ativas;
    document.getElementById('kpiInativas').textContent = inativas;
    document.getElementById('kpiLast').textContent = ultimaEdicao ?
        ultimaEdicao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—';
}

function updateFooter() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('lastSync').textContent = timeStr;
}

// =============================================
// FUNÇÕES DE FORMULÁRIO
// =============================================
function gerarIdAutomatico() {
    const proximoId = 'S-' + String(siglasData.length + 1).padStart(3, '0');
    document.getElementById('idSigla').value = proximoId;
}

function cancelarFormulario() {
    modoEdicao = false;
    siglaAtual = null;

    // Limpar formulário
    document.getElementById('siglaForm').reset();

    // Gerar novo ID
    gerarIdAutomatico();

    // Resetar toggle para "Ativo"
    const statusSelect = document.getElementById('status');
    statusSelect.value = 'ativo';

    // Atualizar toggle visual
    updateStatusToggleVisual('ativo');

    // Atualizar UI
    document.getElementById('formTitle').textContent = 'Nova Sigla';
    document.getElementById('formMode').innerHTML = 'Modo: <b>Inserção</b>';

    // Resetar contador de observação
    updateObsCounter();

    // Limpar validações
    clearAllValidations();
}

function clearAllValidations() {
    const inputs = document.querySelectorAll('#siglaForm input, #siglaForm textarea');
    inputs.forEach(input => {
        const inputWrap = input.closest('.input-wrap');
        if (inputWrap) {
            inputWrap.classList.remove('error', 'success');
        }
        clearFieldError(input);
    });
}

function editSigla(siglaId) {
    const sigla = siglasData.find(s => s.id === siglaId);
    if (!sigla) return;

    modoEdicao = true;
    siglaAtual = sigla;

    // Preencher formulário
    document.getElementById('idSigla').value = sigla.id;
    document.getElementById('sigla').value = sigla.sigla;
    document.getElementById('status').value = sigla.status;
    document.getElementById('obs').value = sigla.obs || '';

    // Atualizar toggle visual
    updateStatusToggleVisual(sigla.status);

    // Atualizar UI
    document.getElementById('formTitle').textContent = 'Editar Sigla';
    document.getElementById('formMode').innerHTML = 'Modo: <b>Edição</b>';

    // Atualizar contador de observação
    updateObsCounter();

    // Scroll para o formulário
    document.getElementById('formCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateStatusToggleVisual(status) {
    const toggle = document.getElementById('statusToggle');
    const knob = document.getElementById('toggleKnob');
    const labelAtivo = document.getElementById('labelAtivo');
    const labelInativo = document.getElementById('labelInativo');

    if (!toggle || !knob) return;

    const knobLeft = status === 'ativo' ? '27px' : '3px';
    const bg = status === 'ativo' ? '#10b981' : '#ef4444';

    knob.style.left = knobLeft;
    toggle.style.background = bg;
    toggle.setAttribute('aria-pressed', status === 'ativo');

    labelAtivo.style.color = status === 'ativo' ? '#10b981' : '#64748b';
    labelInativo.style.color = status === 'inativo' ? '#ef4444' : '#64748b';
}

function gravarSigla() {
    // Validar todos os campos
    const isValid = validateForm();

    if (!isValid) {
        showToast('Preencha os campos obrigatórios corretamente', 'error');
        return;
    }

    const siglaInput = document.getElementById('sigla').value.trim();
    const status = document.getElementById('status').value;
    const obs = document.getElementById('obs').value.trim();

    if (modoEdicao && siglaAtual) {
        // Atualizar sigla existente
        siglaAtual.sigla = siglaInput;
        siglaAtual.status = status;
        siglaAtual.obs = obs;

        showToast('Sigla atualizada com sucesso!', 'success');
    } else {
        // Criar nova sigla
        const novaSigla = {
            id: document.getElementById('idSigla').value,
            sigla: siglaInput,
            status: status,
            obs: obs,
            criadoEm: new Date().toISOString()
        };

        siglasData.push(novaSigla);
        showToast('Sigla criada com sucesso!', 'success');
    }

    // Atualizar tabela e KPIs
    filteredSiglas = [...siglasData];
    renderTable();
    updateKPIs();
    updateFooter();

    // Limpar formulário
    cancelarFormulario();
}

function validateForm() {
    const siglaInput = document.getElementById('sigla').value.trim();
    let isValid = true;

    // Validar sigla
    if (!siglaInput) {
        const inputSigla = document.getElementById('sigla');
        const inputWrap = inputSigla.closest('.input-wrap');
        inputWrap.classList.add('error');
        showFieldError(inputSigla, 'Sigla é obrigatória');
        isValid = false;
    } else if (siglaInput.length < 2) {
        const inputSigla = document.getElementById('sigla');
        const inputWrap = inputSigla.closest('.input-wrap');
        inputWrap.classList.add('error');
        showFieldError(inputSigla, 'Sigla deve ter pelo menos 2 caracteres');
        isValid = false;
    } else {
        const inputSigla = document.getElementById('sigla');
        const inputWrap = inputSigla.closest('.input-wrap');
        inputWrap.classList.remove('error');
        inputWrap.classList.add('success');
        clearFieldError(inputSigla);
    }

    return isValid;
}

function updateObsCounter() {
    const obs = document.getElementById('obs').value;
    const counter = document.getElementById('obsLen');
    counter.textContent = obs.length;

    if (obs.length > 500) {
        counter.style.color = '#ef4444';
        counter.style.fontWeight = '600';
    } else if (obs.length > 400) {
        counter.style.color = '#f59e0b';
        counter.style.fontWeight = '500';
    } else {
        counter.style.color = '#64748b';
        counter.style.fontWeight = '400';
    }
}

// =============================================
// FUNÇÕES DE MODAL (EXCLUSÃO)
// =============================================
function confirmDelete() {
    if (!siglaParaExcluir) return;

    // Remover sigla
    siglasData = siglasData.filter(s => s.id !== siglaParaExcluir.id);
    filteredSiglas = [...siglasData];

    // Atualizar tabela e KPIs
    renderTable();
    updateKPIs();
    updateFooter();

    // Fechar modal
    closeDeleteModal();

    showToast('Sigla excluída com sucesso!', 'success');
}

function closeDeleteModal() {
    document.getElementById('delModal').hidden = true;
    siglaParaExcluir = null;
}

// =============================================
// FUNÇÕES DE AÇÃO
// =============================================
function toggleThemeMode() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    const btn = document.getElementById('toggleTheme');

    if (currentTheme === 'dark') {
        btn.innerHTML = '<i data-lucide="sun"></i>';
        document.body.style.background = '#0f172a';
        document.body.style.color = '#f1f5f9';
        showToast('Tema escuro ativado', 'info');
    } else {
        btn.innerHTML = '<i data-lucide="moon"></i>';
        document.body.style.background = '#e6f7f5';
        document.body.style.color = '#1e293b';
        showToast('Tema claro ativado', 'info');
    }

    lucide.createIcons();
}

function exportCSV() {
    const headers = ['ID', 'Sigla', 'Observação', 'Status', 'Criado Em'];
    const rows = filteredSiglas.map(sigla => [
        sigla.id,
        sigla.sigla,
        sigla.obs || '',
        sigla.status,
        sigla.criadoEm
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'siglas_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();

    showToast('CSV exportado com sucesso!', 'success');
}

function printPage() {
    window.print();
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
}

function showToast(message, type = 'info') {
    const toastBox = document.getElementById('toastBox');
    const toast = document.createElement('div');
    toast.className = 'toast';

    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
    const color = type === 'success' ? 'ok' : type === 'error' ? 'danger' : 'info';

    toast.innerHTML = `
        <i data-lucide="${icon}" style="color: var(--${color})"></i>
        <span>${message}</span>
    `;

    toastBox.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 3000);
    }, 3000);
}

// Adicionar animação de slide down ao CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .input-wrap.error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .input-wrap.success {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
`;
document.head.appendChild(style);

// Exportar funções para escopo global
window.editSigla = editSigla;
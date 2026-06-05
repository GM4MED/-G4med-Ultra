/* ========================================= */
/* DADOS SIMULADOS - ATENDIMENTOS */
/* ========================================= */

let atendimentos = [
    {
        id: 1,
        paciente: 'João Silva',
        medico: 'Dr. Ricardo Silva',
        convenio: 'Unimed',
        horario: '09:00',
        status: 'Finalizado',
        data: '2024-01-15'
    },
    {
        id: 2,
        paciente: 'Maria Santos',
        medico: 'Dra. Ana Beatriz',
        convenio: 'Bradesco',
        horario: '10:30',
        status: 'Em Atendimento',
        data: '2024-01-15'
    },
    {
        id: 3,
        paciente: 'Pedro Oliveira',
        medico: 'Dr. Ricardo Silva',
        convenio: 'Particular',
        horario: '11:00',
        status: 'Aguardando',
        data: '2024-01-15'
    },
    {
        id: 4,
        paciente: 'Ana Costa',
        medico: 'Dra. Ana Beatriz',
        convenio: 'Unimed',
        horario: '14:00',
        status: 'Finalizado',
        data: '2024-01-15'
    },
    {
        id: 5,
        paciente: 'Carlos Mendes',
        medico: 'Dr. Ricardo Silva',
        convenio: 'Amil',
        horario: '15:30',
        status: 'Aguardando',
        data: '2024-01-15'
    }
];

/* ========================================= */
/* INICIALIZAÇÃO */
/* ========================================= */

document.addEventListener('DOMContentLoaded', function () {
    carregarAtendimentos();
    adicionarEventListeners();
});

/* ========================================= */
/* FUNÇÕES DE CARREGAMENTO E RENDERIZAÇÃO */
/* ========================================= */

/**
 * Carrega e renderiza os atendimentos na tabela
 */
function carregarAtendimentos() {
    const tbody = document.getElementById('tbodyAtendimento');
    tbody.innerHTML = '';

    atendimentos.forEach(atendimento => {
        const row = criarLinhaTabela(atendimento);
        tbody.appendChild(row);
    });
}

/**
 * Cria uma linha da tabela com os dados do atendimento
 */
function criarLinhaTabela(atendimento) {
    const tr = document.createElement('tr');

    const statusClass = atendimento.status.toLowerCase().replace(' ', '-');

    tr.innerHTML = `
        <td>${atendimento.paciente}</td>
        <td>${atendimento.medico}</td>
        <td>${atendimento.convenio}</td>
        <td>${atendimento.horario}</td>
        <td>
            <span class="status-badge ${statusClass}">
                ${atendimento.status}
            </span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-action edit" onclick="abrirModalVisualizar(${atendimento.id})" title="Visualizar">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit" onclick="abrirModalEditar(${atendimento.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" onclick="deletarAtendimento(${atendimento.id})" title="Deletar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return tr;
}

/* ========================================= */
/* FUNÇÕES DE MODAL - NOVO ATENDIMENTO */
/* ========================================= */

/**
 * Abre o modal de novo atendimento
 */
function abrirModalNovoAtendimento() {
    const modal = document.getElementById('modalNovoAtendimento');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Limpar formulário
    document.getElementById('formNovoAtendimento').reset();
}

/**
 * Fecha o modal de novo atendimento
 */
function fecharModalNovoAtendimento() {
    const modal = document.getElementById('modalNovoAtendimento');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

/**
 * Abre o modal de edição de atendimento
 */
function abrirModalEditar(id) {
    const atendimento = atendimentos.find(a => a.id === id);

    if (!atendimento) return;

    // Preencher formulário com dados do atendimento
    document.getElementById('paciente').value = atendimento.paciente;
    document.getElementById('medico').value = atendimento.medico;
    document.getElementById('convenio').value = atendimento.convenio;
    document.getElementById('horario').value = atendimento.horario;
    document.getElementById('status').value = atendimento.status;

    // Armazenar ID para atualização
    document.getElementById('formNovoAtendimento').dataset.editId = id;

    // Alterar título do modal
    const modalTitle = document.querySelector('#modalNovoAtendimento .modal-header h2');
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Atendimento';

    abrirModalNovoAtendimento();
}

/**
 * Fecha o modal de novo atendimento
 */
function fecharModalNovoAtendimento() {
    const modal = document.getElementById('modalNovoAtendimento');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';

    // Resetar título do modal
    const modalTitle = document.querySelector('#modalNovoAtendimento .modal-header h2');
    modalTitle.innerHTML = '<i class="fas fa-calendar-plus"></i> Novo Atendimento';

    // Limpar dataset
    delete document.getElementById('formNovoAtendimento').dataset.editId;
}

/* ========================================= */
/* FUNÇÕES DE MODAL - VISUALIZAÇÃO */
/* ========================================= */

/**
 * Abre o modal de visualização de atendimento
 */
function abrirModalVisualizar(id) {
    const atendimento = atendimentos.find(a => a.id === id);

    if (!atendimento) return;

    const conteudo = document.getElementById('conteudoVisualizacao');

    conteudo.innerHTML = `
        <div class="appointment-details">
            <div class="detail-row">
                <span class="detail-label">Paciente</span>
                <span class="detail-value">${atendimento.paciente}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Médico</span>
                <span class="detail-value">${atendimento.medico}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Convênio</span>
                <span class="detail-value">${atendimento.convenio}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Data</span>
                <span class="detail-value">${formatarData(atendimento.data)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Horário</span>
                <span class="detail-value">${atendimento.horario}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">
                    <span class="status-badge ${atendimento.status.toLowerCase().replace(' ', '-')}">
                        ${atendimento.status}
                    </span>
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">ID</span>
                <span class="detail-value">#${String(atendimento.id).padStart(4, '0')}</span>
            </div>
        </div>
    `;

    const modal = document.getElementById('modalVisualizar');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha o modal de visualização
 */
function fecharModalVisualizar() {
    const modal = document.getElementById('modalVisualizar');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

/* ========================================= */
/* FUNÇÕES DE FORMULÁRIO */
/* ========================================= */

/**
 * Salva um novo atendimento ou atualiza um existente
 */
function salvarAtendimento(event) {
    event.preventDefault();

    const form = event.target;
    const editId = form.dataset.editId;

    const dados = {
        paciente: document.getElementById('paciente').value,
        medico: document.getElementById('medico').value,
        convenio: document.getElementById('convenio').value,
        horario: document.getElementById('horario').value,
        status: document.getElementById('status').value,
        data: new Date().toISOString().split('T')[0]
    };

    if (editId) {
        // Atualizar atendimento existente
        const atendimento = atendimentos.find(a => a.id === parseInt(editId));
        if (atendimento) {
            Object.assign(atendimento, dados);
            mostrarNotificacao('Atendimento atualizado com sucesso!', 'success');
        }
    } else {
        // Criar novo atendimento
        const novoAtendimento = {
            id: Math.max(...atendimentos.map(a => a.id), 0) + 1,
            ...dados
        };
        atendimentos.push(novoAtendimento);
        mostrarNotificacao('Atendimento criado com sucesso!', 'success');
    }

    carregarAtendimentos();
    fecharModalNovoAtendimento();
}

/**
 * Deleta um atendimento
 */
function deletarAtendimento(id) {
    if (confirm('Tem certeza que deseja deletar este atendimento?')) {
        atendimentos = atendimentos.filter(a => a.id !== id);
        carregarAtendimentos();
        mostrarNotificacao('Atendimento deletado com sucesso!', 'success');
    }
}

/* ========================================= */
/* FUNÇÕES DE FILTRO E BUSCA */
/* ========================================= */

/**
 * Filtra atendimentos por status
 */
function filtrarPorStatus(status) {
    const tbody = document.getElementById('tbodyAtendimento');
    tbody.innerHTML = '';

    const atendimentosFiltrados = status === ''
        ? atendimentos
        : atendimentos.filter(a => a.status === status);

    atendimentosFiltrados.forEach(atendimento => {
        const row = criarLinhaTabela(atendimento);
        tbody.appendChild(row);
    });
}

/**
 * Busca atendimentos por nome do paciente
 */
function buscarPaciente(termo) {
    const tbody = document.getElementById('tbodyAtendimento');
    tbody.innerHTML = '';

    const termoLower = termo.toLowerCase();
    const atendimentosFiltrados = atendimentos.filter(a =>
        a.paciente.toLowerCase().includes(termoLower)
    );

    if (atendimentosFiltrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhum paciente encontrado</td></tr>';
    } else {
        atendimentosFiltrados.forEach(atendimento => {
            const row = criarLinhaTabela(atendimento);
            tbody.appendChild(row);
        });
    }
}

/* ========================================= */
/* FUNÇÕES DE UTILIDADE */
/* ========================================= */

/**
 * Formata data para formato legível
 */
function formatarData(data) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', locale: 'pt-BR' };
    return new Date(data).toLocaleDateString('pt-BR', options);
}

/**
 * Mostra uma notificação temporária
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.textContent = mensagem;

    // Adicionar estilos inline (caso não estejam no CSS)
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        background-color: ${tipo === 'success' ? '#28a745' : '#0066cc'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;

    document.body.appendChild(notificacao);

    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

/**
 * Volta para a página anterior
 */
function voltarPagina() {
    window.history.back();
}

/**
 * Faz logout do sistema
 */
function fazerLogout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        // Simular logout (em produção, fazer requisição ao servidor)
        alert('Você foi desconectado com sucesso!');
        // window.location.href = '/login'; // Redirecionar para página de login
    }
}

/* ========================================= */
/* EVENT LISTENERS */
/* ========================================= */

/**
 * Adiciona event listeners aos elementos da página
 */
function adicionarEventListeners() {
    // Botão de voltar
    const btnVoltar = document.getElementById('btnVoltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', voltarPagina);
    }

    // Botão de novo atendimento
    const btnNovoAtendimento = document.getElementById('btnNovoAtendimento');
    if (btnNovoAtendimento) {
        btnNovoAtendimento.addEventListener('click', abrirModalNovoAtendimento);
    }

    // Botão de logout
    const btnSair = document.getElementById('btnSair');
    if (btnSair) {
        btnSair.addEventListener('click', fazerLogout);
    }

    // Formulário de novo atendimento
    const formNovoAtendimento = document.getElementById('formNovoAtendimento');
    if (formNovoAtendimento) {
        formNovoAtendimento.addEventListener('submit', salvarAtendimento);
    }

    // Campo de busca
    const searchPaciente = document.getElementById('searchPaciente');
    if (searchPaciente) {
        searchPaciente.addEventListener('input', (e) => {
            buscarPaciente(e.target.value);
        });
    }

    // Filtro de status
    const filtroStatus = document.getElementById('filtroStatus');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', (e) => {
            filtrarPorStatus(e.target.value);
        });
    }

    // Fechar modal ao clicar fora
    const modalNovoAtendimento = document.getElementById('modalNovoAtendimento');
    if (modalNovoAtendimento) {
        modalNovoAtendimento.addEventListener('click', (e) => {
            if (e.target === modalNovoAtendimento) {
                fecharModalNovoAtendimento();
            }
        });
    }

    const modalVisualizar = document.getElementById('modalVisualizar');
    if (modalVisualizar) {
        modalVisualizar.addEventListener('click', (e) => {
            if (e.target === modalVisualizar) {
                fecharModalVisualizar();
            }
        });
    }

    // Fechar modal com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModalNovoAtendimento();
            fecharModalVisualizar();
        }
    });
}

/* ========================================= */
/* ANIMAÇÕES CSS ADICIONAIS */
/* ========================================= */

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
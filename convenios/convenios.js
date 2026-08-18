/* =============================================
   CADASTRO DE CONVÊNIOS - SISTEMA GM4
   JavaScript Funcional
   Integração: HTML + CSS (Shadcn/UI + teal-600)
   ============================================= */

// =============================================
// ESTADO GLOBAL
// =============================================
let convenioAtual = null;
let modoEdicao = false;
let indiceAtual = -1;

// Dados simulados (em produção, viriam do backend)
let conveniosCadastrados = [
    { id: '001', razaoSocial: 'UNIMED GOIÂNIA COOPERATIVA DE TRABALHO MÉDICO', nomeFantasia: 'UNIMED GOIÂNIA', cnpj: '12.345.678/0001-90', ans: '123456-0', tabela: 'TUSS', status: 'A' },
    { id: '002', razaoSocial: 'BRADESCO SAÚDE S/A', nomeFantasia: 'BRADESCO SAÚDE', cnpj: '23.456.789/0001-12', ans: '234567-1', tabela: 'CBHPM', status: 'A' },
    { id: '003', razaoSocial: 'AMIL ASSISTÊNCIA MÉDICA INTERNACIONAL S/A', nomeFantasia: 'AMIL', cnpj: '34.567.890/0001-34', ans: '345678-2', tabela: 'PROPRIA', status: 'A' },
    { id: '004', razaoSocial: 'SUL AMÉRICA COMPANHIA DE SEGURO SAÚDE', nomeFantasia: 'SUL AMÉRICA', cnpj: '45.678.901/0001-56', ans: '456789-3', tabela: 'TUSS', status: 'A' },
    { id: '005', razaoSocial: 'NOTREDAME INTERMÉDICA DE ASSISTÊNCIA À SAÚDE S/S LTDA', nomeFantasia: 'NOTREDAME', cnpj: '56.789.012/0001-78', ans: '567890-4', tabela: 'PROPRIA', status: 'I' },
];

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    // Popular tabela inicial
    popularTabela(conveniosCadastrados);

    // Configurar event listeners dos botões
    configurarBotoes();

    // Configurar busca
    configurarBusca();

    // Configurar formulário
    configurarFormulario();

    // Gerar ID automático
    gerarIdAutomatico();

    console.log('Sistema de Gestão de Convênios inicializado com sucesso!');
});

// =============================================
// FUNÇÃO DE ABAS (openTab)
// =============================================
function openTab(evt, tabName) {
    // Esconde todas as abas
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    // Remove a classe active de todos os botões
    const tabLinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove("active");
    }

    // Mostra a aba atual e adiciona a classe active ao botão clicado
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// =============================================
// CONFIGURAÇÃO DOS BOTÕES
// =============================================
function configurarBotoes() {
    // Botão Novo
    document.getElementById('btnNovo').addEventListener('click', function () {
        novoConvenio();
    });

    // Botão Salvar
    document.getElementById('btnSalvar').addEventListener('click', function () {
        salvarConvenio();
    });

    // Botão Editar
    document.getElementById('btnEditar').addEventListener('click', function () {
        editarConvenio();
    });

    // Botão Excluir
    document.getElementById('btnExcluir').addEventListener('click', function () {
        excluirConvenio();
    });
}

// =============================================
// CONFIGURAÇÃO DA BUSCA
// =============================================
function configurarBusca() {
    const inputBusca = document.getElementById('inputBusca');
    const btnBusca = document.querySelector('.btn-search-icon');

    // Busca ao clicar no botão
    btnBusca.addEventListener('click', function () {
        realizarBusca(inputBusca.value);
    });

    // Busca ao pressionar Enter
    inputBusca.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            realizarBusca(inputBusca.value);
        }
    });

    // Busca em tempo real
    inputBusca.addEventListener('input', function () {
        realizarBusca(inputBusca.value);
    });
}

// =============================================
// CONFIGURAÇÃO DO FORMULÁRIO
// =============================================
function configurarFormulario() {
    const form = document.getElementById('convenioForm');

    // Prevenir submit padrão
    form.addEventListener('submit', function (e) {
        e.preventDefault();
    });

    // Validação em tempo real
    const camposObrigatorios = form.querySelectorAll('[required]');
    camposObrigatorios.forEach(campo => {
        campo.addEventListener('blur', function () {
            validarCampo(this);
        });
    });
}

// =============================================
// FUNÇÕES DA TABELA
// =============================================
function popularTabela(dados) {
    const tbody = document.getElementById('corpoTabelaConvenios');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    Nenhum convênio cadastrado
                </td>
            </tr>
        `;
        return;
    }

    dados.forEach((convenio, index) => {
        const tr = document.createElement('tr');
        tr.dataset.index = index;
        tr.dataset.id = convenio.id;

        tr.innerHTML = `
            <td>${convenio.id}</td>
            <td>${convenio.nomeFantasia}</td>
            <td>${convenio.cnpj}</td>
            <td>${convenio.ans}</td>
            <td>${convenio.tabela}</td>
            <td><span class="status-badge ${convenio.status === 'A' ? 'status-ativo' : 'status-inativo'}">${convenio.status === 'A' ? 'Ativo' : 'Inativo'}</span></td>
        `;

        tbody.appendChild(tr);
    });

    // Adicionar interatividade nas linhas
    adicionarInteratividadeTabela();
}

function adicionarInteratividadeTabela() {
    const tbody = document.getElementById('corpoTabelaConvenios');
    const linhas = tbody.querySelectorAll('tr');

    linhas.forEach(linha => {
        linha.addEventListener('click', function (e) {
            // Ignorar cliques em badges
            if (e.target.classList.contains('status-badge')) {
                return;
            }

            // Remove active de todas as linhas
            linhas.forEach(l => l.classList.remove('active'));

            // Adiciona active na linha clicada
            this.classList.add('active');

            // Carregar dados no formulário
            const index = parseInt(this.dataset.index);
            carregarConvenioNoFormulario(conveniosCadastrados[index]);

            // Atualizar estado global
            indiceAtual = index;
            convenioAtual = conveniosCadastrados[index];

            // Habilitar botões
            document.getElementById('btnEditar').disabled = false;
            document.getElementById('btnExcluir').disabled = false;
        });
    });
}

// =============================================
// FUNÇÕES DE CRUD
// =============================================
function novoConvenio() {
    // Limpar formulário
    limparFormulario();

    // Gerar novo ID
    gerarIdAutomatico();

    // Habilitar campos
    habilitarCamposFormulario(true);

    // Focar no campo razão social
    document.getElementById('razaoSocial').focus();

    // Atualizar estado
    modoEdicao = false;
    convenioAtual = null;
    indiceAtual = -1;

    // Habilitar botão salvar
    document.getElementById('btnSalvar').disabled = false;

    // Desabilitar outros botões
    document.getElementById('btnEditar').disabled = true;
    document.getElementById('btnExcluir').disabled = true;

    // Remover seleção da tabela
    const linhasAtivas = document.querySelectorAll('tr.active');
    linhasAtivas.forEach(linha => linha.classList.remove('active'));
}

function salvarConvenio() {
    // Validar formulário
    if (!validarFormulario()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Coletar dados do formulário
    const novoConvenio = coletarDadosFormulario();

    if (modoEdicao && convenioAtual) {
        // Atualizar convênio existente
        const index = conveniosCadastrados.findIndex(c => c.id === convenioAtual.id);
        if (index !== -1) {
            conveniosCadastrados[index] = novoConvenio;
            console.log('Convênio atualizado:', novoConvenio.id);
        }
    } else {
        // Adicionar novo convênio
        conveniosCadastrados.push(novoConvenio);
        console.log('Novo convênio cadastrado:', novoConvenio.id);
    }

    // Atualizar tabela
    popularTabela(conveniosCadastrados);

    // Limpar formulário
    limparFormulario();
    habilitarCamposFormulario(false);

    // Desabilitar botões
    document.getElementById('btnSalvar').disabled = true;
    document.getElementById('btnEditar').disabled = true;
    document.getElementById('btnExcluir').disabled = true;

    // Resetar estado
    modoEdicao = false;
    convenioAtual = null;
    indiceAtual = -1;

    alert('Convênio salvo com sucesso!');
}

function editarConvenio() {
    if (!convenioAtual) {
        alert('Selecione um convênio para editar.');
        return;
    }

    // Habilitar campos
    habilitarCamposFormulario(true);

    // Focar no primeiro campo
    document.getElementById('razaoSocial').focus();

    // Atualizar estado
    modoEdicao = true;

    // Habilitar botão salvar
    document.getElementById('btnSalvar').disabled = false;
    document.getElementById('btnEditar').disabled = true;
}

function excluirConvenio() {
    if (!convenioAtual) {
        alert('Selecione um convênio para excluir.');
        return;
    }

    // Confirmar exclusão
    const confirmado = confirm(`Deseja realmente excluir o convênio "${convenioAtual.nomeFantasia}"?`);

    if (confirmado) {
        // Remover do array
        const index = conveniosCadastrados.findIndex(c => c.id === convenioAtual.id);
        if (index !== -1) {
            conveniosCadastrados.splice(index, 1);
        }

        // Atualizar tabela
        popularTabela(conveniosCadastrados);

        // Limpar formulário
        limparFormulario();
        habilitarCamposFormulario(false);

        // Desabilitar botões
        document.getElementById('btnSalvar').disabled = true;
        document.getElementById('btnEditar').disabled = true;
        document.getElementById('btnExcluir').disabled = true;

        // Resetar estado
        modoEdicao = false;
        convenioAtual = null;
        indiceAtual = -1;

        alert('Convênio excluído com sucesso!');
    }
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================
function gerarIdAutomatico() {
    const proximoId = String(conveniosCadastrados.length + 1).padStart(3, '0');
    document.getElementById('convenioId').value = proximoId;
}

function limparFormulario() {
    const form = document.getElementById('convenioForm');
    form.reset();

    // Limpar valores manualmente
    document.getElementById('convenioId').value = '';
    document.getElementById('razaoSocial').value = '';
    document.getElementById('nomeFantasia').value = '';
    document.getElementById('cnpj').value = '';
    document.getElementById('registroAns').value = '';
    document.getElementById('status').value = 'A';
    document.getElementById('urlPortal').value = '';
    document.getElementById('tabelaHonorarios').value = 'TUSS';
    document.getElementById('prazoPagamento').value = '30';
    document.getElementById('taxaAdm').value = '';
    document.getElementById('obsFaturamento').value = '';
    document.getElementById('emailFat').value = '';
    document.getElementById('telSuporte').value = '';
}

function habilitarCamposFormulario(habilitado) {
    const campos = document.querySelectorAll('#convenioForm input:not([readonly]), #convenioForm select, #convenioForm textarea');
    campos.forEach(campo => {
        campo.disabled = !habilitado;
    });
}

function carregarConvenioNoFormulario(convenio) {
    document.getElementById('convenioId').value = convenio.id;
    document.getElementById('razaoSocial').value = convenio.razaoSocial;
    document.getElementById('nomeFantasia').value = convenio.nomeFantasia;
    document.getElementById('cnpj').value = convenio.cnpj;
    document.getElementById('registroAns').value = convenio.ans;
    document.getElementById('status').value = convenio.status;
    document.getElementById('tabelaHonorarios').value = convenio.tabela;

    // Campos simulados
    document.getElementById('urlPortal').value = 'https://portal.unimed.com.br';
    document.getElementById('prazoPagamento').value = '30';
    document.getElementById('taxaAdm').value = '5,00%';
    document.getElementById('obsFaturamento').value = 'Exige guia TISS para todos os procedimentos.';
    document.getElementById('emailFat').value = 'faturamento@unimed.com.br';
    document.getElementById('telSuporte').value = '(62) 3456-7890';
}

function coletarDadosFormulario() {
    return {
        id: document.getElementById('convenioId').value,
        razaoSocial: document.getElementById('razaoSocial').value.toUpperCase(),
        nomeFantasia: document.getElementById('nomeFantasia').value.toUpperCase(),
        cnpj: document.getElementById('cnpj').value,
        ans: document.getElementById('registroAns').value,
        tabela: document.getElementById('tabelaHonorarios').value,
        status: document.getElementById('status').value
    };
}

function validarFormulario() {
    const razaoSocial = document.getElementById('razaoSocial').value.trim();
    const nomeFantasia = document.getElementById('nomeFantasia').value.trim();

    if (!razaoSocial || !nomeFantasia) {
        return false;
    }

    return true;
}

function validarCampo(campo) {
    if (campo.hasAttribute('required') && !campo.value.trim()) {
        campo.style.borderColor = '#ef4444';
        campo.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        return false;
    } else {
        campo.style.borderColor = '#e2e8f0';
        campo.style.boxShadow = 'none';
        return true;
    }
}

function realizarBusca(termo) {
    const termoNormalizado = termo.toLowerCase().trim();

    if (!termoNormalizado) {
        popularTabela(conveniosCadastrados);
        return;
    }

    const resultados = conveniosCadastrados.filter(convenio => {
        return convenio.nomeFantasia.toLowerCase().includes(termoNormalizado) ||
            convenio.razaoSocial.toLowerCase().includes(termoNormalizado) ||
            convenio.cnpj.includes(termoNormalizado);
    });

    popularTabela(resultados);
}

// Exportar função openTab para escopo global
window.openTab = openTab;
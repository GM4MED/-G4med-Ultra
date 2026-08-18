/* =============================================
   CADASTRO DE EXAMES - SISTEMA GM4
   JavaScript Funcional
   Integração: HTML + CSS3 (Shadcn/UI + teal-600)
   ============================================= */

// =============================================
// ESTADO GLOBAL
// =============================================
let exameAtual = null;
let modoEdicao = false;
let indiceAtual = -1;

// Dados simulados (em produção, viriam do backend)
let examesCadastrados = [
    { id: '001', nome: 'HEMOGRAMA COMPLETO', categoria: '02', categoriaNome: '02 - Laboratório / Análises Clínicas', tipo: '01', tipoNome: '01 - Laboratorial', valorParticular: '45,00', valorConvenio: '40,00', custoInterno: '25,00', status: 'A' },
    { id: '002', nome: 'RAIO-X DE TÓRAX', categoria: '03', categoriaNome: '03 - Diagnóstico por Imagem', tipo: '02', tipoNome: '02 - Imagem', valorParticular: '120,00', valorConvenio: '100,00', custoInterno: '60,00', status: 'A' },
    { id: '003', nome: 'ULTRASSOM ABDOMINAL', categoria: '04', categoriaNome: '04 - Ultrassonografia', tipo: '03', tipoNome: '03 - Ultrassonografia', valorParticular: '250,00', valorConvenio: '220,00', custoInterno: '150,00', status: 'A' },
    { id: '004', nome: 'ELETROCARDIOGRAMA', categoria: '01', categoriaNome: '01 - Cardiologia', tipo: '04', tipoNome: '04 - Cardiológico', valorParticular: '80,00', valorConvenio: '70,00', custoInterno: '40,00', status: 'A' },
    { id: '005', nome: 'ECO DOPPLER VASCULAR', categoria: '05', categoriaNome: '05 - Vascular', tipo: '05', tipoNome: '05 - Vascular', valorParticular: '350,00', valorConvenio: '300,00', custoInterno: '200,00', status: 'I' },
    { id: '006', nome: 'TOMOGRAFIA COMPUTADORIZADA', categoria: '03', categoriaNome: '03 - Diagnóstico por Imagem', tipo: '02', tipoNome: '02 - Imagem', valorParticular: '450,00', valorConvenio: '400,00', custoInterno: '280,00', status: 'A' },
    { id: '007', nome: 'RESONÂNCIA MAGNÉTICA', categoria: '03', categoriaNome: '03 - Diagnóstico por Imagem', tipo: '02', tipoNome: '02 - Imagem', valorParticular: '800,00', valorConvenio: '700,00', custoInterno: '500,00', status: 'A' },
    { id: '008', nome: 'ENDOSCOPIA DIGESTIVA', categoria: '10', categoriaNome: '10 - Endoscopia', tipo: '06', tipoNome: '06 - Endoscópico', valorParticular: '550,00', valorConvenio: '480,00', custoInterno: '320,00', status: 'A' },
];

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', function () {
    // Popular tabela inicial
    popularTabela(examesCadastrados);

    // Configurar event listeners dos botões
    configurarBotoes();

    // Configurar busca
    configurarBusca();

    // Configurar formulário
    configurarFormulario();

    // Gerar ID automático
    gerarIdAutomatico();

    console.log('Sistema de Cadastro de Exames inicializado com sucesso!');
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
        novoExame();
    });

    // Botão Salvar
    document.getElementById('btnSalvar').addEventListener('click', function () {
        salvarExame();
    });

    // Botão Editar
    document.getElementById('btnEditar').addEventListener('click', function () {
        editarExame();
    });

    // Botão Excluir
    document.getElementById('btnExcluir').addEventListener('click', function () {
        excluirExame();
    });

    // Botão Anterior
    document.getElementById('btnAnterior').addEventListener('click', function () {
        navegarRegistro(-1);
    });

    // Botão Próximo
    document.getElementById('btnProximo').addEventListener('click', function () {
        navegarRegistro(1);
    });
}

// =============================================
// CONFIGURAÇÃO DA BUSCA
// =============================================
function configurarBusca() {
    const inputBusca = document.getElementById('inputBusca');
    const btnBusca = inputBusca.nextElementSibling;

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

    // Busca em tempo real (opcional)
    inputBusca.addEventListener('input', function () {
        realizarBusca(inputBusca.value);
    });
}

// =============================================
// CONFIGURAÇÃO DO FORMULÁRIO
// =============================================
function configurarFormulario() {
    const form = document.getElementById('exameForm');

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
    const tbody = document.getElementById('corpoTabelaExames');
    tbody.innerHTML = '';

    if (dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                    Nenhum exame cadastrado
                </td>
            </tr>
        `;
        return;
    }

    dados.forEach((exame, index) => {
        const tr = document.createElement('tr');
        tr.dataset.index = index;
        tr.dataset.id = exame.id;

        tr.innerHTML = `
            <td>${exame.id}</td>
            <td>${exame.nome}</td>
            <td>${exame.categoriaNome}</td>
            <td>${exame.tipoNome}</td>
            <td>R$ ${exame.valorParticular}</td>
            <td><span class="status-badge ${exame.status === 'A' ? 'status-ativo' : 'status-inativo'}">${exame.status === 'A' ? 'Ativo' : 'Inativo'}</span></td>
        `;

        tbody.appendChild(tr);
    });

    // Adicionar event listeners nas linhas
    adicionarInteratividadeTabela();
}

function adicionarInteratividadeTabela() {
    const tbody = document.getElementById('corpoTabelaExames');
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
            carregarExameNoFormulario(examesCadastrados[index]);

            // Atualizar estado global
            indiceAtual = index;
            exameAtual = examesCadastrados[index];

            // Habilitar botões
            habilitarBotoesNavegacao(true);
            document.getElementById('btnEditar').disabled = false;
            document.getElementById('btnExcluir').disabled = false;
        });
    });
}

// =============================================
// FUNÇÕES DE CRUD
// =============================================
function novoExame() {
    // Limpar formulário
    limparFormulario();

    // Gerar novo ID
    gerarIdAutomatico();

    // Habilitar campos
    habilitarCamposFormulario(true);

    // Focar no campo nome
    document.getElementById('nomeExame').focus();

    // Atualizar estado
    modoEdicao = false;
    exameAtual = null;
    indiceAtual = -1;

    // Habilitar botão salvar
    document.getElementById('btnSalvar').disabled = false;

    // Desabilitar outros botões
    document.getElementById('btnEditar').disabled = true;
    document.getElementById('btnExcluir').disabled = true;
    habilitarBotoesNavegacao(false);

    // Remover seleção da tabela
    const linhasAtivas = document.querySelectorAll('tr.active');
    linhasAtivas.forEach(linha => linha.classList.remove('active'));
}

function salvarExame() {
    // Validar formulário
    if (!validarFormulario()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Coletar dados do formulário
    const novoExame = coletarDadosFormulario();

    if (modoEdicao && exameAtual) {
        // Atualizar exame existente
        const index = examesCadastrados.findIndex(e => e.id === exameAtual.id);
        if (index !== -1) {
            examesCadastrados[index] = novoExame;
            console.log('Exame atualizado:', novoExame.id);
        }
    } else {
        // Adicionar novo exame
        examesCadastrados.push(novoExame);
        console.log('Novo exame cadastrado:', novoExame.id);
    }

    // Atualizar tabela
    popularTabela(examesCadastrados);

    // Limpar formulário
    limparFormulario();
    habilitarCamposFormulario(false);

    // Desabilitar botões
    document.getElementById('btnSalvar').disabled = true;
    document.getElementById('btnEditar').disabled = true;
    document.getElementById('btnExcluir').disabled = true;

    // Resetar estado
    modoEdicao = false;
    exameAtual = null;
    indiceAtual = -1;

    alert('Exame salvo com sucesso!');
}

function editarExame() {
    if (!exameAtual) {
        alert('Selecione um exame para editar.');
        return;
    }

    // Habilitar campos
    habilitarCamposFormulario(true);

    // Focar no primeiro campo
    document.getElementById('nomeExame').focus();

    // Atualizar estado
    modoEdicao = true;

    // Habilitar botão salvar
    document.getElementById('btnSalvar').disabled = false;
    document.getElementById('btnEditar').disabled = true;
}

function excluirExame() {
    if (!exameAtual) {
        alert('Selecione um exame para excluir.');
        return;
    }

    // Confirmar exclusão
    const confirmado = confirm(`Deseja realmente excluir o exame "${exameAtual.nome}"?`);

    if (confirmado) {
        // Remover do array
        const index = examesCadastrados.findIndex(e => e.id === exameAtual.id);
        if (index !== -1) {
            examesCadastrados.splice(index, 1);
        }

        // Atualizar tabela
        popularTabela(examesCadastrados);

        // Limpar formulário
        limparFormulario();
        habilitarCamposFormulario(false);

        // Desabilitar botões
        document.getElementById('btnSalvar').disabled = true;
        document.getElementById('btnEditar').disabled = true;
        document.getElementById('btnExcluir').disabled = true;
        habilitarBotoesNavegacao(false);

        // Resetar estado
        modoEdicao = false;
        exameAtual = null;
        indiceAtual = -1;

        alert('Exame excluído com sucesso!');
    }
}

// =============================================
// NAVEGAÇÃO ENTRE REGISTROS
// =============================================
function navegarRegistro(direcao) {
    if (examesCadastrados.length === 0) {
        return;
    }

    let novoIndice = indiceAtual + direcao;

    // Limites
    if (novoIndice < 0) {
        novoIndice = 0;
    }
    if (novoIndice >= examesCadastrados.length) {
        novoIndice = examesCadastrados.length - 1;
    }

    // Carregar exame
    indiceAtual = novoIndice;
    exameAtual = examesCadastrados[novoIndice];
    carregarExameNoFormulario(exameAtual);

    // Atualizar seleção na tabela
    const linhas = document.querySelectorAll('#corpoTabelaExames tr');
    linhas.forEach(l => l.classList.remove('active'));

    const linhaSelecionada = document.querySelector(`#corpoTabelaExames tr[data-index="${novoIndice}"]`);
    if (linhaSelecionada) {
        linhaSelecionada.classList.add('active');
        linhaSelecionada.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// =============================================
// FUNÇÕES AUXILIARES
// =============================================
function gerarIdAutomatico() {
    const proximoId = String(examesCadastrados.length + 1).padStart(3, '0');
    document.getElementById('exameId').value = proximoId;
}

function limparFormulario() {
    const form = document.getElementById('exameForm');
    form.reset();

    // Limpar valores manualmente
    document.getElementById('exameId').value = '';
    document.getElementById('nomeExame').value = '';
    document.getElementById('categoriaExame').value = '';
    document.getElementById('tipoExame').value = '';
    document.getElementById('convenioId').value = '';
    document.getElementById('nomeConvenio').value = '';
    document.getElementById('registroAns').value = '';
    document.getElementById('cnpjConvenio').value = '';
    document.getElementById('telConvenio').value = '';
    document.getElementById('emailConvenio').value = '';
    document.getElementById('valorParticular').value = '';
    document.getElementById('valorConvenio').value = '';
    document.getElementById('custoInterno').value = '';
    document.getElementById('statusExame').value = 'A';
}

function habilitarCamposFormulario(habilitado) {
    const campos = document.querySelectorAll('#exameForm input:not([readonly]), #exameForm select');
    campos.forEach(campo => {
        campo.disabled = !habilitado;
    });
}

function habilitarBotoesNavegacao(habilitado) {
    document.getElementById('btnAnterior').disabled = !habilitado;
    document.getElementById('btnProximo').disabled = !habilitado;
}

function carregarExameNoFormulario(exame) {
    document.getElementById('exameId').value = exame.id;
    document.getElementById('nomeExame').value = exame.nome;
    document.getElementById('categoriaExame').value = exame.categoria;
    document.getElementById('tipoExame').value = exame.tipo;
    document.getElementById('valorParticular').value = `R$ ${exame.valorParticular}`;
    document.getElementById('valorConvenio').value = `R$ ${exame.valorConvenio}`;
    document.getElementById('custoInterno').value = `R$ ${exame.custoInterno}`;
    document.getElementById('statusExame').value = exame.status;

    // Campos do convênio (simulados)
    document.getElementById('convenioId').value = '001';
    document.getElementById('nomeConvenio').value = 'CONVÊNIO EXEMPLO LTDA';
    document.getElementById('registroAns').value = '1234567890';
    document.getElementById('cnpjConvenio').value = '12.345.678/0001-90';
    document.getElementById('telConvenio').value = '(11) 3456-7890';
    document.getElementById('emailConvenio').value = 'contato@convenio.com.br';
}

function coletarDadosFormulario() {
    // Extrair valor sem "R$ "
    const valorParticular = document.getElementById('valorParticular').value.replace('R$ ', '').replace(',', '.');
    const valorConvenio = document.getElementById('valorConvenio').value.replace('R$ ', '').replace(',', '.');
    const custoInterno = document.getElementById('custoInterno').value.replace('R$ ', '').replace(',', '.');

    return {
        id: document.getElementById('exameId').value,
        nome: document.getElementById('nomeExame').value.toUpperCase(),
        categoria: document.getElementById('categoriaExame').value,
        categoriaNome: document.getElementById('categoriaExame').options[document.getElementById('categoriaExame').selectedIndex].text,
        tipo: document.getElementById('tipoExame').value,
        tipoNome: document.getElementById('tipoExame').options[document.getElementById('tipoExame').selectedIndex].text,
        valorParticular: valorParticular,
        valorConvenio: valorConvenio,
        custoInterno: custoInterno,
        status: document.getElementById('statusExame').value
    };
}

function validarFormulario() {
    const nomeExame = document.getElementById('nomeExame').value.trim();
    const categoriaExame = document.getElementById('categoriaExame').value;
    const tipoExame = document.getElementById('tipoExame').value;

    if (!nomeExame) {
        return false;
    }

    if (!categoriaExame) {
        return false;
    }

    if (!tipoExame) {
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
        popularTabela(examesCadastrados);
        return;
    }

    const resultados = examesCadastrados.filter(exame => {
        return exame.nome.toLowerCase().includes(termoNormalizado) ||
            exame.id.includes(termoNormalizado) ||
            exame.categoriaNome.toLowerCase().includes(termoNormalizado);
    });

    popularTabela(resultados);
}

// =============================================
// MÁSCARAS E FORMATAÇÕES (Opcional)
// =============================================
function aplicarMascaraMoeda(campo) {
    campo.addEventListener('input', function () {
        let valor = this.value.replace(/\D/g, '');
        valor = (valor / 100).toFixed(2) + '';
        valor = valor.replace('.', ',');
        valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        this.value = 'R$ ' + valor;
    });
}

// Aplicar máscaras aos campos de valor
document.addEventListener('DOMContentLoaded', function () {
    const camposMoeda = ['valorParticular', 'valorConvenio', 'custoInterno'];
    camposMoeda.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            aplicarMascaraMoeda(campo);
        }
    });
});

// =============================================
// FUNÇÕES DE UTILIDADE
// =============================================
function formatarMoeda(valor) {
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
}

function formatarCNPJ(cnpj) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatarTelefone(telefone) {
    return telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
}

// Exportar funções para escopo global (se necessário)
window.openTab = openTab;
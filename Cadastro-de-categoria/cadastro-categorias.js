/**
 * Sistema GM4 - Cadastro de Categorias de Exames
 * Lógica de Frontend para gerenciamento de categorias, auditoria e persistência simulada.
 */

// --- Simulação de Banco de Dados (Mock Data) ---
let categorias = [
    { id: "001", nome: "CARDIOLOGIA", sigla: "CARD", status: "A", descricao: "Exames relacionados ao sistema cardiovascular", dataCad: "2026-01-10", usuario: "ADMIN", dataAlt: "2026-05-20" },
    { id: "002", nome: "ULTRASSONOGRAFIA", sigla: "USG", status: "I", descricao: "Diagnóstico por imagem via ultrassom", dataCad: "2026-02-15", usuario: "SISTEMA", dataAlt: "2026-06-01" },
    { id: "003", nome: "LABORATÓRIO", sigla: "LAB", status: "A", descricao: "Análises clínicas e laboratoriais", dataCad: "2026-03-01", usuario: "ADMIN", dataAlt: "2026-03-01" },
    { id: "004", nome: "NEUROLOGIA", sigla: "NEUR", status: "A", descricao: "Exames do sistema nervoso", dataCad: "2026-04-10", usuario: "ADMIN", dataAlt: "2026-04-10" }
];

let indiceAtual = -1;

// --- Inicialização ---
window.onload = () => {
    renderizarGrid();
    setupEventos();
};

/**
 * Renderiza a tabela de categorias
 */
function renderizarGrid() {
    const corpo = document.getElementById('corpoTabelaCategorias');
    if (!corpo) return;

    corpo.innerHTML = '';

    categorias.forEach((cat, index) => {
        const tr = document.createElement('tr');
        tr.onclick = () => selecionarCategoria(index, tr);

        const statusClass = cat.status === 'A' ? 'status-active' : 'status-inactive';
        const statusText = cat.status === 'A' ? 'Ativo' : 'Inativo';

        tr.innerHTML = `
            <td>${cat.id}</td>
            <td><strong>${cat.nome}</strong></td>
            <td>${cat.sigla}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        corpo.appendChild(tr);
    });
}

/**
 * Seleciona uma categoria da grade e preenche o formulário
 */
function selecionarCategoria(index, elemento) {
    indiceAtual = index;
    const cat = categorias[index];

    // UI: Destacar linha
    document.querySelectorAll('#tabelaCategorias tr').forEach(tr => tr.classList.remove('selected'));
    if (elemento) elemento.classList.add('selected');

    // UI: Preencher Formulário
    document.getElementById('categoriaId').value = cat.id;
    document.getElementById('nomeCategoria').value = cat.nome;
    document.getElementById('siglaCategoria').value = cat.sigla;
    document.getElementById('descricaoCategoria').value = cat.descricao;
    document.getElementById('statusCategoria').value = cat.status;

    // Metadados
    document.getElementById('dataCadastro').value = cat.dataCad;
    document.getElementById('usuarioCadastro').value = cat.usuario;
    document.getElementById('dataAlteracao').value = cat.dataAlt;

    // Gerenciar botões
    desabilitarCampos();
    document.getElementById('btnEditar').disabled = false;
    document.getElementById('btnExcluir').disabled = false;
    document.getElementById('btnSalvar').disabled = true;
    atualizarNavegacao();
}

/**
 * Gerenciamento de Abas
 */
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    const tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

/**
 * Configuração de Eventos
 */
function setupEventos() {
    const btnNovo = document.getElementById('btnNovo');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnEditar = document.getElementById('btnEditar');
    const btnExcluir = document.getElementById('btnExcluir');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnProximo = document.getElementById('btnProximo');
    const form = document.getElementById('categoriaForm');

    btnNovo.onclick = () => {
        indiceAtual = -1;
        form.reset();
        habilitarCampos();
        document.getElementById('categoriaId').value = 'NOVO';

        // Datas automáticas
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('dataCadastro').value = hoje;
        document.getElementById('dataAlteracao').value = hoje;
        document.getElementById('usuarioCadastro').value = 'ADMIN';

        btnSalvar.disabled = false;
        btnEditar.disabled = true;
        btnExcluir.disabled = true;
        document.querySelector('.tab-link').click();
        document.getElementById('nomeCategoria').focus();
        atualizarNavegacao();
    };

    btnEditar.onclick = () => {
        habilitarCampos();
        btnSalvar.disabled = false;
        btnEditar.disabled = true;
    };

    btnSalvar.onclick = () => {
        const id = document.getElementById('categoriaId').value;
        const nome = document.getElementById('nomeCategoria').value.toUpperCase();

        if (!nome) {
            alert('Por favor, preencha o nome da categoria.');
            return;
        }

        const dadosCat = {
            nome: nome,
            sigla: document.getElementById('siglaCategoria').value.toUpperCase(),
            descricao: document.getElementById('descricaoCategoria').value,
            status: document.getElementById('statusCategoria').value,
            dataCad: document.getElementById('dataCadastro').value,
            usuario: document.getElementById('usuarioCadastro').value,
            dataAlt: new Date().toISOString().split('T')[0]
        };

        if (id === 'NOVO') {
            const novoId = (categorias.length + 1).toString().padStart(3, '0');
            dadosCat.id = novoId;
            categorias.push(dadosCat);
            alert('Categoria cadastrada com sucesso!');
        } else {
            const idx = categorias.findIndex(c => c.id == id);
            if (idx !== -1) {
                categorias[idx] = { ...categorias[idx], ...dadosCat };
                alert('Categoria atualizada com sucesso!');
            }
        }

        renderizarGrid();
        desabilitarCampos();
        btnSalvar.disabled = true;
        btnEditar.disabled = false;
    };

    btnExcluir.onclick = () => {
        const id = document.getElementById('categoriaId').value;
        if (confirm('Deseja realmente excluir esta categoria?')) {
            categorias = categorias.filter(c => c.id != id);
            renderizarGrid();
            form.reset();
            desabilitarCampos();
            btnEditar.disabled = true;
            btnExcluir.disabled = true;
            indiceAtual = -1;
            atualizarNavegacao();
        }
    };

    btnAnterior.onclick = () => {
        if (indiceAtual > 0) {
            selecionarCategoria(indiceAtual - 1);
        }
    };

    btnProximo.onclick = () => {
        if (indiceAtual < categorias.length - 1) {
            selecionarCategoria(indiceAtual + 1);
        }
    };
}

function atualizarNavegacao() {
    document.getElementById('btnAnterior').disabled = (indiceAtual <= 0);
    document.getElementById('btnProximo').disabled = (indiceAtual === -1 || indiceAtual >= categorias.length - 1);
}

function habilitarCampos() {
    const inputs = document.querySelectorAll('#categoriaForm input, #categoriaForm select');
    inputs.forEach(input => {
        if (input.id !== 'categoriaId' && !input.id.includes('data') && input.id !== 'usuarioCadastro') {
            input.disabled = false;
        }
    });
}

function desabilitarCampos() {
    const inputs = document.querySelectorAll('#categoriaForm input, #categoriaForm select');
    inputs.forEach(input => input.disabled = true);
}

// Função Sair

document.getElementById("btnSair")
    .addEventListener("click", sair);

function sair() {

    if (history.length > 1) {
        history.back();
    } else {
        window.close();
    }
}
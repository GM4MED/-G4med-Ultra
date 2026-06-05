/**
 * Sistema GM4 - Cadastro de Exames
 * Lógica de Frontend para gerenciamento de exames, convênios e persistência simulada.
 */

// --- Simulação de Banco de Dados (Mock Data) ---
let exames = [
    {
        id: 1,
        nome: "HEMOGRAMA COMPLETO",
        categoria: "02",
        tipo: "01",
        status: "A",
        valorParticular: "R$ 45,00",
        valorConvenio: "R$ 30,00",
        custoInterno: "R$ 10,00",
        convenio: { id: "10", nome: "UNIMED", ans: "123456", cnpj: "00.111.222/0001-33", tel: "(11) 4004-0000", email: "contato@unimed.com" }
    },
    {
        id: 2,
        nome: "RAIO-X TÓRAX",
        categoria: "03",
        tipo: "02",
        status: "A",
        valorParticular: "R$ 120,00",
        valorConvenio: "R$ 85,00",
        custoInterno: "R$ 40,00",
        convenio: { id: "20", nome: "BRADESCO SAÚDE", ans: "654321", cnpj: "99.888.777/0001-00", tel: "(11) 3003-1000", email: "atendimento@bradesco.com" }
    },
    {
        id: 3,
        nome: "ULTRASSONOGRAFIA ABDOMINAL",
        categoria: "04",
        tipo: "03",
        status: "I",
        valorParticular: "R$ 250,00",
        valorConvenio: "R$ 180,00",
        custoInterno: "R$ 70,00",
        convenio: { id: "30", nome: "AMIL", ans: "112233", cnpj: "55.444.333/0001-11", tel: "(11) 2100-2100", email: "sac@amil.com" }
    }
];

let indiceAtual = -1;

// --- Inicialização ---
window.onload = () => {
    renderizarGrid();
    setupEventos();
};

/**
 * Renderiza a tabela de exames
 */
function renderizarGrid() {
    const corpo = document.getElementById('corpoTabelaExames');
    if (!corpo) return;

    corpo.innerHTML = '';

    exames.forEach((ex, index) => {
        const tr = document.createElement('tr');
        tr.onclick = () => selecionarExame(index, tr);

        const statusClass = ex.status === 'A' ? 'status-active' : 'status-inactive';
        const statusText = ex.status === 'A' ? 'Ativo' : 'Inativo';

        // Obter nome da categoria
        const catSelect = document.getElementById('categoriaExame');
        const catNome = Array.from(catSelect.options).find(opt => opt.value === ex.categoria)?.text || ex.categoria;

        tr.innerHTML = `
            <td>${ex.id}</td>
            <td><strong>${ex.nome}</strong></td>
            <td>${catNome}</td>
            <td>${ex.tipo}</td>
            <td>${ex.valorParticular}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        corpo.appendChild(tr);
    });
}

/**
 * Seleciona um exame da grade e preenche o formulário
 */
function selecionarExame(index, elemento) {
    indiceAtual = index;
    const ex = exames[index];

    // UI: Destacar linha
    document.querySelectorAll('#tabelaExames tr').forEach(tr => tr.classList.remove('selected'));
    if (elemento) elemento.classList.add('selected');

    // UI: Preencher Formulário
    document.getElementById('exameId').value = ex.id;
    document.getElementById('nomeExame').value = ex.nome;
    document.getElementById('categoriaExame').value = ex.categoria;
    document.getElementById('tipoExame').value = ex.tipo;

    // Dados Convênio
    document.getElementById('convenioId').value = ex.convenio.id;
    document.getElementById('nomeConvenio').value = ex.convenio.nome;
    document.getElementById('registroAns').value = ex.convenio.ans;
    document.getElementById('cnpjConvenio').value = ex.convenio.cnpj;
    document.getElementById('telConvenio').value = ex.convenio.tel;
    document.getElementById('emailConvenio').value = ex.convenio.email;

    // Valores
    document.getElementById('valorParticular').value = ex.valorParticular;
    document.getElementById('valorConvenio').value = ex.valorConvenio;
    document.getElementById('custoInterno').value = ex.custoInterno;
    document.getElementById('statusExame').value = ex.status;

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
    const form = document.getElementById('exameForm');

    btnNovo.onclick = () => {
        indiceAtual = -1;
        form.reset();
        habilitarCampos();
        document.getElementById('exameId').value = 'NOVO';
        btnSalvar.disabled = false;
        btnEditar.disabled = true;
        btnExcluir.disabled = true;
        document.querySelector('.tab-link').click();
        document.getElementById('nomeExame').focus();
        atualizarNavegacao();
    };

    btnEditar.onclick = () => {
        habilitarCampos();
        btnSalvar.disabled = false;
        btnEditar.disabled = true;
    };

    btnSalvar.onclick = () => {
        const id = document.getElementById('exameId').value;
        const nome = document.getElementById('nomeExame').value.toUpperCase();

        if (!nome) {
            alert('Por favor, preencha o nome do exame.');
            return;
        }

        const dadosExame = {
            nome: nome,
            categoria: document.getElementById('categoriaExame').value,
            tipo: document.getElementById('tipoExame').value,
            status: document.getElementById('statusExame').value,
            valorParticular: document.getElementById('valorParticular').value,
            valorConvenio: document.getElementById('valorConvenio').value,
            custoInterno: document.getElementById('custoInterno').value,
            convenio: {
                id: document.getElementById('convenioId').value,
                nome: document.getElementById('nomeConvenio').value,
                ans: document.getElementById('registroAns').value,
                cnpj: document.getElementById('cnpjConvenio').value,
                tel: document.getElementById('telConvenio').value,
                email: document.getElementById('emailConvenio').value
            }
        };

        if (id === 'NOVO') {
            dadosExame.id = exames.length + 1;
            exames.push(dadosExame);
            alert('Exame cadastrado com sucesso!');
        } else {
            const idx = exames.findIndex(e => e.id == id);
            if (idx !== -1) {
                exames[idx] = { ...exames[idx], ...dadosExame };
                alert('Exame atualizado com sucesso!');
            }
        }

        renderizarGrid();
        desabilitarCampos();
        btnSalvar.disabled = true;
        btnEditar.disabled = false;
    };

    btnExcluir.onclick = () => {
        const id = document.getElementById('exameId').value;
        if (confirm('Deseja realmente excluir este exame?')) {
            exames = exames.filter(e => e.id != id);
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
            selecionarExame(indiceAtual - 1);
        }
    };

    btnProximo.onclick = () => {
        if (indiceAtual < exames.length - 1) {
            selecionarExame(indiceAtual + 1);
        }
    };
}

function atualizarNavegacao() {
    document.getElementById('btnAnterior').disabled = (indiceAtual <= 0);
    document.getElementById('btnProximo').disabled = (indiceAtual === -1 || indiceAtual >= exames.length - 1);
}

function habilitarCampos() {
    const inputs = document.querySelectorAll('#exameForm input, #exameForm select, #exameForm textarea');
    inputs.forEach(input => {
        if (input.id !== 'exameId') input.disabled = false;
    });
}

function desabilitarCampos() {
    const inputs = document.querySelectorAll('#exameForm input, #exameForm select, #exameForm textarea');
    inputs.forEach(input => input.disabled = true);
}
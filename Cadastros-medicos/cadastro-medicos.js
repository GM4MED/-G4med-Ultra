/**
 * Sistema GM4 - Cadastro de Médicos
 * Lógica de Frontend para gerenciamento de profissionais, abas e persistência simulada.
 */

// --- Simulação de Banco de Dados (Mock Data) ---
let medicos = [
    {
        id: 1,
        nome: "DR. RICARDO SILVA",
        crm: "12345-SP",
        especialidade: "Cardiologia",
        status: "A",
        cpf: "123.456.789-00",
        email: "ricardo.silva@hospital.com",
        celular: "(11) 98888-7777"
    },
    {
        id: 2,
        nome: "DRA. ANA BEATRIZ",
        crm: "67890-RJ",
        especialidade: "Dermatologia",
        status: "A",
        cpf: "222.333.444-55",
        email: "ana.beatriz@clinica.com",
        celular: "(21) 97777-6666"
    },
    {
        id: 3,
        nome: "DR. MARCOS PEREIRA",
        crm: "11223-MG",
        especialidade: "Ortopedia",
        status: "I",
        cpf: "999.888.777-66",
        email: "marcos.p@med.com",
        celular: "(31) 96666-5555"
    }
];

// --- Inicialização ---
window.onload = () => {
    renderizarGrid();
    setupEventos();
};

/**
 * Renderiza a tabela de médicos cadastrados
 */
function renderizarGrid() {
    const corpo = document.getElementById('corpoTabelaMedicos');
    if (!corpo) return;

    corpo.innerHTML = '';

    medicos.forEach(m => {
        const tr = document.createElement('tr');
        tr.onclick = () => selecionarMedico(m, tr);

        const statusClass = m.status === 'A' ? 'status-active' : 'status-inactive';
        const statusText = m.status === 'A' ? 'Ativo' : 'Inativo';

        tr.innerHTML = `
            <td>${m.id}</td>
            <td><strong>${m.nome}</strong></td>
            <td>${m.crm}</td>
            <td>${m.especialidade}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        corpo.appendChild(tr);
    });
}

/**
 * Seleciona um médico da grade e preenche o formulário
 */
function selecionarMedico(m, elemento) {
    // UI: Destacar linha selecionada
    document.querySelectorAll('#tabelaMedicos tr').forEach(tr => tr.classList.remove('selected'));
    elemento.classList.add('selected');

    // UI: Preencher Formulário (Mapeando campos do HTML)
    document.getElementById('medicoId').value = m.id;
    document.getElementById('nome').value = m.nome;
    document.getElementById('cpf').value = m.cpf || '';
    document.getElementById('email').value = m.email || '';
    document.getElementById('celular').value = m.celular || '';
    document.getElementById('numeroConselho').value = m.crm;
    document.getElementById('especialidadesTexto').value = m.especialidade;
    document.getElementById('status').value = m.status;

    // UI: Gerenciar estado dos botões
    desabilitarCampos();
    document.getElementById('btnEditar').disabled = false;
    document.getElementById('btnExcluir').disabled = false;
    document.getElementById('btnSalvar').disabled = true;
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
 * Configuração de Eventos dos Botões
 */
function setupEventos() {
    const btnNovo = document.getElementById('btnNovo');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnEditar = document.getElementById('btnEditar');
    const btnExcluir = document.getElementById('btnExcluir');
    const form = document.getElementById('medicoForm');

    // Botão Novo
    btnNovo.onclick = () => {
        form.reset();
        habilitarCampos();
        document.getElementById('medicoId').value = 'NOVO';
        btnSalvar.disabled = false;
        btnEditar.disabled = true;
        btnExcluir.disabled = true;

        // Focar na primeira aba e no primeiro campo
        document.querySelector('.tab-link').click();
        document.getElementById('nome').focus();
    };

    // Botão Editar
    btnEditar.onclick = () => {
        habilitarCampos();
        btnSalvar.disabled = false;
        btnEditar.disabled = true;
    };

    // Botão Salvar
    btnSalvar.onclick = () => {
        const id = document.getElementById('medicoId').value;
        const nome = document.getElementById('nome').value.toUpperCase();

        if (!nome) {
            alert('Por favor, preencha o nome do profissional.');
            return;
        }

        const dadosMedico = {
            nome: nome,
            cpf: document.getElementById('cpf').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value,
            crm: document.getElementById('numeroConselho').value,
            especialidade: document.getElementById('especialidadesTexto').value,
            status: document.getElementById('status').value
        };

        if (id === 'NOVO') {
            dadosMedico.id = medicos.length + 1;
            medicos.push(dadosMedico);
            alert('Médico cadastrado com sucesso!');
        } else {
            const index = medicos.findIndex(m => m.id == id);
            if (index !== -1) {
                medicos[index] = { ...medicos[index], ...dadosMedico };
                alert('Cadastro atualizado com sucesso!');
            }
        }

        renderizarGrid();
        desabilitarCampos();
        btnSalvar.disabled = true;
        btnEditar.disabled = false;
    };

    // Botão Excluir
    btnExcluir.onclick = () => {
        const id = document.getElementById('medicoId').value;
        if (confirm('Tem certeza que deseja excluir este profissional?')) {
            medicos = medicos.filter(m => m.id != id);
            renderizarGrid();
            form.reset();
            desabilitarCampos();
            btnEditar.disabled = true;
            btnExcluir.disabled = true;
        }
    };
}

/**
 * Auxiliares de Interface
 */
function habilitarCampos() {
    const inputs = document.querySelectorAll('#medicoForm input, #medicoForm select, #medicoForm textarea');
    inputs.forEach(input => {
        if (input.id !== 'medicoId') {
            input.disabled = false;
        }
    });
}

function desabilitarCampos() {
    const inputs = document.querySelectorAll('#medicoForm input, #medicoForm select, #medicoForm textarea');
    inputs.forEach(input => {
        input.disabled = true;
    });
}

// Sair
document.getElementById("btnSair")
    .addEventListener("click", sair);
function sair() {

    if (history.length > 1) {
        history.back();
    } else {
        window.close();
    }
}

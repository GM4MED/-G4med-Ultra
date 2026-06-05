/**
 * Sistema GM4 - Atendimento na Recepção
 * Lógica de Frontend para fluxo de chegada, check-list e gerenciamento de fila.
 */

// --- Dados Simulados (Fila de Espera) ---
let atendimentos = [
    {
        id: 1, senha: "G-001", hora: "08:30", paciente: "JOÃO MODESTO DA SILVA", tipo: "Consulta", medico: "Dr. Ricardo Silva", especialidade: "Cardiologia", status: "Aguardando",
        cpf: "123.456.789-00", dataNasc: "1985-05-20", celular: "(11) 98888-7777", convenio: "Unimed", carteirinha: "987654321", validade: "12/28"
    },
    {
        id: 2, senha: "P-002", hora: "08:45", paciente: "MARIA OLIVEIRA SANTOS", tipo: "Exame", medico: "Dra. Ana Beatriz", especialidade: "Dermatologia", status: "Em Atendimento",
        cpf: "222.333.444-55", dataNasc: "1992-10-12", celular: "(21) 97777-6666", convenio: "Particular", carteirinha: "-", validade: "-"
    },
    {
        id: 3, senha: "E-003", hora: "09:00", paciente: "PEDRO ALCANTARA", tipo: "Urgência", medico: "Dr. Marcos Pereira", especialidade: "Ortopedia", status: "Finalizado",
        cpf: "999.888.777-66", dataNasc: "1970-01-30", celular: "(31) 96666-5555", convenio: "Bradesco Saúde", carteirinha: "888222111", validade: "06/27"
    }
];

let indiceAtual = -1;

// --- Inicialização ---
window.onload = () => {
    renderizarFila();
    setupEventos();
};

/**
 * Renderiza a tabela da fila de espera
 */
function renderizarFila() {
    const corpo = document.getElementById('corpoTabelaAtendimentos');
    if (!corpo) return;

    corpo.innerHTML = '';

    atendimentos.forEach((at, index) => {
        const tr = document.createElement('tr');
        tr.onclick = () => selecionarAtendimento(index, tr);

        let statusClass = 'status-waiting';
        if (at.status === 'Em Atendimento') statusClass = 'status-attending';
        if (at.status === 'Finalizado') statusClass = 'status-completed';

        tr.innerHTML = `
            <td><strong>${at.senha}</strong></td>
            <td>${at.hora}</td>
            <td><strong>${at.paciente}</strong></td>
            <td>${at.tipo}</td>
            <td>${at.medico}</td>
            <td><span class="status-badge ${statusClass}">${at.status}</span></td>
        `;
        corpo.appendChild(tr);
    });
}

/**
 * Seleciona um atendimento e preenche as abas
 */
function selecionarAtendimento(index, elemento) {
    indiceAtual = index;
    const at = atendimentos[index];

    // UI: Destaque
    document.querySelectorAll('#tabelaAtendimentos tr').forEach(tr => tr.classList.remove('selected'));
    if (elemento) elemento.classList.add('selected');

    // Aba 1: Dados do Paciente
    document.getElementById('pacienteId').value = at.id;
    document.getElementById('cpf').value = at.cpf;
    document.getElementById('nomePaciente').value = at.paciente;
    document.getElementById('dataNasc').value = at.dataNasc;
    document.getElementById('celular').value = at.celular;
    document.getElementById('convenio').value = at.convenio;
    document.getElementById('carteirinha').value = at.carteirinha;
    document.getElementById('validadeConvenio').value = at.validade;

    // Aba 2: Dados do Atendimento
    document.getElementById('dataAtendimento').value = new Date().toISOString().split('T')[0];
    document.getElementById('horaChegada').value = at.hora;
    document.getElementById('tipoAtendimento').value = at.tipo;
    document.getElementById('procedimento').value = at.tipo === 'Exame' ? 'Hemograma' : '-';
    document.getElementById('medico').value = at.medico;
    document.getElementById('especialidade').value = at.especialidade;
    document.getElementById('numeroSenha').value = at.senha;

    // Gerenciar botões
    desabilitarCampos();
    document.getElementById('btnEditar').disabled = false;
    document.getElementById('btnExcluir').disabled = false;
    document.getElementById('btnImprimir').disabled = false;
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
    const form = document.getElementById('atendimentoForm');

    // Lógica para preencher especialidade automaticamente ao mudar o médico
    document.getElementById('medico').onchange = (e) => {
        const espMap = {
            "Dr. Ricardo Silva": "Cardiologia",
            "Dra. Ana Beatriz": "Dermatologia",
            "Dr. Marcos Pereira": "Ortopedia"
        };
        document.getElementById('especialidade').value = espMap[e.target.value] || "";
    };

    btnNovo.onclick = () => {
        indiceAtual = -1;
        form.reset();
        habilitarCampos();
        document.getElementById('pacienteId').value = 'NOVO';
        document.getElementById('horaChegada').value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        btnSalvar.disabled = false;
        btnEditar.disabled = true;
        btnExcluir.disabled = true;
        document.querySelector('.tab-link').click();
        document.getElementById('cpf').focus();
        atualizarNavegacao();
    };

    btnEditar.onclick = () => {
        habilitarCampos();
        btnSalvar.disabled = false;
        btnEditar.disabled = true;
    };

    btnSalvar.onclick = () => {
        const id = document.getElementById('pacienteId').value;
        const nome = document.getElementById('nomePaciente').value.toUpperCase();

        if (!nome) {
            alert('Por favor, preencha o nome do paciente.');
            return;
        }

        const dadosAt = {
            paciente: nome,
            cpf: document.getElementById('cpf').value,
            dataNasc: document.getElementById('dataNasc').value,
            celular: document.getElementById('celular').value,
            convenio: document.getElementById('convenio').value,
            carteirinha: document.getElementById('carteirinha').value,
            validade: document.getElementById('validadeConvenio').value,
            hora: document.getElementById('horaChegada').value,
            tipo: document.getElementById('tipoAtendimento').value,
            medico: document.getElementById('medico').value,
            especialidade: document.getElementById('especialidade').value,
            senha: document.getElementById('numeroSenha').value || "G-" + Math.floor(Math.random() * 100).toString().padStart(3, '0'),
            status: "Aguardando"
        };

        if (id === 'NOVO') {
            dadosAt.id = atendimentos.length + 1;
            atendimentos.push(dadosAt);
            alert('Atendimento registrado com sucesso!');
        } else {
            const idx = atendimentos.findIndex(a => a.id == id);
            if (idx !== -1) {
                atendimentos[idx] = { ...atendimentos[idx], ...dadosAt };
                alert('Atendimento atualizado com sucesso!');
            }
        }

        renderizarFila();
        desabilitarCampos();
        btnSalvar.disabled = true;
        btnEditar.disabled = false;
    };

    btnExcluir.onclick = () => {
        const id = document.getElementById('pacienteId').value;
        if (confirm('Deseja cancelar este atendimento?')) {
            atendimentos = atendimentos.filter(a => a.id != id);
            renderizarFila();
            form.reset();
            desabilitarCampos();
            btnEditar.disabled = true;
            btnExcluir.disabled = true;
            indiceAtual = -1;
            atualizarNavegacao();
        }
    };

    btnAnterior.onclick = () => {
        if (indiceAtual > 0) selecionarAtendimento(indiceAtual - 1);
    };

    btnProximo.onclick = () => {
        if (indiceAtual < atendimentos.length - 1) selecionarAtendimento(indiceAtual + 1);
    };
}

function atualizarNavegacao() {
    document.getElementById('btnAnterior').disabled = (indiceAtual <= 0);
    document.getElementById('btnProximo').disabled = (indiceAtual === -1 || indiceAtual >= atendimentos.length - 1);
}

function habilitarCampos() {
    const inputs = document.querySelectorAll('#atendimentoForm input, #atendimentoForm select, #atendimentoForm textarea');
    inputs.forEach(input => {
        if (input.id !== 'pacienteId' && input.id !== 'especialidade' && input.id !== 'numeroSenha') {
            input.disabled = false;
        }
    });
}

function desabilitarCampos() {
    const inputs = document.querySelectorAll('#atendimentoForm input, #atendimentoForm select, #atendimentoForm textarea');
    inputs.forEach(input => input.disabled = true);
}

document.getElementById("btnSair")
    .addEventListener("click", sair);

    function sair() {

    if (history.length > 1) {
        history.back();
    } else {
        window.close();
    }
}
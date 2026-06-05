// Simulação de Banco de Dados de Convênios
let convenios = [
    { id: 1, fantasia: "UNIMED NACIONAL", cnpj: "00.123.456/0001-01", ans: "345678", tabela: "TUSS", status: "A" },
    { id: 2, fantasia: "BRADESCO SAÚDE", cnpj: "11.222.333/0001-22", ans: "456789", tabela: "CBHPM", status: "A" },
    { id: 3, fantasia: "AMIL ASSISTÊNCIA", cnpj: "33.444.555/0001-33", ans: "567890", tabela: "TUSS", status: "I" }
];

window.onload = () => {
    renderizarGrid();
    setupBotoes();
};

function renderizarGrid() {
    const corpo = document.getElementById('corpoTabelaConvenios');
    corpo.innerHTML = '';

    convenios.forEach(c => {
        const tr = document.createElement('tr');
        tr.onclick = () => selecionarConvenio(c, tr);

        const statusClass = c.status === 'A' ? 'status-active' : 'status-inactive';
        const statusText = c.status === 'A' ? 'Ativo' : 'Inativo';

        tr.innerHTML = `
            <td>${c.id}</td>
            <td><strong>${c.fantasia}</strong></td>
            <td>${c.cnpj}</td>
            <td>${c.ans}</td>
            <td>${c.tabela}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        corpo.appendChild(tr);
    });
}

function selecionarConvenio(c, elemento) {
    document.querySelectorAll('tr').forEach(tr => tr.classList.remove('selected'));
    elemento.classList.add('selected');

    document.getElementById('convenioId').value = c.id;
    document.getElementById('nomeFantasia').value = c.fantasia;
    document.getElementById('cnpj').value = c.cnpj;
    document.getElementById('registroAns').value = c.ans;
    document.getElementById('tabelaHonorarios').value = c.tabela;
    document.getElementById('status').value = c.status;

    document.getElementById('btnEditar').disabled = false;
    document.getElementById('btnExcluir').disabled = false;
}

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function setupBotoes() {
    const btnNovo = document.getElementById('btnNovo');
    const btnSalvar = document.getElementById('btnSalvar');
    const inputs = document.querySelectorAll('input, select, textarea');

    btnNovo.onclick = () => {
        inputs.forEach(input => {
            if (input.id !== 'convenioId') {
                input.value = '';
                input.disabled = false;
            }
        });
        document.getElementById('convenioId').value = 'NOVO';
        btnSalvar.disabled = false;
        document.getElementById('razaoSocial').focus();
    };

    btnSalvar.onclick = () => {
        alert('Gravando convênio no PostgreSQL...');
        const novo = {
            id: convenios.length + 1,
            fantasia: document.getElementById('nomeFantasia').value.toUpperCase(),
            cnpj: document.getElementById('cnpj').value,
            ans: document.getElementById('registroAns').value,
            tabela: document.getElementById('tabelaHonorarios').value,
            status: document.getElementById('status').value
        };
        convenios.push(novo);
        renderizarGrid();
        inputs.forEach(input => input.disabled = true);
        btnSalvar.disabled = true;
    };
}

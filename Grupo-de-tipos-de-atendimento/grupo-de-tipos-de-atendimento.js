document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.querySelector('.data-table tbody');
    const paginationInfo = document.querySelector('.pagination-info');
    const paginationControls = document.querySelector('.pagination-controls');
    const newGroupBtn = document.querySelector('.btn-primary');
    const importBtn = document.querySelector('.btn-secondary');
    const backBtn = document.getElementById('backBtn');

    const modal = document.getElementById('newGroupModal');
    const modalBackdrop = document.getElementById('newGroupBackdrop');
    const closeModalBtn = document.getElementById('closeNewGroupModal');
    const cancelModalBtn = document.getElementById('cancelNewGroupBtn');
    const form = document.getElementById('newGroupForm');
    const nameInput = document.getElementById('groupName');
    const descInput = document.getElementById('groupDescription');
    const statusInput = document.getElementById('groupStatus');

    const pageData = {
        1: [
            ['Ativo', 'Consultas Médicas', 'Consultas em diversas especialidades', 24],
            ['Ativo', 'Exames Laboratoriais', 'Coleta e análise de exames', 18],
            ['Inativo', 'Procedimentos', 'Procedimentos ambulatoriais', 31],
            ['Ativo', 'Telemedicina', 'Atendimentos remotos', 12],
            ['Ativo', 'Vacinação', 'Campanhas e imunização', 9],
            ['Inativo', 'Triagem', 'Classificação inicial de pacientes', 15],
            ['Ativo', 'Urgência', 'Atendimento emergencial', 22],
            ['Ativo', 'Retorno', 'Reavaliação de pacientes', 14],
            ['Inativo', 'Plantão', 'Cobertura 24 horas', 8],
            ['Ativo', 'Fisioterapia', 'Sessões e reabilitação', 19]
        ],
        2: [
            ['Ativo', 'Cardiologia', 'Atendimentos cardiológicos', 16],
            ['Ativo', 'Pediatria', 'Atendimento infantil', 21],
            ['Inativo', 'Dermatologia', 'Cuidados dermatológicos', 11],
            ['Ativo', 'Ortopedia', 'Atendimentos ortopédicos', 25],
            ['Ativo', 'Neurologia', 'Avaliações neurológicas', 13],
            ['Inativo', 'Oftalmologia', 'Exames e consultas oftalmológicas', 17],
            ['Ativo', 'Ginecologia', 'Saúde da mulher', 20],
            ['Ativo', 'Urologia', 'Atendimento urológico', 10],
            ['Inativo', 'Endocrinologia', 'Controle hormonal', 7],
            ['Ativo', 'Psiquiatria', 'Apoio em saúde mental', 23]
        ],
        3: [
            ['Ativo', 'Oncologia', 'Tratamentos e acompanhamento', 14],
            ['Ativo', 'Nefrologia', 'Cuidados renais', 9],
            ['Inativo', 'Otorrinolaringologia', 'Atendimento ORL', 12],
            ['Ativo', 'Reumatologia', 'Doenças autoimunes', 8],
            ['Ativo', 'Gastroenterologia', 'Sistema digestivo', 18],
            ['Inativo', 'Hematologia', 'Análises sanguíneas', 6],
            ['Ativo', 'Alergologia', 'Tratamento de alergias', 5],
            ['Ativo', 'Infectologia', 'Doenças infecciosas', 11],
            ['Inativo', 'Nutrição', 'Acompanhamento nutricional', 4],
            ['Ativo', 'Fonoaudiologia', 'Saúde da comunicação', 7]
        ]
    };

    let currentPage = 1;

    function statusIcon(status) {
        return status === 'Ativo'
            ? '<span class="status-dot status-active"></span>'
            : '<span class="status-dot status-inactive"></span>';
    }

    function rowHTML(item) {
        const [status, name, description, count] = item;
        return `
      <tr data-search="${(name + ' ' + description).toLowerCase()}">
        <td class="px-6 py-5">${statusIcon(status)}</td>
        <td class="px-6 py-5 font-medium text-gray-900">${name}</td>
        <td class="px-6 py-5 text-gray-700">${description}</td>
        <td class="px-6 py-5 num-cell">${count}</td>
        <td class="px-6 py-5 actions">
          <button class="action-btn" title="Editar" type="button"><i class="fas fa-pencil-alt"></i></button>
          <button class="action-btn" title="Visualizar" type="button"><i class="fas fa-eye"></i></button>
          <button class="action-btn delete" title="Desativar" type="button"><i class="fas fa-ban"></i></button>
        </td>
      </tr>
    `;
    }

    function renderPage(page) {
        currentPage = page;
        tableBody.innerHTML = pageData[page].map(rowHTML).join('');
        paginationInfo.textContent = `Mostrando ${(page - 1) * 10 + 1}-${page * 10} de 45 grupos`;

        paginationControls.querySelectorAll('.page-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = paginationControls.querySelector(`.page-btn[data-page="${page}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        if (searchInput.value.trim()) filterRows();
    }

    function filterRows() {
        const term = searchInput.value.trim().toLowerCase();
        Array.from(tableBody.querySelectorAll('tr')).forEach(row => {
            const haystack = row.dataset.search || row.textContent.toLowerCase();
            row.style.display = haystack.includes(term) ? '' : 'none';
        });
    }

    function openModal() {
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modal.querySelector('[data-modal-panel]').classList.remove('scale-95', 'translate-y-2');
        });
        nameInput.focus();
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modal.querySelector('[data-modal-panel]').classList.add('scale-95', 'translate-y-2');
        setTimeout(() => modal.classList.add('hidden'), 180);
    }

    function addNewGroupRow(name, description, status) {
        const row = [status, name, description, 0];
        pageData[1].unshift(row);

        if (currentPage === 1) {
            tableBody.insertAdjacentHTML('afterbegin', rowHTML(row));
            if (searchInput.value.trim()) filterRows();
        }
    }

    searchInput.addEventListener('input', filterRows);

    paginationControls.addEventListener('click', (e) => {
        const btn = e.target.closest('.page-btn');
        if (!btn || !btn.dataset.page) return;
        renderPage(Number(btn.dataset.page));
    });

    newGroupBtn.addEventListener('click', openModal);
    importBtn.addEventListener('click', () => alert('Abrir modal de importação de catálogo.'));
    backBtn.addEventListener('click', () => window.history.back());

    modalBackdrop.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const status = statusInput.value;

        if (!name || !description) return;

        addNewGroupRow(name, description, status);
        form.reset();
        statusInput.value = 'Ativo';
        closeModal();
    });

    renderPage(1);
});
const openProcedureBtn = document.getElementById('openProcedureBtn');
const procedureScreen = document.getElementById('procedureScreen');
const procedureForm = document.getElementById('procedureForm');
const closeButtons = document.querySelectorAll('[data-close-screen]');
const procedureName = document.getElementById('procedureName');
const procedureCode = document.getElementById('procedureCode');
const procedureCategory = document.getElementById('procedureCategory');
const procedureStatus = document.getElementById('procedureStatus');
const recordsBody = document.getElementById('recordsBody');
const recordCount = document.getElementById('recordCount');

let records = [
    {
        name: 'Consulta cardiológica',
        code: 'PROC-1001',
        category: 'Consulta',
        status: 'Ativo'
    },
    {
        name: 'Raio-X de tórax',
        code: 'PROC-1002',
        category: 'Diagnóstico',
        status: 'Ativo'
    }
];

let lastFocusedElement = null;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function validateField(input) {
    if (!input.value.trim()) {
        input.setCustomValidity('Campo obrigatório.');
        input.reportValidity();
        return false;
    }
    input.setCustomValidity('');
    return true;
}

function updateCounter() {
    recordCount.textContent = `${records.length} registro${records.length === 1 ? '' : 's'}`;
}

function renderTable() {
    if (!records.length) {
        recordsBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">Nenhum procedimento cadastrado.</td>
      </tr>
    `;
        updateCounter();
        return;
    }

    recordsBody.innerHTML = records.map((record, index) => `
    <tr>
      <td>${escapeHtml(record.name)}</td>
      <td>${escapeHtml(record.code)}</td>
      <td>${escapeHtml(record.category)}</td>
      <td>${escapeHtml(record.status)}</td>
      <td>
        <div class="row-actions">
          <button type="button" class="small-btn" data-action="edit" data-index="${index}">Editar</button>
          <button type="button" class="small-btn small-btn--danger" data-action="remove" data-index="${index}">Remover</button>
        </div>
      </td>
    </tr>
  `).join('');

    updateCounter();
}

function openScreen() {
    lastFocusedElement = document.activeElement;
    procedureScreen.hidden = false;
    document.body.classList.add('screen-open');
    renderTable();
    setTimeout(() => procedureName.focus(), 0);
}

function closeScreen() {
    procedureScreen.hidden = true;
    document.body.classList.remove('screen-open');
    if (lastFocusedElement) lastFocusedElement.focus();
}

openProcedureBtn.addEventListener('click', openScreen);

closeButtons.forEach((button) => {
    button.addEventListener('click', closeScreen);
});

document.addEventListener('keydown', (event) => {
    if (!procedureScreen.hidden && event.key === 'Escape') {
        closeScreen();
    }
});

procedureForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isValidName = validateField(procedureName);
    const isValidCode = validateField(procedureCode);
    const isValidCategory = validateField(procedureCategory);
    const isValidStatus = validateField(procedureStatus);

    if (!isValidName || !isValidCode || !isValidCategory || !isValidStatus) return;

    records.unshift({
        name: procedureName.value.trim(),
        code: procedureCode.value.trim(),
        category: procedureCategory.value.trim(),
        status: procedureStatus.value.trim()
    });

    procedureForm.reset();
    renderTable();
    procedureName.focus();
    alert('Procedimento salvo com sucesso.');
});

recordsBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === 'remove') {
        const confirmed = confirm(`Remover o procedimento "${records[index].name}"?`);
        if (!confirmed) return;

        records.splice(index, 1);
        renderTable();
        return;
    }

    if (action === 'edit') {
        const nextName = prompt('Editar nome do procedimento:', records[index].name);
        if (nextName === null) return;

        const nextCode = prompt('Editar código:', records[index].code);
        if (nextCode === null) return;

        const nextCategory = prompt('Editar categoria:', records[index].category);
        if (nextCategory === null) return;

        const nextStatus = prompt('Editar status:', records[index].status);
        if (nextStatus === null) return;

        if (!nextName.trim() || !nextCode.trim() || !nextCategory.trim() || !nextStatus.trim()) {
            alert('Todos os campos são obrigatórios.');
            return;
        }

        records[index] = {
            name: nextName.trim(),
            code: nextCode.trim(),
            category: nextCategory.trim(),
            status: nextStatus.trim()
        };

        renderTable();
    }
});

renderTable();
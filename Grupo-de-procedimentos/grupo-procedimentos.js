const openProcedureBtn = document.getElementById('openProcedureBtn');
const procedureDialog = document.getElementById('procedureDialog');
const procedureForm = document.getElementById('procedureForm');
const closeButtons = document.querySelectorAll('[data-close-dialog]');
const procedureName = document.getElementById('procedureName');
const procedureCode = document.getElementById('procedureCode');
const procedureObs = document.getElementById('procedureObs');
const recordsBody = document.getElementById('recordsBody');
const recordCount = document.getElementById('recordCount');

let records = [
    { name: 'Consulta cardiológica', code: 'PROC-1001' },
    { name: 'Raio-X de tórax', code: 'PROC-1002' }
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
        <td colspan="3">Nenhum procedimento cadastrado.</td>
      </tr>
    `;
        updateCounter();
        return;
    }

    recordsBody.innerHTML = records.map((record, index) => `
    <tr>
      <td>${escapeHtml(record.name)}</td>
      <td>${escapeHtml(record.code)}</td>
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

function openDialog() {
    lastFocusedElement = document.activeElement;
    procedureDialog.showModal();
    document.body.classList.add('dialog-open');
    setTimeout(() => procedureName.focus(), 0);
}

function closeDialog() {
    if (procedureDialog.open) procedureDialog.close();
    document.body.classList.remove('dialog-open');
    if (lastFocusedElement) lastFocusedElement.focus();
}

openProcedureBtn.addEventListener('click', openDialog);

closeButtons.forEach((button) => {
    button.addEventListener('click', closeDialog);
});

procedureDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeDialog();
});

procedureForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isValidName = validateField(procedureName);
    const isValidCode = validateField(procedureCode);

    if (!isValidName || !isValidCode) return;

    records.unshift({
        name: procedureName.value.trim(),
        code: procedureCode.value.trim()
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
        const confirmed = confirm(`Remover "${records[index].name}"?`);
        if (!confirmed) return;

        records.splice(index, 1);
        renderTable();
        return;
    }

    if (action === 'edit') {
        const nextName = prompt('Editar nome do procedimento:', records[index].name);
        if (nextName === null) return;

        const nextCode = prompt('Editar código do procedimento:', records[index].code);
        if (nextCode === null) return;

        if (!nextName.trim() || !nextCode.trim()) {
            alert('Nome e código são obrigatórios.');
            return;
        }

        records[index] = {
            name: nextName.trim(),
            code: nextCode.trim()
        };

        renderTable();
    }
});

renderTable();
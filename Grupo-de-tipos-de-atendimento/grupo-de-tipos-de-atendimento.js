const openTypeBtn = document.getElementById('openTypeBtn');
const typeScreen = document.getElementById('typeScreen');
const typeForm = document.getElementById('typeForm');
const closeButtons = document.querySelectorAll('[data-close-screen]');
const attendanceType = document.getElementById('attendanceType');
const typeCode = document.getElementById('typeCode');
const recordsBody = document.getElementById('recordsBody');
const recordCount = document.getElementById('recordCount');

let records = [
    { type: 'Consulta', code: 'TAT-001' },
    { type: 'Triagem', code: 'TAT-002' }
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
        <td colspan="3">Nenhum tipo de atendimento cadastrado.</td>
      </tr>
    `;
        updateCounter();
        return;
    }

    recordsBody.innerHTML = records.map((record, index) => `
    <tr>
      <td>${escapeHtml(record.type)}</td>
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

function openScreen() {
    lastFocusedElement = document.activeElement;
    typeScreen.hidden = false;
    document.body.classList.add('screen-open');
    renderTable();
    setTimeout(() => attendanceType.focus(), 0);
}

function closeScreen() {
    typeScreen.hidden = true;
    document.body.classList.remove('screen-open');
    if (lastFocusedElement) lastFocusedElement.focus();
}

openTypeBtn.addEventListener('click', openScreen);

closeButtons.forEach((button) => {
    button.addEventListener('click', closeScreen);
});

document.addEventListener('keydown', (event) => {
    if (!typeScreen.hidden && event.key === 'Escape') {
        closeScreen();
    }
});

typeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isValidType = validateField(attendanceType);
    const isValidCode = validateField(typeCode);

    if (!isValidType || !isValidCode) return;

    records.unshift({
        type: attendanceType.value.trim(),
        code: typeCode.value.trim()
    });

    typeForm.reset();
    renderTable();
    attendanceType.focus();
    alert('Tipo de atendimento salvo com sucesso.');
});

recordsBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === 'remove') {
        const confirmed = confirm(`Remover o tipo "${records[index].type}"?`);
        if (!confirmed) return;

        records.splice(index, 1);
        renderTable();
        return;
    }

    if (action === 'edit') {
        const nextType = prompt('Editar tipo de atendimento:', records[index].type);
        if (nextType === null) return;

        const nextCode = prompt('Editar código:', records[index].code);
        if (nextCode === null) return;

        if (!nextType.trim() || !nextCode.trim()) {
            alert('Todos os campos são obrigatórios.');
            return;
        }

        records[index] = {
            type: nextType.trim(),
            code: nextCode.trim()
        };

        renderTable();
    }
});

renderTable();
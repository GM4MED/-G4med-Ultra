const openAttendanceBtn = document.getElementById('openAttendanceBtn');
const attendanceScreen = document.getElementById('attendanceScreen');
const attendanceForm = document.getElementById('attendanceForm');
const closeButtons = document.querySelectorAll('[data-close-screen]');
const patientName = document.getElementById('patientName');
const attendanceType = document.getElementById('attendanceType');
const attendanceDate = document.getElementById('attendanceDate');
const attendanceStatus = document.getElementById('attendanceStatus');
const recordsBody = document.getElementById('recordsBody');
const recordCount = document.getElementById('recordCount');

let records = [
    { patient: 'Maria da Silva', type: 'Consulta', date: '2026-07-22', status: 'Em andamento' },
    { patient: 'João Pereira', type: 'Triagem', date: '2026-07-21', status: 'Concluído' }
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
        <td colspan="5">Nenhum atendimento cadastrado.</td>
      </tr>
    `;
        updateCounter();
        return;
    }

    recordsBody.innerHTML = records.map((record, index) => `
    <tr>
      <td>${escapeHtml(record.patient)}</td>
      <td>${escapeHtml(record.type)}</td>
      <td>${escapeHtml(record.date)}</td>
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
    attendanceScreen.hidden = false;
    document.body.classList.add('screen-open');
    renderTable();
    setTimeout(() => patientName.focus(), 0);
}

function closeScreen() {
    attendanceScreen.hidden = true;
    document.body.classList.remove('screen-open');
    if (lastFocusedElement) lastFocusedElement.focus();
}

openAttendanceBtn.addEventListener('click', openScreen);

closeButtons.forEach((button) => {
    button.addEventListener('click', closeScreen);
});

document.addEventListener('keydown', (event) => {
    if (!attendanceScreen.hidden && event.key === 'Escape') {
        closeScreen();
    }
});

attendanceForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isValidName = validateField(patientName);
    const isValidType = validateField(attendanceType);
    const isValidDate = validateField(attendanceDate);
    const isValidStatus = validateField(attendanceStatus);

    if (!isValidName || !isValidType || !isValidDate || !isValidStatus) return;

    records.unshift({
        patient: patientName.value.trim(),
        type: attendanceType.value.trim(),
        date: attendanceDate.value,
        status: attendanceStatus.value.trim()
    });

    attendanceForm.reset();
    renderTable();
    patientName.focus();
    alert('Atendimento salvo com sucesso.');
});

recordsBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === 'remove') {
        const confirmed = confirm(`Remover o atendimento de "${records[index].patient}"?`);
        if (!confirmed) return;

        records.splice(index, 1);
        renderTable();
        return;
    }

    if (action === 'edit') {
        const nextPatient = prompt('Editar nome do paciente:', records[index].patient);
        if (nextPatient === null) return;

        const nextType = prompt('Editar tipo de atendimento:', records[index].type);
        if (nextType === null) return;

        const nextDate = prompt('Editar data (YYYY-MM-DD):', records[index].date);
        if (nextDate === null) return;

        const nextStatus = prompt('Editar status:', records[index].status);
        if (nextStatus === null) return;

        if (!nextPatient.trim() || !nextType.trim() || !nextDate.trim() || !nextStatus.trim()) {
            alert('Todos os campos são obrigatórios.');
            return;
        }

        records[index] = {
            patient: nextPatient.trim(),
            type: nextType.trim(),
            date: nextDate.trim(),
            status: nextStatus.trim()
        };

        renderTable();
    }
});

renderTable();
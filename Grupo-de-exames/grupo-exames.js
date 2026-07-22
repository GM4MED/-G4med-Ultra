const openModalBtn = document.getElementById('openModalBtn');
const dialog = document.getElementById('examDialog');
const closeButtons = document.querySelectorAll('[data-close-modal]');
const examInput = document.getElementById('examInput');
const addExamBtn = document.getElementById('addExamBtn');
const examList = document.getElementById('examList');
const emptyState = document.getElementById('emptyState');
const examCount = document.getElementById('examCount');
const confirmBtn = document.getElementById('confirmBtn');

let exams = [
    'Hemograma completo',
    'Glicemia em jejum',
    'Perfil lipídico'
];

let lastFocusedElement = null;

function validateExamName(value) {
    const clean = value.trim();
    if (!clean) return 'Informe o nome do exame.';
    if (clean.length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
    if (clean.length > 80) return 'O nome deve ter no máximo 80 caracteres.';
    return '';
}

function updateCount() {
    examCount.textContent = `${exams.length} item${exams.length === 1 ? '' : 's'}`;
    emptyState.hidden = exams.length > 0;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderExams() {
    examList.innerHTML = '';

    exams.forEach((exam, index) => {
        const li = document.createElement('li');
        li.className = 'exam-item';
        li.innerHTML = `
            <div class="exam-item__content">
                <span class="exam-item__title">${escapeHtml(exam)}</span>
                <span class="exam-item__meta">Exame ${index + 1}</span>
            </div>
            <div class="exam-item__actions">
                <button type="button" class="small-btn" data-action="edit" data-index="${index}">
                    Editar
                </button>
                <button type="button" class="small-btn small-btn--danger" data-action="remove" data-index="${index}">
                    Remover
                </button>
            </div>
        `;
        examList.appendChild(li);
    });

    updateCount();
}

function openModal() {
    lastFocusedElement = document.activeElement;
    dialog.showModal();
    document.body.classList.add('modal-open');
    renderExams();
    requestAnimationFrame(() => examInput.focus());
}

function closeModal() {
    if (dialog.open) {
        dialog.close();
    }
    document.body.classList.remove('modal-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
}

function addExam() {
    const error = validateExamName(examInput.value);

    if (error) {
        examInput.setCustomValidity(error);
        examInput.reportValidity();
        return;
    }

    examInput.setCustomValidity('');
    exams.push(examInput.value.trim());
    examInput.value = '';
    renderExams();
    examInput.focus();
}

openModalBtn.addEventListener('click', openModal);

closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
});

dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeModal();
});

dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedInside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

    if (!clickedInside) {
        closeModal();
    }
});

addExamBtn.addEventListener('click', addExam);

examInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        addExam();
    }
});

examList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;

    if (action === 'remove') {
        const confirmed = window.confirm(`Remover "${exams[index]}" do grupo?`);
        if (!confirmed) return;

        exams.splice(index, 1);
        renderExams();
        return;
    }

    if (action === 'edit') {
        const nextValue = window.prompt('Editar nome do exame:', exams[index]);
        if (nextValue === null) return;

        const error = validateExamName(nextValue);
        if (error) {
            window.alert(error);
            return;
        }

        exams[index] = nextValue.trim();
        renderExams();
    }
});

confirmBtn.addEventListener('click', () => {
    if (exams.length === 0) {
        window.alert('Adicione pelo menos um exame antes de confirmar.');
        return;
    }

    window.alert(`Grupo confirmado com ${exams.length} exame${exams.length === 1 ? '' : 's'}.`);
    closeModal();
});

renderExams();
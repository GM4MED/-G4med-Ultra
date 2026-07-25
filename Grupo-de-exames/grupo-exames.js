const examInput = document.getElementById("examInput");
const addExamBtn = document.getElementById("addExamBtn");
const examList = document.getElementById("examList");
const examCount = document.getElementById("examCount");
const emptyState = document.getElementById("emptyState");
const srFeedback = document.getElementById("srFeedback");
const frequentList = document.getElementById("frequentList");
const clearBtn = document.getElementById("clearBtn");
const cancelBtn = document.getElementById("cancelBtn");
const confirmBtn = document.getElementById("confirmBtn");

let exams = [];
let lastRemoved = null;
let editIndex = -1;

function normalizeText(text) {
    return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function setFeedback(message) {
    srFeedback.textContent = message;
}

function updateCount() {
    examCount.textContent = `${exams.length} ${exams.length === 1 ? "item" : "itens"}`;
}

function setEmptyStateVisible(visible) {
    emptyState.style.display = visible ? "grid" : "none";
}

function syncInputMode() {
    addExamBtn.textContent = editIndex >= 0 ? "Salvar" : "Adicionar";
    cancelBtn.textContent = editIndex >= 0 ? "Cancelar edição" : "Cancelar";
}

function renderList() {
    examList.innerHTML = "";

    if (exams.length === 0) {
        setEmptyStateVisible(true);
    } else {
        setEmptyStateVisible(false);

        exams.forEach((label, index) => {
            const li = document.createElement("li");
            li.className = "exam-item";
            li.innerHTML = `
        <span class="label">${escapeHtml(label)}</span>
        <div class="exam-item__actions">
          <button type="button" class="edit-btn" data-index="${index}">Editar</button>
          <button type="button" class="remove-btn" data-index="${index}" aria-label="Remover ${escapeHtml(label)}">
            Remover
          </button>
        </div>
      `;
            examList.appendChild(li);
        });
    }

    updateCount();
    syncInputMode();
}

function resetInput() {
    examInput.value = "";
    editIndex = -1;
    syncInputMode();
}

function findDuplicate(value, ignoreIndex = -1) {
    const target = normalizeText(value);
    return exams.findIndex((item, index) => index !== ignoreIndex && normalizeText(item) === target) !== -1;
}

function addOrUpdateExam(value) {
    const exam = value.trim();

    if (!exam) {
        setFeedback("Digite o nome do exame.");
        examInput.focus();
        return;
    }

    if (editIndex >= 0) {
        if (findDuplicate(exam, editIndex)) {
            setFeedback(`${exam} já está na lista.`);
            examInput.focus();
            return;
        }

        exams[editIndex] = exam;
        editIndex = -1;
        renderList();
        setFeedback(`${exam} atualizado.`);
        resetInput();
        examInput.focus();
        return;
    }

    if (findDuplicate(exam)) {
        setFeedback(`${exam} já está na lista.`);
        examInput.value = "";
        examInput.focus();
        return;
    }

    exams.push(exam);
    renderList();
    setFeedback(`${exam} adicionado.`);
    resetInput();
    examInput.focus();
}

function startEdit(index) {
    if (index < 0 || index >= exams.length) return;
    editIndex = index;
    examInput.value = exams[index];
    examInput.focus();
    examInput.select();
    syncInputMode();
    setFeedback(`Editando ${exams[index]}.`);
}

function removeExam(index) {
    if (index < 0 || index >= exams.length) return;

    const removed = exams.splice(index, 1)[0];
    lastRemoved = { value: removed, index };

    if (editIndex === index) {
        resetInput();
    } else if (editIndex > index) {
        editIndex -= 1;
    }

    renderList();
    setFeedback(`${removed} removido. Pressione desfazer para recuperar.`);
}

function restoreLastRemoved() {
    if (!lastRemoved) {
        setFeedback("Não há item para desfazer.");
        return;
    }

    const { value, index } = lastRemoved;
    const safeIndex = Math.min(index, exams.length);
    exams.splice(safeIndex, 0, value);
    lastRemoved = null;
    renderList();
    setFeedback(`${value} restaurado.`);
}

function filterFrequentTags(query) {
    const normalized = normalizeText(query);
    document.querySelectorAll(".tag").forEach((tag) => {
        const match = normalizeText(tag.textContent).includes(normalized);
        tag.style.display = match ? "" : "none";
    });
}

addExamBtn.addEventListener("click", () => {
    addOrUpdateExam(examInput.value);
});

examInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        addOrUpdateExam(examInput.value);
    }

    if (event.key === "Escape") {
        event.preventDefault();
        resetInput();
        examInput.blur();
        setFeedback("Entrada limpa.");
    }
});

examInput.addEventListener("input", () => {
    filterFrequentTags(examInput.value);
});

examList.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".remove-btn");
    const editBtn = event.target.closest(".edit-btn");

    if (removeBtn) {
        const index = Number(removeBtn.dataset.index);
        if (!Number.isNaN(index)) removeExam(index);
        return;
    }

    if (editBtn) {
        const index = Number(editBtn.dataset.index);
        if (!Number.isNaN(index)) startEdit(index);
    }
});

frequentList.addEventListener("click", (event) => {
    const tag = event.target.closest(".tag");
    if (!tag) return;
    addOrUpdateExam(tag.textContent);
});

clearBtn.addEventListener("click", () => {
    exams = [];
    lastRemoved = null;
    editIndex = -1;
    resetInput();
    renderList();
    setFeedback("Seleção limpa.");
    examInput.focus();
});

cancelBtn.addEventListener("click", () => {
    if (editIndex >= 0) {
        editIndex = -1;
        resetInput();
        renderList();
        setFeedback("Edição cancelada.");
    } else {
        examInput.value = "";
        setFeedback("Entrada cancelada.");
    }
    examInput.focus();
});

confirmBtn.addEventListener("click", () => {
    if (editIndex >= 0) {
        setFeedback("Finalize ou cancele a edição antes de confirmar.");
        examInput.focus();
        return;
    }

    if (exams.length === 0) {
        setFeedback("Nenhum exame selecionado para confirmar.");
        return;
    }

    const summary = exams.join(", ");
    setFeedback(`${exams.length} exames confirmados: ${summary}.`);
});

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        restoreLastRemoved();
    }
});

renderList();
filterFrequentTags("");
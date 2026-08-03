const procedures = [
    {
        id: 'consulta',
        name: 'Consulta',
        sub: 'Atendimento clínico',
        icon: `<path d="M12 3a6 6 0 0 1 6 6v2a6 6 0 0 1-12 0V9a6 6 0 0 1 6-6Z"/><path d="M8 19h8"/><path d="M10 22h4"/>`
    },
    {
        id: 'sangue',
        name: 'Exame de Sangue',
        sub: 'Laboratório',
        icon: `<path d="M12 3v4"/><path d="M10 7h4l1 8a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3l1-8Z"/><path d="M9 12c1.2 1 2.8 1 4 0"/>`
    },
    {
        id: 'rm',
        name: 'Ressonância Magnética',
        sub: 'Imagem médica',
        icon: `<path d="M7 12a5 5 0 1 1 10 0 5 5 0 0 1-10 0Z"/><path d="M4 12c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6Z"/><path d="M12 7v10"/>`
    },
    {
        id: 'rx',
        name: 'Raio-X',
        sub: 'Diagnóstico',
        icon: `<path d="M8 4h8l2 4v12H6V8l2-4Z"/><path d="M9 14h6"/><path d="M10 10h4"/>`
    },
    {
        id: 'tc',
        name: 'Tomografia',
        sub: 'Equipamento',
        icon: `<circle cx="12" cy="12" r="8"/><path d="M12 4v16"/><path d="M4 12h16"/><path d="M7 7l10 10"/><path d="M17 7 7 17"/>`
    },
    {
        id: 'us',
        name: 'Ultrassonografia',
        sub: 'Avaliação médica',
        icon: `<path d="M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"/><path d="M8 16c2-1 2-4 4-5s2 1 4 0"/><path d="M10 9c1 .5 2 1.5 2 3"/>`
    },
    {
        id: 'ecg',
        name: 'Eletrocardiograma',
        sub: 'Monitoramento',
        icon: `<path d="M3 12h4l2-5 3 10 2-6h7"/><path d="M4 19h16"/>`
    },
    {
        id: 'mais',
        name: 'Mais procedimentos',
        sub: 'Ver opções',
        icon: `<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>`
    },
];

const state = {
    selected: new Map(),
    frequent: new Set()
};

const frequentGrid = document.getElementById('frequentGrid');
const selectedState = document.getElementById('selectedState');
const selectedList = document.getElementById('selectedList');
const countBadge = document.getElementById('countBadge');
const removeSelectedBtn = document.getElementById('removeSelectedBtn');
const addSelectedBtn = document.getElementById('addSelectedBtn');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');
const toastArea = document.getElementById('toastArea');
const search = document.getElementById('procedureSearch');

function iconWrap(svg) {
    return `
    <div class="proc-ico bg-[#eef8f5] text-[#1b9a84]">
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        ${svg}
      </svg>
    </div>
  `;
}

function setLoading(button, loading, loadingText = 'Processando...') {
    if (!button) return;

    const label = button.querySelector('.btn-label');
    const spinner = button.querySelector('.btn-spinner');

    button.disabled = loading;

    if (label) {
        if (!button.dataset.originalLabel) {
            button.dataset.originalLabel = label.textContent;
        }
        label.textContent = loading ? loadingText : button.dataset.originalLabel;
    }

    if (spinner) spinner.classList.toggle('hidden', !loading);
}

function showToast(message, type = 'info') {
    if (!toastArea) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;

    toastArea.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('hidden');
    });

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
        setTimeout(() => toast.remove(), 250);
    }, 2200);
}

function renderFrequent(filter = '') {
    frequentGrid.innerHTML = '';

    const filtered = procedures.filter((p) =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.sub.toLowerCase().includes(filter.toLowerCase())
    );

    if (!filtered.length) {
        frequentGrid.innerHTML = `
      <div class="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Nenhum procedimento encontrado.
      </div>
    `;
        return;
    }

    filtered.forEach((p) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'procedure-card';
        btn.dataset.id = p.id;
        btn.dataset.procedure = p.name;

        const isSelected = state.frequent.has(p.id);
        if (isSelected) btn.classList.add('selected');

        btn.innerHTML = `
      ${iconWrap(p.icon)}
      <div class="min-w-0 flex-1">
        <div class="proc-title">${p.name}</div>
        <div class="proc-sub">${p.sub}</div>
      </div>
      <div class="text-slate-300">${isSelected ? '✓' : '+'}</div>
    `;

        btn.setAttribute('aria-pressed', String(isSelected));
        btn.title = isSelected ? `Remover ${p.name}` : `Adicionar ${p.name}`;

        btn.addEventListener('click', () => {
            if (state.frequent.has(p.id)) {
                state.frequent.delete(p.id);
            } else {
                state.frequent.add(p.id);
            }
            renderFrequent(search.value);
        });

        frequentGrid.appendChild(btn);
    });
}

function renderSelected() {
    const items = [...state.selected.values()];
    countBadge.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;

    if (items.length === 0) {
        selectedState.classList.remove('hidden');
        selectedList.classList.add('hidden');
        selectedList.innerHTML = '';
    } else {
        selectedState.classList.add('hidden');
        selectedList.classList.remove('hidden');
        selectedList.innerHTML = '';

        items.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'selected-item';
            row.innerHTML = `
        <div class="min-w-0">
          <div class="font-semibold text-slate-800">${item.name}</div>
          <div class="text-sm text-slate-500">${item.sub}</div>
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
          aria-label="Remover ${item.name}"
          title="Remover ${item.name}"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/>
            <path d="M8 6V4h8v2"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      `;

            row.querySelector('button').addEventListener('click', () => {
                state.selected.delete(item.id);
                renderSelected();
                showToast('Procedimento removido do grupo.', 'info');
            });

            selectedList.appendChild(row);
        });
    }

    removeSelectedBtn.disabled = items.length === 0;
    removeSelectedBtn.className = items.length === 0
        ? 'inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 font-medium text-slate-400'
        : 'inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 font-medium text-rose-600 transition hover:bg-rose-100';
}

function addFrequent() {
    if (!state.frequent.size) {
        showToast('Selecione ao menos um procedimento para adicionar.', 'error');
        return;
    }

    setLoading(addSelectedBtn, true, 'Adicionando...');

    setTimeout(() => {
        state.frequent.forEach((id) => {
            const p = procedures.find((x) => x.id === id);
            if (p) state.selected.set(p.id, p);
        });

        state.frequent.clear();
        renderFrequent(search.value);
        renderSelected();

        setLoading(addSelectedBtn, false);
        showToast('Procedimentos adicionados ao grupo.', 'success');
    }, 900);
}

function clearAll() {
    state.frequent.clear();
    state.selected.clear();
    renderFrequent(search.value);
    renderSelected();
}

search.addEventListener('input', (e) => {
    renderFrequent(e.target.value);
});

addSelectedBtn.addEventListener('click', addFrequent);

removeSelectedBtn.addEventListener('click', () => {
    if (!state.selected.size) {
        showToast('Não há procedimentos para remover.', 'error');
        return;
    }

    state.selected.clear();
    renderSelected();
    showToast('Procedimentos removidos.', 'success');
});

cancelBtn.addEventListener('click', () => {
    clearAll();
    showToast('Seleções limpas.', 'info');
});

confirmBtn.addEventListener('click', () => {
    if (!state.selected.size) {
        showToast('Adicione procedimentos antes de confirmar.', 'error');
        return;
    }

    setLoading(confirmBtn, true, 'Confirmando...');

    setTimeout(() => {
        setLoading(confirmBtn, false);
        showToast('Grupo de procedimentos criado com sucesso!', 'success');
    }, 1100);
});

renderFrequent();
renderSelected();
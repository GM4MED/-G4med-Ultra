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
const toast = document.getElementById('toast');
const search = document.getElementById('procedureSearch');

function iconWrap(svg) {
    return `
    <div class="proc-ico bg-[#eef8f5] text-[#1b9a84]">
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${svg}
      </svg>
    </div>
  `;
}

function toastMsg(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('opacity-100');

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
    }, 2200);
}

function renderFrequent(filter = '') {
    frequentGrid.innerHTML = '';

    procedures
        .filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(p => {
            const btn = document.createElement('button');
            btn.className = 'procedure-card';
            btn.dataset.id = p.id;

            if (state.frequent.has(p.id)) {
                btn.classList.add('selected');
            }

            btn.innerHTML = `
        ${iconWrap(p.icon)}
        <div class="flex-1 min-w-0">
          <div class="proc-title">${p.name}</div>
          <div class="proc-sub">${p.sub}</div>
        </div>
        <div class="text-slate-300">${state.frequent.has(p.id) ? '✓' : '+'}</div>
      `;

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
    } else {
        selectedState.classList.add('hidden');
        selectedList.classList.remove('hidden');
        selectedList.innerHTML = '';

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'selected-item';
            row.innerHTML = `
        <div>
          <div class="font-semibold text-slate-800">${item.name}</div>
          <div class="text-sm text-slate-500">${item.sub}</div>
        </div>
        <button class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-500" aria-label="Remover ${item.name}">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2">
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
            });

            selectedList.appendChild(row);
        });
    }

    removeSelectedBtn.disabled = items.length === 0;
    removeSelectedBtn.className = items.length === 0
        ? 'w-full h-12 rounded-2xl border border-slate-200 text-slate-400 bg-slate-50 font-medium flex items-center justify-center gap-2 cursor-not-allowed'
        : 'w-full h-12 rounded-2xl border border-rose-200 text-rose-600 bg-rose-50 font-medium flex items-center justify-center gap-2 hover:bg-rose-100 transition';
}

function addFrequent() {
    state.frequent.forEach(id => {
        const p = procedures.find(x => x.id === id);
        if (p) state.selected.set(p.id, p);
    });

    state.frequent.clear();
    renderFrequent(search.value);
    renderSelected();

    if (state.selected.size) {
        toastMsg('Procedimentos adicionados ao grupo.');
    }
}

function clearAll() {
    state.frequent.clear();
    state.selected.clear();
    renderFrequent(search.value);
    renderSelected();
}

search.addEventListener('input', e => {
    renderFrequent(e.target.value);
});

addSelectedBtn.addEventListener('click', addFrequent);

removeSelectedBtn.addEventListener('click', () => {
    if (state.selected.size > 0) {
        state.selected.clear();
        renderSelected();
        toastMsg('Procedimentos removidos.');
    }
});

cancelBtn.addEventListener('click', () => {
    clearAll();
    toastMsg('Seleções limpas.');
});

confirmBtn.addEventListener('click', () => {
    if (!state.selected.size) {
        toastMsg('Adicione procedimentos antes de confirmar.');
        return;
    }

    toastMsg('Grupo de procedimentos criado com sucesso!');
});

document.getElementById('toast').style.cssText = `
  position:fixed;
  left:50%;
  bottom:24px;
  transform:translateX(-50%);
  background:#0f172a;
  color:#fff;
  padding:14px 18px;
  border-radius:14px;
  box-shadow:0 12px 30px rgba(15,23,42,.18);
  z-index:60;
  transition:.25s;
`;

renderFrequent();
renderSelected();
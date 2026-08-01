document.addEventListener('DOMContentLoaded', () => {
    const groupButtons = document.querySelectorAll('.group-btn');
    const addGroupBtn = document.getElementById('addGroupBtn');
    const selectedEmpty = document.getElementById('selectedEmpty');
    const selectedList = document.getElementById('selectedList');
    const selectedCount = document.getElementById('selectedCount');
    const removeAllBtn = document.getElementById('removeAllBtn');
    const backBtn = document.getElementById('backBtn');

    let selectedGroup = 'Consulta';
    let selectedItems = [];

    const icons = {
        'Consulta': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 4v16M4 12h16" />
      </svg>
    `,
        'Retorno': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11H5l4-4" />
        <path d="M5 11a8 8 0 1 0 2-5.3" />
      </svg>
    `,
        'Triagem': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 12l5 5L20 6" />
      </svg>
    `,
        'Plantão': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v20" />
        <path d="M5 7h14" />
        <path d="M7 17h10" />
      </svg>
    `,
        'Emergência': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v5" />
        <path d="M12 17v5" />
        <path d="M5 12h5" />
        <path d="M14 12h5" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    `,
        'Telemedicina': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 6h16v10H7l-3 3z" />
      </svg>
    `,
        'Exame': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 4h14v16H5z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    `,
        'Mais grupos': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h.01M12 12h.01M19 12h.01" />
      </svg>
    `
    };

    function renderIcons() {
        groupButtons.forEach((button) => {
            const name = button.dataset.name;
            const slot = button.querySelector('.icon-slot');
            if (slot && icons[name]) {
                slot.innerHTML = icons[name];
            }
        });
    }

    function setActiveButton(name) {
        selectedGroup = name;

        groupButtons.forEach((button) => {
            button.classList.toggle('active-group', button.dataset.name === name);
        });
    }

    function updateCounter() {
        const count = selectedItems.length;
        selectedCount.textContent = `${count} item${count === 1 ? '' : 's'}`;
        removeAllBtn.disabled = count === 0;
    }

    function updateEmptyState() {
        const hasItems = selectedItems.length > 0;
        selectedEmpty.classList.toggle('hidden', hasItems);
        selectedList.classList.toggle('hidden', !hasItems);

        if (!hasItems) {
            selectedList.innerHTML = '';
        }
    }

    function renderSelectedItems() {
        selectedList.innerHTML = selectedItems.map((item, index) => `
      <div class="selected-item">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 4v16M4 12h16" />
            </svg>
          </div>
          <div>
            <div class="selected-item-title">${item}</div>
            <div class="selected-item-subtitle">Grupo selecionado</div>
          </div>
        </div>

        <button class="selected-remove" type="button" data-remove-index="${index}" aria-label="Remover grupo">
          <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    `).join('');

        document.querySelectorAll('[data-remove-index]').forEach((button) => {
            button.addEventListener('click', (event) => {
                const index = Number(event.currentTarget.dataset.removeIndex);
                selectedItems.splice(index, 1);
                renderSelectedItems();
                updateEmptyState();
                updateCounter();
            });
        });
    }

    groupButtons.forEach((button) => {
        button.addEventListener('click', () => {
            setActiveButton(button.dataset.name);
        });
    });

    addGroupBtn.addEventListener('click', () => {
        if (!selectedGroup) return;

        if (!selectedItems.includes(selectedGroup)) {
            selectedItems.push(selectedGroup);
            renderSelectedItems();
            updateEmptyState();
            updateCounter();
        }
    });

    removeAllBtn.addEventListener('click', () => {
        if (removeAllBtn.disabled) return;

        selectedItems = [];
        renderSelectedItems();
        updateEmptyState();
        updateCounter();
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    renderIcons();
    setActiveButton('Consulta');
    updateEmptyState();
    updateCounter();
});
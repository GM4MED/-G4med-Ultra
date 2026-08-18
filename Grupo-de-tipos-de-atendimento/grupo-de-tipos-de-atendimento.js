document.addEventListener('DOMContentLoaded', () => {
    // --- Elements Selection ---
    const modal = document.getElementById('newGroupModal');
    const openModalBtn = document.getElementById('openNewGroupModal');
    const closeModalBtn = document.getElementById('closeNewGroupModal');
    const cancelModalBtn = document.getElementById('cancelNewGroupBtn');
    const backdrop = document.getElementById('newGroupBackdrop');
    const form = document.getElementById('newGroupForm');
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('tableBody');
    const tableRows = Array.from(document.querySelectorAll('#tableBody tr'));
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');
    const paginationInfo = document.getElementById('paginationInfo');
    const nameInput = document.getElementById('groupName');
    const nameError = document.getElementById('groupNameError');
    const modalTitle = document.getElementById('newGroupTitle');

    // Novas referências para importação de catálogo
    const importCatalogBtn = document.getElementById('importCatalogBtn');
    const catalogFileInput = document.getElementById('catalogFileInput');

    // Referências para a Central de Ajuda (Help Modal)
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const closeHelpAction = document.getElementById('closeHelpAction');
    const helpBackdrop = document.getElementById('helpBackdrop');

    // Referências para Notificações (Notification Dropdown)
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const markAllRead = document.getElementById('markAllRead');
    const notificationBadge = document.getElementById('notificationBadge');

    let lastFocus = null;
    let currentPage = 1;
    const rowsPerPage = 5;
    let filteredRows = [...tableRows];

    // --- Import Catalog Logic ---
    if (importCatalogBtn && catalogFileInput) {
        importCatalogBtn.addEventListener('click', () => {
            catalogFileInput.click(); // Abre a janela de seleção de arquivos do sistema
        });

        catalogFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validação simples de extensão
            const validExtensions = ['csv', 'xlsx', 'json'];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (!validExtensions.includes(fileExtension)) {
                alert('Formato de arquivo inválido. Por favor, selecione um arquivo .csv, .xlsx ou .json.');
                catalogFileInput.value = '';
                return;
            }

            // Simulação de processamento de importação bem-sucedida
            alert(`Arquivo "${file.name}" carregado com sucesso! Processando importação do catálogo...`);

            // Reseta o input para permitir importar o mesmo arquivo novamente se precisar
            catalogFileInput.value = '';
        });
    }

    // --- Modal Management (Novo/Editar Grupo) ---
    function openModal() {
        lastFocus = document.activeElement;
        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        modal.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            const panel = modal.querySelector('[data-modal-panel]');
            if (panel) {
                panel.classList.remove('scale-95', 'translate-y-2');
                panel.classList.add('scale-100', 'translate-y-0');
            }
            if (nameInput) nameInput.focus();
        });
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        const panel = modal.querySelector('[data-modal-panel]');
        if (panel) {
            panel.classList.remove('scale-100', 'translate-y-0');
            panel.classList.add('scale-95', 'translate-y-2');
        }

        setTimeout(() => {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
            form.reset();
            if (nameError) nameError.style.display = 'none';
            if (nameInput) nameInput.classList.remove('border-red-500');
            if (lastFocus) lastFocus.focus();
        }, 200);
    }

    openModalBtn?.addEventListener('click', () => {
        if (modalTitle) modalTitle.textContent = 'Adicionar Novo Grupo de Atendimento';
        form.reset();
        openModal();
    });

    closeModalBtn?.addEventListener('click', closeModal);
    cancelModalBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    // --- Help Modal Logic ---
    function openHelpModal() {
        if (!helpModal) return;
        helpModal.classList.remove('hidden');
        helpModal.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => {
            helpModal.classList.remove('opacity-0');
            const panel = helpModal.querySelector('div.max-w-md');
            if (panel) {
                panel.classList.remove('scale-95', 'translate-y-2');
                panel.classList.add('scale-100', 'translate-y-0');
            }
        });
    }

    function closeHelpModalHandler() {
        if (!helpModal) return;
        helpModal.classList.add('opacity-0');
        const panel = helpModal.querySelector('div.max-w-md');
        if (panel) {
            panel.classList.remove('scale-100', 'translate-y-0');
            panel.classList.add('scale-95', 'translate-y-2');
        }
        setTimeout(() => {
            helpModal.classList.add('hidden');
            helpModal.setAttribute('aria-hidden', 'true');
        }, 200);
    }

    helpBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        // Fecha notificação se estiver aberta
        if (notificationDropdown && !notificationDropdown.classList.contains('hidden')) {
            notificationDropdown.classList.add('hidden', 'opacity-0', 'scale-95');
        }
        openHelpModal();
    });

    closeHelpModal?.addEventListener('click', closeHelpModalHandler);
    closeHelpAction?.addEventListener('click', closeHelpModalHandler);
    helpBackdrop?.addEventListener('click', closeHelpModalHandler);

    // --- Notification Dropdown Logic ---
    function toggleNotifications(e) {
        e.stopPropagation();
        if (!notificationDropdown) return;

        // Fecha modal de ajuda se estiver aberto
        if (helpModal && !helpModal.classList.contains('hidden')) {
            closeHelpModalHandler();
        }

        const isHidden = notificationDropdown.classList.contains('hidden');
        if (isHidden) {
            notificationDropdown.classList.remove('hidden');
            requestAnimationFrame(() => {
                notificationDropdown.classList.remove('opacity-0', 'scale-95');
                notificationDropdown.classList.add('opacity-100', 'scale-100');
            });
        } else {
            notificationDropdown.classList.remove('opacity-100', 'scale-100');
            notificationDropdown.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                notificationDropdown.classList.add('hidden');
            }, 200);
        }
    }

    notificationBtn?.addEventListener('click', toggleNotifications);

    markAllRead?.addEventListener('click', () => {
        if (notificationBadge) {
            notificationBadge.style.display = 'none';
        }
        const unreadDots = notificationDropdown.querySelectorAll('.bg-teal-600');
        unreadDots.forEach(dot => dot.remove());
    });

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', (e) => {
        if (notificationDropdown && !notificationDropdown.contains(e.target) && !notificationBtn?.contains(e.target)) {
            if (!notificationDropdown.classList.contains('hidden')) {
                notificationDropdown.classList.add('hidden', 'opacity-0', 'scale-95');
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal && !modal.classList.contains('hidden')) {
                closeModal();
            }
            if (helpModal && !helpModal.classList.contains('hidden')) {
                closeHelpModalHandler();
            }
            if (notificationDropdown && !notificationDropdown.classList.contains('hidden')) {
                notificationDropdown.classList.add('hidden', 'opacity-0', 'scale-95');
            }
        }
    });

    // --- Search & Feedback Updates ---
    function updateSearchFeedback() {
        const total = filteredRows.length;
        const start = total === 0 ? 0 : ((currentPage - 1) * rowsPerPage) + 1;
        const end = Math.min(currentPage * rowsPerPage, total);

        if (resultsCount) {
            resultsCount.textContent = `${total} de ${tableRows.length} grupos exibidos`;
        }
        if (paginationInfo) {
            paginationInfo.textContent = total > 0
                ? `Mostrando ${start}-${end} de ${tableRows.length} grupos`
                : 'Nenhum grupo encontrado';
        }
        if (emptyState) {
            emptyState.style.display = total === 0 ? 'block' : 'none';
        }
    }

    // --- Pagination Rendering ---
    function renderPagination(totalPages) {
        const controls = document.querySelector('.pagination-controls');
        if (!controls) return;

        const prevButtons = controls.querySelectorAll('[aria-label="Página anterior"], [aria-label="Primeira página"]');
        const nextButtons = controls.querySelectorAll('[aria-label="Próxima página"], [aria-label="Última página"]');
        const numericButtons = controls.querySelectorAll('.page-btn:not(.icon)');
        const ellipsis = controls.querySelector('.page-ellipsis');

        numericButtons.forEach(btn => btn.remove());
        if (ellipsis) ellipsis.remove();

        const leftDouble = prevButtons[0];
        const leftIcon = prevButtons[1];
        const rightIcon = nextButtons[0];
        const rightDouble = nextButtons[1];

        const fragment = document.createDocumentFragment();
        let visiblePages;

        if (totalPages <= 5) {
            visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else if (currentPage <= 3) {
            visiblePages = [1, 2, 3, 4, 'ellipsis', totalPages];
        } else if (currentPage >= totalPages - 2) {
            visiblePages = [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
            visiblePages = [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
        }

        visiblePages.forEach(item => {
            if (item === 'ellipsis') {
                const span = document.createElement('span');
                span.className = 'page-ellipsis';
                span.textContent = '...';
                fragment.appendChild(span);
                return;
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `page-btn focus-ring ${item === currentPage ? 'active' : ''}`;
            btn.textContent = item;
            btn.dataset.page = String(item);
            fragment.appendChild(btn);
        });

        if (rightIcon) {
            controls.insertBefore(fragment, rightIcon);
        } else {
            controls.appendChild(fragment);
        }

        const firstDisabled = currentPage === 1;
        const lastDisabled = currentPage === totalPages || totalPages === 0;

        if (leftDouble) leftDouble.disabled = firstDisabled;
        if (leftIcon) leftIcon.disabled = firstDisabled;
        if (rightIcon) rightIcon.disabled = lastDisabled;
        if (rightDouble) rightDouble.disabled = lastDisabled;
    }

    function renderTable() {
        const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageRows = filteredRows.slice(start, end);

        tableRows.forEach(row => row.remove());
        pageRows.forEach(row => tableBody.appendChild(row));

        updateSearchFeedback();
        renderPagination(totalPages);
    }

    function goToPage(page) {
        const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
        currentPage = Math.min(Math.max(1, page), totalPages);
        renderTable();
    }

    function applyFilter() {
        const term = searchInput ? searchInput.value.toLowerCase().trim() : '';
        filteredRows = tableRows.filter(row =>
            (row.getAttribute('data-search') || '').toLowerCase().includes(term) ||
            row.textContent.toLowerCase().includes(term)
        );
        currentPage = 1;
        renderTable();
    }

    // --- Pagination Controls Listener ---
    const paginationContainer = document.querySelector('.pagination-controls');
    if (paginationContainer) {
        paginationContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.page-btn');
            if (!btn || btn.disabled) return;

            const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
            const label = btn.getAttribute('aria-label');
            const page = btn.dataset.page ? Number(btn.dataset.page) : null;

            if (label === 'Primeira página') return goToPage(1);
            if (label === 'Página anterior') return goToPage(currentPage - 1);
            if (label === 'Próxima página') return goToPage(currentPage + 1);
            if (label === 'Última página') return goToPage(totalPages);
            if (page) return goToPage(page);
        });
    }

    // --- Form Submit Handler ---
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const valid = nameInput && nameInput.value.trim().length > 0;

        if (nameError) nameError.style.display = valid ? 'none' : 'block';
        if (!valid) {
            nameInput?.classList.add('border-red-500');
            nameInput?.focus();
            return;
        }

        nameInput?.classList.remove('border-red-500');
        alert('Grupo salvo com sucesso!');
        closeModal();
    });

    searchInput?.addEventListener('input', applyFilter);
    document.getElementById('backBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        history.back();
    });

    // --- Action Buttons Binding ---
    function bindActionButtons() {
        document.querySelectorAll('.js-edit').forEach((btn) => {
            btn.onclick = () => {
                if (modalTitle) modalTitle.textContent = 'Editar Grupo de Atendimento';
                if (nameInput) nameInput.value = btn.dataset.group || '';
                const descInput = document.getElementById('groupDescription');
                if (descInput) descInput.value = btn.dataset.description || '';
                const statusSelect = document.getElementById('groupStatus');
                if (statusSelect) statusSelect.value = btn.dataset.status || 'Ativo';
                if (nameError) nameError.style.display = 'none';
                openModal();
            };
        });

        document.querySelectorAll('.js-view').forEach((btn) => {
            btn.onclick = () => {
                alert(`Grupo: ${btn.dataset.group || ''}\nDescrição: ${btn.dataset.description || ''}\nStatus: ${btn.dataset.status || 'Ativo'}\nNº de Tipos de Atendimento: ${btn.dataset.count || '-'}`);
            };
        });

        document.querySelectorAll('.js-delete').forEach((btn) => {
            btn.onclick = () => {
                const group = btn.dataset.group || 'este grupo';
                if (confirm(`Tem certeza que deseja desativar ${group}?`)) {
                    const row = btn.closest('tr');
                    const statusDot = row?.querySelector('.status-dot');
                    if (statusDot) {
                        statusDot.classList.remove('status-active');
                        statusDot.classList.add('status-inactive');
                        statusDot.setAttribute('aria-label', 'Inativo');
                    }
                    alert('Grupo desativado com sucesso!');
                }
            };
        });
    }

    // Initial Execution
    bindActionButtons();
    applyFilter();
});
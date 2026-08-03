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
let lastFocus = null;
let currentPage = 1;
const rowsPerPage = 5;
let filteredRows = [...tableRows];

function openModal() {
    lastFocus = document.activeElement;
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        const panel = modal.querySelector('[data-modal-panel]');
        if (panel) panel.classList.add('scale-100', 'translate-y-0');
        if (nameInput) nameInput.focus();
    });
}

function closeModal() {
    modal.classList.add('opacity-0');
    const panel = modal.querySelector('[data-modal-panel]');
    if (panel) panel.classList.remove('scale-100', 'translate-y-0');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        if (lastFocus) lastFocus.focus();
    }, 200);
}

function updateSearchFeedback() {
    const total = filteredRows.length;
    const start = total === 0 ? 0 : ((currentPage - 1) * rowsPerPage) + 1;
    const end = Math.min(currentPage * rowsPerPage, total);
    if (resultsCount) resultsCount.textContent = `${total} de ${tableRows.length} grupos exibidos`;
    if (paginationInfo) paginationInfo.textContent = total > 0 ? `Mostrando ${start}-${end} de ${tableRows.length} grupos` : 'Nenhum grupo encontrado';
    if (emptyState) emptyState.style.display = total === 0 ? 'block' : 'none';
}

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
    if (totalPages <= 5) visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);
    else if (currentPage <= 3) visiblePages = [1, 2, 3, 4, 'ellipsis', totalPages];
    else if (currentPage >= totalPages - 2) visiblePages = [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    else visiblePages = [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
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
        btn.addEventListener('click', () => goToPage(item));
        fragment.appendChild(btn);
    });
    controls.insertBefore(fragment, rightIcon);
    const firstDisabled = currentPage === 1;
    const lastDisabled = currentPage === totalPages;
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
    const term = searchInput.value.toLowerCase().trim();
    filteredRows = tableRows.filter(row => (row.getAttribute('data-search') || '').toLowerCase().includes(term));
    currentPage = 1;
    renderTable();
}

openModalBtn?.addEventListener('click', openModal);
closeModalBtn?.addEventListener('click', closeModal);
cancelModalBtn?.addEventListener('click', closeModal);
backdrop?.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });
form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = nameInput && nameInput.value.trim().length > 0;
    if (nameError) nameError.style.display = valid ? 'none' : 'block';
    if (!valid) { nameInput?.focus(); return; }
    alert('Grupo salvo com sucesso!');
    form.reset();
    closeModal();
});
searchInput?.addEventListener('input', applyFilter);
document.getElementById('backBtn')?.addEventListener('click', () => history.back());

function bindActionButtons() {
    document.querySelectorAll('.js-edit').forEach((btn) => {
        btn.onclick = () => {
            document.getElementById('newGroupTitle').textContent = 'Editar Grupo de Atendimento';
            nameInput.value = btn.dataset.group || '';
            document.getElementById('groupDescription').value = btn.dataset.description || '';
            document.getElementById('groupStatus').value = btn.dataset.status || 'Ativo';
            nameError.style.display = 'none';
            openModal();
        };
    });

    document.querySelectorAll('.js-view').forEach((btn) => {
        btn.onclick = () => {
            alert(`Grupo: ${btn.dataset.group || ''}
Descrição: ${btn.dataset.description || ''}
Status: ${btn.dataset.status || 'Ativo'}
Nº de Tipos de Atendimento: ${btn.dataset.count || '-'}`);
        };
    });

    document.querySelectorAll('.js-delete').forEach((btn) => {
        btn.onclick = () => {
            const group = btn.dataset.group || 'este grupo';
            if (confirm(`Tem certeza que deseja desativar ${group}?`)) {
                alert('Grupo desativado com sucesso!');
            }
        };
    });
}

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

bindActionButtons();
applyFilter();
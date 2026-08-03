const allGroups = ['Consulta', 'Retorno', 'Triagem', 'Plantão', 'Emergência', 'Telemedicina', 'Exame', 'Pediatria', 'Cardiologia', 'Ortopedia', 'Clínica geral', 'Vacinação'];
const frequentNames = ['Consulta', 'Retorno', 'Triagem', 'Plantão', 'Emergência', 'Telemedicina', 'Exame'];
const selected = new Set();

const searchInput = document.getElementById('groupSearch');
const searchResults = document.getElementById('searchResults');
const noResults = document.getElementById('noResults');
const frequentGroups = document.getElementById('frequentGroups');
const selectedList = document.getElementById('selectedList');
const selectedEmpty = document.getElementById('selectedEmpty');
const selectedCount = document.getElementById('selectedCount');
const saveButton = document.getElementById('saveButton');
const statusMessage = document.getElementById('statusMessage');

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function announce(message) {
  statusMessage.textContent = '';
  window.setTimeout(() => { statusMessage.textContent = message; }, 30);
}

function createChip(name) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'chip';
  button.dataset.name = name;
  button.disabled = selected.has(name);
  button.setAttribute('aria-label', button.disabled ? name + ' já selecionado' : 'Adicionar ' + name);
  button.innerHTML = '<span>' + name + '</span><span class="chip-plus" aria-hidden="true">+</span>';
  button.addEventListener('click', () => addGroup(name));
  return button;
}

function renderFrequentGroups() {
  frequentGroups.replaceChildren(...frequentNames.map(createChip));
}

function renderSearchResults() {
  const query = normalize(searchInput.value);
  if (!query) {
    searchResults.classList.add('hidden');
    noResults.classList.add('hidden');
    searchResults.replaceChildren();
    searchInput.setAttribute('aria-expanded', 'false');
    return;
  }

  const matches = allGroups.filter(name => normalize(name).includes(query));
  searchResults.replaceChildren();
  noResults.classList.toggle('hidden', matches.length > 0);
  searchResults.classList.toggle('hidden', matches.length === 0);
  searchInput.setAttribute('aria-expanded', matches.length ? 'true' : 'false');

  matches.forEach((name, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.role = 'option';
    button.disabled = selected.has(name);
    button.className = 'focusable result-enter flex min-h-12 w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition last:border-0 hover:bg-teal-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
    button.style.animationDelay = (index * 25) + 'ms';
    button.setAttribute('aria-label', button.disabled ? name + ' já selecionado' : 'Adicionar ' + name);
    button.innerHTML = '<span>' + name + '</span><span class="text-teal-700" aria-hidden="true">' + (button.disabled ? 'Adicionado' : '+ Adicionar') + '</span>';
    button.addEventListener('click', () => addGroup(name));
    searchResults.appendChild(button);
  });
}

function createSelectedItem(name) {
  const li = document.createElement('li');
  li.className = 'item-enter flex min-h-[56px] items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-2 pl-4 shadow-sm';
  li.dataset.name = name;
  li.innerHTML = '<span class="min-w-0 truncate text-sm font-semibold text-slate-900">' + name + '</span>';

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-button grid h-11 w-11 shrink-0 place-items-center rounded-lg text-slate-600 transition hover:bg-red-50 hover:text-red-700';
  remove.setAttribute('aria-label', 'Remover ' + name);
  remove.innerHTML = '<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6m4-6v6"/></svg>';
  remove.addEventListener('click', () => removeGroup(name, li));
  li.appendChild(remove);
  return li;
}

function addGroup(name) {
  if (selected.has(name)) return;
  selected.add(name);
  selectedList.appendChild(createSelectedItem(name));
  updateUI();
  announce(name + ' adicionado aos grupos selecionados.');
}

function removeGroup(name, element) {
  element.classList.remove('item-enter');
  element.classList.add('item-leave');
  window.setTimeout(() => {
    selected.delete(name);
    element.remove();
    updateUI();
    announce(name + ' removido dos grupos selecionados.');
  }, 190);
}

function updateUI() {
  const count = selected.size;
  selectedCount.textContent = count + (count === 1 ? ' item' : ' itens');
  selectedEmpty.classList.toggle('hidden', count > 0);
  selectedList.classList.toggle('hidden', count === 0);
  saveButton.disabled = count === 0;
  renderFrequentGroups();
  renderSearchResults();
}

searchInput.addEventListener('input', renderSearchResults);
searchInput.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    searchInput.value = '';
    renderSearchResults();
  }
});

saveButton.addEventListener('click', () => {
  const groups = Array.from(selected);
  console.log('Grupos salvos:', groups);
  announce('Grupo salvo com ' + groups.length + (groups.length === 1 ? ' item.' : ' itens.'));
  alert('Grupo salvo com sucesso!');
});

renderFrequentGroups();
updateUI();

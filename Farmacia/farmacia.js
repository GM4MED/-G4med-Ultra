/* =========================================================
   GM4 · Farmácia Premium · JS
   ========================================================= */
(() => {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    /* ============ STATE ============ */
    const STORAGE_KEY = 'gm4_farmacia_v1';
    let items = loadItems([]);
    let saídas = 0;
    let movs = JSON.parse(localStorage.getItem('gm4_farmacia_movs') || '[]');
    let activeTab = 'estoque';

    /* ============ SEED DATA ============ */
    function seedData() {
        const today = new Date().toISOString().slice(0, 10);
        const addD = d => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().slice(0, 10); };
        return [
            { id: 1, cod: 'MED-001', nome: 'Dipirona Sódica 500mg 20cp', categoria: 'Medicamento', lote: 'A24012', validade: addD(180), qtd: 142, min: 20, unidade: 'Caixa', fabricante: 'EMS', controlado: false, movs: [] },
            { id: 2, cod: 'MED-002', nome: 'Amoxicilina 500mg 15cp', categoria: 'Medicamento', lote: 'B23088', validade: addD(20), qtd: 18, min: 15, unidade: 'Caixa', fabricante: 'Aché', controlado: false, movs: [] },
            { id: 3, cod: 'MED-003', nome: 'Paracetamol 750mg 20cp', categoria: 'Medicamento', lote: 'C24004', validade: addD(90), qtd: 312, min: 30, unidade: 'Caixa', fabricante: 'Neo Química', controlado: false, movs: [] },
            { id: 4, cod: 'MES-001', nome: 'Luva Procedimento Nitrílica M 100un', categoria: 'Descartável', lote: 'D24001', validade: addD(365), qtd: 2400, min: 200, unidade: 'Caixa', fabricante: 'Pro Safety', controlado: false, movs: [] },
            { id: 5, cod: 'MES-002', nome: 'Máscara Cirúrgica Tripla 50un', categoria: 'Descartável', lote: 'E23041', validade: addD(-5), qtd: 48, min: 50, unidade: 'Caixa', fabricante: 'Medix', controlado: false, movs: [] },
            { id: 6, cod: 'CST-001', nome: 'Soro Fisiológico 0,9% 500ml', categoria: 'Cirúrgico', lote: 'F23020', validade: addD(15), qtd: 82, min: 40, unidade: 'Frasco', fabricante: 'JP Farma', controlado: false, movs: [] },
            { id: 7, cod: 'MED-C01', nome: 'Tramadol 50mg 10cp (CII)', categoria: 'Medicamento', lote: 'G24005', validade: addD(120), qtd: 28, min: 10, unidade: 'Caixa', fabricante: 'Cristália', controlado: true, movs: [] },
            { id: 8, cod: 'MED-C02', nome: 'Rivotril 2mg 30cp (B1)', categoria: 'Medicamento', lote: 'H23099', validade: addD(-12), qtd: 6, min: 5, unidade: 'Caixa', fabricante: 'Roche', controlado: true, movs: [] },
        ];
    }

    function loadItems(fallback) {
        try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (d && d.length) return d; } catch { }
        return fallback;
    }
    function saveItems() { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

    /* ============ HELPERS ============ */
    function daysDiff(iso) {
        if (!iso) return 999;
        const a = new Date(); a.setHours(0, 0, 0, 0);
        const b = new Date(iso); b.setHours(0, 0, 0, 0);
        return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
    }
    function statusOf(it) {
        const dd = daysDiff(it.validade);
        if (dd < 0) return { cls: 'danger', label: 'Vencido' };
        if (dd <= 30) return { cls: 'warn', label: 'Vence em ' + dd + 'd' };
        if (it.qtd <= it.min) return { cls: 'warn', label: 'Estoque Baixo' };
        return { cls: 'ok', label: 'OK' };
    }
    function counter(el, target, prefix = '', sufix = '') {
        const dur = 1200, start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
            el.textContent = prefix + v.toLocaleString('pt-BR') + sufix;
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
    function toast(msg, type = 'ok') {
        const el = document.createElement('div');
        el.className = 'toast ' + type;
        el.textContent = msg;
        (document.body.appendChild(el));
        setTimeout(() => el.style.opacity = '0', 3000);
        setTimeout(() => el.remove(), 3400);
    }

    /* ============ KPIs ============ */
    function updateKPIs() {
        $('#totalItens').textContent = items.length;
        $('#estoqueBaixo').textContent = items.filter(it => it.qtd <= it.min).length;
        $('#vencendo').textContent = items.filter(it => daysDiff(it.validade) <= 30).length;
        $('#saidasHoje').textContent = saídas;
    }
    function animateKPIs() {
        counter($('#totalItens'), items.length);
        counter($('#estoqueBaixo'), items.filter(it => it.qtd <= it.min).length);
        counter($('#vencendo'), items.filter(it => daysDiff(it.validade) <= 30).length);
        counter($('#saidasHoje'), saídas);
    }

    /* ============ TABLE ============ */
    function renderTable(filter = '', catFilter = '') {
        const tbody = $('#corpoTabelaEstoque');
        const list = items.filter(it => {
            const matchesFilter = !filter || it.nome.toLowerCase().includes(filter.toLowerCase()) || it.lote.toLowerCase().includes(filter.toLowerCase()) || it.cod.toLowerCase().includes(filter.toLowerCase());
            const matchesCat = !catFilter || it.categoria === catFilter;
            if (activeTab === 'controlados') return matchesFilter && matchesCat && it.controlado;
            return matchesFilter && matchesCat;
        });
        tbody.innerHTML = list.map(it => {
            const st = statusOf(it);
            const dd = daysDiff(it.validade);
            return `
    <tr data-id="${it.id}">
      <td><b style="font-family:monospace;font-size:12.5px;color:var(--ink-2)">${it.cod}</b></td>
      <td><strong style="font-size:13.5px">${it.nome}</strong><br><small style="color:var(--ink-3)">${it.fabricante || ''}</small></td>
      <td>${it.categoria}${it.controlado ? '<span style="color:var(--danger);font-weight:700;margin-left:6px;font-size:11px">● CII</span>' : ''}</td>
      <td style="font-family:monospace;font-size:12.5px">${it.lote}</td>
      <td><span style="color:${dd < 0 ? 'var(--danger)' : dd <= 30 ? 'var(--warn)' : 'var(--ink-3)'};font-weight:600">${it.validade.split('-').reverse().join('/')}</span></td>
      <td><b style="font-family:monospace;font-size:14px">${it.qtd}</b> <small style="color:var(--ink-3)">${it.unidade}</small></td>
      <td><span class="status-badge ${st.cls}">${st.label}</span></td>
      <td>
        <div class="actions">
          <button class="btn edit" onclick="app.edit(${it.id})" title="Editar"><i class="fas fa-pen"></i></button>
          <button class="btn btn-success" onclick="app.entrada(${it.id})" title="Entrada"><i class="fas fa-plus"></i></button>
          <button class="btn btn-danger" onclick="app.saída(${it.id})" title="Saída"><i class="fas fa-minus"></i></button>
          <button class="btn delete" onclick="app.del(${it.id})" title="Excluir"><i class="fas fa-trash-alt"></i></button>
        </div>
      </td>
    </tr>`;
        }).join('') || `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--ink-3);font-size:13.5px">Nenhum item encontrado.</td></tr>`;
        updateKPIs();
    }

    /* ============ TABS ============ */
    function openTab(evt, tabName) {
        activeTab = tabName;
        $('.tab-link.active')?.classList.remove('active');
        evt.target.classList.add('active');
        renderTableFilter();
    }

    /* ============ MODAL ============ */
    let editingId = null;

    function openModal(editItem = null) {
        editingId = editItem ? editItem.id : null;
        $('#nomeItem').value = editItem ? editItem.nome : '';
        $('#categoriaItem').value = editItem ? editItem.categoria : 'Medicamento';
        $('#fabricante').value = editItem ? (editItem.fabricante || '') : '';
        $('#lote').value = editItem ? editItem.lote : '';
        $('#validade').value = editItem ? editItem.validade : '';
        $('#quantidade').value = editItem ? editItem.qtd : 0;
        $('#estoqueMinimo').value = editItem ? editItem.min : 10;
        $('#unidade').value = editItem ? editItem.unidade : 'Caixa';
        $('.modal-content h2').innerHTML = editItem ? '<i class="fas fa-pen"></i> Editar Item' : '<i class="fas fa-prescription-bottle-alt"></i> Cadastro de Item';
        $('#modalItem').hidden = false;
    }
    function closeModal() { $('#modalItem').hidden = true; editingId = null; }

    function bindModal() {
        $('#btnNovoItem').addEventListener('click', () => openModal());
        $('#btnEntrada').addEventListener('click', () => openModal());
        $('.close-modal').addEventListener('click', closeModal);
        $('#modalItem').addEventListener('click', e => { if (e.target.closest('.modal-content')) return; closeModal(); });
        $(".btn-cancel").addEventListener('click', closeModal);
    }

    /* ============ CRUD ============ */
    function onSubmit(e) {
        e.preventDefault();
        const novo = {
            id: editingId || (Math.max(0, ...items.map(i => i.id)) + 1),
            cod: editingId ? items.find(i => i.id === editingId)?.cod : 'MED-' + String(Math.max(0, ...items.map(i => parseInt((i.cod || '').split('-')[1]) || 0)) + 1).padStart(3, '0'),
            nome: $('#nomeItem').value.trim(),
            categoria: $('#categoriaItem').value,
            fabricante: $('#fabricante').value.trim(),
            lote: $('#lote').value.trim(),
            validade: $('#validade').value,
            qtd: +$('#quantidade').value || 0,
            min: +$('#estoqueMinimo').value || 10,
            unidade: $('#unidade').value,
            controlado: $('#categoriaItem').value.includes('Controlado') || $('#nomeItem').value.toLowerCase().includes('tramadol') || $('#nomeItem').value.toLowerCase().includes('rivotril'),
            movs: editingId ? (items.find(i => i.id === editingId)?.movs || []) : [],
        };
        if (editingId) {
            const idx = items.findIndex(i => i.id === editingId);
            if (idx >= 0) items[idx] = novo;
            toast('Item atualizado!');
        } else {
            items.unshift(novo);
            toast('Item cadastrado!');
        }
        saveItems(); closeModal(); renderTableFilter();
    }

    function entrada(id) {
        const n = prompt('Quantidade de entrada:');
        if (!n || isNaN(+n)) return;
        const it = items.find(i => i.id === id); if (!it) return;
        it.qtd += +n;
        it.movs.unshift({ tipo: 'entrada', qtd: +n, when: new Date().toLocaleString('pt-BR'), user: 'Sistema' });
        saveItems(); animateKPIs(); renderTableFilter();
        toast(`+${n} ${it.unidade} de ${it.nome} entrada`);
    }
    function saída(id) {
        const n = prompt('Quantidade de saída:');
        if (!n || isNaN(+n)) return;
        const it = items.find(i => i.id === id); if (!it) return;
        if (it.qtd < +n) { toast('Saldo insuficiente!', 'warn'); return; }
        it.qtd -= +n; saídas += +n;
        it.movs.unshift({ tipo: 'saída', qtd: +n, when: new Date().toLocaleString('pt-BR'), user: 'Sistema' });
        saveItems(); animateKPIs(); renderTableFilter();
        toast(`-${n} ${it.unidade} de ${it.nome} saída`);
    }
    function del(id) {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;
        items = items.filter(i => i.id !== id);
        saveItems(); animateKPIs(); renderTableFilter();
        toast('Item excluído.');
    }
    function edit(id) { const it = items.find(i => i.id === id); if (it) openModal(it); }

    /* ============ FILTERS ============ */
    function renderTableFilter() { renderTable($('input[type="text"][placeholder*="nome"]').value, $('#filtroCategoria').value); }

    /* ============ EXPORT ============ */
    const app = { openModal, closeModal, onSubmit, entrada, saída, del, edit, move: movs, items };
    window.app = app;
    window.openTab = openTab;

    /* ============ INIT ============ */
    function init() {
        if (!items.length) {
            items = seedData();
            saveItems();
        }
        bindModal();
        $('#formItem').addEventListener('submit', onSubmit);
        $('input[type="text"][placeholder*="nome"]').addEventListener('input', renderTableFilter);
        $('#filtroCategoria').addEventListener('change', renderTableFilter);
        renderTableFilter();
        animateKPIs();
        toast('Farmácia carregada — ' + items.length + ' itens no estoque', 'ok');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

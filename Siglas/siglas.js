(() => {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const KEY = 'g4med_siglas_v2';
    let data = loadData();
    let editingId = null;
    let selectedId = null;

    function seed() {
        return [
            { id: 1, sigla: 'AMB', obs: 'Ambulatório', status: 'ativo', created: '04/06/2026 14:32' },
            { id: 2, sigla: 'SUS', obs: 'Sistema Único de Saúde', status: 'ativo', created: '04/06/2026 14:35' },
            { id: 3, sigla: 'TCE', obs: 'Tromboembolismo Venoso', status: 'ativo', created: '04/06/2026 14:38' },
            { id: 4, sigla: 'UTI', obs: 'Unidade de Terapia Intensiva', status: 'ativo', created: '04/06/2026 14:40' },
            { id: 5, sigla: 'AIH', obs: 'Autorização de Internação Hospitalar', status: 'inativo', created: '04/06/2026 14:42' },
            { id: 6, sigla: 'APAC', obs: 'Autorização de Procedimento de Alta Complexidade', status: 'ativo', created: '04/06/2026 14:45' },
            { id: 7, sigla: 'BPA', obs: 'Boletim de Produção Ambulatorial', status: 'ativo', created: '04/06/2026 14:48' },
            { id: 8, sigla: 'CID', obs: 'Classificação Internacional de Doenças', status: 'ativo', created: '04/06/2026 14:50' },
        ];
    }
    function loadData() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.length) return d; } catch { } return seed(); }
    function saveData() { localStorage.setItem(KEY, JSON.stringify(data)); }

    function nowStr() {
        const n = new Date();
        return String(n.getDate()).padStart(2, '0') + '/' + String(n.getMonth() + 1).padStart(2, '0') + '/' + n.getFullYear() + ' ' + String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
    }
    function toast(title, msg = '', type = 'ok') {
        const icons = { ok: 'check-circle-2', warn: 'alert-triangle', danger: 'x-circle', info: 'info' };
        const el = document.createElement('div');
        el.className = 'toast ' + type;
        el.innerHTML = `<i data-lucide="${icons[type]}"></i><div><strong>${title}</strong>${msg ? `<span>${msg}</span>` : ''}</div>`;
        $('#toastBox').appendChild(el);
        lucide.createIcons();
        setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)' }, 3200);
        setTimeout(() => el.remove(), 3700);
    }

    function updateKPIs() {
        $('#kpiTotal').textContent = data.length;
        $('#kpiAtivas').textContent = data.filter(d => d.status === 'ativo').length;
        $('#kpiInativas').textContent = data.filter(d => d.status === 'inativo').length;
        const last = data.sort((a, b) => (b.id || 0) - (a.id || 0))[0];
        $('#kpiLast').textContent = last ? (last.sigla || '—') : '—';
    }

    function setMode(mode) {
        const isEdit = mode === 'edit';
        $('#formTitle').textContent = isEdit ? 'Editar Sigla' : 'Nova Sigla';
        $('#formMode').innerHTML = isEdit ? 'Modo: <b>Edição</b>' : 'Modo: <b>Inserção</b>';
        $('#formCard').classList.toggle('edit-mode', isEdit);
    }
    function resetForm() {
        $('#siglaForm').reset();
        $('#idSigla').value = '';
        editingId = null; selectedId = null;
        setMode('insert');
        $$('.data-table tr').forEach(r => r.classList.remove('selected'));
    }
    function fillForm(item) {
        $('#idSigla').value = item.id;
        $('#sigla').value = item.sigla;
        $('#status').value = item.status;
        $('#obs').value = item.obs || '';
        editingId = item.id;
        setMode('edit');
    }

    function renderTable(filter = '', statusFilter = '') {
        const tbody = $('#corpoTabela');
        const list = data.filter(d => {
            const matches = !filter || d.sigla.toLowerCase().includes(filter.toLowerCase()) || (d.obs || '').toLowerCase().includes(filter.toLowerCase());
            const st = !statusFilter || d.status === statusFilter;
            return matches && st;
        }).sort((a, b) => (a.sigla || '').localeCompare(b.sigla || ''));

        tbody.innerHTML = list.map(d => `
    <tr data-id="${d.id}" class="${d.id === selectedId ? 'selected' : ''}">
      <td><b style="font-family:'JetBrains Mono',monospace;font-size:12.5px">${d.id}</b></td>
      <td><strong style="font-size:14px;color:var(--brand)">${d.sigla}</strong></td>
      <td>${d.obs || '—'}</td>
      <td><span class="status-badge ${d.status === 'ativo' ? 'ok' : 'warn'}">${d.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
      <td style="font-size:12px;color:var(--ink3);font-family:'JetBrains Mono',monospace">${d.created}</td>
      <td>
        <div class="actions">
          <button class="btn edit" data-edit="${d.id}" title="Editar"><i data-lucide="pencil"></i></button>
          <button class="btn delete" data-del="${d.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>
  `).join('') || `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--ink3);font-size:13.5px">Nenhuma sigla encontrada.</td></tr>`;

        $('#showing').textContent = list.length;
        $('#totalRows').textContent = data.length;
        updateKPIs();
        lucide.createIcons();

        $$('.data-table tbody tr[data-id]').forEach(tr => {
            tr.addEventListener('click', e => {
                if (e.target.closest('button')) return;
                const id = +tr.dataset.id;
                selectedId = id;
                $$('.data-table tr').forEach(r => r.classList.remove('selected'));
                tr.classList.add('selected');
                const item = data.find(d => d.id === id);
                if (item) fillForm(item);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        $$('[data-edit]').forEach(b => b.addEventListener('click', e => {
            e.stopPropagation();
            const id = +b.dataset.edit;
            const item = data.find(d => d.id === id);
            if (item) { selectedId = id; fillForm(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        }));

        $$('[data-del]').forEach(b => b.addEventListener('click', e => {
            e.stopPropagation();
            const id = +b.dataset.del;
            const item = data.find(d => d.id === id);
            if (!item) return;
            $('#delName').textContent = item.sigla;
            $('#delModal').hidden = false;
            $('#delConfirm').onclick = () => {
                data = data.filter(d => d.id !== id);
                saveData(); renderTable($('#searchSigla').value, $('#filtroStatus').value);
                if (editingId === id) resetForm();
                $('#delModal').hidden = true;
                toast('Sigla excluída', `${item.sigla} removida com sucesso`, 'ok');
            };
        }));
    }

    function onSubmit(e) {
        e.preventDefault();
        const sigla = $('#sigla').value.trim().toUpperCase();
        const obs = $('#obs').value.trim();
        const status = $('#status').value;

        if (!sigla) { toast('Campo obrigatório', 'Informe a sigla', 'warn'); $('#sigla').focus(); return; }
        if (sigla.length > 20) { toast('Sigla muito longa', 'Máximo 20 caracteres', 'warn'); return; }

        const dup = data.find(d => d.sigla === sigla && d.id !== editingId);
        if (dup) { toast('Sigla duplicada', `"${sigla}" já existe (ID #${dup.id})`, 'warn'); return; }

        if (editingId) {
            const idx = data.findIndex(d => d.id === editingId);
            if (idx >= 0) {
                data[idx] = { ...data[idx], sigla, obs, status };
                saveData();
                renderTable($('#searchSigla').value, $('#filtroStatus').value);
                toast('Sigla atualizada', `${sigla} salva com sucesso`, 'ok');
            }
        } else {
            const novo = {
                id: Math.max(0, ...data.map(d => d.id)) + 1,
                sigla, obs, status,
                created: nowStr()
            };
            data.push(novo);
            saveData();
            renderTable($('#searchSigla').value, $('#filtroStatus').value);
            toast('Sigla criada', `${sigla} cadastrada com sucesso`, 'ok');
        }
        resetForm();
    }

    function exportCSV() {
        const headers = ['ID', 'Sigla', 'Observacao', 'Status', 'Criado em'];
        const rows = data.map(d => [d.id, d.sigla, d.obs || '', d.status, d.created]);
        const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `siglas-g4med-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast('Exportado', 'Arquivo CSV gerado', 'ok');
    }

    function bind() {
        if (localStorage.getItem('g4med-theme') === 'dark') {
            document.documentElement.dataset.theme = 'dark';
            $('#toggleTheme i')?.setAttribute('data-lucide', 'sun');
        }
        $('#toggleTheme').addEventListener('click', () => {
            const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = cur;
            localStorage.setItem('g4med-theme', cur);
            $('#toggleTheme i').setAttribute('data-lucide', cur === 'dark' ? 'sun' : 'moon');
            lucide.createIcons();
            toast(`Tema ${cur === 'dark' ? 'escuro' : 'claro'} ativado`);
        });

        $('#siglaForm').addEventListener('submit', onSubmit);
        $('#btnCancelar').addEventListener('click', resetForm);
        $('#btnNovo')?.addEventListener('click', resetForm);

        $('#sigla').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase() });

        $('#obs').addEventListener('input', e => {
            $('#obsLen').textContent = e.target.value.length;
            if (e.target.value.length > 500) e.target.value = e.target.value.slice(0, 500);
        });

        $('#searchSigla').addEventListener('input', e => renderTable(e.target.value, $('#filtroStatus').value));
        $('#filtroStatus').addEventListener('change', e => renderTable($('#searchSigla').value, e.target.value));

        $('#btnExport').addEventListener('click', exportCSV);
        $('#btnPrint').addEventListener('click', () => window.print());

        $('#delCancel').addEventListener('click', () => $('#delModal').hidden = true);
        $('#delModal').addEventListener('click', e => { if (e.target === $('#delModal')) $('#delModal').hidden = true; });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !$('#delModal').hidden) $('#delModal').hidden = true;
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && document.activeElement !== $('#obs')) {
                e.preventDefault(); $('#siglaForm').dispatchEvent(new Event('submit'));
            }
        });
    }

    function init() {
        lucide.createIcons();
        renderTable();
        updateKPIs();
        bind();
        setTimeout(() => toast('Cadastro de Siglas carregado', `${data.length} registros no banco`, 'ok'), 300);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

(() => {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    /* STATE */
    const STORAGE_KEY = 'g4med_logs';
    let LOGS = loadData();
    let autoRefresh = true;
    let refreshInterval = null;

    /* SEED DATA */
    function seed() {
        const ago = (m, h) => { const d = new Date(); d.setMinutes(d.getMinutes() - m); d.setHours(d.getHours() - h); return fmt(d); };
        const users = ['admin', 'dr.rodrigo', 'dra.ana', 'atendente.joao', 'atendente.maria', 'financeiro.paulo'];
        const ips = ['192.168.1.10', '192.168.1.22', '192.168.1.34', '10.0.0.45', '10.0.0.51'];
        const devices = ['Chrome 124 · Windows 11', 'Firefox 126 · macOS 14', 'Safari 17 · iOS 17', 'Edge 124 · Windows 10', 'Chrome 124 · Android 14'];
        const sessions = ['sess_2a4b8c1d', 'sess_7e9f3a2b', 'sess_1c5d8e4f', 'sess_9b2c7d5e', 'sess_4f8a1c3e'];
        return [
            { id: 1001, time: '00:45', datetime: ago(45, 0), user: 'admin', type: 'login', module: 'Sistema', sev: 'info', desc: 'Login realizado com sucesso', ip: ips[0], session: sessions[0], device: devices[0], payload: { user: 'admin', method: 'password', mfa: true } },
            { id: 1000, time: '00:42', datetime: ago(42, 0), user: 'dr.rodrigo', type: 'update', module: 'Paciente', sev: 'info', desc: 'Paciente #4281 atualizado: telefone alterado', ip: ips[1], session: sessions[1], device: devices[1], payload: { id: 4281, field: 'telefone', old: '(11) 98765-4321', new: '(11) 91234-5678', patient: 'Maria Silva' } },
            { id: 999, time: '00:38', datetime: ago(38, 0), user: 'atendente.joao', type: 'create', module: 'Agenda', sev: 'info', desc: 'Consulta marcada: Dr. Ricardo → paciente #4156', ip: ips[2], session: sessions[2], device: devices[2], payload: { agendaId: 1247, hora: '14:30', medico: 'Dr. Ricardo', paciente: 'Carlos Souza', data: '05/06/2026' } },
            { id: 998, time: '00:35', datetime: ago(35, 0), user: 'atendente.maria', type: 'delete', module: 'Atendimento', sev: 'warn', desc: 'Atendimento #1842 cancelado pelo usuário', ip: ips[3], session: sessions[3], device: devices[3], payload: { id: 1842, motivo: 'Cancelamento por paciente', data: '05/06/2026 09:00' } },
            { id: 997, time: '00:28', datetime: ago(28, 0), user: 'financeiro.paulo', type: 'create', module: 'Financeiro', sev: 'info', desc: 'Pagamento recebido: R$ 384,00 via PIX', ip: ips[4], session: sessions[4], device: devices[4], payload: { valor: 384, forma: 'PIX', paciente: 'Ana Beatriz', protocolo: '#PAG-88342' } },
            { id: 996, time: '00:22', datetime: ago(22, 0), user: 'dra.ana', type: 'update', module: 'Prontuário', sev: 'info', desc: 'Prontuário #3821 editado: receita adicionada', ip: ips[1], session: sessions[1], device: devices[1], payload: { prontuarioId: 3821, medicamentos: ['Dipirona 500mg', 'Amoxicilina 500mg'], paciente: 'João Pereira' } },
            { id: 995, time: '00:18', datetime: ago(18, 0), user: 'admin', type: 'create', module: 'Usuário', sev: 'info', desc: 'Usuário "financeiro.lucas" criado com perfil Financeiro', ip: ips[0], session: sessions[0], device: devices[0], payload: { novoUser: 'financeiro.lucas', perfil: 'Financeiro', email: 'lucas@g4med.com' } },
            { id: 994, time: '00:12', datetime: ago(12, 0), user: 'dr.rodrigo', type: 'export', module: 'Relatório', sev: 'info', desc: 'Exportação CSV: Relatório de Atendimentos (maio/2026)', ip: ips[1], session: sessions[1], device: devices[1], payload: { relatorio: 'Atendimentos', periodo: 'maio/2026', registros: 1248 } },
            { id: 993, time: '00:08', datetime: ago(8, 0), user: 'admin', type: 'update', module: 'Configuração', sev: 'warn', desc: 'Configuração de notificações alterada: SMS desativado', ip: ips[0], session: sessions[0], device: devices[0], payload: { modulo: 'notificacoes', campo: 'sms_habilitado', valor: 'false', antigo: 'true' } },
            { id: 992, time: '00:04', datetime: ago(4, 0), user: 'financeiro.paulo', type: 'delete', module: 'Financeiro', sev: 'critical', desc: 'Exclusão de fatura #8821 — REQUER APROVAÇÃO', ip: ips[4], session: sessions[4], device: devices[4], payload: { faturaId: 8821, valor: 1200, requerAprovacao: true } },
            { id: 991, time: '23:52', datetime: ago(30, 3), user: 'atendente.joao', type: 'login', module: 'Sistema', sev: 'warn', desc: 'Tentativa de login com senha incorreta (3ª tentativa)', ip: ips[2], session: sessions[2], device: devices[2], payload: { user: 'atendente.joao', tentativas: 3, timeoutAte: '00:22' } },
            { id: 990, time: '23:45', datetime: ago(45, 3), user: 'dra.ana', type: 'update', module: 'Agenda', sev: 'info', desc: 'Agenda bloqueada: feriado 07/06 (D+2)', ip: ips[1], session: sessions[1], device: devices[1], payload: { data: '07/06/2026', medico: 'Dr. Ricardo', unidade: 'Itaim Bibi' } },
            { id: 989, time: '23:30', datetime: ago(0, 4), user: 'dr.rodrigo', type: 'create', module: 'Prescrição', sev: 'info', desc: 'Prescrição gerada para paciente #4281', ip: ips[1], session: sessions[1], device: devices[1], payload: { prescricaoId: 4821, medicamentos: 3, duracao: '7 dias' } },
            { id: 988, time: '23:15', datetime: ago(4, 4), user: 'financeiro.paulo', type: 'error', module: 'Financeiro', sev: 'error', desc: 'Erro ao processar conciliação: gateway Amil indisponível', ip: ips[4], session: sessions[4], device: devices[4], payload: { gateway: 'Amil', codigo_err: 'TIMEOUT_504' } },
            { id: 987, time: '23:00', datetime: ago(31, 4), user: 'atendente.maria', type: 'logout', module: 'Sistema', sev: 'info', desc: 'Logout por timeout de sessão (30 min)', ip: ips[3], session: sessions[3], device: devices[3], payload: { timeoutSeg: 1800, ultimaAtividade: '22:52' } },
            { id: 986, time: '22:45', datetime: ago(15, 5), user: 'admin', type: 'delete', module: 'Usuário', sev: 'info', desc: 'Usuário "estagiario.carlos" desativado', ip: ips[0], session: sessions[0], device: devices[0], payload: { user: 'estagiario.carlos', motivo: 'Término de estágio' } },
            { id: 985, time: '22:30', datetime: ago(30, 5), user: 'dra.ana', type: 'update', module: 'Paciente', sev: 'info', desc: 'Paciente #3912: convênio alterado de Particular → Unimed', ip: ips[1], session: sessions[1], device: devices[1], payload: { pacienteId: 3912, antigo: 'Particular', novo: 'Unimed' } },
            { id: 984, time: '22:15', datetime: ago(45, 5), user: 'atendente.joao', type: 'create', module: 'Atendimento', sev: 'info', desc: 'Atendimento emergencial registrado: queixa de dor torácica', ip: ips[2], session: sessions[2], device: devices[2], payload: { atendimentoId: 1956, prioridade: 'EMERGENTE', paciente: 'Luiz Mendes' } },
            { id: 983, time: '22:00', datetime: ago(0, 6), user: 'financeiro.paulo', type: 'update', module: 'Estoque', sev: 'warn', desc: 'Alerta: "Soro Fisiológico" chegou ao estoque mínimo (42 un)', ip: ips[4], session: sessions[4], device: devices[4], payload: { item: 'Soro Fisiológico 0,9% 500ml', estoqueAtual: 42, estoqueMin: 40 } },
            { id: 982, time: '21:45', datetime: ago(15, 6), user: 'admin', type: 'login', module: 'Sistema', sev: 'info', desc: 'Login realizado com sucesso', ip: ips[0], session: sessions[0], device: devices[0], payload: { user: 'admin', method: 'password', mfa: true } },
            { id: 981, time: '21:30', datetime: ago(30, 6), user: 'atendente.maria', type: 'export', module: 'Relatório', sev: 'info', desc: 'PDF gerado: Relatório Financeiro Semanal', ip: ips[3], session: sessions[3], device: devices[3], payload: { formato: 'PDF', periodo: '26/05 a 01/06', bytes: 284000 } },
            { id: 980, time: '21:15', datetime: ago(45, 6), user: 'dra.ana', type: 'update', module: 'Configuração', sev: 'warn', desc: 'Horário de atendimento alterado: seg-sex 08:00-18:00', ip: ips[1], session: sessions[1], device: devices[1], payload: { dia: 'seg-sex', novoHorario: '08:00-18:00', medico: 'Dra. Ana' } },
        ];
    }
    function fmt(d) {
        return d.getDate().toString().padStart(2, '0') + '/' + d.getMonth() + 1 + '/' + d.getFullYear() + ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    }
    function loadData() {
        try { const d = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (d && d.length) return d; } catch { }
        return seed();
    }
    function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(LOGS)); }

    /* TOAST */
    function toast(title, msg = '', type = 'ok') {
        const icons = { ok: 'check-circle-2', warn: 'alert-triangle', danger: 'x-circle', info: 'info' };
        const el = document.createElement('div');
        el.className = 'toast ' + type;
        el.innerHTML = `<i data-lucide="${icons[type]}"></i><div><strong>${title}</strong>${msg ? `<span>${msg}</span>` : ''}</div>`;
        $('#toastBox').appendChild(el); lucide.createIcons();
        setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)' }, 3200);
        setTimeout(() => el.remove(), 3700);
    }

    /* USERS DROPDOWN */
    function populateUsers() {
        const users = [...new Set(LOGS.map(l => l.user))].sort();
        $('#fUser').innerHTML = '<option value="">Todos</option>' + users.map(u => `<option value="${u}">${u}</option>`).join('');
    }

    /* KPIs */
    function updateKPIs() {
        $('#kpiTotal').textContent = LOGS.length;
        $('#kpiToday').textContent = LOGS.filter(l => l.time > '00:00' && l.type !== 'login').length;
        $('#kpiNewToday').textContent = LOGS.filter(l => l.time > '00:00').length;
        $('#kpiWarn').textContent = LOGS.filter(l => l.sev === 'warn' || l.sev === 'error' || l.sev === 'critical').length;
        $('#kpiUsers').textContent = [...new Set(LOGS.map(l => l.user))].length;
    }

    /* BAR CHART */
    function renderBars() {
        const hours = [];
        for (let h = 23; h >= 0; h--) hours.push(h);
        const typeMap = { create: 0, update: 1, delete: 2, login: 3, error: 4 };
        const colors = [getCSSVar('--brand'), getCSSVar('--cyan'), getCSSVar('--warn'), getCSSVar('--ok'), getCSSVar('--danger')];
        const pivo = hours.map(h => [0, 0, 0, 0, 0]);
        LOGS.forEach(l => {
            const H = parseInt(l.time);
            if (H >= 0 && H < 24) { const c = typeMap[l.type] ?? -1; if (c >= 0) pivo[H][c]++; }
        });
        const max = Math.max(...pivo.flat(), 1);
        $('#barHours').innerHTML = hours.map(h => {
            const total = pivo[h].reduce((a, b) => a + b, 0);
            const hpt = Math.max((total / max) * 156, 2);
            return `
    <div class="bar-col">
      <div class="bar-stack" style="height:${hpt}px">
        ${pivo[h].map((v, i) => v > 0 ? `<div class="bar-seg" style="height:${(v / Math.max(total, 1)) * 100}%;background:${colors[i]}"></div>` : '').join('')}
      </div>
      <span class="time">${String(h).padStart(2, '0')}h</span>
    </div>`;
        }).join('');
    }
    function getCSSVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

    /* TABLE */
    let filterQ = '', filterType = '', filterModule = '', filterUser = '', filterSev = '';
    function renderTable() {
        const tbody = $('#logBody');
        const list = LOGS.filter(l => {
            const q = !filterQ || l.desc.toLowerCase().includes(filterQ) || l.user.toLowerCase().includes(filterQ) || l.module.toLowerCase().includes(filterQ) || String(l.id).includes(filterQ);
            const t = !filterType || l.type === filterType;
            const m = !filterModule || l.module === filterModule;
            const u = !filterUser || l.user === filterUser;
            const s = !filterSev || l.sev === filterSev;
            return q && t && m && u && s;
        }).sort((a, b) => b.id - a.id);

        tbody.innerHTML = list.map(l => {
            const typeIcon = { login: 'log-in', logout: 'log-out', create: 'plus', update: 'pencil', delete: 'trash-2', export: 'download', error: 'alert-circle' }[l.type] || 'activity';
            return `
    <tr data-id="${l.id}">
      <td><span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--ink3)">${l.time}</span></td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--brand),var(--cyan));color:#fff;display:grid;place-items:center;font-weight:700;font-size:11px">${l.user.split('.').map(p => p[0]).join('').slice(0, 2).toUpperCase()}</div>
          <div><strong style="font-size:13px">${l.user}</strong><small style="display:block;color:var(--ink3);font-size:11px">${l.ip}</small></div>
        </div>
      </td>
      <td><span class="type-badge ${l.type}"><i data-lucide="${typeIcon}"></i> ${cap(l.type)}</span></td>
      <td>${l.module}</td>
      <td>${l.desc}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--ink3)">${l.ip}</td>
      <td><span class="sev-badge ${l.sev}">${cap(l.sev)}</span></td>
      <td><button class="ico-btn" data-detail="${l.id}" title="Ver detalhes"><i data-lucide="eye"></i></button></td>
    </tr>`;
        }).join('') || `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--ink3)">Nenhum log encontrado.</td></tr>`;

        $('#showing').textContent = list.length;
        $('#totalRows').textContent = LOGS.length;
        updateKPIs();
        lucide.createIcons();
        $$('[data-detail]').forEach(b => b.addEventListener('click', () => openDetail(+b.dataset.detail)));
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* DETAIL MODAL */
    function openDetail(id) {
        const l = LOGS.find(x => x.id === id); if (!l) return;
        $('#mTag').textContent = l.sev.toUpperCase();
        $('#mTag').className = 'modal-tag sev-badge ' + l.sev;
        $('#mId').textContent = '#' + l.id;
        $('#mUser').textContent = l.user;
        $('#mAction').textContent = cap(l.type);
        $('#mModule').textContent = l.module;
        $('#mTime').textContent = l.datetime || l.time;
        $('#mIP').textContent = l.ip;
        $('#mSession').textContent = l.session;
        $('#mDevice').textContent = l.device;
        $('#mDesc').textContent = l.desc;
        $('#mPayload').textContent = JSON.stringify(l.payload || {}, null, 2);
        $('#detailModal').hidden = false;
    }

    /* EXPORT CSV */
    function exportCSV() {
        const headers = ['ID', 'Timestamp', 'Usuario', 'Acao', 'Modulo', 'Descricao', 'IP', 'Severidade', 'Sessao', 'Dispositivo'];
        const rows = LOGS.map(l => [l.id, l.datetime || l.time, l.user, l.type, l.module, l.desc, l.ip, l.sev, l.session || '', l.device || '']);
        const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `logs-auditoria-g4med-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast('Exportado', 'CSV de logs gerado com sucesso', 'ok');
    }

    /* AUTO REFRESH */
    function setAutoRefresh(on) {
        autoRefresh = on;
        if (on) {
            refreshInterval = setInterval(() => {
                const t = new Date();
                LOGS.unshift({
                    id: LOGS[0].id + 1, time: String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'),
                    datetime: nowStr(), user: 'auto.system', type: 'info', module: 'Sistema', sev: 'info',
                    desc: 'Ciclo de sincronização automática', ip: '127.0.0.1', session: 'sess_system',
                    device: 'Background Process', payload: { ciclo: true }
                });
                renderTable(); renderBars();
            }, 30000);
            $('#btnAuto').classList.add('on');
            toast('Auto-refresh ativado', 'Atualizações a cada 30s', 'ok');
        } else {
            clearInterval(refreshInterval); refreshInterval = null;
            $('#btnAuto').classList.remove('on');
            toast('Auto-refresh pausado');
        }
    }
    function nowStr() {
        const n = new Date();
        return String(n.getDate()).padStart(2, '0') + '/' + String(n.getMonth() + 1).padStart(2, '0') + '/' + n.getFullYear() + ' ' + String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
    }

    /* BINDINGS */
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

        $('#btnAuto').addEventListener('click', () => setAutoRefresh(!autoRefresh));
        $('#btnRefresh').addEventListener('click', () => { renderTable(); renderBars(); toast('Dados atualizados', 'Logs sincronizados', 'ok'); });
        $('#btnLive').addEventListener('click', () => setAutoRefresh(true));

        const apply = () => {
            filterQ = $('#searchLog').value.trim().toLowerCase();
            filterType = $('#fTipo').value;
            filterModule = $('#fModulo').value;
            filterUser = $('#fUser').value;
            filterSev = $('#fSev').value;
            renderTable();
            toast('Filtros aplicados', `Mostrando ${$('#showing').textContent} registros`, 'ok');
        };
        $('#searchLog').addEventListener('input', () => { filterQ = $('#searchLog').value.trim().toLowerCase(); renderTable(); });
        $('#btnApply').addEventListener('click', apply);
        $('#btnClear').addEventListener('click', () => {
            $$('.filter-group select').forEach(s => s.value = ''); $$('[type=date]').forEach(d => d.value = '');
            filterQ = ''; filterType = ''; filterModule = ''; filterUser = ''; filterSev = '';
            $('#searchLog').value = ''; renderTable(); toast('Filtros limpos');
        });

        $('#btnExport').addEventListener('click', exportCSV);
        $('#btnPrint').addEventListener('click', () => window.print());

        $('#mClose').addEventListener('click', () => $('#detailModal').hidden = true);
        $('#detailModal').addEventListener('click', e => { if (e.target === $('#detailModal')) $('#detailModal').hidden = true; });
        $('#mCopy').addEventListener('click', () => {
            navigator.clipboard?.writeText($('#mPayload').textContent);
            toast('Copiado!', 'JSON copiado para área de transferência', 'ok');
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !$('#detailModal').hidden) $('#detailModal').hidden = true;
        });
    }

    function init() {
        lucide.createIcons();
        populateUsers();
        renderTable();
        renderBars();
        bind();
        setAutoRefresh(true);
        setTimeout(() => toast('Logs de Auditoria', `${LOGS.length} eventos carregados`, 'ok'), 300);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

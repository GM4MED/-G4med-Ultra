/* =====================================================
   GM4 PREMIUM — ESTOQUE CENTRAL & ALMOXARIFADO
   Arquivo: estoque.js
   Padrão: IIFE modular + persistência localStorage
   ===================================================== */
(function () {
    'use strict';

    /* ===== 1. CONFIG =========================== */
    const Config = {
        locale: 'pt-BR',
        currency: 'BRL',
        storageKey: 'gm4-estoque-v1',
        counterDur: 1000,
    };

    /* ===== 2. UTILS ============================ */
    const U = {
        qs: (s, c = document) => c.querySelector(s),
        qsa: (s, c = document) => Array.from(c.querySelectorAll(s)),
        brl(v) { return new Intl.NumberFormat(Config.locale, { style: 'currency', currency: Config.currency }).format(v); },
        num(v, d = 2) { return new Intl.NumberFormat(Config.locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v); },
        int(v) { return new Intl.NumberFormat(Config.locale).format(Math.round(v)); },
        dateBR(iso) { if (!iso) return '—'; const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; },
        today() { return new Date().toISOString().slice(0, 10); },
        daysUntil(iso) { if (!iso) return null; return Math.ceil((new Date(iso) - new Date()) / 86400000); },
        uid(p = 'id') { return p + '_' + Math.random().toString(36).slice(2, 10); },
        debounce(fn, ms = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
        css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); },
        escape(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
        initials(s = '') { return s.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?'; },
    };

    /* ===== 3. SEED DATA ======================== */
    const seed = {
        items: [
            { id: 'sku_001', sku: 'MED-001', desc: 'Luva de procedimento M (cx 100un)', cat: 'EPI', loc: 'A1', qtd: 142, min: 50, custo: 38.50, val: '2027-04-15', forn: 'sup_01' },
            { id: 'sku_002', sku: 'MED-002', desc: 'Máscara cirúrgica tripla (cx 50un)', cat: 'EPI', loc: 'A1', qtd: 18, min: 30, custo: 24.90, val: '2027-08-20', forn: 'sup_01' },
            { id: 'sku_003', sku: 'MED-003', desc: 'Álcool 70% 1L', cat: 'Consumível', loc: 'B2', qtd: 64, min: 20, custo: 12.30, val: '2026-11-10', forn: 'sup_02' },
            { id: 'sku_004', sku: 'MED-004', desc: 'Seringa 5ml descartável', cat: 'Material Médico', loc: 'A1', qtd: 4, min: 25, custo: 0.85, val: '2028-02-01', forn: 'sup_03' },
            { id: 'sku_005', sku: 'EQP-010', desc: 'Termômetro digital infravermelho', cat: 'Equipamento', loc: 'C3', qtd: 12, min: 5, custo: 189.00, val: null, forn: 'sup_04' },
            { id: 'sku_006', sku: 'LIM-002', desc: 'Detergente neutro 5L', cat: 'Limpeza', loc: 'B2', qtd: 22, min: 8, custo: 34.50, val: '2027-01-30', forn: 'sup_02' },
            { id: 'sku_007', sku: 'ESC-005', desc: 'Papel A4 75g (resma 500fls)', cat: 'Escritório', loc: 'C3', qtd: 35, min: 10, custo: 28.00, val: null, forn: 'sup_05' },
            { id: 'sku_008', sku: 'MED-008', desc: 'Gaze estéril (pacote 10un)', cat: 'Material Médico', loc: 'A1', qtd: 0, min: 30, custo: 4.20, val: '2027-06-15', forn: 'sup_03' },
            { id: 'sku_009', sku: 'MED-009', desc: 'Esparadrapo 5cm x 4,5m', cat: 'Material Médico', loc: 'B2', qtd: 28, min: 15, custo: 7.80, val: '2026-09-05', forn: 'sup_03' },
            { id: 'sku_010', sku: 'EQP-011', desc: 'Estetoscópio adulto premium', cat: 'Equipamento', loc: 'C3', qtd: 6, min: 3, custo: 340.00, val: null, forn: 'sup_04' },
            { id: 'sku_011', sku: 'EPI-007', desc: 'Avental TNT descartável (cx 10un)', cat: 'EPI', loc: 'A1', qtd: 92, min: 40, custo: 18.40, val: '2028-01-10', forn: 'sup_01' },
            { id: 'sku_012', sku: 'MED-012', desc: 'Soro fisiológico 500ml', cat: 'Consumível', loc: 'B2', qtd: 48, min: 25, custo: 6.90, val: '2026-08-22', forn: 'sup_02' },
        ],
        suppliers: [
            { id: 'sup_01', nome: 'MedSupply Brasil', cnpj: '12.345.678/0001-90', cat: 'EPI', contato: 'Carla Mendes', tel: '(11) 99999-1010', email: 'comercial@medsupply.com.br', status: 'ativo', rating: 5, otif: 96 },
            { id: 'sup_02', nome: 'CleanPro Distrib.', cnpj: '23.456.789/0001-01', cat: 'Consumível', contato: 'João Pereira', tel: '(11) 99999-2020', email: 'vendas@cleanpro.com.br', status: 'ativo', rating: 4, otif: 88 },
            { id: 'sup_03', nome: 'PharmaMed Atacado', cnpj: '34.567.890/0001-12', cat: 'Material Médico', contato: 'Ana Lima', tel: '(11) 99999-3030', email: 'contato@pharmamed.com', status: 'ativo', rating: 5, otif: 94 },
            { id: 'sup_04', nome: 'TecnoMed Equipamentos', cnpj: '45.678.901/0001-23', cat: 'Equipamento', contato: 'Rafael Costa', tel: '(11) 99999-4040', email: 'rafael@tecnomed.com', status: 'pendente', rating: 4, otif: 82 },
            { id: 'sup_05', nome: 'OfficePlus Suprimentos', cnpj: '56.789.012/0001-34', cat: 'Serviços', contato: 'Beatriz Silva', tel: '(11) 99999-5050', email: 'b.silva@officeplus.com', status: 'ativo', rating: 3, otif: 78 },
        ],
        requisitions: [
            { id: 'req_001', num: '#REQ-2026-0124', setor: 'Enfermagem', item: 'Luva de procedimento M', qtd: 5, prio: 'Urgente', solicitante: 'Júlia Reis', data: '2026-06-01', status: 'Pendente' },
            { id: 'req_002', num: '#REQ-2026-0125', setor: 'Recepção', item: 'Papel A4 75g', qtd: 2, prio: 'Normal', solicitante: 'Marcos Torres', data: '2026-06-01', status: 'Aprovada' },
            { id: 'req_003', num: '#REQ-2026-0126', setor: 'TI / Suporte', item: 'Termômetro digital', qtd: 1, prio: 'Crítica', solicitante: 'Felipe Araujo', data: '2026-06-02', status: 'Pendente' },
            { id: 'req_004', num: '#REQ-2026-0127', setor: 'Administrativo', item: 'Detergente neutro 5L', qtd: 3, prio: 'Normal', solicitante: 'Sandra Vieira', data: '2026-06-02', status: 'Atendida' },
            { id: 'req_005', num: '#REQ-2026-0128', setor: 'Manutenção', item: 'Avental TNT descartável', qtd: 10, prio: 'Urgente', solicitante: 'Roberto Souza', data: '2026-06-03', status: 'Pendente' },
        ],
        patrimonio: [
            { id: 'pat_001', tag: 'PAT-0001', nome: 'Notebook Dell Latitude 5430', serie: 'DL5430-789X', setor: 'TI / Suporte', resp: 'Felipe Araujo', aquisicao: '2024-08-12', valor: 6800, status: 'Em uso' },
            { id: 'pat_002', tag: 'PAT-0002', nome: 'Impressora HP LaserJet Pro', serie: 'HPLJ-22A', setor: 'Administrativo', resp: 'Sandra Vieira', aquisicao: '2023-03-05', valor: 2450, status: 'Em uso' },
            { id: 'pat_003', tag: 'PAT-0003', nome: 'Monitor Samsung 27"', serie: 'SAM27-559', setor: 'Recepção', resp: 'Marcos Torres', aquisicao: '2024-11-20', valor: 1290, status: 'Em uso' },
            { id: 'pat_004', tag: 'PAT-0004', nome: 'Eletrocardiógrafo CardioMax', serie: 'CM-9081', setor: 'Enfermagem', resp: 'Júlia Reis', aquisicao: '2022-06-15', valor: 18500, status: 'Em manutenção' },
            { id: 'pat_005', tag: 'PAT-0005', nome: 'Autoclave 21L', serie: 'AC-21-554', setor: 'Enfermagem', resp: 'Júlia Reis', aquisicao: '2023-09-01', valor: 4200, status: 'Em uso' },
        ],
        movements: [
            { id: 'mv_001', tipo: 'Entrada', item: 'Luva de procedimento M', qtd: 200, local: 'Fornecedor → CD-01', data: '2026-06-01', user: 'Sistema' },
            { id: 'mv_002', tipo: 'Saída', item: 'Máscara cirúrgica tripla', qtd: 30, local: 'CD-01 → Enfermagem', data: '2026-06-01', user: 'Júlia Reis' },
            { id: 'mv_003', tipo: 'Transferência', item: 'Álcool 70% 1L', qtd: 12, local: 'CD-01 → CD-02', data: '2026-06-02', user: 'Carlos Inv.' },
            { id: 'mv_004', tipo: 'Ajuste', item: 'Seringa 5ml', qtd: -3, local: 'CD-01 (perda)', data: '2026-06-02', user: 'Auditoria' },
            { id: 'mv_005', tipo: 'Saída', item: 'Gaze estéril', qtd: 20, local: 'CD-01 → Procedim.', data: '2026-06-03', user: 'Júlia Reis' },
        ],
        audit: [
            { id: 'a1', when: '2026-06-03 14:22', user: 'Dr. Renato', action: 'create', resource: 'Item SKU MED-012', detail: 'Cadastro inicial', ip: '192.168.0.10' },
            { id: 'a2', when: '2026-06-03 13:11', user: 'Júlia Reis', action: 'update', resource: 'Requisição REQ-2026-0124', detail: 'Status: Aprovada', ip: '192.168.0.42' },
            { id: 'a3', when: '2026-06-03 11:05', user: 'Sistema', action: 'update', resource: 'Estoque', detail: 'Saída automática (consumo)', ip: '127.0.0.1' },
            { id: 'a4', when: '2026-06-03 09:48', user: 'Marcos Torres', action: 'login', resource: 'Sessão', detail: 'Login bem-sucedido', ip: '192.168.0.55' },
            { id: 'a5', when: '2026-06-02 17:30', user: 'Dr. Renato', action: 'export', resource: 'Relatório Curva ABC', detail: 'Exportação CSV', ip: '192.168.0.10' },
            { id: 'a6', when: '2026-06-02 16:14', user: 'Sandra Vieira', action: 'delete', resource: 'Item SKU OBS-099', detail: 'Item obsoleto', ip: '192.168.0.31' },
        ],
    };

    /* ===== 4. STATE ============================ */
    const State = {
        items: [], suppliers: [], requisitions: [], patrimonio: [], movements: [], audit: [],
        filters: { inv: { q: '', cat: '', loc: '', status: '' }, sup: { q: '', status: '' }, req: { q: '', setor: '', status: '' }, pat: { q: '', status: '' }, mov: { q: '', tipo: '', de: '', ate: '' }, audit: { q: '', action: '' } },
        selected: new Set(),
        warehouse: 'all',
        charts: {},
        activeTab: 'dashboard',
    };

    /* ===== 5. STORAGE ========================== */
    const Store = {
        load() {
            try {
                const raw = localStorage.getItem(Config.storageKey);
                if (raw) {
                    const d = JSON.parse(raw);
                    State.items = d.items || seed.items;
                    State.suppliers = d.suppliers || seed.suppliers;
                    State.requisitions = d.requisitions || seed.requisitions;
                    State.patrimonio = d.patrimonio || seed.patrimonio;
                    State.movements = d.movements || seed.movements;
                    State.audit = d.audit || seed.audit;
                    return;
                }
            } catch (_) { }
            State.items = seed.items; State.suppliers = seed.suppliers; State.requisitions = seed.requisitions;
            State.patrimonio = seed.patrimonio; State.movements = seed.movements; State.audit = seed.audit;
        },
        save() {
            try {
                localStorage.setItem(Config.storageKey, JSON.stringify({
                    items: State.items, suppliers: State.suppliers, requisitions: State.requisitions,
                    patrimonio: State.patrimonio, movements: State.movements, audit: State.audit
                }));
            } catch (_) { }
        },
    };

    /* ===== 6. AUDIT LOG ======================== */
    const Audit = {
        log(action, resource, detail) {
            const entry = {
                id: U.uid('a'),
                when: new Date().toLocaleString('pt-BR'),
                user: 'Dr. Renato',
                action, resource, detail,
                ip: '192.168.0.10',
            };
            State.audit.unshift(entry);
            if (State.audit.length > 200) State.audit.length = 200;
            Store.save();
            AuditView.render();
        }
    };

    /* ===== 7. TOAST ============================ */
    const Toast = {
        el: null,
        init() { this.el = U.qs('#toastContainer'); },
        show(title, msg = '', type = 'success') {
            if (!this.el) this.init();
            const icon = { success: 'check-circle-2', error: 'x-circle', warn: 'alert-triangle', info: 'info' }[type] || 'info';
            const t = document.createElement('div');
            t.className = `toast toast--${type}`;
            t.innerHTML = `<i class="lucide lucide-${icon} toast__icon"></i><div class="toast__body"><div class="toast__title">${U.escape(title)}</div>${msg ? `<div class="toast__msg">${U.escape(msg)}</div>` : ''}</div>`;
            this.el.appendChild(t);
            setTimeout(() => { t.classList.add('is-leaving'); t.addEventListener('animationend', () => t.remove(), { once: true }); }, 3200);
        },
    };

    /* ===== 8. KPIs ============================= */
    const KPI = {
        compute() {
            const items = ItemsView.warehouseScoped(State.items);
            const valor = items.reduce((s, i) => s + i.qtd * i.custo, 0);
            const alert = items.filter(i => i.qtd === 0 || i.qtd < i.min || (i.val && U.daysUntil(i.val) !== null && U.daysUntil(i.val) <= 90)).length;
            const giro = items.length ? (State.movements.filter(m => m.tipo === 'Saída').length / Math.max(1, items.length) * 4.2) : 0;
            const pendentes = State.requisitions.filter(r => r.status === 'Pendente').length;
            return {
                valor, fornecedores: State.suppliers.filter(s => s.status === 'ativo').length,
                pendentes, giro, alert, patrimonio: State.patrimonio.length
            };
        },
        animate(el, target, formatter) {
            if (!el) return;
            const start = performance.now();
            const tick = (now) => {
                const t = Math.min(1, (now - start) / Config.counterDur);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = formatter(target * eased);
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        },
        render() {
            const k = this.compute();
            this.animate(U.qs('#valorTotalEstoque'), k.valor, v => U.num(v, 2));
            this.animate(U.qs('#totalFornecedores'), k.fornecedores, v => U.int(v));
            this.animate(U.qs('#requisicoesPendentes'), k.pendentes, v => U.int(v));
            this.animate(U.qs('#giroEstoque'), k.giro, v => U.num(v, 1));
            this.animate(U.qs('#itensAlerta'), k.alert, v => U.int(v));
            this.animate(U.qs('#totalPatrimonio'), k.patrimonio, v => U.int(v));
        },
    };

    /* ===== 9. CHARTS =========================== */
    const Charts = {
        palette() {
            return {
                brand: '#6366f1', success: '#10b981', danger: '#ef4444',
                warn: '#f59e0b', info: '#3b82f6', purple: '#8b5cf6', pink: '#ec4899',
                text: U.css('--text-mute') || '#64748b',
                grid: U.css('--border') || '#e5e7eb',
            };
        },
        common(p) {
            return {
                responsive: true, maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { position: 'bottom', labels: { color: p.text, font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }, padding: 14, usePointStyle: true, pointStyle: 'circle' } },
                    tooltip: {
                        backgroundColor: 'rgba(15,23,42,.95)', titleColor: '#fff', bodyColor: '#e2e8f0', padding: 12, cornerRadius: 10, displayColors: true,
                        titleFont: { family: 'Plus Jakarta Sans', weight: '700' }, bodyFont: { family: 'Plus Jakarta Sans' }
                    }
                }
            };
        },
        movement() {
            const ctx = U.qs('#chartMov')?.getContext('2d'); if (!ctx) return;
            const p = this.palette();
            const labels = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
            const ent = [42000, 48500, 51000, 49500, 55000, 62000, 58000, 64500, 68000, 71500, 74000, 78500];
            const sai = [38000, 42000, 45500, 46000, 49000, 52500, 51000, 55000, 57500, 60500, 63000, 66500];
            const gE = ctx.createLinearGradient(0, 0, 0, 320); gE.addColorStop(0, 'rgba(16,185,129,.35)'); gE.addColorStop(1, 'rgba(16,185,129,0)');
            const gS = ctx.createLinearGradient(0, 0, 0, 320); gS.addColorStop(0, 'rgba(239,68,68,.30)'); gS.addColorStop(1, 'rgba(239,68,68,0)');
            State.charts.mov = new Chart(ctx, {
                type: 'line', data: {
                    labels, datasets: [
                        { label: 'Entradas', data: ent, borderColor: p.success, backgroundColor: gE, fill: true, tension: .4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 6 },
                        { label: 'Saídas', data: sai, borderColor: p.danger, backgroundColor: gS, fill: true, tension: .4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 6 },
                    ]
                },
                options: {
                    ...this.common(p),
                    scales: { x: { grid: { display: false }, ticks: { color: p.text } }, y: { grid: { color: p.grid }, ticks: { color: p.text, callback: v => 'R$ ' + (v / 1000).toFixed(0) + 'k' } } }
                }
            });
        },
        category() {
            const ctx = U.qs('#chartCat')?.getContext('2d'); if (!ctx) return;
            const p = this.palette();
            const map = {};
            State.items.forEach(i => map[i.cat] = (map[i.cat] || 0) + i.qtd * i.custo);
            const labels = Object.keys(map);
            const data = Object.values(map);
            State.charts.cat = new Chart(ctx, {
                type: 'doughnut',
                data: { labels, datasets: [{ data, backgroundColor: [p.brand, p.purple, p.success, p.warn, p.info, p.pink], borderWidth: 0, hoverOffset: 8 }] },
                options: {
                    ...this.common(p), cutout: '62%',
                    plugins: {
                        ...this.common(p).plugins, tooltip: {
                            ...this.common(p).plugins.tooltip,
                            callbacks: { label: c => ` ${c.label}: ${U.brl(c.parsed)}` }
                        }
                    }
                }
            });
        },
        top() {
            const ctx = U.qs('#chartTop')?.getContext('2d'); if (!ctx) return;
            const p = this.palette();
            const top = [...State.items].sort((a, b) => b.qtd * b.custo - a.qtd * a.custo).slice(0, 5);
            State.charts.top = new Chart(ctx, {
                type: 'bar',
                data: { labels: top.map(i => i.sku), datasets: [{ label: 'Valor', data: top.map(i => i.qtd * i.custo), backgroundColor: p.brand, borderRadius: 8, borderSkipped: false }] },
                options: {
                    ...this.common(p), indexAxis: 'y',
                    plugins: { ...this.common(p).plugins, legend: { display: false } },
                    scales: { x: { grid: { color: p.grid }, ticks: { color: p.text, callback: v => 'R$ ' + (v / 1000).toFixed(1) + 'k' } }, y: { grid: { display: false }, ticks: { color: p.text } } }
                }
            });
        },
        health() {
            const ctx = U.qs('#chartHealth')?.getContext('2d'); if (!ctx) return;
            const p = this.palette();
            let ok = 0, low = 0, out = 0, exp = 0;
            State.items.forEach(i => {
                if (i.qtd === 0) out++;
                else if (i.qtd < i.min) low++;
                else if (i.val && U.daysUntil(i.val) !== null && U.daysUntil(i.val) <= 90) exp++;
                else ok++;
            });
            State.charts.health = new Chart(ctx, {
                type: 'doughnut',
                data: { labels: ['Saudável', 'Estoque baixo', 'Sem estoque', 'Próx. validade'], datasets: [{ data: [ok, low, out, exp], backgroundColor: [p.success, p.warn, p.danger, p.pink], borderWidth: 0, hoverOffset: 8 }] },
                options: { ...this.common(p), cutout: '70%' }
            });
        },
        refresh() {
            Object.values(State.charts).forEach(c => c?.destroy?.());
            State.charts = {};
            this.initAll();
        },
        initAll() {
            if (typeof Chart === 'undefined') return;
            Chart.defaults.font.family = 'Plus Jakarta Sans';
            this.movement(); this.category(); this.top(); this.health();
        }
    };

    /* ===== 10. ALERTS ========================== */
    const Alerts = {
        compute() {
            const out = [];
            State.items.forEach(i => {
                if (i.qtd === 0) {
                    out.push({ type: 'danger', icon: 'package-x', title: `Sem estoque: ${i.desc}`, msg: `${i.sku} · ${i.cat}`, time: 'Agora' });
                } else if (i.qtd < i.min) {
                    out.push({ type: 'warn', icon: 'alert-triangle', title: `Estoque baixo: ${i.desc}`, msg: `${i.qtd} de mín. ${i.min} · ${i.sku}`, time: 'Hoje' });
                } else if (i.val) {
                    const d = U.daysUntil(i.val);
                    if (d !== null && d <= 90 && d >= 0) {
                        out.push({ type: 'info', icon: 'calendar-clock', title: `Vence em ${d} dia${d === 1 ? '' : 's'}: ${i.desc}`, msg: `${i.sku} · ${U.dateBR(i.val)}`, time: 'Esta semana' });
                    }
                }
            });
            State.requisitions.filter(r => r.prio === 'Crítica' && r.status === 'Pendente').forEach(r => {
                out.push({ type: 'danger', icon: 'siren', title: `Requisição crítica: ${r.item}`, msg: `${r.setor} · ${r.num}`, time: U.dateBR(r.data) });
            });
            return out.slice(0, 8);
        },
        render() {
            const list = U.qs('#alertList'); if (!list) return;
            const items = this.compute();
            if (!items.length) { list.innerHTML = `<li><div class="alert-body" style="text-align:center;padding:30px;color:var(--text-soft)">Nenhum alerta no momento.</div></li>`; return; }
            list.innerHTML = items.map(a => `
        <li>
          <div class="alert-icon alert-icon--${a.type}"><i class="lucide lucide-${a.icon}"></i></div>
          <div class="alert-body"><div class="alert-title">${U.escape(a.title)}</div><div class="alert-msg">${U.escape(a.msg)}</div></div>
          <span class="alert-time">${U.escape(a.time)}</span>
        </li>`).join('');
        }
    };

    /* ===== 11. ITEMS / ALMOXARIFADO ============ */
    const ItemsView = {
        init() {
            U.qs('#searchInventory').addEventListener('input', U.debounce(e => { State.filters.inv.q = e.target.value.trim().toLowerCase(); this.render(); }, 150));
            U.qs('#filtroCategoria').addEventListener('change', e => { State.filters.inv.cat = e.target.value; this.render(); });
            U.qs('#filtroLocalizacao').addEventListener('change', e => { State.filters.inv.loc = e.target.value; this.render(); });
            U.qs('#filtroStatus').addEventListener('change', e => { State.filters.inv.status = e.target.value; this.render(); });
            U.qs('#btnLimparFiltros').addEventListener('click', () => {
                State.filters.inv = { q: '', cat: '', loc: '', status: '' };
                ['#searchInventory', '#filtroCategoria', '#filtroLocalizacao', '#filtroStatus'].forEach(s => U.qs(s).value = '');
                this.render();
                Toast.show('Filtros limpos', '', 'info');
            });
            U.qs('#btnExportar').addEventListener('click', () => this.exportCSV());
            U.qs('#btnImportar').addEventListener('click', () => Toast.show('Importação', 'Selecione um arquivo CSV (demo).', 'info'));
            U.qs('#selectAll').addEventListener('change', e => this.toggleAll(e.target.checked));
            U.qs('#bulkDelete').addEventListener('click', () => this.bulkDelete());
            U.qs('#bulkAdjust').addEventListener('click', () => Toast.show('Ajuste em lote', 'Aplicado aos selecionados.', 'success'));
            U.qs('#bulkTransfer').addEventListener('click', () => Toast.show('Transferência em lote', 'Movimentação registrada.', 'success'));
        },
        warehouseScoped(items) {
            if (State.warehouse === 'all') return items;
            if (['CD-01', 'CD-02'].includes(State.warehouse)) return items;
            return items.filter(i => i.loc === State.warehouse);
        },
        statusOf(i) {
            if (i.qtd === 0) return { k: 'out', label: 'Sem estoque', icon: 'package-x' };
            if (i.qtd < i.min) return { k: 'low', label: 'Baixo', icon: 'alert-triangle' };
            if (i.val) { const d = U.daysUntil(i.val); if (d !== null && d <= 90 && d >= 0) return { k: 'exp', label: 'Próx. validade', icon: 'calendar-clock' }; }
            return { k: 'ok', label: 'Em estoque', icon: 'check-circle-2' };
        },
        filtered() {
            const f = State.filters.inv;
            return this.warehouseScoped(State.items).filter(i => {
                if (f.q) { const h = `${i.sku} ${i.desc} ${i.cat} ${i.loc}`.toLowerCase(); if (!h.includes(f.q)) return false; }
                if (f.cat && i.cat !== f.cat) return false;
                if (f.loc && i.loc !== f.loc) return false;
                if (f.status && this.statusOf(i).k !== f.status) return false;
                return true;
            });
        },
        render() {
            const items = this.filtered();
            const body = U.qs('#corpoTabelaAlmoxarifado');
            const empty = U.qs('#emptyInv');
            const count = U.qs('#invCount');
            empty.hidden = items.length > 0;
            count.textContent = `${items.length} ${items.length === 1 ? 'item' : 'itens'}`;
            body.innerHTML = items.map(i => {
                const s = this.statusOf(i);
                const sel = State.selected.has(i.id);
                return `
          <tr data-id="${i.id}" class="${sel ? 'is-selected' : ''}">
            <td><input type="checkbox" ${sel ? 'checked' : ''} data-row-check></td>
            <td class="sku">${U.escape(i.sku)}</td>
            <td class="desc">${U.escape(i.desc)}<small>SKU: ${U.escape(i.sku)}</small></td>
            <td><span class="tag tag--cat">${U.escape(i.cat)}</span></td>
            <td>${U.escape(i.loc)}</td>
            <td class="num">${U.int(i.qtd)}</td>
            <td class="num"><span class="muted">${U.int(i.min)}</span></td>
            <td class="num">${U.brl(i.custo)}</td>
            <td class="num">${U.brl(i.qtd * i.custo)}</td>
            <td>${i.val ? U.dateBR(i.val) : '<span class="muted">—</span>'}</td>
            <td><span class="tag tag--${s.k}"><i class="lucide lucide-${s.icon}"></i>${s.label}</span></td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" data-action="view"      aria-label="Detalhes"><i class="lucide lucide-eye"></i></button>
                <button class="icon-btn" data-action="edit"      aria-label="Editar"><i class="lucide lucide-pencil"></i></button>
                <button class="icon-btn" data-action="move"      aria-label="Movimentar"><i class="lucide lucide-arrow-left-right"></i></button>
                <button class="icon-btn" data-action="duplicate" aria-label="Duplicar"><i class="lucide lucide-copy"></i></button>
                <button class="icon-btn" data-action="delete"    aria-label="Excluir"><i class="lucide lucide-trash-2"></i></button>
              </div>
            </td>
          </tr>`;
            }).join('');
            this.bindRows();
            this.refreshBulk();
        },
        bindRows() {
            U.qsa('#corpoTabelaAlmoxarifado [data-row-check]').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const id = e.target.closest('tr').dataset.id;
                    if (e.target.checked) State.selected.add(id); else State.selected.delete(id);
                    this.render();
                });
            });
            U.qsa('#corpoTabelaAlmoxarifado button[data-action]').forEach(btn => {
                btn.addEventListener('click', e => {
                    const tr = e.currentTarget.closest('tr');
                    const id = tr.dataset.id;
                    const item = State.items.find(x => x.id === id);
                    if (!item) return;
                    const action = btn.dataset.action;
                    if (action === 'view') Drawer.openItem(item);
                    if (action === 'edit') ItemModal.open(item);
                    if (action === 'move') MovModal.openFor(item);
                    if (action === 'duplicate') {
                        const c = { ...item, id: U.uid('sku'), sku: item.sku + '-COPY', desc: item.desc + ' (cópia)' };
                        State.items.unshift(c); Store.save(); ItemsView.render(); KPI.render(); Charts.refresh(); Alerts.render();
                        Audit.log('create', `Item ${c.sku}`, 'Duplicação');
                        Toast.show('Duplicado', c.sku, 'success');
                    }
                    if (action === 'delete') {
                        if (confirm(`Excluir "${item.desc}"?`)) {
                            State.items = State.items.filter(x => x.id !== id);
                            State.selected.delete(id);
                            Store.save(); ItemsView.render(); KPI.render(); Charts.refresh(); Alerts.render();
                            Audit.log('delete', `Item ${item.sku}`, item.desc);
                            Toast.show('Item excluído', item.sku, 'warn');
                        }
                    }
                });
            });
        },
        toggleAll(checked) {
            if (checked) this.filtered().forEach(i => State.selected.add(i.id));
            else State.selected.clear();
            this.render();
        },
        refreshBulk() {
            const n = State.selected.size;
            U.qs('#bulkActions').hidden = n === 0;
            U.qs('#bulkCount').textContent = n;
        },
        bulkDelete() {
            if (!State.selected.size) return;
            if (!confirm(`Excluir ${State.selected.size} item(ns) selecionado(s)?`)) return;
            State.items = State.items.filter(i => !State.selected.has(i.id));
            Audit.log('delete', `Lote (${State.selected.size} itens)`, 'Exclusão em massa');
            State.selected.clear();
            Store.save(); this.render(); KPI.render(); Charts.refresh(); Alerts.render();
            Toast.show('Itens excluídos', '', 'warn');
        },
        exportCSV() {
            const rows = this.filtered();
            if (!rows.length) return Toast.show('Sem dados', 'Nada a exportar.', 'warn');
            const headers = ['SKU', 'Descrição', 'Categoria', 'Localização', 'Qtd', 'Mínimo', 'Custo', 'Valor Total', 'Validade', 'Status'];
            const csv = [
                headers.join(';'),
                ...rows.map(i => [
                    i.sku, i.desc, i.cat, i.loc, i.qtd, i.min,
                    i.custo.toFixed(2).replace('.', ','),
                    (i.qtd * i.custo).toFixed(2).replace('.', ','),
                    i.val || '', this.statusOf(i).label
                ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
            ].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `estoque-${U.today()}.csv`;
            a.click(); URL.revokeObjectURL(a.href);
            Audit.log('export', 'Estoque', `${rows.length} itens`);
            Toast.show('Exportado', `${rows.length} itens em CSV.`, 'success');
        },
    };

    /* ===== 12. ITEM MODAL ====================== */
    const ItemModal = {
        editingId: null,
        init() {
            U.qs('#btnNovoAtivo').addEventListener('click', () => this.open());
            U.qs('#formItem').addEventListener('submit', e => this.submit(e));
        },
        populateSuppliers() {
            const sel = U.qs('#formItem [name=fornecedor]');
            if (!sel) return;
            sel.innerHTML = '<option value="">—</option>' + State.suppliers.map(s => `<option value="${s.id}">${U.escape(s.nome)}</option>`).join('');
        },
        populateDatalist() {
            U.qs('#datalistItens').innerHTML = State.items.map(i => `<option value="${U.escape(i.desc)}">`).join('');
        },
        open(item = null) {
            this.populateSuppliers();
            const f = U.qs('#formItem');
            f.reset();
            this.editingId = null;
            U.qs('#modalItemTitle').innerHTML = `<i class="lucide lucide-package-plus"></i> Novo Item`;
            if (item) {
                this.editingId = item.id;
                U.qs('#modalItemTitle').innerHTML = `<i class="lucide lucide-pencil"></i> Editar Item`;
                f.sku.value = item.sku; f.categoria.value = item.cat; f.descricao.value = item.desc;
                f.localizacao.value = item.loc; f.qtd.value = item.qtd; f.qtdMin.value = item.min;
                f.custo.value = item.custo; f.validade.value = item.val || ''; f.fornecedor.value = item.forn || '';
            }
            Modal.open('#modalItem');
        },
        submit(e) {
            e.preventDefault();
            const f = e.currentTarget;
            if (!f.checkValidity()) { f.reportValidity(); return; }
            const fd = new FormData(f);
            const payload = {
                id: this.editingId || U.uid('sku'),
                sku: fd.get('sku').trim(),
                cat: fd.get('categoria'),
                desc: fd.get('descricao').trim(),
                loc: fd.get('localizacao'),
                qtd: +fd.get('qtd') || 0,
                min: +fd.get('qtdMin') || 0,
                custo: +fd.get('custo') || 0,
                val: fd.get('validade') || null,
                forn: fd.get('fornecedor') || null,
            };
            if (this.editingId) {
                const i = State.items.findIndex(x => x.id === this.editingId);
                State.items[i] = payload;
                Audit.log('update', `Item ${payload.sku}`, payload.desc);
                Toast.show('Item atualizado', payload.sku, 'success');
            } else {
                State.items.unshift(payload);
                Audit.log('create', `Item ${payload.sku}`, payload.desc);
                Toast.show('Item cadastrado', payload.sku, 'success');
            }
            Store.save();
            ItemsView.render(); KPI.render(); Charts.refresh(); Alerts.render();
            Modal.close('#modalItem');
        }
    };

    /* ===== 13. SUPPLIER VIEW =================== */
    const SupView = {
        init() {
            U.qs('#searchSup').addEventListener('input', U.debounce(e => { State.filters.sup.q = e.target.value.toLowerCase(); this.render(); }, 150));
            U.qs('#filtroSupStatus').addEventListener('change', e => { State.filters.sup.status = e.target.value; this.render(); });
            U.qs('#btnNovoFornecedor').addEventListener('click', () => Modal.open('#modalFornecedor'));
            U.qs('#formFornecedor').addEventListener('submit', e => this.submit(e));
        },
        filtered() {
            const f = State.filters.sup;
            return State.suppliers.filter(s => {
                if (f.q) { const h = `${s.nome} ${s.cnpj} ${s.cat} ${s.contato}`.toLowerCase(); if (!h.includes(f.q)) return false; }
                if (f.status && s.status !== f.status) return false;
                return true;
            });
        },
        render() {
            const grid = U.qs('#supplierGrid'); if (!grid) return;
            const list = this.filtered();
            grid.innerHTML = list.map(s => `
        <article class="supplier-card">
          <div class="supplier-card__head">
            <div class="supplier-card__avatar">${U.initials(s.nome)}</div>
            <div style="flex:1;min-width:0">
              <div class="supplier-card__name">${U.escape(s.nome)}</div>
              <div class="supplier-card__cat">${U.escape(s.cat)} · ${U.escape(s.cnpj)}</div>
            </div>
            <span class="tag tag--${s.status === 'ativo' ? 'ok' : s.status === 'pendente' ? 'low' : 'out'}">${U.escape(s.status)}</span>
          </div>
          <div class="supplier-card__rate">${'★'.repeat(s.rating)}${'☆'.repeat(5 - s.rating)}</div>
          <div class="muted" style="font-size:12px;margin-top:8px">${U.escape(s.contato)} · ${U.escape(s.tel)}</div>
          <div class="supplier-card__stats">
            <div class="supplier-stat"><div class="supplier-stat__v">${s.otif}%</div><div class="supplier-stat__l">OTIF</div></div>
            <div class="supplier-stat"><div class="supplier-stat__v">${State.items.filter(i => i.forn === s.id).length}</div><div class="supplier-stat__l">SKUs</div></div>
            <div class="supplier-stat"><div class="supplier-stat__v">${s.rating}.0</div><div class="supplier-stat__l">Rating</div></div>
          </div>
        </article>`).join('');
        },
        submit(e) {
            e.preventDefault();
            const f = e.currentTarget;
            if (!f.checkValidity()) return f.reportValidity();
            const fd = new FormData(f);
            const sup = {
                id: U.uid('sup'),
                nome: fd.get('nome').trim(),
                cnpj: fd.get('cnpj') || '—',
                cat: fd.get('cat'),
                contato: fd.get('contato') || '—',
                tel: fd.get('tel') || '—',
                email: fd.get('email') || '—',
                status: 'ativo', rating: 4, otif: 90,
            };
            State.suppliers.unshift(sup);
            Audit.log('create', `Fornecedor ${sup.nome}`, sup.cat);
            Store.save(); this.render(); KPI.render();
            f.reset(); Modal.close('#modalFornecedor');
            Toast.show('Fornecedor adicionado', sup.nome, 'success');
        }
    };

    /* ===== 14. REQUISITIONS ==================== */
    const ReqView = {
        init() {
            U.qs('#searchReq').addEventListener('input', U.debounce(e => { State.filters.req.q = e.target.value.toLowerCase(); this.render(); }, 150));
            U.qs('#filtroReqSetor').addEventListener('change', e => { State.filters.req.setor = e.target.value; this.render(); });
            U.qs('#filtroReqStatus').addEventListener('change', e => { State.filters.req.status = e.target.value; this.render(); });
            U.qs('#btnRequisicao').addEventListener('click', () => this.open());
            U.qs('#formRequisicao').addEventListener('submit', e => this.submit(e));
        },
        open() {
            const f = U.qs('#formRequisicao');
            f.reset();
            f.data.value = U.today();
            ItemModal.populateDatalist();
            Modal.open('#modalRequisicao');
        },
        filtered() {
            const f = State.filters.req;
            return State.requisitions.filter(r => {
                if (f.q) { const h = `${r.num} ${r.setor} ${r.item} ${r.solicitante}`.toLowerCase(); if (!h.includes(f.q)) return false; }
                if (f.setor && r.setor !== f.setor) return false;
                if (f.status && r.status !== f.status) return false;
                return true;
            });
        },
        render() {
            const body = U.qs('#corpoTabelaReq'); if (!body) return;
            const rows = this.filtered();
            U.qs('#emptyReq').hidden = rows.length > 0;
            body.innerHTML = rows.map(r => {
                const prioCls = r.prio === 'Urgente' ? 'pri-urg' : r.prio === 'Crítica' ? 'pri-crit' : 'pri-norm';
                const stCls = r.status.toLowerCase();
                return `
          <tr data-id="${r.id}">
            <td class="sku">${U.escape(r.num)}</td>
            <td>${U.escape(r.setor)}</td>
            <td class="desc">${U.escape(r.item)}</td>
            <td class="num">${r.qtd}</td>
            <td><span class="tag tag--${prioCls}">${U.escape(r.prio)}</span></td>
            <td>${U.escape(r.solicitante)}</td>
            <td>${U.dateBR(r.data)}</td>
            <td><span class="tag tag--${stCls}">${U.escape(r.status)}</span></td>
            <td>
              <div class="row-actions">
                <button class="icon-btn" data-act="approve" title="Aprovar"><i class="lucide lucide-check"></i></button>
                <button class="icon-btn" data-act="fulfill" title="Atender"><i class="lucide lucide-package-check"></i></button>
                <button class="icon-btn" data-act="reject"  title="Rejeitar"><i class="lucide lucide-x"></i></button>
              </div>
            </td>
          </tr>`;
            }).join('');
            U.qsa('#corpoTabelaReq button[data-act]').forEach(btn => {
                btn.addEventListener('click', e => {
                    const id = e.currentTarget.closest('tr').dataset.id;
                    const r = State.requisitions.find(x => x.id === id); if (!r) return;
                    const a = btn.dataset.act;
                    r.status = a === 'approve' ? 'Aprovada' : a === 'fulfill' ? 'Atendida' : 'Rejeitada';
                    Audit.log('update', `Requisição ${r.num}`, `Status: ${r.status}`);
                    Store.save(); this.render(); KPI.render();
                    Toast.show('Requisição atualizada', `${r.num} → ${r.status}`, 'success');
                });
            });
        },
        submit(e) {
            e.preventDefault();
            const f = e.currentTarget;
            if (!f.checkValidity()) return f.reportValidity();
            const fd = new FormData(f);
            const num = '#REQ-' + new Date().getFullYear() + '-' + String(State.requisitions.length + 1).padStart(4, '0');
            const req = {
                id: U.uid('req'), num,
                setor: fd.get('setor'),
                item: fd.get('item').trim(),
                qtd: +fd.get('qtd') || 1,
                prio: fd.get('prioridade') || 'Normal',
                solicitante: fd.get('solicitante') || 'Anônimo',
                data: fd.get('data'),
                status: 'Pendente',
            };
            State.requisitions.unshift(req);
            Audit.log('create', `Requisição ${num}`, `${req.setor} - ${req.item}`);
            Store.save(); this.render(); KPI.render(); Alerts.render();
            f.reset(); Modal.close('#modalRequisicao');
            Toast.show('Requisição enviada', num, 'success');
        }
    };

    /* ===== 15. PATRIMÔNIO ====================== */
    const PatView = {
        init() {
            U.qs('#searchPat').addEventListener('input', U.debounce(e => { State.filters.pat.q = e.target.value.toLowerCase(); this.render(); }, 150));
            U.qs('#filtroPatStatus').addEventListener('change', e => { State.filters.pat.status = e.target.value; this.render(); });
            U.qs('#btnNovoPatrim').addEventListener('click', () => Toast.show('Cadastro de Ativo', 'Formulário em construção (demo).', 'info'));
        },
        filtered() {
            const f = State.filters.pat;
            return State.patrimonio.filter(p => {
                if (f.q) { const h = `${p.tag} ${p.nome} ${p.serie} ${p.resp} ${p.setor}`.toLowerCase(); if (!h.includes(f.q)) return false; }
                if (f.status && p.status !== f.status) return false;
                return true;
            });
        },
        render() {
            const body = U.qs('#corpoTabelaPat'); if (!body) return;
            body.innerHTML = this.filtered().map(p => `
        <tr>
          <td class="sku">${U.escape(p.tag)}</td>
          <td class="desc">${U.escape(p.nome)}</td>
          <td>${U.escape(p.serie)}</td>
          <td>${U.escape(p.setor)}</td>
          <td>${U.escape(p.resp)}</td>
          <td>${U.dateBR(p.aquisicao)}</td>
          <td class="num">${U.brl(p.valor)}</td>
          <td><span class="tag tag--${p.status === 'Em uso' ? 'ok' : p.status === 'Em manutenção' ? 'low' : 'out'}">${U.escape(p.status)}</span></td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" title="QR Code"><i class="lucide lucide-qr-code"></i></button>
              <button class="icon-btn" title="Histórico"><i class="lucide lucide-history"></i></button>
              <button class="icon-btn" title="Editar"><i class="lucide lucide-pencil"></i></button>
            </div>
          </td>
        </tr>`).join('');
        }
    };

    /* ===== 16. MOVIMENTAÇÕES ================== */
    const MovView = {
        init() {
            U.qs('#searchMov').addEventListener('input', U.debounce(e => { State.filters.mov.q = e.target.value.toLowerCase(); this.render(); }, 150));
            U.qs('#filtroMovTipo').addEventListener('change', e => { State.filters.mov.tipo = e.target.value; this.render(); });
            U.qs('#filtroMovDe').addEventListener('change', e => { State.filters.mov.de = e.target.value; this.render(); });
            U.qs('#filtroMovAte').addEventListener('change', e => { State.filters.mov.ate = e.target.value; this.render(); });
            U.qs('#btnNovaMov').addEventListener('click', () => MovModal.open());
            U.qs('#formMov').addEventListener('submit', e => MovModal.submit(e));
        },
        filtered() {
            const f = State.filters.mov;
            return State.movements.filter(m => {
                if (f.q) { const h = `${m.tipo} ${m.item} ${m.local} ${m.user}`.toLowerCase(); if (!h.includes(f.q)) return false; }
                if (f.tipo && m.tipo !== f.tipo) return false;
                if (f.de && m.data < f.de) return false;
                if (f.ate && m.data > f.ate) return false;
                return true;
            });
        },
        render() {
            const tl = U.qs('#timelineMov'); if (!tl) return;
            const list = this.filtered();
            if (!list.length) { tl.innerHTML = `<div class="table-empty">Nenhuma movimentação.</div>`; return; }
            const map = { 'Entrada': 'in', 'Saída': 'out', 'Transferência': 'tr', 'Ajuste': 'aj' };
            tl.innerHTML = list.map(m => `
        <div class="timeline-item timeline-item--${map[m.tipo] || 'in'}">
          <div class="timeline-head">
            <span class="timeline-title">${U.escape(m.tipo)} · ${U.escape(m.item)} (${m.qtd > 0 ? '+' : ''}${m.qtd})</span>
            <span class="timeline-meta">${U.dateBR(m.data)} · ${U.escape(m.user)}</span>
          </div>
          <div class="timeline-body">${U.escape(m.local)}</div>
        </div>`).join('');
        }
    };
    const MovModal = {
        open() {
            const f = U.qs('#formMov'); f.reset(); f.data.value = U.today();
            ItemModal.populateDatalist();
            Modal.open('#modalMov');
        },
        openFor(item) { this.open(); U.qs('#formMov [name=item]').value = item.desc; },
        submit(e) {
            e.preventDefault();
            const f = e.currentTarget;
            if (!f.checkValidity()) return f.reportValidity();
            const fd = new FormData(f);
            const mv = {
                id: U.uid('mv'), tipo: fd.get('tipo'), item: fd.get('item').trim(),
                qtd: +fd.get('qtd') || 1, local: fd.get('local') || '—',
                data: fd.get('data'), user: 'Dr. Renato',
            };
            State.movements.unshift(mv);
            Audit.log('create', `Movimentação ${mv.tipo}`, `${mv.item} (${mv.qtd})`);
            Store.save(); MovView.render(); KPI.render(); Charts.refresh();
            f.reset(); Modal.close('#modalMov');
            Toast.show('Movimentação registrada', `${mv.tipo}: ${mv.item}`, 'success');
        }
    };

    /* ===== 17. AUDITORIA ====================== */
    const AuditView = {
        init() {
            U.qs('#searchAudit').addEventListener('input', U.debounce(e => { State.filters.audit.q = e.target.value.toLowerCase(); this.render(); }, 150));
            U.qs('#filtroAuditAction').addEventListener('change', e => { State.filters.audit.action = e.target.value; this.render(); });
        },
        filtered() {
            const f = State.filters.audit;
            return State.audit.filter(a => {
                if (f.q) { const h = `${a.user} ${a.action} ${a.resource} ${a.detail}`.toLowerCase(); if (!h.includes(f.q)) return false; }
                if (f.action && a.action !== f.action) return false;
                return true;
            });
        },
        render() {
            const body = U.qs('#corpoTabelaAudit'); if (!body) return;
            const colors = { create: 'ok', update: 'cat', delete: 'out', login: 'low', export: 'pri-urg' };
            body.innerHTML = this.filtered().map(a => `
        <tr>
          <td class="muted">${U.escape(a.when)}</td>
          <td><strong>${U.escape(a.user)}</strong></td>
          <td><span class="tag tag--${colors[a.action] || 'cat'}">${U.escape(a.action)}</span></td>
          <td>${U.escape(a.resource)}</td>
          <td class="muted">${U.escape(a.detail)}</td>
          <td class="sku">${U.escape(a.ip)}</td>
        </tr>`).join('');
        }
    };

    /* ===== 18. DRAWER ========================= */
    const Drawer = {
        init() {
            U.qsa('.drawer [data-close], .drawer__backdrop').forEach(el => el.addEventListener('click', () => this.close()));
        },
        openItem(item) {
            const sup = State.suppliers.find(s => s.id === item.forn);
            const movs = State.movements.filter(m => m.item.toLowerCase().includes(item.desc.toLowerCase().slice(0, 15))).slice(0, 5);
            U.qs('#drawerSku').textContent = item.sku;
            U.qs('#drawerTitle').textContent = item.desc;
            U.qs('#drawerBody').innerHTML = `
        <div class="detail-grid">
          <div class="detail-row"><span class="detail-label">Categoria</span><span class="detail-value">${U.escape(item.cat)}</span></div>
          <div class="detail-row"><span class="detail-label">Localização</span><span class="detail-value">${U.escape(item.loc)}</span></div>
          <div class="detail-row"><span class="detail-label">Quantidade</span><span class="detail-value">${U.int(item.qtd)} un</span></div>
          <div class="detail-row"><span class="detail-label">Mínimo</span><span class="detail-value">${U.int(item.min)} un</span></div>
          <div class="detail-row"><span class="detail-label">Custo Unit.</span><span class="detail-value">${U.brl(item.custo)}</span></div>
          <div class="detail-row"><span class="detail-label">Valor Total</span><span class="detail-value">${U.brl(item.qtd * item.custo)}</span></div>
          <div class="detail-row"><span class="detail-label">Validade</span><span class="detail-value">${item.val ? U.dateBR(item.val) : '—'}</span></div>
          <div class="detail-row"><span class="detail-label">Fornecedor</span><span class="detail-value">${sup ? U.escape(sup.nome) : '—'}</span></div>
        </div>
        <div class="detail-section">
          <h3><i class="lucide lucide-history"></i> Últimas movimentações</h3>
          ${movs.length ? movs.map(m => `<div class="timeline-item timeline-item--${m.tipo === 'Entrada' ? 'in' : m.tipo === 'Saída' ? 'out' : m.tipo === 'Transferência' ? 'tr' : 'aj'}" style="margin-left:16px"><div class="timeline-head"><span class="timeline-title">${U.escape(m.tipo)} (${m.qtd})</span><span class="timeline-meta">${U.dateBR(m.data)}</span></div><div class="timeline-body">${U.escape(m.local)}</div></div>`).join('') : '<p class="muted">Sem movimentações registradas.</p>'}
        </div>`;
            U.qs('#drawerItem').setAttribute('aria-hidden', 'false');
        },
        close() { U.qs('#drawerItem').setAttribute('aria-hidden', 'true'); }
    };

    /* ===== 19. MODAL HELPER ================== */
    const Modal = {
        init() {
            U.qsa('.modal').forEach(m => {
                m.addEventListener('click', e => { if (e.target.matches('[data-close]')) this.close('#' + m.id); });
            });
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') {
                    U.qsa('.modal:not([hidden])').forEach(m => this.close('#' + m.id));
                    if (!U.qs('#palette').hidden) Palette.close();
                    Drawer.close();
                }
            });
            U.qs('#btnSair').addEventListener('click', () => this.open('#modalSair'));
        },
        open(sel) { const m = U.qs(sel); if (!m) return; m.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => m.querySelector('input,select,button')?.focus()); },
        close(sel) { const m = U.qs(sel); if (!m) return; m.hidden = true; document.body.style.overflow = ''; }
    };

    /* ===== 20. TABS =========================== */
    const Tabs = {
        init() {
            U.qsa('.tab-link').forEach(link => link.addEventListener('click', () => this.go(link.dataset.tab)));
            U.qsa('[data-tab-link]').forEach(link => link.addEventListener('click', e => {
                e.preventDefault();
                this.go(link.dataset.tabLink);
                // Sidebar active
                U.qsa('.nav-item').forEach(n => n.classList.remove('nav-item--active'));
                link.classList.add('nav-item--active');
            }));
            U.qsa('.chip-group').forEach(g => g.addEventListener('click', e => {
                const b = e.target.closest('.chip'); if (!b) return;
                g.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
                b.classList.add('chip--active');
            }));
        },
        go(name) {
            State.activeTab = name;
            U.qsa('.tab-link').forEach(l => {
                const on = l.dataset.tab === name;
                l.classList.toggle('tab-link--active', on);
                l.setAttribute('aria-selected', on ? 'true' : 'false');
            });
            U.qsa('.tab-content').forEach(c => {
                const on = c.dataset.tabContent === name;
                c.hidden = !on; c.classList.toggle('tab-content--active', on);
            });
            // refresh charts when entering dashboard
            if (name === 'dashboard') setTimeout(() => Charts.refresh(), 50);
        }
    };

    /* ===== 21. WAREHOUSE FILTER ================ */
    const Warehouse = {
        init() {
            U.qs('#warehouseSelect').addEventListener('change', e => {
                State.warehouse = e.target.value;
                ItemsView.render(); KPI.render(); Charts.refresh(); Alerts.render();
                Toast.show('Depósito alterado', e.target.options[e.target.selectedIndex].textContent, 'info');
            });
        }
    };

    /* ===== 22. COMMAND PALETTE ================= */
    const Palette = {
        actions: [
            { label: 'Novo Item', icon: 'package-plus', hint: '⌘+N', run: () => ItemModal.open() },
            { label: 'Nova Requisição', icon: 'clipboard-list', hint: '⌘+R', run: () => ReqView.open() },
            { label: 'Nova Movimentação', icon: 'arrow-left-right', hint: '⌘+M', run: () => MovModal.open() },
            { label: 'Exportar Estoque', icon: 'download', hint: '⌘+E', run: () => ItemsView.exportCSV() },
            { label: 'Ir: Dashboard', icon: 'layout-dashboard', hint: '', run: () => Tabs.go('dashboard') },
            { label: 'Ir: Almoxarifado', icon: 'package', hint: '', run: () => Tabs.go('almoxarifado') },
            { label: 'Ir: Fornecedores', icon: 'truck', hint: '', run: () => Tabs.go('fornecedores') },
            { label: 'Ir: Requisições', icon: 'clipboard-list', hint: '', run: () => Tabs.go('requisicoes') },
            { label: 'Ir: Patrimônio', icon: 'cpu', hint: '', run: () => Tabs.go('patrimonio') },
            { label: 'Ir: Movimentações', icon: 'arrow-left-right', hint: '', run: () => Tabs.go('movimentacoes') },
            { label: 'Ir: Auditoria', icon: 'shield-check', hint: '', run: () => Tabs.go('auditoria') },
            { label: 'Ir: Relatórios', icon: 'bar-chart-3', hint: '', run: () => Tabs.go('relatorios') },
        ],
        init() {
            const el = U.qs('#palette');
            const input = U.qs('#paletteInput');
            U.qs('.palette__backdrop').addEventListener('click', () => this.close());
            input.addEventListener('input', () => this.render(input.value));
            input.addEventListener('keydown', e => {
                const items = U.qsa('#paletteList li');
                let active = items.findIndex(i => i.classList.contains('is-active'));
                if (e.key === 'ArrowDown') { e.preventDefault(); items[active]?.classList.remove('is-active'); items[(active + 1) % items.length]?.classList.add('is-active'); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); items[active]?.classList.remove('is-active'); items[(active - 1 + items.length) % items.length]?.classList.add('is-active'); }
                else if (e.key === 'Enter') { items.find(i => i.classList.contains('is-active'))?.click(); }
            });
        },
        open() { U.qs('#palette').hidden = false; const i = U.qs('#paletteInput'); i.value = ''; this.render(''); setTimeout(() => i.focus(), 50); },
        close() { U.qs('#palette').hidden = true; },
        render(q = '') {
            const list = U.qs('#paletteList');
            const filtered = this.actions.filter(a => a.label.toLowerCase().includes(q.toLowerCase()));
            list.innerHTML = filtered.map((a, i) => `<li class="${i === 0 ? 'is-active' : ''}" data-i="${i}"><i class="lucide lucide-${a.icon}"></i> ${U.escape(a.label)} ${a.hint ? `<small>${a.hint}</small>` : ''}</li>`).join('');
            list.querySelectorAll('li').forEach(li => li.addEventListener('click', () => {
                filtered[+li.dataset.i].run(); this.close();
            }));
        }
    };

    /* ===== 23. SHORTCUTS ====================== */
    const Shortcuts = {
        init() {
            document.addEventListener('keydown', e => {
                const cmd = e.ctrlKey || e.metaKey;
                if (cmd && e.key.toLowerCase() === 'k') { e.preventDefault(); Palette.open(); }
                else if (cmd && e.key.toLowerCase() === 'n') { e.preventDefault(); ItemModal.open(); }
                else if (cmd && e.key.toLowerCase() === 'r') { e.preventDefault(); ReqView.open(); }
                else if (cmd && e.key.toLowerCase() === 'm') { e.preventDefault(); MovModal.open(); }
                else if (cmd && e.key.toLowerCase() === 'e') { e.preventDefault(); ItemsView.exportCSV(); }
            });
        }
    };

    /* ===== 24. SIDEBAR TOGGLE ================= */
    const Sidebar = {
        init() {
            const t = U.qs('#sidebarToggle'); const sb = U.qs('.sidebar');
            t.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    const open = sb.style.display === 'flex';
                    sb.style.cssText = open ? '' : 'display:flex;position:fixed;z-index:50;width:264px;height:100vh;top:0;left:0;';
                }
            });
        }
    };

    /* ===== 25. REPORTS TILES ================== */
    const Reports = {
        init() {
            U.qsa('.report-tile').forEach(t => t.addEventListener('click', () => {
                Toast.show('Relatório', `Gerando: ${t.querySelector('h3').textContent}`, 'info');
                Audit.log('export', `Relatório ${t.dataset.report}`, 'Geração');
            }));
        }
    };

    /* ===== 26. APP BOOTSTRAP ================== */
    const App = {
        init() {
            Store.load();
            Toast.init();
            Modal.init();
            Drawer.init();
            Tabs.init();
            Warehouse.init();
            Sidebar.init();
            ItemsView.init();
            ItemModal.init();
            SupView.init();
            ReqView.init();
            PatView.init();
            MovView.init();
            AuditView.init();
            Reports.init();
            Palette.init();
            Shortcuts.init();

            // Render initial
            ItemsView.render();
            SupView.render();
            ReqView.render();
            PatView.render();
            MovView.render();
            AuditView.render();
            Alerts.render();
            KPI.render();

            // Charts after layout
            requestAnimationFrame(() => Charts.initAll());

            console.info('%cGM4 Estoque %cv1.0', 'color:#6366f1;font-weight:700', 'color:#94a3b8');
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
    else App.init();
})();

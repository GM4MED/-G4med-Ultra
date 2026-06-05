/* =========================================================
   G4MED · Relatório Financeiro · BI · JS
   ========================================================= */
(() => {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    /* ============ DATA ============ */
    const COLORS = {
        brand: '#4f46e5', brand2: '#6366f1', purple: '#8b5cf6', cyan: '#06b6d4',
        ok: '#10b981', warn: '#f59e0b', danger: '#ef4444', info: '#0284c7', rose: '#f43f5e',
    };

    const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const REC = [1240, 1318, 1402, 1448, 1512, 1564, 1612, 1684, 1742, 1798, 1820, 1842];
    const DESP = [968, 1024, 1086, 1112, 1148, 1184, 1212, 1248, 1284, 1318, 1342, 1356];
    const LUC = REC.map((r, i) => r - DESP[i]);

    const FONTES = [
        { name: 'Consultas', value: 842, color: COLORS.brand },
        { name: 'Exames', value: 412, color: COLORS.cyan },
        { name: 'Procedimentos', value: 284, color: COLORS.purple },
        { name: 'Cirurgias', value: 198, color: COLORS.rose },
        { name: 'Telemedicina', value: 62, color: COLORS.warn },
        { name: 'Outros', value: 44, color: COLORS.info },
    ];

    const DESPESAS = [
        { label: 'Folha & Encargos', value: 42, color: COLORS.brand },
        { label: 'Médicos PJ', value: 24, color: COLORS.cyan },
        { label: 'Materiais & Insumos', value: 12, color: COLORS.purple },
        { label: 'Aluguel & Estrutura', value: 8, color: COLORS.rose },
        { label: 'Marketing', value: 5, color: COLORS.warn },
        { label: 'Tecnologia', value: 4, color: COLORS.info },
        { label: 'Outros', value: 5, color: COLORS.danger },
    ];

    const PAGAMENTOS = [
        { name: 'Convênio', value: 38, color: COLORS.brand },
        { name: 'PIX', value: 24, color: COLORS.ok },
        { name: 'Cartão de crédito', value: 18, color: COLORS.purple },
        { name: 'Cartão de débito', value: 10, color: COLORS.cyan },
        { name: 'Dinheiro', value: 6, color: COLORS.warn },
        { name: 'Boleto', value: 4, color: COLORS.info },
    ];

    const AGING = [
        { label: 'A vencer', value: 642, color: COLORS.ok },
        { label: '1-30 dias', value: 284, color: COLORS.brand },
        { label: '31-60 dias', value: 148, color: COLORS.warn },
        { label: '61-90 dias', value: 92, color: COLORS.danger },
        { label: '>90 dias', value: 48, color: COLORS.rose },
    ];

    const CC = [
        { name: 'Consultórios', rec: 842, cust: 312, desp: 218, color: COLORS.brand, trend: [58, 62, 64, 68, 72, 74, 78, 82, 84, 86, 88, 90] },
        { name: 'Bloco Cirúrgico', rec: 412, cust: 198, desp: 96, color: COLORS.cyan, trend: [28, 30, 32, 34, 36, 36, 38, 40, 42, 42, 44, 46] },
        { name: 'Imagem', rec: 264, cust: 118, desp: 54, color: COLORS.purple, trend: [18, 19, 20, 22, 22, 24, 25, 26, 27, 28, 29, 30] },
        { name: 'Laboratório', rec: 182, cust: 86, desp: 38, color: COLORS.rose, trend: [12, 13, 14, 14, 15, 16, 17, 18, 18, 19, 20, 20] },
        { name: 'Telemedicina', rec: 62, cust: 18, desp: 14, color: COLORS.warn, trend: [3, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8] },
        { name: 'Administrativo', rec: 0, cust: 0, desp: 182, color: COLORS.info, trend: [14, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 18] },
        { name: 'Marketing', rec: 0, cust: 0, desp: 78, color: COLORS.danger, trend: [4, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8] },
        { name: 'Tecnologia', rec: 0, cust: 0, desp: 62, color: COLORS.ok, trend: [3, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7] },
    ];

    const SPECS = [
        { name: 'Cardiologia', vol: 842, rec: 421, cust: 148, color: COLORS.brand },
        { name: 'Ortopedia', vol: 678, rec: 298, cust: 124, color: COLORS.cyan },
        { name: 'Pediatria', vol: 912, rec: 312, cust: 118, color: COLORS.purple },
        { name: 'Ginecologia', vol: 587, rec: 264, cust: 96, color: COLORS.rose },
        { name: 'Dermatologia', vol: 521, rec: 189, cust: 62, color: COLORS.warn },
        { name: 'Neurologia', vol: 412, rec: 248, cust: 108, color: COLORS.info },
        { name: 'Endocrinologia', vol: 389, rec: 187, cust: 72, color: COLORS.ok },
        { name: 'Oftalmologia', vol: 486, rec: 172, cust: 64, color: COLORS.danger },
    ];

    const INSURANCE = [
        { name: 'Particular', value: 34, color: COLORS.brand },
        { name: 'Unimed', value: 24, color: COLORS.cyan },
        { name: 'Bradesco Saúde', value: 14, color: COLORS.purple },
        { name: 'SulAmérica', value: 11, color: COLORS.rose },
        { name: 'Amil', value: 9, color: COLORS.warn },
        { name: 'Outros', value: 8, color: COLORS.info },
    ];

    const charts = {};
    const ctx = id => $('#' + id).getContext('2d');

    /* ============ DEFAULTS ============ */
    function cfgChart() {
        const dark = document.documentElement.dataset.theme === 'dark';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = dark ? '#94a3b8' : '#64748b';
        Chart.defaults.borderColor = dark ? 'rgba(255,255,255,.06)' : 'rgba(15,23,42,.06)';
    }
    const tooltip = {
        enabled: true, backgroundColor: 'rgba(15,23,42,.95)',
        titleColor: '#fff', titleFont: { weight: 700, size: 12.5 },
        bodyColor: '#e2e8f0', bodyFont: { size: 12 },
        padding: 12, cornerRadius: 10, boxPadding: 6, displayColors: true, usePointStyle: true,
        borderColor: 'rgba(255,255,255,.08)', borderWidth: 1,
    };
    const fmtBR = v => 'R$ ' + v.toLocaleString('pt-BR');
    const fmtK = v => 'R$ ' + (v / 1).toFixed(0) + 'k';

    /* ============ CHART: RECEITA × DESPESA × LUCRO ============ */
    function chartReceitaDespesa(metric = 'all') {
        const c = ctx('chartReceitaDespesa');
        const gradR = c.createLinearGradient(0, 0, 0, 380);
        gradR.addColorStop(0, 'rgba(79,70,229,.35)'); gradR.addColorStop(1, 'rgba(79,70,229,0)');
        const gradD = c.createLinearGradient(0, 0, 0, 380);
        gradD.addColorStop(0, 'rgba(244,63,94,.30)'); gradD.addColorStop(1, 'rgba(244,63,94,0)');
        const gradL = c.createLinearGradient(0, 0, 0, 380);
        gradL.addColorStop(0, 'rgba(16,185,129,.40)'); gradL.addColorStop(1, 'rgba(16,185,129,0)');

        const datasets = [];
        if (metric === 'all' || metric === 'rec') datasets.push({ label: 'Receita', data: REC, borderColor: COLORS.brand, backgroundColor: gradR, fill: metric !== 'all', tension: .4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: COLORS.brand, pointBorderWidth: 2, pointHoverRadius: 6 });
        if (metric === 'all' || metric === 'desp') datasets.push({ label: 'Despesa', data: DESP, borderColor: COLORS.rose, backgroundColor: gradD, fill: metric !== 'all', tension: .4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: COLORS.rose, pointBorderWidth: 2, pointHoverRadius: 6 });
        if (metric === 'all' || metric === 'luc') datasets.push({ label: 'Lucro', data: LUC, borderColor: COLORS.ok, backgroundColor: gradL, fill: true, tension: .4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: COLORS.ok, pointBorderWidth: 2, pointHoverRadius: 6 });

        charts.recDesp?.destroy();
        charts.recDesp = new Chart(c, {
            type: 'line',
            data: { labels: MONTHS, datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 12 }, usePointStyle: true, padding: 14, boxWidth: 8 } },
                    tooltip: { ...tooltip, callbacks: { label: c => ` ${c.dataset.label}: R$ ${c.parsed.y.toLocaleString('pt-BR')}k` } }
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, ticks: { font: { size: 11 }, callback: v => 'R$ ' + v + 'k' } }
                }
            }
        });
    }

    /* ============ CHART: FONTE RECEITA (polar) ============ */
    function chartFonteReceita() {
        charts.fonte?.destroy();
        charts.fonte = new Chart(ctx('chartFonteReceita'), {
            type: 'polarArea',
            data: {
                labels: FONTES.map(f => f.name),
                datasets: [{ data: FONTES.map(f => f.value), backgroundColor: FONTES.map(f => f.color + 'cc'), borderWidth: 0 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, padding: 8, usePointStyle: true } },
                    tooltip: { ...tooltip, callbacks: { label: c => ` ${c.label}: R$ ${c.parsed}k` } }
                },
                scales: { r: { ticks: { display: false }, grid: { color: 'rgba(15,23,42,.08)' }, angleLines: { color: 'rgba(15,23,42,.05)' } } }
            }
        });
    }

    /* ============ CHART: DESPESAS DOUGHNUT ============ */
    function chartDespesas() {
        charts.desp?.destroy();
        charts.desp = new Chart(ctx('chartDespesas'), {
            type: 'doughnut',
            data: { labels: DESPESAS.map(d => d.label), datasets: [{ data: DESPESAS.map(d => d.value), backgroundColor: DESPESAS.map(d => d.color), borderWidth: 0, spacing: 3, hoverOffset: 8 }] },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '72%',
                plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ` ${c.label}: ${c.parsed}%` } } }
            }
        });
        $('#legendDespesas').innerHTML = DESPESAS.map(d => `<span class="legend-item"><span class="sw" style="background:${d.color}"></span>${d.label} <b style="margin-left:6px;color:var(--ink);font-weight:700">${d.value}%</b></span>`).join('');
    }

    /* ============ CHART: PAGAMENTOS (bar h) ============ */
    function chartPagamento() {
        const c = ctx('chartPagamento');
        charts.pag?.destroy();
        charts.pag = new Chart(c, {
            type: 'bar',
            data: {
                labels: PAGAMENTOS.map(p => p.name),
                datasets: [{ data: PAGAMENTOS.map(p => p.value), backgroundColor: PAGAMENTOS.map(p => p.color), borderRadius: 8, maxBarThickness: 24 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ` ${c.parsed.x}%` } } },
                scales: {
                    x: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: true, ticks: { font: { size: 11 }, callback: v => v + '%' } },
                    y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } }
                }
            }
        });
    }

    /* ============ CHART: FLUXO DE CAIXA ============ */
    function chartFluxo(mode = 'diario') {
        const days = Array.from({ length: 30 }, (_, i) => (i + 1).toString().padStart(2, '0'));
        const entradas = days.map((_, i) => Math.round(58 + Math.sin(i / 3) * 22 + Math.random() * 18));
        const saidas = days.map((_, i) => Math.round(46 + Math.cos(i / 4) * 18 + Math.random() * 16));

        let dE = entradas.slice(), dS = saidas.slice();
        if (mode === 'acumulado') {
            dE = entradas.reduce((a, v, i) => { a.push((a[i - 1] || 0) + v); return a; }, []);
            dS = saidas.reduce((a, v, i) => { a.push((a[i - 1] || 0) + v); return a; }, []);
        }

        const c = ctx('chartFluxo');
        const gE = c.createLinearGradient(0, 0, 0, 300); gE.addColorStop(0, 'rgba(16,185,129,.35)'); gE.addColorStop(1, 'rgba(16,185,129,0)');
        const gS = c.createLinearGradient(0, 0, 0, 300); gS.addColorStop(0, 'rgba(244,63,94,.35)'); gS.addColorStop(1, 'rgba(244,63,94,0)');

        charts.fluxo?.destroy();
        charts.fluxo = new Chart(c, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    { label: 'Entradas', data: dE, borderColor: COLORS.ok, backgroundColor: gE, fill: true, tension: .4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 },
                    { label: 'Saídas', data: dS, borderColor: COLORS.rose, backgroundColor: gS, fill: true, tension: .4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11.5 }, usePointStyle: true, padding: 12, boxWidth: 8 } },
                    tooltip: { ...tooltip, callbacks: { label: c => ` ${c.dataset.label}: R$ ${c.parsed.y}k` } }
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: true, ticks: { font: { size: 11 }, callback: v => 'R$ ' + v + 'k' } }
                }
            }
        });
    }

    /* ============ CHART: AGING ============ */
    function chartAging() {
        const c = ctx('chartAging');
        charts.aging?.destroy();
        charts.aging = new Chart(c, {
            type: 'bar',
            data: {
                labels: AGING.map(a => a.label),
                datasets: [{ data: AGING.map(a => a.value), backgroundColor: AGING.map(a => a.color), borderRadius: 8, maxBarThickness: 36 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ` R$ ${c.parsed.y}k` } } },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: true, ticks: { font: { size: 11 }, callback: v => 'R$ ' + v + 'k' } }
                }
            }
        });
    }

    /* ============ HEATMAP CC × MÊS ============ */
    function heatmap() {
        const el = $('#heatmap');
        const list = CC.filter(c => c.rec > 0); // only revenue-generating CC
        const max = Math.max(...list.flatMap(c => c.trend));
        const colors = ['#eef2ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'];
        let html = `<div></div>` + MONTHS.map(m => `<div class="hm-th">${m}</div>`).join('');
        list.forEach(cc => {
            html += `<div class="hm-rh" title="${cc.name}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cc.color};margin-right:7px"></span>${cc.name}</div>`;
            cc.trend.forEach((v, i) => {
                const intensity = Math.min(v / max, 1);
                const idx = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
                html += `<div class="hm-cell" style="background:${colors[idx]}" title="${cc.name} · ${MONTHS[i]}: R$ ${v}k"></div>`;
            });
        });
        el.innerHTML = html;
    }

    /* ============ SPARKLINES ============ */
    function sparklines() {
        $$('.spark').forEach(el => {
            const color = COLORS[el.dataset.spark] || COLORS.brand;
            const data = Array.from({ length: 14 }, () => Math.random() * 40 + 30);
            const c = el.getContext('2d');
            const grad = c.createLinearGradient(0, 0, 0, 40);
            grad.addColorStop(0, color + '66'); grad.addColorStop(1, color + '00');
            new Chart(c, {
                type: 'line',
                data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, backgroundColor: grad, fill: true, tension: .4, borderWidth: 2, pointRadius: 0 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
            });
        });
    }

    /* ============ TREND MINI ============ */
    function trendMini(canvas, data, color) {
        const c = canvas.getContext('2d');
        const grad = c.createLinearGradient(0, 0, 0, 30);
        grad.addColorStop(0, color + '55'); grad.addColorStop(1, color + '00');
        new Chart(c, {
            type: 'line',
            data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, backgroundColor: grad, fill: true, tension: .4, borderWidth: 1.8, pointRadius: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
        });
    }

    /* ============ BAR LIST: INSURANCE ============ */
    function renderInsurance() {
        const max = Math.max(...INSURANCE.map(i => i.value));
        $('#topInsurance').innerHTML = INSURANCE.map(i => `
    <div class="bar-item">
      <div class="bar-head"><strong>${i.name}</strong><span>${i.value}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(i.value / max * 100).toFixed(1)}%;background:${i.color}"></div></div>
    </div>
  `).join('');
    }

    /* ============ RANK TABLE: ESPECIALIDADES ============ */
    function renderRank() {
        const tb = $('#rankTable tbody');
        const enriched = SPECS.map(s => {
            const margin = ((s.rec - s.cust) / s.rec) * 100;
            const ticket = (s.rec * 1000) / s.vol;
            return { ...s, margin, ticket };
        });
        const maxR = Math.max(...enriched.map(s => s.rec));
        const maxM = Math.max(...enriched.map(s => s.margin));
        const maxV = Math.max(...enriched.map(s => s.vol));
        const ranked = enriched.map(s => {
            const score = ((s.rec / maxR) * 40 + (s.margin / maxM) * 40 + (s.vol / maxV) * 20);
            return { ...s, score: Math.round(score * 10) / 10 };
        }).sort((a, b) => b.score - a.score);

        tb.innerHTML = ranked.map((s, i) => {
            const cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            const ini = s.name.slice(0, 2).toUpperCase();
            return `
    <tr>
      <td><span class="rank-pos ${cls}">${i + 1}</span></td>
      <td><div class="doc-cell"><div class="av" style="background:${s.color}">${ini}</div><div><strong>${s.name}</strong><small>Especialidade</small></div></div></td>
      <td><b style="font-family:'JetBrains Mono',monospace">${s.vol.toLocaleString('pt-BR')}</b></td>
      <td><b style="font-family:'JetBrains Mono',monospace;color:var(--brand)">R$ ${s.rec}k</b></td>
      <td><span style="font-family:'JetBrains Mono',monospace;color:var(--ink-3)">R$ ${s.cust}k</span></td>
      <td><b style="color:${s.margin >= 60 ? 'var(--ok)' : s.margin >= 50 ? 'var(--brand)' : 'var(--warn)'};font-weight:700">${s.margin.toFixed(1)}%</b></td>
      <td><b style="font-family:'JetBrains Mono',monospace">R$ ${s.ticket.toFixed(0)}</b></td>
      <td><div class="score-bar"><div class="bar"><span style="width:${s.score}%"></span></div><b>${s.score}</b></div></td>
    </tr>`;
        }).join('');
    }

    /* ============ BREAKDOWN: DRE por CC ============ */
    function renderBreakdown(filter = '') {
        const tb = $('#breakdownTable tbody');
        const list = CC.filter(c => !filter || c.name.toLowerCase().includes(filter.toLowerCase()));
        tb.innerHTML = list.map((s, i) => {
            const lucro = s.rec - s.cust - s.desp;
            const margem = s.rec > 0 ? (lucro / s.rec) * 100 : null;
            const delta = (Math.random() * 30 - 8).toFixed(1);
            const dPos = +delta >= 0;
            return `
    <tr data-idx="${i}">
      <td><div class="spec-cell"><span class="dot" style="background:${s.color}"></span><strong>${s.name}</strong></div></td>
      <td class="num">R$ ${s.rec}k</td>
      <td class="num">R$ ${s.cust}k</td>
      <td class="num">R$ ${s.desp}k</td>
      <td class="num"><b style="color:${lucro >= 0 ? 'var(--ok)' : 'var(--danger)'}">R$ ${lucro}k</b></td>
      <td class="num">${margem !== null ? `<b style="color:${margem >= 50 ? 'var(--ok)' : margem >= 30 ? 'var(--brand)' : margem >= 0 ? 'var(--warn)' : 'var(--danger)'}">${margem.toFixed(1)}%</b>` : '<span style="color:var(--ink-3)">—</span>'}</td>
      <td class="num">${dPos ? `<span class="delta up"><i data-lucide="trending-up"></i>+${delta}%</span>` : `<span class="delta down"><i data-lucide="trending-down"></i>${delta}%</span>`}</td>
      <td><canvas class="trend-cell" id="trend${i}"></canvas></td>
    </tr>`;
        }).join('');
        lucide.createIcons();
        list.forEach((s, i) => {
            const c = $('#trend' + i);
            if (c) trendMini(c, s.trend, s.color);
        });
        // totals
        const tot = list.reduce((a, s) => ({ rec: a.rec + s.rec, cust: a.cust + s.cust, desp: a.desp + s.desp }), { rec: 0, cust: 0, desp: 0 });
        const luc = tot.rec - tot.cust - tot.desp;
        const mar = tot.rec > 0 ? (luc / tot.rec) * 100 : 0;
        $('#tFRec').textContent = 'R$ ' + tot.rec + 'k';
        $('#tFCust').textContent = 'R$ ' + tot.cust + 'k';
        $('#tFDesp').textContent = 'R$ ' + tot.desp + 'k';
        $('#tFLuc').textContent = 'R$ ' + luc + 'k';
        $('#tFMar').textContent = mar.toFixed(1) + '%';
    }

    /* ============ COUNTERS ============ */
    function counters() {
        $$('[data-counter]').forEach(el => {
            const target = +el.dataset.counter;
            const dur = 1200; const start = performance.now();
            function tick(now) {
                const p = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
    }

    /* ============ TOAST ============ */
    function toast(title, msg = '', type = 'info') {
        const icons = { info: 'info', ok: 'check-circle-2', warn: 'alert-triangle' };
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<i data-lucide="${icons[type]}"></i><div><strong>${title}</strong>${msg ? `<span>${msg}</span>` : ''}</div>`;
        $('#toastBox').appendChild(el);
        lucide.createIcons();
        setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)' }, 3200);
        setTimeout(() => el.remove(), 3700);
    }

    /* ============ EXPORT CSV ============ */
    function exportCSV() {
        const headers = ['Centro de Custo', 'Receita (k)', 'Custo direto (k)', 'Despesa (k)', 'Lucro (k)', 'Margem (%)'];
        const rows = CC.map(s => {
            const luc = s.rec - s.cust - s.desp;
            const mar = s.rec > 0 ? ((luc / s.rec) * 100).toFixed(1) : '';
            return [s.name, s.rec, s.cust, s.desp, luc, mar];
        });
        const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `relatorio-financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast('Relatório exportado', 'Arquivo CSV gerado', 'ok');
    }

    /* ============ BINDINGS ============ */
    function bind() {
        // theme
        const savedTheme = localStorage.getItem('g4med-theme');
        if (savedTheme === 'dark') {
            document.documentElement.dataset.theme = 'dark';
            $('#toggleTheme i')?.setAttribute('data-lucide', 'sun');
            lucide.createIcons();
        }
        $('#toggleTheme').addEventListener('click', () => {
            const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = cur;
            localStorage.setItem('g4med-theme', cur);
            $('#toggleTheme i').setAttribute('data-lucide', cur === 'dark' ? 'sun' : 'moon');
            lucide.createIcons();
            cfgChart();
            Object.values(charts).forEach(c => c.update());
            toast(`Tema ${cur === 'dark' ? 'escuro' : 'claro'} ativado`);
        });

        // periods
        $$('.period-tabs button').forEach(b => b.addEventListener('click', () => {
            $$('.period-tabs button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            toast('Período atualizado', `${b.textContent.trim()} aplicado`, 'ok');
        }));

        // metric seg (receita/despesa/lucro)
        $$('.seg button[data-metric]').forEach(b => b.addEventListener('click', () => {
            b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            chartReceitaDespesa(b.dataset.metric);
        }));

        // fluxo seg (mode)
        $$('.seg button[data-mode]').forEach(b => b.addEventListener('click', () => {
            b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            chartFluxo(b.dataset.mode);
        }));

        // refresh
        $('#btnRefresh').addEventListener('click', () => {
            const ic = $('#btnRefresh i');
            ic.style.transition = 'transform .8s';
            ic.style.transform = 'rotate(360deg)';
            setTimeout(() => { ic.style.transform = '' }, 800);
            toast('Dados atualizados', 'Última sincronização agora', 'ok');
            $('#lastUpdate').textContent = 'agora';
        });

        // export / print / share
        $('#btnExport').addEventListener('click', exportCSV);
        $('#btnExportCat')?.addEventListener('click', exportCSV);
        $('#btnPrint').addEventListener('click', () => window.print());
        $('#btnShare').addEventListener('click', () => {
            if (navigator.share) navigator.share({ title: 'Relatório Financeiro G4Med', text: 'Veja o relatório', url: location.href }).catch(() => { });
            else { navigator.clipboard?.writeText(location.href); toast('Link copiado', 'Compartilhe com sua equipe', 'ok') }
        });

        // filters
        $('#btnApply').addEventListener('click', () => {
            toast('Filtros aplicados', 'Atualizando dashboards...', 'ok');
            counters();
        });
        $('#btnClear').addEventListener('click', () => {
            $$('.filter-bar select').forEach(s => s.selectedIndex = 0);
            $('#dateFrom').value = ''; $('#dateTo').value = '';
            toast('Filtros limpos');
        });

        // search
        $('#tblSearch').addEventListener('input', e => renderBreakdown(e.target.value));
    }

    /* ============ INIT ============ */
    function init() {
        lucide.createIcons();
        cfgChart();

        chartReceitaDespesa();
        chartFonteReceita();
        chartDespesas();
        chartPagamento();
        chartFluxo();
        chartAging();
        heatmap();
        sparklines();
        renderInsurance();
        renderRank();
        renderBreakdown();
        counters();
        bind();

        const t = new Date();
        const f = new Date(); f.setDate(f.getDate() - 30);
        $('#dateFrom').valueAsDate = f;
        $('#dateTo').valueAsDate = t;

        setTimeout(() => toast('Bem-vindo ao BI Financeiro', 'DRE consolidado em tempo real', 'ok'), 400);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

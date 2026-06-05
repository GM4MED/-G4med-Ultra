/* =========================================================
   G4MED · Relatório de Estoque · BI · JS
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

    const CATEGORIES = [
        { name: 'Medicamentos', color: COLORS.brand, skus: 312, qty: 18420, value: 842000, giro: 6.4, ruptura: 1.8, delta: 12.4, trend: [120, 134, 142, 151, 148, 162, 178, 184, 192, 201, 215, 228] },
        { name: 'Materiais Cirúrgicos', color: COLORS.cyan, skus: 148, qty: 8240, value: 612000, giro: 4.8, ruptura: 2.1, delta: 8.7, trend: [80, 82, 86, 91, 95, 98, 103, 108, 112, 118, 124, 131] },
        { name: 'EPIs', color: COLORS.purple, skus: 64, qty: 24800, value: 312000, giro: 7.2, ruptura: 0.9, delta: 18.2, trend: [40, 52, 68, 84, 96, 108, 118, 124, 132, 142, 156, 168] },
        { name: 'Descartáveis', color: COLORS.rose, skus: 96, qty: 32100, value: 284000, giro: 8.1, ruptura: 3.2, delta: 14.5, trend: [110, 118, 124, 131, 138, 142, 148, 156, 162, 170, 178, 184] },
        { name: 'Limpeza', color: COLORS.warn, skus: 42, qty: 6420, value: 128000, giro: 5.4, ruptura: 1.4, delta: 4.2, trend: [60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82] },
        { name: 'Escritório', color: COLORS.info, skus: 38, qty: 4180, value: 42000, giro: 3.2, ruptura: 0.6, delta: -1.8, trend: [28, 29, 28, 30, 31, 30, 29, 30, 31, 32, 31, 30] },
        { name: 'Laboratório', color: COLORS.ok, skus: 128, qty: 5640, value: 368000, giro: 5.1, ruptura: 2.8, delta: 9.6, trend: [50, 54, 58, 62, 68, 72, 76, 82, 86, 92, 96, 102] },
        { name: 'Reagentes', color: COLORS.danger, skus: 84, qty: 3120, value: 259000, giro: 4.6, ruptura: 3.6, delta: 6.3, trend: [34, 36, 38, 40, 42, 44, 46, 48, 52, 56, 58, 62] },
    ];

    const PRODUCTS = [
        { code: 'MED-0142', name: 'Soro Fisiológico 0,9% 500ml', cat: 'Medicamentos', qty: 2840, value: 42600, giro: 9.2, crit: 'alta' },
        { code: 'DESC-0078', name: 'Luva Procedimento Nitrílica M', cat: 'Descartáveis', qty: 18400, value: 36800, giro: 11.4, crit: 'media' },
        { code: 'EPI-0021', name: 'Máscara Cirúrgica Tripla', cat: 'EPIs', qty: 14200, value: 21300, giro: 10.6, crit: 'baixa' },
        { code: 'MED-0287', name: 'Dipirona Sódica 500mg/ml', cat: 'Medicamentos', qty: 1680, value: 18480, giro: 7.8, crit: 'media' },
        { code: 'CIR-0034', name: 'Compressa Gaze Estéril 7,5x7,5', cat: 'Materiais Cirúrgicos', qty: 8920, value: 17840, giro: 8.4, crit: 'alta' },
        { code: 'MED-0091', name: 'Paracetamol 750mg comp.', cat: 'Medicamentos', qty: 9800, value: 14700, giro: 6.9, crit: 'baixa' },
        { code: 'DESC-0102', name: 'Seringa Descartável 10ml', cat: 'Descartáveis', qty: 7240, value: 14480, giro: 9.8, crit: 'media' },
        { code: 'MED-0156', name: 'Amoxicilina 500mg cáps.', cat: 'Medicamentos', qty: 5600, value: 13440, giro: 5.4, crit: 'baixa' },
        { code: 'CIR-0067', name: 'Fio Sutura Nylon 3-0', cat: 'Materiais Cirúrgicos', qty: 1240, value: 12400, giro: 4.6, crit: 'media' },
        { code: 'EPI-0008', name: 'Avental Descartável SMS', cat: 'EPIs', qty: 6800, value: 11900, giro: 8.7, crit: 'baixa' },
        { code: 'LAB-0023', name: 'Tubo Coleta EDTA 4ml', cat: 'Laboratório', qty: 4200, value: 10500, giro: 6.2, crit: 'media' },
        { code: 'REA-0012', name: 'Reagente Glicose 1L', cat: 'Reagentes', qty: 284, value: 9940, giro: 5.1, crit: 'alta' },
        { code: 'MED-0418', name: 'Insulina NPH 100UI/ml', cat: 'Medicamentos', qty: 412, value: 9472, giro: 4.8, crit: 'alta' },
        { code: 'DESC-0145', name: 'Cateter Intravenoso 22G', cat: 'Descartáveis', qty: 3640, value: 9100, giro: 8.2, crit: 'media' },
        { code: 'CIR-0089', name: 'Bisturi Descartável Nº15', cat: 'Materiais Cirúrgicos', qty: 2180, value: 8720, giro: 5.8, crit: 'baixa' },
    ];

    const LOW_STOCK = [
        { name: 'Soro Fisiológico 0,9% 500ml', current: 42, minimum: 200, cat: 'Medicamentos' },
        { name: 'Insulina NPH 100UI/ml', current: 18, minimum: 80, cat: 'Medicamentos' },
        { name: 'Compressa Gaze 7,5x7,5', current: 148, minimum: 500, cat: 'Materiais Cirúrgicos' },
        { name: 'Fio Sutura Vicryl 2-0', current: 24, minimum: 80, cat: 'Materiais Cirúrgicos' },
        { name: 'Reagente Glicose 1L', current: 8, minimum: 24, cat: 'Reagentes' },
        { name: 'Máscara N95 PFF2', current: 120, minimum: 400, cat: 'EPIs' },
        { name: 'Tubo Coleta Heparina', current: 84, minimum: 240, cat: 'Laboratório' },
        { name: 'Cateter Foley 16Fr', current: 14, minimum: 60, cat: 'Descartáveis' },
        { name: 'Álcool 70% 1L', current: 32, minimum: 120, cat: 'Limpeza' },
        { name: 'Reagente Hemograma Completo', current: 6, minimum: 20, cat: 'Reagentes' },
    ];

    const SUPPLIERS = [
        { name: 'MedSupply Brasil', value: 32, color: COLORS.brand },
        { name: 'FarmaDistribuidora', value: 24, color: COLORS.cyan },
        { name: 'HospitalCare', value: 16, color: COLORS.purple },
        { name: 'BioMed Soluções', value: 12, color: COLORS.rose },
        { name: 'CirurgiCenter', value: 9, color: COLORS.warn },
        { name: 'Equipamed', value: 7, color: COLORS.info },
    ];

    const VALIDADE = [
        { label: 'Vencido', value: 2.4, color: COLORS.danger },
        { label: '< 30 dias', value: 9.2, color: COLORS.warn },
        { label: '30-90 dias', value: 18.6, color: COLORS.info },
        { label: '> 90 dias', value: 69.8, color: COLORS.ok },
    ];

    const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const charts = {};
    const ctx = id => $('#' + id).getContext('2d');

    /* ============ CHART DEFAULTS ============ */
    function cfgChart() {
        const dark = document.documentElement.dataset.theme === 'dark';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = dark ? '#94a3b8' : '#64748b';
        Chart.defaults.borderColor = dark ? 'rgba(255,255,255,.06)' : 'rgba(15,23,42,.06)';
    }

    const tooltip = {
        enabled: true,
        backgroundColor: 'rgba(15,23,42,.95)',
        titleColor: '#fff', titleFont: { weight: 700, size: 12.5 },
        bodyColor: '#e2e8f0', bodyFont: { size: 12 },
        padding: 12, cornerRadius: 10, boxPadding: 6, displayColors: true, usePointStyle: true,
        borderColor: 'rgba(255,255,255,.08)', borderWidth: 1,
    };

    /* ============ CHART: VALOR POR CATEGORIA ============ */
    function chartEstoqueValor(mode = 'bar-h') {
        const c = ctx('chartEstoqueValor');
        const grad = c.createLinearGradient(0, 0, mode === 'bar-h' ? 600 : 0, mode === 'bar-h' ? 0 : 300);
        grad.addColorStop(0, COLORS.brand);
        grad.addColorStop(1, COLORS.cyan);
        charts.valor?.destroy();
        charts.valor = new Chart(c, {
            type: 'bar',
            data: {
                labels: CATEGORIES.map(c => c.name),
                datasets: [{
                    label: 'Valor (R$)',
                    data: CATEGORIES.map(c => c.value),
                    backgroundColor: grad,
                    borderRadius: 8,
                    maxBarThickness: 32,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: mode === 'bar-h' ? 'y' : 'x',
                plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ` R$ ${c.parsed[mode === 'bar-h' ? 'x' : 'y'].toLocaleString('pt-BR')}` } } },
                scales: {
                    x: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, ticks: { font: { size: 11 }, callback: v => 'R$ ' + (v / 1000).toFixed(0) + 'k' } },
                    y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } }
                }
            }
        });
    }

    /* ============ CHART: VALIDADE DOUGHNUT ============ */
    function chartEstoqueValidade() {
        charts.validade?.destroy();
        charts.validade = new Chart(ctx('chartEstoqueValidade'), {
            type: 'doughnut',
            data: { labels: VALIDADE.map(v => v.label), datasets: [{ data: VALIDADE.map(v => v.value), backgroundColor: VALIDADE.map(v => v.color), borderWidth: 0, spacing: 3, hoverOffset: 8 }] },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '72%',
                plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ` ${c.label}: ${c.parsed}%` } } }
            }
        });
        $('#legendValidade').innerHTML = VALIDADE.map(v => `<span class="legend-item"><span class="sw" style="background:${v.color}"></span>${v.label} <b style="margin-left:6px;color:var(--ink);font-weight:700">${v.value}%</b></span>`).join('');
    }

    /* ============ CHART: BAIXO ESTOQUE ============ */
    function chartBaixoEstoque() {
        const c = ctx('chartBaixoEstoque');
        charts.baixo?.destroy();
        charts.baixo = new Chart(c, {
            type: 'bar',
            data: {
                labels: LOW_STOCK.map(p => p.name),
                datasets: [
                    { label: 'Estoque atual', data: LOW_STOCK.map(p => p.current), backgroundColor: COLORS.danger, borderRadius: 6, maxBarThickness: 18 },
                    { label: 'Mínimo', data: LOW_STOCK.map(p => p.minimum), backgroundColor: COLORS.brand + '66', borderRadius: 6, maxBarThickness: 18 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: { legend: { position: 'bottom', labels: { font: { size: 11.5 }, usePointStyle: true, padding: 12, boxWidth: 8 } }, tooltip },
                scales: {
                    x: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, ticks: { font: { size: 11 } }, beginAtZero: true },
                    y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 } } }
                }
            }
        });
    }

    /* ============ CHART: MOVIMENTAÇÃO ============ */
    function chartMovimentacaoEstoque() {
        const days = Array.from({ length: 30 }, (_, i) => (i + 1).toString().padStart(2, '0'));
        const entradas = days.map((_, i) => Math.round(120 + Math.sin(i / 3) * 38 + Math.random() * 30));
        const saidas = days.map((_, i) => Math.round(140 + Math.cos(i / 4) * 32 + Math.random() * 28));
        const meta = days.map(() => 180);

        const c = ctx('chartMovimentacaoEstoque');
        const gradE = c.createLinearGradient(0, 0, 0, 300);
        gradE.addColorStop(0, 'rgba(16,185,129,.35)'); gradE.addColorStop(1, 'rgba(16,185,129,0)');
        const gradS = c.createLinearGradient(0, 0, 0, 300);
        gradS.addColorStop(0, 'rgba(244,63,94,.35)'); gradS.addColorStop(1, 'rgba(244,63,94,0)');

        charts.mov?.destroy();
        charts.mov = new Chart(c, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    { label: 'Entradas', data: entradas, borderColor: COLORS.ok, backgroundColor: gradE, fill: true, tension: .4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 },
                    { label: 'Saídas', data: saidas, borderColor: COLORS.rose, backgroundColor: gradS, fill: true, tension: .4, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5 },
                    { label: 'Meta', data: meta, borderColor: COLORS.brand, borderDash: [6, 4], borderWidth: 2, pointRadius: 0, tension: 0, fill: false }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, usePointStyle: true, padding: 10, boxWidth: 8 } }, tooltip },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: true, ticks: { font: { size: 11 } } }
                }
            }
        });
    }

    /* ============ CHART: CONSUMO MATERIAIS (12 meses) ============ */
    function chartConsumoMateriais(metric = 'all') {
        const map = { med: 'Medicamentos', cir: 'Materiais Cirúrgicos', epi: 'EPIs', desc: 'Descartáveis' };
        const list = metric === 'all' ? CATEGORIES : CATEGORIES.filter(c => c.name === map[metric]);
        const c = ctx('chartConsumoMateriais');

        const datasets = list.map(cat => {
            const grad = c.createLinearGradient(0, 0, 0, 380);
            grad.addColorStop(0, cat.color + '35');
            grad.addColorStop(1, cat.color + '00');
            return {
                label: cat.name,
                data: cat.trend,
                borderColor: cat.color,
                backgroundColor: grad,
                fill: list.length <= 2,
                tension: .4,
                borderWidth: list.length <= 2 ? 3 : 2,
                pointRadius: list.length <= 2 ? 4 : 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: cat.color,
                pointBorderWidth: 2,
                pointHoverRadius: 6
            };
        });

        charts.consumo?.destroy();
        charts.consumo = new Chart(c, {
            type: 'line',
            data: { labels: MONTHS, datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 12 }, usePointStyle: true, padding: 14, boxWidth: 8 } },
                    tooltip
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5 } } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: false, ticks: { font: { size: 11 }, callback: v => v.toLocaleString('pt-BR') } }
                }
            }
        });
    }

    /* ============ HEATMAP CATEGORIA × MÊS ============ */
    function heatmap() {
        const el = $('#heatmap');
        // calc max value across all
        const max = Math.max(...CATEGORIES.flatMap(c => c.trend));
        const colors = ['#eef2ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'];
        let html = `<div></div>` + MONTHS.map(m => `<div class="hm-th">${m}</div>`).join('');
        CATEGORIES.forEach(cat => {
            html += `<div class="hm-rh" title="${cat.name}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cat.color};margin-right:7px"></span>${cat.name}</div>`;
            cat.trend.forEach((v, i) => {
                const intensity = Math.min(v / max, 1);
                const idx = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
                const c = colors[idx];
                html += `<div class="hm-cell" style="background:${c}" title="${cat.name} · ${MONTHS[i]}: ${v} un"></div>`;
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

    /* ============ TREND MINI CHARTS (table) ============ */
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

    /* ============ BAR LIST: SUPPLIERS ============ */
    function renderSuppliers() {
        const max = Math.max(...SUPPLIERS.map(s => s.value));
        $('#topSuppliers').innerHTML = SUPPLIERS.map(s => `
    <div class="bar-item">
      <div class="bar-head"><strong>${s.name}</strong><span>${s.value}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(s.value / max * 100).toFixed(1)}%;background:${s.color}"></div></div>
    </div>
  `).join('');
    }

    /* ============ RANK TABLE (TOP PRODUCTS) ============ */
    function renderRank() {
        const tb = $('#rankTable tbody');
        const maxQ = Math.max(...PRODUCTS.map(p => p.qty));
        const maxV = Math.max(...PRODUCTS.map(p => p.value));
        const maxG = Math.max(...PRODUCTS.map(p => p.giro));
        const ranked = PRODUCTS.map(p => {
            const score = ((p.qty / maxQ) * 40 + (p.value / maxV) * 30 + (p.giro / maxG) * 30);
            return { ...p, score: Math.round(score * 10) / 10 };
        }).sort((a, b) => b.score - a.score);

        const initials = name => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        const catColor = name => (CATEGORIES.find(c => c.name === name) || {}).color || COLORS.brand;

        tb.innerHTML = ranked.map((p, i) => {
            const cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            return `
    <tr>
      <td><span class="rank-pos ${cls}">${i + 1}</span></td>
      <td><b style="font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--ink-2)">${p.code}</b></td>
      <td><div class="doc-cell"><div class="av" style="background:${catColor(p.cat)}">${initials(p.name)}</div><div><strong>${p.name}</strong><small>${p.cat}</small></div></div></td>
      <td><span class="spec-cell"><span class="dot" style="background:${catColor(p.cat)}"></span>${p.cat}</span></td>
      <td><b style="font-family:'JetBrains Mono',monospace">${p.qty.toLocaleString('pt-BR')}</b></td>
      <td><b style="font-family:'JetBrains Mono',monospace;color:var(--ink-2)">R$ ${(p.value / 1000).toFixed(1)}k</b></td>
      <td><b style="color:${p.giro >= 8 ? 'var(--ok)' : p.giro >= 5 ? 'var(--brand)' : 'var(--warn)'};font-weight:700">${p.giro.toFixed(1)}x</b></td>
      <td><div class="score-bar"><div class="bar"><span style="width:${p.score}%"></span></div><b>${p.score}</b></div></td>
    </tr>`;
        }).join('');
    }

    /* ============ BREAKDOWN TABLE ============ */
    function renderBreakdown(filter = '') {
        const tb = $('#breakdownTable tbody');
        const list = CATEGORIES.filter(c => !filter || c.name.toLowerCase().includes(filter.toLowerCase()));
        tb.innerHTML = list.map((s, i) => `
    <tr data-idx="${i}">
      <td><div class="spec-cell"><span class="dot" style="background:${s.color}"></span><strong>${s.name}</strong></div></td>
      <td class="num">${s.skus}</td>
      <td class="num">${s.qty.toLocaleString('pt-BR')}</td>
      <td class="num">R$ ${(s.value / 1000).toFixed(0)}k</td>
      <td class="num"><b style="color:${s.giro >= 6 ? 'var(--ok)' : s.giro >= 4 ? 'var(--ink-2)' : 'var(--warn)'}">${s.giro.toFixed(1)}x</b></td>
      <td class="num"><b style="color:${s.ruptura <= 1.5 ? 'var(--ok)' : s.ruptura <= 2.5 ? 'var(--warn)' : 'var(--danger)'}">${s.ruptura.toFixed(1)}%</b></td>
      <td class="num">${s.delta >= 0 ? `<span class="delta up"><i data-lucide="trending-up"></i>+${s.delta}%</span>` : `<span class="delta down"><i data-lucide="trending-down"></i>${s.delta}%</span>`}</td>
      <td><canvas class="trend-cell" id="trend${i}"></canvas></td>
    </tr>
  `).join('');
        lucide.createIcons();
        list.forEach((s, i) => {
            const c = $('#trend' + i);
            if (c) trendMini(c, s.trend, s.color);
        });
        // totals
        const tot = list.reduce((a, s) => ({ sku: a.sku + s.skus, qty: a.qty + s.qty, val: a.val + s.value, gir: a.gir + s.giro * s.qty, rup: a.rup + s.ruptura * s.qty, w: a.w + s.qty }), { sku: 0, qty: 0, val: 0, gir: 0, rup: 0, w: 0 });
        $('#tFSku').textContent = tot.sku.toLocaleString('pt-BR');
        $('#tFQtd').textContent = tot.qty.toLocaleString('pt-BR');
        $('#tFVal').textContent = 'R$ ' + (tot.val / 1000).toFixed(0) + 'k';
        $('#tFGir').textContent = (tot.gir / tot.w).toFixed(1) + 'x';
        $('#tFRup').textContent = (tot.rup / tot.w).toFixed(1) + '%';
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
        const headers = ['Categoria', 'SKUs', 'Qtd estoque', 'Valor (R$)', 'Giro', 'Ruptura (%)', 'Variacao (%)'];
        const rows = CATEGORIES.map(s => [s.name, s.skus, s.qty, s.value, s.giro, s.ruptura, s.delta]);
        const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `relatorio-estoque-${new Date().toISOString().slice(0, 10)}.csv`;
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

        // consumo seg (metric)
        $$('.seg button[data-metric]').forEach(b => b.addEventListener('click', () => {
            b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            chartConsumoMateriais(b.dataset.metric);
        }));

        // valor seg (mode)
        $$('.seg button[data-mode]').forEach(b => b.addEventListener('click', () => {
            b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            chartEstoqueValor(b.dataset.mode);
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
            if (navigator.share) navigator.share({ title: 'Relatório Estoque G4Med', text: 'Veja o relatório', url: location.href }).catch(() => { });
            else { navigator.clipboard?.writeText(location.href); toast('Link copiado', 'Compartilhe com sua equipe', 'ok') }
        });

        // filters apply / clear
        $('#btnApply').addEventListener('click', () => {
            toast('Filtros aplicados', 'Atualizando dashboards...', 'ok');
            counters();
        });
        $('#btnClear').addEventListener('click', () => {
            $$('.filter-bar select').forEach(s => s.selectedIndex = 0);
            $('#dateFrom').value = ''; $('#dateTo').value = '';
            toast('Filtros limpos');
        });

        // table search
        $('#tblSearch').addEventListener('input', e => renderBreakdown(e.target.value));
    }

    /* ============ INIT ============ */
    function init() {
        lucide.createIcons();
        cfgChart();

        chartEstoqueValor();
        chartEstoqueValidade();
        chartBaixoEstoque();
        chartMovimentacaoEstoque();
        chartConsumoMateriais();
        heatmap();
        sparklines();
        renderSuppliers();
        renderRank();
        renderBreakdown();
        counters();
        bind();

        // dates default = last 30 days
        const t = new Date();
        const f = new Date(); f.setDate(f.getDate() - 30);
        $('#dateFrom').valueAsDate = f;
        $('#dateTo').valueAsDate = t;

        setTimeout(() => toast('Bem-vindo ao BI de Estoque', 'Inventário sincronizado em tempo real', 'ok'), 400);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

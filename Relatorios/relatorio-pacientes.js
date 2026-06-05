/* =========================================================
   G4MED · Relatório de Pacientes · BI · JS
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

    const NEW_PATIENTS = [342, 368, 401, 389, 425, 448, 462, 471, 489, 512, 498, 487];
    const TARGET = [350, 370, 390, 410, 430, 450, 470, 490, 510, 530, 550, 570];

    const SEXO = [
        { label: 'Feminino', value: 58, color: COLORS.rose },
        { label: 'Masculino', value: 40, color: COLORS.brand },
        { label: 'Outro', value: 2, color: COLORS.purple },
    ];

    const CONVENIOS = [
        { name: 'Particular', value: 2840, perc: 22.1, age: 36, ltv: 3120, ret: 72, delta: 9.4, color: COLORS.brand, trend: [180, 192, 204, 216, 228, 238, 248, 258, 268, 278, 284, 290] },
        { name: 'Unimed', value: 3210, perc: 25.0, age: 39, ltv: 2480, ret: 74, delta: 6.2, color: COLORS.cyan, trend: [210, 218, 228, 238, 248, 256, 264, 272, 280, 286, 292, 298] },
        { name: 'Bradesco Saúde', value: 1980, perc: 15.4, age: 41, ltv: 2780, ret: 68, delta: 4.8, color: COLORS.purple, trend: [150, 158, 164, 170, 176, 182, 188, 194, 198, 204, 208, 212] },
        { name: 'SulAmérica', value: 1420, perc: 11.1, age: 38, ltv: 2540, ret: 66, delta: 11.2, color: COLORS.rose, trend: [100, 108, 116, 124, 132, 138, 144, 150, 156, 162, 168, 172] },
        { name: 'Amil', value: 1180, perc: 9.2, age: 40, ltv: 2220, ret: 62, delta: -2.1, color: COLORS.warn, trend: [110, 112, 116, 118, 116, 118, 114, 116, 118, 116, 114, 112] },
        { name: 'NotreDame', value: 842, perc: 6.6, age: 37, ltv: 2140, ret: 64, delta: 8.3, color: COLORS.ok, trend: [58, 62, 66, 70, 74, 76, 80, 82, 84, 86, 88, 90] },
        { name: 'Hapvida', value: 684, perc: 5.3, age: 42, ltv: 1840, ret: 58, delta: 5.7, color: COLORS.info, trend: [50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72] },
        { name: 'Outros', value: 691, perc: 5.4, age: 39, ltv: 2080, ret: 60, delta: 3.2, color: COLORS.danger, trend: [54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 72, 74] },
    ];

    const FAIXAS = [
        { label: '0-12', fem: 284, mas: 312 },
        { label: '13-17', fem: 198, mas: 212 },
        { label: '18-29', fem: 1420, mas: 1180 },
        { label: '30-44', fem: 2680, mas: 2120 },
        { label: '45-59', fem: 1842, mas: 1418 },
        { label: '60+', fem: 1064, mas: 317 },
    ];

    const ORIGENS = ['Indicação', 'Google', 'Instagram', 'Convênio', 'Site', 'Retorno'];

    const CITIES = [
        { name: 'São Paulo · SP', value: 42, color: COLORS.brand },
        { name: 'Guarulhos · SP', value: 14, color: COLORS.cyan },
        { name: 'Osasco · SP', value: 11, color: COLORS.purple },
        { name: 'Santo André · SP', value: 9, color: COLORS.rose },
        { name: 'Barueri · SP', value: 8, color: COLORS.warn },
        { name: 'Outros', value: 16, color: COLORS.info },
    ];

    const TOP_PATIENTS = [
        { name: 'Maria Silva Santos', ins: 'Particular', visits: 42, last: 'há 3 dias', ltv: 18420, nps: 9.8 },
        { name: 'João Pedro Almeida', ins: 'Unimed', visits: 38, last: 'há 1 sem', ltv: 16280, nps: 9.6 },
        { name: 'Ana Beatriz Costa', ins: 'Bradesco Saúde', visits: 36, last: 'há 2 dias', ltv: 15640, nps: 9.7 },
        { name: 'Carlos Eduardo Lima', ins: 'Particular', visits: 34, last: 'há 5 dias', ltv: 14820, nps: 9.4 },
        { name: 'Fernanda Ribeiro', ins: 'SulAmérica', visits: 32, last: 'há 12 dias', ltv: 13980, nps: 9.5 },
        { name: 'Roberto Mendes', ins: 'Unimed', visits: 30, last: 'há 1 dia', ltv: 13420, nps: 9.3 },
        { name: 'Patrícia Oliveira', ins: 'Particular', visits: 29, last: 'há 8 dias', ltv: 12960, nps: 9.6 },
        { name: 'Lucas Henrique Souza', ins: 'Amil', visits: 27, last: 'há 4 dias', ltv: 11840, nps: 9.2 },
        { name: 'Camila Andrade', ins: 'Particular', visits: 26, last: 'há 2 sem', ltv: 11420, nps: 9.5 },
        { name: 'Bruno Castro Vieira', ins: 'NotreDame', visits: 25, last: 'há 6 dias', ltv: 10840, nps: 9.1 },
        { name: 'Juliana Pereira', ins: 'Unimed', visits: 24, last: 'há 9 dias', ltv: 10420, nps: 9.4 },
        { name: 'Marcelo Torres', ins: 'Bradesco Saúde', visits: 23, last: 'há 3 sem', ltv: 9980, nps: 9.0 },
    ];

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

    /* ============ CHART: NOVOS PACIENTES ============ */
    function chartNovosPacientes(mode = 'bar') {
        const c = ctx('chartNovosPacientes');
        const grad = c.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, COLORS.brand);
        grad.addColorStop(1, COLORS.cyan);

        const gradFill = c.createLinearGradient(0, 0, 0, 300);
        gradFill.addColorStop(0, 'rgba(79,70,229,.35)');
        gradFill.addColorStop(1, 'rgba(79,70,229,0)');

        charts.novos?.destroy();
        charts.novos = new Chart(c, {
            type: mode === 'line' ? 'line' : 'bar',
            data: {
                labels: MONTHS,
                datasets: mode === 'line'
                    ? [
                        { label: 'Novos pacientes', data: NEW_PATIENTS, borderColor: COLORS.brand, backgroundColor: gradFill, fill: true, tension: .4, borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: COLORS.brand, pointBorderWidth: 2, pointHoverRadius: 6 },
                        { label: 'Meta', data: TARGET, borderColor: COLORS.ok, borderDash: [6, 4], borderWidth: 2, pointRadius: 0, tension: .4, fill: false }
                    ]
                    : [
                        { label: 'Novos pacientes', data: NEW_PATIENTS, backgroundColor: grad, borderRadius: 8, maxBarThickness: 32 },
                        { label: 'Meta', data: TARGET, type: 'line', borderColor: COLORS.ok, borderDash: [6, 4], borderWidth: 2, pointRadius: 0, tension: .4, fill: false }
                    ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { size: 11.5 }, usePointStyle: true, padding: 12, boxWidth: 8 } }, tooltip },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: true, ticks: { font: { size: 11 } } }
                }
            }
        });
    }

    /* ============ CHART: SEXO DOUGHNUT ============ */
    function chartSexoPacientes() {
        charts.sexo?.destroy();
        charts.sexo = new Chart(ctx('chartSexoPacientes'), {
            type: 'doughnut',
            data: { labels: SEXO.map(s => s.label), datasets: [{ data: SEXO.map(s => s.value), backgroundColor: SEXO.map(s => s.color), borderWidth: 0, spacing: 3, hoverOffset: 8 }] },
            options: {
                responsive: true, maintainAspectRatio: false, cutout: '72%',
                plugins: { legend: { display: false }, tooltip: { ...tooltip, callbacks: { label: c => ` ${c.label}: ${c.parsed}%` } } }
            }
        });
        $('#legendSexo').innerHTML = SEXO.map(s => `<span class="legend-item"><span class="sw" style="background:${s.color}"></span>${s.label} <b style="margin-left:6px;color:var(--ink);font-weight:700">${s.value}%</b></span>`).join('');
    }

    /* ============ CHART: CONVÊNIOS (polar) ============ */
    function chartConveniosPacientes() {
        charts.conv?.destroy();
        charts.conv = new Chart(ctx('chartConveniosPacientes'), {
            type: 'polarArea',
            data: {
                labels: CONVENIOS.map(c => c.name),
                datasets: [{ data: CONVENIOS.map(c => c.value), backgroundColor: CONVENIOS.map(c => c.color + 'cc'), borderWidth: 0 }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, padding: 8, usePointStyle: true } },
                    tooltip
                },
                scales: { r: { ticks: { display: false }, grid: { color: 'rgba(15,23,42,.08)' }, angleLines: { color: 'rgba(15,23,42,.05)' } } }
            }
        });
    }

    /* ============ CHART: FAIXA ETÁRIA (pirâmide) ============ */
    function chartFaixaEtaria() {
        charts.faixa?.destroy();
        charts.faixa = new Chart(ctx('chartFaixaEtaria'), {
            type: 'bar',
            data: {
                labels: FAIXAS.map(f => f.label),
                datasets: [
                    { label: 'Feminino', data: FAIXAS.map(f => -f.fem), backgroundColor: COLORS.rose + 'cc', borderRadius: 6, maxBarThickness: 24 },
                    { label: 'Masculino', data: FAIXAS.map(f => f.mas), backgroundColor: COLORS.brand + 'cc', borderRadius: 6, maxBarThickness: 24 },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { position: 'bottom', labels: { font: { size: 11.5 }, usePointStyle: true, padding: 12, boxWidth: 8 } },
                    tooltip: { ...tooltip, callbacks: { label: c => ` ${c.dataset.label}: ${Math.abs(c.parsed.x).toLocaleString('pt-BR')}` } }
                },
                scales: {
                    x: { stacked: false, grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, ticks: { font: { size: 10.5 }, callback: v => Math.abs(v).toLocaleString('pt-BR') } },
                    y: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5, weight: 600 } } }
                }
            }
        });
    }

    /* ============ HEATMAP ORIGEM × MÊS ============ */
    function heatmap() {
        const el = $('#heatmap');
        // simulate captação data
        const data = ORIGENS.map((o, oi) => MONTHS.map((m, mi) => {
            let base = [120, 80, 140, 90, 60, 100][oi]; // base by origin
            base = base + Math.sin(mi / 3 + oi) * 30 + Math.random() * 30;
            if (o === 'Instagram') base += mi * 8; // crescimento Instagram
            return Math.round(base);
        }));
        const max = Math.max(...data.flat());
        const colors = ['#eef2ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'];
        const iconMap = { Indicação: 'user-plus', Google: 'search', Instagram: 'instagram', Convênio: 'id-card', Site: 'globe', Retorno: 'repeat' };

        let html = `<div></div>` + MONTHS.map(m => `<div class="hm-th">${m}</div>`).join('');
        ORIGENS.forEach((o, oi) => {
            html += `<div class="hm-rh" title="${o}"><i data-lucide="${iconMap[o] || 'circle'}" style="width:14px;height:14px;margin-right:7px;color:var(--brand)"></i>${o}</div>`;
            data[oi].forEach((v, mi) => {
                const intensity = Math.min(v / max, 1);
                const idx = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
                const c = colors[idx];
                html += `<div class="hm-cell" style="background:${c}" title="${o} · ${MONTHS[mi]}: ${v} pacientes"></div>`;
            });
        });
        el.innerHTML = html;
        lucide.createIcons();
    }

    /* ============ CHART: EVOLUÇÃO ============ */
    function chartEvolucaoPacientes(metric = 'all') {
        const real = [];
        let acc = 9800;
        for (let i = 0; i < 12; i++) { acc += NEW_PATIENTS[i] - Math.round(NEW_PATIENTS[i] * 0.04); real.push(acc); }
        const target = real.map((_, i) => 9800 + (i + 1) * 420);
        const prev = real.map((v, i) => Math.round(v * 0.86 - i * 8));

        const c = ctx('chartEvolucaoPacientes');
        const grad1 = c.createLinearGradient(0, 0, 0, 380);
        grad1.addColorStop(0, 'rgba(79,70,229,.35)');
        grad1.addColorStop(1, 'rgba(79,70,229,0)');

        const datasets = [];
        if (metric === 'all' || metric === 'real') datasets.push({ label: 'Realizado', data: real, borderColor: COLORS.brand, backgroundColor: grad1, fill: true, tension: .4, borderWidth: 3, pointRadius: 5, pointBackgroundColor: '#fff', pointBorderColor: COLORS.brand, pointBorderWidth: 2, pointHoverRadius: 7 });
        if (metric === 'all' || metric === 'target') datasets.push({ label: 'Meta', data: target, borderColor: COLORS.ok, borderDash: [6, 4], borderWidth: 2, pointRadius: 0, tension: .4, fill: false });
        if (metric === 'all' || metric === 'prev') datasets.push({ label: 'Ano Anterior', data: prev, borderColor: '#94a3b8', borderWidth: 2, pointRadius: 3, tension: .4, fill: false, borderDash: [2, 3] });

        charts.evol?.destroy();
        charts.evol = new Chart(c, {
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

    /* ============ TREND MINI CHARTS ============ */
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

    /* ============ BAR LIST: CITIES ============ */
    function renderCities() {
        const max = Math.max(...CITIES.map(c => c.value));
        $('#topCities').innerHTML = CITIES.map(c => `
    <div class="bar-item">
      <div class="bar-head"><strong>${c.name}</strong><span>${c.value}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(c.value / max * 100).toFixed(1)}%;background:${c.color}"></div></div>
    </div>
  `).join('');
    }

    /* ============ RANK TABLE: TOP PACIENTES ============ */
    function renderRank() {
        const tb = $('#rankTable tbody');
        const maxV = Math.max(...TOP_PATIENTS.map(p => p.visits));
        const maxL = Math.max(...TOP_PATIENTS.map(p => p.ltv));
        const ranked = TOP_PATIENTS.map(p => {
            const score = ((p.visits / maxV) * 40 + (p.ltv / maxL) * 40 + (p.nps / 10) * 20);
            return { ...p, score: Math.round(score * 10) / 10 };
        }).sort((a, b) => b.score - a.score);

        const initials = name => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

        tb.innerHTML = ranked.map((p, i) => {
            const cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            return `
    <tr>
      <td><span class="rank-pos ${cls}">${i + 1}</span></td>
      <td><div class="doc-cell"><div class="av">${initials(p.name)}</div><div><strong>${p.name}</strong><small>${p.ins}</small></div></div></td>
      <td>${p.ins}</td>
      <td><b style="font-family:'JetBrains Mono',monospace">${p.visits}</b></td>
      <td><span style="color:var(--ink-3);font-size:12.5px">${p.last}</span></td>
      <td><b style="font-family:'JetBrains Mono',monospace;color:var(--ink-2)">R$ ${(p.ltv / 1000).toFixed(1)}k</b></td>
      <td><b style="color:${p.nps >= 9.5 ? 'var(--ok)' : p.nps >= 9 ? 'var(--brand)' : 'var(--warn)'};font-weight:700">${p.nps.toFixed(1)}</b></td>
      <td><div class="score-bar"><div class="bar"><span style="width:${p.score}%"></span></div><b>${p.score}</b></div></td>
    </tr>`;
        }).join('');
    }

    /* ============ BREAKDOWN TABLE ============ */
    function renderBreakdown(filter = '') {
        const tb = $('#breakdownTable tbody');
        const list = CONVENIOS.filter(s => !filter || s.name.toLowerCase().includes(filter.toLowerCase()));
        tb.innerHTML = list.map((s, i) => `
    <tr data-idx="${i}">
      <td><div class="spec-cell"><span class="dot" style="background:${s.color}"></span><strong>${s.name}</strong></div></td>
      <td class="num">${s.value.toLocaleString('pt-BR')}</td>
      <td class="num">${Math.round(s.value * 0.04)}</td>
      <td class="num"><b style="color:${s.ret >= 70 ? 'var(--ok)' : s.ret >= 64 ? 'var(--ink-2)' : 'var(--warn)'}">${s.ret}%</b></td>
      <td class="num">${s.age} anos</td>
      <td class="num">R$ ${(s.ltv / 1000).toFixed(1)}k</td>
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
        const tot = list.reduce((a, s) => ({ tot: a.tot + s.value, nw: a.nw + Math.round(s.value * 0.04), ret: a.ret + s.ret * s.value, age: a.age + s.age * s.value, ltv: a.ltv + s.ltv * s.value, w: a.w + s.value }), { tot: 0, nw: 0, ret: 0, age: 0, ltv: 0, w: 0 });
        $('#tFTot').textContent = tot.tot.toLocaleString('pt-BR');
        $('#tFNew').textContent = tot.nw.toLocaleString('pt-BR');
        $('#tFRet').textContent = (tot.ret / tot.w).toFixed(1) + '%';
        $('#tFAge').textContent = (tot.age / tot.w).toFixed(0) + ' anos';
        $('#tFLtv').textContent = 'R$ ' + (tot.ltv / tot.w / 1000).toFixed(1) + 'k';
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
        const headers = ['Convenio', 'Pacientes', 'Novos', 'Retorno (%)', 'Idade media', 'LTV medio (R$)', 'Variacao (%)'];
        const rows = CONVENIOS.map(s => [s.name, s.value, Math.round(s.value * 0.04), s.ret, s.age, s.ltv, s.delta]);
        const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `relatorio-pacientes-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        toast('Relatório exportado', 'Arquivo CSV gerado', 'ok');
    }

    /* ============ BINDINGS ============ */
    function bind() {
        // theme persist
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

        // evolução seg
        $$('.seg button[data-metric]').forEach(b => b.addEventListener('click', () => {
            b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            chartEvolucaoPacientes(b.dataset.metric);
        }));

        // novos pacientes seg
        $$('.seg button[data-mode]').forEach(b => b.addEventListener('click', () => {
            b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            chartNovosPacientes(b.dataset.mode);
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
            if (navigator.share) navigator.share({ title: 'Relatório Pacientes G4Med', text: 'Veja o relatório', url: location.href }).catch(() => { });
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

        chartNovosPacientes();
        chartSexoPacientes();
        chartConveniosPacientes();
        chartFaixaEtaria();
        chartEvolucaoPacientes();
        heatmap();
        sparklines();
        renderCities();
        renderRank();
        renderBreakdown();
        counters();
        bind();

        // dates default = last 30 days
        const t = new Date();
        const f = new Date(); f.setDate(f.getDate() - 30);
        $('#dateFrom').valueAsDate = f;
        $('#dateTo').valueAsDate = t;

        setTimeout(() => toast('Bem-vindo ao BI de Pacientes', 'Base sincronizada em tempo real', 'ok'), 400);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

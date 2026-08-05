(() => {
    'use strict';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const state = {
        theme: localStorage.getItem('g4med-theme') || document.documentElement.dataset.theme || 'light',
        period: '30',
        chartNovosMode: 'bar',
        chartEvolucaoMetric: 'all',
        search: '',
        filters: {
            from: '',
            to: '',
            unit: '',
            insurance: '',
            ageRange: '',
            origin: ''
        }
    };

    const COLORS = {
        brand: '#4f46e5',
        brand2: '#6366f1',
        purple: '#8b5cf6',
        cyan: '#06b6d4',
        ok: '#10b981',
        warn: '#f59e0b',
        danger: '#ef4444',
        info: '#0284c7',
        rose: '#f43f5e',
        ink3: '#94a3b8'
    };

    const CHARTS = {};

    const DATA = {
        sexo: [
            { label: 'Feminino', value: 56, color: COLORS.rose },
            { label: 'Masculino', value: 42, color: COLORS.brand },
            { label: 'Outro/Não informado', value: 2, color: COLORS.info }
        ],
        convenios: [
            { label: 'Particular', value: 34, color: COLORS.brand },
            { label: 'Unimed', value: 24, color: COLORS.cyan },
            { label: 'Bradesco Saúde', value: 14, color: COLORS.purple },
            { label: 'SulAmérica', value: 11, color: COLORS.rose },
            { label: 'Amil', value: 9, color: COLORS.warn },
            { label: 'Outros', value: 8, color: COLORS.info }
        ],
        cidades: [
            { name: 'Goiânia', value: 38, color: COLORS.brand },
            { name: 'Aparecida de Goiânia', value: 21, color: COLORS.cyan },
            { name: 'Anápolis', value: 14, color: COLORS.purple },
            { name: 'Trindade', value: 9, color: COLORS.ok },
            { name: 'Senador Canedo', value: 8, color: COLORS.warn },
            { name: 'Inhumas', value: 5, color: COLORS.rose },
            { name: 'Outras', value: 5, color: COLORS.info }
        ],
        conveniosBreakdown: [
            { name: 'Particular', patients: 4260, new: 312, ret: 69.2, age: 37, ltv: 3240, delta: 12.4, trend: [15, 18, 20, 24, 21, 25, 28, 30, 33, 31, 35, 38] },
            { name: 'Unimed', patients: 3120, new: 198, ret: 66.8, age: 39, ltv: 2810, delta: 8.7, trend: [18, 17, 19, 22, 23, 24, 26, 27, 28, 29, 31, 33] },
            { name: 'Bradesco Saúde', patients: 1860, new: 121, ret: 64.4, age: 41, ltv: 2950, delta: 5.1, trend: [10, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 24] },
            { name: 'Amil', patients: 1220, new: 94, ret: 62.1, age: 36, ltv: 2360, delta: -1.8, trend: [8, 9, 10, 11, 11, 10, 12, 13, 13, 12, 11, 12] },
            { name: 'SulAmérica', patients: 980, new: 71, ret: 60.7, age: 43, ltv: 2580, delta: 3.4, trend: [6, 8, 8, 9, 10, 10, 11, 11, 12, 13, 13, 14] },
            { name: 'Outros', patients: 1407, new: 112, ret: 58.9, age: 38, ltv: 1980, delta: 2.2, trend: [7, 7, 8, 9, 10, 10, 10, 11, 11, 12, 12, 13] }
        ],
        rankPatients: [
            { name: 'Maria Oliveira', conv: 'Particular', consultas: 28, lastVisit: '12 dias', ltv: 12400, nps: 9.8, score: 96, initials: 'MO' },
            { name: 'João Silva', conv: 'Unimed', consultas: 24, lastVisit: '18 dias', ltv: 10800, nps: 9.5, score: 93, initials: 'JS' },
            { name: 'Ana Costa', conv: 'Bradesco Saúde', consultas: 22, lastVisit: '6 dias', ltv: 10220, nps: 9.7, score: 92, initials: 'AC' },
            { name: 'Paulo Santos', conv: 'Amil', consultas: 19, lastVisit: '21 dias', ltv: 9210, nps: 9.1, score: 88, initials: 'PS' },
            { name: 'Fernanda Lima', conv: 'SulAmérica', consultas: 18, lastVisit: '9 dias', ltv: 8740, nps: 9.3, score: 87, initials: 'FL' },
            { name: 'Ricardo Alves', conv: 'Particular', consultas: 17, lastVisit: '27 dias', ltv: 8190, nps: 9.0, score: 85, initials: 'RA' },
            { name: 'Camila Rocha', conv: 'Unimed', consultas: 16, lastVisit: '14 dias', ltv: 7920, nps: 9.2, score: 84, initials: 'CR' },
            { name: 'Bruno Pereira', conv: 'Particular', consultas: 15, lastVisit: '23 dias', ltv: 7600, nps: 8.9, score: 82, initials: 'BP' },
            { name: 'Mariana Souza', conv: 'Outros', consultas: 14, lastVisit: '11 dias', ltv: 7050, nps: 9.4, score: 81, initials: 'MS' },
            { name: 'Lucas Ferreira', conv: 'Amil', consultas: 13, lastVisit: '30 dias', ltv: 6620, nps: 8.8, score: 78, initials: 'LF' },
            { name: 'Patrícia Gomes', conv: 'Bradesco Saúde', consultas: 12, lastVisit: '16 dias', ltv: 6410, nps: 9.1, score: 77, initials: 'PG' },
            { name: 'Thiago Martins', conv: 'SulAmérica', consultas: 11, lastVisit: '19 dias', ltv: 6120, nps: 8.7, score: 75, initials: 'TM' }
        ]
    };

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const novosReal = [210, 245, 268, 289, 301, 322, 340, 355, 372, 390, 0, 0];
    const novosMeta = [200, 230, 250, 275, 290, 310, 320, 340, 360, 380, 400, 420];
    const novosPrev = [180, 195, 212, 230, 244, 255, 266, 280, 290, 301, 315, 330];

    const getCanvas = id => {
        const el = document.getElementById(id);
        return el ? el.getContext('2d') : null;
    };

    function applyChartDefaults() {
        const dark = document.documentElement.dataset.theme === 'dark';
        Chart.defaults.font.family = "'Plus Jakarta Sans', system-ui, sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = dark ? '#94a3b8' : '#64748b';
        Chart.defaults.borderColor = dark ? 'rgba(255,255,255,.08)' : 'rgba(15,23,42,.08)';
    }

    function destroyChart(key) {
        if (CHARTS[key]) {
            CHARTS[key].destroy();
            CHARTS[key] = null;
        }
    }

    const tooltipBase = {
        enabled: true,
        backgroundColor: 'rgba(15,23,42,.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        displayColors: true,
        usePointStyle: true,
        titleFont: { weight: '700', size: 12.5 },
        bodyFont: { size: 12 }
    };

    function createChartNovos(mode = state.chartNovosMode) {
        const ctx = getCanvas('chartNovosPacientes');
        if (!ctx) return;
        destroyChart('novos');

        const grad = ctx.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, COLORS.brand);
        grad.addColorStop(1, COLORS.cyan);

        const datasets = [];
        if (mode === 'bar') {
            datasets.push({
                label: 'Novos',
                data: novosReal,
                backgroundColor: grad,
                borderRadius: 8,
                maxBarThickness: 32
            });
        } else {
            datasets.push({
                label: 'Novos',
                data: novosReal,
                borderColor: COLORS.brand,
                backgroundColor: 'rgba(79,70,229,.15)',
                fill: true,
                tension: .4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#fff',
                pointBorderColor: COLORS.brand,
                pointBorderWidth: 2
            });
        }

        datasets.push({
            label: 'Meta',
            data: novosMeta,
            borderColor: COLORS.ok,
            borderDash: [6, 4],
            borderWidth: 2,
            pointRadius: 0,
            tension: .4,
            fill: false
        });

        CHARTS.novos = new Chart(ctx, {
            type: mode === 'bar' ? 'bar' : 'line',
            data: { labels: months, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 12 }, usePointStyle: true, padding: 14, boxWidth: 8 }
                    },
                    tooltip: tooltipBase
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11.5 } } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: true, ticks: { font: { size: 11 } } }
                }
            }
        });
    }

    function createSexoChart() {
        const ctx = getCanvas('chartSexoPacientes');
        if (!ctx) return;
        destroyChart('sexo');

        CHARTS.sexo = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: DATA.sexo.map(s => s.label),
                datasets: [{
                    data: DATA.sexo.map(s => s.value),
                    backgroundColor: DATA.sexo.map(s => s.color),
                    borderWidth: 0,
                    spacing: 3,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...tooltipBase,
                        callbacks: {
                            label: c => ` ${c.label}: ${c.parsed}%`
                        }
                    }
                }
            }
        });

        const legend = document.getElementById('legendSexo');
        if (legend) {
            legend.innerHTML = DATA.sexo.map(s => `
        <span class="legend-item">
          <span class="sw" style="background:${s.color}"></span>
          ${s.label}
          <b style="margin-left:6px;color:var(--ink);font-weight:700">${s.value}%</b>
        </span>
      `).join('');
        }
    }

    function createConveniosChart() {
        const ctx = getCanvas('chartConveniosPacientes');
        if (!ctx) return;
        destroyChart('convenios');

        CHARTS.convenios = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: DATA.convenios.map(c => c.label),
                datasets: [{
                    data: DATA.convenios.map(c => c.value),
                    backgroundColor: DATA.convenios.map(c => `${c.color}cc`),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { font: { size: 11 }, boxWidth: 10, padding: 10, usePointStyle: true }
                    },
                    tooltip: tooltipBase
                },
                scales: {
                    r: {
                        ticks: { display: false },
                        grid: { color: 'rgba(15,23,42,.08)' },
                        angleLines: { color: 'rgba(15,23,42,.05)' }
                    }
                }
            }
        });
    }

    function createFaixaEtariaChart() {
        const ctx = getCanvas('chartFaixaEtaria');
        if (!ctx) return;
        destroyChart('faixa');

        const labels = ['0-12', '13-17', '18-29', '30-44', '45-59', '60+'];
        const values = [8, 11, 20, 28, 18, 15];

        CHARTS.faixa = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Pacientes',
                    data: values,
                    backgroundColor: [
                        COLORS.brand,
                        COLORS.cyan,
                        COLORS.purple,
                        COLORS.ok,
                        COLORS.warn,
                        COLORS.rose
                    ],
                    borderRadius: 8,
                    maxBarThickness: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: tooltipBase
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: true }
                }
            }
        });
    }

    function createEvolucaoChart(metric = state.chartEvolucaoMetric) {
        const ctx = getCanvas('chartEvolucaoPacientes');
        if (!ctx) return;
        destroyChart('evolucao');

        const grad = ctx.createLinearGradient(0, 0, 0, 380);
        grad.addColorStop(0, 'rgba(79,70,229,.35)');
        grad.addColorStop(1, 'rgba(79,70,229,0)');

        const datasets = [];
        if (metric === 'all' || metric === 'real') {
            datasets.push({
                label: 'Realizado',
                data: novosReal,
                borderColor: COLORS.brand,
                backgroundColor: grad,
                fill: true,
                tension: .4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#fff',
                pointBorderColor: COLORS.brand,
                pointBorderWidth: 2
            });
        }
        if (metric === 'all' || metric === 'target') {
            datasets.push({
                label: 'Meta',
                data: novosMeta,
                borderColor: COLORS.ok,
                borderDash: [6, 4],
                borderWidth: 2,
                pointRadius: 0,
                tension: .4,
                fill: false
            });
        }
        if (metric === 'all' || metric === 'prev') {
            datasets.push({
                label: 'Ano Anterior',
                data: novosPrev,
                borderColor: COLORS.ink3,
                borderDash: [2, 3],
                borderWidth: 2,
                pointRadius: 3,
                tension: .4,
                fill: false
            });
        }

        CHARTS.evolucao = new Chart(ctx, {
            type: 'line',
            data: { labels: months, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { size: 12 }, usePointStyle: true, padding: 14, boxWidth: 8 }
                    },
                    tooltip: tooltipBase
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: { grid: { color: 'rgba(15,23,42,.05)' }, border: { display: false }, beginAtZero: true }
                }
            }
        });
    }

    function createSparkline(canvas, data, color) {
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 40);
        grad.addColorStop(0, `${color}66`);
        grad.addColorStop(1, `${color}00`);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i),
                datasets: [{
                    data,
                    borderColor: color,
                    backgroundColor: grad,
                    fill: true,
                    tension: .4,
                    borderWidth: 2,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    function renderSparklines() {
        $$('.spark').forEach(el => {
            const color = COLORS[el.dataset.spark] || COLORS.brand;
            const data = Array.from({ length: 14 }, () => Math.random() * 40 + 30);
            createSparkline(el, data, color);
        });
    }

    function renderTopCities() {
        const el = document.getElementById('topCities');
        if (!el) return;

        const max = Math.max(...DATA.cidades.map(c => c.value));
        el.innerHTML = DATA.cidades.map(c => `
      <div class="bar-item">
        <div class="bar-head">
          <strong>${c.name}</strong>
          <span>${c.value}%</span>
        </div>
        <div class="bar-track" aria-hidden="true">
          <div class="bar-fill" style="width:${(c.value / max * 100).toFixed(1)}%;background:${c.color}"></div>
        </div>
      </div>
    `).join('');
    }

    function renderRankTable() {
        const tbody = document.querySelector('#rankTable tbody');
        if (!tbody) return;

        const ranked = [...DATA.rankPatients].sort((a, b) => b.score - a.score);

        tbody.innerHTML = ranked.map((p, i) => {
            const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            const scoreColor = p.score >= 90 ? 'var(--ok)' : p.score >= 80 ? 'var(--brand)' : 'var(--warn)';

            return `
        <tr>
          <td><span class="rank-pos ${posClass}">${i + 1}</span></td>
          <td>
            <div class="doc-cell">
              <div class="av">${p.initials}</div>
              <div>
                <strong>${p.name}</strong>
                <small>${p.conv}</small>
              </div>
            </div>
          </td>
          <td>${p.conv}</td>
          <td class="num">${p.consultas}</td>
          <td>${p.lastVisit}</td>
          <td class="num">R$ ${p.ltv.toLocaleString('pt-BR')}</td>
          <td class="num"><b style="color:${scoreColor}">${p.nps.toFixed(1)}</b></td>
          <td class="num">
            <div class="score-bar">
              <div class="bar"><span style="width:${p.score}%"></span></div>
              <b>${p.score}</b>
            </div>
          </td>
        </tr>
      `;
        }).join('');
    }

    function renderHeatmap() {
        const el = document.getElementById('heatmap');
        if (!el) return;

        const headers = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const sources = ['Google', 'Instagram', 'Indicação', 'Site', 'Convênio', 'Retorno'];
        const palette = ['#eef2ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'];

        let html = `<div></div>${headers.map(h => `<div class="hm-th">${h}</div>`).join('')}`;

        sources.forEach((source, rowIndex) => {
            html += `<div class="hm-rh">${source}</div>`;

            for (let col = 0; col < headers.length; col++) {
                let intensity = Math.random() * 0.8 + 0.2;
                intensity *= rowIndex === 1 ? 1.2 : 1;
                intensity *= rowIndex === 0 ? 0.9 : 1;

                const idx = Math.min(Math.floor(intensity * palette.length), palette.length - 1);
                const value = Math.round(intensity * 60);

                html += `
          <div
            class="hm-cell"
            style="background:${palette[idx]}"
            title="${source} · ${headers[col]}: ${value} pacientes"
            aria-label="${source} em ${headers[col]}: ${value} pacientes"
            role="gridcell"
          ></div>
        `;
            }
        });

        el.innerHTML = html;
    }

    function createTrendMini(canvas, data, color) {
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 30);
        grad.addColorStop(0, `${color}55`);
        grad.addColorStop(1, `${color}00`);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i),
                datasets: [{
                    data,
                    borderColor: color,
                    backgroundColor: grad,
                    fill: true,
                    tension: .4,
                    borderWidth: 1.8,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    function renderBreakdown(search = state.search) {
        const tbody = document.querySelector('#breakdownTable tbody');
        if (!tbody) return;

        const list = DATA.conveniosBreakdown.filter(item =>
            !search || item.name.toLowerCase().includes(search.toLowerCase())
        );

        tbody.innerHTML = list.map(item => `
      <tr>
        <td>
          <div class="spec-cell">
            <span class="dot" style="background:${COLORS.brand}"></span>
            <strong>${item.name}</strong>
          </div>
        </td>
        <td class="num">${item.patients.toLocaleString('pt-BR')}</td>
        <td class="num">${item.new.toLocaleString('pt-BR')}</td>
        <td class="num">${item.ret.toFixed(1)}%</td>
        <td class="num">${item.age}</td>
        <td class="num">R$ ${item.ltv.toLocaleString('pt-BR')}</td>
        <td class="num">
          <span class="delta ${item.delta >= 0 ? 'up' : 'down'}">
            <i data-lucide="${item.delta >= 0 ? 'trending-up' : 'trending-down'}" aria-hidden="true"></i>
            ${item.delta >= 0 ? '+' : ''}${item.delta}%
          </span>
        </td>
        <td><canvas class="trend-cell" data-trend="${item.name}" aria-label="Tendência de ${item.name}" role="img"></canvas></td>
      </tr>
    `).join('');

        lucide.createIcons();

        list.forEach(item => {
            const canvas = tbody.querySelector(`canvas[data-trend="${CSS.escape(item.name)}"]`);
            if (canvas) createTrendMini(canvas, item.trend, COLORS.brand);
        });

        const totals = list.reduce((acc, item) => {
            acc.tot += item.patients;
            acc.new += item.new;
            acc.ret += item.ret * item.patients;
            acc.age += item.age * item.patients;
            acc.ltv += item.ltv * item.patients;
            return acc;
        }, { tot: 0, new: 0, ret: 0, age: 0, ltv: 0 });

        $('#tFTot').textContent = totals.tot.toLocaleString('pt-BR');
        $('#tFNew').textContent = totals.new.toLocaleString('pt-BR');
        $('#tFRet').textContent = totals.tot ? `${(totals.ret / totals.tot).toFixed(1)}%` : '0%';
        $('#tFAge').textContent = totals.tot ? Math.round(totals.age / totals.tot).toString() : '0';
        $('#tFLtv').textContent = totals.tot ? `R$ ${Math.round(totals.ltv / totals.tot).toLocaleString('pt-BR')}` : 'R$ 0';
    }

    function animateCounters() {
        $$('[data-counter]').forEach(el => {
            const target = Number(el.dataset.counter || 0);
            const duration = 1200;
            const start = performance.now();

            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
                if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
        });
    }

    function toast(title, message = '', type = 'info') {
        const icons = { info: 'info', ok: 'check-circle-2', warn: 'alert-triangle' };
        const box = document.getElementById('toastBox');
        if (!box) return;

        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `
      <i data-lucide="${icons[type] || icons.info}" aria-hidden="true"></i>
      <div>
        <strong>${title}</strong>
        ${message ? `<span>${message}</span>` : ''}
      </div>
    `;

        box.appendChild(el);
        lucide.createIcons();

        setTimeout(() => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(40px)';
        }, 3200);

        setTimeout(() => el.remove(), 3700);
    }

    function syncThemeButton() {
        const icon = $('#toggleTheme i');
        if (!icon) return;
        icon.setAttribute('data-lucide', state.theme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    }

    function bindEvents() {
        $('#toggleTheme')?.addEventListener('click', () => {
            state.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = state.theme;
            localStorage.setItem('g4med-theme', state.theme);

            syncThemeButton();
            applyChartDefaults();

            Object.values(CHARTS).forEach(chart => chart?.update());
            toast(`Tema ${state.theme === 'dark' ? 'escuro' : 'claro'} ativado`, '', 'ok');
        });

        $$('.period-tabs button').forEach(btn => {
            btn.addEventListener('click', () => {
                state.period = btn.dataset.period || '30';
                $$('.period-tabs button').forEach(b => {
                    const active = b === btn;
                    b.classList.toggle('active', active);
                    b.setAttribute('aria-pressed', String(active));
                });
                toast('Período atualizado', `${btn.textContent.trim()} aplicado`, 'ok');
            });
        });

        const segNovos = $('.seg[data-target="chartNovosPacientes"]');
        segNovos?.querySelectorAll('button[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.chartNovosMode = btn.dataset.mode || 'bar';
                segNovos.querySelectorAll('button').forEach(b => {
                    const active = b === btn;
                    b.classList.toggle('active', active);
                    b.setAttribute('aria-pressed', String(active));
                });
                createChartNovos(state.chartNovosMode);
            });
        });

        const segEvolucao = $('.seg[data-target="chartEvolucaoPacientes"]');
        segEvolucao?.querySelectorAll('button[data-metric]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.chartEvolucaoMetric = btn.dataset.metric || 'all';
                segEvolucao.querySelectorAll('button').forEach(b => {
                    const active = b === btn;
                    b.classList.toggle('active', active);
                    b.setAttribute('aria-pressed', String(active));
                });
                createEvolucaoChart(state.chartEvolucaoMetric);
            });
        });

        $('#btnRefresh')?.addEventListener('click', () => {
            const icon = $('#btnRefresh i');
            if (icon) {
                icon.style.transition = 'transform .8s';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => { icon.style.transform = ''; }, 800);
            }

            animateCounters();
            renderRankTable();
            renderBreakdown();
            toast('Dados atualizados', 'Última sincronização agora', 'ok');
            $('#lastUpdate').textContent = 'agora';
        });

        $('#btnPrint')?.addEventListener('click', () => window.print());

        $('#btnExport')?.addEventListener('click', () => {
            const headers = ['Convênio', 'Pacientes', 'Novos', 'Retorno', 'Idade média', 'LTV médio', 'Variação'];
            const rows = DATA.conveniosBreakdown.map(item => [
                item.name,
                item.patients,
                item.new,
                item.ret,
                item.age,
                item.ltv,
                item.delta
            ]);
            const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `relatorio-pacientes-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            toast('Relatório exportado', 'Arquivo CSV gerado', 'ok');
        });

        $('#btnExportCat')?.addEventListener('click', () => {
            const headers = ['Convênio', 'Pacientes', 'Novos', 'Retorno', 'Idade média', 'LTV médio', 'Variação'];
            const rows = DATA.conveniosBreakdown.map(item => [
                item.name,
                item.patients,
                item.new,
                item.ret,
                item.age,
                item.ltv,
                item.delta
            ]);
            const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `detalhamento-convenios-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            toast('CSV exportado', 'Detalhamento por convênio gerado', 'ok');
        });

        $('#btnShare')?.addEventListener('click', async () => {
            const payload = {
                title: 'Relatório G4Med',
                text: 'Veja o relatório de pacientes da G4Med.',
                url: location.href
            };

            try {
                if (navigator.share) {
                    await navigator.share(payload);
                } else if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(location.href);
                    toast('Link copiado', 'Compartilhe com sua equipe', 'ok');
                }
            } catch {
                toast('Compartilhamento cancelado', '', 'info');
            }
        });

        $('#btnApply')?.addEventListener('click', () => {
            state.filters.from = $('#dateFrom')?.value || '';
            state.filters.to = $('#dateTo')?.value || '';
            state.filters.unit = $('#fUnit')?.value || '';
            state.filters.insurance = $('#fIns')?.value || '';
            state.filters.ageRange = $('#fAge')?.value || '';
            state.filters.origin = $('#fOrig')?.value || '';

            toast('Filtros aplicados', 'Atualizando dashboards...', 'ok');
            animateCounters();
        });

        $('#btnClear')?.addEventListener('click', () => {
            $$('.filter-bar select').forEach(s => s.selectedIndex = 0);
            if ($('#dateFrom')) $('#dateFrom').value = '';
            if ($('#dateTo')) $('#dateTo').value = '';
            if ($('#tblSearch')) $('#tblSearch').value = '';
            state.search = '';
            state.filters = { from: '', to: '', unit: '', insurance: '', ageRange: '', origin: '' };
            renderBreakdown('');
            toast('Filtros limpos', '', 'info');
        });

        $('#tblSearch')?.addEventListener('input', e => {
            state.search = e.target.value || '';
            renderBreakdown(state.search);
        });
    }

    function initDates() {
        const from = $('#dateFrom');
        const to = $('#dateTo');
        if (!from || !to) return;

        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        to.valueAsDate = end;
        from.valueAsDate = start;
    }

    function init() {
        document.documentElement.dataset.theme = state.theme;
        lucide.createIcons();
        applyChartDefaults();
        syncThemeButton();

        initDates();
        createChartNovos();
        createSexoChart();
        createConveniosChart();
        createFaixaEtariaChart();
        createEvolucaoChart();
        renderSparklines();
        renderTopCities();
        renderHeatmap();
        renderRankTable();
        renderBreakdown();
        animateCounters();
        bindEvents();

        setTimeout(() => {
            toast('Bem-vindo ao BI', 'Dados consolidados em tempo real', 'ok');
        }, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
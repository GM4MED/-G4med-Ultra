/* =========================================================
   G4MED · Relatório de Atendimentos · BI · JS
   Reescrito para o HTML/CSS semânticos e acessíveis
   ========================================================= */

(() => {
    'use strict';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const state = {
        theme: document.documentElement.dataset.theme || 'light',
        period: '30',
        chartDoctorsMode: 'bar',
        chartHistoryMetric: 'all',
        search: '',
        filters: {
            from: '',
            to: '',
            unit: '',
            spec: '',
            doctor: '',
            insurance: ''
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

    const SPECS = [
        { name: 'Cardiologia', color: COLORS.brand, atend: 842, nshow: 5.1, tm: 32, nps: 9.3, rev: 421000, delta: 14.2, trend: [12, 15, 14, 18, 21, 19, 24] },
        { name: 'Ortopedia', color: COLORS.cyan, atend: 678, nshow: 7.4, tm: 28, nps: 8.7, rev: 298000, delta: 8.1, trend: [18, 16, 19, 17, 22, 24, 25] },
        { name: 'Pediatria', color: COLORS.purple, atend: 912, nshow: 4.8, tm: 24, nps: 9.5, rev: 312000, delta: 18.5, trend: [10, 14, 16, 19, 22, 26, 28] },
        { name: 'Ginecologia', color: COLORS.rose, atend: 587, nshow: 6.2, tm: 30, nps: 9.1, rev: 264000, delta: 5.4, trend: [14, 15, 17, 16, 18, 19, 20] },
        { name: 'Dermatologia', color: COLORS.warn, atend: 521, nshow: 8.1, tm: 22, nps: 8.9, rev: 189000, delta: -2.3, trend: [20, 18, 17, 16, 15, 16, 17] },
        { name: 'Neurologia', color: COLORS.info, atend: 412, nshow: 7.7, tm: 38, nps: 9.0, rev: 248000, delta: 11.0, trend: [10, 12, 14, 15, 17, 19, 21] },
        { name: 'Endocrinologia', color: COLORS.ok, atend: 389, nshow: 5.9, tm: 28, nps: 9.2, rev: 187000, delta: 6.7, trend: [14, 15, 16, 17, 18, 19, 20] },
        { name: 'Oftalmologia', color: COLORS.danger, atend: 486, nshow: 6.5, tm: 20, nps: 8.8, rev: 172000, delta: 9.4, trend: [12, 13, 14, 16, 18, 19, 21] }
    ];

    const DOCTORS = [
        { name: 'Dra. Mariana Costa', spec: 'Cardiologia', atend: 312, nps: 9.6, punc: 96, initials: 'MC' },
        { name: 'Dr. Felipe Andrade', spec: 'Ortopedia', atend: 289, nps: 9.2, punc: 92, initials: 'FA' },
        { name: 'Dra. Helena Vieira', spec: 'Pediatria', atend: 276, nps: 9.7, punc: 94, initials: 'HV' },
        { name: 'Dr. Rafael Mendes', spec: 'Cardiologia', atend: 251, nps: 9.0, punc: 88, initials: 'RM' },
        { name: 'Dra. Larissa Souza', spec: 'Ginecologia', atend: 238, nps: 9.4, punc: 91, initials: 'LS' },
        { name: 'Dr. Bruno Almeida', spec: 'Neurologia', atend: 217, nps: 9.1, punc: 87, initials: 'BA' },
        { name: 'Dra. Paula Ribeiro', spec: 'Pediatria', atend: 204, nps: 9.5, punc: 93, initials: 'PR' },
        { name: 'Dr. Gustavo Lima', spec: 'Dermatologia', atend: 189, nps: 8.8, punc: 85, initials: 'GL' },
        { name: 'Dra. Camila Torres', spec: 'Endocrinologia', atend: 178, nps: 9.3, punc: 90, initials: 'CT' },
        { name: 'Dr. André Castro', spec: 'Oftalmologia', atend: 164, nps: 8.9, punc: 89, initials: 'AC' }
    ];

    const STATUSES = [
        { label: 'Realizadas', value: 67, color: COLORS.ok },
        { label: 'Confirmadas', value: 14, color: COLORS.brand },
        { label: 'Aguardando', value: 8, color: COLORS.info },
        { label: 'No-Show', value: 6, color: COLORS.warn },
        { label: 'Canceladas', value: 5, color: COLORS.danger }
    ];

    const WEEK = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const WEEK_DATA = [842, 891, 654, 789, 803, 512, 336];

    const INSURANCES = [
        { name: 'Particular', value: 34, color: COLORS.brand },
        { name: 'Unimed', value: 24, color: COLORS.cyan },
        { name: 'Bradesco Saúde', value: 14, color: COLORS.purple },
        { name: 'SulAmérica', value: 11, color: COLORS.rose },
        { name: 'Amil', value: 9, color: COLORS.warn },
        { name: 'Outros', value: 8, color: COLORS.info }
    ];

    const charts = {};

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
        if (charts[key]) {
            charts[key].destroy();
            charts[key] = null;
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

    function createDoctorsChart(mode = state.chartDoctorsMode) {
        const ctx = getCanvas('chartDoctors');
        if (!ctx) return;

        destroyChart('doctors');

        const top = DOCTORS.slice(0, 10);
        const grad = ctx.createLinearGradient(0, 0, 0, 300);
        grad.addColorStop(0, COLORS.brand);
        grad.addColorStop(1, COLORS.cyan);

        charts.doctors = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top.map(d => d.name.replace(/^Dra?\.\s?/i, '')),
                datasets: [{
                    label: 'Atendimentos',
                    data: top.map(d => d.atend),
                    backgroundColor: grad,
                    borderRadius: 8,
                    maxBarThickness: 32
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: mode === 'bar-h' ? 'y' : 'x',
                plugins: {
                    legend: { display: false },
                    tooltip: tooltipBase
                },
                scales: {
                    x: {
                        grid: { display: mode === 'bar-h' },
                        border: { display: false },
                        ticks: { font: { size: 11 } }
                    },
                    y: {
                        grid: { color: 'rgba(15,23,42,.05)' },
                        border: { display: false },
                        beginAtZero: true,
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    }

    function createStatusChart() {
        const ctx = getCanvas('chartStatus');
        if (!ctx) return;

        destroyChart('status');

        charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: STATUSES.map(s => s.label),
                datasets: [{
                    data: STATUSES.map(s => s.value),
                    backgroundColor: STATUSES.map(s => s.color),
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

        const legend = document.getElementById('legendStatus');
        if (legend) {
            legend.innerHTML = STATUSES.map(s => (
                `<span class="legend-item">
          <span class="sw" style="background:${s.color}"></span>
          ${s.label}
          <b style="margin-left:6px;color:var(--ink);font-weight:700">${s.value}%</b>
        </span>`
            )).join('');
        }
    }

    function createSpecChart() {
        const ctx = getCanvas('chartSpec');
        if (!ctx) return;

        destroyChart('spec');

        charts.spec = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: SPECS.map(s => s.name),
                datasets: [{
                    data: SPECS.map(s => s.atend),
                    backgroundColor: SPECS.map(s => `${s.color}cc`),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: { size: 11 },
                            boxWidth: 10,
                            padding: 10,
                            usePointStyle: true
                        }
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

    function createWeekChart() {
        const ctx = getCanvas('chartWeek');
        if (!ctx) return;

        destroyChart('week');

        const max = Math.max(...WEEK_DATA);
        const colors = WEEK_DATA.map(v => {
            const ratio = v / max;
            if (ratio > .85) return COLORS.brand;
            if (ratio > .6) return COLORS.brand2;
            if (ratio > .4) return COLORS.cyan;
            return '#a5b4fc';
        });

        charts.week = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: WEEK,
                datasets: [{
                    data: WEEK_DATA,
                    backgroundColor: colors,
                    borderRadius: 10,
                    maxBarThickness: 36
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
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 11.5, weight: 600 } }
                    },
                    y: {
                        grid: { color: 'rgba(15,23,42,.05)' },
                        border: { display: false },
                        beginAtZero: true,
                        ticks: { font: { size: 11 } }
                    }
                }
            }
        });
    }

    function renderHeatmap() {
        const el = document.getElementById('heatmap');
        if (!el) return;

        const hours = ['07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h'];
        const palette = ['#eef2ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'];

        let html = `<div></div>${WEEK.map(d => `<div class="hm-th">${d}</div>`).join('')}`;

        hours.forEach(h => {
            html += `<div class="hm-rh">${h}</div>`;

            WEEK.forEach((day, dayIndex) => {
                const hh = Number(h.replace('h', ''));
                let intensity = 0.2;

                if ((hh >= 9 && hh <= 11) || (hh >= 14 && hh <= 17)) intensity = 0.7;
                if (hh === 10 || hh === 15) intensity = 0.95;
                if (dayIndex >= 5) intensity *= 0.4;
                intensity *= (0.85 + Math.random() * 0.3);
                intensity = Math.min(intensity, 1);

                const idx = Math.min(Math.floor(intensity * palette.length), palette.length - 1);
                const value = Math.round(intensity * 60);

                html += `
          <div
            class="hm-cell"
            style="background:${palette[idx]}"
            title="${h} · ${day}: ${value} atendimentos"
            aria-label="${h} em ${day}: ${value} atendimentos"
            role="gridcell"
          ></div>
        `;
            });
        });

        el.innerHTML = html;
    }

    function createHistoryChart(metric = state.chartHistoryMetric) {
        const ctx = getCanvas('chartHistory');
        if (!ctx) return;

        destroyChart('history');

        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const real = [3812, 3920, 4102, 4230, 4118, 4382, 4521, 4678, 4812, 4827, null, null];
        const target = [3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900];
        const prev = [3520, 3601, 3782, 3850, 3902, 3988, 4012, 4180, 4310, 4456, 4520, 4612];

        const grad = ctx.createLinearGradient(0, 0, 0, 380);
        grad.addColorStop(0, 'rgba(79,70,229,.35)');
        grad.addColorStop(1, 'rgba(79,70,229,0)');

        const datasets = [];

        if (metric === 'all' || metric === 'real') {
            datasets.push({
                label: 'Realizado',
                data: real,
                borderColor: COLORS.brand,
                backgroundColor: grad,
                fill: true,
                tension: .4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#fff',
                pointBorderColor: COLORS.brand,
                pointBorderWidth: 2,
                pointHoverRadius: 7
            });
        }

        if (metric === 'all' || metric === 'target') {
            datasets.push({
                label: 'Meta',
                data: target,
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
                data: prev,
                borderColor: COLORS.ink3,
                borderWidth: 2,
                pointRadius: 3,
                tension: .4,
                fill: false,
                borderDash: [2, 3]
            });
        }

        charts.history = new Chart(ctx, {
            type: 'line',
            data: { labels: months, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 },
                            usePointStyle: true,
                            padding: 14,
                            boxWidth: 8
                        }
                    },
                    tooltip: tooltipBase
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 11.5 } }
                    },
                    y: {
                        grid: { color: 'rgba(15,23,42,.05)' },
                        border: { display: false },
                        beginAtZero: false,
                        ticks: {
                            font: { size: 11 },
                            callback: v => Number(v).toLocaleString('pt-BR')
                        }
                    }
                }
            }
        });
    }

    function createSparkline(canvas, data, color) {
        const ctx = canvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 40);
        grad.addColorStop(0, `${color}66`);
        grad.addColorStop(1, `${color}00`);

        return new Chart(ctx, {
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
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
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

    function renderInsurance() {
        const el = document.getElementById('topInsurance');
        if (!el) return;

        const max = Math.max(...INSURANCES.map(i => i.value));
        el.innerHTML = INSURANCES.map(i => `
      <div class="bar-item">
        <div class="bar-head">
          <strong>${i.name}</strong>
          <span>${i.value}%</span>
        </div>
        <div class="bar-track" aria-hidden="true">
          <div class="bar-fill" style="width:${(i.value / max * 100).toFixed(1)}%;background:${i.color}"></div>
        </div>
      </div>
    `).join('');
    }

    function renderRank() {
        const tbody = $('#rankTable tbody');
        if (!tbody) return;

        const max = Math.max(...DOCTORS.map(d => d.atend));
        const ranked = DOCTORS
            .map(d => {
                const score = ((d.atend / max) * 40) + ((d.nps / 10) * 30) + ((d.punc / 100) * 30);
                return { ...d, score: Math.round(score * 10) / 10 };
            })
            .sort((a, b) => b.score - a.score);

        tbody.innerHTML = ranked.map((d, i) => {
            const posClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
            const npsColor = d.nps >= 9.3 ? 'var(--ok)' : d.nps >= 9 ? 'var(--brand)' : 'var(--warn)';

            return `
        <tr>
          <td><span class="rank-pos ${posClass}">${i + 1}</span></td>
          <td>
            <div class="doc-cell">
              <div class="av">${d.initials}</div>
              <div>
                <strong>${d.name}</strong>
                <small>${d.spec}</small>
              </div>
            </div>
          </td>
          <td>${d.spec}</td>
          <td class="num">${d.atend}</td>
          <td class="num"><b style="color:${npsColor}">${d.nps.toFixed(1)}</b></td>
          <td class="num">${d.punc}%</td>
          <td class="num">
            <div class="score-bar">
              <div class="bar"><span style="width:${d.score}%"></span></div>
              <b>${d.score}</b>
            </div>
          </td>
        </tr>
      `;
        }).join('');
    }

    function renderBreakdown(search = state.search) {
        const tbody = $('#breakdownTable tbody');
        if (!tbody) return;

        const list = SPECS.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

        tbody.innerHTML = list.map(s => `
      <tr>
        <td>
          <div class="spec-cell">
            <span class="dot" style="background:${s.color}"></span>
            <strong>${s.name}</strong>
          </div>
        </td>
        <td class="num">${s.atend.toLocaleString('pt-BR')}</td>
        <td class="num">${s.nshow.toFixed(1)}%</td>
        <td class="num">${s.tm} min</td>
        <td class="num"><b style="color:${s.nps >= 9.2 ? 'var(--ok)' : 'var(--ink-2)'}">${s.nps.toFixed(1)}</b></td>
        <td class="num">R$ ${(s.rev / 1000).toFixed(0)}k</td>
        <td class="num">
          ${s.delta >= 0
                ? `<span class="delta up"><i data-lucide="trending-up" aria-hidden="true"></i>+${s.delta}%</span>`
                : `<span class="delta down"><i data-lucide="trending-down" aria-hidden="true"></i>${s.delta}%</span>`
            }
        </td>
        <td><canvas class="trend-cell" data-trend="${s.name}" aria-label="Tendência de ${s.name}" role="img"></canvas></td>
      </tr>
    `).join('');

        lucide.createIcons();

        list.forEach(s => {
            const canvas = tbody.querySelector(`canvas[data-trend="${CSS.escape(s.name)}"]`);
            if (canvas) {
                createTrendMini(canvas, s.trend, s.color);
            }
        });

        const totals = list.reduce((acc, s) => {
            acc.atend += s.atend;
            acc.ns += s.nshow * s.atend;
            acc.tm += s.tm * s.atend;
            acc.nps += s.nps * s.atend;
            acc.rev += s.rev;
            return acc;
        }, { atend: 0, ns: 0, tm: 0, nps: 0, rev: 0 });

        $('#tFAtend').textContent = totals.atend.toLocaleString('pt-BR');
        $('#tFNs').textContent = totals.atend ? `${(totals.ns / totals.atend).toFixed(1)}%` : '0%';
        $('#tFTm').textContent = totals.atend ? `${Math.round(totals.tm / totals.atend)} min` : '0 min';
        $('#tFNps').textContent = totals.atend ? (totals.nps / totals.atend).toFixed(1) : '0';
        $('#tFRev').textContent = `R$ ${(totals.rev / 1000).toFixed(0)}k`;
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
                scales: {
                    x: { display: false },
                    y: { display: false }
                }
            }
        });
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
        const icons = {
            info: 'info',
            ok: 'check-circle-2',
            warn: 'alert-triangle'
        };

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

    function updateThemeButton() {
        const icon = $('#toggleTheme i');
        if (!icon) return;
        icon.setAttribute('data-lucide', state.theme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    }

    function syncPeriodButtons(activeBtn) {
        $$('.period-tabs button').forEach(btn => {
            const isActive = btn === activeBtn;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });
    }

    function syncSegmentButtons(container, predicate) {
        $$('button', container).forEach(btn => {
            const active = predicate(btn);
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
    }

    function bindEvents() {
        const themeBtn = $('#toggleTheme');
        const refreshBtn = $('#btnRefresh');
        const exportBtn = $('#btnExport');
        const printBtn = $('#btnPrint');
        const shareBtn = $('#btnShare');
        const applyBtn = $('#btnApply');
        const clearBtn = $('#btnClear');
        const searchInput = $('#tblSearch');

        themeBtn?.addEventListener('click', () => {
            state.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = state.theme;
            updateThemeButton();
            applyChartDefaults();

            Object.keys(charts).forEach(key => {
                if (charts[key]) charts[key].update();
            });

            toast(`Tema ${state.theme === 'dark' ? 'escuro' : 'claro'} ativado`, '', 'ok');
        });

        $$('.period-tabs button').forEach(btn => {
            btn.addEventListener('click', () => {
                state.period = btn.dataset.period || '30';
                syncPeriodButtons(btn);
                toast('Período atualizado', `${btn.textContent.trim()} aplicado`, 'ok');
            });
        });

        const doctorsSeg = $('.seg[data-target="chartDoctors"]');
        if (doctorsSeg) {
            $$('button[data-mode]', doctorsSeg).forEach(btn => {
                btn.addEventListener('click', () => {
                    state.chartDoctorsMode = btn.dataset.mode || 'bar';
                    syncSegmentButtons(doctorsSeg, candidate => candidate === btn);
                    createDoctorsChart(state.chartDoctorsMode);
                });
            });
        }

        const historySeg = $('.seg[data-target="chartHistory"]');
        if (historySeg) {
            $$('button[data-metric]', historySeg).forEach(btn => {
                btn.addEventListener('click', () => {
                    state.chartHistoryMetric = btn.dataset.metric || 'all';
                    syncSegmentButtons(historySeg, candidate => candidate === btn);
                    createHistoryChart(state.chartHistoryMetric);
                });
            });
        }

        refreshBtn?.addEventListener('click', () => {
            const icon = $('#btnRefresh i');
            if (icon) {
                icon.style.transition = 'transform .8s';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => { icon.style.transform = ''; }, 800);
            }

            animateCounters();
            toast('Dados atualizados', 'Última sincronização agora', 'ok');
            const last = $('#lastUpdate');
            if (last) last.textContent = 'agora';
        });

        exportBtn?.addEventListener('click', () => {
            const headers = ['Especialidade', 'Atendimentos', 'No-Show', 'Tempo médio', 'NPS', 'Receita', 'Variação'];
            const rows = SPECS.map(s => [s.name, s.atend, s.nshow, s.tm, s.nps, s.rev, s.delta]);
            const csv = [headers, ...rows].map(r => r.join(';')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `relatorio-atendimentos-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();

            toast('Relatório exportado', 'Arquivo CSV gerado', 'ok');
        });

        printBtn?.addEventListener('click', () => window.print());

        shareBtn?.addEventListener('click', async () => {
            const payload = {
                title: 'Relatório G4Med',
                text: 'Veja o relatório de atendimentos da G4Med.',
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

        applyBtn?.addEventListener('click', () => {
            state.filters.from = $('#dateFrom')?.value || '';
            state.filters.to = $('#dateTo')?.value || '';
            state.filters.unit = $('#fUnit')?.value || '';
            state.filters.spec = $('#fSpec')?.value || '';
            state.filters.doctor = $('#fDoc')?.value || '';
            state.filters.insurance = $('#fIns')?.value || '';

            toast('Filtros aplicados', 'Atualizando dashboards...', 'ok');
            animateCounters();
        });

        clearBtn?.addEventListener('click', () => {
            $$('.filter-bar select').forEach(select => { select.selectedIndex = 0; });
            const from = $('#dateFrom');
            const to = $('#dateTo');
            const search = $('#tblSearch');

            if (from) from.value = '';
            if (to) to.value = '';
            if (search) search.value = '';

            state.search = '';
            state.filters = { from: '', to: '', unit: '', spec: '', doctor: '', insurance: '' };

            renderBreakdown('');
            toast('Filtros limpos', '', 'info');
        });

        searchInput?.addEventListener('input', e => {
            state.search = e.target.value || '';
            renderBreakdown(state.search);
        });
    }

    function initDates() {
        const to = $('#dateTo');
        const from = $('#dateFrom');
        if (!to || !from) return;

        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        to.valueAsDate = end;
        from.valueAsDate = start;
    }

    function init() {
        lucide.createIcons();
        applyChartDefaults();
        updateThemeButton();

        initDates();
        createDoctorsChart();
        createStatusChart();
        createSpecChart();
        createWeekChart();
        createHistoryChart();
        renderHeatmap();
        renderSparklines();
        renderInsurance();
        renderRank();
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
/* ==========================================================================
   G4MED BI — RELATÓRIO DE PACIENTES
   relatorio-paciente.js
   ========================================================================== */

(() => {
    'use strict';

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    const charts = new Map();

    const state = {
        period: '30',
        novosMode: 'bar',
        evolutionMetric: 'all',
        rankMode: 'geral',
        filters: {
            unit: '',
            insurance: '',
            age: '',
            origin: '',
            from: '',
            to: ''
        },
        data: null
    };

    const COLORS = {
        brand: '#4f46e5',
        brandLight: '#818cf8',
        cyan: '#06b6d4',
        ok: '#10b981',
        warn: '#f59e0b',
        danger: '#ef4444',
        info: '#0284c7',
        purple: '#8b5cf6',
        rose: '#f43f5e',
        gray: '#94a3b8'
    };

    const MONTHS = [
        'Jan',
        'Fev',
        'Mar',
        'Abr',
        'Mai',
        'Jun',
        'Jul',
        'Ago',
        'Set',
        'Out',
        'Nov',
        'Dez'
    ];

    const MONTHS_FULL = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
    ];

    const numberFormatter = new Intl.NumberFormat('pt-BR');

    const currencyFormatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
    });

    const decimalFormatter = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    });


    /* ======================================================================
       UTILITÁRIOS
    ====================================================================== */

    function formatNumber(value) {
        return numberFormatter.format(
            Math.round(Number(value) || 0)
        );
    }

    function formatCurrency(value) {
        return currencyFormatter.format(
            Number(value) || 0
        );
    }

    function formatDecimal(value) {
        return decimalFormatter.format(
            Number(value) || 0
        );
    }

    function formatPercent(value) {
        return `${formatDecimal(value)}%`;
    }

    function escapeHTML(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function getThemeColors() {
        const dark =
            document.documentElement.dataset.theme === 'dark' ||
            document.documentElement.classList.contains('dark');

        return {
            text: dark ? '#cbd5e1' : '#475569',
            muted: dark ? '#94a3b8' : '#64748b',
            grid: dark
                ? 'rgba(148, 163, 184, .16)'
                : 'rgba(15, 23, 42, .07)',
            surface: dark ? '#111832' : '#ffffff'
        };
    }

    function isDarkTheme() {
        return (
            document.documentElement.dataset.theme === 'dark' ||
            document.documentElement.classList.contains('dark')
        );
    }

    function refreshIcons() {
        if (
            window.lucide &&
            typeof window.lucide.createIcons === 'function'
        ) {
            window.lucide.createIcons();
        }
    }

    function getCanvas(id) {
        const canvas = document.getElementById(id);

        if (!canvas || typeof Chart === 'undefined') {
            return null;
        }

        return canvas;
    }

    function destroyChart(key) {
        const chart = charts.get(key);

        if (chart) {
            chart.destroy();
            charts.delete(key);
        }
    }

    function registerChart(key, chart) {
        destroyChart(key);
        charts.set(key, chart);
        return chart;
    }

    function destroyAllCharts() {
        charts.forEach((chart) => chart.destroy());
        charts.clear();
    }

    function chartTooltip() {
        const theme = getThemeColors();

        return {
            backgroundColor: theme.surface,
            titleColor: theme.text,
            bodyColor: theme.text,
            borderColor: theme.grid,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 9,
            displayColors: true,
            usePointStyle: true
        };
    }

    function baseChartOptions(options = {}) {
        const theme = getThemeColors();

        return {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 600,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    labels: {
                        color: theme.text,
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 12,
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        }
                    }
                },
                tooltip: chartTooltip()
            },
            scales: {
                x: {
                    ticks: {
                        color: theme.muted
                    },
                    grid: {
                        color: theme.grid
                    }
                },
                y: {
                    ticks: {
                        color: theme.muted
                    },
                    grid: {
                        color: theme.grid
                    },
                    beginAtZero: true
                }
            },
            ...options
        };
    }


    /* ======================================================================
       DADOS SIMULADOS
    ====================================================================== */

    function createData() {
        return {
            totalPatients: 12847,

            acquisition: [
                342,
                368,
                401,
                389,
                425,
                448,
                462,
                471,
                489,
                512,
                498,
                487
            ],

            target: [
                350,
                370,
                390,
                410,
                430,
                450,
                470,
                490,
                510,
                530,
                550,
                570
            ],

            gender: [
                {
                    label: 'Feminino',
                    value: 7048,
                    color: COLORS.rose
                },
                {
                    label: 'Masculino',
                    value: 5011,
                    color: COLORS.brand
                },
                {
                    label: 'Outro / Não informado',
                    value: 788,
                    color: COLORS.gray
                }
            ],

            insurance: [
                {
                    name: 'Particular',
                    patients: 2840,
                    newPatients: 418,
                    returns: 2422,
                    age: 36,
                    ltv: 3120,
                    variation: 9.4,
                    color: COLORS.brand,
                    trend: 'up'
                },
                {
                    name: 'Unimed',
                    patients: 3210,
                    newPatients: 384,
                    returns: 2826,
                    age: 39,
                    ltv: 2480,
                    variation: 6.2,
                    color: COLORS.cyan,
                    trend: 'up'
                },
                {
                    name: 'Bradesco Saúde',
                    patients: 1980,
                    newPatients: 264,
                    returns: 1716,
                    age: 41,
                    ltv: 2780,
                    variation: 4.8,
                    color: COLORS.purple,
                    trend: 'up'
                },
                {
                    name: 'SulAmérica',
                    patients: 1420,
                    newPatients: 198,
                    returns: 1222,
                    age: 38,
                    ltv: 2540,
                    variation: 11.2,
                    color: COLORS.rose,
                    trend: 'up'
                },
                {
                    name: 'Amil',
                    patients: 1180,
                    newPatients: 146,
                    returns: 1034,
                    age: 40,
                    ltv: 2220,
                    variation: -2.1,
                    color: COLORS.warn,
                    trend: 'down'
                },
                {
                    name: 'NotreDame',
                    patients: 842,
                    newPatients: 104,
                    returns: 738,
                    age: 37,
                    ltv: 2140,
                    variation: 8.3,
                    color: COLORS.ok,
                    trend: 'up'
                },
                {
                    name: 'Hapvida',
                    patients: 684,
                    newPatients: 82,
                    returns: 602,
                    age: 42,
                    ltv: 1840,
                    variation: 5.7,
                    color: COLORS.info,
                    trend: 'up'
                },
                {
                    name: 'Outros',
                    patients: 691,
                    newPatients: 76,
                    returns: 615,
                    age: 39,
                    ltv: 2080,
                    variation: 3.2,
                    color: COLORS.danger,
                    trend: 'up'
                }
            ],

            ageGroups: [
                {
                    label: '0–12',
                    female: 284,
                    male: 312
                },
                {
                    label: '13–17',
                    female: 198,
                    male: 212
                },
                {
                    label: '18–29',
                    female: 1420,
                    male: 1180
                },
                {
                    label: '30–44',
                    female: 2680,
                    male: 2120
                },
                {
                    label: '45–59',
                    female: 1842,
                    male: 1418
                },
                {
                    label: '60+',
                    female: 1064,
                    male: 317
                }
            ],

            cities: [
                {
                    name: 'São Paulo · SP',
                    value: 42
                },
                {
                    name: 'Guarulhos · SP',
                    value: 14
                },
                {
                    name: 'Osasco · SP',
                    value: 11
                },
                {
                    name: 'Santo André · SP',
                    value: 9
                },
                {
                    name: 'Barueri · SP',
                    value: 8
                },
                {
                    name: 'Outros',
                    value: 16
                }
            ],

            origins: [
                'Indicação',
                'Google',
                'Instagram',
                'Convênio',
                'Site',
                'Retorno'
            ],

            evolutionReal: [
                9820,
                10170,
                10530,
                10920,
                11340,
                11780,
                12220,
                12680,
                13140,
                13620,
                14080,
                14540
            ],

            evolutionTarget: [
                9800,
                10200,
                10600,
                11000,
                11400,
                11800,
                12200,
                12600,
                13000,
                13400,
                13800,
                14200
            ],

            evolutionPrevious: [
                9140,
                9480,
                9810,
                10160,
                10520,
                10860,
                11200,
                11540,
                11880,
                12210,
                12540,
                12890
            ],

            patients: [
                {
                    name: 'Maria Silva Santos',
                    insurance: 'Particular',
                    consultations: 42,
                    lastVisit: 'há 3 dias',
                    ltv: 18420,
                    nps: 9.8
                },
                {
                    name: 'João Pedro Almeida',
                    insurance: 'Unimed',
                    consultations: 38,
                    lastVisit: 'há 1 semana',
                    ltv: 16280,
                    nps: 9.6
                },
                {
                    name: 'Ana Beatriz Costa',
                    insurance: 'Bradesco Saúde',
                    consultations: 36,
                    lastVisit: 'há 2 dias',
                    ltv: 15640,
                    nps: 9.7
                },
                {
                    name: 'Carlos Eduardo Lima',
                    insurance: 'Particular',
                    consultations: 34,
                    lastVisit: 'há 5 dias',
                    ltv: 14820,
                    nps: 9.4
                },
                {
                    name: 'Fernanda Ribeiro',
                    insurance: 'SulAmérica',
                    consultations: 32,
                    lastVisit: 'há 12 dias',
                    ltv: 13980,
                    nps: 9.5
                },
                {
                    name: 'Roberto Mendes',
                    insurance: 'Unimed',
                    consultations: 30,
                    lastVisit: 'há 1 dia',
                    ltv: 13420,
                    nps: 9.3
                },
                {
                    name: 'Patrícia Oliveira',
                    insurance: 'Particular',
                    consultations: 29,
                    lastVisit: 'há 8 dias',
                    ltv: 12960,
                    nps: 9.6
                },
                {
                    name: 'Lucas Henrique Souza',
                    insurance: 'Amil',
                    consultations: 27,
                    lastVisit: 'há 4 dias',
                    ltv: 11840,
                    nps: 9.2
                },
                {
                    name: 'Camila Andrade',
                    insurance: 'Particular',
                    consultations: 26,
                    lastVisit: 'há 2 semanas',
                    ltv: 11420,
                    nps: 9.5
                },
                {
                    name: 'Bruno Castro Vieira',
                    insurance: 'NotreDame',
                    consultations: 25,
                    lastVisit: 'há 6 dias',
                    ltv: 10840,
                    nps: 9.1
                },
                {
                    name: 'Juliana Pereira',
                    insurance: 'Unimed',
                    consultations: 24,
                    lastVisit: 'há 9 dias',
                    ltv: 10420,
                    nps: 9.4
                },
                {
                    name: 'Marcelo Torres',
                    insurance: 'Bradesco Saúde',
                    consultations: 23,
                    lastVisit: 'há 3 semanas',
                    ltv: 9980,
                    nps: 9.0
                }
            ]
        };
    }


    /* ======================================================================
       TEMA
    ====================================================================== */

    function applyTheme(theme) {
        const dark = theme === 'dark';

        document.documentElement.dataset.theme = dark
            ? 'dark'
            : 'light';

        document.documentElement.classList.toggle(
            'dark',
            dark
        );

        document.body.classList.toggle('dark', dark);

        localStorage.setItem(
            'g4med-theme',
            dark ? 'dark' : 'light'
        );

        const themeIcon = $('#toggleTheme i');

        if (themeIcon) {
            themeIcon.setAttribute(
                'data-lucide',
                dark ? 'sun' : 'moon'
            );
        }

        refreshIcons();
        renderCharts();
    }

    function initializeTheme() {
        const storedTheme =
            localStorage.getItem('g4med-theme');

        const systemTheme =
            window.matchMedia &&
                window.matchMedia(
                    '(prefers-color-scheme: dark)'
                ).matches
                ? 'dark'
                : 'light';

        applyTheme(storedTheme || systemTheme);

        $('#toggleTheme')?.addEventListener(
            'click',
            () => {
                applyTheme(
                    isDarkTheme() ? 'light' : 'dark'
                );

                showToast(
                    isDarkTheme()
                        ? 'Tema escuro ativado.'
                        : 'Tema claro ativado.',
                    'info'
                );
            }
        );
    }


    /* ======================================================================
       GRÁFICO — NOVOS PACIENTES
    ====================================================================== */

    function renderNewPatientsChart() {
        const canvas = getCanvas(
            'chartNovosPacientes'
        );

        if (!canvas) return;

        const theme = getThemeColors();
        const mode = state.novosMode;
        const context = canvas.getContext('2d');

        const barGradient = context.createLinearGradient(
            0,
            0,
            0,
            300
        );

        barGradient.addColorStop(
            0,
            'rgba(79, 70, 229, .88)'
        );

        barGradient.addColorStop(
            1,
            'rgba(6, 182, 212, .78)'
        );

        const lineGradient = context.createLinearGradient(
            0,
            0,
            0,
            300
        );

        lineGradient.addColorStop(
            0,
            'rgba(79, 70, 229, .30)'
        );

        lineGradient.addColorStop(
            1,
            'rgba(79, 70, 229, 0)'
        );

        const chart = new Chart(canvas, {
            type: mode === 'line' ? 'line' : 'bar',

            data: {
                labels: MONTHS,

                datasets: [
                    {
                        label: 'Novos pacientes',
                        data: state.data.acquisition,
                        type: mode === 'line'
                            ? 'line'
                            : 'bar',
                        backgroundColor: mode === 'line'
                            ? lineGradient
                            : barGradient,
                        borderColor: COLORS.brand,
                        borderWidth: mode === 'line'
                            ? 3
                            : 0,
                        borderRadius: mode === 'bar'
                            ? 7
                            : 0,
                        maxBarThickness: 34,
                        fill: mode === 'line',
                        tension: 0.38,
                        pointRadius: mode === 'line'
                            ? 4
                            : 0,
                        pointHoverRadius: mode === 'line'
                            ? 6
                            : 0,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: COLORS.brand,
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Meta',
                        data: state.data.target,
                        type: 'line',
                        borderColor: COLORS.warn,
                        borderDash: [6, 5],
                        borderWidth: 2,
                        pointRadius: 2,
                        pointBackgroundColor: COLORS.warn,
                        tension: 0.35,
                        fill: false
                    }
                ]
            },

            options: baseChartOptions({
                interaction: {
                    mode: 'index',
                    intersect: false
                },

                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: theme.text,
                            usePointStyle: true,
                            boxWidth: 8
                        }
                    },
                    tooltip: chartTooltip()
                },

                scales: {
                    x: {
                        ticks: {
                            color: theme.muted
                        },
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: theme.muted,
                            callback(value) {
                                return formatNumber(value);
                            }
                        },
                        grid: {
                            color: theme.grid
                        },
                        border: {
                            display: false
                        }
                    }
                }
            })
        });

        registerChart('newPatients', chart);
    }


    /* ======================================================================
       GRÁFICO — SEXO
    ====================================================================== */

    function renderGenderLegend() {
        const legend = $('#legendSexo');

        if (!legend) return;

        const total = state.data.gender.reduce(
            (sum, item) => sum + item.value,
            0
        );

        legend.innerHTML = state.data.gender
            .map((item) => {
                const percentage =
                    (item.value / total) * 100;

                return `
                    <span class="legend-item">
                        <span
                            class="legend-color"
                            style="background:${item.color}">
                        </span>

                        <span class="legend-label">
                            ${escapeHTML(item.label)}
                        </span>

                        <strong>
                            ${formatNumber(item.value)}
                        </strong>

                        <small>
                            ${formatPercent(percentage)}
                        </small>
                    </span>
                `;
            })
            .join('');
    }

    function renderGenderChart() {
        const canvas = getCanvas(
            'chartSexoPacientes'
        );

        if (!canvas) return;

        const total = state.data.gender.reduce(
            (sum, item) => sum + item.value,
            0
        );

        const doughnutNumber =
            $('.dough-num');

        if (doughnutNumber) {
            doughnutNumber.textContent =
                formatNumber(total);
        }

        const chart = new Chart(canvas, {
            type: 'doughnut',

            data: {
                labels: state.data.gender.map(
                    (item) => item.label
                ),

                datasets: [
                    {
                        data: state.data.gender.map(
                            (item) => item.value
                        ),
                        backgroundColor:
                            state.data.gender.map(
                                (item) => item.color
                            ),
                        borderWidth: 0,
                        spacing: 3,
                        hoverOffset: 8
                    }
                ]
            },

            options: baseChartOptions({
                cutout: '72%',

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        ...chartTooltip(),

                        callbacks: {
                            label(context) {
                                const percentage =
                                    (context.raw / total) *
                                    100;

                                return `${context.label}: ${formatNumber(
                                    context.raw
                                )} (${formatPercent(percentage)})`;
                            }
                        }
                    }
                }
            })
        });

        registerChart('gender', chart);
        renderGenderLegend();
    }


    /* ======================================================================
       GRÁFICO — CONVÊNIOS
    ====================================================================== */

    function renderInsuranceChart() {
        const canvas = getCanvas(
            'chartConveniosPacientes'
        );

        if (!canvas) return;

        const chart = new Chart(canvas, {
            type: 'bar',

            data: {
                labels: state.data.insurance.map(
                    (item) => item.name
                ),

                datasets: [
                    {
                        label: 'Pacientes',
                        data: state.data.insurance.map(
                            (item) => item.patients
                        ),
                        backgroundColor:
                            state.data.insurance.map(
                                (item) => item.color
                            ),
                        borderRadius: 6,
                        borderWidth: 0,
                        maxBarThickness: 28
                    }
                ]
            },

            options: baseChartOptions({
                indexAxis: 'y',

                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: chartTooltip()
                },

                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            color: getThemeColors().muted,
                            callback(value) {
                                return formatNumber(value);
                            }
                        },
                        grid: {
                            color: getThemeColors().grid
                        },
                        border: {
                            display: false
                        }
                    },

                    y: {
                        ticks: {
                            color: getThemeColors().muted
                        },
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    }
                }
            })
        });

        registerChart('insurance', chart);
    }


    /* ======================================================================
       GRÁFICO — FAIXA ETÁRIA
    ====================================================================== */

    function renderAgeChart() {
        const canvas = getCanvas(
            'chartFaixaEtaria'
        );

        if (!canvas) return;

        const chart = new Chart(canvas, {
            type: 'bar',

            data: {
                labels: state.data.ageGroups.map(
                    (item) => item.label
                ),

                datasets: [
                    {
                        label: 'Feminino',
                        data: state.data.ageGroups.map(
                            (item) => item.female
                        ),
                        backgroundColor: `${COLORS.rose}cc`,
                        borderRadius: 6,
                        maxBarThickness: 24
                    },
                    {
                        label: 'Masculino',
                        data: state.data.ageGroups.map(
                            (item) => item.male
                        ),
                        backgroundColor: `${COLORS.brand}cc`,
                        borderRadius: 6,
                        maxBarThickness: 24
                    }
                ]
            },

            options: baseChartOptions({
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: chartTooltip()
                },

                scales: {
                    x: {
                        ticks: {
                            color: getThemeColors().muted
                        },
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    },

                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getThemeColors().muted,
                            callback(value) {
                                return formatNumber(value);
                            }
                        },
                        grid: {
                            color: getThemeColors().grid
                        },
                        border: {
                            display: false
                        }
                    }
                }
            })
        });

        registerChart('age', chart);
    }


    /* ======================================================================
       GRÁFICO — EVOLUÇÃO
    ====================================================================== */

    function renderEvolutionChart() {
        const canvas = getCanvas(
            'chartEvolucaoPacientes'
        );

        if (!canvas) return;

        const metric = state.evolutionMetric;
        const datasets = [];

        if (metric === 'all' || metric === 'real') {
            datasets.push({
                label: 'Realizado',
                data: state.data.evolutionReal,
                borderColor: COLORS.brand,
                backgroundColor: 'rgba(79, 70, 229, .14)',
                borderWidth: 3,
                tension: 0.38,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: COLORS.brand,
                pointBorderWidth: 2
            });
        }

        if (metric === 'all' || metric === 'target') {
            datasets.push({
                label: 'Meta',
                data: state.data.evolutionTarget,
                borderColor: COLORS.ok,
                borderDash: [6, 5],
                borderWidth: 2,
                tension: 0.35,
                fill: false,
                pointRadius: 2
            });
        }

        if (metric === 'all' || metric === 'prev') {
            datasets.push({
                label: 'Ano anterior',
                data: state.data.evolutionPrevious,
                borderColor: COLORS.gray,
                borderDash: [2, 4],
                borderWidth: 2,
                tension: 0.35,
                fill: false,
                pointRadius: 2
            });
        }

        const chart = new Chart(canvas, {
            type: 'line',

            data: {
                labels: MONTHS,
                datasets
            },

            options: baseChartOptions({
                interaction: {
                    mode: 'index',
                    intersect: false
                },

                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: chartTooltip()
                },

                scales: {
                    x: {
                        ticks: {
                            color: getThemeColors().muted
                        },
                        grid: {
                            display: false
                        },
                        border: {
                            display: false
                        }
                    },

                    y: {
                        ticks: {
                            color: getThemeColors().muted,
                            callback(value) {
                                return formatNumber(value);
                            }
                        },
                        grid: {
                            color: getThemeColors().grid
                        },
                        border: {
                            display: false
                        }
                    }
                }
            })
        });

        registerChart('evolution', chart);
    }


    /* ======================================================================
       SPARKLINES
    ====================================================================== */

    function renderSparklines() {
        if (typeof Chart === 'undefined') return;

        $$('.spark').forEach((canvas, index) => {
            const key = `spark-${index}`;
            const sparkType = canvas.dataset.spark || 'brand';

            const sparkColors = {
                brand: COLORS.brand,
                ok: COLORS.ok,
                info: COLORS.info,
                warn: COLORS.warn,
                purple: COLORS.purple,
                rose: COLORS.rose
            };

            const color =
                sparkColors[sparkType] || COLORS.brand;

            const values = Array.from(
                { length: 12 },
                (_, position) =>
                    30 +
                    position * 2 +
                    ((position * 13 + index * 7) % 14)
            );

            const context = canvas.getContext('2d');
            const gradient = context.createLinearGradient(
                0,
                0,
                0,
                45
            );

            gradient.addColorStop(0, `${color}55`);
            gradient.addColorStop(1, `${color}00`);

            const chart = new Chart(canvas, {
                type: 'line',

                data: {
                    labels: values.map(() => ''),
                    datasets: [
                        {
                            data: values,
                            borderColor: color,
                            backgroundColor: gradient,
                            borderWidth: 2,
                            tension: 0.4,
                            pointRadius: 0,
                            fill: true
                        }
                    ]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    animation: {
                        duration: 500
                    },

                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false
                        }
                    },

                    scales: {
                        x: {
                            display: false
                        },
                        y: {
                            display: false
                        }
                    }
                }
            });

            registerChart(key, chart);
        });
    }


    /* ======================================================================
       TOP CIDADES
    ====================================================================== */

    function renderCities() {
        const container = $('#topCities');

        if (!container) return;

        const maxValue = Math.max(
            ...state.data.cities.map(
                (city) => city.value
            )
        );

        const total = state.data.cities.reduce(
            (sum, city) => sum + city.value,
            0
        );

        container.innerHTML = state.data.cities
            .map((city) => {
                const width =
                    (city.value / maxValue) * 100;

                const percentage =
                    (city.value / total) * 100;

                return `
                    <div class="city-row">
                        <div class="city-row-head">
                            <span>
                                ${escapeHTML(city.name)}
                            </span>

                            <strong>
                                ${formatPercent(city.value)}
                            </strong>
                        </div>

                        <div
                            class="progress-track"
                            role="progressbar"
                            aria-valuenow="${city.value}"
                            aria-valuemin="0"
                            aria-valuemax="100">

                            <span
                                class="progress-value"
                                style="width:${width.toFixed(1)}%">
                            </span>
                        </div>

                        <small>
                            ${formatPercent(percentage)}
                            da origem dos pacientes
                        </small>
                    </div>
                `;
            })
            .join('');
    }


    /* ======================================================================
       HEATMAP
    ====================================================================== */

    function generateHeatmapData() {
        const baseValues = [
            120,
            86,
            142,
            98,
            64,
            108
        ];

        return state.data.origins.map(
            (origin, originIndex) => ({
                origin,

                values: MONTHS.map(
                    (_, monthIndex) => {
                        const base =
                            baseValues[originIndex] || 80;

                        const seasonal =
                            0.78 +
                            (
                                (
                                    monthIndex * 9 +
                                    originIndex * 13
                                ) % 38
                            ) / 100;

                        const instagramBoost =
                            origin === 'Instagram'
                                ? monthIndex * 6
                                : 0;

                        return Math.round(
                            base * seasonal +
                            instagramBoost
                        );
                    }
                )
            })
        );
    }

    function renderHeatmap() {
        const container = $('#heatmap');

        if (!container) return;

        const rows = generateHeatmapData();

        const values = rows.flatMap(
            (row) => row.values
        );

        const min = Math.min(...values);
        const max = Math.max(...values);

        const normalize = (value) => {
            if (max === min) return 0.5;

            return (value - min) / (max - min);
        };

        const header = `
            <div class="heatmap-row heatmap-header">
                <div class="heatmap-label">
                    Origem
                </div>

                ${MONTHS.map(
            (month) => `<div>${month}</div>`
        ).join('')}
            </div>
        `;

        const body = rows
            .map((row) => {
                const cells = row.values
                    .map((value, index) => {
                        const intensity =
                            0.18 +
                            normalize(value) * 0.82;

                        return `
                            <div
                                class="heatmap-cell"
                                data-value="${value}"
                                title="${escapeHTML(row.origin)} — ${MONTHS_FULL[index]}: ${formatNumber(value)} pacientes"
                                style="--heat-intensity:${intensity.toFixed(2)}">
                                ${formatNumber(value)}
                            </div>
                        `;
                    })
                    .join('');

                return `
                    <div class="heatmap-row">
                        <div class="heatmap-label">
                            ${escapeHTML(row.origin)}
                        </div>

                        ${cells}
                    </div>
                `;
            })
            .join('');

        container.innerHTML = header + body;
    }


    /* ======================================================================
       TABELA DE RANKING
    ====================================================================== */

    function getRankButtons() {
        const rankTable = $('#rankTable');

        if (!rankTable) return [];

        const card = rankTable.closest('.card');

        if (!card) return [];

        return $$('.seg button', card);
    }

    function getRankModeFromText(text) {
        const normalized = text
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        if (normalized.includes('frequencia')) {
            return 'frequencia';
        }

        if (normalized.includes('recencia')) {
            return 'recencia';
        }

        if (normalized.includes('ltv')) {
            return 'ltv';
        }

        return 'geral';
    }

    function sortPatients(patients, mode) {
        const result = [...patients];

        if (mode === 'frequencia') {
            return result.sort(
                (a, b) =>
                    b.consultations -
                    a.consultations
            );
        }

        if (mode === 'recencia') {
            return result.sort((a, b) => {
                const getDays = (text) => {
                    const match = text.match(/(\d+)/);

                    if (!match) return 999;

                    const value = Number(match[1]);

                    if (
                        text.includes('semana') ||
                        text.includes('sem')
                    ) {
                        return value * 7;
                    }

                    return value;
                };

                return (
                    getDays(a.lastVisit) -
                    getDays(b.lastVisit)
                );
            });
        }

        return result.sort(
            (a, b) => b.ltv - a.ltv
        );
    }

    function calculatePatientScore(
        patient,
        maxConsultations,
        maxLtv
    ) {
        const score =
            (patient.consultations / maxConsultations) * 40 +
            (patient.ltv / maxLtv) * 40 +
            (patient.nps / 10) * 20;

        return Math.round(score);
    }

    function renderRankTable() {
        const table = $('#rankTable');
        const tbody = table?.querySelector('tbody');

        if (!tbody) return;

        const patients = sortPatients(
            state.data.patients,
            state.rankMode
        );

        const maxConsultations = Math.max(
            ...state.data.patients.map(
                (patient) => patient.consultations
            )
        );

        const maxLtv = Math.max(
            ...state.data.patients.map(
                (patient) => patient.ltv
            )
        );

        tbody.innerHTML = patients
            .slice(0, 12)
            .map((patient, index) => {
                const score =
                    calculatePatientScore(
                        patient,
                        maxConsultations,
                        maxLtv
                    );

                const scoreClass =
                    score >= 90
                        ? 'score-high'
                        : score >= 75
                            ? 'score-medium'
                            : 'score-low';

                return `
                    <tr>
                        <td>${index + 1}</td>

                        <td>
                            ${escapeHTML(patient.name)}
                        </td>

                        <td>
                            ${escapeHTML(patient.insurance)}
                        </td>

                        <td>
                            ${patient.consultations}
                        </td>

                        <td>
                            ${escapeHTML(patient.lastVisit)}
                        </td>

                        <td>
                            ${formatCurrency(patient.ltv)}
                        </td>

                        <td>
                            ${formatDecimal(patient.nps)}
                        </td>

                        <td>
                            <span
                                class="score-badge ${scoreClass}">
                                ${score}
                            </span>
                        </td>
                    </tr>
                `;
            })
            .join('');
    }

    function initializeRankTabs() {
        getRankButtons().forEach((button) => {
            button.addEventListener('click', () => {
                getRankButtons().forEach((item) => {
                    item.classList.remove('active');
                });

                button.classList.add('active');

                state.rankMode =
                    getRankModeFromText(
                        button.textContent
                    );

                renderRankTable();
            });
        });
    }


    /* ======================================================================
       TABELA DE DETALHAMENTO
    ====================================================================== */

    function renderBreakdownTable(search = '') {
        const table = $('#breakdownTable');
        const tbody = table?.querySelector('tbody');

        if (!tbody) return;

        const term = search
            .trim()
            .toLowerCase();

        const rows = state.data.insurance.filter(
            (item) =>
                item.name
                    .toLowerCase()
                    .includes(term)
        );

        tbody.innerHTML = rows
            .map((item) => {
                const variationClass =
                    item.variation >= 0
                        ? 'positive'
                        : 'negative';

                const trendClass =
                    item.trend === 'up'
                        ? 'trend-up'
                        : 'trend-down';

                const trendSymbol =
                    item.trend === 'up'
                        ? '↗'
                        : '↘';

                return `
                    <tr>
                        <td>
                            ${escapeHTML(item.name)}
                        </td>

                        <td class="num">
                            ${formatNumber(item.patients)}
                        </td>

                        <td class="num">
                            ${formatNumber(item.newPatients)}
                        </td>

                        <td class="num">
                            ${formatNumber(item.returns)}
                        </td>

                        <td class="num">
                            ${item.age} anos
                        </td>

                        <td class="num">
                            ${formatCurrency(item.ltv)}
                        </td>

                        <td class="num ${variationClass}">
                            ${item.variation >= 0 ? '+' : ''}
                            ${formatPercent(item.variation)}
                        </td>

                        <td>
                            <span class="trend ${trendClass}">
                                ${trendSymbol}
                            </span>
                        </td>
                    </tr>
                `;
            })
            .join('');

        updateBreakdownTotals(rows);
    }

    function updateBreakdownTotals(
        rows = state.data.insurance
    ) {
        const totalPatients = rows.reduce(
            (sum, item) =>
                sum + item.patients,
            0
        );

        const totalNew = rows.reduce(
            (sum, item) =>
                sum + item.newPatients,
            0
        );

        const totalReturns = rows.reduce(
            (sum, item) =>
                sum + item.returns,
            0
        );

        const weightedAge = rows.reduce(
            (sum, item) =>
                sum + item.age * item.patients,
            0
        );

        const weightedLtv = rows.reduce(
            (sum, item) =>
                sum + item.ltv * item.patients,
            0
        );

        const averageAge = totalPatients
            ? weightedAge / totalPatients
            : 0;

        const averageLtv = totalPatients
            ? weightedLtv / totalPatients
            : 0;

        const totals = {
            '#tFTot': formatNumber(totalPatients),
            '#tFNew': formatNumber(totalNew),
            '#tFRet': formatNumber(totalReturns),
            '#tFAge': `${formatDecimal(averageAge)} anos`,
            '#tFLtv': formatCurrency(averageLtv)
        };

        Object.entries(totals).forEach(
            ([selector, value]) => {
                const element = $(selector);

                if (element) {
                    element.textContent = value;
                }
            }
        );
    }


    /* ======================================================================
       CONTADORES
    ====================================================================== */

    function animateCounter(
        element,
        target,
        duration = 1100
    ) {
        const finalValue = Number(target) || 0;
        const startTime = performance.now();

        function update(currentTime) {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const easing =
                1 - Math.pow(1 - progress, 3);

            element.textContent = formatNumber(
                finalValue * easing
            );

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function animateCounters() {
        $$('[data-counter]').forEach((element) => {
            animateCounter(
                element,
                element.dataset.counter
            );
        });
    }


    /* ======================================================================
       HEATMAP, LISTAS E GRÁFICOS
    ====================================================================== */

    function renderCharts() {
        if (typeof Chart === 'undefined') {
            showToast(
                'Chart.js não foi carregado.',
                'danger'
            );

            return;
        }

        Chart.defaults.font.family =
            "'Plus Jakarta Sans', sans-serif";

        Chart.defaults.font.size = 12;

        renderNewPatientsChart();
        renderGenderChart();
        renderInsuranceChart();
        renderAgeChart();
        renderEvolutionChart();
        renderSparklines();
    }

    function renderAll() {
        renderCharts();
        renderCities();
        renderHeatmap();
        renderRankTable();
        renderBreakdownTable();
        refreshIcons();
    }


    /* ======================================================================
       FILTROS E PERÍODO
    ====================================================================== */

    function readFilters() {
        state.filters = {
            unit: $('#fUnit')?.value || '',
            insurance: $('#fIns')?.value || '',
            age: $('#fAge')?.value || '',
            origin: $('#fOrig')?.value || '',
            from: $('#dateFrom')?.value || '',
            to: $('#dateTo')?.value || ''
        };
    }

    function setDateInputsState() {
        const isCustom =
            state.period === 'custom';

        const dateFrom = $('#dateFrom');
        const dateTo = $('#dateTo');

        if (dateFrom) {
            dateFrom.disabled = !isCustom;
        }

        if (dateTo) {
            dateTo.disabled = !isCustom;
        }
    }

    function initializePeriodTabs() {
        const tabs = $$('#periodTabs button');

        tabs.forEach((button) => {
            button.addEventListener('click', () => {
                tabs.forEach((tab) => {
                    tab.classList.remove('active');
                    tab.setAttribute(
                        'aria-pressed',
                        'false'
                    );
                });

                button.classList.add('active');
                button.setAttribute(
                    'aria-pressed',
                    'true'
                );

                state.period =
                    button.dataset.period || '30';

                setDateInputsState();

                if (state.period !== 'custom') {
                    simulateRefresh(
                        `Período de ${button.textContent.trim()} aplicado.`
                    );
                }
            });
        });

        const active =
            $('#periodTabs button.active') ||
            $('#periodTabs button[data-period="30"]');

        if (active) {
            state.period =
                active.dataset.period || '30';

            setDateInputsState();
        }
    }

    function simulateRefresh(
        message = 'Dados atualizados com sucesso.'
    ) {
        readFilters();

        document.body.classList.add(
            'is-refreshing'
        );

        window.setTimeout(() => {
            state.data = createData();

            renderAll();
            animateCounters();
            updateLastUpdate();

            document.body.classList.remove(
                'is-refreshing'
            );

            showToast(message, 'success');
        }, 450);
    }

    function applyFilters() {
        readFilters();

        if (
            state.period === 'custom' &&
            (
                (!state.filters.from &&
                    state.filters.to) ||
                (state.filters.from &&
                    !state.filters.to)
            )
        ) {
            showToast(
                'Preencha as duas datas do período personalizado.',
                'warning'
            );

            return;
        }

        simulateRefresh(
            'Filtros aplicados com sucesso.'
        );
    }

    function clearFilters() {
        ['#fUnit', '#fIns', '#fAge', '#fOrig']
            .forEach((selector) => {
                const select = $(selector);

                if (select) {
                    select.selectedIndex = 0;
                }
            });

        ['#dateFrom', '#dateTo']
            .forEach((selector) => {
                const input = $(selector);

                if (input) {
                    input.value = '';
                }
            });

        state.filters = {
            unit: '',
            insurance: '',
            age: '',
            origin: '',
            from: '',
            to: ''
        };

        renderBreakdown('');

        showToast(
            'Filtros limpos.',
            'info'
        );
    }

    function initializeFilters() {
        $('#btnApply')?.addEventListener(
            'click',
            applyFilters
        );

        $('#btnClear')?.addEventListener(
            'click',
            clearFilters
        );

        $('#tblSearch')?.addEventListener(
            'input',
            (event) => {
                renderBreakdown(
                    event.target.value
                );
            }
        );
    }


    /* ======================================================================
       CONTROLES DOS GRÁFICOS
    ====================================================================== */

    function initializeChartControls() {
        $$('.seg[data-target="chartNovosPacientes"] button')
            .forEach((button) => {
                button.addEventListener('click', () => {
                    $$('.seg[data-target="chartNovosPacientes"] button')
                        .forEach((item) => {
                            item.classList.remove('active');
                        });

                    button.classList.add('active');

                    state.novosMode =
                        button.dataset.mode || 'bar';

                    renderNewPatientsChart();
                });
            });

        $$('.seg[data-target="chartEvolucaoPacientes"] button')
            .forEach((button) => {
                button.addEventListener('click', () => {
                    $$('.seg[data-target="chartEvolucaoPacientes"] button')
                        .forEach((item) => {
                            item.classList.remove('active');
                        });

                    button.classList.add('active');

                    state.evolutionMetric =
                        button.dataset.metric || 'all';

                    renderEvolutionChart();
                });
            });
    }


    /* ======================================================================
       AÇÕES GLOBAIS
    ====================================================================== */

    function updateLastUpdate() {
        const element = $('#lastUpdate');

        if (!element) return;

        element.textContent = new Intl.DateTimeFormat(
            'pt-BR',
            {
                dateStyle: 'short',
                timeStyle: 'short'
            }
        ).format(new Date());
    }

    function createCSV() {
        const headers = [
            'Convênio',
            'Pacientes',
            'Novos',
            'Retorno',
            'Idade média',
            'LTV médio',
            'Variação',
            'Tendência'
        ];

        const rows = state.data.insurance.map(
            (item) => [
                item.name,
                item.patients,
                item.newPatients,
                item.returns,
                item.age,
                item.ltv,
                item.variation,
                item.trend
            ]
        );

        return [headers, ...rows]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replaceAll('"', '""')}"`
                    )
                    .join(';')
            )
            .join('\n');
    }

    function exportCSV() {
        const csv = createCSV();

        const blob = new Blob(
            [`\uFEFF${csv}`],
            {
                type: 'text/csv;charset=utf-8;'
            }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download =
            `relatorio-pacientes-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);

        showToast(
            'Relatório exportado em CSV.',
            'success'
        );
    }

    async function shareReport() {
        const data = {
            title: 'G4Med BI — Relatório de Pacientes',
            text: 'Relatório gerencial de inteligência de pacientes.',
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(data);

                showToast(
                    'Relatório compartilhado.',
                    'success'
                );

                return;
            }

            if (navigator.clipboard) {
                await navigator.clipboard.writeText(
                    window.location.href
                );

                showToast(
                    'Link do relatório copiado.',
                    'success'
                );

                return;
            }

            showToast(
                'Compartilhamento não suportado neste navegador.',
                'warning'
            );
        } catch (error) {
            if (error?.name !== 'AbortError') {
                showToast(
                    'Não foi possível compartilhar o relatório.',
                    'danger'
                );
            }
        }
    }

    function initializeActions() {
        $('#btnRefresh')?.addEventListener(
            'click',
            () => {
                simulateRefresh(
                    'Dados atualizados com sucesso.'
                );
            }
        );

        $('#btnPrint')?.addEventListener(
            'click',
            () => {
                showToast(
                    'Preparando impressão do relatório.',
                    'info'
                );

                window.setTimeout(() => {
                    window.print();
                }, 300);
            }
        );

        $('#btnExport')?.addEventListener(
            'click',
            exportCSV
        );

        $('#btnExportCat')?.addEventListener(
            'click',
            exportCSV
        );

        $('#btnShare')?.addEventListener(
            'click',
            shareReport
        );

        // O botão de alertas não possui ID no HTML original.
        const alertButton = $('.has-dot');

        alertButton?.addEventListener(
            'click',
            () => {
                showToast(
                    'Nenhum alerta crítico no momento.',
                    'info'
                );
            }
        );
    }


    /* ======================================================================
       TOAST
    ====================================================================== */

    function showToast(message, type = 'info') {
        const box = $('#toastBox');

        if (!box) return;

        const toast = document.createElement('div');

        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'status');
        toast.textContent = message;

        box.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        window.setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform =
                'translateX(30px)';
        }, 2800);

        window.setTimeout(() => {
            toast.remove();
        }, 3200);
    }


    /* ======================================================================
       REDIMENSIONAMENTO
    ====================================================================== */

    let resizeTimer;

    function initializeResize() {
        window.addEventListener('resize', () => {
            window.clearTimeout(resizeTimer);

            resizeTimer = window.setTimeout(() => {
                charts.forEach((chart) => {
                    if (
                        chart &&
                        typeof chart.resize === 'function'
                    ) {
                        chart.resize();
                    }
                });
            }, 150);
        });
    }


    /* ======================================================================
       INICIALIZAÇÃO
    ====================================================================== */

    function initialize() {
        state.data = createData();

        initializeTheme();
        initializePeriodTabs();
        initializeFilters();
        initializeChartControls();
        initializeRankTabs();
        initializeActions();
        initializeResize();

        renderAll();
        animateCounters();
        updateLastUpdate();

        window.setInterval(
            updateLastUpdate,
            60000
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();
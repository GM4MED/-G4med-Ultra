/* =========================================================
   G4MED · Relatório de Pacientes · BI · JS
   ========================================================= */

(() => {
    'use strict';

    /* =========================================================
       HELPERS
       ========================================================= */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    const root = document.documentElement;

    const charts = {
        novos: null,
        sexo: null,
        convenios: null,
        faixa: null,
        evolucao: null,
        sparks: new Map(),
        trends: new Map()
    };

    const state = {
        period: '30',
        theme: 'light',
        refreshing: false,
        customDates: {
            from: '',
            to: ''
        }
    };

    const CONFIG = {
        themeKey: 'g4med-theme',
        defaultPeriod: '30',
        animationDuration: 1200
    };

    /* =========================================================
       CORES
       ========================================================= */

    const COLORS = {
        brand: '#0D9488',
        brand2: '#0F766E',
        brand3: '#115E59',

        teal50: '#F0FDFA',
        teal100: '#CCFBF1',
        teal200: '#99F6E4',
        teal300: '#5EEAD4',
        teal400: '#2DD4BF',
        teal500: '#14B8A6',
        teal600: '#0D9488',
        teal700: '#0F766E',
        teal800: '#115E59',
        teal900: '#134E4A',
        teal950: '#042F2E',

        ok: '#16A34A',
        okSoft: '#F0FDF4',

        warn: '#D97706',
        warnSoft: '#FFFBEB',

        danger: '#DC2626',
        dangerSoft: '#FEF2F2',

        rose: '#E11D48',
        roseSoft: '#FFF1F2',

        neutral: '#94A3B8',
        slate: '#64748B',
        ink: '#0F172A',
        white: '#FFFFFF'
    };

    /* =========================================================
       DADOS
       ========================================================= */

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

    const NEW_PATIENTS = [
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
    ];

    const TARGET = [
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
    ];

    const SEXO = [
        {
            label: 'Feminino',
            value: 58,
            color: COLORS.teal500
        },
        {
            label: 'Masculino',
            value: 40,
            color: COLORS.brand
        },
        {
            label: 'Outro',
            value: 2,
            color: COLORS.teal800
        }
    ];

    const CONVENIOS = [
        {
            name: 'Particular',
            value: 2840,
            perc: 22.1,
            age: 36,
            ltv: 3120,
            ret: 72,
            delta: 9.4,
            color: COLORS.brand,
            trend: [
                180,
                192,
                204,
                216,
                228,
                238,
                248,
                258,
                268,
                278,
                284,
                290
            ]
        },
        {
            name: 'Unimed',
            value: 3210,
            perc: 25,
            age: 39,
            ltv: 2480,
            ret: 74,
            delta: 6.2,
            color: COLORS.teal500,
            trend: [
                210,
                218,
                228,
                238,
                248,
                256,
                264,
                272,
                280,
                286,
                292,
                298
            ]
        },
        {
            name: 'Bradesco Saúde',
            value: 1980,
            perc: 15.4,
            age: 41,
            ltv: 2780,
            ret: 68,
            delta: 4.8,
            color: COLORS.teal700,
            trend: [
                150,
                158,
                164,
                170,
                176,
                182,
                188,
                194,
                198,
                204,
                208,
                212
            ]
        },
        {
            name: 'SulAmérica',
            value: 1420,
            perc: 11.1,
            age: 38,
            ltv: 2540,
            ret: 66,
            delta: 11.2,
            color: COLORS.teal400,
            trend: [
                100,
                108,
                116,
                124,
                132,
                138,
                144,
                150,
                156,
                162,
                168,
                172
            ]
        },
        {
            name: 'Amil',
            value: 1180,
            perc: 9.2,
            age: 40,
            ltv: 2220,
            ret: 62,
            delta: -2.1,
            color: COLORS.warn,
            trend: [
                110,
                112,
                116,
                118,
                116,
                118,
                114,
                116,
                118,
                116,
                114,
                112
            ]
        },
        {
            name: 'NotreDame',
            value: 842,
            perc: 6.6,
            age: 37,
            ltv: 2140,
            ret: 64,
            delta: 8.3,
            color: COLORS.ok,
            trend: [
                58,
                62,
                66,
                70,
                74,
                76,
                80,
                82,
                84,
                86,
                88,
                90
            ]
        },
        {
            name: 'Hapvida',
            value: 684,
            perc: 5.3,
            age: 42,
            ltv: 1840,
            ret: 58,
            delta: 5.7,
            color: COLORS.teal900,
            trend: [
                50,
                52,
                54,
                56,
                58,
                60,
                62,
                64,
                66,
                68,
                70,
                72
            ]
        },
        {
            name: 'Outros',
            value: 691,
            perc: 5.4,
            age: 39,
            ltv: 2080,
            ret: 60,
            delta: 3.2,
            color: COLORS.neutral,
            trend: [
                54,
                56,
                58,
                60,
                62,
                64,
                66,
                68,
                70,
                72,
                72,
                74
            ]
        }
    ];

    const FAIXAS = [
        {
            label: '0-12',
            fem: 284,
            mas: 312
        },
        {
            label: '13-17',
            fem: 198,
            mas: 212
        },
        {
            label: '18-29',
            fem: 1420,
            mas: 1180
        },
        {
            label: '30-44',
            fem: 2680,
            mas: 2120
        },
        {
            label: '45-59',
            fem: 1842,
            mas: 1418
        },
        {
            label: '60+',
            fem: 1064,
            mas: 317
        }
    ];

    const ORIGENS = [
        'Indicação',
        'Google',
        'Instagram',
        'Convênio',
        'Site',
        'Retorno'
    ];

    const CITIES = [
        {
            name: 'São Paulo · SP',
            value: 42,
            color: COLORS.brand
        },
        {
            name: 'Guarulhos · SP',
            value: 14,
            color: COLORS.teal500
        },
        {
            name: 'Osasco · SP',
            value: 11,
            color: COLORS.teal700
        },
        {
            name: 'Santo André · SP',
            value: 9,
            color: COLORS.teal400
        },
        {
            name: 'Barueri · SP',
            value: 8,
            color: COLORS.warn
        },
        {
            name: 'Outros',
            value: 16,
            color: COLORS.teal900
        }
    ];

    const TOP_PATIENTS = [
        {
            name: 'Maria Silva Santos',
            ins: 'Particular',
            visits: 42,
            last: 'há 3 dias',
            ltv: 18420,
            nps: 9.8
        },
        {
            name: 'João Pedro Almeida',
            ins: 'Unimed',
            visits: 38,
            last: 'há 1 sem',
            ltv: 16280,
            nps: 9.6
        },
        {
            name: 'Ana Beatriz Costa',
            ins: 'Bradesco Saúde',
            visits: 36,
            last: 'há 2 dias',
            ltv: 15640,
            nps: 9.7
        },
        {
            name: 'Carlos Eduardo Lima',
            ins: 'Particular',
            visits: 34,
            last: 'há 5 dias',
            ltv: 14820,
            nps: 9.4
        },
        {
            name: 'Fernanda Ribeiro',
            ins: 'SulAmérica',
            visits: 32,
            last: 'há 12 dias',
            ltv: 13980,
            nps: 9.5
        },
        {
            name: 'Roberto Mendes',
            ins: 'Unimed',
            visits: 30,
            last: 'há 1 dia',
            ltv: 13420,
            nps: 9.3
        },
        {
            name: 'Patrícia Oliveira',
            ins: 'Particular',
            visits: 29,
            last: 'há 8 dias',
            ltv: 12960,
            nps: 9.6
        },
        {
            name: 'Lucas Henrique Souza',
            ins: 'Amil',
            visits: 27,
            last: 'há 4 dias',
            ltv: 11840,
            nps: 9.2
        },
        {
            name: 'Camila Andrade',
            ins: 'Particular',
            visits: 26,
            last: 'há 2 sem',
            ltv: 11420,
            nps: 9.5
        },
        {
            name: 'Bruno Castro Vieira',
            ins: 'NotreDame',
            visits: 25,
            last: 'há 6 dias',
            ltv: 10840,
            nps: 9.1
        },
        {
            name: 'Juliana Pereira',
            ins: 'Unimed',
            visits: 24,
            last: 'há 9 dias',
            ltv: 10420,
            nps: 9.4
        },
        {
            name: 'Marcelo Torres',
            ins: 'Bradesco Saúde',
            visits: 23,
            last: 'há 3 sem',
            ltv: 9980,
            nps: 9
        }
    ];

    /* =========================================================
       FORMATAÇÃO
       ========================================================= */

    function formatNumber(value) {
        return Number(value).toLocaleString('pt-BR');
    }

    function formatCurrency(value, decimals = 0) {
        return Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    function formatCompactCurrency(value) {
        return `R$ ${(Number(value) / 1000).toFixed(1)}k`;
    }

    function getInitials(name) {
        return String(name)
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    }

    function escapeHTML(value) {
        const element = document.createElement('div');
        element.textContent = String(value);
        return element.innerHTML;
    }

    function rgba(hex, alpha = 1) {
        const cleanHex = hex.replace('#', '');

        const normalized = cleanHex.length === 3
            ? cleanHex
                .split('')
                .map(char => char + char)
                .join('')
            : cleanHex;

        const number = parseInt(normalized, 16);

        const red = (number >> 16) & 255;
        const green = (number >> 8) & 255;
        const blue = number & 255;

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    function getCurrentTheme() {
        return root.dataset.theme === 'dark'
            ? 'dark'
            : 'light';
    }

    function isDarkTheme() {
        return getCurrentTheme() === 'dark';
    }

    /* =========================================================
       LUCIDE
       ========================================================= */

    function refreshIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /* =========================================================
       TOAST
       ========================================================= */

    function showToast(
        title,
        message = '',
        type = 'info'
    ) {
        if (typeof window.toast === 'function') {
            window.toast(title, message, type);
            return;
        }

        const toastBox = $('#toastBox');

        if (!toastBox) {
            console.info(title, message);
            return;
        }

        const icons = {
            info: 'info',
            ok: 'check-circle-2',
            warn: 'alert-triangle'
        };

        const toastElement = document.createElement('div');
        toastElement.className = `toast ${type}`;

        const icon = document.createElement('i');
        icon.dataset.lucide = icons[type] || icons.info;
        icon.setAttribute('aria-hidden', 'true');

        const content = document.createElement('div');

        const strong = document.createElement('strong');
        strong.textContent = title;

        content.appendChild(strong);

        if (message) {
            const span = document.createElement('span');
            span.textContent = message;
            content.appendChild(span);
        }

        toastElement.append(icon, content);
        toastBox.appendChild(toastElement);

        refreshIcons();

        window.setTimeout(() => {
            toastElement.style.opacity = '0';
            toastElement.style.transform =
                'translateX(40px)';
        }, 3200);

        window.setTimeout(() => {
            toastElement.remove();
        }, 3700);
    }

    /* =========================================================
       CHART.JS
       ========================================================= */

    function getCanvasContext(id) {
        const canvas = $('#' + id);
        return canvas
            ? canvas.getContext('2d')
            : null;
    }

    function configureCharts() {
        if (!window.Chart) return;

        Chart.defaults.font.family =
            "'Plus Jakarta Sans', sans-serif";

        Chart.defaults.font.size = 12;

        Chart.defaults.color = isDarkTheme()
            ? '#94A3B8'
            : '#64748B';

        Chart.defaults.borderColor = isDarkTheme()
            ? 'rgba(255,255,255,.08)'
            : 'rgba(15,23,42,.06)';
    }

    const tooltipConfig = {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, .96)',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        displayColors: true,
        usePointStyle: true,
        borderColor: 'rgba(255,255,255,.08)',
        borderWidth: 1,
        titleFont: {
            size: 12.5,
            weight: '700'
        },
        bodyFont: {
            size: 12
        }
    };

    function getScaleColors() {
        return {
            text: isDarkTheme()
                ? '#94A3B8'
                : '#64748B',

            grid: isDarkTheme()
                ? 'rgba(255,255,255,.07)'
                : 'rgba(15,23,42,.06)'
        };
    }

    function getStandardScales() {
        const colors = getScaleColors();

        return {
            x: {
                grid: {
                    display: false
                },
                border: {
                    display: false
                },
                ticks: {
                    color: colors.text
                }
            },

            y: {
                grid: {
                    color: colors.grid
                },
                border: {
                    display: false
                },
                ticks: {
                    color: colors.text
                }
            }
        };
    }

    function createGradient(
        context,
        topColor,
        bottomColor,
        height = 300
    ) {
        const gradient = context.createLinearGradient(
            0,
            0,
            0,
            height
        );

        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);

        return gradient;
    }

    /* =========================================================
       GRÁFICO: NOVOS PACIENTES
       ========================================================= */

    function renderNewPatientsChart(mode = 'bar') {
        const context = getCanvasContext(
            'chartNovosPacientes'
        );

        if (!context || !window.Chart) return;

        charts.novos?.destroy();

        const barGradient = createGradient(
            context,
            COLORS.teal500,
            COLORS.brand,
            300
        );

        const lineGradient = createGradient(
            context,
            rgba(COLORS.brand, .34),
            rgba(COLORS.brand, 0),
            300
        );

        const scales = getStandardScales();

        charts.novos = new Chart(context, {
            type: mode === 'line'
                ? 'line'
                : 'bar',

            data: {
                labels: MONTHS,

                datasets: mode === 'line'
                    ? [
                        {
                            label: 'Novos pacientes',
                            data: NEW_PATIENTS,
                            borderColor: COLORS.brand,
                            backgroundColor: lineGradient,
                            fill: true,
                            tension: .4,
                            borderWidth: 3,
                            pointRadius: 4,
                            pointBackgroundColor:
                                COLORS.white,
                            pointBorderColor:
                                COLORS.brand,
                            pointBorderWidth: 2,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Meta',
                            data: TARGET,
                            borderColor: COLORS.ok,
                            borderDash: [6, 4],
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: .4,
                            fill: false
                        }
                    ]
                    : [
                        {
                            label: 'Novos pacientes',
                            data: NEW_PATIENTS,
                            backgroundColor: barGradient,
                            borderColor: COLORS.brand,
                            borderWidth: 1,
                            borderRadius: 8,
                            maxBarThickness: 32
                        },
                        {
                            label: 'Meta',
                            data: TARGET,
                            type: 'line',
                            borderColor: COLORS.ok,
                            borderDash: [6, 4],
                            borderWidth: 2,
                            pointRadius: 0,
                            tension: .4,
                            fill: false
                        }
                    ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 12,
                            font: {
                                size: 11.5
                            }
                        }
                    },

                    tooltip: tooltipConfig
                },

                scales: {
                    x: {
                        ...scales.x,
                        ticks: {
                            color: getScaleColors().text,
                            font: {
                                size: 11.5,
                                weight: '600'
                            }
                        }
                    },

                    y: {
                        ...scales.y,
                        beginAtZero: true,
                        ticks: {
                            color: getScaleColors().text,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    /* =========================================================
       GRÁFICO: SEXO
       ========================================================= */

    function renderSexChart() {
        const context = getCanvasContext(
            'chartSexoPacientes'
        );

        if (!context || !window.Chart) return;

        charts.sexo?.destroy();

        charts.sexo = new Chart(context, {
            type: 'doughnut',

            data: {
                labels: SEXO.map(item => item.label),

                datasets: [
                    {
                        data: SEXO.map(item => item.value),
                        backgroundColor: SEXO.map(item => item.color),
                        borderWidth: 0,
                        spacing: 3,
                        hoverOffset: 8
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',

                plugins: {
                    legend: {
                        display: false
                    },

                    tooltip: {
                        ...tooltipConfig,

                        callbacks: {
                            label: item =>
                                ` ${item.label}: ${item.parsed}%`
                        }
                    }
                }
            }
        });

        renderSexLegend();
    }

    function renderSexLegend() {
        const legend = $('#legendSexo');

        if (!legend) return;

        legend.innerHTML = SEXO.map(item => `
            <span class="legend-item">
                <span
                    class="sw"
                    style="background:${item.color}"
                    aria-hidden="true"
                ></span>

                ${escapeHTML(item.label)}

                <b
                    style="
                        margin-left:6px;
                        color:var(--ink);
                        font-weight:700;
                    "
                >
                    ${item.value}%
                </b>
            </span>
        `).join('');
    }

    /* =========================================================
       GRÁFICO: CONVÊNIOS
       ========================================================= */

    function renderInsuranceChart() {
        const context = getCanvasContext(
            'chartConveniosPacientes'
        );

        if (!context || !window.Chart) return;

        charts.convenios?.destroy();

        charts.convenios = new Chart(context, {
            type: 'polarArea',

            data: {
                labels: CONVENIOS.map(item => item.name),

                datasets: [
                    {
                        data: CONVENIOS.map(item => item.value),

                        backgroundColor: CONVENIOS.map(item =>
                            rgba(item.color, .78)
                        ),

                        borderColor: CONVENIOS.map(item =>
                            rgba(item.color, .95)
                        ),

                        borderWidth: 1
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 10,
                            padding: 8,
                            font: {
                                size: 11
                            }
                        }
                    },

                    tooltip: tooltipConfig
                },

                scales: {
                    r: {
                        ticks: {
                            display: false
                        },

                        grid: {
                            color: isDarkTheme()
                                ? 'rgba(255,255,255,.08)'
                                : 'rgba(15,23,42,.08)'
                        },

                        angleLines: {
                            color: isDarkTheme()
                                ? 'rgba(255,255,255,.06)'
                                : 'rgba(15,23,42,.05)'
                        }
                    }
                }
            }
        });
    }

    /* =========================================================
       GRÁFICO: FAIXA ETÁRIA
       ========================================================= */

    function renderAgeChart() {
        const context = getCanvasContext(
            'chartFaixaEtaria'
        );

        if (!context || !window.Chart) return;

        charts.faixa?.destroy();

        const scales = getStandardScales();

        charts.faixa = new Chart(context, {
            type: 'bar',

            data: {
                labels: FAIXAS.map(item => item.label),

                datasets: [
                    {
                        label: 'Feminino',
                        data: FAIXAS.map(item => -item.fem),
                        backgroundColor: rgba(
                            COLORS.teal400,
                            .78
                        ),
                        borderColor: COLORS.teal400,
                        borderWidth: 1,
                        borderRadius: 6,
                        maxBarThickness: 24
                    },
                    {
                        label: 'Masculino',
                        data: FAIXAS.map(item => item.mas),
                        backgroundColor: rgba(
                            COLORS.brand,
                            .84
                        ),
                        borderColor: COLORS.brand,
                        borderWidth: 1,
                        borderRadius: 6,
                        maxBarThickness: 24
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',

                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 12,
                            font: {
                                size: 11.5
                            }
                        }
                    },

                    tooltip: {
                        ...tooltipConfig,

                        callbacks: {
                            label: item =>
                                ` ${item.dataset.label}: ${Math.abs(
                                    item.parsed.x
                                ).toLocaleString('pt-BR')}`
                        }
                    }
                },

                scales: {
                    x: {
                        ...scales.x,

                        grid: {
                            color: isDarkTheme()
                                ? 'rgba(255,255,255,.07)'
                                : 'rgba(15,23,42,.05)'
                        },

                        ticks: {
                            color: getScaleColors().text,
                            font: {
                                size: 10.5
                            },
                            callback: value =>
                                Math.abs(value)
                                    .toLocaleString('pt-BR')
                        }
                    },

                    y: {
                        ...scales.y,

                        grid: {
                            display: false
                        },

                        ticks: {
                            color: getScaleColors().text,
                            font: {
                                size: 11.5,
                                weight: '600'
                            }
                        }
                    }
                }
            }
        });
    }

    /* =========================================================
       HEATMAP
       ========================================================= */

    function generateHeatmapData() {
        return ORIGENS.map((origin, originIndex) =>
            MONTHS.map((month, monthIndex) => {
                let base = [
                    120,
                    80,
                    140,
                    90,
                    60,
                    100
                ][originIndex];

                base += Math.sin(
                    monthIndex / 3 + originIndex
                ) * 30;

                base += Math.random() * 30;

                if (origin === 'Instagram') {
                    base += monthIndex * 8;
                }

                return Math.max(
                    0,
                    Math.round(base)
                );
            })
        );
    }

    function getHeatmapColor(value, max) {
        const intensity = max > 0
            ? value / max
            : 0;

        if (intensity <= .16) {
            return COLORS.teal100;
        }

        if (intensity <= .32) {
            return COLORS.teal200;
        }

        if (intensity <= .48) {
            return COLORS.teal300;
        }

        if (intensity <= .64) {
            return COLORS.teal400;
        }

        if (intensity <= .82) {
            return COLORS.teal600;
        }

        return COLORS.teal800;
    }

    function renderHeatmap() {
        const heatmap = $('#heatmap');

        if (!heatmap) return;

        const data = generateHeatmapData();
        const max = Math.max(...data.flat());

        const iconMap = {
            'Indicação': 'user-plus',
            Google: 'search',
            Instagram: 'camera',
            Convênio: 'id-card',
            Site: 'globe',
            Retorno: 'repeat'
        };

        let html = `
            <div aria-hidden="true"></div>
        `;

        html += MONTHS.map(month => `
            <div class="hm-th">
                ${month}
            </div>
        `).join('');

        ORIGENS.forEach((origin, originIndex) => {
            const icon = iconMap[origin] || 'circle';

            html += `
                <div
                    class="hm-rh"
                    title="${escapeHTML(origin)}"
                >
                    <i
                        data-lucide="${icon}"
                        aria-hidden="true"
                        style="
                            width:14px;
                            height:14px;
                            margin-right:7px;
                            color:var(--brand);
                        "
                    ></i>

                    ${escapeHTML(origin)}
                </div>
            `;

            data[originIndex].forEach((value, monthIndex) => {
                const background =
                    getHeatmapColor(value, max);

                html += `
                    <div
                        class="hm-cell"
                        style="background:${background}"
                        title="${escapeHTML(origin)} · ${MONTHS[monthIndex]}: ${value} pacientes"
                        aria-label="${escapeHTML(origin)} em ${MONTHS[monthIndex]}: ${value} pacientes"
                    ></div>
                `;
            });
        });

        heatmap.innerHTML = html;
        refreshIcons();
    }

    /* =========================================================
       EVOLUÇÃO DE CADASTROS
       ========================================================= */

    function getEvolutionData() {
        const real = [];
        let accumulated = 9800;

        NEW_PATIENTS.forEach(value => {
            accumulated += value -
                Math.round(value * .04);

            real.push(accumulated);
        });

        const target = real.map(
            (_, index) => 9800 + (index + 1) * 420
        );

        const previous = real.map(
            (value, index) =>
                Math.round(value * .86 - index * 8)
        );

        return {
            real,
            target,
            previous
        };
    }

    function renderEvolutionChart(metric = 'all') {
        const context = getCanvasContext(
            'chartEvolucaoPacientes'
        );

        if (!context || !window.Chart) return;

        charts.evolucao?.destroy();

        const {
            real,
            target,
            previous
        } = getEvolutionData();

        const fill = createGradient(
            context,
            rgba(COLORS.brand, .34),
            rgba(COLORS.brand, 0),
            380
        );

        const datasets = [];

        if (metric === 'all' || metric === 'real') {
            datasets.push({
                label: 'Realizado',
                data: real,
                borderColor: COLORS.brand,
                backgroundColor: fill,
                fill: true,
                tension: .4,
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: COLORS.white,
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
                data: previous,
                borderColor: COLORS.neutral,
                borderWidth: 2,
                pointRadius: 3,
                tension: .4,
                fill: false,
                borderDash: [2, 3]
            });
        }

        const scales = getStandardScales();

        charts.evolucao = new Chart(context, {
            type: 'line',

            data: {
                labels: MONTHS,
                datasets
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },

                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            padding: 14,
                            font: {
                                size: 12
                            }
                        }
                    },

                    tooltip: tooltipConfig
                },

                scales: {
                    x: {
                        ...scales.x,
                        ticks: {
                            color: getScaleColors().text,
                            font: {
                                size: 11.5
                            }
                        }
                    },

                    y: {
                        ...scales.y,
                        beginAtZero: false,
                        ticks: {
                            color: getScaleColors().text,
                            font: {
                                size: 11
                            },
                            callback: value =>
                                Number(value)
                                    .toLocaleString('pt-BR')
                        }
                    }
                }
            }
        });
    }

    /* =========================================================
       SPARKLINES
       ========================================================= */

    function createMiniChart(
        canvas,
        data,
        color,
        height = 40
    ) {
        if (!canvas || !window.Chart) return null;

        const context = canvas.getContext('2d');

        const fill = createGradient(
            context,
            rgba(color, .34),
            rgba(color, 0),
            height
        );

        return new Chart(context, {
            type: 'line',

            data: {
                labels: data.map(
                    (_, index) => index
                ),

                datasets: [
                    {
                        data,
                        borderColor: color,
                        backgroundColor: fill,
                        fill: true,
                        tension: .4,
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

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
    }

    function getSparkColor(type) {
        const colors = {
            brand: COLORS.brand,
            ok: COLORS.ok,
            warn: COLORS.warn,
            info: COLORS.brand,
            purple: COLORS.brand,
            rose: COLORS.brand
        };

        return colors[type] || COLORS.brand;
    }

    function renderSparklines() {
        $$('.spark').forEach((canvas, index) => {
            const chartKey = `spark-${index}`;

            charts.sparks.get(chartKey)?.destroy();

            const base = 35 + index * 2;

            const data = Array.from(
                { length: 14 },
                (_, dataIndex) =>
                    base +
                    Math.sin(dataIndex / 2) * 5 +
                    Math.random() * 12
            );

            const color = getSparkColor(
                canvas.dataset.spark
            );

            const chart = createMiniChart(
                canvas,
                data,
                color,
                40
            );

            charts.sparks.set(chartKey, chart);
        });
    }

    /* =========================================================
       MINI GRÁFICOS DE TENDÊNCIA
       ========================================================= */

    function renderTrendChart(
        canvas,
        data,
        color,
        key
    ) {
        charts.trends.get(key)?.destroy();

        const chart = createMiniChart(
            canvas,
            data,
            color,
            30
        );

        charts.trends.set(key, chart);
    }

    /* =========================================================
       CIDADES
       ========================================================= */

    function renderCities() {
        const container = $('#topCities');

        if (!container) return;

        const max = Math.max(
            ...CITIES.map(city => city.value)
        );

        container.innerHTML = CITIES.map(city => `
            <div class="bar-item">
                <div class="bar-head">
                    <strong>
                        ${escapeHTML(city.name)}
                    </strong>

                    <span>
                        ${city.value}%
                    </span>
                </div>

                <div class="bar-track">
                    <div
                        class="bar-fill"
                        style="
                            width:${(city.value / max * 100).toFixed(1)}%;
                            background:${city.color};
                        "
                    ></div>
                </div>
            </div>
        `).join('');
    }

    /* =========================================================
       RANKING
       ========================================================= */

    function renderRanking() {
        const tbody = $('#rankTable tbody');

        if (!tbody) return;

        const maxVisits = Math.max(
            ...TOP_PATIENTS.map(patient =>
                patient.visits
            )
        );

        const maxLtv = Math.max(
            ...TOP_PATIENTS.map(patient =>
                patient.ltv
            )
        );

        const ranked = TOP_PATIENTS
            .map(patient => {
                const score =
                    (patient.visits / maxVisits) * 40 +
                    (patient.ltv / maxLtv) * 40 +
                    (patient.nps / 10) * 20;

                return {
                    ...patient,
                    score: Math.round(score * 10) / 10
                };
            })
            .sort((a, b) => b.score - a.score);

        tbody.innerHTML = ranked.map((patient, index) => {
            const positionClass =
                index === 0
                    ? 'gold'
                    : index === 1
                        ? 'silver'
                        : index === 2
                            ? 'bronze'
                            : '';

            const npsColor =
                patient.nps >= 9.5
                    ? 'var(--ok)'
                    : patient.nps >= 9
                        ? 'var(--brand)'
                        : 'var(--warn)';

            return `
                <tr>
                    <td>
                        <span class="rank-pos ${positionClass}">
                            ${index + 1}
                        </span>
                    </td>

                    <td>
                        <div class="doc-cell">
                            <div class="av">
                                ${escapeHTML(
                getInitials(patient.name)
            )}
                            </div>

                            <div>
                                <strong>
                                    ${escapeHTML(patient.name)}
                                </strong>

                                <small>
                                    ${escapeHTML(patient.ins)}
                                </small>
                            </div>
                        </div>
                    </td>

                    <td>
                        ${escapeHTML(patient.ins)}
                    </td>

                    <td>
                        <b class="mono-value">
                            ${patient.visits}
                        </b>
                    </td>

                    <td>
                        <span class="muted-value">
                            ${escapeHTML(patient.last)}
                        </span>
                    </td>

                    <td>
                        <b class="currency-value">
                            ${formatCompactCurrency(patient.ltv)}
                        </b>
                    </td>

                    <td>
                        <b
                            class="nps-value"
                            style="color:${npsColor}"
                        >
                            ${patient.nps.toFixed(1)}
                        </b>
                    </td>

                    <td>
                        <div class="score-bar">
                            <div class="bar">
                                <span
                                    style="width:${patient.score}%"
                                ></span>
                            </div>

                            <b>
                                ${patient.score}
                            </b>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /* =========================================================
       TABELA DE CONVÊNIOS
       ========================================================= */

    function renderBreakdown(filter = '') {
        const tbody = $('#breakdownTable tbody');

        if (!tbody) return;

        const normalizedFilter = String(filter)
            .trim()
            .toLocaleLowerCase('pt-BR');

        const filtered = CONVENIOS.filter(item =>
            !normalizedFilter ||
            item.name
                .toLocaleLowerCase('pt-BR')
                .includes(normalizedFilter)
        );

        tbody.innerHTML = filtered.map((item, index) => {
            const returnColor =
                item.ret >= 70
                    ? 'var(--ok)'
                    : item.ret >= 64
                        ? 'var(--ink-2)'
                        : 'var(--warn)';

            const delta = item.delta >= 0
                ? `
                    <span class="delta up">
                        <i
                            data-lucide="trending-up"
                            aria-hidden="true"
                        ></i>
                        +${item.delta}%
                    </span>
                `
                : `
                    <span class="delta down">
                        <i
                            data-lucide="trending-down"
                            aria-hidden="true"
                        ></i>
                        ${item.delta}%
                    </span>
                `;

            return `
                <tr>
                    <td>
                        <div class="spec-cell">
                            <span
                                class="dot"
                                style="background:${item.color}"
                                aria-hidden="true"
                            ></span>

                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>
                        </div>
                    </td>

                    <td class="num">
                        ${formatNumber(item.value)}
                    </td>

                    <td class="num">
                        ${formatNumber(
                Math.round(item.value * .04)
            )}
                    </td>

                    <td class="num">
                        <b style="color:${returnColor}">
                            ${item.ret}%
                        </b>
                    </td>

                    <td class="num">
                        ${item.age} anos
                    </td>

                    <td class="num">
                        ${formatCompactCurrency(item.ltv)}
                    </td>

                    <td class="num">
                        ${delta}
                    </td>

                    <td>
                        <canvas
                            class="trend-cell"
                            id="trend-${index}"
                            aria-label="Tendência de ${escapeHTML(item.name)}"
                        ></canvas>
                    </td>
                </tr>
            `;
        }).join('');

        refreshIcons();

        filtered.forEach((item, index) => {
            const canvas = $(`#trend-${index}`);

            if (!canvas) return;

            renderTrendChart(
                canvas,
                item.trend,
                item.color,
                `trend-${index}`
            );
        });

        renderTotals(filtered);
    }

    function renderTotals(list) {
        const total = list.reduce(
            (sum, item) => sum + item.value,
            0
        );

        const newPatients = list.reduce(
            (sum, item) =>
                sum + Math.round(item.value * .04),
            0
        );

        const weight = list.reduce(
            (sum, item) => sum + item.value,
            0
        );

        const weightedReturn = list.reduce(
            (sum, item) =>
                sum + item.ret * item.value,
            0
        );

        const weightedAge = list.reduce(
            (sum, item) =>
                sum + item.age * item.value,
            0
        );

        const weightedLtv = list.reduce(
            (sum, item) =>
                sum + item.ltv * item.value,
            0
        );

        const totalPatients = $('#tFTot');
        const totalNew = $('#tFNew');
        const totalReturn = $('#tFRet');
        const totalAge = $('#tFAge');
        const totalLtv = $('#tFLtv');

        if (totalPatients) {
            totalPatients.textContent =
                formatNumber(total);
        }

        if (totalNew) {
            totalNew.textContent =
                formatNumber(newPatients);
        }

        if (totalReturn) {
            totalReturn.textContent = weight
                ? `${(weightedReturn / weight).toFixed(1)}%`
                : '0%';
        }

        if (totalAge) {
            totalAge.textContent = weight
                ? `${(weightedAge / weight).toFixed(0)} anos`
                : '0 anos';
        }

        if (totalLtv) {
            totalLtv.textContent = weight
                ? formatCompactCurrency(weightedLtv / weight)
                : 'R$ 0';
        }
    }

    /* =========================================================
       CONTADORES
       ========================================================= */

    function animateCounters() {
        $$('[data-counter]').forEach(element => {
            const target = Number(
                element.dataset.counter
            );

            if (!Number.isFinite(target)) return;

            const start = performance.now();

            function tick(now) {
                const progress = Math.min(
                    (now - start) /
                    CONFIG.animationDuration,
                    1
                );

                const eased =
                    1 - Math.pow(1 - progress, 3);

                element.textContent = Math.round(
                    target * eased
                ).toLocaleString('pt-BR');

                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            }

            requestAnimationFrame(tick);
        });
    }

    /* =========================================================
       PERÍODO
       ========================================================= */

    function getPeriodLabel(period) {
        const labels = {
            '7': '7 dias',
            '30': '30 dias',
            '90': '90 dias',
            '365': '12 meses',
            custom: 'Personalizado'
        };

        return labels[period] || 'Período selecionado';
    }

    function setActivePeriod(
        period,
        notify = false
    ) {
        const buttons = $$('.period-tabs button');

        if (!buttons.length) return;

        state.period = period;

        buttons.forEach(button => {
            const active =
                button.dataset.period === period;

            button.classList.toggle(
                'active',
                active
            );

            button.setAttribute(
                'aria-selected',
                String(active)
            );

            button.setAttribute(
                'tabindex',
                active ? '0' : '-1'
            );
        });

        if (notify) {
            showToast(
                'Período atualizado',
                `${getPeriodLabel(period)} aplicado`,
                'ok'
            );
        }
    }

    async function applyPeriod(period) {
        setActivePeriod(period);

        if (period === 'custom') {
            showToast(
                'Período personalizado',
                'Selecione as datas inicial e final',
                'info'
            );

            $('#dateFrom')?.focus();
            return;
        }

        await refreshDashboard({
            showToast: true
        });
    }

    function validateCustomPeriod() {
        const from = $('#dateFrom')?.value || '';
        const to = $('#dateTo')?.value || '';

        state.customDates.from = from;
        state.customDates.to = to;

        if (!from || !to) {
            showToast(
                'Período incompleto',
                'Informe a data inicial e a data final',
                'warn'
            );

            return false;
        }

        if (from > to) {
            showToast(
                'Período inválido',
                'A data inicial deve ser anterior à final',
                'warn'
            );

            return false;
        }

        return true;
    }

    /* =========================================================
       TEMA
       ========================================================= */

    function readTheme() {
        try {
            const saved = localStorage.getItem(
                CONFIG.themeKey
            );

            if (saved === 'dark' || saved === 'light') {
                return saved;
            }
        } catch (error) {
            console.warn(
                'Não foi possível ler o tema salvo.',
                error
            );
        }

        return window.matchMedia?.(
            '(prefers-color-scheme: dark)'
        ).matches
            ? 'dark'
            : 'light';
    }

    function saveTheme(theme) {
        try {
            localStorage.setItem(
                CONFIG.themeKey,
                theme
            );
        } catch (error) {
            console.warn(
                'Não foi possível salvar o tema.',
                error
            );
        }
    }

    function updateThemeButton() {
        const button = $('#toggleTheme');

        if (!button) return;

        const icon = $('i', button);
        const dark = state.theme === 'dark';

        button.title = dark
            ? 'Ativar modo claro'
            : 'Ativar modo escuro';

        button.setAttribute(
            'aria-label',
            dark
                ? 'Ativar modo claro'
                : 'Ativar modo escuro'
        );

        button.setAttribute(
            'aria-pressed',
            String(dark)
        );

        if (icon) {
            icon.dataset.lucide = dark
                ? 'sun'
                : 'moon';
        }

        refreshIcons();
    }

    function applyTheme(
        theme,
        persist = true,
        redraw = true
    ) {
        state.theme = theme === 'dark'
            ? 'dark'
            : 'light';

        root.dataset.theme = state.theme;

        if (persist) {
            saveTheme(state.theme);
        }

        updateThemeButton();

        if (redraw && window.Chart) {
            redrawCharts();
        }
    }

    function toggleTheme() {
        const nextTheme =
            state.theme === 'dark'
                ? 'light'
                : 'dark';

        applyTheme(nextTheme);

        showToast(
            `Modo ${nextTheme === 'dark' ? 'escuro' : 'claro'} ativado`,
            '',
            'info'
        );
    }

    /* =========================================================
       ATUALIZAÇÃO DO DASHBOARD
       ========================================================= */

    async function refreshDashboard({
        showToast: notify = false
    } = {}) {
        if (state.refreshing) return;

        if (
            state.period === 'custom' &&
            !validateCustomPeriod()
        ) {
            return;
        }

        state.refreshing = true;

        const refreshButton = $('#btnRefresh');
        const refreshIcon = $('i', refreshButton);

        if (refreshButton) {
            refreshButton.disabled = true;
            refreshButton.classList.add('is-loading');
            refreshButton.setAttribute(
                'aria-busy',
                'true'
            );
        }

        refreshIcon?.classList.add('is-spinning');

        try {
            /*
             * Substitua este bloco por uma chamada real à API,
             * caso o relatório esteja conectado ao backend.
             *
             * Exemplo:
             *
             * const response = await fetch(
             *     `/api/pacientes?periodo=${state.period}`
             * );
             *
             * const data = await response.json();
             * renderWithApiData(data);
             */

            await new Promise(resolve => {
                window.setTimeout(resolve, 350);
            });

            redrawCharts();
            renderCities();
            renderRanking();
            renderBreakdown(
                $('#tblSearch')?.value || ''
            );
            animateCounters();

            const lastUpdate = $('#lastUpdate');

            if (lastUpdate) {
                lastUpdate.textContent = 'agora';
            }

            if (notify) {
                showToast(
                    'Dados atualizados',
                    `${getPeriodLabel(state.period)} aplicado`,
                    'ok'
                );
            }
        } catch (error) {
            console.error(
                'Erro ao atualizar o dashboard:',
                error
            );

            showToast(
                'Erro na atualização',
                'Não foi possível atualizar os dados',
                'warn'
            );
        } finally {
            state.refreshing = false;

            if (refreshButton) {
                refreshButton.disabled = false;
                refreshButton.classList.remove(
                    'is-loading'
                );
                refreshButton.setAttribute(
                    'aria-busy',
                    'false'
                );
            }

            refreshIcon?.classList.remove(
                'is-spinning'
            );
        }
    }

    function redrawCharts() {
        configureCharts();

        const mode =
            $('.seg button[data-mode].active')
                ?.dataset.mode || 'bar';

        const metric =
            $('.seg button[data-metric].active')
                ?.dataset.metric || 'all';

        renderNewPatientsChart(mode);
        renderSexChart();
        renderInsuranceChart();
        renderAgeChart();
        renderEvolutionChart(metric);
        renderHeatmap();
        renderSparklines();
    }

    /* =========================================================
       IMPRESSÃO
       ========================================================= */

    function printReport() {
        document.body.classList.add(
            'is-printing'
        );

        window.setTimeout(() => {
            window.print();
        }, 50);
    }

    window.addEventListener(
        'afterprint',
        () => {
            document.body.classList.remove(
                'is-printing'
            );
        }
    );

    /* =========================================================
       EXPORTAÇÃO CSV
       ========================================================= */

    function csvEscape(value) {
        return `"${String(value)
            .replaceAll('"', '""')}"`;
    }

    function exportCSV() {
        const table = $('#breakdownTable');

        if (!table) {
            showToast(
                'Exportação indisponível',
                'A tabela de dados não foi encontrada',
                'warn'
            );

            return;
        }

        const rows = $$('tr', table).map(row =>
            $$('th, td', row)
                .map(cell =>
                    csvEscape(cell.textContent.trim())
                )
                .join(';')
        );

        const csv = `\ufeff${rows.join('\n')}`;

        const blob = new Blob(
            [csv],
            {
                type: 'text/csv;charset=utf-8'
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
            'Relatório exportado',
            'Arquivo CSV gerado com sucesso',
            'ok'
        );
    }

    /* =========================================================
       COMPARTILHAMENTO
       ========================================================= */

    async function shareReport() {
        const data = {
            title: 'Relatório de Pacientes · G4Med',
            text: `Relatório de pacientes — ${getPeriodLabel(
                state.period
            )}`,
            url: window.location.href
        };

        if (
            navigator.share &&
            (!navigator.canShare ||
                navigator.canShare(data))
        ) {
            try {
                await navigator.share(data);

                showToast(
                    'Relatório compartilhado',
                    '',
                    'ok'
                );
            } catch (error) {
                if (error.name !== 'AbortError') {
                    showToast(
                        'Falha ao compartilhar',
                        'Tente novamente',
                        'warn'
                    );
                }
            }

            return;
        }

        try {
            await navigator.clipboard.writeText(
                window.location.href
            );

            showToast(
                'Link copiado',
                'O endereço foi copiado para a área de transferência',
                'ok'
            );
        } catch (error) {
            showToast(
                'Compartilhamento indisponível',
                'Copie o endereço diretamente do navegador',
                'warn'
            );
        }
    }

    /* =========================================================
       FILTROS
       ========================================================= */

    function applyFilters() {
        if (
            state.period === 'custom' &&
            !validateCustomPeriod()
        ) {
            return;
        }

        refreshDashboard({
            showToast: true
        });
    }

    function clearFilters() {
        $$('.filter-bar select').forEach(select => {
            select.selectedIndex = 0;
        });

        const dateFrom = $('#dateFrom');
        const dateTo = $('#dateTo');

        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';

        state.customDates.from = '';
        state.customDates.to = '';

        setActivePeriod(
            CONFIG.defaultPeriod
        );

        refreshDashboard({
            showToast: false
        });

        showToast(
            'Filtros limpos',
            'Os filtros voltaram ao estado padrão',
            'info'
        );
    }

    /* =========================================================
       EVENT DELEGATION
       ========================================================= */

    async function handleDocumentClick(event) {
        const periodButton = event.target.closest(
            '.period-tabs button[data-period]'
        );

        if (periodButton) {
            await applyPeriod(
                periodButton.dataset.period
            );

            return;
        }

        const metricButton = event.target.closest(
            '.seg button[data-metric]'
        );

        if (metricButton) {
            const group = metricButton.parentElement;

            $$('button', group).forEach(button => {
                button.classList.remove('active');
            });

            metricButton.classList.add('active');

            renderEvolutionChart(
                metricButton.dataset.metric
            );

            return;
        }

        const modeButton = event.target.closest(
            '.seg button[data-mode]'
        );

        if (modeButton) {
            const group = modeButton.parentElement;

            $$('button', group).forEach(button => {
                button.classList.remove('active');
            });

            modeButton.classList.add('active');

            renderNewPatientsChart(
                modeButton.dataset.mode
            );

            return;
        }

        const themeButton = event.target.closest(
            '#toggleTheme'
        );

        if (themeButton) {
            toggleTheme();
            return;
        }

        const refreshButton = event.target.closest(
            '#btnRefresh'
        );

        if (refreshButton) {
            await refreshDashboard({
                showToast: true
            });

            return;
        }

        const printButton = event.target.closest(
            '#btnPrint'
        );

        if (printButton) {
            printReport();
            return;
        }

        const exportButton = event.target.closest(
            '#btnExport, #btnExportCat'
        );

        if (exportButton) {
            exportCSV();
            return;
        }

        const shareButton = event.target.closest(
            '#btnShare'
        );

        if (shareButton) {
            await shareReport();
            return;
        }

        const applyButton = event.target.closest(
            '#btnApply'
        );

        if (applyButton) {
            applyFilters();
            return;
        }

        const clearButton = event.target.closest(
            '#btnClear'
        );

        if (clearButton) {
            clearFilters();
        }
    }

    function handleDocumentInput(event) {
        if (event.target.matches('#tblSearch')) {
            renderBreakdown(
                event.target.value
            );
        }
    }

    function handleDocumentChange(event) {
        if (
            event.target.matches('#dateFrom') ||
            event.target.matches('#dateTo')
        ) {
            if (
                $('#dateFrom')?.value &&
                $('#dateTo')?.value
            ) {
                setActivePeriod('custom');
            }
        }
    }

    function handlePeriodKeyboard(event) {
        const currentButton = event.target.closest(
            '.period-tabs button[data-period]'
        );

        if (!currentButton) return;

        const buttons = $$(
            '.period-tabs button[data-period]'
        );

        if (!buttons.length) return;

        const currentIndex =
            buttons.indexOf(currentButton);

        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight') {
            nextIndex =
                (currentIndex + 1) % buttons.length;
        }

        if (event.key === 'ArrowLeft') {
            nextIndex =
                (currentIndex - 1 + buttons.length) %
                buttons.length;
        }

        if (event.key === 'Home') {
            nextIndex = 0;
        }

        if (event.key === 'End') {
            nextIndex = buttons.length - 1;
        }

        if (nextIndex === currentIndex) return;

        event.preventDefault();

        const nextButton = buttons[nextIndex];

        nextButton.focus();
        nextButton.click();
    }

    /* =========================================================
       DATAS INICIAIS
       ========================================================= */

    function setDefaultDates() {
        const dateFrom = $('#dateFrom');
        const dateTo = $('#dateTo');

        if (!dateFrom || !dateTo) return;

        const today = new Date();
        const previousMonth = new Date();

        previousMonth.setDate(
            previousMonth.getDate() - 30
        );

        dateFrom.valueAsDate = previousMonth;
        dateTo.valueAsDate = today;
    }

    /* =========================================================
       STORAGE ENTRE ABAS
       ========================================================= */

    function handleStorage(event) {
        if (
            event.key === CONFIG.themeKey &&
            (event.newValue === 'dark' ||
                event.newValue === 'light')
        ) {
            applyTheme(
                event.newValue,
                false,
                true
            );
        }
    }

    /* =========================================================
       EXPORTS GLOBAIS
       ========================================================= */

    /*
     * Permite que outros arquivos do sistema chamem
     * essas funções sem duplicar a implementação.
     */
    window.G4MedPatientsReport = {
        state,
        colors: COLORS,

        refresh: refreshDashboard,
        redrawCharts,
        exportCSV,
        printReport,
        shareReport,
        toggleTheme,
        applyTheme,
        setActivePeriod,
        renderBreakdown,
        renderRanking
    };

    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    function init() {
        if (!window.Chart) {
            console.error(
                'Chart.js não foi carregado.'
            );
        }

        state.theme = readTheme();

        applyTheme(
            state.theme,
            false,
            false
        );

        setDefaultDates();

        setActivePeriod(
            CONFIG.defaultPeriod
        );

        redrawCharts();
        renderCities();
        renderRanking();
        renderBreakdown();
        animateCounters();

        document.addEventListener(
            'click',
            handleDocumentClick
        );

        document.addEventListener(
            'input',
            handleDocumentInput
        );

        document.addEventListener(
            'change',
            handleDocumentChange
        );

        document.addEventListener(
            'keydown',
            handlePeriodKeyboard
        );

        window.addEventListener(
            'storage',
            handleStorage
        );

        window.setTimeout(() => {
            showToast(
                'Bem-vindo ao BI de Pacientes',
                'Base sincronizada em tempo real',
                'ok'
            );
        }, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }
})();


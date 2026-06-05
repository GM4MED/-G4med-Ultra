// LINHA
const lineCtx = document.getElementById('lineChart');

new Chart(lineCtx, {
    type: 'line',

    data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],

        datasets: [{
            label: 'Consultas',
            data: [65, 74, 82, 76, 80, 36, 18],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.12)',
            fill: true,
            tension: 0.4,
            pointRadius: 5
        }]
    },

    options: {
        responsive: true,

        plugins: {
            legend: {
                display: false
            }
        }
    }
});


// DONUT
const donutCtx = document.getElementById('donutChart');

new Chart(donutCtx, {
    type: 'doughnut',

    data: {
        labels: [
            'Clínica Geral',
            'Retorno',
            'Preventivo',
            'Outros'
        ],

        datasets: [{
            data: [68, 20, 7, 5],

            backgroundColor: [
                '#2563eb',
                '#16a34a',
                '#f59e0b',
                '#9333ea'
            ]
        }]
    },

    options: {
        responsive: true,

        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});
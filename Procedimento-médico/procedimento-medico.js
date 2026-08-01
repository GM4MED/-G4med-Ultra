// 1. Cronômetro de Cirurgia
let seconds = 2535; // Começa em 42min e 15s
const timerElement = document.getElementById('surgery-timer');

function updateTimer() {
    seconds++;
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timerElement.innerText = `${hrs}:${mins}:${secs}`;
}
setInterval(updateTimer, 1000);

// 2. Simulação de Sinais Vitais
function updateVitals() {
    // FC oscila entre 78 e 85
    const fc = Math.floor(Math.random() * (85 - 78 + 1)) + 78;
    document.getElementById('val-fc').innerText = fc;

    // SpO2 oscila entre 98 e 100
    const spo2 = Math.floor(Math.random() * (100 - 98 + 1)) + 98;
    document.getElementById('val-spo2').innerText = spo2;

    // Temp oscila levemente
    const temp = (36.4 + (Math.random() * 0.2)).toFixed(1);
    document.getElementById('val-temp').innerText = temp;

    // Animação visual das barrinhas de gráfico
    document.querySelectorAll('.chart-bar').forEach(bar => {
        const randomHeight = Math.floor(Math.random() * (90 - 40 + 1)) + 40;
        bar.style.height = randomHeight + '%';
    });
}
setInterval(updateVitals, 3000);

// 3. Adicionar Log de Eventos dinamicamente
function addLogEvent() {
    const msg = prompt("Descreva o evento:");
    if (msg) {
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
        const logContainer = document.getElementById('event-log');

        const newLog = document.createElement('div');
        newLog.className = "flex gap-3 border-l-2 border-slate-300 pl-3 animate-pulse";
        newLog.innerHTML = `
            <div class="text-[10px] font-mono text-slate-400">${timeStr}</div>
            <div class="text-xs"><b class="block">Evento Manual</b> ${msg}</div>
        `;
        logContainer.prepend(newLog);
    }
}

// 4. Botão de Emergência
const btnEmergency = document.getElementById('btn-emergency');
btnEmergency.addEventListener('click', () => {
    const confirmed = confirm("ATENÇÃO: Acionar CÓDIGO AZUL para esta sala?");
    if (confirmed) {
        btnEmergency.classList.toggle('emergency-active');
        btnEmergency.innerText = "EMERGÊNCIA ATIVA";
        document.body.classList.add('bg-red-50');
    }
});
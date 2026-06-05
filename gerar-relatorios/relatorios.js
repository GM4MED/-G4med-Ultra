document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa todos os ícones (incluindo o novo ícone do calendário)
    lucide.createIcons();

    // 2. Lógica do Dropdown Customizado (Filtro de Médicos)
    const container = document.querySelector('.custom-select-container');
    const trigger = document.querySelector('.select-trigger');
    const options = document.querySelectorAll('.select-options li');
    const triggerText = trigger.querySelector('span');

    // Abre/Fecha o menu ao clicar no trigger
    trigger.addEventListener('click', () => {
        container.classList.toggle('open');
    });

    // Seleciona a opção, altera o texto e fecha o menu
    options.forEach(option => {
        option.addEventListener('click', () => {
            const selectedValue = option.getAttribute('data-value');
            const selectedText = option.textContent;

            triggerText.textContent = selectedText;
            triggerText.setAttribute('data-selected', selectedValue); // Armazena o valor para uso futuro

            container.classList.remove('open');
        });
    });

    // Fecha o menu se clicar fora deley
    document.addEventListener('click', (e) => {
        if (container && !container.contains(e.target)) {
            container.classList.remove('open');
        }
    });

    // 3. Lógica do Botão de Filtrar Dados
    const btnFiltrar = document.querySelector('.btn-gradient');
    const datePicker = document.getElementById('datePicker');

    btnFiltrar.addEventListener('click', () => {
        const data = datePicker.value;
        const medico = triggerText.getAttribute('data-selected') || 'todos';

        if (!data) {
            alert("Por favor, selecione uma data para filtrar.");
            return;
        }

        console.log("--- Executando Filtro ---");
        console.log(`Data selecionada: ${data}`);
        console.log(`Médico selecionado: ${medico}`);

        // Aqui você pode chamar sua função de busca, ex: filtrarTabela(data, medico);
    });
});
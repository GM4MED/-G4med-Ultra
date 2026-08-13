// ==================== CATÁLOGO DE EXAMES - JAVASCRIPT ====================
// Versão: 2.0 - Otimizada e Fortalecida

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initializeCatalog();
});

/**
 * Inicializa todo o catálogo
 */
function initializeCatalog() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    const searchInput = document.getElementById('searchInput');
    const examItems = document.querySelectorAll('.exam-item');

    if (!accordionItems.length) {
        console.warn('[G4Med] Nenhum item de accordion encontrado.');
        return;
    }

    // Inicializa funcionalidades
    initializeAccordion(accordionItems);
    initializeSearch(searchInput, accordionItems);
    initializeScrollAnimation(accordionItems);
    initializeExamClick(examItems);
    initializeLazyLoading();

    console.log('[G4Med] Catálogo de exames inicializado com sucesso.');
}

/**
 * Inicializa o accordion (efeito sanfona)
 */
function initializeAccordion(accordionItems) {
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');

        if (!header) return;

        header.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isActive = item.classList.contains('active');

            // Fecha todos os itens
            closeAllAccordions(accordionItems);

            // Abre o item clicado se não estava ativo
            if (!isActive) {
                openAccordion(item);
                saveAccordionState(item);
            } else {
                clearAccordionState();
            }
        });

        // Acessibilidade: Enter e Space
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });

        // Atributos de acessibilidade
        header.setAttribute('role', 'button');
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'false');
    });

    // Restaura estado salvo
    restoreAccordionState(accordionItems);
}

/**
 * Fecha todos os accordions
 */
function closeAllAccordions(accordionItems) {
    accordionItems.forEach(item => {
        item.classList.remove('active');
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * Abre um accordion específico
 */
function openAccordion(item) {
    item.classList.add('active');
    const header = item.querySelector('.accordion-header');
    if (header) {
        header.setAttribute('aria-expanded', 'true');
    }

    // Scroll suave até o accordion
    setTimeout(() => {
        item.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 300);
}

/**
 * Inicializa a busca de exames
 */
function initializeSearch(searchInput, accordionItems) {
    if (!searchInput) {
        console.warn('[G4Med] Input de busca não encontrado.');
        return;
    }

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        // Debounce para performance
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(e.target.value, accordionItems);
        }, 250);
    });

    // Limpa busca ao pressionar ESC
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            performSearch('', accordionItems);
            searchInput.blur();
        }
    });
}

/**
 * Executa a busca de exames
 */
function performSearch(searchTerm, accordionItems) {
    const term = searchTerm.toLowerCase().trim();
    let totalResults = 0;

    accordionItems.forEach(item => {
        const examItems = item.querySelectorAll('.exam-item');
        let hasVisibleExams = false;
        let categoryMatch = false;

        // Verifica se o título da categoria corresponde
        const categoryTitle = item.querySelector('.accordion-text h3');
        if (categoryTitle && categoryTitle.textContent.toLowerCase().includes(term)) {
            categoryMatch = true;
        }

        examItems.forEach(exam => {
            const examText = exam.querySelector('span').textContent.toLowerCase();
            const examCategory = exam.querySelector('span').getAttribute('data-category') || '';

            // Busca por nome do exame ou categoria
            if (examText.includes(term) || examCategory.includes(term) || categoryMatch) {
                exam.style.display = 'flex';
                exam.style.opacity = '1';
                exam.style.transform = 'translateX(0)';
                hasVisibleExams = true;
                totalResults++;
            } else {
                exam.style.display = 'none';
                exam.style.opacity = '0';
                exam.style.transform = 'translateX(-10px)';
            }
        });

        // Mostra/esconde categoria baseado na busca
        if (term === '') {
            item.style.display = 'block';
            item.classList.remove('active');
            item.style.opacity = '1';
        } else if (hasVisibleExams) {
            item.style.display = 'block';
            item.classList.add('active');
            item.style.opacity = '1';
        } else {
            item.style.display = 'none';
            item.style.opacity = '0';
        }
    });

    // Atualiza placeholder com resultados
    updateSearchPlaceholder(totalResults, term);
}

/**
 * Atualiza o placeholder do search com contagem
 */
function updateSearchPlaceholder(count, term) {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    if (term === '') {
        searchInput.placeholder = 'Buscar exame...';
    } else {
        searchInput.placeholder = `${count} resultado(s) encontrado(s)...`;
    }
}

/**
 * Inicializa animação ao rolar a página
 */
function initializeScrollAnimation(accordionItems) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '20px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Delay em cascata para efeito mais suave
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animated');
                }, index * 50);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    accordionItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(item);
    });
}

/**
 * Inicializa clique nos itens de exame
 */
function initializeExamClick(examItems) {
    examItems.forEach(item => {
        item.addEventListener('click', () => {
            const examName = item.querySelector('span').textContent;

            // Feedback visual
            item.style.transform = 'scale(0.98)';
            setTimeout(() => {
                item.style.transform = 'translateX(10px)';
            }, 150);

            // Log para analytics (opcional)
            console.log(`[G4Med] Exame selecionado: ${examName}`);

            // Aqui você pode redirecionar para página de detalhes
            // window.location.href = `exame-detalhes.html?name=${encodeURIComponent(examName)}`;
        });

        // Hover effect mais suave
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(10px) scale(1.02)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0) scale(1)';
        });
    });
}

/**
 * Salva estado do accordion no localStorage
 */
function saveAccordionState(activeItem) {
    try {
        const categoryTitle = activeItem.querySelector('.accordion-text h3');
        if (categoryTitle) {
            localStorage.setItem('g4med_active_accordion', categoryTitle.textContent);
        }
    } catch (error) {
        console.warn('[G4Med] Erro ao salvar estado:', error);
    }
}

/**
 * Restaura estado do accordion do localStorage
 */
function restoreAccordionState(accordionItems) {
    try {
        const savedCategory = localStorage.getItem('g4med_active_accordion');
        if (!savedCategory) return;

        accordionItems.forEach(item => {
            const categoryTitle = item.querySelector('.accordion-text h3');
            if (categoryTitle && categoryTitle.textContent === savedCategory) {
                openAccordion(item);
            }
        });
    } catch (error) {
        console.warn('[G4Med] Erro ao restaurar estado:', error);
    }
}

/**
 * Limpa estado do accordion
 */
function clearAccordionState() {
    try {
        localStorage.removeItem('g4med_active_accordion');
    } catch (error) {
        console.warn('[G4Med] Erro ao limpar estado:', error);
    }
}

/**
 * Inicializa lazy loading para ícones e imagens
 */
function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

/**
 * Função de debounce para performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Função de throttle para performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Exporta funções para uso global (opcional)
 */
window.G4MedCatalog = {
    performSearch,
    openAccordion,
    closeAllAccordions,
    saveAccordionState,
    clearAccordionState
};
// Adiciona um evento de clique no botão de voltar para interceptar a ação padrão,
// prevenir o comportamento nativo do link e retornar para a página anterior no histórico do navegador.
document.querySelector('a[href="javascript:history.back()"]').addEventListener('click', function (e) {
    e.preventDefault();
    window.history.back();
});
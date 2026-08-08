'use strict';

/* ==========================================================
   CONSTANTES E CONFIGURAÇÕES
========================================================== */
const CONFIG = {
    MOBILE_BREAKPOINT: 991,
    SESSION_KEY: 'g4med_session_seconds',
    STORAGE_KEY: 'g4med_sidebar_state',
    DEBOUNCE_DELAY: 250,
    ANIMATION_DURATION: 300
};

/* ==========================================================
   ESTADO GLOBAL
========================================================== */
const AppState = {
    sessionSeconds: 0,
    isMobile: false,
    sidebarOpen: false,
    clockInterval: null,
    sessionInterval: null
};

/* ==========================================================
   INICIALIZAÇÃO
========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeAll();
    } catch (error) {
        console.error('[G4Med] Erro na inicialização:', error);
    }
});

function initializeAll() {
    initializeIcons();
    initializeSidebar();
    initializeClockAndSession();
    initializeMobileMenu();
    initializeResponsiveHandler();

    console.log('[G4Med] Sistema inicializado com sucesso.');
}

/* ==========================================================
   1. ÍCONES LUCIDE
========================================================== */
function initializeIcons() {
    if (!window.lucide) {
        console.warn('[G4Med] Lucide icons não encontrado.');
        return;
    }

    try {
        lucide.createIcons();
        console.log('[G4Med] Ícones Lucide inicializados.');
    } catch (error) {
        console.error('[G4Med] Erro ao criar ícones:', error);
    }
}

/* ==========================================================
   2. MENU SIDEBAR (ACCORDION)
========================================================== */
function initializeSidebar() {
    const menuGroups = document.querySelectorAll('.menu-group');
    const toggles = document.querySelectorAll('.submenu-toggle');

    if (!menuGroups.length || !toggles.length) {
        console.warn('[G4Med] Elementos do menu não encontrados.');
        return;
    }

    // Restaura estado salvo
    restoreSidebarState();

    toggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmenuToggle(toggle, menuGroups);
        });
    });

    // Fecha submenu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-group')) {
            closeAllSubmenus(menuGroups);
        }
    });

    console.log('[G4Med] Menu sidebar inicializado.');
}

function handleSubmenuToggle(toggle, menuGroups) {
    const currentGroup = toggle.closest('.menu-group');
    if (!currentGroup) return;

    const isActive = currentGroup.classList.contains('active');
    const submenu = currentGroup.querySelector('.submenu');

    // Fecha todos
    closeAllSubmenus(menuGroups);

    // Se não estava ativo, abre o atual
    if (!isActive && submenu) {
        currentGroup.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        saveSidebarState(currentGroup);

        // Animação de entrada
        animateSubmenu(submenu, true);
    } else {
        saveSidebarState(null);
    }
}

function closeAllSubmenus(menuGroups) {
    menuGroups.forEach(group => {
        const submenu = group.querySelector('.submenu');
        const button = group.querySelector('.submenu-toggle');

        if (group.classList.contains('active')) {
            group.classList.remove('active');

            if (button) {
                button.setAttribute('aria-expanded', 'false');
            }

            if (submenu) {
                animateSubmenu(submenu, false);
            }
        }
    });
}

function animateSubmenu(submenu, isOpen) {
    if (!submenu) return;

    if (isOpen) {
        submenu.style.maxHeight = '0';
        submenu.style.opacity = '0';
        submenu.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            submenu.style.transition = `max-height ${CONFIG.ANIMATION_DURATION}ms ease, opacity ${CONFIG.ANIMATION_DURATION}ms ease`;
            submenu.style.maxHeight = `${submenu.scrollHeight}px`;
            submenu.style.opacity = '1';

            setTimeout(() => {
                submenu.style.maxHeight = '';
                submenu.style.overflow = '';
            }, CONFIG.ANIMATION_DURATION);
        });
    } else {
        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
        submenu.style.opacity = '1';
        submenu.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            submenu.style.transition = `max-height ${CONFIG.ANIMATION_DURATION}ms ease, opacity ${CONFIG.ANIMATION_DURATION}ms ease`;
            submenu.style.maxHeight = '0';
            submenu.style.opacity = '0';
        });
    }
}

function saveSidebarState(activeGroup) {
    try {
        if (activeGroup) {
            const submenuLink = activeGroup.querySelector('.submenu a');
            if (submenuLink) {
                localStorage.setItem(CONFIG.STORAGE_KEY, submenuLink.href);
            }
        } else {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
        }
    } catch (error) {
        console.warn('[G4Med] Erro ao salvar estado:', error);
    }
}

function restoreSidebarState() {
    try {
        const savedHref = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (!savedHref) return;

        const activeLink = document.querySelector(`.submenu a[href="${savedHref}"]`);
        if (activeLink) {
            const menuGroup = activeLink.closest('.menu-group');
            if (menuGroup) {
                const toggle = menuGroup.querySelector('.submenu-toggle');
                menuGroup.classList.add('active');

                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'true');
                }
            }
        }
    } catch (error) {
        console.warn('[G4Med] Erro ao restaurar estado:', error);
    }
}

/* ==========================================================
   3. RELÓGIO E TEMPO DE SESSÃO
========================================================== */
function initializeClockAndSession() {
    const clockEl = document.getElementById('relogio-dinamico');
    const sessionEl = document.getElementById('tempoLogado');

    if (!clockEl && !sessionEl) {
        console.warn('[G4Med] Elementos do relógio não encontrados.');
        return;
    }

    // Inicializa segundos da sessão
    AppState.sessionSeconds = parseInt(
        sessionStorage.getItem(CONFIG.SESSION_KEY), 10
    ) || 0;

    // Formatter de data/hora
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    // Atualiza imediatamente
    updateClock(clockEl, formatter);
    updateSession(sessionEl);

    // Limpa intervalos anteriores
    if (AppState.clockInterval) clearInterval(AppState.clockInterval);
    if (AppState.sessionInterval) clearInterval(AppState.sessionInterval);

    // Inicia intervalos
    AppState.clockInterval = setInterval(() => {
        updateClock(clockEl, formatter);
    }, 1000);

    AppState.sessionInterval = setInterval(() => {
        updateSession(sessionEl);
    }, 1000);

    // Salva sessão ao fechar/abrir
    window.addEventListener('beforeunload', saveSession);
    window.addEventListener('unload', saveSession);

    console.log('[G4Med] Relógio e sessão inicializados.');
}

function updateClock(clockEl, formatter) {
    if (!clockEl) return;

    try {
        clockEl.textContent = formatter.format(new Date());
    } catch (error) {
        console.error('[G4Med] Erro ao formatar data:', error);
    }
}

function updateSession(sessionEl) {
    if (!sessionEl) return;

    try {
        const hours = Math.floor(AppState.sessionSeconds / 3600)
            .toString()
            .padStart(2, '0');

        const minutes = Math.floor((AppState.sessionSeconds % 3600) / 60)
            .toString()
            .padStart(2, '0');

        const seconds = (AppState.sessionSeconds % 60)
            .toString()
            .padStart(2, '0');

        sessionEl.textContent = `${hours}h ${minutes}m ${seconds}s`;

        AppState.sessionSeconds++;

        sessionStorage.setItem(CONFIG.SESSION_KEY, AppState.sessionSeconds);
    } catch (error) {
        console.error('[G4Med] Erro ao atualizar sessão:', error);
    }
}

function saveSession() {
    try {
        sessionStorage.setItem(CONFIG.SESSION_KEY, AppState.sessionSeconds);
    } catch (error) {
        console.warn('[G4Med] Erro ao salvar sessão:', error);
    }
}

/* ==========================================================
   4. MENU MOBILE
========================================================== */
function initializeMobileMenu() {
    const menuButton = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (!menuButton || !sidebar) {
        console.warn('[G4Med] Elementos do menu mobile não encontrados.');
        return;
    }

    // Verifica se é mobile
    checkMobile();

    // Event listeners
    menuButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar(sidebar, menuButton);
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (AppState.isMobile && AppState.sidebarOpen &&
            !sidebar.contains(e.target) &&
            !menuButton.contains(e.target)) {
            closeSidebar(sidebar, menuButton);
        }
    });

    // Fecha ao clicar em link do submenu
    const submenuLinks = sidebar.querySelectorAll('.submenu a');
    submenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (AppState.isMobile && AppState.sidebarOpen) {
                closeSidebar(sidebar, menuButton);
            }
        });
    });

    console.log('[G4Med] Menu mobile inicializado.');
}

function initializeResponsiveHandler() {
    let resizeTimeout;

    window.addEventListener('resize', () => {
        // Debounce para performance
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            checkMobile();

            const menuButton = document.querySelector('.menu-toggle');
            const sidebar = document.querySelector('.sidebar');

            // Fecha sidebar se saiu do mobile
            if (!AppState.isMobile && AppState.sidebarOpen && sidebar && menuButton) {
                closeSidebar(sidebar, menuButton);
            }
        }, CONFIG.DEBOUNCE_DELAY);
    });
}

function checkMobile() {
    AppState.isMobile = window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
}

function toggleSidebar(sidebar, menuButton) {
    if (!sidebar || !menuButton) return;

    const isOpen = sidebar.classList.contains('active');

    if (isOpen) {
        closeSidebar(sidebar, menuButton);
    } else {
        openSidebar(sidebar, menuButton);
    }
}

function openSidebar(sidebar, menuButton) {
    if (!sidebar || !menuButton) return;

    sidebar.classList.add('active');
    menuButton.setAttribute('aria-label', 'Fechar menu');
    menuButton.setAttribute('aria-expanded', 'true');
    AppState.sidebarOpen = true;

    // Previne scroll do body
    document.body.style.overflow = 'hidden';

    // Foca no primeiro link para acessibilidade
    const firstLink = sidebar.querySelector('a');
    if (firstLink) {
        firstLink.focus();
    }
}

function closeSidebar(sidebar, menuButton) {
    if (!sidebar || !menuButton) return;

    sidebar.classList.remove('active');
    menuButton.setAttribute('aria-label', 'Abrir menu');
    menuButton.setAttribute('aria-expanded', 'false');
    AppState.sidebarOpen = false;

    // Restaura scroll do body
    document.body.style.overflow = '';
}

/* ==========================================================
   5. FUNÇÕES UTILITÁRIAS
========================================================== */

// Debounce para performance
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

// Detecta se está em dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detecta se está em tablet
function isTablet() {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
}

/* ==========================================================
   6. LIMPEZA E OTIMIZAÇÃO
========================================================== */
window.addEventListener('beforeunload', () => {
    // Limpa intervalos
    if (AppState.clockInterval) clearInterval(AppState.clockInterval);
    if (AppState.sessionInterval) clearInterval(AppState.sessionInterval);

    // Salva sessão
    saveSession();
});

// Service Worker para offline (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.warn('[G4Med] Service Worker não registrado.');
        });
    });
}

// Detecta conexão offline/online
window.addEventListener('offline', () => {
    console.warn('[G4Med] Sistema offline.');
    // Pode mostrar notificação ao usuário
});

window.addEventListener('online', () => {
    console.log('[G4Med] Sistema online.');
    // Pode sincronizar dados
});

/* ==========================================================
   EXPORTAÇÕES (para uso global se necessário)
========================================================== */
window.G4Med = {
    AppState,
    CONFIG,
    closeSidebar,
    openSidebar,
    toggleSidebar,
    saveSession,
    isMobileDevice,
    isTablet
};

/**
 * ==========================================================
 * script.js - Sistema Médico G4med
 * ==========================================================
 */

const MOBILE_BREAKPOINT = 991;

// document.addEventListener("DOMContentLoaded", () => {
//     initializeIcons();
//     initializeSidebar();
//     initializeClockAndSession();
//     initializeMobileMenu();
// });

document.addEventListener("DOMContentLoaded", () => {
    initializeIcons();
    initializeSidebar();
    initializeClockAndSession();
});

/* ==========================================================
   1. ÍCONES LUCIDE
========================================================== */
function initializeIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

/* ==========================================================
   2. MENU SIDEBAR (ACCORDION)
========================================================== */
function initializeSidebar() {
    const menuGroups = document.querySelectorAll(".menu-group");
    const toggles = document.querySelectorAll(".submenu-toggle");

    toggles.forEach(toggle => {
        toggle.addEventListener("click", () => {
            const currentGroup = toggle.closest(".menu-group");
            if (!currentGroup) return;

            const isActive = currentGroup.classList.contains("active");

            menuGroups.forEach(group => {
                group.classList.remove("active");

                const button = group.querySelector(".submenu-toggle");
                if (button) {
                    button.setAttribute("aria-expanded", "false");
                }
            });

            if (!isActive) {
                currentGroup.classList.add("active");
                toggle.setAttribute("aria-expanded", "true");
            }
        });
    });
}

/* ==========================================================
   3. RELÓGIO E TEMPO DE SESSÃO
========================================================== */
function initializeClockAndSession() {
    const clockEl = document.getElementById("relogio-dinamico");
    const sessionEl = document.getElementById("tempoLogado");

    let totalSeconds =
        parseInt(sessionStorage.getItem("g4med_session_seconds"), 10) || 0;

    const formatter = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    function updateClock() {
        if (!clockEl) return;

        clockEl.textContent = formatter.format(new Date());
    }

    function updateSession() {
        if (!sessionEl) return;

        const hours = Math.floor(totalSeconds / 3600)
            .toString()
            .padStart(2, "0");

        const minutes = Math.floor((totalSeconds % 3600) / 60)
            .toString()
            .padStart(2, "0");

        const seconds = (totalSeconds % 60)
            .toString()
            .padStart(2, "0");

        sessionEl.textContent =
            `${hours}h ${minutes}m ${seconds}s`;

        totalSeconds++;

        sessionStorage.setItem(
            "g4med_session_seconds",
            totalSeconds
        );
    }

    updateClock();
    updateSession();

    setInterval(() => {
        updateClock();
        updateSession();
    }, 1000);
}

/* ==========================================================
   4. MENU MOBILE
========================================================== */
function initializeMobileMenu() {
    const menuButton = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    if (!menuButton || !sidebar) return;

    function closeSidebar() {
        sidebar.classList.remove("active");
        menuButton.setAttribute("aria-label", "Abrir menu");
        menuButton.setAttribute("aria-expanded", "false");
    }

    function openSidebar() {
        sidebar.classList.add("active");
        menuButton.setAttribute("aria-label", "Fechar menu");
        menuButton.setAttribute("aria-expanded", "true");
    }

    function toggleSidebar() {
        const isOpen = sidebar.classList.contains("active");

        if (isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    menuButton.addEventListener("click", event => {
        event.stopPropagation();
        toggleSidebar();
    });

    document.addEventListener("click", event => {
        const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        const isOpen = sidebar.classList.contains("active");

        if (
            isMobile &&
            isOpen &&
            !sidebar.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            closeSidebar();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
            closeSidebar();
        }
    });
}
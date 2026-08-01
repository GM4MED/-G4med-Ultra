/**
 * ==========================================================
 * app.js - Sistema de Suporte G4med
 * ==========================================================
 */

(() => {
  'use strict';

  /* ==========================================================
     UTILITÁRIOS
     ========================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ==========================================================
     ESTADO
     ========================================================== */
  const state = {
    sectionAtiva: 'ajuda',
    tema: localStorage.getItem('g4med-theme') || 'light'
  };

  /* ==========================================================
     INICIALIZAÇÃO
     ========================================================== */
  function init() {
    aplicarTema(state.tema);
    bindEvents();

    // Verifica se há hash na URL ao carregar (ex: #suporte)
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`section-${hash}`)) {
      navegarPara(hash);
    } else {
      renderBreadcrumb('ajuda');
    }
  }

  /* ==========================================================
     EVENT LISTENERS
     ========================================================== */
  function bindEvents() {
    // Navegação do menu lateral
    $$('.sidebar__link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sec = link.dataset.section;
        navegarPara(sec);
        fecharMenuMobile();
      });
    });

    // Botões "Voltar" nas seções internas
    $$('.btn-back').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const sec = btn.dataset.section;
        navegarPara(sec);
      });
    });

    // Toggle menu mobile
    $('#menu-toggle').addEventListener('click', toggleMenuMobile);

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
      const sidebar = $('#sidebar');
      const toggle = $('#menu-toggle');
      if (sidebar.classList.contains('sidebar--open') &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
        fecharMenuMobile();
      }
    });

    // Pesquisa na Central de Ajuda
    const searchInput = $('#search-ajuda');
    const searchClear = $('#search-clear');

    searchInput.addEventListener('input', (e) => {
      filtrarCards(e.target.value);
      searchClear.classList.toggle('search__clear--visible', e.target.value.length > 0);
    });

    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      filtrarCards('');
      searchClear.classList.remove('search__clear--visible');
      searchInput.focus();
    });

    // Modais
    $$('.card__btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.modal));
    });

    $$('.modal__close').forEach(btn => {
      btn.addEventListener('click', () => {
        closeModal(btn.closest('.modal').id);
      });
    });

    $$('.modal__overlay').forEach(overlay => {
      overlay.addEventListener('click', () => {
        closeModal(overlay.closest('.modal').id);
      });
    });

    // Formulário de chamado
    $('#form-chamado').addEventListener('submit', (e) => {
      e.preventDefault();
      validarEEnviarChamado();
    });

    $('#btn-limpar').addEventListener('click', () => {
      $('#form-chamado').reset();
      limparErros();
    });

    // Tema
    $('#btn-theme').addEventListener('click', toggleTema);

    // Scroll - voltar ao topo
    window.addEventListener('scroll', () => {
      const btn = $('#back-to-top');
      btn.classList.toggle('back-to-top--visible', window.scrollY > 300);
    });

    $('#back-to-top').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ESC fecha modais
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        $$('.modal[aria-hidden="false"]').forEach(m => closeModal(m.id));
      }
    });
  }

  /* ==========================================================
     NAVEGAÇÃO SPA
     ========================================================== */
  function navegarPara(sec) {
    state.sectionAtiva = sec;

    // Atualiza menu lateral
    $$('.sidebar__link').forEach(link => {
      link.classList.toggle('sidebar__link--active', link.dataset.section === sec);
    });

    // Atualiza seções visíveis
    $$('.section').forEach(section => {
      section.classList.toggle('section--active', section.id === `section-${sec}`);
    });

    // Atualiza breadcrumb
    renderBreadcrumb(sec);

    // Atualiza o hash da URL sem recarregar a página
    history.pushState(null, null, `#${sec}`);

    // Scroll ao topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderBreadcrumb(sec) {
    const nomes = {
      ajuda: 'Central de Ajuda',
      suporte: 'Suporte Técnico',
      sobre: 'Sobre o Sistema',
      atualizacoes: 'Atualizações'
    };

    $('#breadcrumb').innerHTML = `
      <a href="#${sec}">Início</a>
      <i class="fa-solid fa-chevron-right"></i>
      <span>${nomes[sec]}</span>
    `;
  }

  /* ==========================================================
     MENU MOBILE
     ========================================================== */
  function toggleMenuMobile() {
    $('#sidebar').classList.toggle('sidebar--open');
  }

  function fecharMenuMobile() {
    $('#sidebar').classList.remove('sidebar--open');
  }

  /* ==========================================================
     PESQUISA
     ========================================================== */
  function filtrarCards(termo) {
    const cards = $$('.card');
    const empty = $('#empty-ajuda');
    const normalizado = termo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    let visiveis = 0;

    cards.forEach(card => {
      const keywords = (card.dataset.keywords || '').toLowerCase();
      const titulo = card.querySelector('.card__title').textContent.toLowerCase();
      const desc = card.querySelector('.card__desc').textContent.toLowerCase();
      const match = keywords.includes(normalizado) ||
        titulo.includes(normalizado) ||
        desc.includes(normalizado);

      card.style.display = match ? '' : 'none';
      if (match) visiveis++;
    });

    empty.style.display = visiveis === 0 && termo.length > 0 ? 'block' : 'none';
  }

  /* ==========================================================
     MODAIS
     ========================================================== */
  function openModal(id) {
    const modal = $(`#${id}`);
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    const modal = $(`#${id}`);
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ==========================================================
     FORMULÁRIO DE CHAMADO
     ========================================================== */
  function validarEEnviarChamado() {
    const campos = [
      { id: 'chamado-nome', nome: 'Nome' },
      { id: 'chamado-crm', nome: 'CRM' },
      { id: 'chamado-hospital', nome: 'Hospital' },
      { id: 'chamado-urgencia', nome: 'Urgência' },
      { id: 'chamado-problema', nome: 'Descrição' }
    ];

    let valido = true;
    limparErros();

    campos.forEach(({ id, nome }) => {
      const el = $(`#${id}`);
      const val = el.value.trim();

      if (!val) {
        mostrarErro(el, `O campo ${nome} é obrigatório.`);
        valido = false;
      }
    });

    if (valido) {
      showToast('Chamado aberto com sucesso! Em breve nossa equipe entrará em contato.', 'success');
      $('#form-chamado').reset();
    } else {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
    }
  }

  function mostrarErro(el, msg) {
    el.classList.add('form__input--error');
    const errorEl = el.parentElement.querySelector('.form__error');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.add('form__error--visible');
    }
  }

  function limparErros() {
    $$('.form__input--error').forEach(el => el.classList.remove('form__input--error'));
    $$('.form__error--visible').forEach(el => el.classList.remove('form__error--visible'));
  }

  /* ==========================================================
     TEMA
     ========================================================== */
  function toggleTema() {
    const novo = state.tema === 'light' ? 'dark' : 'light';
    state.tema = novo;
    localStorage.setItem('g4med-theme', novo);
    aplicarTema(novo);
  }

  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    const icon = $('#btn-theme i');
    icon.className = tema === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  /* ==========================================================
     TOAST
     ========================================================== */
  function showToast(msg, type = 'info') {
    const container = $('#toast-container');
    const toast = document.createElement('div');

    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-xmark',
      warning: 'fa-triangle-exclamation'
    };

    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || 'fa-circle-info'}"></i>
      <span>${msg}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
  }

  /* ==========================================================
     INICIALIZA
     ========================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
/* =========================================================
   G4MED · Central de Suporte · Pro · JS
   ========================================================= */
(() => {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    /* ============ DATA ============ */
    const KB = [
        { title: 'Como cadastrar um novo paciente', cat: 'Pacientes', views: '12.4k' },
        { title: 'Configurar agenda e horários', cat: 'Agenda', views: '9.8k' },
        { title: 'Emitir nota fiscal de serviço (NFS-e)', cat: 'Financeiro', views: '8.2k' },
        { title: 'Importar pacientes de planilha Excel', cat: 'Pacientes', views: '6.7k' },
        { title: 'Integrar G4Med com convênios', cat: 'Integrações', views: '5.9k' },
        { title: 'Recuperar prontuário arquivado', cat: 'Prontuário', views: '5.1k' },
        { title: 'Configurar lembretes automáticos SMS', cat: 'Notificações', views: '4.6k' },
    ];

    const STATUS = [
        { name: 'Aplicação principal', uptime: '99.99%', state: 'ok' },
        { name: 'API & Integrações', uptime: '99.98%', state: 'ok' },
        { name: 'Banco de dados', uptime: '100.0%', state: 'ok' },
        { name: 'Notificações & SMS', uptime: '99.92%', state: 'ok' },
        { name: 'Pagamentos', uptime: '99.96%', state: 'ok' },
        { name: 'Telemedicina', uptime: '99.84%', state: 'warn' },
    ];

    const TICKETS = [
        { id: '#G4M-184729', subj: 'Erro ao gerar relatório financeiro mensal', status: 'progress', when: 'há 2h', ago: 'Atualizado · agente respondendo' },
        { id: '#G4M-184215', subj: 'Solicitação: integração com Hapvida', status: 'open', when: 'ontem', ago: 'Aguardando análise técnica' },
        { id: '#G4M-183902', subj: 'Como configurar prontuário multi-perfil', status: 'solved', when: 'há 5 dias', ago: 'Resolvido · CSAT 10/10' },
    ];

    const FAQ = [
        { q: 'Quanto tempo leva para receber a primeira resposta?', a: 'Chamados são respondidos conforme a prioridade: Crítica em até 30 minutos, Alta em 1 hora, Média em 4 horas e Baixa em até 24 horas úteis. Clientes Premium têm SLA reduzido em 50%.' },
        { q: 'Posso anexar capturas de tela e vídeos?', a: 'Sim! Aceitamos PNG, JPG, PDF e MP4 (até 25MB por arquivo). Capturas de tela e gravações ajudam muito a equipe a reproduzir o problema rapidamente.' },
        { q: 'Como acompanho o andamento do meu chamado?', a: 'Você recebe atualizações por e-mail e pode acompanhar tudo em "Meus chamados" na barra lateral. Cada movimentação gera um log com data, agente e descrição.' },
        { q: 'Vocês atendem fora do horário comercial?', a: 'Sim. Chat e WhatsApp operam 24/7. Telefone das 7h às 22h. Para emergências (sistema fora do ar), atendimento é imediato em qualquer horário.' },
        { q: 'Existe atendimento por telefone?', a: 'Sim, ligue para 0800 940 1234, de segunda a sexta das 7h às 22h. Tenha em mãos seu CNPJ e o protocolo do chamado, se houver.' },
    ];

    /* ============ KB SEARCH ============ */
    function renderKb(filter = '') {
        const list = KB.filter(k => !filter || k.title.toLowerCase().includes(filter.toLowerCase()));
        $('#kbList').innerHTML = list.slice(0, 7).map(k => `
    <li>
      <i data-lucide="file-text"></i>
      <strong>${k.title}</strong>
      <small>${k.views}</small>
    </li>
  `).join('') || `<li style="color:var(--ink-3);justify-content:center;padding:18px">Nenhum artigo encontrado</li>`;
        lucide.createIcons();
    }

    /* ============ STATUS LIST ============ */
    function renderStatus() {
        $('#statusList').innerHTML = STATUS.map(s => {
            const pips = Array.from({ length: 30 }, (_, i) => {
                let cls = '';
                if (s.state === 'warn' && (i === 26 || i === 27)) cls = 'warn';
                return `<span class="${cls}"></span>`;
            }).join('');
            return `
      <li>
        <span class="name">${s.name}</span>
        <div class="pip">${pips}</div>
        <span class="uptime">${s.uptime}</span>
      </li>
    `;
        }).join('');
    }

    /* ============ TICKETS ============ */
    function renderTickets() {
        const lbl = { open: 'Aberto', progress: 'Em andamento', solved: 'Resolvido' };
        $('#ticketList').innerHTML = TICKETS.map(t => `
    <li>
      <div class="ticket-head">
        <span class="id">${t.id}</span>
        <span class="ticket-status ${t.status}">${lbl[t.status]}</span>
      </div>
      <span class="subj">${t.subj}</span>
      <span class="meta">${t.ago} · ${t.when}</span>
    </li>
  `).join('');
    }

    /* ============ FAQ ============ */
    function renderFaq() {
        $('#faqList').innerHTML = FAQ.map((f, i) => `
    <div class="faq-item" data-faq="${i}">
      <div class="faq-q">${f.q}<i data-lucide="chevron-down"></i></div>
      <div class="faq-a">${f.a}</div>
    </div>
  `).join('');
        lucide.createIcons();
        $$('.faq-item').forEach(el => {
            el.querySelector('.faq-q').addEventListener('click', () => el.classList.toggle('open'));
        });
    }

    /* ============ STEPPER ============ */
    let step = 1;
    function goStep(n) {
        if (n === 2 && !validateStep1()) return;
        if (n === 3 && !validateStep2()) return;
        step = n;
        $$('.step-pane').forEach(p => p.classList.toggle('active', +p.dataset.pane === n));
        $$('.step').forEach(s => {
            const sn = +s.dataset.step;
            s.classList.toggle('active', sn === n);
            s.classList.toggle('done', sn < n);
        });
        $('#stepNow').textContent = n;
        if (n === 3) buildReview();
        window.scrollTo({ top: $('.form-card').offsetTop - 90, behavior: 'smooth' });
    }
    function validateStep1() {
        if (!$('input[name="cat"]:checked')) {
            toast('Selecione uma categoria', 'Escolha o tipo do chamado para continuar', 'warn');
            return false;
        }
        return true;
    }
    function validateStep2() {
        const required = ['name', 'email', 'subject', 'message'];
        for (const f of required) {
            const el = $(`[name="${f}"]`);
            if (!el.value.trim()) {
                el.focus();
                toast('Campo obrigatório', `Preencha "${f === 'name' ? 'Nome' : f === 'email' ? 'E-mail' : f === 'subject' ? 'Assunto' : 'Descrição'}"`, 'warn');
                return false;
            }
        }
        if (!$('[name="email"]').value.includes('@')) {
            toast('E-mail inválido', 'Verifique o formato', 'warn');
            return false;
        }
        if (!$('[name="agree"]').checked) {
            toast('Aceite obrigatório', 'Confirme a Política de Privacidade', 'warn');
            return false;
        }
        return true;
    }
    function buildReview() {
        const cat = $('input[name="cat"]:checked')?.value || '-';
        const prio = $('input[name="prio"]:checked')?.value || 'med';
        const catLbl = { bug: 'Erro / Bug', feature: 'Sugestão', question: 'Dúvida', billing: 'Financeiro', integration: 'Integrações', other: 'Outro' }[cat] || '-';
        const prioLbl = { low: 'Baixa', med: 'Média', high: 'Alta', crit: 'Crítica' }[prio];
        const prioCls = { low: '', med: '', high: 'warn', crit: 'danger' }[prio];

        $('#review').innerHTML = `
    <div class="review-row"><b>Categoria</b><span><span class="tag">${catLbl}</span></span></div>
    <div class="review-row"><b>Prioridade</b><span><span class="tag ${prioCls}">${prioLbl}</span></span></div>
    <div class="review-row"><b>Nome</b><span>${$('[name="name"]').value}</span></div>
    <div class="review-row"><b>E-mail</b><span>${$('[name="email"]').value}</span></div>
    ${$('[name="phone"]').value ? `<div class="review-row"><b>Telefone</b><span>${$('[name="phone"]').value}</span></div>` : ''}
    <div class="review-row"><b>Unidade</b><span>${$('[name="unit"]').value}</span></div>
    <div class="review-row"><b>Assunto</b><span>${$('[name="subject"]').value}</span></div>
    <div class="review-row"><b>Mensagem</b><span style="white-space:pre-wrap">${$('[name="message"]').value}</span></div>
    ${files.length ? `<div class="review-row"><b>Anexos</b><span>${files.length} arquivo(s) · ${(files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(2)} MB</span></div>` : ''}
    ${$('[name="urgent"]').checked ? `<div class="review-row"><b>Marcação</b><span><span class="tag warn">⚡ Visualização urgente</span></span></div>` : ''}
  `;
    }

    /* ============ FILES ============ */
    let files = [];
    function renderFiles() {
        const ico = { pdf: 'file-text', mp4: 'video', png: 'image', jpg: 'image', jpeg: 'image', default: 'file' };
        $('#fileList').innerHTML = files.map((f, i) => {
            const ext = f.name.split('.').pop().toLowerCase();
            const icon = ico[ext] || ico.default;
            return `
      <div class="dz-file">
        <i data-lucide="${icon}" class="ico"></i>
        <div class="meta"><strong>${f.name}</strong><small>${(f.size / 1024).toFixed(1)} KB</small></div>
        <button type="button" class="rm" data-rm="${i}"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
    `;
        }).join('');
        lucide.createIcons();
        $$('[data-rm]').forEach(b => b.addEventListener('click', e => {
            e.stopPropagation();
            files.splice(+b.dataset.rm, 1);
            renderFiles();
        }));
    }

    /* ============ CHARS COUNTER ============ */
    function bindCounter(input, counter, warn) {
        input.addEventListener('input', () => {
            const len = input.value.length;
            counter.textContent = len;
            if (warn) {
                if (len < 30) warn.textContent = 'Adicione mais detalhes para agilizar o atendimento';
                else if (len < 80) warn.textContent = 'Boa! Quanto mais contexto, melhor.';
                else warn.textContent = '✓ Descrição completa';
            }
        });
    }

    /* ============ CHAT ============ */
    const CANNED = [
        'Entendi! Pode me passar mais detalhes sobre quando isso começou a acontecer?',
        'Perfeito, vou verificar isso aqui no sistema. Um momento, por favor.',
        'Já localizei seu cadastro. Vou abrir um ticket interno para você acompanhar.',
        'Resolvido por aqui! Quer que eu te envie um passo a passo por e-mail também?',
    ];
    let cannedI = 0;

    function openChat() {
        $('#chatPanel').hidden = false;
        $('#chatFab').style.transform = 'scale(0)';
        setTimeout(() => $('#chatInput input').focus(), 200);
    }
    function closeChat() {
        $('#chatPanel').hidden = true;
        $('#chatFab').style.transform = '';
    }

    function bindChat() {
        $('#chatFab').addEventListener('click', openChat);
        $('#openChat').addEventListener('click', e => { e.preventDefault(); openChat(); });
        $('#closeChat').addEventListener('click', closeChat);

        $('#chatInput').addEventListener('submit', e => {
            e.preventDefault();
            const inp = e.target.querySelector('input');
            const v = inp.value.trim();
            if (!v) return;
            appendMsg('user', v);
            inp.value = '';
            setTimeout(() => {
                $('#chatTyping').hidden = false;
                setTimeout(() => {
                    $('#chatTyping').hidden = true;
                    appendMsg('agent', CANNED[cannedI++ % CANNED.length]);
                }, 1400);
            }, 500);
        });
    }

    function appendMsg(side, text) {
        const el = document.createElement('div');
        el.className = `msg ${side}`;
        el.innerHTML = `<div class="bubble">${text}</div><span class="time">agora</span>`;
        $('#chatBody').appendChild(el);
        $('#chatBody').scrollTop = $('#chatBody').scrollHeight;
    }

    /* ============ TOAST ============ */
    function toast(title, msg = '', type = 'info') {
        const icons = { info: 'info', ok: 'check-circle-2', warn: 'alert-triangle' };
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<i data-lucide="${icons[type]}"></i><div><strong>${title}</strong>${msg ? `<span>${msg}</span>` : ''}</div>`;
        $('#toastBox').appendChild(el);
        lucide.createIcons();
        setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)' }, 3200);
        setTimeout(() => el.remove(), 3700);
    }

    /* ============ SUBMIT ============ */
    function submitForm(e) {
        e.preventDefault();
        if (!validateStep2()) return;
        const id = '#G4M-' + Math.floor(100000 + Math.random() * 900000);
        $('#newTicketId').textContent = id;
        $('#successModal').hidden = false;
        // persist
        const data = {
            id, when: new Date().toISOString(),
            cat: $('input[name="cat"]:checked')?.value,
            prio: $('input[name="prio"]:checked')?.value,
            name: $('[name="name"]').value,
            email: $('[name="email"]').value,
            subject: $('[name="subject"]').value,
            message: $('[name="message"]').value,
        };
        try {
            const all = JSON.parse(localStorage.getItem('g4med-tickets') || '[]');
            all.unshift(data);
            localStorage.setItem('g4med-tickets', JSON.stringify(all.slice(0, 20)));
        } catch { }
    }

    /* ============ BINDINGS ============ */
    function bind() {
        // theme
        if (localStorage.getItem('g4med-theme') === 'dark') {
            document.documentElement.dataset.theme = 'dark';
            $('#toggleTheme i')?.setAttribute('data-lucide', 'sun');
            lucide.createIcons();
        }
        $('#toggleTheme').addEventListener('click', () => {
            const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = cur;
            localStorage.setItem('g4med-theme', cur);
            $('#toggleTheme i').setAttribute('data-lucide', cur === 'dark' ? 'sun' : 'moon');
            lucide.createIcons();
            toast(`Tema ${cur === 'dark' ? 'escuro' : 'claro'} ativado`);
        });

        // stepper
        $$('[data-next]').forEach(b => b.addEventListener('click', () => goStep(+b.dataset.next)));
        $$('[data-back]').forEach(b => b.addEventListener('click', () => goStep(+b.dataset.back)));

        // counters
        bindCounter($('[name="subject"]'), $('#subjLen'));
        bindCounter($('#msg'), $('#msgLen'), $('#msgWarn'));

        // dropzone
        const dz = $('#dropzone');
        const inp = $('#fileInput');
        dz.addEventListener('click', () => inp.click());
        inp.addEventListener('change', e => {
            files = files.concat(Array.from(e.target.files));
            renderFiles();
        });
        ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag') }));
        ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag') }));
        dz.addEventListener('drop', e => {
            files = files.concat(Array.from(e.dataTransfer.files));
            renderFiles();
        });

        // form submit
        $('#supportForm').addEventListener('submit', submitForm);

        // modal
        $('#closeModal').addEventListener('click', () => {
            $('#successModal').hidden = true;
            $('#supportForm').reset();
            files = []; renderFiles();
            goStep(1);
        });
        $('#trackTicket').addEventListener('click', () => {
            $('#successModal').hidden = true;
            toast('Acompanhamento aberto', 'Você receberá atualizações por e-mail', 'ok');
        });

        // channels
        $$('.channel').forEach(b => b.addEventListener('click', () => {
            const ch = b.dataset.channel;
            const map = { chat: 'Chat ao vivo', ticket: 'Ticket', phone: 'Telefone', whatsapp: 'WhatsApp', email: 'E-mail', emergency: 'Emergência' };
            if (ch === 'chat') openChat();
            else toast(`${map[ch]} selecionado`, `Direcionando para o canal de atendimento`, 'ok');
        }));

        // KB search
        $('#searchKb').addEventListener('input', e => renderKb(e.target.value));

        // keyboard shortcut
        document.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                $('#searchKb').focus();
            }
            if (e.key === 'Escape' && !$('#successModal').hidden) {
                $('#closeModal').click();
            }
        });

        // tickets click
        $('#ticketList').addEventListener('click', e => {
            const li = e.target.closest('li');
            if (li) toast('Abrindo chamado', 'Carregando histórico do atendimento', 'ok');
        });

        // bind chat
        bindChat();
    }

    /* ============ INIT ============ */
    function init() {
        lucide.createIcons();
        renderKb();
        renderStatus();
        renderTickets();
        renderFaq();
        bind();
        setTimeout(() => toast('Suporte G4Med online', 'Equipe pronta para te atender', 'ok'), 500);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

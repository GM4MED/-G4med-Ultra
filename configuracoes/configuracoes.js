/* =========================================================
   G4MED · Configurações — JS
   ========================================================= */
(() => {
    'use strict';

    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    const STORAGE_KEY = 'g4med_config_v1';
    const state = {
        dirty: false,
        theme: 'light',
        config: {},
        users: [],
        roles: [],
        branches: [],
        events: [],
        integrations: [],
        apiKeys: [],
        webhooks: [],
        backups: [],
        audit: [],
    };

    /* =================== SEED DATA =================== */
    function seed() {
        state.users = [
            { id: 1, name: 'Dr. Rodrigo Aguiar', email: 'rodrigo@g4med.com.br', role: 'admin', dept: 'Diretoria', last: 'há 2 minutos', active: true, twofa: true, initials: 'RA' },
            { id: 2, name: 'Dra. Mariana Costa', email: 'mariana.costa@g4med.com.br', role: 'medico', dept: 'Cardiologia', last: 'há 18 minutos', active: true, twofa: true, initials: 'MC' },
            { id: 3, name: 'Dr. Felipe Andrade', email: 'felipe.andrade@g4med.com.br', role: 'medico', dept: 'Ortopedia', last: 'há 1 hora', active: true, twofa: false, initials: 'FA' },
            { id: 4, name: 'Enf. Beatriz Lima', email: 'beatriz.lima@g4med.com.br', role: 'enfermeiro', dept: 'Centro Cirúrgico', last: 'há 35 minutos', active: true, twofa: true, initials: 'BL' },
            { id: 5, name: 'Camila Souza', email: 'camila@g4med.com.br', role: 'recepcao', dept: 'Recepção Geral', last: 'há 5 minutos', active: true, twofa: false, initials: 'CS' },
            { id: 6, name: 'Lucas Pereira', email: 'lucas.p@g4med.com.br', role: 'financeiro', dept: 'Financeiro', last: 'há 3 horas', active: true, twofa: true, initials: 'LP' },
            { id: 7, name: 'Dra. Helena Vieira', email: 'helena.v@g4med.com.br', role: 'medico', dept: 'Pediatria', last: 'há 1 dia', active: true, twofa: true, initials: 'HV' },
            { id: 8, name: 'Renata Gomes', email: 'renata.g@g4med.com.br', role: 'recepcao', dept: 'Triagem', last: 'há 6 horas', active: false, twofa: false, initials: 'RG' },
        ];

        state.roles = [
            { name: 'Administrador', desc: 'Acesso total ao sistema, incluindo licença e backup.', users: 4, icon: 'shield', color: 'rose' },
            { name: 'Médico', desc: 'Prontuário, agenda própria, prescrição digital.', users: 17, icon: 'stethoscope', color: 'brand' },
            { name: 'Enfermagem', desc: 'Triagem, sinais vitais, evoluções e escalas.', users: 12, icon: 'heart-pulse', color: 'info' },
            { name: 'Recepção', desc: 'Agendamentos, check-in e pagamentos rápidos.', users: 8, icon: 'concierge-bell', color: 'purple' },
            { name: 'Financeiro', desc: 'Contas, faturamento TISS, relatórios.', users: 5, icon: 'wallet', color: 'ok' },
            { name: 'Auditoria', desc: 'Apenas leitura · acesso a logs e relatórios.', users: 2, icon: 'eye', color: 'warn' },
        ];

        state.branches = [
            { name: 'G4Med · Itaim Bibi', addr: 'Av. Faria Lima, 4440 — São Paulo/SP', rooms: 18, beds: 4, users: 32, active: true, headquarters: true },
            { name: 'G4Med · Alphaville', addr: 'Al. Rio Negro, 503 — Barueri/SP', rooms: 9, beds: 2, users: 14, active: true },
            { name: 'G4Med · Jardins', addr: 'R. Oscar Freire, 2200 — São Paulo/SP', rooms: 6, beds: 0, users: 8, active: true },
        ];

        state.events = [
            { ev: 'Confirmação de consulta (24h antes)', wp: true, em: true, sm: false, ps: true, tpl: 'confirma_consulta' },
            { ev: 'Lembrete de consulta (2h antes)', wp: true, em: false, sm: true, ps: true, tpl: 'lembrete_2h' },
            { ev: 'Cancelamento de agendamento', wp: true, em: true, sm: false, ps: false, tpl: 'cancela_agenda' },
            { ev: 'Resultado de exame disponível', wp: true, em: true, sm: false, ps: true, tpl: 'resultado_pronto' },
            { ev: 'Boleto emitido', wp: false, em: true, sm: false, ps: false, tpl: 'boleto_novo' },
            { ev: 'Pagamento recebido', wp: true, em: true, sm: false, ps: false, tpl: 'pgto_ok' },
            { ev: 'Aniversário do paciente', wp: true, em: false, sm: false, ps: false, tpl: 'aniversario' },
            { ev: 'Estoque mínimo atingido', wp: false, em: true, sm: false, ps: true, tpl: 'estoque_min' },
        ];

        state.integrations = [
            { key: 'whatsapp', name: 'WhatsApp Business', desc: 'API oficial Meta · mensagens em massa e templates HSM.', color: '#25d366', letter: 'W', connected: true, recommended: true },
            { key: 'gcal', name: 'Google Calendar', desc: 'Sincronização bidirecional com a agenda dos médicos.', color: '#4285f4', letter: 'G', connected: true, recommended: false },
            { key: 'mp', name: 'Mercado Pago', desc: 'Cobranças, links de pagamento e checkout transparente.', color: '#00b1ea', letter: 'M', connected: true, recommended: false },
            { key: 'pix', name: 'PIX (Banco Central)', desc: 'Cobranças instantâneas com QR Code e copia-e-cola.', color: '#32bcad', letter: 'P', connected: true, recommended: true },
            { key: 'memed', name: 'Memed', desc: 'Receituário digital com assinatura e envio por SMS/WP.', color: '#0d63ad', letter: 'M', connected: false, recommended: true },
            { key: 'tiss', name: 'TISS / ANS', desc: 'Faturamento de convênios padrão TISS 4.x.', color: '#1e3a8a', letter: 'T', connected: false, recommended: true },
            { key: 'lab', name: 'Laboratórios', desc: 'Integração HL7 com Fleury, DASA e Hermes Pardini.', color: '#7c3aed', letter: 'L', connected: false, recommended: false },
            { key: 'sefaz', name: 'SEFAZ NFS-e', desc: 'Emissão automática de notas fiscais de serviço.', color: '#059669', letter: 'S', connected: true, recommended: false },
            { key: 'icpbr', name: 'ICP-Brasil', desc: 'Assinatura digital com validade jurídica.', color: '#dc2626', letter: 'I', connected: false, recommended: false },
            { key: 'gpay', name: 'Google Pay', desc: 'Aceite carteiras digitais nos terminais.', color: '#000', letter: 'G', connected: false, recommended: false },
            { key: 'zoom', name: 'Zoom Healthcare', desc: 'Telemedicina com gravação criptografada.', color: '#2d8cff', letter: 'Z', connected: false, recommended: true },
            { key: 'firebase', name: 'Firebase Cloud', desc: 'Push notifications para o app do paciente.', color: '#ffa000', letter: 'F', connected: true, recommended: false },
        ];

        state.apiKeys = [
            { name: 'Production · Backend', token: 'sk_live_•••••••••••••a82f', scope: 'full', created: '12/03/2026', last: 'há 5 min' },
            { name: 'Mobile App · Patient', token: 'sk_app_••••••••••••••92cc', scope: 'patient.read', created: '02/01/2026', last: 'há 2 min' },
            { name: 'BI · Looker Studio', token: 'sk_bi__••••••••••••••5e10', scope: 'reports.read', created: '18/11/2025', last: 'há 4 horas' },
            { name: 'Integração Fleury', token: 'sk_int_••••••••••••••71b3', scope: 'lab.write', created: '05/02/2026', last: 'há 1 dia' },
        ];

        state.webhooks = [
            { url: 'https://api.g4med.com.br/hooks/agenda', events: ['agendamento.criado', 'agendamento.cancelado'], status: 'active' },
            { url: 'https://crm.g4med.com.br/incoming', events: ['paciente.atualizado'], status: 'active' },
            { url: 'https://billing.partner.io/g4med', events: ['pagamento.confirmado', 'nfe.emitida'], status: 'paused' },
        ];

        state.backups = [
            { date: '04/06/2026 02:00', type: 'Completo', size: '4.21 GB', dur: '3min 12s', dest: 'AWS S3 sa-east-1', status: 'ok' },
            { date: '03/06/2026 02:00', type: 'Completo', size: '4.18 GB', dur: '3min 04s', dest: 'AWS S3 sa-east-1', status: 'ok' },
            { date: '02/06/2026 02:00', type: 'Completo', size: '4.15 GB', dur: '3min 09s', dest: 'AWS S3 sa-east-1', status: 'ok' },
            { date: '01/06/2026 14:32', type: 'Manual', size: '4.12 GB', dur: '2min 58s', dest: 'Azure Blob', status: 'ok' },
            { date: '01/06/2026 02:00', type: 'Completo', size: '4.10 GB', dur: '4min 41s', dest: 'AWS S3 sa-east-1', status: 'warn' },
            { date: '31/05/2026 02:00', type: 'Completo', size: '4.07 GB', dur: '3min 02s', dest: 'AWS S3 sa-east-1', status: 'ok' },
        ];

        state.audit = [
            { type: 'ok', title: 'Login bem-sucedido · Dr. Rodrigo Aguiar', meta: 'IP 200.146.118.42 · Chrome 124 · São Paulo/SP', time: 'há 2 min' },
            { type: 'info', title: 'Configuração alterada · Política de Senhas', meta: 'tamanho mínimo: 8 → 10 · por: rodrigo@g4med.com.br', time: 'há 18 min' },
            { type: 'warn', title: '3 tentativas de login falhas · usuario.teste@x.com', meta: 'IP 45.227.91.10 · País: RU · Bloqueado automaticamente', time: 'há 47 min' },
            { type: 'ok', title: 'Backup automático concluído', meta: '4.21 GB · checksum SHA-256 verificado', time: 'hoje 02:00' },
            { type: 'info', title: 'Usuário criado · Renata Gomes', meta: 'perfil: recepcao · por: rodrigo@g4med.com.br', time: 'ontem 16:21' },
            { type: 'danger', title: 'Permissão alterada · Lucas Pereira', meta: 'concedido: financeiro.estornar · revisar', time: 'ontem 14:08' },
            { type: 'ok', title: 'Webhook entregue · pagamento.confirmado', meta: '200 OK · 184ms · billing.partner.io', time: 'ontem 11:52' },
            { type: 'warn', title: 'Cota de e-mail em 83%', meta: '12.450 / 15.000 · faltam 17 dias para reset', time: 'ontem 09:14' },
        ];
    }

    /* =================== TOAST =================== */
    function toast(title, msg = '', type = 'ok') {
        const icons = { ok: 'check-circle-2', warn: 'alert-triangle', danger: 'x-circle', info: 'info' };
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<i data-lucide="${icons[type]}"></i><div><strong>${title}</strong>${msg ? `<span>${msg}</span>` : ''}</div>`;
        $('#toastBox').appendChild(el);
        lucide.createIcons();
        setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)' }, 3500);
        setTimeout(() => el.remove(), 3900);
    }

    /* =================== TABS =================== */
    function bindTabs() {
        $$('.tab').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                const id = btn.dataset.tab;
                $$('.tab-content').forEach(c => c.classList.remove('active'));
                $(`#tab-${id}`)?.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // side filter
        $('#sideSearch')?.addEventListener('input', e => {
            const q = e.target.value.toLowerCase();
            $$('.tab').forEach(t => {
                t.style.display = t.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    /* =================== USERS =================== */
    function renderUsers(filter = 'all', search = '') {
        const tb = $('#usersBody'); if (!tb) return;
        let list = state.users.slice();
        if (filter === 'inativo') list = list.filter(u => !u.active);
        else if (filter !== 'all') list = list.filter(u => u.role === filter);
        if (search) {
            const s = search.toLowerCase();
            list = list.filter(u => (u.name + u.email + u.dept).toLowerCase().includes(s));
        }
        tb.innerHTML = list.map(u => `
    <tr data-id="${u.id}">
      <td><input type="checkbox"></td>
      <td>
        <div class="user-cell">
          <div class="avatar">${u.initials}</div>
          <div class="info"><span class="name">${u.name}</span><span class="email">${u.email}</span></div>
        </div>
      </td>
      <td><span class="role-tag ${u.role}">${roleLabel(u.role)}</span></td>
      <td>${u.dept}</td>
      <td>${u.last}</td>
      <td>${u.twofa ? '<i data-lucide="shield-check" style="color:var(--ok);width:18px;height:18px"></i>' : '<i data-lucide="shield-off" style="color:var(--ink-3);width:18px;height:18px"></i>'}</td>
      <td><span class="status-pill ${u.active ? 'active' : 'inactive'}">${u.active ? 'Ativo' : 'Inativo'}</span></td>
      <td>
        <div class="row-actions">
          <button title="Editar"><i data-lucide="pencil"></i></button>
          <button title="Permissões"><i data-lucide="key"></i></button>
          <button class="del" title="Remover" data-action="remove-user"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
        lucide.createIcons();

        tb.querySelectorAll('[data-action="remove-user"]').forEach(b => {
            b.addEventListener('click', e => {
                const tr = e.target.closest('tr');
                const id = +tr.dataset.id;
                confirmDialog('Remover usuário?', 'Esta ação não pode ser desfeita.', () => {
                    state.users = state.users.filter(u => u.id !== id);
                    renderUsers(currentUserFilter, $('#userSearch')?.value || '');
                    toast('Usuário removido', '', 'warn');
                    markDirty();
                });
            });
        });
    }
    function roleLabel(r) { return { admin: 'Admin', medico: 'Médico', enfermeiro: 'Enfermagem', recepcao: 'Recepção', financeiro: 'Financeiro' }[r] || r }

    let currentUserFilter = 'all';
    function bindUsers() {
        $$('[data-filter-user]').forEach(c => c.addEventListener('click', () => {
            $$('[data-filter-user]').forEach(x => x.classList.remove('active'));
            c.classList.add('active');
            currentUserFilter = c.dataset.filterUser;
            renderUsers(currentUserFilter, $('#userSearch')?.value || '');
        }));
        $('#userSearch')?.addEventListener('input', e => renderUsers(currentUserFilter, e.target.value));
        $('#btnNovoUsuario')?.addEventListener('click', () => openModal('#modalUser'));
        $('#nu_save')?.addEventListener('click', () => {
            const name = $('#nu_name').value.trim();
            const email = $('#nu_email').value.trim();
            if (!name || !email) { toast('Preencha nome e e-mail', '', 'warn'); return }
            const initials = name.split(' ').filter(Boolean).slice(0, 2).map(x => x[0].toUpperCase()).join('');
            state.users.unshift({
                id: Date.now(), name, email,
                role: ($('#nu_role').value || '').toLowerCase().includes('méd') ? 'medico' :
                    $('#nu_role').value.toLowerCase().includes('enf') ? 'enfermeiro' :
                        $('#nu_role').value.toLowerCase().includes('rec') ? 'recepcao' :
                            $('#nu_role').value.toLowerCase().includes('fin') ? 'financeiro' : 'admin',
                dept: $('#nu_dept').value || '—', last: 'agora', active: true, twofa: false, initials
            });
            renderUsers(currentUserFilter, '');
            closeModal('#modalUser');
            toast('Usuário criado', 'Convite enviado por e-mail.', 'ok');
            markDirty();
            ['#nu_name', '#nu_email', '#nu_dept'].forEach(s => $(s).value = '');
        });
    }

    /* =================== ROLES =================== */
    function renderRoles() {
        const grid = $('#rolesGrid'); if (!grid) return;
        grid.innerHTML = state.roles.map(r => `
    <div class="role-card">
      <div class="role-head">
        <div class="ico" style="background:var(--${r.color}-50);color:var(--${r.color})"><i data-lucide="${r.icon}"></i></div>
        <h4>${r.name}</h4>
      </div>
      <p class="desc">${r.desc}</p>
      <div class="meta"><span style="color:var(--ink-3)">${r.users} usuário${r.users > 1 ? 's' : ''}</span><b style="color:var(--brand-600);cursor:pointer">Editar →</b></div>
    </div>
  `).join('');
        lucide.createIcons();
    }

    /* =================== BRANCHES =================== */
    function renderBranches() {
        const g = $('#branchGrid'); if (!g) return;
        g.innerHTML = state.branches.map(b => `
    <div class="branch-card">
      <div class="branch-head">
        <div>
          <div class="branch-name">${b.name} ${b.headquarters ? '<span class="badge info" style="margin-left:6px">Matriz</span>' : ''}</div>
          <div class="branch-addr">${b.addr}</div>
        </div>
        <span class="status-pill ${b.active ? 'active' : 'inactive'}">${b.active ? 'Ativa' : 'Inativa'}</span>
      </div>
      <div class="branch-stats">
        <div><span>Salas</span><strong>${b.rooms}</strong></div>
        <div><span>Leitos</span><strong>${b.beds}</strong></div>
        <div><span>Usuários</span><strong>${b.users}</strong></div>
      </div>
    </div>
  `).join('');
    }

    /* =================== EVENTS TABLE =================== */
    function renderEvents() {
        const tb = $('#eventsBody'); if (!tb) return;
        tb.innerHTML = state.events.map((e, i) => `
    <tr>
      <td><strong>${e.ev}</strong></td>
      <td><label class="switch-mini"><input type="checkbox" ${e.wp ? 'checked' : ''}><span></span></label></td>
      <td><label class="switch-mini"><input type="checkbox" ${e.em ? 'checked' : ''}><span></span></label></td>
      <td><label class="switch-mini"><input type="checkbox" ${e.sm ? 'checked' : ''}><span></span></label></td>
      <td><label class="switch-mini"><input type="checkbox" ${e.ps ? 'checked' : ''}><span></span></label></td>
      <td><code style="font-size:12px;color:var(--brand-600);font-weight:600">${e.tpl}</code></td>
    </tr>
  `).join('');
    }

    /* =================== INTEGRATIONS =================== */
    function renderIntegrations(filter = 'all') {
        const g = $('#integrationGrid'); if (!g) return;
        let list = state.integrations.slice();
        if (filter === 'connected') list = list.filter(i => i.connected);
        else if (filter === 'recommended') list = list.filter(i => i.recommended);
        g.innerHTML = list.map(i => `
    <div class="int-card" data-key="${i.key}">
      <div class="int-logo" style="background:${i.color}">${i.letter}</div>
      <h4>${i.name}</h4>
      <p>${i.desc}</p>
      <div class="int-foot">
        ${i.connected ? '<span class="badge ok"><i data-lucide="check"></i> Conectado</span>' : i.recommended ? '<span class="badge warn">Recomendado</span>' : '<span class="badge" style="background:var(--line-2);color:var(--ink-3)">Disponível</span>'}
        <button data-action="${i.connected ? 'disconnect' : 'connect'}">${i.connected ? 'Configurar' : 'Conectar'} <i data-lucide="arrow-right"></i></button>
      </div>
    </div>
  `).join('');
        lucide.createIcons();

        g.querySelectorAll('button[data-action]').forEach(b => {
            b.addEventListener('click', e => {
                const card = e.target.closest('.int-card');
                const key = card.dataset.key;
                const it = state.integrations.find(x => x.key === key);
                it.connected = !it.connected;
                renderIntegrations(currentIntFilter);
                toast(`${it.name} ${it.connected ? 'conectado' : 'desconectado'}`, '', it.connected ? 'ok' : 'warn');
                markDirty();
            });
        });
    }
    let currentIntFilter = 'all';
    function bindIntegrations() {
        $$('[data-int]').forEach(c => c.addEventListener('click', () => {
            $$('[data-int]').forEach(x => x.classList.remove('active'));
            c.classList.add('active');
            currentIntFilter = c.dataset.int;
            renderIntegrations(currentIntFilter);
        }));
    }

    /* =================== API KEYS / WEBHOOKS / BACKUP / AUDIT =================== */
    function renderApiKeys() {
        const tb = $('#apiKeysBody'); if (!tb) return;
        tb.innerHTML = state.apiKeys.map(k => `
    <tr>
      <td><strong>${k.name}</strong></td>
      <td><code style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--brand-600)">${k.token}</code></td>
      <td><span class="badge info">${k.scope}</span></td>
      <td>${k.created}</td>
      <td>${k.last}</td>
      <td><div class="row-actions"><button title="Copiar"><i data-lucide="copy"></i></button><button title="Rotacionar"><i data-lucide="refresh-cw"></i></button><button class="del" title="Revogar"><i data-lucide="trash-2"></i></button></div></td>
    </tr>
  `).join('');
        lucide.createIcons();
    }

    function renderWebhooks() {
        const list = $('#webhookList'); if (!list) return;
        list.innerHTML = state.webhooks.map(w => `
    <div class="webhook-row">
      <div>
        <div class="url">${w.url}</div>
        <div class="events">${w.events.map(e => `<span>${e}</span>`).join('')}</div>
      </div>
      <span class="status-pill ${w.status === 'active' ? 'active' : 'pending'}">${w.status === 'active' ? 'Ativo' : 'Pausado'}</span>
      <label class="switch-mini"><input type="checkbox" ${w.status === 'active' ? 'checked' : ''}><span></span></label>
      <div class="row-actions"><button title="Testar"><i data-lucide="zap"></i></button><button title="Editar"><i data-lucide="pencil"></i></button><button class="del" title="Remover"><i data-lucide="trash-2"></i></button></div>
    </div>
  `).join('');
        lucide.createIcons();
    }

    function renderBackups() {
        const tb = $('#backupBody'); if (!tb) return;
        tb.innerHTML = state.backups.map(b => `
    <tr>
      <td><strong>${b.date}</strong></td>
      <td>${b.type}</td>
      <td>${b.size}</td>
      <td>${b.dur}</td>
      <td>${b.dest}</td>
      <td>${b.status === 'ok' ? '<span class="badge ok"><i data-lucide="check"></i> Sucesso</span>' : '<span class="badge warn"><i data-lucide="alert-triangle"></i> Aviso</span>'}</td>
      <td><div class="row-actions"><button title="Baixar"><i data-lucide="download"></i></button><button title="Restaurar"><i data-lucide="rotate-ccw"></i></button></div></td>
    </tr>
  `).join('');
        lucide.createIcons();
    }

    function renderAudit() {
        const list = $('#auditList'); if (!list) return;
        const icons = { ok: 'check-circle-2', warn: 'alert-triangle', danger: 'shield-alert', info: 'info' };
        list.innerHTML = state.audit.map(a => `
    <div class="audit-row">
      <div class="audit-icon ${a.type}"><i data-lucide="${icons[a.type]}"></i></div>
      <div class="audit-info"><strong>${a.title}</strong><span>${a.meta}</span></div>
      <div class="audit-time">${a.time}</div>
    </div>
  `).join('');
        lucide.createIcons();
    }

    /* =================== BACKUP RUN =================== */
    function bindBackup() {
        $('#btnRunBackup')?.addEventListener('click', () => {
            confirmDialog('Executar backup agora?', 'Pode levar alguns minutos. O sistema permanece disponível.', () => {
                toast('Backup iniciado', 'Cópia em andamento...', 'info');
                setTimeout(() => {
                    state.backups.unshift({ date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5), type: 'Manual', size: '4.22 GB', dur: '3min 18s', dest: 'AWS S3 sa-east-1', status: 'ok' });
                    renderBackups();
                    toast('Backup concluído', '4.22 GB · checksum verificado', 'ok');
                }, 2500);
            });
        });
    }

    /* =================== THEME =================== */
    function bindTheme() {
        $('#toggleTheme')?.addEventListener('click', () => {
            const cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.dataset.theme = cur;
            state.theme = cur;
            const ic = $('#toggleTheme i');
            ic?.setAttribute('data-lucide', cur === 'dark' ? 'sun' : 'moon');
            lucide.createIcons();
            toast(`Tema ${cur === 'dark' ? 'escuro' : 'claro'} ativado`, '', 'info');
        });
        $$('[name="theme"]').forEach(r => r.addEventListener('change', e => {
            const v = e.target.value;
            if (v === 'dark') document.documentElement.dataset.theme = 'dark';
            else if (v === 'light') document.documentElement.dataset.theme = 'light';
            else if (v === 'auto') {
                const dark = matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.dataset.theme = dark ? 'dark' : 'light';
            } else document.documentElement.dataset.theme = 'light';
            markDirty();
        }));
    }

    /* =================== COLORS =================== */
    function bindColors() {
        const sync = (color, hex) => {
            $(color).addEventListener('input', e => $(hex).value = e.target.value);
            $(hex).addEventListener('input', e => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) $(color).value = e.target.value });
        };
        sync('#primaryColor', '#primaryHex');
        sync('#accentColor', '#accentHex');
        $('#applyColors')?.addEventListener('click', () => {
            const p = $('#primaryHex').value, a = $('#accentHex').value;
            document.documentElement.style.setProperty('--brand-600', p);
            document.documentElement.style.setProperty('--brand-500', p);
            document.documentElement.style.setProperty('--brand-grad', `linear-gradient(135deg, ${p} 0%, ${a} 100%)`);
            toast('Tema aplicado', 'Cores atualizadas em toda a interface.', 'ok');
            markDirty();
        });
    }

    /* =================== LOGO UPLOAD =================== */
    function bindLogo() {
        const drop = $('#logoDrop'), input = $('#logoInput'), prev = $('#logoPreview');
        if (!drop) return;
        drop.addEventListener('click', () => input.click());
        ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag') }));
        ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag') }));
        drop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) showLogo(f) });
        input.addEventListener('change', e => { const f = e.target.files[0]; if (f) showLogo(f) });
        function showLogo(f) {
            if (f.size > 2 * 1024 * 1024) { toast('Arquivo muito grande', 'Máx 2MB', 'warn'); return }
            const r = new FileReader();
            r.onload = e => {
                prev.innerHTML = `<img src="${e.target.result}" alt="logo"><span style="margin-top:8px">${f.name}</span>`;
                toast('Logo carregado', '', 'ok');
                markDirty();
            };
            r.readAsDataURL(f);
        }
    }

    /* =================== MASKS =================== */
    function bindMasks() {
        $$('[data-mask]').forEach(inp => {
            const t = inp.dataset.mask;
            inp.addEventListener('input', e => {
                let v = e.target.value.replace(/\D/g, '');
                if (t === 'cnpj') v = v.slice(0, 14).replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
                else if (t === 'cpf') v = v.slice(0, 11).replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
                else if (t === 'phone') v = v.slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
                else if (t === 'cep') v = v.slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
                e.target.value = v;
            });
        });
    }

    /* =================== DIRTY / SAVE =================== */
    function markDirty() {
        state.dirty = true;
        const s = $('#saveStatus');
        s.classList.add('dirty');
        s.innerHTML = '<i data-lucide="alert-circle"></i><span>Alterações não salvas</span>';
        lucide.createIcons();
    }
    function bindDirty() {
        document.addEventListener('input', e => {
            if (e.target.matches('input,select,textarea')) markDirty();
        });
        document.addEventListener('change', e => {
            if (e.target.matches('input[type=checkbox],input[type=radio],select')) markDirty();
        });
    }
    function bindSave() {
        $('#btnSave')?.addEventListener('click', () => {
            const btn = $('#btnSave');
            const orig = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Salvando...';
            lucide.createIcons();
            setTimeout(() => {
                state.dirty = false;
                const s = $('#saveStatus');
                s.classList.remove('dirty');
                s.innerHTML = '<i data-lucide="check-circle-2"></i><span>Tudo salvo</span>';
                btn.innerHTML = orig;
                lucide.createIcons();
                toast('Configurações salvas', 'Alterações aplicadas com sucesso.', 'ok');
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: state.theme })) } catch (e) { }
            }, 800);
        });
        $('#btnRestore')?.addEventListener('click', () => {
            confirmDialog('Restaurar padrões?', 'Todas as configurações desta seção serão revertidas.', () => {
                toast('Padrões restaurados', '', 'warn');
            });
        });
        $('#btnLogout')?.addEventListener('click', () => {
            confirmDialog('Sair do sistema?', 'Sua sessão será encerrada com segurança.', () => {
                toast('Saindo...', 'Até logo.', 'info');
                setTimeout(() => location.href = '../index.html', 900);
            });
        });
    }

    /* =================== MODAL =================== */
    function openModal(sel) { const m = $(sel); m?.classList.add('show'); lucide.createIcons() }
    function closeModal(sel) { $(sel)?.classList.remove('show') }
    function bindModals() {
        $$('.modal-backdrop').forEach(m => {
            m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show') });
            m.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => m.classList.remove('show')));
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') $$('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
        });
    }
    function confirmDialog(title, msg, onOk) {
        $('#cf_title').textContent = title;
        $('#cf_msg').textContent = msg;
        openModal('#modalConfirm');
        const ok = $('#cf_ok');
        const handler = () => { closeModal('#modalConfirm'); ok.removeEventListener('click', handler); onOk?.() };
        ok.addEventListener('click', handler);
    }

    /* =================== SHORTCUTS =================== */
    function bindShortcuts() {
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); $('#globalSearch')?.focus() }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); $('#btnSave')?.click() }
        });
    }

    /* =================== GLOBAL SEARCH =================== */
    function bindGlobalSearch() {
        $('#globalSearch')?.addEventListener('input', e => {
            const q = e.target.value.toLowerCase().trim();
            if (!q) { $$('.tab').forEach(t => t.style.display = ''); return }
            let firstMatch = null;
            $$('.tab-content').forEach(c => {
                const has = c.textContent.toLowerCase().includes(q);
                if (has && !firstMatch) firstMatch = c.id.replace('tab-', '');
            });
            if (firstMatch) {
                $(`.tab[data-tab="${firstMatch}"]`)?.click();
            }
        });
    }

    /* =================== COUNTERS =================== */
    function animateCounters() {
        $$('[data-counter]').forEach(el => {
            const target = +el.dataset.counter;
            let cur = 0; const step = Math.max(1, Math.floor(target / 30));
            const t = setInterval(() => {
                cur += step;
                if (cur >= target) { cur = target; clearInterval(t) }
                el.textContent = cur;
            }, 30);
        });
    }

    /* =================== INIT =================== */
    function init() {
        seed();
        lucide.createIcons();
        bindTabs();
        bindUsers(); renderUsers();
        renderRoles();
        renderBranches();
        renderEvents();
        bindIntegrations(); renderIntegrations();
        renderApiKeys();
        renderWebhooks();
        renderBackups();
        renderAudit();
        bindBackup();
        bindTheme();
        bindColors();
        bindLogo();
        bindMasks();
        bindDirty();
        bindSave();
        bindModals();
        bindShortcuts();
        bindGlobalSearch();
        animateCounters();

        // load saved theme
        try {
            const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (s.theme === 'dark') document.documentElement.dataset.theme = 'dark';
        } catch (e) { }

        setTimeout(() => toast('Bem-vindo', 'Centro de Configurações G4Med · v5.0.1', 'info'), 400);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    /* spinner */
    const style = document.createElement('style');
    style.textContent = `.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`;
    document.head.appendChild(style);

})();

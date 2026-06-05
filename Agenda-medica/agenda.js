/* =====================================================
   G4MED ULTRA · AGENDA MÉDICA — agenda.js
   ===================================================== */
(function () {
    'use strict';

    /* ===== 1. CONFIG ============================ */
    const C = {
        locale: 'pt-BR',
        storageKey: 'g4med-agenda-v1',
        workStart: 7,         // hora de início
        workEnd: 20,          // hora de fim
        slotMin: 30,          // minutos por slot
        slotPx: 38,           // altura visual em px (sincronizada com --slot-h)
        lunchStart: '12:00',
        lunchEnd: '13:30',
    };

    /* ===== 2. UTILS ============================= */
    const U = {
        qs: (s, c = document) => c.querySelector(s),
        qsa: (s, c = document) => Array.from(c.querySelectorAll(s)),
        pad: n => String(n).padStart(2, '0'),
        iso: d => `${d.getFullYear()}-${U.pad(d.getMonth() + 1)}-${U.pad(d.getDate())}`,
        parseISO: s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); },
        brl: v => new Intl.NumberFormat(C.locale, { style: 'currency', currency: 'BRL' }).format(v),
        num: (v, d = 2) => new Intl.NumberFormat(C.locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
        int: v => new Intl.NumberFormat(C.locale).format(Math.round(v)),
        fmtDate(d) {
            return d.toLocaleDateString(C.locale, { day: '2-digit', month: 'long', year: 'numeric' });
        },
        fmtWeekday(d) {
            const s = d.toLocaleDateString(C.locale, { weekday: 'long' });
            return s.charAt(0).toUpperCase() + s.slice(1);
        },
        timeToMin(t) { const [h, m] = t.split(':').map(Number); return h * 60 + m; },
        minToTime(m) { return `${U.pad(Math.floor(m / 60))}:${U.pad(m % 60)}`; },
        uid(p = 'id') { return p + '_' + Math.random().toString(36).slice(2, 10); },
        debounce(fn, ms = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; },
        escape(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
        initials(s = '') { return s.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?'; },
        avatar(name, color = '0d9488') { return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=96&font-size=0.4&bold=true`; },
    };

    /* ===== 3. SEED DATA ========================= */
    const todayISO = U.iso(new Date());
    const seed = {
        doctors: [
            { id: 'd1', name: 'Dra. Helena Costa', spec: 'Cardiologia', crm: 'CRM 23456', color: '0d9488', online: true, active: true },
            { id: 'd2', name: 'Dr. Marco Antunes', spec: 'Ortopedia', crm: 'CRM 34567', color: '0284c7', online: true, active: true },
            { id: 'd3', name: 'Dra. Júlia Reis', spec: 'Pediatria', crm: 'CRM 45678', color: '8b5cf6', online: true, active: true },
            { id: 'd4', name: 'Dr. Fábio Lima', spec: 'Clínica Geral', crm: 'CRM 56789', color: 'f59e0b', online: false, active: true },
            { id: 'd5', name: 'Dra. Mariana Souza', spec: 'Ginecologia', crm: 'CRM 67890', color: 'ec4899', online: true, active: false },
        ],
        patients: [
            { id: 'p1', name: 'Ana Carolina Mendes', cpf: '123.456.789-01', tel: '(11) 98888-1010', conv: 'Unimed', age: 34 },
            { id: 'p2', name: 'Roberto Silva', cpf: '234.567.890-12', tel: '(11) 98888-2020', conv: 'Bradesco Saúde', age: 58 },
            { id: 'p3', name: 'Mariana Lopes', cpf: '345.678.901-23', tel: '(11) 98888-3030', conv: 'Particular', age: 27 },
            { id: 'p4', name: 'João Pedro Alves', cpf: '456.789.012-34', tel: '(11) 98888-4040', conv: 'SulAmérica', age: 42 },
            { id: 'p5', name: 'Beatriz Cardoso', cpf: '567.890.123-45', tel: '(11) 98888-5050', conv: 'Amil', age: 31 },
            { id: 'p6', name: 'Lucas Ferreira', cpf: '678.901.234-56', tel: '(11) 98888-6060', conv: 'SUS', age: 8 },
            { id: 'p7', name: 'Patrícia Almeida', cpf: '789.012.345-67', tel: '(11) 98888-7070', conv: 'Hapvida', age: 45 },
            { id: 'p8', name: 'Felipe Araujo', cpf: '890.123.456-78', tel: '(11) 98888-8080', conv: 'Unimed', age: 36 },
        ],
        appointments: [
            { id: 'a1', docId: 'd1', patId: 'p1', date: todayISO, start: '08:00', dur: 30, proc: 'Consulta Clínica', status: 'confirmed', prio: 'Normal', room: 'Consultório 1' },
            { id: 'a2', docId: 'd1', patId: 'p2', date: todayISO, start: '09:00', dur: 30, proc: 'Eletrocardiograma', status: 'checkedin', prio: 'Preferencial', room: 'Consultório 1' },
            { id: 'a3', docId: 'd1', patId: 'p3', date: todayISO, start: '10:30', dur: 45, proc: 'Avaliação Pré-operatória', status: 'scheduled', prio: 'Normal', room: 'Consultório 1' },
            { id: 'a4', docId: 'd1', patId: 'p4', date: todayISO, start: '14:00', dur: 30, proc: 'Consulta de Retorno', status: 'scheduled', prio: 'Normal', room: 'Consultório 1' },
            { id: 'a5', docId: 'd2', patId: 'p5', date: todayISO, start: '08:30', dur: 30, proc: 'Consulta Clínica', status: 'inroom', prio: 'Urgente', room: 'Consultório 2' },
            { id: 'a6', docId: 'd2', patId: 'p6', date: todayISO, start: '09:30', dur: 30, proc: 'Avaliação Pediátrica', status: 'done', prio: 'Normal', room: 'Consultório 2' },
            { id: 'a7', docId: 'd2', patId: 'p7', date: todayISO, start: '10:30', dur: 60, proc: 'Pequena Cirurgia', status: 'confirmed', prio: 'Preferencial', room: 'Sala de Procedimentos' },
            { id: 'a8', docId: 'd2', patId: 'p8', date: todayISO, start: '15:00', dur: 30, proc: 'Consulta Clínica', status: 'scheduled', prio: 'Normal', room: 'Consultório 2' },
            { id: 'a9', docId: 'd3', patId: 'p6', date: todayISO, start: '08:00', dur: 30, proc: 'Consulta Pediátrica', status: 'done', prio: 'Normal', room: 'Consultório 3' },
            { id: 'a10', docId: 'd3', patId: 'p3', date: todayISO, start: '10:00', dur: 30, proc: 'Vacinação', status: 'confirmed', prio: 'Normal', room: 'Consultório 3' },
            { id: 'a11', docId: 'd3', patId: 'p1', date: todayISO, start: '11:00', dur: 30, proc: 'Consulta de Retorno', status: 'noshow', prio: 'Normal', room: 'Consultório 3' },
            { id: 'a12', docId: 'd3', patId: 'p7', date: todayISO, start: '14:30', dur: 45, proc: 'Consulta Clínica', status: 'scheduled', prio: 'Normal', room: 'Consultório 3' },
            { id: 'a13', docId: 'd4', patId: 'p2', date: todayISO, start: '09:00', dur: 30, proc: 'Consulta Clínica', status: 'canceled', prio: 'Normal', room: 'Telemedicina' },
            { id: 'a14', docId: 'd4', patId: 'p5', date: todayISO, start: '10:00', dur: 30, proc: 'Telemedicina', status: 'scheduled', prio: 'Normal', room: 'Telemedicina' },
            { id: 'a15', docId: 'd4', patId: 'p8', date: todayISO, start: '14:00', dur: 30, proc: 'Consulta Clínica', status: 'confirmed', prio: 'Normal', room: 'Telemedicina' },
        ],
        rooms: [
            { name: 'Consultório 1', status: 'busy', detail: 'Em atendimento' },
            { name: 'Consultório 2', status: 'busy', detail: 'Em atendimento' },
            { name: 'Consultório 3', status: 'free', detail: 'Disponível' },
            { name: 'Sala Proced.', status: 'clean', detail: 'Em higienização' },
            { name: 'Telemedicina', status: 'free', detail: 'Disponível' },
            { name: 'Emergência', status: 'block', detail: 'Bloqueado' },
        ],
        notices: [
            { icon: 'syringe', title: 'Campanha de vacinação', msg: 'Influenza 2026 começa segunda-feira.', time: 'há 1h' },
            { icon: 'sparkles', title: 'Nova funcionalidade', msg: 'Telemedicina agora com prontuário integrado.', time: 'há 3h' },
            { icon: 'shield-check', title: 'Auditoria CRM', msg: 'Próxima inspeção em 15 dias.', time: 'ontem' },
        ]
    };

    /* ===== 4. STATE ============================= */
    const State = {
        doctors: [], patients: [], appointments: [], rooms: [], notices: [],
        currentDate: new Date(),
        miniCalDate: new Date(),
        activeDoctors: new Set(),
        statusFilter: '',
        specFilter: '',
        view: 'day',
    };

    /* ===== 5. STORAGE =========================== */
    const Store = {
        load() {
            try {
                const raw = localStorage.getItem(C.storageKey);
                if (raw) {
                    const d = JSON.parse(raw);
                    State.doctors = d.doctors || seed.doctors;
                    State.patients = d.patients || seed.patients;
                    State.appointments = d.appointments || seed.appointments;
                    State.rooms = d.rooms || seed.rooms;
                    State.notices = d.notices || seed.notices;
                    return;
                }
            } catch (_) { }
            State.doctors = seed.doctors; State.patients = seed.patients;
            State.appointments = seed.appointments; State.rooms = seed.rooms; State.notices = seed.notices;
        },
        save() {
            try {
                localStorage.setItem(C.storageKey, JSON.stringify({
                    doctors: State.doctors, patients: State.patients,
                    appointments: State.appointments, rooms: State.rooms, notices: State.notices
                }));
            } catch (_) { }
        }
    };

    /* ===== 6. TOAST ============================= */
    const Toast = {
        el: null, init() { this.el = U.qs('#toastContainer'); },
        show(title, msg = '', type = 'success') {
            if (!this.el) this.init();
            const icon = { success: 'check-circle-2', error: 'x-circle', warn: 'alert-triangle', info: 'info' }[type] || 'info';
            const t = document.createElement('div');
            t.className = `toast toast--${type}`;
            t.innerHTML = `<i class="lucide lucide-${icon} toast__icon"></i><div class="toast__body"><div class="toast__title">${U.escape(title)}</div>${msg ? `<div class="toast__msg">${U.escape(msg)}</div>` : ''}</div>`;
            this.el.appendChild(t);
            setTimeout(() => { t.classList.add('is-leaving'); t.addEventListener('animationend', () => t.remove(), { once: true }); }, 3200);
        }
    };

    /* ===== 7. CLOCK ============================ */
    const Clock = {
        init() {
            this.tick();
            setInterval(() => this.tick(), 1000);
            setInterval(() => Scheduler.updateNowLine(), 60_000);
        },
        tick() {
            const d = new Date();
            const el = U.qs('#displayClock');
            if (el) el.textContent = `${U.pad(d.getHours())}:${U.pad(d.getMinutes())}:${U.pad(d.getSeconds())}`;
        }
    };

    /* ===== 8. MINI CAL ========================== */
    const MiniCal = {
        init() {
            const wd = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
            U.qs('#calWeekdays').innerHTML = wd.map(d => `<span>${d}</span>`).join('');
            U.qs('#calPrev').addEventListener('click', () => { State.miniCalDate.setMonth(State.miniCalDate.getMonth() - 1); this.render(); });
            U.qs('#calNext').addEventListener('click', () => { State.miniCalDate.setMonth(State.miniCalDate.getMonth() + 1); this.render(); });
            this.render();
        },
        render() {
            const d = State.miniCalDate;
            const lbl = d.toLocaleDateString(C.locale, { month: 'long', year: 'numeric' });
            U.qs('#calLabel').textContent = lbl.charAt(0).toUpperCase() + lbl.slice(1);
            const grid = U.qs('#calGrid');
            const first = new Date(d.getFullYear(), d.getMonth(), 1);
            const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            const startWd = first.getDay();
            const total = 42;
            const today = U.iso(new Date());
            const active = U.iso(State.currentDate);
            const eventDates = new Set(State.appointments.map(a => a.date));
            const cells = [];
            for (let i = 0; i < total; i++) {
                const cur = new Date(first); cur.setDate(1 - startWd + i);
                const iso = U.iso(cur);
                const other = cur.getMonth() !== d.getMonth();
                const isToday = iso === today;
                const isActive = iso === active;
                const has = eventDates.has(iso);
                cells.push(`<button data-date="${iso}" class="${other ? 'is-other' : ''} ${isToday ? 'is-today' : ''} ${isActive ? 'is-active' : ''} ${has ? 'has-events' : ''}">${cur.getDate()}</button>`);
            }
            grid.innerHTML = cells.join('');
            grid.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
                State.currentDate = U.parseISO(b.dataset.date);
                DateNav.refresh();
            }));
        }
    };

    /* ===== 9. DOCTORS / SPECIALTIES SIDE ======== */
    const DoctorsSide = {
        init() {
            State.doctors.forEach(d => { if (d.active) State.activeDoctors.add(d.id); });
            this.renderDoctors();
            this.renderSpecChips();
        },
        renderDoctors() {
            const list = U.qs('#docList');
            list.innerHTML = State.doctors.map(d => `
        <li class="doc-item" data-id="${d.id}">
          <input type="checkbox" ${State.activeDoctors.has(d.id) ? 'checked' : ''} aria-label="Filtrar ${U.escape(d.name)}" />
          <img class="doc-item__avatar ${d.online ? '' : 'doc-item__avatar--off'}" src="${U.avatar(d.name, d.color)}" alt="" />
          <div class="doc-item__info">
            <div class="doc-item__name">${U.escape(d.name)}</div>
            <div class="doc-item__spec">${U.escape(d.spec)}</div>
          </div>
        </li>`).join('');
            U.qs('#docCount').textContent = `${State.doctors.length} cadastrados`;
            list.querySelectorAll('.doc-item').forEach(li => {
                const id = li.dataset.id;
                li.addEventListener('click', e => {
                    if (e.target.tagName === 'INPUT') return;
                    const cb = li.querySelector('input'); cb.checked = !cb.checked;
                    this.toggle(id, cb.checked);
                });
                li.querySelector('input').addEventListener('change', e => this.toggle(id, e.target.checked));
            });
        },
        toggle(id, on) {
            if (on) State.activeDoctors.add(id); else State.activeDoctors.delete(id);
            Scheduler.render(); KPIs.render();
        },
        renderSpecChips() {
            const specs = ['Todas', ...new Set(State.doctors.map(d => d.spec))];
            const html = specs.map(s => `<button data-spec="${s === 'Todas' ? '' : s}" class="${(s === 'Todas' && !State.specFilter) || s === State.specFilter ? 'is-active' : ''}">${U.escape(s)}</button>`).join('');
            U.qs('#specChips').innerHTML = html;
            U.qs('#specChips').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
                State.specFilter = b.dataset.spec;
                this.renderSpecChips();
                // Auto-toggle doctors da especialidade
                if (State.specFilter) {
                    State.activeDoctors.clear();
                    State.doctors.filter(d => d.spec === State.specFilter).forEach(d => State.activeDoctors.add(d.id));
                } else {
                    State.doctors.forEach(d => State.activeDoctors.add(d.id));
                }
                DoctorsSide.renderDoctors();
                Scheduler.render(); KPIs.render();
            }));
        }
    };

    /* ===== 10. KPIs ============================= */
    const KPIs = {
        animate(el, target, formatter) {
            if (!el) return;
            const start = performance.now();
            const dur = 900;
            const tick = (now) => {
                const t = Math.min(1, (now - start) / dur);
                const eased = 1 - Math.pow(1 - t, 3);
                el.textContent = formatter(target * eased);
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        },
        render() {
            const apts = State.appointments.filter(a => a.date === U.iso(State.currentDate));
            const total = apts.length || 1;
            const noshow = apts.filter(a => a.status === 'noshow').length / total * 100;
            const done = apts.filter(a => a.status === 'done' || a.status === 'confirmed' || a.status === 'checkedin').length;
            const occ = Math.min(100, Math.round((apts.filter(a => a.status !== 'canceled').length / Math.max(1, State.activeDoctors.size * 12)) * 100));
            const revenue = apts.filter(a => a.status !== 'canceled' && a.status !== 'noshow').length * 280;

            this.animate(U.qs('#kpiPatients'), 142, v => U.int(v));
            this.animate(U.qs('#kpiRevenue'), revenue || 42800, v => U.num(v, 2));
            this.animate(U.qs('#kpiNoshow'), noshow || 14, v => U.num(v, 1));
            this.animate(U.qs('#kpiOcc'), occ || 76, v => U.int(v));
            this.animate(U.qs('#kpiWait'), 12, v => U.int(v));
            this.animate(U.qs('#kpiSat'), 4.8, v => U.num(v, 1));
        }
    };

    /* ===== 11. SCHEDULER ======================== */
    const Scheduler = {
        init() {
            U.qs('#filterStatus').addEventListener('change', e => { State.statusFilter = e.target.value; this.render(); });
            U.qs('#btnExport').addEventListener('click', () => this.exportCSV());
            U.qs('#btnPrint').addEventListener('click', () => window.print());
            U.qsa('.view-tab').forEach(t => t.addEventListener('click', () => {
                U.qsa('.view-tab').forEach(x => x.classList.remove('view-tab--active'));
                t.classList.add('view-tab--active');
                State.view = t.dataset.view;
                Toast.show('Visualização', `Modo ${t.textContent.trim()} ativado.`, 'info');
            }));
        },

        activeDoctorsList() {
            let docs = State.doctors.filter(d => State.activeDoctors.has(d.id));
            if (!docs.length) docs = State.doctors.slice(0, 1);
            return docs;
        },

        render() {
            const docs = this.activeDoctorsList();
            const dateISO = U.iso(State.currentDate);

            // Set columns count via CSS variable
            document.documentElement.style.setProperty('--cols', docs.length);

            // Header
            const head = U.qs('#schedHeader');
            head.innerHTML = `<div class="scheduler__time-col-h">Horário</div>` +
                docs.map(d => {
                    const total = State.appointments.filter(a => a.docId === d.id && a.date === dateISO).length;
                    return `
            <div class="doc-head">
              <img class="doc-head__avatar" src="${U.avatar(d.name, d.color)}" alt="" />
              <div class="doc-head__info">
                <div class="doc-head__name">${U.escape(d.name)}</div>
                <div class="doc-head__spec">${U.escape(d.spec)}</div>
              </div>
              <span class="doc-head__stat">${total}</span>
            </div>`;
                }).join('');

            // Time column
            const timeCol = U.qs('#timeCol');
            const slots = [];
            for (let m = C.workStart * 60; m < C.workEnd * 60; m += C.slotMin) {
                const major = m % 60 === 0;
                slots.push(`<div class="time-cell ${major ? 'time-cell--major' : ''}">${U.minToTime(m)}</div>`);
            }
            timeCol.innerHTML = slots.join('');

            // Columns
            const cols = U.qs('#schedCols');
            cols.innerHTML = docs.map(d => this.renderCol(d, dateISO)).join('');

            // Bind events
            cols.querySelectorAll('.slot').forEach(s => s.addEventListener('click', e => {
                const docId = s.dataset.doc;
                const time = s.dataset.time;
                AgModal.openNew({ docId, time });
            }));
            cols.querySelectorAll('.apt').forEach(a => a.addEventListener('click', e => {
                e.stopPropagation();
                Drawer.openApt(a.dataset.id);
            }));

            this.updateNowLine();
        },

        renderCol(doc, dateISO) {
            const lunchA = U.timeToMin(C.lunchStart);
            const lunchB = U.timeToMin(C.lunchEnd);
            const slots = [];
            for (let m = C.workStart * 60; m < C.workEnd * 60; m += C.slotMin) {
                const isLunch = m >= lunchA && m < lunchB;
                slots.push(`<div class="slot ${isLunch ? 'slot--lunch' : ''}" data-doc="${doc.id}" data-time="${U.minToTime(m)}"></div>`);
            }
            // Appointments
            const apts = State.appointments
                .filter(a => a.docId === doc.id && a.date === dateISO)
                .filter(a => !State.statusFilter || a.status === State.statusFilter);
            const aptHtml = apts.map(a => this.renderApt(a)).join('');
            return `<div class="doc-col" data-doc="${doc.id}">${slots.join('')}${aptHtml}</div>`;
        },

        renderApt(a) {
            const pat = State.patients.find(p => p.id === a.patId) || { name: '(paciente)' };
            const startMin = U.timeToMin(a.start) - C.workStart * 60;
            const top = (startMin / C.slotMin) * C.slotPx;
            const height = (a.dur / C.slotMin) * C.slotPx - 4;
            const prioTag = a.prio === 'Urgente' ? `<span class="apt__tag apt__tag--urg"><i class="lucide lucide-siren"></i> URG</span>` :
                a.prio === 'Preferencial' ? `<span class="apt__tag apt__tag--pref">PREF</span>` : '';
            return `
        <div class="apt" data-id="${a.id}" data-status="${a.status}" style="top:${top}px;height:${height}px">
          <div class="apt__time"><i class="lucide lucide-clock"></i> ${a.start} · ${a.dur}min</div>
          <div class="apt__name">${U.escape(pat.name)}</div>
          <div class="apt__proc">${U.escape(a.proc)}</div>
          <div class="apt__foot">
            <span class="apt__tag">${U.escape(a.room)}</span>
            ${prioTag}
          </div>
        </div>`;
        },

        updateNowLine() {
            const line = U.qs('#nowLine');
            const today = U.iso(new Date());
            if (U.iso(State.currentDate) !== today) { line.hidden = true; return; }
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            if (minutes < C.workStart * 60 || minutes >= C.workEnd * 60) { line.hidden = true; return; }
            line.hidden = false;
            const offset = ((minutes - C.workStart * 60) / C.slotMin) * C.slotPx;
            line.style.top = `${offset}px`;
        },

        exportCSV() {
            const dateISO = U.iso(State.currentDate);
            const apts = State.appointments.filter(a => a.date === dateISO);
            if (!apts.length) return Toast.show('Sem dados', 'Nenhum agendamento neste dia.', 'warn');
            const headers = ['Hora', 'Paciente', 'CPF', 'Convênio', 'Médico', 'Especialidade', 'Procedimento', 'Sala', 'Status', 'Prioridade'];
            const csv = [
                headers.join(';'),
                ...apts.map(a => {
                    const p = State.patients.find(x => x.id === a.patId) || {};
                    const d = State.doctors.find(x => x.id === a.docId) || {};
                    return [a.start, p.name, p.cpf, p.conv, d.name, d.spec, a.proc, a.room, a.status, a.prio]
                        .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';');
                })
            ].join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const aEl = document.createElement('a');
            aEl.href = URL.createObjectURL(blob);
            aEl.download = `agenda-${dateISO}.csv`;
            aEl.click(); URL.revokeObjectURL(aEl.href);
            Toast.show('Exportado', `${apts.length} agendamentos.`, 'success');
        }
    };

    /* ===== 12. WAITING ROOM / ROOMS / NOTICES === */
    const Panels = {
        renderWait() {
            const today = U.iso(State.currentDate);
            const waiting = State.appointments
                .filter(a => a.date === today && a.status === 'checkedin')
                .map(a => {
                    const p = State.patients.find(x => x.id === a.patId) || {};
                    const d = State.doctors.find(x => x.id === a.docId) || {};
                    const wait = Math.floor(Math.random() * 50) + 5;
                    return { a, p, d, wait };
                })
                .sort((x, y) => y.wait - x.wait);
            const list = U.qs('#waitList');
            U.qs('#waitBadge').textContent = waiting.length;
            if (!waiting.length) {
                list.innerHTML = `<li style="justify-content:center;color:var(--text-soft);padding:30px;font-size:12.5px">Nenhum paciente em espera.</li>`;
                return;
            }
            list.innerHTML = waiting.map((w, i) => `
        <li>
          <span class="wait-list__pos">${i + 1}</span>
          <div class="wait-list__info">
            <div class="wait-list__name">${U.escape(w.p.name || '—')}</div>
            <div class="wait-list__meta">${U.escape(w.d.name || '')} · ${U.escape(w.a.proc)}</div>
          </div>
          <span class="wait-list__time ${w.wait > 30 ? 'wait-list__time--long' : ''}"><i class="lucide lucide-timer"></i> ${w.wait}min</span>
        </li>`).join('');
        },
        renderRooms() {
            const grid = U.qs('#roomsGrid');
            grid.innerHTML = State.rooms.map(r => `
        <div class="room room--${r.status}">
          <span class="room__name">${U.escape(r.name)}</span>
          <span class="room__status">${U.escape(r.detail)}</span>
        </div>`).join('');
        },
        renderNotices() {
            const list = U.qs('#noticeList');
            list.innerHTML = State.notices.map(n => `
        <li>
          <i class="lucide lucide-${n.icon}"></i>
          <div>
            <strong>${U.escape(n.title)}</strong>
            ${U.escape(n.msg)}<br/>
            <small>${U.escape(n.time)}</small>
          </div>
        </li>`).join('');
        },
        renderAll() { this.renderWait(); this.renderRooms(); this.renderNotices(); }
    };

    /* ===== 13. AG MODAL ========================= */
    const AgModal = {
        editingId: null,
        init() {
            U.qs('#btnNovoAgendamento').addEventListener('click', () => this.openNew());
            U.qs('#formAg').addEventListener('submit', e => this.submit(e));
        },
        populate() {
            U.qs('#agMedico').innerHTML = State.doctors.map(d => `<option value="${d.id}">${U.escape(d.name)} · ${U.escape(d.spec)}</option>`).join('');
            U.qs('#patientList').innerHTML = State.patients.map(p => `<option value="${U.escape(p.name)}">${U.escape(p.cpf)}</option>`).join('');
        },
        openNew(prefill = {}) {
            this.populate();
            this.editingId = null;
            const f = U.qs('#formAg'); f.reset();
            f.data.value = prefill.date || U.iso(State.currentDate);
            f.hora.value = prefill.time || '08:00';
            if (prefill.docId) f.medico.value = prefill.docId;
            U.qs('#modalAgTitle').innerHTML = `<i class="lucide lucide-calendar-plus"></i> Novo Agendamento`;
            Modal.open('#modalAg');
        },
        openEdit(id) {
            this.populate();
            const a = State.appointments.find(x => x.id === id); if (!a) return;
            const p = State.patients.find(x => x.id === a.patId);
            this.editingId = id;
            const f = U.qs('#formAg'); f.reset();
            f.paciente.value = p?.name || '';
            f.telefone.value = p?.tel || '';
            f.convenio.value = p?.conv || 'Particular';
            f.medico.value = a.docId;
            f.procedimento.value = a.proc;
            f.data.value = a.date;
            f.hora.value = a.start;
            f.duracao.value = a.dur;
            f.sala.value = a.room;
            f.prioridade.value = a.prio;
            U.qs('#modalAgTitle').innerHTML = `<i class="lucide lucide-calendar-cog"></i> Editar Agendamento`;
            Modal.open('#modalAg');
        },
        submit(e) {
            e.preventDefault();
            const f = e.currentTarget;
            if (!f.checkValidity()) { f.reportValidity(); return; }
            const fd = new FormData(f);
            // Patient
            const name = fd.get('paciente').trim();
            let pat = State.patients.find(p => p.name.toLowerCase() === name.toLowerCase());
            if (!pat) {
                pat = { id: U.uid('p'), name, cpf: '—', tel: fd.get('telefone') || '—', conv: fd.get('convenio'), age: 0 };
                State.patients.unshift(pat);
            }
            const payload = {
                id: this.editingId || U.uid('a'),
                docId: fd.get('medico'),
                patId: pat.id,
                date: fd.get('data'),
                start: fd.get('hora'),
                dur: +fd.get('duracao') || 30,
                proc: fd.get('procedimento'),
                status: this.editingId ? State.appointments.find(x => x.id === this.editingId)?.status || 'scheduled' : 'scheduled',
                prio: fd.get('prioridade') || 'Normal',
                room: fd.get('sala') || 'Consultório 1',
            };
            if (this.editingId) {
                const i = State.appointments.findIndex(x => x.id === this.editingId);
                State.appointments[i] = payload;
                Toast.show('Agendamento atualizado', `${pat.name} · ${payload.start}`, 'success');
            } else {
                State.appointments.unshift(payload);
                Toast.show('Agendamento criado', `${pat.name} · ${payload.date} ${payload.start}`, 'success');
            }
            Store.save(); Scheduler.render(); KPIs.render(); Panels.renderAll(); MiniCal.render();
            Modal.close('#modalAg');
        }
    };

    /* ===== 14. DRAWER =========================== */
    const Drawer = {
        init() {
            U.qsa('.drawer [data-close], .drawer__backdrop').forEach(el => el.addEventListener('click', () => this.close()));
        },
        openApt(id) {
            const a = State.appointments.find(x => x.id === id); if (!a) return;
            const p = State.patients.find(x => x.id === a.patId) || {};
            const d = State.doctors.find(x => x.id === a.docId) || {};
            const stLabel = { scheduled: 'Agendado', confirmed: 'Confirmado', checkedin: 'Em espera', inroom: 'Em atendimento', done: 'Concluído', noshow: 'No-show', canceled: 'Cancelado' }[a.status];
            U.qs('#drawerPanel').innerHTML = `
        <div class="detail-hero">
          <h2>${U.escape(p.name || '—')}</h2>
          <p>${U.escape(p.cpf || '—')} · ${p.age || '?'} anos · ${U.escape(p.conv || '—')}</p>
        </div>
        <div class="detail-actions">
          <button class="btn btn--ghost" data-act="confirm"><i class="lucide lucide-check"></i> Confirmar</button>
          <button class="btn btn--ghost" data-act="checkin"><i class="lucide lucide-user-check"></i> Check-in</button>
          <button class="btn btn--ghost" data-act="inroom"><i class="lucide lucide-door-open"></i> Chamar</button>
          <button class="btn btn--ghost" data-act="done"><i class="lucide lucide-check-check"></i> Concluir</button>
          <button class="btn btn--ghost" data-act="edit"><i class="lucide lucide-pencil"></i> Editar</button>
          <button class="btn btn--ghost" data-act="cancel"><i class="lucide lucide-x"></i> Cancelar</button>
        </div>
        <div class="detail-grid">
          <div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">${a.date.split('-').reverse().join('/')}</span></div>
          <div class="detail-row"><span class="detail-label">Horário</span><span class="detail-value">${a.start} (${a.dur} min)</span></div>
          <div class="detail-row"><span class="detail-label">Médico</span><span class="detail-value">${U.escape(d.name || '')}</span></div>
          <div class="detail-row"><span class="detail-label">Especialidade</span><span class="detail-value">${U.escape(d.spec || '')}</span></div>
          <div class="detail-row"><span class="detail-label">Procedimento</span><span class="detail-value">${U.escape(a.proc)}</span></div>
          <div class="detail-row"><span class="detail-label">Sala</span><span class="detail-value">${U.escape(a.room)}</span></div>
          <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value" style="color:var(--st-${a.status})">● ${stLabel}</span></div>
          <div class="detail-row"><span class="detail-label">Prioridade</span><span class="detail-value">${U.escape(a.prio)}</span></div>
          <div class="detail-row"><span class="detail-label">Telefone</span><span class="detail-value">${U.escape(p.tel || '—')}</span></div>
          <div class="detail-row"><span class="detail-label">Convênio</span><span class="detail-value">${U.escape(p.conv || '—')}</span></div>
        </div>
        <div class="detail-section">
          <h3>Histórico clínico</h3>
          <p style="font-size:12.5px;color:var(--text-mute);line-height:1.6">Paciente sem registros prévios neste sistema. Última visita: <strong>—</strong>. Alergias conhecidas: <strong>—</strong>.</p>
        </div>
        <div class="detail-section">
          <h3>Quick actions</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <button class="btn btn--ghost btn--sm" data-act="msg-wa"><i class="lucide lucide-message-circle"></i> WhatsApp</button>
            <button class="btn btn--ghost btn--sm" data-act="msg-sms"><i class="lucide lucide-message-square"></i> SMS</button>
            <button class="btn btn--ghost btn--sm" data-act="msg-email"><i class="lucide lucide-mail"></i> E-mail</button>
            <button class="btn btn--ghost btn--sm" data-act="prontuario"><i class="lucide lucide-file-text"></i> Prontuário</button>
          </div>
        </div>`;
            // Bind quick actions
            U.qsa('#drawerPanel button[data-act]').forEach(b => b.addEventListener('click', () => this.action(a.id, b.dataset.act)));
            U.qs('#drawerApt').setAttribute('aria-hidden', 'false');
        },
        action(id, act) {
            const apt = State.appointments.find(x => x.id === id);
            if (!apt) return;
            const map = { confirm: 'confirmed', checkin: 'checkedin', inroom: 'inroom', done: 'done', cancel: 'canceled' };
            if (map[act]) {
                apt.status = map[act];
                Store.save(); Scheduler.render(); KPIs.render(); Panels.renderAll();
                Toast.show('Status atualizado', `→ ${apt.status}`, 'success');
                this.openApt(id);
                return;
            }
            if (act === 'edit') { this.close(); AgModal.openEdit(id); return; }
            if (act.startsWith('msg-')) { Toast.show('Mensagem', `Enviada via ${act.split('-')[1].toUpperCase()}.`, 'success'); return; }
            if (act === 'prontuario') Toast.show('Prontuário', 'Abrindo prontuário eletrônico (demo).', 'info');
        },
        close() { U.qs('#drawerApt').setAttribute('aria-hidden', 'true'); }
    };

    /* ===== 15. MODAL HELPER ===================== */
    const Modal = {
        init() {
            U.qsa('.modal').forEach(m => m.addEventListener('click', e => { if (e.target.matches('[data-close]')) this.close('#' + m.id); }));
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') { U.qsa('.modal:not([hidden])').forEach(m => this.close('#' + m.id)); Drawer.close(); }
            });
            U.qs('#btnSair').addEventListener('click', () => this.open('#modalSair'));
        },
        open(sel) { const m = U.qs(sel); if (!m) return; m.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => m.querySelector('input,select,button')?.focus()); },
        close(sel) { const m = U.qs(sel); if (!m) return; m.hidden = true; document.body.style.overflow = ''; }
    };

    /* ===== 16. DATE NAV ========================= */
    const DateNav = {
        init() {
            U.qs('#dayPrev').addEventListener('click', () => this.shift(-1));
            U.qs('#dayNext').addEventListener('click', () => this.shift(1));
            U.qs('#todayBtn').addEventListener('click', () => { State.currentDate = new Date(); this.refresh(); });
            U.qs('#datePicker').addEventListener('change', e => { State.currentDate = U.parseISO(e.target.value); this.refresh(); });
            this.refresh();
        },
        shift(d) { const c = new Date(State.currentDate); c.setDate(c.getDate() + d); State.currentDate = c; this.refresh(); },
        refresh() {
            U.qs('#displayDate').textContent = U.fmtDate(State.currentDate);
            U.qs('#displayWeekday').textContent = U.fmtWeekday(State.currentDate);
            U.qs('#datePicker').value = U.iso(State.currentDate);
            State.miniCalDate = new Date(State.currentDate);
            MiniCal.render();
            Scheduler.render();
            KPIs.render();
            Panels.renderAll();
        }
    };

    /* ===== 17. SHORTCUTS ======================== */
    const Shortcuts = {
        init() {
            document.addEventListener('keydown', e => {
                const cmd = e.ctrlKey || e.metaKey;
                if (cmd && e.key.toLowerCase() === 'k') { e.preventDefault(); U.qs('#globalSearch').focus(); }
                else if (cmd && e.key.toLowerCase() === 'n') { e.preventDefault(); AgModal.openNew(); }
                else if (e.key === 'ArrowLeft' && e.altKey) { DateNav.shift(-1); }
                else if (e.key === 'ArrowRight' && e.altKey) { DateNav.shift(1); }
                else if (e.key.toLowerCase() === 't' && e.altKey) { State.currentDate = new Date(); DateNav.refresh(); }
            });
        }
    };

    /* ===== 18. SEARCH =========================== */
    const Search = {
        init() {
            U.qs('#globalSearch').addEventListener('input', U.debounce(e => this.run(e.target.value.trim().toLowerCase()), 200));
        },
        run(q) {
            if (!q) return;
            const found = State.patients.find(p => p.name.toLowerCase().includes(q) || p.cpf.includes(q));
            if (found) {
                const apt = State.appointments.find(a => a.patId === found.id);
                if (apt) {
                    State.currentDate = U.parseISO(apt.date);
                    DateNav.refresh();
                    setTimeout(() => Drawer.openApt(apt.id), 200);
                }
            }
        }
    };

    /* ===== 19. APP BOOTSTRAP =================== */
    const App = {
        init() {
            Store.load();
            Toast.init();
            Modal.init();
            Drawer.init();
            Clock.init();
            MiniCal.init();
            DoctorsSide.init();
            AgModal.init();
            Scheduler.init();
            DateNav.init();
            Shortcuts.init();
            Search.init();
            console.info('%cG4Med Agenda %cv1.0', 'color:#0d9488;font-weight:700', 'color:#94a3b8');
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => App.init());
    else App.init();
})();

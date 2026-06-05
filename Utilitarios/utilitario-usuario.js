/* === G4Med Usuarios PRO =============== ver 2.0 JS =========================== */
(function () {
    'use strict';

    /* ---- DATA ---- */
    const seed = [
        { id: 1001, nome: 'Dr. Ricardo Almeida', login: 'dr.ricardo', email: 'ricardo@g4med.com', perfil: 'Médico', status: 'Ativo', ultimo: Date.now() - 18 * 60000, criado: '2025-01-10' },
        { id: 1002, nome: 'Ana Paula Costa', login: 'anacosta', email: 'ana@g4med.com', perfil: 'Recepção', status: 'Ativo', ultimo: Date.now() - 120 * 60000, criado: '2025-02-05' },
        { id: 1003, nome: 'Carlos Mendes Jr.', login: 'cmendes', email: 'carlos@g4med.com', perfil: 'Administrador', status: 'Ativo', ultimo: Date.now() - 5 * 60000, criado: '2024-11-20' },
        { id: 1004, nome: 'Mariana Torres', login: 'mtorres', email: 'mariana@g4med.com', perfil: 'Financeiro', status: 'Bloqueado', ultimo: Date.now() - 2880 * 60000, criado: '2025-03-01' },
        { id: 1005, nome: 'Bruno Fernandes', login: 'bruno.f', email: 'bruno@g4med.com', perfil: 'Médico', status: 'Ativo', ultimo: Date.now() - 55 * 60000, criado: '2025-01-28' },
        { id: 1006, nome: 'Fernanda Lima', login: 'fernanda', email: 'fernanda@g4med.com', perfil: 'Recepção', status: 'Ativo', ultimo: Date.now() - 60000, criado: '2025-03-12' },
        { id: 1007, nome: 'Roberto Castro', login: 'roberto', email: 'roberto@g4med.com', perfil: 'Médico', status: 'Bloqueado', ultimo: Date.now() - 10080 * 60000, criado: '2024-08-15' },
        { id: 1008, nome: 'Juliana Pires', login: 'juliana', email: 'juliana@g4med.com', perfil: 'Administrador', status: 'Ativo', ultimo: Date.now() - 10 * 60000, criado: '2024-12-01' },
        { id: 1009, nome: 'Lucas Machado', login: 'lmachado', email: 'lucas@g4med.com', perfil: 'Financeiro', status: 'Ativo', ultimo: Date.now() - 240 * 60000, criado: '2025-02-20' },
        { id: 1010, nome: 'Camila Ribeiro', login: 'camila.r', email: 'camila@g4med.com', perfil: 'Recepção', status: 'Ativo', ultimo: Date.now() - 30 * 60000, criado: '2025-04-01' }
    ];

    /* ---- STORAGE ---- */
    const LS = 'g4med_usuarios_v2';
    let usuarios = [];
    try { usuarios = JSON.parse(localStorage.getItem(LS) || '[]'); } catch (e) { }
    if (!usuarios.length || usuarios.length < seed.length) usuarios = seed.map(s => ({ ...s }));
    const sv = () => localStorage.setItem(LS, JSON.stringify(usuarios));

    /* ---- THEME ---- */
    let dark = localStorage.getItem('g4med_theme_u') === 'dark';
    const body = document.body;
    const tt = document.getElementById('tTheme');
    function applyT() {
        body.classList.toggle('dark', dark);
        const ic = tt.querySelector('i'); ic.setAttribute('data-lucide', dark ? 'sun' : 'moon'); lucide.createIcons();
    }
    applyT();
    tt.addEventListener('click', () => { dark = !dark; localStorage.setItem('g4med_theme_u', dark ? 'dark' : 'light'); applyT(); });

    /* ---- UTILS ---- */
    const pad = n => ('0' + n).slice(-2);
    const fmt = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const iso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
    const ini = n => n.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase();
    const bc = { Administrador: 'purple', Médico: 'ok', 'Recepção': 'warn', Financeiro: 'indigo' };
    const sc = { Ativo: 'ok', Bloqueado: 'fail' };
    function ago(ms) { const s = ((Date.now() - ms) / 1000) | 0; if (s < 60) return 'agora'; if (s < 3600) return (s / 60 | 0) + 'm'; if (s < 86400) return (s / 3600 | 0) + 'h'; return (s / 86400 | 0) + 'd'; }

    /* ---- REFS ---- */
    const e = {
        tbody: document.getElementById('tableBody'), busca: document.getElementById('buscarUsuario'), filtro: document.getElementById('filtroPerfil'),
        total: document.getElementById('totalUsuarios'), atv: document.getElementById('usuariosAtivos'), blk: document.getElementById('usuariosBloqueados'),
        adm: document.getElementById('administradores'), showing: document.getElementById('showing'), trows: document.getElementById('totalRows'),
        sync: document.getElementById('lastSync'), syncF: document.getElementById('syncFooter'),
        mCad: document.getElementById('mCadastro'), tTag: document.getElementById('tTag'), tTitle: document.getElementById('tTitle'),
        bSalvar: document.getElementById('bSalvar'), bClose: document.getElementById('bCloseCad'), bCancel: document.getElementById('bCancelCad'),
        fCad: document.getElementById('fCadastro'), reqSenha: document.getElementById('reqSenha'),
        cNome: document.getElementById('cNome'), cLogin: document.getElementById('cLogin'), cEmail: document.getElementById('cEmail'),
        cPerfil: document.getElementById('cPerfil'), cSenha: document.getElementById('cSenha'), cStatus: document.getElementById('cStatus'),
        hintSenha: document.getElementById('hintSenha'),
        mDel: document.getElementById('mExcluir'), dNome: document.getElementById('dNome'),
        bDel: document.getElementById('bConfirmDel'), bCancelDel: document.getElementById('bCancelDel'),
        toast: document.getElementById('toastBox'),
    };

    /* ---- KPI ---- */
    function refreshKpi() {
        e.total.textContent = usuarios.length;
        e.atv.textContent = usuarios.filter(u => u.status === 'Ativo').length;
        e.blk.textContent = usuarios.filter(u => u.status === 'Bloqueado').length;
        e.adm.textContent = usuarios.filter(u => u.perfil === 'Administrador').length;
        const d = fmt(new Date());
        e.sync.textContent = d; e.syncF.textContent = d;
    }

    /* ---- RENDER ---- */
    function render() {
        const q = e.busca.value.trim().toLowerCase(), f = e.filtro.value;
        let rows = usuarios.filter(u => (!q || u.nome.toLowerCase().includes(q) || u.login.toLowerCase().includes(q)) && (!f || u.perfil === f));
        rows.sort((a, b) => (b.ultimo || 0) - (a.ultimo || 0));
        e.trows.textContent = usuarios.length; e.showing.textContent = rows.length;
        e.tbody.innerHTML = rows.length ? rows.map(u => `
    <tr onclick="openEdit(${u.id})">
      <td><div class="avatar-sm">${ini(u.nome)}</div></td>
      <td>
        <div class="cell-user">
          <span class="cu-name">${u.nome}</span>
          <span class="cu-mail">${u.email}</span>
        </div>
      </td>
      <td class="mono">@${u.login}</td>
      <td><span class="badge ${bc[u.perfil] || 'ok'}">${u.perfil}</span></td>
      <td><span class="badge ${sc[u.status] || 'ok'}">${u.status}</span></td>
      <td class="num" title="${fmt(new Date(u.ultimo))}">${ago(u.ultimo)}</td>
      <td>
        <div class="row-actions" onclick="event.stopPropagation()">
          <button class="act-btn" onclick="openEdit(${u.id})" title="Editar"><i data-lucide="pencil"></i></button>
          <button class="act-btn del" onclick="openDel(${u.id})" title="Excluir"><i data-lucide="trash-2"></i></button>
        </div>
      </td>
    </tr>`).join('') : `<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--muted)"><i data-lucide="search-x" style="width:40px;height:40px;margin-bottom:12px;display:block;margin:0 auto 12px"></i>Nenhum usuário encontrado</td></tr>`;
        lucide.createIcons();
    }

    /* ---- MODAL ---- */
    let editId = null, delId = null;
    function openCad(isEdit, id) {
        editId = isEdit ? id : null; e.tTag.textContent = isEdit ? 'EDITAR' : 'NOVO'; e.tTag.className = 'm-tag';
        if (isEdit) { const u = usuarios.find(x => x.id === id); if (!u) return; e.tTitle.textContent = 'Editar Usuário'; e.cNome.value = u.nome; e.cLogin.value = u.login; e.cEmail.value = u.email; e.cPerfil.value = u.perfil; e.cStatus.value = u.status; e.cSenha.value = ''; e.reqSenha.classList.remove('req'); e.hintSenha.innerHTML = 'Senha permanece inalterada ao deixar em branco'; }
        else { e.tTitle.textContent = 'Novo Usuário'; e.fCad.reset(); e.reqSenha.classList.add('req'); e.hintSenha.innerHTML = 'Força: <b>—</b>'; }
        e.mCad.hidden = false; e.cNome.focus();
    }
    window.openEdit = id => openCad(true, id);
    window.openDel = id => { delId = id; const u = usuarios.find(x => x.id === id); e.dNome.textContent = u ? u.nome : '—'; e.mDel.hidden = false; };
    function closeCad() { e.mCad.hidden = true; editId = null; } function closeDel() { e.mDel.hidden = true; delId = null; }
    [e.mCad, e.mDel].forEach(m => m.addEventListener('click', ev => { if (ev.target === m) m.hidden = true; }));
    e.bClose.addEventListener('click', closeCad); e.bCancel.addEventListener('click', closeCad); e.bCancelDel.addEventListener('click', closeDel);

    /* ---- SAVE ---- */
    e.bSalvar.addEventListener('click', () => {
        const n = e.cNome.value.trim(), l = e.cLogin.value.trim(), em = e.cEmail.value.trim(), p = e.cPerfil.value, s = e.cSenha.value, st = e.cStatus.value;
        if (!n || !l || !em || !p) { toast('Preencha todos os campos obrigatórios', 'err'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { toast('E-mail inválido', 'err'); return; }
        if (!editId && (!s || s.length < 6)) { toast('A senha deve ter no mínimo 6 caracteres', 'err'); return; }
        if (editId) {
            const i = usuarios.findIndex(x => x.id === editId);
            if (i > -1) { Object.assign(usuarios[i], { nome: n, login: l, email: em, perfil: p, status: st, ultimo: Date.now() }); sv(); render(); toast('Usuário atualizado', 'ok'); }
        } else {
            const nid = Math.max(...usuarios.map(u => u.id), 1000) + 1;
            usuarios.unshift({ id: nid, nome: n, login: l, email: em, perfil: p, status: st, ultimo: Date.now(), criado: iso() });
            sv(); render(); refreshKpi(); toast('Usuário cadastrado', 'ok');
        }
        closeCad();
    });

    /* ---- STRENGTH ---- */
    e.cSenha.addEventListener('input', () => {
        const s = e.cSenha.value;
        if (!s) e.hintSenha.innerHTML = 'Força: <b>—</b>';
        else if (s.length < 6) e.hintSenha.innerHTML = 'Força: <b style="color:var(--fail)">Fraca</b>';
        else if (s.length < 8) e.hintSenha.innerHTML = 'Força: <b style="color:var(--warn)">Média</b>';
        else e.hintSenha.innerHTML = 'Força: <b style="color:var(--ok)">Forte</b>';
    });

    /* ---- DELETE ---- */
    e.bDel.addEventListener('click', () => { if (delId) { usuarios = usuarios.filter(x => x.id !== delId); sv(); render(); refreshKpi(); toast('Usuário excluído', 'ok'); } closeDel(); });

    /* ---- TOAST ---- */
    function toast(msg, type = 'info') {
        const el = document.createElement('div'); el.className = 'toast ' + type;
        el.innerHTML = `<i data-lucide="${type === 'ok' ? 'check-circle' : type === 'err' ? 'x-circle' : type === 'warn' ? 'alert-triangle' : 'info'}"></i><b>${msg}</b><i data-lucide="x" class="t-close"></i>`;
        e.toast.appendChild(el); lucide.createIcons();
        el.querySelector('.t-close').onclick = () => el.remove(); setTimeout(() => el.remove(), 4000);
    }

    /* ---- EXPORT ---- */
    document.getElementById('btnExport').addEventListener('click', () => {
        const rows = usuarios.map(u => ({ ID: u.id, Nome: u.nome, Login: u.login, Email: u.email, Perfil: u.perfil, Status: u.status, 'Ultimo Acesso': fmt(new Date(u.ultimo)), 'Cadastrado em': u.criado }));
        if (!rows.length) { toast('Nada para exportar', 'warn'); return; }
        const h = Object.keys(rows[0]).join(','), d = rows.map(r => Object.values(r).map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
        const blob = new Blob([h + '\n' + d], { type: 'text/csv;charset=utf-8;' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'usuarios_' + iso() + '.csv'; a.click(); toast(`CSV exportado (${rows.length} registros)`, 'ok');
    });

    /* ---- PRINT ---- */
    document.getElementById('btnPrint').addEventListener('click', () => {
        const h = `<html><head><title>Usuários G4Med</title><style>body{font-family:sans-serif;padding:24px}th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd}h2{font-size:18px;margin-bottom:16px}</style></head><body><h2>Usuários G4Med · ${iso()}</h2><table><thead><tr><th>Nome</th><th>Login</th><th>Perfil</th><th>Status</th><th>Email</th><th>Último Acesso</th></tr></thead><tbody>${usuarios.map(u => `<tr><td>${u.nome}</td><td>@${u.login}</td><td>${u.perfil}</td><td>${u.status}</td><td>${u.email}</td><td>${fmt(new Date(u.ultimo))}</td></tr>`).join('')}</tbody></table></body></html>`;
        const w = window.open('', 'print'); w.document.write(h); w.document.close(); w.focus(); w.print(); w.close();
    });

    /* ---- INIT ---- */
    document.getElementById('btnNovoUsuario').addEventListener('click', () => openCad(false));
    e.busca.addEventListener('input', render);
    e.filtro.addEventListener('change', render);
    lucide.createIcons();
    refreshKpi();
    render();
})();

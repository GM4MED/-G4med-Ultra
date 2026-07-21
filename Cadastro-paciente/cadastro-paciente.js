/**
 * paciente.js - Cadastro de Paciente G4med
 * Regras do PDF: ao abrir só Novo/Buscar ativos.
 * Novo → habilita tudo, gera ID.
 * Gravar → valida, salva, desabilita.
 * Editar → habilita para alteração.
 * Cancelar → limpa e volta ao estado inicial.
 */

/* ==========================================================
   ESTADO
========================================================== */
let modo = 'inicial'; // inicial | novo | editando | gravado
let proxId = 1;
let streamWebcam = null;
let historico = [];

/* ==========================================================
   INIT
========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    iniciarRelogio();
    aplicarMascaras();
    iniciarAssinatura();
    iniciarAnexos();
    setEstadoInicial();

    // Eventos
    document.getElementById('pacNascimento')?.addEventListener('change', calcularIdade);
    document.getElementById('pacCep')?.addEventListener('blur', buscarCep);
    document.getElementById('pacCpf')?.addEventListener('blur', function () {
        if (this.value && !validarCPF(this.value)) {
            this.style.borderColor = 'var(--vermelho)';
            alert('CPF inválido!');
        } else {
            this.style.borderColor = '';
        }
    });

    // Caixa alta para campos específicos
    ['pacNome', 'pacNacionalidade', 'pacProfissao', 'pacRespNome', 'pacRespParentesco',
        'pacEndereco', 'pacBairro', 'pacCidade', 'pacConvenioNome', 'pacTitular', 'pacPlano']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', function () { this.value = this.value.toUpperCase(); });
        });

    // Caixa baixa para e-mail
    const email = document.getElementById('pacEmail');
    if (email) email.addEventListener('input', function () { this.value = this.value.toLowerCase(); });
});

/* ==========================================================
   ESTADO DOS BOTÕES E CAMPOS
========================================================== */
function setEstadoInicial() {
    modo = 'inicial';
    toggleCampos(true);
    setBtn('btnNovo', false);
    setBtn('btnGravar', true);
    setBtn('btnEditar', true);
    setBtn('btnAnterior', true);
    setBtn('btnProximo', true);
    setBtn('btnBuscar', false);
    setBtn('btnExcluir', true);
    setBtn('btnCancelar', true);
    setBtn('btnAnexo', true);
    setBtn('btnImprimir', true);
    setBtn('btnHistorico', true);
}

function setEstadoNovo() {
    modo = 'novo';
    toggleCampos(false);
    setBtn('btnNovo', true);
    setBtn('btnGravar', false);
    setBtn('btnEditar', true);
    setBtn('btnAnterior', true);
    setBtn('btnProximo', true);
    setBtn('btnBuscar', true);
    setBtn('btnExcluir', true);
    setBtn('btnCancelar', false);
    setBtn('btnAnexo', false);
    setBtn('btnImprimir', true);
    setBtn('btnHistorico', true);

    document.getElementById('pacId').value = String(proxId).padStart(5, '0');
    document.getElementById('pacDataCad').value = agoraISO();
    document.getElementById('pacUserCad').value = 'ADMIN';
    document.getElementById('pacStatus').value = 'A';
    setTimeout(() => document.getElementById('pacNome')?.focus(), 100);
}

function setEstadoGravado() {
    modo = 'gravado';
    toggleCampos(true);
    setBtn('btnNovo', false);
    setBtn('btnGravar', true);
    setBtn('btnEditar', false);
    setBtn('btnAnterior', false);
    setBtn('btnProximo', false);
    setBtn('btnBuscar', false);
    setBtn('btnExcluir', false);
    setBtn('btnCancelar', true);
    setBtn('btnAnexo', true);
    setBtn('btnImprimir', false);
    setBtn('btnHistorico', false);

    proxId++;
    addHistorico('Paciente cadastrado');
}

function setEstadoEditando() {
    modo = 'editando';
    toggleCampos(false);
    setBtn('btnNovo', true);
    setBtn('btnGravar', false);
    setBtn('btnEditar', true);
    setBtn('btnAnterior', true);
    setBtn('btnProximo', true);
    setBtn('btnBuscar', true);
    setBtn('btnExcluir', true);
    setBtn('btnCancelar', false);
    setBtn('btnAnexo', false);
    setBtn('btnImprimir', true);
    setBtn('btnHistorico', true);
}

function toggleCampos(desabilitar) {
    document.querySelectorAll('.campo-edita').forEach(el => {
        el.disabled = desabilitar;
    });
}

function setBtn(id, disabled) {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = disabled;
}

/* ==========================================================
   AÇÕES DOS BOTÕES
========================================================== */
function acaoNovo() {
    if (modo === 'novo' || modo === 'editando') {
        if (!confirm('Deseja limpar e iniciar um novo cadastro?')) return;
        limparFormulario();
    }
    setEstadoNovo();
}

function acaoGravar() {
    if (!validarFormulario()) return;
    document.getElementById('pacUltAtu').value = agoraISO();
    setEstadoGravado();
    alert('Paciente gravado com sucesso!');
}

function acaoEditar() {
    setEstadoEditando();
    addHistorico('Iniciada edição do cadastro');
}

function acaoExcluir() {
    if (confirm('Deseja realmente excluir este paciente?')) {
        addHistorico('Paciente excluído');
        limparFormulario();
        setEstadoInicial();
        alert('Paciente excluído.');
    }
}

function acaoCancelar() {
    if (modo === 'novo') {
        if (!confirm('Cancelar o cadastro atual?')) return;
        limparFormulario();
        setEstadoInicial();
    } else if (modo === 'editando') {
        if (!confirm('Cancelar as alterações?')) return;
        toggleCampos(true);
        setEstadoGravado(); // Volta ao estado gravado
    } else {
        limparFormulario();
        setEstadoInicial();
    }
}

function acaoBuscar() {
    abrirModal('modalBusca');
    setTimeout(() => document.getElementById('buscaTermo')?.focus(), 100);
}

function acaoAnterior() { alert('Navegar para registro anterior (integrar com BD)'); }
function acaoProximo() { alert('Navegar para próximo registro (integrar com BD)'); }
function acaoAnexo() { switchTab('tab8'); }
function acaoImprimir() { window.print(); }
function acaoHistorico() { abrirModal('modalHistorico'); }
function acaoSair() { if (confirm('Deseja sair?')) window.location.href = 'index.html'; }

/* ==========================================================
   VALIDAÇÃO
========================================================== */
function validarFormulario() {
    const nome = document.getElementById('pacNome')?.value.trim();
    const cpf = document.getElementById('pacCpf')?.value.trim();
    const nasc = document.getElementById('pacNascimento')?.value;

    if (!nome) { alert('Preencha o Nome Completo.'); document.getElementById('pacNome').focus(); return false; }
    if (!cpf || cpf.length < 14) { alert('Preencha o CPF corretamente.'); document.getElementById('pacCpf').focus(); return false; }
    if (!validarCPF(cpf)) { alert('CPF inválido.'); document.getElementById('pacCpf').focus(); return false; }
    if (!nasc) { alert('Preencha a Data de Nascimento.'); document.getElementById('pacNascimento').focus(); return false; }
    return true;
}

/* ==========================================================
   LIMPAR FORMULÁRIO
========================================================== */
function limparFormulario() {
    document.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else if (!el.readOnly && el.type !== 'button') el.value = '';
    });
    document.getElementById('fotoPreview').src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    document.getElementById('anexoLista').innerHTML = '<div class="anexo-vazio">Nenhum documento anexado</div>';
    limparAssinatura();
}

/* ==========================================================
   MÁSCARAS
========================================================== */
function aplicarMascaras() {
    const map = {
        'pacCpf': 'cpf', 'pacRg': 'rg', 'pacTel1': 'tel', 'pacTel2': 'tel',
        'pacWhats': 'tel', 'pacRespTel': 'tel', 'pacRespWhats': 'tel',
        'pacCep': 'cep', 'pacTitularCpf': 'cpf'
    };
    Object.entries(map).forEach(([id, tipo]) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', e => mascara(e.target, tipo));
    });
}

function mascara(el, tipo) {
    let v = el.value.replace(/\D/g, '');
    if (tipo === 'cpf') {
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (tipo === 'rg') {
        v = v.replace(/(\d{2})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})([\dXx])$/, '$1-$2');
    } else if (tipo === 'tel') {
        v = v.length > 10
            ? v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
            : v.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (tipo === 'cep') {
        v = v.replace(/(\d{5})(\d)/, '$1-$2');
    }
    el.value = v;
}

/* ==========================================================
   VALIDAÇÃO CPF
========================================================== */
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11 || /^(.)(\1){10}$/.test(cpf)) return false;
    let s = 0, r;
    for (let i = 1; i <= 9; i++) s += parseInt(cpf[i - 1]) * (11 - i);
    r = (s * 10) % 11; if (r === 10 || r === 11) r = 0;
    if (r !== parseInt(cpf[9])) return false;
    s = 0;
    for (let i = 1; i <= 10; i++) s += parseInt(cpf[i - 1]) * (12 - i);
    r = (s * 10) % 11; if (r === 10 || r === 11) r = 0;
    return r === parseInt(cpf[10]);
}

/* ==========================================================
   BUSCA CEP
========================================================== */
function buscarCep() {
    const cep = document.getElementById('pacCep')?.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(r => r.json())
        .then(data => {
            if (data.erro) { alert('CEP não encontrado.'); return; }
            document.getElementById('pacEndereco').value = (data.logradouro || '').toUpperCase();
            document.getElementById('pacBairro').value = (data.bairro || '').toUpperCase();
            document.getElementById('pacCidade').value = (data.localidade || '').toUpperCase();
            document.getElementById('pacEstado').value = (data.uf || '').toUpperCase();
            document.getElementById('pacPais').value = 'BRASIL';
            document.getElementById('pacNumero').focus();
        })
        .catch(() => alert('Erro ao buscar CEP.'));
}

/* ==========================================================
   CÁLCULO IDADE
========================================================== */
function calcularIdade() {
    const nasc = document.getElementById('pacNascimento')?.value;
    const el = document.getElementById('pacIdade');
    if (!nasc || !el) return;
    const hoje = new Date(), n = new Date(nasc);
    if (isNaN(n)) return;
    let a = hoje.getFullYear() - n.getFullYear();
    let m = hoje.getMonth() - n.getMonth();
    let d = hoje.getDate() - n.getDate();
    if (d < 0) { m--; d += 30; }
    if (m < 0) { a--; m += 12; }
    el.value = `${a} Anos ${String(m).padStart(2, '0')} Meses ${String(d).padStart(2, '0')} Dias`;
}

/* ==========================================================
   TABS
========================================================== */
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
    document.getElementById(tabId)?.classList.add('active');
}

/* ==========================================================
   WEBCAM
========================================================== */
function abrirWebcam() {
    abrirModal('modalWebcam');
    const video = document.getElementById('webcamVideo');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => { streamWebcam = s; video.srcObject = s; })
        .catch(() => { alert('Não foi possível acessar a webcam.'); fecharWebcam(); });
}

function capturarFoto() {
    const video = document.getElementById('webcamVideo');
    const canvas = document.getElementById('webcamCanvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    document.getElementById('fotoPreview').src = canvas.toDataURL('image/png');
    fecharWebcam();
}

function fecharWebcam() {
    fecharModal('modalWebcam');
    if (streamWebcam) { streamWebcam.getTracks().forEach(t => t.stop()); streamWebcam = null; }
}

/* ==========================================================
   ASSINATURA DIGITAL
========================================================== */
let ctxAss = null, desenhando = false;

function iniciarAssinatura() {
    const c = document.getElementById('assinaturaCanvas');
    if (!c) return;
    ctxAss = c.getContext('2d');
    ctxAss.strokeStyle = '#333'; ctxAss.lineWidth = 2; ctxAss.lineCap = 'round';

    const pos = (e) => {
        const r = c.getBoundingClientRect();
        const sx = c.width / r.width, sy = c.height / r.height;
        return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
    };
    const start = (e) => { desenhando = true; const p = pos(e); ctxAss.beginPath(); ctxAss.moveTo(p.x, p.y); };
    const move = (e) => { if (!desenhando) return; const p = pos(e); ctxAss.lineTo(p.x, p.y); ctxAss.stroke(); };
    const end = () => { desenhando = false; };

    c.addEventListener('mousedown', start);
    c.addEventListener('mousemove', move);
    c.addEventListener('mouseup', end);
    c.addEventListener('mouseleave', end);
    c.addEventListener('touchstart', e => { e.preventDefault(); start(e.touches[0]); });
    c.addEventListener('touchmove', e => { e.preventDefault(); move(e.touches[0]); });
    c.addEventListener('touchend', end);
}

function limparAssinatura() {
    const c = document.getElementById('assinaturaCanvas');
    if (c && ctxAss) ctxAss.clearRect(0, 0, c.width, c.height);
}

function salvarAssinatura() {
    const c = document.getElementById('assinaturaCanvas');
    if (!c) return;
    console.log('Assinatura:', c.toDataURL('image/png').substring(0, 50));
    alert('Assinatura salva!');
}

/* ==========================================================
   ANEXOS
========================================================== */
function iniciarAnexos() {
    const drop = document.getElementById('dropZone');
    const input = document.getElementById('anexoInput');
    if (!drop || !input) return;

    drop.addEventListener('click', () => input.click());
    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
    drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('dragover'); processarArquivos(e.dataTransfer.files); });
    input.addEventListener('change', e => processarArquivos(e.target.files));
}

function processarArquivos(files) {
    const lista = document.getElementById('anexoLista');
    if (!lista) return;
    if (lista.querySelector('.anexo-vazio')) lista.innerHTML = '';

    Array.from(files).forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        const icon = ['pdf'].includes(ext) ? 'fa-file-pdf' :
            ['jpg', 'jpeg', 'png'].includes(ext) ? 'fa-file-image' :
                ['doc', 'docx'].includes(ext) ? 'fa-file-word' : 'fa-file';
        const size = (file.size / 1024).toFixed(1) + ' KB';

        const div = document.createElement('div');
        div.className = 'anexo-item';
        div.innerHTML = `
            <div class="anexo-item-info">
                <i class="fa-solid ${icon}"></i>
                <div><div class="anexo-item-nome">${file.name}</div><div class="anexo-item-size">${size}</div></div>
            </div>
            <div class="anexo-item-actions">
                <button type="button" class="btn-view" title="Visualizar"><i class="fa-solid fa-eye"></i></button>
                <button type="button" class="btn-del" title="Excluir" onclick="this.closest('.anexo-item').remove()"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        lista.appendChild(div);
    });
}

/* ==========================================================
   HISTÓRICO
========================================================== */
function addHistorico(acao) {
    historico.push({ data: new Date().toLocaleString('pt-BR'), usuario: 'ADMIN', acao });
    renderHistorico();
}

function renderHistorico() {
    const el = document.getElementById('historicoConteudo');
    if (!el) return;
    if (historico.length === 0) {
        el.innerHTML = '<div class="historico-vazio">Nenhuma alteração registrada.</div>';
        return;
    }
    el.innerHTML = historico.map(h => `
        <div class="historico-item">
            <div class="historico-data">${h.data}</div>
            <div class="historico-acao">${h.acao}</div>
            <div class="historico-user">@${h.usuario}</div>
        </div>`).join('');
}

/* ==========================================================
   MODAIS
========================================================== */
function abrirModal(id) { document.getElementById(id)?.classList.add('active'); }
function fecharModal(id) { document.getElementById(id)?.classList.remove('active'); }

/* ==========================================================
   BUSCA (simulação)
========================================================== */
function executarBusca() {
    const termo = document.getElementById('buscaTermo')?.value.trim();
    const res = document.getElementById('buscaResultados');
    if (!termo || !res) return;

    // Simulação de resultados
    res.innerHTML = `
        <div class="busca-item" onclick="alert('Paciente selecionado: ${termo}')">
            <div class="busca-item-nome">${termo.toUpperCase()}</div>
            <div class="busca-item-info">CPF: 000.000.000-00 | Código: 00001</div>
        </div>
        <div class="busca-item" onclick="alert('Paciente selecionado: MARIA SILVA')">
            <div class="busca-item-nome">MARIA SILVA</div>
            <div class="busca-item-info">CPF: 111.111.111-11 | Código: 00002</div>
        </div>`;
}

/* ==========================================================
   RELÓGIO
========================================================== */
function iniciarRelogio() {
    const el = document.getElementById('clock');
    if (!el) return;
    const upd = () => {
        el.textContent = new Date().toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };
    upd(); setInterval(upd, 1000);
}

/* ==========================================================
   UTILS
========================================================== */
function agoraISO() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

/* ==========================================================
   ABA OUTROS
========================================================== */
function emitirAtestado() {
    alert('📝 ATESTADO MÉDICO\n\n• Paciente: ' + (document.getElementById('pacNome')?.value || 'N/A') + '\n• CID: [campo para preenchimento]\n• Acompanhante: [se necessário]\n• Assinatura digital do médico\n\n(Integrar com impressão/PDF)');
}

function emitirPedidoExames() {
    alert('🧪 PEDIDO DE EXAMES\n\n• Selecionar exames solicitados\n• Assinatura digital integrada\n• Opção para consulta online\n\n(Integrar com laboratório parceiro)');
}

function emitirReceita() {
    alert('💊 RECEITA MÉDICA\n\n• Medicamentos e posologia\n• CRM e Especialidade do médico\n• Assinatura digital\n• Opção de impressão ou envio digital\n\n(Integrar com impressão/PDF)');
}

function verHistorico() {
    acaoHistorico();
}

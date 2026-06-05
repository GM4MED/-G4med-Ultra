// Dados iniciais mockados
let usuarios = [
    { id: 1, nome: "Administrador", email: "admin@sistema.com", contato: "(62) 99999-9999", perfil: "Administrador", status: true, observacoes: "Admin principal" },
    { id: 2, nome: "Maria Oliveira", email: "maria@sistema.com", contato: "(62) 98888-8888", perfil: "Médico", status: true, observacoes: "" }
];

const userForm = document.getElementById('userForm');
const btnClear = document.getElementById('btnClear');
const dropZone = document.getElementById('dropZone');
const inputFoto = document.getElementById('inputFoto');

// --- Lógica de Upload ---
const handleFile = (files) => {
    if (files.length > 0) dropZone.querySelector('p').textContent = `Arquivo: ${files[0].name}`;
};

dropZone.addEventListener('click', () => inputFoto.click());
inputFoto.addEventListener('change', (e) => handleFile(e.target.files));

// --- Função de Limpeza ---
btnClear.addEventListener('click', () => {
    userForm.reset();
    dropZone.querySelector('p').textContent = "Clique para enviar ou arraste uma imagem";
});

// --- Ações ---
userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const senha = document.getElementById('senha').value;
    const confSenha = document.getElementById('confirmarSenha').value;

    if (senha !== confSenha) {
        alert("As senhas não coincidem!");
        return;
    }

    // Captura do status (Booleano)
    const statusSelecionado = document.querySelector('input[name="status"]:checked').value === 'true';

    // Captura do novo campo Observações
    const observacoes = document.getElementById('observacoes').value;

    const novoUsuario = {
        id: Date.now(),
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        contato: document.getElementById('telefone').value,
        perfil: document.getElementById('perfil').value,
        status: statusSelecionado,
        observacoes: observacoes // Incluindo o dado no objeto
    };

    usuarios.unshift(novoUsuario);
    
    // Feedback de sucesso
    alert("Usuário salvo com sucesso!");
    
    console.log("Novo usuário criado:", novoUsuario);
    
    userForm.reset();
    // Reseta o texto do dropzone se necessário
    dropZone.querySelector('p').textContent = "Clique para enviar ou arraste uma imagem";
});

// Inicialização
lucide.createIcons();
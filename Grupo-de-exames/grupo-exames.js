(() => {
    "use strict";


    const state = {
        grupos: [],
        exames: [],
        grupoAtual: null,
        examesSelecionados: new Set(),
        acaoConfirmada: null,
        paginaAtual: 1,
        itensPorPagina: 6,
        modalAnterior: null
    };


    const elementos = {};


    const categorias = [
        "Laboratorial",
        "Imagem",
        "Cardiológico",
        "Endoscópico",
        "Oftalmológico",
        "Ginecológico",
        "Neurológico",
        "Anatomopatológico",
        "Microbiológico",
        "Check-up",
        "Outros"
    ];


    const mockExames = [
        {
            id: 1,
            codigo: "EX001",
            nome: "Hemograma completo",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Clínica Médica",
            status: "ATIVO"
        },
        {
            id: 2,
            codigo: "EX002",
            nome: "Glicemia em jejum",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Endocrinologia",
            status: "ATIVO"
        },
        {
            id: 3,
            codigo: "EX003",
            nome: "Colesterol Total",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Cardiologia",
            status: "ATIVO"
        },
        {
            id: 4,
            codigo: "EX004",
            nome: "HDL",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Cardiologia",
            status: "ATIVO"
        },
        {
            id: 5,
            codigo: "EX005",
            nome: "LDL",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Cardiologia",
            status: "ATIVO"
        },
        {
            id: 6,
            codigo: "EX006",
            nome: "Triglicerídeos",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Cardiologia",
            status: "ATIVO"
        },
        {
            id: 7,
            codigo: "EX007",
            nome: "TSH",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Endocrinologia",
            status: "ATIVO"
        },
        {
            id: 8,
            codigo: "EX008",
            nome: "T4 livre",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Endocrinologia",
            status: "ATIVO"
        },
        {
            id: 9,
            codigo: "EX009",
            nome: "Urina tipo I",
            tipo: "Laboratorial",
            material: "Urina",
            especialidade: "Clínica Médica",
            status: "ATIVO"
        },
        {
            id: 10,
            codigo: "EX010",
            nome: "Creatinina",
            tipo: "Laboratorial",
            material: "Sangue",
            especialidade: "Clínica Médica",
            status: "ATIVO"
        },
        {
            id: 11,
            codigo: "EX011",
            nome: "Raio-X de tórax",
            tipo: "Imagem",
            material: "Imagem",
            especialidade: "Cardiologia",
            status: "ATIVO"
        },
        {
            id: 12,
            codigo: "EX012",
            nome: "Ultrassonografia abdominal",
            tipo: "Imagem",
            material: "Imagem",
            especialidade: "Clínica Médica",
            status: "ATIVO"
        },
        {
            id: 13,
            codigo: "EX013",
            nome: "Eletrocardiograma",
            tipo: "Cardiológico",
            material: "Não aplicável",
            especialidade: "Cardiologia",
            status: "ATIVO"
        }
    ];


    const mockGrupos = [
        {
            id: 1,
            codigo: "GR001",
            nome: "Perfil Lipídico",
            sigla: "PL",
            categoria: "Laboratorial",
            especialidades: ["Cardiologia", "Clínica Médica"],
            descricao: "Conjunto de exames para avaliação do perfil lipídico.",
            status: "ATIVO",
            exames: [
                { exameId: 3, ordem: 1 },
                { exameId: 4, ordem: 2 },
                { exameId: 5, ordem: 3 },
                { exameId: 6, ordem: 4 }
            ],
            preparoGeral: "Jejum de 8 a 12 horas, conforme orientação médica.",
            orientacoesPaciente: "Compareça ao laboratório com documento de identificação.",
            observacoesInternas: "",
            convenios: ["Particular", "Unimed"],
            tabelaPreco: "Tabela padrão",
            codigoTuss: "",
            codigoCbhpm: "",
            valor: "",
            necessitaAgendamento: false,
            necessitaAutorizacao: false,
            localRealizacao: "Laboratório",
            sala: "",
            equipamento: "",
            tempoEstimado: "00:30",
            profissionalResponsavel: "",
            prazoResultado: "2 dias úteis",
            criadoPor: "Administrador",
            criadoEm: "21/08/2026 14:32",
            alteradoPor: "Administrador",
            atualizadoEm: "21/08/2026 15:10",
            historico: [
                {
                    data: "21/08/2026 15:10",
                    usuario: "Administrador",
                    descricao: 'Alterou o grupo "Perfil Lipídico".'
                },
                {
                    data: "21/08/2026 14:32",
                    usuario: "Administrador",
                    descricao: 'Criou o grupo "Perfil Lipídico".'
                }
            ]
        },
        {
            id: 2,
            codigo: "GR002",
            nome: "Avaliação da Tireoide",
            sigla: "TIR",
            categoria: "Laboratorial",
            especialidades: ["Endocrinologia"],
            descricao: "Exames laboratoriais para avaliação da função tireoidiana.",
            status: "ATIVO",
            exames: [
                { exameId: 7, ordem: 1 },
                { exameId: 8, ordem: 2 }
            ],
            preparoGeral: "",
            orientacoesPaciente: "",
            observacoesInternas: "",
            convenios: ["Particular", "Amil"],
            tabelaPreco: "Tabela convênio",
            codigoTuss: "",
            codigoCbhpm: "",
            valor: "",
            necessitaAgendamento: false,
            necessitaAutorizacao: true,
            localRealizacao: "Laboratório",
            sala: "",
            equipamento: "",
            tempoEstimado: "00:20",
            profissionalResponsavel: "",
            prazoResultado: "1 dia útil",
            criadoPor: "Administrador",
            criadoEm: "20/08/2026 09:20",
            alteradoPor: "Administrador",
            atualizadoEm: "20/08/2026 09:20",
            historico: [
                {
                    data: "20/08/2026 09:20",
                    usuario: "Administrador",
                    descricao: 'Criou o grupo "Avaliação da Tireoide".'
                }
            ]
        },
        {
            id: 3,
            codigo: "GR003",
            nome: "Check-up Básico",
            sigla: "CB",
            categoria: "Check-up",
            especialidades: ["Clínica Médica"],
            descricao: "Conjunto básico para avaliação preventiva.",
            status: "INATIVO",
            exames: [
                { exameId: 1, ordem: 1 },
                { exameId: 2, ordem: 2 },
                { exameId: 9, ordem: 3 },
                { exameId: 10, ordem: 4 }
            ],
            preparoGeral: "",
            orientacoesPaciente: "",
            observacoesInternas: "",
            convenios: ["Particular"],
            tabelaPreco: "Tabela particular",
            codigoTuss: "",
            codigoCbhpm: "",
            valor: "",
            necessitaAgendamento: false,
            necessitaAutorizacao: false,
            localRealizacao: "Clínica",
            sala: "",
            equipamento: "",
            tempoEstimado: "00:45",
            profissionalResponsavel: "",
            prazoResultado: "3 dias úteis",
            criadoPor: "Administrador",
            criadoEm: "18/08/2026 11:10",
            alteradoPor: "Administrador",
            atualizadoEm: "19/08/2026 16:45",
            historico: []
        }
    ];


    function cacheElements() {
        const ids = [
            "newGroupBtn",
            "emptyCreateBtn",
            "searchGroup",
            "filterCategory",
            "filterSpecialty",
            "filterStatus",
            "clearFiltersBtn",
            "groupsTableBody",
            "groupsTableWrapper",
            "groupsSkeleton",
            "groupsEmptyState",
            "groupsErrorState",
            "retryGroupsBtn",
            "resultCount",
            "pagination",
            "paginationInfo",
            "currentPageLabel",
            "previousPageBtn",
            "nextPageBtn",
            "groupModal",
            "groupModalTitle",
            "groupForm",
            "groupId",
            "groupCode",
            "groupName",
            "groupShortName",
            "groupCategory",
            "groupSpecialties",
            "groupDescription",
            "groupStatus",
            "saveGroupLabel",
            "addExamBtn",
            "modalExamCount",
            "groupExamsEmpty",
            "groupExamsTableWrapper",
            "groupExamsTableBody",
            "groupExamsError",
            "examModal",
            "searchExam",
            "filterExamType",
            "filterExamMaterial",
            "filterExamStatus",
            "examResults",
            "examResultsEmpty",
            "addSelectedExamsBtn",
            "confirmModal",
            "confirmModalTitle",
            "confirmModalMessage",
            "confirmActionBtn",
            "toastContainer",
            "auditCreatedBy",
            "auditCreatedAt",
            "auditUpdatedAt",
            "auditUpdatedBy",
            "auditHistory"
        ];


        ids.forEach((id) => {
            elementos[id] = document.getElementById(id);
        });


        elementos.tabButtons = document.querySelectorAll("[data-tab]");
        elementos.closeButtons = document.querySelectorAll("[data-close-modal]");
        elementos.tabPanels = document.querySelectorAll("[data-panel]");
    }


    function clonarDados(dados) {
        return JSON.parse(JSON.stringify(dados));
    }


    function normalizarTexto(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }


    function escaparHtml(valor) {
        return String(valor || "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function formatarEspecialidades(especialidades = []) {
        if (!especialidades.length) {
            return "Não definida";
        }


        if (especialidades.length <= 2) {
            return especialidades.join(", ");
        }


        return `${especialidades.slice(0, 2).join(", ")} +${especialidades.length - 2}`;
    }


    function formatarQuantidadeExames(grupo) {
        const total = grupo.exames?.length || 0;
        return `${total} ${total === 1 ? "exame" : "exames"}`;
    }


    function obterExamePorId(id) {
        return state.exames.find((exame) => exame.id === id);
    }


    function obterExamesDoGrupo(grupo) {
        return [...(grupo.exames || [])]
            .sort((a, b) => a.ordem - b.ordem)
            .map((item) => ({
                ...item,
                dados: obterExamePorId(item.exameId)
            }))
            .filter((item) => item.dados);
    }


    function obterProximoCodigo() {
        const maiorId = state.grupos.reduce((maior, grupo) => Math.max(maior, grupo.id), 0);
        return `GR${String(maiorId + 1).padStart(3, "0")}`;
    }


    function obterDataAtual() {
        return new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(new Date());
    }


    /* Camada preparada para futura API REST */


    async function buscarGrupos() {
        return clonarDados(state.grupos);
    }


    async function buscarGrupoPorId(id) {
        return state.grupos.find((grupo) => grupo.id === Number(id)) || null;
    }


    async function criarGrupo(dados) {
        const novoId = Math.max(0, ...state.grupos.map((grupo) => grupo.id)) + 1;
        const agora = obterDataAtual();


        const novoGrupo = {
            ...dados,
            id: novoId,
            codigo: obterProximoCodigo(),
            criadoPor: "Administrador",
            criadoEm: agora,
            alteradoPor: "Administrador",
            atualizadoEm: agora,
            historico: [
                {
                    data: agora,
                    usuario: "Administrador",
                    descricao: `Criou o grupo "${dados.nome}".`
                }
            ]
        };


        state.grupos.push(novoGrupo);
        return novoGrupo;
    }


    async function atualizarGrupo(id, dados) {
        const indice = state.grupos.findIndex((grupo) => grupo.id === Number(id));


        if (indice === -1) {
            throw new Error("Grupo não encontrado.");
        }


        const grupoAnterior = state.grupos[indice];
        const agora = obterDataAtual();


        const grupoAtualizado = {
            ...grupoAnterior,
            ...dados,
            id: grupoAnterior.id,
            codigo: grupoAnterior.codigo,
            criadoPor: grupoAnterior.criadoPor,
            criadoEm: grupoAnterior.criadoEm,
            alteradoPor: "Administrador",
            atualizadoEm: agora,
            historico: [
                {
                    data: agora,
                    usuario: "Administrador",
                    descricao: `Alterou o grupo "${dados.nome}".`
                },
                ...(grupoAnterior.historico || [])
            ]
        };


        state.grupos[indice] = grupoAtualizado;
        return grupoAtualizado;
    }


    async function excluirGrupo(id) {
        const indice = state.grupos.findIndex((grupo) => grupo.id === Number(id));


        if (indice === -1) {
            throw new Error("Grupo não encontrado.");
        }


        state.grupos.splice(indice, 1);
    }


    async function buscarExames() {
        return clonarDados(state.exames);
    }


    /* Listagem */


    function obterFiltros() {
        return {
            busca: normalizarTexto(elementos.searchGroup?.value),
            categoria: elementos.filterCategory?.value || "",
            especialidade: elementos.filterSpecialty?.value || "",
            status: elementos.filterStatus?.value || ""
        };
    }


    function filtrarGrupos() {
        const filtros = obterFiltros();


        return state.grupos.filter((grupo) => {
            const textoBusca = normalizarTexto([
                grupo.codigo,
                grupo.nome,
                grupo.sigla,
                grupo.categoria,
                ...(grupo.especialidades || [])
            ].join(" "));


            const correspondeBusca =
                !filtros.busca || textoBusca.includes(filtros.busca);


            const correspondeCategoria =
                !filtros.categoria || grupo.categoria === filtros.categoria;


            const correspondeEspecialidade =
                !filtros.especialidade ||
                grupo.especialidades?.includes(filtros.especialidade);


            const correspondeStatus =
                !filtros.status || grupo.status === filtros.status;


            return (
                correspondeBusca &&
                correspondeCategoria &&
                correspondeEspecialidade &&
                correspondeStatus
            );
        });
    }


    function criarBadgeStatus(status) {
        const badge = document.createElement("span");
        badge.className = `status-badge ${status === "ATIVO" ? "status-badge-active" : "status-badge-inactive"
            }`;


        badge.textContent = status === "ATIVO" ? "Ativo" : "Inativo";
        return badge;
    }


    function renderizarTabela() {
        const gruposFiltrados = filtrarGrupos();
        const totalPaginas = Math.max(
            1,
            Math.ceil(gruposFiltrados.length / state.itensPorPagina)
        );


        if (state.paginaAtual > totalPaginas) {
            state.paginaAtual = totalPaginas;
        }


        const inicio = (state.paginaAtual - 1) * state.itensPorPagina;
        const gruposPagina = gruposFiltrados.slice(
            inicio,
            inicio + state.itensPorPagina
        );


        elementos.groupsTableBody.innerHTML = "";


        gruposPagina.forEach((grupo) => {
            const linha = document.createElement("tr");
            linha.className = `group-row ${grupo.status === "INATIVO" ? "is-inactive" : ""
                }`;
            linha.dataset.id = grupo.id;


            linha.innerHTML = `
                <td class="whitespace-nowrap px-5 py-4 font-semibold text-teal-700">
                    ${escaparHtml(grupo.codigo)}
                </td>


                <td class="px-5 py-4">
                    <div class="min-w-48">
                        <p class="font-semibold text-slate-900">
                            ${escaparHtml(grupo.nome)}
                        </p>
                        <p class="mt-1 max-w-xs truncate text-xs text-slate-500">
                            ${escaparHtml(grupo.descricao || "Sem descrição")}
                        </p>
                    </div>
                </td>


                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                    ${escaparHtml(grupo.sigla || "—")}
                </td>


                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                    ${escaparHtml(grupo.categoria)}
                </td>


                <td class="max-w-48 px-5 py-4 text-slate-600">
                    ${escaparHtml(formatarEspecialidades(grupo.especialidades))}
                </td>


                <td class="whitespace-nowrap px-5 py-4 text-slate-600">
                    ${formatarQuantidadeExames(grupo)}
                </td>


                <td class="whitespace-nowrap px-5 py-4 status-cell"></td>


                <td class="whitespace-nowrap px-5 py-4 text-slate-500">
                    ${escaparHtml(grupo.atualizadoEm || "—")}
                </td>


                <td class="px-5 py-4 text-right">
                    <div class="row-action-wrapper relative inline-block text-left">
                        <button type="button"
                            class="row-action-menu inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            aria-label="Abrir ações do grupo ${escaparHtml(grupo.nome)}"
                            aria-haspopup="menu"
                            aria-expanded="false">


                            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none"
                                stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round"
                                aria-hidden="true">
                                <circle cx="5" cy="12" r="1"></circle>
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                            </svg>
                        </button>


                        <div class="row-action-list hidden absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg drop-down"
                            role="menu">


                            <button type="button" data-action="view"
                                class="row-action-item" role="menuitem">
                                Visualizar
                            </button>


                            <button type="button" data-action="edit"
                                class="row-action-item" role="menuitem">
                                Editar
                            </button>


                            <button type="button" data-action="duplicate"
                                class="row-action-item" role="menuitem">
                                Duplicar
                            </button>


                            <button type="button" data-action="toggle"
                                class="row-action-item" role="menuitem">
                                ${grupo.status === "ATIVO" ? "Inativar" : "Ativar"}
                            </button>


                            <button type="button" data-action="delete"
                                class="row-action-item text-red-600 hover:bg-red-50"
                                role="menuitem">
                                Excluir
                            </button>
                        </div>
                    </div>
                </td>
            `;


            linha.querySelector(".status-cell").appendChild(
                criarBadgeStatus(grupo.status)
            );


            elementos.groupsTableBody.appendChild(linha);
        });


        atualizarEstadoLista(gruposFiltrados.length);
        atualizarPaginacao(gruposFiltrados.length, gruposPagina.length, inicio);
    }


    function atualizarEstadoLista(total) {
        const semResultados = total === 0;


        elementos.groupsTableWrapper.classList.toggle("hidden", semResultados);
        elementos.groupsEmptyState.classList.toggle("hidden", !semResultados);
        elementos.pagination.classList.toggle("hidden", semResultados);
    }


    function atualizarPaginacao(total, quantidadePagina, inicio) {
        const totalPaginas = Math.max(
            1,
            Math.ceil(total / state.itensPorPagina)
        );


        elementos.resultCount.textContent =
            `${total} ${total === 1 ? "grupo encontrado" : "grupos encontrados"}`;


        elementos.paginationInfo.textContent = total
            ? `Exibindo ${inicio + 1}–${inicio + quantidadePagina} de ${total} grupos`
            : "Exibindo 0 grupos";


        elementos.currentPageLabel.textContent =
            `Página ${state.paginaAtual} de ${totalPaginas}`;


        elementos.previousPageBtn.disabled = state.paginaAtual <= 1;
        elementos.nextPageBtn.disabled = state.paginaAtual >= totalPaginas;
    }


    function limparFiltros() {
        elementos.searchGroup.value = "";
        elementos.filterCategory.value = "";
        elementos.filterSpecialty.value = "";
        elementos.filterStatus.value = "";
        state.paginaAtual = 1;
        renderizarTabela();
    }


    /* Modais */


    function abrirModal(id) {
        const modal = document.getElementById(id);


        if (!modal) {
            return;
        }


        state.modalAnterior = document.activeElement;
        modal.classList.remove("hidden");
        document.body.classList.add("overflow-hidden");


        const primeiroFoco = modal.querySelector(
            "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])"
        );


        window.setTimeout(() => primeiroFoco?.focus(), 50);
    }


    function fecharModal(id) {
        const modal = document.getElementById(id);


        if (!modal) {
            return;
        }


        modal.classList.add("hidden");


        const algumModalAberto = document.querySelector(".modal:not(.hidden)");
        if (!algumModalAberto) {
            document.body.classList.remove("overflow-hidden");
        }


        state.modalAnterior?.focus?.();
        state.modalAnterior = null;
    }


    function configurarNovoGrupo() {
        state.grupoAtual = null;


        elementos.groupModalTitle.textContent = "Novo Grupo de Exames";
        elementos.saveGroupLabel.textContent = "Salvar Grupo";
        elementos.groupForm.reset();


        elementos.groupCode.value = obterProximoCodigo();
        elementos.groupStatus.checked = true;
        elementos.groupExamsError.textContent = "";


        renderizarExamesDoGrupo([]);
        selecionarAba("general");
        abrirModal("groupModal");
    }


    function abrirEdicao(grupo, somenteVisualizacao = false) {
        state.grupoAtual = clonarDados(grupo);


        elementos.groupModalTitle.textContent = somenteVisualizacao
            ? "Visualizar Grupo de Exames"
            : "Editar Grupo de Exames";


        elementos.saveGroupLabel.textContent = somenteVisualizacao
            ? "Fechar"
            : "Salvar Alterações";


        preencherFormulario(grupo);
        renderizarExamesDoGrupo(grupo.exames || []);
        preencherAuditoria(grupo);
        selecionarAba("general");


        setFormularioSomenteLeitura(somenteVisualizacao);
        abrirModal("groupModal");
    }


    function preencherFormulario(grupo) {
        elementos.groupId.value = grupo.id || "";
        elementos.groupCode.value = grupo.codigo || "";
        elementos.groupName.value = grupo.nome || "";
        elementos.groupShortName.value = grupo.sigla || "";
        elementos.groupCategory.value = grupo.categoria || "";
        elementos.groupDescription.value = grupo.descricao || "";
        elementos.groupStatus.checked = grupo.status === "ATIVO";


        selecionarValores(elementos.groupSpecialties, grupo.especialidades || []);
        preencherCampo("generalPreparation", grupo.preparoGeral);
        preencherCampo("patientInstructions", grupo.orientacoesPaciente);
        preencherCampo("internalNotes", grupo.observacoesInternas);
        selecionarValores(elementos.acceptedAgreements, grupo.convenios || []);
        preencherCampo("priceTable", grupo.tabelaPreco);
        preencherCampo("tussCode", grupo.codigoTuss);
        preencherCampo("cbhpmCode", grupo.codigoCbhpm);
        preencherCampo("groupPrice", grupo.valor);
        preencherCampo("requiresScheduling", grupo.necessitaAgendamento, true);
        preencherCampo("requiresAuthorization", grupo.necessitaAutorizacao, true);
        preencherCampo("executionLocation", grupo.localRealizacao);
        preencherCampo("room", grupo.sala);
        preencherCampo("equipment", grupo.equipamento);
        preencherCampo("estimatedTime", grupo.tempoEstimado);
        preencherCampo("responsibleProfessional", grupo.profissionalResponsavel);
        preencherCampo("resultDeadline", grupo.prazoResultado);
    }


    function preencherCampo(id, valor, checkbox = false) {
        const campo = document.getElementById(id);


        if (!campo) {
            return;
        }


        if (checkbox) {
            campo.checked = Boolean(valor);
        } else {
            campo.value = valor || "";
        }
    }


    function selecionarValores(select, valores) {
        if (!select) {
            return;
        }


        [...select.options].forEach((option) => {
            option.selected = valores.includes(option.value);
        });
    }


    function setFormularioSomenteLeitura(somenteLeitura) {
        elementos.groupForm
            .querySelectorAll("input, select, textarea, button")
            .forEach((campo) => {
                if (campo.closest(".modal-header") || campo.closest(".modal-tabs")) {
                    return;
                }


                if (campo.dataset.closeModal) {
                    return;
                }


                campo.disabled = somenteLeitura;
            });
    }


    function selecionarAba(nome) {
        elementos.tabButtons.forEach((botao) => {
            const ativo = botao.dataset.tab === nome;


            botao.classList.toggle("is-active", ativo);
            botao.setAttribute("aria-selected", String(ativo));
        });


        elementos.tabPanels.forEach((painel) => {
            painel.classList.toggle("hidden", painel.dataset.panel !== nome);
        });
    }


    /* Exames do grupo */


    function renderizarExamesDoGrupo(itens) {
        const examesOrdenados = [...itens].sort((a, b) => a.ordem - b.ordem);


        elementos.groupExamsTableBody.innerHTML = "";
        elementos.modalExamCount.textContent = examesOrdenados.length;


        const vazio = examesOrdenados.length === 0;


        elementos.groupExamsEmpty.classList.toggle("hidden", !vazio);
        elementos.groupExamsTableWrapper.classList.toggle("hidden", vazio);


        examesOrdenados.forEach((item, indice) => {
            const exame = item.dados || obterExamePorId(item.exameId);


            if (!exame) {
                return;
            }


            const linha = document.createElement("tr");


            linha.innerHTML = `
                <td class="px-4 py-4 font-semibold text-slate-700">
                    ${indice + 1}
                </td>


                <td class="px-4 py-4 font-medium text-teal-700">
                    ${escaparHtml(exame.codigo)}
                </td>


                <td class="px-4 py-4">
                    <span class="font-semibold text-slate-800">
                        ${escaparHtml(exame.nome)}
                    </span>
                </td>


                <td class="px-4 py-4 text-slate-600">
                    ${escaparHtml(exame.tipo)}
                </td>


                <td class="px-4 py-4 text-slate-600">
                    ${escaparHtml(exame.material)}
                </td>


                <td class="px-4 py-4">
                    <span class="status-badge ${exame.status === "ATIVO"
                    ? "status-badge-active"
                    : "status-badge-inactive"
                }">
                        ${exame.status === "ATIVO" ? "Ativo" : "Inativo"}
                    </span>
                </td>


                <td class="px-4 py-4 text-right">
                    <div class="exam-order-actions justify-end">
                        <button type="button"
                            class="exam-order-button"
                            data-move-exam="up"
                            data-exam-id="${exame.id}"
                            aria-label="Mover ${escaparHtml(exame.nome)} para cima"
                            ${indice === 0 ? "disabled" : ""}>
                            ↑
                        </button>


                        <button type="button"
                            class="exam-order-button"
                            data-move-exam="down"
                            data-exam-id="${exame.id}"
                            aria-label="Mover ${escaparHtml(exame.nome)} para baixo"
                            ${indice === examesOrdenados.length - 1 ? "disabled" : ""}>
                            ↓
                        </button>


                        <button type="button"
                            class="exam-remove-button"
                            data-remove-exam="${exame.id}"
                            aria-label="Remover ${escaparHtml(exame.nome)}">
                            ×
                        </button>
                    </div>
                </td>
            `;


            elementos.groupExamsTableBody.appendChild(linha);
        });
    }


    function abrirModalExames() {
        state.examesSelecionados.clear();


        renderizarResultadosExames();
        atualizarBotaoAdicionarExames();
        abrirModal("examModal");
    }


    function obterFiltrosExames() {
        return {
            busca: normalizarTexto(elementos.searchExam.value),
            tipo: elementos.filterExamType.value,
            material: elementos.filterExamMaterial.value,
            status: elementos.filterExamStatus.value
        };
    }


    function renderizarResultadosExames() {
        const filtros = obterFiltrosExames();
        const grupo = state.grupoAtual;
        const idsAtuais = new Set(
            grupo?.exames?.map((item) => item.exameId) || []
        );


        const resultados = state.exames.filter((exame) => {
            const correspondeBusca =
                !filtros.busca ||
                normalizarTexto(
                    `${exame.codigo} ${exame.nome} ${exame.tipo}`
                ).includes(filtros.busca);


            const correspondeTipo =
                !filtros.tipo || exame.tipo === filtros.tipo;


            const correspondeMaterial =
                !filtros.material || exame.material === filtros.material;


            const correspondeStatus =
                !filtros.status || exame.status === filtros.status;


            return (
                correspondeBusca &&
                correspondeTipo &&
                correspondeMaterial &&
                correspondeStatus
            );
        });


        elementos.examResults.innerHTML = "";
        elementos.examResultsEmpty.classList.toggle(
            "hidden",
            resultados.length > 0
        );


        resultados.forEach((exame) => {
            const jaPertence = idsAtuais.has(exame.id);
            const selecionado = state.examesSelecionados.has(exame.id);


            const item = document.createElement("label");
            item.className = `exam-option flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition ${jaPertence ? "opacity-60" : ""
                }`;


            item.innerHTML = `
                <input type="checkbox"
                    class="exam-checkbox h-5 w-5 accent-teal-600"
                    data-select-exam="${exame.id}"
                    ${selecionado ? "checked" : ""}
                    ${jaPertence ? "disabled" : ""}>


                <span class="min-w-0 flex-1">
                    <span class="block truncate font-semibold text-slate-800">
                        ${escaparHtml(exame.nome)}
                    </span>


                    <span class="mt-1 block text-xs text-slate-500">
                        ${escaparHtml(exame.codigo)} ·
                        ${escaparHtml(exame.tipo)} ·
                        ${escaparHtml(exame.material)}
                    </span>
                </span>


                <span class="status-badge ${exame.status === "ATIVO"
                    ? "status-badge-active"
                    : "status-badge-inactive"
                }">
                    ${exame.status === "ATIVO" ? "Ativo" : "Inativo"}
                </span>
            `;


            elementos.examResults.appendChild(item);
        });
    }


    function atualizarBotaoAdicionarExames() {
        elementos.addSelectedExamsBtn.disabled =
            state.examesSelecionados.size === 0;
    }


    function adicionarExamesSelecionados() {
        if (!state.grupoAtual) {
            state.grupoAtual = {
                exames: []
            };
        }


        const examesAtuais = state.grupoAtual.exames || [];
        const idsAtuais = new Set(examesAtuais.map((item) => item.exameId));
        const maiorOrdem = Math.max(
            0,
            ...examesAtuais.map((item) => item.ordem)
        );


        let ordem = maiorOrdem;


        state.examesSelecionados.forEach((exameId) => {
            if (idsAtuais.has(exameId)) {
                return;
            }


            ordem += 1;
            examesAtuais.push({
                exameId,
                ordem
            });
        });


        state.grupoAtual.exames = examesAtuais;
        renderizarExamesDoGrupo(examesAtuais);
        fecharModal("examModal");
        selecionarAba("exams");


        mostrarToast("Exames adicionados ao grupo.", "success");
    }


    function removerExameDoGrupo(exameId) {
        if (!state.grupoAtual) {
            return;
        }


        state.grupoAtual.exames = (state.grupoAtual.exames || [])
            .filter((item) => item.exameId !== Number(exameId))
            .map((item, indice) => ({
                ...item,
                ordem: indice + 1
            }));


        renderizarExamesDoGrupo(state.grupoAtual.exames);
        mostrarToast("Exame removido do grupo.", "success");
    }


    function moverExame(exameId, direcao) {
        if (!state.grupoAtual) {
            return;
        }


        const itens = [...(state.grupoAtual.exames || [])]
            .sort((a, b) => a.ordem - b.ordem);


        const indiceAtual = itens.findIndex(
            (item) => item.exameId === Number(exameId)
        );


        const novoIndice =
            direcao === "up" ? indiceAtual - 1 : indiceAtual + 1;


        if (
            indiceAtual < 0 ||
            novoIndice < 0 ||
            novoIndice >= itens.length
        ) {
            return;
        }


        [itens[indiceAtual], itens[novoIndice]] = [
            itens[novoIndice],
            itens[indiceAtual]
        ];


        state.grupoAtual.exames = itens.map((item, indice) => ({
            ...item,
            ordem: indice + 1
        }));


        renderizarExamesDoGrupo(state.grupoAtual.exames);
    }


    /* Formulário */


    function coletarDadosFormulario() {
        const selecionar = (campo) =>
            [...campo.selectedOptions].map((option) => option.value);


        return {
            nome: elementos.groupName.value.trim(),
            sigla: elementos.groupShortName.value.trim().toUpperCase(),
            categoria: elementos.groupCategory.value,
            especialidades: selecionar(elementos.groupSpecialties),
            descricao: elementos.groupDescription.value.trim(),
            status: elementos.groupStatus.checked ? "ATIVO" : "INATIVO",
            exames: clonarDados(state.grupoAtual?.exames || []),
            preparoGeral: document.getElementById("generalPreparation").value.trim(),
            orientacoesPaciente: document.getElementById("patientInstructions").value.trim(),
            observacoesInternas: document.getElementById("internalNotes").value.trim(),
            convenios: selecionar(document.getElementById("acceptedAgreements")),
            tabelaPreco: document.getElementById("priceTable").value,
            codigoTuss: document.getElementById("tussCode").value.trim(),
            codigoCbhpm: document.getElementById("cbhpmCode").value.trim(),
            valor: document.getElementById("groupPrice").value,
            necessitaAgendamento: document.getElementById("requiresScheduling").checked,
            necessitaAutorizacao: document.getElementById("requiresAuthorization").checked,
            localRealizacao: document.getElementById("executionLocation").value,
            sala: document.getElementById("room").value.trim(),
            equipamento: document.getElementById("equipment").value.trim(),
            tempoEstimado: document.getElementById("estimatedTime").value,
            profissionalResponsavel: document.getElementById("responsibleProfessional").value,
            prazoResultado: document.getElementById("resultDeadline").value.trim()
        };
    }


    function validarFormulario(dados) {
        let valido = true;


        elementos.groupName.setAttribute("aria-invalid", "false");
        elementos.groupCategory.setAttribute("aria-invalid", "false");
        elementos.groupNameError.textContent = "";
        elementos.groupCategoryError.textContent = "";
        elementos.groupExamsError.textContent = "";


        if (!dados.nome) {
            elementos.groupName.setAttribute("aria-invalid", "true");
            elementos.groupNameError.textContent = "Este campo é obrigatório.";
            valido = false;
        }


        if (!dados.categoria) {
            elementos.groupCategory.setAttribute("aria-invalid", "true");
            elementos.groupCategoryError.textContent =
                "Este campo é obrigatório.";
            valido = false;
        }


        if (!dados.exames.length) {
            elementos.groupExamsError.textContent =
                "Adicione pelo menos um exame ao grupo.";
            valido = false;
        }


        if (!valido) {
            mostrarToast("Revise os campos obrigatórios.", "error");
        }


        return valido;
    }


    async function salvarGrupo(event) {
        event.preventDefault();


        if (elementos.saveGroupLabel.textContent === "Fechar") {
            fecharModal("groupModal");
            return;
        }


        const dados = coletarDadosFormulario();


        if (!validarFormulario(dados)) {
            return;
        }


        elementos.saveGroupBtn.disabled = true;


        try {
            if (state.grupoAtual?.id) {
                await atualizarGrupo(state.grupoAtual.id, dados);
                mostrarToast("Grupo atualizado com sucesso.", "success");
            } else {
                await criarGrupo(dados);
                mostrarToast("Grupo de exames criado com sucesso.", "success");
            }


            fecharModal("groupModal");
            state.paginaAtual = 1;
            renderizarTabela();
        } catch (erro) {
            mostrarToast("Não foi possível salvar o grupo.", "error");
        } finally {
            elementos.saveGroupBtn.disabled = false;
        }
    }


    /* Ações da tabela */


    function executarAcaoGrupo(acao, id) {
        const grupo = state.grupos.find((item) => item.id === Number(id));


        if (!grupo) {
            return;
        }


        switch (acao) {
            case "view":
                abrirEdicao(grupo, true);
                break;


            case "edit":
                abrirEdicao(grupo, false);
                break;


            case "duplicate":
                duplicarGrupo(grupo);
                break;


            case "toggle":
                confirmarAlteracaoStatus(grupo);
                break;


            case "delete":
                confirmarExclusao(grupo);
                break;


            default:
                break;
        }
    }


    function duplicarGrupo(grupo) {
        state.grupoAtual = {
            ...clonarDados(grupo),
            id: null,
            codigo: obterProximoCodigo(),
            nome: `${grupo.nome} - Cópia`,
            sigla: grupo.sigla ? `${grupo.sigla}2` : "",
            status: "ATIVO"
        };


        elementos.groupModalTitle.textContent = "Novo Grupo de Exames";
        elementos.saveGroupLabel.textContent = "Salvar Grupo";


        preencherFormulario(state.grupoAtual);
        renderizarExamesDoGrupo(state.grupoAtual.exames);
        setFormularioSomenteLeitura(false);
        selecionarAba("general");
        abrirModal("groupModal");
    }


    function confirmarExclusao(grupo) {
        elementos.confirmModalTitle.textContent = "Excluir Grupo de Exames?";
        elementos.confirmModalMessage.textContent =
            `O grupo "${grupo.nome}" será excluído. Essa ação não poderá ser desfeita.`;
        elementos.confirmActionBtn.textContent = "Excluir";
        elementos.confirmActionBtn.className =
            "inline-flex min-h-12 items-center justify-center rounded-xl bg-red-600 px-5 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2";


        state.acaoConfirmada = {
            tipo: "excluir",
            id: grupo.id
        };


        abrirModal("confirmModal");
    }


    function confirmarAlteracaoStatus(grupo) {
        const ativar = grupo.status === "INATIVO";


        elementos.confirmModalTitle.textContent = ativar
            ? "Ativar Grupo de Exames?"
            : "Inativar Grupo de Exames?";


        elementos.confirmModalMessage.textContent = ativar
            ? `Tem certeza que deseja ativar o grupo "${grupo.nome}"?`
            : `Tem certeza que deseja inativar o grupo "${grupo.nome}"?`;


        elementos.confirmActionBtn.textContent = ativar ? "Ativar" : "Inativar";
        elementos.confirmActionBtn.className = ativar
            ? "action-primary"
            : "inline-flex min-h-12 items-center justify-center rounded-xl bg-red-600 px-5 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2";


        state.acaoConfirmada = {
            tipo: "status",
            id: grupo.id
        };


        abrirModal("confirmModal");
    }


    async function executarConfirmacao() {
        if (!state.acaoConfirmada) {
            return;
        }


        const { tipo, id } = state.acaoConfirmada;
        const grupo = state.grupos.find((item) => item.id === id);


        try {
            if (tipo === "excluir") {
                await excluirGrupo(id);
                mostrarToast("Grupo excluído com sucesso.", "success");
            }


            if (tipo === "status" && grupo) {
                await atualizarGrupo(id, {
                    ...grupo,
                    status: grupo.status === "ATIVO" ? "INATIVO" : "ATIVO"
                });


                mostrarToast(
                    grupo.status === "ATIVO"
                        ? "Grupo inativado com sucesso."
                        : "Grupo ativado com sucesso.",
                    "success"
                );
            }


            fecharModal("confirmModal");
            renderizarTabela();
        } catch (erro) {
            mostrarToast("Não foi possível concluir a ação.", "error");
        } finally {
            state.acaoConfirmada = null;
        }
    }


    /* Auditoria */


    function preencherAuditoria(grupo) {
        elementos.auditCreatedBy.textContent = grupo.criadoPor || "—";
        elementos.auditCreatedAt.textContent = grupo.criadoEm || "—";
        elementos.auditUpdatedAt.textContent = grupo.atualizadoEm || "—";
        elementos.auditUpdatedBy.textContent = grupo.alteradoPor || "—";


        elementos.auditHistory.innerHTML = "";


        (grupo.historico || []).forEach((evento, indice) => {
            const item = document.createElement("li");
            item.className = "relative";


            item.innerHTML = `
                <span class="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white ${indice === 0 ? "bg-teal-600" : "bg-slate-400"
                }"></span>


                <time class="text-xs text-slate-500">
                    ${escaparHtml(evento.data)}
                </time>


                <p class="mt-1 text-sm font-medium text-slate-800">
                    ${escaparHtml(evento.usuario)}:
                    ${escaparHtml(evento.descricao)}
                </p>
            `;


            elementos.auditHistory.appendChild(item);
        });
    }


    /* Toasts */


    function mostrarToast(mensagem, tipo = "info", titulo = "") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${tipo}`;


        const titulos = {
            success: "Sucesso",
            error: "Erro",
            warning: "Atenção",
            info: "Informação"
        };


        const icones = {
            success: "✓",
            error: "!",
            warning: "!",
            info: "i"
        };


        toast.innerHTML = `
            <span class="toast-icon font-bold text-teal-700">
                ${icones[tipo] || icones.info}
            </span>


            <div class="toast-content">
                <p class="toast-title">${escaparHtml(titulo || titulos[tipo])}</p>
                <p class="toast-message">${escaparHtml(mensagem)}</p>
            </div>


            <button type="button" class="toast-close" aria-label="Fechar notificação">
                ×
            </button>
        `;


        elementos.toastContainer.appendChild(toast);


        const remover = () => {
            toast.classList.add("is-leaving");
            window.setTimeout(() => toast.remove(), 180);
        };


        toast.querySelector(".toast-close").addEventListener("click", remover);
        window.setTimeout(remover, 4500);
    }


    // ============================================
    // Menu de ações da tabela (Smart Positioning)
    // ============================================

    let activeMenu = null;

    function openRowMenu(button) {
        const wrapper = button.closest('.row-action-wrapper');
        const menu = wrapper.querySelector('.row-action-list');

        // Fecha menu anterior se existir
        if (activeMenu && activeMenu !== menu) {
            closeRowMenu(activeMenu);
        }

        // Calcula posição inteligente
        const rect = button.getBoundingClientRect();
        const menuHeight = 220; // altura estimada do menu (5 itens ~44px cada)
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        menu.classList.remove('drop-down', 'drop-up');

        if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
            menu.classList.add('drop-up');
        } else {
            menu.classList.add('drop-down');
        }

        // Abre o menu
        menu.classList.remove('hidden');
        // Força reflow para transição
        menu.offsetHeight;
        menu.classList.add('is-visible');
        button.setAttribute('aria-expanded', 'true');
        activeMenu = menu;
    }

    function closeRowMenu(menu) {
        if (!menu) return;
        const button = menu.closest('.row-action-wrapper').querySelector('.row-action-menu');
        menu.classList.remove('is-visible');
        button.removeAttribute('aria-expanded');

        setTimeout(() => {
            menu.classList.add('hidden');
        }, 180);

        if (activeMenu === menu) {
            activeMenu = null;
        }
    }

    function toggleRowMenu(button) {
        const wrapper = button.closest('.row-action-wrapper');
        const menu = wrapper.querySelector('.row-action-list');
        const isOpen = menu.classList.contains('is-visible');

        if (isOpen) {
            closeRowMenu(menu);
        } else {
            openRowMenu(button);
        }
    }

    // Listener global de clique (click outside)
    document.addEventListener('click', (e) => {
        if (!activeMenu) return;

        const isInsideMenu = activeMenu.contains(e.target);
        const isButton = e.target.closest('.row-action-menu');

        if (!isInsideMenu && !isButton) {
            closeRowMenu(activeMenu);
        }
    });

    // Listener de teclado (Escape fecha o menu)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeMenu) {
            closeRowMenu(activeMenu);
        }
    });


    /* Eventos */


    function configurarEventos() {
        elementos.newGroupBtn.addEventListener("click", configurarNovoGrupo);
        elementos.emptyCreateBtn.addEventListener("click", configurarNovoGrupo);


        [
            elementos.searchGroup,
            elementos.filterCategory,
            elementos.filterSpecialty,
            elementos.filterStatus
        ].forEach((campo) => {
            campo.addEventListener("input", () => {
                state.paginaAtual = 1;
                renderizarTabela();
            });


            campo.addEventListener("change", () => {
                state.paginaAtual = 1;
                renderizarTabela();
            });
        });


        elementos.clearFiltersBtn.addEventListener("click", limparFiltros);


        elementos.previousPageBtn.addEventListener("click", () => {
            if (state.paginaAtual > 1) {
                state.paginaAtual -= 1;
                renderizarTabela();
            }
        });


        elementos.nextPageBtn.addEventListener("click", () => {
            const total = filtrarGrupos().length;
            const totalPaginas = Math.ceil(total / state.itensPorPagina);


            if (state.paginaAtual < totalPaginas) {
                state.paginaAtual += 1;
                renderizarTabela();
            }
        });


        elementos.groupForm.addEventListener("submit", salvarGrupo);


        elementos.addExamBtn.addEventListener("click", abrirModalExames);
        elementos.addSelectedExamsBtn.addEventListener(
            "click",
            adicionarExamesSelecionados
        );


        [
            elementos.searchExam,
            elementos.filterExamType,
            elementos.filterExamMaterial,
            elementos.filterExamStatus
        ].forEach((campo) => {
            campo.addEventListener("input", renderizarResultadosExames);
            campo.addEventListener("change", renderizarResultadosExames);
        });


        elementos.confirmActionBtn.addEventListener(
            "click",
            executarConfirmacao
        );


        elementos.retryGroupsBtn.addEventListener("click", inicializar);


        elementos.tabButtons.forEach((botao) => {
            botao.addEventListener("click", () => {
                selecionarAba(botao.dataset.tab);
            });
        });


        elementos.closeButtons.forEach((botao) => {
            botao.addEventListener("click", () => {
                fecharModal(botao.dataset.closeModal);
            });
        });


        document.addEventListener("click", (event) => {
            const menuButton = event.target.closest(".row-action-menu");

            if (menuButton) {
                event.stopPropagation();
                toggleRowMenu(menuButton);
                return;
            }

            const actionButton = event.target.closest("[data-action]");

            if (actionButton) {
                const linha = actionButton.closest(".group-row");
                const id = linha?.dataset.id;

                if (id) {
                    executarAcaoGrupo(actionButton.dataset.action, id);
                    closeRowMenu(activeMenu);
                }
            }

            const removeButton = event.target.closest("[data-remove-exam]");

            if (removeButton) {
                removerExameDoGrupo(removeButton.dataset.removeExam);
            }

            const moveButton = event.target.closest("[data-move-exam]");

            if (moveButton) {
                moverExame(
                    moveButton.dataset.examId,
                    moveButton.dataset.moveExam
                );
            }

            const checkbox = event.target.closest("[data-select-exam]");

            if (checkbox) {
                const exameId = Number(checkbox.dataset.selectExam);

                if (checkbox.checked) {
                    state.examesSelecionados.add(exameId);
                } else {
                    state.examesSelecionados.delete(exameId);
                }

                atualizarBotaoAdicionarExames();
            }
        });


        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                document.querySelectorAll(".modal:not(.hidden)").forEach((modal) => {
                    fecharModal(modal.id);
                });
            }
        });
    }


    function simularCarregamento(callback) {
        elementos.groupsSkeleton.classList.remove("hidden");
        elementos.groupsTableWrapper.classList.add("hidden");
        elementos.groupsEmptyState.classList.add("hidden");
        elementos.groupsErrorState.classList.add("hidden");


        window.setTimeout(() => {
            elementos.groupsSkeleton.classList.add("hidden");
            callback();
        }, 350);
    }


    async function inicializar() {
        cacheElements();


        state.exames = clonarDados(mockExames);
        state.grupos = clonarDados(mockGrupos);


        configurarEventos();


        simularCarregamento(() => {
            renderizarTabela();
        });
    }


    inicializar();
})();
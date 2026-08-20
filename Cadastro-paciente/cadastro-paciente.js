"use strict";

(() => {
    const EDITABLE_SELECTOR = ".campo-edita";
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const DEFAULT_PHOTO =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    const ALLOWED_EXTENSIONS = new Set([
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "doc",
        "docx"
    ]);

    const state = {
        mode: "initial",
        nextId: 1,
        stream: null,
        history: [],
        attachments: new Map(),
        snapshot: null,
        cepController: null,
        modalTriggers: new Map(),
        signatureContext: null,
        isDrawing: false
    };

    const byId = (id) => document.getElementById(id);

    const queryAll = (selector, parent = document) => {
        return [...parent.querySelectorAll(selector)];
    };

    document.addEventListener("DOMContentLoaded", initialize);

    function initialize() {
        initializeClock();
        initializeMasks();
        initializeTextTransforms();
        initializeTabs();
        initializeModalEvents();
        initializeSignature();
        initializeAttachments();
        initializeFieldEvents();
        setInitialState();
    }

    /* ==========================================================
       ESTADOS
    ========================================================== */

    function setInitialState() {
        state.mode = "initial";

        setEditableState(false);

        setButtons({
            btnNovo: false,
            btnGravar: true,
            btnEditar: true,
            btnAnterior: true,
            btnProximo: true,
            btnBuscar: false,
            btnExcluir: true,
            btnCancelar: true,
            btnAnexo: true,
            btnImprimir: true,
            btnHistorico: true
        });

        setStatus(
            "Clique em Novo para iniciar um cadastro ou em Buscar para localizar um paciente."
        );
    }

    function setNewState() {
        state.mode = "new";

        setEditableState(true);

        setButtons({
            btnNovo: true,
            btnGravar: false,
            btnEditar: true,
            btnAnterior: true,
            btnProximo: true,
            btnBuscar: true,
            btnExcluir: true,
            btnCancelar: false,
            btnAnexo: false,
            btnImprimir: true,
            btnHistorico: true
        });

        setFieldValue(
            "pacId",
            String(state.nextId).padStart(5, "0")
        );

        setFieldValue(
            "pacDataCad",
            nowForDateTimeInput()
        );

        setFieldValue("pacUserCad", "ADMIN");
        setFieldValue("pacStatus", "A");

        setStatus("Novo cadastro iniciado.");

        window.setTimeout(() => {
            byId("pacNome")?.focus();
        }, 0);
    }

    function setSavedState({ isNewRecord = false, addLog = true } = {}) {
        state.mode = "saved";

        setEditableState(false);

        setButtons({
            btnNovo: false,
            btnGravar: true,
            btnEditar: false,
            btnAnterior: false,
            btnProximo: false,
            btnBuscar: false,
            btnExcluir: false,
            btnCancelar: true,
            btnAnexo: true,
            btnImprimir: false,
            btnHistorico: false
        });

        if (addLog) {
            if (isNewRecord) {
                state.nextId += 1;
                addHistory("Paciente cadastrado");
            } else {
                addHistory("Cadastro atualizado");
            }
        }

        state.snapshot = createSnapshot();

        setStatus("Cadastro salvo com sucesso.");
    }

    function setEditingState() {
        if (state.mode !== "saved") {
            return;
        }

        state.mode = "editing";
        state.snapshot = createSnapshot();

        setEditableState(true);

        setButtons({
            btnNovo: true,
            btnGravar: false,
            btnEditar: true,
            btnAnterior: true,
            btnProximo: true,
            btnBuscar: true,
            btnExcluir: true,
            btnCancelar: false,
            btnAnexo: false,
            btnImprimir: true,
            btnHistorico: true
        });

        addHistory("Edição iniciada");
        setStatus("Modo de edição ativo.");
    }

    function setEditableState(isEditable) {
        queryAll(EDITABLE_SELECTOR).forEach((element) => {
            element.disabled = !isEditable;
        });

        const attachmentInput = byId("anexoInput");
        const dropZone = byId("dropZone");
        const signatureCanvas = byId("assinaturaCanvas");

        if (attachmentInput) {
            attachmentInput.disabled = !isEditable;
        }

        if (dropZone) {
            dropZone.setAttribute(
                "aria-disabled",
                String(!isEditable)
            );

            dropZone.classList.toggle(
                "is-disabled",
                !isEditable
            );
        }

        if (signatureCanvas) {
            signatureCanvas.dataset.enabled = String(isEditable);

            signatureCanvas.setAttribute(
                "aria-disabled",
                String(!isEditable)
            );
        }
    }

    function setButtons(buttons) {
        Object.entries(buttons).forEach(([id, disabled]) => {
            const button = byId(id);

            if (button) {
                button.disabled = disabled;
            }
        });
    }

    /* ==========================================================
       TOOLBAR
    ========================================================== */

    function actionNew() {
        const isEditing =
            state.mode === "new" ||
            state.mode === "editing";

        if (
            isEditing &&
            !window.confirm(
                "Deseja descartar as alterações e iniciar um novo cadastro?"
            )
        ) {
            return;
        }

        clearForm();
        setNewState();
    }

    function actionSave() {
        if (!validateForm()) {
            return;
        }

        const isNewRecord = state.mode === "new";

        setFieldValue(
            "pacUltAtu",
            nowForDateTimeInput()
        );

        setSavedState({ isNewRecord });

        window.alert("Paciente gravado com sucesso.");
    }

    function actionEdit() {
        setEditingState();
    }

    function actionDelete() {
        if (state.mode !== "saved") {
            return;
        }

        const confirmed = window.confirm(
            "Deseja realmente excluir este paciente?"
        );

        if (!confirmed) {
            return;
        }

        addHistory("Paciente excluído");
        clearForm();
        setInitialState();

        window.alert("Paciente excluído.");
    }

    function actionCancel() {
        if (state.mode === "new") {
            if (!window.confirm("Cancelar o cadastro atual?")) {
                return;
            }

            clearForm();
            setInitialState();
            return;
        }

        if (state.mode === "editing") {
            if (!window.confirm("Descartar as alterações realizadas?")) {
                return;
            }

            restoreSnapshot(state.snapshot);
            setSavedState({ addLog: false });

            setStatus("Alterações canceladas.");
            return;
        }

        clearForm();
        setInitialState();
    }

    function actionSearch() {
        openModal("modalBusca", byId("btnBuscar"));

        window.setTimeout(() => {
            byId("buscaTermo")?.focus();
        }, 0);
    }

    function actionPrevious() {
        setStatus(
            "A navegação de registros depende da integração com a base de dados."
        );
    }

    function actionNext() {
        setStatus(
            "A navegação de registros depende da integração com a base de dados."
        );
    }

    function actionAttachment() {
        switchTab("tab8");
    }

    function actionPrint() {
        window.print();
    }

    function actionHistory() {
        renderHistory();
        openModal("modalHistorico", byId("btnHistorico"));
    }

    /* ==========================================================
       VALIDAÇÃO
    ========================================================== */

    function validateForm() {
        clearInvalidFields();

        const requiredFields = [
            {
                field: byId("pacNome"),
                message: "Preencha o nome completo."
            },
            {
                field: byId("pacCpf"),
                message: "Preencha o CPF corretamente."
            },
            {
                field: byId("pacNascimento"),
                message: "Preencha a data de nascimento."
            }
        ];

        for (const item of requiredFields) {
            if (!item.field?.value.trim()) {
                invalidateField(item.field, item.message);
                return false;
            }
        }

        const cpf = byId("pacCpf");

        if (!validateCpf(cpf.value)) {
            invalidateField(cpf, "CPF inválido.");
            return false;
        }

        const birthDate = new Date(
            `${byId("pacNascimento").value}T00:00:00`
        );

        if (
            Number.isNaN(birthDate.getTime()) ||
            birthDate > new Date()
        ) {
            invalidateField(
                byId("pacNascimento"),
                "A data de nascimento não pode estar no futuro."
            );

            return false;
        }

        return true;
    }

    function invalidateField(field, message) {
        if (!field) {
            return;
        }

        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
        field.focus();

        setStatus(message);
        window.alert(message);
    }

    function clearInvalidFields() {
        queryAll(".is-invalid").forEach((field) => {
            field.classList.remove("is-invalid");
            field.removeAttribute("aria-invalid");
        });
    }

    function validateCpfField(field) {
        if (!field?.value || validateCpf(field.value)) {
            field?.classList.remove("is-invalid");
            field?.removeAttribute("aria-invalid");

            return true;
        }

        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");

        setStatus("CPF inválido.");

        return false;
    }

    function validateCpf(cpf) {
        const digits = String(cpf).replace(/\D/g, "");

        if (
            digits.length !== 11 ||
            /^(\d)\1{10}$/.test(digits)
        ) {
            return false;
        }

        const getCheckDigit = (length) => {
            const sum = [...digits.slice(0, length)].reduce(
                (total, digit, index) => {
                    return total + Number(digit) * (length + 1 - index);
                },
                0
            );

            const result = (sum * 10) % 11;

            return result === 10 ? 0 : result;
        };

        return (
            getCheckDigit(9) === Number(digits[9]) &&
            getCheckDigit(10) === Number(digits[10])
        );
    }

    /* ==========================================================
       FORMULÁRIO E SNAPSHOT
    ========================================================== */

    function clearForm() {
        byId("pacienteForm")?.reset();

        clearInvalidFields();
        clearSignature();

        state.attachments.forEach((attachment) => {
            if (attachment.url) {
                URL.revokeObjectURL(attachment.url);
            }
        });

        state.attachments.clear();
        renderAttachments();

        const photo = byId("fotoPreview");

        if (photo) {
            photo.src = DEFAULT_PHOTO;
        }

        [
            "pacId",
            "pacIdade",
            "pacDataCad",
            "pacUltAtu"
        ].forEach((id) => {
            setFieldValue(id, "");
        });

        setFieldValue("pacNacionalidade", "BRASILEIRO");
        setFieldValue("pacPais", "BRASIL");
        setFieldValue("pacUserCad", "ADMIN");
        setFieldValue("pacStatus", "A");
    }

    function createSnapshot() {
        const fields = queryAll(
            "#pacienteForm input, #pacienteForm select, #pacienteForm textarea"
        ).map((field) => ({
            id: field.id,
            value: field.value,
            checked: field.checked
        }));

        return {
            fields,
            photo: byId("fotoPreview")?.src || DEFAULT_PHOTO,
            signature:
                byId("assinaturaCanvas")?.toDataURL("image/png") || null,
            attachments: [...state.attachments.values()].map((item) => ({
                ...item
            }))
        };
    }

    function restoreSnapshot(snapshot) {
        if (!snapshot) {
            return;
        }

        snapshot.fields.forEach(({ id, value, checked }) => {
            const field = byId(id);

            if (!field) {
                return;
            }

            field.value = value;
            field.checked = checked;
        });

        const photo = byId("fotoPreview");

        if (photo) {
            photo.src = snapshot.photo;
        }

        restoreSignature(snapshot.signature);

        state.attachments.clear();

        snapshot.attachments.forEach((attachment) => {
            state.attachments.set(
                attachment.id,
                attachment
            );
        });

        renderAttachments();
    }

    /* ==========================================================
       MÁSCARAS E TRANSFORMAÇÕES
    ========================================================== */

    function initializeMasks() {
        const masks = {
            pacCpf: "cpf",
            pacRg: "rg",
            pacTel1: "phone",
            pacTel2: "phone",
            pacWhats: "phone",
            pacRespTel: "phone",
            pacRespWhats: "phone",
            pacCep: "cep",
            pacTitularCpf: "cpf"
        };

        Object.entries(masks).forEach(([id, type]) => {
            byId(id)?.addEventListener("input", (event) => {
                applyMask(event.target, type);
            });
        });
    }

    function applyMask(input, type) {
        let value = input.value.replace(/\D/g, "");

        if (type === "cpf") {
            value = value
                .slice(0, 11)
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }

        if (type === "rg") {
            value = value
                .slice(0, 9)
                .replace(/(\d{2})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d)/, "$1.$2")
                .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        }

        if (type === "phone") {
            value = value.slice(0, 11);

            value = value.length > 10
                ? value.replace(
                    /(\d{2})(\d{5})(\d{0,4})/,
                    "($1) $2-$3"
                )
                : value.replace(
                    /(\d{2})(\d{0,4})(\d{0,4})/,
                    "($1) $2-$3"
                );

            value = value.replace(/-$/, "");
        }

        if (type === "cep") {
            value = value
                .slice(0, 8)
                .replace(/(\d{5})(\d)/, "$1-$2");
        }

        input.value = value;
    }

    function initializeTextTransforms() {
        const uppercaseFields = [
            "pacNome",
            "pacNacionalidade",
            "pacProfissao",
            "pacRespNome",
            "pacRespParentesco",
            "pacEndereco",
            "pacBairro",
            "pacCidade",
            "pacTitular",
            "pacPlano"
        ];

        uppercaseFields.forEach((id) => {
            byId(id)?.addEventListener("input", (event) => {
                event.target.value =
                    event.target.value.toLocaleUpperCase("pt-BR");
            });
        });

        byId("pacEmail")?.addEventListener("input", (event) => {
            event.target.value = event.target.value.toLowerCase();
        });
    }

    /* ==========================================================
       CEP
    ========================================================== */

    async function searchCep() {
        const cepInput = byId("pacCep");
        const cep = cepInput?.value.replace(/\D/g, "");

        if (!cep || cep.length !== 8) {
            return;
        }

        state.cepController?.abort();
        state.cepController = new AbortController();

        setStatus("Buscando endereço pelo CEP...");

        try {
            const response = await fetch(
                `https://viacep.com.br/ws/${cep}/json/`,
                {
                    signal: state.cepController.signal,
                    headers: {
                        Accept: "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Falha na consulta do CEP."
                );
            }

            const data = await response.json();

            if (data.erro) {
                throw new Error("CEP não encontrado.");
            }

            setFieldValue(
                "pacEndereco",
                String(data.logradouro || "").toUpperCase()
            );

            setFieldValue(
                "pacBairro",
                String(data.bairro || "").toUpperCase()
            );

            setFieldValue(
                "pacCidade",
                String(data.localidade || "").toUpperCase()
            );

            setFieldValue(
                "pacEstado",
                String(data.uf || "").toUpperCase()
            );

            setFieldValue("pacPais", "BRASIL");

            byId("pacNumero")?.focus();

            setStatus(
                "Endereço preenchido a partir do CEP."
            );
        } catch (error) {
            if (error.name === "AbortError") {
                return;
            }

            const message =
                error.message ||
                "Não foi possível buscar o CEP.";

            setStatus(message);
            window.alert(message);
        } finally {
            state.cepController = null;
        }
    }

    /* ==========================================================
       IDADE
    ========================================================== */

    function calculateAge() {
        const birthValue = byId("pacNascimento")?.value;
        const output = byId("pacIdade");

        if (!birthValue || !output) {
            return;
        }

        const [year, month, day] = birthValue
            .split("-")
            .map(Number);

        const birthDate = new Date(
            year,
            month - 1,
            day
        );

        const today = new Date();

        if (
            Number.isNaN(birthDate.getTime()) ||
            birthDate > today
        ) {
            output.value = "";
            return;
        }

        let years =
            today.getFullYear() - birthDate.getFullYear();

        let months =
            today.getMonth() - birthDate.getMonth();

        let days =
            today.getDate() - birthDate.getDate();

        if (days < 0) {
            months -= 1;

            days += new Date(
                today.getFullYear(),
                today.getMonth(),
                0
            ).getDate();
        }

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        output.value =
            `${years} Anos ` +
            `${String(months).padStart(2, "0")} Meses ` +
            `${String(days).padStart(2, "0")} Dias`;
    }

    /* ==========================================================
       ABAS
    ========================================================== */

    function initializeTabs() {
        const tabs = queryAll(".tab-btn[data-tab]");

        tabs.forEach((tab, index) => {
            tab.addEventListener("keydown", (event) => {
                const allowedKeys = [
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End"
                ];

                if (!allowedKeys.includes(event.key)) {
                    return;
                }

                event.preventDefault();

                let nextIndex = index;

                if (event.key === "ArrowRight") {
                    nextIndex = (index + 1) % tabs.length;
                }

                if (event.key === "ArrowLeft") {
                    nextIndex =
                        (index - 1 + tabs.length) % tabs.length;
                }

                if (event.key === "Home") {
                    nextIndex = 0;
                }

                if (event.key === "End") {
                    nextIndex = tabs.length - 1;
                }

                tabs[nextIndex].focus();
                switchTab(tabs[nextIndex].dataset.tab);
            });
        });

        const activeTab =
            tabs.find((tab) =>
                tab.classList.contains("active")
            )?.dataset.tab || "tab1";

        switchTab(activeTab);
    }

    function switchTab(tabId) {
        const targetPanel = byId(tabId);

        const targetTab = queryAll(".tab-btn[data-tab]")
            .find((tab) => tab.dataset.tab === tabId);

        if (!targetPanel || !targetTab) {
            return;
        }

        queryAll(".tab-btn[data-tab]").forEach((tab) => {
            const isActive = tab === targetTab;

            tab.classList.toggle("active", isActive);
            tab.setAttribute(
                "aria-selected",
                String(isActive)
            );

            tab.tabIndex = isActive ? 0 : -1;
        });

        queryAll('.tab-content[role="tabpanel"]').forEach(
            (panel) => {
                const isActive = panel === targetPanel;

                panel.classList.toggle("active", isActive);
                panel.hidden = !isActive;
            }
        );
    }

    /* ==========================================================
       WEBCAM
    ========================================================== */

    async function openWebcam() {
        if (!["new", "editing"].includes(state.mode)) {
            const message =
                "Clique em Novo ou Editar antes de capturar a foto do paciente.";

            setStatus(message);
            window.alert(message);

            return;
        }

        const modal = byId("modalWebcam");
        const video = byId("webcamVideo");

        if (!modal || !video) {
            window.alert(
                "Não foi possível localizar os elementos da câmera."
            );

            return;
        }

        if (!window.isSecureContext) {
            window.alert(
                "A câmera funciona somente em HTTPS ou localhost. " +
                "Não teste o sistema usando file:// ou um IP com HTTP."
            );

            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            window.alert(
                "Este navegador não possui suporte à câmera."
            );

            return;
        }

        closeWebcam(false);

        try {
            openModal(
                "modalWebcam",
                byId("btnAbrirWebcam")
            );

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        facingMode: {
                            ideal: "user"
                        },
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        }
                    }
                });

            state.stream = stream;

            video.muted = true;
            video.srcObject = stream;

            await waitForVideoReady(video);
            await video.play();

            setStatus(
                "Câmera pronta para capturar a foto."
            );
        } catch (error) {
            closeWebcam(false);

            const errorMessages = {
                NotAllowedError:
                    "Permissão da câmera negada. Autorize a câmera nas configurações do navegador.",
                NotFoundError:
                    "Nenhuma câmera foi encontrada neste dispositivo.",
                NotReadableError:
                    "A câmera está sendo usada por outro aplicativo, navegador ou aba.",
                OverconstrainedError:
                    "A câmera disponível não atende aos requisitos solicitados.",
                SecurityError:
                    "O navegador bloqueou o acesso à câmera por segurança."
            };

            const message =
                errorMessages[error.name] ||
                "Não foi possível acessar a câmera. Tente novamente.";

            setStatus(message);
            window.alert(message);
        }
    }

    function waitForVideoReady(video) {
        if (
            video.readyState >=
            HTMLMediaElement.HAVE_METADATA
        ) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                reject(
                    new Error(
                        "Tempo esgotado ao iniciar a câmera."
                    )
                );
            }, 10000);

            video.addEventListener(
                "loadedmetadata",
                () => {
                    window.clearTimeout(timeout);
                    resolve();
                },
                { once: true }
            );

            video.addEventListener(
                "error",
                () => {
                    window.clearTimeout(timeout);

                    reject(
                        new Error(
                            "Erro ao carregar o vídeo da câmera."
                        )
                    );
                },
                { once: true }
            );
        });
    }

    function capturePhoto() {
        const video = byId("webcamVideo");
        const canvas = byId("webcamCanvas");
        const photoPreview = byId("fotoPreview");

        if (!video || !canvas || !photoPreview) {
            window.alert(
                "Não foi possível preparar a captura da foto."
            );

            return;
        }

        if (
            video.readyState <
            HTMLMediaElement.HAVE_CURRENT_DATA
        ) {
            window.alert(
                "A câmera ainda não está pronta. Aguarde alguns segundos e tente novamente."
            );

            return;
        }

        if (!video.videoWidth || !video.videoHeight) {
            window.alert(
                "Não foi possível obter a imagem da câmera."
            );

            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");

        if (!context) {
            window.alert(
                "Não foi possível processar a foto capturada."
            );

            return;
        }

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        photoPreview.src = canvas.toDataURL(
            "image/jpeg",
            0.85
        );

        closeWebcam();
        setStatus("Foto capturada com sucesso.");
    }

    function closeWebcam(restoreFocus = true) {
        const modal = byId("modalWebcam");
        const video = byId("webcamVideo");
        const trigger = byId("btnAbrirWebcam");

        state.stream?.getTracks().forEach((track) => {
            track.stop();
        });

        state.stream = null;

        if (video) {
            video.pause();
            video.srcObject = null;
        }

        if (modal) {
            modal.classList.remove("active");
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");
        }

        if (restoreFocus) {
            trigger?.focus();
        }
    }

    /* ==========================================================
       ASSINATURA
    ========================================================== */

    function initializeSignature() {
        const canvas = byId("assinaturaCanvas");

        if (!canvas) {
            return;
        }

        state.signatureContext = canvas.getContext("2d");

        state.signatureContext.strokeStyle = "#172033";
        state.signatureContext.lineWidth = 2;
        state.signatureContext.lineCap = "round";

        const getPoint = (event) => {
            const rect = canvas.getBoundingClientRect();

            return {
                x:
                    (event.clientX - rect.left) *
                    (canvas.width / rect.width),
                y:
                    (event.clientY - rect.top) *
                    (canvas.height / rect.height)
            };
        };

        canvas.addEventListener("pointerdown", (event) => {
            if (canvas.dataset.enabled !== "true") {
                return;
            }

            state.isDrawing = true;

            canvas.setPointerCapture(event.pointerId);

            const point = getPoint(event);

            state.signatureContext.beginPath();
            state.signatureContext.moveTo(point.x, point.y);
        });

        canvas.addEventListener("pointermove", (event) => {
            if (!state.isDrawing) {
                return;
            }

            const point = getPoint(event);

            state.signatureContext.lineTo(point.x, point.y);
            state.signatureContext.stroke();
        });

        [
            "pointerup",
            "pointerleave",
            "pointercancel"
        ].forEach((eventName) => {
            canvas.addEventListener(eventName, () => {
                state.isDrawing = false;
            });
        });
    }

    function clearSignature() {
        const canvas = byId("assinaturaCanvas");

        if (canvas && state.signatureContext) {
            state.signatureContext.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );
        }
    }

    function saveSignature() {
        if (!["new", "editing"].includes(state.mode)) {
            setStatus(
                "Inicie ou edite um cadastro antes de salvar a assinatura."
            );

            return;
        }

        setStatus(
            "Assinatura registrada para envio junto ao cadastro."
        );
    }

    function restoreSignature(dataUrl) {
        clearSignature();

        if (!dataUrl || !state.signatureContext) {
            return;
        }

        const image = new Image();

        image.onload = () => {
            state.signatureContext.drawImage(
                image,
                0,
                0
            );
        };

        image.src = dataUrl;
    }

    /* ==========================================================
       ANEXOS
    ========================================================== */

    function initializeAttachments() {
        const dropZone = byId("dropZone");
        const input = byId("anexoInput");

        if (!dropZone || !input) {
            return;
        }

        dropZone.addEventListener("click", (event) => {
            if (
                event.target.closest("input") ||
                input.disabled
            ) {
                return;
            }

            input.click();
        });

        dropZone.addEventListener("dragover", (event) => {
            if (input.disabled) {
                return;
            }

            event.preventDefault();
            dropZone.classList.add("dragover");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("dragover");
        });

        dropZone.addEventListener("drop", (event) => {
            event.preventDefault();
            dropZone.classList.remove("dragover");

            if (!input.disabled) {
                processFiles(event.dataTransfer.files);
            }
        });

        input.addEventListener("change", (event) => {
            processFiles(event.target.files);
            input.value = "";
        });
    }

    function processFiles(fileList) {
        const files = [...fileList];

        if (!files.length) {
            return;
        }

        const invalidFiles = [];

        files.forEach((file) => {
            const extension =
                file.name
                    .split(".")
                    .pop()
                    ?.toLowerCase() || "";

            if (
                !ALLOWED_EXTENSIONS.has(extension) ||
                file.size > MAX_FILE_SIZE ||
                file.size === 0
            ) {
                invalidFiles.push(file.name);
                return;
            }

            const id =
                crypto.randomUUID?.() ||
                `${Date.now()}-${Math.random()}`;

            state.attachments.set(id, {
                id,
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                url: URL.createObjectURL(file)
            });
        });

        renderAttachments();

        if (invalidFiles.length) {
            const message =
                `Arquivo inválido ou maior que 10 MB: ` +
                invalidFiles.join(", ");

            setStatus(message);
            window.alert(message);
        }
    }

    function renderAttachments() {
        const list = byId("anexoLista");

        if (!list) {
            return;
        }

        list.replaceChildren();

        if (!state.attachments.size) {
            const empty = document.createElement("p");

            empty.className = "anexo-vazio";
            empty.textContent = "Nenhum documento anexado.";

            list.append(empty);
            return;
        }

        state.attachments.forEach((attachment) => {
            const item = document.createElement("article");
            const info = document.createElement("div");
            const icon = document.createElement("i");
            const text = document.createElement("div");
            const name = document.createElement("div");
            const size = document.createElement("div");
            const actions = document.createElement("div");

            item.className = "anexo-item";
            info.className = "anexo-item-info";
            text.className = "anexo-item-text";
            name.className = "anexo-item-nome";
            size.className = "anexo-item-size";
            actions.className = "anexo-item-actions";

            icon.className =
                `fa-solid ${getFileIcon(attachment.name)}`;

            icon.setAttribute("aria-hidden", "true");

            name.textContent = attachment.name;
            size.textContent = formatFileSize(attachment.size);

            text.append(name, size);
            info.append(icon, text);

            actions.append(
                createAttachmentButton(
                    "fa-eye",
                    "Visualizar anexo",
                    () => {
                        window.open(
                            attachment.url,
                            "_blank",
                            "noopener"
                        );
                    },
                    "btn-view"
                ),
                createAttachmentButton(
                    "fa-trash",
                    "Excluir anexo",
                    () => removeAttachment(attachment.id),
                    "btn-del"
                )
            );

            item.append(info, actions);
            list.append(item);
        });
    }

    function createAttachmentButton(
        iconName,
        label,
        action,
        className
    ) {
        const button = document.createElement("button");
        const icon = document.createElement("i");

        button.type = "button";
        button.className = className;
        button.setAttribute("aria-label", label);

        icon.className = `fa-solid ${iconName}`;
        icon.setAttribute("aria-hidden", "true");

        button.append(icon);
        button.addEventListener("click", action);

        return button;
    }

    function removeAttachment(id) {
        const attachment = state.attachments.get(id);

        if (attachment?.url) {
            URL.revokeObjectURL(attachment.url);
        }

        state.attachments.delete(id);

        renderAttachments();
        setStatus("Anexo removido.");
    }

    function getFileIcon(name) {
        const extension =
            name.split(".").pop()?.toLowerCase();

        if (extension === "pdf") {
            return "fa-file-pdf";
        }

        if (["jpg", "jpeg", "png"].includes(extension)) {
            return "fa-file-image";
        }

        if (["doc", "docx"].includes(extension)) {
            return "fa-file-word";
        }

        return "fa-file";
    }

    function formatFileSize(bytes) {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    /* ==========================================================
       HISTÓRICO
    ========================================================== */

    function addHistory(action) {
        state.history.push({
            date: new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "medium"
            }).format(new Date()),
            user: "ADMIN",
            action
        });

        renderHistory();
    }

    function renderHistory() {
        const container = byId("historicoConteudo");

        if (!container) {
            return;
        }

        container.replaceChildren();

        if (!state.history.length) {
            const empty = document.createElement("p");

            empty.className = "historico-vazio";
            empty.textContent =
                "Nenhuma alteração registrada.";

            container.append(empty);
            return;
        }

        [...state.history]
            .reverse()
            .forEach((entry) => {
                const item = document.createElement("article");
                const date = document.createElement("div");
                const action = document.createElement("div");
                const user = document.createElement("div");

                item.className = "historico-item";
                date.className = "historico-data";
                action.className = "historico-acao";
                user.className = "historico-user";

                date.textContent = entry.date;
                action.textContent = entry.action;
                user.textContent = `@${entry.user}`;

                item.append(date, action, user);
                container.append(item);
            });
    }

    /* ==========================================================
       MODAIS
    ========================================================== */

    function initializeModalEvents() {
        document.addEventListener("keydown", (event) => {
            const activeModal =
                document.querySelector(".modal.active");

            if (event.key === "Escape" && activeModal) {
                if (activeModal.id === "modalWebcam") {
                    closeWebcam();
                } else {
                    closeModal(activeModal.id);
                }
            }

            if (event.key === "Tab" && activeModal) {
                trapModalFocus(event, activeModal);
            }
        });

        queryAll(".modal").forEach((modal) => {
            modal.addEventListener("click", (event) => {
                if (event.target !== modal) {
                    return;
                }

                if (modal.id === "modalWebcam") {
                    closeWebcam();
                } else {
                    closeModal(modal.id);
                }
            });
        });
    }

    function openModal(
        id,
        trigger = document.activeElement
    ) {
        const modal = byId(id);

        if (!modal) {
            return;
        }

        state.modalTriggers.set(id, trigger);

        modal.hidden = false;
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");

        window.setTimeout(() => {
            getFocusableElements(modal)[0]?.focus();
        }, 0);
    }

    function closeModal(id) {
        const modal = byId(id);

        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");

        state.modalTriggers.get(id)?.focus?.();
    }

    function getFocusableElements(container) {
        const selector = [
            "button:not([disabled])",
            "[href]",
            "input:not([disabled])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            '[tabindex]:not([tabindex="-1"])'
        ].join(",");

        return queryAll(selector, container).filter((element) => {
            return !element.hidden && element.offsetParent !== null;
        });
    }

    function trapModalFocus(event, modal) {
        const focusable = getFocusableElements(modal);

        if (!focusable.length) {
            return;
        }

        const first = focusable[0];
        const last = focusable.at(-1);

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
        }

        if (
            !event.shiftKey &&
            document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    }

    /* ==========================================================
       BUSCA
    ========================================================== */

    function executeSearch() {
        const term = byId("buscaTermo")?.value.trim();
        const results = byId("buscaResultados");

        if (!results) {
            return;
        }

        results.replaceChildren();

        if (!term) {
            const empty = document.createElement("p");

            empty.className = "busca-vazio";
            empty.textContent =
                "Digite um nome, CPF, código ou telefone para buscar.";

            results.append(empty);
            return;
        }

        const patients = [
            {
                name: term.toLocaleUpperCase("pt-BR"),
                cpf: "000.000.000-00",
                code: "00001"
            },
            {
                name: "MARIA SILVA",
                cpf: "111.111.111-11",
                code: "00002"
            }
        ];

        patients.forEach((patient) => {
            const result = document.createElement("button");
            const name = document.createElement("span");
            const info = document.createElement("span");

            result.type = "button";
            result.className = "busca-item";

            name.className = "busca-item-nome";
            info.className = "busca-item-info";

            name.textContent = patient.name;
            info.textContent =
                `CPF: ${patient.cpf} | Código: ${patient.code}`;

            result.append(name, info);

            result.addEventListener("click", () => {
                closeModal("modalBusca");

                setStatus(
                    `Paciente selecionado: ${patient.name}. ` +
                    "A integração com a base de dados ainda é necessária."
                );
            });

            results.append(result);
        });
    }

    /* ==========================================================
       RELÓGIO E UTILITÁRIOS
    ========================================================== */

    function initializeClock() {
        const clock = byId("clock");

        if (!clock) {
            return;
        }

        const updateClock = () => {
            const now = new Date();

            clock.textContent = new Intl.DateTimeFormat(
                "pt-BR",
                {
                    dateStyle: "short",
                    timeStyle: "medium"
                }
            ).format(now);

            clock.dateTime = now.toISOString();
        };

        updateClock();
        window.setInterval(updateClock, 1000);
    }

    function nowForDateTimeInput() {
        const now = new Date();

        return new Date(
            now.getTime() -
            now.getTimezoneOffset() * 60000
        )
            .toISOString()
            .slice(0, 16);
    }

    function setFieldValue(id, value) {
        const field = byId(id);

        if (field) {
            field.value = value;
        }
    }

    function setStatus(message) {
        const status = byId("formStatus");

        if (status) {
            status.textContent = message;
        }
    }

    function emitMedicalDocument(type) {
        const patientName =
            byId("pacNome")?.value.trim() ||
            "Paciente não informado";

        setStatus(
            `${type} solicitado para ${patientName}. ` +
            "A geração depende da integração com o backend e assinatura profissional."
        );
    }

    /* ==========================================================
       COMPATIBILIDADE COM O HTML ATUAL
    ========================================================== */

    window.acaoNovo = actionNew;
    window.acaoGravar = actionSave;
    window.acaoEditar = actionEdit;
    window.acaoExcluir = actionDelete;
    window.acaoCancelar = actionCancel;
    window.acaoBuscar = actionSearch;
    window.acaoAnterior = actionPrevious;
    window.acaoProximo = actionNext;
    window.acaoAnexo = actionAttachment;
    window.acaoImprimir = actionPrint;
    window.acaoHistorico = actionHistory;
    window.buscarCep = searchCep;
    window.switchTab = switchTab;
    window.abrirWebcam = openWebcam;
    window.capturarFoto = capturePhoto;
    window.fecharWebcam = closeWebcam;
    window.fecharModal = closeModal;
    window.limparAssinatura = clearSignature;
    window.salvarAssinatura = saveSignature;
    window.executarBusca = executeSearch;

    window.emitirAtestado = () => {
        emitMedicalDocument("Atestado médico");
    };

    window.emitirPedidoExames = () => {
        emitMedicalDocument("Pedido de exames");
    };

    window.emitirReceita = () => {
        emitMedicalDocument("Receita médica");
    };

    window.verHistorico = actionHistory;
})();
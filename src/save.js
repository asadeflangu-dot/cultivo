/**
 * GERENCIADOR DE SALVAMENTO COM RECUPERAÇÃO E VERSIONEAMENTO
 */

const SAVE_KEY = "XIANXIA_IDLE_SAVE_V1";
const CURRENT_SAVE_VERSION = 1;

const SaveManager = {
    getInitialState() {
        return {
            saveVersion: CURRENT_SAVE_VERSION,
            lastSavedTime: Date.now(),
            playerCreated: false,
            name: "",
            path: "Orthodox",
            body: null,
            realm: 1,
            stage: 1,
            qi: 0,
            essence: 0,
            stamina: 100,
            maxStamina: 100,
            upgrades: {}
        };
    },

    save(state) {
        try {
            state.lastSavedTime = Date.now();
            const data = JSON.stringify(state);
            localStorage.setItem(SAVE_KEY, data);
            return true;
        } catch (err) {
            console.error("Erro ao salvar progresso:", err);
            return false;
        }
    },

    load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return this.getInitialState();

            const parsed = JSON.parse(raw);
            return this.migrate(parsed);
        } catch (err) {
            console.warn("Save corrompido detectado. Gerando estado inicial seguro.", err);
            return this.getInitialState();
        }
    },

    migrate(savedState) {
        // Garantir compatibilidade com versões futuras de save
        if (!savedState.saveVersion || savedState.saveVersion < CURRENT_SAVE_VERSION) {
            savedState.saveVersion = CURRENT_SAVE_VERSION;
        }
        return Object.assign(this.getInitialState(), savedState);
    },

    exportSave(state) {
        const jsonString = JSON.stringify(state, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Xianxia_Save_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importSave(jsonText) {
        try {
            const parsed = JSON.parse(jsonText);
            if (parsed && typeof parsed === "object") {
                return this.migrate(parsed);
            }
        } catch (e) {
            alert("Arquivo de Save inválido ou corrompido!");
        }
        return null;
    }
};
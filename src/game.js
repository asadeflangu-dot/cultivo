/**
 * NÚCLEO DA LÓGICA DO JOGO E LOOP PRINCIPAL
 */

window.GameEngine = {
    state: null,
    selectedBodyTemp: null,

    init() {
        UIManager.init();
        this.state = SaveManager.load();

        if (!this.state.playerCreated) {
            this.showCreationModal();
        } else {
            this.processOfflineProgress();
            this.startGameLoop();
        }

        this.bindEvents();
        UIManager.update(this.state);
    },

    showCreationModal() {
        const modal = document.getElementById("character-creation-modal");
        modal.classList.remove("hidden");

        // Seleção de Caminho
        const pathBtns = document.querySelectorAll(".btn-path");
        pathBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                pathBtns.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                this.state.path = e.target.getAttribute("data-path");
            });
        });

        // Sorteio de Corpo
        document.getElementById("btn-body-random").addEventListener("click", () => {
            const available = GAME_DATA.bodies.filter(b => !b.pathReq || b.pathReq === this.state.path);
            const picked = available[Math.floor(Math.random() * available.length)];
            this.selectedBodyTemp = picked;
            document.getElementById("selected-body-info").innerText = `Corpo Sorteado: ${picked.name} (${picked.rarity})`;
            document.getElementById("body-options").classList.add("hidden");
        });

        // Escolha Manual de Corpo
        document.getElementById("btn-body-select").addEventListener("click", () => {
            const bodyListDiv = document.getElementById("body-options");
            bodyListDiv.classList.toggle("hidden");
            bodyListDiv.innerHTML = "";
            const available = GAME_DATA.bodies.filter(b => !b.pathReq || b.pathReq === this.state.path);
            available.forEach(b => {
                const bBtn = document.createElement("button");
                bBtn.className = "btn btn-secondary full-width";
                bBtn.style.marginTop = "4px";
                bBtn.innerText = `${b.name} (${b.rarity})`;
                bBtn.addEventListener("click", () => {
                    this.selectedBodyTemp = b;
                    document.getElementById("selected-body-info").innerText = `Corpo Escolhido: ${b.name} (${b.rarity})`;
                    bodyListDiv.classList.add("hidden");
                });
                bodyListDiv.appendChild(bBtn);
            });
        });

        // Finalizar Criação
        document.getElementById("btn-start-game").addEventListener("click", () => {
            const nameInput = document.getElementById("input-name").value.trim();
            if (!nameInput) {
                alert("Insira um nome para o seu cultivador!");
                return;
            }

            this.state.name = nameInput;
            this.state.body = this.selectedBodyTemp || GAME_DATA.bodies[0];
            this.state.playerCreated = true;

            modal.classList.add("hidden");
            SaveManager.save(this.state);
            this.startGameLoop();
            UIManager.update(this.state);
        });
    },

    bindEvents() {
        // Clique Cultivar
        document.getElementById("btn-cultivate").addEventListener("click", () => {
            const amount = GameFormulas.getQiPerClick(this.state);
            this.state.qi += amount;
            UIManager.update(this.state);
        });

        // Quebra de Estágio / Reino
        document.getElementById("btn-breakthrough").addEventListener("click", () => {
            this.attemptBreakthrough();
        });

        // Eventos de Save Opções
        document.getElementById("btn-save-manual").addEventListener("click", () => {
            SaveManager.save(this.state);
            alert("Progresso salvo com sucesso!");
        });

        document.getElementById("btn-export-save").addEventListener("click", () => {
            SaveManager.exportSave(this.state);
        });

        const fileInput = document.getElementById("file-import-save");
        document.getElementById("btn-import-trigger").addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const importedState = SaveManager.importSave(event.target.result);
                if (importedState) {
                    this.state = importedState;
                    SaveManager.save(this.state);
                    location.reload();
                }
            };
            reader.readAsText(file);
        });

        document.getElementById("btn-reset-game").addEventListener("click", () => {
            if (confirm("Tem certeza que deseja apagar todo seu progresso de cultivo?")) {
                localStorage.removeItem(SAVE_KEY);
                location.reload();
            }
        });
    },

    buyUpgrade(upgradeId) {
        const up = GAME_DATA.upgrades.find(u => u.id === upgradeId);
        if (!up) return;

        const currentLevel = this.state.upgrades[upgradeId] || 0;
        const cost = GameFormulas.getUpgradeCost(up, currentLevel);

        if (this.state.qi >= cost) {
            this.state.qi -= cost;
            this.state.upgrades[upgradeId] = currentLevel + 1;
            SaveManager.save(this.state);
            UIManager.update(this.state);
        }
    },

    attemptBreakthrough() {
        const reqQi = GameFormulas.getRequiredQi(this.state.realm, this.state.stage);
        if (this.state.qi < reqQi) return;

        const luck = GameFormulas.getBreakLuck(this.state);
        const roll = Math.random() * 100;

        if (roll <= luck) {
            this.state.qi -= reqQi;
            if (this.state.stage < 10) {
                this.state.stage += 1;
            } else {
                this.state.realm += 1;
                this.state.stage = 1;
                alert(`Parabéns! Você alcançou o ${GAME_DATA.realms.find(r => r.id === this.state.realm).name}!`);
            }
        } else {
            // Falha na quebra consome 20% do Qi acumulado sem regredir o estágio
            this.state.qi = Math.floor(this.state.qi * 0.8);
            alert("A Quebra falhou! Seu fluxo de Qi foi perturbado.");
        }

        SaveManager.save(this.state);
        UIManager.update(this.state);
    },

    processOfflineProgress() {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - this.state.lastSavedTime) / 1000);
        
        // Limite máximo de 8 horas offline (28800 segundos)
        const cappedSeconds = Math.min(elapsedSeconds, 28800);

        if (cappedSeconds > 60) {
            const qiPerSec = GameFormulas.getQiPerSecond(this.state);
            const totalGained = qiPerSec * cappedSeconds;

            if (totalGained > 0) {
                this.state.qi += totalGained;
                
                const hours = Math.floor(cappedSeconds / 3600);
                const minutes = Math.floor((cappedSeconds % 3600) / 60);

                document.getElementById("offline-time-text").innerText = `Você esteve ausente por ${hours}h ${minutes}m.`;
                document.getElementById("offline-gains-text").innerText = `+${GameFormulas.formatNumber(totalGained)} Qi acumulado em meditação.`;
                
                const modal = document.getElementById("offline-modal");
                modal.classList.remove("hidden");

                document.getElementById("btn-close-offline").addEventListener("click", () => {
                    modal.classList.add("hidden");
                });
            }
        }
    },

    startGameLoop() {
        // Tique-Taque do jogo (1 vez por segundo)
        setInterval(() => {
            const qiSec = GameFormulas.getQiPerSecond(this.state);
            if (qiSec > 0) {
                this.state.qi += qiSec;
                UIManager.update(this.state);
            }
        }, 1000);

        // Auto-Save a cada 30 segundos
        setInterval(() => {
            SaveManager.save(this.state);
        }, 30000);
    }
};

// Inicializar após carregamento completo
window.addEventListener("DOMContentLoaded", () => {
    window.GameEngine.init();
});
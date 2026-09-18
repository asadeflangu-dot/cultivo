/**
 * MANIPULADOR DE INTERFACE E EVENTOS DOM
 */

const UIManager = {
    init() {
        this.bindNavigation();
    },

    bindNavigation() {
        const navBtns = document.querySelectorAll(".nav-btn");
        navBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                navBtns.forEach(b => b.classList.remove("active"));
                document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
                
                btn.classList.add("active");
                const targetTab = btn.getAttribute("data-tab");
                document.getElementById(targetTab).classList.remove("hidden");
            });
        });
    },

    update(state) {
        if (!state.playerCreated) return;

        // Dados do Header
        document.getElementById("ui-player-name").innerText = state.name;
        document.getElementById("ui-player-path").innerText = state.path;
        document.getElementById("ui-player-body").innerText = state.body ? state.body.name : "Nenhum";

        const realmData = GAME_DATA.realms.find(r => r.id === state.realm);
        document.getElementById("ui-realm-name").innerText = realmData ? realmData.name : `Reino ${state.realm}`;
        document.getElementById("ui-stage-name").innerText = `Estágio ${state.stage}/10`;

        // Recursos
        document.getElementById("ui-qi").innerText = GameFormulas.formatNumber(state.qi);
        document.getElementById("ui-stamina").innerText = `${state.stamina}/${state.maxStamina}`;

        if (state.realm >= 2) {
            document.getElementById("container-essence").classList.remove("hidden");
            document.getElementById("ui-essence").innerText = GameFormulas.formatNumber(state.essence);
        }

        // Progresso do Cultivo
        const reqQi = GameFormulas.getRequiredQi(state.realm, state.stage);
        document.getElementById("ui-qi-progress-text").innerText = `${GameFormulas.formatNumber(state.qi)} / ${GameFormulas.formatNumber(reqQi)}`;
        
        const percent = Math.min(100, (state.qi / reqQi) * 100);
        document.getElementById("ui-qi-bar").style.width = `${percent}%`;

        // Stats
        document.getElementById("ui-qi-per-click").innerText = GameFormulas.formatNumber(GameFormulas.getQiPerClick(state));
        document.getElementById("ui-qi-per-sec").innerText = GameFormulas.formatNumber(GameFormulas.getQiPerSecond(state));
        document.getElementById("ui-break-luck").innerText = `${GameFormulas.getBreakLuck(state)}%`;

        // Controle do Botão de Quebra
        const btnBreakthrough = document.getElementById("btn-breakthrough");
        if (state.qi >= reqQi) {
            btnBreakthrough.classList.remove("hidden");
        } else {
            btnBreakthrough.classList.add("hidden");
        }

        this.renderUpgrades(state);
        this.renderCharacterDetails(state);
    },

    renderCharacterDetails(state) {
        const detailsContainer = document.getElementById("character-details");
        if (!detailsContainer) return;
        const realmData = GAME_DATA.realms.find(r => r.id === state.realm);
        detailsContainer.innerHTML = `
            <div class="info-box">
                <p><strong>Nome:</strong> ${state.name}</p>
                <p><strong>Caminho:</strong> ${state.path}</p>
                <p><strong>Constituição:</strong> ${state.body ? state.body.name : "Nenhum"} (${state.body ? state.body.rarity : "-"})</p>
                <p><strong>Reino Atual:</strong> ${realmData ? realmData.name : state.realm}</p>
                <p><strong>Estágio Atual:</strong> ${state.stage} / 10</p>
                <p><strong>Stamina:</strong> ${state.stamina} / ${state.maxStamina}</p>
            </div>
            <div class="info-box">
                <h4>Multiplicadores da Constituição:</h4>
                <p>• Multiplicador de Clique: x${state.body?.multipliers?.qiClick || 1}</p>
                <p>• Multiplicador de Qi/s: x${state.body?.multipliers?.qiSec || 1}</p>
                <p>• Multiplicador de Sorte: x${state.body?.multipliers?.breakLuck || 1}</p>
            </div>
        `;
    },

    renderUpgrades(state) {
        const container = document.getElementById("upgrades-list");
        container.innerHTML = "";

        GAME_DATA.upgrades.forEach(up => {
            if (state.realm >= up.reqRealm) {
                const currentLevel = state.upgrades[up.id] || 0;
                const cost = GameFormulas.getUpgradeCost(up, currentLevel);
                
                const card = document.createElement("div");
                card.className = "upgrade-card";
                card.innerHTML = `
                    <div class="upgrade-info">
                        <h4>${up.name} (Nvl. ${currentLevel})</h4>
                        <p>${up.desc}</p>
                        <p><strong>Custo: ${GameFormulas.formatNumber(cost)} Qi</strong></p>
                    </div>
                    <button class="btn btn-secondary btn-buy-upgrade" data-id="${up.id}">Melhorar</button>
                `;

                const btnBuy = card.querySelector(".btn-buy-upgrade");
                if (state.qi < cost) {
                    btnBuy.disabled = true;
                    btnBuy.style.opacity = 0.5;
                }

                btnBuy.addEventListener("click", () => {
                    window.GameEngine.buyUpgrade(up.id);
                });

                container.appendChild(card);
            }
        });
    }
};
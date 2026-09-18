/**
 * FORMULÁRIOS E FORMATADORES DE NÚMEROS CENTRALIZADOS
 */

const GameFormulas = {
    // Sistema de Exibição de Números Grandes
    formatNumber(value) {
        if (value === null || value === undefined || isNaN(value)) return "0";
        if (value < 1000) return Math.floor(value).toString();

        const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
        const i = Math.floor(Math.log10(value) / 3);

        if (i >= suffixes.length) return value.toExponential(2);
        
        const formatted = (value / Math.pow(10, i * 3)).toFixed(2);
        return `${formatted}${suffixes[i]}`;
    },

    // Requisito Exponencial de Qi por Reino e Estágio
    getRequiredQi(realm, stage) {
        const base = 100;
        const stageFactor = Math.pow(1.8, stage - 1);
        const realmFactor = Math.pow(10, realm - 1);
        return Math.floor(base * stageFactor * realmFactor);
    },

    // Cálculo do Qi por Clique
    getQiPerClick(state) {
        let base = 1;
        const bodyMult = state.body ? state.body.multipliers.qiClick : 1;

        // Soma upgrades
        if (state.upgrades["breath_control"]) {
            base += state.upgrades["breath_control"] * 1;
        }

        return Math.floor(base * bodyMult);
    },

    // Cálculo do Qi Passivo por Segundo (Meditação)
    getQiPerSecond(state) {
        let base = 0;
        const bodyMult = state.body ? state.body.multipliers.qiSec : 1;

        if (state.upgrades["meditation_basics"]) {
            base += state.upgrades["meditation_basics"] * 1;
        }

        return Math.floor(base * bodyMult);
    },

    // Sorte de Quebra de Estágio (com cap configurado)
    getBreakLuck(state) {
        let baseLuck = 5; // 5% base
        const maxLuck = 95; // Limite máximo
        const bodyMult = state.body ? state.body.multipliers.breakLuck : 1;

        if (state.upgrades["dao_comprehension"]) {
            baseLuck += state.upgrades["dao_comprehension"] * 2;
        }

        const calculated = Math.floor(baseLuck * bodyMult);
        return Math.min(calculated, maxLuck);
    },

    // Custo Dinâmico do Upgrade
    getUpgradeCost(upgrade, currentLevel) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, currentLevel));
    }
};
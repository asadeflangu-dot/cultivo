/**
 * DADOS CONFIGURÁVEIS DO JOGO
 * Permite adicionar reinos, corpos e upgrades sem alterar a lógica principal.
 */

const GAME_DATA = {
    // Configuração dos Reinos
    realms: [
        { id: 1, name: "Refino de Qi" },
        { id: 2, name: "Estabelecimento de Fundação" },
        { id: 3, name: "Núcleo Dourado" },
        { id: 4, name: "Alma Nascente" },
        { id: 5, name: "Transformação Divina" },
        { id: 6, name: "Vazio do Retorno" },
        { id: 7, name: "Integração do Dao" },
        { id: 8, name: "Tribulação Imortal" },
        { id: 9, name: "Venerável Imortal" }
    ],

    // Constituições Corporais
    bodies: [
        {
            id: "mortal",
            name: "Corpo Mortal Comum",
            rarity: "Comum",
            pathReq: null,
            multipliers: { qiClick: 1.0, qiSec: 1.0, breakLuck: 1.0 }
        },
        {
            id: "spirit_elemental",
            name: "Corpo Espiritual dos Cinco Elementos",
            rarity: "Raro",
            pathReq: "Orthodox",
            multipliers: { qiClick: 1.5, qiSec: 1.3, breakLuck: 1.1 }
        },
        {
            id: "asura_blood",
            name: "Corpo de Sangue Asura",
            rarity: "Épico",
            pathReq: "Demonic",
            multipliers: { qiClick: 2.0, qiSec: 0.8, breakLuck: 1.25 }
        },
        {
            id: "dao_sovereign",
            name: "Corpo Soberano do Dao",
            rarity: "Lendário",
            pathReq: null,
            multipliers: { qiClick: 2.5, qiSec: 2.5, breakLuck: 1.5 }
        }
    ],

    // Upgrades Modulares
    upgrades: [
        {
            id: "breath_control",
            name: "Controle da Respiração",
            desc: "Aumenta o Qi obtido por clique manual.",
            category: "cultivation",
            baseCost: 10,
            costMult: 1.5,
            effectType: "qiClickBase",
            effectValue: 1,
            reqRealm: 1,
            reqStage: 1
        },
        {
            id: "meditation_basics",
            name: "Postura de Meditação",
            desc: "Desbloqueia e aumenta a geração passiva de Qi por segundo.",
            category: "meditation",
            baseCost: 50,
            costMult: 1.8,
            effectType: "qiSecBase",
            effectValue: 1,
            reqRealm: 1,
            reqStage: 1
        },
        {
            id: "dao_comprehension",
            name: "Compreensão Celestial",
            desc: "Aumenta a Sorte de Quebra de Estágio.",
            category: "breakthrough",
            baseCost: 200,
            costMult: 2.5,
            effectType: "breakLuckBase",
            effectValue: 2,
            reqRealm: 1,
            reqStage: 2
        }
    ],

    // Moedas e Recursos
    currencies: {
        qi: { name: "Qi Interno", unlockRealm: 1 },
        essence: { name: "Essência Purificada", unlockRealm: 2 }
    }
};
// ==========================================
// 1. IMPORTAÇÕES E CONFIGURAÇÃO DO FIREBASE (SDK Modular v10.8.1)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove, get, child, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const IMGBB_API_KEY = "1fd4d8fc1d8b3f9bb172de4e42dabe37";

const firebaseConfig = {
  apiKey: "AIzaSyB5rYYzsbn7rSfh2Q7iv20VtmWcvUTySaA",
  authDomain: "turno-noturno.firebaseapp.com",
  databaseURL: "https://turno-noturno-default-rtdb.firebaseio.com",
  projectId: "turno-noturno",
  storageBucket: "turno-noturno.firebasestorage.app",
  messagingSenderId: "452104216659",
  appId: "1:452104216659:web:982293f3f30b372e1b26a6",
  measurementId: "G-YQVGM2LLHW"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. VARIÁVEIS GLOBAIS E ESTADOS
// ==========================================
let currentUser = "";
let userGrimoire = [];
let currentSpellId = null;
let isMasterAuthenticated = false;
let fatorKarma = 0;
let dadosNpc = null;
let limiteTintaDiogenes = 10;      
let filtroCorDiogenes = 'todos';   
let tintaEspecialLiberada = false; 
let estoqueTintasDiogenes = {
    vermelha: 10,
    azul: 10,
    amarela: 10,
    preta: 0,
    branca: 0,
    mescla: 0
};

let canalAtual = 'taverna';
let canalRolagemDestino = 'taverna';
let unsubscribeChat = null;
let jogadorSilenciado = false;
let intervaloMute = null;
let respondendoA = null;
let npcsSalvos = {};
let userInventory = []; 
let listaDeMescla = []; 
let fichaAtual = null;

// ==========================================
// 3. O GRIMÓRIO DE DIÓGENES (100 EFEITOS)
// ==========================================
const magiasDiogenes = [
        // --- TINTA VERMELHA (FOGO) [1 a 10] ---
        { nome: "Bola de fogo", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Cria um pequeno fogo autônomo que ilumina e causa 1 de dano de fogo." },
        { nome: "Manto de Calor", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Concede resistência a dano de frio por uma cena." },
        { nome: "Projétil Incandescente", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Dispara um dardo flamejante que causa 2 de dano de fogo." },
        { nome: "Explosão de Brasa", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Cria uma explosão em área de 3 metros que empurra inimigos, causando 2 dano nos alvos." },
        { nome: "Arma Ardente", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Adiciona +1 de dano de fogo a uma arma por uma cena." },
        { nome: "Sopro de Fênix", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Libera um cone de fogo de 4 metros causando 3 de dano." },
        { nome: "Muro de labaredas", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Ergue uma barreira de chamas bloqueando a passagem por 2 rodadas, causando 3 de dano a quem tenta ultrapassar." },
        { nome: "Marca das Brasas", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Ao desenhar uma marca no alvo, sob o comando do conjurador, a marca explode, queimando o alvo e causando 5 de dano." },
        { nome: "Adrenalina", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Aumenta temporariamente a velocidade de movimento em 3 metros, aumentando em +2 os testes físicos." },
        { nome: "Estilhaço Magmático", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Dispara estilhaços quentes que perfuram armaduras leves, destruindo o equipamento atingido." },

        // --- TINTA AZUL (ÁGUA E ESPIRITUALIDADE) [11 a 20] ---
        { nome: "Cura das Marés", cor: "azul", receita: "Tinta Azul", efeito: "Faz 1 ferimento estabilizado sumir da ficha." },
        { nome: "Bolha de Oxigênio", cor: "azul", receita: "Tinta Azul", efeito: "Cria bolhas, permitindo respiração em qualquer local por tempo indeterminado." },
        { nome: "Passo Sobre Águas", cor: "azul", receita: "Tinta Azul", efeito: "Permite caminhar sobre superfícies líquidas como se fossem sólidas por uma cena." },
        { nome: "Sussurro Espiritual", cor: "azul", receita: "Tinta Azul", efeito: "Permite enxergar e conversar com espíritos recém-mortos por uma cena." },
        { nome: "Nevoeiro Purificador", cor: "azul", receita: "Tinta Azul", efeito: "Remove condições de veneno ou doença leve de um aliado." },
        { nome: "Escudo de Gelo", cor: "azul", receita: "Tinta Azul", efeito: "Bloqueia completamente o próximo ataque corpo a corpo recebido." },
        { nome: "Lágrima dos Mares", cor: "azul", receita: "Tinta Azul", efeito: "Restaura estabilidade mental." },
        { nome: "Voz do Oceano", cor: "azul", receita: "Tinta Azul", efeito: "Permite comunicação telepática de longo alcance com aliados." },
        { nome: "Bênção da Névoa", cor: "azul", receita: "Tinta Azul", efeito: "Cria uma névoa densa ao redor concedendo camuflagem arcana." },
        { nome: "Onda de Retorno", cor: "azul", receita: "Tinta Azul", efeito: "Empurra todos os inimigos ao redor para longe com força hidráulica (até 5 metros)." },

        // --- TINTA AMARELA (LUZ) [21 a 30] ---
        { nome: "Clarão Ofuscante", cor: "amarela", receita: "Tinta Amarela", efeito: "Cega temporariamente inimigos em um raio de 5 metros." },
        { nome: "Lâmina de Luz", cor: "amarela", receita: "Tinta Amarela", efeito: "Infunde uma arma com luz radiante, permitindo ferir criaturas sobrenaturais." },
        { nome: "Faro da Verdade", cor: "amarela", receita: "Tinta Amarela", efeito: "Revela ilusões, metamorfos e invisibilidade em até 10 metros." },
        { nome: "Aura de Proteção", cor: "amarela", receita: "Tinta Amarela", efeito: "Concede +2 no suporte a lesão do alvo por uma cena." },
        { nome: "Feixe Solar", cor: "amarela", receita: "Tinta Amarela", efeito: "Dispara um raio de luz concentrada em linha reta ignorando armaduras leves." },
        { nome: "Luz Guia", cor: "amarela", receita: "Tinta Amarela", efeito: "Cria uma esfera de luz flutuante. Inimigos na luz recebem bônus de +2 para serem atingidos." },
        { nome: "Claridade Mental", cor: "amarela", receita: "Tinta Amarela", efeito: "Remove efeitos de medo ou confusão mental de um aliado." },
        { nome: "Selo Solar", cor: "amarela", receita: "Tinta Amarela", efeito: "Cria uma runa no chão que prende criaturas que a pisarem." },
        { nome: "Reflexo Espelhado", cor: "amarela", receita: "Tinta Amarela", efeito: "Cria cópias ilusórias de algo ou alguém." },
        { nome: "Toque do Amanhecer", cor: "amarela", receita: "Tinta Amarela", efeito: "Estabiliza um ferimento temporariamente." },

        // --- TINTA PRETA (MATÉRIA) [31 a 40] ---
        { nome: "Parede de Ferro", cor: "preta", receita: "Tinta Preta", efeito: "Cria uma parede sólida de matéria de 2x2 metros para bloqueio físico." },
        { nome: "Criação de Ferramentas", cor: "preta", receita: "Tinta Preta", efeito: "Materializa instantaneamente uma ferramenta útil (chave, alavanca, corda)." },
        { nome: "Armadura Sólida", cor: "preta", receita: "Tinta Preta", efeito: "Concede +3 de bônus na armadura do conjurador por 1 rodada." },
        { nome: "Projétil Físico Denso", cor: "preta", receita: "Tinta Preta", efeito: "Cria e arremessa um pedregulho maciço com alto dano de impacto." },
        { nome: "Selo de Prisão Material", cor: "preta", receita: "Tinta Preta", efeito: "Invoca algemas materiais do chão que prendem os pés do alvo." },
        { nome: "Pilar de Sustentação", cor: "preta", receita: "Tinta Preta", efeito: "Cria uma coluna instantânea para sustentar tetos desabando." },
        { nome: "Bloco de Contenção", cor: "preta", receita: "Tinta Preta", efeito: "Cria um cubo de pedra ao redor de um item ou inimigo pequeno." },
        { nome: "Lâmina Materializada", cor: "preta", receita: "Tinta Preta", efeito: "Cria uma espada física improvisada de alta durabilidade." },
        { nome: "Escudo de Chumbo", cor: "preta", receita: "Tinta Preta", efeito: "Cria um escudo pesado bloqueando magias baseadas em radiação ou luz." },
        { nome: "Maciço Colossal", cor: "preta", receita: "Tinta Preta", efeito: "Cria uma estrutura grossa de metal para bloquear passagens inteiras." },

        // --- TINTA BRANCA (APAGAR) [41 a 50] ---
        { nome: "Desintegrar Objeto", cor: "branca", receita: "Tinta Branca", efeito: "Apaga e desintegra um objeto pequeno não mágico do cenário." },
        { nome: "Silêncio Absoluto", cor: "branca", receita: "Tinta Branca", efeito: "Cria uma zona esférica de silêncio mágico onde nenhum som escapa." },
        { nome: "Apagar Memória Recente", cor: "branca", receita: "Tinta Branca", efeito: "Apaga os últimos 10 segundos da mente de um alvo afetado." },
        { nome: "Cancelamento de Magia", cor: "branca", receita: "Tinta Branca", efeito: "Anula um efeito mágico ativo de nível baixo." },
        { nome: "Invisibilidade Óptica", cor: "branca", receita: "Tinta Branca", efeito: "Apaga a imagem visível do usuário do espectro óptico por 1 minuto." },
        { nome: "Buraco Vazio", cor: "branca", receita: "Tinta Branca", efeito: "Cria um pequeno vácuo que suga e aprisiona projéteis inimigos." },
        { nome: "Apagar Traços", cor: "branca", receita: "Tinta Branca", efeito: "Apaga pegadas, rastros e odores deixados pelo grupo." },
        { nome: "Nulificação de Efeito", cor: "branca", receita: "Tinta Branca", efeito: "Remove uma maldição menor ou efeito de veneno persistente." },
        { nome: "Apagão de Chamas", cor: "branca", receita: "Tinta Branca", efeito: "Extingue instantaneamente qualquer fogo natural ou mágico em área." },
        { nome: "Vazio de Cor", cor: "branca", receita: "Tinta Branca", efeito: "Cria uma área sem cor que desorienta a visão de criaturas comuns." },

        // --- MESCLAS DUPLAS: VERMELHA + AZUL [51 a 60] ---
        { nome: "Torrente de Vapor Quente", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Jato de vapor escaldante que causa 2 dano de fogo e cega o alvo." },
        { nome: "Gêiser Eruptivo", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Faz brotar água fervente do chão em área de 3 metros causando 3 de dano misto." },
        { nome: "Cura Calcinante", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Cura um aliado, cauterizando feridas com calor mágico instantâneo." },
        { nome: "Nevoeiro Termal", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Cria uma névoa espessa e quente que confunde sensores térmicos." },
        { nome: "Escudo de Vapor", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Cria uma barreira defensiva que repele projéteis e queima quem se aproxima." },
        { nome: "Lâmina de Água Fervente", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Remove efeitos de arma ou armadura do alvo." },
        { nome: "Chama Líquida", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Dispara um fluido pegajoso que queima mesmo sob a água." },
        { nome: "Purificação Ígnea", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Purifica o corpo de doenças queimando impurezas espirituais." },
        { nome: "Pulso de Vapor", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Cria uma cortina de gás que sufoca quem a respira por 1 cena." },
        { nome: "Termoterapia Mágica", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Recupera fadiga extrema, podendo acordar pessoas desmaiadas." },

        // --- MESCLAS DUPLAS: VERMELHA + AMARELA [61 a 70] ---
        { nome: "Plasma Solar", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Cria uma esfera de plasma superaquecido que causa 4 de dano massivo." },
        { nome: "Aura de Fogo Sagrado", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Envolve o usuário em chamas douradas que blindam contra criaturas sobrenaturais." },
        { nome: "Lança de Radiância Ardente", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Cria uma lança de luz que permite ao conjurador trocar de lugar com ela." },
        { nome: "Explosão Prateada", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Purifica todos os efeitos negativos do grupo." },
        { nome: "Manto de Ouro Vivo", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Aumenta em +2 o suporte a lesão e concede aura de calor por 1 cena." },
        { nome: "Brilho Magmático", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Coloca um ponto brilhante que atrai qualquer coisa metálica." },
        { nome: "Chama Solar Refletida", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Reflete feixes de luz concentrada em alvos específicos." },
        { nome: "Fúria Radiante", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Faz o inimigo atacar qualquer um próximo a ele descontroladamente." },
        { nome: "Farol de Combate", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Marca um inimigo com luz incandescente visível a longa distância." },
        { nome: "Supernova Menor", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Explosão de luz e fogo em grande área causando 10 de dano após 1 cena." },

        // --- MESCLAS DUPLAS: AZUL + AMARELA [71 a 80] ---
        { nome: "Luz das Marés", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Ao desenhar sobre um aliado, cura todos os seus ferimentos." },
        { nome: "Prisma Espiritual", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Permite conversa com alguém independente da distância, viva ou morta." },
        { nome: "Escudo de Aurora", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Protege alguém contra possessão e efeitos sobrenaturais." },
        { nome: "Água Cristalina", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Cria água benta com propriedades de cura aprimoradas." },
        { nome: "Bênção dos Mares", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Cria uma poça no chão que concede 1 de dano constante a quem pisar." },
        { nome: "Nevoeiro Arco-Íris", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Cria ilusões óticas fantásticas na névoa d'água." },
        { nome: "Pulso de Cura Astral", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Cura em área moderada e afasta presenças espirituais malignas." },
        { nome: "Olhar da Verdade Oceânica", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Permite enxergar através de matéria sólida por 1 minuto." },
        { nome: "Cristalização de Luz", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Cria um feixe de luz que congela completamente um alvo." },
        { nome: "Onda Radiante", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Lança uma onda de energia que desliga aparelhos eletrônicos." },

        // --- MESCLAS COM PRETA E BRANCA [81 a 90] ---
        { nome: "Matéria Vazia", cor: "mescla", receita: "Tinta Preta + Tinta Branca", efeito: "Cria e desfaz simultaneamente um objeto para abrir fechaduras." },
        { nome: "Escudo de Antimatéria", cor: "mescla", receita: "Tinta Preta + Tinta Branca", efeito: "Anula o impacto de qualquer projétil físico ou mágico recebido." },
        { nome: "Criação Silenciosa", cor: "mescla", receita: "Tinta Preta + Tinta Branca", efeito: "Materializa uma estrutura física sem emitir absolutamente nenhum som." },
        { nome: "Apagar e Substituir", cor: "mescla", receita: "Tinta Preta + Tinta Branca", efeito: "Apaga um obstáculo pequeno e cria uma passagem no lugar." },
        { nome: "Anulação Térmica", cor: "mescla", receita: "Tinta Vermelha + Tinta Branca + Tinta Preta", efeito: "Cria um campo onde o fogo é instantaneamente anulado pelo vazio." },
        { nome: "Forja Fantasma", cor: "mescla", receita: "Tinta Vermelha + Tinta Preta + Tinta Amarela", efeito: "Cria armas metálicas incandescentes prontas para uso imediato." },
        { nome: "Cristalização do Vazio", cor: "mescla", receita: "Tinta Azul + Tinta Branca + Tinta Preta", efeito: "Cria um bloco de gelo indestrutível que absorve feitiços." },
        { nome: "Prisão Absoluta", cor: "mescla", receita: "Tinta Preta + Tinta Branca", efeito: "Prende o alvo em uma caixa dimensional de matéria apagada." },
        { nome: "Silêncio de Ferro", cor: "mescla", receita: "Tinta Preta + Tinta Branca", efeito: "Cria uma barreira física e sonora intransponível." },
        { nome: "Correção da Realidade", cor: "mescla", receita: "Todas as Tintas (Vermelha, Azul, Amarela, Preta, Branca)", efeito: "Habilidade suprema: Altera um pequeno aspecto físico ou mágico do ambiente." },

        // --- MESCLAS SUPREMAS [91 a 100] ---
        { nome: "Fúria dos Quatro Elementos", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Tinta Amarela + Tinta Preta", efeito: "Libera uma tempestade elementar massiva ao redor do conjurador." },
        { nome: "Cura Total do Pelo Mágico", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Tinta Branca", efeito: "Restaura 100% da vida usando os estoques guardados no pelo." },
        { nome: "Barreira do Armazém Ambulante", cor: "mescla", receita: "Tinta Preta + Tinta Branca + Tinta Vermelha", efeito: "Protege o inventário guardado no pelo místico contra roubos e danos." },
        { nome: "Super-Nova Arcana", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Tinta Branca", efeito: "Explosão gigantesca de luz e calor sob supervisão mística." },
        { nome: "Véu Etéreo Absoluto", cor: "mescla", receita: "Tinta Azul + Tinta Branca + Tinta Preta", efeito: "Dá invisibilidade completa e intangibilidade física por 30 segundos." },
        { nome: "Lança Mestra", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Tinta Amarela", efeito: "Cria uma arma lendária temporária com efeitos elementais combinados." },
        { nome: "Ressurreição de Tinta", cor: "mescla", receita: "Todas as Tintas (Vermelha, Azul, Amarela, Preta, Branca)", efeito: "Milagre supremo do grimório: Estabiliza um aliado à beira da morte." },
        { nome: "Campo Anti-Magia", cor: "mescla", receita: "Tinta Branca + Tinta Preta", efeito: "Anula todas as magias ativas em um raio de 6 metros." },
        { nome: "Labaredas Espirituais", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Causa dano de fogo espiritual que ignora defesas físicas comuns." },
        { nome: "Apotéose Mágica", cor: "mescla", receita: "Todas as Tintas (Vermelha, Azul, Amarela, Preta, Branca)", efeito: "Canaliza essência pura, dobrando o poder de todas as tintas por 3 rodadas." }
];

// ==========================================
// 4. ELEMENTOS DOM E LOGIN
// ==========================================
const DOM = {
    loginScreen: document.getElementById('login-screen'),
    appScreen: document.getElementById('app-screen'),
    usernameInput: document.getElementById('username-input'),
    userTitle: document.getElementById('user-title'),
    grid: document.getElementById('lista-efeitos'),
    searchInput: document.getElementById('search-input'),
    modalAdd: document.getElementById('modal-add'),
    modalView: document.getElementById('modal-view')
};

function corrigirAudioModal() {
    const audioModal = document.getElementById('audio-modal');
    if (!audioModal) return;

    const closeAudioBtn = audioModal.querySelector('.close-btn') || document.getElementById('close-audio-modal');
    if (closeAudioBtn) {
        closeAudioBtn.onclick = () => {
            audioModal.style.display = 'none';
            const player = document.getElementById('audio-player-element');
            if (player) player.pause();
        };
    }
}
window.addEventListener('DOMContentLoaded', corrigirAudioModal);

window.onload = () => {
    const savedUser = localStorage.getItem('rpg_username');
    if (savedUser) login(savedUser);
};

function embaralharAcoes(texto) {
    let emFala = false;
    let resultado = "";
    const glitchChars = "¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿×÷#$@%&*";
    
    for (let i = 0; i < texto.length; i++) {
        let char = texto[i];
        if (char === '"' || char === "'") {
            emFala = !emFala;
            resultado += char;
            continue;
        }
        if (!emFala && char.match(/[a-zA-Z0-9áéíóúãõç]/i)) {
            resultado += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
            resultado += char;
        }
    }
    return resultado;
}

window.enviarMensagemChat = function(texto, tipoMensagem = 'chat', nomeNpc = null, forcarEnvioMestre = false) {
    if (!currentUser) return;

    let estado = (fichaAtual && fichaAtual.estadoAtual) ? fichaAtual.estadoAtual : 'saudavel';
    let fotoAtual = (fichaAtual && fichaAtual.avatares) ? fichaAtual.avatares[estado] : '';

    if (estado === 'desacordado' && !forcarEnvioMestre) {
        alert("Você está DESACORDADO. Não pode falar ou realizar ações.");
        return;
    }

    let textoFinal = texto;
    if (estado === 'fragmentado' && !forcarEnvioMestre) {
        textoFinal = embaralharAcoes(texto);
    }

    const canalDestino = (tipoMensagem === 'roll' && canalRolagemDestino) 
        ? canalRolagemDestino 
        : (canalAtual || 'taverna');

    if (db) {
        const mensagensRef = ref(db, `mensagens/${canalDestino}`);
        push(mensagensRef, {
            remetente: currentUser,
            falarComo: nomeNpc || null,
            texto: textoFinal,
            avatarUrl: fotoAtual || null,
            timestamp: Date.now(),
            tipo: tipoMensagem,
            editada: false,
            replyTo: respondendoA || null
        }).then(() => {
            if (typeof cancelarResposta === 'function') cancelarResposta();
        }).catch(err => console.error("Erro ao enviar mensagem para o Firebase:", err));
    }
};

const btnLoginEl = document.getElementById('btn-login');
if (btnLoginEl) {
    btnLoginEl.addEventListener('click', () => {
        const name = DOM.usernameInput.value.trim().toLowerCase();
        if (name) login(name);
    });
}

const btnLogoutEl = document.getElementById('btn-logout');
if (btnLogoutEl) {
    btnLogoutEl.addEventListener('click', () => {
        localStorage.removeItem('rpg_username');
        location.reload();
    });
}

function login(username) {
    currentUser = username;
    localStorage.setItem('rpg_username', currentUser);
    
    if (DOM.userTitle) {
        DOM.userTitle.innerText = `Grimório de ${currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}`;
    }
    if (DOM.loginScreen) DOM.loginScreen.classList.add('hidden');
    if (DOM.appScreen) DOM.appScreen.classList.remove('hidden');

    const isGM = (currentUser.toLowerCase() === "mestre" || currentUser.toLowerCase() === "gm");
    const gmControls = document.getElementById("gm-controls");
    const cardPerfil = document.querySelector(".card-perfil");

    if (isGM) {
        if (gmControls) gmControls.classList.remove("hidden");
        if (cardPerfil) cardPerfil.style.display = "none"; 
    } else {
        if (gmControls) gmControls.classList.add("hidden");
        if (cardPerfil) cardPerfil.style.display = "block";
    }
  
    registrarLog("Adentrou o grimório.");
    carregarGrimorioDoFirebase();
    carregarInventarioDoFirebase();
    carregarFichaDoFirebase();
    if (currentUser.toLowerCase() === 'diogenes') {
        gerenciarMarcadorTintaDiogenes();
    }
    iniciarChatAvancado();
}

// ==========================================
// 5. NAVEGAÇÃO E GRIMÓRIO
// ==========================================
function carregarGrimorioDoFirebase() {
    const grimorioRef = ref(db, 'grimoires/' + currentUser);
    
    onValue(grimorioRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            userGrimoire = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            renderizarCards(userGrimoire);
        } else {
            if (currentUser === 'diogenes') {
                magiasDiogenes.forEach(magia => {
                    const novaMagiaRef = push(ref(db, 'grimoires/' + currentUser));
                    set(novaMagiaRef, magia);
                });
            } else {
                userGrimoire = [];
                renderizarCards(userGrimoire);
            }
        }
    });
}

function renderizarCards(lista) {
    if (!DOM.grid) return;
    DOM.grid.innerHTML = "";
    let listaFinal = lista;
    
    if (currentUser && currentUser.toLowerCase() === 'diogenes') {
        if (filtroCorDiogenes !== 'todos') {
            listaFinal = listaFinal.filter(ef => ef.cor === filtroCorDiogenes);
        }
        if (!tintaEspecialLiberada) {
            listaFinal = listaFinal.filter(ef => ef.cor !== 'preta' && ef.cor !== 'branca');
        }
        listaFinal = listaFinal.slice(0, limiteTintaDiogenes);
    }

    if(listaFinal.length === 0) {
        DOM.grid.innerHTML = "<p class='text-muted' style='grid-column: 1/-1;'>Nenhum efeito encontrado!</p>";
        return;
    }

    listaFinal.forEach((ef) => {
        const div = document.createElement('div');
        div.className = `card ${ef.cor}`;
        div.innerText = ef.nome;
        div.onclick = () => abrirModalView(ef);
        DOM.grid.appendChild(div);
    });
}

const btnAddSpellEl = document.getElementById('btn-add-spell');
if (btnAddSpellEl) btnAddSpellEl.onclick = () => DOM.modalAdd.style.display = 'flex';

const closeAddModalEl = document.getElementById('close-add-modal');
if (closeAddModalEl) closeAddModalEl.onclick = () => DOM.modalAdd.style.display = 'none';

const closeViewModalEl = document.getElementById('close-view-modal');
if (closeViewModalEl) closeViewModalEl.onclick = () => DOM.modalView.style.display = 'none';

const btnSaveSpellEl = document.getElementById('btn-save-spell');
if (btnSaveSpellEl) {
    btnSaveSpellEl.onclick = () => {
        const nome = document.getElementById('new-nome').value;
        const cor = document.getElementById('new-cor').value;
        const receita = document.getElementById('new-receita').value;
        const efeito = document.getElementById('new-efeito').value;

        if (!nome || !efeito) return alert("Nome e Efeito são obrigatórios!");

        const novaMagiaRef = push(ref(db, 'grimoires/' + currentUser));
        set(novaMagiaRef, { nome, cor, receita, efeito }).then(() => {
            DOM.modalAdd.style.display = 'none';
            document.getElementById('new-nome').value = "";
            document.getElementById('new-receita').value = "";
            document.getElementById('new-efeito').value = "";
        });
    };
}

function abrirModalView(ef) {
    currentSpellId = ef.id;
    document.getElementById('view-titulo').innerText = ef.nome;
    document.getElementById('view-cor').innerText = ef.cor.toUpperCase();
    document.getElementById('view-receita').innerText = ef.receita;
    document.getElementById('view-efeito').innerText = ef.efeito;
    
    let modalContent = document.querySelector('#modal-view .modal-content') || document.getElementById('view-efeito').parentNode;
    
    let btnAntigo = document.getElementById('btn-conjurar-magia');
    if (btnAntigo) btnAntigo.remove();
    
    const btnConjurar = document.createElement('button');
    btnConjurar.id = 'btn-conjurar-magia';
    btnConjurar.className = 'btn-mystic'; 
    btnConjurar.style.cssText = "background: #25d366; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px;";
    btnConjurar.innerText = `✨ Conjurar / Usar Tinta (${ef.cor.toUpperCase()})`;
    
    btnConjurar.onclick = () => {
        const podeConjurar = usarEfeitoDiogenes(ef);
        if (podeConjurar) {
            alert(`✨ Magia "${ef.nome}" conjurada com sucesso!`);
            DOM.modalView.style.display = 'none';
        }
    };
    
    modalContent.appendChild(btnConjurar);
    DOM.modalView.style.display = 'flex'; 
}

const btnDeleteSpellEl = document.getElementById('btn-delete-spell');
if (btnDeleteSpellEl) {
    btnDeleteSpellEl.onclick = () => {
        if (confirm("Deseja apagar esta página permanentemente?")) {
            const magiaRef = ref(db, `grimoires/${currentUser}/${currentSpellId}`);
            remove(magiaRef).then(() => {
                DOM.modalView.style.display = 'none';
            });
        }
    };
}

if (DOM.searchInput) {
    DOM.searchInput.addEventListener('keyup', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = userGrimoire.filter(ef => 
            ef.nome.toLowerCase().includes(termo) || 
            ef.receita.toLowerCase().includes(termo) || 
            ef.efeito.toLowerCase().includes(termo)
        );
        renderizarCards(filtrados);
    });
}

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        
        btn.classList.add('active');
        const target = document.getElementById(btn.getAttribute('data-target'));
        if (target) target.classList.remove('hidden');
    });
});

// ==========================================
// 6. ROLADOR DE DADOS E CALCULADORA
// ==========================================
const btnRollEl = document.getElementById('btn-roll');
if (btnRollEl) {
    btnRollEl.addEventListener('click', () => {
        const diceDisplay = document.getElementById('dice-result');
        const logDisplay = document.getElementById('dice-log');
        
        const quantidade = parseInt(document.getElementById('dice-qtd').value) || 1;
        const sides = parseInt(document.getElementById('dice-type').value) || 20;
        const modSign = document.getElementById('mod-sign') ? document.getElementById('mod-sign').value : '+';
        const modValue = parseInt(document.getElementById('dice-mod').value) || 0;

        diceDisplay.classList.add('rolling');
        diceDisplay.innerText = "🎲";

        setTimeout(() => {
            diceDisplay.classList.remove('rolling');
            
            let somaRolagensPuras = 0;
            let resultadosIndividuais = [];
            
            for (let i = 0; i < quantidade; i++) {
                let roll = Math.floor(Math.random() * sides) + 1;
                resultadosIndividuais.push(roll);
                somaRolagensPuras += roll;
            }
            
            if (currentUser && currentUser.toLowerCase() === 'diogenes' && resultadosIndividuais.length >= 2) {
                const temDuplo = resultadosIndividuais.some((val, i, arr) => arr.indexOf(val) !== i);
                if (temDuplo) {
                    tintaEspecialLiberada = true;
                    estoqueTintasDiogenes['preta'] = Math.floor(limiteTintaDiogenes / 2);
                    estoqueTintasDiogenes['branca'] = Math.floor(limiteTintaDiogenes / 2);
                    
                    alert("✨ DUPLO MÍSTICO! As tintas especiais (Preta e Branca) foram desbloqueadas e abastecidas!");
                    atualizarPainelTintasVisual();
                    salvarEstoqueNoFirebase();
                    renderizarCards(userGrimoire);
                }
            }
            
            let somaComKarma = somaRolagensPuras + (fatorKarma * quantidade);
            const valorMinimo = quantidade;
            const valorMaximo = sides * quantidade;
            if (somaComKarma > valorMaximo) somaComKarma = valorMaximo;
            if (somaComKarma < valorMinimo) somaComKarma = valorMinimo;

            let totalFinal = somaComKarma;
            if (modSign === '+') {
                totalFinal += modValue;
            } else {
                totalFinal -= modValue;
            }

            diceDisplay.innerText = totalFinal;

            const detalheDados = quantidade > 1 ? `[${resultadosIndividuais.join(', ')}]` : `${resultadosIndividuais[0]}`;
            const textoMod = modValue !== 0 ? ` ${modSign} ${modValue}` : '';
            
            const logEntry = document.createElement('div');
            logEntry.innerText = `${quantidade}D${sides} rolou ${detalheDados}${textoMod} = ${totalFinal}`;
            logDisplay.prepend(logEntry);

            registrarLog(`Rolou ${quantidade}D${sides} e obteve o resultado ${totalFinal}`);

            const textoParaChat = `🎲 <strong>${currentUser.toUpperCase()}</strong> rolou ${quantidade}D${sides}${textoMod}<br>Detalhes: ${detalheDados} ➔ <strong>Resultado: ${totalFinal}</strong>`;
            if (typeof window.enviarMensagemChat === "function") {
                window.enviarMensagemChat(textoParaChat, 'roll');
            }
        }, 400);
    });
}

const btnCalcEl = document.getElementById('btn-calc');
if (btnCalcEl) {
    btnCalcEl.addEventListener('click', () => {
        const input = document.getElementById('calc-input').value;
        const resultDisplay = document.getElementById('calc-result');
        try {
            const result = new Function('return ' + input)();
            if(isNaN(result)) throw new Error("Inválido");
            resultDisplay.innerText = result;
        } catch (error) {
            resultDisplay.innerText = "Erro na Formulação";
        }
    });
}

const btnShareDiceEl = document.getElementById('btn-share-dice');
if (btnShareDiceEl) {
    btnShareDiceEl.addEventListener('click', () => {
        const total = document.getElementById('dice-result').innerText;
        const logElements = document.getElementById('dice-log').children;
        let detalhe = logElements.length > 0 ? logElements[0].innerText : "";

        if (total === "-" || total === "🎲") return alert("Role os dados primeiro!");

        const texto = `🎲 *Rolagem do Destino de ${currentUser}* 🎲\n\nResultado Final: *${total}*\nDetalhes: _${detalhe}_\n\n🔮 _Enviado do Grimório Vivo_`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
    });
}

const btnShareCalcEl = document.getElementById('btn-share-calc');
if (btnShareCalcEl) {
    btnShareCalcEl.addEventListener('click', () => {
        const resultado = document.getElementById('calc-result').innerText;
        const expressao = document.getElementById('calc-input').value;

        if (resultado === "-" || resultado === "Erro na Formulação" || expressao.trim() === "") {
            return alert("Realize um cálculo válido primeiro!");
        }

        const texto = `🧮 *Cálculo (${currentUser})* 🧮\n\nEquação: ${expressao}\nResultado: *${resultado}*\n\n🔮 _Enviado do Grimório Vivo_`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank');
    });
}

// ==========================================
// 7. SISTEMA DE LOGS DO MESTRE
// ==========================================
function registrarLog(acao) {
    if (!currentUser) return; 
    const logRef = push(ref(db, 'system_logs'));
    const dataAtual = new Date();
    const horaFormatada = `${dataAtual.getHours().toString().padStart(2, '0')}:${dataAtual.getMinutes().toString().padStart(2, '0')}`;
    
    set(logRef, {
        jogador: currentUser,
        acao: acao,
        hora: horaFormatada,
        timestamp: Date.now()
    });
}

const DOM_GM = {
    modalAuth: document.getElementById('modal-gm-auth'),
    passInput: document.getElementById('gm-password-input'),
    btnSubmit: document.getElementById('btn-submit-gm-auth'),
    closeModal: document.getElementById('close-gm-modal'),
    logContainer: document.getElementById('master-log-container'),
    authTitle: document.getElementById('gm-auth-title'),
    authDesc: document.getElementById('gm-auth-desc')
};

const btnTabGmEl = document.getElementById('btn-tab-gm');
if (btnTabGmEl) {
    btnTabGmEl.addEventListener('click', (e) => {
        if (!isMasterAuthenticated) {
            e.preventDefault();
            const tabGm = document.getElementById('tab-gm');
            if (tabGm) tabGm.classList.add('hidden');
            btnTabGmEl.classList.remove('active');
            
            get(child(ref(db), `gm_settings/password`)).then((snapshot) => {
                if (snapshot.exists()) {
                    DOM_GM.authTitle.innerText = "O Selo do Mestre";
                    DOM_GM.authDesc.innerText = "Digite a senha para acessar os registros.";
                } else {
                    DOM_GM.authTitle.innerText = "Criar Selo do Mestre";
                    DOM_GM.authDesc.innerText = "Primeiro acesso detectado. Defina a senha mestre.";
                }
                if (DOM_GM.modalAuth) DOM_GM.modalAuth.style.display = 'flex';
            }).catch(() => alert("Erro nas correntes mágicas do banco de dados."));
        }
    });
}

if (DOM_GM.closeModal) DOM_GM.closeModal.onclick = () => DOM_GM.modalAuth.style.display = 'none';

if (DOM_GM.btnSubmit) {
    DOM_GM.btnSubmit.addEventListener('click', () => {
        const inputPass = DOM_GM.passInput.value;
        if (!inputPass) return alert("A senha não pode estar em branco.");

        get(child(ref(db), `gm_settings/password`)).then((snapshot) => {
            if (snapshot.exists()) {
                if (snapshot.val() === inputPass) {
                    liberarAcessoMestre();
                } else {
                    alert("Senha incorreta.");
                }
            } else {
                set(ref(db, 'gm_settings/password'), inputPass).then(() => {
                    alert("Senha mestre criada com sucesso!");
                    liberarAcessoMestre();
                });
            }
        });
    });
}

function liberarAcessoMestre() {
    isMasterAuthenticated = true;
    if (DOM_GM.modalAuth) DOM_GM.modalAuth.style.display = 'none';
    if (DOM_GM.passInput) DOM_GM.passInput.value = "";
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    
    if (btnTabGmEl) btnTabGmEl.classList.add('active');
    const tabGm = document.getElementById('tab-gm');
    if (tabGm) tabGm.classList.remove('hidden');

    iniciarEscutaDeLogs();
}

function iniciarEscutaDeLogs() {
    const logsRef = ref(db, 'system_logs');
    onValue(logsRef, (snapshot) => {
        if (!DOM_GM.logContainer) return;
        DOM_GM.logContainer.innerHTML = "";
        const data = snapshot.val();
        if (data) {
            const logsArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
            logsArray.forEach(log => {
                const div = document.createElement('div');
                div.className = 'log-entry';
                div.innerHTML = `<span class="log-time">[${log.hora}]</span> <span class="log-player">${log.jogador.toUpperCase()}</span>: ${log.acao}`;
                DOM_GM.logContainer.appendChild(div);
            });
        } else {
            DOM_GM.logContainer.innerHTML = "<p class='text-muted'>Nenhum registro encontrado.</p>";
        }
    });
}

const btnClearLogEl = document.getElementById('btn-clear-log');
if (btnClearLogEl) {
    btnClearLogEl.addEventListener('click', () => {
        if (confirm("Isto apagará todo o histórico de logs. Confirmar?")) {
            remove(ref(db, 'system_logs'));
        }
    });
}

// ==========================================
// 8. INVENTÁRIO E ALQUIMIA / FORJA
// ==========================================
function concluirCrafting(nomeItemCriado) {
    const nomeLower = nomeItemCriado.toLowerCase().trim();
    let corEncontrada = null;

    if (nomeLower.includes('vermelha')) corEncontrada = 'vermelha';
    else if (nomeLower.includes('azul')) corEncontrada = 'azul';
    else if (nomeLower.includes('amarela')) corEncontrada = 'amarela';

    if (corEncontrada) {
        estoqueTintasDiogenes[corEncontrada] = limiteTintaDiogenes;
        alert(`🧪 Pote Recarregado! Tinta ${corEncontrada.toUpperCase()} agora possui ${limiteTintaDiogenes} cargas.`);
        atualizarPainelTintasVisual();
        salvarEstoqueNoFirebase();
    }
}

function carregarInventarioDoFirebase() {
    if (!currentUser) return;
    const invRef = ref(db, 'inventory/' + currentUser);
    onValue(invRef, (snapshot) => {
        const data = snapshot.val();
        userInventory = [];
        if (data) {
            Object.keys(data).forEach(id => {
                userInventory.push({ id, ...data[id] });
            });
        }
        renderizarInventarioVisual(userInventory);
    });
}

function renderizarInventarioVisual(itens) {
    const grid = document.getElementById('craft-inventory-grid');
    if (!grid) return;
    grid.innerHTML = "";
    
    if (itens.length === 0) {
        grid.innerHTML = "<p class='text-muted w-full text-center' style='grid-column: 1/-1;'>Nenhum material na bolsa.</p>";
        return;
    }
    
    itens.forEach(item => {
        const icone = item.emoji ? item.emoji : "📦";
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `<div class="emoji">${icone}</div><div class="name">${item.nome}</div>`;
        div.onclick = () => selecionarParaForja(item, icone);
        grid.appendChild(div);
    });
}

function selecionarParaForja(item, icone) {
    listaDeMescla.push({ ...item, emojiVisual: icone });
    renderizarListaDeMescla();
}

function renderizarListaDeMescla() {
    const container = document.getElementById('forja-lista');
    if (!container) return;
    container.innerHTML = "";
    
    listaDeMescla.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-na-forja';
        div.innerHTML = `${item.emojiVisual} ${item.nome} <button onclick="removerItemDaForja(${index})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-weight:bold;">x</button>`;
        container.appendChild(div);
    });
    
    const statusEl = document.getElementById('status-forja');
    if (statusEl) {
        statusEl.innerText = listaDeMescla.length > 0 ? `Itens na forja: ${listaDeMescla.length}` : "Adicione itens do inventário para começar a mescla.";
    }
}

window.removerItemDaForja = function(index) {
    listaDeMescla.splice(index, 1);
    renderizarListaDeMescla();
};

const btnCraftVisualEl = document.getElementById('btn-craft-visual');
if (btnCraftVisualEl) {
    btnCraftVisualEl.addEventListener('click', () => {
        if (listaDeMescla.length < 2) return alert("Coloque pelo menos 2 materiais no caldeirão para mesclar!");
        
        const nomeItem = document.getElementById('craft-result-name').value.trim();
        const emojiItem = document.getElementById('craft-emoji-input').value.trim();

        if (!nomeItem || !emojiItem) return alert("Defina um nome e um emoji para o novo item!");

        btnCraftVisualEl.disabled = true;

        iniciarAnimacaoMagica(() => {
            const receitaCombinada = listaDeMescla.map(i => i.nome).join(" + ");
            
            const novoItemRef = push(ref(db, 'inventory/' + currentUser));
            set(novoItemRef, { 
                nome: nomeItem, 
                emoji: emojiItem,
                criadoEm: Date.now(),
                receita: receitaCombinada
            }).then(() => {
                listaDeMescla.forEach(item => {
                    if (item.id) remove(ref(db, `inventory/${currentUser}/${item.id}`));
                });

                concluirCrafting(nomeItem);

                if (typeof registrarLog === "function") {
                    registrarLog(`Forjou o item [${emojiItem} ${nomeItem}] combinando ${listaDeMescla.length} ingredientes.`);
                }
                
                alert(`Item Criado! ${emojiItem} ${nomeItem} foi adicionado ao seu Inventário.`);
                
                listaDeMescla = [];
                renderizarListaDeMescla();
                document.getElementById('craft-result-name').value = "";
                document.getElementById('craft-emoji-input').value = "";
                btnCraftVisualEl.disabled = false;
            });
        });
    });
}

const btnAddMaterialEl = document.getElementById('btn-add-material');
if (btnAddMaterialEl) {
    btnAddMaterialEl.addEventListener('click', () => {
        const nome = prompt("Nome do Material ou Ingrediente:");
        if (!nome) return;
        const emoji = prompt("Ícone / Emoji do Material:") || "📦";

        const novoMaterialRef = push(ref(db, 'inventory/' + currentUser));
        set(novoMaterialRef, { 
            nome: nome, 
            emoji: emoji,
            criadoEm: Date.now()
        }).then(() => {
            registrarLog(`Adicionou ao Inventário: ${emoji} ${nome}`);
        });
    });
}

function iniciarAnimacaoMagica(callbackFinal) {
    const canvas = document.getElementById('craft-canvas');
    if (!canvas) {
        callbackFinal();
        return;
    }
    const ctx = canvas.getContext('2d');
    const area = document.getElementById('crafting-area');
    if (!area) {
        callbackFinal();
        return;
    }
    
    canvas.width = area.clientWidth;
    canvas.height = area.clientHeight;
    
    const particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let animacaoAtiva = true;

    const listaContainer = document.getElementById('forja-lista');
    if (listaContainer) listaContainer.classList.add('forjando');

    for(let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            raio: Math.random() * 3 + 1,
            cor: `hsl(${Math.random() * 60 + 30}, 100%, 70%)`,
            velocidadeX: (Math.random() - 0.5) * 5,
            velocidadeY: (Math.random() - 0.5) * 5,
        });
    }

    function animar() {
        if (!animacaoAtiva) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
            ctx.fillStyle = p.cor;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.cor;
            ctx.fill();
            
            p.x += (centerX - p.x) * 0.05 + p.velocidadeX;
            p.y += (centerY - p.y) * 0.05 + p.velocidadeY;
        });

        requestAnimationFrame(animar);
    }

    animar();

    setTimeout(() => {
        animacaoAtiva = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (listaContainer) listaContainer.classList.remove('forjando');
        callbackFinal();
    }, 2000);
}

// ==========================================
// 9. SISTEMA DE PERFIL E FICHA DE PERSONAGEM
// ==========================================
const BibliotecaSistemas = {
    "KULT": {
        nome: "KULT: Divindade Perdida",
        tipoDado: 10,
        quantidadeDados: 2,
        atributosBase: {
            "Vontade": 0, "Fortitude": 0, "Reflexos": 0, "Razão": 0,
            "Intuição": 0, "Percepção": 0, "Carisma": 0, "Alma": 0,"Violencia": 0,"Firmesa": 0
        },
        calcularHpMax: (atributos) => 10 + (atributos["Fortitude"] || 0),
        custoXpPorNivel: 10
    },
    "Personalizado": {
        nome: "Sistema Personalizado",
        tipoDado: 20,
        quantidadeDados: 1,
        atributosBase: { "Força": 0, "Destreza": 0, "Mente": 0 },
        calcularHpMax: (atributos) => 10 + (atributos["Força"] || 0),
        custoXpPorNivel: 10
    }
};

function carregarFichaDoFirebase() {
    if (!currentUser) return;
    const fichaRef = ref(db, `characters/${currentUser}`);
    onValue(fichaRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            fichaAtual = data;
            let estado = fichaAtual.estadoAtual || 'saudavel';
            if (estado === 'fragmentado') {
                document.body.classList.add('glitch-extremo');
            } else {
                document.body.classList.remove('glitch-extremo');
            }
            renderizarPerfil();
        } else {
            const novaFicha = {
                nome: currentUser,
                sistema: "KULT",
                xp: 0,
                nivel: 1,
                ferimentos: { graves: 0, criticos: 0 },
                atributos: { ...BibliotecaSistemas["KULT"].atributosBase }
            };
            set(fichaRef, novaFicha);
        }
    });
}

function renderizarPerfil() {
    if (!fichaAtual) return;
    
    let sys = BibliotecaSistemas[fichaAtual.sistema] || BibliotecaSistemas["KULT"];
    
    const elNome = document.getElementById('nome-personagem');
    if (elNome) elNome.innerText = fichaAtual.nome.toUpperCase();
    
    const elSys = document.getElementById('sistema-personagem');
    if (elSys) elSys.innerText = sys.nome;
    
    const elXp = document.getElementById('display-xp');
    if (elXp) elXp.innerText = fichaAtual.xp;
  
    const medidorSanidade = document.getElementById('medidor-sanidade');
    if (medidorSanidade) medidorSanidade.value = fichaAtual.sanidade || 100;

    let estado = fichaAtual.estadoAtual || 'saudavel';
    let avatarLayers = [];
    
    if (fichaAtual.avatares) {
        if (fichaAtual.avatares['saudavel']) avatarLayers.push(fichaAtual.avatares['saudavel']);
        let eFisico = fichaAtual.estadoFisico || 'saudavel';
        let eMental = fichaAtual.estadoMental || 'sao';
        if (eFisico !== 'saudavel' && fichaAtual.avatares[eFisico]) avatarLayers.push(fichaAtual.avatares[eFisico]);
        if (eMental !== 'sao' && fichaAtual.avatares[eMental]) avatarLayers.push(fichaAtual.avatares[eMental]);
    }

    if (dadosNpc && dadosNpc.foto) avatarLayers = [dadosNpc.foto];

    const containerFichaImg = document.getElementById('imagem-perfil-ficha');
    if (containerFichaImg) {
        if (avatarLayers.length > 0) {
            containerFichaImg.innerHTML = `<img src="${avatarLayers[avatarLayers.length - 1]}" class="avatar-destaque" onclick="window.open(this.src, '_blank')" title="Clique para ampliar">`;
        } else {
            containerFichaImg.innerHTML = `<img src="https://via.placeholder.com/150" class="avatar-destaque">`;
        }
    }

    const areaUpar = document.getElementById('area-level-up');
    if (areaUpar) {
        if (fichaAtual.xp >= sys.custoXpPorNivel) {
            areaUpar.classList.remove('hidden');
        } else {
            areaUpar.classList.add('hidden');
        }
    }

    let painelAvatares = document.getElementById('painel-avatares-jogador');
    if (!painelAvatares) {
        const containerPerfil = document.querySelector('.card-perfil') || document.getElementById('app-screen');
        if (containerPerfil) {
            painelAvatares = document.createElement('div');
            painelAvatares.id = 'painel-avatares-jogador';
            painelAvatares.style.cssText = "margin: 15px 0; padding: 15px; background: rgba(0,0,0,0.5); border: 1px solid var(--borda-ouro); border-radius: 5px;";
            
            const estados = ['saudavel', 'ferido', 'grave', 'desacordado', 'insano', 'fragmentado'];
            let htmlInputs = `<h4 style="color: var(--borda-ouro); margin-top: 0;">Fotos de Perfil (Estados)</h4><div class="avatar-config-grid">`;
            
            estados.forEach(est => {
                htmlInputs += `
                    <div>
                        <label style="font-size: 0.75rem; text-transform: capitalize;">${est}</label>
                        <div style="display: flex; gap: 5px; align-items: center;">
                            <input type="text" id="avatar-${est}" class="input-mystic w-full" placeholder="URL ou selecione">
                            <button type="button" class="btn-mystic btn-galeria" data-estado="${est}" style="padding: 8px 12px; cursor: pointer;" title="Escolher arquivo">📁</button>
                        </div>
                    </div>
                `;
            });
            htmlInputs += `</div>
                <input type="file" id="input-arquivo-avatar" accept="image/*, video/*" style="display: none;">
                <button id="btn-salvar-avatares" class="btn-mystic w-full mt-15">Salvar Fotos</button>`;
            
            painelAvatares.innerHTML = htmlInputs;
            containerPerfil.appendChild(painelAvatares);

            let estadoSelecionadoParaUpload = null;
            const fileInputAvatar = document.getElementById('input-arquivo-avatar');

            painelAvatares.querySelectorAll('.btn-galeria').forEach(btn => {
                btn.onclick = (e) => {
                    estadoSelecionadoParaUpload = e.currentTarget.getAttribute('data-estado');
                    fileInputAvatar.click();
                };
            });

            fileInputAvatar.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file || !estadoSelecionadoParaUpload) return;

                const inputTarget = document.getElementById(`avatar-${estadoSelecionadoParaUpload}`);
                if (!inputTarget) return;

                const originalPlaceholder = inputTarget.placeholder;
                inputTarget.value = "";
                inputTarget.disabled = true;

                if (file.type.startsWith('video/')) {
                    inputTarget.placeholder = "Processando vídeo... ⏳";
                    if (file.size > 5 * 1024 * 1024) {
                        alert("Vídeo muito pesado! Máximo 5MB.");
                        inputTarget.disabled = false;
                        inputTarget.placeholder = originalPlaceholder;
                        e.target.value = '';
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function(uploadEvent) {
                        inputTarget.value = uploadEvent.target.result;
                        inputTarget.disabled = false;
                        inputTarget.placeholder = originalPlaceholder;
                    };
                    reader.readAsDataURL(file);
                    return;
                }

                inputTarget.placeholder = "Enviando para a nuvem... ⏳";
                const formData = new FormData();
                formData.append("image", file);

                try {
                    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();
                    if(data.success) {
                        inputTarget.value = data.data.url;
                    } else {
                        alert("Falha no upload.");
                    }
                } catch (err) {
                    alert("Erro de conexão.");
                }
                
                inputTarget.disabled = false;
                inputTarget.placeholder = originalPlaceholder;
                e.target.value = '';
            };

            const btnSalvarAvatares = document.getElementById('btn-salvar-avatares');
            if (btnSalvarAvatares) {
                btnSalvarAvatares.onclick = () => {
                    let avatares = {};
                    estados.forEach(est => {
                        const campo = document.getElementById(`avatar-${est}`);
                        if (campo) avatares[est] = campo.value;
                    });
                    update(ref(db, `characters/${currentUser}`), { avatares })
                        .then(() => alert('Fotos de perfil atualizadas!'))
                        .catch(err => console.error("Erro ao salvar avatares:", err));
                };
            }
        }
    }

    if (fichaAtual.avatares) {
        ['saudavel', 'ferido', 'grave', 'desacordado', 'insano', 'fragmentado'].forEach(est => {
             const input = document.getElementById(`avatar-${est}`);
             if (input && fichaAtual.avatares[est]) input.value = fichaAtual.avatares[est];
        });
    }

    const fGraves = fichaAtual.ferimentos ? fichaAtual.ferimentos.graves : 0;
    const penalidadeGrave = fGraves * -1; 

    const container = document.getElementById('botoes-atributos');
    if (container) {
        container.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 5px;";
        container.innerHTML = "";
        
        for (let attr in fichaAtual.atributos) {
            const valorBase = fichaAtual.atributos[attr];
            const valorFinal = valorBase + penalidadeGrave;
            
            const btn = document.createElement('button');
            btn.className = "btn-rolagem-rapida";
            btn.style.cssText = "background: #2a2a2a; border: 1px solid #444; padding: 4px 2px; border-radius: 4px; color: white; cursor: pointer; font-size: 0.75rem; line-height: 1.1; text-align: center;";
            btn.innerText = `${attr}\n(${valorFinal >= 0 ? '+' : ''}${valorFinal})`;
            
            btn.onclick = () => {
                document.getElementById('dice-qtd').value = sys.quantidadeDados;
                document.getElementById('dice-type').value = sys.tipoDado;
                document.getElementById('dice-mod').value = Math.abs(valorFinal);
                document.getElementById('mod-sign').value = valorFinal >= 0 ? '+' : '-';
                
                document.getElementById('btn-roll').click();
                
                setTimeout(() => {
                    const resultadoApp = document.getElementById('dice-result').innerText;
                    const logElements = document.getElementById('dice-log').children;
                    let detalheLog = logElements.length > 0 ? logElements[0].innerText : `${sys.quantidadeDados}D${sys.tipoDado}`;
                    const textoChatFicha = `Teste de Atributo: ${attr} (${sys.nome})\nDetalhes: ${detalheLog}\n**${resultadoApp}**`;
                    
                    if (typeof window.enviarMensagemChat === "function") {
                        window.enviarMensagemChat(textoChatFicha, 'roll');
                    }

                    const modalAntigo = document.getElementById('modal-rolagem-custom');
                    if (modalAntigo) modalAntigo.remove();
                    
                    const modal = document.createElement('div');
                    modal.id = 'modal-rolagem-custom';
                    modal.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 15px;";
                    
                    modal.innerHTML = `
                        <div style="background: #1e1e1e; border: 1px solid #444; padding: 20px; border-radius: 8px; width: 100%; max-width: 300px; text-align: center; color: white; box-shadow: 0 4px 15px rgba(0,0,0,0.6);">
                            <h3 style="margin-top: 0; color: #4af; font-size: 1.1rem; margin-bottom: 5px;">Resultado do Teste</h3>
                            <p style="font-size: 0.85rem; color: #bbb; margin: 0 0 10px 0;">${attr} (${sys.nome})</p>
                            
                            <div style="font-size: 2.5rem; font-weight: bold; background: #111; padding: 12px; border-radius: 6px; margin: 10px 0; color: #0f0; border: 1px solid #333;">
                                ${resultadoApp}
                            </div>
                            
                            <p style="font-size: 0.75rem; color: #888; margin-bottom: 15px;">Detalhes: ${detalheLog}</p>
                            <button id="btn-fechar-modal" style="width: 100%; background: #444; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">Fechar</button>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    document.getElementById('btn-fechar-modal').onclick = () => modal.remove();
                    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                }, 450);
                
                registrarLog(`Testou ${attr} (${sys.nome}).`);
            };
            container.appendChild(btn);
        }
    }

    let painelFerimentos = document.getElementById('painel-ferimentos-jogador');
    if (!painelFerimentos) {
        const containerPerfil = document.querySelector('.card-perfil') || document.getElementById('app-screen');
        if (containerPerfil) {
            painelFerimentos = document.createElement('div');
            painelFerimentos.id = 'painel-ferimentos-jogador';
            painelFerimentos.style.cssText = "margin: 10px 0; padding: 6px 10px; background: rgba(50,0,0,0.3); border: 1px solid #600; border-radius: 4px;";
            containerPerfil.appendChild(painelFerimentos);
        }
    }

    if (painelFerimentos) {
        const fCriticos = fichaAtual.ferimentos ? fichaAtual.ferimentos.criticos : 0;
        painelFerimentos.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
                <span>⚠️ Graves: <strong>${fGraves}/4</strong> ${fGraves > 0 ? `(Mod: ${penalidadeGrave})` : ''}</span>
                <span style="color: ${fCriticos > 0 ? '#ff4444' : 'inherit'}">💀 Críticos: <strong>${fCriticos}/1</strong></span>
            </div>
        `;
    }

    const containerEditor = document.getElementById('lista-editor-atributos');
    if (containerEditor) {
        containerEditor.innerHTML = '';
        if (fichaAtual.atributos) {
            for (const [nome, valor] of Object.entries(fichaAtual.atributos)) {
                adicionarLinhaEditor(nome, valor);
            }
        }
    }
}

const btnSalvarJson = document.getElementById('btn-salvar-json');
if (btnSalvarJson) {
    btnSalvarJson.onclick = async () => {
        const jsonText = document.getElementById('json-editor-ficha').value;
        try {
            const novaFichaParsed = JSON.parse(jsonText);
            if (!currentUser) return alert("Erro: Nenhum usuário logado!");
            const charRef = ref(db, `characters/${currentUser}`);
            await set(charRef, novaFichaParsed);
            alert("Ficha atualizada com sucesso!");
            fichaAtual = novaFichaParsed;
            renderizarPerfil();
            registrarLog(`${currentUser} atualizou sua ficha via editor JSON.`);
        } catch (e) {
            alert("Erro de sintaxe no JSON: " + e.message);
        }
    };
}

const btnUparAttr = document.getElementById('btn-upar-atributo');
if (btnUparAttr) {
    btnUparAttr.onclick = () => {
        if (!fichaAtual) return;
        const sys = BibliotecaSistemas[fichaAtual.sistema] || BibliotecaSistemas["KULT"];
        const atributoEscolhido = prompt(`Subiu de nível! Digite o nome exato do atributo:\n${Object.keys(fichaAtual.atributos).join(", ")}`);
        if (atributoEscolhido && fichaAtual.atributos[atributoEscolhido] !== undefined) {
            const novoXp = fichaAtual.xp - sys.custoXpPorNivel;
            const novoValorAttr = fichaAtual.atributos[atributoEscolhido] + 1;
            const novoNivel = fichaAtual.nivel + 1;
            update(ref(db, `characters/${currentUser}`), {
                xp: novoXp,
                nivel: novoNivel,
                [`atributos/${atributoEscolhido}`]: novoValorAttr
            }).then(() => alert(`${atributoEscolhido} aprimorado!`));
        } else {
            alert("Atributo inválido ou cancelado.");
        }
    };
}

// ==========================================
// 10. FERRAMENTAS DO MESTRE E MISSÕES
// ==========================================
const btnGmXpEl = document.getElementById('btn-gm-xp');
if (btnGmXpEl) {
    btnGmXpEl.onclick = async () => {
        const valor = parseInt(document.getElementById('gm-mod-valor').value);
        const alvo = document.getElementById('gm-select-alvo').value;

        if (!alvo) return alert("Selecione um jogador!");
        if (isNaN(valor)) return alert("Digite um valor numérico válido.");
        
        const charRef = ref(db, `characters/${alvo}`);
        const snapshot = await get(charRef);
        
        if (!snapshot.exists()) return alert("Personagem não encontrado.");
        
        const dadosChar = snapshot.val();
        const qtdXp = Math.abs(valor);
        const novoXp = (dadosChar.xp || 0) + qtdXp; 
        
        update(charRef, { xp: novoXp }).then(() => {
            alert(`${qtdXp} XP concedido para ${alvo.toUpperCase()}. Total: ${novoXp}`);
            registrarLog(`GM concedeu ${qtdXp} XP para ${alvo}.`);
        });
    };
}

const btnGmMudarEstadoEl = document.getElementById('btn-gm-mudar-estado');
if (btnGmMudarEstadoEl) {
    btnGmMudarEstadoEl.onclick = () => {
        const alvo = document.getElementById('gm-select-alvo').value;
        const novoFisico = document.getElementById('gm-select-estado-fisico').value;
        const novoMental = document.getElementById('gm-select-estado-mental').value;
        
        if (!alvo) return alert("Selecione um alvo na lista!");
        
        update(ref(db, `characters/${alvo}`), { estadoFisico: novoFisico, estadoMental: novoMental }).then(() => {
            alert(`O estado de ${alvo.toUpperCase()} foi atualizado!`);
            registrarLog(`GM alterou o estado de ${alvo}.`);
        });
    };
}

const btnGmFalarPlayerEl = document.getElementById('btn-gm-falar-player');
if (btnGmFalarPlayerEl) {
    btnGmFalarPlayerEl.onclick = () => {
        const alvo = document.getElementById('gm-select-alvo').value;
        if (!alvo) return alert("Selecione um alvo!");
        
        const texto = prompt(`Digite a mensagem que você quer enviar como se fosse ${alvo}:`);
        if (texto) {
            window.enviarMensagemChat(texto, 'chat', alvo, true); 
            registrarLog(`GM falou como o jogador ${alvo}.`);
        }
    };
}

const btnGmFerimentoEl = document.getElementById('btn-gm-ferimento');
if (btnGmFerimentoEl) {
    btnGmFerimentoEl.onclick = async () => {
        const alvo = document.getElementById('gm-select-alvo').value;
        const tipo = prompt("Digite o tipo de ferimento: 'grave' ou 'critico'");
        const acao = prompt("Deseja 'adicionar' ou 'curar'?");

        if (!alvo) return alert("Selecione um jogador primeiro!");
        if (tipo !== 'grave' && tipo !== 'critico') return alert("Tipo inválido. Use 'grave' ou 'critico'.");

        const charRef = ref(db, `characters/${alvo}`);
        const snapshot = await get(charRef);
        if (!snapshot.exists()) return alert("Personagem não encontrado.");

        const dados = snapshot.val();
        let graves = dados.ferimentos ? dados.ferimentos.graves : 0;
        let criticos = dados.ferimentos ? dados.ferimentos.criticos : 0;

        if (acao === 'adicionar') {
            if (tipo === 'grave') {
                if (graves < 4) {
                    graves++;
                } else {
                    graves = 4;
                    criticos++;
                    alert("⚠️ Limite de Graves estourou! Tornou-se CRÍTICO!");
                }
            } else if (tipo === 'critico') {
                criticos++;
            }
        } else if (acao === 'curar') {
            if (tipo === 'grave' && graves > 0) graves--;
            if (tipo === 'critico' && criticos > 0) criticos--;
        }

        update(charRef, { ferimentos: { graves, criticos } }).then(() => {
            alert(`Ferimentos de ${alvo.toUpperCase()} atualizados!`);
            registrarLog(`GM alterou os ferimentos de ${alvo}.`);
        });
    };
}

const missoesRef = ref(db, 'quests');
onValue(missoesRef, (snapshot) => {
    const data = snapshot.val();
    const lista = document.getElementById('lista-missoes');
    if (!lista) return;
    lista.innerHTML = "";
    
    if (data) {
        Object.keys(data).forEach(key => {
            const m = data[key];
            const div = document.createElement('div');
            div.style.cssText = "padding: 5px; border-bottom: 1px solid #555; display: flex; justify-content: space-between;";
            
            let btnApagar = isMasterAuthenticated ? `<button onclick="apagarMissao('${key}')" style="color:red; background:none; border:none; cursor:pointer; font-weight:bold;">X</button>` : "";
            div.innerHTML = `<span>${m.texto}</span> ${btnApagar}`;
            lista.appendChild(div);
        });
    } else {
        lista.innerHTML = "<span style='color: #888;'>Nenhuma missão ativa.</span>";
    }
});

const btnAddMissaoEl = document.getElementById('btn-add-missao');
if (btnAddMissaoEl) {
    btnAddMissaoEl.onclick = () => {
        const textoInput = document.getElementById('gm-missao-texto');
        const texto = textoInput.value.trim();
        if (texto) {
            push(ref(db, 'quests'), { texto, data: Date.now() }).then(() => {
                textoInput.value = "";
                registrarLog(`GM adicionou uma nova missão.`);
            });
        }
    };
}

window.apagarMissao = function(key) {
    if (confirm("Remover esta missão?")) {
        remove(ref(db, `quests/${key}`));
    }
};

const selectAlvoGm = document.getElementById('gm-select-alvo');
if (selectAlvoGm) {
    onValue(ref(db, 'characters'), (snapshot) => {
        selectAlvoGm.innerHTML = '<option value="">Selecione um jogador...</option>';
        if (snapshot.exists()) {
            const personagens = snapshot.val();
            Object.keys(personagens).forEach(key => {
                const dados = personagens[key];
                const option = document.createElement('option');
                option.value = key;
                option.textContent = dados.nome ? dados.nome : key;
                selectAlvoGm.appendChild(option);
            });
        }
    });
}

// ==========================================
// 11. EDITOR VISUAL DE ATRIBUTOS
// ==========================================
function adicionarLinhaEditor(nome = "", valor = 0) {
    const container = document.getElementById('lista-editor-atributos');
    if (!container) return; 
    
    const div = document.createElement('div');
    div.style.cssText = "display: flex; gap: 5px; align-items: center; width: 100%; margin-bottom: 5px;";
    div.innerHTML = `
        <input type="text" class="input-mystic nome-attr" value="${nome}" placeholder="Nome" style="flex: 2; min-width: 0; box-sizing: border-box; padding: 6px; font-size: 0.85rem;">
        <input type="number" class="input-mystic valor-attr" value="${valor}" placeholder="Valor" style="flex: 1; min-width: 0; box-sizing: border-box; text-align: center; padding: 6px; font-size: 0.85rem;">
        <button class="btn-remover-attr" style="background: #8b0000; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-weight: bold; flex-shrink: 0;">X</button>
    `;

    div.querySelector('.btn-remover-attr').onclick = () => div.remove();
    container.appendChild(div);
}

const btnNovoAttr = document.getElementById('btn-novo-atributo');
if (btnNovoAttr) {
    btnNovoAttr.addEventListener('click', () => {
        adicionarLinhaEditor("", 0);
    });
}

const btnSalvarEditor = document.getElementById('btn-salvar-editor');
if (btnSalvarEditor) {
    btnSalvarEditor.addEventListener('click', () => {
        if (!currentUser) return alert("Nenhum usuário logado!");

        const novosAtributos = {};
        const linhas = document.querySelectorAll('#lista-editor-atributos > div');
        
        linhas.forEach(linha => {
            const nome = linha.querySelector('.nome-attr').value.trim();
            const valor = parseInt(linha.querySelector('.valor-attr').value) || 0;
            if (nome) novosAtributos[nome] = valor;
        });

        set(ref(db, `characters/${currentUser}/atributos`), novosAtributos)
            .then(() => alert("Atributos salvos com sucesso!"))
            .catch(erro => alert("Erro ao salvar: " + erro));
    });
}

// ==========================================
// 12. CONSUMO DE TINTA (DIÓGENES)
// ==========================================
function gerenciarMarcadorTintaDiogenes() {
    let painelTinta = document.getElementById('painel-tinta-diogenes');
    
    if (currentUser && currentUser.toLowerCase() === 'diogenes') {
        if (!painelTinta) {
            const gridMagias = document.getElementById('lista-efeitos');
            if (gridMagias && gridMagias.parentNode) {
                painelTinta = document.createElement('div');
                painelTinta.id = 'painel-tinta-diogenes';
                painelTinta.style.cssText = "background: rgba(20, 20, 20, 0.95); border: 1px solid #c9b037; padding: 10px; border-radius: 6px; margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px; color: #fff; font-size: 0.85rem; width: 100%; box-sizing: border-box;";
                
                painelTinta.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 5px;">
                        <div>
                            🖋️ <strong>Qualidade:</strong> 
                            <select id="select-qualidade-tinta" style="background: #111; color: #fff; border: 1px solid #555; padding: 3px; border-radius: 4px; font-size: 0.8rem;">
                                <option value="ruim">Ruim (2)</option>
                                <option value="boa" selected>Boa (5)</option>
                                <option value="perfeita">Perfeita (10)</option>
                            </select>
                        </div>
                        <div id="status-tinta-especial" style="color: ${tintaEspecialLiberada ? '#0f0' : '#888'}; font-size: 0.75rem;">
                            ${tintaEspecialLiberada ? '🔓 P/B Liberadas' : '🔒 P/B Bloqueadas (Role Duplo)'}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; justify-content: space-around; background: #111; padding: 6px; border-radius: 4px; border: 1px solid #333; font-size: 0.75rem;">
                        <span>🔴 V: <strong id='estoque-vermelha'>${estoqueTintasDiogenes.vermelha}</strong></span>
                        <span>🔵 A: <strong id='estoque-azul'>${estoqueTintasDiogenes.azul}</strong></span>
                        <span>🟡 Am: <strong id='estoque-amarela'>${estoqueTintasDiogenes.amarela}</strong></span>
                        <span>⚫ P: <strong id='estoque-preta'>${estoqueTintasDiogenes.preta}</strong></span>
                        <span>⚪ B: <strong id='estoque-branca'>${estoqueTintasDiogenes.branca}</strong></span>
                        <span>🟣 M: <strong id='estoque-mescla'>${estoqueTintasDiogenes.mescla}</strong></span>
                    </div>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; border-top: 1px solid #333; padding-top: 6px;">
                        <button class="btn-filtro-cor" data-cor="todos" style="background: #333; color: #fff; border: 1px solid #555; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Todas</button>
                        <button class="btn-filtro-cor" data-cor="vermelha" style="background: #8b0000; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Vermelha</button>
                        <button class="btn-filtro-cor" data-cor="azul" style="background: #00008b; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Azul</button>
                        <button class="btn-filtro-cor" data-cor="amarela" style="background: #b8860b; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Amarela</button>
                        <button class="btn-filtro-cor" data-cor="preta" style="background: #222; color: #fff; border: 1px solid #555; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Preta</button>
                        <button class="btn-filtro-cor" data-cor="branca" style="background: #ddd; color: #000; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Branca</button>
                        <button class="btn-filtro-cor" data-cor="mescla" style="background: #551a8b; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Mescla</button>
                    </div>
                `;
                
                gridMagias.parentNode.insertBefore(painelTinta, gridMagias);
                
                const selectQualidade = document.getElementById('select-qualidade-tinta');
                if (selectQualidade) {
                    selectQualidade.onchange = (e) => salvarEAtualizarTinta(e.target.value);
                }
                
                painelTinta.querySelectorAll('.btn-filtro-cor').forEach(btn => {
                    btn.onclick = (e) => {
                        filtroCorDiogenes = e.target.getAttribute('data-cor');
                        painelTinta.querySelectorAll('.btn-filtro-cor').forEach(b => b.style.outline = 'none');
                        e.target.style.outline = '2px solid #fff';
                        renderizarCards(userGrimoire);
                    };
                });
            }
        } else {
            painelTinta.style.display = 'flex';
        }
        carregarTintaDoFirebase();
    } else {
        if (painelTinta) painelTinta.style.display = 'none';
    }
}

function salvarEAtualizarTinta(qualidade) {
    const limites = { ruim: 2, boa: 5, perfeita: 10 };
    limiteTintaDiogenes = limites[qualidade] || 5;
    
    renderizarCards(userGrimoire);
    set(ref(db, `characters/diogenes/qualidadeTinta`), {
        qualidade: qualidade,
        limite: limiteTintaDiogenes
    });
}

function carregarTintaDoFirebase() {
    const tintaRef = ref(db, `characters/diogenes/qualidadeTinta`);
    onValue(tintaRef, (snapshot) => {
        const dados = snapshot.val();
        if (dados && dados.qualidade) {
            const select = document.getElementById('select-qualidade-tinta');
            if (select) select.value = dados.qualidade;
            limiteTintaDiogenes = dados.limite || 5;
            renderizarCards(userGrimoire);
        }
    }, { onlyOnce: true });
}

function usarEfeitoDiogenes(efeito) {
    if (!currentUser || currentUser.toLowerCase() !== 'diogenes') return true;

    const coresNecessarias = [];
    if (efeito.cor !== 'mescla') {
        coresNecessarias.push(efeito.cor);
    } else {
        const receitaLower = efeito.receita.toLowerCase();
        if (receitaLower.includes('todas')) {
            coresNecessarias.push('vermelha', 'azul', 'amarela', 'preta', 'branca');
        } else {
            if (receitaLower.includes('vermelh')) coresNecessarias.push('vermelha');
            if (receitaLower.includes('azul')) coresNecessarias.push('azul');
            if (receitaLower.includes('amarel')) coresNecessarias.push('amarela');
            if (receitaLower.includes('pret')) coresNecessarias.push('preta');
            if (receitaLower.includes('branc')) coresNecessarias.push('branca');
        }
    }

    const tintasFaltando = [];
    coresNecessarias.forEach(cor => {
        if (!estoqueTintasDiogenes[cor] || estoqueTintasDiogenes[cor] <= 0) {
            tintasFaltando.push(cor.toUpperCase());
        }
    });

    if (tintasFaltando.length > 0) {
        alert(`❌ Tinta insuficiente! Faltam cargas de: ${tintasFaltando.join(', ')}.`);
        return false;
    }

    coresNecessarias.forEach(cor => {
        estoqueTintasDiogenes[cor]--;
    });

    atualizarPainelTintasVisual();
    salvarEstoqueNoFirebase();

    const detalheConsumo = coresNecessarias.map(c => c.toUpperCase()).join(' + ');
    registrarLog(`Diógenes conjurou "${efeito.nome}" gastando [${detalheConsumo}].`);
    return true;
}

function atualizarPainelTintasVisual() {
    ['vermelha', 'azul', 'amarela', 'preta', 'branca', 'mescla'].forEach(cor => {
        const el = document.getElementById(`estoque-${cor}`);
        if (el) el.innerText = estoqueTintasDiogenes[cor];
    });
}

function salvarEstoqueNoFirebase() {
    set(ref(db, `characters/diogenes/estoqueTintas`), estoqueTintasDiogenes);
}

// ==========================================
// 13. CHAT VTT E SISTEMA DE MÍDIAS
// ==========================================
window.aprovarFirebase = function(caminho) {
    update(ref(db, caminho), { aprovado: true });
};

function formatarTextoChat(texto) {
    if (!texto) return '';
    let esc = texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    esc = esc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    esc = esc.replace(/\*(.*?)\*/g, '<em>$1</em>');
    esc = esc.replace(/\n/g, '<br>');
    esc = esc.replace(/@(\w+)/gi, '<span class="mencao">@$1</span>');
    return esc;
}

function escutarMuralFitas() {
    onValue(ref(db, 'mural_fitas'), (snapshot) => {
        const container = document.getElementById('mural-fitas-container');
        if (!container) return;
        container.innerHTML = "";
        if (snapshot.exists()) {
            const fitas = snapshot.val();
            Object.keys(fitas).forEach(id => {
                const item = fitas[id];
                const div = document.createElement('div');
                div.className = 'fita-item';
                div.style.cssText = "padding: 8px; margin-bottom: 8px; background: rgba(0,0,0,0.4); border: 1px solid #444; border-radius: 4px;";
                div.innerHTML = `
                    <strong>${item.titulo || 'Mídia'}</strong><br>
                    <a href="${item.url}" target="_blank" style="color: #4af;">Abrir Link/Mídia</a>
                `;
                container.appendChild(div);
            });
        }
    });
}

function iniciarChatAvancado() {
    const isGM = (currentUser.toLowerCase() === 'mestre' || currentUser.toLowerCase() === 'gm');
    
    const btnGmChatMenu = document.getElementById('btn-gm-chat-menu');
    const gmUploadBoard = document.getElementById('gm-upload-board');
    if (btnGmChatMenu && isGM) btnGmChatMenu.classList.remove('hidden');
    if (gmUploadBoard && isGM) gmUploadBoard.classList.remove('hidden');

    update(ref(db, 'canais/taverna'), { nome: 'Taverna', aprovado: true, criador: 'Sistema' });

    onValue(ref(db, 'configuracoes/destino_rolagens'), (snapshot) => {
        if (snapshot.exists()) {
            canalRolagemDestino = snapshot.val();
            if (isGM) {
                const gmSelect = document.getElementById('gm-roll-dest');
                if(gmSelect) gmSelect.value = canalRolagemDestino;
            }
        }
    });

    onValue(ref(db, 'gm_settings/chat_bg'), (snapshot) => {
        const bgContainer = document.getElementById('chat-fundo');
        if (bgContainer) {
            if(snapshot.exists() && snapshot.val() !== "") {
                bgContainer.style.backgroundImage = `url('${snapshot.val()}')`;
            } else {
                bgContainer.style.backgroundImage = "none";
            }
        }
    });

    onValue(ref(db, 'mutes/' + currentUser.toLowerCase()), (snapshot) => {
        const data = snapshot.val();
        const chatInput = document.getElementById('chat-input');
        const btnSend = document.getElementById('btn-send-chat');
        const muteWarning = document.getElementById('mute-warning');

        if (data && data.expiraEm > Date.now()) {
            jogadorSilenciado = true;
            if (chatInput) chatInput.disabled = true;
            if (btnSend) btnSend.disabled = true;
            if (muteWarning) muteWarning.style.display = 'block';
        } else {
            jogadorSilenciado = false;
            if (chatInput) chatInput.disabled = false;
            if (btnSend) btnSend.disabled = false;
            if (muteWarning) muteWarning.style.display = 'none';
        }
    });

    onValue(ref(db, 'canais'), (snapshot) => {
        const lista = document.getElementById('channel-list');
        if (!lista) return;
        lista.innerHTML = "";

        snapshot.forEach(child => {
            const canal = { id: child.key, ...child.val() };
            if (canal.aprovado || (canal.criador && canal.criador.toLowerCase() === currentUser.toLowerCase()) || isGM) {
                const btn = document.createElement('button');
                btn.className = `channel-btn ${canal.id === canalAtual ? 'active' : ''}`;
                btn.innerText = canal.aprovado ? `# ${canal.nome}` : `⏳ ${canal.nome}`;
                btn.onclick = () => {
                    if(!canal.aprovado && !isGM) return alert("Aguarde o Mestre aprovar este canal.");
                    mudarCanal(canal.id, canal.nome);
                };
                lista.appendChild(btn);
            }
        });
    });

    mudarCanal('taverna', 'Taverna');
    escutarMuralFitas();
    configurarEnvioMensagensDOM();
}

function configurarEnvioMensagensDOM() {
    const btnSend = document.getElementById('btn-send-chat');
    const chatInput = document.getElementById('chat-input');

    const acaoEnviar = () => {
        if (!chatInput) return;
        const texto = chatInput.value.trim();
        if (!texto) return;

        let npcNome = null;
        const selectNpc = document.getElementById('select-npc-salvo');
        if (selectNpc && selectNpc.value) {
            const npcObj = npcsSalvos[selectNpc.value];
            if (npcObj) npcNome = npcObj.nome;
        }

        window.enviarMensagemChat(texto, npcNome ? 'npc' : 'chat', npcNome);
        chatInput.value = '';
    };

    if (btnSend) btnSend.onclick = acaoEnviar;
    if (chatInput) {
        chatInput.onkeypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                acaoEnviar();
            }
        };
    }
}

window.abrirModalGmChat = function() {
    const modal = document.getElementById('modal-gm-chat-controls');
    if (modal) modal.style.display = 'flex';
};

window.fecharModalGmChat = function() {
    const modal = document.getElementById('modal-gm-chat-controls');
    if (modal) modal.style.display = 'none';
};

function escutarNpcsSalvos() {
    onValue(ref(db, 'npcs'), (snapshot) => {
        const select = document.getElementById('select-npc-salvo');
        if (!select) return;
        select.innerHTML = '<option value="">👤 Falar como Mim Mesmo</option>';
        if(snapshot.exists()) {
            npcsSalvos = snapshot.val();
            Object.keys(npcsSalvos).forEach(id => {
                select.innerHTML += `<option value="${id}">${npcsSalvos[id].nome}</option>`;
            });
        }
    });
}

function configurarUploadImgBB(idFileInput, idTextInput) {
    const fileInput = document.getElementById(idFileInput);
    if (!fileInput) return;

    fileInput.setAttribute('accept', 'image/*, video/*');

    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const textInput = document.getElementById(idTextInput);
        if (!textInput) return;
        const originalPlaceholder = textInput.placeholder;
        textInput.value = "";
        textInput.disabled = true;

        if (file.type.startsWith('video/')) {
            textInput.placeholder = "Processando vídeo... ⏳";
            if (file.size > 5 * 1024 * 1024) {
                alert("Vídeo maior que 5MB. Envie um link externo!");
                textInput.disabled = false;
                textInput.placeholder = originalPlaceholder;
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                textInput.value = uploadEvent.target.result;
                textInput.disabled = false;
                textInput.placeholder = originalPlaceholder;
            };
            reader.readAsDataURL(file);
            return;
        }

        textInput.placeholder = "Fazendo upload... ⏳";
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if(data.success) {
                textInput.value = data.data.url;
            } else {
                alert("Falha no upload via ImgBB.");
            }
        } catch (err) {
            alert("Erro de conexão.");
        }
        
        textInput.disabled = false;
        textInput.placeholder = originalPlaceholder;
        e.target.value = '';
    });
}

configurarUploadImgBB('upload-midia', 'chat-input');
configurarUploadImgBB('upload-mural', 'link-arquivo');
configurarUploadImgBB('upload-chat-bg', 'input-chat-bg');
configurarUploadImgBB('upload-npc-foto', 'novo-npc-foto');

window.setarResposta = function(nomeUsuario) {
    respondendoA = nomeUsuario;
    const replyUser = document.getElementById('reply-user');
    const replyPreview = document.getElementById('reply-preview');
    if (replyUser) replyUser.innerText = nomeUsuario.toUpperCase();
    if (replyPreview) replyPreview.classList.remove('hidden');
    const input = document.getElementById('chat-input');
    if (input) input.focus();
};

window.cancelarResposta = function() {
    respondendoA = null;
    const replyPreview = document.getElementById('reply-preview');
    if (replyPreview) replyPreview.classList.add('hidden');
};

function mudarCanal(idCanal, nomeCanal) {
    canalAtual = idCanal;
    document.querySelectorAll('.channel-btn').forEach(btn => {
        btn.classList.remove('active');
        if(btn.innerText.includes(nomeCanal)) btn.classList.add('active');
    });

    if (unsubscribeChat) unsubscribeChat();
    
    unsubscribeChat = onValue(ref(db, `mensagens/${canalAtual}`), (snapshot) => {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        container.innerHTML = ""; 
        
        const isGM = (currentUser.toLowerCase() === 'mestre' || currentUser.toLowerCase() === 'gm');
        const mensagens = [];
        snapshot.forEach(child => { mensagens.push({ id: child.key, ...child.val() }); });
        
        mensagens.forEach(msg => {
            let tipo = 'other';
            const remetenteRaw = msg.falarComo || msg.remetente || 'Sistema';
            let nomeExibicao = remetenteRaw.toUpperCase();

            if (msg.tipo === 'roll') { 
                tipo = 'roll'; 
                nomeExibicao = '🎲 DADOS'; 
            } else if (msg.tipo === 'npc') { 
                tipo = 'npc'; 
            } else if (remetenteRaw.toLowerCase() === currentUser.toLowerCase()) { 
                tipo = 'mine'; 
            } else if (remetenteRaw.toLowerCase() === 'mestre' || remetenteRaw.toLowerCase() === 'gm') { 
                tipo = 'gm'; 
                nomeExibicao = '👑 MESTRE'; 
            }
            
            const hora = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--';
            const textoUpper = (msg.texto || '').toUpperCase();
            const foiMarcado = textoUpper.includes(`@${currentUser.toUpperCase()}`) || (msg.replyTo && msg.replyTo.toUpperCase() === currentUser.toUpperCase());
            
            const htmlBolinha = foiMarcado ? `<div class="notificacao-marcado"></div>` : '';
            const htmlReply = msg.replyTo ? `<div class="reply-badge">↳ Respondendo a ${msg.replyTo.toUpperCase()}</div>` : '';

            let htmlAvatar = '';
            if (msg.avatarUrl) {
                htmlAvatar = `<img src="${msg.avatarUrl}" class="chat-avatar-img" alt="Avatar">`;
            } else if (tipo !== 'roll') {
                htmlAvatar = `<img src="https://via.placeholder.com/40" class="chat-avatar-img" alt="Avatar">`;
            }

            let textoRenderizado = formatarTextoChat(msg.texto || '');
            if (textoRenderizado.match(/\.(jpeg|jpg|gif|png)$/i)) {
                textoRenderizado = `<a href="${textoRenderizado}" target="_blank"><img src="${textoRenderizado}" class="chat-media"></a>`;
            } else if (textoRenderizado.match(/\.(mp4|webm)$/i)) {
                textoRenderizado = `<video src="${textoRenderizado}" class="chat-media" controls></video>`;
            }

            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-bubble ${tipo}`;
            
            let btnOpcoes = `<button onclick="setarResposta('${remetenteRaw}')" style="background:none; border:none; color:#888; cursor:pointer; font-size:0.7rem;">💬 responder</button>`;
            if (isGM) {
                btnOpcoes += ` <button onclick="deletarMensagem('${msg.id}')" style="background:none; border:none; color:#f44; cursor:pointer; font-size:0.7rem;">🗑️</button>`;
            }

            msgDiv.innerHTML = `
                ${htmlBolinha}
                ${htmlAvatar}
                <div style="flex: 1; overflow: hidden;">
                    <div class="chat-header">
                        <strong>${nomeExibicao}</strong> <span style="color:#666; font-size:0.65rem;">(${hora})</span>
                    </div>
                    ${htmlReply}
                    <div style="margin-top: 4px; word-wrap: break-word;">${textoRenderizado}</div>
                    <div style="text-align: right; margin-top: 2px;">${btnOpcoes}</div>
                </div>
            `;
            
            container.appendChild(msgDiv);
        });
        
        container.scrollTop = container.scrollHeight;
    });
}

window.deletarMensagem = function(msgId) {
    if (confirm("Apagar mensagem do chat?")) {
        remove(ref(db, `mensagens/${canalAtual}/${msgId}`));
    }
};

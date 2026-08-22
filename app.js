// Importações do Firebase v9 (SDK Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
// ==========================================
// 1. CONFIGURAÇÃO DO FIREBASE
// COLOQUE SUAS CHAVES AQUI, MESTRE!
// ==========================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// ==========================================
// 3. O GRIMÓRIO ORIGINAL DE DIÓGENES
// ==========================================
// Resumi o array original aqui para economizar espaço visual, mas 
// cole aqui as 100 magias do Diógenes do seu código original!
const magiasDiogenes = [
        // --- TINTA VERMELHA (FOGO) [1 a 10] ---
        { nome: "Chama Dançante", cor: "vermelha", receita: "Pó de Fogo + Frasco de Óleo", efeito: "Cria um pequeno fogo autônomo que ilumina e causa 1d4 de dano de fogo." },
        { nome: "Manto de Calor", cor: "vermelha", receita: "Cinzas de Salamandra + Pedaço de Tecido", efeito: "Concede resistência a dano de frio por 1 hora." },
        { nome: "Projétil Incandescente", cor: "vermelha", receita: "Enxofre + Pedaço de Carvão", efeito: "Dispara um dardo flamejante que causa 2d6 de dano de fogo." },
        { nome: "Explosão de Brasa", cor: "vermelha", receita: "Pólvora + Rubro Gema menor", efeito: "Cria uma explosão em área de 3 metros que empurra inimigos." },
        { nome: "Arma Ardente", cor: "vermelha", receita: "Fogo Alquímico + Óleo de Piche", efeito: "Adiciona +1d6 de dano de fogo a uma arma por 1 minuto." },
        { nome: "Sopro de Fênix", cor: "vermelha", receita: "Pena de Ave de Rapina + Frasco de Óleo Fervente", efeito: "Libera um cone de fogo de 4 metros causando 3d6 de dano." },
        { nome: "Muro de labaredas", cor: "vermelha", receita: "Carvão de Criatura Elemental + Cinzas", efeito: "Ergue uma barreira de chamas bloqueando a passagem por 2 rodadas." },
        { nome: "Marca das Brasas", cor: "vermelha", receita: "Pó de Ferro Quente + Tinta comum", efeito: "Deixa uma marca invisível que queima o alvo ao comando do conjurador." },
        { nome: "Coração Acelerado", cor: "vermelha", receita: "Pó de Rubi + Estimulante Alquímico", efeito: "Aumenta temporariamente a velocidade de movimento em 3 metros." },
        { nome: "Estilhaço Magmático", cor: "vermelha", receita: "Rocha Vulcânica Triturada + Enxofre", efeito: "Dispara estilhaços quentes que perfuram armaduras leves." },

        // --- TINTA AZUL (ÁGUA E ESPIRITUALIDADE) [11 a 20] ---
        { nome: "Cura das Marés", cor: "azul", receita: "Água Benta + Erva de Cura", efeito: "Recupera 2d4 + modificador de magia de vida do alvo." },
        { nome: "Bolha de Oxigênio", cor: "azul", receita: "Alga Seca + Concha Marinha", efeito: "Permite respirar debaixo d'água perfeitamente por 1 hora." },
        { nome: "Passo Sobre Águas", cor: "azul", receita: "Pó de Gelo + Pena de Gaivota", efeito: "Permite caminhar sobre superfícies líquidas por 10 minutos." },
        { nome: "Sussurro Espiritual", cor: "azul", receita: "Incenso Raro + Olho de Vidro", efeito: "Permite enxergar e conversar com espíritos próximos por 10 minutos." },
        { nome: "Nevoeiro Purificador", cor: "azul", receita: "Água Purificada + Sal Grosso", efeito: "Remove condições de veneno ou doença leve de um aliado." },
        { nome: "Escudo de Gelo", cor: "azul", receita: "Essência de Gelo + Cristal Pequeno", efeito: "Bloqueia completamente o próximo ataque corpo a corpo recebido." },
        { nome: "Lágrima dos Mares", cor: "azul", receita: "Pérola Negra Triturada + Água Benta", efeito: "Cura um aliado atordoado e restaura sua serenidade mental." },
        { nome: "Voz do Oceano", cor: "azul", receita: "Concha Acústica + Essência Etérea", efeito: "Permite comunicação telepática de longo alcance com aliados." },
        { nome: "Bênção da Névoa", cor: "azul", receita: "Orvalho da Manhã + Ervas Místicas", efeito: "Cria uma névoa densa ao redor concedendo camuflagem arcana." },
        { nome: "Onda de Retorno", cor: "azul", receita: "Água de Cachoeira Sagrada + Prata Pura", efeito: "Empurra todos os inimigos ao redor para longe com força hidráulica." },

        // --- TINTA AMARELA (LUZ) [21 a 30] ---
        { nome: "Clarão Ofuscante", cor: "amarela", receita: "Pó de Diamante + Fósforo Alquímico", efeito: "Cega temporariamente inimigos em um raio de 5 metros." },
        { nome: "Lâmina de Luz", cor: "amarela", receita: "Pó de Ouro + Luz Solar Engarrafada", efeito: "Infunde uma arma com luz radiante, causando extra dano em mortos-vivos." },
        { nome: "Faro da Verdade", cor: "amarela", receita: "Lente de Aumento + Ervas da Verdade", efeito: "Revela ilusões, metamorfos e invisibilidade em até 10 metros." },
        { nome: "Aura de Proteção", cor: "amarela", receita: "Pó de Prata Pura + Mel Silvestre", efeito: "Concede +2 na Classe de Armadura (CA) do alvo por 3 rodadas." },
        { nome: "Feixe Solar", cor: "amarela", receita: "Lente de Cristal + Foco Arcano", efeito: "Dispara um raio de luz concentrada em linha reta ignorando armaduras leves." },
        { nome: "Luz Guia", cor: "amarela", receita: "Inseto Luminescente (secado) + Pedrinha Brilhante", efeito: "Cria uma esfera de luz flutuante que ilumina caminhos escuros." },
        { nome: "Claridade Mental", cor: "amarela", receita: "Incenso de Sândalo + Essência de Luz", efeito: "Remove efeitos de medo ou confusão mental de um aliado." },
        { nome: "Selo Solar", cor: "amarela", receita: "Gema de Topázio Triturada + Giz Sagrado", efeito: "Cria uma runa no chão que queima criaturas malignas ao pisarem." },
        { nome: "Reflexo Espelhado", cor: "amarela", receita: "Pó de Espelho Mágico + Óleo de Limpeza", efeito: "Cria cópias ilusórias de luz para despistar ataques inimigos." },
        { nome: "Toque do Amanhecer", cor: "amarela", receita: "Essência de Sol da Manhã + Água Benta", efeito: "Cura ferimentos médios e restaura pontos de vida temporários." },

        // --- TINTA PRETA (MATÉRIA - PASSIVA DE CRÍTICO) [31 a 40] ---
        { nome: "Parede de Ferro", cor: "preta", receita: "Ferro Puro + Sangue de Criatura", efeito: "Cria uma parede sólida de matéria de 2x2 metros para bloqueio físico." },
        { nome: "Criação de Ferramentas", cor: "preta", receita: "Metal Triturado + Madeira Seca", efeito: "Materializa instantaneamente uma ferramenta útil (chave, alavanca, corda)." },
        { nome: "Armadura Sólida", cor: "preta", receita: "Pedaços de Couro Duro + Mineral Pesado", efeito: "Concede +3 de bônus na armadura do conjurador por 1 rodada." },
        { nome: "Projétil Físico Denso", cor: "preta", receita: "Pedra Bruta + Osso de Monstro", efeito: "Cria e arremessa um pedregulho maciço com alto dano de impacto." },
        { nome: "Selo de Prisão Material", cor: "preta", receita: "Corrente de Ferro + Minério de Chumbo", efeito: "Invoca algemas materiais do chão que prendem os pés do alvo." },
        { nome: "Pilar de Sustentação", cor: "preta", receita: "Pedra + Cimento Mágico", efeito: "Cria uma coluna instantânea para sustentar tetos desabando." },
        { nome: "Bloco de Contenção", cor: "preta", receita: "Rocha Sólida + Argila Pesada", efeito: "Cria um cubo de pedra ao redor de um item ou inimigo pequeno." },
        { nome: "Lâmina Materializada", cor: "preta", receita: "Minério de Ferro Afiado + Cabo de Osso", efeito: "Cria uma espada física improvisada de alta durabilidade." },
        { nome: "Escudo de Chumbo", cor: "preta", receita: "Placa de Chumbo + Resina", efeito: "Cria um escudo pesado bloqueando magias baseadas em radiação ou luz." },
        { nome: "Maciço Colossal", cor: "preta", receita: "Diamante Negro em pó + Ferro Metálico", efeito: "Cria uma estrutura grossa de metal para bloquear passagens inteiras." },

        // --- TINTA BRANCA (APAGAR - PASSIVA DE CRÍTICO) [41 a 50] ---
        { nome: "Desintegrar Objeto", cor: "branca", receita: "Cinzas de Morto-Vivo + Água Destilada", efeito: "Apaga e desintegra um objeto pequeno não mágico do cenário." },
        { nome: "Silêncio Absoluto", cor: "branca", receita: "Pena Mágica + Vácuo Enclausurado", efeito: "Cria uma zona esférica de silêncio mágico onde nenhum som escapa." },
        { nome: "Apagar Memória Recente", cor: "branca", receita: "Flor de Esquecimento + Essência Etérea", efeito: "Apaga os últimos 10 segundos da mente de um alvo afetado." },
        { nome: "Cancelamento de Magia", cor: "branca", receita: "Cristal Mágico Quebrado + Símbolo Sagrado", efeito: "Anula um efeito mágico ativo de nível baixo." },
        { nome: "Invisibilidade Óptica", cor: "branca", receita: "Pó de Espelho + Essência Etérea", efeito: "Apaga a imagem visível do usuário do espectro óptico por 1 minuto." },
        { nome: "Buraco Vazio", cor: "branca", receita: "Sombra Pura + Essência do Nada", efeito: "Cria um pequeno vácuo que suga e aprisiona projéteis inimigos." },
        { nome: "Apagar Traços", cor: "branca", receita: "Pó de Giz Branco + Água Benta", efeito: "Apaga pegadas, rastros e odores deixados pelo grupo." },
        { nome: "Nulificação de Efeito", cor: "branca", receita: "Sal Purificado + Cinzas Raras", efeito: "Remove uma maldição menor ou efeito de veneno persistente." },
        { nome: "Apagão de Chamas", cor: "branca", receita: "Gelo Seco Alquímico + Pó Etéreo", efeito: "Extingue instantaneamente qualquer fogo natural ou mágico em área." },
        { nome: "Vazio de Cor", cor: "branca", receita: "Pigmento Branco Puro + Essência de Névoa", efeito: "Cria uma área sem cor que desorienta a visão de criaturas comuns." },

        // --- MESCLAS DUPLAS: VERMELHA + AZUL [51 a 60] ---
        { nome: "Torrente de Vapor Quente", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Água Benta", efeito: "Jato de vapor escaldante que causa dano de fogo e cega o alvo." },
        { nome: "Gêiser Eruptivo", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Pó de Fogo", efeito: "Faz brotar água fervente do chão em área de 3 metros (dano misto)." },
        { nome: "Cura Calcinante", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Erva de Cura", efeito: "Cura um aliado, mas cauteriza feridas com calor mágico instantâneo." },
        { nome: "Nevoeiro Termal", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Essência de Gelo", efeito: "Cria uma névoa espessa e quente que confunde sensores térmicos." },
        { nome: "Escudo de Vapor", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Cristal", efeito: "Cria uma barreira defensiva que repele e queima quem se aproxima." },
        { nome: "Lâmina de Água Fervente", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Óleo", efeito: "Envolve a arma em água escaldante, causando dano perfurante e térmico." },
        { nome: "Chama Líquida", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Alquimia Avançada", efeito: "Dispara um fluido pegajoso que queima mesmo sob a água." },
        { nome: "Purificação Ígnea", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Sal", efeito: "Purifica o corpo de doenças queimando impurezas espirituais." },
        { nome: "Pulso de Vapor", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Enxofre", efeito: "Gera uma onda de choque que empurra inimigos e abafa magias." },
        { nome: "Termoterapia Mágica", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Mel", efeito: "Recupera fadiga extrema e cura ferimentos leves simultaneamente." },

        // --- MESCLAS DUPLAS: VERMELHA + AMARELA [61 a 70] ---
        { nome: "Plasma Solar", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Pó de Diamante", efeito: "Cria uma esfera de plasma superaquecido que causa dano massivo." },
        { nome: "Aura de Fogo Sagrado", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Ouro", efeito: "Envolve o usuário em chamas douradas que blindam contra mortos-vivos." },
        { nome: "Lança de Radiância Ardente", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Lente", efeito: "Dispara um feixe de luz laser incandescente de altíssima precisão." },
        { nome: "Explosão Prateada", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Prata", efeito: "Flash explosivo que cega e causa pequenas queimaduras em área." },
        { nome: "Manto de Ouro Vivo", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Mel", efeito: "Aumenta a CA e concede aura de calor blindada por 2 rodadas." },
        { nome: "Brilho Magmático", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Rocha", efeito: "Ilumina um ambiente escuro enquanto queima armadilhas próximas." },
        { nome: "Chama Solar Refletida", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Espelho", efeito: "Reflete feixes de luz concentrada em alvos específicos." },
        { nome: "Fúria Radiante", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Rubi", efeito: "Dobra o dano de fogo do próximo ataque com brilho estelar." },
        { nome: "Farol de Combate", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Fósforo", efeito: "Marca um inimigo com luz incandescente visível a longa distância." },
        { nome: "Supernova Menor", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Diamante", efeito: "Pequena explosão luz-fogo em grande área (uso de emergência)." },

        // --- MESCLAS DUPLAS: AZUL + AMARELA [71 a 80] ---
        { nome: "Luz das Marés", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Pérola", efeito: "Cura ferimentos e ilumina a área ao mesmo tempo com brilho azulado." },
        { nome: "Prisma Espiritual", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Cristal", efeito: "Revela espíritos invisíveis banhando-os em luz purificadora." },
        { nome: "Escudo de Aurora", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Essência de Gelo", efeito: "Cria uma barreira luminosa que absorve danos mágicos." },
        { nome: "Água Cristalina Iluminada", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Água Benta", efeito: "Cria água benta com propriedades de cura aprimoradas." },
        { nome: "Bênção dos Mares Luminosos", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Ouro", efeito: "Remove exaustão e restaura feitiços de aliados próximos." },
        { nome: "Nevoeiro Arco-Íris", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Orvalho", efeito: "Cria ilusões óticas fantásticas na névoa d'água." },
        { nome: "Pulso de Cura Astral", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Incenso Raro", efeito: "Cura em área moderada e afasta presenças espirituais malignas." },
        { nome: "Olhar da Verdade Oceânica", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Lente", efeito: "Permite ver através de ilusões na água ou gelo." },
        { nome: "Cristalização de Luz", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Quartzo", efeito: "Cria uma lanterna mágica inesgotável baseada em espiritualidade." },
        { nome: "Onda Radiante", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Prata", efeito: "Onda de energia mista que empurra e purifica alvos." },

        // --- MESCLAS COM PRETA E BRANCA (MATÉRIA E NADA) [81 a 90] ---
        { nome: "Matéria Vazia", cor: "mescla", receita: "Tinta Preta + Tinta Branca + Essência", efeito: "Cria e desfaz simultaneamente um objeto para abrir fechaduras." },
        { nome: "Escudo de Antimatéria", cor: "mescla", receita: "Tinta Preta + Tinta Branca + Chumbo", efeito: "Anula o impacto de qualquer projétil físico ou mágico recebido." },
        { nome: "Criação Silenciosa", cor: "mescla", receita: "Tinta Preta + Tinta Branca + Vácuo", efeito: "Materializa uma estrutura física sem emitir absolutamente nenhum som." },
        { nome: "Apagar e Substituir", cor: "mescla", receita: "Tinta Preta + Tinta Branca + Ferro", efeito: "Apaga um obstáculo pequeno e cria uma passagem no lugar." },
        { nome: "Anulação Térmica", cor: "mescla", receita: "Tinta Vermelha + Tinta Branca + Tinta Preta", efeito: "Cria um campo onde o fogo é instantaneamente anulado pelo vazio." },
        { nome: "Forja Fantasma", cor: "mescla", receita: "Tinta Vermelha + Tinta Preta + Tinta Amarela", efeito: "Cria armas metálicas incandescentes prontas para uso imediato." },
        { nome: "Cristalização do Vazio", cor: "mescla", receita: "Tinta Azul + Tinta Branca + Tinta Preta", efeito: "Cria um bloco de gelo indestrutível que absorve feitiços." },
        { nome: "Prisão Absoluta", cor: "mescla", receita: "Tinta Preta + Tinta Branca + Corrente", efeito: "Prende o alvo em uma caixa dimensional de matéria apagada." },
        { nome: "Silêncio de Ferro", cor: "mescla", receita: "Tinta Preta + Tinta Branca + Pena", efeito: "Cria uma barreira física e sonora intransponível." },
        { nome: "Correção da Realidade", cor: "mescla", receita: "Todas as Tintas (Vermelha, Azul, Amarela, Preta, Branca)", efeito: "Habilidade suprema: Altera um pequeno aspecto físico ou mágico do ambiente." },

        // --- MESCLAS COMPLEXAS E MULTITINTAS SUPREMAS [91 a 100] ---
        { nome: "Fúria dos Quatro Elementos", cor: "mescla", receita: "Vermelha + Azul + Amarela + Preta + Gema Suprema", efeito: "Libera uma tempestade elementar massiva ao redor do conjurador." },
        { nome: "Cura Total do Pelo Mágico", cor: "mescla", receita: "Azul + Amarela + Branca + Ervas Raras", efeito: "Restaura 100% da vida usando os estoques guardados no pelo." },
        { nome: "Barreira do Armazém Ambulante", cor: "mescla", receita: "Preta + Branca + Vermelha + Ferro Puro", efeito: "Protege o inventário guardado no pelo místico contra roubos e danos." },
        { nome: "Super-Nova Arcana", cor: "mescla", receita: "Vermelha + Amarela + Branca + Diamante Puro", efeito: "Explosão gigantesca de luz e calor sob supervisão mística." },
        { nome: "Véu Etéreo Absoluto", cor: "mescla", receita: "Azul + Branca + Preta + Essência Etérea", efeito: "Dá invisibilidade completa e intangibilidade física por 30 segundos." },
        { nome: "Lança Mestra", cor: "mescla", receita: "Vermelha + Azul + Amarela + Aço Pura", efeito: "Cria uma arma lendária temporária com efeitos elementais combinados." },
        { nome: "Ressurreição de Tinta", cor: "mescla", receita: "Todas as Tintas + Sangue de Dragão + Diamante", efeito: "Milagre supremo do grimório: Estabiliza um aliado à beira da morte." },
        { nome: "Campo Anti-Magia", cor: "mescla", receita: "Branca + Preta + Símbolo Sagrado", efeito: "Anula todas as magias ativas em um raio de 6 metros." },
        { nome: "Labaredas Espirituais", cor: "mescla", receita: "Vermelha + Azul + Incenso", efeito: "Causa dano de fogo espiritual que ignora defesas físicas comuns." },
        { nome: "Apotéose Mágica", cor: "mescla", receita: "Tintas Puras + Diamante Bruto + Essência Divina", efeito: "Canaliza essência pura, dobrando o poder de todas as tintas por 3 rodadas." }
];

// ==========================================
// 4. CONTROLE DE LOGIN / INTERFACE
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

// Verifica se já está logado
window.onload = () => {
    const savedUser = localStorage.getItem('rpg_username');
    if (savedUser) login(savedUser);
};

document.getElementById('btn-login').addEventListener('click', () => {
    const name = DOM.usernameInput.value.trim().toLowerCase();
    if (name) login(name);
});

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('rpg_username');
    location.reload();
});

function login(username) {
    currentUser = username;
    localStorage.setItem('rpg_username', currentUser);
    
    // Capitaliza o nome para o título
    DOM.userTitle.innerText = `Grimório de ${currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}`;
    
    DOM.loginScreen.classList.add('hidden');
    DOM.appScreen.classList.remove('hidden');
    registrarLog("Adentrou o grimório.");
    carregarGrimorioDoFirebase();
    carregarInventarioDoFirebase();
    carregarFichaDoFirebase();
}

// ==========================================
// 5. LÓGICA DO FIREBASE (Sincronização)
// ==========================================
function carregarGrimorioDoFirebase() {
    const grimorioRef = ref(db, 'grimoires/' + currentUser);
    
    onValue(grimorioRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            // Converte objeto do Firebase para Array
            userGrimoire = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            }));
            renderizarCards(userGrimoire);
        } else {
            // Se for o Diógenes e estiver vazio, insere o compêndio original no Firebase dele
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
    DOM.grid.innerHTML = "";
    if(lista.length === 0) {
        DOM.grid.innerHTML = "<p class='text-muted' style='grid-column: 1/-1;'>O grimório está em branco... Forje sua primeira magia!</p>";
        return;
    }

    lista.forEach((ef) => {
        const div = document.createElement('div');
        div.className = `card ${ef.cor}`;
        div.innerText = ef.nome;
        div.onclick = () => abrirModalView(ef);
        DOM.grid.appendChild(div);
    });
}

// ==========================================
// 6. ADICIONAR / VER / APAGAR MAGIAS
// ==========================================
document.getElementById('btn-add-spell').onclick = () => DOM.modalAdd.style.display = 'flex';
document.getElementById('close-add-modal').onclick = () => DOM.modalAdd.style.display = 'none';
document.getElementById('close-view-modal').onclick = () => DOM.modalView.style.display = 'none';

document.getElementById('btn-save-spell').onclick = () => {
    const nome = document.getElementById('new-nome').value;
    const cor = document.getElementById('new-cor').value;
    const receita = document.getElementById('new-receita').value;
    const efeito = document.getElementById('new-efeito').value;

    if (!nome || !efeito) return alert("Nome e Efeito são sagrados, não deixe em branco!");

    const novaMagiaRef = push(ref(db, 'grimoires/' + currentUser));
    set(novaMagiaRef, { nome, cor, receita, efeito }).then(() => {
        DOM.modalAdd.style.display = 'none';
        // Limpar campos
        document.getElementById('new-nome').value = "";
        document.getElementById('new-receita').value = "";
        document.getElementById('new-efeito').value = "";
    });
};

function abrirModalView(ef) {
    currentSpellId = ef.id; // Guarda o ID para poder deletar
    document.getElementById('view-titulo').innerText = ef.nome;
    document.getElementById('view-cor').innerText = ef.cor.toUpperCase();
    document.getElementById('view-receita').innerText = ef.receita;
    document.getElementById('view-efeito').innerText = ef.efeito;
    DOM.modalView.style.display = 'flex';
}

document.getElementById('btn-delete-spell').onclick = () => {
    if (confirm("Rasgar esta página é permanente. Tem certeza?")) {
        const magiaRef = ref(db, `grimoires/${currentUser}/${currentSpellId}`);
        remove(magiaRef).then(() => {
            DOM.modalView.style.display = 'none';
        });
    }
};

// Pesquisa
DOM.searchInput.addEventListener('keyup', (e) => {
    const termo = e.target.value.toLowerCase();
    const filtrados = userGrimoire.filter(ef => 
        ef.nome.toLowerCase().includes(termo) || 
        ef.receita.toLowerCase().includes(termo) || 
        ef.efeito.toLowerCase().includes(termo)
    );
    renderizarCards(filtrados);
});

// ==========================================
// 7. SISTEMA DE TABS (Navegação)
// ==========================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active de tudo
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        
        // Ativa o clicado
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.remove('hidden');
    });
});

// ==========================================
// 8. ROLADOR DE DADOS
// ==========================================
document.getElementById('btn-roll').addEventListener('click', () => {
    const diceDisplay = document.getElementById('dice-result');
    const logDisplay = document.getElementById('dice-log');
    
    // Pega a quantidade de dados informada (padrão é 1 se estiver vazia ou menor que 1)
    const quantidade = parseInt(document.getElementById('dice-qtd').value) || 1;
    const sides = parseInt(document.getElementById('dice-type').value);
    const modSign = document.getElementById('mod-sign').value;
    const modValue = parseInt(document.getElementById('dice-mod').value) || 0;

    diceDisplay.classList.add('rolling');
    diceDisplay.innerText = "🎲";

    setTimeout(() => {
        diceDisplay.classList.remove('rolling');
        
        let somaRolagensPuras = 0;
        let resultadosIndividuais = [];

        // Rolo a quantidade de dados especificada
        for (let i = 0; i < quantidade; i++) {
            let roll = Math.floor(Math.random() * sides) + 1;
            resultadosIndividuais.push(roll);
            somaRolagensPuras += roll;
        }
        
        // Aplicação do fator cármico opcional na média total
        let somaComKarma = somaRolagensPuras + (fatorKarma * quantidade);
        
        // Limites mínimos e máximos lógicos
        const valorMinimo = quantidade;
        const valorMaximo = sides * quantidade;
        if (somaComKarma > valorMaximo) somaComKarma = valorMaximo;
        if (somaComKarma < valorMinimo) somaComKarma = valorMinimo;

        // Ajuste do Modificador (+ ou -)
        let totalFinal = somaComKarma;
        if (modSign === '+') {
            totalFinal += modValue;
        } else {
            totalFinal -= modValue;
        }

        diceDisplay.innerText = totalFinal;

        // Formata a string de detalhes para o log e WhatsApp
        const detalheDados = quantidade > 1 ? `[${resultadosIndividuais.join(', ')}]` : `${resultadosIndividuais[0]}`;
        const textoMod = modValue !== 0 ? ` ${modSign} ${modValue}` : '';
        
        const logEntry = document.createElement('div');
        logEntry.innerText = `${quantidade}D${sides} rolou ${detalheDados}${textoMod} = ${totalFinal}`;
        logDisplay.prepend(logEntry);

        registrarLog(`Rolou ${quantidade}D${sides} e obteve o resultado ${totalFinal}`);
    }, 400);
})
// ==========================================
// 9. CALCULADORA ARCANA
// ==========================================
document.getElementById('btn-calc').addEventListener('click', () => {
    const input = document.getElementById('calc-input').value;
    const resultDisplay = document.getElementById('calc-result');
    
    try {
        // Função anônima eval-like segura e simples para cálculos
        const result = new Function('return ' + input)();
        if(isNaN(result)) throw new Error("Inválido");
        resultDisplay.innerText = result;
    } catch (error) {
        resultDisplay.innerText = "Erro na Formulação";
    }
});

// ==========================================
// 10. COMPARTILHAMENTO MÍSTICO (WHATSAPP)
// ==========================================

// Compartilhar Dados
document.getElementById('btn-share-dice').addEventListener('click', () => {
    const total = document.getElementById('dice-result').innerText;
    
    // Pega a última rolagem do log para dar mais contexto (Ex: [D20] rolou 15 + 2 = 17)
    const logElements = document.getElementById('dice-log').children;
    let detalhe = logElements.length > 0 ? logElements[0].innerText : "";

    // Trava para não compartilhar se não tiver rolado nada
    if (total === "-" || total === "🎲") {
        return alert("Role os dados antes de invocar o Zap, mestre!");
    }

    // Formata a mensagem com o nome do usuário logado
    const texto = `🎲 *Rolagem do Destino de ${currentUser}* 🎲\n\nResultado Final: *${total}*\nDetalhes: _${detalhe}_\n\n🔮 _Enviado do Grimório Vivo_`;
    
    // Abre a URL do WhatsApp
    const zapUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(zapUrl, '_blank');
});

// Compartilhar Calculadora
document.getElementById('btn-share-calc').addEventListener('click', () => {
    const resultado = document.getElementById('calc-result').innerText;
    const expressao = document.getElementById('calc-input').value;

    if (resultado === "-" || resultado === "Erro na Formulação" || expressao.trim() === "") {
        return alert("Realize um cálculo válido primeiro!");
    }

    const texto = `🧮 *Cálculo de Sistema (${currentUser})* 🧮\n\nEquação: ${expressao}\nResultado: *${resultado}*\n\n🔮 _Enviado do Grimório Vivo_`;
    
    const zapUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(zapUrl, '_blank');
});
// ==========================================
// SISTEMA DE AUDITORIA (LOG DO MESTRE)
// ==========================================
function registrarLog(acao) {
    // Não registra ações se o usuário não estiver logado
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

// Injetar o log no login existente
// Onde você tem a função login(username), adicione dentro dela:
// registrarLog("Adentrou o grimório.");

// ==========================================
// AUTENTICAÇÃO DO MESTRE E EXIBIÇÃO DE LOGS
// ==========================================
const DOM_GM = {
    modalAuth: document.getElementById('modal-gm-auth'),
    passInput: document.getElementById('gm-password-input'),
    btnSubmit: document.getElementById('btn-submit-gm-auth'),
    closeModal: document.getElementById('close-gm-modal'),
    logContainer: document.getElementById('master-log-container'),
    authTitle: document.getElementById('gm-auth-title'),
    authDesc: document.getElementById('gm-auth-desc')
};

document.getElementById('btn-tab-gm').addEventListener('click', (e) => {
    if (!isMasterAuthenticated) {
        // Impede a abertura da aba imediatamente
        e.preventDefault();
        document.getElementById('tab-gm').classList.add('hidden');
        document.getElementById('btn-tab-gm').classList.remove('active');
        
        // Verifica no Firebase se já existe uma senha
        const dbRef = ref(db);
        get(child(dbRef, `gm_settings/password`)).then((snapshot) => {
            if (snapshot.exists()) {
                DOM_GM.authTitle.innerText = "O Selo do Mestre";
                DOM_GM.authDesc.innerText = "Digite a senha para acessar os registros.";
            } else {
                DOM_GM.authTitle.innerText = "Criar Selo do Mestre";
                DOM_GM.authDesc.innerText = "Primeiro acesso detectado. Defina a senha mestre.";
            }
            DOM_GM.modalAuth.style.display = 'flex';
        }).catch((error) => {
            console.error(error);
            alert("Erro nas correntes mágicas do banco de dados.");
        });
    }
});

DOM_GM.closeModal.onclick = () => DOM_GM.modalAuth.style.display = 'none';

DOM_GM.btnSubmit.addEventListener('click', () => {
    const inputPass = DOM_GM.passInput.value;
    if (!inputPass) return alert("A senha não pode ser um vazio.");

    const dbRef = ref(db);
    get(child(dbRef, `gm_settings/password`)).then((snapshot) => {
        if (snapshot.exists()) {
            // Senha já existe, validar
            if (snapshot.val() === inputPass) {
                liberarAcessoMestre();
            } else {
                alert("Senha incorreta. A magia o rejeita.");
            }
        } else {
            // Criar senha pela primeira vez
            set(ref(db, 'gm_settings/password'), inputPass).then(() => {
                alert("Senha mestre forjada com sucesso!");
                liberarAcessoMestre();
            });
        }
    });
});

function liberarAcessoMestre() {
    isMasterAuthenticated = true;
    DOM_GM.modalAuth.style.display = 'none';
    DOM_GM.passInput.value = "";
    
    // Força a ativação da aba
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById('btn-tab-gm').classList.add('active');
    document.getElementById('tab-gm').classList.remove('hidden');

    iniciarEscutaDeLogs();
}

function iniciarEscutaDeLogs() {
    const logsRef = ref(db, 'system_logs');
    onValue(logsRef, (snapshot) => {
        DOM_GM.logContainer.innerHTML = "";
        const data = snapshot.val();
        if (data) {
            // Converte e ordena por tempo (mais recentes no topo)
            const logsArray = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
            logsArray.forEach(log => {
                const div = document.createElement('div');
                div.className = 'log-entry';
                div.innerHTML = `<span class="log-time">[${log.hora}]</span> <span class="log-player">${log.jogador.toUpperCase()}</span>: ${log.acao}`;
                DOM_GM.logContainer.appendChild(div);
            });
        } else {
            DOM_GM.logContainer.innerHTML = "<p class='text-muted'>O Akasha está silencioso. Nenhum registro encontrado.</p>";
        }
    });
}

document.getElementById('btn-clear-log').addEventListener('click', () => {
    if (confirm("Isto apagará a história. Tem certeza, Mestre?")) {
        remove(ref(db, 'system_logs'));
    }
});
// ==========================================
// 12. SISTEMA DE INVENTÁRIO E FORJA SEPARADOS
// ==========================================
// ==========================================
// 12. SISTEMA DE INVENTÁRIO E FORJA DINÂMICA
// ==========================================
let userInventory = []; 
let listaDeMescla = []; // Lista para múltiplos itens no caldeirão

// Escuta os itens do Inventário do Firebase
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

// Renderiza os itens na Bolsa de Componentes
function renderizarInventarioVisual(itens) {
    const grid = document.getElementById('craft-inventory-grid');
    if (!grid) return;
    
    grid.innerHTML = "";
    
    if (itens.length === 0) {
        grid.innerHTML = "<p class='text-muted w-full text-center' style='grid-column: 1/-1;'>Nenhum material na bolsa. Clique em '+ Coletar Material Base' para adicionar ingredientes.</p>";
        return;
    }
    
    itens.forEach(item => {
        const icone = item.emoji ? item.emoji : "📦";
        
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `<div class="emoji">${icone}</div><div class="name">${item.nome}</div>`;
        
        // Ao clicar no item, ele vai para a lista de mescla
        div.onclick = () => selecionarParaForja(item, icone);
        
        grid.appendChild(div);
    });
}

// Adiciona itens na lista dinâmica da forja
function selecionarParaForja(item, icone) {
    listaDeMescla.push({ ...item, emojiVisual: icone });
    renderizarListaDeMescla();
}

// Atualiza a visualização dos itens dentro da forja
function renderizarListaDeMescla() {
    const container = document.getElementById('forja-lista');
    if (!container) return;
    
    container.innerHTML = "";
    
    listaDeMescla.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-na-forja';
        // Botão 'x' para remover um item específico da forja antes de forjar
        div.innerHTML = `${item.emojiVisual} ${item.nome} <button onclick="removerItemDaForja(${index})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-weight:bold;">x</button>`;
        container.appendChild(div);
    });
    
    const statusEl = document.getElementById('status-forja');
    if (statusEl) {
        statusEl.innerText = listaDeMescla.length > 0 ? `Itens na forja: ${listaDeMescla.length}` : "Adicione itens do inventário para começar a mescla.";
    }
}

// Remove item individual da lista de mescla
window.removerItemDaForja = function(index) {
    listaDeMescla.splice(index, 1);
    renderizarListaDeMescla();
}

// Botão de Transmutar - Salva no INVENTÁRIO e consome os ingredientes usados
document.getElementById('btn-craft-visual').addEventListener('click', () => {
    // Exige no mínimo 2 itens para mesclar
    if (listaDeMescla.length < 2) return alert("Coloque pelo menos 2 materiais no caldeirão para mesclar!");
    
    const nomeItem = document.getElementById('craft-result-name').value.trim();
    const emojiItem = document.getElementById('craft-emoji-input').value.trim();

    if (!nomeItem || !emojiItem) return alert("Defina um nome e um emoji para o novo item!");

    document.getElementById('btn-craft-visual').disabled = true;

    // Inicia a Animação no Canvas
    iniciarAnimacaoMagica(() => {
        // Junta o nome de todos os ingredientes usados na receita
        const receitaCombinada = listaDeMescla.map(i => i.nome).join(" + ");
        
        // 1. O novo item vai para 'inventory/'
        const novoItemRef = push(ref(db, 'inventory/' + currentUser));
        set(novoItemRef, { 
            nome: nomeItem, 
            emoji: emojiItem,
            criadoEm: Date.now(),
            receita: receitaCombinada
        }).then(() => {
            // 2. Remove todos os ingredientes que foram consumidos no Firebase
            listaDeMescla.forEach(item => {
                if (item.id) remove(ref(db, `inventory/${currentUser}/${item.id}`));
            });

            if (typeof registrarLog === "function") {
                registrarLog(`Forjou o item [${emojiItem} ${nomeItem}] combinando ${listaDeMescla.length} ingredientes.`);
            }
            
            alert(`Item Criado! ${emojiItem} ${nomeItem} foi adicionado ao seu Inventário.`);
            
            // Reseta a forja e limpa os campos
            listaDeMescla = [];
            renderizarListaDeMescla();
            document.getElementById('craft-result-name').value = "";
            document.getElementById('craft-emoji-input').value = "";
            document.getElementById('btn-craft-visual').disabled = false;
        });
    });
});

// Adicionar Material Base direto ao Inventário
document.getElementById('btn-add-material').addEventListener('click', () => {
    const nome = prompt("Nome do Material ou Ingrediente (ex: Minério de Ferro):");
    if (!nome) return;
    const emoji = prompt("Ícone / Emoji do Material (ex: 🪨):") || "📦";

    const novoMaterialRef = push(ref(db, 'inventory/' + currentUser));
    set(novoMaterialRef, { 
        nome: nome, 
        emoji: emoji,
        criadoEm: Date.now()
    }).then(() => {
        if (typeof registrarLog === "function") registrarLog(`Adicionou ao Inventário: ${emoji} ${nome}`);
    });
});

// Função de Animação Mágica via Canvas
function iniciarAnimacaoMagica(callbackFinal) {
    const canvas = document.getElementById('craft-canvas');
    if (!canvas) {
        callbackFinal();
        return;
    }
    const ctx = canvas.getContext('2d');
    const area = document.getElementById('crafting-area');
    
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

        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.random() * 50 + 20, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fill();

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
// 14. BIBLIOTECA DE SISTEMAS E PERFIL DINÂMICO
// ==========================================

// Biblioteca Interna de Sistemas de RPG
const BibliotecaSistemas = {
    "KULT": {
        nome: "KULT: Divindade Perdida",
        tipoDado: 10,
        quantidadeDados: 2,
        atributosBase: {
            "Vontade": 0,
            "Fortitude": 0,
            "Reflexos": 0,
            "Razão": 0,
            "Intuição": 0,
            "Percepção": 0,
            "Carisma": 0,
            "Alma": 0
        },
        calcularHpMax: (atributos) => 10 + (atributos["Fortitude"] || 0),
        custoXpPorNivel: 10
    }
};

let fichaAtual = null;

// Inicializa a ficha do jogador se não existir
function carregarFichaDoFirebase() {
    if (!currentUser) return;
    const fichaRef = ref(db, `characters/${currentUser}`);
    
    onValue(fichaRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            fichaAtual = data;
            renderizarPerfil();
        } else {
            // Cria ficha zerada padrão KULT para novos usuários
            const novaFicha = {
                nome: currentUser,
                sistema: "KULT",
                xp: 0,
                hpAtual: 10,
                nivel: 1,
                atributos: { ...BibliotecaSistemas["KULT"].atributosBase }
            };
            set(fichaRef, novaFicha);
        }
    });
}

function renderizarPerfil() {
    if (!fichaAtual) return;
    
    const sys = BibliotecaSistemas[fichaAtual.sistema];
    const hpMax = sys.calcularHpMax(fichaAtual.atributos);
    
    document.getElementById('nome-personagem').innerText = fichaAtual.nome.toUpperCase();
    document.getElementById('sistema-personagem').innerText = sys.nome;
    document.getElementById('display-hp').innerText = fichaAtual.hpAtual;
    document.getElementById('display-hp-max').innerText = hpMax;
    document.getElementById('display-xp').innerText = fichaAtual.xp;

    // Lógica de Level Up
    const areaUpar = document.getElementById('area-level-up');
    if (fichaAtual.xp >= sys.custoXpPorNivel) {
        areaUpar.classList.remove('hidden');
    } else {
        areaUpar.classList.add('hidden');
    }

    // Gerar Botões de Atributos
    const container = document.getElementById('botoes-atributos');
    container.innerHTML = "";
    
    for (let attr in fichaAtual.atributos) {
        const valor = fichaAtual.atributos[attr];
        const btn = document.createElement('button');
        btn.className = "btn-rolagem-rapida";
        btn.style.cssText = "background: #555; border: 1px solid #777; padding: 8px; border-radius: 5px; color: white; cursor: pointer; flex: 1 1 30%;";
        btn.innerText = `🎲 ${attr} (${valor >= 0 ? '+' : ''}${valor})`;
        
        btn.onclick = () => {
            // Configura a rolagem baseada no sistema (KULT = 2d10)
            document.getElementById('dice-qtd').value = sys.quantidadeDados;
            document.getElementById('dice-type').value = sys.tipoDado;
            document.getElementById('dice-mod').value = Math.abs(valor);
            document.getElementById('mod-sign').value = valor >= 0 ? '+' : '-';
            
            document.getElementById('btn-roll').click();
            if (typeof registrarLog === "function") registrarLog(`Testou ${attr} (${sys.nome}).`);
        };
        container.appendChild(btn);
    }
    
    // Revelar controles do Mestre caso esteja autenticado
    if (isMasterAuthenticated) {
        document.getElementById('gm-controls').classList.remove('hidden');
        document.getElementById('gm-target-player').innerText = fichaAtual.nome.toUpperCase();
    }
}

// Botão de Upar Atributo (Gasta XP)
document.getElementById('btn-upar-atributo').onclick = () => {
    if (!fichaAtual) return;
    const sys = BibliotecaSistemas[fichaAtual.sistema];
    
    const atributoEscolhido = prompt(`Você subiu de nível! Digite o nome exato do atributo para aumentar +1:\n${Object.keys(fichaAtual.atributos).join(", ")}`);
    
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

// ==========================================
// 15. FERRAMENTAS DO MESTRE E QUADRO DE MISSÕES
// ==========================================

// Mestre modifica Dano/Cura
document.getElementById('btn-gm-dano').onclick = () => {
    const valor = parseInt(document.getElementById('gm-mod-valor').value);
    if (!valor || !fichaAtual) return;
    
    const novoHp = fichaAtual.hpAtual + valor; // Valor negativo tira vida, positivo cura
    update(ref(db, `characters/${currentUser}`), { hpAtual: novoHp });
    if (typeof registrarLog === "function") registrarLog(`GM alterou o HP de ${fichaAtual.nome} em ${valor}.`);
};

// Mestre concede XP
document.getElementById('btn-gm-xp').onclick = () => {
    const valor = parseInt(document.getElementById('gm-mod-valor').value);
    if (!valor || !fichaAtual) return;
    
    const novoXp = fichaAtual.xp + Math.abs(valor); 
    update(ref(db, `characters/${currentUser}`), { xp: novoXp });
    if (typeof registrarLog === "function") registrarLog(`GM concedeu ${valor} XP para ${fichaAtual.nome}.`);
};

// Sincronização do Quadro de Missões
const missoesRef = ref(db, 'quests');
onValue(missoesRef, (snapshot) => {
    const data = snapshot.val();
    const lista = document.getElementById('lista-missoes');
    lista.innerHTML = "";
    
    if (data) {
        Object.keys(data).forEach(key => {
            const m = data[key];
            const div = document.createElement('div');
            div.style.cssText = "padding: 5px; border-bottom: 1px solid #555; display: flex; justify-content: space-between;";
            
            let btnApagar = isMasterAuthenticated ? `<button onclick="apagarMissao('${key}')" style="color:red; background:none; border:none; cursor:pointer;">X</button>` : "";
            div.innerHTML = `<span>${m.texto}</span> ${btnApagar}`;
            lista.appendChild(div);
        });
    } else {
        lista.innerHTML = "<span style='color: #888;'>Nenhuma missão ativa no momento.</span>";
    }
});

document.getElementById('btn-add-missao').onclick = () => {
    const texto = document.getElementById('gm-missao-texto').value;
    if (texto) {
        push(ref(db, 'quests'), { texto, data: Date.now() });
        document.getElementById('gm-missao-texto').value = "";
    }
};

window.apagarMissao = function(key) {
    remove(ref(db, `quests/${key}`));
};

// Modificação final: Chame carregarFichaDoFirebase() dentro da sua função login() existente.

// ==========================================
// 16. IMPORTAÇÃO DE FICHA POR ARQUIVO (.TXT / .JSON)
// ==========================================
const inputUpload = document.getElementById('upload-ficha');
const statusImportacao = document.getElementById('status-importacao');

if (inputUpload) {
    inputUpload.addEventListener('change', function(evento) {
        const arquivo = evento.target.files[0];
        if (!arquivo) return;

        statusImportacao.innerText = "Lendo pergaminho místico...";
        const leitor = new FileReader();

        leitor.onload = function(e) {
            try {
                // Lê o arquivo do jogador
                const fichaLida = JSON.parse(e.target.result);
                
                // Sobrescreve a ficha atual no Firebase com os dados do arquivo
                const fichaRef = ref(db, `characters/${currentUser}`);
                set(fichaRef, {
                    nome: currentUser, // Trava o nome da ficha para o nome do jogador logado
                    sistema: fichaLida.sistema || "Personalizado",
                    xp: fichaLida.xp || 0,
                    hpAtual: fichaLida.hpAtual || 10,
                    nivel: fichaLida.nivel || 1,
                    atributos: fichaLida.atributos || {}
                }).then(() => {
                    statusImportacao.innerText = "Ficha importada com sucesso!";
                    setTimeout(() => statusImportacao.innerText = "", 4000);
                });
                
            } catch (erro) {
                statusImportacao.innerText = "Erro: O pergaminho não tem a formatação mágica correta (JSON inválido).";
                console.error("Erro ao ler ficha:", erro);
            }
        };
        leitor.readAsText(arquivo);
    });
}

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
  // Adicione esta linha no final da função renderizarCards(lista):
    renderizarInventarioVisual(lista);
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
    const sides = parseInt(document.getElementById('dice-type').value);
    const mod = parseInt(document.getElementById('dice-mod').value) || 0;

    // Efeito de rolagem
    diceDisplay.classList.add('rolling');
    diceDisplay.innerText = "🎲";

    setTimeout(() => {
        diceDisplay.classList.remove('rolling');
        const roll = Math.floor(Math.random() * sides) + 1;
        const total = roll + mod;
        
        diceDisplay.innerText = total;

        // Adiciona ao Log
        const logEntry = document.createElement('div');
        logEntry.innerText = `[D${sides}] rolou ${roll} ${mod !== 0 ? (mod > 0 ? '+'+mod : mod) : ''} = ${total}`;
        logDisplay.prepend(logEntry);

         registrarLog(`Rolou [D${sides}] e obteve o resultado ${total}`);
    }, 400); // tempo da animação
});

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
// SISTEMA DE FORJA VISUAL E INVENTÁRIO COM CANVAS
// ==========================================
let slot1 = null;
let slot2 = null;

// Renderiza os itens no grid visual de Crafting
function renderizarInventarioVisual(lista) {
    const grid = document.getElementById('craft-inventory-grid');
    if(!grid) return;
    
    grid.innerHTML = "";
    
    // Filtramos para mostrar tudo ou apenas itens que possuem emojis (para organizar melhor)
    lista.forEach(item => {
        // Se a magia/item não tiver emoji salvo, damos um padrão 📜
        const icone = item.emoji ? item.emoji : "📜";
        
        const div = document.createElement('div');
        div.className = 'inv-item';
        div.innerHTML = `<div class="emoji">${icone}</div><div class="name">${item.nome}</div>`;
        
        // Ao clicar no item do inventário
        div.onclick = () => selecionarParaForja(item, icone);
        
        grid.appendChild(div);
    });
}

function selecionarParaForja(item, icone) {
    if (!slot1) {
        slot1 = { ...item, emojiVisual: icone };
        atualizarSlotsDOM();
    } else if (!slot2) {
        slot2 = { ...item, emojiVisual: icone };
        atualizarSlotsDOM();
    } else {
        // Se estiver cheio, substitui o segundo slot
        slot2 = { ...item, emojiVisual: icone };
        atualizarSlotsDOM();
    }
}

// Essa função precisa ser exposta no escopo global (window) pois está no onclick do HTML
window.removerDoSlot = function(numeroSlot) {
    if (numeroSlot === 1) slot1 = null;
    if (numeroSlot === 2) slot2 = null;
    atualizarSlotsDOM();
}

function atualizarSlotsDOM() {
    const elSlot1 = document.getElementById('slot-1');
    const elSlot2 = document.getElementById('slot-2');
    
    if (slot1) {
        elSlot1.innerHTML = slot1.emojiVisual;
        elSlot1.classList.add('filled');
    } else {
        elSlot1.innerHTML = '<span class="slot-placeholder">Vazio</span>';
        elSlot1.classList.remove('filled');
    }
    
    if (slot2) {
        elSlot2.innerHTML = slot2.emojiVisual;
        elSlot2.classList.add('filled');
    } else {
        elSlot2.innerHTML = '<span class="slot-placeholder">Vazio</span>';
        elSlot2.classList.remove('filled');
    }
}

// ==========================================
// MOTOR DE ANIMAÇÃO COM CANVAS (PARTÍCULAS)
// ==========================================
function iniciarAnimacaoMagica(callbackFinal) {
    const canvas = document.getElementById('craft-canvas');
    const ctx = canvas.getContext('2d');
    const area = document.getElementById('crafting-area');
    
    canvas.width = area.clientWidth;
    canvas.height = area.clientHeight;
    
    const particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let animacaoAtiva = true;

    // Adiciona classe CSS pra tremer os ícones
    document.getElementById('crafting-slots').classList.add('forjando');

    // Gerador de Partículas
    for(let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            raio: Math.random() * 3 + 1,
            cor: `hsl(${Math.random() * 60 + 30}, 100%, 70%)`, // Cores místicas (Dourado/Fogo)
            velocidadeX: (Math.random() - 0.5) * 5,
            velocidadeY: (Math.random() - 0.5) * 5,
        });
    }

    function animar() {
        if (!animacaoAtiva) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            // Desenha partícula
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2);
            ctx.fillStyle = p.cor;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.cor;
            ctx.fill();
            
            // Movimento puxando pro centro (Buraco negro mágico)
            p.x += (centerX - p.x) * 0.05 + p.velocidadeX;
            p.y += (centerY - p.y) * 0.05 + p.velocidadeY;
        });

        // Flash branco no centro
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.random() * 50 + 20, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fill();

        requestAnimationFrame(animar);
    }

    animar();

    // Duração da animação mágica (2 segundos)
    setTimeout(() => {
        animacaoAtiva = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('crafting-slots').classList.remove('forjando');
        callbackFinal();
    }, 2000);
}

// Botão de Transmutar
document.getElementById('btn-craft-visual').addEventListener('click', () => {
    if (!slot1 || !slot2) return alert("Os dois focos da balança precisam de itens!");
    
    const nomeItem = document.getElementById('craft-result-name').value.trim();
    const emojiItem = document.getElementById('craft-emoji-input').value.trim();

    if (!nomeItem || !emojiItem) return alert("Dê um nome e um ícone (emoji) para o novo item!");

    // Trava os botões para não clicar duas vezes
    document.getElementById('btn-craft-visual').disabled = true;

    // Dispara a animação visual épica no Canvas
    iniciarAnimacaoMagica(() => {
        const receitaCombinada = `${slot1.nome} + ${slot2.nome}`;
        
        // Firebase
        const novaMagiaRef = push(ref(db, 'grimoires/' + currentUser));
        set(novaMagiaRef, { 
            nome: nomeItem, 
            emoji: emojiItem, // Salvando o Emoji!
            cor: "mescla", 
            receita: receitaCombinada, 
            efeito: "Item forjado através de alquimia superior." 
        }).then(() => {
            if(typeof registrarLog === "function") {
                registrarLog(`Forjou [${emojiItem} ${nomeItem}] combinando ${slot1.nome} e ${slot2.nome}`);
            }
            alert(`A alquimia foi concluída! ${emojiItem} ${nomeItem} adicionado ao grimório.`);
            
            // Limpa a mesa
            slot1 = null; slot2 = null;
            atualizarSlotsDOM();
            document.getElementById('craft-result-name').value = "";
            document.getElementById('craft-emoji-input').value = "";
            document.getElementById('btn-craft-visual').disabled = false;
        });
    });
});

// Adicionar um material bruto direto do inventário
document.getElementById('btn-add-material').addEventListener('click', () => {
    const nome = prompt("Nome do Material Base (ex: Flor de Fogo):");
    if (!nome) return;
    const emoji = prompt("Ícone do Material (cole um Emoji, ex: 🌺):");
    if (!emoji) return;

    const novaMagiaRef = push(ref(db, 'grimoires/' + currentUser));
    set(novaMagiaRef, { 
        nome: nome, 
        emoji: emoji, 
        cor: "branca", 
        receita: "Natureza / Saque", 
        efeito: "Material bruto de Forja." 
    }).then(() => {
        if(typeof registrarLog === "function") registrarLog(`Coletou material: ${emoji} ${nome}`);
    });
});

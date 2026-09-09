// Importações do Firebase v9 (SDK Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove, get, child, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
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
let limiteTintaDiogenes = 10;      // Limite padrão pela qualidade (Boa = 5)
let filtroCorDiogenes = 'todos';   // Filtro de cor ativo
let tintaEspecialLiberada = false; // Controla se preto/branco foram liberados por dados iguais
let estoqueTintasDiogenes = {
    vermelha: 10,
    azul: 10,
    amarela: 10,
    preta: 0,
    branca: 0,
    mescla: 0
};

// ==========================================
// 3. O GRIMÓRIO ORIGINAL DE DIÓGENES
// ==========================================
// Resumi o array original aqui para economizar espaço visual, mas 
// cole aqui as 100 magias do Diógenes do seu código original!
// ==========================================
// 3. O GRIMÓRIO ATUALIZADO DE DIÓGENES (100 EFEITOS)
// ==========================================
const magiasDiogenes = [
        // --- TINTA VERMELHA (FOGO) [1 a 10] ---
        { nome: "Bola de fogo", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Cria um pequeno fogo autônomo que ilumina e causa 1 de dano de fogo." },
        { nome: "Manto de Calor", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Concede resistência a dano de frio por uma cena." },
        { nome: "Projétil Incandescente", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Dispara um dardo flamejante que causa 2 de dano de fogo." },
        { nome: "Explosão de Brasa", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Cria uma explosão em área de 3 metros que empurra inimigos. causando 2 dano nos alvos" },
        { nome: "Arma Ardente", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Adiciona +1 de dano de fogo a uma arma por uma cena" },
        { nome: "Sopro de Fênix", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Libera um cone de fogo de 4 metros causando 3 de dano." },
        { nome: "Muro de labaredas", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Ergue uma barreira de chamas bloqueando a passagem por 2 rodadas. causando 3 de dano a quem tenta ultrapassar" },
        { nome: "Marca das Brasas", cor: "vermelha", receita: "Tinta Vermelha", efeito: "ao desenhar uma marca no alvo, sobe o comando do conjurador, a marca explode, queimando o alvo e causando 5 de dano" },
        { nome: "Adrenalina", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Aumenta temporariamente a velocidade de movimento em 3 metros.aumentando em +2 os testes fisicos, porem se a marca permanecer por tempo estendido, podera ganhar ferimentos graves, e se abusado morre" },
        { nome: "Estilhaço Magmático", cor: "vermelha", receita: "Tinta Vermelha", efeito: "Dispara estilhaços quentes que perfuram armaduras leves. destruindo o equipamento atingido, se for metal ficara incandecente" },

        // --- TINTA AZUL (ÁGUA E ESPIRITUALIDADE) [11 a 20] ---
        { nome: "Cura das Marés", cor: "azul", receita: "Tinta Azul", efeito: "faz 1 ferimento estabilizado sumir da ficha" },
        { nome: "Bolha de Oxigênio", cor: "azul", receita: "Tinta Azul", efeito: "cria bolhas, permitindo respiraçao em qualquer local, por tempo indeterminado" },
        { nome: "Passo Sobre Águas", cor: "azul", receita: "Tinta Azul", efeito: "Permite caminhar sobre superfícies líquidas como se fossem solidas por uma cena" },
        { nome: "Sussurro Espiritual", cor: "azul", receita: "Tinta Azul", efeito: "Permite enxergar e conversar com espíritos recem mortos, por uma cena" },
        { nome: "Nevoeiro Purificador", cor: "azul", receita: "Tinta Azul", efeito: "Remove condições de veneno ou doença leve de um aliado." },
        { nome: "Escudo de Gelo", cor: "azul", receita: "Tinta Azul", efeito: "Bloqueia completamente o próximo ataque corpo a corpo recebido." },
        { nome: "Lágrima dos Mares", cor: "azul", receita: "Tinta Azul", efeito: "restaura  estabilidade mental." },
        { nome: "Voz do Oceano", cor: "azul", receita: "Tinta Azul", efeito: "Permite comunicação telepática de longo alcance com aliados." },
        { nome: "Bênção da Névoa", cor: "azul", receita: "Tinta Azul", efeito: "Cria uma névoa densa ao redor concedendo camuflagem arcana." },
        { nome: "Onda de Retorno", cor: "azul", receita: "Tinta Azul", efeito: "Empurra todos os inimigos ao redor para longe com força hidráulica., deixa o campo umido, lançado o alvo ate 5 metros" },

        // --- TINTA AMARELA (LUZ) [21 a 30] ---
        { nome: "Clarão Ofuscante", cor: "amarela", receita: "Tinta Amarela", efeito: "Cega temporariamente inimigos em um raio de 5 metros." },
        { nome: "Lâmina de Luz", cor: "amarela", receita: "Tinta Amarela", efeito: "Infunde uma arma com luz radiante, permite ferir criaturais e causa dano extra em criaturas sobrenaturais maliguinas" },
        { nome: "Faro da Verdade", cor: "amarela", receita: "Tinta Amarela", efeito: "Revela ilusões, metamorfos e invisibilidade em até 10 metros." },
        { nome: "Aura de Proteção", cor: "amarela", receita: "Tinta Amarela", efeito: "Concede +2 no suporta lesao do alvo por uma cena. " },
        { nome: "Feixe Solar", cor: "amarela", receita: "Tinta Amarela", efeito: "Dispara um raio de luz concentrada em linha reta ignorando armaduras leves." },
        { nome: "Luz Guia", cor: "amarela", receita: "Tinta Amarela", efeito: "Cria uma esfera de luz flutuante que ilumina locais escuros., inimigos que estao sobre a luz sao revelados,e aliados recebem um buf de +2 em acerto contra inimigos revelados" },
        { nome: "Claridade Mental", cor: "amarela", receita: "Tinta Amarela", efeito: "Remove efeitos de medo ou confusão mental de um aliado,permitindo tambem exorcirsar o alvo" },
        { nome: "Selo Solar", cor: "amarela", receita: "Tinta Amarela", efeito: "Cria uma runa no chão que prende criaturas ao pisarem.,machuca ao tentar ultrapassar , porem nao poderam ultrapassar por inteiro" },
        { nome: "Reflexo Espelhado", cor: "amarela", receita: "Tinta Amarela", efeito: "Cria cópias ilusórias de algo ou alguem." },
        { nome: "Toque do Amanhecer", cor: "amarela", receita: "Tinta Amarela", efeito: "estabiliza um ferimento temporariamente" },

        // --- TINTA PRETA (MATÉRIA - PASSIVA DE CRÍTICO) [31 a 40] ---
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

        // --- TINTA BRANCA (APAGAR - PASSIVA DE CRÍTICO) [41 a 50] ---
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
        { nome: "Gêiser Eruptivo", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Faz brotar água fervente do chão em área de 3 metros causando 3 (dano misto)." },
        { nome: "Cura Calcinante", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Cura um aliado, mas cauteriza feridas com calor mágico instantâneo." },
        { nome: "Nevoeiro Termal", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Cria uma névoa espessa e quente que confunde sensores térmicos." },
        { nome: "Escudo de Vapor", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Cria uma barreira defensiva que repele projeteis e queima quem se aproxima." },
        { nome: "Lâmina de Água Fervente", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "remove efeitos de arma ou armadura" },
        { nome: "Chama Líquida", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Dispara um fluido pegajoso que queima mesmo sob a água, 1 de dano constante" },
        { nome: "Purificação Ígnea", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Purifica o corpo de doenças queimando impurezas espirituais." },
        { nome: "Pulso de Vapor", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "cria uma curtina de gas,enquanto nimguem tapar a fenda continuara enchendo o local com o gas, sufucando quem a respira, tempo de duraçao 1 cena " },
        { nome: "Termoterapia Mágica", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul", efeito: "Recupera fadiga extrema, podendo acordar pessoas desmaiadas" },

        // --- MESCLAS DUPLAS: VERMELHA + AMARELA [61 a 70] ---
        { nome: "Plasma Solar", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Cria uma esfera de plasma superaquecido que causa 4 dano massivo." },
        { nome: "Aura de Fogo Sagrado", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Envolve o usuário em chamas douradas que blindam contra criaturas sobrenaturais." },
        { nome: "Lança de Radiância Ardente", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "cria uma laça luz que lhe permite trocar de lugar com ela" },
        { nome: "Explosão Prateada", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "purifica todos os efeitos negativos" },
        { nome: "Manto de Ouro Vivo", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Aumenta em +2 o suporta lesao e concede aura de calor blindada por 1 cena., inimigos proximos sao queimados levando 1 de dano" },
        { nome: "Brilho Magmático", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "permite colocar um ponto brilhante em um local atraindo qualquer coisa feita de metal" },
        { nome: "Chama Solar Refletida", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Reflete feixes de luz concentrada em alvos específicos." },
        { nome: "Fúria Radiante", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "faz o inimigo atacar qualquer um proximo a ele." },
        { nome: "Farol de Combate", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Marca um inimigo com luz incandescente visível a longa distância." },
        { nome: "Supernova Menor", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela", efeito: "Pequena explosão luz-fogo em grande área 10 de dano, so explodindo depois de uma cena" },

        // --- MESCLAS DUPLAS: AZUL + AMARELA [71 a 80] ---
        { nome: "Luz das Marés", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "ao desenhar sobre o aliado, cura todos seus ferimentos" },
        { nome: "Prisma Espiritual", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "permite conversa com alguem idependente da distancia viva ou morta" },
        { nome: "Escudo de Aurora", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "protege alguem contra posseçao e efeitos sobrenaturais" },
        { nome: "Água Cristalina", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Cria água benta com propriedades de cura aprimoradas." },
        { nome: "Bênção dos Mares", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "cria uma poça no chao que concede 1 de dano constante a quem pisa sobre ela" },
        { nome: "Nevoeiro Arco-Íris", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Cria ilusões óticas fantásticas na névoa d'água." },
        { nome: "Pulso de Cura Astral", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Cura em área moderada e afasta presenças espirituais malignas." },
        { nome: "Olhar da Verdade Oceânica", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "Permite encherga atravez de materia" },
        { nome: "Cristalização de Luz", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "o diogenes cria um feiche de luz que congela o alvo, apenas podendo um alvo por vez" },
        { nome: "Onda Radiante", cor: "mescla", receita: "Tinta Azul + Tinta Amarela", efeito: "lança uma onda de energia que deliga aoarelhos por um determinado tempo" },

        // --- MESCLAS COM PRETA E BRANCA (MATÉRIA E NADA) [81 a 90] ---
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

        // --- MESCLAS COMPLEXAS E MULTITINTAS SUPREMAS [91 a 100] ---
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
    console.log("Sistema: Tentando logar como ->", currentUser); // Rastreador 1

    if (currentUser.toLowerCase() === "mestre" || currentUser.toLowerCase() === "gm") { 
        console.log("Sistema: Mestre detectado! Removendo a invisibilidade..."); // Rastreador 2
        
        const gmControls = document.getElementById("gm-controls");
        if (gmControls) {
            gmControls.classList.remove("hidden");
        } else {
            console.error("Erro: O HTML do gm-controls não foi encontrado na página!");
        }
        
        const cardPerfil = document.querySelector(".card-perfil");
        if (cardPerfil) cardPerfil.style.display = "none"; 
        
    } else {
        console.log("Sistema: Jogador comum detectado.");
        const gmControls = document.getElementById("gm-controls");
        if (gmControls) gmControls.classList.add("hidden");
        
        const cardPerfil = document.querySelector(".card-perfil");
        if (cardPerfil) cardPerfil.style.display = "block";
    }
  
    registrarLog("Adentrou o grimório.");
    carregarGrimorioDoFirebase();
    carregarInventarioDoFirebase();
    carregarFichaDoFirebase();
   if (currentUser && currentUser.toLowerCase() === 'diogenes') {
    gerenciarMarcadorTintaDiogenes();
}
  // Adicione isso dentro da sua função de login, logo após definir quem é o usuário!
  iniciarChatAvancado();
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
    
    let listaFinal = lista;
    
    // Regras exclusivas para o Diógenes
    if (currentUser && currentUser.toLowerCase() === 'diogenes') {
        // 1. Filtro por cor selecionada nos botões
        if (filtroCorDiogenes !== 'todos') {
            listaFinal = listaFinal.filter(ef => ef.cor === filtroCorDiogenes);
        }
        
        // 2. Trava de Tinta Preta e Branca (Exige tirar números iguais nos dados)
        if (!tintaEspecialLiberada) {
            listaFinal = listaFinal.filter(ef => ef.cor !== 'preta' && ef.cor !== 'branca');
        }
        
        // 3. Limite de capacidade pela qualidade da tinta
        listaFinal = listaFinal.slice(0, limiteTintaDiogenes);
    }

    if(listaFinal.length === 0) {
        DOM.grid.innerHTML = "<p class='text-muted' style='grid-column: 1/-1;'>Nenhum efeito encontrado com esta cor ou o limite de tinta esgotou as páginas visíveis!</p>";
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
    
    let modalContent = document.querySelector('#modal-view .modal-content') || document.getElementById('view-efeito').parentNode;
    
    // Remove botão de conjurar antigo se já existir para não duplicar
    let btnAntigo = document.getElementById('btn-conjurar-magia');
    if (btnAntigo) btnAntigo.remove();
    
    // Cria o botão de conjurar
    const btnConjurar = document.createElement('button');
    btnConjurar.id = 'btn-conjurar-magia';
    btnConjurar.className = 'btn-mystic'; 
    btnConjurar.style.cssText = "background: #25d366; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 10px;";
    btnConjurar.innerText = `✨ Conjurar / Usar Tinta (${ef.cor.toUpperCase()})`;
    
    btnConjurar.onclick = () => {
        // Tenta usar a tinta usando a função que criamos
        const podeConjurar = usarEfeitoDiogenes(ef);
        
        if (podeConjurar) {
            alert(`✨ Magia "${ef.nome}" conjurada com sucesso! Uma carga de tinta ${ef.cor} foi consumida.`);
            DOM.modalView.style.display = 'none'; // Fecha o modal só após conjurar com sucesso
        }
    };
    
    modalContent.appendChild(btnConjurar);
    
    // ATENÇÃO AQUI: Deve ser 'flex' para o modal aparecer na tela!
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
// ==========================================
// 8. ROLADOR DE DADOS
// ==========================================
document.getElementById('btn-roll').addEventListener('click', () => {
    const diceDisplay = document.getElementById('dice-result');
    const logDisplay = document.getElementById('dice-log');
    
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
        
        // 1. Rolo a quantidade de dados especificada PRIMEIRO
        for (let i = 0; i < quantidade; i++) {
            let roll = Math.floor(Math.random() * sides) + 1;
            resultadosIndividuais.push(roll);
            somaRolagensPuras += roll;
        }
        
        // 2. AGORA SIM: Verifica se tirou dois números iguais (duplo) para desbloquear tinta Preta/Branca
        // Verifica se tirou dois números iguais (duplo) para desbloquear/reabastecer SOMENTE Preta e Branca
        if (currentUser && currentUser.toLowerCase() === 'diogenes' && resultadosIndividuais.length >= 2) {
            const temDuplo = resultadosIndividuais.some((val, i, arr) => arr.indexOf(val) !== i);
            if (temDuplo) {
                tintaEspecialLiberada = true;
                
                // Apenas Preto e Branco recebem cargas com o duplo nos dados
                estoqueTintasDiogenes['preta'] = Math.floor(limiteTintaDiogenes / 2);
                estoqueTintasDiogenes['branca'] = Math.floor(limiteTintaDiogenes / 2);
                
                alert("✨ DUPLO MÍSTICO! As tintas especiais (Preta e Branca) foram desbloqueadas e abastecidas!");
                
                atualizarPainelTintasVisual();
                salvarEstoqueNoFirebase();
                renderizarCards(userGrimoire);
            }
        }
        
        // Aplicação do fator cármico opcional na média total
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
    }, 400);
  // ======= NOVA INTEGRAÇÃO: ENVIAR PARA O CHAT GERAL =======
        const textoParaChat = `Rolou ${quantidade}D${sides}${textoMod}\nDetalhes: ${detalheDados}\n**${totalFinal}**`;
        
        if (typeof window.enviarMensagemChat === "function") {
            window.enviarMensagemChat(textoParaChat, 'roll');
        }
        // ==========================================================
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
// 12. SISTEMA DE INVENTÁRIO E FORJA SEPARADOS
// ==========================================
// ==========================================
// 12. SISTEMA DE INVENTÁRIO E FORJA DINÂMICA
// ==========================================
let userInventory = []; 
let listaDeMescla = []; // Lista para múltiplos itens no caldeirão

// Função precisa para verificar e recarregar tintas comuns ao craftar
function concluirCrafting(nomeItemCriado) {
    const nomeLower = nomeItemCriado.toLowerCase().trim();
    let corEncontrada = null;

    if (nomeLower.includes('vermelha')) corEncontrada = 'vermelha';
    else if (nomeLower.includes('azul')) corEncontrada = 'azul';
    else if (nomeLower.includes('amarela')) corEncontrada = 'amarela';

    if (corEncontrada) {
        estoqueTintasDiogenes[corEncontrada] = limiteTintaDiogenes; // Restaura 10 cargas
        alert(`🧪 Pote Recarregado! A Tinta ${corEncontrada.toUpperCase()} agora tem ${limiteTintaDiogenes} cargas.`);
        atualizarPainelTintasVisual();
        salvarEstoqueNoFirebase();
    }
}

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
    if (listaDeMescla.length < 2) return alert("Coloque pelo menos 2 materiais no caldeirão para mesclar!");
    
    const nomeItem = document.getElementById('craft-result-name').value.trim();
    const emojiItem = document.getElementById('craft-emoji-input').value.trim();

    if (!nomeItem || !emojiItem) return alert("Defina um nome e um emoji para o novo item!");

    document.getElementById('btn-craft-visual').disabled = true;

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

            // 🧪 VERIFICAÇÃO DE CRAFT DE TINTA (AQUI É ONDE ELA É CHAMADA!)
            concluirCrafting(nomeItem);

            if (typeof registrarLog === "function") {
                registrarLog(`Forjou o item [${emojiItem} ${nomeItem}] combinando ${listaDeMescla.length} ingredientes.`);
            }
            
            alert(`Item Criado! ${emojiItem} ${nomeItem} foi adicionado ao seu Inventário.`);
            
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
                nivel: 1,
                ferimentos: {
                    graves: 0,   // Máximo 4
                    criticos: 0  // Máximo 1 (o 2º é fatal/desmaio)
                },
                atributos: { ...BibliotecaSistemas["KULT"].atributosBase }
            };
            set(fichaRef, novaFicha);
        }
    });
}

function renderizarPerfil() {
    if (!fichaAtual) return;
    
    let sys = BibliotecaSistemas[fichaAtual.sistema];
    if (!sys) {
        sys = BibliotecaSistemas["KULT"];
    }
    
    // Atualiza dados básicos na tela
    document.getElementById('nome-personagem').innerText = fichaAtual.nome.toUpperCase();
    document.getElementById('sistema-personagem').innerText = sys.nome;
    document.getElementById('display-xp').innerText = fichaAtual.xp;

    // Lógica de Level Up
    const areaUpar = document.getElementById('area-level-up');
    if (areaUpar) {
        if (fichaAtual.xp >= sys.custoXpPorNivel) {
            areaUpar.classList.remove('hidden');
        } else {
            areaUpar.classList.add('hidden');
        }
    }

    // Calcula penalidade de bônus negativo baseada nos ferimentos graves (-1 por ferimento grave)
    const fGraves = fichaAtual.ferimentos ? fichaAtual.ferimentos.graves : 0;
    const penalidadeGrave = fGraves * -1; 

    // Gerar Botões de Atributos (já aplicando a penalidade dos ferimentos)
const container = document.getElementById('botoes-atributos');
if (container) {
    // Layout anti-estique: 3 colunas e margens/espaçamentos mínimos para celular
    container.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 5px;";
    container.innerHTML = "";
    
    for (let attr in fichaAtual.atributos) {
        const valorBase = fichaAtual.atributos[attr];
        const valorFinal = valorBase + penalidadeGrave;
        
        const btn = document.createElement('button');
        btn.className = "btn-rolagem-rapida";
        // Estilo ultra-compacto para economizar espaço vertical no mobile
        btn.style.cssText = "background: #2a2a2a; border: 1px solid #444; padding: 4px 2px; border-radius: 4px; color: white; cursor: pointer; font-size: 0.75rem; line-height: 1.1; text-align: center;";
        btn.innerText = `${attr}\n(${valorFinal >= 0 ? '+' : ''}${valorFinal})`;
        
        btn.onclick = () => {
            // 1. Configura os parâmetros do rolador principal
            document.getElementById('dice-qtd').value = sys.quantidadeDados;
            document.getElementById('dice-type').value = sys.tipoDado;
            document.getElementById('dice-mod').value = Math.abs(valorFinal);
            document.getElementById('mod-sign').value = valorFinal >= 0 ? '+' : '-';
            
            // 2. Dispara a rolagem nativa
            document.getElementById('btn-roll').click();
            
            // 3. Espera 450ms (garantindo que o dado já terminou de rodar) para capturar o resultado real
            setTimeout(() => {
                const resultadoApp = document.getElementById('dice-result').innerText;
                
                // Pega os detalhes do último log de dados para ficar idêntico ao menu de dados
                const logElements = document.getElementById('dice-log').children;
                let detalheLog = logElements.length > 0 ? logElements[0].innerText : `${sys.quantidadeDados}D${sys.tipoDado}`;
                const textoChatFicha = `Teste de Atributo: ${attr} (${sys.nome})\nDetalhes: ${detalheLog}\n**${resultadoApp}**`;
                if (typeof window.enviarMensagemChat === "function") {
                    window.enviarMensagemChat(textoChatFicha, 'roll');
                }
                // Mensagem formatada para o WhatsApp (idêntica ao sistema de dados)
                const textoMensagem = `🎲 *Teste de ${attr} (${sys.nome})* 🎲\n\nPersonagem: *${currentUser.toUpperCase()}*\nResultado Final: *${resultadoApp}*\nDetalhes: _${detalheLog}_\n\n🔮 _Enviado do Grimório Vivo_`;
                
                // Remove modal anterior se houver
                const modalAntigo = document.getElementById('modal-rolagem-custom');
                if (modalAntigo) modalAntigo.remove();
                
                // Cria o Popup customizado
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
                        
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(textoMensagem)}" target="_blank" style="flex: 1; background: #25d366; color: white; padding: 8px; border-radius: 4px; text-decoration: none; font-size: 0.8rem; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 4px;">📲 Zap</a>
                            <button id="btn-fechar-modal" style="flex: 1; background: #444; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">Fechar</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Eventos para fechar o popup
                document.getElementById('btn-fechar-modal').onclick = () => modal.remove();
                modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
            }, 450); // Tempo sincronizado com o término do dado
            
            if (typeof registrarLog === "function") registrarLog(`Testou ${attr} (${sys.nome}).`);
        };
        container.appendChild(btn);
    }
}
    // ==========================================
    // RENDERIZAR PAINEL DE FERIMENTOS NA FICHA
    // ==========================================
    let painelFerimentos = document.getElementById('painel-ferimentos-jogador');
    if (!painelFerimentos) {
        const containerPerfil = document.querySelector('.card-perfil') || document.getElementById('app-screen');
        painelFerimentos = document.createElement('div');
        painelFerimentos.id = 'painel-ferimentos-jogador';
        painelFerimentos.style.cssText = "margin: 15px 0; padding: 10px; background: rgba(50,0,0,0.4); border: 1px solid #800; border-radius: 5px;";
        containerPerfil.appendChild(painelFerimentos);
    }

    const fCriticos = fichaAtual.ferimentos ? fichaAtual.ferimentos.criticos : 0;
painelFerimentos.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem;">
        <span>⚠️ Graves: <strong>${fGraves}/4</strong> ${fGraves > 0 ? `(Mod: ${penalidadeGrave})` : ''}</span>
        <span style="color: ${fCriticos > 0 ? '#ff4444' : 'inherit'}">💀 Críticos: <strong>${fCriticos}/1</strong></span>
    </div>
`;
painelFerimentos.style.cssText = "margin: 10px 0; padding: 6px 10px; background: rgba(50,0,0,0.3); border: 1px solid #600; border-radius: 4px;";
    
    // Revelar controles do Mestre caso esteja autenticado
    if (isMasterAuthenticated) {
        const gmControls = document.getElementById('gm-controls');
        if (gmControls) gmControls.classList.remove('hidden');
    }
  // Atualiza o valor do editor JSON móvel automaticamente
   // Preenche o Novo Editor Visual com os atributos atuais da ficha
    const containerEditor = document.getElementById('lista-editor-atributos');
    if (containerEditor) {
        containerEditor.innerHTML = ''; // Limpa as caixinhas antigas
        
        // Puxa os atributos da fichaAtual (que veio do Firebase) e cria as linhas
        if (fichaAtual.atributos) {
            for (const [nome, valor] of Object.entries(fichaAtual.atributos)) {
                adicionarLinhaEditor(nome, valor);
            }
        }
    }
}
// Salvar alterações feitas manualmente pelo editor de texto JSON


// 1. Salvar alterações feitas manualmente pelo editor de texto JSON
const btnSalvarJson = document.getElementById('btn-salvar-json');
if (btnSalvarJson) {
    btnSalvarJson.onclick = async () => {
        const jsonText = document.getElementById('json-editor-ficha').value;
        try {
            const novaFichaParsed = JSON.parse(jsonText);
            if (!currentUser) return alert("Erro: Nenhum usuário logado!");
            const charRef = ref(db, `characters/${currentUser}`);
            await set(charRef, novaFichaParsed);
            alert("Ficha atualizada e salva com sucesso pelo editor JSON!");
            fichaAtual = novaFichaParsed;
            renderizarPerfil();
            if (typeof registrarLog === "function") {
                registrarLog(`${currentUser} atualizou sua ficha via editor JSON.`);
            }
        } catch (e) {
            alert("Erro de sintaxe no JSON! Verifique se esqueceu alguma chave ({ }), aspas (\") ou vírgula.\n\nDetalhe do erro: " + e.message);
        }
    };
}

// 2. Botão de Upar Atributo (Gasta XP)
const btnUparAttr = document.getElementById('btn-upar-atributo');
if (btnUparAttr) {
    btnUparAttr.onclick = () => {
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
}

// ==========================================
// 15. FERRAMENTAS DO MESTRE E QUADRO DE MISSÕES
// ==========================================

// ==========================================
// 15. FERRAMENTAS DO MESTRE E QUADRO DE MISSÕES
// ==========================================

// Variável para armazenar o último alvo selecionado pelo Mestre
let jogadorAlvoGm = "";

// Função auxiliar para o Mestre escolher o alvo dinamicamente
async function atualizarListaAlvosGm() {
    const selectAlvo = document.getElementById('gm-select-alvo');
    if (!selectAlvo) return;

    try {
        const snapshot = await get(child(ref(db), 'characters'));
        selectAlvo.innerHTML = ""; // Limpa opções antigas

        if (!snapshot.exists()) {
            selectAlvo.innerHTML = `<option value="">Nenhum personagem cadastrado</option>`;
            return;
        }

        const personagens = snapshot.val();
        Object.keys(personagens).forEach(id => {
            const char = personagens[id];
            const option = document.createElement('option');
            option.value = id; // Usa a chave do banco (ex: "dominick")
            option.innerText = char.nome ? char.nome.toUpperCase() : id.toUpperCase();
            selectAlvo.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar alvos para o GM:", error);
    }
}

// Mestre concede XP para qualquer jogador
document.getElementById('btn-gm-xp').onclick = async () => {
    const valor = parseInt(document.getElementById('gm-mod-valor').value);
    const alvo = document.getElementById('gm-select-alvo').value;

    if (!alvo) return alert("Selecione um jogador válido na lista!");
    if (isNaN(valor)) return alert("Digite um valor numérico válido no campo de modificação.");
    
    const charRef = ref(db, `characters/${alvo}`);
    const snapshot = await get(charRef);
    
    if (!snapshot.exists()) {
        return alert(`O personagem não foi encontrado no Firebase.`);
    }
    
    const dadosChar = snapshot.val();
    const qtdXp = Math.abs(valor);
    const novoXp = (dadosChar.xp || 0) + qtdXp; 
    
    update(charRef, { xp: novoXp }).then(() => {
        alert(`${qtdXp} XP concedido para ${alvo.toUpperCase()}. Total XP: ${novoXp}`);
        if (typeof registrarLog === "function") {
            registrarLog(`GM concedeu ${qtdXp} XP para ${alvo}.`);
        }
    });
};
// ==========================================
// CONTROLE DO MESTRE: APLICAR / CURAR FERIMENTOS
// ==========================================
document.getElementById('btn-gm-ferimento').onclick = async () => {
    const alvo = document.getElementById('gm-select-alvo').value;
    const tipo = prompt("Qual tipo de ferimento deseja alterar? Digite: 'grave' ou 'critico'");
    const acao = prompt("Deseja 'adicionar' ou 'curar'?");

    if (!alvo) return alert("Selecione um jogador na lista do Mestre primeiro!");
    if (tipo !== 'grave' && tipo !== 'critico') return typeError("Tipo inválido. Use 'grave' ou 'critico'.");

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
                // Regra: Se tiver o máximo de graves e receber outro, vira crítico!
                graves = 4;
                criticos++;
                alert(`⚠️ O limite de Ferimentos Graves estourou! O ferimento se agravou e virou um FERIMENTO CRÍTICO!`);
            }
        } else if (tipo === 'critico') {
            if (criticos >= 1) {
                alert(`💀 FATALIDADE: ${alvo.toUpperCase()} já possuía um Ferimento Crítico e recebeu outro! O personagem desmaiou ou faleceu.`);
            }
            criticos++;
        }
    } else if (acao === 'curar') {
        if (tipo === 'grave' && graves > 0) graves--;
        if (tipo === 'critico' && criticos > 0) criticos--;
    }

    // Salva no Firebase
    update(charRef, {
        ferimentos: { graves, criticos }
    }).then(() => {
        alert(`Ferimentos de ${alvo.toUpperCase()} atualizados com sucesso! (Graves: ${graves}, Críticos: ${criticos})`);
        if (typeof registrarLog === "function") {
            registrarLog(`GM alterou os ferimentos de ${alvo} (${tipo}: ${acao}).`);
        }
    });
};

// Sincronização do Quadro de Missões (Global para todos os jogadores)
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
        lista.innerHTML = "<span style='color: #888;'>Nenhuma missão ativa no momento.</span>";
    }
});

document.getElementById('btn-add-missao').onclick = () => {
    const textoInput = document.getElementById('gm-missao-texto');
    const texto = textoInput.value.trim();
    if (texto) {
        push(ref(db, 'quests'), { texto, data: Date.now() }).then(() => {
            textoInput.value = "";
            if (typeof registrarLog === "function") registrarLog(`GM adicionou uma nova missão ao mural.`);
        });
    } else {
        alert("Escreva o texto da missão antes de fixá-la!");
    }
};

window.apagarMissao = function(key) {
    if (confirm("Deseja remover esta missão do mural?")) {
        remove(ref(db, `quests/${key}`));
    }
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
// ==========================================
// SINCRONIZAÇÃO AUTOMÁTICA DOS ALVOS DO MESTRE
// ==========================================
const selectAlvoGm = document.getElementById('gm-select-alvo');

if (selectAlvoGm) {
    const charactersRef = ref(db, 'characters');
    
    // Fica escutando o Firebase em tempo real
    onValue(charactersRef, (snapshot) => {
        // Limpa as opções atuais para evitar duplicação
        selectAlvoGm.innerHTML = '<option value="">Selecione um jogador...</option>';
        
        if (snapshot.exists()) {
            const personagens = snapshot.val();
            
            // Varre cada personagem salvo no Firebase
            Object.keys(personagens).forEach(key => {
                const dados = personagens[key];
                const option = document.createElement('option');
                
                option.value = key; // ID do personagem (ex: "dominick")
                option.textContent = dados.nome ? dados.nome : key;
                
                selectAlvoGm.appendChild(option);
            });
        } else {
            selectAlvoGm.innerHTML = '<option value="">Nenhum personagem cadastrado</option>';
        }
    });
}
// ==========================================
// 17. EDITOR VISUAL DE ATRIBUTOS
// ==========================================

// Função para criar uma linha no editor visual
// Função para criar uma linha no editor visual (Otimizada para Mobile)
// Função para criar uma linha no editor visual (Otimizada para Mobile)
function adicionarLinhaEditor(nome = "", valor = 0) {
    const container = document.getElementById('lista-editor-atributos');
    if (!container) return; 
    
    const div = document.createElement('div');
    // Adicionado width: 100% e margin-bottom para separar as linhas
    div.style.cssText = "display: flex; gap: 5px; align-items: center; width: 100%; margin-bottom: 5px;";

    // Adicionado min-width: 0 e box-sizing nos inputs; flex-shrink: 0 no botão X
    div.innerHTML = `
        <input type="text" class="input-mystic nome-attr" value="${nome}" placeholder="Nome" style="flex: 2; min-width: 0; box-sizing: border-box; padding: 6px; font-size: 0.85rem;">
        <input type="number" class="input-mystic valor-attr" value="${valor}" placeholder="Valor" style="flex: 1; min-width: 0; box-sizing: border-box; text-align: center; padding: 6px; font-size: 0.85rem;">
        <button class="btn-remover-attr" style="background: #8b0000; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-weight: bold; flex-shrink: 0;">X</button>
    `;

    // Botão de remover a linha
    div.querySelector('.btn-remover-attr').onclick = () => div.remove();
    container.appendChild(div);
}

// Evento para o botão "+ Novo Atributo"
const btnNovoAttr = document.getElementById('btn-novo-atributo');
if (btnNovoAttr) {
    btnNovoAttr.addEventListener('click', () => {
        adicionarLinhaEditor("", 0); // Adiciona uma linha em branco
    });
}

// Evento para o botão "Salvar Ficha"
const btnSalvarEditor = document.getElementById('btn-salvar-editor');
if (btnSalvarEditor) {
    btnSalvarEditor.addEventListener('click', () => {
        if (!currentUser) return alert("Erro: Nenhum usuário logado!");

        // 1. Coleta tudo que foi digitado nas caixinhas
        const novosAtributos = {};
        const linhas = document.querySelectorAll('#lista-editor-atributos > div');
        
        linhas.forEach(linha => {
            const nome = linha.querySelector('.nome-attr').value.trim();
            const valor = parseInt(linha.querySelector('.valor-attr').value) || 0;
            
            // Só salva se o jogador tiver digitado um nome para o atributo
            if (nome) {
                novosAtributos[nome] = valor;
            }
        });

        // 2. Salva direto no Firebase
        set(ref(db, `characters/${currentUser}/atributos`), novosAtributos)
            .then(() => {
                alert("Atributos salvos com sucesso!");
                if (typeof registrarLog === "function") {
                    registrarLog(`${currentUser} atualizou seus atributos pelo Editor Visual.`);
                }
            })
            .catch(erro => alert("Erro ao salvar: " + erro));
    });
}
// ==========================================
// 18. MARCADOR DE QUALIDADE DE TINTA (DIÓGENES)
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
                // Dentro da função gerenciarMarcadorTintaDiogenes, atualize o innerHTML do painelTinta:
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
    
    <!-- Visão de Estoque de Tintas por Cor -->
    <div style="display: flex; gap: 8px; justify-content: space-around; background: #111; padding: 6px; border-radius: 4px; border: 1px solid #333; font-size: 0.75rem;">
        <span>🔴 V: <strong id='estoque-vermelha'>${estoqueTintasDiogenes.vermelha}</strong></span>
        <span>🔵 A: <strong id='estoque-azul'>${estoqueTintasDiogenes.azul}</strong></span>
        <span>🟡 Am: <strong id='estoque-amarela'>${estoqueTintasDiogenes.amarela}</strong></span>
        <span>⚫ P: <strong id='estoque-preta'>${estoqueTintasDiogenes.preta}</strong></span>
        <span>⚪ B: <strong id='estoque-branca'>${estoqueTintasDiogenes.branca}</strong></span>
        <span>🟣 M: <strong id='estoque-mescla'>${estoqueTintasDiogenes.mescla}</strong></span>
    </div>
    
    <!-- Botões de Filtro por Cor -->
    <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; border-top: 1px solid #333; padding-top: 6px;">
        <button class="btn-filtro-cor" data-cor="todos" style="background: #333; color: #fff; border: 1px solid #555; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer; font-weight: bold;">Todas</button>
        <button class="btn-filtro-cor" data-cor="vermelha" style="background: #8b0000; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Vermelha</button>
        <button class="btn-filtro-cor" data-cor="azul" style="background: #00008b; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Azul</button>
        <button class="btn-filtro-cor" data-cor="amarela" style="background: #b8860b; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Amarela</button>
        <button class="btn-filtro-cor" data-cor="preta" style="background: #222; color: #fff; border: 1px solid #555; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Preta</button>
        <button class="btn-filtro-cor" data-cor="branca" style="background: #ddd; color: #000; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Branca</button>
        <button class="btn-filtro-cor" data-cor="mescla" style="background: #551a8b; color: #fff; border: none; padding: 3px 8px; border-radius: 3px; font-size: 0.75rem; cursor: pointer;">Mescla</button>
    </div>
`;
  
                
                gridMagias.parentNode.insertBefore(painelTinta, gridMagias);
                
                // Evento ao mudar a qualidade da tinta
                document.getElementById('select-qualidade-tinta').onchange = (e) => {
                    salvarEAtualizarTinta(e.target.value);
                };
                
                // Eventos dos botões de filtro de cor
                painelTinta.querySelectorAll('.btn-filtro-cor').forEach(btn => {
                    btn.onclick = (e) => {
                        filtroCorDiogenes = e.target.getAttribute('data-cor');
                        
                        // Destaca visualmente o botão ativo
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
    
    const statusEl = document.getElementById('status-limite-tinta');
    if (statusEl) {
        statusEl.innerText = `Capacidade: ${limiteTintaDiogenes}`;
    }
    
    // Atualiza os cards na tela imediatamente baseando-se no novo limite
    if (typeof userGrimoire !== 'undefined') {
        renderizarCards(userGrimoire);
    }
    
    // Salva a escolha no Firebase
    set(ref(db, `characters/diogenes/qualidadeTinta`), {
        qualidade: qualidade,
        limite: limiteTintaDiogenes
    }).then(() => {
        if (typeof registrarLog === "function") {
            registrarLog(`Diógenes ajustou a qualidade da tinta para: ${qualidade.toUpperCase()} (${limiteTintaDiogenes} efeitos).`);
        }
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
            const statusEl = document.getElementById('status-limite-tinta');
            if (statusEl) statusEl.innerText = `Capacidade: ${limiteTintaDiogenes}`;
            
            // Renderiza o grimório já aplicando o limite carregado
            if (typeof userGrimoire !== 'undefined') {
                renderizarCards(userGrimoire);
            }
        }
    }, { onlyOnce: true });
}
// ==========================================
// 19. CONSUMO DE TINTA (DIÓGENES)
// ==========================================
function usarEfeitoDiogenes(efeito) {
    if (!currentUser || currentUser.toLowerCase() !== 'diogenes') return true;

    const coresNecessarias = [];

    if (efeito.cor !== 'mescla') {
        // Magia simples: consome apenas a própria cor
        coresNecessarias.push(efeito.cor);
    } else {
        // Magia de Mescla: identifica quais tintas estão na receita[cite: 5]
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

    // 1. Verifica se há estoque suficiente para TODAS as tintas exigidas
    const tintasFaltando = [];
    coresNecessarias.forEach(cor => {
        if (!estoqueTintasDiogenes[cor] || estoqueTintasDiogenes[cor] <= 0) {
            tintasFaltando.push(cor.toUpperCase());
        }
    });

    if (tintasFaltando.length > 0) {
        alert(`❌ Tinta insuficiente para a mescla! Faltam cargas de: ${tintasFaltando.join(', ')}.`);
        return false; // Bloqueia a conjuração
    }

    // 2. Consome 1 carga de cada tinta envolvida na mescla[cite: 5]
    coresNecessarias.forEach(cor => {
        estoqueTintasDiogenes[cor]--;
    });

    // 3. Sincroniza a interface e o Firebase[cite: 5]
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
// SISTEMA VTT COMPLETO (CHAT, BOTS, CANAIS)
// ==========================================
let canalAtual = 'taverna';
let unsubscribeChat = null;
let jogadorSilenciado = false;
let intervaloMute = null;

function iniciarChatAvancado() {
    const isGM = (currentUser.toLowerCase() === 'mestre' || currentUser.toLowerCase() === 'gm');
    if (isGM) document.getElementById('gm-chat-panel').style.display = 'block';

    update(ref(db, 'canais/taverna'), { nome: 'Taverna', aprovado: true, criador: 'Sistema' });

    // Punições
    onValue(ref(db, 'mutes/' + currentUser.toLowerCase()), (snapshot) => {
        const data = snapshot.val();
        if (data && data.expiraEm > Date.now()) {
            jogadorSilenciado = true;
            document.getElementById('chat-input').disabled = true;
            document.getElementById('btn-send-chat').disabled = true;
            document.getElementById('mute-warning').style.display = 'block';
            
            if (intervaloMute) clearInterval(intervaloMute);
            intervaloMute = setInterval(() => {
                const restante = Math.max(0, data.expiraEm - Date.now());
                if (restante <= 0) {
                    clearInterval(intervaloMute);
                    remove(ref(db, 'mutes/' + currentUser.toLowerCase())); 
                } else {
                    document.getElementById('mute-timer').innerText = `${Math.floor(restante / 60000)}m ${Math.floor((restante % 60000) / 1000)}s`;
                }
            }, 1000);
        } else {
            jogadorSilenciado = false;
            document.getElementById('chat-input').disabled = false;
            document.getElementById('btn-send-chat').disabled = false;
            document.getElementById('mute-warning').style.display = 'none';
            if (intervaloMute) clearInterval(intervaloMute);
        }
    });

    // Canais
    onValue(ref(db, 'canais'), (snapshot) => {
        const lista = document.getElementById('channel-list');
        lista.innerHTML = "";
        const canaisPendentes = document.getElementById('gm-pending-list');
        if(isGM) canaisPendentes.innerHTML = ""; 

        snapshot.forEach(child => {
            const canal = { id: child.key, ...child.val() };
            if (!canal.aprovado && isGM) {
                canaisPendentes.innerHTML += `<button onclick="aprovarFirebase('canais/${canal.id}')" class="btn-mystic" style="font-size:0.7rem; background:#aa8800;">Aprovar: ${canal.nome}</button>`;
            }
            if (canal.aprovado || canal.criador.toLowerCase() === currentUser.toLowerCase() || isGM) {
                const btn = document.createElement('button');
                btn.className = `channel-btn ${canal.id === canalAtual ? 'active' : ''}`;
                btn.innerText = canal.aprovado ? `# ${canal.nome}` : `⏳ ${canal.nome}`;
                btn.onclick = () => {
                    if(!canal.aprovado && !isGM) return alert("Aguarde o Mestre aprovar.");
                    mudarCanal(canal.id, canal.nome);
                };
                lista.appendChild(btn);
            }
        });
    });

    // Bots
    onValue(ref(db, 'bots'), (snapshot) => {
        const lista = document.getElementById('bots-list');
        lista.innerHTML = "";
        
        snapshot.forEach(child => {
            const bot = { id: child.key, ...child.val() };
            if (!bot.aprovado && isGM) {
                document.getElementById('gm-pending-list').innerHTML += `<button onclick="aprovarFirebase('bots/${bot.id}')" class="btn-mystic" style="font-size:0.7rem; background:#aa8800;">Aprovar Bot: ${bot.nome}</button>`;
            }
            if (bot.aprovado || bot.criador.toLowerCase() === currentUser.toLowerCase() || isGM) {
                const card = document.createElement('div');
                card.className = 'bot-card';
                card.innerHTML = `
                    <h5>${bot.aprovado ? '🤖' : '⏳'} ${bot.nome}</h5>
                    <p>❤ HP: ${bot.hp} | 🛡️ Def: ${bot.defesa}</p>
                    <p>⚔️ Dano: ${bot.dano}</p>
                    ${bot.aprovado ? `<button class="btn-mystic" onclick="botAtacar('${bot.nome}', '${bot.dano}')">Atacar</button>` : '<p style="color:red; font-size:0.7rem;">Pendente...</p>'}
                `;
                lista.appendChild(card);
            }
        });
    });

    mudarCanal('taverna', 'Taverna');
}

function mudarCanal(idCanal, nomeCanal) {
    canalAtual = idCanal;
    document.getElementById('current-channel-title').innerText = `Sala: ${nomeCanal}`;
    
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
            const div = document.createElement('div');
            let tipo = 'other';
            let nomeExibicao = msg.remetente.toUpperCase();

            if (msg.tipo === 'roll') { tipo = 'roll'; nomeExibicao = '🎲 DADOS E COMBATE'; } 
            else if (msg.falarComo) { tipo = 'npc'; nomeExibicao = msg.falarComo.toUpperCase(); } 
            else if (msg.remetente.toLowerCase() === currentUser.toLowerCase()) { tipo = 'mine'; } 
            else if (msg.remetente.toLowerCase() === 'mestre') { tipo = 'gm'; nomeExibicao = '👑 VOZ DO MESTRE'; }
            
            div.className = `chat-msg ${tipo}`;
            const hora = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            let html = `<span class="chat-header">${nomeExibicao} <span style="color:#666; font-size:0.65rem;">(${hora})</span></span>`;
            html += `<div>${msg.texto} ${msg.editada ? '<span class="msg-editada">(editada)</span>' : ''}</div>`;
            
            if (msg.remetente.toLowerCase() === currentUser.toLowerCase() || isGM) {
                if (msg.tipo !== 'roll') { 
                    html += `<div class="msg-actions">
                        <span onclick="editarMensagem('${msg.id}', '${msg.texto.replace(/'/g, "\\'")}')">✏️ Editar</span>
                        <span onclick="apagarMensagem('${msg.id}')">🗑️ Apagar</span>
                    </div>`;
                }
            }
            div.innerHTML = html;
            container.appendChild(div);
        });
        container.scrollTop = container.scrollHeight;
    });
}

function enviarMensagem() {
    if (jogadorSilenciado) return;
    const input = document.getElementById('chat-input');
    const texto = input.value.trim();
    if (!texto || !currentUser) return;

    const inputNPC = document.getElementById('gm-npc-name');
    const npcName = inputNPC ? inputNPC.value.trim() : "";

    push(ref(db, `mensagens/${canalAtual}`), {
        remetente: currentUser, falarComo: npcName || null,
        texto: texto, timestamp: Date.now(), tipo: 'chat', editada: false
    });
    input.value = "";
}

// INTEGRAÇÃO GLOBAL DE DADOS (Chame essa função nas rolagens da Ficha)
function registrarRolagemGlobal(motivo, expressao, resultado) {
    if (!currentUser || !canalAtual) return;
    push(ref(db, `mensagens/${canalAtual}`), {
        remetente: currentUser,
        texto: `🎲 <strong>${currentUser.toUpperCase()}</strong> rolou para <em>${motivo}</em><br>Fórmula: [${expressao}] ➔ <strong>Resultado: ${resultado}</strong>`,
        timestamp: Date.now(), tipo: 'roll', editada: false
    });
}

function solicitarNovoCanal() {
    const nome = prompt("Nome da Nova Sala:");
    if (!nome) return;
    const isGM = (currentUser.toLowerCase() === 'mestre' || currentUser.toLowerCase() === 'gm');
    update(ref(db, `canais/${nome.toLowerCase().replace(/[^a-z0-9]/g, '')}`), {
        nome: nome, criador: currentUser, aprovado: isGM 
    });
}

function solicitarNovoBot() {
    const nome = prompt("Nome do Bot:");
    if (!nome) return;
    const isGM = (currentUser.toLowerCase() === 'mestre' || currentUser.toLowerCase() === 'gm');
    push(ref(db, 'bots'), {
        nome, hp: prompt("HP:", "20") || "0", defesa: prompt("Defesa:", "10") || "0", dano: prompt("Dano:", "1d6") || "0", 
        criador: currentUser, aprovado: isGM
    });
}

function aprovarFirebase(caminho) { update(ref(db, caminho), { aprovado: true }); }
function botAtacar(nomeBot, formulaDano) { registrarRolagemGlobal(`Ataque de ${nomeBot}`, formulaDano, "Verificar Dados"); }
function apagarMensagem(id) { if(confirm("Deseja apagar?")) remove(ref(db, `mensagens/${canalAtual}/${id}`)); }
function editarMensagem(id, txt) { 
    const novo = prompt("Edite:", txt); 
    if (novo && novo.trim() !== "") update(ref(db, `mensagens/${canalAtual}/${id}`), { texto: novo.trim(), editada: true }); 
}
function silenciarJogador() {
    const alvo = document.getElementById('mute-player-name').value.trim().toLowerCase();
    const minutos = parseInt(document.getElementById('mute-time').value);
    if (alvo && minutos) set(ref(db, 'mutes/' + alvo), { expiraEm: Date.now() + (minutos * 60 * 1000), mutadoPor: currentUser });
}

document.getElementById('btn-send-chat').addEventListener('click', enviarMensagem);
document.getElementById('chat-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') enviarMensagem(); });

// Expor para o HTML ler os Onclicks
window.solicitarNovoCanal = solicitarNovoCanal;
window.solicitarNovoBot = solicitarNovoBot;
window.aprovarFirebase = aprovarFirebase;
window.botAtacar = botAtacar;
window.apagarMensagem = apagarMensagem;
window.editarMensagem = editarMensagem;
window.silenciarJogador = silenciarJogador;
window.registrarRolagemGlobal = registrarRolagemGlobal;

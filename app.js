// Importações do Firebase v9 (SDK Modular)[cite: 2]
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// ==========================================
// 1. CONFIGURAÇÃO DO FIREBASE[cite: 2]
// ==========================================
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
// 2. VARIÁVEIS GLOBAIS E ESTADOS[cite: 2]
// ==========================================
let currentUser = "";
let userGrimoire = [];
let userInventory = []; 
let currentSpellId = null;
let isMasterAuthenticated = false;

// Variáveis da Forja
let slot1 = null;
let slot2 = null;

// Variável do Sistema de Dados Cármicos
let karmaGlobal = 0; // Varia de -5 (Muita sorte recente) a +5 (Muito azar recente)

// ==========================================
// 3. O GRIMÓRIO ORIGINAL DE DIÓGENES[cite: 2]
// ==========================================
const magiasDiogenes = [
    // --- TINTA VERMELHA (FOGO) ---
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

    // --- TINTA AZUL (ÁGUA E ESPIRITUALIDADE) ---
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

    // --- TINTA AMARELA (LUZ) ---
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

    // --- TINTA PRETA (MATÉRIA) ---
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

    // --- TINTA BRANCA (APAGAR) ---
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

    // --- MESCLAS ---
    { nome: "Torrente de Vapor Quente", cor: "mescla", receita: "Tinta Vermelha + Tinta Azul + Água Benta", efeito: "Jato de vapor escaldante que causa dano de fogo e cega o alvo." },
    { nome: "Aura de Fogo Sagrado", cor: "mescla", receita: "Tinta Vermelha + Tinta Amarela + Ouro", efeito: "Envolve o usuário em chamas douradas que blindam contra mortos-vivos." },
    { nome: "Luz das Marés", cor: "mescla", receita: "Tinta Azul + Tinta Amarela + Pérola", efeito: "Cura ferimentos e ilumina a área ao mesmo tempo com brilho azulado." },
    { nome: "Matéria Vazia", cor: "mescla", receita: "Tinta Preta + Tinta Branca + Essência", efeito: "Cria e desfaz simultaneamente um objeto para abrir fechaduras." },
    { nome: "Fúria dos Quatro Elementos", cor: "mescla", receita: "Vermelha + Azul + Amarela + Preta + Gema Suprema", efeito: "Libera uma tempestade elementar massiva ao redor do conjurador." },
    { nome: "Apotéose Mágica", cor: "mescla", receita: "Tintas Puras + Diamante Bruto + Essência Divina", efeito: "Canaliza essência pura, dobrando o poder de todas as tintas por 3 rodadas." }
];

// ==========================================
// 4. CONTROLE DE LOGIN / INTERFACE[cite: 2]
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
    
    DOM.userTitle.innerText = `Grimório de ${currentUser.charAt(0).toUpperCase() + currentUser.slice(1)}`;
    
    DOM.loginScreen.classList.add('hidden');
    DOM.appScreen.classList.remove('hidden');
    
    registrarLog("Adentrou o grimório.");
    carregarGrimorioDoFirebase();
    carregarInventarioDoFirebase();
}

// ==========================================
// 5. LÓGICA DO FIREBASE (Sincronização)[cite: 2]
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
    DOM.grid.innerHTML = "";
    if(lista.length === 0) {
        DOM.grid.innerHTML = "<p class='text-muted' style='grid-column: 1/-1;'>O grimório está em branco... Forje sua primeira magia!</p>";
        return;
    }

    lista.forEach((ef) => {
        const div = document.createElement('div');
        div.className = `card ${ef.cor}`;
        
        // Suporte para exibição do Emoji no Grimório, se existir
        const iconeDisplay = ef.emoji ? `${ef.emoji} ` : '';
        div.innerText = iconeDisplay + ef.nome;
        
        div.onclick = () => abrirModalView(ef);
        DOM.grid.appendChild(div);
    });
}

// ==========================================
// 6. ADICIONAR / VER / APAGAR MAGIAS[cite: 2]
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
        document.getElementById('new-nome').value = "";
        document.getElementById('new-receita').value = "";
        document.getElementById('new-efeito').value = "";
    });
};

function abrirModalView(ef) {
    currentSpellId = ef.id; 
    document.getElementById('view-titulo').innerText = (ef.emoji ? `${ef.emoji} ` : '') + ef.nome;
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
// 7. SISTEMA DE TABS (Navegação)[cite: 2]
// ==========================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.remove('hidden');
    });
});

// ==========================================
// 8. ROLADOR DE DADOS CÁRMICOS (COM QTD E SINAIS)
// ==========================================

// Função centralizada do Karma
function rolarDadoCarmico(lados) {
    let rolagem = Math.floor(Math.random() * lados) + 1;
    const media = lados / 2;

    // Intervenção Cármica (Advantage / Disadvantage oculta)
    if (karmaGlobal >= 3) {
        // Muito azar recente: Rola outro dado e pega o maior
        let rolagemExtra = Math.floor(Math.random() * lados) + 1;
        rolagem = Math.max(rolagem, rolagemExtra);
        karmaGlobal -= 2; // Consome karma positivo
    } else if (karmaGlobal <= -3) {
        // Muita sorte recente: Rola outro dado e pega o menor
        let rolagemExtra = Math.floor(Math.random() * lados) + 1;
        rolagem = Math.min(rolagem, rolagemExtra);
        karmaGlobal += 2; // Consome karma negativo
    }

    // Alimentando o Karma para as próximas jogadas
    if (rolagem <= media * 0.5) {
        karmaGlobal++; // Aumenta karma (marcando azar)
    } else if (rolagem >= media * 1.5) {
        karmaGlobal--; // Diminui karma (marcando sorte)
    }

    // Travas de limite do Karma
    karmaGlobal = Math.max(-5, Math.min(5, karmaGlobal));

    return rolagem;
}

document.getElementById('btn-roll').addEventListener('click', () => {
    const diceDisplay = document.getElementById('dice-result');
    const logDisplay = document.getElementById('dice-log');
    
    // Captura os novos campos de Quantidade e Sinal
    const qtdInput = document.getElementById('dice-qtd');
    const signInput = document.getElementById('mod-sign');
    
    const qtd = qtdInput ? parseInt(qtdInput.value) || 1 : 1;
    const sides = parseInt(document.getElementById('dice-type').value);
    let mod = parseInt(document.getElementById('dice-mod').value) || 0;
    const sign = signInput ? signInput.value : "+";

    diceDisplay.classList.add('rolling');
    diceDisplay.innerText = "🎲";

    setTimeout(() => {
        diceDisplay.classList.remove('rolling');
        
        let sumRolls = 0;
        let rollDetails = [];

        // Loop de rolagens usando o sistema Cármico
        for(let i = 0; i < qtd; i++) {
            let roll = rolarDadoCarmico(sides);
            sumRolls += roll;
            rollDetails.push(roll);
        }
        
        // Aplica o sinal de operação
        if (sign === "-") mod = -Math.abs(mod);
        else mod = Math.abs(mod);

        const total = sumRolls + mod;
        diceDisplay.innerText = total;

        // Log Visual e Sistema de Auditoria
        const logEntry = document.createElement('div');
        const modText = mod !== 0 ? (mod > 0 ? '+'+mod : mod) : '';
        const detalheTexto = qtd > 1 ? ` (${rollDetails.join(' + ')})` : '';
        
        logEntry.innerText = `[${qtd}D${sides}] rolou ${sumRolls}${detalheTexto} ${modText} = ${total}`;
        logDisplay.prepend(logEntry);

        if (typeof registrarLog === "function") {
             registrarLog(`Rolou [${qtd}D${sides}] e obteve ${total}`);
        }
    }, 400); 
});

// ==========================================
// 9. CALCULADORA ARCANA[cite: 2]
// ==========================================
document.getElementById('btn-calc').addEventListener('click', () => {
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

// ==========================================
// 10. COMPARTILHAMENTO MÍSTICO (WHATSAPP)[cite: 2]
// ==========================================
document.getElementById('btn-share-dice').addEventListener('click', () => {
    const total = document.getElementById('dice-result').innerText;
    const logElements = document.getElementById('dice-log').children;
    let detalhe = logElements.length > 0 ? logElements[0].innerText : "";

    if (total === "-" || total === "🎲") return alert("Role os dados antes de invocar o Zap, mestre!");

    const texto = `🎲 *Rolagem do Destino de ${currentUser}* 🎲\n\nResultado Final: *${total}*\nDetalhes: _${detalhe}_\n\n🔮 _Enviado do Grimório Vivo_`;
    const zapUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(zapUrl, '_blank');
});

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
// 11. SISTEMA DE AUDITORIA E MESTRE[cite: 2]
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
    modalAuth: document.getElementById('modal-gm-auth') || null,
    passInput: document.getElementById('gm-password-input') || null,
    btnSubmit: document.getElementById('btn-submit-gm-auth') || null,
    closeModal: document.getElementById('close-gm-modal') || null,
    logContainer: document.getElementById('master-log-container') || null,
    authTitle: document.getElementById('gm-auth-title') || null,
    authDesc: document.getElementById('gm-auth-desc') || null
};

if(document.getElementById('btn-tab-gm')) {
    document.getElementById('btn-tab-gm').addEventListener('click', (e) => {
        if (!isMasterAuthenticated) {
            e.preventDefault();
            document.getElementById('tab-gm').classList.add('hidden');
            document.getElementById('btn-tab-gm').classList.remove('active');
            
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
                if (snapshot.val() === inputPass) {
                    liberarAcessoMestre();
                } else {
                    alert("Senha incorreta. A magia o rejeita.");
                }
            } else {
                set(ref(db, 'gm_settings/password'), inputPass).then(() => {
                    alert("Senha mestre forjada com sucesso!");
                    liberarAcessoMestre();
                });
            }
        });
    });

    document.getElementById('btn-clear-log').addEventListener('click', () => {
        if (confirm("Isto apagará a história. Tem certeza, Mestre?")) {
            remove(ref(db, 'system_logs'));
        }
    });
}

function liberarAcessoMestre() {
    isMasterAuthenticated = true;
    DOM_GM.modalAuth.style.display = 'none';
    DOM_GM.passInput.value = "";
    
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

// ==========================================
// 12. SISTEMA DE INVENTÁRIO E FORJA VISUAL
// ==========================================
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

function selecionarParaForja(item, icone) {
    if (!slot1) {
        slot1 = { ...item, emojiVisual: icone };
        atualizarSlotsDOM();
    } else if (!slot2) {
        slot2 = { ...item, emojiVisual: icone };
        atualizarSlotsDOM();
    } else {
        slot2 = { ...item, emojiVisual: icone };
        atualizarSlotsDOM();
    }
}

window.removerDoSlot = function(numeroSlot) {
    if (numeroSlot === 1) slot1 = null;
    if (numeroSlot === 2) slot2 = null;
    atualizarSlotsDOM();
}

function atualizarSlotsDOM() {
    const elSlot1 = document.getElementById('slot-1');
    const elSlot2 = document.getElementById('slot-2');
    
    if(!elSlot1 || !elSlot2) return;

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

// Animação Mágica da Forja
function iniciarAnimacaoMagica(callbackFinal) {
    const canvas = document.getElementById('craft-canvas');
    if(!canvas) return callbackFinal(); // Prevenção se o canvas não existir no HTML

    const ctx = canvas.getContext('2d');
    const area = document.getElementById('crafting-area');
    
    canvas.width = area.clientWidth;
    canvas.height = area.clientHeight;
    
    const particles = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let animacaoAtiva = true;

    document.getElementById('crafting-slots').classList.add('forjando');

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
        document.getElementById('crafting-slots').classList.remove('forjando');
        callbackFinal();
    }, 2000);
}

// Botão de Transmutar - Incorporando ao Grimório
if(document.getElementById('btn-craft-visual')) {
    document.getElementById('btn-craft-visual').addEventListener('click', () => {
        if (!slot1 || !slot2) return alert("Os dois focos da balança precisam de itens!");
        
        const nomeItem = document.getElementById('craft-result-name').value.trim();
        const emojiItem = document.getElementById('craft-emoji-input').value.trim();

        if (!nomeItem || !emojiItem) return alert("Dê um nome e um ícone (emoji) para o novo item!");

        document.getElementById('btn-craft-visual').disabled = true;

        iniciarAnimacaoMagica(() => {
            const receitaCombinada = `${slot1.nome} + ${slot2.nome}`;
            
            const novaMagiaRef = push(ref(db, 'grimoires/' + currentUser));
            set(novaMagiaRef, { 
                nome: nomeItem, 
                emoji: emojiItem, 
                cor: "mescla", 
                receita: receitaCombinada, 
                efeito: "Item forjado através de alquimia superior." 
            }).then(() => {
                if(typeof registrarLog === "function") {
                    registrarLog(`Forjou [${emojiItem} ${nomeItem}] combinando ${slot1.nome} e ${slot2.nome}`);
                }
                alert(`A alquimia foi concluída! ${emojiItem} ${nomeItem} adicionado ao grimório.`);
                
                // Consumir materiais do inventário
                if (slot1.id) remove(ref(db, `inventory/${currentUser}/${slot1.id}`));
                if (slot2.id) remove(ref(db, `inventory/${currentUser}/${slot2.id}`));

                slot1 = null; slot2 = null;
                atualizarSlotsDOM();
                document.getElementById('craft-result-name').value = "";
                document.getElementById('craft-emoji-input').value = "";
                document.getElementById('btn-craft-visual').disabled = false;
            });
        });
    });
}

// Adicionar um material bruto direto do inventário
if(document.getElementById('btn-add-material')) {
    document.getElementById('btn-add-material').addEventListener('click', () => {
        const nome = prompt("Nome do Material Base (ex: Flor de Fogo):");
        if (!nome) return;
        const emoji = prompt("Ícone do Material (cole um Emoji, ex: 🌺):");
        if (!emoji) return;

        // Note que o prompt pediu para jogar no Grimório, mas a lógica de inventário
        // carrega da rota "inventory/". Salvando na rota inventory para o material ficar na bolsa.
        const novoMaterialRef = push(ref(db, 'inventory/' + currentUser));
        set(novoMaterialRef, { 
            nome: nome, 
            emoji: emoji,
            criadoEm: Date.now()
        }).then(() => {
            if(typeof registrarLog === "function") registrarLog(`Coletou material: ${emoji} ${nome}`);
        });
    });
}

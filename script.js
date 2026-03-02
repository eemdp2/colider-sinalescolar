const displayRelogio = document.getElementById('relogio');
const displayProx = document.getElementById('proxSinal');
const btnIniciar = document.getElementById('btnIniciar');
const statusTexto = document.getElementById('status');

// Mapeamento simples: Horário -> ID do Áudio Específico
const mapaHorarios = {
    // --- MANHÃ ---
    "07:00": "somA1", // Início
    "07:45": "somA2", // Fim 1ª
    "08:30": "somA3", // Fim 2ª
    "09:15": "somA4", // Início Intervalo
    "09:36": "somA5", // Aviso (4 min antes de 09:40)
    "09:40": "somA6", // Fim Intervalo / Início 4ª
    "10:25": "somA7", // Início 5ª
    "11:10": "somA8", // Início 6ª
    "11:55": "somA9", // Fim 6ª (Saída Manhã)

    // --- TARDE ---
    "13:00": "somA1", // Início
    "13:45": "somA2", // Fim 1ª
    "14:30": "somA3", // Fim 2ª
    "15:15": "somA4", // Início Intervalo
    "15:36": "somA5", // Aviso (4 min antes de 15:40)
    "15:40": "somA6", // Fim Intervalo / Início 4ª
    "16:25": "somA7", // Início 5ª
    "17:55": "somA9"  // Fim 6ª (Apenas Seg/Ter)
};

const horariosEspeciais = ["17:10"]; 

let sistemaAtivo = false;
let wakeLock = null;

async function manterTelaLigada() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        statusTexto.innerText = "Sistema Ativo e Tela Bloqueada (Não feche)";
        statusTexto.style.color = "#4CAF50"; 
    } catch (err) {
        statusTexto.innerText = "Sistema Ativo (Mantenha o app aberto)";
    }
}

btnIniciar.addEventListener('click', () => {
    sistemaAtivo = true;
    
    // Libera o áudio do Intro e do A1 para o navegador "acordar" o som
    const intro = document.getElementById('somIntro');
    const unlock = document.getElementById('somA1');
    
    intro.play().catch(()=>{}); intro.pause();
    unlock.play().catch(()=>{}); unlock.pause();
    
    btnIniciar.style.display = 'none';
    manterTelaLigada();
    atualizarProximoSinal();
});

function atualizarRelogio() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    const horaAtual = `${horas}:${minutos}`;

    displayRelogio.innerText = `${horas}:${minutos}:${segundos}`;

    if (sistemaAtivo && segundos === "00") {
        verificarToque(horaAtual);
    }
    
    if (segundos === "00") {
        atualizarProximoSinal();
    }
}

function verificarToque(hora) {
    // Caso 1: Horário Especial (17:10)
    if (hora === "17:10") {
        const diaSemana = new Date().getDay(); 
        
        if (diaSemana >= 3 && diaSemana <= 5) {
            tocarSequencia('somFim'); // Intro + Saída
            console.log("Sexta aula cancelada. Tocando saída.");
        } else {
            tocarSequencia('somA8'); // Intro + 6ª aula
            console.log("Iniciando 6ª aula.");
        }
        return;
    }

    // Caso 2: Horários normais
    if (mapaHorarios[hora]) {
        tocarSequencia(mapaHorarios[hora]);
    }
}

// NOVA FUNÇÃO: Toca Intro -> Espera -> Toca Específico
function tocarSequencia(idElementoEspecifico) {
    const intro = document.getElementById('somIntro');
    const especifico = document.getElementById(idElementoEspecifico);

    if (intro && especifico) {
        console.log(`Iniciando sequência: Intro + ${idElementoEspecifico}`);
        
        // Garante que o volume está no máximo
        intro.volume = 1.0;
        especifico.volume = 1.0;

        // Quando o intro terminar, toca o próximo
        intro.onended = function() {
            especifico.currentTime = 0;
            especifico.play();
        };

        // Começa tocando o intro
        intro.currentTime = 0;
        intro.play();
    }
}

function atualizarProximoSinal() {
    const agora = new Date();
    const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();
    const listaHorarios = [...Object.keys(mapaHorarios), ...horariosEspeciais];
    listaHorarios.sort();

    const proximo = listaHorarios.find(h => {
        const [hh, mm] = h.split(':');
        return (parseInt(hh) * 60 + parseInt(mm)) > horaAtualMinutos;
    });

    displayProx.innerText = proximo || "Amanhã";
}

setInterval(atualizarRelogio, 1000);

const displayRelogio = document.getElementById('relogio');
const displayProx = document.getElementById('proxSinal');
const btnIniciar = document.getElementById('btnIniciar');
const statusTexto = document.getElementById('status');

// Horários fixos conforme solicitado (Último às 17:10)
const mapaHorarios = {
    "07:00": "somA1", "07:45": "somA2", "08:30": "somA3",
    "09:15": "somA4", "09:28": "somA5", "09:30": "somA6",
    "10:20": "somA7", "11:10": "somA8", "12:00": "somA9",
    "13:00": "somA1", "13:45": "somA2", "14:30": "somA3",
    "15:15": "somA4", "15:28": "somA5", "15:30": "somA6",
    "16:20": "somA7", "17:10": "somA9" 
};

let sistemaAtivo = false;
let wakeLock = null;

async function manterTelaLigada() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            statusTexto.innerText = "Sistema Ativo e Tela Bloqueada";
            statusTexto.style.color = "#4CAF50"; 
        }
    } catch (err) {
        statusTexto.innerText = "Sistema Ativo (Mantenha o app aberto)";
    }
}

btnIniciar.addEventListener('click', () => {
    sistemaAtivo = true;
    
    // Desbloqueia o áudio para o navegador
    const intro = document.getElementById('somIntro');
    intro.play().then(() => { intro.pause(); }).catch(()=>{});
    
    btnIniciar.style.display = 'none';
    manterTelaLigada();
    atualizarProximoSinal();
});

function atualizarRelogio() {
    const agora = new Date();
    const h = String(agora.getHours()).padStart(2, '0');
    const m = String(agora.getMinutes()).padStart(2, '0');
    const s = String(agora.getSeconds()).padStart(2, '0');
    const horaAtual = `${h}:${m}`;

    displayRelogio.innerText = `${h}:${m}:${s}`;

    if (sistemaAtivo && s === "00") {
        if (mapaHorarios[horaAtual]) {
            tocarSequencia(mapaHorarios[horaAtual]);
        }
    }
    
    if (s === "00") {
        atualizarProximoSinal();
    }
}

function tocarSequencia(idSom) {
    const intro = document.getElementById('somIntro');
    const somFinal = document.getElementById(idSom);

    if (intro && somFinal) {
        intro.volume = 1.0;
        somFinal.volume = 1.0;
        intro.currentTime = 0;
        intro.play();

        intro.onended = () => {
            somFinal.currentTime = 0;
            somFinal.play();
        };
    }
}

function atualizarProximoSinal() {
    const agora = new Date();
    const atualMin = agora.getHours() * 60 + agora.getMinutes();
    const lista = Object.keys(mapaHorarios).sort();
    
    const proximo = lista.find(h => {
        const [hh, mm] = h.split(':');
        return (parseInt(hh) * 60 + parseInt(mm)) > atualMin;
    });

    displayProx.innerText = proximo || "Amanhã";
}

setInterval(atualizarRelogio, 1000);
atualizarProximoSinal();

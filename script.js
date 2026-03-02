const displayRelogio = document.getElementById('relogio');
const displayProx = document.getElementById('proxSinal');
const btnIniciar = document.getElementById('btnIniciar');
const statusTexto = document.getElementById('status');

// 1. CARREGAMENTO DOS DADOS (Padrão ou Salvo)
const horariosPadrao = {
    "07:00": "somA1", "07:45": "somA2", "08:30": "somA3",
    "09:15": "somA4", "09:36": "somA5", "09:40": "somA6",
    "10:25": "somA7", "11:10": "somA8", "11:55": "somA9",
    "13:00": "somA1", "13:45": "somA2", "14:30": "somA3",
    "15:15": "somA4", "15:36": "somA5", "15:40": "somA6",
    "16:25": "somA7", "17:55": "somA9"
};

let mapaHorarios = JSON.parse(localStorage.getItem('configHorarios')) || horariosPadrao;

let sistemaAtivo = false;
let wakeLock = null;

// --- LÓGICA DO RELÓGIO E TOQUE ---

async function manterTelaLigada() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        statusTexto.innerText = "Sistema Ativo e Tela Bloqueada";
        statusTexto.style.color = "#4CAF50"; 
    } catch (err) {
        statusTexto.innerText = "Sistema Ativo (Mantenha o app aberto)";
    }
}

btnIniciar.addEventListener('click', () => {
    sistemaAtivo = true;
    // Acorda o áudio no mobile
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
    
    if (s === "00") { atualizarProximoSinal(); }
}

function tocarSequencia(idElementoEspecifico) {
    const intro = document.getElementById('somIntro');
    const especifico = document.getElementById(idElementoEspecifico);

    if (intro && especifico) {
        intro.volume = 1.0;
        especifico.volume = 1.0;
        intro.onended = function() {
            especifico.currentTime = 0;
            especifico.play();
        };
        intro.currentTime = 0;
        intro.play();
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

// --- LÓGICA DO EDITOR (INTERFACE) ---

const editor = document.getElementById('editorHorarios');
const listaUI = document.getElementById('listaHorariosUI');

document.getElementById('btnAbrirEditor').onclick = () => {
    editor.style.display = 'block';
    renderizarListaEditor();
};

function fecharEditor() { editor.style.display = 'none'; }

function renderizarListaEditor() {
    listaUI.innerHTML = '';
    Object.keys(mapaHorarios).sort().forEach(hora => {
        const div = document.createElement('div');
        div.className = 'item-horario';
        div.innerHTML = `
            <span><strong>${hora}</strong> - ${mapaHorarios[hora]}</span>
            <button class="btn-excluir" onclick="removerHorario('${hora}')">Remover</button>
        `;
        listaUI.appendChild(div);
    });
}

function adicionarNovoHorario() {
    const h = document.getElementById('novoHora').value;
    const s = document.getElementById('novoSom').value;
    if (h) {
        mapaHorarios[h] = s;
        salvarDados();
    }
}

function removerHorario(h) {
    delete mapaHorarios[h];
    salvarDados();
}

function salvarDados() {
    localStorage.setItem('configHorarios', JSON.stringify(mapaHorarios));
    renderizarListaEditor();
    atualizarProximoSinal();
}

setInterval(atualizarRelogio, 1000);

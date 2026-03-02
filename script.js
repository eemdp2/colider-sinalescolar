const displayRelogio = document.getElementById('relogio');
const displayProx = document.getElementById('proxSinal');
const btnIniciar = document.getElementById('btnIniciar');
const statusTexto = document.getElementById('status');

// 1. CONFIGURAÇÃO INICIAL (Horários originais)
const horariosPadrao = {
    "07:00": "somA1", "07:45": "somA2", "08:30": "somA3",
    "09:15": "somA4", "09:36": "somA5", "09:40": "somA6",
    "10:25": "somA7", "11:10": "somA8", "11:55": "somA9",
    "13:00": "somA1", "13:45": "somA2", "14:30": "somA3",
    "15:15": "somA4", "15:36": "somA5", "15:40": "somA6",
    "16:25": "somA7", "17:55": "somA9"
};

// Carrega os horários salvos ou usa o padrão se for a primeira vez
let mapaHorarios = JSON.parse(localStorage.getItem('configHorarios')) || {...horariosPadrao};

let sistemaAtivo = false;
let wakeLock = null;

// --- FUNÇÕES DE CONTROLE DO SISTEMA ---

async function manterTelaLigada() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
        statusTexto.innerText = "Sistema Ativo e Tela Bloqueada";
        statusTexto.style.color = "#4CAF50"; 
    } catch (err) {
        statusTexto.innerText = "Sistema Ativo (Mantenha o app aberto)";
    }
}

btnIniciar.addEventListener('click', () => {
    sistemaAtivo = true;
    
    // Desbloqueia o áudio para navegadores mobile
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

    // Verifica toque no segundo 00
    if (sistemaAtivo && s === "00") {
        if (mapaHorarios[horaAtual]) {
            tocarSequencia(mapaHorarios[horaAtual]);
        }
    }
    
    // Atualiza o display de "próximo" a cada minuto
    if (s === "00") { atualizarProximoSinal(); }
}

function tocarSequencia(idSom) {
    const intro = document.getElementById('somIntro');
    const somFinal = document.getElementById(idSom);

    if (intro && somFinal) {
        console.log("Tocando sinal: " + idSom);
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

// --- FUNÇÕES DO EDITOR ---

const editor = document.getElementById('editorHorarios');
const listaUI = document.getElementById('listaHorariosUI');

document.getElementById('btnAbrirEditor').onclick = () => {
    editor.style.display = 'block';
    renderizarListaEditor();
};

function fecharEditor() { editor.style.display = 'none'; }

function renderizarListaEditor() {
    listaUI.innerHTML = '';
    const ordenados = Object.keys(mapaHorarios).sort();
    
    ordenados.forEach(hora => {
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
        mapaHorarios[h] = s; // Adiciona ou Substitui (Alterar)
        salvarDados();
        document.getElementById('novoHora').value = "";
    } else {
        alert("Escolha um horário primeiro!");
    }
}

function removerHorario(h) {
    if(confirm("Remover o sinal de " + h + "?")) {
        delete mapaHorarios[h];
        salvarDados();
    }
}

function resetarPadroes() {
    if (confirm("Isso apagará todas as suas alterações e voltará aos horários originais. Confirmar?")) {
        mapaHorarios = {...horariosPadrao};
        salvarDados();
    }
}

function salvarDados() {
    localStorage.setItem('configHorarios', JSON.stringify(mapaHorarios));
    renderizarListaEditor();
    atualizarProximoSinal();
}

// Inicia o relógio
setInterval(atualizarRelogio, 1000);
atualizarProximoSinal();

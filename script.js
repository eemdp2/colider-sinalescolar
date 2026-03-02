const displayRelogio = document.getElementById('relogio');
const displayProx = document.getElementById('proxSinal');
const btnIniciar = document.getElementById('btnIniciar');
const statusTexto = document.getElementById('status');
const listaUI = document.getElementById('listaHorariosUI');

// Definição da Grade para a Sidebar e Lógica da Tarja
// Baseado nos horários exatos que você enviou
const gradeEscolar = [
    // MANHÃ
    { inicio: "07:00", fim: "07:45", desc: "1ª Aula", som: "somA1" },
    { inicio: "07:45", fim: "08:30", desc: "2ª Aula", som: "somA2" },
    { inicio: "08:30", fim: "09:15", desc: "3ª Aula", som: "somA3" },
    { inicio: "09:15", fim: "09:28", desc: "INTERVALO", som: "somA4", extra: true },
    { inicio: "09:28", fim: "09:30", desc: "AVISO", som: "somA5", extra: true },
    { inicio: "09:30", fim: "10:25", desc: "4ª Aula", som: "somA6" },
    { inicio: "10:25", fim: "11:10", desc: "5ª Aula", som: "somA7" },
    { inicio: "11:10", fim: "12:00", desc: "6ª Aula", som: "somA8" },
    { inicio: "12:00", fim: "13:00", desc: "ALMOÇO", som: "somA9" },
    // TARDE
    { inicio: "13:00", fim: "13:45", desc: "1ª Aula", som: "somA1" },
    { inicio: "13:45", fim: "14:30", desc: "2ª Aula", som: "somA2" },
    { inicio: "14:30", fim: "15:15", desc: "3ª Aula", som: "somA3" },
    { inicio: "15:15", fim: "15:28", desc: "INTERVALO", som: "somA4", extra: true },
    { inicio: "15:28", fim: "15:30", desc: "AVISO", som: "somA5", extra: true },
    { inicio: "15:30", fim: "16:20", desc: "5ª Aula", som: "somA6" },
    { inicio: "16:20", fim: "17:10", desc: "6ª Aula", som: "somA7" },
    { inicio: "17:10", fim: "23:59", desc: "SAÍDA", som: "somFim" }
];

let sistemaAtivo = false;

// Cria a lista visual na barra lateral
function renderizarSidebar() {
    listaUI.innerHTML = '';
    gradeEscolar.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'horario-item';
        li.id = `item-${index}`;
        
        const tag = item.extra ? `<span class="tag-intervalo">${item.desc}</span>` : `<span>${item.desc}</span>`;
        
        li.innerHTML = `
            <div>${tag}</div>
            <div style="font-family: monospace;">${item.inicio}</div>
        `;
        listaUI.appendChild(li);
    });
}

function atualizarSistema() {
    const agora = new Date();
    const h = agora.getHours();
    const m = agora.getMinutes();
    const s = agora.getSeconds();
    
    const horaAtualStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const segundosStr = String(s).padStart(2, '0');
    const tempoTotalMinutos = h * 60 + m;

    displayRelogio.innerText = `${horaAtualStr}:${segundosStr}`;

    // Lógica da Tarja de Destaque e Acionamento do Som
    gradeEscolar.forEach((item, index) => {
        const [hIn, mIn] = item.inicio.split(':').map(Number);
        const [hFi, mFi] = item.fim.split(':').map(Number);
        const minIn = hIn * 60 + mIn;
        const minFi = hFi * 60 + mFi;

        const elementoUI = document.getElementById(`item-${index}`);

        // Define quem recebe a tarja verde
        if (tempoTotalMinutos >= minIn && tempoTotalMinutos < minFi) {
            elementoUI.classList.add('ativo');
        } else {
            elementoUI.classList.remove('ativo');
        }

        // Toca o som no segundo 00
        if (sistemaAtivo && s === 0 && horaAtualStr === item.inicio) {
            tocarSequencia(item.som);
        }
    });

    if (s === 0) atualizarProximoSinal(tempoTotalMinutos);
}

function tocarSequencia(idSom) {
    const intro = document.getElementById('somIntro');
    const somFinal = document.getElementById(idSom);

    if (intro && somFinal) {
        intro.currentTime = 0;
        intro.play();
        intro.onended = () => {
            somFinal.currentTime = 0;
            somFinal.play();
        };
    }
}

function atualizarProximoSinal(minutosAtuais) {
    const proximo = gradeEscolar.find(item => {
        const [h, m] = item.inicio.split(':').map(Number);
        return (h * 60 + m) > minutosAtuais;
    });

    displayProx.innerText = proximo ? proximo.inicio : "Amanhã";
}

btnIniciar.onclick = () => {
    sistemaAtivo = true;
    btnIniciar.style.display = 'none';
    statusTexto.innerText = "SISTEMA ONLINE";
    statusTexto.style.color = "#4CAF50";
    
    // Desbloqueia áudio para navegadores (mobile/chrome)
    const unlock = document.getElementById('somIntro');
    unlock.play().then(() => unlock.pause()).catch(e => console.log(e));
};

// Inicialização
renderizarSidebar();
setInterval(atualizarSistema, 1000);
atualizarSistema();

const displayRelogio = document.getElementById('relogio');
const displayProx = document.getElementById('proxSinal');
const btnIniciar = document.getElementById('btnIniciar');
const statusTexto = document.getElementById('status');
const listaUI = document.getElementById('listaHorariosUI');

// 1. CONFIGURAÇÃO DA GRADE (Exatamente como solicitado)
const gradeEscolar = [
    { inicio: "07:00", fim: "07:45", desc: "1ª Aula", som: "somA1" },
    { inicio: "07:45", fim: "08:30", desc: "2ª Aula", som: "somA2" },
    { inicio: "08:30", fim: "09:15", desc: "3ª Aula", som: "somA3" },
    { inicio: "09:15", fim: "09:28", desc: "INTERVALO", som: "somA4" },
    { inicio: "09:28", fim: "09:30", desc: "AVISO", som: "somA5" },
    { inicio: "09:30", fim: "10:25", desc: "4ª Aula", som: "somA6" },
    { inicio: "10:25", fim: "11:10", desc: "5ª Aula", som: "somA7" },
    { inicio: "11:10", fim: "12:00", desc: "6ª Aula", som: "somA8" },
    { inicio: "12:00", fim: "13:00", desc: "ALMOÇO", som: "somA9" },
    { inicio: "13:00", fim: "13:45", desc: "1ª Aula", som: "somA1" },
    { inicio: "13:45", fim: "14:30", desc: "2ª Aula", som: "somA2" },
    { inicio: "14:30", fim: "15:15", desc: "3ª Aula", som: "somA3" },
    { inicio: "15:15", fim: "15:28", desc: "INTERVALO", som: "somA4" },
    { inicio: "15:28", fim: "15:30", desc: "AVISO", som: "somA5" },
    { inicio: "15:30", fim: "16:20", desc: "5ª Aula", som: "somA6" },
    { inicio: "16:20", fim: "17:10", desc: "6ª Aula", som: "somA7" },
    { inicio: "17:10", fim: "23:59", desc: "SAÍDA", som: "somFim" }
];

let sistemaAtivo = false;

// 2. GERAÇÃO DA INTERFACE LATERAL
function renderizarSidebar() {
    listaUI.innerHTML = '';
    gradeEscolar.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'horario-item';
        li.id = `item-${index}`;
        
        li.innerHTML = `
            <div style="display:flex; align-items:center">
                <span class="tag-tipo">${item.desc}</span>
                <strong class="time-tag">${item.inicio}</strong>
            </div>
            <button class="btn-teste" onclick="testarSom('${item.som}')" title="Testar Sequência Completa">
                ▶
            </button>
        `;
        listaUI.appendChild(li);
    });
}

// 3. FUNÇÃO DE TESTE (Toca Intro + Áudio da Aula)
function testarSom(idSom) {
    const intro = document.getElementById('somIntro');
    const final = document.getElementById(idSom);

    if (intro && final) {
        // Reinicia os áudios caso já estejam tocando
        intro.pause();
        final.pause();
        intro.currentTime = 0;
        final.currentTime = 0;

        statusTexto.innerText = "TESTANDO SOM...";
        
        intro.play().then(() => {
            intro.onended = () => {
                final.currentTime = 0;
                final.play();
                final.onended = () => { statusTexto.innerText = "SISTEMA ONLINE"; };
            };
        }).catch(e => {
            alert("Erro: Clique em 'Ativar Sistema' primeiro para permitir o áudio no navegador.");
        });
    }
}

// 4. LÓGICA DO RELÓGIO E DISPARO AUTOMÁTICO
function atualizarSistema() {
    const agora = new Date();
    const h = agora.getHours();
    const m = agora.getMinutes();
    const s = agora.getSeconds();
    
    const horaAtualStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const tempoTotalMinutos = h * 60 + m;

    // Atualiza o relógio principal
    displayRelogio.innerText = `${horaAtualStr}:${String(s).padStart(2, '0')}`;

    gradeEscolar.forEach((item, index) => {
        const [hIn, mIn] = item.inicio.split(':').map(Number);
        const [hFi, mFi] = item.fim.split(':').map(Number);
        const minIn = hIn * 60 + mIn;
        const minFi = hFi * 60 + mFi;

        const elementoUI = document.getElementById(`item-${index}`);

        // ATUALIZA A TARJA DE DESTAQUE
        if (tempoTotalMinutos >= minIn && tempoTotalMinutos < minFi) {
            elementoUI.classList.add('ativo');
        } else {
            elementoUI.classList.remove('ativo');
        }

        // GATILHO AUTOMÁTICO (Somente se sistema estiver ativo e no segundo 00)
        if (sistemaAtivo && s === 0 && horaAtualStr === item.inicio) {
            tocarSequencia(item.som);
        }
    });

    // Atualiza o próximo sinal apenas na virada do minuto
    if (s === 0) atualizarProximoSinal(tempoTotalMinutos);
}

// 5. SEQUÊNCIA AUTOMÁTICA (Intro -> Som)
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

// 6. CÁLCULO DO PRÓXIMO SINAL
function atualizarProximoSinal(minutosAtuais) {
    const proximo = gradeEscolar.find(item => {
        const [h, m] = item.inicio.split(':').map(Number);
        return (h * 60 + m) > minutosAtuais;
    });

    displayProx.innerText = proximo ? proximo.inicio : "Amanhã";
}

// 7. BOTÃO DE INICIALIZAÇÃO (Desbloqueia o áudio)
btnIniciar.onclick = () => {
    sistemaAtivo = true;
    btnIniciar.style.display = 'none';
    statusTexto.innerText = "SISTEMA ONLINE";
    statusTexto.style.color = "#22c55e";
    
    // Tira o "mudo" do navegador tocando um silêncio rápido
    const unlock = document.getElementById('somIntro');
    unlock.play().then(() => {
        unlock.pause();
        unlock.currentTime = 0;
    }).catch(e => console.log("Erro ao desbloquear áudio:", e));
    
    atualizarProximoSinal(new Date().getHours() * 60 + new Date().getMinutes());
};

// INICIALIZAÇÃO GLOBAL
renderizarSidebar();
setInterval(atualizarSistema, 1000);
atualizarSistema();

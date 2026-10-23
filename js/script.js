/* =========================================================
   IFPIFLIX - Script principal
   ========================================================= */

/* Endereço onde ficam as imagens e vídeos do projeto (GitHub Pages) */
const ASSET_BASE = 'https://buguinha0202.github.io/Ifpiflix-projetor/';

/* Imagens passam pelo wsrv.nl, que redimensiona e converte para webp (carrega bem mais rápido) */
function imgUrl(file, width) {
    if (!file) return '';
    if (file.startsWith('data:') || file.startsWith('http://') || file.startsWith('https://') || file.startsWith('trabalhos/') || file.startsWith('midia/') || file.startsWith('/midia/') || file.includes('midia/') || file.startsWith('./')) {
        return file;
    }
    if (typeof window !== 'undefined' && window.location && (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return file;
    }
    return 'https://wsrv.nl/?url=' + ASSET_BASE + file + '&w=' + width + '&output=webp';
}
function mediaUrl(file) {
    if (!file) return '';
    if (file.startsWith('http://') || file.startsWith('https://') || file.startsWith('trabalhos/') || file.startsWith('midia/') || file.startsWith('/midia/') || file.includes('midia/') || file.startsWith('./')) {
        return file;
    }
    return ASSET_BASE + file;
}

/* Dispositivos de toque (celular/tablet) não têm "hover" */
const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* =========================================================
   ROTEIRO: ordem dos slides e apresentadores
   ========================================================= */
const script = [
    { id: 0,     title: "1. A Escolástica",                          presenter: "Davi Costa",         tickers: ["Dogmas religiosos e textos clássicos possuíam um peso inquestionável."] },
    { id: "0_1", title: "2. A Transição",                            presenter: "Davi Costa",         tickers: ["A física aristotélica era insuficiente para as novas necessidades."] },
    { id: "0_2", title: "3. A Ruptura",                              presenter: "Davi Costa",         tickers: ["A crise escolástica abriu caminho para o questionamento direto."] },
    { id: 1,     title: "4. O Terreno Fértil",                       presenter: "Davi Costa",         tickers: ["Dúvida, observação e busca por métodos autônomos."] },

    { id: "2",   title: "Cap 2: Antes da Rev. Científica",           presenter: "Maria Helena",       tickers: ["A tradição ditava as regras."] },
    { id: "2_1", title: "Cap 2: Geocentrismo",                       presenter: "Maria Helena",       tickers: ["A Terra no centro de tudo."] },
    { id: "3",   title: "Cap 2: Princípio de Autoridade",            presenter: "Maria Helena",       tickers: ["Aristóteles falou, tá falado."] },
    { id: "3_1", title: "Cap 2: A Mudança",                          presenter: "Maria Helena",       tickers: ["Observar e testar virou a nova moda."] },

    { id: 4,     title: "Cap 3: A Ruptura",                          presenter: "Francisco Lucas",    tickers: ["O homem moderno: 'E se a gente testasse essa parada?'", "A contemplação passiva saiu do chat.", "Investigação ativa entrou no chat."] },

    { id: 5,     title: "Cap 4: Revolução Cosmológica (Copérnico)",  presenter: "Pedro Victor",       tickers: ["Copérnico: 'Galera, o Sol tá no meio, não a gente'.", "Tirar a Terra do centro ofendeu muito o ego humano."] },
    { id: "6_1", title: "Cap 4: Revolução Cosmológica (Kepler)",     presenter: "Pedro Victor",       tickers: ["Kepler: “Círculo perfeito? Não exatamente.”"] },
    { id: 6,     title: "Cap 4: Revolução Cosmológica (Galileu)",    presenter: "Pedro Victor",       tickers: ["Galileu: 'Mano, olha no telescópio'. Inquisição: 'Não quero'.", "Eppur si muove: o primeiro 'falei, tô leve' da história."] },

    { id: 8,     title: "Cap 5: Empirismo (Os Ídolos)",              presenter: "Marcelo",            tickers: ["Ídolo da Caverna = viver na própria bolha.", "Bacon: Antes de fazer ciência, limpe sua mente dos fakes."] },
    { id: 9,     title: "Cap 5: Empirismo (Método Indutivo)",        presenter: "Marcelo",            tickers: ["Bacon morreu de pneumonia tentando congelar uma galinha.", "Se não testou na prática, meu anjo, é só fanfic."] },
    { id: 10,    title: "Cap 6: Racionalismo (Dúvida Metódica)",     presenter: "Samuel Soares",      tickers: ["Descartes ficou dias trancado num quarto.", "E se tudo for uma simulação?"] },
    { id: 11,    title: "Cap 6: Racionalismo (Penso, logo existo)",  presenter: "Samuel Soares",      tickers: ["Duvidou tanto de tudo que quase sumiu da existência.", "A única certeza: eu existo porque penso."] },
    { id: 12,    title: "Cap 7: Síntese Newtoniana",                 presenter: "João Pedro Santos",  tickers: ["Uma maçã caiu, e o cara inventou o cálculo.", "Newton uniu o Racionalismo e o Empirismo na amizade."] },
    { id: 13,    title: "Fim: Assine Já",                            presenter: "Todos",              tickers: [] }
];

let activeProfile = "Admin";
let currentSlide = -1;
let currentCineIdx = -1;
let tickerIntervalC, tickerIntervalM;
let toastTimeout;
let isLisActive = false;
let globalSfxEnabled = true;
try {
    globalSfxEnabled = (localStorage.getItem('ifpiflix_sfx_enabled') !== 'false');
} catch (e) {
    globalSfxEnabled = true;
}
let sharedAudioCtx = null;

/* =========================================================
   1. MAPEAMENTO E ESTADO ÚNICO CENTRALIZADO (STORE)
   ========================================================= */
const _stateListeners = new Set();

window.IFPIFLIX_STATE = {
    get activeScreen() {
        const activeEl = document.querySelector('.screen.active');
        return activeEl ? activeEl.id : 'home-screen';
    },
    get activeProfile() { return activeProfile; },
    set activeProfile(val) { activeProfile = val; this._notify(); },

    get currentSlide() { return currentSlide; },
    set currentSlide(val) { currentSlide = val; this._notify(); },

    get currentCineIdx() { return currentCineIdx; },
    set currentCineIdx(val) { currentCineIdx = val; this._notify(); },

    get currentModalMovieId() { return (typeof currentModalMovieId !== 'undefined') ? currentModalMovieId : ''; },
    set currentModalMovieId(val) { if (typeof currentModalMovieId !== 'undefined') currentModalMovieId = val; this._notify(); },

    get sfxEnabled() { return globalSfxEnabled; },
    set sfxEnabled(val) { globalSfxEnabled = !!val; this._notify(); },

    get minhaLista() { return (typeof minhaLista !== 'undefined') ? minhaLista : []; },
    
    get currentAcervoMateria() { return (typeof currentAcervoMateria !== 'undefined') ? currentAcervoMateria : 'all'; },
    set currentAcervoMateria(val) { if (typeof currentAcervoMateria !== 'undefined') currentAcervoMateria = val; this._notify(); },

    get currentAcervoFormat() { return (typeof currentAcervoFormat !== 'undefined') ? currentAcervoFormat : 'all'; },
    set currentAcervoFormat(val) { if (typeof currentAcervoFormat !== 'undefined') currentAcervoFormat = val; this._notify(); },

    get currentAcervoAuthor() { return (typeof currentAcervoAuthor !== 'undefined') ? currentAcervoAuthor : null; },
    set currentAcervoAuthor(val) { if (typeof currentAcervoAuthor !== 'undefined') currentAcervoAuthor = val; this._notify(); },

    get currentAcervoViewMode() { return (typeof currentAcervoViewMode !== 'undefined') ? currentAcervoViewMode : 'collections'; },
    set currentAcervoViewMode(val) { if (typeof currentAcervoViewMode !== 'undefined') currentAcervoViewMode = val; this._notify(); },

    get unlockedAchievements() { return (typeof unlockedAchievements !== 'undefined') ? unlockedAchievements : []; },

    get currentActiveCardStudent() { return (typeof currentActiveCardStudent !== 'undefined') ? currentActiveCardStudent : null; },

    get quizIndex() { return (typeof currentQuizIndex !== 'undefined') ? currentQuizIndex : 0; },
    get quizScore() { return (typeof quizScore !== 'undefined') ? quizScore : 0; },

    get secCurrentSlide() { return (typeof secCurrentSlide !== 'undefined') ? secCurrentSlide : 0; },
    get secCurrentStep() { return (typeof secCurrentStep !== 'undefined') ? secCurrentStep : 1; },

    subscribe(fn) {
        if (typeof fn === 'function') {
            _stateListeners.add(fn);
            return () => _stateListeners.delete(fn);
        }
        return () => {};
    },

    _notify() {
        const snapshot = this.getSnapshot();
        _stateListeners.forEach(fn => {
            try { fn(snapshot); } catch (e) {}
        });
    },

    getSnapshot() {
        return {
            activeScreen: this.activeScreen,
            activeProfile: this.activeProfile,
            currentSlide: this.currentSlide,
            currentCineIdx: this.currentCineIdx,
            currentModalMovieId: this.currentModalMovieId,
            sfxEnabled: this.sfxEnabled,
            minhaListaCount: (this.minhaLista || []).length,
            currentAcervoMateria: this.currentAcervoMateria,
            currentAcervoAuthor: this.currentAcervoAuthor,
            unlockedAchievementsCount: (this.unlockedAchievements || []).length,
            quizIndex: this.quizIndex,
            quizScore: this.quizScore
        };
    }
};

/* =========================================================
   2. MOTOR DE SOM PROCEDURAL PURO (WEB AUDIO API)
   ========================================================= */
function getSharedAudioContext() {
    try {
        if (!sharedAudioCtx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) sharedAudioCtx = new AudioCtx();
        }
        if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
            sharedAudioCtx.resume().catch(() => {});
        }
        return sharedAudioCtx;
    } catch (err) {
        return null;
    }
}

window.SoundEngine = {
    play(type, options = {}) {
        if (!globalSfxEnabled) return;
        try {
            const ctx = getSharedAudioContext();
            if (!ctx) return;
            const now = ctx.currentTime;

            switch (type) {
                // Clique limpo de botão
                case 'click': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);
                    gain.gain.setValueAtTime(0.04, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.06);
                    break;
                }

                // Micro-tick delicado ao passar o cursor
                case 'hover':
                case 'card-hover': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(540, now);
                    osc.frequency.exponentialRampToValueAtTime(720, now + 0.05);
                    gain.gain.setValueAtTime(0.02, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.07);
                    break;
                }

                // Abertura de Modal (Swoosh ascendente harmônico com filtro)
                case 'openModal':
                case 'open': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const filter = ctx.createBiquadFilter();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(280, now);
                    osc.frequency.exponentialRampToValueAtTime(640, now + 0.14);
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(400, now);
                    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.14);
                    gain.gain.setValueAtTime(0.001, now);
                    gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                }

                // Fechamento de Modal (Swoosh descendente suave)
                case 'closeModal':
                case 'close': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
                }

                // Notificação / Alerta suave (Chime duplo F5 -> A5)
                case 'alert':
                case 'toast': {
                    [698.46, 880.00].forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const startTime = now + idx * 0.09;
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, startTime);
                        gain.gain.setValueAtTime(0.04, startTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(startTime);
                        osc.stop(startTime + 0.25);
                    });
                    break;
                }

                // Sucesso / Confirmação (Acorde Maior arpejado C5 - E5 - G5)
                case 'success': {
                    [523.25, 659.25, 783.99].forEach((f, i) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const startTime = now + i * 0.07;
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(f, startTime);
                        gain.gain.setValueAtTime(0.05, startTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(startTime);
                        osc.stop(startTime + 0.4);
                    });
                    break;
                }

                // Erro sutil (Tom fosco descendente)
                case 'error':
                case 'quiz-wrong': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(240, now);
                    osc.frequency.linearRampToValueAtTime(130, now + 0.28);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.35);
                    break;
                }

                // Acerto no Quiz
                case 'quiz-correct': {
                    [880, 1318.5].forEach((f, i) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const startTime = now + i * 0.09;
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(f, startTime);
                        gain.gain.setValueAtTime(0.06, startTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(startTime);
                        osc.stop(startTime + 0.28);
                    });
                    break;
                }

                // O Icônico TUDUM da Netflix sintetizado proceduralmente
                case 'tudum': {
                    const oscBass1 = ctx.createOscillator();
                    const oscBass2 = ctx.createOscillator();
                    const bassGain = ctx.createGain();
                    
                    oscBass1.type = 'triangle';
                    oscBass1.frequency.setValueAtTime(82.4, now);
                    oscBass1.frequency.exponentialRampToValueAtTime(32.7, now + 1.2);

                    oscBass2.type = 'sine';
                    oscBass2.frequency.setValueAtTime(65.4, now);
                    oscBass2.frequency.exponentialRampToValueAtTime(28.0, now + 1.5);

                    bassGain.gain.setValueAtTime(0.001, now);
                    bassGain.gain.exponentialRampToValueAtTime(0.7, now + 0.08);
                    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

                    oscBass1.connect(bassGain);
                    oscBass2.connect(bassGain);
                    bassGain.connect(ctx.destination);

                    oscBass1.start(now);
                    oscBass2.start(now);
                    oscBass1.stop(now + 2.5);
                    oscBass2.stop(now + 2.5);

                    const notes = [130.81, 196.00, 261.63, 392.00, 523.25];
                    notes.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const filter = ctx.createBiquadFilter();

                        osc.type = (idx % 2 === 0) ? 'sawtooth' : 'triangle';
                        osc.frequency.setValueAtTime(freq, now + 0.28);
                        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, now + 2.0);

                        filter.type = 'lowpass';
                        filter.frequency.setValueAtTime(400, now + 0.28);
                        filter.frequency.exponentialRampToValueAtTime(2600, now + 0.9);
                        filter.frequency.exponentialRampToValueAtTime(600, now + 2.8);

                        gain.gain.setValueAtTime(0.001, now + 0.28);
                        gain.gain.linearRampToValueAtTime(0.12 / notes.length, now + 0.5);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

                        osc.connect(filter);
                        filter.connect(gain);
                        gain.connect(ctx.destination);

                        osc.start(now + 0.28);
                        osc.stop(now + 3.0);
                    });
                    break;
                }

                // Conquista Rockstar Xbox/PS5
                case 'achievement': {
                    const arpeggio = [523.25, 659.25, 783.99, 1046.50];
                    arpeggio.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const startTime = now + idx * 0.08;
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(freq, startTime);
                        gain.gain.setValueAtTime(0.001, startTime);
                        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
                        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(startTime);
                        osc.stop(startTime + 1.0);
                    });
                    break;
                }

                // Moedas / Likes / Cupom
                case 'coins':
                case 'discount':
                case 'heartBurst': {
                    [987.77, 1318.51, 1567.98, 2093.00].forEach((f, i) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const startTime = now + i * 0.07;
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(f, startTime);
                        gain.gain.setValueAtTime(0.07, startTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(startTime);
                        osc.stop(startTime + 0.45);
                    });
                    break;
                }

                // Golpe em Duelo
                case 'duel-hit': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;
                }

                // Quique da Maçã de Newton
                case 'apple-bounce': {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(160, now + 0.08);
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.12);
                    break;
                }

                default: {
                    if (options.freq) {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = options.type || 'sine';
                        osc.frequency.setValueAtTime(options.freq, now);
                        gain.gain.setValueAtTime(options.volume || 0.05, now);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + (options.duration || 0.1));
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(now);
                        osc.stop(now + (options.duration || 0.12));
                    }
                }
            }
        } catch (e) {
            // Áudio indisponível ou bloqueado
        }
    }
};

window.playIfpiflixSfx = function(type, options) {
    if (window.SoundEngine) {
        window.SoundEngine.play(type, options);
    }
};

window.toggleIfpiflixSfx = function() {
    globalSfxEnabled = !globalSfxEnabled;
    localStorage.setItem('ifpiflix_sfx_enabled', globalSfxEnabled ? 'true' : 'false');
    const btns = [document.getElementById('nav-sfx-btn'), document.getElementById('nav-acervo-sfx-btn')];
    btns.forEach(b => {
        if (!b) return;
        if (globalSfxEnabled) {
            b.classList.remove('muted');
            b.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            b.title = 'Efeitos Sonoros Cinemáticos: ATIVOS (Clique para desativar)';
        } else {
            b.classList.add('muted');
            b.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            b.title = 'Efeitos Sonoros Cinemáticos: MUTADOS (Clique para ativar)';
        }
    });
    if (globalSfxEnabled) {
        window.playIfpiflixSfx('click');
        if (typeof window.showToastNotification === 'function') {
            window.showToastNotification('Efeitos Sonoros Cinemáticos Ativados!');
        }
    } else {
        if (typeof window.showToastNotification === 'function') {
            window.showToastNotification('Efeitos Sonoros Mutados.');
        }
    }
    if (window.IFPIFLIX_STATE) window.IFPIFLIX_STATE._notify();
};

/* =========================================================
           BANCO DE DADOS COMPLETO DA MODAL
           ========================================================= */
        const filmesDB = {
           // ================= TEMAS DE FILOSOFIA =================
            "tema-1": {
                title: "INVOCAÇÃO DO DOGMA", subtitle: "O Julgamento da Escolástica",
                bg: "invocacao_do_dogma.jpg", 
                banner: "binvocacao_do_dogm.jpg",
                pdf: "https://buguinha0202.github.io/Ifpiflix-projetor/trabalho_grupo1.pdf",
                ytTrailer: "n0sq-r0mBXQ", // Invocação do Mal (Dublado)
                match: "92% Relevante", year: "2013", age: "14", duration: "1h 52m",
                synopsis: "Investigadores do pensamento tentam exorcizar dogmas medievais de uma universidade assombrada por monges aristotélicos. Baseado em fatos reais da Escolástica.",
                cast: "Vera Formata, Patrick Windows", genres: "Terror Acadêmico, História", tags: "Idade Média, Fé vs Razão", isMain: false
            },
            "guerra-civil": {
                title: "GUERRA CIVIL", subtitle: "EMPIRISMO VS RACIONALISMO",
                bg: "guerra_civil.png", 
                banner: "banner.png",
                match: "99% Relevante", year: "2016", age: "12", duration: "2h 27m",
                synopsis: "A Revolução Científica Moderna, a queda dos dogmas e a forja do Método Científico por Newton. Acompanhe a maior batalha intelectual da história entre defensores da experiência prática e adeptos da lógica pura.",
                cast: "Davi Costa, Maria Helena, Francisco Lucas, Pedro Victor, Marcelo, Samuel Soares, João Pedro Santos", genres: "Ação, Documentário, Filosofia", tags: "Heliocentrismo, Bacon, Descartes", isMain: true
            },
            "tema-3": {
                title: "DEVORADORES DO ESPAÇO TEMPO", subtitle: "",
                bg: "devoradores_espaco_tempo.jpg", 
                banner: "bdevoradores_espaco_tempo.png",
                ytTrailer: "Sciagme2wKQ", // Devoradores de Estrelas
                match: "88% Relevante", year: "2016", age: "10", duration: "1h 55m",
                synopsis: "Um físico brilhante sofre um acidente e descobre que o tempo e o espaço são relativos, precisando proteger o tecido da realidade contra dogmáticos quânticos.",
                cast: "Benedict Calculatch, Rachel McAtoms", genres: "Ficção Científica, Fantasia", tags: "Física Moderna, Relatividade", isMain: false
            },
            "tema-4": {
                title: "OBSESSÃO", subtitle: "O CRITÉRIO DA FALSIFICABILIDADE",
                bg: "obsessao.jpg", 
                banner: "bobsessao.jpg", 
                ytPreview: "MeHvxJGtz88", // Cena do filme (Nice Date)
                ytTrailer: "OYueQyeNgOk", // Obsessão (Trailer Oficial)
                match: "85% Relevante", year: "2016", age: "14", duration: "1h 57m",
                synopsis: "Um cientista com múltiplas hipóteses precisa encontrar uma forma de refutar todas elas (Popper) antes que sua personalidade pseudocientífica assuma o controle.",
                cast: "James McArquivo, Anya Taylor-Join", genres: "Suspense Psicológico", tags: "Ciência vs Pseudociência", isMain: false
            },

            "tema-5": {
                title: "NÃO OLHE PARA A ÉTICA", subtitle: "",
                bg: "nao_olhe_etica.png", 
                banner: "bnao_olhe_etica.jpg", 
                ytTrailer: "4zMgf3gK7p8", // Não Olhe Para Cima (Dublado)
                match: "95% Relevante", year: "2021", age: "16", duration: "2h 18m",
                synopsis: "Dois desenvolvedores de software descobrem que uma IA sem filtros morais está prestes a destruir a sociedade, mas ninguém na internet parece se importar.",
                cast: "Leonardo DiCaptcha, Jennifer Latência", genres: "Comédia de Erros, Sátira", tags: "Tecnologia, Bioética", isMain: false
            },

            // ================= SÉRIES E CURTAS DE T.I. =================
            "stranger-pings": {
                title: "STRANGER PINGS", subtitle: "",
                bg: "stranger_pings.jpg", 
                ytTrailer: "eQhDYwFuqsk", // Stranger Things (Dublado)
                match: "98% Relevante", year: "2016", age: "12", duration: "4 Temporadas",
                synopsis: "Quando a conexão de uma pequena cidade desaparece, um grupo de jovens nerds descobre um universo paralelo sombrio onde a latência é infinita e o ping é de 999ms.",
                cast: "Millie Byte Brown, Finn Hardware", genres: "Suspense, Nostalgia Anos 80", tags: "Redes, Mundo Invertido", isMain: false
            },
            "treinar-ia": {
                title: "COMO TREINAR A SUA I.A.", subtitle: "",
                bg: "como_treinar_ia.jpg", 
                ytTrailer: "8txXAMLuuXs", // Como Treinar o Seu Dragão (Dublado)
                match: "94% Relevante", year: "2010", age: "Livre", duration: "1h 38m",
                synopsis: "Um jovem programador viking desafia as tradições de sua vila ao fazer amizade com uma Inteligência Artificial considerada perigosa e indomável.",
                cast: "Jay Barch Linux, America Ferramenta", genres: "Animação, Aventura", tags: "Machine Learning, Amizade", isMain: false
            },
            "deepfake-pix": {
                title: "DEEPFAKE", subtitle: "O PREÇO DO PIX",
                bg: "deepfake_pix.jpg",
                trailer: "trailer.mp4",       
                match: "90% Relevante", year: "2022", age: "14", duration: "1h 54m",
                synopsis: "Um documentário tenso sobre um grupo de cibercriminosos que utiliza inteligência artificial para clonar rostos e esvaziar contas bancárias em segundos.",
                cast: "Ryan Hacking, Emma Token", genres: "Documentário Criminal, Suspense", tags: "Segurança Digital, Golpes", isMain: false
            },
            "open-source": {
                title: "OPEN SOURCE", subtitle: "",
                bg: "open_source.jpg", 
                ytTrailer: "S3ZTqflice4", // Oppenheimer (Dublado)
                match: "97% Relevante", year: "2023", age: "16", duration: "3h 00m",
                synopsis: "A história épica e dramática do programador que liderou o projeto de criação do sistema livre mais poderoso do mundo, mudando o rumo da tecnologia para sempre.",
                cast: "Cillian Motherboard, Robert Download Jr.", genres: "Drama Biográfico, Épico", tags: "Linux, Código Aberto", isMain: false
            },
            "kpop": {
                title: "GUERREIRAS DO POP 3", subtitle: "",
                bg: "guerreiras_kpop.jpg", 
                ytTrailer: "XKD_DDX7hqA", // Guerreiras do K-Pop (Trailer Dublado)
                match: "82% Relevante", year: "2017", age: "10", duration: "1h 33m",
                synopsis: "O famoso grupo de idols precisa usar suas habilidades de canto, coreografia sincronizada e injeção de SQL para desativar um vírus mundial durante a turnê de despedida.",
                cast: "Anna Kernel, Rebel Wireless", genres: "Musical, Comédia de Ação", tags: "K-pop, Hacking", isMain: false
            },
            "procurando-ip": {
                title: "PROCURANDO IP", subtitle: "",
                bg: "procurando_ip.jpg", 
                ytTrailer: "i2G4NK7Rtvg", // Procurando Nemo (Dublado)
                match: "96% Relevante", year: "2003", age: "Livre", duration: "1h 40m",
                synopsis: "Um pacotinho de dados se perde na imensidão da Deep Web, e seu pai precisa atravessar roteadores perigosos e firewalls gigantes para traz-lo de volta para casa.",
                cast: "Albert Boots, Ellen DeGe-Network", genres: "Animação, Família", tags: "Redes, Roteamento", isMain: false
            },
            "nicolas": {
                title: "NICOLAS O GRANDE", subtitle: "",
                bg: "nicolas_o_grande.jpg", 
                ytTrailer: "9pxjIBHKiCY", // Alexandre
                match: "80% Relevante", year: "2004", age: "16", duration: "2h 55m",
                synopsis: "A jornada épica de um jovem imperador dos códigos que conquistou todos os repositórios do mundo conhecido e unificou linguagens de programação antes dos 30 anos.",
                cast: "Colin Firewall, Angelina Java", genres: "Ação Histórica, Guerra", tags: "Biografia, Império", isMain: false
            },
            "lalalan": {
                title: "LA LA LAN", subtitle: "",
                bg: "la_la_lan.jpg", 
                ytTrailer: "UD-Cb2yeAPA", // La La Land (Dublado)
                match: "91% Relevante", year: "2016", age: "12", duration: "2h 08m",
                synopsis: "Um técnico de infraestrutura e uma web designer tentam equilibrar o amor e a estabilidade da conexão local enquanto buscam seus sonhos no Vale do Silício.",
                cast: "Ryan Hostling, Emma Storage", genres: "Musical, Romance", tags: "Rede Local, Sonhos", isMain: false
            },

            // ================= TRABALHOS ANTIGOS =================
            "mitm": {
                title: "O HOMEM NO MEIO", subtitle: "",
                bg: "homem_no_meio.jpg", match: "87% Relevante", year: "2013", age: "12", duration: "2h 23m",
                banner: "homem_no_meio.jpg",
                ytTrailer: "i20DDnfPy-o", // O Homem de Aço (Dublado)
                synopsis: "Um ataque cibernético silencioso ameaça interceptar todas as mensagens da cidade. Quem é o vilão invisível que ouve tudo o que você digita?",
                cast: "Henry Cabo, Amy Adm", genres: "Ação, Super-herói", tags: "Man in the Middle, Criptografia", isMain: false
            },
            "firewall": {
                title: "A MURALHA DE FOGO", subtitle: "",
                bg: "muralha_de_fogo.jpg", match: "84% Relevante", year: "2006", age: "14", duration: "1h 45m",
                banner: "muralha_de_fogo.jpg",
                ytTrailer: "s-TRlV9D6FI", // Firewall: Segurança em Risco
                synopsis: "Um especialista em segurança digital é forçado a hackear o próprio sistema bancário impenetrável que ele projetou para salvar sua família de sequestradores.",
                cast: "Harrison For-loop, Paul Bot", genres: "Ação, Suspense", tags: "Segurança de Redes", isMain: false
            },
            "metaverso": {
                title: "FUGA DO METAVERSO", subtitle: "",
                bg: "fuga_metaverso.jpg", match: "93% Relevante", year: "1999", age: "14", duration: "2h 16m",
                banner: "fuga_metaverso.jpg",
                ytTrailer: "mPYfd6PCmYY", // Matrix (Dublado)
                synopsis: "Preso em uma realidade virtual opressora controlada por grandes corporações, um usuário comum precisa encontrar a saída de emergência antes que sua mente seja formatada.",
                cast: "Keanu Ram, Carrie-Anne Mouse", genres: "Ficção Científica, Ação", tags: "Realidade Virtual, Matrix", isMain: false
            },
            "iot": {
                title: "REBELIÃO DAS TORRADEIRAS", subtitle: "",
                bg: "rebeliao_torradeiras.jpg", match: "89% Relevante", year: "2003", age: "14", duration: "1h 49m",
                banner: "rebeliao_torradeiras.jpg",
                ytTrailer: "yBSsBqTJV38", // O Exterminador do Futuro 3 (Dublado)
                synopsis: "O dia do juízo final começou pela cozinha. Eletrodomésticos inteligentes ganham consciência, conectam-se à rede e decidem que os humanos não sabem fazer o próprio café.",
                cast: "Arnold Search-negger, Nick Stall", genres: "Ação, Ficção Pós-Apocalíptica", tags: "IoT, Inteligência Artificial", isMain: false
            },
            "honeypot": {
                title: "O POTE DE MEL", subtitle: "",
                bg: "pote_de_mel.jpg", match: "78% Relevante", year: "2011", age: "Livre", duration: "1h 03m",
                banner: "pote_de_mel.jpg",
                ytTrailer: "ym1x-K9KBa8", // Ursinho Pooh (Dublado)
                synopsis: "Uma armadilha cibernética irresistível disfarçada de servidor vulnerável atrai os piores hackers da internet para um labirinto fofinho sem saída.",
                cast: "Jim Commits, John Filter", genres: "Animação, Suspense Fofo", tags: "Segurança, Honeypot", isMain: false
            },

            // ================= TRABALHOS REAIS DA TURMA (ACERVO) =================
            "teorias-politicas-antiguidade": {
                title: "TEORIAS POLÍTICAS NA ANTIGUIDADE", subtitle: "PLATÃO, ARISTÓTELES E O NASCIMENTO DA POLÍTICA",
                bg: "midia/capas/poster_teorias_politicas.jpg", banner: "midia/capas/poster_teorias_politicas.jpg", customCover: "midia/capas/poster_teorias_politicas.jpg",
                pdf: "trabalhos/Teorias Políticas na Antiguidade - Teorias Políticas de Platão e Aristóteles.pdf",
                slideKey: "teorias_politicas",
                match: "97% Relevante", year: "2025", age: "Livre", duration: "13 Slides • Filosofia Política",
                synopsis: "A fundação do pensamento político clássico na Grécia Antiga: o ideal da cidade justa e a República de Platão governada pelo Rei-Filósofo versus o realismo pragmático e a pólis em Aristóteles.",
                cast: "Davi Costa, Samuel Soares, Francisco Lucas, Yasmyn Paiva, Marcos Felipe, Nícolas Marcell, Micaías Lima, João Pedro Santos, Wislla Mariana, João Pedro Silva",
                genres: "Filosofia Política, Grécia Antiga", tags: "Filosofia, Platão, Aristóteles, Política", isMain: false,
                materia: "Filosofia", trabalhoGrupo: "Seminário: Filosofia Política na Antiguidade", periodo: "2025 • Acervo da Turma"
            },
            "guerra-fria": {
                title: "GUERRA FRIA", subtitle: "BIPOLARIDADE, CORRIDA ARMAMENTISTA E O MUNDO DIVIDIDO",
                bg: "midia/capas/poster_guerra_fria.jpg", banner: "midia/capas/poster_guerra_fria.jpg", customCover: "midia/capas/poster_guerra_fria.jpg",
                pdf: "trabalhos/GUERRA FRIA.pdf",
                slideKey: "guerra_fria",
                match: "97% Relevante", year: "2025", age: "Livre", duration: "15 Slides • Apresentação",
                synopsis: "Apresentação acadêmica abrangente sobre a Guerra Fria: o confronto ideológico entre EUA e URSS, a Doutrina Truman, a corrida armamentista e espacial, as crises na Ásia e América Latina e o colapso do bloco soviético.",
                cast: "Francisco Lucas, Pedro Victor, João Pedro Santos, Rodrigo Rubim, Nícolas Marcell, Micaías Lima, Orlando Júnior",
                genres: "História Geral, Geopolítica", tags: "História, Guerra Fria, Geopolítica", isMain: false,
                materia: "História", trabalhoGrupo: "Seminário: A Guerra Fria e Relações Internacionais", periodo: "2025 • Acervo da Turma"
            },
            "padre-amaro": {
                title: "O CRIME DO PADRE AMARO", subtitle: "REALISMO PORTUGUÊS E CRÍTICA SOCIAL DE EÇA DE QUEIRÓS",
                bg: "midia/capas/poster_classicos_realismo.jpg", banner: "midia/capas/poster_classicos_realismo.jpg", customCover: "midia/capas/poster_classicos_realismo.jpg",
                pdf: "trabalhos/O Crime do Padre Amaro.pdf",
                slideKey: "padre_amaro",
                match: "95% Relevante", year: "2025", age: "14", duration: "10 Slides • Análise Literária",
                synopsis: "Estudo crítico da célebre obra realista de Eça de Queirós, denunciando a corrupção moral do clero e a hipocrisia da sociedade burguesa de Leiria através do drama proibido entre o padre Amaro e Amélia.",
                cast: "Davi Costa, Marcos Felipe, Micaías Lima, Samuel Soares",
                genres: "Língua Portuguesa, Literatura", tags: "Literatura, Realismo, Eça de Queirós", isMain: false,
                materia: "Língua Portuguesa", trabalhoGrupo: "Série: Clássicos do Realismo & Jogos de Tabuleiro", periodo: "2025 • Acervo da Turma"
            },
            "sociologia-desenvolvimento": {
                title: "SOCIOLOGIA DO DESENVOLVIMENTO", subtitle: "CONTRADIÇÕES SOCIAIS, CAPITALISMO E DESIGUALDADE",
                bg: "midia/capas/poster_sociologia_desenvolvimento.jpg", banner: "midia/capas/poster_sociologia_desenvolvimento.jpg", customCover: "midia/capas/poster_sociologia_desenvolvimento.jpg",
                pdf: "trabalhos/Sociologia do Desenvolvimento.pptx.pdf",
                slideKey: "sociologia_desenvolvimento",
                match: "96% Relevante", year: "2025", age: "Livre", duration: "10 Slides • Pesquisa Social",
                synopsis: "Pesquisa sociológica sobre a produção socializada e a apropriação privada do lucro, as crises cíclicas do capitalismo, o relatório da fome da ONU e os desafios estruturais para o desenvolvimento sustentável.",
                cast: "Davi Costa, João Pedro Santos, Samuel Soares, Marcos Felipe, Micaías Lima, João Pedro Silva, Yasmyn Paiva, Wislla Mariana, Nícolas Marcell, Francisco Lucas",
                genres: "Sociologia, Economia Política", tags: "Sociologia, Desigualdade, Capitalismo", isMain: false,
                materia: "Sociologia", trabalhoGrupo: "Seminário: Sociologia do Desenvolvimento", periodo: "2025 • Acervo da Turma"
            },
            "podcast-desigualdade": {
                title: "PODCAST: DESIGUALDADE SOCIAL", subtitle: "DEBATE EM ÁUDIO E VÍDEO • IFPI 2025",
                bg: "https://img.youtube.com/vi/M4rHhajry4A/hqdefault.jpg", 
                banner: "https://img.youtube.com/vi/M4rHhajry4A/hqdefault.jpg",
                customCover: "midia/capas/poster_sociologia_podcasts.jpg",
                ytTrailer: "M4rHhajry4A",
                match: "98% Relevante", year: "2025", age: "Livre", duration: "Vídeo / Podcast",
                synopsis: "Episódio especial gravado em formato podcast pelos alunos da turma, debatendo com profundidade as raízes históricas, os dados estatísticos e os reflexos modernos da desigualdade social e econômica.",
                cast: "Micaías Lima",
                genres: "Sociologia, Podcast Acadêmico", tags: "Sociologia, Podcast, Desigualdade Social", isMain: false,
                materia: "Sociologia", trabalhoGrupo: "Série: Podcasts de Sociologia (2025)", periodo: "2025 • Acervo da Turma"
            },
            "cyber-news": {
                title: "JORNAL CYBER NEWS", subtitle: "POLÍTICA DE SEGURANÇA DA INFORMAÇÃO • IFPI 2026",
                bg: "https://img.youtube.com/vi/AAhPhj00K0g/hqdefault.jpg", 
                banner: "https://img.youtube.com/vi/AAhPhj00K0g/hqdefault.jpg",
                customCover: "midia/capas/poster_defesa_cibernetica.jpg",
                ytTrailer: "AAhPhj00K0g",
                match: "99% Relevante", year: "2026", age: "Livre", duration: "Vídeo / Telejornal",
                synopsis: "Edição especial do telejornal acadêmico 'Cyber News' produzida pelos alunos, cobrindo as políticas de segurança da informação (PSI), boas práticas corporativas, senhas fortes e prevenção a vazamentos de dados.",
                cast: "Micaías Lima",
                genres: "Segurança da Informação, Telejornalismo", tags: "Cibersegurança, Redes, Políticas de Segurança", isMain: false,
                materia: "Segurança & Redes", trabalhoGrupo: "Série: Práticas de Segurança da Informação & Ciberdefesa", periodo: "2026 • 1º Bimestre"
            },
            "seguranca-informacao": {
                title: "SEGURANÇA DA INFORMAÇÃO",
                subtitle: "VULNERABILIDADES WEB, S.O.C., NUVEM E AMEAÇAS SINTÉTICAS",
                bg: "midia/capas/poster_defesa_cibernetica.jpg",
                banner: "midia/capas/poster_defesa_cibernetica.jpg",
                customCover: "midia/capas/poster_defesa_cibernetica.jpg",
                match: "99% Relevante", year: "2025", age: "14", duration: "6 Tópicos Interativos • IFPI",
                synopsis: "Série original acadêmica sobre Segurança da Informação: análise prática e simulação visual de vulnerabilidades web em PHP (SQL Injection, XSS, LFI/RFI), arquitetura defensiva do S.O.C. (Tiers 1, 2, 3 e Red/Blue/Purple Team), responsabilidade compartilhada em Cloud Computing, novos vetores de ataque com Inteligência Artificial e Deepfakes, e governança corporativa com a norma ISO 27001.",
                cast: "Francisco Lucas, João Pedro Santos, Pedro Victor, João Pedro Silva, Nícolas Marcell",
                genres: "Segurança da Informação, Ciberdefesa, Redes",
                tags: "Segurança, SOC, SQL Injection, XSS, Cloud, Deepfake, ISO 27001",
                isMain: false,
                isSecurityPresentation: true,
                materia: "Segurança & Redes",
                trabalhoGrupo: "Série: Práticas de Segurança da Informação & Ciberdefesa",
                periodo: "2025 • Acervo da Turma"
            },
            "memoria-cache": {
                title: "MEMÓRIA CACHE E ARMAZENAMENTO", subtitle: "HIERARQUIA DE MEMÓRIAS E DISCOS MAGNÉTICOS",
                bg: "midia/capas/poster_hardware_arquitetura.jpg", banner: "midia/capas/poster_hardware_arquitetura.jpg", customCover: "midia/capas/poster_hardware_arquitetura.jpg",
                pdf: "trabalhos/Blue and Purple Modern Computer Presentation.pdf",
                slideKey: "memoria_cache",
                match: "94% Relevante", year: "2025", age: "Livre", duration: "6 Slides • Apresentação Técnica",
                synopsis: "Apresentação técnica sobre a organização interna e o fluxo de dados em sistemas computacionais: funcionamento da memória cache (L1, L2, L3), latência, barramentos e dispositivos de armazenamento secundário.",
                cast: "Micaías Lima, Maria Helena",
                genres: "Hardware, Arquitetura de Computadores", tags: "Hardware, Memória Cache, Processadores", isMain: false,
                materia: "Hardware & Arquitetura", trabalhoGrupo: "Série: Arquitetura de Computadores & Hardware", periodo: "2025 • Acervo da Turma"
            },
            "evolucao-computadores": {
                title: "EVOLUÇÃO DOS COMPUTADORES", subtitle: "DA PRIMEIRA GERAÇÃO À COMPUTAÇÃO MODERNA",
                bg: "midia/capas/poster_hardware_arquitetura.jpg", banner: "midia/capas/poster_hardware_arquitetura.jpg", customCover: "midia/capas/poster_hardware_arquitetura.jpg",
                pdf: "trabalhos/Digital evolution.pdf",
                slideKey: "evolucao_computadores",
                match: "93% Relevante", year: "2025", age: "Livre", duration: "9 Slides • Manutenção",
                synopsis: "Um panorama histórico da informática: desde a primeira geração com válvulas eletrônicas gigantes (1945), a revolução dos transistores e circuitos integrados até os microprocessadores de alto desempenho.",
                cast: "Micaías Lima",
                genres: "Manutenção de Computadores, História da T.I.", tags: "Hardware, Evolução dos Computadores", isMain: false,
                materia: "Hardware & Arquitetura", trabalhoGrupo: "Série: Arquitetura de Computadores & Hardware", periodo: "2025 • Acervo da Turma"
            },
            "podcast-round6": {
                title: "CLÁSSICOS EM SÉRIE", subtitle: "ROUND 6 E AS TEORIAS SOCIOLÓGICAS (MARX, DURKHEIM E WEBER)",
                bg: "midia/capas/poster_sociologia_podcasts.jpg", banner: "midia/capas/poster_sociologia_podcasts.jpg", customCover: "midia/capas/poster_sociologia_podcasts.jpg",
                pdf: "https://canva.link/nynn6ibes7h9adb",
                match: "99% Relevante", year: "2025", age: "14", duration: "Podcast • Canva",
                synopsis: "Episódio de estreia do podcast 'Clássicos em Série': os alunos analisam a série Round 6 através dos conceitos clássicos da sociologia — a luta de classes e desumanização em Marx, a anomia moral em Durkheim e a ação social racional calculista em Weber.",
                cast: "Francisco Lucas, João Pedro Santos, Pedro Victor",
                genres: "Sociologia, Podcast Cultural", tags: "Sociologia, Round 6, Marx, Durkheim, Weber", isMain: false,
                materia: "Sociologia", trabalhoGrupo: "Série: Podcasts de Sociologia (2025)", periodo: "2025 • Acervo da Turma"
            },
            "ia-ingles": {
                title: "INTELIGÊNCIA ARTIFICIAL NO INGLÊS", subtitle: "COMO A IA PODE AJUDAR NO APRENDIZADO DE IDIOMAS",
                bg: "midia/capas/poster_ia_ingles.jpg", banner: "midia/capas/poster_ia_ingles.jpg", customCover: "midia/capas/poster_ia_ingles.jpg",
                pdf: "trabalhos/Usam dados para aprender, adaptar e responder. Aplicações em diversas áreas, inclusive na educação..pdf",
                slideKey: "ia_ingles",
                match: "96% Relevante", year: "2025", age: "Livre", duration: "11 Slides • Apresentação",
                synopsis: "Estudo sobre a integração da Inteligência Artificial no ensino e prática de inglês: superação do medo de errar, prática de conversação com chatbots, feedback imediato e ferramentas adaptativas como Duolingo.",
                cast: "João Pedro Santos, Pedro Victor, Francisco Lucas, Bruno Cardoso",
                genres: "Língua Inglesa, Inteligência Artificial", tags: "Inglês, IA, Educação, Chatbots", isMain: false,
                materia: "Língua Inglesa", trabalhoGrupo: "Seminário: Inteligência Artificial no Ensino de Idiomas", periodo: "2025 • Acervo da Turma"
            },
            "padre-amaro-jogo": {
                title: "O CRIME DO PADRE AMARO: TABULEIRO", subtitle: "A NARRATIVA ATRAVÉS DO JOGO DE TABULEIRO",
                bg: "midia/capas/poster_classicos_realismo.jpg", banner: "midia/capas/poster_classicos_realismo.jpg", customCover: "midia/capas/poster_classicos_realismo.jpg",
                pdf: "trabalhos/O Crime do Padre Amaro jp.pdf",
                slideKey: "padre_amaro_jogo",
                match: "96% Relevante", year: "2025", age: "14", duration: "6 Slides • Gamificação Literária",
                synopsis: "Adaptação criativa da narrativa do clássico realista de Eça de Queirós em formato de regras e dinâmicas de jogo de tabuleiro: a chegada de Amaro a Leiria, as intrigas de João Eduardo, a quebra de votos e o sacrilégio moral.",
                cast: "João Pedro Santos, Pedro Victor, Francisco Lucas",
                genres: "Língua Portuguesa, Gamificação", tags: "Literatura, Eça de Queirós, Jogo de Tabuleiro", isMain: false,
                materia: "Língua Portuguesa", trabalhoGrupo: "Série: Clássicos do Realismo & Jogos de Tabuleiro", periodo: "2025 • Acervo da Turma"
            },
            "jogo-transito": {
                title: "JOGO EDUCATIVO DE TRÂNSITO", subtitle: "PROJETO INTEGRADOR EM REACT NATIVE E PIXEL ART",
                bg: "midia/capas/poster_jogo_transito.jpg", banner: "midia/capas/poster_jogo_transito.jpg", customCover: "midia/capas/poster_jogo_transito.jpg",
                pdf: "trabalhos/Trabalho de Tópicos Especiais em desenvolvimento e projeto integrador.pdf",
                slideKey: "jogo_transito",
                match: "95% Relevante", year: "2025", age: "Livre", duration: "3 Slides • Projeto de Software",
                synopsis: "Proposta de desenvolvimento de um jogo mobile educativo com minigames interativos ensinando regras do Código de Trânsito Brasileiro, programado em React Native, arte em pixel art (Aseprite) e trilha sonora via Beepbox.",
                cast: "João Pedro Santos, Francisco Lucas, Pedro Victor, Rodrigo Rubim",
                genres: "Programação & T.I., Desenvolvimento de Jogos", tags: "React Native, Games, Código de Trânsito", isMain: false,
                materia: "Tópicos Especiais em Desenvolvimento", trabalhoGrupo: "Projeto Integrador: Jogo Educativo de Trânsito", periodo: "2025 • Acervo da Turma"
            },
            "sargento-milicias": {
                title: "MEMÓRIAS DE UM SARGENTO DE MILÍCIAS", subtitle: "O ROMANCE URBANO E O ANTI-HERÓI MALANDRO",
                bg: "midia/capas/poster_sargento_milicias.jpg", banner: "midia/capas/poster_sargento_milicias.jpg", customCover: "midia/capas/poster_sargento_milicias.jpg",
                pdf: "trabalhos/Memórias de um sargento de Milícias.pdf",
                slideKey: "sargento_milicias",
                match: "94% Relevante", year: "2025", age: "Livre", duration: "6 Slides • Análise Literária",
                synopsis: "Estudo crítico sobre a célebre obra de Manuel Antônio de Almeida: a representação das camadas populares do Rio de Janeiro colonial, as aventuras e malandragens de Leonardo e a transição do Romantismo para o Realismo.",
                cast: "João Pedro Santos, Pedro Victor, Francisco Lucas",
                genres: "Língua Portuguesa, Literatura Brasileira", tags: "Romantismo Urbano, Malandragem, Literatura", isMain: false,
                materia: "Língua Portuguesa", trabalhoGrupo: "Seminário Literário: Memórias de um Sargento de Milícias", periodo: "2025 • Acervo da Turma"
            },
            "prosa-1930": {
                title: "A PROSA DE 1930: JORGE AMADO", subtitle: "RETRATOS DA BAHIA E A SEGUNDA GERAÇÃO MODERNISTA",
                bg: "midia/capas/poster_prosa_1930.jpg", banner: "midia/capas/poster_prosa_1930.jpg", customCover: "midia/capas/poster_prosa_1930.jpg",
                pdf: "trabalhos/A prosa de 1930 Jorge Amado (Retratos da Bahia).pdf",
                slideKey: "prosa_1930",
                match: "97% Relevante", year: "2025", age: "12", duration: "11 Slides • Segunda Geração Modernista",
                synopsis: "Análise aprofundada da Prosa Regionalista de 30 com foco em Jorge Amado: o impacto social da Crise de 1929 e da Era Vargas, a denúncia das desigualdades no Nordeste e o homem determinado pelo seu meio sociocultural.",
                cast: "João Pedro Santos, Pedro Victor, Francisco Lucas, João Pedro Silva, Nícolas Marcell, José Nildo",
                genres: "Língua Portuguesa, Modernismo", tags: "Jorge Amado, Prosa de 30, Modernismo, Bahia", isMain: false,
                materia: "Língua Portuguesa", trabalhoGrupo: "Seminário Literário: A Prosa de 1930 (Jorge Amado)", periodo: "2025 • Acervo da Turma"
            },
            "primo-basilio": {
                title: "O PRIMO BASÍLIO", subtitle: "REALISMO PORTUGUÊS E CRÍTICA À BURGUESIA • EÇA DE QUEIRÓS",
                bg: "midia/capas/poster_classicos_realismo.jpg",
                banner: "midia/capas/poster_classicos_realismo.jpg",
                customCover: "midia/capas/poster_classicos_realismo.jpg",
                match: "96% Relevante", year: "2025", age: "14", duration: "Em Breve • Sem PDF",
                synopsis: "Análise crítica do romance realista de Eça de Queirós: as falsas aparências e o tédio existencial de Luísa, a sedução maquiavélica de seu primo Basílio e a chantagem impiedosa da criada Juliana, desmascarando a decadência moral da sociedade burguesa de Lisboa.",
                cast: "Equipe de Literatura • Turma IFPI",
                genres: "Língua Portuguesa, Literatura Clássica",
                tags: "Literatura, Eça de Queirós, Realismo, Romance",
                isMain: false,
                hasNoPdf: true,
                materia: "Língua Portuguesa",
                trabalhoGrupo: "Série: Clássicos do Realismo & Jogos de Tabuleiro",
                periodo: "2025 • Em Breve"
            },
            "memorias-postumas": {
                title: "MEMÓRIAS PÓSTUMAS DE BRÁS CUBAS", subtitle: "A RUPTURA DO REALISMO BRASILEIRO • MACHADO DE ASSIS",
                bg: "midia/capas/poster_classicos_realismo.jpg",
                banner: "midia/capas/poster_classicos_realismo.jpg",
                customCover: "midia/capas/poster_classicos_realismo.jpg",
                match: "99% Relevante", year: "2025", age: "14", duration: "Em Breve • Sem PDF",
                synopsis: "Estudo da obra-prima fundadora do Realismo no Brasil: a genial audácia do 'defunto autor' narrando suas memórias do além-túmulo, o pessimismo filosófico machadiano, a sátira às elites do Segundo Reinado e o célebre legado das 'negativas' existenciais.",
                cast: "Equipe de Literatura • Turma IFPI",
                genres: "Língua Portuguesa, Literatura Clássica",
                tags: "Literatura, Machado de Assis, Realismo Brasileiro, Filosofia",
                isMain: false,
                hasNoPdf: true,
                materia: "Língua Portuguesa",
                trabalhoGrupo: "Série: Clássicos do Realismo & Jogos de Tabuleiro",
                periodo: "2025 • Em Breve"
            },
            "dom-casmurro": {
                title: "DOM CASMURRO", subtitle: "O ENIGMA DE CAPITU E A VOZ DO CIÚME • MACHADO DE ASSIS",
                bg: "midia/capas/poster_classicos_realismo.jpg",
                banner: "midia/capas/poster_classicos_realismo.jpg",
                customCover: "midia/capas/poster_classicos_realismo.jpg",
                match: "98% Relevante", year: "2025", age: "14", duration: "Em Breve • Sem PDF",
                synopsis: "Investigação literária e psicológica sobre o narrador não confiável Bento Santiago (Bentinho): a paixão de infância por Capitu, os inesquecíveis 'olhos de ressaca', a obsessão corrosiva pelo fantasma da traição com Escobar e o debate eterno sobre a verdade dos fatos.",
                cast: "Equipe de Literatura • Turma IFPI",
                genres: "Língua Portuguesa, Literatura Clássica",
                tags: "Literatura, Machado de Assis, Capitu, Realismo Psicológico",
                isMain: false,
                hasNoPdf: true,
                materia: "Língua Portuguesa",
                trabalhoGrupo: "Série: Clássicos do Realismo & Jogos de Tabuleiro",
                periodo: "2025 • Em Breve"
            }
        };

let trailerTimeout; // espera um pouco antes de começar a prévia do trailer no modal
const TRAILER_PREVIEW_DELAY = 2500; // a prévia começa sozinha, como na Netflix

/* Tenta tocar o vídeo COM som. Se o navegador bloquear (comum no celular), toca sem som
   em vez de ficar parado esperando o usuário apertar play. */
function playWithFallback(video) {
    video.muted = false;
    const tentativa = video.play();
    if (tentativa && typeof tentativa.catch === 'function') {
        return tentativa.catch(() => {
            video.muted = true;
            const segunda = video.play();
            return segunda && typeof segunda.catch === 'function' ? segunda.catch(() => {}) : undefined;
        });
    }
    return Promise.resolve();
}

function isLocalFileProtocol() {
    return window.location.protocol === 'file:';
}

const MODAL_TRAILER_DELAY = 2500; // 2.5 segundos: tempo equilibrado para ver o título e capa antes de iniciar o trailer automaticamente

function getYouTubeEmbedUrl(videoId, isPreview = false, startAt = 0) {
    const origin = (window.location.origin && window.location.origin.startsWith('http')) 
        ? window.location.origin 
        : 'https://buguinha0202.github.io';
    // controls=0 / fs=0 / disablekb=1 / iv_load_policy=3 escondem a interface do YouTube:
    // os controles que aparecem no site são os nossos (via IFrame API / postMessage)
    const base = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&fs=0&disablekb=1&iv_load_policy=3&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`;
    const start = Math.floor(startAt || 0);
    const startParam = start > 0 ? `&start=${start}` : '';
    if (isPreview) {
        // começa mudo (permitido pelo navegador) e o áudio é ligado logo depois via API
        return `${base}&mute=1&loop=1&playlist=${videoId}${startParam}`;
    }
    return `${base}${startParam}`;
}

/* Episódios do filme principal (o "inicio" é o id do slide no roteiro) */
const EPISODIOS_GUERRA_CIVIL = [
    { n: 1, titulo: 'O Renascimento',               desc: 'A Europa acordando de uma soneca de 1000 anos. O fim da Escolástica.',      inicio: 0 },
    { n: 2, titulo: 'Tradição Medieval',            desc: 'O domínio do Geocentrismo e o Princípio da Autoridade da Igreja.',          inicio: 2 },
    { n: 3, titulo: 'A Ruptura & Rev. Cosmológica', desc: 'Copérnico muda o centro do tabuleiro e Galileu aponta o telescópio.',       inicio: 4 },
    { n: 4, titulo: 'O Empirismo',                  desc: 'Francis Bacon, a queda dos Ídolos e a força do Método Indutivo.',           inicio: 8 },
    { n: 5, titulo: 'O Racionalismo',               desc: 'Descartes, a Dúvida Metódica e a famosa frase: Penso, logo existo.',        inicio: 10 },
    { n: 6, titulo: 'A Síntese Newtoniana',         desc: 'A união perfeita entre Racionalismo e Empirismo. O Método Científico.',     inicio: 12 }
];

function renderEpisodios() {
    const thumb = "background-image: url('" + imgUrl('banner.png', 200) + "')";
    let html = EPISODIOS_GUERRA_CIVIL.map(ep => `
        <div class="episode-item" role="button" tabindex="0" data-ep-action="cine" data-ep-arg="${ep.inicio}">
            <div class="ep-number">${ep.n}</div>
            <div class="ep-img" style="${thumb}"><i class="fa-solid fa-play"></i></div>
            <div class="ep-details"><h4>${ep.titulo}</h4><p>${ep.desc}</p></div>
        </div>`).join('');

    html += `
        <div class="episode-item special-ep" role="button" tabindex="0" data-ep-action="classic">
            <div class="ep-number"><i class="fa-solid fa-star"></i></div>
            <div class="ep-img" style="background-image: url('${imgUrl('guerra_civil.png', 200)}')"><i class="fa-solid fa-play"></i></div>
            <div class="ep-details"><h4>O Grimório (Modo Clássico)</h4><p>Apresentação original em slides com simulações e mapa de conceitos.</p></div>
        </div>
        <div class="episode-item special-ep quiz-ep" role="button" tabindex="0" data-ep-action="quiz">
            <div class="ep-number"><i class="fa-solid fa-gamepad"></i></div>
            <div class="ep-img" style="${thumb}"><i class="fa-solid fa-play"></i></div>
            <div class="ep-details"><h4>Episódio Interativo: O Quiz</h4><p>Teste os conhecimentos da turma com 7 questões sobre a Revolução Científica.</p></div>
        </div>
        <div class="episode-item special-ep resumo-ep" role="button" tabindex="0" data-ep-action="resumo">
            <div class="ep-number"><i class="fa-solid fa-book-open"></i></div>
            <div class="ep-img" style="background-image: url('${imgUrl('guerra_civil.png', 200)}')"><i class="fa-solid fa-book-bookmark"></i></div>
            <div class="ep-details"><h4>Guia de Estudos (Resumo da Matéria)</h4><p>Síntese completa em 1 página com os 7 temas da Revolução Científica e tabela comparativa.</p></div>
        </div>`;
    return html;
}

function runEpisodeAction(el) {
    const action = el.dataset.epAction;
    if (action === 'resumo') {
        window.closeTitleModal(null, true);
        window.openResumoModal(true);
        return;
    }
    window.closeTitleModal(null, true);
    if (action === 'cine') window.startCinematicMovieAt(el.dataset.epArg);
    else if (action === 'classic') window.startPresentationAt(0);
    else if (action === 'quiz') window.startQuiz();
}

function renderMovieCard(id, data, width) {
    const img = data.banner ? data.banner : data.bg;
    return `
        <div class="more-card" role="button" tabindex="0" data-movie="${id}" aria-label="${data.title}">
            <div class="more-img" style="background-image:url('${imgUrl(img, width)}')"></div>
            <div class="more-info">
                <h4>${data.title}</h4>
                <i class="fa-solid fa-play more-play"></i>
            </div>
        </div>`;
}

/* =========================================================
   REGISTRO CANÔNICO DE SÉRIES ORIGINAIS IFPIFLIX
   Organização sequencial em Episódios / Temporadas
   ========================================================= */
const SERIES_REGISTRY = {
    'filosofia-3ano': {
        id: 'filosofia-3ano',
        title: 'Filosofia: Revolução Científica & Pensamento Contemporâneo',
        subtitle: 'Da Escolástica Medieval aos Dilemas da Inteligência Artificial',
        season: '1ª Temporada • 3º Ano 2026',
        materia: 'Filosofia',
        cover: 'midia/capas/poster_filosofia_serie.jpg',
        episodes: [
            {
                id: 'tema-1',
                num: 1,
                title: 'Tema 01: Invocação do Dogma',
                topic: 'O Julgamento da Escolástica & Idade Média',
                desc: 'Investigadores do pensamento tentam exorcizar dogmas medievais e o princípio de autoridade aristotélico.',
                duration: 'Apresentação • Slides'
            },
            {
                id: 'guerra-civil',
                num: 2,
                title: 'Tema 02: Guerra Civil (A Batalha Intelectual)',
                topic: 'Empirismo vs Racionalismo & O Método Científico',
                desc: 'A Revolução Científica: Heliocentrismo, Copérnico, Galileu, Bacon, Descartes e a grande síntese de Newton.',
                duration: 'Filme 3D • 6 Atos'
            },
            {
                id: 'tema-3',
                num: 3,
                title: 'Tema 03: Devoradores do Espaço Tempo',
                topic: 'Física Moderna, Relatividade & Cosmologia',
                desc: 'A crise da física clássica e a ruptura provocada pela relatividade de Einstein e a mecânica quântica.',
                duration: 'Apresentação • Slides'
            },
            {
                id: 'tema-4',
                num: 4,
                title: 'Tema 04: Obsessão',
                topic: 'Karl Popper & O Critério da Falsificabilidade',
                desc: 'O problema da demarcação científica: como separar a ciência genuína das pseudociências e dogmas contemporâneos.',
                duration: 'Apresentação • Slides'
            },
            {
                id: 'tema-5',
                num: 5,
                title: 'Tema 05: Não Olhe para a Ética',
                topic: 'Bioética, Algoritmos & Inteligência Artificial',
                desc: 'Os impactos morais da inteligência artificial e a responsabilidade ética na sociedade conectada.',
                duration: 'Apresentação • Slides'
            }
        ]
    },
    'literatura-realismo': {
        id: 'literatura-realismo',
        title: 'Língua Portuguesa: Clássicos do Realismo & Jogos',
        subtitle: 'Romances Canônicos do Século XIX e Adaptações Gamificadas',
        season: '2 Temporadas • 5 Episódios',
        materia: 'Língua Portuguesa',
        cover: 'midia/capas/poster_classicos_realismo.jpg',
        episodes: [
            // TEMPORADA 1: LIVROS / ROMANCES DO REALISMO
            {
                id: 'padre-amaro',
                num: 1,
                season: 1,
                seasonTitle: '1ª Temporada: Romances Canônicos do Realismo (Livros)',
                title: 'O Crime do Padre Amaro',
                topic: 'Eça de Queirós • Realismo Português',
                desc: 'A crítica mordaz à hipocrisia e corrupção clerical da sociedade provincial leiriense do século XIX.',
                duration: '10 Slides • Análise'
            },
            {
                id: 'primo-basilio',
                num: 2,
                season: 1,
                seasonTitle: '1ª Temporada: Romances Canônicos do Realismo (Livros)',
                title: 'O Primo Basílio',
                topic: 'Eça de Queirós • A Pequena Burguesia de Lisboa',
                desc: 'O adultério burguês, o vazio existencial de Luísa e a tirania chantagista da empregada Juliana.',
                duration: 'Em Breve • Sem PDF',
                hasNoPdf: true
            },
            {
                id: 'memorias-postumas',
                num: 3,
                season: 1,
                seasonTitle: '1ª Temporada: Romances Canônicos do Realismo (Livros)',
                title: 'Memórias Póstumas de Brás Cubas',
                topic: 'Machado de Assis • Ruptura e Ironia do Defunto Autor',
                desc: 'A fundação do Realismo brasileiro: pessimismo elegante, metalinguagem e a denúncia da elite carioca.',
                duration: 'Em Breve • Sem PDF',
                hasNoPdf: true
            },
            {
                id: 'dom-casmurro',
                num: 4,
                season: 1,
                seasonTitle: '1ª Temporada: Romances Canônicos do Realismo (Livros)',
                title: 'Dom Casmurro',
                topic: 'Machado de Assis • Capitu e o Enigma da Traição',
                desc: 'O narrador não confiável, os olhos de ressaca e a corrosão psicológica do ciúme obsessivo.',
                duration: 'Em Breve • Sem PDF',
                hasNoPdf: true
            },
            // TEMPORADA 2: JOGOS DE TABULEIRO
            {
                id: 'padre-amaro-jogo',
                num: 1,
                season: 2,
                seasonTitle: '2ª Temporada: Jogos de Tabuleiro (Adaptações Literárias)',
                title: 'O Crime do Padre Amaro: Tabuleiro',
                topic: 'Gamificação Literária & Dinâmica de Regras',
                desc: 'Adaptação dos dilemas e conflitos do romance de Eça de Queirós em mecânicas originais de jogo de tabuleiro.',
                duration: '6 Slides • Tabuleiro'
            }
        ]
    },
    'sociologia-podcasts': {
        id: 'sociologia-podcasts',
        title: 'Sociologia: Série de Podcasts (2025)',
        subtitle: 'Debates em Áudio e Vídeo sobre Desigualdades e Cultura Pop',
        season: '1ª Temporada • 2025',
        materia: 'Sociologia',
        cover: 'midia/capas/poster_sociologia_podcasts.jpg',
        episodes: [
            {
                id: 'podcast-desigualdade',
                num: 1,
                title: 'Podcast: Desigualdade Social',
                topic: 'Debate em Áudio e Vídeo • Vozes da Turma',
                desc: 'Mesa redonda gravada pelos alunos analisando as disparidades de renda e oportunidades no Brasil.',
                duration: 'Vídeo / Podcast'
            },
            {
                id: 'podcast-round6',
                num: 2,
                title: 'Clássicos em Série: Round 6',
                topic: 'Marx, Durkheim e Weber na Cultura Pop',
                desc: 'A luta de classes, a anomia social e a ação racional calculista decodificadas através do fenômeno sul-coreano.',
                duration: 'Podcast • Canva'
            }
        ]
    },
    'hardware-arquitetura': {
        id: 'hardware-arquitetura',
        title: 'Hardware & Arquitetura: Do Silício aos Processadores Modernos',
        subtitle: 'Evolução, Microarquitetura e Hierarquia de Memória',
        season: '1ª Temporada • T.I.',
        materia: 'Hardware & Arquitetura',
        cover: 'midia/capas/poster_hardware_arquitetura.jpg',
        episodes: [
            {
                id: 'evolucao-computadores',
                num: 1,
                title: 'Evolução dos Computadores',
                topic: 'Das Válvulas aos Microprocessadores',
                desc: 'Um panorama histórico completo das gerações da computação desde os anos 1940 até os dias atuais.',
                duration: '9 Slides • Histórico'
            },
            {
                id: 'memoria-cache',
                num: 2,
                title: 'Memória Cache e Armazenamento',
                topic: 'Hierarquia, Latência e Organização de Memória',
                desc: 'Como a CPU supera o gargalo da memória principal: funcionamento das caches L1, L2, L3 e discos magnéticos.',
                duration: '6 Slides • Técnico'
            }
        ]
    },
    'seguranca-ciberdefesa': {
        id: 'seguranca-ciberdefesa',
        title: 'Segurança & Redes: Defesa Cibernética no Mundo Real',
        subtitle: 'Ataques Web, S.O.C., Engenharia Social e Governança',
        season: '1ª Temporada • Cibersegurança',
        materia: 'Segurança & Redes',
        cover: 'midia/capas/poster_defesa_cibernetica.jpg',
        episodes: [
            {
                id: 'seguranca-informacao',
                num: 1,
                title: 'Segurança da Informação Interativa',
                topic: 'Vulnerabilidades Web, S.O.C., Cloud e Deepfakes',
                desc: 'Simulação interativa prática de vetores de invasão em PHP, resposta a incidentes e inteligência artificial.',
                duration: 'Apresentação Interativa'
            },
            {
                id: 'cyber-news',
                num: 2,
                title: 'Jornal Cyber News',
                topic: 'Políticas de Segurança da Informação (PSI)',
                desc: 'Telejornal produzido pelos alunos cobrindo boas práticas digitais, higiene de senhas e defesa contra vazamentos.',
                duration: 'Vídeo / Telejornal'
            }
        ]
    }
};

function getSeriesForMovie(movieId) {
    if (!movieId) return null;
    for (const sKey in SERIES_REGISTRY) {
        const series = SERIES_REGISTRY[sKey];
        if (series.episodes.some(ep => ep.id === movieId)) {
            return series;
        }
    }
    return null;
}

function renderSeriesEpisodesHtml(seriesInfo, currentMovieId) {
    let lastSeason = null;
    let html = seriesInfo.episodes.map((ep, idx) => {
        const epData = filmesDB[ep.id] || {};
        const isActive = ep.id === currentMovieId;
        const isPending = !!(ep.hasNoPdf || epData.hasNoPdf);
        const epNum = ep.num || (idx + 1);

        // Header de Temporada se houver divisão
        let seasonHeaderHtml = '';
        if (ep.season && ep.season !== lastSeason) {
            lastSeason = ep.season;
            const seasonTitle = ep.seasonTitle || `Temporada ${ep.season}`;
            const seasonIcon = ep.season === 2 ? 'fa-solid fa-dice' : 'fa-solid fa-book-open';
            seasonHeaderHtml = `
                <div class="series-season-divider">
                    <span class="series-season-pill"><i class="${seasonIcon}"></i> ${seasonTitle}</span>
                </div>
            `;
        }

        // Thumbnail do episódio
        let thumb = '';
        if (epData.banner) thumb = imgUrl(epData.banner, 300);
        else if (epData.bg) thumb = imgUrl(epData.bg, 300);
        else if (epData.customCover) thumb = imgUrl(epData.customCover, 300);
        else thumb = generateAutoPosterDataUri(ep.title, seriesInfo.materia, epData.cast);

        const durationBadge = ep.duration || epData.duration || 'Trabalho Acadêmico';
        const topicHtml = ep.topic ? `<div class="ep-topic">${ep.topic}</div>` : '';
        const descText = ep.desc || epData.synopsis || '';

        // Barra de progresso vermelha estilo Netflix
        const savedProgress = parseInt(localStorage.getItem('ifpiflix_progress_' + ep.id), 10) || 0;
        const progressBarHtml = savedProgress > 0 ? `
            <div class="ep-progress-bar-wrap" title="${savedProgress}% assistido">
                <div class="ep-progress-bar-fill" style="width: ${savedProgress}%;"></div>
            </div>
        ` : '';

        return `
            ${seasonHeaderHtml}
            <div class="episode-item ${isActive ? 'is-active-episode' : ''} ${isPending ? 'is-pending-episode' : ''}" 
                 role="button" tabindex="0" 
                 onclick="window.selectSeriesEpisode('${ep.id}', '${seriesInfo.id}')"
                 title="${isActive ? 'Você está neste episódio' : (isPending ? 'Trabalho em breve (PDF pendente)' : 'Assistir ' + ep.title)}">
                <div class="ep-number">${epNum}</div>
                <div class="ep-img" style="background-image: url('${thumb}')">
                    ${isActive ? '<span class="ep-playing-pill"><i class="fa-solid fa-play"></i></span>' : (isPending ? '<span class="ep-pending-badge"><i class="fa-regular fa-clock"></i></span>' : '<i class="fa-solid fa-play"></i>')}
                    ${progressBarHtml}
                </div>
                <div class="ep-details">
                    <div class="ep-title-row">
                        <h4>${ep.title}</h4>
                        <span class="ep-duration-badge">${durationBadge}</span>
                    </div>
                    ${topicHtml}
                    <p>${descText}</p>
                    ${isActive ? '<div class="ep-active-status"><i class="fa-solid fa-circle-dot"></i> Assistindo Agora</div>' : ''}
                    ${isPending ? '<div class="ep-pending-status"><i class="fa-solid fa-circle-exclamation"></i> Aguardando envio de slides pela turma</div>' : ''}
                </div>
            </div>
        `;
    }).join('');

    // Se for a série de Filosofia, adiciona os 3 episódios especiais do Grimório / Quiz / Resumo
    if (seriesInfo.id === 'filosofia-3ano') {
        const thumbGuerra = "background-image: url('" + imgUrl('banner.png', 200) + "')";
        const thumbGrimorio = "background-image: url('" + imgUrl('guerra_civil.png', 200) + "')";
        html += `
            <div class="series-companion-divider" style="margin: 22px 0 12px 0; padding-top: 14px; border-top: 1px dashed rgba(255,255,255,0.2); font-size: 0.8rem; font-weight: 800; color: #ffd700; letter-spacing: 1.5px; text-transform: uppercase;">
                <i class="fa-solid fa-sparkles"></i> Conteúdos Especiais &bull; Guerra Civil (Modo Clássico)
            </div>
            <div class="episode-item special-ep" role="button" tabindex="0" data-ep-action="classic" onclick="runEpisodeAction(this)">
                <div class="ep-number"><i class="fa-solid fa-star"></i></div>
                <div class="ep-img" style="${thumbGrimorio}"><i class="fa-solid fa-play"></i></div>
                <div class="ep-details"><h4>O Grimório (Modo Clássico)</h4><p>Apresentação original em slides com simulações e mapa de conceitos.</p></div>
            </div>
            <div class="episode-item special-ep quiz-ep" role="button" tabindex="0" data-ep-action="quiz" onclick="runEpisodeAction(this)">
                <div class="ep-number"><i class="fa-solid fa-gamepad"></i></div>
                <div class="ep-img" style="${thumbGuerra}"><i class="fa-solid fa-play"></i></div>
                <div class="ep-details"><h4>Episódio Interativo: O Quiz</h4><p>Teste os conhecimentos da turma com 7 questões sobre a Revolução Científica.</p></div>
            </div>
            <div class="episode-item special-ep resumo-ep" role="button" tabindex="0" data-ep-action="resumo" onclick="runEpisodeAction(this)">
                <div class="ep-number"><i class="fa-solid fa-book-open"></i></div>
                <div class="ep-img" style="${thumbGrimorio}"><i class="fa-solid fa-book-bookmark"></i></div>
                <div class="ep-details"><h4>Guia de Estudos (Resumo da Matéria)</h4><p>Síntese completa em 1 página com os 7 temas da Revolução Científica e tabela comparativa.</p></div>
            </div>
        `;
    }

    return html;
}

window.selectSeriesEpisode = function(targetMovieId, seriesId) {
    if (!targetMovieId) return;
    const data = filmesDB[targetMovieId];
    if (data && data.hasNoPdf) {
        window.openTitleModal(targetMovieId);
        if (typeof window.showToastNotification === 'function') {
            window.showToastNotification('Este trabalho faz parte da série oficial! O PDF está aguardando envio da equipe.');
        }
        return;
    }
    window.openTitleModal(targetMovieId);
};

function updateListButtonIcon(btn, movieId) {
    const icon = btn && btn.querySelector('i');
    if (!icon) return;
    const naLista = minhaLista.includes(movieId);
    icon.className = naLista ? 'fa-solid fa-check' : 'fa-solid fa-plus';
    btn.setAttribute('aria-label', naLista ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista');
}

window.openTitleModal = function(movieId, fromSurprise = false) {
    if (typeof window.closeHoverPreview === 'function') window.closeHoverPreview();
    if (typeof hoverPreviewTimeout !== 'undefined') clearTimeout(hoverPreviewTimeout);
    document.body.classList.add('modal-open');

    currentModalMovieId = movieId;
    updateListButtonIcon(document.getElementById('m-btn-list'), movieId);
    updateRatingButton(movieId);
    if (typeof updateMovieBurstLikeButton === 'function') {
        updateMovieBurstLikeButton(movieId);
    }

    const surpriseBadge = document.getElementById('m-surprise-badge');
    if (surpriseBadge) {
        surpriseBadge.style.display = fromSurprise ? 'inline-flex' : 'none';
    }

    const overlay = document.getElementById('title-modal-overlay');
    const container = document.getElementById('title-modal-content');
    const isOpen = overlay.classList.contains('show');

    // Carrega os dados do título no modal
    const loadData = () => {
        const data = filmesDB[movieId] || filmesDB["guerra-civil"];
        const imgBackground = data.banner || data.bg || data.customCover || (data.ytTrailer ? `https://img.youtube.com/vi/${data.ytTrailer}/hqdefault.jpg` : generateAutoPosterDataUri(data.title, data.materia || data.genres, data.cast));
        const mHero = document.getElementById('m-hero');

        clearTimeout(trailerTimeout);
        isModalTrailerMuted = true;

        if (mHero) {
            mHero.classList.remove('trailer-playing', 'modal-hero-expanded', 'force-show-info');
            mHero.classList.toggle('has-trailer', !!(data.trailer || data.ytTrailer || data.ytPreview));
        }

        // Reseta o estado visual dos botões de controle flutuantes
        const btnSound = document.getElementById('m-btn-sound');
        const btnExpand = document.getElementById('m-btn-expand-trailer');
        const btnToggleInfo = document.getElementById('m-btn-toggle-info');
        if (btnSound) {
            btnSound.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            btnSound.classList.remove('active');
            btnSound.setAttribute('title', 'Ativar som');
        }
        if (btnExpand) {
            btnExpand.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>';
            btnExpand.classList.remove('active');
            btnExpand.setAttribute('title', 'Expandir trailer');
        }
        if (btnToggleInfo) {
            btnToggleInfo.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
            btnToggleInfo.classList.remove('active');
            btnToggleInfo.setAttribute('title', 'Ocultar textos na frente');
        }

        const videoEl = document.getElementById('m-trailer-video');
        const iframeEl = document.getElementById('m-trailer-iframe');
        if (videoEl) {
            videoEl.pause();
            videoEl.removeAttribute('src');
            videoEl.classList.remove('playing');
        }
        if (iframeEl) {
            iframeEl.removeAttribute('src');
            iframeEl.classList.remove('playing');
        }

        document.getElementById('m-title').innerHTML = data.title + (data.subtitle ? `<br><span class="modal-subtitle">${data.subtitle}</span>` : '');
        document.getElementById('m-hero').style.backgroundImage = `url('${imgUrl(imgBackground, 800)}'), linear-gradient(135deg, #222, #000)`;

        document.getElementById('m-match').textContent = data.match;
        document.getElementById('m-year').textContent = data.year;
        document.getElementById('m-age').textContent = data.age;
        document.getElementById('m-duration').textContent = data.duration;
        document.getElementById('m-synopsis').textContent = data.synopsis;
        
        // Elenco Clicável estilo Netflix (ao clicar no aluno, filtra seus trabalhos no acervo)
        const castContainer = document.getElementById('m-cast');
        if (castContainer) {
            if (data.cast && (data.materia || data.pdf || data.isMain)) {
                const authorsList = data.cast.split(/[,•|e]\s*/).map(a => a.trim()).filter(a => a.length > 1 && !a.startsWith('Turma') && !a.startsWith('equipe'));
                if (authorsList.length > 0) {
                    castContainer.innerHTML = authorsList.map(author => 
                        `<span class="cast-clickable-tag" onclick="window.filterAcervoByAuthor('${author.replace(/'/g, "\\'")}')" title="Ver todos os trabalhos de ${author}">${author}</span>`
                    ).join(', ');
                } else {
                    castContainer.textContent = data.cast;
                }
            } else {
                castContainer.textContent = data.cast;
            }
        }
        document.getElementById('m-genres').textContent = data.genres;
        document.getElementById('m-tags').textContent = data.tags;

        // Botões de ação (suporte a 2 botões: Apresentação/Trabalho + Trailer)
        const playBtn = document.getElementById('m-btn-play');
        const secBtn = document.getElementById('m-btn-secondary');

        if (data.isMain) {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Assistir Filme 3D';
            playBtn.onclick = function() {
                window.closeTitleModal(null, true);
                window.startCinematicMovie();
            };
            if (secBtn) {
                secBtn.innerHTML = '<i class="fa-solid fa-book-open"></i> Guia de Estudos';
                secBtn.onclick = function() {
                    window.closeTitleModal(null, true);
                    window.openResumoModal(true);
                };
                secBtn.style.display = 'inline-flex';
            }
        } else if (data.isSecurityPresentation) {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar Apresentação Interativa';
            playBtn.onclick = function() {
                window.closeTitleModal(null, true);
                window.openSecurityPresentation(0);
            };
            if (secBtn) {
                secBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Simulação S.O.C.';
                secBtn.onclick = function() {
                    window.closeTitleModal(null, true);
                    window.openSecurityPresentation(1);
                };
                secBtn.style.display = 'inline-flex';
            }
        } else if (data.hasNoPdf) {
            playBtn.innerHTML = '<i class="fa-solid fa-clock"></i> Trabalho em Breve';
            playBtn.onclick = function() {
                if (typeof window.showToastNotification === 'function') {
                    window.showToastNotification('Os slides em PDF deste trabalho literário ainda não foram enviados pelos alunos.');
                } else {
                    alert('Os slides em PDF deste trabalho literário ainda não foram enviados pelos alunos.');
                }
            };
            if (secBtn) {
                secBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Enviar Slides';
                secBtn.onclick = function() {
                    window.closeTitleModal(null, true);
                    if (typeof window.openSubmitWorkModal === 'function') {
                        window.openSubmitWorkModal();
                    } else if (typeof window.openUploadModal === 'function') {
                        window.openUploadModal();
                    }
                };
                secBtn.style.display = 'inline-flex';
            }
        } else if (data.pdf && (data.trailer || data.ytTrailer)) {
            // TÍTULO COM 2 BOTÕES: Apresentação da Turma + Trailer da Paródia
            playBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Abrir Apresentação';
            playBtn.onclick = function() {
                window.openPdfViewer(data.pdf, data.title, movieId);
            };
            if (secBtn) {
                secBtn.innerHTML = '<i class="fa-solid fa-clapperboard"></i> Assistir Trailer';
                secBtn.onclick = function() { watchModalTrailer(data); };
                secBtn.style.display = 'inline-flex';
            }
        } else if (data.pdf) {
            const isCanva = data.pdf && (data.pdf.includes('canva.') || data.pdf.includes('canva.link'));
            playBtn.innerHTML = isCanva ? '<i class="fa-solid fa-chalkboard-user"></i> Abrir no Canva' : '<i class="fa-solid fa-file-pdf"></i> Abrir Apresentação';
            playBtn.onclick = function() {
                window.openPdfViewer(data.pdf, data.title, movieId);
            };
            if (secBtn) secBtn.style.display = 'none';
        } else if (data.trailer || data.ytTrailer) {
            const isStudentVideo = !!(data.materia || (data.duration && (data.duration.includes('Vídeo') || data.duration.includes('Podcast'))));
            const btnLabel = isStudentVideo ? (data.duration && data.duration.includes('Podcast') ? 'Ouvir / Assistir Podcast' : 'Assistir Vídeo') : 'Assistir Trailer';
            playBtn.innerHTML = `<i class="fa-solid fa-play"></i> ${btnLabel}`;
            playBtn.onclick = function() { watchModalTrailer(data); };
            if (secBtn) secBtn.style.display = 'none';
        } else {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Em Breve';
            playBtn.onclick = null;
            if (secBtn) secBtn.style.display = 'none';
        }

        // Prévia do trailer ao abrir o modal: começa após 5s, expande o banner e liga o áudio
        // Se houver ytPreview configurado (ex: cena em Obsessão), toca o preview; senão o ytTrailer
        const previewId = data.ytPreview || data.ytTrailer;

        if (data.trailer) {
            trailerTimeout = setTimeout(() => {
                if (videoEl) {
                    videoEl.src = mediaUrl(data.trailer);
                    playWithFallback(videoEl).then(() => {
                        videoEl.classList.add('playing');
                        onModalTrailerStarted();
                        syncModalSoundButton(videoEl.muted);
                    });
                }
            }, MODAL_TRAILER_DELAY);
        } else if (previewId) {
            trailerTimeout = setTimeout(() => {
                if (iframeEl) {
                    resetYtState('modal');
                    modalAutoUnmute = true;
                    iframeEl.classList.remove('playing');
                    iframeEl.src = getYouTubeEmbedUrl(previewId, true);
                    // O iframe inicia com opacity: 0 para esconder o carregamento e o play nativo do YouTube.
                    // Revela suavemente após 2.2s de buffer no escuro atrás da capa:
                    setTimeout(() => {
                        if (iframeEl && iframeEl.getAttribute('src')) {
                            iframeEl.classList.add('playing');
                            onModalTrailerStarted();
                        }
                    }, 2200);
                }
            }, MODAL_TRAILER_DELAY);
        }

        // Abas estilo Netflix no Modal (Episódios, Títulos Semelhantes, Detalhes & Elenco)
        const modalMoreLike = document.querySelector('.modal-more-like');
        const seriesInfo = getSeriesForMovie(movieId);
        const mData = filmesDB[movieId] || {};

        // Gera recomendações (títulos semelhantes)
        const outros = Object.keys(filmesDB).filter(id => id !== movieId && (!seriesInfo || !seriesInfo.episodes.some(e => e.id === id)));
        const sorteados = outros.sort(() => 0.5 - Math.random()).slice(0, 6);
        const similarCardsHtml = sorteados.map(recId => {
            const recData = filmesDB[recId];
            const titulo = recData.title.length > 22 ? recData.title.substring(0, 22) + '...' : recData.title;
            return renderMovieCard(recId, Object.assign({}, recData, { title: titulo }), 300);
        }).join('');

        // Ficha técnica / Detalhes & Elenco
        const materiaNome = mData.materia || (seriesInfo ? seriesInfo.materia : 'Geral');
        const materiaSt = getMateriaStyle(materiaNome);
        const safeCast = mData.cast || 'Turma IFPI';
        const castMembers = safeCast.split(',').map(s => s.trim()).filter(Boolean);
        const castChips = castMembers.map(m => `
            <span class="materia-filter-pill" style="margin: 2px 4px 2px 0; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 5px; cursor: pointer;" onclick="window.filterAcervoByAuthor('${m.replace(/'/g, "\\'")}')">
                <i class="fa-solid fa-user-graduate" style="color: var(--netflix-red);"></i> ${m}
            </span>
        `).join('');

        const detailsHtml = `
            <div class="modal-details-grid">
                <div class="modal-details-item">
                    <h5><i class="fa-solid fa-book-bookmark" style="color: ${materiaSt.color}; margin-right: 6px;"></i> Matéria & Período</h5>
                    <p style="color: #fff; font-weight: 700; margin: 0 0 4px 0;">${materiaNome}</p>
                    <span style="color: #999; font-size: 0.85rem;">${mData.periodo || (seriesInfo ? seriesInfo.season : 'Acervo da Turma')}</span>
                </div>
                <div class="modal-details-item">
                    <h5><i class="fa-solid fa-user-group" style="color: #00d26a; margin-right: 6px;"></i> Integrantes do Trabalho</h5>
                    <div style="display: flex; flex-wrap: wrap; margin-top: 6px;">
                        ${castChips || '<span style="color:#aaa;">Turma IFPI</span>'}
                    </div>
                </div>
                <div class="modal-details-item">
                    <h5><i class="fa-solid fa-tags" style="color: #3b82f6; margin-right: 6px;"></i> Gêneros & Tópicos</h5>
                    <p style="color: #ddd; font-size: 0.9rem; margin: 0 0 6px 0;">${mData.genres || 'Trabalho Acadêmico'}</p>
                    <span style="color: #888; font-size: 0.82rem;">${mData.tags || ''}</span>
                </div>
                <div class="modal-details-item">
                    <h5><i class="fa-solid fa-circle-info" style="color: #ffd700; margin-right: 6px;"></i> Formato da Apresentação</h5>
                    <p style="color: #fff; font-size: 0.9rem; margin: 0;">${mData.duration || (seriesInfo ? seriesInfo.season : 'Apresentação')} &bull; ${mData.year || '2025/2026'}</p>
                    <span style="color: #888; font-size: 0.82rem;">Classificação: ${mData.age || 'Livre'}</span>
                </div>
            </div>
        `;

        if (modalMoreLike) {
            if (seriesInfo) {
                modalMoreLike.innerHTML = `
                    <div class="netflix-modal-tabs">
                        <button type="button" class="netflix-tab-btn active" data-tab="episodes" onclick="window.switchModalTab('episodes')">
                            <i class="fa-solid fa-list-ul"></i> Episódios
                        </button>
                        <button type="button" class="netflix-tab-btn" data-tab="similar" onclick="window.switchModalTab('similar')">
                            <i class="fa-solid fa-layer-group"></i> Títulos Semelhantes
                        </button>
                        <button type="button" class="netflix-tab-btn" data-tab="details" onclick="window.switchModalTab('details')">
                            <i class="fa-solid fa-circle-info"></i> Detalhes & Elenco
                        </button>
                    </div>
                    <div class="modal-tab-pane active" id="tab-pane-episodes">
                        <div class="series-episodes-header" style="margin-bottom: 18px;">
                            <div>
                                <span class="series-tag"><i class="fa-solid fa-layer-group"></i> SÉRIE ORIGINAL IFPI</span>
                                <h3 class="series-name">${seriesInfo.title}</h3>
                            </div>
                            <span class="series-season-badge">${seriesInfo.season || '1ª Temporada'} &bull; ${seriesInfo.episodes.length} Episódios</span>
                        </div>
                        <div class="episodes-list" id="m-recommendations">
                            ${renderSeriesEpisodesHtml(seriesInfo, movieId)}
                        </div>
                    </div>
                    <div class="modal-tab-pane" id="tab-pane-similar">
                        <div class="more-grid">
                            ${similarCardsHtml}
                        </div>
                    </div>
                    <div class="modal-tab-pane" id="tab-pane-details">
                        ${detailsHtml}
                    </div>
                `;
            } else {
                modalMoreLike.innerHTML = `
                    <div class="netflix-modal-tabs">
                        <button type="button" class="netflix-tab-btn active" data-tab="similar" onclick="window.switchModalTab('similar')">
                            <i class="fa-solid fa-layer-group"></i> Títulos Semelhantes
                        </button>
                        <button type="button" class="netflix-tab-btn" data-tab="details" onclick="window.switchModalTab('details')">
                            <i class="fa-solid fa-circle-info"></i> Detalhes & Elenco
                        </button>
                    </div>
                    <div class="modal-tab-pane active" id="tab-pane-similar">
                        <div class="more-grid" id="m-recommendations">
                            ${similarCardsHtml}
                        </div>
                    </div>
                    <div class="modal-tab-pane" id="tab-pane-details">
                        ${detailsHtml}
                    </div>
                `;
            }
        }
    };

    window.switchModalTab = function(tabName) {
        document.querySelectorAll('.netflix-tab-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
        });
        document.querySelectorAll('.modal-tab-pane').forEach(p => {
            p.classList.toggle('active', p.getAttribute('id') === 'tab-pane-' + tabName);
        });
    };

    // Animação de troca de título quando o modal já está aberto
    if (isOpen) {
        container.classList.add('modal-transitioning');
        overlay.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
            loadData();
            container.classList.remove('modal-transitioning');
        }, 300);
    } else {
        loadData();
        overlay.classList.add('show');
        overlay.scrollTop = 0;
    }
};

window.closeTitleModal = function(e, force = false) {
    if (force || (e && e.target.id === 'title-modal-overlay')) {
        document.getElementById('title-modal-overlay').classList.remove('show');
        document.body.classList.remove('modal-open');

        // Interrompe qualquer vídeo, iframe ou timeout ativo ao fechar
        clearTimeout(trailerTimeout);
        isModalTrailerMuted = true;

        const mHero = document.getElementById('m-hero');
        if (mHero) {
            mHero.classList.remove('trailer-playing', 'modal-hero-expanded', 'force-show-info', 'has-trailer');
        }

        const videoEl = document.getElementById('m-trailer-video');
        if (videoEl) {
            videoEl.pause();
            videoEl.removeAttribute('src');
            videoEl.classList.remove('playing');
        }
        const iframeEl = document.getElementById('m-trailer-iframe');
        if (iframeEl) {
            iframeEl.removeAttribute('src');
            iframeEl.classList.remove('playing');
        }

        if (document.fullscreenElement) { document.exitFullscreen(); }
    }
};

/* =========================================================
   PONTE COM O PLAYER DO YOUTUBE (postMessage / IFrame API)
   Lê tempo, duração e estado de som dos iframes e envia comandos,
   para que os controles exibidos sejam sempre os do IFPIFLIX.
   ========================================================= */
let isModalTrailerMuted = true;
let modalAutoUnmute = false;
const ytState = {
    modal: { time: 0, duration: 0, muted: true, state: -1 },
    main:  { time: 0, duration: 0, muted: false, state: -1 }
};

function resetYtState(key) {
    ytState[key] = { time: 0, duration: 0, muted: key === 'modal', state: -1 };
    if (key === 'main') updateYtControlsUI();
}

function ytIframe(key) {
    return document.getElementById(key === 'modal' ? 'm-trailer-iframe' : 'main-iframe-element');
}

function ytCommand(key, func, args = []) {
    const f = ytIframe(key);
    if (f && f.contentWindow && f.getAttribute('src')) {
        f.contentWindow.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    }
}

function ytListen(key) {
    const f = ytIframe(key);
    if (f && f.contentWindow && f.getAttribute('src')) {
        f.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*');
    }
}

window.addEventListener('DOMContentLoaded', () => {
    ['modal', 'main'].forEach(key => {
        const f = ytIframe(key);
        if (!f) return;
        f.addEventListener('load', () => {
            if (!f.getAttribute('src')) return;
            [0, 400, 1200, 2500].forEach(ms => setTimeout(() => ytListen(key), ms));
            if (key === 'modal' && modalAutoUnmute) {
                // O usuário já interagiu com o site (abriu o modal), então o navegador permite ligar o som
                [900, 1800, 3000].forEach(ms => setTimeout(() => {
                    if (modalAutoUnmute) ytCommand('modal', 'unMute');
                }, ms));
            }
        });
    });
});

window.addEventListener('message', (e) => {
    let key = null;
    const m = ytIframe('modal'), p = ytIframe('main');
    if (m && e.source === m.contentWindow) key = 'modal';
    else if (p && e.source === p.contentWindow) key = 'main';
    else return;

    let d;
    try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (err) { return; }
    if (!d) return;
    if (d.event === 'onReady') ytListen(key);
    const info = d.info;
    if (!info || (d.event !== 'infoDelivery' && d.event !== 'initialDelivery')) return;

    const st = ytState[key];
    if (typeof info.currentTime === 'number') st.time = info.currentTime;
    if (typeof info.duration === 'number' && info.duration > 0) st.duration = info.duration;
    if (typeof info.playerState === 'number') st.state = info.playerState;
    if (typeof info.muted === 'boolean') st.muted = info.muted;

    if (key === 'modal') {
        syncModalSoundButton(st.muted);
        // Revela o trailer no modal APENAS quando o vídeo estiver efetivamente tocando (state 1 = PLAYING ou time > 0.1s).
        // Isso elimina completamente o flash do botão de play e barra de título nativa do YouTube!
        const mIframe = ytIframe('modal');
        if (mIframe && mIframe.getAttribute('src') && !mIframe.classList.contains('playing')) {
            if (st.state === 1 || (typeof st.time === 'number' && st.time > 0.1)) {
                mIframe.classList.add('playing');
                onModalTrailerStarted();
            }
        }
    } else {
        const pIframe = ytIframe('main');
        if (pIframe && pIframe.style.opacity !== '1' && (st.state === 1 || (typeof st.time === 'number' && st.time > 0.1))) {
            pIframe.style.opacity = '1';
        }
        updateYtControlsUI();
    }
});

/* ---------- Controles do trailer no modal ---------- */
function syncModalSoundButton(muted) {
    isModalTrailerMuted = muted;
    const btn = document.getElementById('m-btn-sound');
    if (!btn) return;
    btn.innerHTML = muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    btn.classList.toggle('active', !muted);
    btn.setAttribute('title', muted ? 'Ativar áudio' : 'Silenciar áudio');
}

/* Quando o trailer começa: some o texto da frente, expande o banner e liga o áudio */
function onModalTrailerStarted() {
    const mHero = document.getElementById('m-hero');
    if (mHero) mHero.classList.add('trailer-playing', 'modal-hero-expanded');
    const btn = document.getElementById('m-btn-expand-trailer');
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>';
        btn.classList.add('active');
        btn.setAttribute('title', 'Recolher trailer');
    }
}

window.toggleModalTrailerSound = function(e) {
    if (e) e.stopPropagation();
    const videoEl = document.getElementById('m-trailer-video');
    const iframeEl = document.getElementById('m-trailer-iframe');
    const wantMuted = !isModalTrailerMuted;
    modalAutoUnmute = false; // o usuário assumiu o controle do som

    if (videoEl && videoEl.classList.contains('playing')) {
        videoEl.muted = wantMuted;
    }
    if (iframeEl && iframeEl.classList.contains('playing')) {
        ytCommand('modal', wantMuted ? 'mute' : 'unMute');
    }
    syncModalSoundButton(wantMuted);
    ytState.modal.muted = wantMuted;
    if (window.showToastNotification) {
        window.showToastNotification(wantMuted ? 'Áudio do trailer silenciado' : 'Áudio do trailer ativado!');
    }
};

/* "Assistir Trailer": continua do ponto em que a prévia estava (menos quando a prévia é outra cena, ex.: Obsessão) */
function watchModalTrailer(data) {
    const sameVideo = !data.ytPreview || data.ytPreview === data.ytTrailer;
    let startAt = 0;
    if (sameVideo) {
        if (data.ytTrailer) {
            const f = ytIframe('modal');
            if (f && f.getAttribute('src')) startAt = ytState.modal.time || 0;
        } else if (data.trailer) {
            const v = document.getElementById('m-trailer-video');
            if (v && v.getAttribute('src')) startAt = v.currentTime || 0;
        }
    }
    clearTimeout(trailerTimeout);
    if (data.ytTrailer) window.openVideoPlayer(data.ytTrailer, true, startAt, currentModalMovieId);
    else window.openVideoPlayer(mediaUrl(data.trailer), false, startAt, currentModalMovieId);
}

/* ---------- Controles personalizados do player em tela cheia ---------- */
let ytControlsTimer;
let isDraggingScrubber = false;
let scrubRatio = 0;

function fmtTime(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function updateYtControlsUI() {
    if (isDraggingScrubber) return; // Não sobrescreve durante o arrasto do usuário!
    const st = ytState.main;
    const fill = document.getElementById('ytc-fill');
    const time = document.getElementById('ytc-time');
    const play = document.getElementById('ytc-play');
    const mute = document.getElementById('ytc-mute');
    const overlay = document.getElementById('custom-video-player');
    if (fill) fill.style.width = (st.duration ? Math.min(100, (st.time / st.duration) * 100) : 0) + '%';
    if (time) time.textContent = fmtTime(st.time) + ' / ' + fmtTime(st.duration);
    if (play) play.innerHTML = st.state === 1 ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    if (mute) mute.innerHTML = st.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    if (overlay) {
        if (st.state === 2) overlay.classList.add('paused');
        else overlay.classList.remove('paused');
    }
    if (st.state === 0) {
        showVideoNextEpisodeButton();
    }
}

function pokeYtControls() {
    const overlay = document.getElementById('custom-video-player');
    if (!overlay) return;
    overlay.classList.add('show-controls');
    clearTimeout(ytControlsTimer);
    ytControlsTimer = setTimeout(() => {
        // Mantém a barra visível apenas se o vídeo estiver explicitamente pausado ou sendo arrastado
        const isPaused = (ytState.main.state === 2);
        const nativeVideo = document.getElementById('main-video-element');
        const isNativePaused = nativeVideo && nativeVideo.style.display !== 'none' && nativeVideo.paused;
        if (!isPaused && !isNativePaused && !isDraggingScrubber) {
            overlay.classList.remove('show-controls');
        }
    }, 2200);
}

window.ytMainTogglePlay = function(e) {
    if (e) e.stopPropagation();
    ytCommand('main', ytState.main.state === 1 ? 'pauseVideo' : 'playVideo');
    ytState.main.state = ytState.main.state === 1 ? 2 : 1;
    updateYtControlsUI();
    pokeYtControls();
};

window.ytMainToggleMute = function(e) {
    if (e) e.stopPropagation();
    ytCommand('main', ytState.main.muted ? 'unMute' : 'mute');
    ytState.main.muted = !ytState.main.muted;
    updateYtControlsUI();
    pokeYtControls();
};

/* Sistema de Arrastar e Clicar na Minutagem (Scrubber Drag & Seek com Pointer Capture) */
function setupScrubberEvents() {
    const bar = document.getElementById('ytc-progress');
    const overlay = document.getElementById('custom-video-player');
    if (!bar) return;

    function getRatio(e) {
        const rect = bar.getBoundingClientRect();
        const clientX = (e.clientX !== undefined) 
            ? e.clientX 
            : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    }

    function updateVisual(ratio) {
        const st = ytState.main;
        const fill = document.getElementById('ytc-fill');
        const time = document.getElementById('ytc-time');
        if (fill) fill.style.width = (ratio * 100) + '%';
        if (time && st.duration) time.textContent = fmtTime(ratio * st.duration) + ' / ' + fmtTime(st.duration);
    }

    function onPointerDown(e) {
        e.stopPropagation();
        e.preventDefault();
        const st = ytState.main;
        if (!st.duration) return;

        isDraggingScrubber = true;
        bar.classList.add('dragging');
        document.body.classList.add('scrubber-dragging');
        if (overlay) overlay.classList.add('scrubbing');

        try {
            if (bar.setPointerCapture && e.pointerId) {
                bar.setPointerCapture(e.pointerId);
            }
        } catch (err) {}

        scrubRatio = getRatio(e);
        updateVisual(scrubRatio);
        pokeYtControls();
    }

    function onPointerMove(e) {
        if (!isDraggingScrubber) return;
        e.stopPropagation();
        e.preventDefault();
        scrubRatio = getRatio(e);
        updateVisual(scrubRatio);
        pokeYtControls();
    }

    function onPointerUp(e) {
        if (!isDraggingScrubber) return;
        if (e) {
            e.stopPropagation();
            try {
                if (bar.hasPointerCapture && e.pointerId && bar.hasPointerCapture(e.pointerId)) {
                    bar.releasePointerCapture(e.pointerId);
                }
            } catch (err) {}
            scrubRatio = getRatio(e);
        }
        isDraggingScrubber = false;
        bar.classList.remove('dragging');
        document.body.classList.remove('scrubber-dragging');
        if (overlay) overlay.classList.remove('scrubbing');

        const st = ytState.main;
        if (st && st.duration) {
            st.time = scrubRatio * st.duration;
            ytCommand('main', 'seekTo', [st.time, true]);
            updateYtControlsUI();
        }
        pokeYtControls();
    }

    bar.addEventListener('pointerdown', onPointerDown);
    bar.addEventListener('pointermove', onPointerMove);
    bar.addEventListener('pointerup', onPointerUp);
    bar.addEventListener('pointercancel', onPointerUp);

    // Salvaguardas globais: se o ponteiro for solto em qualquer lugar da tela, limpa o arrasto imediatamente
    window.addEventListener('pointerup', (e) => {
        if (isDraggingScrubber) onPointerUp(e);
    });
    window.addEventListener('mouseup', (e) => {
        if (isDraggingScrubber) onPointerUp(e);
    });
}

window.startScrubberDrag = function(e) {
    if (e) e.stopPropagation();
};

window.ytMainSeek = function(e) {
    if (e) e.stopPropagation();
};

window.ytMainFullscreen = function(e) {
    if (e) e.stopPropagation();
    const overlay = document.getElementById('custom-video-player');
    if (!overlay) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (overlay.requestFullscreen) overlay.requestFullscreen().catch(() => {});
};

window.addEventListener('DOMContentLoaded', () => {
    setupScrubberEvents();
    const overlay = document.getElementById('custom-video-player');
    if (!overlay) return;
    overlay.addEventListener('mousemove', pokeYtControls);
    overlay.addEventListener('touchstart', pokeYtControls, { passive: true });
    overlay.addEventListener('mouseleave', () => {
        const isPaused = (ytState.main.state === 2);
        const nativeVideo = document.getElementById('main-video-element');
        const isNativePaused = nativeVideo && nativeVideo.style.display !== 'none' && nativeVideo.paused;
        if (!isPaused && !isNativePaused) {
            overlay.classList.remove('show-controls');
        }
    });
    overlay.addEventListener('click', (e) => {
        if (!overlay.classList.contains('yt-mode')) return;
        if (e.target.closest('#custom-yt-controls') || e.target.closest('.close-video-btn')) return;
        window.ytMainTogglePlay(e);
    });
});

document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('custom-video-player');
    if (!overlay || !overlay.classList.contains('show') || !overlay.classList.contains('yt-mode')) return;
    if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        window.ytMainTogglePlay(e);
    } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        window.ytMainToggleMute(e);
    } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        window.ytMainFullscreen(e);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const st = ytState.main;
        const newTime = Math.max(0, (st.time || 0) - 5);
        st.time = newTime;
        ytCommand('main', 'seekTo', [newTime, true]);
        updateYtControlsUI();
        pokeYtControls();
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const st = ytState.main;
        const newTime = Math.min(st.duration || 9999, (st.time || 0) + 5);
        st.time = newTime;
        ytCommand('main', 'seekTo', [newTime, true]);
        updateYtControlsUI();
        pokeYtControls();
    } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
            const pdfViewer = document.getElementById('custom-pdf-viewer');
            if (pdfViewer && pdfViewer.classList.contains('show')) {
                window.closePdfViewer();
                return;
            }
            const submitModal = document.getElementById('submit-work-modal');
            if (submitModal && submitModal.classList.contains('show')) {
                window.closeSubmitWorkModal(null, true);
                return;
            }
            window.closeVideoPlayer();
        }
    }
});

window.toggleModalTrailerExpand = function(e) {
    if (e) e.stopPropagation();
    const mHero = document.getElementById('m-hero');
    const btn = document.getElementById('m-btn-expand-trailer');
    if (!mHero) return;

    const isExpanded = mHero.classList.toggle('modal-hero-expanded');
    if (btn) {
        btn.innerHTML = isExpanded 
            ? '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>' 
            : '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>';
        btn.classList.toggle('active', isExpanded);
        btn.setAttribute('title', isExpanded ? 'Recolher trailer' : 'Expandir trailer');
    }
    if (window.showToastNotification) {
        window.showToastNotification(isExpanded ? 'Modo Expandido ativado' : 'Tamanho padrão restaurado');
    }
};

window.toggleModalTrailerInfo = function(e) {
    if (e) e.stopPropagation();
    const mHero = document.getElementById('m-hero');
    const btn = document.getElementById('m-btn-toggle-info');
    if (!mHero) return;

    const isForced = mHero.classList.toggle('force-show-info');
    if (btn) {
        btn.innerHTML = isForced 
            ? '<i class="fa-solid fa-eye"></i>' 
            : '<i class="fa-solid fa-eye-slash"></i>';
        btn.classList.toggle('active', isForced);
        btn.setAttribute('title', isForced ? 'Ocultar textos na frente' : 'Exibir textos na frente');
    }
};

window.closeVideoPlayer = function(e, suppressReopen = false) {
    const overlay = document.getElementById('custom-video-player');
    const video = document.getElementById('main-video-element');
    const iframe = document.getElementById('main-iframe-element');
    const curtain = document.getElementById('ytc-curtain');
    const nextVideoEpBtn = document.getElementById('video-next-episode-btn');
    if (nextVideoEpBtn) nextVideoEpBtn.style.display = 'none';
    if (curtain) curtain.classList.remove('active');
    if (video) {
        video.pause();
        video.removeAttribute('src');
    }
    if (iframe) {
        iframe.removeAttribute('src');
        iframe.style.display = 'none';
        iframe.style.opacity = '0';
    }
    isDraggingScrubber = false;
    const bar = document.getElementById('ytc-progress');
    if (bar) bar.classList.remove('dragging');
    document.body.classList.remove('scrubber-dragging');
    if (overlay) overlay.classList.remove('scrubbing');
    resetYtState('main');
    if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
    if (overlay) overlay.classList.remove('show', 'yt-mode', 'show-controls');
    if (!suppressReopen && currentModalMovieId) {
        setTimeout(() => {
            window.openTitleModal(currentModalMovieId);
        }, 180);
    }
};

function showVideoNextEpisodeButton() {
    const nextBtn = document.getElementById('video-next-episode-btn');
    if (!nextBtn) return;
    const currentId = currentPlayingMovieId || currentModalMovieId;
    const sInfo = getSeriesForMovie(currentId);
    if (sInfo) {
        const epIdx = sInfo.episodes.findIndex(e => e.id === currentId);
        if (epIdx >= 0 && epIdx < sInfo.episodes.length - 1) {
            const nextEp = sInfo.episodes[epIdx + 1];
            const nextData = filmesDB[nextEp.id] || nextEp;
            nextBtn.innerHTML = `
                <div class="next-ep-left">
                    <span class="next-ep-label">Próximo Episódio (Ep. ${epIdx + 2})</span>
                    <span class="next-ep-title">${nextData.title}</span>
                </div>
                <div class="next-ep-icon"><i class="fa-solid fa-forward-step"></i></div>
            `;
            nextBtn.style.display = 'flex';
            return;
        }
    }
    nextBtn.style.display = 'none';
}

        // Listener de Segurança: Pausa o vídeo caso o usuário aperte ESC para sair da tela cheia
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                const videoEl = document.getElementById('m-trailer-video');
                if (videoEl) videoEl.pause();
            }
        });

        function isModalOpen() {
            const idle = document.getElementById('idle-overlay');
            const lis = document.getElementById('lis-dark-overlay');
            return (idle && idle.style.display === 'flex') || (lis && lis.style.display === 'block');
        }

        window.setActiveNavCategory = function(cat) {
            document.querySelectorAll('.nav-cat-item').forEach(it => {
                it.classList.toggle('active', it.dataset.cat === cat);
            });
        };

        window.switchScreen = function(id, syncNav = true) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const target = document.getElementById(id);
            if (target) target.classList.add('active');

            if (syncNav) {
                if (id === 'home-screen') {
                    window.setActiveNavCategory('inicio');
                } else if (id === 'acervo-screen') {
                    window.setActiveNavCategory('trabalhos');
                } else {
                    window.setActiveNavCategory('');
                }
            }

            // Gerencia o HUD Epistemológico
            const hud = document.getElementById('epistemic-hud');
            if (hud) {
                if (id === 'cinematic-stage') {
                    // HUD será ativado pela updateCineCamera
                } else {
                    hud.classList.remove('active');
                }
            }

            if (id !== 'player-screen' && id !== 'cinematic-stage') {
                const idle = document.getElementById('idle-overlay');
                if (idle) idle.style.display = 'none';
                isLisActive = false;

                // Limpa os intervalos para não travar a memória
                // Limpa os intervalos para não travar a memória e oculta o toast de turno
                clearInterval(tickerIntervalC);
                clearInterval(tickerIntervalM);
                clearTimeout(toastTimeout);
                const toastEl = document.getElementById('turn-toast');
                if (toastEl) toastEl.classList.remove('show');
                if (typeof currentPresenter !== 'undefined') {
                    currentPresenter = "";
                }
            }

            if (id === 'acervo-screen') {
                if (typeof window.resumeAcervoHeroTimer === 'function') window.resumeAcervoHeroTimer();
            } else {
                if (typeof window.pauseAcervoHeroTimer === 'function') window.pauseAcervoHeroTimer();
            }

            if (id === 'home-screen') {
                renderContinueWatching();
            }
        }
        
        /* =========================================================
           GERENCIAMENTO DE PERFIS DA TURMA E CUSTOMIZADOS
           ========================================================= */
        const DEFAULT_PROFILES = [
            { name: "Admin", icon: "fa-solid fa-user-shield", bgClass: "av-admin" },
            { name: "Turma IFPI", icon: "fa-solid fa-graduation-cap", bgClass: "av-turma" },
            { name: "Professor(a)", icon: "fa-solid fa-chalkboard-user", bgClass: "av-prof" },
            { name: "Visitante", icon: "fa-solid fa-masks-theater", bgClass: "av-visitante" }
        ];

        function getCustomProfiles() {
            try {
                const raw = localStorage.getItem('ifpiflix_custom_profiles');
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        }

        function saveCustomProfiles(list) {
            try {
                localStorage.setItem('ifpiflix_custom_profiles', JSON.stringify(list));
            } catch (e) {
                console.warn("Erro ao salvar perfis customizados:", e);
            }
        }

        window.renderProfiles = function() {
            const container = document.getElementById('profiles-container');
            if (!container) return;
            const custom = getCustomProfiles();
            const allProfiles = [...DEFAULT_PROFILES, ...custom];

            let html = allProfiles.map(p => `
                <button type="button" class="profile-card" data-profile="${p.name}">
                    <div class="avatar ${p.bgClass}">${p.icon ? `<i class="${p.icon}"></i>` : ''}</div>
                    <span>${p.name}</span>
                </button>
            `).join('');

            html += `
                <button type="button" class="profile-card profile-card-add" id="btn-add-profile" onclick="window.openAddProfileModal()" aria-label="Adicionar Perfil">
                    <div class="avatar av-add"><i class="fa-solid fa-plus"></i></div>
                    <span>Adicionar Perfil</span>
                </button>
            `;
            container.innerHTML = html;
        };

        let selectedAvatarTheme = { color: 'red', icon: 'fa-solid fa-user', class: 'av-theme-red' };

        window.openAddProfileModal = function() {
            const overlay = document.getElementById('add-profile-modal');
            const input = document.getElementById('new-profile-name');
            if (input) input.value = '';
            if (overlay) overlay.classList.add('show');
            setTimeout(() => { if (input) input.focus(); }, 150);
        };

        window.closeAddProfileModal = function(e, force) {
            if (force || (e && e.target.id === 'add-profile-modal')) {
                const overlay = document.getElementById('add-profile-modal');
                if (overlay) overlay.classList.remove('show');
            }
        };

        window.saveNewProfile = function() {
            const input = document.getElementById('new-profile-name');
            const name = input ? input.value.trim() : '';
            if (!name) {
                if (input) input.focus();
                return;
            }
            const custom = getCustomProfiles();
            if (custom.some(p => p.name.toLowerCase() === name.toLowerCase()) || 
                DEFAULT_PROFILES.some(p => p.name.toLowerCase() === name.toLowerCase())) {
                window.showToastNotification('Este nome de perfil já existe!');
                return;
            }
            custom.push({
                name: name,
                icon: selectedAvatarTheme.icon,
                bgClass: selectedAvatarTheme.class
            });
            saveCustomProfiles(custom);
            window.renderProfiles();
            window.closeAddProfileModal(null, true);
            window.selectProfile(name);
            window.showToastNotification(`Perfil "${name}" criado com sucesso!`);
        };

        function initAvatarPicker() {
            const btns = document.querySelectorAll('.avatar-opt-btn');
            const preview = document.getElementById('profile-preview-avatar');
            btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    btns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const color = btn.dataset.color || 'red';
                    const icon = btn.dataset.icon || 'fa-solid fa-user';
                    selectedAvatarTheme = {
                        color: color,
                        icon: icon,
                        class: `av-theme-${color}`
                    };
                    if (preview) {
                        preview.className = `avatar av-custom-preview av-theme-${color}`;
                        preview.innerHTML = `<i class="${icon}"></i>`;
                    }
                });
            });
        }

        let pendingMovieParam = null;
        let pendingScreenParam = null;
        let pendingMateriaParam = null;
        let pendingSeminarioParam = null;
        let pendingViewParam = null;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            pendingMovieParam = urlParams.get('filme');
            pendingScreenParam = urlParams.get('screen') || urlParams.get('tela');
            pendingMateriaParam = urlParams.get('materia');
            pendingSeminarioParam = urlParams.get('seminario');
            pendingViewParam = urlParams.get('view');
        } catch(e) {}

        window.selectProfile = function(name) {
            activeProfile = name; 
            document.querySelectorAll('.nav-profile-name').forEach(el => { el.textContent = name; });
            const oldNameEl = document.getElementById('nav-profile-name');
            if (oldNameEl) oldNameEl.textContent = name; 
            if (pendingScreenParam === 'acervo' || pendingScreenParam === 'trabalhos') {
                pendingScreenParam = null;
                if (pendingViewParam) currentAcervoViewMode = pendingViewParam;
                if (pendingSeminarioParam) {
                    window.openAcervoScreen(pendingMateriaParam || undefined);
                    window.openSeminarioView(pendingSeminarioParam);
                } else {
                    window.openAcervoScreen(pendingMateriaParam || undefined);
                }
            } else {
                window.switchScreen('home-screen');
            }
            renderContinueWatching();
            updateTeacherUi(name);
            if (pendingMovieParam && filmesDB[pendingMovieParam]) {
                const target = pendingMovieParam;
                pendingMovieParam = null;
                setTimeout(() => {
                    window.openTitleModal(target);
                }, 300);
            }
        };

        /* =========================================================
           FEATURE 4: MENU DE CATEGORIAS NO TOPO (ESTILO NETFLIX)
           ========================================================= */
        window.filterNavCategory = function(cat) {
            window.setActiveNavCategory(cat);
            
            if (cat === 'trabalhos') {
                window.openAcervoScreen();
                return;
            }

            const homeScreen = document.getElementById('home-screen');
            if (!homeScreen) return;
            if (!homeScreen.classList.contains('active')) {
                window.switchScreen('home-screen', false);
            }
            
            if (cat === 'inicio') {
                homeScreen.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (cat === 'top5') {
                const el = document.getElementById('top5-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (cat === 'filosofia') {
                const el = document.getElementById('filosofia-row');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (cat === 'ti') {
                const el = document.getElementById('ti-row');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else if (cat === 'minha-lista') {
                const el = document.getElementById('minha-lista-container');
                if (el && el.style.display !== 'none') {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    window.showToastNotification('Sua lista está vazia! Adicione filmes com o botão (+)');
                }
            }
        };

        /* =========================================================
           FEATURE 2: LEITOR NATIVO DE SLIDES (ESTILO NETFLIX) & PDF IN-SITE
           ========================================================= */
        const SLIDES_MANIFEST = {
            "prosa_1930": [
                "midia/slides/prosa_1930/slide_01.jpg", "midia/slides/prosa_1930/slide_02.jpg", "midia/slides/prosa_1930/slide_03.jpg",
                "midia/slides/prosa_1930/slide_04.jpg", "midia/slides/prosa_1930/slide_05.jpg", "midia/slides/prosa_1930/slide_06.jpg",
                "midia/slides/prosa_1930/slide_07.jpg", "midia/slides/prosa_1930/slide_08.jpg", "midia/slides/prosa_1930/slide_09.jpg",
                "midia/slides/prosa_1930/slide_10.jpg", "midia/slides/prosa_1930/slide_11.jpg"
            ],
            "memoria_cache": [
                "midia/slides/memoria_cache/slide_01.jpg", "midia/slides/memoria_cache/slide_02.jpg", "midia/slides/memoria_cache/slide_03.jpg",
                "midia/slides/memoria_cache/slide_04.jpg", "midia/slides/memoria_cache/slide_05.jpg", "midia/slides/memoria_cache/slide_06.jpg"
            ],
            "evolucao_computadores": [
                "midia/slides/evolucao_computadores/slide_01.jpg", "midia/slides/evolucao_computadores/slide_02.jpg", "midia/slides/evolucao_computadores/slide_03.jpg",
                "midia/slides/evolucao_computadores/slide_04.jpg", "midia/slides/evolucao_computadores/slide_05.jpg", "midia/slides/evolucao_computadores/slide_06.jpg",
                "midia/slides/evolucao_computadores/slide_07.jpg", "midia/slides/evolucao_computadores/slide_08.jpg", "midia/slides/evolucao_computadores/slide_09.jpg"
            ],
            "guerra_fria": [
                "midia/slides/guerra_fria/slide_01.jpg", "midia/slides/guerra_fria/slide_02.jpg", "midia/slides/guerra_fria/slide_03.jpg",
                "midia/slides/guerra_fria/slide_04.jpg", "midia/slides/guerra_fria/slide_05.jpg", "midia/slides/guerra_fria/slide_06.jpg",
                "midia/slides/guerra_fria/slide_07.jpg", "midia/slides/guerra_fria/slide_08.jpg", "midia/slides/guerra_fria/slide_09.jpg",
                "midia/slides/guerra_fria/slide_10.jpg", "midia/slides/guerra_fria/slide_11.jpg", "midia/slides/guerra_fria/slide_12.jpg",
                "midia/slides/guerra_fria/slide_13.jpg", "midia/slides/guerra_fria/slide_14.jpg", "midia/slides/guerra_fria/slide_15.jpg"
            ],
            "sargento_milicias": [
                "midia/slides/sargento_milicias/slide_01.jpg", "midia/slides/sargento_milicias/slide_02.jpg", "midia/slides/sargento_milicias/slide_03.jpg",
                "midia/slides/sargento_milicias/slide_04.jpg", "midia/slides/sargento_milicias/slide_05.jpg", "midia/slides/sargento_milicias/slide_06.jpg"
            ],
            "padre_amaro_jogo": [
                "midia/slides/padre_amaro_jogo/slide_01.jpg", "midia/slides/padre_amaro_jogo/slide_02.jpg", "midia/slides/padre_amaro_jogo/slide_03.jpg",
                "midia/slides/padre_amaro_jogo/slide_04.jpg", "midia/slides/padre_amaro_jogo/slide_05.jpg", "midia/slides/padre_amaro_jogo/slide_06.jpg"
            ],
            "padre_amaro": [
                "midia/slides/padre_amaro/slide_01.jpg", "midia/slides/padre_amaro/slide_02.jpg", "midia/slides/padre_amaro/slide_03.jpg",
                "midia/slides/padre_amaro/slide_04.jpg", "midia/slides/padre_amaro/slide_05.jpg", "midia/slides/padre_amaro/slide_06.jpg",
                "midia/slides/padre_amaro/slide_07.jpg", "midia/slides/padre_amaro/slide_08.jpg", "midia/slides/padre_amaro/slide_09.jpg",
                "midia/slides/padre_amaro/slide_10.jpg"
            ],
            "sociologia_desenvolvimento": [
                "midia/slides/sociologia_desenvolvimento/slide_01.jpg", "midia/slides/sociologia_desenvolvimento/slide_02.jpg", "midia/slides/sociologia_desenvolvimento/slide_03.jpg",
                "midia/slides/sociologia_desenvolvimento/slide_04.jpg", "midia/slides/sociologia_desenvolvimento/slide_05.jpg", "midia/slides/sociologia_desenvolvimento/slide_06.jpg",
                "midia/slides/sociologia_desenvolvimento/slide_07.jpg", "midia/slides/sociologia_desenvolvimento/slide_08.jpg", "midia/slides/sociologia_desenvolvimento/slide_09.jpg",
                "midia/slides/sociologia_desenvolvimento/slide_10.jpg"
            ],
            "teorias_politicas": [
                "midia/slides/teorias_politicas/slide_01.jpg", "midia/slides/teorias_politicas/slide_02.jpg", "midia/slides/teorias_politicas/slide_03.jpg",
                "midia/slides/teorias_politicas/slide_04.jpg", "midia/slides/teorias_politicas/slide_05.jpg", "midia/slides/teorias_politicas/slide_06.jpg",
                "midia/slides/teorias_politicas/slide_07.jpg", "midia/slides/teorias_politicas/slide_08.jpg", "midia/slides/teorias_politicas/slide_09.jpg",
                "midia/slides/teorias_politicas/slide_10.jpg", "midia/slides/teorias_politicas/slide_11.jpg", "midia/slides/teorias_politicas/slide_12.jpg",
                "midia/slides/teorias_politicas/slide_13.jpg"
            ],
            "jogo_transito": [
                "midia/slides/jogo_transito/slide_01.jpg", "midia/slides/jogo_transito/slide_02.jpg", "midia/slides/jogo_transito/slide_03.jpg"
            ],
            "ia_ingles": [
                "midia/slides/ia_ingles/slide_01.jpg", "midia/slides/ia_ingles/slide_02.jpg", "midia/slides/ia_ingles/slide_03.jpg",
                "midia/slides/ia_ingles/slide_04.jpg", "midia/slides/ia_ingles/slide_05.jpg", "midia/slides/ia_ingles/slide_06.jpg",
                "midia/slides/ia_ingles/slide_07.jpg", "midia/slides/ia_ingles/slide_08.jpg", "midia/slides/ia_ingles/slide_09.jpg",
                "midia/slides/ia_ingles/slide_10.jpg", "midia/slides/ia_ingles/slide_11.jpg"
            ]
        };

        let currentActiveSlides = [];
        let currentSlideIndex = 0;
        let isNativeSlideMode = true;
        let currentPlayingMovieId = null;

        window.openPdfViewer = function(pdfUrl, title = 'Apresentação da Turma', movieId = null) {
            if (pdfUrl.includes('canva.') || pdfUrl.includes('canva.link')) {
                window.open(pdfUrl, '_blank');
                return;
            }
            window.closeTitleModal(null, true);
            const viewer = document.getElementById('custom-pdf-viewer');
            const iframe = document.getElementById('main-pdf-iframe');
            const titleEl = document.getElementById('pdf-viewer-title');
            const extLink = document.getElementById('pdf-external-link');
            const stage = document.getElementById('netflix-slide-stage');
            const iframeBody = document.getElementById('pdf-iframe-body');
            const slideCounter = document.getElementById('pdf-slide-counter');
            const toggleBtn = document.getElementById('pdf-mode-toggle');
            if (!viewer) return;
            
            const resolvedUrl = mediaUrl(pdfUrl);
            if (titleEl) titleEl.textContent = title;
            if (extLink) extLink.href = resolvedUrl;

            // Encontra se tem slides nativos
            let slideKey = null;
            if (movieId && filmesDB[movieId]?.slideKey) {
                slideKey = filmesDB[movieId].slideKey;
            } else {
                for (const k in filmesDB) {
                    if (filmesDB[k].pdf === pdfUrl) {
                        movieId = k;
                        if (filmesDB[k].slideKey) slideKey = filmesDB[k].slideKey;
                        break;
                    }
                }
            }

            currentPlayingMovieId = movieId || currentModalMovieId;

            if (slideKey && SLIDES_MANIFEST[slideKey] && SLIDES_MANIFEST[slideKey].length > 0) {
                currentActiveSlides = SLIDES_MANIFEST[slideKey];
                currentSlideIndex = 0;
                isNativeSlideMode = true;
                if (stage) stage.style.display = 'flex';
                if (iframeBody) iframeBody.style.display = 'none';
                if (slideCounter) slideCounter.style.display = 'inline-block';
                if (toggleBtn) {
                    toggleBtn.style.display = 'inline-flex';
                    toggleBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> <span style="font-size: 0.8rem; margin-left: 4px;">PDF Original</span>';
                }
                const thumbsBtn = document.getElementById('pdf-thumbnails-toggle');
                if (thumbsBtn) thumbsBtn.style.display = 'inline-flex';
                updateSlideViewer();
            } else {
                // Modo PDF clássico (para uploads sem slides pré-renderizados)
                currentActiveSlides = [];
                isNativeSlideMode = false;
                if (stage) stage.style.display = 'none';
                if (iframeBody) iframeBody.style.display = 'block';
                if (slideCounter) slideCounter.style.display = 'none';
                if (toggleBtn) toggleBtn.style.display = 'none';
                const thumbsBtn = document.getElementById('pdf-thumbnails-toggle');
                if (thumbsBtn) thumbsBtn.style.display = 'none';
                if (iframe) iframe.src = resolvedUrl;
            }

            viewer.classList.add('show');
        };

        function updateSlideViewer() {
            if (!currentActiveSlides.length) return;
            const imgEl = document.getElementById('netflix-slide-img');
            const counter = document.getElementById('pdf-slide-counter');
            const fill = document.getElementById('slide-progress-fill');
            const prevBtn = document.getElementById('slide-btn-prev');
            const nextBtn = document.getElementById('slide-btn-next');

            if (imgEl) {
                imgEl.style.opacity = '0.5';
                imgEl.onload = () => { imgEl.style.opacity = '1'; };
                imgEl.src = currentActiveSlides[currentSlideIndex];
            }

            if (counter) {
                counter.textContent = `Slide ${currentSlideIndex + 1} de ${currentActiveSlides.length}`;
            }

            if (fill) {
                const pct = Math.round(((currentSlideIndex + 1) / currentActiveSlides.length) * 100);
                fill.style.width = `${pct}%`;
                if (currentPlayingMovieId) {
                    try {
                        localStorage.setItem('ifpiflix_progress_' + currentPlayingMovieId, pct);
                    } catch (e) {}
                }
            }

            if (prevBtn) prevBtn.style.opacity = currentSlideIndex === 0 ? '0.3' : '1';
            if (nextBtn) nextBtn.style.opacity = currentSlideIndex === currentActiveSlides.length - 1 ? '0.3' : '1';

            // Botão Netflix de Próximo Episódio no último slide
            const nextSlideEpBtn = document.getElementById('slide-next-episode-btn');
            if (nextSlideEpBtn) {
                const sInfo = getSeriesForMovie(currentPlayingMovieId);
                const isLastSlide = currentActiveSlides.length > 1 && currentSlideIndex === currentActiveSlides.length - 1;
                if (sInfo && isLastSlide) {
                    const epIdx = sInfo.episodes.findIndex(e => e.id === currentPlayingMovieId);
                    if (epIdx >= 0 && epIdx < sInfo.episodes.length - 1) {
                        const nextEp = sInfo.episodes[epIdx + 1];
                        const nextData = filmesDB[nextEp.id] || nextEp;
                        nextSlideEpBtn.innerHTML = `
                            <div class="next-ep-left">
                                <span class="next-ep-label">Próximo Episódio (Ep. ${epIdx + 2})</span>
                                <span class="next-ep-title">${nextData.title}</span>
                            </div>
                            <div class="next-ep-icon"><i class="fa-solid fa-forward-step"></i></div>
                        `;
                        nextSlideEpBtn.style.display = 'flex';
                    } else {
                        nextSlideEpBtn.style.display = 'none';
                    }
                } else {
                    nextSlideEpBtn.style.display = 'none';
                }
            }
        }

        window.navSlide = function(delta) {
            if (!currentActiveSlides.length) return;
            const target = currentSlideIndex + delta;
            if (target >= 0 && target < currentActiveSlides.length) {
                currentSlideIndex = target;
                updateSlideViewer();
            }
        };

        /* =========================================================
           FEATURE 7: GRADE DE MINIATURAS (VISÃO GERAL DO SLIDE)
           ========================================================= */
        window.toggleSlideThumbnailsModal = function() {
            const overlay = document.getElementById('slide-thumbnails-overlay');
            if (!overlay) return;
            if (overlay.classList.contains('show')) {
                window.closeSlideThumbnailsModal(null, true);
                return;
            }

            if (!currentActiveSlides || !currentActiveSlides.length) {
                window.showToastNotification('Este trabalho não possui miniaturas nativas de slides.');
                return;
            }

            const grid = document.getElementById('slide-thumbnails-grid');
            if (grid) {
                grid.innerHTML = currentActiveSlides.map((url, idx) => `
                    <div class="slide-thumb-card ${idx === currentSlideIndex ? 'active' : ''}" onclick="window.jumpToSlideThumbnail(${idx})" role="button" tabindex="0" aria-label="Slide ${idx + 1}">
                        <div class="slide-thumb-img-wrapper">
                            <span class="slide-thumb-number">${String(idx + 1).padStart(2, '0')}</span>
                            <img src="${url}" alt="Slide ${idx + 1}" loading="lazy">
                        </div>
                        <div class="slide-thumb-label">Slide ${idx + 1}</div>
                    </div>
                `).join('');
            }
            overlay.classList.add('show');
        };

        window.closeSlideThumbnailsModal = function(e, force = false) {
            if (force || (e && (e.target.id === 'slide-thumbnails-overlay' || e.target.closest('.slide-thumbnails-close-btn')))) {
                const overlay = document.getElementById('slide-thumbnails-overlay');
                if (overlay) overlay.classList.remove('show');
            }
        };

        window.jumpToSlideThumbnail = function(idx) {
            if (idx >= 0 && idx < currentActiveSlides.length) {
                currentSlideIndex = idx;
                updateSlideViewer();
                window.closeSlideThumbnailsModal(null, true);
            }
        };

        window.togglePdfViewerMode = function() {
            const stage = document.getElementById('netflix-slide-stage');
            const iframeBody = document.getElementById('pdf-iframe-body');
            const iframe = document.getElementById('main-pdf-iframe');
            const toggleBtn = document.getElementById('pdf-mode-toggle');
            const thumbsBtn = document.getElementById('pdf-thumbnails-toggle');
            const slideCounter = document.getElementById('pdf-slide-counter');
            const extLink = document.getElementById('pdf-external-link');

            isNativeSlideMode = !isNativeSlideMode;
            if (isNativeSlideMode) {
                if (stage) stage.style.display = 'flex';
                if (iframeBody) iframeBody.style.display = 'none';
                if (slideCounter) slideCounter.style.display = 'inline-block';
                if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> <span style="font-size: 0.8rem; margin-left: 4px;">PDF Original</span>';
                if (thumbsBtn) thumbsBtn.style.display = 'inline-flex';
            } else {
                if (stage) stage.style.display = 'none';
                if (iframeBody) iframeBody.style.display = 'block';
                if (slideCounter) slideCounter.style.display = 'none';
                if (toggleBtn) toggleBtn.innerHTML = '<i class="fa-solid fa-file-powerpoint"></i> <span style="font-size: 0.8rem; margin-left: 4px;">Leitor Nativo</span>';
                if (thumbsBtn) thumbsBtn.style.display = 'none';
                if (iframe && extLink && (!iframe.src || iframe.src === 'about:blank')) {
                    iframe.src = extLink.href;
                }
            }
        };

        // Teclado para navegação do Player de Slides (setas esquerda e direita e G para grade)
        document.addEventListener('keydown', (e) => {
            const viewer = document.getElementById('custom-pdf-viewer');
            if (!viewer || !viewer.classList.contains('show')) return;

            const thumbsOverlay = document.getElementById('slide-thumbnails-overlay');
            if (thumbsOverlay && thumbsOverlay.classList.contains('show')) {
                if (e.key === 'Escape') {
                    window.closeSlideThumbnailsModal(null, true);
                    return;
                }
            }

            if (!isNativeSlideMode || !currentActiveSlides.length) return;

            if (e.key === 'g' || e.key === 'G') {
                e.preventDefault();
                window.toggleSlideThumbnailsModal();
            } else if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                window.navSlide(1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                window.navSlide(-1);
            } else if (e.key === 'Escape') {
                window.closePdfViewer();
            }
        });

        window.closePdfViewer = function(e, suppressReopen = false) {
            window.closeSlideThumbnailsModal(null, true);
            const viewer = document.getElementById('custom-pdf-viewer');
            const iframe = document.getElementById('main-pdf-iframe');
            const nextSlideEpBtn = document.getElementById('slide-next-episode-btn');
            if (nextSlideEpBtn) nextSlideEpBtn.style.display = 'none';
            if (iframe) iframe.src = 'about:blank';
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            if (viewer) viewer.classList.remove('show');
            if (!suppressReopen && currentModalMovieId) {
                setTimeout(() => {
                    window.openTitleModal(currentModalMovieId);
                }, 150);
            }
        };

        window.playNextEpisode = function() {
            const currentId = currentPlayingMovieId || currentModalMovieId;
            const sInfo = getSeriesForMovie(currentId);
            if (!sInfo) return;
            const epIdx = sInfo.episodes.findIndex(e => e.id === currentId);
            if (epIdx >= 0 && epIdx < sInfo.episodes.length - 1) {
                const nextEp = sInfo.episodes[epIdx + 1];
                const nextData = filmesDB[nextEp.id];
                
                // Fecha players atuais sem reabrir modal antigo
                window.closePdfViewer(null, true);
                window.closeVideoPlayer(null, true);

                currentModalMovieId = nextEp.id;
                currentPlayingMovieId = nextEp.id;

                if (nextData && nextData.hasNoPdf) {
                    window.openTitleModal(nextEp.id);
                    if (typeof window.showToastNotification === 'function') {
                        window.showToastNotification(`O próximo episódio ("${nextData.title}") está aguardando envio do PDF.`);
                    }
                } else if (nextData && nextData.pdf) {
                    window.openPdfViewer(nextData.pdf, nextData.title, nextEp.id);
                    if (typeof window.showToastNotification === 'function') {
                        window.showToastNotification(`Iniciando Ep. ${epIdx + 2}: ${nextData.title}`);
                    }
                } else if (nextData && nextData.isMain) {
                    window.openTitleModal(nextEp.id);
                } else if (nextData && (nextData.ytTrailer || nextData.trailer)) {
                    watchModalTrailer(nextData);
                } else {
                    window.openTitleModal(nextEp.id);
                }
            }
        };

        window.togglePdfFullscreen = function() {
            const viewer = document.getElementById('custom-pdf-viewer');
            if (!viewer) return;
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            else if (viewer.requestFullscreen) viewer.requestFullscreen().catch(() => {});
        };

        /* =========================================================
           ACERVO DA TURMA: FILTRO POR MATÉRIA, BARRAS POR TRABALHO & GERADOR AUTOMÁTICO
           ========================================================= */
        const MATERIA_STYLES = {
            'Filosofia': { icon: 'fa-solid fa-book-journal-whills', color: '#e50914', grad1: '#450a0a', grad2: '#0f0f0f' },
            'História': { icon: 'fa-solid fa-landmark', color: '#f59e0b', grad1: '#451a03', grad2: '#120d07' },
            'Sociologia': { icon: 'fa-solid fa-users', color: '#ec4899', grad1: '#500724', grad2: '#14070e' },
            'Língua Portuguesa': { icon: 'fa-solid fa-feather-pointed', color: '#14b8a6', grad1: '#042f2e', grad2: '#071614' },
            'Língua Inglesa': { icon: 'fa-solid fa-language', color: '#0ea5e9', grad1: '#075985', grad2: '#082f49' },
            'Hardware & Arquitetura': { icon: 'fa-solid fa-memory', color: '#6366f1', grad1: '#1e1b4b', grad2: '#0b0a19' },
            'Segurança & Redes': { icon: 'fa-solid fa-shield-halved', color: '#2563eb', grad1: '#0f295c', grad2: '#090d16' },
            'Tópicos Especiais em Desenvolvimento': { icon: 'fa-solid fa-gamepad', color: '#10b981', grad1: '#064e3b', grad2: '#091410' },
            'Programação & T.I.': { icon: 'fa-solid fa-code', color: '#10b981', grad1: '#064e3b', grad2: '#091410' },
            'Inteligência Artificial & IoT': { icon: 'fa-solid fa-microchip', color: '#8b5cf6', grad1: '#3b0764', grad2: '#0f0a19' },
            'Sistemas Operacionais': { icon: 'fa-solid fa-terminal', color: '#f59e0b', grad1: '#451a03', grad2: '#120d07' },
            'Banco de Dados': { icon: 'fa-solid fa-database', color: '#06b6d4', grad1: '#083344', grad2: '#071115' },
            'História & Sociologia': { icon: 'fa-solid fa-landmark', color: '#d97706', grad1: '#422006', grad2: '#140d06' }
        };

        function getMateriaStyle(materia) {
            return MATERIA_STYLES[materia] || { icon: 'fa-solid fa-folder-open', color: '#e50914', grad1: '#31102f', grad2: '#0d0d0d' };
        }

        // Metadados padrão de Matéria e Barra (Trabalho/Seminário) para os títulos originais do catálogo
        const DEFAULT_ACERVO_META = {
            // Filosofia (Trabalhos Atuais do 1º Bimestre - Unidos em uma única série no Acervo, mantidos independentes na Home)
            'tema-1':       { materia: 'Filosofia', trabalhoGrupo: 'Filosofia: Revolução Científica & Pensamento Contemporâneo', periodo: '2026 • 1º Bimestre' },
            'guerra-civil': { materia: 'Filosofia', trabalhoGrupo: 'Filosofia: Revolução Científica & Pensamento Contemporâneo', periodo: '2026 • 1º Bimestre' },
            'tema-3':       { materia: 'Filosofia', trabalhoGrupo: 'Filosofia: Revolução Científica & Pensamento Contemporâneo', periodo: '2026 • 1º Bimestre' },
            'tema-4':       { materia: 'Filosofia', trabalhoGrupo: 'Filosofia: Revolução Científica & Pensamento Contemporâneo', periodo: '2026 • 1º Bimestre' },
            'tema-5':       { materia: 'Filosofia', trabalhoGrupo: 'Filosofia: Revolução Científica & Pensamento Contemporâneo', periodo: '2026 • 1º Bimestre' },
            // Filosofia Política (Antiguidade - Trabalho separado de 2025)
            'teorias-politicas-antiguidade': { materia: 'Filosofia', trabalhoGrupo: 'Seminário: Filosofia Política na Antiguidade', periodo: '2025 • Acervo da Turma' },
            // História - Standalone
            'guerra-fria':  { materia: 'História', trabalhoGrupo: 'Seminário: A Guerra Fria e Relações Internacionais', periodo: '2025 • Acervo da Turma' },
            // Língua Portuguesa & Literatura - SÉRIE DE LIVROS E TABULEIRO (2 Temporadas)
            'padre-amaro':      { materia: 'Língua Portuguesa', trabalhoGrupo: 'Série: Clássicos do Realismo & Jogos de Tabuleiro', periodo: '2025 • Acervo da Turma' },
            'primo-basilio':    { materia: 'Língua Portuguesa', trabalhoGrupo: 'Série: Clássicos do Realismo & Jogos de Tabuleiro', periodo: '2025 • Em Breve' },
            'memorias-postumas':{ materia: 'Língua Portuguesa', trabalhoGrupo: 'Série: Clássicos do Realismo & Jogos de Tabuleiro', periodo: '2025 • Em Breve' },
            'dom-casmurro':     { materia: 'Língua Portuguesa', trabalhoGrupo: 'Série: Clássicos do Realismo & Jogos de Tabuleiro', periodo: '2025 • Em Breve' },
            'padre-amaro-jogo': { materia: 'Língua Portuguesa', trabalhoGrupo: 'Série: Clássicos do Realismo & Jogos de Tabuleiro', periodo: '2025 • Acervo da Turma' },
            // Língua Portuguesa - Trabalhos Separados
            'sargento-milicias':{ materia: 'Língua Portuguesa', trabalhoGrupo: 'Seminário Literário: Memórias de um Sargento de Milícias', periodo: '2025 • Acervo da Turma' },
            'prosa-1930':       { materia: 'Língua Portuguesa', trabalhoGrupo: 'Seminário Literário: A Prosa de 1930 (Jorge Amado)', periodo: '2025 • Acervo da Turma' },
            // Língua Inglesa - Standalone
            'ia-ingles':        { materia: 'Língua Inglesa', trabalhoGrupo: 'Seminário: Inteligência Artificial no Ensino de Idiomas', periodo: '2025 • Acervo da Turma' },
            // Sociologia - SÉRIE DE PODCASTS (2025)
            'podcast-desigualdade': { materia: 'Sociologia', trabalhoGrupo: 'Série: Podcasts de Sociologia (2025)', periodo: '2025 • Acervo da Turma' },
            'podcast-round6':       { materia: 'Sociologia', trabalhoGrupo: 'Série: Podcasts de Sociologia (2025)', periodo: '2025 • Acervo da Turma' },
            // Sociologia - Trabalho Separado (Slides)
            'sociologia-desenvolvimento': { materia: 'Sociologia', trabalhoGrupo: 'Seminário: Sociologia do Desenvolvimento', periodo: '2025 • Acervo da Turma' },
            // Segurança & Redes - SÉRIE
            'seguranca-informacao': { materia: 'Segurança & Redes', trabalhoGrupo: 'Série: Práticas de Segurança da Informação & Ciberdefesa', periodo: '2025 • Acervo da Turma' },
            'cyber-news':           { materia: 'Segurança & Redes', trabalhoGrupo: 'Série: Práticas de Segurança da Informação & Ciberdefesa', periodo: '2026 • 1º Bimestre' },
            // Hardware & Arquitetura - SÉRIE
            'evolucao-computadores': { materia: 'Hardware & Arquitetura', trabalhoGrupo: 'Série: Arquitetura de Computadores & Hardware', periodo: '2025 • Acervo da Turma' },
            'memoria-cache':         { materia: 'Hardware & Arquitetura', trabalhoGrupo: 'Série: Arquitetura de Computadores & Hardware', periodo: '2025 • Acervo da Turma' },
            // Tópicos Especiais em Desenvolvimento - Standalone
            'jogo-transito':    { materia: 'Tópicos Especiais em Desenvolvimento', trabalhoGrupo: 'Projeto Integrador: Jogo Educativo de Trânsito', periodo: '2025 • Acervo da Turma' }
        };

        // Gera automaticamente um pôster SVG estilo Netflix quando o trabalho não tem imagem própria
        function generateAutoPosterDataUri(title, materia, authors) {
            const st = getMateriaStyle(materia);
            const safeTitle = (title || 'Trabalho').replace(/[<>&"']/g, '');
            const safeMat = (materia || 'IFPI').toUpperCase().replace(/[<>&"']/g, '');
            const safeAuth = (authors || 'Turma IFPI').replace(/[<>&"']/g, '').substring(0, 34);
            const lines = [];
            const words = safeTitle.split(/\s+/);
            let current = '';
            words.forEach(w => {
                if ((current + ' ' + w).trim().length <= 16 && lines.length < 3) {
                    current = (current + ' ' + w).trim();
                } else {
                    if (current) lines.push(current);
                    current = w;
                }
            });
            if (current && lines.length < 4) lines.push(current);

            const textSvg = lines.map((line, i) => 
                `<text x="28" y="${185 + i * 38}" fill="#ffffff" font-family="Impact, sans-serif" font-size="32" font-weight="bold" letter-spacing="1">${line.toUpperCase()}</text>`
            ).join('');

            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
                <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="${st.grad1}"/>
                        <stop offset="100%" stop-color="${st.grad2}"/>
                    </linearGradient>
                </defs>
                <rect width="400" height="600" fill="url(#g)"/>
                <circle cx="340" cy="80" r="140" fill="${st.color}" opacity="0.14"/>
                <circle cx="60" cy="520" r="180" fill="${st.color}" opacity="0.08"/>
                <rect x="28" y="34" width="12" height="24" rx="3" fill="${st.color}"/>
                <text x="48" y="52" fill="#e5e5e5" font-family="Arial, sans-serif" font-size="15" font-weight="bold" letter-spacing="2">IFPIFLIX • ACERVO</text>
                <rect x="28" y="110" width="${Math.min(340, safeMat.length * 11 + 24)}" height="28" rx="6" fill="${st.color}"/>
                <text x="40" y="129" fill="#ffffff" font-family="Arial, sans-serif" font-size="13" font-weight="bold" letter-spacing="1">${safeMat}</text>
                ${textSvg}
                <line x1="28" y1="490" x2="372" y2="490" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
                <text x="28" y="518" fill="#aaaaaa" font-family="Arial, sans-serif" font-size="13" font-weight="bold">EQUIPE / AUTORES</text>
                <text x="28" y="542" fill="#ffffff" font-family="Arial, sans-serif" font-size="15">${safeAuth}</text>
            </svg>`;
            return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg).replace(/'/g, '%27');
        }

        function extractYouTubeId(input) {
            const s = (input || '').trim();
            if (!s) return '';
            if (s.includes('youtu.be/')) return s.split('youtu.be/')[1].split(/[?&]/)[0];
            if (s.includes('watch?v=')) return s.split('watch?v=')[1].split(/[?&]/)[0];
            if (s.includes('/embed/')) return s.split('/embed/')[1].split(/[?&]/)[0];
            if (s.includes('/shorts/')) return s.split('/shorts/')[1].split(/[?&]/)[0];
            if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
            return '';
        }

        let currentAcervoMateria = 'all';
        let currentAcervoSeminario = null;

        function getAllAcervoEntries() {
            // Garante que trabalhos salvos no localStorage estão registrados no filmesDB
            const saved = getSavedTeacherWorks();
            saved.forEach(w => { filmesDB[w.id] = w; });

            // Apenas os trabalhos reais do acervo (atualmente os 5 de Filosofia e quaisquer trabalhos adicionados)
            const validIds = new Set([
                ...Object.keys(DEFAULT_ACERVO_META),
                ...saved.map(w => w.id)
            ]);

            return Array.from(validIds).filter(id => !!filmesDB[id]).map(id => {
                const item = filmesDB[id];
                const def = DEFAULT_ACERVO_META[id] || {};
                const materia = item.materia || def.materia || 'Filosofia';
                const trabalhoGrupo = item.trabalhoGrupo || def.trabalhoGrupo || `Trabalhos de ${materia}`;
                const periodo = item.periodo || def.periodo || (item.year ? `${item.year}` : '2026');
                const hasPdf = !!(item.pdf || item.isMain || item.isSecurityPresentation);
                const hasVideo = !!(item.ytTrailer || item.trailer || item.isMain);
                return {
                    id,
                    item,
                    materia,
                    trabalhoGrupo,
                    periodo,
                    hasPdf,
                    hasVideo
                };
            });
        }

        window.openAcervoScreen = function(materiaFilter) {
            if (materiaFilter) currentAcervoMateria = materiaFilter;
            currentAcervoSeminario = null;
            window.setActiveNavCategory('trabalhos');
            window.switchScreen('acervo-screen', false);
            window.renderAcervoScreen();
            const sc = document.getElementById('acervo-screen');
            if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.openSeminarioView = function(seminarioKey) {
            currentAcervoSeminario = seminarioKey;
            window.renderAcervoScreen();
            const sc = document.getElementById('acervo-screen');
            if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.backToSeminarios = function() {
            currentAcervoSeminario = null;
            window.renderAcervoScreen();
            const sc = document.getElementById('acervo-screen');
            if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.toggleMateriaDropdown = function(e) {
            if (e) e.stopPropagation();
            const popover = document.getElementById('materia-dropdown-menu');
            if (popover) popover.classList.toggle('open');
        };

        window.setAcervoMateria = function(mat) {
            currentAcervoMateria = mat;
            currentAcervoSeminario = null;
            const popover = document.getElementById('materia-dropdown-menu');
            if (popover) popover.classList.remove('open');
            window.renderAcervoScreen();
        };

        document.addEventListener('click', (e) => {
            const wrap = document.querySelector('.netflix-genre-dropdown-wrapper');
            if (wrap && !wrap.contains(e.target)) {
                const popover = document.getElementById('materia-dropdown-menu');
                if (popover) popover.classList.remove('open');
            }
        });

        /* =========================================================
           REGISTRO CANÔNICO DOS ALUNOS DA TURMA (PORTFÓLIOS & ELENCO)
           ========================================================= */
        const STUDENTS_REGISTRY = [
            {
                id: 'francisco-lucas',
                name: 'Francisco Lucas',
                fullName: 'Francisco Lucas Alves do Prado',
                initials: 'FL',
                avatar: 'midia/alunos/francisco.jpg',
                color: '#e50914',
                aliases: ['Francisco Lucas', 'Francisco L', 'Francisco Lucas Alves do Prado']
            },
            {
                id: 'pedro-victor',
                name: 'Pedro Victor',
                fullName: 'Pedro Victor Evangelista Gomes',
                initials: 'PV',
                avatar: 'midia/alunos/pedro.jpg',
                color: '#2563eb',
                aliases: ['Pedro Victor', 'Pedro', 'Pedro Victor Evangelista Gomes']
            },
            {
                id: 'davi-costa',
                name: 'Davi Costa',
                fullName: 'Davi Costa de Lucena',
                initials: 'DC',
                avatar: 'midia/alunos/davi.jpg',
                color: '#10b981',
                aliases: ['Davi Costa', 'Davi', 'Davi Costa de Lucena']
            },
            {
                id: 'joao-pedro-santos',
                name: 'João Pedro Santos',
                fullName: 'João Pedro dos Santos Silva',
                initials: 'JS',
                avatar: 'midia/alunos/jsantos.jpg',
                color: '#f59e0b',
                aliases: ['João Pedro Santos', 'JP Santos', 'João Pedro dos Santos', 'João Pedro dos Santos (JP)', 'João Pedro dos Santos Silva']
            },
            {
                id: 'joao-pedro-silva',
                name: 'João Pedro Silva',
                fullName: 'João Pedro Silva Santos',
                initials: 'JP',
                avatar: 'midia/alunos/jsilva.jpg',
                color: '#8b5cf6',
                aliases: ['João Pedro Silva', 'João Pedro Silva Santos']
            },
            {
                id: 'micaias-lima',
                name: 'Micaías Lima',
                fullName: 'Micaías de Sousa Lima',
                initials: 'ML',
                color: '#ec4899',
                aliases: ['Micaías Lima', 'Micaías de Sousa Lima', 'Micaías', 'Micaias']
            },
            {
                id: 'samuel-soares',
                name: 'Samuel Soares',
                fullName: 'Samuel de Araújo Soares',
                initials: 'SS',
                avatar: 'midia/alunos/samuel.jpg',
                color: '#06b6d4',
                aliases: ['Samuel Soares', 'Samuel', 'Samuel de Araújo Soares']
            },
            {
                id: 'marcos-felipe',
                name: 'Marcos Felipe',
                fullName: 'Marcos Felipe da Silva Sobral',
                initials: 'MF',
                color: '#14b8a6',
                aliases: ['Marcos Felipe', 'Marcos Felipe Sobral', 'Marcos Felipe da Silva Sobral']
            },
            {
                id: 'nicolas-marcell',
                name: 'Nícolas Marcell',
                fullName: 'Nícolas Marcell da Fonseca Sousa',
                initials: 'NM',
                avatar: 'midia/alunos/nicolas.jpg',
                color: '#6366f1',
                aliases: ['Nícolas Marcell', 'Nicolas Marcell', 'Nícolas Marcell da Fonseca Sousa']
            },
            {
                id: 'rodrigo-rubim',
                name: 'Rodrigo Rubim',
                fullName: 'Rodrigo de Oliveira Rubim Sousa',
                initials: 'RR',
                color: '#d97706',
                aliases: ['Rodrigo Rubim', 'Rodrigo de Oliveira Rubim Sousa']
            },
            {
                id: 'yasmyn-paiva',
                name: 'Yasmyn Paiva',
                fullName: 'Yasmyn Paiva de Sousa Nunes',
                initials: 'YP',
                color: '#f43f5e',
                aliases: ['Yasmyn Paiva', 'Yasmyn', 'Yasmyn Paiva de Sousa Nunes']
            },
            {
                id: 'wislla-mariana',
                name: 'Wislla Mariana',
                fullName: 'Wislla Mariana do Nascimento Oliveira',
                initials: 'WM',
                color: '#a855f7',
                aliases: ['Wislla Mariana', 'Wislla', 'Wislla Mariana do Nascimento Oliveira']
            },
            {
                id: 'jose-nildo',
                name: 'José Nildo',
                fullName: 'José Nildo Ferreira Oliveira',
                initials: 'JN',
                color: '#3b82f6',
                aliases: ['José Nildo', 'Jose Nildo', 'José Nildo Ferreira Oliveira']
            },
            {
                id: 'orlando-junior',
                name: 'Orlando Júnior',
                fullName: 'Orlando da Cruz Júnior',
                initials: 'OJ',
                color: '#059669',
                aliases: ['Orlando Júnior', 'Orlando Junior', 'Orlando', 'Orlando da Cruz Júnior']
            },
            {
                id: 'bruno-cardoso',
                name: 'Bruno Cardoso',
                fullName: 'Bruno Cardoso Paz',
                initials: 'BC',
                color: '#475569',
                aliases: ['Bruno Cardoso', 'Bruno', 'Bruno Cardoso Paz']
            },
            {
                id: 'maria-helena',
                name: 'Maria Helena',
                fullName: 'Maria Helena',
                initials: 'MH',
                avatar: 'midia/alunos/maria2.jpg',
                color: '#e11d48',
                aliases: ['Maria Helena']
            },
            {
                id: 'marcelo',
                name: 'Marcelo',
                fullName: 'Marcelo',
                initials: 'MC',
                avatar: 'midia/alunos/marcelo.jpeg',
                color: '#0284c7',
                aliases: ['Marcelo']
            }
        ];

        function workHasStudent(cast, studentKey) {
            if (!cast || !studentKey) return false;
            const normKey = studentKey.trim().toLowerCase();
            const student = STUDENTS_REGISTRY.find(s => 
                s.name.toLowerCase() === normKey || 
                s.aliases.some(a => a.toLowerCase() === normKey)
            );
            
            if (!student) {
                return cast.toLowerCase().includes(normKey);
            }

            // Distinção cirúrgica entre os dois João Pedros
            if (student.id === 'joao-pedro-santos') {
                return /João Pedro Santos|JP Santos|João Pedro dos Santos/i.test(cast);
            }
            if (student.id === 'joao-pedro-silva') {
                return /João Pedro Silva/i.test(cast);
            }

            return student.aliases.some(alias => cast.toLowerCase().includes(alias.toLowerCase()));
        }

        /* =========================================================
           FEATURE 3: HERO BANNER DE DESTAQUE ROTATIVO NO ACERVO
           ========================================================= */
        const ACERVO_HERO_ITEMS = [
            {
                id: 'guerra-civil',
                title: 'A GUERRA CIVIL DA FILOSOFIA',
                subtitle: 'EMPIRISMO VS RACIONALISMO • A REVOLUÇÃO CIENTÍFICA',
                materia: 'Filosofia',
                synopsis: 'A Revolução Científica Moderna, a queda dos dogmas escolásticos e a forja do Método Científico por Newton. A maior batalha intelectual da história entre defensores da experiência prática e adeptos da lógica pura.',
                cast: 'Davi Costa, Maria Helena, Francisco Lucas, Pedro Victor, Marcelo, Samuel Soares, João Pedro Santos',
                bg: 'banner.png'
            },
            {
                id: 'teorias-politicas-antiguidade',
                title: 'TEORIAS POLÍTICAS NA ANTIGUIDADE',
                subtitle: 'PLATÃO, ARISTÓTELES E O NASCIMENTO DA POLÍTICA',
                materia: 'Filosofia',
                synopsis: 'A fundação do pensamento político clássico na Grécia Antiga: o ideal da cidade justa e a República de Platão governada pelo Rei-Filósofo versus o realismo pragmático e a pólis em Aristóteles.',
                cast: 'Davi Costa, Samuel Soares, Francisco Lucas, Yasmyn Paiva, Marcos Felipe, Nícolas Marcell, Micaías Lima, João Pedro Santos, Wislla Mariana, João Pedro Silva',
                bg: 'midia/slides/teorias_politicas/slide_01.jpg'
            },
            {
                id: 'guerra-fria',
                title: 'A GUERRA FRIA & A BIPOLARIZAÇÃO',
                subtitle: 'EUA VS URSS, CORRIDA ARMAMENTISTA E O MUNDO DIVIDIDO',
                materia: 'História',
                synopsis: 'O confronto ideológico e geopolítico entre as superpotências, a Doutrina Truman, a corrida armamentista e espacial, as crises na Ásia e América Latina e o colapso do bloco soviético.',
                cast: 'Francisco Lucas, Pedro Victor, João Pedro Santos, Rodrigo Rubim, Nícolas Marcell, Micaías Lima, Orlando Júnior',
                bg: 'midia/slides/guerra_fria/slide_01.jpg'
            },
            {
                id: 'sociologia-desenvolvimento',
                title: 'SOCIOLOGIA DO DESENVOLVIMENTO',
                subtitle: 'CONTRADIÇÕES SOCIAIS, CAPITALISMO E DESIGUALDADE',
                materia: 'Sociologia',
                synopsis: 'Pesquisa sociológica sobre a produção socializada e a apropriação privada do lucro, as crises cíclicas do capitalismo, o relatório da fome da ONU e os desafios para o desenvolvimento sustentável.',
                cast: 'Davi Costa, João Pedro Santos, Samuel Soares, Marcos Felipe, Micaías Lima, João Pedro Silva, Yasmyn Paiva, Wislla Mariana, Nícolas Marcell, Francisco Lucas',
                bg: 'midia/slides/sociologia_desenvolvimento/slide_01.jpg'
            },
            {
                id: 'prosa-1930',
                title: 'A PROSA DE 30: JORGE AMADO',
                subtitle: 'RETRATOS DA BAHIA E A SEGUNDA GERAÇÃO MODERNISTA',
                materia: 'Língua Portuguesa',
                synopsis: 'Análise aprofundada da Prosa Regionalista de 30: o impacto social da Crise de 1929 e da Era Vargas, a denúncia das desigualdades no Nordeste e o homem determinado pelo seu meio sociocultural.',
                cast: 'João Pedro Santos, Pedro Victor, Francisco Lucas, João Pedro Silva, Nícolas Marcell, José Nildo',
                bg: 'midia/slides/prosa_1930/slide_01.jpg'
            },
            {
                id: 'memoria-cache',
                title: 'ARQUITETURA DE COMPUTADORES',
                subtitle: 'MEMÓRIA CACHE, HIERARQUIA E VELOCIDADE DE PROCESSAMENTO',
                materia: 'Hardware & Arquitetura',
                synopsis: 'Estudo técnico dos níveis L1, L2 e L3 de memória cache, o princípio da localidade temporal e espacial, e o impacto na latência dos processadores modernos.',
                cast: 'Davi Costa, Francisco Lucas, Pedro Victor, Samuel Soares, Marcelo, João Pedro Santos',
                bg: 'midia/slides/memoria_cache/slide_01.jpg'
            },
            {
                id: 'seguranca-informacao',
                title: 'SEGURANÇA DA INFORMAÇÃO',
                subtitle: 'VULNERABILIDADES WEB, S.O.C., NUVEM E AMEAÇAS SINTÉTICAS',
                materia: 'Segurança & Redes',
                synopsis: 'Série original acadêmica sobre Segurança da Informação: análise prática de vulnerabilidades web em PHP (SQLi, XSS, LFI), a dinâmica operacional do S.O.C. (Tiers 1, 2, 3 e Red/Blue/Purple Team), computação em nuvem e novos vetores com Deepfakes e IA.',
                cast: 'Francisco Lucas, João Pedro Santos, Pedro Victor, João Pedro Silva, Nícolas Marcell',
                bg: 'deepfake_pix.jpg'
            }
        ];

        let currentAcervoHeroIdx = 0;
        let acervoHeroTimer = null;

        function updateAcervoHeroDOM() {
            const heroEl = document.getElementById('acervo-hero');
            if (!heroEl) return;
            const cur = ACERVO_HERO_ITEMS[currentAcervoHeroIdx] || ACERVO_HERO_ITEMS[0];
            const st = getMateriaStyle(cur.materia);
            const bgUrl = imgUrl(cur.bg, 1400);

            heroEl.style.backgroundImage = `linear-gradient(to right, #141414 42%, rgba(20,20,20,0.7) 65%, transparent 85%), linear-gradient(to top, #141414 0%, transparent 25%), url('${bgUrl}')`;
            heroEl.style.backgroundRepeat = 'no-repeat';
            heroEl.style.backgroundSize = 'cover';
            heroEl.style.backgroundPosition = 'right center';
            heroEl.style.backgroundColor = '#141414';

            const dots = ACERVO_HERO_ITEMS.map((item, idx) => `
                <button type="button" class="acervo-hero-dot ${idx === currentAcervoHeroIdx ? 'active' : ''}" 
                        onclick="window.setAcervoHeroSlide(${idx})" 
                        aria-label="Ir para destaque ${idx + 1}: ${item.title}">
                </button>
            `).join('');

            heroEl.innerHTML = `
                <div class="hero-content">
                    <div style="color: var(--rpg-gold); font-weight: bold; letter-spacing: 2px; font-size: 0.9rem; margin-bottom: 8px;">
                        <span class="badge-acervo-mat" style="background: ${st.color}; padding: 3px 8px; border-radius: 4px; color: #fff; font-size: 0.78rem; margin-right: 8px;"><i class="${st.icon}"></i> ${cur.materia}</span>
                        <i class="fa-solid fa-clapperboard"></i> TRABALHOS ANTIGOS &bull; DESTAQUE DO ACERVO
                    </div>
                    <h1 id="acervo-hero-title">${cur.title}</h1>
                    ${cur.subtitle ? `<p id="acervo-hero-subtitle" style="font-size: 1.3rem; margin-bottom: 5px; color: var(--netflix-red); font-weight: bold; letter-spacing: 1px;">${cur.subtitle}</p>` : ''}
                    <p id="acervo-hero-synopsis" style="font-size: 1.15rem; margin-bottom: 15px; color: #ccc; line-height: 1.5;">${cur.synopsis}</p>
                    <div class="hero-buttons">
                        <button type="button" class="btn-play" onclick="window.openAcademicDirectAction('${cur.id}')">
                            <i class="fa-solid fa-play"></i> Assistir / Apresentar
                        </button>
                        <button type="button" class="btn-info" onclick="window.openTitleModal('${cur.id}')">
                            <i class="fa-solid fa-circle-info"></i> Detalhes
                        </button>
                    </div>
                </div>
                <div class="hero-carousel-pagers" id="acervo-hero-pagers">
                    ${dots}
                </div>
            `;
        }
        window.updateAcervoHeroDOM = updateAcervoHeroDOM;

        window.setAcervoHeroSlide = function(idx) {
            if (idx < 0 || idx >= ACERVO_HERO_ITEMS.length) return;
            currentAcervoHeroIdx = idx;
            updateAcervoHeroDOM();
        };

        window.nextAcervoHeroSlide = function() {
            const nextIdx = (currentAcervoHeroIdx + 1) % ACERVO_HERO_ITEMS.length;
            window.setAcervoHeroSlide(nextIdx);
        };

        window.pauseAcervoHeroTimer = function() {
            if (acervoHeroTimer) {
                clearInterval(acervoHeroTimer);
                acervoHeroTimer = null;
            }
        };

        window.resumeAcervoHeroTimer = function() {
            window.pauseAcervoHeroTimer();
            const acervoScreen = document.getElementById('acervo-screen');
            if (acervoScreen && acervoScreen.classList.contains('active')) {
                acervoHeroTimer = setInterval(window.nextAcervoHeroSlide, 7000);
            }
        };

        /* =========================================================
           FEATURE 1: PORTFÓLIO DO ALUNO ("ELENCO DA TURMA")
           ========================================================= */
        function renderStudentsRowHtml(entries) {
            const studentCards = STUDENTS_REGISTRY.map(student => {
                const count = entries.filter(e => workHasStudent(e.item.cast, student.name)).length;
                const isActive = currentAcervoAuthor && (currentAcervoAuthor.toLowerCase() === student.name.toLowerCase() || student.aliases.some(a => a.toLowerCase() === currentAcervoAuthor.toLowerCase()));

                const avatarStyle = student.avatar
                    ? `background-image: url('${imgUrl(student.avatar, 200)}'); background-size: cover; background-position: center; border-color: ${student.color};`
                    : `background: linear-gradient(135deg, ${student.color}33, #151515); border-color: ${student.color};`;

                return `
                    <button type="button" class="student-avatar-card ${isActive ? 'active' : ''}" onclick="window.filterAcervoByAuthor('${student.name.replace(/'/g, "\\'")}')" aria-label="Portfólio de ${student.name}">
                        <div class="student-avatar-circle ${student.avatar ? 'has-photo' : ''}" style="${avatarStyle}">
                            ${student.avatar ? '' : student.initials}
                            <span class="student-avatar-badge">${count}</span>
                        </div>
                        <span class="student-avatar-name">${student.name}</span>
                        <span class="student-avatar-sub">${count} ${count === 1 ? 'trabalho' : 'trabalhos'}</span>
                    </button>
                `;
            }).join('');

            return `
                <div class="acervo-students-row-container">
                    <div class="acervo-students-row-header">
                        <h3><i class="fa-solid fa-graduation-cap" style="color:var(--netflix-red);"></i> Elenco da Turma &bull; Alunos</h3>
                        <span style="font-size:0.82rem; color:#888;">Clique no aluno para filtrar seus trabalhos</span>
                    </div>
                    <div class="acervo-shelf-slider-container acervo-students-slider-container">
                        <button type="button" class="acervo-slider-nav-btn prev" aria-label="Voltar" onclick="window.scrollAcervoShelf('acervo-students-slider-shelf', -1)">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <div class="acervo-students-slider" id="acervo-students-slider-shelf">
                            ${studentCards}
                        </div>
                        <button type="button" class="acervo-slider-nav-btn next" aria-label="Avançar" onclick="window.scrollAcervoShelf('acervo-students-slider-shelf', 1)">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        function renderStudentPortfolioBannerHtml(studentName, studentWorks) {
            const student = STUDENTS_REGISTRY.find(s => 
                s.name.toLowerCase() === studentName.toLowerCase() || 
                s.aliases.some(a => a.toLowerCase() === studentName.toLowerCase())
            ) || {
                name: studentName,
                fullName: studentName,
                initials: studentName.slice(0, 2).toUpperCase(),
                color: '#e50914'
            };

            const mats = new Set();
            studentWorks.forEach(w => mats.add(w.materia));
            const matList = Array.from(mats).join(', ') || 'Diversas';

            const avatarStyle = student.avatar
                ? `background-image: url('${imgUrl(student.avatar, 300)}'); background-size: cover; background-position: center; border: 3px solid ${student.color};`
                : `background: linear-gradient(135deg, ${student.color}, #700); border: 3px solid #fff;`;

            return `
                <div class="student-portfolio-banner">
                    <div class="student-portfolio-left">
                        <div class="student-portfolio-avatar ${student.avatar ? 'has-photo' : ''}" style="${avatarStyle}">
                            ${student.avatar ? '' : student.initials}
                        </div>
                        <div class="student-portfolio-info">
                            <div style="font-size:0.75rem; font-weight:800; color:var(--netflix-red); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">
                                <i class="fa-solid fa-graduation-cap"></i> Portfólio do Aluno
                            </div>
                            <h2>${student.name}</h2>
                            <div class="student-portfolio-fullname">${student.fullName}</div>
                            <div class="student-portfolio-stats">
                                <span class="student-portfolio-stat-pill"><i class="fa-solid fa-file-powerpoint"></i> ${studentWorks.length} ${studentWorks.length === 1 ? 'trabalho' : 'trabalhos'}</span>
                                <span class="student-portfolio-stat-pill"><i class="fa-solid fa-shapes"></i> Matérias: ${matList}</span>
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="btn-view-card-3d" onclick="window.openStudentCardModal('${student.id || student.name}')" title="Ver Card Holográfico 3D & Duelo 1v1">
                            <i class="fa-solid fa-id-card-clip"></i> Carta 3D (RPG)
                        </button>
                        <button type="button" class="student-portfolio-close-btn" onclick="window.clearAcervoAuthorFilter()">
                            <i class="fa-solid fa-xmark"></i> Remover Filtro
                        </button>
                    </div>
                </div>
            `;
        }

        /* =========================================================
           FEATURE 6: MODO TURBO DE DESEMPENHO (INTERSECTION OBSERVER)
           ========================================================= */
        let turboObserver = null;
        function initTurboObserver() {
            if (!('IntersectionObserver' in window)) return;
            if (turboObserver) turboObserver.disconnect();

            turboObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const el = entry.target;
                    if (entry.isIntersecting) {
                        el.classList.remove('is-offscreen');
                    } else {
                        el.classList.add('is-offscreen');
                        const vid = el.querySelector('video');
                        if (vid && !vid.paused) vid.pause();
                    }
                });
            }, {
                rootMargin: '250px 0px 250px 0px',
                threshold: 0.01
            });

            document.querySelectorAll('.academic-card, .catalog-section, .acervo-hero-banner, .seminario-shelf-card').forEach(el => {
                el.classList.add('will-pause-offscreen');
                turboObserver.observe(el);
            });
        }

        let currentAcervoFormat = 'all';
        let currentAcervoAuthor = null;

        window.setAcervoFormat = function(fmt) {
            currentAcervoFormat = fmt;
            ['all', 'pdf', 'video'].forEach(f => {
                const btn = document.getElementById(`pill-format-${f}`);
                if (btn) btn.classList.toggle('active', f === fmt);
            });
            window.renderAcervoScreen();
        };

        window.filterAcervoByAuthor = function(authorName) {
            window.closeTitleModal(null, true);
            currentAcervoAuthor = authorName;
            currentAcervoMateria = 'all';
            currentAcervoFormat = 'all';
            currentAcervoSeminario = null;
            window.switchScreen('acervo-screen');
            window.renderAcervoScreen();
            const sc = document.getElementById('acervo-screen');
            if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.clearAcervoAuthorFilter = function() {
            currentAcervoAuthor = null;
            window.renderAcervoScreen();
        };

        /* =========================================================
           DISNEY+ COLLECTIONS ROW NA HOME E NO ACERVO
           ========================================================= */
        const DISNEY_HOME_COLLECTIONS = [
            { id: 'col-filosofia', title: 'FILOSOFIA', materia: 'Filosofia', img: 'midia/colecoes/col_disney_filosofia.jpg' },
            { id: 'col-sociologia', title: 'SOCIOLOGIA', materia: 'Sociologia', img: 'midia/colecoes/col_disney_sociologia.jpg' },
            { id: 'col-literatura', title: 'LITERATURA', materia: 'Língua Portuguesa', img: 'midia/colecoes/col_disney_literatura.jpg' },
            { id: 'col-historia', title: 'HISTÓRIA', materia: 'História', img: 'midia/colecoes/col_disney_historia.jpg' },
            { id: 'col-hardware', title: 'HARDWARE & T.I.', materia: 'Hardware & Arquitetura', img: 'midia/colecoes/col_disney_hardware.jpg' },
            { id: 'col-seguranca', title: 'CYBER DEFESA', materia: 'Segurança & Redes', img: 'midia/colecoes/col_disney_seguranca.jpg' },
            { id: 'col-ingles', title: 'LÍNGUA INGLESA', materia: 'Língua Inglesa', img: 'midia/colecoes/col_disney_ingles.jpg' },
            { id: 'col-topicos', title: 'TÓPICOS ESPECIAIS', materia: 'Tópicos Especiais em Desenvolvimento', img: 'midia/colecoes/col_disney_games.jpg' }
        ];

        /* =========================================================
           COLEÇÕES DE TRABALHOS DA TURMA (DISNEY+)
           ========================================================= */
        window.playDisneyCollectionIntro = function(materia, onFinished) {
            if (onFinished) onFinished();
            else window.openAcervoScreen(materia);
        };

        window.renderDisneyCollectionsRow = function() {
            const container = document.getElementById('disney-collections-grid');
            if (!container) return;

            container.innerHTML = DISNEY_HOME_COLLECTIONS.map(c => `
                <div class="disney-col-card" style="background-image: url('${c.img}');" onclick="window.openAcervoScreen('${c.materia.replace(/'/g, "\\'")}')" role="button" tabindex="0" aria-label="Coleção ${c.title}">
                    <div class="disney-col-card-shine"></div>
                </div>
            `).join('');
        };

        function renderAcervoDisneyTiles(activeMateria) {
            const isAll = activeMateria === 'all';
            const allPill = `
                <div class="acervo-disney-pill acervo-disney-pill-all ${isAll ? 'active' : ''}" onclick="window.setAcervoMateria('all')" role="button" tabindex="0" aria-label="Todas as Matérias">
                    <i class="fa-solid fa-shapes"></i>
                    <span>Todas</span>
                    <div class="acervo-disney-pill-shine"></div>
                </div>
            `;

            const tiles = DISNEY_HOME_COLLECTIONS.map(c => {
                const isActive = activeMateria === c.materia;
                return `
                    <div class="acervo-disney-pill ${isActive ? 'active' : ''}" style="background-image: url('${c.img}');" onclick="window.setAcervoMateria('${c.materia.replace(/'/g, "\\'")}')" role="button" tabindex="0" aria-label="Coleção ${c.title}">
                        <div class="acervo-disney-pill-shine"></div>
                    </div>
                `;
            }).join('');

            return allPill + tiles;
        }

        /* =========================================================
           FEATURE 6: IFPIFLIX WRAPPED (RETROSPECTIVA GERAL DA TURMA)
           ========================================================= */
        const WRAPPED_TOTAL_STEPS = 5;
        let wrappedCurrentStep = 0;
        let wrappedStepProgress = 0;
        let wrappedTimer = null;
        let wrappedSoundEnabled = true;

        const WRAPPED_TIMELINE = [
            {
                era: '1999',
                title: 'O Big Bang dos Filmes e Ficção',
                desc: 'Início das lendas digitais com Fuga do Metaverso e a reflexão sobre o domínio das corporações e realidades virtuais.',
                works: ['Fuga do Metaverso (1999)']
            },
            {
                era: '2003 – 2006',
                title: 'A Era das Redes & Infraestrutura',
                desc: 'A saga dos pacotes perdidos na Deep Web, a rebelião dos eletrodomésticos inteligentes (IoT) e a defesa perimetral com firewalls.',
                works: ['Procurando IP (2003)', 'Rebelião das Torradeiras (2003)', 'Nicolas O Grande (2004)', 'A Muralha de Fogo (2006)']
            },
            {
                era: '2010 – 2013',
                title: 'O Surgimento das IAs & Ataques MITM',
                desc: 'O treinamento das primeiras inteligências artificiais, as armadilhas honeypot e os mistérios dos ataques Man-in-the-Middle.',
                works: ['Como Treinar a sua I.A. (2010)', 'O Pote de Mel (2011)', 'O Homem no Meio (2013)']
            },
            {
                era: '2016 – 2023',
                title: 'A Era dos Grandes Blockbusters Acadêmicos',
                desc: 'A eclosão do debate clássico entre Empirismo e Racionalismo, relatividade, Popper, redes locais, hacking e a revolução do Código Aberto.',
                works: ['Guerra Civil (2016)', 'Devoradores de Espaço-Tempo (2016)', 'Obsessão: Popper (2016)', 'Stranger Pings (2016)', 'La La Lan (2016)', 'K-pop 3 (2017)', 'Não Olhe para a Ética (2021)', 'Deepfake: O Preço do Pix (2022)', 'Open Source (2023)']
            },
            {
                era: '2025',
                title: 'O Grande Marco da Turma IFPI',
                desc: 'Ano histórico com 14 seminários e produções de alto nível abrangendo Filosofia Política, Guerra Fria, Realismo e Modernismo, Sociologia do Desenvolvimento, Hardware, Ciberdefesa e Games.',
                works: [
                    'Teorias Políticas (Filosofia)', 'Guerra Fria (História)', 'Padre Amaro & Jogo (Literatura)', 
                    'Sargento de Milícias (Literatura)', 'A Prosa de 30 (Literatura)', 'Sociologia do Desenvolvimento', 
                    'Podcasts Round 6 & Desigualdade', 'Segurança da Informação Interativa', 'Memória Cache', 
                    'Evolução dos Computadores', 'Jogo Educativo de Trânsito', 'IA no Inglês'
                ]
            },
            {
                era: '2026',
                title: 'O Presente & O Futuro do IFPIFLIX',
                desc: 'O lançamento do 1º Bimestre de Filosofia com os 5 Temas da Revolução Científica e a estreia do telejornal Cyber News com políticas corporativas de segurança.',
                works: ['Os 5 Temas de Filosofia (2026)', 'Jornal Cyber News (2026)']
            }
        ];

        function playWrappedSoundEffect(type) {
            if (!wrappedSoundEnabled && !globalSfxEnabled) return;
            try {
                const ctx = getSharedAudioContext();
                if (!ctx) return;
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                if (type === 'next') {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                } else if (type === 'complete') {
                    // Fanfare chord
                    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
                        const subOsc = ctx.createOscillator();
                        const subGain = ctx.createGain();
                        subOsc.type = 'triangle';
                        subOsc.frequency.setValueAtTime(f, now + i * 0.05);
                        subGain.gain.setValueAtTime(0.07, now + i * 0.05);
                        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                        subOsc.connect(subGain);
                        subGain.connect(ctx.destination);
                        subOsc.start(now + i * 0.05);
                        subOsc.stop(now + 1.2);
                    });
                    return;
                } else {
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                }

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.3);
            } catch(e) {}
        }

        window.toggleWrappedSound = function() {
            wrappedSoundEnabled = !wrappedSoundEnabled;
            const icon = document.getElementById('wrapped-sound-icon');
            if (icon) {
                icon.className = wrappedSoundEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
                icon.style.color = wrappedSoundEnabled ? '#ffd700' : '#888';
            }
        };

        window.openIfpiflixWrapped = function() {
            const modal = document.getElementById('wrapped-modal');
            if (!modal) return;
            wrappedCurrentStep = 0;
            wrappedStepProgress = 0;
            modal.classList.add('show');
            window.renderWrappedCurrentStory();
            window.startWrappedTimer();
            playWrappedSoundEffect('next');
        };

        window.closeIfpiflixWrapped = function(e, force) {
            if (!force && e && e.target !== e.currentTarget) return;
            const modal = document.getElementById('wrapped-modal');
            if (modal) modal.classList.remove('show');
            if (wrappedTimer) {
                clearInterval(wrappedTimer);
                wrappedTimer = null;
            }
        };

        window.startWrappedTimer = function() {
            if (wrappedTimer) clearInterval(wrappedTimer);
            wrappedStepProgress = 0;
            const stepDuration = 6500; // 6.5s por história
            const intervalTick = 60; // ms
            const increment = (intervalTick / stepDuration) * 100;

            wrappedTimer = setInterval(() => {
                wrappedStepProgress += increment;
                if (wrappedStepProgress >= 100) {
                    wrappedStepProgress = 0;
                    if (wrappedCurrentStep < WRAPPED_TOTAL_STEPS - 1) {
                        window.navWrapped(1);
                    } else {
                        // Pausa na última história
                        clearInterval(wrappedTimer);
                        wrappedTimer = null;
                        const fill = document.getElementById(`w-fill-${wrappedCurrentStep}`);
                        if (fill) fill.style.width = '100%';
                    }
                } else {
                    const fill = document.getElementById(`w-fill-${wrappedCurrentStep}`);
                    if (fill) fill.style.width = `${wrappedStepProgress}%`;
                }
            }, intervalTick);
        };

        window.navWrapped = function(direction) {
            const next = wrappedCurrentStep + direction;
            if (next < 0 || next >= WRAPPED_TOTAL_STEPS) return;
            wrappedCurrentStep = next;
            wrappedStepProgress = 0;
            window.renderWrappedCurrentStory();
            window.startWrappedTimer();
            if (wrappedCurrentStep === WRAPPED_TOTAL_STEPS - 1) {
                playWrappedSoundEffect('complete');
            } else {
                playWrappedSoundEffect('next');
            }
        };

        window.jumpWrappedStep = function(stepIdx) {
            if (stepIdx < 0 || stepIdx >= WRAPPED_TOTAL_STEPS) return;
            wrappedCurrentStep = stepIdx;
            wrappedStepProgress = 0;
            window.renderWrappedCurrentStory();
            window.startWrappedTimer();
            playWrappedSoundEffect('next');
        };

        window.renderWrappedCurrentStory = function() {
            const stage = document.getElementById('wrapped-story-stage');
            const prevBtn = document.getElementById('wrapped-prev-btn');
            const nextBtn = document.getElementById('wrapped-next-btn');
            if (!stage) return;

            // Atualiza steppers
            for (let i = 0; i < WRAPPED_TOTAL_STEPS; i++) {
                const fill = document.getElementById(`w-fill-${i}`);
                if (!fill) continue;
                if (i < wrappedCurrentStep) {
                    fill.style.width = '100%';
                    fill.classList.add('completed');
                } else if (i === wrappedCurrentStep) {
                    fill.style.width = '0%';
                    fill.classList.remove('completed');
                } else {
                    fill.style.width = '0%';
                    fill.classList.remove('completed');
                }
            }

            if (prevBtn) prevBtn.disabled = wrappedCurrentStep === 0;
            if (nextBtn) nextBtn.disabled = wrappedCurrentStep === WRAPPED_TOTAL_STEPS - 1;

            const allEntries = getAllAcervoEntries();
            const totalWorks = Object.keys(filmesDB).length;

            // RENDERIZAÇÃO DE CADA HISTÓRIA
            switch (wrappedCurrentStep) {
                case 0: // HISTÓRIA 1: LINHA DO TEMPO GERAL (1999 a 2026)
                    stage.innerHTML = `
                        <div class="wrapped-story-card">
                            <span class="wrapped-story-tag"><i class="fa-solid fa-timeline"></i> História 1 de 5 &bull; A Linha do Tempo</span>
                            <h2 class="wrapped-story-title">A Jornada Histórica do IFPIFLIX</h2>
                            <p class="wrapped-story-subtitle">De 1999 a 2026: Cada produção marcou um capítulo da nossa turma no IFPI.</p>
                            
                            <div class="wrapped-timeline-container">
                                ${WRAPPED_TIMELINE.map(t => `
                                    <div class="wrapped-timeline-era">
                                        <div class="wrapped-era-year-badge">${t.era}</div>
                                        <div class="wrapped-era-content">
                                            <h4>${t.title}</h4>
                                            <p>${t.desc}</p>
                                            <div class="wrapped-era-works">
                                                ${t.works.map(w => `<span class="wrapped-era-pill">${w}</span>`).join('')}
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                case 1: // HISTÓRIA 2: VOLUME & MÉTRICAS DE PRODUÇÃO
                    stage.innerHTML = `
                        <div class="wrapped-story-card">
                            <span class="wrapped-story-tag"><i class="fa-solid fa-fire"></i> História 2 de 5 &bull; Volume de Conhecimento</span>
                            <h2 class="wrapped-story-title">Uma Verdadeira Fábrica de Conteúdo</h2>
                            <p class="wrapped-story-subtitle">Centenas de horas de estudo condensadas em apresentações e filmes interativos.</p>
                            
                            <div class="wrapped-metrics-grid">
                                <div class="wrapped-metric-card">
                                    <div class="wrapped-metric-number">+90</div>
                                    <div class="wrapped-metric-label">Slides em Alta Definição</div>
                                    <div class="wrapped-metric-desc">Renderizados nativamente em 16:9 HD para visualização no projetor.</div>
                                </div>
                                <div class="wrapped-metric-card">
                                    <div class="wrapped-metric-number">27+</div>
                                    <div class="wrapped-metric-label">Produções Registradas</div>
                                    <div class="wrapped-metric-desc">Seminários acadêmicos, curtas de ficção, paródias e séries de T.I.</div>
                                </div>
                                <div class="wrapped-metric-card">
                                    <div class="wrapped-metric-number">6</div>
                                    <div class="wrapped-metric-label">Formatos Distintos</div>
                                    <div class="wrapped-metric-desc">Slides, Podcasts, Jogos em Pixel Art, Jogos de Tabuleiro, Radar de Defesa e Jornalismo.</div>
                                </div>
                                <div class="wrapped-metric-card">
                                    <div class="wrapped-metric-number">100%</div>
                                    <div class="wrapped-metric-label">Produção Autoral</div>
                                    <div class="wrapped-metric-desc">Pesquisado, estruturado e defendido com excelência pelos alunos.</div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;

                case 2: // HISTÓRIA 3: AS MATÉRIAS MAIS EXPLORADAS
                    // Calcula contagem de matérias
                    const matCounts = {};
                    allEntries.forEach(e => {
                        matCounts[e.materia] = (matCounts[e.materia] || 0) + 1;
                    });
                    const sortedMats = Object.entries(matCounts).sort((a, b) => b[1] - a[1]);
                    const maxCount = sortedMats[0] ? sortedMats[0][1] : 1;

                    stage.innerHTML = `
                        <div class="wrapped-story-card">
                            <span class="wrapped-story-tag"><i class="fa-solid fa-chart-column"></i> História 3 de 5 &bull; As Matérias</span>
                            <h2 class="wrapped-story-title">Os Assuntos que Dominaram os Debates</h2>
                            <p class="wrapped-story-subtitle">Filosofia, Humanas e Tecnologia lideraram a produção intelectual da turma.</p>
                            
                            <div class="wrapped-subjects-list">
                                ${sortedMats.map(([mat, count]) => {
                                    const st = getMateriaStyle(mat);
                                    const percent = Math.round((count / maxCount) * 100);
                                    return `
                                        <div class="wrapped-subject-item">
                                            <div class="wrapped-subject-header">
                                                <span><i class="${st.icon}" style="color:${st.color}; margin-right:8px;"></i>${mat}</span>
                                                <span style="color:#ffd700;">${count} ${count === 1 ? 'trabalho' : 'trabalhos'}</span>
                                            </div>
                                            <div class="wrapped-bar-track">
                                                <div class="wrapped-bar-fill" style="width: ${percent}%; background: linear-gradient(90deg, ${st.color}, #ffd700);"></div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                    break;

                case 3: // HISTÓRIA 4: HALL DA FAMA (RANKING DOS ALUNOS)
                    const studentRanks = STUDENTS_REGISTRY.map(student => {
                        const count = allEntries.filter(e => workHasStudent(e.item.cast, student.name)).length;
                        return { student, count };
                    }).sort((a, b) => b.count - a.count);

                    stage.innerHTML = `
                        <div class="wrapped-story-card">
                            <span class="wrapped-story-tag"><i class="fa-solid fa-crown"></i> História 4 de 5 &bull; Hall da Fama</span>
                            <h2 class="wrapped-story-title">O Elenco de Ouro da Turma</h2>
                            <p class="wrapped-story-subtitle">Reconhecimento aos alunos que mais subiram ao palco para apresentar trabalhos.</p>
                            
                            <div class="wrapped-hall-grid">
                                ${studentRanks.map((item, idx) => {
                                    const s = item.student;
                                    let medalHtml = '';
                                    if (idx === 0) medalHtml = '<div class="wrapped-student-medal gold"><i class="fa-solid fa-crown"></i></div>';
                                    else if (idx === 1) medalHtml = '<div class="wrapped-student-medal silver">2º</div>';
                                    else if (idx === 2) medalHtml = '<div class="wrapped-student-medal bronze">3º</div>';

                                    const avatarStyle = s.avatar
                                        ? `background-image: url('${imgUrl(s.avatar, 200)}'); background-size: cover; border-color: ${s.color};`
                                        : `background: linear-gradient(135deg, ${s.color}, #111); border-color: ${s.color};`;

                                    return `
                                        <div class="wrapped-student-card">
                                            ${medalHtml}
                                            <div class="wrapped-student-avatar" style="${avatarStyle}">
                                                ${s.avatar ? '' : s.initials}
                                            </div>
                                            <div class="wrapped-student-name" title="${s.fullName}">${s.name}</div>
                                            <div class="wrapped-student-count">${item.count} ${item.count === 1 ? 'apresentação' : 'apresentações'}</div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                    break;

                case 4: // HISTÓRIA 5: O SELO OFICIAL & CERTIFICADO DA TURMA
                    stage.innerHTML = `
                        <div class="wrapped-story-card">
                            <span class="wrapped-story-tag"><i class="fa-solid fa-award"></i> História 5 de 5 &bull; Selo de Excelência</span>
                            <h2 class="wrapped-story-title">Selo Oficial IFPIFLIX 2026</h2>
                            <p class="wrapped-story-subtitle">A turma que transformou seminários tradicionais em uma experiência de cinema.</p>
                            
                            <div class="wrapped-certificate">
                                <div class="wrapped-cert-emblem"><i class="fa-solid fa-certificate"></i></div>
                                <h3 style="color:#fff; font-size:1.6rem; margin:0 0 6px 0; letter-spacing:1px;">TURMA DE INFORMÁTICA &bull; IFPI</h3>
                                <div style="color:var(--netflix-red); font-weight:800; font-size:1rem; letter-spacing:2px; text-transform:uppercase; margin-bottom:12px;">
                                    CLASSIFICAÇÃO LENDÁRIA ★★★★★
                                </div>
                                <p style="color:#ccc; font-size:0.95rem; line-height:1.5; max-width:550px; margin:0 auto;">
                                    "Pela preservação histórica, rigor acadêmico e genialidade na apresentação de cada disciplina — da Grécia Antiga e Filosofia da Ciência à Ciberdefesa e Arquitetura de Redes."
                                </p>

                                <div class="wrapped-cert-actions">
                                    <button type="button" class="wrapped-share-btn" onclick="window.copyWrappedSummary()">
                                        <i class="fa-solid fa-share-nodes"></i> Copiar Resumo para a Turma
                                    </button>
                                    <button type="button" class="wrapped-explore-btn" onclick="window.closeIfpiflixWrapped(null, true); window.openAcervoScreen();">
                                        <i class="fa-solid fa-shapes"></i> Explorar Acervo Completo
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
            }
        };

        window.copyWrappedSummary = function() {
            const summaryText = 
`✨ IFPIFLIX WRAPPED • RETROSPECTIVA GERAL DA TURMA IFPI ✨

🏆 Produção Acadêmica Consolidada:
📚 +90 Slides em Alta Definição (16:9 HD)
🎬 27+ Obras e Seminários Históricos
📅 Linha do Tempo: de 1999 aos 5 Temas de 2026
🏅 Áreas Campeãs: Filosofia, Literatura, Segurança & Redes, Sociologia e Hardware!

🎓 Elenco de Ouro:
Francisco Lucas, João Pedro Santos, Pedro Victor, Davi Costa, Samuel Soares, João Pedro Silva, Nícolas Marcell, Micaías Lima, Marcelo, Maria Helena, Marcos Felipe e toda a Turma IFPI!

Confira todos os trabalhos e assista em:
https://buguinha0202.github.io/Ifpiflix-projetor/`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(summaryText).then(() => {
                    if (typeof window.showToastNotification === 'function') window.showToastNotification("Resumo da Retrospectiva copiado para a Área de Transferência!");
                }).catch(() => {
                    if (typeof window.showToastNotification === 'function') window.showToastNotification("Resumo pronto para compartilhamento!");
                });
            } else {
                if (typeof window.showToastNotification === 'function') window.showToastNotification("Resumo copiado com sucesso!");
            }
        };

        // Teclado para Retrospectiva (Setas Esquerda / Direita e ESC)
        document.addEventListener('keydown', (e) => {
            const wrappedModal = document.getElementById('wrapped-modal');
            if (wrappedModal && wrappedModal.classList.contains('show')) {
                if (e.key === 'Escape') {
                    window.closeIfpiflixWrapped(null, true);
                } else if (e.key === 'ArrowRight') {
                    window.navWrapped(1);
                } else if (e.key === 'ArrowLeft') {
                    window.navWrapped(-1);
                }
            }
        });

        let currentAcervoViewMode = 'collections'; // 'collections' ou 'grid'

        window.setAcervoViewMode = function(mode) {
            currentAcervoViewMode = mode;
            currentAcervoSeminario = null;
            const btnCol = document.getElementById('view-toggle-collections');
            const btnGrid = document.getElementById('view-toggle-grid');
            if (btnCol) btnCol.classList.toggle('active', mode === 'collections');
            if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
            window.renderAcervoScreen();
        };

        window.openAcademicDirectAction = function(id) {
            const item = filmesDB[id];
            if (!item) return;
            if (item.isSecurityPresentation) {
                window.openSecurityPresentation(0);
                return;
            }
            if (item.pdf || item.slideKey) {
                window.openPdfViewer(item.pdf || '', item.title || '', id);
            } else {
                window.openTitleModal(id);
            }
        };

        function renderAcademicCardHtml(e) {
            const w = e.item;
            const st = getMateriaStyle(e.materia);
            const coverFile = w.banner || w.bg || w.customCover || 
                (w.ytTrailer ? `https://img.youtube.com/vi/${w.ytTrailer}/hqdefault.jpg` : '');
            const coverUrl = imgUrl(coverFile, 800);
            const hasSlides = !!(w.pdf || w.slideKey || e.hasPdf || w.isSecurityPresentation);
            const hasVideo = !!(w.ytTrailer || w.trailer || e.hasVideo);

            let tagText = 'APRESENTAÇÃO';
            let actionIcon = 'fa-play';
            let actionLabel = 'Abrir Slides';

            if (w.hasNoPdf) {
                tagText = '<i class="fa-regular fa-clock"></i> EM BREVE';
                actionIcon = 'fa-circle-info';
                actionLabel = 'Ver Detalhes';
            } else if (w.isSecurityPresentation) {
                tagText = '<i class="fa-solid fa-laptop-code"></i> INTERATIVO';
                actionIcon = 'fa-play';
                actionLabel = 'Apresentar';
            } else if (hasSlides && hasVideo) {
                tagText = '<i class="fa-solid fa-photo-film"></i> SLIDES + VÍDEO';
                actionIcon = 'fa-play';
                actionLabel = 'Apresentar';
            } else if (hasSlides) {
                tagText = '<i class="fa-solid fa-file-powerpoint"></i> SLIDES';
                actionIcon = 'fa-file-powerpoint';
                actionLabel = 'Abrir Slides';
            } else if (hasVideo) {
                tagText = '<i class="fa-solid fa-clapperboard"></i> VÍDEO';
                actionIcon = 'fa-play';
                actionLabel = 'Assistir Vídeo';
            }

            const sInfo = getSeriesForMovie(e.id);
            let epBadgeHtml = '';
            if (sInfo) {
                const epIdx = sInfo.episodes.findIndex(x => x.id === e.id);
                if (epIdx >= 0) {
                    epBadgeHtml = `<div class="academic-ep-badge">EP. ${epIdx + 1}</div>`;
                }
            }

            const durationText = w.duration || (hasSlides ? 'Apresentação em Slides' : 'Vídeo');
            const safeTitle = (w.title || '').replace(/"/g, '&quot;');
            const safeAuthors = (w.cast || 'Turma IFPI').replace(/"/g, '&quot;');

            return `
                <div class="academic-card ${w.hasNoPdf ? 'has-no-pdf-card' : ''}" data-movie="${e.id}" role="button" tabindex="0" aria-label="${safeTitle}" onmouseenter="if(typeof window.playIfpiflixSfx==='function') window.playIfpiflixSfx('card-hover');">
                    <div class="academic-card-thumb">
                        <img src="${coverUrl}" alt="${safeTitle}" class="academic-card-img" loading="lazy">
                        ${epBadgeHtml}
                        <div class="academic-thumb-overlay">
                            <div class="academic-play-badge"><i class="fa-solid ${actionIcon}"></i></div>
                        </div>
                        <div class="academic-tag-left" style="background: ${st.color};">
                            <i class="${st.icon}"></i> ${e.materia}
                        </div>
                        <div class="academic-tag-right">
                            ${tagText}
                        </div>
                    </div>
                    <div class="academic-card-content">
                        <h4 class="academic-card-title">${w.title}</h4>
                        ${w.subtitle ? `<div class="academic-card-subtitle">${w.subtitle}</div>` : ''}
                        <div class="academic-card-authors" title="${safeAuthors}">
                            <i class="fa-solid fa-user-group"></i> <span>${safeAuthors}</span>
                        </div>
                        <div class="academic-card-meta-row">
                            <span class="academic-meta-duration"><i class="fa-regular fa-clock"></i> ${durationText}</span>
                            <span class="academic-meta-year">${e.periodo}</span>
                        </div>
                        <div class="academic-card-actions">
                            <button type="button" class="academic-btn-primary" onclick="event.stopPropagation(); window.openAcademicDirectAction('${e.id}')">
                                <i class="fa-solid ${actionIcon}"></i> ${actionLabel}
                            </button>
                            <button type="button" class="academic-btn-info" onclick="event.stopPropagation(); window.openTitleModal('${e.id}')" title="Ver Informações Completas">
                                <i class="fa-solid fa-circle-info"></i> Detalhes
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        const ACERVO_VERTICAL_POSTERS = {
            'filosofia-3ano': 'midia/capas/poster_filosofia_serie.jpg',
            'guerra-civil': 'midia/capas/poster_filosofia_serie.jpg',
            'tema-1': 'midia/capas/poster_filosofia_serie.jpg',
            'tema-3': 'midia/capas/poster_filosofia_serie.jpg',
            'tema-4': 'midia/capas/poster_filosofia_serie.jpg',
            'tema-5': 'midia/capas/poster_filosofia_serie.jpg',
            'teorias-politicas-antiguidade': 'midia/capas/poster_teorias_politicas.jpg',
            'teorias-politicas': 'midia/capas/poster_teorias_politicas.jpg',
            'guerra-fria': 'midia/capas/poster_guerra_fria.jpg',
            'literatura-realismo': 'midia/capas/poster_classicos_realismo.jpg',
            'padre-amaro': 'midia/capas/poster_classicos_realismo.jpg',
            'primo-basilio': 'midia/capas/poster_classicos_realismo.jpg',
            'memorias-postumas': 'midia/capas/poster_classicos_realismo.jpg',
            'dom-casmurro': 'midia/capas/poster_classicos_realismo.jpg',
            'padre-amaro-jogo': 'midia/capas/poster_classicos_realismo.jpg',
            'sargento-milicias': 'midia/capas/poster_sargento_milicias.jpg',
            'prosa-1930': 'midia/capas/poster_prosa_1930.jpg',
            'ia-ingles': 'midia/capas/poster_ia_ingles.jpg',
            'sociologia-podcasts': 'midia/capas/poster_sociologia_podcasts.jpg',
            'podcast-desigualdade': 'midia/capas/poster_sociologia_podcasts.jpg',
            'podcast-round6': 'midia/capas/poster_sociologia_podcasts.jpg',
            'sociologia-desenvolvimento': 'midia/capas/poster_sociologia_desenvolvimento.jpg',
            'seguranca-ciberdefesa': 'midia/capas/poster_defesa_cibernetica.jpg',
            'seguranca-informacao': 'midia/capas/poster_defesa_cibernetica.jpg',
            'cyber-news': 'midia/capas/poster_defesa_cibernetica.jpg',
            'hardware-arquitetura': 'midia/capas/poster_hardware_arquitetura.jpg',
            'evolucao-computadores': 'midia/capas/poster_hardware_arquitetura.jpg',
            'memoria-cache': 'midia/capas/poster_hardware_arquitetura.jpg',
            'jogo-transito': 'midia/capas/poster_jogo_transito.jpg'
        };

        function renderAcervoPosterCardHtml(grpOrEntry) {
            const isGroup = !!(grpOrEntry && grpOrEntry.items && Array.isArray(grpOrEntry.items));
            const grp = isGroup ? grpOrEntry : {
                materia: grpOrEntry.materia,
                trabalhoGrupo: grpOrEntry.trabalhoGrupo,
                periodo: grpOrEntry.periodo,
                items: [grpOrEntry]
            };
            const count = grp.items.length;
            const firstEntry = grp.items[0] || {};
            const firstItem = firstEntry.item || {};
            const firstId = firstEntry.id || '';
            const sInfo = getSeriesForMovie(firstId);

            // Selo NOVO exclusivo para os trabalhos mais recentes (Filosofia 2026)
            const isNovo = (grp.materia === 'Filosofia' || (sInfo && sInfo.materia === 'Filosofia')) &&
                           (firstId.startsWith('tema-') || firstId === 'guerra-civil' || (sInfo && sInfo.id === 'filosofia-3ano'));
            const badgeHtml = isNovo ? `
                <div class="netflix-card-badge">
                    <span class="netflix-badge-novo">NOVO</span>
                </div>
            ` : '';

            if (count === 1 && !sInfo) {
                // Trabalho individual / standalone
                const w = firstItem;
                const e = firstEntry;
                const coverFile = ACERVO_VERTICAL_POSTERS[e.id] || w.customCover || w.banner || w.bg || 
                    (w.ytTrailer ? `https://img.youtube.com/vi/${w.ytTrailer}/hqdefault.jpg` : '');
                const coverUrl = coverFile ? imgUrl(coverFile, 800) : generateAutoPosterDataUri(w.title, e.materia, w.cast);

                const safeTitle = (w.title || '').replace(/"/g, '&quot;');
                const safeAuthors = (w.cast || 'Turma IFPI').replace(/"/g, '&quot;');

                return `
                    <div class="acervo-card-portrait ${w.hasNoPdf ? 'has-no-pdf-card' : ''}" 
                         style="background-image: url('${coverUrl}');"
                         data-movie="${e.id}" 
                         onclick="window.openTitleModal('${e.id}')" 
                         role="button" tabindex="0" aria-label="${safeTitle}">
                        ${badgeHtml}
                        <div class="acervo-card-play-overlay">
                            <div class="acervo-card-play-btn"><i class="fa-solid fa-play"></i></div>
                        </div>
                        <div class="acervo-card-bottom-info">
                            <h4 class="acervo-card-title">${w.title}</h4>
                            <div class="acervo-card-meta">
                                <i class="fa-regular fa-calendar"></i> <span>${e.periodo}</span>
                            </div>
                            <div class="acervo-card-authors" title="${safeAuthors}">
                                <i class="fa-solid fa-user-group"></i> <span>${safeAuthors}</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Série ou Coleção de Trabalhos
            const isSeries = !!sInfo;
            const repImg = (sInfo && ACERVO_VERTICAL_POSTERS[sInfo.id]) || ACERVO_VERTICAL_POSTERS[firstId] || 
                (sInfo && sInfo.cover) || firstItem.customCover || firstItem.banner || firstItem.bg || 
                (firstItem.ytTrailer ? `https://img.youtube.com/vi/${firstItem.ytTrailer}/hqdefault.jpg` : '');
            const cardTitle = sInfo ? sInfo.title : grp.trabalhoGrupo;
            const cardSubtitle = sInfo ? (sInfo.season || `Série • ${count} Episódios`) : `Coleção • ${count} trabalhos`;
            const repImgUrl = repImg ? imgUrl(repImg, 800) : generateAutoPosterDataUri(cardTitle, grp.materia, firstItem.cast);

            // Roster consolidado de autores
            const authorSet = new Set();
            grp.items.forEach(e => {
                const c = (e.item.cast || '').split(',');
                c.forEach(a => { if (a.trim()) authorSet.add(a.trim()); });
            });
            const authorsList = Array.from(authorSet).slice(0, 4).join(', ') + (authorSet.size > 4 ? ' e outros' : '');
            const safeAuthors = (authorsList || firstItem.cast || 'Turma IFPI').replace(/"/g, '&quot;');
            const safeTitle = (cardTitle || '').replace(/"/g, '&quot;');

            return `
                <div class="acervo-card-portrait is-series-card" 
                     style="background-image: url('${repImgUrl}');"
                     data-movie="${firstId}" 
                     onclick="window.openTitleModal('${firstId}')" 
                     role="button" tabindex="0" aria-label="${safeTitle}">
                    ${badgeHtml}
                    <div class="acervo-card-play-overlay">
                        <div class="acervo-card-play-btn"><i class="fa-solid fa-play"></i></div>
                    </div>
                    <div class="acervo-card-bottom-info">
                        <h4 class="acervo-card-title">${cardTitle}</h4>
                        <div class="acervo-card-meta">
                            <i class="fa-solid fa-tv"></i> <span>${cardSubtitle}</span>
                        </div>
                        <div class="acervo-card-authors" title="${safeAuthors}">
                            <i class="fa-solid fa-user-group"></i> <span>${safeAuthors}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        const renderSeminarioShelfCardHtml = renderAcervoPosterCardHtml;

        window.onSeminarioCardClick = function(seminarioKey, firstMovieId, count) {
            if (firstMovieId) {
                window.openTitleModal(firstMovieId);
            } else {
                window.openSeminarioView(seminarioKey);
            }
        };

        window.scrollAcervoShelf = function(rowId, dir) {
            const row = (typeof rowId === 'string') ? document.getElementById(rowId) : rowId;
            if (!row) return;
            const amount = (row.clientWidth * 0.75) * dir;
            row.scrollBy({ left: amount, behavior: 'smooth' });
        };
        window.scrollContainerHorizontal = window.scrollAcervoShelf;

        window.renderAcervoScreen = function() {
            const entries = getAllAcervoEntries();
            const rowsContainer = document.getElementById('acervo-rows-container');
            const searchInput = document.getElementById('acervo-search-input');
            if (!rowsContainer) return;

            // 1. Atualiza Hero Billboard Banner do topo (idêntico ao da Home)
            updateAcervoHeroDOM();

            const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

            // 2. Contagem e ordenação canônica por Matéria
            const matCounts = {};
            entries.forEach(e => {
                matCounts[e.materia] = (matCounts[e.materia] || 0) + 1;
            });

            const materiaOrder = [
                'Filosofia', 
                'Sociologia', 
                'Língua Portuguesa', 
                'História', 
                'Hardware & Arquitetura', 
                'Segurança & Redes',
                'Tópicos Especiais em Desenvolvimento',
                'Programação & T.I.', 
                'Língua Inglesa'
            ];

            const sortedMaterias = Object.keys(matCounts).sort((a, b) => {
                const idxA = materiaOrder.indexOf(a);
                const idxB = materiaOrder.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
            });

            // Filtragem
            const filtered = entries.filter(e => {
                if (currentAcervoMateria !== 'all' && e.materia !== currentAcervoMateria) return false;
                if (currentAcervoFormat === 'pdf' && !e.hasPdf) return false;
                if (currentAcervoFormat === 'video' && !e.hasVideo) return false;
                if (currentAcervoAuthor) {
                    if (!workHasStudent(e.item.cast, currentAcervoAuthor)) return false;
                }
                if (query) {
                    const hay = `${e.item.title} ${e.item.subtitle || ''} ${e.item.cast || ''} ${e.item.synopsis || ''} ${e.materia} ${e.trabalhoGrupo}`.toLowerCase();
                    if (!hay.includes(query)) return false;
                }
                return true;
            });

            // 1. Coleções dos Trabalhos (Disney+ Collection Shelf - Filtro Visual Principal)
            const disneyShelfHtml = `
                <div class="catalog-section disney-collections-section" style="margin-bottom: 34px;">
                    <h2 class="row-title" style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-shapes" style="color: var(--netflix-red); font-size: 1.1rem;"></i>
                            <span>Coleções dos Trabalhos</span>
                        </span>
                        ${currentAcervoMateria !== 'all' ? `
                            <button type="button" onclick="window.setAcervoMateria('all')" style="background: rgba(229,9,20,0.18); border: 1px solid var(--netflix-red); color: #fff; padding: 5px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <i class="fa-solid fa-arrow-left"></i> Ver Todas as Coleções
                            </button>
                        ` : ''}
                    </h2>
                    <div class="acervo-shelf-slider-container">
                        <button type="button" class="acervo-slider-nav-btn prev" aria-label="Voltar" onclick="window.scrollAcervoShelf('acervo-disney-collections-shelf', -1)">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <div class="disney-collections-row" id="acervo-disney-collections-shelf">
                            ${DISNEY_HOME_COLLECTIONS.map(c => {
                                const isActive = currentAcervoMateria === c.materia;
                                return `
                                    <div class="disney-col-card ${isActive ? 'active' : ''}" 
                                         style="background-image: url('${c.img}');" 
                                         onclick="window.setAcervoMateria('${isActive ? 'all' : c.materia.replace(/'/g, "\\'")}')" 
                                         role="button" tabindex="0" 
                                         title="${isActive ? 'Clique para ver todas' : 'Filtrar por ' + c.title}"
                                         aria-label="Coleção ${c.title}">
                                        <div class="disney-col-card-shine"></div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <button type="button" class="acervo-slider-nav-btn next" aria-label="Avançar" onclick="window.scrollAcervoShelf('acervo-disney-collections-shelf', 1)">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;

            if (!filtered.length) {
                rowsContainer.innerHTML = `
                    ${disneyShelfHtml}
                    <div style="text-align:center; padding: 70px 20px; color: #888;">
                        <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 16px; color: #444;"></i>
                        <h3 style="color:#fff; font-size: 1.3rem; margin-bottom: 8px;">Nenhum trabalho encontrado</h3>
                        <p style="font-size: 0.95rem;">Experimente selecionar outra coleção ou limpar a busca.</p>
                        ${currentAcervoAuthor ? `<button onclick="window.clearAcervoAuthorFilter()" style="margin-top:14px; background:var(--netflix-red); border:none; color:#fff; padding:8px 18px; border-radius:4px; cursor:pointer; font-weight:bold;">Limpar filtro de aluno</button>` : ''}
                    </div>
                `;
                initTurboObserver();
                return;
            }

            // MODO: Filtrado por Aluno (Portfólio Individual)
            if (currentAcervoAuthor) {
                const studentCardsHtml = filtered.map(renderAcervoPosterCardHtml).join('');
                rowsContainer.innerHTML = `
                    ${disneyShelfHtml}
                    ${renderStudentPortfolioBannerHtml(currentAcervoAuthor, filtered)}
                    <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: #bbb; font-size: 0.95rem; font-weight: 700;">
                            <i class="fa-solid fa-graduation-cap" style="color:var(--netflix-red); margin-right:6px;"></i>
                            ${filtered.length} ${filtered.length === 1 ? 'apresentação realizada' : 'apresentações realizadas'}
                        </span>
                        <button type="button" class="acervo-clear-filter-btn" onclick="window.clearAcervoAuthorFilter()" style="font-size: 0.82rem; padding: 5px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color:#fff; border-radius: 4px; cursor:pointer;">
                            <i class="fa-solid fa-arrow-left"></i> Ver Toda a Turma
                        </button>
                    </div>
                    <div class="acervo-posters-grid">
                        ${studentCardsHtml}
                    </div>
                `;
                initDragToScroll();
                initHoverAutoPlay();
                initTurboObserver();
                return;
            }

            // MODO: Filtrado por Busca Textual
            if (query) {
                const searchCardsHtml = filtered.map(renderAcervoPosterCardHtml).join('');
                rowsContainer.innerHTML = `
                    ${disneyShelfHtml}
                    <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: #bbb; font-size: 1rem; font-weight: 700;">
                            Resultados para "${query}": ${filtered.length} ${filtered.length === 1 ? 'trabalho' : 'trabalhos'}
                        </span>
                        <button type="button" onclick="document.getElementById('acervo-search-input').value=''; window.renderAcervoScreen();" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color:#fff; padding: 6px 14px; border-radius: 4px; cursor:pointer;">
                            Limpar busca
                        </button>
                    </div>
                    <div class="acervo-posters-grid">
                        ${searchCardsHtml}
                    </div>
                `;
                initDragToScroll();
                initHoverAutoPlay();
                initTurboObserver();
                return;
            }

            // MODO: Filtrado por Matéria Específica
            if (currentAcervoMateria !== 'all') {
                const st = getMateriaStyle(currentAcervoMateria);
                // Agrupa em séries/coleções para exibição limpa
                const matGroupsMap = new Map();
                filtered.forEach(e => {
                    const key = `${e.materia}|||${e.trabalhoGrupo}`;
                    if (!matGroupsMap.has(key)) {
                        matGroupsMap.set(key, {
                            key: key,
                            materia: e.materia,
                            trabalhoGrupo: e.trabalhoGrupo,
                            periodo: e.periodo,
                            items: []
                        });
                    }
                    matGroupsMap.get(key).items.push(e);
                });

                const matCardsHtml = Array.from(matGroupsMap.values()).map(renderAcervoPosterCardHtml).join('');
                const countSubtitle = matGroupsMap.size === filtered.length
                    ? `${filtered.length} ${filtered.length === 1 ? 'trabalho disponível' : 'trabalhos disponíveis'}`
                    : `${matGroupsMap.size} ${matGroupsMap.size === 1 ? 'série / coleção' : 'séries / coleções'} • ${filtered.length} apresentações`;

                rowsContainer.innerHTML = `
                    ${disneyShelfHtml}
                    <div class="acervo-focused-materia-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                        <div class="acervo-shelf-title-group" style="display: flex; align-items: center; gap: 10px;">
                            <span class="acervo-shelf-badge" style="background: ${st.color}; padding: 4px 8px; border-radius: 4px; color: #fff; font-size: 0.9rem;">
                                <i class="${st.icon}"></i>
                            </span>
                            <div>
                                <h2 class="row-title acervo-shelf-title" style="margin: 0; font-size: 1.4rem;">${currentAcervoMateria}</h2>
                                <span style="font-size: 0.82rem; color: #888;">${countSubtitle}</span>
                            </div>
                        </div>
                        <button type="button" class="acervo-clear-filter-btn" onclick="window.setAcervoMateria('all')" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color:#fff; padding: 6px 14px; border-radius: 4px; cursor:pointer; font-weight:600;">
                            <i class="fa-solid fa-arrow-left"></i> Ver Todas as Coleções
                        </button>
                    </div>
                    <div class="acervo-posters-grid">
                        ${matCardsHtml}
                    </div>
                `;
                initDragToScroll();
                initHoverAutoPlay();
                initTurboObserver();
                return;
            }

            // MODO PADRÃO: TODAS AS MATÉRIAS (MESMO DESIGN DA TELA INICIAL)
            // 2. Apresentações & Slides da Turma
            const slidesEntries = entries.filter(e => e.hasPdf || e.item.pdf || e.item.slideKey || e.item.isSecurityPresentation);
            const slidesGroupsMap = new Map();
            slidesEntries.forEach(e => {
                const key = `${e.materia}|||${e.trabalhoGrupo}`;
                if (!slidesGroupsMap.has(key)) {
                    slidesGroupsMap.set(key, {
                        key: key,
                        materia: e.materia,
                        trabalhoGrupo: e.trabalhoGrupo,
                        periodo: e.periodo,
                        items: []
                    });
                }
                slidesGroupsMap.get(key).items.push(e);
            });
            const slidesCardsHtml = Array.from(slidesGroupsMap.values()).map(renderAcervoPosterCardHtml).join('');

            const slidesShelfHtml = `
                <div class="catalog-section" style="margin-bottom: 34px;">
                    <h2 class="row-title" style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-file-powerpoint" style="color: var(--netflix-red); font-size: 1.1rem;"></i>
                            <span>Apresentações &amp; Slides da Turma</span>
                        </span>
                        <span style="font-size: 0.84rem; color: #888; font-weight: normal;">${slidesGroupsMap.size} seminários em slides</span>
                    </h2>
                    <div class="acervo-shelf-slider-container">
                        <button type="button" class="acervo-slider-nav-btn prev" aria-label="Voltar" onclick="window.scrollAcervoShelf('acervo-slides-row-shelf', -1)">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <div class="landscape-row acervo-row-slider" id="acervo-slides-row-shelf">
                            ${slidesCardsHtml}
                        </div>
                        <button type="button" class="acervo-slider-nav-btn next" aria-label="Avançar" onclick="window.scrollAcervoShelf('acervo-slides-row-shelf', 1)">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;

            // 3. Podcasts & Debates em Vídeo
            const podcastEntries = entries.filter(e => 
                e.id.includes('podcast') || e.id === 'cyber-news' || e.trabalhoGrupo.toLowerCase().includes('podcast') || (e.materia === 'Sociologia' && e.hasVideo)
            );
            const podcastGroupsMap = new Map();
            podcastEntries.forEach(e => {
                const key = `${e.materia}|||${e.trabalhoGrupo}`;
                if (!podcastGroupsMap.has(key)) {
                    podcastGroupsMap.set(key, {
                        key: key,
                        materia: e.materia,
                        trabalhoGrupo: e.trabalhoGrupo,
                        periodo: e.periodo,
                        items: []
                    });
                }
                podcastGroupsMap.get(key).items.push(e);
            });
            const podcastCardsHtml = Array.from(podcastGroupsMap.values()).map(renderAcervoPosterCardHtml).join('');

            const podcastsShelfHtml = `
                <div class="catalog-section" style="margin-bottom: 34px;">
                    <h2 class="row-title" style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-podcast" style="color: var(--netflix-red); font-size: 1.1rem;"></i>
                            <span>Podcasts &amp; Debates em Vídeo</span>
                        </span>
                        <span style="font-size: 0.84rem; color: #888; font-weight: normal;">Produções em áudio e vídeo</span>
                    </h2>
                    <div class="acervo-shelf-slider-container">
                        <button type="button" class="acervo-slider-nav-btn prev" aria-label="Voltar" onclick="window.scrollAcervoShelf('acervo-podcasts-row-shelf', -1)">
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <div class="landscape-row acervo-row-slider" id="acervo-podcasts-row-shelf">
                            ${podcastCardsHtml}
                        </div>
                        <button type="button" class="acervo-slider-nav-btn next" aria-label="Avançar" onclick="window.scrollAcervoShelf('acervo-podcasts-row-shelf', 1)">
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;

            // 4. Elenco da Turma • Alunos
            const studentsShelfHtml = renderStudentsRowHtml(entries);

            // 5. Fileiras por Matéria (Filosofia, Sociologia, Literatura, História, Hardware, Cyber Defesa...)
            const materiasMap = new Map();
            filtered.forEach(e => {
                if (!materiasMap.has(e.materia)) {
                    materiasMap.set(e.materia, []);
                }
                materiasMap.get(e.materia).push(e);
            });

            const shelvesHtml = sortedMaterias.filter(m => materiasMap.has(m)).map((matName, idx) => {
                const items = materiasMap.get(matName);
                const st = getMateriaStyle(matName);
                const slug = matName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const rowId = `acervo-shelf-row-${slug}-${idx}`;
                
                const matGroupsMap = new Map();
                items.forEach(e => {
                    const key = `${e.materia}|||${e.trabalhoGrupo}`;
                    if (!matGroupsMap.has(key)) {
                        matGroupsMap.set(key, {
                            key: key,
                            materia: e.materia,
                            trabalhoGrupo: e.trabalhoGrupo,
                            periodo: e.periodo,
                            items: []
                        });
                    }
                    matGroupsMap.get(key).items.push(e);
                });

                const cardsHtml = Array.from(matGroupsMap.values()).map(renderAcervoPosterCardHtml).join('');
                const safeMat = matName.replace(/'/g, "\\'");
                const groupCount = matGroupsMap.size;
                const workCount = items.length;
                const countBadgeText = groupCount === workCount 
                    ? `${workCount} ${workCount === 1 ? 'trabalho' : 'trabalhos'}`
                    : `${groupCount} ${groupCount === 1 ? 'série / coleção' : 'séries / coleções'} • ${workCount} apresentações`;

                return `
                    <div class="catalog-section acervo-subject-shelf" id="acervo-shelf-${slug}" style="margin-bottom: 34px;">
                        <div class="acervo-shelf-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                            <div class="acervo-shelf-title-group" style="display: flex; align-items: center; gap: 10px;">
                                <span class="acervo-shelf-badge" style="background: ${st.color}; padding: 4px 8px; border-radius: 4px; color: #fff; font-size: 0.85rem;">
                                    <i class="${st.icon}"></i>
                                </span>
                                <h2 class="row-title acervo-shelf-title" style="margin: 0; font-size: 1.35rem; font-weight: bold; color: #e5e5e5;">${matName}</h2>
                                <span class="acervo-shelf-count" style="font-size: 0.82rem; color: #888;">${countBadgeText}</span>
                            </div>
                            <button type="button" class="acervo-shelf-filter-btn" onclick="window.setAcervoMateria('${safeMat}')" style="background: transparent; border: none; color: #aaa; font-size: 0.88rem; font-weight: 600; cursor: pointer;">
                                Explorar ${matName} <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                        <div class="acervo-shelf-slider-container">
                            <button type="button" class="acervo-slider-nav-btn prev" aria-label="Voltar" onclick="window.scrollAcervoShelf('${rowId}', -1)">
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <div class="landscape-row acervo-row-slider" id="${rowId}">
                                ${cardsHtml}
                            </div>
                            <button type="button" class="acervo-slider-nav-btn next" aria-label="Avançar" onclick="window.scrollAcervoShelf('${rowId}', 1)">
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Renderiza estrutura idêntica à Home (sem a barra duplicada de pílulas)
            rowsContainer.innerHTML = `
                ${disneyShelfHtml}
                ${slidesShelfHtml}
                ${podcastsShelfHtml}
                ${studentsShelfHtml}
                <div class="acervo-shelves-container">
                    ${shelvesHtml}
                </div>
            `;
            initDragToScroll();
            initHoverAutoPlay();
            initTurboObserver();
            window.resumeAcervoHeroTimer();
        };

        /* =========================================================
           FEATURE 5: PAINEL E ENVIO DE TRABALHO (INDIVIDUAL + LOTE)
           ========================================================= */
        function updateTeacherUi(name) {
            const isProf = (name || '').toLowerCase().includes('prof');
            const uploadBtn = document.getElementById('btn-professor-upload');
            const uploadAcervoBtn = document.getElementById('btn-acervo-upload');
            const uploadDropdown = document.getElementById('dropdown-upload-item');
            if (uploadBtn) uploadBtn.style.display = isProf ? 'inline-flex' : 'none';
            if (uploadAcervoBtn) uploadAcervoBtn.style.display = isProf ? 'inline-flex' : 'none';
            if (uploadDropdown) uploadDropdown.style.display = isProf ? 'flex' : 'none';
            document.querySelectorAll('.dropdown-item.teacher-only').forEach(el => {
                el.style.display = isProf ? 'flex' : 'none';
            });
        }

        window.switchSubmitTab = function(mode) {
            const singleForm = document.getElementById('form-submit-work');
            const bulkForm = document.getElementById('form-bulk-work');
            const btnSingle = document.getElementById('tab-btn-single');
            const btnBulk = document.getElementById('tab-btn-bulk');
            if (singleForm) singleForm.style.display = mode === 'single' ? 'block' : 'none';
            if (bulkForm) bulkForm.style.display = mode === 'bulk' ? 'block' : 'none';
            if (btnSingle) btnSingle.classList.toggle('active', mode === 'single');
            if (btnBulk) btnBulk.classList.toggle('active', mode === 'bulk');
        };

        window.openSubmitWorkModal = function(defaultMode) {
            const modal = document.getElementById('submit-work-modal');
            if (defaultMode) window.switchSubmitTab(defaultMode);
            if (modal) {
                modal.classList.add('show');
                const firstInput = document.getElementById('sw-title');
                if (firstInput && defaultMode !== 'bulk') setTimeout(() => firstInput.focus(), 150);
            }
        };

        window.closeSubmitWorkModal = function(e, force = false) {
            if (force || (e && e.target.id === 'submit-work-modal')) {
                const modal = document.getElementById('submit-work-modal');
                if (modal) modal.classList.remove('show');
            }
        };

        window.onWorkThemeChange = function() {
            const sel = document.getElementById('sw-cover-theme');
            const inp = document.getElementById('sw-cover');
            if (sel && sel.value && inp) {
                inp.placeholder = `Estilo visual selecionado: ${sel.options[sel.selectedIndex].text}`;
            }
        };

        function getSavedTeacherWorks() {
            try {
                const raw = localStorage.getItem('ifpiflix_teacher_works');
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        }

        function saveTeacherWorksToStorage(works) {
            try {
                localStorage.setItem('ifpiflix_teacher_works', JSON.stringify(works));
            } catch (e) {}
        }

        function buildWorkEntry({ title, category, workGroup, authors, year, synopsis, pdfUrl, trailerUrl, coverUrl, coverTheme }) {
            const ytId = extractYouTubeId(trailerUrl);
            const workId = 'trabalho-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            const finalGroup = (workGroup || '').trim() || `Trabalhos e Seminários de ${category}`;
            const finalAuthors = (authors || '').trim() || 'Alunos da Turma IFPI';
            const finalSynopsis = (synopsis || '').trim() || `Trabalho acadêmico de ${category} (${finalGroup}) desenvolvido por ${finalAuthors}.`;

            // Se não tiver capa personalizada: usa thumbnail do YouTube (se for vídeo) ou gera pôster SVG automático da matéria!
            let autoCover = coverUrl;
            if (!autoCover) {
                if (ytId) {
                    autoCover = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                } else {
                    autoCover = generateAutoPosterDataUri(title, category, finalAuthors);
                }
            }

            return {
                id: workId,
                title: title,
                subtitle: finalGroup.toUpperCase(),
                materia: category,
                trabalhoGrupo: finalGroup,
                periodo: year || '2026 • 1º Bimestre',
                bg: autoCover,
                banner: autoCover,
                pdf: pdfUrl || '',
                ytTrailer: ytId || '',
                match: "99% Relevante",
                year: (year || '2026').split('•')[0].trim(),
                age: "Livre",
                duration: pdfUrl && ytId ? "PDF + Vídeo" : (pdfUrl ? "Slides / PDF" : "Vídeo"),
                synopsis: finalSynopsis,
                cast: finalAuthors,
                genres: category,
                tags: `${category}, ${finalGroup}`,
                isMain: false,
                coverTheme: coverTheme || '',
                customCover: autoCover,
                dateAdded: new Date().toISOString()
            };
        }

        window.saveNewWork = function(e) {
            if (e) e.preventDefault();
            const title = (document.getElementById('sw-title').value || '').trim();
            const category = document.getElementById('sw-category').value || 'Filosofia';
            const workGroup = (document.getElementById('sw-work-group') ? document.getElementById('sw-work-group').value : '').trim();
            const authors = (document.getElementById('sw-authors').value || '').trim();
            const year = (document.getElementById('sw-year').value || '2026 • 1º Bimestre').trim();
            const synopsis = (document.getElementById('sw-synopsis').value || '').trim();
            const pdfUrl = (document.getElementById('sw-pdf').value || '').trim();
            const trailerUrl = (document.getElementById('sw-trailer').value || '').trim();
            const coverUrl = (document.getElementById('sw-cover').value || '').trim();
            const coverTheme = document.getElementById('sw-cover-theme').value || '';

            if (!title || !authors) {
                window.showToastNotification('Por favor, preencha o título e os integrantes.');
                return;
            }

            const newWork = buildWorkEntry({
                title, category, workGroup, authors, year, synopsis, pdfUrl, trailerUrl, coverUrl, coverTheme
            });

            filmesDB[newWork.id] = newWork;
            const saved = getSavedTeacherWorks();
            saved.unshift(newWork);
            saveTeacherWorksToStorage(saved);

            renderTeacherWorks();
            if (typeof window.renderAcervoScreen === 'function') window.renderAcervoScreen();
            window.closeSubmitWorkModal(null, true);
            const form = document.getElementById('form-submit-work');
            if (form) form.reset();
            window.showToastNotification(`Trabalho "${title}" adicionado à matéria ${category}!`);
        };

        window.saveBulkWorks = function(e) {
            if (e) e.preventDefault();
            const category = document.getElementById('bw-category').value || 'Filosofia';
            const workGroup = (document.getElementById('bw-work-group').value || '').trim() || `Seminário de ${category}`;
            const year = (document.getElementById('bw-year').value || '2025 • Acervo da Turma').trim();
            const rawLines = (document.getElementById('bw-lines').value || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);

            if (!rawLines.length) {
                window.showToastNotification('Cole pelo menos uma linha para importar.');
                return;
            }

            const saved = getSavedTeacherWorks();
            let count = 0;

            rawLines.forEach((line, idx) => {
                const parts = line.split('|').map(p => p.trim()).filter(Boolean);
                let title = '', authors = 'Turma IFPI', link = '';

                if (parts.length >= 3) {
                    title = parts[0];
                    authors = parts[1];
                    link = parts.slice(2).join(' ');
                } else if (parts.length === 2) {
                    title = parts[0];
                    link = parts[1];
                } else {
                    link = parts[0];
                    // Deduce title from filename or YouTube link
                    const cleanName = link.split('/').pop().replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ');
                    title = cleanName && !link.includes('youtube.com') && !link.includes('youtu.be')
                        ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
                        : `${workGroup} #${idx + 1}`;
                }

                let pdfUrl = '';
                let trailerUrl = '';
                if (link.toLowerCase().endsWith('.pdf') || link.includes('drive.google.com') || link.includes('canva.com') || link.startsWith('trabalhos/')) {
                    pdfUrl = link;
                } else if (extractYouTubeId(link)) {
                    trailerUrl = link;
                } else if (link.startsWith('http')) {
                    pdfUrl = link;
                }

                const entry = buildWorkEntry({
                    title,
                    category,
                    workGroup,
                    authors,
                    year,
                    synopsis: `Trabalho da barra "${workGroup}" na disciplina de ${category}, apresentado por ${authors}.`,
                    pdfUrl,
                    trailerUrl,
                    coverUrl: '',
                    coverTheme: ''
                });

                filmesDB[entry.id] = entry;
                saved.unshift(entry);
                count++;
            });

            saveTeacherWorksToStorage(saved);
            renderTeacherWorks();
            if (typeof window.renderAcervoScreen === 'function') window.renderAcervoScreen();
            window.closeSubmitWorkModal(null, true);
            const form = document.getElementById('form-bulk-work');
            if (form) form.reset();
            window.showToastNotification(`${count} ${count === 1 ? 'trabalho importado' : 'trabalhos importados'} com sucesso em "${workGroup}"!`);
        };

        function renderTeacherWorks() {
            const container = document.getElementById('teacher-works-container');
            const grid = document.getElementById('teacher-works-grid');
            if (!container || !grid) return;
            
            const works = getSavedTeacherWorks();
            if (!works.length) {
                container.style.display = 'none';
                return;
            }

            works.forEach(w => {
                if (!w.customCover) {
                    w.customCover = w.ytTrailer
                        ? `https://img.youtube.com/vi/${w.ytTrailer}/hqdefault.jpg`
                        : generateAutoPosterDataUri(w.title, w.materia || w.genres, w.cast);
                    w.bg = w.customCover;
                    w.banner = w.customCover;
                }
                filmesDB[w.id] = w;
            });

            container.style.display = 'block';
            grid.innerHTML = works.map(w => {
                const bgStyle = w.customCover ? `background-image: url('${w.customCover}'); background-size: cover; background-position: center;` : '';
                const themeClass = w.coverTheme || '';
                return `
                    <div class="card-portrait ${themeClass}" style="${bgStyle}" data-movie="${w.id}" role="button" tabindex="0" aria-label="${w.title}">
                        <div class="card-portrait-content" style="display:flex !important;">
                            <span style="font-size: 0.65rem; color: #60a5fa; font-weight: bold; margin-bottom: 4px;">${w.materia || w.genres || 'ACERVO'}</span>
                            <h4>${w.title}</h4>
                        </div>
                    </div>
                `;
            }).join('');
        }

        /* =========================================================
           BOTÃO SURPREENDA-ME (ROLETA DE FILMES)
           ========================================================= */
        window.triggerSurpriseMe = function() {
            const keys = Object.keys(filmesDB);
            if (!keys.length) return;
            const btn = document.getElementById('btn-surprise-me');
            if (btn) btn.classList.add('spinning');

            const choices = keys.filter(k => k !== currentModalMovieId);
            const chosen = choices[Math.floor(Math.random() * choices.length)] || keys[0];

            setTimeout(() => {
                if (btn) btn.classList.remove('spinning');
                window.closeTitleModal(null, true);
                setTimeout(() => {
                    window.openTitleModal(chosen, true);
                }, 150);
            }, 300);
        };

        /* =========================================================
           SISTEMA DE AVALIAÇÃO (👍 / 🔥 / 👎 ESTILO NETFLIX)
           ========================================================= */
        function getSavedRatings() {
            try {
                const raw = localStorage.getItem('ifpiflix_ratings');
                return raw ? JSON.parse(raw) : {};
            } catch (e) {
                return {};
            }
        }

        function updateRatingButton(movieId) {
            const rateBtn = document.getElementById('m-btn-rate');
            if (!rateBtn) return;
            const ratings = getSavedRatings();
            const current = ratings[movieId];
            const icon = rateBtn.querySelector('i');
            if (!icon) return;
            if (current === 'love') {
                icon.className = 'fa-solid fa-fire';
                icon.style.color = '#ff334b';
                rateBtn.setAttribute('title', 'Classificação: Amei!');
            } else if (current === 'like') {
                icon.className = 'fa-solid fa-thumbs-up';
                icon.style.color = '#46d369';
                rateBtn.setAttribute('title', 'Classificação: Gostei');
            } else if (current === 'dislike') {
                icon.className = 'fa-solid fa-thumbs-down';
                icon.style.color = '#aaa';
                rateBtn.setAttribute('title', 'Classificação: Não é para mim');
            } else {
                icon.className = 'fa-regular fa-thumbs-up';
                icon.style.color = '';
                rateBtn.setAttribute('title', 'Classificar');
            }
        }

        window.toggleRatePopover = function(e) {
            if (e) e.stopPropagation();
            const popover = document.getElementById('rate-popover');
            if (popover) popover.classList.toggle('open');
        };

        window.setRating = function(type) {
            if (!currentModalMovieId) return;
            const ratings = getSavedRatings();
            if (ratings[currentModalMovieId] === type) {
                delete ratings[currentModalMovieId];
                window.showToastNotification('Classificação removida.');
            } else {
                ratings[currentModalMovieId] = type;
                const msg = type === 'love' ? 'Você amou este título! 🔥' : (type === 'like' ? 'Avaliado como Gostei! 👍' : 'Avaliado como Não é para mim. 👎');
                window.showToastNotification(msg);
            }
            try {
                localStorage.setItem('ifpiflix_ratings', JSON.stringify(ratings));
            } catch (e) {}
            updateRatingButton(currentModalMovieId);
            const popover = document.getElementById('rate-popover');
            if (popover) popover.classList.remove('open');
        };

        document.addEventListener('click', () => {
            const popover = document.getElementById('rate-popover');
            if (popover) popover.classList.remove('open');
        });

        /* =========================================================
           COMPARTILHAMENTO SOCIAL (SEO, DEEP LINK & WEB SHARE)
           ========================================================= */
        window.shareCurrentMovie = function() {
            const data = filmesDB[currentModalMovieId] || filmesDB['guerra-civil'];
            const url = window.location.origin + window.location.pathname + '?filme=' + encodeURIComponent(currentModalMovieId);
            const shareData = {
                title: `IFPIFLIX — ${data.title}`,
                text: `Confira "${data.title}" no catálogo da IFPIFLIX:`,
                url: url
            };
            if (navigator.share) {
                navigator.share(shareData).catch(() => {});
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    window.showToastNotification('Link copiado para a área de transferência! 📋');
                }).catch(() => {
                    prompt('Copie o link abaixo:', url);
                });
            } else {
                prompt('Copie o link abaixo:', url);
            }
        };

        let toastNotifTimeout;
        window.showToastNotification = function(msg) {
            const toast = document.getElementById('global-toast');
            const msgEl = document.getElementById('global-toast-msg');
            if (!toast || !msgEl) return;
            msgEl.textContent = msg;
            toast.classList.add('show');
            clearTimeout(toastNotifTimeout);
            toastNotifTimeout = setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        };

        /* =========================================================
           MENU SUSPENSO DO PERFIL: AÇÕES DO DROPDOWN
           ========================================================= */
        const infoModalContent = {
            conta: {
                title: "CONTA",
                icon: "fa-solid fa-user-gear",
                body: "<p>Plano: IFPIFLIX Acadêmico (Gratuito)</p><p>Este é um projeto acadêmico de Filosofia do Grupo 6. Não há cobranças ou assinaturas reais.</p>"
            },
            ajuda: {
                title: "CENTRAL DE AJUDA",
                icon: "fa-solid fa-circle-question",
                body: "<p>Bem-vindo à IFPIFLIX! Use as setas do teclado ou deslize o dedo para navegar entre os slides.</p><p>Clique nos cards do catálogo para ver detalhes de cada tema.</p><p>Em caso de dúvidas sobre o conteúdo, consulte o professor responsável.</p>"
            }
        };

        window.openInfoModal = function(type) {
            const overlay = document.getElementById('info-modal-overlay');
            const data = infoModalContent[type] || infoModalContent.ajuda;
            let bodyHtml = '<div class="info-icon"><i class="' + data.icon + '"></i></div>' + data.body;
            if (type === 'conta') {
                bodyHtml = '<div class="info-icon"><i class="' + data.icon + '"></i></div>' +
                           "<p>Perfil ativo: <strong style='color:#fff'>" + (activeProfile || "Davi") + "</strong></p>" + data.body;
            }
            document.getElementById('info-modal-title').textContent = data.title;
            document.getElementById('info-modal-body').innerHTML = bodyHtml;
            overlay.classList.add('show');
        }

        window.closeInfoModal = function(e, force) {
            if (force || e.target.id === 'info-modal-overlay') {
                document.getElementById('info-modal-overlay').classList.remove('show');
            }
        }

        window.logoutIfpiflix = function() {
            activeProfile = "Admin";
            document.querySelectorAll('.nav-profile-name').forEach(el => { el.textContent = "Admin"; });
            const oldEl = document.getElementById('nav-profile-name');
            if (oldEl) oldEl.textContent = "Admin";
            if (typeof window.renderProfiles === 'function') window.renderProfiles();
            window.switchScreen('profile-screen');
        }

        /* =========================================================
           CONTINUAR ASSISTINDO (Estilo Netflix)
           ========================================================= */
        function saveWatchProgress(mode, idx) {
            if (!activeProfile || idx < 0 || idx >= script.length) return;
            // Se chegou ao último slide (slide 13 / fim), limpa o progresso pois já terminou
            if (idx >= script.length - 1) {
                try {
                    localStorage.removeItem('ifpiflix_progress_' + activeProfile);
                } catch(e) {}
                renderContinueWatching();
                return;
            }
            const data = {
                mode: mode, // 'cine' | 'classic'
                idx: idx,
                stepId: script[idx].id,
                title: script[idx].title,
                presenter: script[idx].presenter,
                percent: Math.min(100, Math.max(8, Math.round(((idx + 1) / script.length) * 100))),
                timestamp: Date.now()
            };
            try {
                localStorage.setItem('ifpiflix_progress_' + activeProfile, JSON.stringify(data));
            } catch(e) {}
            renderContinueWatching();
        }

        function renderContinueWatching() {
            const container = document.getElementById('continue-watching-container');
            const grid = document.getElementById('continue-watching-grid');
            const titleEl = document.getElementById('continue-watching-title');
            if (!container || !grid) return;

            let saved = null;
            try {
                const raw = localStorage.getItem('ifpiflix_progress_' + activeProfile);
                if (raw) saved = JSON.parse(raw);
            } catch(e) {}

            if (!saved || typeof saved.idx !== 'number' || saved.idx >= script.length - 1) {
                container.style.display = 'none';
                grid.innerHTML = '';
                return;
            }

            if (titleEl) {
                titleEl.textContent = `Continuar assistindo como ${activeProfile}`;
            }

            const isCine = saved.mode === 'cine';
            const modoTexto = isCine ? 'Filme 3D' : 'Apresentação Clássica';
            const thumbUrl = imgUrl('banner.png', 400);

            grid.innerHTML = `
                <div class="continue-watching-card" role="button" tabindex="0" onclick="window.resumeWatchProgress()" aria-label="Continuar assistindo ${saved.title}">
                    <div class="cw-thumb" style="background-image: url('${thumbUrl}')">
                        <div class="cw-play-badge"><i class="fa-solid fa-play"></i></div>
                        <button type="button" class="cw-dismiss-btn" onclick="window.dismissContinueWatching(event)" aria-label="Remover de continuar assistindo" title="Remover"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="cw-progress-bar">
                        <div class="cw-progress-fill" style="width: ${saved.percent}%;"></div>
                    </div>
                    <div class="cw-info">
                        <div class="cw-title">Guerra Civil: ${modoTexto}</div>
                        <div class="cw-subtitle">
                            <span>${saved.title}</span>
                            <span>${saved.percent}%</span>
                        </div>
                    </div>
                </div>
            `;
            container.style.display = 'block';
        }

        window.resumeWatchProgress = function() {
            try {
                const raw = localStorage.getItem('ifpiflix_progress_' + activeProfile);
                if (!raw) return;
                const saved = JSON.parse(raw);
                if (saved.mode === 'cine') {
                    window.startCinematicMovieAt(saved.stepId);
                } else {
                    window.startPresentationAt(saved.stepId);
                }
            } catch(e) {}
        }

        window.dismissContinueWatching = function(e) {
            if (e) e.stopPropagation();
            try {
                localStorage.removeItem('ifpiflix_progress_' + activeProfile);
            } catch(err) {}
            renderContinueWatching();
        }

        /* =========================================================
           GAVETA DE CENAS / CAPÍTULOS NO PLAYER
           ========================================================= */
        window.toggleScenesDrawer = function(show) {
            const overlay = document.getElementById('scenes-drawer-overlay');
            if (!overlay) return;
            const willShow = (show !== undefined) ? show : !overlay.classList.contains('show');
            if (willShow) {
                const currentIdx = document.getElementById('player-screen').classList.contains('active') 
                    ? currentSlide 
                    : currentCineIdx;
                const list = document.getElementById('scenes-drawer-list');
                if (list) {
                    list.innerHTML = script.map((s, i) => `
                        <div class="scene-item-card ${i === currentIdx ? 'current' : ''}" role="button" tabindex="0" onclick="window.jumpToScene(${i})">
                            <div class="scene-item-num">${String(i + 1).padStart(2, '0')}</div>
                            <div class="scene-item-info">
                                <h4>${s.title}</h4>
                                <p>${s.tickers && s.tickers[0] ? s.tickers[0] : 'Cena do filme'}</p>
                            </div>
                            <span class="scene-item-presenter">🗣 ${s.presenter}</span>
                        </div>
                    `).join('');
                }
                overlay.classList.add('show');
            } else {
                overlay.classList.remove('show');
            }
        }

        window.jumpToScene = function(idx) {
            window.toggleScenesDrawer(false);
            if (idx < 0 || idx >= script.length) return;
            if (document.getElementById('cinematic-stage').classList.contains('active')) {
                updateCineCamera(idx);
            } else if (document.getElementById('player-screen').classList.contains('active')) {
                renderSlide(idx);
            } else {
                window.startCinematicMovieAt(script[idx].id);
            }
        }

        /* =========================================================
           GUIA DE ESTUDOS (RESUMO EM 1 PÁGINA)
           ========================================================= */
        let openedResumoFromEpisodes = false;

        window.openResumoModal = function(fromEpisodes = false) {
            if (fromEpisodes) {
                openedResumoFromEpisodes = true;
            }
            const overlay = document.getElementById('resumo-modal-overlay');
            if (overlay) overlay.classList.add('show');
        }

        window.closeResumoModal = function(e, force) {
            if (force || (e && e.target.id === 'resumo-modal-overlay')) {
                const overlay = document.getElementById('resumo-modal-overlay');
                if (overlay) overlay.classList.remove('show');
                if (openedResumoFromEpisodes) {
                    openedResumoFromEpisodes = false;
                    setTimeout(() => {
                        if (typeof window.openTitleModal === 'function') {
                            window.openTitleModal('guerra-civil');
                        }
                    }, 180);
                }
            }
        }

        /* =========================================================
           SAÍDA DO QUIZ (RETORNA AOS EPISÓDIOS DE GUERRA CIVIL)
           ========================================================= */
        window.exitQuiz = function() {
            window.switchScreen('home-screen');
            setTimeout(() => {
                if (typeof window.openTitleModal === 'function') {
                    window.openTitleModal('guerra-civil');
                }
            }, 180);
        }
        
        let currentPresenter = "";

        window.hideTurnToast = function() {
            clearTimeout(toastTimeout);
            const toastEl = document.getElementById('turn-toast');
            if (toastEl) toastEl.classList.remove('show');
        };

        function applyPresenter(name, toast = false) {
            if (!name || name === "Todos") return;
            if (currentPresenter !== name) {
                currentPresenter = name;
                if (toast) {
                    clearTimeout(toastTimeout);
                    const toastEl = document.getElementById('turn-toast');
                    if (toastEl) {
                        const toastNameEl = document.getElementById('toast-presenter-name');
                        if (toastNameEl) toastNameEl.textContent = name;
                        toastEl.classList.add('show');
                        toastTimeout = setTimeout(() => { toastEl.classList.remove('show'); }, 3000);
                    }
                }
            }
            const curEl = document.getElementById('current-presenter-name');
            const cineEl = document.getElementById('cine-presenter-name');
            if (curEl) curEl.textContent = name;
            if (cineEl) cineEl.textContent = name;
        }

        function triggerScreenShake(screenId) {
            const screen = document.getElementById(screenId);
            if (!screen) return;
            screen.classList.remove('shake-active');
            void screen.offsetWidth;
            screen.classList.add('shake-active');
            setTimeout(() => { screen.classList.remove('shake-active'); }, 400);
        }

        /* Efeitos de cena: tremor de tela nos slides de impacto (Ruptura, Galileu e Dúvida) */
        function triggerSceneEvents(idx, isMovie) {
            const data = script[idx];
            const screenId = isMovie ? 'cinematic-stage' : 'player-screen';
            if (data.id == 4 || data.id == 6 || data.id == 10) { triggerScreenShake(screenId); }
        }

        /* PLAYER CLÁSSICO */
        function renderSlide(idx) {
            if(idx < 0) return;
            if(idx >= script.length) { 
    if(!hasPlayedFinalCredits) { playFinalCredits(); } 
    else { window.switchScreen('credits-screen'); }
    return; 
}
            
            clearInterval(tickerIntervalC);
            currentSlide = idx; 
            saveWatchProgress('classic', idx);
            const data = script[idx];
            document.getElementById('player-ep-title').textContent = data.title; 
            document.getElementById('progress-bar').style.width = `${((idx + 1) / script.length) * 100}%`;
            applyPresenter(data.presenter);
            
            document.querySelectorAll('#player-screen .slide').forEach(s => s.classList.remove('active')); 
            const targetSlide = document.getElementById(`slide-${data.id}`);
            if (targetSlide) targetSlide.classList.add('active');

            const tickerEl = document.getElementById(`ticker-${data.id}`);
            if(tickerEl && data.tickers && data.tickers.length > 0) {
                let tIdx = 0; 
                tickerEl.textContent = data.tickers[0]; 
                tickerEl.style.opacity = 1;
                tickerIntervalC = setInterval(() => {
                    tIdx = (tIdx + 1) % data.tickers.length;
                    tickerEl.style.opacity = 0;
                    setTimeout(() => { 
                        if (currentSlide === idx) { 
                            tickerEl.textContent = data.tickers[tIdx]; 
                            tickerEl.style.opacity = 1; 
                        } 
                    }, 400);
                }, 20000);
            }
            triggerSceneEvents(idx, false);
        }

        /* MODO CINEMATOGRÁFICO 3D */
        function updateCineCamera(idx) {
            if(idx < 0) return;
            if(idx >= script.length) { 
    if(!hasPlayedFinalCredits) { playFinalCredits(); } 
    else { window.switchScreen('credits-screen'); }
    return; 
}

            clearInterval(tickerIntervalM);
            const data = script[idx];
            currentCineIdx = idx;
            saveWatchProgress('cine', idx);

            applyPresenter(data.presenter, true);

            document.getElementById('cine-ep-title').textContent = data.title;
            document.getElementById('cine-progress').style.width = `${((idx + 1) / script.length) * 100}%`;
            document.getElementById('cinematic-stage').setAttribute('data-step', data.id);

            // Atualiza o HUD Epistemológico
            updateEpistemicHUD(data.id);

            const tickerEl = document.getElementById(`cine-ticker-${data.id}`);
            if(tickerEl && data.tickers && data.tickers.length > 0) {
                let tIdx = 0;
                tickerEl.textContent = data.tickers[0];
                tickerEl.style.opacity = 1;
                tickerIntervalM = setInterval(() => {
                    tIdx = (tIdx + 1) % data.tickers.length;
                    tickerEl.style.opacity = 0;
                    setTimeout(() => {
                        if (currentCineIdx === idx) {
                            tickerEl.textContent = data.tickers[tIdx];
                            tickerEl.style.opacity = 1;
                        }
                    }, 400);
                }, 20000);
            }
            triggerSceneEvents(idx, true);
        }

        /* =========================================================
           HUD EPISTEMOLÓGICO - Atualização Dinâmica
           ========================================================= */
        function updateEpistemicHUD(stepId) {
            const hud = document.getElementById('epistemic-hud');
            if (!hud) return;

            // Ativa o HUD quando estiver no modo cinematográfico
            hud.classList.add('active');

            // Obtém o paradigma atual
            const epochData = getEpochFromStep(stepId);

            // Atualiza o nome do paradigma
            const epochEl = document.getElementById('hud-epoch-value');
            if (epochEl) {
                epochEl.textContent = epochData.name;
                epochEl.style.color = epochData.color;
            }
        }

        function getEpochFromStep(stepId) {
            // Define o paradigma baseado na cena
            const epochData = {
                name: '',
                color: '#d4af37'
            };

            // CAPÍTULO 1: RENASCIMENTO
            if (['0', '0_1', '0_2', '1'].includes(stepId)) {
                epochData.name = stepId === '0' ? 'ESCOLÁSTICA' : stepId === '0_1' ? 'TRANSIÇÃO' : stepId === '0_2' ? 'RUPTURA' : 'HUMANISMO';
                epochData.color = stepId === '0' ? '#666' : stepId === '0_1' ? '#f59e0b' : stepId === '0_2' ? '#E50914' : '#10b981';
            }

            // CAPÍTULO 2: BIBLIOTECA MEDIEVAL
            else if (['2', '2_1', '3', '3_1'].includes(stepId)) {
                epochData.name = stepId === '2' ? 'TRADIÇÃO' : stepId === '2_1' ? 'GEOCENTRISMO' : stepId === '3' ? 'AUTORIDADE' : 'MUDANÇA';
                epochData.color = stepId === '2' ? '#888' : stepId === '2_1' ? '#3b82f6' : stepId === '3' ? '#E50914' : '#10b981';
            }

            // CAPÍTULO 3: A RUPTURA
            else if (stepId === '4') {
                epochData.name = 'REVOLUÇÃO';
                epochData.color = '#E50914';
            }

            // CAPÍTULO 4: ESPAÇO/COSMOLOGIA
            else if (['5', '6', '6_1'].includes(stepId)) {
                epochData.name = stepId === '5' ? 'HELIOCENTRISMO' : stepId === '6' ? 'OBSERVAÇÃO' : 'KEPLER';
                epochData.color = stepId === '5' ? '#f59e0b' : stepId === '6' ? '#3b82f6' : '#10b981';
            }

            // CAPÍTULO 5: MESA DE TRABALHO - BACON
            else if (['8', '9'].includes(stepId)) {
                epochData.name = stepId === '8' ? 'ÍDOLOS' : 'EXPERIMENTAÇÃO';
                epochData.color = stepId === '8' ? '#E50914' : '#10b981';
            }

            // CAPÍTULO 6: MESA DE TRABALHO - DESCARTES
            else if (['10', '11'].includes(stepId)) {
                epochData.name = stepId === '10' ? 'DÚVIDA' : 'RACIONALISMO';
                epochData.color = stepId === '10' ? '#f59e0b' : '#3b82f6';
            }

            // CAPÍTULO 7: ESCOLHA
            else if (stepId === '7') {
                epochData.name = 'ENCRUZILHADA';
                epochData.color = '#ec4899';
            }

            // CAPÍTULO 12: NEWTON
            else if (stepId === '12') {
                epochData.name = 'SÍNTESE';
                epochData.color = '#10b981';
            }

            return epochData;
        }

        /* =========================================================
           ENHANCED 3D ANIMATIONS - EFEITOS CINEMATOGRÁFICOS
           ========================================================= */

        // Rastreamento do mouse para luz dinâmica
        document.addEventListener('mousemove', (e) => {
            const cinematicStage = document.getElementById('cinematic-stage');
            if (!cinematicStage || !cinematicStage.classList.contains('active')) return;

            const dynamicLight = document.getElementById('dynamic-light');
            if (dynamicLight) {
                const rect = cinematicStage.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                dynamicLight.style.setProperty('--mouse-x', `${x}%`);
                dynamicLight.style.setProperty('--mouse-y', `${y}%`);
            }

            // Efeito parallax sutil nas cenas
            const activeScene = document.querySelector('.cine-scene.active');
            if (activeScene) {
                const moveX = (e.clientX - window.innerWidth / 2) / 50;
                const moveY = (e.clientY - window.innerHeight / 2) / 50;
                activeScene.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });

        // Gera partículas para o espaço
        function generateSpaceParticles() {
            const container = document.getElementById('space-particles');
            if (!container) return;

            // Limpa partículas existentes
            container.innerHTML = '';

            // Cria 50 partículas
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
                particle.style.animationDelay = `${Math.random() * 5}s`;
                particle.style.opacity = Math.random() * 0.5 + 0.3;
                container.appendChild(particle);
            }
        }

        // Inicializa partículas quando entra no modo cinematográfico
        const originalSwitchScreen = window.switchScreen;
        window.switchScreen = function(id, syncNav = true) {
            originalSwitchScreen(id, syncNav);

            if (id === 'cinematic-stage') {
                setTimeout(() => generateSpaceParticles(), 500);
                if (typeof window.unlockAchievement === 'function') {
                    window.unlockAchievement('cine-master');
                }
            }
        };

        document.getElementById('btn-next-slide').addEventListener('click', () => { 
            if (isLisActive || isModalOpen() || isPlayingPostCredits) return; 
            if (script[currentSlide] && script[currentSlide].id == 12 && !hasPlayedPostCredits) { 
                playPostCredits(); 
                return; 
            }
            renderSlide(currentSlide + 1); 
        });

        document.getElementById('btn-prev-slide').addEventListener('click', () => { 
            if (isLisActive || isModalOpen() || isPlayingPostCredits) return; 
            renderSlide(currentSlide - 1); 
        });

        function simulateLoading(callback) { 
            window.switchScreen('loading-screen');
            let p = 0; const txt = document.getElementById('loading-perc');
            txt.textContent = '0%';
            const int = setInterval(() => { 
                p += Math.floor(Math.random() * 30) + 15; 
                if(p >= 100) { p = 100; clearInterval(int); txt.textContent = '100%'; setTimeout(callback, 300); return; } 
                txt.textContent = p + '%'; 
            }, 150); 
        }
        
        /* =========================================================
           SISTEMA DE INTRODUÇÃO (TUDUM) ANTES DOS FILMES
           ========================================================= */
      let introTimeout;
        window.currentIntroCallback = null;

        function playTudumAndThen(callback) {
            window.switchScreen('splash-screen');
            const logo = document.getElementById('splash-logo-el');
            const skipBtn = document.getElementById('skip-intro-btn');
            
            logo.classList.remove('play-tudum');
            void logo.offsetWidth; 
            logo.classList.add('play-tudum');
            
            if (typeof window.playIfpiflixSfx === 'function') {
                window.playIfpiflixSfx('tudum');
            }
            
            if (skipBtn) skipBtn.classList.add('show');
            window.currentIntroCallback = callback;
            
            clearTimeout(introTimeout);
            introTimeout = setTimeout(() => {
                if (window.currentIntroCallback) {
                    if (skipBtn) skipBtn.classList.remove('show');
                    window.currentIntroCallback();
                    window.currentIntroCallback = null;
                }
            }, 3500);
        }

        window.forceSkipIntro = function() {
            if (window.currentIntroCallback) {
                clearTimeout(introTimeout);
                const skipBtn = document.getElementById('skip-intro-btn');
                if (skipBtn) skipBtn.classList.remove('show');
                window.currentIntroCallback();
                window.currentIntroCallback = null;
            }
        }

        window.startPresentationAt = function(targetId) { 
            window.closeTitleModal(null, true); // Fecha o modal primeiro
            simulateLoading(() => { // 1º Carrega
                playTudumAndThen(() => { // 2º Roda o Tudum
                    const idx = script.findIndex(s => s.id == targetId);
                    renderSlide(idx !== -1 ? idx : 0); 
                    window.switchScreen('player-screen'); // 3º Inicia
                });
            }); 
        }
        
        window.startCinematicMovieAt = function(targetId) { 
            window.closeTitleModal(null, true);
            simulateLoading(() => { 
                playTudumAndThen(() => {
                    currentCineIdx = -1; 
                    window.switchScreen('cinematic-stage'); 
                    const idx = script.findIndex(s => s.id == targetId);
                    updateCineCamera(idx !== -1 ? idx : 0); 
                });
            }); 
        }
        
        window.startCinematicMovie = function() { 
            window.startCinematicMovieAt(0); 
        }

        /* =========================================================
           ABRIR PLAYER DE VÍDEO / TRAILERS (MP4 E YOUTUBE)
           ========================================================= */
        window.openVideoPlayer = function(videoSrc, isYouTube = false, startAt = 0, movieId = null) {
            window.closeTitleModal(null, true);
            currentPlayingMovieId = movieId || currentModalMovieId;

            const nextVideoEpBtn = document.getElementById('video-next-episode-btn');
            if (nextVideoEpBtn) nextVideoEpBtn.style.display = 'none';

            const overlay = document.getElementById('custom-video-player');
            const video = document.getElementById('main-video-element');
            const iframe = document.getElementById('main-iframe-element');
            const curtain = document.getElementById('ytc-curtain');
            
            if (isYouTube) {
                if (video) {
                    video.pause();
                    video.removeAttribute('src');
                    video.style.display = 'none';
                }
                if (iframe) {
                    resetYtState('main');
                    iframe.style.opacity = '0';
                    iframe.src = getYouTubeEmbedUrl(videoSrc, false, startAt);
                    iframe.style.display = 'block';

                    if (curtain) {
                        curtain.classList.add('active');
                        setTimeout(() => {
                            curtain.classList.remove('active');
                            if (iframe && iframe.getAttribute('src')) {
                                iframe.style.opacity = '1';
                            }
                        }, 2200);
                    } else {
                        setTimeout(() => {
                            if (iframe && iframe.getAttribute('src')) {
                                iframe.style.opacity = '1';
                            }
                        }, 2200);
                    }
                }
                overlay.classList.add('yt-mode', 'show-controls');
                pokeYtControls();
            } else {
                overlay.classList.remove('yt-mode');
                if (iframe) {
                    iframe.removeAttribute('src');
                    iframe.style.display = 'none';
                }
                if (video) {
                    video.style.display = 'block';
                    video.src = videoSrc;
                    video.onended = () => {
                        showVideoNextEpisodeButton();
                    };
                    if (startAt > 0) {
                        video.addEventListener('loadedmetadata', function seekOnce() {
                            video.removeEventListener('loadedmetadata', seekOnce);
                            try { video.currentTime = startAt; } catch (e) {}
                        });
                    }
                    playWithFallback(video);
                }
            }
            overlay.classList.add('show');
        }

        document.addEventListener('keydown', (e) => {
            if (isModalOpen() || isPlayingPostCredits) return;
            
            if (document.getElementById('player-screen').classList.contains('active')) {
                if (script[currentSlide].id == 7 && (e.key === 'ArrowRight' || e.key === ' ')) { 
                    e.preventDefault(); triggerScreenShake('player-screen'); return; 
                }
                if (e.key === 'ArrowRight' || e.key === ' ') { 
                    e.preventDefault(); 
                    if (script[currentSlide].id == 12 && !hasPlayedPostCredits) { playPostCredits(); return; }
                    document.getElementById('btn-next-slide').click(); 
                }
                if (e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('btn-prev-slide').click(); }
            }
            else if (document.getElementById('cinematic-stage').classList.contains('active')) {
                if (script[currentCineIdx].id == 7 && (e.key === 'ArrowRight' || e.key === ' ')) { 
                    e.preventDefault(); triggerScreenShake('cinematic-stage'); return; 
                }
                if (e.key === 'ArrowRight' || e.key === ' ') { 
                    e.preventDefault(); 
                    if (script[currentCineIdx].id == 12 && !hasPlayedPostCredits) { playPostCredits(); return; }
                    updateCineCamera(currentCineIdx + 1); 
                }
                if (e.key === 'ArrowLeft') { e.preventDefault(); updateCineCamera(currentCineIdx - 1); }
            }
        });

        /* GESTÃO DE INATIVIDADE */
        let idleTimer;
        function resetIdleTimer() {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                const isPlaying = document.getElementById('player-screen').classList.contains('active') || document.getElementById('cinematic-stage').classList.contains('active');
                
                const isChoiceSlide = (currentSlide >= 0 && script[currentSlide].id == 7) || 
                                      (currentCineIdx >= 0 && script[currentCineIdx].id == 7);

                if (isPlaying && !isModalOpen() && !isChoiceSlide) { 
                    document.getElementById('idle-overlay').style.display = 'flex'; 
                }
            }, 90000);
        }

        /* =========================================================
   MOTOR EPISTEMOLÓGICO: LÓGICA DE INTERAÇÃO DOS SLIDES
   ========================================================= */

function initEpistemologicalPhysics() {
    // 1. INJETAR A FÍSICA DA ESCOLÁSTICA (Dogma)
    const dogmaSlides = [document.querySelector('#slide-0 .visual-col'), document.querySelector('#slide-3 .visual-col')];
    dogmaSlides.forEach(col => {
        if(!col) return;
        col.classList.add('dogma-vault');
        
        // Adiciona a Luz Divina
        if(!col.querySelector('.divine-light')){
            const light = document.createElement('div');
            light.className = 'divine-light';
            col.appendChild(light);
        }

        // Adiciona a poeira estagnada
        if(!col.querySelector('.dust-particle')){
            for(let i = 0; i < 15; i++) {
                const dust = document.createElement('div');
                dust.className = 'dust-particle';
                const size = Math.random() * 3 + 1;
                dust.style.width = `${size}px`;
                dust.style.height = `${size}px`;
                dust.style.left = `${Math.random() * 100}%`;
                dust.style.animationDuration = `${Math.random() * 5 + 5}s`;
                dust.style.animationDelay = `${Math.random() * 5}s`;
                col.appendChild(dust);
            }
        }
    });

    // 2. INJETAR O GEOCENTRISMO (Esferas Perfeitas vs Sublunar Caótico)
    const geoSystems = document.querySelectorAll('.geo-system');
    geoSystems.forEach(sys => {
        if(sys.querySelector('.supralunar-sphere')) return; // Evita duplicar
        
        // Cria as esferas de cristal
        for(let i = 1; i <= 3; i++) {
            const sphere = document.createElement('div');
            sphere.className = `supralunar-sphere sphere-${i}`;
            sys.appendChild(sphere);
        }
    });

    // 3. O PRINCÍPIO DA AUTORIDADE (Repulsão do Cursor)
    const authoritySlide = document.getElementById('slide-3');
    if (authoritySlide) {
        const visualCol = authoritySlide.querySelector('.sim-screen');
        const icon = visualCol.querySelector('.fa-book');
        
        // Envolve o ícone em um container repulsivo
        if (icon && !icon.parentElement.classList.contains('authority-repel')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'authority-repel';
            icon.parentNode.insertBefore(wrapper, icon);
            wrapper.appendChild(icon);
            
            const statusText = visualCol.querySelector('h3');
            if(statusText) wrapper.appendChild(statusText);

            // Lógica de repulsão dogmática
            authoritySlide.addEventListener('mousemove', (e) => {
                if(!authoritySlide.classList.contains('active')) return;
                
                const rect = wrapper.getBoundingClientRect();
                const iconX = rect.left + rect.width / 2;
                const iconY = rect.top + rect.height / 2;
                
                const distX = e.clientX - iconX;
                const distY = e.clientY - iconY;
                const distance = Math.sqrt(distX * distX + distY * distY);
                
                const threshold = 150; // Raio de intocabilidade
                
                if (distance < threshold) {
                    // Empurra o elemento na direção oposta ao mouse
                    const repelStrength = (threshold - distance) * 0.5;
                    const angle = Math.atan2(distY, distX);
                    const moveX = -Math.cos(angle) * repelStrength;
                    const moveY = -Math.sin(angle) * repelStrength;
                    wrapper.style.transform = `translate(${moveX}px, ${moveY}px)`;
                } else {
                    wrapper.style.transform = `translate(0px, 0px)`;
                }
            });
        }
    }

    // 4. O DESPERTAR RENASCENTISTA (A Lanterna da Razão)
    const ruptureSlide = document.getElementById('slide-4');
    if (ruptureSlide) {
        const simScreen = ruptureSlide.querySelector('.sim-screen');
        simScreen.innerHTML = ''; // Limpa a animação antiga
        simScreen.className = 'sim-screen humanism-stage';
        
        const bg = document.createElement('div'); bg.className = 'humanism-bg';
        const mask = document.createElement('div'); mask.className = 'humanism-mask';
        const content = document.createElement('div'); content.className = 'humanism-content';
        
        content.innerHTML = '<i class="fa-solid fa-eye"></i><i class="fa-solid fa-compass"></i><i class="fa-solid fa-flask"></i>';
        
        simScreen.appendChild(bg);
        simScreen.appendChild(content);
        simScreen.appendChild(mask);

        // Agência Humana: O cursor ilumina a escuridão e move o fundo (Parallax)
        ruptureSlide.addEventListener('mousemove', (e) => {
            if(!ruptureSlide.classList.contains('active')) return;
            
            const rect = simScreen.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Verifica se o mouse está dentro da área visual
            if(x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                // Abre o raio de luz
                mask.style.clipPath = `circle(120px at ${x}px ${y}px)`;
                
                // Parallax sutil no background para dar sensação de espaço navegável
                const moveX = (x / rect.width - 0.5) * 20;
                const moveY = (y / rect.height - 0.5) * 20;
                bg.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
            } else {
                mask.style.clipPath = `circle(0px at 50% 50%)`;
            }
        });
        
        // Esconde a luz quando o mouse sai
        ruptureSlide.addEventListener('mouseleave', () => {
            mask.style.clipPath = `circle(0px at 50% 50%)`;
            bg.style.transform = `translate(0px, 0px)`;
        });
    }
}

// Inicializa a física assim que o DOM carregar
window.addEventListener('DOMContentLoaded', initEpistemologicalPhysics);

        /* =========================================================
           SISTEMA DE ARRASTAR PARA OS LADOS (DRAG-TO-SCROLL & WHEEL)
           ========================================================= */
       function initDragToScroll() {
            const sliders = document.querySelectorAll(
                '.posters-container, .landscape-row, .top10-container, .acervo-row-slider, .acervo-disney-bar, .acervo-students-slider, .disney-collections-row, .continue-watching-grid'
            );
            
            sliders.forEach(slider => {
                if (slider.dataset.dragInit === 'true') return;
                slider.dataset.dragInit = 'true';

                let isDown = false;
                let startX;
                let startY;
                let scrollLeft;
                let hasMoved = false;

                // Evita que imagens ou links criem fantasma de arrasto nativo do navegador
                slider.addEventListener('dragstart', (e) => {
                    e.preventDefault();
                });

                // --- EVENTOS DE MOUSE (PC) ---
                slider.addEventListener('mousedown', (e) => {
                    if (e.button !== 0) return; // apenas botão esquerdo
                    isDown = true;
                    hasMoved = false;
                    slider.classList.add('active-drag');
                    slider.style.scrollBehavior = 'auto'; // evita lag do CSS smooth durante arraste
                    startX = e.pageX - slider.offsetLeft;
                    scrollLeft = slider.scrollLeft;
                });

                const stopDrag = () => {
                    if (!isDown) return;
                    isDown = false;
                    slider.classList.remove('active-drag');
                    slider.style.scrollBehavior = '';
                    // Mantém hasMoved true por 80ms para interceptar o evento de 'click' subsequente
                    setTimeout(() => { hasMoved = false; }, 80);
                };

                slider.addEventListener('mouseleave', stopDrag);
                slider.addEventListener('mouseup', stopDrag);

                slider.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    const x = e.pageX - slider.offsetLeft;
                    const walk = (x - startX);
                    
                    if (Math.abs(walk) > 5) {
                        hasMoved = true;
                        e.preventDefault();
                    }
                    slider.scrollLeft = scrollLeft - (walk * 1.5);
                });

                // --- EVENTOS DE TOQUE (CELULAR) ---
                slider.addEventListener('touchstart', (e) => {
                    isDown = true;
                    hasMoved = false;
                    startX = e.touches[0].pageX - slider.offsetLeft;
                    startY = e.touches[0].pageY;
                    scrollLeft = slider.scrollLeft;
                }, { passive: true });

                slider.addEventListener('touchend', () => {
                    isDown = false;
                    setTimeout(() => { hasMoved = false; }, 80);
                });

                slider.addEventListener('touchmove', (e) => {
                    if (!isDown) return;
                    const currentY = e.touches[0].pageY;
                    const currentX = e.touches[0].pageX - slider.offsetLeft;
                    const walkX = (currentX - startX);
                    const walkY = Math.abs(currentY - startY);
                    
                    // Se o movimento for predominantemente vertical, permite rolagem vertical da página
                    if (walkY > Math.abs(walkX)) return;
                    
                    if (Math.abs(walkX) > 5) {
                        hasMoved = true;
                    }
                    slider.scrollLeft = scrollLeft - (walkX * 1.5);
                }, { passive: true });

                // Intercepta qualquer clique em qualquer filho se o usuário estava arrastando
                slider.addEventListener('click', (e) => {
                    if (hasMoved) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        hasMoved = false;
                    }
                }, true);

                // --- ROLAGEM COM A RODA DO MOUSE (WHEEL INTELIGENTE) ---
                slider.addEventListener('wheel', (e) => {
                    // Se o container não tiver conteúdo transbordando horizontalmente, não intercepta
                    if (slider.scrollWidth <= slider.clientWidth) return;

                    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
                    if (delta === 0) return;

                    const maxScroll = slider.scrollWidth - slider.clientWidth;
                    const canScrollLeft = slider.scrollLeft > 2 && delta < 0;
                    const canScrollRight = slider.scrollLeft < (maxScroll - 2) && delta > 0;

                    // Se puder rolar horizontalmente na direção desejada ou se o usuário estiver segurando Shift
                    if (canScrollLeft || canScrollRight || e.shiftKey) {
                        e.preventDefault();
                        slider.scrollLeft += delta * 1.15;
                    }
                }, { passive: false });
            });
        }

        /* =========================================================
           SISTEMA DE SWIPE (ARRASTAR O DEDO NO CELULAR)
           ========================================================= */
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, {passive: true});

        document.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, {passive: true});

       function handleSwipe() {
            if (isModalOpen() || isLisActive || isPlayingPostCredits) return;

            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);

            if (diffY > Math.abs(diffX)) return;

            if (diffX > 50) {
                if (document.getElementById('player-screen').classList.contains('active')) {
                    if (script[currentSlide].id == 7) { triggerScreenShake('player-screen'); return; }
                    if (script[currentSlide].id == 12 && !hasPlayedPostCredits) { playPostCredits(); return; }
                    document.getElementById('btn-next-slide').click();
                } else if (document.getElementById('cinematic-stage').classList.contains('active')) {
                    if (script[currentCineIdx].id == 7) { triggerScreenShake('cinematic-stage'); return; }
                    if (script[currentCineIdx].id == 12 && !hasPlayedPostCredits) { playPostCredits(); return; }
                    updateCineCamera(currentCineIdx + 1);
                }
            } 
            else if (diffX < -50) {
                if (document.getElementById('player-screen').classList.contains('active')) {
                    document.getElementById('btn-prev-slide').click();
                } else if (document.getElementById('cinematic-stage').classList.contains('active')) {
                    updateCineCamera(currentCineIdx - 1);
                }
            }
        }

        // Inicia o sistema de arraste assim que a página carregar
        window.addEventListener('DOMContentLoaded', initDragToScroll);

        /* =========================================================
           SISTEMA DE CENA PÓS-CRÉDITOS
           ========================================================= */
        let hasPlayedPostCredits = false;
        let isPlayingPostCredits = false;

        function playPostCredits() {
            isPlayingPostCredits = true;
            const overlay = document.getElementById('post-credits-overlay');
            const video = document.getElementById('post-credits-video');
            
            overlay.style.display = 'flex';
            
            // Link do vídeo no GitHub
            video.src = mediaUrl('pos_credito.mp4');
            
            playWithFallback(video).catch(() => {
                // Se der erro mesmo sem som, pula direto pra assinatura
                skipPostCredits();
            });

            // Quando o vídeo acabar sozinho, pula pra assinatura
            video.onended = () => {
                skipPostCredits();
            };
        }

        window.skipPostCredits = function() {
            const overlay = document.getElementById('post-credits-overlay');
            const video = document.getElementById('post-credits-video');
            
            video.pause();
            video.removeAttribute('src');
            overlay.style.display = 'none';
            
            hasPlayedPostCredits = true;
            isPlayingPostCredits = false;
            
            // 👇 A CORREÇÃO: Procura a posição exata do slide final (ID 13)
            const finalIdx = script.findIndex(s => s.id == 13);
            
            // Descobre em qual modo o usuário estava e avança para a tela de assinatura
            if (document.getElementById('cinematic-stage').classList.contains('active')) {
                updateCineCamera(finalIdx);
            } else {
                renderSlide(finalIdx);
            }
        }

        /* =========================================================
           SISTEMA DE QUIZ INTERATIVO
           ========================================================= */
        const quizData = [
            {
                title: "QUESTÃO 01", context: "",
                question: "Como é que as novas ideias do Renascimento e o foco no ser humano ajudaram a questionar as explicações religiosas da Idade Média sobre a natureza?",
                options: [
                    { letter: "A", text: "Colocaram a razão humana no centro, tratando a natureza como realidade observável.", correct: true },
                    { letter: "B", text: "Defenderam o regresso aos dogmas medievais e a proibição da imprensa.", correct: false },
                    { letter: "C", text: "Afirmaram que apenas os textos sagrados continham as leis do universo.", correct: false },
                    { letter: "D", text: "Substituíram estudos práticos por crenças místicas da astrologia antiga.", correct: false },
                    { letter: "E", text: "Limitaram o intercâmbio cultural para proteger a tradição escolástica.", correct: false }
                ]
            },
            {
                title: "QUESTÃO 02", context: "",
                question: "O que defendia o modelo geocêntrico e de que forma a regra de não questionar os mestres antigos (princípio de autoridade) impedia a realização de novas experiências?",
                options: [
                    { letter: "A", text: "Afirmava que o Sol era o centro do universo e exigia verificações laboratoriais.", correct: false },
                    { letter: "B", text: "A Terra era o centro imóvel; teses antigas eram incontestáveis, proibindo testes empíricos.", correct: true },
                    { letter: "C", text: "Estabelecia uma identidade material perfeita entre a Terra e os céus.", correct: false },
                    { letter: "D", text: "Propunha que a verdade científica só poderia ser validada através do método indutivo.", correct: false },
                    { letter: "E", text: "Considerava a Terra um planeta em rotação governado por equações matemáticas.", correct: false }
                ]
            },
            {
                title: "QUESTÃO 03", context: "",
                question: "O que mudou na forma de pensar para que os estudiosos deixassem de ser apenas espectadores da natureza e passassem a testar os fatos com experiências práticas?",
                options: [
                    { letter: "A", text: "O saber exigiu a interrogação ativa da realidade por observação, medição e teste.", correct: true },
                    { letter: "B", text: "Os cientistas abandonaram a matemática para se dedicarem apenas à contemplação.", correct: false },
                    { letter: "C", text: "A natureza começou a ser vista como uma ordem mística intocável e proibida.", correct: false },
                    { letter: "D", text: "Apenas as deduções abstratas eram aceitas para decifrar os segredos naturais.", correct: false },
                    { letter: "E", text: "A experimentação passou a depender de impressões sem necessidade de replicação.", correct: false }
                ]
            },
            {
                title: "QUESTÃO 04", context: "Galileu Galilei (1564–1642) - Luneta astronômica e física quantitativa",
                question: "Quais foram as descobertas que Galileu fez com o telescópio para provar o heliocentrismo e por que razão ele dizia que a natureza está escrita em caracteres matemáticos?",
                options: [
                    { letter: "A", text: "Observou cometas e defendeu que as leis seguiam a lógica verbal do latim.", correct: false },
                    { letter: "B", text: "Confirmou a imutabilidade das esferas celestes através de equações teóricas.", correct: false },
                    { letter: "C", text: "Descobriu crateras lunares, provando a imperfeição dos céus através da geometria.", correct: true },
                    { letter: "D", text: "Demonstrou que a Terra permanecia imóvel através de cálculos com a luneta.", correct: false },
                    { letter: "E", text: "Verificou que as órbitas eram regidas exclusivamente pelas vontades dos astros.", correct: false }
                ]
            },
            {
                title: "QUESTÃO 05", context: "Francis Bacon (1561–1626) - O método indutivo e 'Saber é Poder'",
                question: "Por que motivo defendia Francis Bacon que o conhecimento deve começar pela observação detalhada de fatos reais em vez de teorias abstratas?",
                options: [
                    { letter: "A", text: "Acreditava que a mente humana é infalível e não precisa de instrumentos.", correct: false },
                    { letter: "B", text: "Defendia o método indutivo para criar leis a partir da observação e transformar a realidade.", correct: true },
                    { letter: "C", text: "Considerava que as disputas de palavras medievais geravam novas tecnologias.", correct: false },
                    { letter: "D", text: "Pretendia eliminar as experiências de laboratório, valorizando a reflexão pura.", correct: false },
                    { letter: "E", text: "Defendia a subordinação das investigações aos manuais da Antiguidade.", correct: false }
                ]
            },
            {
                title: "QUESTÃO 06", context: "René Descartes (1596–1650) - Dúvida metódica e rigor analítico",
                question: "Para que servia a dúvida metódica de Descartes e como é que ele chegou à famosa conclusão de que 'Penso, logo existo'?",
                options: [
                    { letter: "A", text: "Servia para rejeitar a razão lógica e promover a aceitação cega dos sentidos.", correct: false },
                    { letter: "B", text: "Pretendia demonstrar que a matemática é incapaz de resolver problemas físicos.", correct: false },
                    { letter: "C", text: "Foi criada para provar a impossibilidade de a mente humana atingir verdades.", correct: false },
                    { letter: "D", text: "Duvidou de tudo até concluir que o ato de duvidar exige o pensamento e a existência.", correct: true },
                    { letter: "E", text: "Teve como função resgatar as teorias escolásticas para validar dogmas.", correct: false }
                ]
            },
            {
                title: "QUESTÃO 07", context: "Isaac Newton (1643–1727) - Leis mecânicas e gravitação universal",
                question: "Como que Isaac Newton conseguiu juntar a matemática e as experiências práticas para explicar o funcionamento do universo através da lei da gravidade?",
                options: [
                    { letter: "A", text: "Unificou leis matemáticas e provas empíricas, mostrando que a mesma física rege a Terra e o espaço.", correct: true },
                    { letter: "B", text: "Manteve a separação entre a física terrestre e a celeste, rejeitando a mecânica.", correct: false },
                    { letter: "C", text: "Dispensou a observação empírica, formulando uma teoria assente em deduções metafísicas.", correct: false },
                    { letter: "D", text: "Estabeleceu que o cosmos é imprevisível, inviabilizando o método dedutivo.", correct: false },
                    { letter: "E", text: "Baseou as suas leis na simples compilação de crenças tradicionais sem cálculo.", correct: false }
                ]
            }
        ];

        let currentQuizIndex = 0;
        let quizScore = 0;

        window.startQuiz = function() {
            simulateLoading(() => {
                currentQuizIndex = 0;
                quizScore = 0;
                applyPresenter("Todos");
                document.getElementById('quiz-presenter-name').textContent = "Todos";
                renderQuizQuestion();
                window.switchScreen('quiz-screen');
            });
        }

        function renderQuizQuestion() {
            if (currentQuizIndex >= quizData.length) {
                showQuizResults();
                return;
            }

            const q = quizData[currentQuizIndex];
            document.getElementById('quiz-progress-text').textContent = `Questão ${currentQuizIndex + 1} de ${quizData.length}`;
            document.getElementById('quiz-title').textContent = q.title;
            document.getElementById('quiz-context').textContent = q.context;
            document.getElementById('quiz-question').textContent = q.question;
            
            const optionsContainer = document.getElementById('quiz-options');
            optionsContainer.innerHTML = '';
            
            const nextBtn = document.getElementById('btn-next-quiz');
            if (nextBtn) {
                nextBtn.innerHTML = 'Próxima Questão <i class="fa-solid fa-arrow-right"></i>';
                nextBtn.onclick = () => window.nextQuizQuestion();
                nextBtn.style.display = 'none';
            }

            q.options.forEach((opt, index) => {
                const btn = document.createElement('div');
                btn.className = 'quiz-btn';
                btn.innerHTML = `<div class="quiz-letter">${opt.letter}</div> <div>${opt.text}</div>`;
                btn.onclick = () => checkQuizAnswer(index, btn);
                optionsContainer.appendChild(btn);
            });
        }

        function checkQuizAnswer(selectedIndex, btnElement) {
            const q = quizData[currentQuizIndex];
            const isCorrect = q.options[selectedIndex].correct;
            
            // Trava todos os botões
            const allBtns = document.querySelectorAll('.quiz-btn');
            allBtns.forEach(b => b.classList.add('answered'));

            if (isCorrect) {
                btnElement.classList.add('correct');
                quizScore++;
                if (typeof window.playIfpiflixSfx === 'function') window.playIfpiflixSfx('quiz-correct');
            } else {
                btnElement.classList.add('wrong');
                // Destaca a correta
                const correctIndex = q.options.findIndex(o => o.correct);
                if (allBtns[correctIndex]) allBtns[correctIndex].classList.add('correct');
                if (typeof window.playIfpiflixSfx === 'function') window.playIfpiflixSfx('quiz-wrong');
            }

            const nextBtn = document.getElementById('btn-next-quiz');
            if (nextBtn) nextBtn.style.display = 'block';
        }

        window.nextQuizQuestion = function() {
            currentQuizIndex++;
            renderQuizQuestion();
            document.getElementById('quiz-screen').scrollTo({ top: 0, behavior: 'smooth' });
        }

        function showQuizResults() {
            document.getElementById('quiz-title').textContent = "FIM DO JOGO";
            document.getElementById('quiz-context').textContent = "";
            document.getElementById('quiz-question').textContent = `A turma acertou ${quizScore} de ${quizData.length} questões!`;
            document.getElementById('quiz-options').innerHTML = '';
            
            const btn = document.getElementById('btn-next-quiz');
            if (btn) {
                btn.innerHTML = '<i class="fa-solid fa-list"></i> Voltar aos Episódios';
                btn.style.display = 'block';
                btn.onclick = () => window.exitQuiz();
            }

            if (typeof window.unlockAchievement === 'function') {
                window.unlockAchievement('quiz-master');
            }
        }


        /* =========================================================
           SISTEMA DE PESQUISA DINÂMICA
           ========================================================= */
        const searchBox = document.getElementById('search-box');
        const searchInput = document.getElementById('search-input');
        const heroSection = document.querySelector('.hero');
        const catalogSection = document.querySelector('.catalog-container');
        const searchResults = document.getElementById('search-results');
        const searchGrid = document.getElementById('search-grid');

        // Expande a barra ao focar
        if (searchInput && searchBox) {
            searchInput.addEventListener('focus', () => {
                searchBox.classList.add('active');
            });

            // Recolhe a barra se clicar fora e estiver vazia
            searchInput.addEventListener('blur', () => {
                if(searchInput.value.trim() === '') {
                    searchBox.classList.remove('active');
                }
            });

            // Filtra em tempo real
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();

            if (query.length > 0) {
                // Esconde o catálogo normal e mostra a pesquisa
                heroSection.style.display = 'none';
                catalogSection.style.display = 'none';
                searchResults.style.display = 'block';

                searchGrid.innerHTML = '';
                let found = false;
                
                // Percorre o banco de dados
                Object.keys(filmesDB).forEach(id => {
                    const filme = filmesDB[id];
                    // Busca no título, gêneros ou tags
                    const match = filme.title.toLowerCase().includes(query) || 
                                  (filme.tags && filme.tags.toLowerCase().includes(query)) ||
                                  (filme.genres && filme.genres.toLowerCase().includes(query));
                    
                    if (match) {
                        found = true;
                        const img = filme.banner ? filme.banner : filme.bg;
                        const linkImg = imgUrl(img, 300);
                        
                        // Reutiliza o estilo dos cards de recomendação
                        searchGrid.innerHTML += `
                            <div class="more-card" data-movie="${id}" role="button" tabindex="0" aria-label="${filme.title}">
                                <div class="more-img" style="background-image:url('${linkImg}')"></div>
                                <div class="more-info">
                                    <h4>${filme.title}</h4>
                                    <i class="fa-solid fa-play" style="color: #fff; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.4); padding: 8px; border-radius: 50%;"></i>
                                </div>
                            </div>
                        `;
                    }
                });
                
                if(!found) {
                    searchGrid.innerHTML = '<p style="color:#aaa; font-size:1.2rem; grid-column: 1 / -1;">Nenhum título encontrado para sua busca.</p>';
                }
            } else {
                // Restaura a tela inicial se apagar o texto
                heroSection.style.display = 'flex';
                catalogSection.style.display = 'block';
                searchResults.style.display = 'none';
            }
        });
        }

        /* =========================================================
           SISTEMA: MINHA LISTA (Persistência no localStorage)
           ========================================================= */
        // Atalhos de teclado para tornar a busca mais rápida.
        // "/" abre a pesquisa e "Escape" limpa/fecha a pesquisa quando a página inicial está ativa.
        document.addEventListener('keydown', (e) => {
            const homeScreen = document.getElementById('home-screen');
            if (!searchInput || !searchBox || !homeScreen || !homeScreen.classList.contains('active')) return;

            const target = e.target;
            const isTyping = target instanceof HTMLElement &&
                (target.matches('input, textarea, select') || target.isContentEditable);

            if (e.key === '/' && !isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                searchBox.classList.add('active');
                searchInput.focus();
                return;
            }

            if (e.key === 'Escape' && document.activeElement === searchInput) {
                if (searchInput.value.trim() !== '') {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                searchInput.blur();
                searchBox.classList.remove('active');
            }
        });

        let minhaLista = [];
        try {
            const savedLista = localStorage.getItem('ifpiflix_minha_lista');
            if (savedLista) {
                minhaLista = JSON.parse(savedLista);
                if (!Array.isArray(minhaLista)) minhaLista = [];
            }
        } catch (e) {
            console.warn("Não foi possível acessar localStorage:", e);
            minhaLista = [];
        }

        let currentModalMovieId = ""; // Guarda qual filme está aberto no modal

        function saveMinhaLista() {
            try {
                localStorage.setItem('ifpiflix_minha_lista', JSON.stringify(minhaLista));
            } catch (e) {
                console.warn("Erro ao salvar Minha Lista:", e);
            }
        }

        window.toggleMinhaLista = function() {
            const btnIcon = document.querySelector('#m-btn-list i');
            
            // Se já tem na lista, remove. Se não tem, adiciona.
            if (minhaLista.includes(currentModalMovieId)) {
                minhaLista = minhaLista.filter(id => id !== currentModalMovieId);
                if (btnIcon) btnIcon.className = "fa-solid fa-plus";
            } else {
                minhaLista.push(currentModalMovieId);
                if (btnIcon) btnIcon.className = "fa-solid fa-check";
            }
            
            saveMinhaLista();
            renderMinhaLista();
        }

        function renderMinhaLista() {
            const container = document.getElementById('minha-lista-container');
            const grid = document.getElementById('minha-lista-grid');
            if (!container || !grid) return;
            
            if (minhaLista.length === 0) {
                container.style.display = 'none';
                grid.innerHTML = '';
                return;
            }

            container.style.display = 'block';
            grid.innerHTML = '';

            minhaLista.forEach(id => {
                const filme = filmesDB[id];
                if (!filme) return;
                const img = filme.banner ? filme.banner : filme.bg;
                const linkImg = imgUrl(img, 300);
                
                grid.innerHTML += `
                    <div class="card-landscape" style="background-image:url('${linkImg}')" data-movie="${id}" role="button" tabindex="0" aria-label="${filme.title}">
                        <div class="card-landscape-content" style="display:flex !important;">
                            <h4>${filme.title}</h4>
                        </div>
                    </div>
                `;
            });
            
            // Re-aplica a função de arrastar para a nova fileira
            initDragToScroll();
        }


        /* =========================================================
           SISTEMA DE HOVER PREVIEW (MINI TELA FLUTUANTE)
           ========================================================= */
        let hoverPreviewTimeout;
        let isHoverCardActive = false;

        function initHoverAutoPlay() {
            // Em celular/tablet (touch), não ativamos mini tela de hover
            if (isTouchDevice) return;

            const cards = document.querySelectorAll('.card-portrait, .card-landscape');
            const hoverCard = document.getElementById('hover-preview-card');
            if (!hoverCard) return;

            cards.forEach(card => {
                // Não ativa em cards dentro do modal de detalhes
                if (card.closest('#title-modal-overlay') || card.closest('.title-modal-container')) return;
                if (card.dataset.hoverInit === 'true') return;
                card.dataset.hoverInit = 'true';

                card.addEventListener('mouseenter', (e) => {
                    const modalOverlay = document.getElementById('title-modal-overlay');
                    if (modalOverlay && modalOverlay.classList.contains('show')) return;
                    if (document.body.classList.contains('modal-open')) return;
                    if (isHoverCardActive) return; // Não abre se já tiver um aberto

                    let movieId = card.dataset.movie;
                    if (!movieId) {
                        const onclickStr = card.getAttribute('onclick');
                        if (onclickStr) {
                            const match = onclickStr.match(/'([^']+)'/);
                            if (match) movieId = match[1];
                        }
                    }
                    if (!movieId) return;
                    const movieData = filmesDB[movieId];

                    if (movieData) {
                        // Aguarda 800ms (padrão Netflix) antes de abrir a mini tela
                        hoverPreviewTimeout = setTimeout(() => {
                            openHoverPreview(card, movieId, movieData);
                        }, 800);
                    }
                });

                card.addEventListener('mouseleave', () => {
                    clearTimeout(hoverPreviewTimeout);
                });
            });
            
            // Se o usuário rolar a tela, esconde a mini tela e atualiza o navbar transparente/preto
            const home = document.getElementById('home-screen');
            if (home && !home.dataset.scrollInit) {
                home.dataset.scrollInit = 'true';
                const homeNav = home.querySelector('.home-nav');
                home.addEventListener('scroll', () => {
                    window.closeHoverPreview();
                    if (homeNav) homeNav.classList.toggle('scrolled', home.scrollTop > 50);
                });
            }
            const acervo = document.getElementById('acervo-screen');
            if (acervo && !acervo.dataset.scrollInit) {
                acervo.dataset.scrollInit = 'true';
                const acervoNav = document.getElementById('acervo-home-nav');
                acervo.addEventListener('scroll', () => {
                    window.closeHoverPreview();
                    if (acervoNav) acervoNav.classList.toggle('scrolled', acervo.scrollTop > 50);
                });
            }
        }

        function openHoverPreview(cardElement, movieId, data) {
            const modalOverlay = document.getElementById('title-modal-overlay');
            if (modalOverlay && modalOverlay.classList.contains('show')) return;
            if (document.body.classList.contains('modal-open')) return;
            if (cardElement.closest('#title-modal-overlay') || cardElement.closest('.title-modal-container')) return;

            isHoverCardActive = true;
            const hoverCard = document.getElementById('hover-preview-card');
            if (!hoverCard) return;
            const rect = cardElement.getBoundingClientRect();
            
            // 1. Preenche os dados e carrega a imagem de forma inteligente
            const img = data.banner ? data.banner : data.bg;
            const imgEl = document.getElementById('hpc-img');
            
            // Só mostra a imagem quando ela terminar de carregar (evita piscar o filme antigo)
            imgEl.style.opacity = 0; 
            imgEl.onload = () => { imgEl.style.opacity = 1; };
            imgEl.src = imgUrl(img, 400);
            
            document.getElementById('hpc-title').innerHTML = data.title;
            document.getElementById('hpc-match').textContent = data.match;
            document.getElementById('hpc-age').textContent = data.age;
            document.getElementById('hpc-duration').textContent = data.duration;
            
            // Formata as tags separando por bolinhas
            if(data.tags) {
                document.getElementById('hpc-tags').innerHTML = data.tags.split(',').join(' &bull; ');
            }

            // 2. Configura o Vídeo / Trailer mudo no hover (estilo Netflix)
            const videoEl = document.getElementById('hpc-video');
            const iframeEl = document.getElementById('hpc-iframe');
            if (videoEl) {
                videoEl.pause();
                videoEl.classList.remove('playing');
                videoEl.removeAttribute('src');
            }
            if (iframeEl) {
                iframeEl.removeAttribute('src');
                iframeEl.classList.remove('playing');
            }

            const previewId = data.ytPreview || data.ytTrailer;
            if (data.trailer) {
                videoEl.src = mediaUrl(data.trailer);
                videoEl.muted = true;
                videoEl.play().then(() => {
                    videoEl.classList.add('playing');
                }).catch(() => { /* Sem autoplay se bloqueado */ });
            } else if (previewId) {
                iframeEl.src = getYouTubeEmbedUrl(previewId, true);
                setTimeout(() => {
                    if (iframeEl && iframeEl.getAttribute('src')) {
                        iframeEl.classList.add('playing');
                    }
                }, 1800);
            }

            // 3. Configura os Botões
            document.getElementById('hpc-btn-expand').onclick = () => {
                window.closeHoverPreview();
                window.openTitleModal(movieId);
            };
            document.getElementById('hpc-btn-play').onclick = () => {
                window.closeHoverPreview();
                if(data.isMain) window.startCinematicMovie();
                else if(data.ytTrailer) window.openVideoPlayer(data.ytTrailer, true);
                else if(data.trailer) window.openVideoPlayer(mediaUrl(data.trailer), false);
                else if(data.pdf) window.openPdfViewer(data.pdf, data.title, movieId);
            };
            
            // Botão de Minha Lista na Mini Tela
            const btnListIcon = document.querySelector('#hpc-btn-list i');
            if (btnListIcon) {
                btnListIcon.className = minhaLista.includes(movieId) ? "fa-solid fa-check" : "fa-solid fa-plus";
            }
            document.getElementById('hpc-btn-list').onclick = () => {
                currentModalMovieId = movieId; 
                window.toggleMinhaLista();
                if (btnListIcon) {
                    btnListIcon.className = minhaLista.includes(movieId) ? "fa-solid fa-check" : "fa-solid fa-plus";
                }
            };

            // 4. Calcula a Posição (Centraliza sobre o card original)
            const cardWidth = 340;
            let top = rect.top - 30; 
            let left = rect.left - ((cardWidth - rect.width) / 2); 

            // Impede que a tela vaze para fora do monitor
            if (left < 20) left = 20;
            if (left + cardWidth > window.innerWidth - 20) left = window.innerWidth - cardWidth - 20;
            if (top < 70) top = rect.top + 10; 

            hoverCard.style.top = `${top}px`;
            hoverCard.style.left = `${left}px`;
            hoverCard.classList.add('active');
        }

        window.closeHoverPreview = function() {
            const hoverCard = document.getElementById('hover-preview-card');
            if(!hoverCard || !hoverCard.classList.contains('active')) return;
            
            hoverCard.classList.remove('active');
            isHoverCardActive = false;
            
            // Limpa o vídeo, o iframe e a imagem para o próximo hover
            const videoEl = document.getElementById('hpc-video');
            if (videoEl) {
                videoEl.pause();
                videoEl.removeAttribute('src');
                videoEl.classList.remove('playing');
            }
            const iframeEl = document.getElementById('hpc-iframe');
            if (iframeEl) {
                iframeEl.removeAttribute('src');
                iframeEl.classList.remove('playing');
            }
            
            // Remove a imagem antiga imediatamente
            const imgEl = document.getElementById('hpc-img');
            if (imgEl) imgEl.style.opacity = 0;
        }

        // Inicia o sistema de hover assim que a página carregar
        window.addEventListener('DOMContentLoaded', initHoverAutoPlay);

        /* =========================================================
           FEATURE 4: HOLOFOTE (TEATRO DAS SOMBRAS)
           ========================================================= */
        const spotlightOverlay = document.getElementById('spotlight-overlay');
        let isSpotlightActive = false;

        // Atualiza a posição do holofote acompanhando o mouse
        document.addEventListener('mousemove', (e) => {
            if (!isSpotlightActive) return;
            
            const x = e.clientX;
            const y = e.clientY;
            
            // Recalcula o gradiente radial centrado na exata posição do cursor (x, y)
            spotlightOverlay.style.background = `radial-gradient(circle 220px at ${x}px ${y}px, transparent 0%, rgba(229, 9, 20, 0.05) 40%, rgba(0, 0, 0, 0.88) 75%, rgba(0, 0, 0, 0.98) 100%)`;
        });

        // Atalho de teclado para ativar/desativar (Tecla 'F')
        document.addEventListener('keydown', (e) => {
            // Ignora se o usuário estiver digitando na barra de pesquisa
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const videoModal = document.getElementById('video-modal');
            const isVideoOpen = (videoModal && videoModal.classList.contains('show')) ||
                                document.fullscreenElement ||
                                (typeof ytMainPlayerActive !== 'undefined' && ytMainPlayerActive);
            if (isVideoOpen) return;

            if (e.key.toLowerCase() === 'f') {
                isSpotlightActive = !isSpotlightActive;
                
                if (isSpotlightActive) {
                    spotlightOverlay.classList.add('active');
                } else {
                    spotlightOverlay.classList.remove('active');
                }
            }
        });

        /* =========================================================
           CENA PÓS-CRÉDITOS FINAL (APÓS A ASSINATURA)
           ========================================================= */
        let hasPlayedFinalCredits = false;

        function playFinalCredits() {
            const overlay = document.getElementById('final-post-credits-overlay');
            const video = document.getElementById('final-post-credits-video');
            
            overlay.style.display = 'flex';
            
            video.src = mediaUrl('pos_credito.mp4');
            
            playWithFallback(video).catch(() => {
                skipFinalCredits();
            });

            video.onended = () => {
                skipFinalCredits();
            };
        }

        window.skipFinalCredits = function() {
            const overlay = document.getElementById('final-post-credits-overlay');
            const video = document.getElementById('final-post-credits-video');
            
            video.pause();
            video.removeAttribute('src');
            overlay.style.display = 'none';
            hasPlayedFinalCredits = true;
            
            // Redireciona para a tela estática de fim de apresentação
            window.switchScreen('credits-screen');
        }

        /* =========================================================
           DELEGAÇÃO DE EVENTOS CENTRALIZADA (ACESSÍVEL / MOBILE / TOUCH)
           ========================================================= */
        document.addEventListener('DOMContentLoaded', () => {
            // 1. Carrega Perfis da Turma, Minha Lista e Continuar Assistindo
            if (typeof window.renderProfiles === 'function') window.renderProfiles();
            if (typeof initAvatarPicker === 'function') initAvatarPicker();
            renderMinhaLista();
            renderContinueWatching();
            renderTeacherWorks();
            renderDisneyCollectionsRow();

            // 2. Delegação de cliques em elementos com data-movie, data-profile ou episódios
            document.body.addEventListener('click', (e) => {
                // Ação em cards de filmes
                const movieCard = e.target.closest('[data-movie]');
                if (movieCard) {
                    const movieId = movieCard.dataset.movie;
                    if (movieId && typeof window.openTitleModal === 'function') {
                        window.openTitleModal(movieId);
                        return;
                    }
                }

                // Ação em perfis
                const profileBtn = e.target.closest('[data-profile]');
                if (profileBtn) {
                    const name = profileBtn.dataset.profile;
                    if (name && typeof window.selectProfile === 'function') {
                        window.selectProfile(name);
                        return;
                    }
                }

                // Ação em episódios do modal
                const epItem = e.target.closest('[data-ep-action]');
                if (epItem && typeof runEpisodeAction === 'function') {
                    runEpisodeAction(epItem);
                    return;
                }

                // Links do rodapé ou menu com data-action
                const footerAction = e.target.closest('[data-action]');
                if (footerAction) {
                    e.preventDefault();
                    const action = footerAction.dataset.action;
                    if (action === 'resumo' && typeof window.openResumoModal === 'function') {
                        window.openResumoModal();
                        return;
                    }
                    if (action && typeof window.openInfoModal === 'function') {
                        window.openInfoModal(action);
                        return;
                    }
                }
            });

            // 3. Suporte a ativação por teclado (Enter ou Espaço) em botões e cards personalizados
            document.body.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                const target = e.target.closest('[role="button"][tabindex="0"]');
                if (target && target.tagName !== 'BUTTON' && target.tagName !== 'INPUT') {
                    e.preventDefault();
                    target.click();
                }
            });

            // 4. Menu de Perfil (toque ou clique no botão abre/fecha dropdown em todas as telas)
            document.querySelectorAll('.nav-profile-wrapper').forEach(wrapper => {
                const btn = wrapper.querySelector('.nav-profile-btn');
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Fecha outros menus se abertos
                        document.querySelectorAll('.nav-profile-wrapper.open').forEach(w => {
                            if (w !== wrapper) {
                                w.classList.remove('open');
                                const ob = w.querySelector('.nav-profile-btn');
                                if (ob) ob.setAttribute('aria-expanded', 'false');
                            }
                        });
                        const isOpen = wrapper.classList.toggle('open');
                        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                    });
                }
            });

            document.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-profile-wrapper.open').forEach(wrapper => {
                    if (!wrapper.contains(e.target)) {
                        wrapper.classList.remove('open');
                        const btn = wrapper.querySelector('.nav-profile-btn');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // 5. Botões e Caixas de pesquisa dinâmicas (Home e Acervo)
            document.querySelectorAll('.search-box').forEach(box => {
                const iconBtn = box.querySelector('.search-icon');
                const input = box.querySelector('input');
                if (iconBtn && input) {
                    iconBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        box.classList.add('active');
                        input.focus();
                    });
                }
                if (input) {
                    input.addEventListener('focus', () => {
                        box.classList.add('active');
                    });
                    input.addEventListener('blur', () => {
                        if (input.value.trim() === '') {
                            box.classList.remove('active');
                        }
                    });
                }
            });

            // 6. Deep Linking automático via URL
            if (pendingScreenParam === 'acervo' || pendingScreenParam === 'trabalhos') {
                setTimeout(() => {
                    if (typeof window.selectProfile === 'function') window.selectProfile('Admin');
                }, 100);
            }
        });

        /* =========================================================
           APRESENTAÇÃO INTERATIVA: SEGURANÇA DA INFORMAÇÃO
           ========================================================= */
        const securityScript = [
            { id: 0, title: "T1:E1 - 01. Vulnerabilidades Web (PHP)", presenter: "Francisco Lucas", maxSteps: 3 },
            { id: 1, title: "T1:E2 - 02. O S.O.C. (Security Operations Center)", presenter: "João Pedro Santos", maxSteps: 6 },
            { id: 2, title: "T1:E3 - 03. A Nuvem (Modelos e Falhas)", presenter: "Pedro Victor", maxSteps: 2 },
            { id: 3, title: "T1:E4 - 04. Ameaças Sintéticas (Deepfakes)", presenter: "João Pedro Silva", maxSteps: 2 },
            { id: 4, title: "T1:E5 - 05. Governança e ISO 27001", presenter: "Nícolas Marcell", maxSteps: 2 },
            { id: 5, title: "T1:E6 - 06. Conclusão & Cultura de Segurança", presenter: "Nícolas Marcell", maxSteps: 1 }
        ];

        let secCurrentSlide = 0;
        let secCurrentStep = 1;
        let secAnimationInterval = null;
        let secAnimationTimeouts = [];
        let secDeepfakeAudioPlayed = false;

        function clearSecTimeouts() {
            secAnimationTimeouts.forEach(t => clearTimeout(t));
            secAnimationTimeouts = [];
        }

        function secSetTimeout(fn, delay) {
            const t = setTimeout(fn, delay);
            secAnimationTimeouts.push(t);
            return t;
        }

        window.openSecurityPresentation = function(startIdx = 0) {
            if (typeof window.closeTitleModal === 'function') {
                window.closeTitleModal(null, true);
            }
            if (typeof window.closePdfViewer === 'function') {
                window.closePdfViewer();
            }
            if (typeof window.closePlayer === 'function') {
                window.closePlayer();
            }

            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const secScreen = document.getElementById('security-player-screen');
            if (secScreen) {
                secScreen.classList.add('active');
            }

            const idx = (typeof startIdx === 'number' && startIdx >= 0 && startIdx < securityScript.length) ? startIdx : 0;
            window.renderSecuritySlide(idx);
        };

        window.closeSecurityPresentation = function() {
            if (secAnimationInterval) {
                clearInterval(secAnimationInterval);
                secAnimationInterval = null;
            }
            clearSecTimeouts();

            const dfAudio = document.getElementById('deepfake-audio');
            if (dfAudio) {
                dfAudio.pause();
                dfAudio.currentTime = 0;
            }

            const secScreen = document.getElementById('security-player-screen');
            if (secScreen) {
                secScreen.classList.remove('active');
            }

            if (typeof window.switchScreen === 'function') {
                window.switchScreen('acervo-screen');
            }
        };

        window.renderSecuritySlide = function(idx) {
            if (idx < 0) idx = 0;
            if (idx >= securityScript.length) idx = securityScript.length - 1;

            secCurrentSlide = idx;
            secCurrentStep = 1;
            secDeepfakeAudioPlayed = false;

            const cur = securityScript[idx];
            const titleEl = document.getElementById('sec-player-ep-title');
            if (titleEl) titleEl.textContent = cur.title;

            const presenterEl = document.getElementById('sec-presenter-name');
            if (presenterEl) presenterEl.textContent = cur.presenter;

            const barEl = document.getElementById('sec-progress-bar');
            if (barEl) barEl.style.width = `${((idx + 1) / securityScript.length) * 100}%`;

            document.querySelectorAll('#security-player-screen .slide').forEach(s => s.classList.remove('active'));
            const activeS = document.getElementById(`sec-slide-${idx}`);
            if (activeS) {
                activeS.classList.add('active');
                window.updateSecurityStepVisuals(activeS, 1);
            }
        };

        window.playDeepfakeAudio = function() {
            const dfAudio = document.getElementById('deepfake-audio');
            if (dfAudio) {
                dfAudio.currentTime = 0;
                dfAudio.volume = 1.0;
                dfAudio.play().catch(e => console.log('Áudio deepfake:', e));
            }
        };

        window.updateSecurityStepVisuals = function(slideElement, stepNum) {
            if (secAnimationInterval) {
                clearInterval(secAnimationInterval);
                secAnimationInterval = null;
            }
            clearSecTimeouts();

            if (!slideElement) return;

            slideElement.querySelectorAll('.step-info, .sim-screen').forEach(el => el.classList.remove('active-step', 'active-sim'));
            slideElement.querySelectorAll(`.step-${stepNum}`).forEach(el => {
                if (el.classList.contains('step-info')) el.classList.add('active-step');
                if (el.classList.contains('sim-screen')) el.classList.add('active-sim');
            });

            // Slide 0: SQLi, XSS, LFI
            if (secCurrentSlide === 0) {
                const urlEl = document.getElementById('ep1-url');
                if (stepNum === 1) {
                    if (urlEl) {
                        urlEl.textContent = "https://sistema-ifpi.com.br/login";
                        urlEl.classList.remove('url-highlight');
                    }
                    const runSqli = () => {
                        const ty = document.getElementById('typewriter-user');
                        const loginForm = document.getElementById('login-form-sqli');
                        const dbDump = document.getElementById('db-dump-sqli');
                        if (ty) {
                            ty.style.animation = 'none';
                            ty.textContent = "";
                        }
                        if (dbDump) dbDump.style.display = 'none';
                        if (loginForm) loginForm.style.display = 'block';

                        secSetTimeout(() => {
                            if (ty) {
                                ty.style.animation = 'typing 3s steps(20, end) forwards';
                                ty.textContent = "' OR 1=1 --";
                            }
                        }, 1500);

                        secSetTimeout(() => {
                            if (loginForm) loginForm.style.display = 'none';
                            if (dbDump) dbDump.style.display = 'block';
                        }, 6000);
                    };
                    runSqli();
                    secAnimationInterval = setInterval(runSqli, 12000);
                } else if (stepNum === 2) {
                    if (urlEl) {
                        urlEl.textContent = "https://sistema-ifpi.com.br/forum";
                        urlEl.classList.remove('url-highlight');
                    }
                    const runXss = () => {
                        const xssAlert = document.getElementById('xss-alert');
                        const xssLogged = document.getElementById('xss-logged');
                        const forumBox = document.querySelector('#sec-slide-0 .forum-box');
                        if (xssAlert) xssAlert.style.display = 'none';
                        if (xssLogged) xssLogged.style.display = 'none';
                        if (forumBox) forumBox.style.display = 'block';

                        secSetTimeout(() => {
                            if (xssAlert) xssAlert.style.display = 'block';
                        }, 2500);

                        secSetTimeout(() => {
                            if (xssAlert) xssAlert.style.display = 'none';
                            if (forumBox) forumBox.style.display = 'none';
                            if (xssLogged) xssLogged.style.display = 'block';
                        }, 7000);
                    };
                    runXss();
                    secAnimationInterval = setInterval(runXss, 14000);
                } else if (stepNum === 3) {
                    if (urlEl) {
                        urlEl.textContent = "https://sistema-ifpi.com.br/index.php?pasta=arquivos_secretos";
                        urlEl.classList.add('url-highlight');
                    }
                    const runLfi = () => {
                        const dl = document.getElementById('lfi-download');
                        if (dl) dl.style.display = 'none';
                        secSetTimeout(() => {
                            if (dl) dl.style.display = 'block';
                        }, 2500);
                    };
                    runLfi();
                    secAnimationInterval = setInterval(runLfi, 7000);
                }
            }

            // Slide 1: S.O.C.
            if (secCurrentSlide === 1) {
                const socAlert = document.getElementById('soc-alert');
                const socBlock = document.getElementById('soc-block');
                const socHunt = document.getElementById('soc-hunt');
                const socLogs = document.getElementById('soc-logs');
                const purplePulse = document.getElementById('purple-pulse');

                if (stepNum === 1) {
                    if (socAlert) socAlert.style.display = 'block';
                    if (socBlock) socBlock.style.display = 'none';
                    if (socHunt) socHunt.style.display = 'none';
                    if (socLogs) socLogs.style.display = 'block';
                } else if (stepNum === 2) {
                    if (socAlert) socAlert.style.display = 'none';
                    if (socBlock) socBlock.style.display = 'block';
                    if (socHunt) socHunt.style.display = 'none';
                    if (socLogs) socLogs.style.display = 'block';
                } else if (stepNum === 3) {
                    if (socAlert) socAlert.style.display = 'none';
                    if (socLogs) socLogs.style.display = 'none';
                    if (socBlock) socBlock.style.display = 'none';
                    if (socHunt) socHunt.style.display = 'flex';
                } else if (stepNum === 4) {
                    if (purplePulse) purplePulse.style.animation = "pulseSoft 2s infinite";
                }
            }

            // Slide 2: A Nuvem
            if (secCurrentSlide === 2) {
                if (stepNum === 2) {
                    const runBreach = () => {
                        const breach = document.getElementById('breach-stamp');
                        if (breach) breach.style.display = 'none';
                        secSetTimeout(() => {
                            if (breach) breach.style.display = 'block';
                        }, 2000);
                    };
                    runBreach();
                    secAnimationInterval = setInterval(runBreach, 7000);
                }
            }

            // Slide 3: Deepfakes
            if (secCurrentSlide === 3) {
                if (stepNum === 1) {
                    if (!secDeepfakeAudioPlayed) {
                        const dfAudio = document.getElementById('deepfake-audio');
                        if (dfAudio) {
                            dfAudio.volume = 1.0;
                            dfAudio.play().catch(e => console.log("Áudio deepfake bloqueado:", e));
                        }
                        secDeepfakeAudioPlayed = true;
                    }

                    const runAudio = () => {
                        const bar = document.getElementById('audio-progress');
                        const aiAlert = document.getElementById('ai-alert');
                        if (aiAlert) aiAlert.style.display = 'none';
                        if (bar) {
                            bar.style.transition = 'none';
                            bar.style.width = '0px';
                        }
                        secSetTimeout(() => {
                            if (bar) {
                                bar.style.transition = 'width 6s linear';
                                bar.style.width = '120px';
                            }
                        }, 50);
                        secSetTimeout(() => {
                            if (aiAlert) aiAlert.style.display = 'block';
                        }, 6500);
                    };
                    runAudio();
                    secAnimationInterval = setInterval(runAudio, 11000);
                }
            }

            // Slide 4: ISO 27001 / CISO
            if (secCurrentSlide === 4) {
                if (stepNum === 1) {
                    const runCiso = () => {
                        const ciso = document.getElementById('ciso-translation');
                        if (ciso) ciso.style.display = 'none';
                        secSetTimeout(() => {
                            if (ciso) ciso.style.display = 'block';
                        }, 2500);
                    };
                    runCiso();
                    secAnimationInterval = setInterval(runCiso, 8000);
                } else if (stepNum === 2) {
                    const runTriad = () => {
                        document.querySelectorAll('#sec-slide-4 .triad-item').forEach(i => i.classList.remove('active-triad'));
                        secSetTimeout(() => {
                            const t1 = document.getElementById('triad-1');
                            if (t1) t1.classList.add('active-triad');
                        }, 1500);
                        secSetTimeout(() => {
                            const t2 = document.getElementById('triad-2');
                            if (t2) t2.classList.add('active-triad');
                        }, 3500);
                        secSetTimeout(() => {
                            const t3 = document.getElementById('triad-3');
                            if (t3) t3.classList.add('active-triad');
                        }, 5500);
                    };
                    runTriad();
                    secAnimationInterval = setInterval(runTriad, 9000);
                }
            }
        };

        window.navSecuritySlide = function(dir) {
            const activeSlideEl = document.getElementById(`sec-slide-${secCurrentSlide}`);
            const maxSteps = parseInt(activeSlideEl?.getAttribute('data-max-steps') || "1", 10);

            if (dir > 0) {
                if (secCurrentStep < maxSteps) {
                    secCurrentStep++;
                    window.updateSecurityStepVisuals(activeSlideEl, secCurrentStep);
                } else {
                    const next = secCurrentSlide + 1;
                    if (next >= securityScript.length) {
                        window.closeSecurityPresentation();
                    } else {
                        window.renderSecuritySlide(next);
                    }
                }
            } else if (dir < 0) {
                if (secCurrentStep > 1) {
                    secCurrentStep--;
                    window.updateSecurityStepVisuals(activeSlideEl, secCurrentStep);
                } else if (secCurrentSlide > 0) {
                    window.renderSecuritySlide(secCurrentSlide - 1);
                }
            }
        };

        // Teclado na Apresentação Interativa (Setas Direita/Esquerda, Espaço e Esc)
        document.addEventListener('keydown', (e) => {
            const secScreen = document.getElementById('security-player-screen');
            if (!secScreen || !secScreen.classList.contains('active')) return;

            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                window.navSecuritySlide(1);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                window.navSecuritySlide(-1);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                window.closeSecurityPresentation();
            }
        });

        /* =========================================================
           SISTEMA DE GAMIFICAÇÃO & CONQUISTAS (ROCKSTAR ACHIEVEMENTS)
           ========================================================= */
        const ACHIEVEMENTS_DB = {
            'cine-master': {
                title: 'Cineasta do IFPI',
                desc: 'Iniciou a experiência cinematográfica 3D pelo espaço-tempo.',
                icon: 'fa-film',
                xp: '+100 XP'
            },
            'quiz-master': {
                title: 'Inimigo do Dogma',
                desc: 'Enfrentou e concluiu o Quiz Épico da Revolução Científica.',
                icon: 'fa-graduation-cap',
                xp: '+150 XP'
            },
            'card-collector': {
                title: 'Colecionador Lendário',
                desc: 'Inspecionou a Carta Holográfica 3D de um colega da turma.',
                icon: 'fa-id-card-clip',
                xp: '+80 XP'
            },
            'duel-master': {
                title: 'Gladiador do IFPI',
                desc: 'Disputou uma batalha épica 1v1 no Coliseu Acadêmico.',
                icon: 'fa-bolt',
                xp: '+120 XP'
            },
            'newton-genius': {
                title: 'Gênio de Cambridge',
                desc: 'Descobriu o segredo e invocou a gravidade da maçã de Newton.',
                icon: 'fa-apple-whole',
                xp: '+200 XP'
            },
            'patron-academic': {
                title: 'Mecenas Aprovado',
                desc: 'Assinou o IFPIFLIX com o cupom NOTA10 (100% de bolsa acadêmica).',
                icon: 'fa-receipt',
                xp: '+250 XP'
            },
            'rat-library': {
                title: 'Rato de Biblioteca',
                desc: 'Aprofundou seus estudos abrindo múltiplos trabalhos em PDF.',
                icon: 'fa-book-open',
                xp: '+100 XP'
            },
            'wrapped-master': {
                title: 'Viajante do Tempo',
                desc: 'Assistiu à Retrospectiva Wrapped dos Trabalhos da Turma.',
                icon: 'fa-trophy',
                xp: '+150 XP'
            }
        };

        let unlockedAchievements = [];
        try {
            unlockedAchievements = JSON.parse(localStorage.getItem('ifpiflix_achievements') || '[]');
        } catch (e) {
            unlockedAchievements = [];
        }

        let achievementToastTimeout = null;

        window.unlockAchievement = function(id) {
            const ach = ACHIEVEMENTS_DB[id];
            if (!ach) return;
            if (unlockedAchievements.includes(id)) return;

            unlockedAchievements.push(id);
            try {
                localStorage.setItem('ifpiflix_achievements', JSON.stringify(unlockedAchievements));
            } catch (e) {}

            const toast = document.getElementById('achievement-toast');
            const titleEl = document.getElementById('achievement-toast-title');
            const descEl = document.getElementById('achievement-toast-desc');
            const iconBox = document.getElementById('achievement-toast-icon');

            if (titleEl) titleEl.textContent = ach.title;
            if (descEl) descEl.textContent = ach.desc;
            if (iconBox) iconBox.innerHTML = `<i class="fa-solid ${ach.icon}"></i>`;

            if (toast) {
                toast.classList.add('show');
                if (typeof window.playIfpiflixSfx === 'function') {
                    window.playIfpiflixSfx('achievement');
                }

                clearTimeout(achievementToastTimeout);
                achievementToastTimeout = setTimeout(() => {
                    toast.classList.remove('show');
                }, 4800);
            }
        };

        // Rastreamento para Rato de Biblioteca
        let openedPdfsCount = 0;
        const originalOpenPdfViewer = window.openPdfViewer;
        if (typeof originalOpenPdfViewer === 'function') {
            window.openPdfViewer = function(pdfUrl, title, movieId) {
                openedPdfsCount++;
                if (openedPdfsCount >= 3) {
                    window.unlockAchievement('rat-library');
                }
                return originalOpenPdfViewer(pdfUrl, title, movieId);
            };
        }

        /* =========================================================
           IFPI ULTIMATE TEAM - BANCO DE DADOS RPG DOS ALUNOS
           ========================================================= */
        const STUDENT_RPG_STATS = {
            'francisco-lucas': {
                ovr: 99,
                pos: 'DEV / ARCH',
                classTitle: 'Mestre Arquiteto de Sistemas',
                skill: 'Compilação Sem Erros & Dúvida Metódica',
                quote: 'Se o código roda a 60 FPS e a dúvida é cartesiana, a nota 10 é inevitável.',
                stats: { oratoria: 98, filosofia: 99, codigo: 99, antiDogma: 97 }
            },
            'joao-pedro-santos': {
                ovr: 98,
                pos: 'LEAD / STRAT',
                classTitle: 'Marechal da Turma',
                skill: 'Liderança Tática & Demolição Dogmática',
                quote: 'Aqui a escolástica medieval não passa do primeiro slide de abertura.',
                stats: { oratoria: 99, filosofia: 97, codigo: 95, antiDogma: 99 }
            },
            'pedro-victor': {
                ovr: 97,
                pos: 'CYBER / SOC',
                classTitle: 'Guardião de Defesa Cibernética',
                skill: 'Firewall Hipotético-Dedutivo',
                quote: 'Nenhum exploit corrompe quem pesquisa com empirismo e rigor.',
                stats: { oratoria: 94, filosofia: 95, codigo: 99, antiDogma: 98 }
            },
            'davi-costa': {
                ovr: 97,
                pos: 'RHETOR / PHI',
                classTitle: 'Orador Socrático Supremo',
                skill: 'Maiêutica de Alta Precisão',
                quote: 'Só sei que nada sei... exceto que nosso seminário é cinema puro.',
                stats: { oratoria: 99, filosofia: 98, codigo: 93, antiDogma: 99 }
            },
            'samuel-soares': {
                ovr: 96,
                pos: 'HW / ARCH',
                classTitle: 'Engenheiro de Arquitetura de Silício',
                skill: 'Overclock Filosófico das Máquinas',
                quote: 'Das válvulas de 1940 aos transistores quânticos, a razão guia o hardware.',
                stats: { oratoria: 94, filosofia: 96, codigo: 98, antiDogma: 95 }
            },
            'joao-pedro-silva': {
                ovr: 96,
                pos: 'SCI / ASTRO',
                classTitle: 'Cientista Empirista Galileano',
                skill: 'Luneta Astrofísica Reveladora',
                quote: 'E contudo, ela se move! A física não pede licença à tradição.',
                stats: { oratoria: 95, filosofia: 97, codigo: 96, antiDogma: 97 }
            },
            'nicolas-marcell': {
                ovr: 96,
                pos: 'LIT / CRITIC',
                classTitle: 'Mestre do Realismo & Modernismo',
                skill: 'Ironia Machadiana Implacável',
                quote: 'Aos vencedores, as batatas... e nota máxima para o nosso grupo.',
                stats: { oratoria: 97, filosofia: 96, codigo: 94, antiDogma: 98 }
            },
            'micaias-lima': {
                ovr: 95,
                pos: 'SOC / MEDIA',
                classTitle: 'Voz da Sociologia & Mídia',
                skill: 'Ruptura Cultural & Dialética',
                quote: 'Tecnologia sem pensamento sociológico vira apenas algoritmo alienante.',
                stats: { oratoria: 96, filosofia: 97, codigo: 95, antiDogma: 96 }
            },
            'marcelo': {
                ovr: 95,
                pos: 'RATIO / MATH',
                classTitle: 'Cavaleiro do Racionalismo Cartesiano',
                skill: 'Geometria Analítica contra a Incerteza',
                quote: 'Dividir cada problema em partes tão pequenas quanto possível para resolvê-lo.',
                stats: { oratoria: 95, filosofia: 98, codigo: 94, antiDogma: 96 }
            },
            'maria-helena': {
                ovr: 97,
                pos: 'ELOQ / ART',
                classTitle: 'Estrategista do Renascimento',
                skill: 'Eloquência Iluminista & Diplomacia',
                quote: 'A verdadeira sabedoria está em transformar conceitos complexos em arte.',
                stats: { oratoria: 98, filosofia: 98, codigo: 96, antiDogma: 97 }
            },
            'marcos-felipe': {
                ovr: 95,
                pos: 'SIM / ENG',
                classTitle: 'Comandante da Dinâmica de Trânsito',
                skill: 'Leis de Newton no Tráfego Urbano',
                quote: 'No trânsito e na ciência: acelerar a razão, frear os dogmas.',
                stats: { oratoria: 95, filosofia: 94, codigo: 97, antiDogma: 96 }
            }
        };

        function getStudentRpgData(student) {
            const key = student.id || student.name.toLowerCase().replace(/\s+/g, '-');
            if (STUDENT_RPG_STATS[key]) return { ...student, ...STUDENT_RPG_STATS[key] };
            
            // Gerador automático equilibrado para os demais integrantes
            return {
                ...student,
                ovr: 95,
                pos: 'ACAD / STAR',
                classTitle: 'Pioneiro da Revolução Intelectual',
                skill: 'Raciocínio Lógico & Defesa de Tese',
                quote: 'A busca pelo conhecimento transforma a turma em lenda viva.',
                stats: { oratoria: 95, filosofia: 96, codigo: 95, antiDogma: 96 }
            };
        }

        let currentActiveCardStudent = null;

        window.openStudentCardModal = function(studentKey) {
            if (!studentKey) return;
            const normKey = studentKey.toString().trim().toLowerCase();
            const student = STUDENTS_REGISTRY.find(s => 
                s.id === normKey || 
                s.name.toLowerCase() === normKey || 
                (s.aliases && s.aliases.some(a => a.toLowerCase() === normKey))
            ) || {
                id: normKey,
                name: studentKey,
                fullName: studentKey,
                initials: studentKey.slice(0, 2).toUpperCase(),
                color: '#e50914'
            };

            currentActiveCardStudent = getStudentRpgData(student);
            const data = currentActiveCardStudent;

            const modal = document.getElementById('student-card-modal-overlay');
            const cardInner = document.getElementById('card-inner-content');
            const duelArena = document.getElementById('duel-arena-box');

            if (duelArena) duelArena.style.display = 'none';

            const avatarHtml = data.avatar 
                ? `<img src="${imgUrl(data.avatar, 300)}" alt="${data.name}" class="card-avatar-img">`
                : `<div class="card-avatar-img" style="background: linear-gradient(135deg, ${data.color || '#e50914'}, #400);">${data.initials}</div>`;

            if (cardInner) {
                cardInner.innerHTML = `
                    <div class="card-rpg-header">
                        <div class="card-ovr-badge">
                            <span class="card-ovr-num">${data.ovr}</span>
                            <span class="card-ovr-pos">${data.pos}</span>
                        </div>
                        <div class="card-header-titles">
                            <div class="card-class-tag">${data.classTitle}</div>
                            <div class="card-student-name">${data.name}</div>
                        </div>
                    </div>

                    <div class="card-avatar-wrap">
                        ${avatarHtml}
                    </div>

                    <div class="card-special-skill">
                        <strong><i class="fa-solid fa-wand-magic-sparkles"></i> HABILIDADE: ${data.skill}</strong>
                        "${data.quote}"
                    </div>

                    <div class="card-stats-grid">
                        <div class="card-stat-item">
                            <span class="card-stat-label"><i class="fa-solid fa-microphone-lines"></i> Oratória</span>
                            <span class="card-stat-value">${data.stats.oratoria}</span>
                        </div>
                        <div class="card-stat-item">
                            <span class="card-stat-label"><i class="fa-solid fa-brain"></i> Filosofia</span>
                            <span class="card-stat-value">${data.stats.filosofia}</span>
                        </div>
                        <div class="card-stat-item">
                            <span class="card-stat-label"><i class="fa-solid fa-code"></i> Código & T.I.</span>
                            <span class="card-stat-value">${data.stats.codigo}</span>
                        </div>
                        <div class="card-stat-item">
                            <span class="card-stat-label"><i class="fa-solid fa-shield-halved"></i> Anti-Dogma</span>
                            <span class="card-stat-value">${data.stats.antiDogma}</span>
                        </div>
                    </div>
                `;
            }

            if (modal) {
                modal.classList.add('show');
                window.bindHolographicCardTilt();
                if (typeof updateStudentCardBurstLikeButton === 'function') {
                    updateStudentCardBurstLikeButton(data.id || data.name);
                }
                if (typeof window.playIfpiflixSfx === 'function') {
                    window.playIfpiflixSfx('card-hover');
                }
                if (typeof window.unlockAchievement === 'function') {
                    window.unlockAchievement('card-collector');
                }
            }
        };

        window.closeStudentCardModal = function() {
            if (typeof window.stopStudentDuelFight === 'function') {
                window.stopStudentDuelFight();
            }
            const modal = document.getElementById('student-card-modal-overlay');
            if (modal) modal.classList.remove('show');
            if (window.SoundEngine) window.SoundEngine.play('closeModal');
        };

        window.handleStudentCardOverlayClick = function(e) {
            if (e.target && e.target.id === 'student-card-modal-overlay') {
                window.closeStudentCardModal();
            }
        };

        window.copyStudentCardQuote = function() {
            if (!currentActiveCardStudent) return;
            const text = `"${currentActiveCardStudent.quote}" — ${currentActiveCardStudent.name} (OVR ${currentActiveCardStudent.ovr} / ${currentActiveCardStudent.classTitle})`;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    if (typeof window.showToastNotification === 'function') {
                        window.showToastNotification('Lema do colega copiado!');
                    }
                }).catch(() => {});
            }
        };

        /* FÍSICA E TILT 3D DO CARD COM GLOW REFLEXIVO */
        let cardTiltBound = false;
        window.bindHolographicCardTilt = function() {
            const card = document.getElementById('holographic-card-3d');
            const stage = document.getElementById('card-3d-stage');
            if (!card || !stage || cardTiltBound) return;
            cardTiltBound = true;

            const handleMove = (clientX, clientY) => {
                const rect = card.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -16;
                const rotateY = ((x - centerX) / centerX) * 16;

                const glareX = (x / rect.width) * 100;
                const glareY = (y / rect.height) * 100;
                const foilDeg = 90 + (rotateY * 4);

                card.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
                card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
                card.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
                card.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);
                card.style.setProperty('--foil-deg', `${foilDeg.toFixed(1)}deg`);
            };

            stage.addEventListener('pointermove', (e) => {
                handleMove(e.clientX, e.clientY);
            });

            stage.addEventListener('pointerleave', () => {
                card.style.setProperty('--rx', `0deg`);
                card.style.setProperty('--ry', `0deg`);
                card.style.setProperty('--glare-x', `50%`);
                card.style.setProperty('--glare-y', `50%`);
            });

            // Giroscópio para mobile
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', (e) => {
                    if (!e.gamma || !e.beta) return;
                    const rotateY = Math.max(-18, Math.min(18, e.gamma * 0.8));
                    const rotateX = Math.max(-18, Math.min(18, (e.beta - 45) * 0.8));
                    card.style.setProperty('--rx', `${(-rotateX).toFixed(2)}deg`);
                    card.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
                    card.style.setProperty('--glare-x', `${(50 + rotateY * 2).toFixed(1)}%`);
                    card.style.setProperty('--glare-y', `${(50 + rotateX * 2).toFixed(1)}%`);
                });
            }
        };

        /* =========================================================
           COLISEU ACADÊMICO - DUELO 1V1 (BLINDADO CONTRA RACE CONDITIONS)
           ========================================================= */
        let activeDuelFightInterval = null;
        let isDuelFightActive = false;

        window.stopStudentDuelFight = function() {
            if (activeDuelFightInterval) {
                clearInterval(activeDuelFightInterval);
                activeDuelFightInterval = null;
            }
            isDuelFightActive = false;
            const btnFight = document.querySelector('.btn-start-duel');
            if (btnFight) {
                btnFight.disabled = false;
                btnFight.style.opacity = '1';
                btnFight.style.cursor = 'pointer';
                btnFight.innerHTML = '<i class="fa-solid fa-fire"></i> LUTAR!';
            }
        };

        window.openStudentDuelSelect = function() {
            if (!currentActiveCardStudent) return;
            const arena = document.getElementById('duel-arena-box');
            const select = document.getElementById('duel-opponent-select');
            const fighters = document.getElementById('duel-arena-fighters');
            const log = document.getElementById('duel-battle-log');

            if (!arena || !select) return;

            arena.style.display = 'block';
            if (fighters) fighters.style.display = 'none';
            if (log) log.style.display = 'none';

            // Popula opções excluindo o aluno atual
            select.innerHTML = STUDENTS_REGISTRY
                .filter(s => s.name.toLowerCase() !== currentActiveCardStudent.name.toLowerCase())
                .map(s => `<option value="${s.id || s.name}">${s.name} (${s.fullName})</option>`)
                .join('');

            arena.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

        window.onDuelOpponentChanged = function() {
            if (typeof window.stopStudentDuelFight === 'function') {
                window.stopStudentDuelFight();
            }
            const fighters = document.getElementById('duel-arena-fighters');
            const log = document.getElementById('duel-battle-log');
            if (fighters) fighters.style.display = 'none';
            if (log) {
                log.style.display = 'none';
                log.innerHTML = '';
            }
            if (typeof window.playIfpiflixSfx === 'function') window.playIfpiflixSfx('click');
        };

        window.startStudentDuelFight = function() {
            if (!currentActiveCardStudent) return;
            const select = document.getElementById('duel-opponent-select');
            const fighters = document.getElementById('duel-arena-fighters');
            const log = document.getElementById('duel-battle-log');
            const btnFight = document.querySelector('.btn-start-duel');
            if (!select || !fighters || !log) return;

            // Se já houver um duelo em andamento, cancela o anterior de forma limpa antes de reiniciar
            if (activeDuelFightInterval) {
                clearInterval(activeDuelFightInterval);
                activeDuelFightInterval = null;
            }
            isDuelFightActive = true;
            if (btnFight) {
                btnFight.disabled = true;
                btnFight.style.opacity = '0.6';
                btnFight.style.cursor = 'not-allowed';
                btnFight.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> LUTANDO...';
            }

            const oppId = select.value;
            const opponentBase = STUDENTS_REGISTRY.find(s => (s.id || s.name) === oppId) || { name: oppId, fullName: oppId };
            const opponent = getStudentRpgData(opponentBase);

            fighters.style.display = 'flex';
            log.style.display = 'block';

            fighters.innerHTML = `
                <div class="duel-fighter">
                    <span class="duel-fighter-name">${currentActiveCardStudent.name} (OVR ${currentActiveCardStudent.ovr})</span>
                    <div class="duel-fighter-hp"><div id="duel-p1-hp" class="duel-hp-bar"></div></div>
                </div>
                <div class="duel-vs-badge">VS</div>
                <div class="duel-fighter">
                    <span class="duel-fighter-name">${opponent.name} (OVR ${opponent.ovr})</span>
                    <div class="duel-fighter-hp"><div id="duel-p2-hp" class="duel-hp-bar"></div></div>
                </div>
            `;

            log.innerHTML = `<div class="duel-battle-round">⚔️ <strong>O DUELO COMEÇOU!</strong> A plateia do IFPI vai ao delírio no Coliseu Acadêmico!</div>`;

            let p1Hp = 100;
            let p2Hp = 100;

            const rounds = [
                {
                    attr: 'oratoria',
                    title: 'DISPUTA DE ORATÓRIA & RETÓRICA',
                    val1: currentActiveCardStudent.stats.oratoria,
                    val2: opponent.stats.oratoria,
                    action1: `desferiu um discurso avassalador usando a arte da dialética!`,
                    action2: `respondeu com uma refutação irônica digna de Machado de Assis!`
                },
                {
                    attr: 'codigo',
                    title: 'BATALHA DE CÓDIGO & ARQUITETURA',
                    val1: currentActiveCardStudent.stats.codigo,
                    val2: opponent.stats.codigo,
                    action1: `compilou um algoritmo otimizado em O(log n) sem warnings!`,
                    action2: `subiu um script defensivo com criptografia pós-quântica!`
                },
                {
                    attr: 'antiDogma',
                    title: 'CLÍMAX: DÚVIDA METÓDICA & ANTI-DOGMA',
                    val1: currentActiveCardStudent.stats.antiDogma,
                    val2: opponent.stats.antiDogma,
                    action1: `usou a síntese newtoniana e abalou as certezas medievais!`,
                    action2: `aplicou a dúvida hiperbólica de Descartes com potência máxima!`
                }
            ];

            let roundIdx = 0;
            activeDuelFightInterval = setInterval(() => {
                if (roundIdx < rounds.length) {
                    const r = rounds[roundIdx];
                    const diff = r.val1 - r.val2;

                    let roundText = '';
                    if (diff >= 0) {
                        const dmg = Math.floor(25 + Math.random() * 15 + diff * 2);
                        p2Hp = Math.max(10, p2Hp - dmg);
                        roundText = `<div class="duel-battle-round"><strong>Round ${roundIdx + 1} - ${r.title}:</strong> ${currentActiveCardStudent.name} ${r.action1} Causou <strong>${dmg} de dano epistemológico</strong> em ${opponent.name}!</div>`;
                    } else {
                        const dmg = Math.floor(25 + Math.random() * 15 + Math.abs(diff) * 2);
                        p1Hp = Math.max(10, p1Hp - dmg);
                        roundText = `<div class="duel-battle-round"><strong>Round ${roundIdx + 1} - ${r.title}:</strong> ${opponent.name} ${r.action2} Causou <strong>${dmg} de dano epistemológico</strong> em ${currentActiveCardStudent.name}!</div>`;
                    }

                    if (typeof window.playIfpiflixSfx === 'function') window.playIfpiflixSfx('duel-hit');

                    const p1Bar = document.getElementById('duel-p1-hp');
                    const p2Bar = document.getElementById('duel-p2-hp');
                    if (p1Bar) p1Bar.style.width = `${p1Hp}%`;
                    if (p2Bar) p2Bar.style.width = `${p2Hp}%`;

                    log.innerHTML += roundText;
                    log.scrollTop = log.scrollHeight;
                    roundIdx++;
                } else {
                    if (activeDuelFightInterval) {
                        clearInterval(activeDuelFightInterval);
                        activeDuelFightInterval = null;
                    }
                    isDuelFightActive = false;
                    if (btnFight) {
                        btnFight.disabled = false;
                        btnFight.style.opacity = '1';
                        btnFight.style.cursor = 'pointer';
                        btnFight.innerHTML = '<i class="fa-solid fa-rotate-right"></i> LUTAR NOVAMENTE';
                    }

                    const winner = (p1Hp >= p2Hp) ? currentActiveCardStudent : opponent;
                    log.innerHTML += `
                        <div class="duel-battle-round" style="color: #ffd700; font-weight: 800; font-size: 0.95rem; text-align: center; margin-top: 8px;">
                            🏆 FIM DE COMBATE! O VENCEDOR É <strong>${winner.name.toUpperCase()}</strong>!
                            <div style="font-size: 0.8rem; color: #46d369; margin-top: 4px;">Ambos provaram que na Turma do IFPI não há espaço para o dogma! Nota 10 geral!</div>
                        </div>
                    `;
                    log.scrollTop = log.scrollHeight;
                    if (typeof window.playIfpiflixSfx === 'function') window.playIfpiflixSfx('achievement');
                    if (typeof window.unlockAchievement === 'function') window.unlockAchievement('duel-master');
                }
            }, 1000);
        };

        /* =========================================================
           CHECKOUT PARÓDIA DO IFPIFLIX (R$ 67,90 COM CUPOM NOTA10)
           ========================================================= */
        let hasApplied100Discount = false;

        window.openSubscriptionCheckout = function() {
            const modal = document.getElementById('subscription-checkout-modal');
            const normalView = document.getElementById('checkout-coupon-section');
            const successView = document.getElementById('checkout-success-view');
            const actionFooter = document.querySelector('.checkout-action-footer');
            const guaranteeList = document.querySelector('.checkout-guarantee-list');

            if (normalView) normalView.style.display = 'block';
            if (actionFooter) actionFooter.style.display = 'block';
            if (guaranteeList) guaranteeList.style.display = 'flex';
            if (successView) successView.style.display = 'none';

            if (modal) {
                modal.classList.add('show');
                if (typeof window.playIfpiflixSfx === 'function') window.playIfpiflixSfx('click');
            }
        };

        window.closeSubscriptionCheckout = function() {
            const modal = document.getElementById('subscription-checkout-modal');
            if (modal) modal.classList.remove('show');
        };

        window.handleCheckoutOverlayClick = function(e) {
            if (e.target && e.target.id === 'subscription-checkout-modal') {
                window.closeSubscriptionCheckout();
            }
        };

        window.applyCheckoutCoupon = function() {
            const input = document.getElementById('checkout-coupon-input');
            const msg = document.getElementById('checkout-coupon-msg');
            const originalPrice = document.getElementById('checkout-original-price');
            const discountRow = document.getElementById('checkout-discount-row');
            const finalPrice = document.getElementById('checkout-final-price');

            if (!input) return;
            const val = input.value.trim().toUpperCase().replace(/\s+/g, '');

            if (['NOTA10', 'GRUPO6', 'IFPI', '10', 'NOTA_10', 'PROFESSOR'].includes(val)) {
                hasApplied100Discount = true;
                if (originalPrice) originalPrice.classList.add('struck');
                if (discountRow) discountRow.style.display = 'flex';
                if (finalPrice) {
                    finalPrice.textContent = 'R$ 0,00';
                    finalPrice.style.color = '#46d369';
                }
                if (msg) {
                    msg.innerHTML = '<strong style="color:#46d369;"><i class="fa-solid fa-circle-check"></i> CUPOM APLICADO COM SUCESSO! 100% DE BOLSA POR MERECIMENTO!</strong>';
                }
                if (typeof window.playIfpiflixSfx === 'function') {
                    window.playIfpiflixSfx('coins');
                }
            } else {
                if (msg) {
                    msg.innerHTML = '<span style="color:#ff4444;"><i class="fa-solid fa-circle-exclamation"></i> Cupom inválido! Experimente digitar <strong>NOTA10</strong> ou <strong>GRUPO6</strong>!</span>';
                }
                if (typeof window.playIfpiflixSfx === 'function') {
                    window.playIfpiflixSfx('quiz-wrong');
                }
            }
        };

        window.confirmSubscriptionPurchase = function() {
            const couponInput = document.getElementById('checkout-coupon-input');
            if (!hasApplied100Discount) {
                // Aplica automaticamente para uma experiência engraçada
                if (couponInput) couponInput.value = 'NOTA10';
                window.applyCheckoutCoupon();
            }

            const normalView = document.getElementById('checkout-coupon-section');
            const successView = document.getElementById('checkout-success-view');
            const actionFooter = document.querySelector('.checkout-action-footer');
            const guaranteeList = document.querySelector('.checkout-guarantee-list');

            if (normalView) normalView.style.display = 'none';
            if (actionFooter) actionFooter.style.display = 'none';
            if (guaranteeList) guaranteeList.style.display = 'none';
            if (successView) successView.style.display = 'block';

            if (typeof window.playIfpiflixSfx === 'function') {
                window.playIfpiflixSfx('achievement');
            }
            if (typeof window.unlockAchievement === 'function') {
                window.unlockAchievement('patron-academic');
            }
        };

        /* =========================================================
           EASTER EGG: A FÍSICA E GRAVIDADE DE NEWTON (CANVAS)
           ========================================================= */
        let newtonClickCount = 0;
        let newtonClickTimer = null;
        let newtonCanvasActive = false;
        let newtonAnimId = null;

        window.triggerNewtonGravityEasterEgg = function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            newtonClickCount++;

            if (typeof window.playIfpiflixSfx === 'function') {
                window.playIfpiflixSfx('click');
            }

            clearTimeout(newtonClickTimer);
            newtonClickTimer = setTimeout(() => { newtonClickCount = 0; }, 1800);

            if (newtonClickCount >= 3) {
                newtonClickCount = 0;
                window.startNewtonPhysicsSimulation();
            } else {
                if (typeof window.showToastNotification === 'function') {
                    window.showToastNotification(`🍎 Maçã de Newton atingida! Clique mais ${3 - newtonClickCount}x para romper a gravidade!`);
                }
            }
        };

        // Código Secreto digitado: "NEWTON"
        let newtonKeySequence = "";
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            newtonKeySequence += e.key.toUpperCase();
            if (newtonKeySequence.length > 10) newtonKeySequence = newtonKeySequence.slice(-10);

            if (newtonKeySequence.endsWith('NEWTON')) {
                newtonKeySequence = "";
                window.startNewtonPhysicsSimulation();
            }
        });

        window.startNewtonPhysicsSimulation = function() {
            const canvas = document.getElementById('newton-canvas-overlay');
            if (!canvas) return;

            window.unlockAchievement('newton-genius');
            if (typeof window.showToastNotification === 'function') {
                window.showToastNotification('🍏 SÍNTESE NEWTONIANA ATIVADA: F = G(m₁m₂)/r² !');
            }
            if (typeof window.playIfpiflixSfx === 'function') {
                window.playIfpiflixSfx('achievement');
            }

            canvas.classList.add('active');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const formulas = [
                'F = G(m₁m₂)/r²', 'F = m·a', 'E = mc²', '∇ × B = μ₀J',
                'v = v₀ + gt', 'ΔS = v₀t + ½gt²', 'p = m·v', 'T = 2π√(L/g)'
            ];

            const particles = [];
            const count = 35;

            for (let i = 0; i < count; i++) {
                const isFormula = (i % 2 === 0);
                particles.push({
                    x: Math.random() * canvas.width,
                    y: -50 - Math.random() * 300,
                    vx: (Math.random() - 0.5) * 4,
                    vy: Math.random() * 3 + 2,
                    gravity: 0.45 + Math.random() * 0.2,
                    bounce: 0.65,
                    radius: isFormula ? 25 : 20,
                    rotation: Math.random() * Math.PI * 2,
                    vRot: (Math.random() - 0.5) * 0.1,
                    isFormula: isFormula,
                    text: formulas[Math.floor(Math.random() * formulas.length)],
                    color: isFormula ? '#ffd700' : '#e50914',
                    bounces: 0
                });
            }

            let frames = 0;
            const maxFrames = 360; // Duração aprox de 6 segundos a 60fps

            function animate() {
                frames++;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                particles.forEach(p => {
                    p.vy += p.gravity;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.rotation += p.vRot;

                    // Colisão com o chão
                    if (p.y + p.radius >= canvas.height) {
                        p.y = canvas.height - p.radius;
                        p.vy = -p.vy * p.bounce;
                        p.vx *= 0.95;
                        p.bounces++;
                        if (p.bounces <= 2 && typeof window.playIfpiflixSfx === 'function') {
                            window.playIfpiflixSfx('apple-bounce');
                        }
                    }

                    // Colisão com paredes laterais
                    if (p.x - p.radius <= 0 || p.x + p.radius >= canvas.width) {
                        p.vx = -p.vx * 0.8;
                    }

                    // Desenho da partícula
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);

                    if (p.isFormula) {
                        ctx.font = 'bold 18px "Inter", sans-serif';
                        ctx.fillStyle = p.color;
                        ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
                        ctx.shadowBlur = 10;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(p.text, 0, 0);
                    } else {
                        // Desenha uma maçã estilizada
                        ctx.fillStyle = p.color;
                        ctx.shadowColor = 'rgba(229, 9, 20, 0.8)';
                        ctx.shadowBlur = 12;
                        ctx.beginPath();
                        ctx.arc(0, 0, 16, 0, Math.PI * 2);
                        ctx.fill();
                        // Folha verde
                        ctx.fillStyle = '#46d369';
                        ctx.beginPath();
                        ctx.ellipse(4, -18, 6, 3, Math.PI / 4, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    ctx.restore();
                });

                if (frames < maxFrames) {
                    newtonAnimId = requestAnimationFrame(animate);
                } else {
                    canvas.classList.remove('active');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            }

            cancelAnimationFrame(newtonAnimId);
            animate();
        };

        /* =========================================================
           SISTEMA DE LIKES COM ANIMAÇÃO BURST(HEART) & PARTÍCULAS
           ========================================================= */

        // Função geradora de partículas de coração flutuantes (Burst)
        window.createHeartBurst = function(targetElement) {
            if (!targetElement) return;
            const zone = targetElement.closest('.demo-like-zone') || targetElement.parentElement;
            if (!zone) return;

            const particleCount = 8;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'burst-particle-heart';
                
                particle.style.left = '50%';
                particle.style.top = '50%';
                
                const angle = (i * (360 / particleCount) + (Math.random() * 20 - 10)) * (Math.PI / 180);
                const distance = 40 + Math.random() * 35;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance - 18;
                const rot = (Math.random() - 0.5) * 60;
                
                particle.style.setProperty('--tx', `${tx.toFixed(1)}px`);
                particle.style.setProperty('--ty', `${ty.toFixed(1)}px`);
                particle.style.setProperty('--tr', `${rot.toFixed(1)}deg`);
                
                const colors = ['#e50914', '#ff4d5a', '#ffd700', '#ff6b81', '#ffffff'];
                const chosenColor = colors[Math.floor(Math.random() * colors.length)];
                
                particle.innerHTML = `
                    <svg viewBox="0 0 24 24" style="width: 100%; height: 100%; fill: ${chosenColor}; filter: drop-shadow(0 0 6px ${chosenColor});">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path>
                    </svg>
                `;
                
                zone.appendChild(particle);
                setTimeout(() => particle.remove(), 750);
            }
        };

        // Likes no Modal de Detalhes dos Filmes/Trabalhos
        function getMovieLikesData(movieId) {
            let likesStore = {};
            try {
                likesStore = JSON.parse(localStorage.getItem('ifpiflix_movie_likes_store') || '{}');
            } catch (e) { likesStore = {}; }
            
            const defaultLikes = Math.abs(movieId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 100));
            
            if (!likesStore[movieId]) {
                likesStore[movieId] = { count: defaultLikes, liked: false };
            }
            return { store: likesStore, data: likesStore[movieId] };
        }

        window.updateMovieBurstLikeButton = function(movieId) {
            const btn = document.getElementById('m-btn-burst-like');
            const countEl = document.getElementById('m-like-count');
            if (!btn || !countEl || !movieId) return;
            
            const { data } = getMovieLikesData(movieId);
            countEl.textContent = data.count;
            if (data.liked) {
                btn.classList.add('liked');
            } else {
                btn.classList.remove('liked');
            }
        };

        window.triggerBurstLike = function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (!currentModalMovieId) return;
            
            const btn = document.getElementById('m-btn-burst-like');
            const countEl = document.getElementById('m-like-count');
            const { store, data } = getMovieLikesData(currentModalMovieId);
            
            data.liked = !data.liked;
            if (data.liked) {
                data.count++;
                if (btn) btn.classList.add('liked');
                window.createHeartBurst(btn);
                if (typeof window.playIfpiflixSfx === 'function') {
                    window.playIfpiflixSfx('click');
                    window.playIfpiflixSfx('coins');
                }
                if (typeof window.showToastNotification === 'function') {
                    window.showToastNotification('Você curtiu este trabalho da turma! ❤️');
                }
            } else {
                data.count = Math.max(0, data.count - 1);
                if (btn) btn.classList.remove('liked');
                if (typeof window.playIfpiflixSfx === 'function') {
                    window.playIfpiflixSfx('click');
                }
            }
            
            if (countEl) countEl.textContent = data.count;
            store[currentModalMovieId] = data;
            try {
                localStorage.setItem('ifpiflix_movie_likes_store', JSON.stringify(store));
            } catch (err) {}
        };

        // Likes na Carta 3D do Aluno
        function getStudentLikesData(studentKey) {
            let studentLikes = {};
            try {
                studentLikes = JSON.parse(localStorage.getItem('ifpiflix_student_likes_store') || '{}');
            } catch (e) { studentLikes = {}; }
            
            const defaultLikes = Math.abs(studentKey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 180));
            if (!studentLikes[studentKey]) {
                studentLikes[studentKey] = { count: defaultLikes, liked: false };
            }
            return { store: studentLikes, data: studentLikes[studentKey] };
        }

        window.updateStudentCardBurstLikeButton = function(studentKey) {
            const btn = document.getElementById('card-student-like-btn');
            const countEl = document.getElementById('card-student-like-count');
            if (!btn || !countEl || !studentKey) return;
            
            const { data } = getStudentLikesData(studentKey);
            countEl.textContent = data.count;
            if (data.liked) {
                btn.classList.add('liked');
            } else {
                btn.classList.remove('liked');
            }
        };

        window.triggerStudentCardBurstLike = function(e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (!currentActiveCardStudent) return;
            
            const studentKey = currentActiveCardStudent.id || currentActiveCardStudent.name;
            const btn = document.getElementById('card-student-like-btn');
            const countEl = document.getElementById('card-student-like-count');
            const { store, data } = getStudentLikesData(studentKey);
            
            data.liked = !data.liked;
            if (data.liked) {
                data.count++;
                if (btn) btn.classList.add('liked');
                window.createHeartBurst(btn);
                if (typeof window.playIfpiflixSfx === 'function') {
                    window.playIfpiflixSfx('click');
                    window.playIfpiflixSfx('coins');
                }
                if (typeof window.showToastNotification === 'function') {
                    window.showToastNotification(`Você apoiou ${currentActiveCardStudent.name}! ❤️`);
                }
            } else {
                data.count = Math.max(0, data.count - 1);
                if (btn) btn.classList.remove('liked');
                if (typeof window.playIfpiflixSfx === 'function') {
                    window.playIfpiflixSfx('click');
                }
            }
            
            if (countEl) countEl.textContent = data.count;
            store[studentKey] = data;
            try {
                localStorage.setItem('ifpiflix_student_likes_store', JSON.stringify(store));
            } catch (err) {}
        };





        /* =========================================================
           3. PAINEL MODO DEUS (DEBUG CONSOLE) & ATALHO F2
           ========================================================= */
        let isGodModeOpen = false;
        let godMetricsTimer = null;
        let fpsFrameCount = 0;
        let fpsLastTime = performance.now();
        let currentFps = 60;

        // Medição em tempo real de FPS
        function godFpsLoop() {
            fpsFrameCount++;
            const now = performance.now();
            if (now - fpsLastTime >= 1000) {
                currentFps = Math.round((fpsFrameCount * 1000) / (now - fpsLastTime));
                fpsFrameCount = 0;
                fpsLastTime = now;
                const fpsEl = document.getElementById('god-metric-fps');
                if (fpsEl) fpsEl.textContent = currentFps + ' FPS';
            }
            if (isGodModeOpen) {
                requestAnimationFrame(godFpsLoop);
            }
        }

        function updateGodLiveMetrics() {
            if (!isGodModeOpen) return;
            const screenEl = document.getElementById('god-metric-screen');
            const slideEl = document.getElementById('god-metric-slide');
            const profileEl = document.getElementById('god-metric-profile');
            const achEl = document.getElementById('god-metric-achievements');

            const activeScreen = window.IFPIFLIX_STATE ? window.IFPIFLIX_STATE.activeScreen : 'home-screen';
            const curSlide = window.IFPIFLIX_STATE ? window.IFPIFLIX_STATE.currentSlide : -1;
            const profile = window.IFPIFLIX_STATE ? window.IFPIFLIX_STATE.activeProfile : 'Admin';
            const achCount = window.IFPIFLIX_STATE ? (window.IFPIFLIX_STATE.unlockedAchievements || []).length : 0;

            if (screenEl) screenEl.textContent = activeScreen;
            if (slideEl) slideEl.textContent = curSlide >= 0 ? ('Slide ' + curSlide) : 'Nenhum';
            if (profileEl) profileEl.textContent = profile;
            if (achEl) achEl.textContent = achCount + ' / 8';
        }

        window.toggleGodModePanel = function() {
            isGodModeOpen = !isGodModeOpen;
            const overlay = document.getElementById('god-mode-overlay');
            if (!overlay) return;

            if (isGodModeOpen) {
                overlay.classList.add('show');
                if (window.SoundEngine) window.SoundEngine.play('openModal');

                // Popula select de slides
                const select = document.getElementById('god-slide-select');
                if (select && typeof script !== 'undefined' && select.children.length === 0) {
                    select.innerHTML = script.map((s, idx) => 
                        `<option value="${idx}">[${s.id}] ${s.title} (${s.presenter})</option>`
                    ).join('');
                }

                // Inicia loop de FPS e atualização de métricas
                fpsLastTime = performance.now();
                fpsFrameCount = 0;
                requestAnimationFrame(godFpsLoop);
                updateGodLiveMetrics();
                clearInterval(godMetricsTimer);
                godMetricsTimer = setInterval(updateGodLiveMetrics, 500);
            } else {
                overlay.classList.remove('show');
                if (window.SoundEngine) window.SoundEngine.play('closeModal');
                clearInterval(godMetricsTimer);
            }
        };

        window.handleGodModeOverlayClick = function(e) {
            if (e && e.target && e.target.id === 'god-mode-overlay') {
                window.toggleGodModePanel();
            }
        };

        // Tecla F2 para alternar o Painel Modo Deus
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                window.toggleGodModePanel();
            } else if (e.key === 'Escape' && isGodModeOpen) {
                e.preventDefault();
                window.toggleGodModePanel();
            }
        });

        // Ações do Painel Modo Deus
        window.godSwitchScreen = function(screenId) {
            if (typeof window.switchScreen === 'function') {
                window.switchScreen(screenId);
                if (window.SoundEngine) window.SoundEngine.play('success');
                window.toggleGodModePanel();
            }
        };

        window.godStartSlide = function(slideIdx) {
            if (typeof window.startPresentationAt === 'function' && typeof script !== 'undefined') {
                const targetId = script[slideIdx] ? script[slideIdx].id : 0;
                window.startPresentationAt(targetId);
                window.toggleGodModePanel();
            }
        };

        window.godStartCinema = function(cineIdx) {
            if (typeof window.startCinematicMovieAt === 'function' && typeof script !== 'undefined') {
                const targetId = script[cineIdx] ? script[cineIdx].id : 0;
                window.startCinematicMovieAt(targetId);
                window.toggleGodModePanel();
            }
        };

        window.godJumpToSelectedSlide = function(is3D = false) {
            const select = document.getElementById('god-slide-select');
            const idx = select ? parseInt(select.value, 10) : 0;
            if (is3D) {
                window.godStartCinema(idx);
            } else {
                window.godStartSlide(idx);
            }
        };

        window.godOpenCyberPresentation = function() {
            if (typeof window.openSecurityPresentation === 'function') {
                window.openSecurityPresentation(0);
                window.toggleGodModePanel();
            }
        };

        window.godOpenWrapped = function() {
            if (typeof window.openIfpiflixWrapped === 'function') {
                window.openIfpiflixWrapped();
                window.toggleGodModePanel();
            }
        };

        window.godOpenSubscriptionVIP = function() {
            if (typeof window.openSubscriptionCheckout === 'function') {
                window.openSubscriptionCheckout();
                const couponInput = document.getElementById('checkout-coupon-input');
                if (couponInput) couponInput.value = 'NOTA10';
                if (typeof window.applyCheckoutCoupon === 'function') {
                    window.applyCheckoutCoupon();
                }
                window.toggleGodModePanel();
            }
        };

        window.godTriggerTudum = function() {
            window.toggleGodModePanel();
            if (typeof window.switchScreen === 'function') {
                window.switchScreen('splash-screen');
                if (window.SoundEngine) window.SoundEngine.play('tudum');
                setTimeout(() => {
                    window.switchScreen('home-screen');
                }, 2800);
            }
        };

        window.godUnlockAllAchievements = function() {
            if (typeof ACHIEVEMENTS_DB !== 'undefined' && typeof window.unlockAchievement === 'function') {
                const keys = Object.keys(ACHIEVEMENTS_DB);
                keys.forEach((key, i) => {
                    setTimeout(() => {
                        window.unlockAchievement(key);
                    }, i * 400);
                });
                if (typeof window.showToastNotification === 'function') {
                    window.showToastNotification('Todas as 8 Conquistas foram Desbloqueadas!');
                }
            }
        };

        window.godResetAchievements = function() {
            unlockedAchievements = [];
            try {
                localStorage.removeItem('ifpiflix_achievements');
            } catch (e) {}
            if (window.SoundEngine) window.SoundEngine.play('error');
            if (typeof window.showToastNotification === 'function') {
                window.showToastNotification('Conquistas Resetadas com sucesso!');
            }
            updateGodLiveMetrics();
        };

        window.godOpenRandomCard = function() {
            if (typeof STUDENTS_REGISTRY !== 'undefined' && STUDENTS_REGISTRY.length > 0) {
                const rand = STUDENTS_REGISTRY[Math.floor(Math.random() * STUDENTS_REGISTRY.length)];
                window.toggleGodModePanel();
                if (typeof window.openStudentCardModal === 'function') {
                    window.openStudentCardModal(rand.id || rand.name);
                }
            }
        };

        window.godStartRandomDuel = function() {
            if (typeof STUDENTS_REGISTRY !== 'undefined' && STUDENTS_REGISTRY.length >= 2) {
                const randIndex1 = Math.floor(Math.random() * STUDENTS_REGISTRY.length);
                let randIndex2 = Math.floor(Math.random() * STUDENTS_REGISTRY.length);
                if (randIndex2 === randIndex1) randIndex2 = (randIndex1 + 1) % STUDENTS_REGISTRY.length;

                const s1 = STUDENTS_REGISTRY[randIndex1];
                const s2 = STUDENTS_REGISTRY[randIndex2];

                window.toggleGodModePanel();
                if (typeof window.openStudentCardModal === 'function') {
                    window.openStudentCardModal(s1.id || s1.name);
                    setTimeout(() => {
                        if (typeof window.openStudentDuelSelect === 'function') {
                            window.openStudentDuelSelect();
                            const select = document.getElementById('duel-opponent-select');
                            if (select) select.value = (s2.id || s2.name);
                            setTimeout(() => {
                                if (typeof window.startStudentDuelFight === 'function') {
                                    window.startStudentDuelFight();
                                }
                            }, 300);
                        }
                    }, 400);
                }
            }
        };

        window.godTriggerNewtonGravity = function() {
            window.toggleGodModePanel();
            if (typeof window.startNewtonPhysicsSimulation === 'function') {
                window.startNewtonPhysicsSimulation();
            }
        };

        window.godToggleSfx = function() {
            if (typeof window.toggleIfpiflixSfx === 'function') {
                window.toggleIfpiflixSfx();
            }
        };

        window.godPlayTestSound = function(type) {
            if (window.SoundEngine) {
                window.SoundEngine.play(type);
            }
        };

        /* =========================================================
           4. POLIMENTO VISUAL (JUICE) & CONEXÃO GLOBAL DE ÁUDIO
           ========================================================= */
        // Conexão sutil de feedback sonoro e tátil nos cliques
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button, .quiz-btn, .academic-card, .nav-cat-item, .student-avatar-card');
            if (!btn) return;

            // Se não for um botão de áudio/mudo ou botão com som exclusivo já tratado
            if (btn.id === 'nav-sfx-btn' || btn.id === 'nav-acervo-sfx-btn' || btn.id === 'm-btn-burst-like' || btn.id === 'card-student-like-btn') {
                return;
            }

            if (window.SoundEngine) {
                window.SoundEngine.play('click');
            }
        }, true);

        // Feedback sonoro suave em toasts e notificações
        if (typeof window.showToastNotification === 'function') {
            const originalShowToast = window.showToastNotification;
            window.showToastNotification = function(msg, icon) {
                if (window.SoundEngine) window.SoundEngine.play('alert');
                return originalShowToast(msg, icon);
            };
        }

        // Feedback sonoro ao favoritar na Minha Lista
        if (typeof window.toggleMinhaLista === 'function') {
            const originalToggleLista = window.toggleMinhaLista;
            window.toggleMinhaLista = function() {
                const listBtn = document.getElementById('m-btn-list');
                if (listBtn) {
                    listBtn.classList.remove('pop');
                    void listBtn.offsetWidth;
                    listBtn.classList.add('pop');
                }
                if (window.SoundEngine) window.SoundEngine.play('success');
                return originalToggleLista();
            };
        }

        /* =========================================================
           GERENCIADOR CENTRAL DE PILHA DE MODAIS (ESCAPE INTELIGENTE)
           ========================================================= */
        window.handleGlobalModalEscape = function(e) {
            if (e.key !== 'Escape') return;

            // Se o navegador estiver em tela cheia nativa, deixa o browser sair do fullscreen
            if (document.fullscreenElement) return;

            // Se o toast de turno estiver visível, fecha imediatamente
            const turnToast = document.getElementById('turn-toast');
            if (turnToast && turnToast.classList.contains('show')) {
                if (typeof window.hideTurnToast === 'function') window.hideTurnToast();
            }

            // 1. Se o usuário estiver digitando na busca da Home ou Acervo, desfoque e feche
            const searchInput = document.getElementById('search-input');
            const searchBox = document.getElementById('search-box');
            if (document.activeElement === searchInput) {
                if (searchInput && searchInput.value.trim() !== '') {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (searchInput) searchInput.blur();
                if (searchBox) searchBox.classList.remove('active');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 2. Painel Modo Deus (F2)
            const godOverlay = document.getElementById('god-mode-overlay');
            if (godOverlay && godOverlay.classList.contains('show')) {
                window.toggleGodModePanel();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 3. Checkout Paródia VIP
            const checkoutModal = document.getElementById('subscription-checkout-modal');
            if (checkoutModal && checkoutModal.classList.contains('show')) {
                window.closeSubscriptionCheckout();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 4. Modal de Carta 3D e Duelo RPG do Aluno
            const studentCardModal = document.getElementById('student-card-modal-overlay');
            if (studentCardModal && studentCardModal.classList.contains('show')) {
                window.closeStudentCardModal();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 5. Modais de Perfil & Cadastro de Trabalhos
            const submitModal = document.getElementById('submit-work-modal');
            if (submitModal && submitModal.classList.contains('show')) {
                window.closeSubmitWorkModal(null, true);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            const addProfModal = document.getElementById('add-profile-modal');
            if (addProfModal && addProfModal.classList.contains('show')) {
                window.closeAddProfileModal(null, true);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 6. Retrospectiva Wrapped
            const wrappedModal = document.getElementById('wrapped-modal');
            if (wrappedModal && wrappedModal.classList.contains('show')) {
                window.closeIfpiflixWrapped(null, true);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 7. Grid de Miniaturas de Slides
            const thumbsOverlay = document.getElementById('slide-thumbnails-overlay');
            if (thumbsOverlay && thumbsOverlay.classList.contains('show')) {
                window.closeSlideThumbnailsModal(null, true);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 8. Player de Vídeo Customizado / Trailer
            const videoPlayer = document.getElementById('custom-video-player');
            if (videoPlayer && (videoPlayer.classList.contains('show') || (typeof ytMainPlayerActive !== 'undefined' && ytMainPlayerActive))) {
                window.closeVideoPlayer();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 9. Visualizador de PDF
            const pdfViewer = document.getElementById('custom-pdf-viewer');
            if (pdfViewer && pdfViewer.classList.contains('show')) {
                window.closePdfViewer();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 10. Modal de Resumo / Guia de Estudos
            const resumoModal = document.getElementById('resumo-modal');
            if (resumoModal && resumoModal.classList.contains('show')) {
                window.closeResumoModal();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 11. Modal Principal de Detalhes do Filme
            const titleModal = document.getElementById('title-modal-overlay');
            if (titleModal && titleModal.classList.contains('show')) {
                window.closeTitleModal(null, true);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }

            // 12. Apresentação Interativa de Cyber SOC
            const secScreen = document.getElementById('security-player-screen');
            if (secScreen && secScreen.classList.contains('active')) {
                window.closeSecurityPresentation();
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return;
            }
        };

        // Ouvinte global em fase de captura para garantir ordem estrita LIFO (Last In, First Out)
        document.addEventListener('keydown', window.handleGlobalModalEscape, true);

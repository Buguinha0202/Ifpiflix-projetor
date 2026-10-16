/* =========================================================
   IFPIFLIX - Script principal
   ========================================================= */

/* Endereço onde ficam as imagens e vídeos do projeto (GitHub Pages) */
const ASSET_BASE = 'https://buguinha0202.github.io/Ifpiflix-projetor/';

/* Imagens passam pelo wsrv.nl, que redimensiona e converte para webp (carrega bem mais rápido) */
function imgUrl(file, width) {
    return 'https://wsrv.nl/?url=' + ASSET_BASE + file + '&w=' + width + '&output=webp';
}
function mediaUrl(file) {
    return ASSET_BASE + file;
}

/* Dispositivos de toque (celular/tablet) não têm "hover" */
const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* =========================================================
   ROTEIRO: ordem dos slides e apresentadores
   ========================================================= */
const script = [
    { id: 0,     title: "1. A Escolástica",                          presenter: "Davi",         tickers: ["Dogmas religiosos e textos clássicos possuíam um peso inquestionável."] },
    { id: "0_1", title: "2. A Transição",                            presenter: "Davi",         tickers: ["A física aristotélica era insuficiente para as novas necessidades."] },
    { id: "0_2", title: "3. A Ruptura",                              presenter: "Davi",         tickers: ["A crise escolástica abriu caminho para o questionamento direto."] },
    { id: 1,     title: "4. O Terreno Fértil",                       presenter: "Davi",         tickers: ["Dúvida, observação e busca por métodos autônomos."] },

    { id: "2",   title: "Cap 2: Antes da Rev. Científica",           presenter: "Maria Helena", tickers: ["A tradição ditava as regras."] },
    { id: "2_1", title: "Cap 2: Geocentrismo",                       presenter: "Maria Helena", tickers: ["A Terra no centro de tudo."] },
    { id: "3",   title: "Cap 2: Princípio de Autoridade",            presenter: "Maria Helena", tickers: ["Aristóteles falou, tá falado."] },
    { id: "3_1", title: "Cap 2: A Mudança",                          presenter: "Maria Helena", tickers: ["Observar e testar virou a nova moda."] },

    { id: 4,     title: "Cap 3: A Ruptura",                          presenter: "Francisco L",  tickers: ["O homem moderno: 'E se a gente testasse essa parada?'", "A contemplação passiva saiu do chat.", "Investigação ativa entrou no chat."] },

    { id: 5,     title: "Cap 4: Revolução Cosmológica (Copérnico)",  presenter: "Pedro",        tickers: ["Copérnico: 'Galera, o Sol tá no meio, não a gente'.", "Tirar a Terra do centro ofendeu muito o ego humano."] },
    { id: "6_1", title: "Cap 4: Revolução Cosmológica (Kepler)",     presenter: "Pedro",        tickers: ["Kepler: “Círculo perfeito? Não exatamente.”"] },
    { id: 6,     title: "Cap 4: Revolução Cosmológica (Galileu)",    presenter: "Pedro",        tickers: ["Galileu: 'Mano, olha no telescópio'. Inquisição: 'Não quero'.", "Eppur si muove: o primeiro 'falei, tô leve' da história."] },

    { id: 8,     title: "Cap 5: Empirismo (Os Ídolos)",              presenter: "Marcelo",      tickers: ["Ídolo da Caverna = viver na própria bolha.", "Bacon: Antes de fazer ciência, limpe sua mente dos fakes."] },
    { id: 9,     title: "Cap 5: Empirismo (Método Indutivo)",        presenter: "Marcelo",      tickers: ["Bacon morreu de pneumonia tentando congelar uma galinha.", "Se não testou na prática, meu anjo, é só fanfic."] },
    { id: 10,    title: "Cap 6: Racionalismo (Dúvida Metódica)",     presenter: "Samuel",       tickers: ["Descartes ficou dias trancado num quarto.", "E se tudo for uma simulação?"] },
    { id: 11,    title: "Cap 6: Racionalismo (Penso, logo existo)",  presenter: "Samuel",       tickers: ["Duvidou tanto de tudo que quase sumiu da existência.", "A única certeza: eu existo porque penso."] },
    { id: 12,    title: "Cap 7: Síntese Newtoniana",                 presenter: "JP Santos",    tickers: ["Uma maçã caiu, e o cara inventou o cálculo.", "Newton uniu o Racionalismo e o Empirismo na amizade."] },
    { id: 13,    title: "Fim: Assine Já",                            presenter: "Todos",        tickers: [] }
];

let activeProfile = "Davi";
let currentSlide = -1;
let currentCineIdx = -1;
let tickerIntervalC, tickerIntervalM;
let toastTimeout;

        /* =========================================================
           BANCO DE DADOS COMPLETO DA MODAL
           ========================================================= */
        const filmesDB = {
           // ================= TEMAS DE FILOSOFIA =================
            "tema-1": {
                title: "INVOCAÇÃO DO DOGMA", subtitle: "O Julgamento da Escolástica",
                bg: "invocacao_do_dogma.png", 
                banner: "binvocacao_do_dogm.jpg", // <--- ADICIONE ESTA LINHA
                pdf: "https://buguinha0202.github.io/Ifpiflix-projetor/trabalho_grupo1.pdf",
                match: "92% Relevante", year: "2013", age: "14", duration: "1h 52m",
                synopsis: "Investigadores do pensamento tentam exorcizar dogmas medievais de uma universidade assombrada por monges aristotélicos. Baseado em fatos reais da Escolástica.",
                cast: "Vera Formata, Patrick Windows", genres: "Terror Acadêmico, História", tags: "Idade Média, Fé vs Razão", isMain: false
            },
            "guerra-civil": {
                title: "GUERRA CIVIL", subtitle: "EMPIRISMO VS RACIONALISMO",
                bg: "guerra_civil.png", 
                banner: "banner.png", // <--- ADICIONE ESTA LINHA
                match: "99% Relevante", year: "2016", age: "12", duration: "2h 27m",
                synopsis: "A Revolução Científica Moderna, a queda dos dogmas e a forja do Método Científico por Newton. Acompanhe a maior batalha intelectual da história entre defensores da experiência prática e adeptos da lógica pura.",
                cast: "Davi, Maria Helena, Francisco L, Pedro, Marcelo, Samuel, JP Santos", genres: "Ação, Documentário, Filosofia", tags: "Heliocentrismo, Bacon, Descartes", isMain: true
            },
            "tema-3": {
                title: "DEVORADORES DO ESPAÇO TEMPO", subtitle: "",
                bg: "devoradores_espaco_tempo.png", 
                banner: "bdevoradores_espaco_tempo.png", // <--- ADICIONE ESTA LINHA
                match: "88% Relevante", year: "2016", age: "10", duration: "1h 55m",
                synopsis: "Um físico brilhante sofre um acidente e descobre que o tempo e o espaço são relativos, precisando proteger o tecido da realidade contra dogmáticos quânticos.",
                cast: "Benedict Calculatch, Rachel McAtoms", genres: "Ficção Científica, Fantasia", tags: "Física Moderna, Relatividade", isMain: false
            },
            "tema-4": {
                title: "OBSESSÃO", subtitle: "O CRITÉRIO DA FALSIFICABILIDADE",
                bg: "obsessao.jpg", 
                banner: "bobsessao.jpg", 
                match: "85% Relevante", year: "2016", age: "14", duration: "1h 57m",
                synopsis: "Um cientista com múltiplas hipóteses precisa encontrar uma forma de refutar todas elas (Popper) antes que sua personalidade pseudocientífica assuma o controle.",
                cast: "James McArquivo, Anya Taylor-Join", genres: "Suspense Psicológico", tags: "Ciência vs Pseudociência", isMain: false
            }, // <--- ATENÇÃO A ESTA VÍRGULA AQUI!

            "tema-5": {
                title: "NÃO OLHE PARA A ÉTICA", subtitle: "",
                bg: "nao_olhe_etica.jpg", 
                banner: "bnao_olhe_etica.jpg", 
                match: "95% Relevante", year: "2021", age: "16", duration: "2h 18m",
                synopsis: "Dois desenvolvedores de software descobrem que uma IA sem filtros morais está prestes a destruir a sociedade, mas ninguém na internet parece se importar.",
                cast: "Leonardo DiCaptcha, Jennifer Latência", genres: "Comédia de Erros, Sátira", tags: "Tecnologia, Bioética", isMain: false
            },

            // ================= SÉRIES E CURTAS DE T.I. =================
            "stranger-pings": {
                title: "STRANGER PINGS", subtitle: "",
                bg: "stranger_pings.jpg", 
                match: "98% Relevante", year: "2016", age: "12", duration: "4 Temporadas",
                synopsis: "Quando a conexão de uma pequena cidade desaparece, um grupo de jovens nerds descobre um universo paralelo sombrio onde a latência é infinita e o ping é de 999ms.",
                cast: "Millie Byte Brown, Finn Hardware", genres: "Suspense, Nostalgia Anos 80", tags: "Redes, Mundo Invertido", isMain: false
            },
            "treinar-ia": {
                title: "COMO TREINAR A SUA I.A.", subtitle: "",
                bg: "como_treinar_ia.jpg", 
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
                match: "97% Relevante", year: "2023", age: "16", duration: "3h 00m",
                synopsis: "A história épica e dramática do programador que liderou o projeto de criação do sistema livre mais poderoso do mundo, mudando o rumo da tecnologia para sempre.",
                cast: "Cillian Motherboard, Robert Download Jr.", genres: "Drama Biográfico, Épico", tags: "Linux, Código Aberto", isMain: false
            },
            "kpop": {
                title: "GUERREIRAS DO POP 3", subtitle: "",
                bg: "guerreiras_kpop.jpg", 
                match: "82% Relevante", year: "2017", age: "10", duration: "1h 33m",
                synopsis: "O famoso grupo de idols precisa usar suas habilidades de canto, coreografia sincronizada e injeção de SQL para desativar um vírus mundial durante a turnê de despedida.",
                cast: "Anna Kernel, Rebel Wireless", genres: "Musical, Comédia de Ação", tags: "K-pop, Hacking", isMain: false
            },
            "procurando-ip": {
                title: "PROCURANDO IP", subtitle: "",
                bg: "procurando_ip.jpg", 
                match: "96% Relevante", year: "2003", age: "Livre", duration: "1h 40m",
                synopsis: "Um pacotinho de dados se perde na imensidão da Deep Web, e seu pai precisa atravessar roteadores perigosos e firewalls gigantes para trazê-lo de volta para casa.",
                cast: "Albert Boots, Ellen DeGe-Network", genres: "Animação, Família", tags: "Redes, Roteamento", isMain: false
            },
            "nicolas": {
                title: "NICOLAS O GRANDE", subtitle: "",
                bg: "nicolas_o_grande.jpg", 
                match: "80% Relevante", year: "2004", age: "16", duration: "2h 55m",
                synopsis: "A jornada épica de um jovem imperador dos códigos que conquistou todos os repositórios do mundo conhecido e unificou linguagens de programação antes dos 30 anos.",
                cast: "Colin Firewall, Angelina Java", genres: "Ação Histórica, Guerra", tags: "Biografia, Império", isMain: false
            },
            "lalalan": {
                title: "LA LA LAN", subtitle: "",
                bg: "la_la_lan.jpg", 
                match: "91% Relevante", year: "2016", age: "12", duration: "2h 08m",
                synopsis: "Um técnico de infraestrutura e uma web designer tentam equilibrar o amor e a estabilidade da conexão local enquanto buscam seus sonhos no Vale do Silício.",
                cast: "Ryan Hostling, Emma Storage", genres: "Musical, Romance", tags: "Rede Local, Sonhos", isMain: false
            },

            // ================= TRABALHOS ANTIGOS =================
            "mitm": {
                title: "O HOMEM NO MEIO", subtitle: "",
                bg: "homem_no_meio.jpg", match: "87% Relevante", year: "2013", age: "12", duration: "2h 23m",
                banner: "homem_no_meio.jpg",
                synopsis: "Um ataque cibernético silencioso ameaça interceptar todas as mensagens da cidade. Quem é o vilão invisível que ouve tudo o que você digita?",
                cast: "Henry Cabo, Amy Adm", genres: "Ação, Super-herói", tags: "Man in the Middle, Criptografia", isMain: false
            },
            "firewall": {
                title: "A MURALHA DE FOGO", subtitle: "",
                bg: "muralha_de_fogo.jpg", match: "84% Relevante", year: "2006", age: "14", duration: "1h 45m",
                banner: "muralha_de_fogo.jpg",
                synopsis: "Um especialista em segurança digital é forçado a hackear o próprio sistema bancário impenetrável que ele projetou para salvar sua família de sequestradores.",
                cast: "Harrison For-loop, Paul Bot", genres: "Ação, Suspense", tags: "Segurança de Redes", isMain: false
            },
            "metaverso": {
                title: "FUGA DO METAVERSO", subtitle: "",
                bg: "fuga_metaverso.jpg", match: "93% Relevante", year: "1999", age: "14", duration: "2h 16m",
                banner: "fuga_metaverso.jpg",
                synopsis: "Preso em uma realidade virtual opressora controlada por grandes corporações, um usuário comum precisa encontrar a saída de emergência antes que sua mente seja formatada.",
                cast: "Keanu Ram, Carrie-Anne Mouse", genres: "Ficção Científica, Ação", tags: "Realidade Virtual, Matrix", isMain: false
            },
            "iot": {
                title: "REBELIÃO DAS TORRADEIRAS", subtitle: "",
                bg: "rebeliao_torradeiras.jpg", match: "89% Relevante", year: "2003", age: "14", duration: "1h 49m",
                banner: "rebeliao_torradeiras.jpg",
                synopsis: "O dia do juízo final começou pela cozinha. Eletrodomésticos inteligentes ganham consciência, conectam-se à rede e decidem que os humanos não sabem fazer o próprio café.",
                cast: "Arnold Search-negger, Nick Stall", genres: "Ação, Ficção Pós-Apocalíptica", tags: "IoT, Inteligência Artificial", isMain: false
            },
            "honeypot": {
                title: "O POTE DE MEL", subtitle: "",
                bg: "pote_de_mel.jpg", match: "78% Relevante", year: "2011", age: "Livre", duration: "1h 03m",
                banner: "pote_de_mel.jpg",
                synopsis: "Uma armadilha cibernética irresistível disfarçada de servidor vulnerável atrai os piores hackers da internet para um labirinto fofinho sem saída.",
                cast: "Jim Commits, John Filter", genres: "Animação, Suspense Fofo", tags: "Segurança, Honeypot", isMain: false
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

function updateListButtonIcon(btn, movieId) {
    const icon = btn && btn.querySelector('i');
    if (!icon) return;
    const naLista = minhaLista.includes(movieId);
    icon.className = naLista ? 'fa-solid fa-check' : 'fa-solid fa-plus';
    btn.setAttribute('aria-label', naLista ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista');
}

window.openTitleModal = function(movieId) {
    currentModalMovieId = movieId;
    updateListButtonIcon(document.getElementById('m-btn-list'), movieId);

    const overlay = document.getElementById('title-modal-overlay');
    const container = document.getElementById('title-modal-content');
    const isOpen = overlay.classList.contains('show');

    // Carrega os dados do título no modal
    const loadData = () => {
        const data = filmesDB[movieId] || filmesDB["guerra-civil"];
        const imgBackground = data.banner ? data.banner : data.bg;

        clearTimeout(trailerTimeout);
        const videoEl = document.getElementById('m-trailer-video');
        if (videoEl) {
            videoEl.pause();
            videoEl.removeAttribute('src');
            videoEl.classList.remove('playing');
        }

        document.getElementById('m-title').innerHTML = data.title + (data.subtitle ? `<br><span class="modal-subtitle">${data.subtitle}</span>` : '');
        document.getElementById('m-hero').style.backgroundImage = `url('${imgUrl(imgBackground, 800)}'), linear-gradient(135deg, #222, #000)`;

        document.getElementById('m-match').textContent = data.match;
        document.getElementById('m-year').textContent = data.year;
        document.getElementById('m-age').textContent = data.age;
        document.getElementById('m-duration').textContent = data.duration;
        document.getElementById('m-synopsis').textContent = data.synopsis;
        document.getElementById('m-cast').textContent = data.cast;
        document.getElementById('m-genres').textContent = data.genres;
        document.getElementById('m-tags').textContent = data.tags;

        // Botão principal: depende do tipo de título
        const playBtn = document.getElementById('m-btn-play');

        if (data.isMain) {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Assistir Filme 3D';
            playBtn.onclick = function() {
                window.closeTitleModal(null, true);
                window.startCinematicMovie();
            };
        } else if (data.pdf) {
            playBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Abrir Apresentação';
            playBtn.onclick = function() {
                window.open(data.pdf, '_blank', 'noopener'); // abre o PDF em uma nova aba
            };
        } else if (data.trailer) {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Assistir Trailer';
            playBtn.onclick = function() {
                clearTimeout(trailerTimeout);
                if (videoEl) {
                    videoEl.pause();
                    videoEl.classList.remove('playing');
                }
                window.openVideoPlayer(mediaUrl(data.trailer));
            };

            // Prévia do trailer começa sozinha no banner (sem som, igual à Netflix)
            trailerTimeout = setTimeout(() => {
                if (videoEl) {
                    videoEl.src = mediaUrl(data.trailer);
                    videoEl.muted = true;
                    videoEl.play().then(() => {
                        videoEl.classList.add('playing');
                    }).catch(() => { /* sem prévia: o banner continua como imagem */ });
                }
            }, TRAILER_PREVIEW_DELAY);
        } else {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Em Breve';
            playBtn.onclick = null;
        }

        // Episódios (filme principal) ou recomendações (outros títulos)
        const recContainer = document.getElementById('m-recommendations');
        const bottomTitle = document.getElementById('m-bottom-title');

        if (movieId === 'guerra-civil') {
            bottomTitle.textContent = 'Episódios';
            recContainer.className = 'episodes-list';
            recContainer.innerHTML = renderEpisodios();
        } else {
            bottomTitle.textContent = 'Recomendações da Turma';
            recContainer.className = 'more-grid';

            const outros = Object.keys(filmesDB).filter(id => id !== movieId);
            const sorteados = outros.sort(() => 0.5 - Math.random()).slice(0, 3);
            recContainer.innerHTML = sorteados.map(recId => {
                const recData = filmesDB[recId];
                const titulo = recData.title.length > 18 ? recData.title.substring(0, 18) + '...' : recData.title;
                return renderMovieCard(recId, Object.assign({}, recData, { title: titulo }), 300);
            }).join('');
        }
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

        // Interrompe qualquer vídeo ou timeout ativo ao fechar
        clearTimeout(trailerTimeout);
        const videoEl = document.getElementById('m-trailer-video');
        videoEl.pause();
        videoEl.classList.remove('playing');

        if (document.fullscreenElement) { document.exitFullscreen(); }
    }
};

window.closeVideoPlayer = function() {
    const overlay = document.getElementById('custom-video-player');
    const video = document.getElementById('main-video-element');
    video.pause();
    video.removeAttribute('src'); // Limpa o vídeo
    overlay.classList.remove('show');
};

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

        window.switchScreen = function(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const target = document.getElementById(id);
            if (target) target.classList.add('active');

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
                clearInterval(tickerIntervalC);
                clearInterval(tickerIntervalM);
                clearTimeout(toastTimeout);
            }

            if (id === 'home-screen') {
                renderContinueWatching();
            }
        }
        
        window.selectProfile = function(name) {
            activeProfile = name; 
            document.getElementById('nav-profile-name').textContent = name; 
            window.switchScreen('home-screen');
            renderContinueWatching();
        }

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
            activeProfile = "Davi";
            document.getElementById('nav-profile-name').textContent = "Davi";
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
        window.switchScreen = function(id) {
            originalSwitchScreen(id);

            if (id === 'cinematic-stage') {
                setTimeout(() => generateSpaceParticles(), 500);
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
           ABRIR PLAYER DE VÍDEO / TRAILERS (CORRIGIDO)
           ========================================================= */
        window.openVideoPlayer = function(videoSrc) {
            window.closeTitleModal(null, true);
            simulateLoading(() => {
                playTudumAndThen(() => {
                    // Manda a tela do Tudum embora antes do vídeo começar
                    window.switchScreen('home-screen'); 
                    
                    const overlay = document.getElementById('custom-video-player');
                    const video = document.getElementById('main-video-element');
                    video.src = videoSrc;
                    overlay.classList.add('show');
                    playWithFallback(video);
                });
            });
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
            const sliders = document.querySelectorAll('.posters-container, .landscape-row');
            
            sliders.forEach(slider => {
                let isDown = false;
                let startX;
                let scrollLeft;
                let hasMoved = false;

                // --- EVENTOS DE MOUSE (PC) ---
                slider.addEventListener('mousedown', (e) => {
                    isDown = true; hasMoved = false; slider.classList.add('active-drag');
                    startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft;
                });
                slider.addEventListener('mouseleave', () => { isDown = false; slider.classList.remove('active-drag'); });
                slider.addEventListener('mouseup', () => { isDown = false; slider.classList.remove('active-drag'); });
                slider.addEventListener('mousemove', (e) => {
                    if (!isDown) return;
                    e.preventDefault(); 
                    const x = e.pageX - slider.offsetLeft;
                    const walk = (x - startX);
                    
                    // Só considera que arrastou se moveu mais de 5 pixels (evita bloquear cliques acidentais)
                    if (Math.abs(walk) > 5) {
                        hasMoved = true;
                    }
                    slider.scrollLeft = scrollLeft - (walk * 1.8);
                });

                // --- EVENTOS DE TOQUE (CELULAR) ---
                slider.addEventListener('touchstart', (e) => {
                    isDown = true; hasMoved = false;
                    startX = e.touches[0].pageX - slider.offsetLeft;
                    scrollLeft = slider.scrollLeft;
                }, {passive: true});
                slider.addEventListener('touchend', () => { isDown = false; });
                slider.addEventListener('touchmove', (e) => {
                    if (!isDown) return;
                    const x = e.touches[0].pageX - slider.offsetLeft;
                    const walk = (x - startX);
                    
                    if (Math.abs(walk) > 5) {
                        hasMoved = true;
                    }
                    slider.scrollLeft = scrollLeft - (walk * 1.8);
                }, {passive: true});

                // Evita disparar cliques nos cards se o usuário estava arrastando
                slider.querySelectorAll('.card-portrait, .card-landscape').forEach(card => {
                    card.addEventListener('click', (e) => {
                        if (hasMoved) { e.stopImmediatePropagation(); hasMoved = false; }
                    }, true);
                });

                // --- ROLAGEM COM A RODA DO MOUSE (WHEEL) ---
                slider.addEventListener('wheel', (e) => {
                    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                        e.preventDefault();
                        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
                        slider.scrollLeft += delta;
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
            document.getElementById('btn-next-quiz').style.display = 'none';

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
            } else {
                btnElement.classList.add('wrong');
                // Destaca a correta
                const correctIndex = q.options.findIndex(o => o.correct);
                allBtns[correctIndex].classList.add('correct');
            }

            document.getElementById('btn-next-quiz').style.display = 'block';
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
            btn.innerHTML = '<i class="fa-solid fa-list"></i> Voltar aos Episódios';
            btn.style.display = 'block';
            btn.onclick = () => window.exitQuiz();
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

        /* =========================================================
           SISTEMA: MINHA LISTA (Persistência no localStorage)
           ========================================================= */
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

            const cards = document.querySelectorAll('.card-portrait, .card-landscape, .more-card');
            const hoverCard = document.getElementById('hover-preview-card');
            if (!hoverCard) return;

            cards.forEach(card => {
                card.addEventListener('mouseenter', (e) => {
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
            
            // Se o usuário rolar a tela, esconde a mini tela imediatamente
            const home = document.getElementById('home-screen');
            if (home) home.addEventListener('scroll', window.closeHoverPreview);
        }

        function openHoverPreview(cardElement, movieId, data) {
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

            // 2. Configura o Vídeo
            const videoEl = document.getElementById('hpc-video');
            videoEl.classList.remove('playing');
            if (data.trailer) {
                videoEl.src = mediaUrl(data.trailer);
                videoEl.muted = true;
                videoEl.play().then(() => {
                    videoEl.classList.add('playing');
                }).catch(() => { /* Sem autoplay se bloqueado */ });
            } else {
                videoEl.removeAttribute('src');
            }

            // 3. Configura os Botões
            document.getElementById('hpc-btn-expand').onclick = () => {
                window.closeHoverPreview();
                window.openTitleModal(movieId);
            };
            document.getElementById('hpc-btn-play').onclick = () => {
                window.closeHoverPreview();
                if(data.isMain) window.startCinematicMovie();
                else if(data.trailer) window.openVideoPlayer(mediaUrl(data.trailer));
                else if(data.pdf) window.open(data.pdf, '_blank', 'noopener');
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
            if(!hoverCard.classList.contains('active')) return;
            
            hoverCard.classList.remove('active');
            isHoverCardActive = false;
            
            // Limpa o vídeo e a imagem para o próximo hover
            const videoEl = document.getElementById('hpc-video');
            videoEl.pause();
            videoEl.classList.remove('playing');
            
            // Remove a imagem antiga imediatamente
            document.getElementById('hpc-img').style.opacity = 0;
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
            
            video.src = mediaUrl('trailer2.mp4');
            
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
            // 1. Carrega Minha Lista e Continuar Assistindo salvos previamente
            renderMinhaLista();
            renderContinueWatching();

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

            // 4. Menu de Perfil no celular (toque no botão abre/fecha dropdown)
            const profileBtn = document.getElementById('nav-profile-btn');
            const profileWrapper = document.getElementById('nav-profile-wrapper');
            if (profileBtn && profileWrapper) {
                profileBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = profileWrapper.classList.toggle('open');
                    profileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                });

                document.addEventListener('click', (e) => {
                    if (!profileWrapper.contains(e.target)) {
                        profileWrapper.classList.remove('open');
                        profileBtn.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            // 5. Botão de pesquisa
            const searchIconBtn = document.getElementById('search-icon-btn');
            const searchInput = document.getElementById('search-input');
            if (searchIconBtn && searchInput) {
                searchIconBtn.addEventListener('click', () => {
                    searchInput.focus();
                });
            }
        });



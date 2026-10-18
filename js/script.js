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

        /* =========================================================
           BANCO DE DADOS COMPLETO DA MODAL
           ========================================================= */
        const filmesDB = {
           // ================= TEMAS DE FILOSOFIA =================
            "tema-1": {
                title: "INVOCAÇÃO DO DOGMA", subtitle: "O Julgamento da Escolástica",
                bg: "invocacao_do_dogma.png", 
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
                ytTrailer: "Wkl9xeIAp90", // A Escolha Perfeita 3
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
                bg: "midia/capas/capa_teorias_politicas.jpg", banner: "midia/capas/capa_teorias_politicas.jpg",
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
                bg: "midia/capas/capa_guerra_fria.jpg", banner: "midia/capas/capa_guerra_fria.jpg",
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
                bg: "midia/capas/capa_padre_amaro.jpg", banner: "midia/capas/capa_padre_amaro.jpg",
                pdf: "trabalhos/O Crime do Padre Amaro.pdf",
                slideKey: "padre_amaro",
                match: "95% Relevante", year: "2025", age: "14", duration: "10 Slides • Análise Literária",
                synopsis: "Estudo crítico da célebre obra realista de Eça de Queirós, denunciando a corrupção moral do clero e a hipocrisia da sociedade burguesa de Leiria através do drama proibido entre o padre Amaro e Amélia.",
                cast: "Davi Costa, Marcos Felipe, Micaías Lima, Samuel Soares",
                genres: "Língua Portuguesa, Literatura", tags: "Literatura, Realismo, Eça de Queirós", isMain: false,
                materia: "Língua Portuguesa", trabalhoGrupo: "Seminário Literário: Realismo e Obras Clássicas", periodo: "2025 • Acervo da Turma"
            },
            "sociologia-desenvolvimento": {
                title: "SOCIOLOGIA DO DESENVOLVIMENTO", subtitle: "CONTRADIÇÕES SOCIAIS, CAPITALISMO E DESIGUALDADE",
                bg: "midia/capas/capa_sociologia_desenvolvimento.jpg", banner: "midia/capas/capa_sociologia_desenvolvimento.jpg",
                pdf: "trabalhos/Sociologia do Desenvolvimento.pptx.pdf",
                slideKey: "sociologia_desenvolvimento",
                match: "96% Relevante", year: "2025", age: "Livre", duration: "10 Slides • Pesquisa Social",
                synopsis: "Pesquisa sociológica sobre a produção socializada e a apropriação privada do lucro, as crises cíclicas do capitalismo, o relatório da fome da ONU e os desafios estruturais para o desenvolvimento sustentável.",
                cast: "Davi Costa, João Pedro Santos, Samuel Soares, Marcos Felipe, Micaías Lima, João Pedro Silva, Yasmyn Paiva, Wislla Mariana, Nícolas Marcell, Francisco Lucas",
                genres: "Sociologia, Economia Política", tags: "Sociologia, Desigualdade, Capitalismo", isMain: false,
                materia: "Sociologia", trabalhoGrupo: "Seminário: Teorias Sociais e Desenvolvimento Global", periodo: "2025 • Acervo da Turma"
            },
            "podcast-desigualdade": {
                title: "PODCAST: DESIGUALDADE SOCIAL", subtitle: "DEBATE EM ÁUDIO E VÍDEO • IFPI 2025",
                bg: "https://img.youtube.com/vi/M4rHhajry4A/hqdefault.jpg", 
                banner: "https://img.youtube.com/vi/M4rHhajry4A/hqdefault.jpg",
                ytTrailer: "M4rHhajry4A",
                match: "98% Relevante", year: "2025", age: "Livre", duration: "Vídeo / Podcast",
                synopsis: "Episódio especial gravado em formato podcast pelos alunos da turma, debatendo com profundidade as raízes históricas, os dados estatísticos e os reflexos modernos da desigualdade social e econômica.",
                cast: "Micaías Lima",
                genres: "Sociologia, Podcast Acadêmico", tags: "Sociologia, Podcast, Desigualdade Social", isMain: false,
                materia: "Sociologia", trabalhoGrupo: "Podcasts & Debates: Questões Sociais Brasileiras", periodo: "2025 • Acervo da Turma"
            },
            "cyber-news": {
                title: "JORNAL CYBER NEWS", subtitle: "POLÍTICA DE SEGURANÇA DA INFORMAÇÃO • IFPI 2026",
                bg: "https://img.youtube.com/vi/AAhPhj00K0g/hqdefault.jpg", 
                banner: "https://img.youtube.com/vi/AAhPhj00K0g/hqdefault.jpg",
                ytTrailer: "AAhPhj00K0g",
                match: "99% Relevante", year: "2026", age: "Livre", duration: "Vídeo / Telejornal",
                synopsis: "Edição especial do telejornal acadêmico 'Cyber News' produzida pelos alunos, cobrindo as políticas de segurança da informação (PSI), boas práticas corporativas, senhas fortes e prevenção a vazamentos de dados.",
                cast: "Micaías Lima",
                genres: "Segurança da Informação, Telejornalismo", tags: "Cibersegurança, Redes, Políticas de Segurança", isMain: false,
                materia: "Segurança & Redes", trabalhoGrupo: "Práticas de Segurança da Informação & Defesa Cibernética", periodo: "2026 • 1º Bimestre"
            },
            "seguranca-informacao": {
                title: "SEGURANÇA DA INFORMAÇÃO",
                subtitle: "VULNERABILIDADES WEB, S.O.C., NUVEM E AMEAÇAS SINTÉTICAS",
                bg: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1920&auto=format&fit=crop",
                banner: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1920&auto=format&fit=crop",
                match: "99% Relevante", year: "2025", age: "14", duration: "6 Tópicos Interativos • IFPI",
                synopsis: "Série original acadêmica sobre Segurança da Informação: análise prática e simulação visual de vulnerabilidades web em PHP (SQL Injection, XSS, LFI/RFI), arquitetura defensiva do S.O.C. (Tiers 1, 2, 3 e Red/Blue/Purple Team), responsabilidade compartilhada em Cloud Computing, novos vetores de ataque com Inteligência Artificial e Deepfakes, e governança corporativa com a norma ISO 27001.",
                cast: "Francisco Lucas, João Pedro Santos, Pedro Victor, João Pedro Silva, Nícolas Marcell",
                genres: "Segurança da Informação, Ciberdefesa, Redes",
                tags: "Segurança, SOC, SQL Injection, XSS, Cloud, Deepfake, ISO 27001",
                isMain: false,
                isSecurityPresentation: true,
                materia: "Segurança & Redes",
                trabalhoGrupo: "Seminário: Práticas de Segurança da Informação & Defesa Cibernética",
                periodo: "2025 • Acervo da Turma"
            },
            "memoria-cache": {
                title: "MEMÓRIA CACHE E ARMAZENAMENTO", subtitle: "HIERARQUIA DE MEMÓRIAS E DISCOS MAGNÉTICOS",
                bg: "midia/capas/capa_memoria_cache.jpg", banner: "midia/capas/capa_memoria_cache.jpg",
                pdf: "trabalhos/Blue and Purple Modern Computer Presentation.pdf",
                slideKey: "memoria_cache",
                match: "94% Relevante", year: "2025", age: "Livre", duration: "6 Slides • Apresentação Técnica",
                synopsis: "Apresentação técnica sobre a organização interna e o fluxo de dados em sistemas computacionais: funcionamento da memória cache (L1, L2, L3), latência, barramentos e dispositivos de armazenamento secundário.",
                cast: "Micaías Lima, Maria Helena",
                genres: "Hardware, Arquitetura de Computadores", tags: "Hardware, Memória Cache, Processadores", isMain: false,
                materia: "Hardware & Arquitetura", trabalhoGrupo: "Seminário: Arquitetura de Computadores e Hierarquia de Memória", periodo: "2025 • Acervo da Turma"
            },
            "evolucao-computadores": {
                title: "EVOLUÇÃO DOS COMPUTADORES", subtitle: "DA PRIMEIRA GERAÇÃO À COMPUTAÇÃO MODERNA",
                bg: "midia/capas/capa_evolucao_computadores.jpg", banner: "midia/capas/capa_evolucao_computadores.jpg",
                pdf: "trabalhos/Digital evolution.pdf",
                slideKey: "evolucao_computadores",
                match: "93% Relevante", year: "2025", age: "Livre", duration: "9 Slides • Manutenção",
                synopsis: "Um panorama histórico da informática: desde a primeira geração com válvulas eletrônicas gigantes (1945), a revolução dos transistores e circuitos integrados até os microprocessadores de alto desempenho.",
                cast: "Micaías Lima",
                genres: "Manutenção de Computadores, História da T.I.", tags: "Hardware, Evolução dos Computadores", isMain: false,
                materia: "Hardware & Arquitetura", trabalhoGrupo: "Seminário: História da Computação e Manutenção", periodo: "2025 • Acervo da Turma"
            },
            "podcast-round6": {
                title: "CLÁSSICOS EM SÉRIE", subtitle: "ROUND 6 E AS TEORIAS SOCIOLÓGICAS (MARX, DURKHEIM E WEBER)",
                bg: "midia/capas/capa_podcast_round6.jpg", banner: "midia/capas/capa_podcast_round6.jpg",
                pdf: "https://canva.link/nynn6ibes7h9adb",
                match: "99% Relevante", year: "2025", age: "14", duration: "Podcast • Canva",
                synopsis: "Episódio de estreia do podcast 'Clássicos em Série': os alunos analisam a série Round 6 através dos conceitos clássicos da sociologia — a luta de classes e desumanização em Marx, a anomia moral em Durkheim e a ação social racional calculista em Weber.",
                cast: "Francisco Lucas, João Pedro Santos, Pedro Victor",
                genres: "Sociologia, Podcast Cultural", tags: "Sociologia, Round 6, Marx, Durkheim, Weber", isMain: false,
                materia: "Sociologia", trabalhoGrupo: "Podcasts & Debates: Questões Sociais Brasileiras", periodo: "2025 • Acervo da Turma"
            },
            "ia-ingles": {
                title: "INTELIGÊNCIA ARTIFICIAL NO INGLÊS", subtitle: "COMO A IA PODE AJUDAR NO APRENDIZADO DE IDIOMAS",
                bg: "midia/capas/capa_ia_ingles.jpg", banner: "midia/capas/capa_ia_ingles.jpg",
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
                bg: "midia/capas/capa_padre_amaro_jogo.jpg", banner: "midia/capas/capa_padre_amaro_jogo.jpg",
                pdf: "trabalhos/O Crime do Padre Amaro jp.pdf",
                slideKey: "padre_amaro_jogo",
                match: "96% Relevante", year: "2025", age: "14", duration: "6 Slides • Gamificação Literária",
                synopsis: "Adaptação criativa da narrativa do clássico realista de Eça de Queirós em formato de regras e dinâmicas de jogo de tabuleiro: a chegada de Amaro a Leiria, as intrigas de João Eduardo, a quebra de votos e o sacrilégio moral.",
                cast: "João Pedro Santos, Pedro Victor, Francisco Lucas",
                genres: "Língua Portuguesa, Gamificação", tags: "Literatura, Eça de Queirós, Jogo de Tabuleiro", isMain: false,
                materia: "Língua Portuguesa", trabalhoGrupo: "Seminário Literário: Realismo e Obras Clássicas", periodo: "2025 • Acervo da Turma"
            },
            "jogo-transito": {
                title: "JOGO EDUCATIVO DE TRÂNSITO", subtitle: "PROJETO INTEGRADOR EM REACT NATIVE E PIXEL ART",
                bg: "midia/capas/capa_jogo_transito.jpg", banner: "midia/capas/capa_jogo_transito.jpg",
                pdf: "trabalhos/Trabalho de Tópicos Especiais em desenvolvimento e projeto integrador.pdf",
                slideKey: "jogo_transito",
                match: "95% Relevante", year: "2025", age: "Livre", duration: "3 Slides • Projeto de Software",
                synopsis: "Proposta de desenvolvimento de um jogo mobile educativo com minigames interativos ensinando regras do Código de Trânsito Brasileiro, programado em React Native, arte em pixel art (Aseprite) e trilha sonora via Beepbox.",
                cast: "João Pedro Santos, Francisco Lucas, Pedro Victor, Rodrigo Rubim",
                genres: "Programação & T.I., Desenvolvimento de Jogos", tags: "React Native, Games, Código de Trânsito", isMain: false,
                materia: "Programação & T.I.", trabalhoGrupo: "Projeto Integrador: Desenvolvimento de Software e Games", periodo: "2025 • Acervo da Turma"
            },
            "sargento-milicias": {
                title: "MEMÓRIAS DE UM SARGENTO DE MILÍCIAS", subtitle: "O ROMANCE URBANO E O ANTI-HERÓI MALANDRO",
                bg: "midia/capas/capa_sargento_milicias.jpg", banner: "midia/capas/capa_sargento_milicias.jpg",
                pdf: "trabalhos/Memórias de um sargento de Milícias.pdf",
                slideKey: "sargento_milicias",
                match: "94% Relevante", year: "2025", age: "Livre", duration: "6 Slides • Análise Literária",
                synopsis: "Estudo crítico sobre a célebre obra de Manuel Antônio de Almeida: a representação das camadas populares do Rio de Janeiro colonial, as aventuras e malandragens de Leonardo e a transição do Romantismo para o Realismo.",
                cast: "João Pedro Santos, Pedro Victor, Francisco Lucas",
                genres: "Língua Portuguesa, Literatura Brasileira", tags: "Romantismo Urbano, Malandragem, Literatura", isMain: false,
                materia: "Língua Portuguesa", trabalhoGrupo: "Seminário Literário: Romantismo Urbano e Transição ao Realismo", periodo: "2025 • Acervo da Turma"
            },
            "prosa-1930": {
                title: "A PROSA DE 1930: JORGE AMADO", subtitle: "RETRATOS DA BAHIA E A SEGUNDA GERAÇÃO MODERNISTA",
                bg: "midia/capas/capa_prosa_1930.jpg", banner: "midia/capas/capa_prosa_1930.jpg",
                pdf: "trabalhos/A prosa de 1930 Jorge Amado (Retratos da Bahia).pdf",
                slideKey: "prosa_1930",
                match: "97% Relevante", year: "2025", age: "12", duration: "11 Slides • Segunda Geração Modernista",
                synopsis: "Análise aprofundada da Prosa Regionalista de 30 com foco em Jorge Amado: o impacto social da Crise de 1929 e da Era Vargas, a denúncia das desigualdades no Nordeste e o homem determinado pelo seu meio sociocultural.",
                cast: "João Pedro Santos, Pedro Victor, Francisco Lucas, João Pedro Silva, Nícolas Marcell, José Nildo",
                genres: "Língua Portuguesa, Modernismo", tags: "Jorge Amado, Prosa de 30, Modernismo, Bahia", isMain: false,
                materia: "Língua Portuguesa", trabalhoGrupo: "Seminário Literário: Segunda Geração Modernista (A Prosa de 30)", periodo: "2025 • Acervo da Turma"
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
        } else if (data.pdf && (data.trailer || data.ytTrailer)) {
            // TÍTULO COM 2 BOTÕES: Apresentação da Turma + Trailer da Paródia
            playBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Abrir Apresentação';
            playBtn.onclick = function() {
                window.openPdfViewer(data.pdf, data.title);
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
                window.openPdfViewer(data.pdf, data.title);
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
            if (!isLocalFileProtocol()) {
                trailerTimeout = setTimeout(() => {
                    if (iframeEl) {
                        resetYtState('modal');
                        modalAutoUnmute = true;
                        iframeEl.src = getYouTubeEmbedUrl(previewId, true);
                        iframeEl.classList.add('playing');
                        onModalTrailerStarted();
                    }
                }, MODAL_TRAILER_DELAY);
            }
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

    if (key === 'modal') syncModalSoundButton(st.muted);
    else updateYtControlsUI();
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
    if (data.ytTrailer) window.openVideoPlayer(data.ytTrailer, true, startAt);
    else window.openVideoPlayer(mediaUrl(data.trailer), false, startAt);
}

/* ---------- Controles personalizados do player em tela cheia ---------- */
let ytControlsTimer;
function fmtTime(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function updateYtControlsUI() {
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
}

function pokeYtControls() {
    const overlay = document.getElementById('custom-video-player');
    if (!overlay) return;
    overlay.classList.add('show-controls');
    clearTimeout(ytControlsTimer);
    ytControlsTimer = setTimeout(() => {
        if (ytState.main.state === 1) overlay.classList.remove('show-controls');
    }, 3000);
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

window.ytMainSeek = function(e) {
    if (e) e.stopPropagation();
    const bar = document.getElementById('ytc-progress');
    const st = ytState.main;
    if (!bar || !st.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    st.time = ratio * st.duration;
    ytCommand('main', 'seekTo', [st.time, true]);
    updateYtControlsUI();
    pokeYtControls();
};

window.ytMainFullscreen = function(e) {
    if (e) e.stopPropagation();
    const overlay = document.getElementById('custom-video-player');
    if (!overlay) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (overlay.requestFullscreen) overlay.requestFullscreen().catch(() => {});
};

window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('custom-video-player');
    if (!overlay) return;
    overlay.addEventListener('mousemove', pokeYtControls);
    overlay.addEventListener('touchstart', pokeYtControls, { passive: true });
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

window.closeVideoPlayer = function() {
    const overlay = document.getElementById('custom-video-player');
    const video = document.getElementById('main-video-element');
    const iframe = document.getElementById('main-iframe-element');
    if (video) {
        video.pause();
        video.removeAttribute('src');
    }
    if (iframe) {
        iframe.removeAttribute('src');
        iframe.style.display = 'none';
    }
    resetYtState('main');
    if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); }
    if (overlay) overlay.classList.remove('show', 'yt-mode', 'show-controls');
    if (currentModalMovieId) {
        setTimeout(() => {
            window.openTitleModal(currentModalMovieId);
        }, 180);
    }
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
                clearInterval(tickerIntervalC);
                clearInterval(tickerIntervalM);
                clearTimeout(toastTimeout);
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
            { name: "Francisco", bgClass: "av-francisco" },
            { name: "Pedro", bgClass: "av-pedro" },
            { name: "JP Santos", bgClass: "av-jsantos" },
            { name: "JP Silva", bgClass: "av-jsilva" },
            { name: "Nicolas", bgClass: "av-nicolas" },
            { name: "Davi", bgClass: "av-davi" },
            { name: "Maria", bgClass: "av-maria" },
            { name: "Marcelo", bgClass: "av-marcelo" },
            { name: "Samuel", bgClass: "av-samuel" },
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
            document.getElementById('nav-profile-name').textContent = name; 
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
                    if (filmesDB[k].pdf === pdfUrl && filmesDB[k].slideKey) {
                        slideKey = filmesDB[k].slideKey;
                        break;
                    }
                }
            }

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
                const pct = ((currentSlideIndex + 1) / currentActiveSlides.length) * 100;
                fill.style.width = `${pct}%`;
            }

            if (prevBtn) prevBtn.style.opacity = currentSlideIndex === 0 ? '0.3' : '1';
            if (nextBtn) nextBtn.style.opacity = currentSlideIndex === currentActiveSlides.length - 1 ? '0.3' : '1';
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

        window.closePdfViewer = function() {
            window.closeSlideThumbnailsModal(null, true);
            const viewer = document.getElementById('custom-pdf-viewer');
            const iframe = document.getElementById('main-pdf-iframe');
            if (iframe) iframe.src = 'about:blank';
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            if (viewer) viewer.classList.remove('show');
            if (currentModalMovieId) {
                setTimeout(() => {
                    window.openTitleModal(currentModalMovieId);
                }, 150);
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
            // Filosofia (Trabalhos Atuais do 1º Bimestre)
            'tema-1':       { materia: 'Filosofia', trabalhoGrupo: 'Seminário: A Revolução Científica e os 5 Temas de Filosofia', periodo: '2026 • 1º Bimestre' },
            'guerra-civil': { materia: 'Filosofia', trabalhoGrupo: 'Seminário: A Revolução Científica e os 5 Temas de Filosofia', periodo: '2026 • 1º Bimestre' },
            'tema-3':       { materia: 'Filosofia', trabalhoGrupo: 'Seminário: A Revolução Científica e os 5 Temas de Filosofia', periodo: '2026 • 1º Bimestre' },
            'tema-4':       { materia: 'Filosofia', trabalhoGrupo: 'Seminário: A Revolução Científica e os 5 Temas de Filosofia', periodo: '2026 • 1º Bimestre' },
            'tema-5':       { materia: 'Filosofia', trabalhoGrupo: 'Seminário: A Revolução Científica e os 5 Temas de Filosofia', periodo: '2026 • 1º Bimestre' },
            // Filosofia Política (Antiguidade)
            'teorias-politicas-antiguidade': { materia: 'Filosofia', trabalhoGrupo: 'Seminário: Filosofia Política na Antiguidade', periodo: '2025 • Acervo da Turma' },
            // História
            'guerra-fria':  { materia: 'História', trabalhoGrupo: 'Seminário: A Guerra Fria e Relações Internacionais', periodo: '2025 • Acervo da Turma' },
            // Língua Portuguesa & Literatura
            'padre-amaro':  { materia: 'Língua Portuguesa', trabalhoGrupo: 'Seminário Literário: Realismo e Obras Clássicas', periodo: '2025 • Acervo da Turma' },
            'padre-amaro-jogo': { materia: 'Língua Portuguesa', trabalhoGrupo: 'Seminário Literário: Realismo e Obras Clássicas', periodo: '2025 • Acervo da Turma' },
            'sargento-milicias':{ materia: 'Língua Portuguesa', trabalhoGrupo: 'Seminário Literário: Romantismo Urbano e Transição ao Realismo', periodo: '2025 • Acervo da Turma' },
            'prosa-1930':       { materia: 'Língua Portuguesa', trabalhoGrupo: 'Seminário Literário: Segunda Geração Modernista (A Prosa de 30)', periodo: '2025 • Acervo da Turma' },
            // Língua Inglesa
            'ia-ingles':        { materia: 'Língua Inglesa', trabalhoGrupo: 'Seminário: Inteligência Artificial no Ensino de Idiomas', periodo: '2025 • Acervo da Turma' },
            // Sociologia
            'sociologia-desenvolvimento': { materia: 'Sociologia', trabalhoGrupo: 'Seminário: Teorias Sociais e Desenvolvimento Global', periodo: '2025 • Acervo da Turma' },
            'podcast-desigualdade': { materia: 'Sociologia', trabalhoGrupo: 'Podcasts & Debates: Questões Sociais Brasileiras', periodo: '2025 • Acervo da Turma' },
            'podcast-round6':   { materia: 'Sociologia', trabalhoGrupo: 'Podcasts & Debates: Questões Sociais Brasileiras', periodo: '2025 • Acervo da Turma' },
            // Segurança & Redes
            'seguranca-informacao': { materia: 'Segurança & Redes', trabalhoGrupo: 'Seminário: Práticas de Segurança da Informação & Defesa Cibernética', periodo: '2025 • Acervo da Turma' },
            'cyber-news':   { materia: 'Segurança & Redes', trabalhoGrupo: 'Práticas de Segurança da Informação & Defesa Cibernética', periodo: '2026 • 1º Bimestre' },
            // Hardware & Arquitetura
            'memoria-cache': { materia: 'Hardware & Arquitetura', trabalhoGrupo: 'Seminário: Arquitetura de Computadores e Hierarquia de Memória', periodo: '2025 • Acervo da Turma' },
            'evolucao-computadores': { materia: 'Hardware & Arquitetura', trabalhoGrupo: 'Seminário: História da Computação e Manutenção', periodo: '2025 • Acervo da Turma' },
            // Programação & T.I.
            'jogo-transito':    { materia: 'Programação & T.I.', trabalhoGrupo: 'Projeto Integrador: Desenvolvimento de Software e Games', periodo: '2025 • Acervo da Turma' }
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

        function renderAcervoHeroBannerHtml() {
            const cur = ACERVO_HERO_ITEMS[currentAcervoHeroIdx] || ACERVO_HERO_ITEMS[0];
            const st = getMateriaStyle(cur.materia);
            const bgUrl = imgUrl(cur.bg, 1200);

            const dots = ACERVO_HERO_ITEMS.map((item, idx) => `
                <button type="button" class="acervo-hero-dot ${idx === currentAcervoHeroIdx ? 'active' : ''}" 
                        onclick="window.setAcervoHeroSlide(${idx})" 
                        aria-label="Ir para destaque ${idx + 1}: ${item.title}">
                </button>
            `).join('');

            return `
                <div class="acervo-hero-banner" id="acervo-hero-banner" onmouseenter="window.pauseAcervoHeroTimer()" onmouseleave="window.resumeAcervoHeroTimer()">
                    <div class="acervo-hero-bg" id="acervo-hero-bg" style="background-image: url('${bgUrl}');"></div>
                    <div class="acervo-hero-overlay"></div>
                    <div class="acervo-hero-content">
                        <div class="acervo-hero-badge">
                            <span class="badge-acervo-mat" style="background: ${st.color};"><i class="${st.icon}"></i> ${cur.materia}</span>
                            <span class="badge-acervo-special"><i class="fa-solid fa-star"></i> DESTAQUE DO ACERVO</span>
                        </div>
                        <h1 class="acervo-hero-title" id="acervo-hero-title">${cur.title}</h1>
                        ${cur.subtitle ? `<div class="acervo-hero-subtitle" id="acervo-hero-subtitle">${cur.subtitle}</div>` : ''}
                        <p class="acervo-hero-synopsis" id="acervo-hero-synopsis">${cur.synopsis}</p>
                        <div class="acervo-hero-cast" id="acervo-hero-cast">
                            <i class="fa-solid fa-user-group"></i> <span>${cur.cast}</span>
                        </div>
                        <div class="acervo-hero-actions">
                            <button type="button" class="acervo-hero-btn-play" onclick="window.openAcademicDirectAction('${cur.id}')">
                                <i class="fa-solid fa-play"></i> Apresentar Trabalho
                            </button>
                            <button type="button" class="acervo-hero-btn-info" onclick="window.openTitleModal('${cur.id}')">
                                <i class="fa-solid fa-circle-info"></i> Detalhes
                            </button>
                        </div>
                    </div>
                    <div class="acervo-hero-pagers" id="acervo-hero-pagers">
                        ${dots}
                    </div>
                </div>
            `;
        }

        window.setAcervoHeroSlide = function(idx) {
            if (idx < 0 || idx >= ACERVO_HERO_ITEMS.length) return;
            currentAcervoHeroIdx = idx;
            const cur = ACERVO_HERO_ITEMS[idx];
            const st = getMateriaStyle(cur.materia);
            const bgUrl = imgUrl(cur.bg, 1200);

            const bgEl = document.getElementById('acervo-hero-bg');
            const titleEl = document.getElementById('acervo-hero-title');
            const subEl = document.getElementById('acervo-hero-subtitle');
            const synEl = document.getElementById('acervo-hero-synopsis');
            const castEl = document.getElementById('acervo-hero-cast');
            const pagersEl = document.getElementById('acervo-hero-pagers');

            if (bgEl) {
                bgEl.style.opacity = '0.3';
                setTimeout(() => {
                    bgEl.style.backgroundImage = `url('${bgUrl}')`;
                    bgEl.style.opacity = '1';
                }, 200);
            }
            if (titleEl) titleEl.textContent = cur.title;
            if (subEl) subEl.textContent = cur.subtitle || '';
            if (synEl) synEl.textContent = cur.synopsis;
            if (castEl) castEl.innerHTML = `<i class="fa-solid fa-user-group"></i> <span>${cur.cast}</span>`;

            const playBtn = document.querySelector('.acervo-hero-btn-play');
            const infoBtn = document.querySelector('.acervo-hero-btn-info');
            if (playBtn) playBtn.onclick = () => window.openAcademicDirectAction(cur.id);
            if (infoBtn) infoBtn.onclick = () => window.openTitleModal(cur.id);

            if (pagersEl) {
                const dots = pagersEl.querySelectorAll('.acervo-hero-dot');
                dots.forEach((d, i) => d.classList.toggle('active', i === idx));
            }
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
                    <div class="acervo-students-slider">
                        ${studentCards}
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
                    <div>
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
            { id: 'col-games', title: 'DEV & GAMES', materia: 'Programação & T.I.', img: 'midia/colecoes/col_disney_games.jpg' }
        ];

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
                window.openPdfViewer(item.pdf || '', id);
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

            if (w.isSecurityPresentation) {
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

            const durationText = w.duration || (hasSlides ? 'Apresentação em Slides' : 'Vídeo');
            const safeTitle = (w.title || '').replace(/"/g, '&quot;');
            const safeAuthors = (w.cast || 'Turma IFPI').replace(/"/g, '&quot;');

            return `
                <div class="academic-card" data-movie="${e.id}" role="button" tabindex="0" aria-label="${safeTitle}">
                    <div class="academic-card-thumb">
                        <img src="${coverUrl}" alt="${safeTitle}" class="academic-card-img" loading="lazy">
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

        function renderSeminarioShelfCardHtml(grp) {
            const st = getMateriaStyle(grp.materia);
            const count = grp.items.length;
            if (count === 1) {
                return renderAcademicCardHtml(grp.items[0]);
            }

            const firstItem = grp.items[0]?.item || {};
            const firstId = grp.items[0]?.id || '';
            const hasPdf = grp.items.some(e => e.hasPdf);
            const hasVideo = grp.items.some(e => e.hasVideo);

            // Badge de formato
            let formatBadge = `${count} TRABALHOS`;
            if (grp.trabalhoGrupo.toLowerCase().includes('podcast')) {
                formatBadge = `${count} PODCASTS`;
            } else if (hasPdf && hasVideo) {
                formatBadge = `${count} APRESENTAÇÕES`;
            }

            // Capa do 1º slide ou banner da coleção
            const repImg = firstItem.banner || firstItem.bg || firstItem.customCover || 
                (firstItem.ytTrailer ? `https://img.youtube.com/vi/${firstItem.ytTrailer}/hqdefault.jpg` : (st.colImg || 'midia/colecoes/col_disney_filosofia.jpg'));
            const repImgUrl = imgUrl(repImg, 800);
            const safeKey = grp.key.replace(/'/g, "\\'");
            const safeTitle = (grp.trabalhoGrupo || '').replace(/"/g, '&quot;');

            // Roster consolidado de autores dos trabalhos desse grupo
            const authorSet = new Set();
            grp.items.forEach(e => {
                const c = (e.item.cast || '').split(',');
                c.forEach(a => { if (a.trim()) authorSet.add(a.trim()); });
            });
            const authorsList = Array.from(authorSet).slice(0, 4).join(', ') + (authorSet.size > 4 ? ' e outros' : '');
            const safeAuthors = (authorsList || firstItem.cast || 'Turma IFPI').replace(/"/g, '&quot;');

            return `
                <div class="academic-card seminario-shelf-card is-multi" onclick="window.openSeminarioView('${safeKey}')" role="button" tabindex="0" aria-label="${safeTitle}">
                    <div class="academic-card-thumb">
                        <img src="${repImgUrl}" alt="${safeTitle}" class="academic-card-img" loading="lazy">
                        <div class="academic-thumb-overlay">
                            <div class="academic-play-badge"><i class="fa-solid fa-folder-open"></i></div>
                        </div>
                        <div class="academic-tag-left" style="background: ${st.color};">
                            <i class="${st.icon}"></i> ${grp.materia}
                        </div>
                        <div class="academic-tag-right multi-badge">
                            <i class="fa-solid fa-layer-group"></i> ${formatBadge}
                        </div>
                    </div>
                    <div class="academic-card-content">
                        <h4 class="academic-card-title">${grp.trabalhoGrupo}</h4>
                        <div class="academic-card-subtitle" style="color: var(--netflix-red); font-weight: 700;">
                            <i class="fa-solid fa-shapes"></i> Coleção &bull; ${count} ${count === 1 ? 'trabalho' : 'trabalhos'}
                        </div>
                        <div class="academic-card-authors" title="${safeAuthors}">
                            <i class="fa-solid fa-user-group"></i> <span>${safeAuthors}</span>
                        </div>
                        <div class="academic-card-meta-row">
                            <span class="academic-meta-duration"><i class="fa-solid fa-list-check"></i> ${count} apresentações</span>
                            <span class="academic-meta-year">${grp.periodo}</span>
                        </div>
                        <div class="academic-card-actions">
                            <button type="button" class="academic-btn-primary" onclick="event.stopPropagation(); window.openSeminarioView('${safeKey}')">
                                <i class="fa-solid fa-folder-open"></i> Abrir Coleção (${count})
                            </button>
                            <button type="button" class="academic-btn-info" onclick="event.stopPropagation(); window.openTitleModal('${firstId}')" title="Ver Informações">
                                <i class="fa-solid fa-circle-info"></i> Detalhes
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        window.onSeminarioCardClick = function(seminarioKey, firstMovieId, count) {
            window.openSeminarioView(seminarioKey);
        };

        window.scrollAcervoShelf = function(rowId, dir) {
            const row = document.getElementById(rowId);
            if (!row) return;
            const amount = row.clientWidth * 0.75 * dir;
            row.scrollBy({ left: amount, behavior: 'smooth' });
        };

        window.renderAcervoScreen = function() {
            const entries = getAllAcervoEntries();
            const rowsContainer = document.getElementById('acervo-rows-container');
            const searchInput = document.getElementById('acervo-search-input');
            const dropdownMenu = document.getElementById('materia-dropdown-menu');
            const labelEl = document.getElementById('current-materia-label');
            const authorChip = document.getElementById('acervo-author-chip');
            const authorNameEl = document.getElementById('acervo-author-name');
            const btnCol = document.getElementById('view-toggle-collections');
            const btnGrid = document.getElementById('view-toggle-grid');
            if (!rowsContainer) return;

            // Sincroniza botões de visualização
            if (btnCol) btnCol.classList.toggle('active', currentAcervoViewMode === 'collections');
            if (btnGrid) btnGrid.classList.toggle('active', currentAcervoViewMode === 'grid');

            // Atualiza chip de autor
            if (authorChip && authorNameEl) {
                if (currentAcervoAuthor) {
                    authorChip.style.display = 'flex';
                    authorNameEl.textContent = currentAcervoAuthor;
                } else {
                    authorChip.style.display = 'none';
                }
            }

            const query = (searchInput ? searchInput.value : '').trim().toLowerCase();

            // 1. Contagem por Matéria
            const matCounts = {};
            entries.forEach(e => {
                matCounts[e.materia] = (matCounts[e.materia] || 0) + 1;
            });

            // 2. Atualiza Botão e Menu Dropdown estilo Netflix
            if (labelEl) {
                labelEl.textContent = currentAcervoMateria === 'all' ? 'Todas as Matérias' : currentAcervoMateria;
            }

            if (dropdownMenu) {
                const materiasList = Object.keys(matCounts);
                dropdownMenu.innerHTML = `
                    <div class="netflix-genre-item ${currentAcervoMateria === 'all' ? 'active' : ''}" onclick="window.setAcervoMateria('all')">
                        <span>Todas as Matérias</span>
                        <span class="genre-count">${entries.length}</span>
                    </div>
                    ${materiasList.map(m => `
                        <div class="netflix-genre-item ${currentAcervoMateria === m ? 'active' : ''}" onclick="window.setAcervoMateria('${m.replace(/'/g, "\\'")}')">
                            <span>${m}</span>
                            <span class="genre-count">${matCounts[m]}</span>
                        </div>
                    `).join('')}
                `;
            }

            // 3. Filtragem (Matéria, Formato, Autor e Busca)
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

            // Barra Disney+ no topo do Acervo
            const disneyBarHtml = `
                <div class="acervo-disney-bar-wrapper">
                    <div class="acervo-disney-bar-title"><i class="fa-solid fa-shapes" style="color:var(--netflix-red);"></i> Selecione uma Coleção:</div>
                    <div class="acervo-disney-bar">
                        ${renderAcervoDisneyTiles(currentAcervoMateria)}
                    </div>
                </div>
            `;

            if (!filtered.length) {
                rowsContainer.innerHTML = `
                    ${disneyBarHtml}
                    <div style="text-align:center; padding: 70px 20px; color: #888;">
                        <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 16px; color: #444;"></i>
                        <h3 style="color:#fff; font-size: 1.3rem; margin-bottom: 8px;">Nenhum trabalho encontrado</h3>
                        <p style="font-size: 0.95rem;">Experimente selecionar "Todas as Matérias", outro formato ou limpar os filtros.</p>
                        ${currentAcervoAuthor ? `<button onclick="window.clearAcervoAuthorFilter()" style="margin-top:14px; background:var(--netflix-red); border:none; color:#fff; padding:8px 18px; border-radius:4px; cursor:pointer; font-weight:bold;">Limpar filtro de aluno</button>` : ''}
                    </div>
                `;
                initTurboObserver();
                return;
            }

            // MODO 0: Filtrado por Aluno (Portfólio Individual do Aluno)
            if (currentAcervoAuthor) {
                const studentCardsHtml = filtered.map(renderAcademicCardHtml).join('');
                rowsContainer.innerHTML = `
                    ${disneyBarHtml}
                    ${renderStudentPortfolioBannerHtml(currentAcervoAuthor, filtered)}
                    <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: #bbb; font-size: 0.95rem; font-weight: 700;">
                            <i class="fa-solid fa-graduation-cap" style="color:var(--netflix-red); margin-right:6px;"></i>
                            ${filtered.length} ${filtered.length === 1 ? 'apresentação realizada' : 'apresentações realizadas'}
                        </span>
                        <button type="button" class="acervo-clear-filter-btn" onclick="window.clearAcervoAuthorFilter()" style="font-size: 0.82rem; padding: 5px 12px;">
                            <i class="fa-solid fa-arrow-left"></i> Ver Toda a Turma
                        </button>
                    </div>
                    <div class="seminario-detail-grid">
                        ${studentCardsHtml}
                    </div>
                `;
                initDragToScroll();
                initHoverAutoPlay();
                initTurboObserver();
                return;
            }

            // 4. Agrupamento por Seminário / Coleção (trabalhoGrupo)
            const groupsMap = new Map();
            filtered.forEach(e => {
                const key = `${e.materia}|||${e.trabalhoGrupo}`;
                if (!groupsMap.has(key)) {
                    groupsMap.set(key, {
                        key: key,
                        materia: e.materia,
                        trabalhoGrupo: e.trabalhoGrupo,
                        periodo: e.periodo,
                        items: []
                    });
                }
                groupsMap.get(key).items.push(e);
            });

            // MODO 1: Um seminário específico está em foco (Visão Detalhada com Cards 16:9)
            if (currentAcervoSeminario && groupsMap.has(currentAcervoSeminario)) {
                const grp = groupsMap.get(currentAcervoSeminario);
                const st = getMateriaStyle(grp.materia);
                const cardsHtml = grp.items.map(renderAcademicCardHtml).join('');

                rowsContainer.innerHTML = `
                    <div class="seminario-detail-header">
                        <button type="button" class="seminario-back-btn" onclick="window.backToSeminarios()">
                            <i class="fa-solid fa-arrow-left"></i> Voltar para todas as coleções
                        </button>
                        <div class="seminario-detail-title-group">
                            <span class="seminario-detail-materia-badge" style="background: ${st.color};">
                                <i class="${st.icon}"></i> ${grp.materia}
                            </span>
                            <h2 class="seminario-detail-title">${grp.trabalhoGrupo}</h2>
                        </div>
                        <div class="seminario-detail-subtitle">
                            <span><i class="fa-regular fa-calendar"></i> ${grp.periodo}</span> &bull; 
                            <span>${grp.items.length} ${grp.items.length === 1 ? 'apresentação disponível' : 'apresentações disponíveis'}</span>
                        </div>
                    </div>
                    <div class="seminario-detail-grid">
                        ${cardsHtml}
                    </div>
                `;

                initDragToScroll();
                initHoverAutoPlay();
                initTurboObserver();
                return;
            }

            // MODO 3: Visão Todos os Slides (Grade direta com todos os trabalhos 16:9)
            if (currentAcervoViewMode === 'grid') {
                const allCardsHtml = filtered.map(renderAcademicCardHtml).join('');
                rowsContainer.innerHTML = `
                    ${disneyBarHtml}
                    <div style="margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: #bbb; font-size: 0.95rem; font-weight: 700;">
                            <i class="fa-solid fa-layer-group" style="color:var(--netflix-red); margin-right:6px;"></i>
                            ${filtered.length} ${filtered.length === 1 ? 'apresentação encontrada' : 'apresentações encontradas'}
                        </span>
                        <span style="color: #777; font-size: 0.82rem;">Exibição em Slides 16:9</span>
                    </div>
                    <div class="seminario-detail-grid">
                        ${allCardsHtml}
                    </div>
                `;
                initDragToScroll();
                initHoverAutoPlay();
                initTurboObserver();
                return;
            }

            // CASO 3: Filtrado por Matéria Específica (ex: Filosofia, Sociologia, etc.)
            if (currentAcervoMateria !== 'all') {
                const st = getMateriaStyle(currentAcervoMateria);
                // Se modo for 'grid', exibe todos os slides individuais; senão, cada trabalho completo ocupa 1 card
                let matCardsHtml = '';
                if (currentAcervoViewMode === 'grid') {
                    matCardsHtml = filtered.map(renderAcademicCardHtml).join('');
                } else {
                    matCardsHtml = Array.from(groupsMap.values()).map(renderSeminarioShelfCardHtml).join('');
                }

                const countSubtitle = groupsMap.size === filtered.length
                    ? `${filtered.length} ${filtered.length === 1 ? 'trabalho disponível' : 'trabalhos disponíveis'}`
                    : `${groupsMap.size} ${groupsMap.size === 1 ? 'coleção' : 'coleções'} • ${filtered.length} apresentações`;

                rowsContainer.innerHTML = `
                    ${disneyBarHtml}
                    <div class="acervo-focused-materia-header">
                        <div class="acervo-shelf-title-group">
                            <span class="acervo-shelf-badge" style="background: ${st.color};">
                                <i class="${st.icon}"></i>
                            </span>
                            <div>
                                <h2 class="row-title acervo-shelf-title" style="margin: 0;">${currentAcervoMateria}</h2>
                                <span style="font-size: 0.82rem; color: #888;">${countSubtitle}</span>
                            </div>
                        </div>
                        <button type="button" class="acervo-clear-filter-btn" onclick="window.setAcervoMateria('all')">
                            <i class="fa-solid fa-arrow-left"></i> Ver Todas as Matérias
                        </button>
                    </div>
                    <div class="seminario-detail-grid">
                        ${matCardsHtml}
                    </div>
                `;
                initDragToScroll();
                initHoverAutoPlay();
                initTurboObserver();
                return;
            }

            // CASO 4: PADRÃO (currentAcervoMateria === 'all')
            // Separados por matérias, em fileiras que arrastam para os lados, igual à tela inicial!
            // Cada trabalho completo ocupa apenas UM card (ex: podcasts de sociologia agrupados em 1 card)
            const materiasMap = new Map();
            filtered.forEach(e => {
                if (!materiasMap.has(e.materia)) {
                    materiasMap.set(e.materia, []);
                }
                materiasMap.get(e.materia).push(e);
            });

            // Ordem recomendada das matérias
            const materiaOrder = [
                'Filosofia', 
                'Sociologia', 
                'Língua Portuguesa', 
                'História', 
                'Hardware & Arquitetura', 
                'Segurança & Redes',
                'Programação & T.I.', 
                'Língua Inglesa'
            ];

            const sortedMaterias = Array.from(materiasMap.keys()).sort((a, b) => {
                const idxA = materiaOrder.indexOf(a);
                const idxB = materiaOrder.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
            });

            let shelvesHtml = sortedMaterias.map((matName, idx) => {
                const items = materiasMap.get(matName);
                const st = getMateriaStyle(matName);
                const slug = matName.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const rowId = `acervo-shelf-row-${slug}-${idx}`;
                
                // Agrupa as apresentações daquela matéria pelo seu trabalho/seminário completo
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

                const cardsHtml = Array.from(matGroupsMap.values()).map(renderSeminarioShelfCardHtml).join('');
                const safeMat = matName.replace(/'/g, "\\'");
                const groupCount = matGroupsMap.size;
                const workCount = items.length;
                const countBadgeText = groupCount === workCount 
                    ? `${workCount} ${workCount === 1 ? 'trabalho' : 'trabalhos'}`
                    : `${groupCount} ${groupCount === 1 ? 'coleção' : 'coleções'} • ${workCount} apresentações`;

                return `
                    <div class="catalog-section acervo-subject-shelf" id="acervo-shelf-${slug}">
                        <div class="acervo-shelf-header">
                            <div class="acervo-shelf-title-group">
                                <span class="acervo-shelf-badge" style="background: ${st.color};">
                                    <i class="${st.icon}"></i>
                                </span>
                                <h2 class="row-title acervo-shelf-title">${matName}</h2>
                                <span class="acervo-shelf-count">${countBadgeText}</span>
                            </div>
                            <button type="button" class="acervo-shelf-filter-btn" onclick="window.setAcervoMateria('${safeMat}')">
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

            rowsContainer.innerHTML = `
                ${disneyBarHtml}
                ${renderAcervoHeroBannerHtml()}
                ${renderStudentsRowHtml(entries)}
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
            document.getElementById('nav-profile-name').textContent = "Admin";
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
           ABRIR PLAYER DE VÍDEO / TRAILERS (MP4 E YOUTUBE)
           ========================================================= */
        window.openVideoPlayer = function(videoSrc, isYouTube = false, startAt = 0) {
            window.closeTitleModal(null, true);
            if (isYouTube && isLocalFileProtocol()) {
                const t = Math.floor(startAt || 0);
                window.open(`https://www.youtube.com/watch?v=${videoSrc}${t ? '&t=' + t + 's' : ''}`, '_blank', 'noopener');
                return;
            }

            const overlay = document.getElementById('custom-video-player');
            const video = document.getElementById('main-video-element');
            const iframe = document.getElementById('main-iframe-element');
            
            if (isYouTube) {
                if (video) {
                    video.pause();
                    video.removeAttribute('src');
                    video.style.display = 'none';
                }
                if (iframe) {
                    resetYtState('main');
                    iframe.src = getYouTubeEmbedUrl(videoSrc, false, startAt);
                    iframe.style.display = 'block';
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
            const sliders = document.querySelectorAll('.posters-container, .landscape-row, .top10-container, .acervo-row-slider');
            
            sliders.forEach(slider => {
                if (slider.dataset.dragInit === 'true') return;
                slider.dataset.dragInit = 'true';

                let isDown = false;
                let startX;
                let startY;
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
                    startY = e.touches[0].pageY;
                    scrollLeft = slider.scrollLeft;
                }, {passive: true});
                slider.addEventListener('touchend', () => { isDown = false; });
                slider.addEventListener('touchmove', (e) => {
                    if (!isDown) return;
                    const currentY = e.touches[0].pageY;
                    const currentX = e.touches[0].pageX - slider.offsetLeft;
                    const walkX = (currentX - startX);
                    const walkY = Math.abs(currentY - startY);
                    
                    // Se o movimento for predominantemente vertical, não interfere no scroll da página
                    if (walkY > Math.abs(walkX)) return;
                    
                    if (Math.abs(walkX) > 5) {
                        hasMoved = true;
                    }
                    slider.scrollLeft = scrollLeft - (walkX * 1.8);
                }, {passive: true});

                // Evita disparar cliques nos cards se o usuário estava arrastando
                slider.querySelectorAll('.card-portrait, .card-landscape, .top10-item, .academic-card, .seminario-card').forEach(card => {
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
            
            // Se o usuário rolar a tela, esconde a mini tela imediatamente
            const home = document.getElementById('home-screen');
            if (home && !home.dataset.scrollInit) {
                home.dataset.scrollInit = 'true';
                home.addEventListener('scroll', window.closeHoverPreview);
            }
            const acervo = document.getElementById('acervo-screen');
            if (acervo && !acervo.dataset.scrollInit) {
                acervo.dataset.scrollInit = 'true';
                acervo.addEventListener('scroll', window.closeHoverPreview);
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
                if (!isLocalFileProtocol()) {
                    iframeEl.src = getYouTubeEmbedUrl(previewId, true);
                    iframeEl.classList.add('playing');
                }
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
                else if(data.pdf) window.openPdfViewer(data.pdf, data.title);
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



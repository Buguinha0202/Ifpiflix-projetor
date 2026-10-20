# 🗺️ MAPA DO PROJETO — IFPIFLIX
> **Plataforma Acadêmica Cinemática e Paródica da Turma do IFPI (Filosofia & T.I.)**
> *Arquitetura Técnica, Fluxos de Telas, Banco de Dados e Sistema de Estado*

---

## 1. Visão Geral e Propósito

O **IFPIFLIX** é uma aplicação web interativa *single-page* de alta fidelidade visual, inspirada na interface da Netflix e nos jogos de computador AAA. O projeto tem dois propósitos integrados:
1. **Apresentação de Seminários Acadêmicos:** Modos de projeção interativa (Modo Clássico 2D e Palco Cinematográfico 3D) cobrindo a Revolução Científica, a Escolástica, o Empirismo de Bacon, o Racionalismo de Descartes e a Síntese Newtoniana.
2. **Streaming e Acervo Central da Turma:** Catálogo completo de trabalhos em PDF, séries em vídeo, podcasts de sociologia, apresentações de defesa cibernética, jogos de trânsito e o elenco de todos os alunos da turma do IFPI.

A aplicação opera **100% no cliente (front-end estático)**, sem necessidade de servidores back-end, funcionando tanto via `http://localhost`, GitHub Pages (`https://buguinha0202.github.io/Ifpiflix-projetor/`) quanto localmente via protocolo `file:///`.

---

## 2. Estrutura de Arquivos e Pastas

```
Ifpiflix/
├── index.html                   # HTML Principal com todas as telas, modais e templates
├── css/
│   └── style.css                # Estilização completa (~9.5k linhas), temas, 3D e animações
├── js/
│   └── script.js                # Lógica central (~7.8k linhas), engines, dados e eventos
├── midia/
│   └── capas/                   # Pôsteres verticais de cinema gerados para os cursos/séries
├── trabalhos/                   # Arquivos PDF dos trabalhos e apresentações dos alunos
├── MAPA_DO_PROJETO.md           # Este documento de especificação e arquitetura
└── [assets de raiz]             # Imagens de fundo, capas dos filmes, ícones e vídeos
```

---

## 3. Telas e Telas Virtuais (`switchScreen`)

O roteamento entre telas é controlado pela função `window.switchScreen(screenId, syncNav)`. Cada tela é uma `div` com classe `.screen`:

| ID da Tela | Propósito | Recursos & Modos |
|---|---|---|
| `#home-screen` | Catálogo Principal (Estilo Netflix) | Banner Hero Dinâmico, Carrosséis Horizontais, Top 5, Filtros de Categoria |
| `#acervo-screen` | Acervo Acadêmico da Turma | Modo Coleções / Grade, Filtro por Matéria/Formato/Aluno, Roleta "Surpreenda-me" |
| `#player-screen` | Apresentador 2D do Seminário | Slides 0 a 13, Tickers animados, visual RPG, controles de apresentação |
| `#cinematic-stage` | Palco 3D Cinemático | Cenas em perspectiva 3D, partículas espaciais, auras reativas, tilt |
| `#security-player-screen` | Apresentação Interativa Cyber | Simulação de SOC/Defesa Cibernética, etapas progressivas, animação de rede |
| `#quiz-screen` | Quiz da Revolução Científica | Perguntas de múltipla escolha, placar da turma, replay infinito, feedback sonoro |
| `#splash-screen` | Abertura Cinemática TUDUM | Logo animada IFPIFLIX com sintetizador Web Audio API puro |

---

## 4. Modais, Overlays e Recursos Especiais

| Modal / Overlay ID | Descrição |
|---|---|
| `#title-modal-overlay` | Modal principal de detalhes do filme/trabalho, sinopse, trailer YouTube embutido, lista de episódios e botão `burst(heart)`. |
| `#pdf-modal` | Visualizador de apresentações em PDF nativo e integrado com iframe e atalhos. |
| `#video-modal` | Player de vídeo em tela cheia com scrubber interativo e controles de cinema. |
| `#wrapped-modal` | Retrospectiva dos trabalhos da turma estilo Spotify Wrapped em stories. |
| `#student-card-modal-overlay` | Carta holográfica 3D (RPG) do aluno com giro giroscópico, rainbow foil e botão de लाइक. |
| `#duel-arena-box` | Coliseu Acadêmico: arena de combate 1v1 por turnos entre colegas da turma. |
| `#subscription-checkout-modal` | Checkout paródia (R$ 67,90) com cupom `NOTA10` (100% de desconto) e comprovante de louvor. |
| `#achievement-toast` | Banner de conquistas estilo Xbox/PS5 deslizando no topo da tela com áudio procedural. |
| `#newton-canvas-overlay` | Simulação física elástica de queda de maçãs e fórmulas físicas ($g = 9.8\,\text{m/s}^2$). |
| `#spotlight-overlay` | Teatro das Sombras / Efeito holofote seguindo o cursor do mouse (tecla `F`). |
| `#profile-modal` | Gerenciador de perfis (Admin, Convidado, Aluno, Professor). |
| `#submit-work-modal` | Modal exclusivo para cadastro e envio de novos trabalhos da turma. |

---

## 5. Bancos de Dados Canônicos (Em Memória no `script.js`)

1. **`filmesDB`**: Registro canônico com metadados de cada filme, série e trabalho (títulos, sinopses, duração, PDFs, trailers no YouTube, elencos, tags).
2. **`script`**: Roteiro cronológico dos 14 capítulos (slides 0 a 13) da Apresentação da Revolução Científica.
3. **`ACERVO_SEMINARIOS`**: Estrutura das disciplinas e seminários (Filosofia, Redes, Literatura, Hardware, Sociologia, Trânsito).
4. **`STUDENTS_REGISTRY`**: Cadastro dos 17 alunos da turma com nomes canônicos, apelidos, avatares e cores temáticas.
5. **`STUDENT_RPG_STATS`**: Atributos de RPG de cada aluno (Overall 94–99, Classe, Oratória, Filosofia, Código, Anti-Dogma, Habilidade Única e Lema).
6. **`ACHIEVEMENTS_DB`**: Registro das 8 conquistas desbloqueáveis com pontuação de XP e ícones.

---

## 6. Estado Global Unificado (`window.IFPIFLIX_STATE`)

Para eliminar o espalhamento de variáveis soltas e fornecer um ponto de verdade único e reativo para a aplicação e para o **Painel Modo Deus (Debug)**, o projeto centraliza seu estado no objeto reativo:

```javascript
window.IFPIFLIX_STATE = {
    // Telas e Navegação
    activeScreen: 'home-screen',
    activeProfile: 'Admin',
    currentModalMovieId: '',
    
    // Apresentações e Seminários
    currentSlide: -1,
    currentCineIdx: -1,
    secCurrentSlide: 0,
    secCurrentStep: 1,
    
    // Filtros do Acervo
    currentAcervoMateria: 'all',
    currentAcervoFormat: 'all',
    currentAcervoAuthor: null,
    currentAcervoViewMode: 'collections',
    
    // Áudio e Efeitos
    sfxEnabled: true,
    
    // RPG, Gamificação e Conquistas
    unlockedAchievements: [],
    minhaLista: [],
    quizIndex: 0,
    quizScore: 0,
    activeCardStudent: null,
    
    // Assinatura e Easter Eggs
    hasApplied100Discount: false,
    newtonClickCount: 0,
    
    // Métodos de Acesso e Assinatura
    subscribe(listener) { ... },
    set(key, value) { ... }
};
```

---

## 7. Atalhos de Teclado Globais

| Tecla | Função |
|---|---|
| **`F2`** | Abre / fecha o **Painel Modo Deus (Debug Console)** |
| **`F`** | Liga / desliga o **Holofote (Teatro das Sombras)** (quando não há vídeos abertos) |
| **`Esc`** | Fecha qualquer modal aberto (Detalhes, PDF, Vídeo, Wrapped, Carta 3D, Checkout, Debug) |
| **`Espaço` / `→`** | Avança slide no Player 2D, Cinema 3D ou Apresentação Cyber |
| **`←`** | Volta slide anterior |
| **`M`** | Liga / desliga mudo no player de vídeo |
| **Digitar `NEWTON`** | Easter Egg: Invoca imediatamente a Gravidade da Maçã de Newton na tela |

---

## 8. Módulos de Suporte

* **`window.SoundEngine` (Web Audio API):** Síntese procedural nativa sem arquivos de áudio externos para cliques, abertura/fechamento de modais, acertos, erros, TUDUM, alertas e conquistas.
* **`window.GodModePanel`:** Interface de inspeção ao vivo e manipulação instantânea do estado.
* **`window.createHeartBurst`:** Animação física de partículas e dispersão radial de corações.

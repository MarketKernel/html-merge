# html-merge

<!-- languages -->
<h3 align="center">
<a href="../../README.md">🇬🇧 English</a> ·
<a href="README.zh.md">🇨🇳 中文</a> ·
<a href="README.hi.md">🇮🇳 हिन्दी</a> ·
<a href="README.es.md">🇪🇸 Español</a> ·
<a href="README.fr.md">🇫🇷 Français</a> ·
<a href="README.ar.md">🇸🇦 العربية</a> ·
<a href="README.bn.md">🇧🇩 বাংলা</a> ·
<b>🇧🇷 Português</b> ·
<a href="README.ru.md">🇷🇺 Русский</a> ·
<a href="README.ur.md">🇵🇰 اردو</a> ·
<a href="README.id.md">🇮🇩 Bahasa Indonesia</a> ·
<a href="README.de.md">🇩🇪 Deutsch</a> ·
<a href="README.ja.md">🇯🇵 日本語</a> ·
<a href="README.mr.md">🇮🇳 मराठी</a> ·
<a href="README.te.md">🇮🇳 తెలుగు</a> ·
<a href="README.tr.md">🇹🇷 Türkçe</a> ·
<a href="README.uk.md">🇺🇦 Українська</a>
</h3>
<!-- /languages -->

O **HTML Merge** compara duas pastas, ou dois arquivos, lado a lado — como o WinMerge, mas como
um único arquivo HTML que funciona em qualquer navegador moderno no Windows, macOS, Linux,
ChromeOS, Android e iOS. Escolha duas pastas e ele lista todos os arquivos de ambas com o que
aconteceu com cada um: idêntico, diferente, somente à esquerda, somente à direita. Abra um
arquivo e as duas versões ficam lado a lado, com realce de sintaxe para mais de quarenta
linguagens, as palavras alteradas marcadas dentro das linhas alteradas, e um mapa de todas as
diferenças ao lado da barra de rolagem.

Ele só lê. Nada é instalado, nada é enviado e nenhum arquivo é alterado: os arquivos são lidos
pela própria página, no navegador, e a página não consegue acessar a rede de forma alguma.

A mesma página também funciona como um PWA (Progressive Web App): servida a partir do GitHub
Pages, pode ser instalada no sistema e então roda como um aplicativo separado, com sua própria
janela e ícone, e funciona offline — veja “[GitHub Pages](#github-pages)”.

![HTML Merge: duas versões de um arquivo JavaScript lado a lado](../html-merge.png)

## Como usar

1. Compile `build/html-merge.html` (veja “[Compilação](#compilação)”) ou baixe de um
   lançamento, e abra-o em um navegador — abrir direto do disco funciona bem.
2. Escolha o lado esquerdo e o direito: **Pasta…** ou **Arquivo…** para cada um, ou arraste uma
   pasta ou um arquivo até a caixa correspondente. Duas pastas ou dois arquivos soltos na janela
   ao mesmo tempo são comparados na hora.
3. **Comparar**.

Com duas pastas, a lista de pastas aparece e vai se preenchendo conforme os arquivos são
comparados. Os chips no topo mostram ou escondem cada tipo de resultado e os contam; a lista
pode ser uma árvore ou uma lista simples de caminhos, filtrada por nome (`util`, ou um padrão
como `*.ts`), e ordenada por qualquer coluna. Dê um duplo clique em um arquivo (ou selecione-o e
pressione Enter) para compará-lo; `]` e `[` avançam para o próximo e o arquivo diferente
anterior, e Esc ou o botão Voltar do navegador retornam à lista.

Na tela de arquivo:

- as setas se movem entre as diferenças (Alt+↓ e Alt+↑, ou F7 e Shift+F7); a atual é marcada na
  margem, e o mapa à direita mostra onde todas estão — clique nele para saltar;
- **Lado a lado ou um abaixo do outro** alterna entre dois painéis e um painel unificado;
- **Recolher linhas idênticas** esconde trechos idênticos longos, deixando algumas linhas ao
  redor de cada diferença; clique em um trecho recolhido para abri-lo;
- **Localizar** (Ctrl+F, ⌘F no Mac) marca todas as ocorrências nos dois lados; Enter e
  Shift+Enter se movem entre elas;
- o menu **⋯** reúne as opções de exibição e comparação: o layout, a linguagem usada para
  colorir os arquivos, as cores de sintaxe, os espaços em branco e quebras de linha visíveis,
  palavras ou caracteres dentro das linhas alteradas, e o que ignorar.

Imagens (PNG, JPEG, GIF, WebP, BMP, ICO, AVIF) são mostradas lado a lado com seu tamanho em
pixels. Os demais arquivos binários são comparados byte a byte: a página diz se são idênticos,
onde está a primeira diferença, e mostra os bytes ao redor dela.

O Chrome e o Edge lembram as comparações recentes: elas aparecem na tela inicial e abrem de novo
com um clique (o navegador pede permissão de novo para ler as pastas). Os outros navegadores
escolhem as pastas de novo a cada vez.

### No celular

A página funciona na tela de um celular: a tela inicial empilha os dois lados, a lista de pastas
mantém o nome e o resultado, e um par de arquivos é mostrado um abaixo do outro. Toque em um
arquivo para abri-lo. No Android, o Chrome escolhe tanto pastas quanto arquivos; no iOS é
possível comparar arquivos (lá não é possível escolher pastas).

## Recursos

- **Pastas**: comparação recursiva pelo conteúdo (ou, mais rápido, por tamanho e data); uma
  árvore ou uma lista simples; filtros por resultado e por nome; ordenação por nome, resultado,
  tamanho ou data; nomes excluídos por padrão (`.git; node_modules; *.log; build/`); nomes de
  arquivo comparados com ou sem diferenciar maiúsculas de minúsculas; os status são preenchidos
  conforme os arquivos são lidos, alguns de cada vez, de modo que até pastas grandes mostrem
  algo logo de início.
- **Texto**: um diff de paciência sobre o algoritmo de Myers, de modo que chaves e linhas em
  branco movidas não emparelham código sem relação; as linhas de um bloco alterado são
  emparelhadas pela semelhança entre elas; palavras ou caracteres alterados marcados dentro de
  uma linha; blocos de linhas em branco que podem ser ignorados; a visão unificada; o
  recolhimento de linhas idênticas; busca nos dois lados.
- **Opções de comparação**: ignorar alterações na quantidade de espaços em branco ou todos os
  espaços em branco, ignorar maiúsculas e minúsculas, ignorar linhas em branco, ignorar quebras
  de linha (CRLF, LF, CR) — tanto na lista de pastas quanto na tela de arquivo.
- **Codificações**: UTF-8, UTF-8 com BOM, UTF-16 LE e BE, e Windows-1252 para arquivos que não
  são UTF-8 válido; a codificação, as quebras de linha e o número de linhas são mostrados para
  cada lado, e uma diferença apenas de quebras de linha é identificada como tal.
- **Realce de sintaxe** para mais de quarenta linguagens, escolhida pelo nome do arquivo ou por
  sua primeira linha (`#!/usr/bin/env python3`): JavaScript, TypeScript, JSON, HTML (com os
  scripts e estilos internos), XML, CSS, SCSS, Less, Markdown, Python, Java, Kotlin, C, C++, C#,
  Go, Rust, Swift, Objective-C, PHP, Ruby, shell, PowerShell, arquivos batch, SQL, YAML, TOML,
  INI, Dockerfile, Makefile, CMake, diff, Lua, Perl, R, Dart, Scala, Groovy, Haskell, Elixir,
  GraphQL, Protocol Buffers, Pascal, Visual Basic. Qualquer outra linguagem pode ser escolhida
  manualmente.
- **Arquivos grandes**: só as linhas visíveis são desenhadas, de modo que arquivos com centenas
  de milhares de linhas rolam suavemente; linhas muito longas são cortadas na tela (a comparação
  continua vendo todas elas).
- **Imagens e arquivos binários** como descrito acima.
- **Dezessete idiomas** da interface, da direita para a esquerda para árabe e urdu; um tema
  claro e um escuro que seguem o sistema ou são escolhidos.
- O aplicativo instalado só se atualiza quando solicitado: veja
  “[GitHub Pages](#github-pages)”.

## Atalhos de teclado

| Teclas | Ação |
| --- | --- |
| Alt+↓, F7 | Próxima diferença |
| Alt+↑, Shift+F7 | Diferença anterior |
| `]` / `[` | Próximo / anterior arquivo diferente |
| Ctrl+F (⌘F) | Localizar nos arquivos, ou filtrar a lista de pastas |
| Enter / Shift+Enter | Próxima / anterior correspondência |
| ↑ ↓ ← → | Navegar pela lista de pastas, abrir e fechar pastas |
| Enter | Abrir o arquivo selecionado |
| Esc | Voltar à lista de pastas |
| F5 | Comparar novamente |
| ? | A lista de atalhos |

## Segurança

- **Somente leitura.** A página lê os arquivos e nunca escreve, renomeia ou exclui nada. No
  Chrome e no Edge as pastas são abertas pela File System Access API, com acesso somente de
  leitura.
- **Offline por construção.** A Content-Security-Policy da página diz `connect-src 'none'`, e
  tudo o que ela precisa — estilos, código, ícones — está dentro do único arquivo HTML. Ela não
  consegue carregar nada nem enviar nada, seja lá o que um arquivo comparado contenha.
- **Script fixado.** A build substitui `script-src 'unsafe-inline'` pelo hash do único script da
  página: se algum dia um nome de arquivo ou uma linha de texto escapasse sem ser tratada, um
  manipulador embutido nela ainda assim não seria executado. O texto dos arquivos chega à página
  devidamente tratado (escapado).
- As comparações recentes (Chrome e Edge) guardam apenas os identificadores das pastas no
  IndexedDB do navegador — sem nomes de arquivo dentro, sem conteúdo. As configurações ficam em
  `localStorage`.

## Traduções

A interface fala inglês, chinês, hindi, espanhol, francês, árabe, bengali, português, russo,
urdu, indonésio, alemão, japonês, marati, telugu, turco e ucraniano. Ela começa no primeiro dos
idiomas do navegador que conhece; Configurações → Idioma escolhe outro.

- O inglês vive no código: `t('context', 'English text')`, ou
  `tn('context', '{count} file', '{count} files', n)` para um texto com um número. Em
  `src/app/template.html` o mesmo é `data-i18n="context"` (o texto do elemento) e
  `data-i18n-attr="context"` (seu title, placeholder e aria-label).
- Cada um dos demais idiomas é um dicionário, `src/locales/<code>.json`:
  `{ "context": { "English text": "translation" } }`. Um texto com um número tem uma forma para
  cada categoria plural do idioma (`Intl.PluralRules`), usando a forma plural em inglês como
  chave.
- O que faltar em um dicionário é mostrado em inglês.
- `npm run i18n` imprime, por idioma, as strings que faltam no dicionário e as que ele tem e que
  a interface não usa mais; `npm test` verifica os marcadores de posição e as formas plurais.

## Compilação

Requer Node.js 20 ou mais recente.

```sh
npm install
npm run build        # build/html-merge.html e build/pages/
npm run watch        # recompila a cada alteração
npm run check        # checagem de tipos, testes unitários, build, testes de navegador
```

`./build.sh` faz o mesmo que `npm run build`, instalando as dependências na primeira execução.
As únicas dependências são esbuild e TypeScript, ambas apenas para a build; a página em si não
usa nenhuma biblioteca.

- `npm test` executa os testes unitários no Node: o diff, as linhas e o recolhimento, as
  codificações, o realce e suas gramáticas, a comparação de pastas, os dicionários.
- `npm run test:browser` controla a página gerada e a PWA em um Chrome headless, pelo protocolo
  DevTools, sem nenhuma outra dependência. Precisa de um Chrome ou Chromium local
  (`CHROME=/path/to/chrome` para escolher um) e é ignorado quando não há nenhum.
- `npm run shots -- <dir>` salva capturas de tela de cada tela principal.
- `npm run icons` gera os ícones PNG da PWA a partir de `assets/icon.svg`.

## Versões e lançamentos

A versão vive somente em `package.json`. Uma build do commit marcado com a tag `v<version>` a
mostra tal como está; qualquer outra build acrescenta seu commit (`0.1.0+1a2b3c4`), para que uma
página gerada a partir de `main` não seja confundida com um lançamento. A versão aparece no
rodapé da tela inicial e em Configurações.

Para lançar: `npm version minor` (ou `patch`), depois `git push --follow-tags`. A tag inicia
`.github/workflows/release.yml`, que confere se a tag corresponde a `package.json`, executa os
testes e anexa `html-merge-v<version>.html` e `SHA256SUMS.txt` ao lançamento no GitHub.

## GitHub Pages

`build/pages/` é a mesma página como um PWA instalável: um manifest, ícones e um service worker
que a mantém funcionando offline. `.github/workflows/pages.yml` a constrói, testa e implanta no
GitHub Pages a cada push para `main` (Settings → Pages → Source: GitHub Actions). Todos os seus
caminhos são relativos, então funciona no endereço `/<repo>/` de um site de projeto.

- A CSP da PWA acrescenta apenas sua própria origem para o manifest, o worker e os ícones;
  `connect-src` permanece `'none'`.
- Um novo deploy não substitui a versão em execução por conta própria: o novo service worker
  espera, e Configurações (e a tela inicial) dizem “A versão X está pronta. Atualização”. A
  página verifica discretamente a cada seis horas e quando a conexão volta.
- Depois de uma atualização, “Atualizado para a versão X” aparece uma vez.

## Estrutura

```text
build.mjs              a build: o arquivo único e build/pages/
src/core/diff.ts       opções de comparação, chaves de linha, diff de paciência sobre Myers, hunks
src/core/inline.ts     palavras ou caracteres alterados dentro de uma linha, pareando as linhas de um bloco
src/core/rows.ts       linhas e blocos; a visão: lado a lado ou unificada, recolhimentos
src/core/text.ts       binário ou texto, codificações, linhas e quebras de linha, colunas
src/core/highlight.ts  o tokenizador: estados de expressões regulares sticky
src/core/languages.ts  as gramáticas, e em qual linguagem um arquivo está
src/core/folder.ts     duas árvores mescladas, status, os filtros e a ordem da lista, padrões de exclusão
src/core/format.ts     tamanhos, datas e números no idioma da interface
src/core/i18n.ts       t(), tn(), os dicionários, traduzindo o markup da página
src/app/template.html  a página, com sua Content-Security-Policy
src/app/styles.css     os estilos, o tema claro e o escuro, as cores de sintaxe
src/app/main.ts        a tela inicial, a comparação de pastas, as telas, o histórico, as teclas, arrastar e soltar
src/app/folderview.ts  a lista de pastas: linhas virtuais, chips, filtro, ordenação, teclas
src/app/filescreen.ts  a tela de arquivo: barra de ferramentas, cabeçalhos, linha de status, opções
src/app/diffview.ts    os painéis de texto: linhas virtuais, palavras, cores, mapa, busca, recolhimentos
src/app/mediaview.ts   imagens lado a lado, arquivos binários como bytes
src/app/sources.ts     seletores de pasta e arquivo, itens soltos, leitura de arquivos
src/app/recent.ts      comparações recentes: identificadores no IndexedDB
src/app/settings.ts    configurações em localStorage, tema, tamanho do texto
src/app/settingsview.ts a caixa de diálogo de configurações, os atalhos, as opções de comparação compartilhadas
src/app/ui.ts          elementos, ícones, caixas de diálogo, popovers, notificações, escaping
src/app/update.ts      atualizações do aplicativo instalado
src/pwa/sw.js          o service worker da PWA
src/locales/*.json     os 16 dicionários
tools/                 load.mjs (src/ para Node), chrome.mjs (Chrome headless), i18n.mjs, shots.mjs, icons.mjs
tests/                 testes unitários no Node; app.mjs e pwa.mjs no Chrome
```

## Limitações

- **Somente leitura por design**: não há fusão nem edição; copie as alterações no seu editor.
- Firefox e Safari escolhem pastas com a caixa de diálogo de upload de pasta do navegador: ela lê
  a pasta inteira de uma vez (os nomes excluídos são descartados depois, não ignorados), não
  mostra pastas vazias, e uma atualização não vê arquivos adicionados depois disso — para isso é
  preciso escolher as pastas de novo. O iOS não consegue escolher pastas de jeito nenhum.
- Arquivos maiores que 64 MB são comparados somente byte a byte, sem as opções de ignorar.
- O realce de sintaxe é léxico — palavras-chave, strings, comentários, números — não um parser;
  algumas construções (tags JSX, heredocs) são coloridas como texto simples.
- Sem comparação de três vias, sem comparação do conteúdo de arquivos compactados, sem detecção
  de blocos movidos.

## Licença

MIT — veja [LICENSE](../../LICENSE).

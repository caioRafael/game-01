# game-01

Jogo 2D no canvas, escrito em TypeScript. O código é compilado para módulos nativos do navegador, sem bundler. Cenas, objetos, interface, entrada, colisão e desenho ficam separados, e um servidor local recompila o jogo e recarrega a página quando um arquivo muda.

## Como rodar

Requer Node.js e [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

O servidor sobe em [http://127.0.0.1:3001](http://127.0.0.1:3001) e abre o navegador. A porta pode ser trocada com a variável `PORT`. `DEV_OPEN=0` impede que o navegador abra sozinho.

`pnpm build` gera os arquivos em `dist/`. O TypeScript emite os imports com os aliases `@core`, `@engine`, `@entities`, `@scenes` e `@ui`; `scripts/fix-extensions.mjs` reescreve esses caminhos para imports relativos com extensão `.js`, que o navegador consegue carregar.

No modo de desenvolvimento, o compilador fica em watch, o servidor observa `dist/` e avisa a página por Server-Sent Events para recarregar. `console.log` do jogo também aparece no terminal.

## Como jogar

A tela inicial é o menu. Um rótulo fica no canto superior esquerdo e um quadrado vermelho no centro. Embaixo, centralizado, há um painel com outro rótulo, o botão **New Game** e um campo de texto no canto superior direito do painel.

Clique no campo para digitar o nome; clique fora para tirar o foco. **Backspace** apaga o último caractere. **New Game** guarda o texto e entra na primeira fase. **Espaço** entra na fase sem guardar o nome, exceto quando o campo está focado: aí a tecla escreve um espaço.

Na primeira fase o fundo é preto. O nome aparece no canto superior direito, como `Player: …`. **Back**, no canto superior esquerdo, volta ao menu. O jogador é o quadrado vermelho e se move com as **setas**. O quadrado azul é sólido: encostar nele cancela o movimento. Passar o mouse sobre ele deixa o quadrado cinza. A colisão é de retângulos alinhados aos eixos.

## Estrutura

| Pasta               | Papel                                       |
| ------------------- | ------------------------------------------- |
| `src/core`          | `Game` e o loop de `requestAnimationFrame`  |
| `src/engine`        | desenho no canvas, teclado, mouse e colisão |
| `src/entities`      | `Scene`, sessão, `GameObject` e `Player`    |
| `src/scenes`        | tela inicial e primeira fase                |
| `src/ui`            | rótulo, botão, painel, campo de texto e âncoras |
| `src/server`        | servidor de desenvolvimento                 |
| `src/images/knight` | sprites do cavaleiro                        |

Cada cena implementa `layout`, `update` e `render`. O loop mede o tempo entre quadros, limita o passo a 50 ms, posiciona a interface com o tamanho atual da tela e chama a cena. `GameContext.changeScene` troca a cena; uma cena não substitui a si mesma.

`Game` cria um `GameSession` uma vez e o entrega em `GameContext.session`. O campo de texto guarda só o rascunho. **New Game** copia esse texto para `session.playerName`, e a fase seguinte lê o mesmo objeto. Uma cena nova não leva os widgets da anterior.

## Interface

Os widgets são desenhados no mesmo canvas da cena. `Widget` guarda o retângulo e testa se um ponto está dentro dele. A cena cria os widgets, posiciona os que têm âncora em `layout` e chama `update` e `render`.

| Widget   | Papel                                                                                         |
| -------- | --------------------------------------------------------------------------------------------- |
| `Label`  | texto sem interação; o alinhamento horizontal usa `TextAlign`                                |
| `Button` | retângulo clicável; o texto alinha com `TextAlign` e `TextVerticalAlign`                      |
| `Panel`  | fundo e filhos. Sem âncora, o `x` e o `y` do filho são a distância ao canto superior esquerdo |
| `Input`  | campo de texto; só recebe teclas enquanto está focado                                        |

O botão dispara o clique enquanto o mouse está pressionado sobre ele. O foco do campo usa a borda do mouse: o frame em que o botão desce. Letras, espaço e backspace chegam por uma fila de `keydown` no `InputService`. O que ninguém consome é descartado no fim do quadro.

### Âncoras

`setAnchor(âncora, offsetX, offsetY)` gruda um ponto do widget no mesmo ponto do pai. Na cena, o pai é a tela. Dentro de um painel, o pai é o painel. O deslocamento é em pixels e soma depois: positivo anda para a direita e para baixo. Num canto direito ou numa base, o valor negativo puxa o widget para dentro.

| `Anchor`        | Ponto                    |
| --------------- | ------------------------ |
| `TOP_LEFT`      | canto superior esquerdo  |
| `TOP_CENTER`    | meio do topo             |
| `TOP_RIGHT`     | canto superior direito   |
| `MIDDLE_LEFT`   | meio da borda esquerda   |
| `CENTER`        | centro                   |
| `MIDDLE_RIGHT`  | meio da borda direita    |
| `BOTTOM_LEFT`   | canto inferior esquerdo  |
| `BOTTOM_CENTER` | meio da base             |
| `BOTTOM_RIGHT`  | canto inferior direito   |

A cena implementa `layout(width, height)` e chama `place(0, 0, width, height)` nos widgets soltos. O painel, ao ser colocado, posiciona os filhos. O loop chama `layout` antes de `update`, para o clique usar o retângulo já resolvido. O desenho chama de novo quando a janela muda de tamanho.

No menu, o rótulo usa `TOP_LEFT`, o painel `BOTTOM_CENTER` e o campo `TOP_RIGHT` do painel. Na primeira fase, **Back** usa `TOP_LEFT` e o nome `TOP_RIGHT`, com o texto alinhado à direita da caixa.

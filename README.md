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

A tela inicial é o menu. Um botão **New Game** entra na primeira fase. **Espaço** faz o mesmo, exceto quando o campo de texto está focado: aí a tecla escreve um espaço no campo.

O menu desenha um rótulo, o botão e um painel. Dentro do painel há outro rótulo, outro botão e um campo de texto. Clique no campo para digitar; clique fora para tirar o foco. **Backspace** apaga o último caractere.

Na primeira fase o fundo é preto. O jogador é o quadrado vermelho e se move com as **setas**. O quadrado azul é sólido: encostar nele cancela o movimento. Passar o mouse sobre ele deixa o quadrado cinza. A colisão é de retângulos alinhados aos eixos.

## Estrutura

| Pasta               | Papel                                       |
| ------------------- | ------------------------------------------- |
| `src/core`          | `Game` e o loop de `requestAnimationFrame`  |
| `src/engine`        | desenho no canvas, teclado, mouse e colisão |
| `src/entities`      | `Scene`, `GameObject` e `Player`            |
| `src/scenes`        | tela inicial e primeira fase                |
| `src/ui`            | rótulo, botão, painel e campo de texto      |
| `src/server`        | servidor de desenvolvimento                 |
| `src/images/knight` | sprites do cavaleiro                        |

Cada cena implementa `update` e `render`. O loop mede o tempo entre quadros, limita o passo a 50 ms e chama a cena atual. `GameContext.changeScene` troca a cena; uma cena não substitui a si mesma.

## Interface

Os widgets são desenhados no mesmo canvas da cena. `Widget` guarda o retângulo e testa se um ponto está dentro dele. A cena cria os widgets e chama `update` e `render`.

| Widget   | Papel                                                                    |
| -------- | ------------------------------------------------------------------------ |
| `Label`  | texto sem interação                                                      |
| `Button` | retângulo clicável; o texto alinha com `TextAlign` e `TextVerticalAlign` |
| `Panel`  | fundo e filhos; a posição de cada filho é relativa ao painel             |
| `Input`  | campo de texto; só recebe teclas enquanto está focado                    |

O clique do botão e o foco do campo usam a borda do mouse: o frame em que o botão desce. Letras, espaço e backspace chegam por uma fila de `keydown` no `InputService`. O que ninguém consome é descartado no fim do quadro.

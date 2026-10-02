# game-01

Jogo 2D no canvas, escrito em TypeScript. O código é compilado para módulos nativos do navegador, sem bundler. Cenas, objetos, entrada, colisão e desenho ficam separados, e um servidor local recompila o jogo e recarrega a página quando um arquivo muda.

## Como rodar

Requer Node.js e [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev
```

O servidor sobe em [http://127.0.0.1:3001](http://127.0.0.1:3001) e abre o navegador. A porta pode ser trocada com a variável `PORT`. `DEV_OPEN=0` impede que o navegador abra sozinho.

`pnpm build` gera os arquivos em `dist/`. O TypeScript emite os imports com os aliases `@core`, `@engine`, `@entities` e `@scenes`; `scripts/fix-extensions.mjs` reescreve esses caminhos para imports relativos com extensão `.js`, que o navegador consegue carregar.

No modo de desenvolvimento, o compilador fica em watch, o servidor observa `dist/` e avisa a página por Server-Sent Events para recarregar. `console.log` do jogo também aparece no terminal.

## Como jogar

A tela inicial mostra um quadrado vermelho. **Espaço** entra na primeira fase.

Na primeira fase o fundo é verde. O jogador é o quadrado vermelho e se move com as **setas**. O quadrado azul é sólido: encostar nele cancela o movimento. A colisão é de retângulos alinhados aos eixos.

## Estrutura

| Pasta | Papel |
| --- | --- |
| `src/core` | `Game` e o loop de `requestAnimationFrame` |
| `src/engine` | desenho no canvas, teclado e colisão |
| `src/entities` | `Scene`, `GameObject` e `Player` |
| `src/scenes` | tela inicial e primeira fase |
| `src/server` | servidor de desenvolvimento |
| `src/images/knight` | sprites do cavaleiro |

Cada cena implementa `update` e `render`. O loop mede o tempo entre quadros, limita o passo a 50 ms e chama a cena atual. `GameContext.changeScene` troca a cena; uma cena não substitui a si mesma.

## Sprites do cavaleiro

Os PNGs em `src/images/knight/` são pixel art 48×48 com fundo transparente. Ainda não são desenhados pelo jogo: o jogador continua um retângulo colorido.

Há um quadro para cada combinação de direção e pose. A direção é `down`, `up`, `left` ou `right`.

- `idle-*-0.png` e `idle-*-1.png`: parado
- `walk-*-0.png` até `walk-*-3.png`: caminhada
- `attack-*-0.png` até `attack-*-2.png`: preparo, golpe e recuperação

`spritesheet.png` junta os 36 quadros numa grade de 9 colunas por 4 linhas, cada célula com 48×48. As colunas seguem a ordem acima (dois de parado, quatro de caminhada, três de ataque). As linhas são baixo, cima, direita e esquerda.

# game-01

Jogo 2D no canvas, escrito em TypeScript. O código é compilado para módulos nativos do navegador, sem bundler. Cenas, objetos, interface, entrada, câmera, tilemap e desenho ficam separados, e um servidor local recompila o jogo e recarrega a página quando um arquivo muda.

O mapa jogável é uma rua do Nordeste: o chão é um tilemap, e casas e plantas são objetos desenhados por cima.

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

Clique no campo para digitar o nome; clique fora para tirar o foco. **Backspace** apaga o último caractere. **New Game** guarda o texto e entra no mapa. **Espaço** entra no mapa sem guardar o nome, exceto quando o campo está focado: aí a tecla escreve um espaço.

No mapa o fundo é marrom escuro. O nome aparece à esquerda, ao lado de **Back**, como `Player: …`. **Back** volta ao menu. Esses dois widgets ficam fixos na tela. O jogador usa o spritesheet do teen, nasce na calçada e se move com as **setas**. A caixa de colisão tem um tile; o desenho é o dobro disso, com os pés na base da caixa. A câmera o segue e o mantém no centro da vista, sem sair dos limites do mapa.

O chão (terra, areia, capim, rua, calçada) é atravessável. A água é sólida, e fora da grade também. Casas e árvores não são tiles: cada uma é um objeto. Na casa, só a fileira de baixo (alicerce e base da porta) bloqueia o passo. Telhado e parede de cima deixam o jogador passar por trás, e a fachada cobre o corpo quando os pés estão ao norte da base, no mesmo espírito de Pokémon e Stardew Valley. O tronco da árvore bloqueia; a copa não.

A porta ocupa dois tiles de altura. Passar o mouse sobre ela pinta um destaque. Perto da porta, o rótulo mostra o nome da casa. Um clique perto abre a saudação por alguns segundos. Longe, o rótulo pede para chegar mais perto. A colisão do jogador é testada eixo a eixo, contra os tiles sólidos e contra os retângulos das casas e das árvores.

A primeira fase continua no código, em `src/scenes/first-fase.scene.ts`. É uma sala de tiles coloridos (chão, parede e porta). A porta é sólida e, ao ser tocada, volta ao menu; o hover pinta esse tile de cinza. O menu não abre mais essa cena. Ela só reaparece se o estado salvo no servidor ainda for `first-fase`.

## Estrutura

| Pasta              | Papel                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `src/core`         | `Game`, o loop de `requestAnimationFrame` e o estado persistido       |
| `src/engine`       | desenho no canvas, câmera, teclado, mouse, colisão, sprite e tilemap  |
| `src/entities`     | `Scene`, sessão, `GameObject`, `Player`, `House` e `Tree`             |
| `src/scenes`       | menu, mapa do Nordeste, primeira fase e os mapas                      |
| `src/ui`           | rótulo, botão, painel, campo de texto e âncoras                       |
| `src/server`       | servidor de desenvolvimento                                           |
| `src/images/teen`  | spritesheet do jogador                                                |
| `src/images/knight`| sprites do cavaleiro                                                  |
| `src/images/tiles` | chão, kit das casas e plantas                                         |

Cada cena implementa `layout`, `update` e `render`. O loop mede o tempo entre quadros, limita o passo a 50 ms, posiciona a interface com o tamanho atual da tela e chama a cena. `GameContext.changeScene` troca a cena; uma cena não substitui a si mesma.

`Game` cria um `GameSession` e uma câmera uma vez e os entrega em `GameContext`. O campo de texto guarda só o rascunho. **New Game** copia esse texto para `session.playerName`, e a cena seguinte lê o mesmo objeto. `changeScene` também zera a câmera. Uma cena nova não leva os widgets da anterior.

A cena atual e o nome do jogador ficam na memória do servidor de desenvolvimento. `changeScene` envia os dois para `/game-state`. Ao recarregar a página, o jogo pede esse estado e reabre a mesma cena, com o mesmo nome. Reiniciar o servidor volta ao menu. Nada disso usa `localStorage`, `sessionStorage` nem cookie. Os ids conhecidos são `initial`, `initial-map` e `first-fase`.

## Mapa e câmera

O chão do mapa jogável está em `src/scenes/maps/initial-map.map.ts`, no mesmo formato da primeira fase: cada caractere da grade é uma chave em `tileByMark`. As casas e as árvores ficam em listas de coluna e linha, porque ocupam vários tiles e são desenhadas por cima do chão. As definições dos tiles, os planos das casas e os recortes das plantas estão em `src/scenes/maps/nordeste-art.ts`.

`TileMap` guarda a grade, converte entre tile e mundo, desenha só os tiles visíveis e responde se um retângulo cobre um tile sólido ou um gatilho. Cada tile pode ter uma cor ou uma célula de uma `ImageSheet`. O chão do Nordeste usa `nordeste.png`. O tamanho do tile é 64 px.

A câmera tem dois modos. `FIXED` fica parada. `FOLLOW` acompanha um `GameObject` e centraliza o alvo na vista. O mapa chama `follow` no jogador e `setBounds` com o tamanho do mapa. O desenho do mundo usa `apply`, que translada o canvas com coordenadas arredondadas, para o pixel art não borrar. A interface é desenhada depois, em coordenadas de tela. `screenToWorld` converte o mouse para o mundo, e é assim que o hover da porta acompanha a câmera. Trocar de cena chama `reset` e volta ao modo fixo na origem.

Casas, árvores e jogador são ordenados pela base do sprite antes de desenhar. Quem está mais ao sul aparece na frente.

## Arte

As imagens do Nordeste são geradas por `scripts/paint-nordeste-tiles.mjs`. O desenho é feito em 16 px lógicos e ampliado 4 vezes, com vizinho mais próximo, até o tile de 64 px.

```bash
node scripts/paint-nordeste-tiles.mjs
```

| Arquivo                         | Uso                                                                 |
| ------------------------------- | ------------------------------------------------------------------- |
| `src/images/tiles/nordeste.png` | chão: terra, areia, capim, ruas e água                              |
| `src/images/tiles/casas.png`    | kit. O jogo monta cada fachada célula a célula                      |
| `src/images/tiles/casas-montadas.png` | as mesmas casas já compostas, só como referência visual        |
| `src/images/tiles/plantas.png`  | plantas da caatinga, com fundo transparente, maiores que um tile    |

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

No menu, o rótulo usa `TOP_LEFT`, o painel `BOTTOM_CENTER` e o campo `TOP_RIGHT` do painel. No mapa, **Back** e o nome usam `TOP_LEFT`. Na primeira fase, **Back** usa `TOP_LEFT` e o nome `TOP_RIGHT`, com o texto alinhado à direita da caixa.

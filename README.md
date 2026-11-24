# ♟️ Chess Clicker

A pixel-art incremental clicker game about climbing the chess ranks, built with React, TypeScript, three.js, and CSS Modules.

You start as a Beginner with a single pawn. Click it to make moves, collect pieces and chess tools that play for you, win title matches, and work your way up to World Champion.

**▶️ Play it online: [dugonski.github.io/clicker-game](https://dugonski.github.io/clicker-game/)**

> ⚠️ This project was created for **learning purposes** as part of my studies in Software Engineering. It serves as a hands-on exercise to practice React, TypeScript, and component-based architecture.

## 🎮 How to play

1. **Click the piece** to make moves, the game's currency.
2. **Buy pieces and tools** (pawns, knights, bishops, chess clocks…) that make moves automatically every second.
3. **Buy upgrades** to double what each of them produces, or to make your clicks stronger.
4. **Fill the title bar** by making enough moves with your current title, then press **Play the title match** to earn the next one.

Progress is saved automatically in your browser (`localStorage`). Use *Reset progress* at the bottom of the page to start over.

## 🏆 The road to World Champion

Every title you earn **doubles all move income**, unlocks new things to buy, and changes the piece you click. Moves, pieces, and upgrades all carry over.

| # | Title                | Your piece    | Moves needed for the next match | Unlocks                    |
|---|----------------------|---------------|---------------------------------|----------------------------|
| 1 | Beginner             | Pawn          | 3K                              | Pawn, Knight, Bishop       |
| 2 | Club Player          | Knight        | 150K                            | Rook, Queen                |
| 3 | Candidate Master     | Bishop        | 15M                             | King, Chess Clock          |
| 4 | FIDE Master          | Rook          | 600M                            | Chessboard                 |
| 5 | International Master | Queen         | 20B                             | Opening Book               |
| 6 | Grandmaster          | King          | 600B                            | Chess Club                 |
| 7 | Super Grandmaster    | Golden king   | 15T                             | Chess Engine               |
| 8 | World Champion       | Crystal king  | Final title (for now)           | Tournament                 |

Each title match plays a short animation: your piece marches up the board, checkmates the black king, and turns into the piece of your new title.

## ⬆️ Upgrades

- **Piece and tool upgrades**: for example *Pawns II*, *Pawns III*, and so on. Each tier unlocks when you own 10, 25, 50, and 100 of that item, and doubles its production.
- **Tactics Training II–V**: unlock after 50, 250, 1,000, and 5,000 clicks. Each tier doubles click power and adds 2% of your moves per second to every click.

Each item costs 15% more than the previous one of its kind.

## 👾 3D pieces, 2D pixel art

The chess pieces and the shop items are real **3D models**, drawn through a **pixel-art filter**:

1. Each model (pieces, clock, board, books, club, engine, trophy) is built in code from three.js shapes: lathed profiles for the pieces, an extruded silhouette for the knight's head, and boxes and cylinders for the rest.
2. three.js renders the model into a tiny image (64×64 for the big piece, 32×32 for icons). Instead of colours, a custom shader stores the light, the part, and the depth of every pixel.
3. A filter turns that into pixel art: each part is painted from a 5-colour palette with ordered dithering, depth jumps become dark inner lines, the silhouette gets a one-pixel outline, and a shadow is drawn underneath.
4. The image is scaled up with `image-rendering: pixelated`, so the pieces can really rotate while still looking hand-pixelled.

The few interface glyphs (the currency, cursor, and lock) are 16×16 sprites written as text grids in `src/pixel/sprites.ts`. The text uses the [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) and [VT323](https://fonts.google.com/specimen/VT323) fonts, bundled through Fontsource so the game works offline.

## 🛠️ Getting started

Requires [Node.js](https://nodejs.org/) and npm.

```bash
npm install
```

```bash
npm start
```

The game opens at [http://localhost:3000](http://localhost:3000).

Other scripts:

| Command         | What it does                              |
|-----------------|-------------------------------------------|
| `npm test`      | Runs the unit and component tests         |
| `npm run build` | Creates a production build in `build/`    |

## 🌐 Deployment

Every push to `main` runs the tests, builds the game, and publishes it to GitHub Pages through the workflow in `.github/workflows/deploy.yml`. The repository's Pages source must be set to **GitHub Actions** (Settings → Pages).

## 📁 Project structure

```
src/
├── game/
│   ├── data.ts        # Titles, pieces & tools, and upgrades (edit here to add content)
│   ├── logic.ts       # Game state, reducer, and all the maths
│   └── format.ts      # Number formatting (1.23K, 4.50M…)
├── pixel/
│   ├── models.ts         # 3D models and their colour palettes
│   ├── modelRenderer.ts  # three.js rendering and the pixel-art filter
│   └── sprites.ts        # 16×16 interface sprites
├── hooks/
│   └── useGame.ts     # Game loop and auto-save
├── Components/
│   ├── ModelView/          # A rotating 3D model as pixel art
│   ├── Icon/               # Shop icons (3D model or sprite)
│   ├── PixelSprite/        # Draws a sprite from sprites.ts
│   ├── PieceClicker/       # The clickable piece
│   ├── NextTitle/          # Progress bar and title-match button
│   ├── Shop/               # Upgrades and pieces & tools lists
│   └── PromotionAnimation/ # The title match
└── App.tsx
```

Adding a new upgrade tier only requires a new entry in `src/game/data.ts`. A new item that needs a new look also needs a model in `src/pixel/models.ts`.

## 🔧 Technologies

The technologies utilized in this repository:

[![My Skills](https://skillicons.dev/icons?i=html,css,js,ts,react,threejs,git,github)](https://skillicons.dev)

Made with ❤️ by Guilherme Dugonski

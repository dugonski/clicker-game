# 🚀 Space Clicker

A pixel-art incremental clicker game about travelling across the Solar System, built with React, TypeScript, and CSS Modules.

You start on Earth with nothing but a click. Collect stardust, hire a crew, build a fleet, and launch from planet to planet until you reach the edge of the Solar System.

**▶️ Play it online: [dugonski.github.io/clicker-game](https://dugonski.github.io/clicker-game/)**

> ⚠️ This project was created for **learning purposes** as part of my studies in Software Engineering. It serves as a hands-on exercise to practice React, TypeScript, and component-based architecture.

## 🎮 How to play

1. **Click the planet** to collect stardust ✨.
2. **Buy crew and fleet** (astronauts, engineers, launch pads, rockets…) to produce stardust automatically every second.
3. **Buy upgrades** to double what each of them produces, or to make your clicks stronger.
4. **Fill the mission bar** by collecting enough stardust on the current planet, then press **Launch** to fly to the next one.

Progress is saved automatically in your browser (`localStorage`). Use *Reset progress* at the bottom of the page to start over.

## 🪐 The journey

Every planet you reach **doubles all stardust income** and unlocks new things to buy. Stardust, crew, and upgrades travel with you.

| # | Planet  | Stardust needed to leave | Unlocks on arrival                  |
|---|---------|--------------------------|-------------------------------------|
| 1 | Earth   | 3K                       | Astronaut, Engineer, Launch Pad     |
| 2 | Moon    | 150K                     | Rocket, Satellite                   |
| 3 | Mars    | 15M                      | Rover, Space Colony                 |
| 4 | Jupiter | 600M                     | Space Station                       |
| 5 | Saturn  | 20B                      | Ring Miner                          |
| 6 | Uranus  | 600B                     | Deep Space Telescope                |
| 7 | Neptune | 15T                      | Starship                            |
| 8 | Pluto   | Final stop (for now)     | Warp Gate                           |

Each launch plays a short travel animation: the rocket leaves the current planet, jumps through the stars, and arrives at the next one.

## ⬆️ Upgrades

- **Crew & fleet upgrades** — e.g. *Astronauts II*, *Astronauts III*… Each tier unlocks when you own 10, 25, 50, and 100 of that unit, and doubles its production.
- **Mission Control II–V** — unlock after 50, 250, 1,000, and 5,000 clicks. Each tier doubles click power and adds 2% of your stardust per second to every click.

Each unit costs 15% more than the previous one of its kind.

## 👾 Pixel art

Everything on screen is pixel art, and none of it comes from image files:

- **Planets** are rendered in code on a 64×64 canvas and scaled up. Each pixel is projected onto a sphere, coloured by a small procedural texture, and shaded with a 4-step dithered ramp, so the planets rotate for real.
- **Icons** (crew, fleet, cursor, lock, stardust) are 16×16 sprites, shaded with a 22-colour palette and written as text grids in `src/pixel/sprites.ts`, one character per pixel.
- **Interface** uses hard-edged panels, stepped animations, and the [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) and [VT323](https://fonts.google.com/specimen/VT323) fonts (bundled through Fontsource, so the game works offline).

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
│   ├── data.ts        # Planets, crew/fleet, and upgrades (edit here to add content)
│   ├── logic.ts       # Game state, reducer, and all the maths
│   └── format.ts      # Number formatting (1.23K, 4.50M…)
├── pixel/
│   ├── sprites.ts         # 16×16 icon sprites and their colour palette
│   └── planetRenderer.ts  # Procedural pixel-art planets
├── hooks/
│   └── useGame.ts     # Game loop and auto-save
├── Components/
│   ├── PixelSprite/     # Draws a sprite from sprites.ts
│   ├── PlanetClicker/   # The clickable planet
│   ├── PlanetSphere/    # Rotating planet on a canvas
│   ├── Mission/         # Progress bar and launch button
│   ├── Shop/            # Upgrades and crew & fleet lists
│   └── TravelAnimation/ # The trip between planets
└── App.tsx
```

Adding a new upgrade tier only requires a new entry in `src/game/data.ts`. A new unit also needs a sprite in `src/pixel/sprites.ts`, and a new planet needs a surface in `src/pixel/planetRenderer.ts`.

## 🔧 Technologies

The technologies utilized in this repository:

[![My Skills](https://skillicons.dev/icons?i=html,css,js,ts,react,git,github)](https://skillicons.dev)

Made with ❤️ by Guilherme Dugonski

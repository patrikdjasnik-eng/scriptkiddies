# Script kiddies 🥱

<img width="1919" height="987" alt="image" src="https://github.com/user-attachments/assets/1614927d-0f01-488b-baed-9c97be2405c1" />


Bilingual Czech / English bug bounty simulation game. This prototype uses fictional companies and reserved .test domains only. All terminal commands return scripted local results; no external hosts are contacted.

## Prototype features
- Responsive operator dashboard and generated Three.js workstation scene (no large 3D assets).
- Four fictional bounty programs with scope, difficulty and reward details.
- Program details, scope rules and active workspace selection.
- Simulated terminal commands: help, recon --target <domain>, scan --target <domain>, assets, report, clear.
- Czech / English interface toggle.
- Simulated asset discovery and finding workflow.

## Requirements
Node.js 20.19+ or 22.12+, npm.

## Run
npm install
npm run dev

## Build
npm run build

All commands operate only on fictional .test targets. This is a game simulation, not a real penetration-testing tool.

## Velikost hry

Maximální velikost produkčního balíčku je **10 GB**. Produkční build automaticky kontroluje adresář `dist/`; při překročení limitu selže a od 80 % limitu vypíše varování. Rozpočet jednotlivých typů obsahu a pravidla pro assety jsou popsány v [`docs/ASSET_BUDGET.md`](docs/ASSET_BUDGET.md) a strojově definovány v [`game.config.json`](game.config.json).

Samostatná kontrola: `npm run check:assets` (po vytvoření buildu).

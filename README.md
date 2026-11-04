#Script kiddies 🥱
<img width="1919" height="987" alt="image" src="https://github.com/user-attachments/assets/1614927d-0f01-488b-baed-9c97be2405c1" />

<p align="center">
  <strong>Learn bug bounty hunting by doing the work.</strong><br />
  A browser-based, free-to-play bug bounty simulation game built around realistic workflows, fictional targets and hands-on learning.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🎮-Bug%20Bounty%20Simulation-8b5cf6?style=for-the-badge" alt="Bug bounty simulation game" />
  <img src="https://img.shields.io/badge/💸-Free%20to%20Play-16a34a?style=for-the-badge" alt="Free to play" />
  <img src="https://img.shields.io/badge/🌐-Browser%20Based-2563eb?style=for-the-badge" alt="Browser based" />
  <img src="https://img.shields.io/badge/🧪-Interactive%20Hacking%20Lab-f59e0b?style=for-the-badge" alt="Interactive hacking lab" />
  <img src="https://img.shields.io/badge/🛡️-Safe%20Simulation-0f766e?style=for-the-badge" alt="Safe simulation" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Lucide-Icons-F56565?style=flat-square" alt="Lucide icons" />
  <img src="https://img.shields.io/badge/Status-Active%20Development-orange?style=flat-square" alt="Active development" />
</p>

---

## 🧭 Overview

**Bounty Hunter** is a free-to-play educational game that introduces bug bounty hunting through practical, mission-based scenarios. Instead of simply clicking through dashboards, players investigate fictional environments, use command-line tools, inspect synthetic evidence, document findings and submit structured vulnerability reports.

The project combines a simulated operator workstation with a collection of guided security labs. It is designed for beginners who want to understand the workflow as well as more experienced players who want a safe environment to practise analytical thinking.

> **Important:** Bounty Hunter is a game and training simulation, not a real penetration-testing platform. Targets, terminal output, network activity, captures and evidence are fictional and locally simulated.

## 🖥️ Game experience

The game includes a virtual operator workstation inspired by a Linux desktop environment. Players can open applications, explore files, use a simulated terminal, read technical knowledge articles and work through investigation missions.

### What you can do

- 🧑‍💻 **Operate a virtual laptop** — desktop, application dock, windows and a simulated PowerShell-style command runner.
- 🎯 **Complete bug bounty missions** — investigate recon, web/API security, IDOR, SQL injection, cloud exposure, Wi-Fi analysis, incident response, SSRF and TLS configuration scenarios.
- 🛠️ **Practise with simulated tools** — Nmap, dig, whois, traceroute, Gobuster, Nikto, SQLmap, Burp Suite, Aircrack-ng, Wireshark, TShark, YARA, John the Ripper, Hashcat and additional utilities.
- 🌐 **Research in a fictional environment** — use the in-game search and bounty hub with fictional programs and profiles.
- 📁 **Collect and inspect evidence** — work with synthetic files, logs, hashes and investigation artefacts.
- 📝 **Write vulnerability reports** — prepare, validate and submit structured findings.
- 📚 **Learn as you play** — beginner guidance, contextual hints and a local knowledge base explain the purpose of commands and techniques.
- 🏅 **Earn progress through work** — XP and mission progression are tied to investigation objectives and report workflow, not simply launching a command.
- 💾 **Keep local progress** — supported player progress is stored in browser local storage.

## 🧪 Mission labs

The current mission set includes:

| Mission | Training focus |
| --- | --- |
| First Infrastructure Recon | Asset discovery and reconnaissance |
| Exposed API Documentation | API surface and documentation review |
| Night Incident | Incident response and log analysis |
| Someone Else's Parcel | Insecure Direct Object Reference (IDOR) |
| Suspicious Parameter | SQL injection investigation |
| Public File Storage | Cloud storage exposure |
| Radio Silence | Safe, synthetic Wi-Fi analysis |
| Forgotten Token | API token exposure |
| Webhook Out of Control | SSRF and URL validation |
| Weak TLS | TLS versions, certificates and security headers |

Mission objectives guide the player from initial analysis through evidence collection and reporting. Later steps require the relevant earlier objectives to be completed.

## 🧰 Technology stack

| Technology | Purpose |
| --- | --- |
| React | Component-based user interface |
| TypeScript | Typed application logic |
| Vite | Development server and production bundling |
| Three.js | Lightweight 3D workstation visuals |
| Lucide | Interface icons |
| CSS | Responsive layout and desktop/workstation styling |
| Browser localStorage | Local player progress and selected game state |

## 🏁 Getting started

### Requirements

- Node.js **20.19+** or **22.12+**
- npm

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

### Create a production build

```bash
npm run build
```

### Check the asset budget

After creating the build:

```bash
npm run check:assets
```

The production package has a configured maximum size budget of **10 GB**. The build checks the `dist/` directory, warns from 80% of the limit and fails if the configured maximum is exceeded. See [docs/ASSET_BUDGET.md](docs/ASSET_BUDGET.md) and [game.config.json](game.config.json) for the budget rules.

## 🔒 Safety and simulation boundaries

Safety is a core design requirement:

- All organizations, users, programs, hosts and findings are fictional.
- Targets use reserved or fictional namespaces such as `.test` and `.lab`.
- Commands are handled by an in-game interpreter and deterministic local fixtures; they are **not** executed by the host operating system.
- Network discovery, scans, HTTP responses, packet captures and tool output are simulated. The game does not send requests to external targets.
- Wi-Fi and password-analysis scenarios use synthetic training data. They do not capture real traffic, deauthenticate devices or crack real credentials.
- The in-game bounty hub and search are local game features, not integrations with real bounty platforms.

Do not use the game as a substitute for authorised security testing, professional tooling or a real-world security assessment.

## 🗺️ Roadmap

The project is under active development. Planned areas include:

- More investigation scenarios and progressively harder objectives.
- Deeper terminal workflows and richer simulated command output.
- More realistic evidence handling and report-quality evaluation.
- Additional knowledge-base content and contextual learning.
- Further polish to the virtual workstation and responsive experience.

## 🤝 Contributing

Ideas, bug reports and improvements are welcome. When contributing, please keep the simulation boundary intact: new labs and tools should use fictional targets and local synthetic data rather than contacting real systems.

## 📜 Project status

Bounty Hunter is an actively developed prototype. Features, mission content and interfaces may change as the game evolves.

---

<p align="center">
  <strong>Explore. Investigate. Verify. Report.</strong><br />
  Learn the bug bounty workflow — safely, one mission at a time.
</p>

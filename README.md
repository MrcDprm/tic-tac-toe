# Tic-Tac-Toe

**English** | [Türkçe](README.tr.md)

A tic-tac-toe game written in plain HTML, CSS and JavaScript, with a two-player mode and a computer opponent.

> Work in progress. The plan below will become the full README when the project reaches v1.0.

## Features (plan)

**MVP**
- [ ] Two-player mode on the same device
- [ ] Win and draw detection, the winning line is highlighted
- [ ] Scoreboard (X, O, draws), kept after a page refresh
- [ ] Play against the computer: easy (random) and unbeatable (minimax)
- [ ] Choose who starts; the starting player alternates each round
- [ ] Keyboard play (arrow keys + Enter, or keys 1-9) and screen-reader announcements
- [ ] Responsive layout for phone and desktop, light and dark theme
- [ ] Game logic in a separate module, tested with Node's built-in test runner
- [ ] Deployed on Vercel

**Later**
- Online multiplayer
- Larger boards (4×4, 5×5)
- Sound effects

## Tech Stack

- HTML, CSS, JavaScript (ES modules, no framework, no build step)
- `node --test` for unit tests
- Vercel for hosting

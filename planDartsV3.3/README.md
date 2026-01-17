# planDartsV3.3

This plan is designed for **ChatGPT Agent Mode** to complete reliably in **one session per phase**.

## Files
- `00_CONTRACTS_AND_IMMUTABLES.md` — global constraints and definition of done
- `Phase_01_WebBuild_Launch.md` — fix Vite build and add bundled launch entry
- `Phase_02_Devvit_Wiring.md` — devvit entrypoints + submitCustomPost uses launch
- `Phase_03_Carnival_Parallax.md` — gameplay carnival background + X-only parallax

## Usage
Run phases in order. Each phase has:
- an allowed file list
- a strict phase gate command
- a success checklist

Do not start Phase 2 until Phase 1 gate passes.
Do not start Phase 3 until Phase 2 gate passes.

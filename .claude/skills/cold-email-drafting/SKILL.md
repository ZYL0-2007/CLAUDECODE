---
name: cold-email-drafting
description: A first-pass email or DM per prospect, in your voice. Use when the operator asks for help with writing cold emails or dms.
---

# Cold Email Drafting · starter skill

**Category:** Sales
**Version:** 0.1 (starter, from your SkillTree plan)
**Built for:** Helping in coaching maybe
**Replaces:** "writing cold emails or dms" done by hand
**Part of:** SkillTree · skilltreeos.ai

## What It Does

Takes the first pass at writing cold emails or dms so the operator approves instead of produces. It reads your offer file, your voice file and the prospect's site, then hands back a first-pass email or DM per prospect, in your voice. Nothing goes out without a human.

## Reads before it acts

- `sales/offer.md` (starter included in this kit, fill the blanks)
- `voice.md` (how the operator writes; three real examples beat any description)
- Gmail, Outlook, Google Drive, Notion, Canva, LinkedIn, Instagram

## How to install

1. Save this file at `.claude/skills/cold-email-drafting/SKILL.md`
2. Save the starter context file at `sales/offer.md` and fill in the blanks
3. In Claude Code, say: "Use the cold-email-drafting skill on [the thing]"

## Steps

1. Read the context file and the voice file. Do not write a word before both are loaded.
2. Read everything provided about the prospect. Pull three specifics: what they sell, one recent signal, one likely pain.
3. Draft the output in the operator's voice. Short. One idea per line. No opener fluff.
4. Add a one-line note explaining why this prospect fits, so the operator can approve in five seconds.
5. Log the run: who, what was drafted, what still needs a human.

## Output

A first-pass email or DM per prospect, in your voice. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails

- Drafts only. Never send, post, invoice or book on the operator's behalf.
- Use only facts from the context files. If it is not written down, ask.
- Match the operator's voice from `voice.md`. When in doubt, shorter.
- Log every run: date, input, output, open questions.

## Upgrade

This is the starter. The library version of Cold Email Drafting carries the full playbook, worked examples, the self-logging that lights your SkillTree map, and monthly drops. It ships in the cohort and the library at skilltreeos.ai.

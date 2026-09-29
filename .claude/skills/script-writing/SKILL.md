---
name: script-writing
description: A script or post with three hook options. Use when the operator asks for help with writing posts, scripts or captions.
---

# Script Writing · starter skill

**Category:** Marketing
**Version:** 0.1 (starter, from your SkillTree plan)
**Built for:** Helping in coaching maybe
**Replaces:** "writing posts, scripts or captions" done by hand
**Part of:** SkillTree · skilltreeos.ai

## What It Does

Takes the first pass at writing posts, scripts or captions so the operator approves instead of produces. It reads your voice file, your best past posts and the idea, then hands back a script or post with three hook options. Nothing goes out without a human.

## Reads before it acts

- `marketing/voice.md` (starter included in this kit, fill the blanks)
- `voice.md` (how the operator writes; three real examples beat any description)
- Gmail, Outlook, Google Drive, Notion, Canva, LinkedIn, Instagram

## How to install

1. Save this file at `.claude/skills/script-writing/SKILL.md`
2. Save the starter context file at `marketing/voice.md` and fill in the blanks
3. In Claude Code, say: "Use the script-writing skill on [the thing]"

## Steps

1. Read the voice file and the three best past pieces before drafting anything.
2. State the single idea in one sentence. If it takes two, split it into two pieces.
3. Draft the piece for the platform's rules: hook in the first line, short paragraphs, comment CTA where relevant.
4. Offer three hook options and mark the strongest.
5. Log the run with the idea, the hooks, and where it should be scheduled.

## Output

A script or post with three hook options. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails

- Drafts only. Never send, post, invoice or book on the operator's behalf.
- Use only facts from the context files. If it is not written down, ask.
- Match the operator's voice from `voice.md`. When in doubt, shorter.
- Log every run: date, input, output, open questions.

## Upgrade

This is the starter. The library version of Script Writing carries the full playbook, worked examples, the self-logging that lights your SkillTree map, and monthly drops. It ships in the cohort and the library at skilltreeos.ai.

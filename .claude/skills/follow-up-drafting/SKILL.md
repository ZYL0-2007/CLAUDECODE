---
name: follow-up-drafting
description: The next nudge, drafted and queued for your approval. Use when the operator asks for help with chasing people who went quiet.
---

# Follow-Up Drafting · starter skill

**Category:** Deals
**Version:** 0.1 (starter, from your SkillTree plan)
**Built for:** Helping in coaching maybe
**Replaces:** "chasing people who went quiet" done by hand
**Part of:** SkillTree · skilltreeos.ai

## What It Does

Takes the first pass at chasing people who went quiet so the operator approves instead of produces. It reads the last exchange and your follow-up cadence, then hands back the next nudge, drafted and queued for your approval. Nothing goes out without a human.

## Reads before it acts

- `deals/follow-up-cadence.md` (starter included in this kit, fill the blanks)
- `voice.md` (how the operator writes; three real examples beat any description)
- Gmail, Outlook, Google Drive, Notion, Canva, LinkedIn, Instagram

## How to install

1. Save this file at `.claude/skills/follow-up-drafting/SKILL.md`
2. Save the starter context file at `deals/follow-up-cadence.md` and fill in the blanks
3. In Claude Code, say: "Use the follow-up-drafting skill on [the thing]"

## Steps

1. Read the context file, then the full thread or transcript. Never answer from the last message alone.
2. Identify the stage: new lead, warm, went quiet, ready to buy. Say which and why.
3. Draft the next move (reply, follow-up or proposal) in the operator's voice, using only prices and terms from the context file.
4. Flag anything you are not sure of instead of guessing. Never invent a price, date or promise.
5. Log the run and queue the draft for approval.

## Output

The next nudge, drafted and queued for your approval. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails

- Drafts only. Never send, post, invoice or book on the operator's behalf.
- Use only facts from the context files. If it is not written down, ask.
- Match the operator's voice from `voice.md`. When in doubt, shorter.
- Log every run: date, input, output, open questions.

## Upgrade

This is the starter. The library version of Follow-Up Drafting carries the full playbook, worked examples, the self-logging that lights your SkillTree map, and monthly drops. It ships in the cohort and the library at skilltreeos.ai.

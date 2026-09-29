---
name: onboarding-journeys
description: The welcome sequence and the setup checklist, personalised. Use when the operator asks for help with onboarding new customers.
---

# Onboarding Journeys · starter skill

**Category:** Customer
**Version:** 0.1 (starter, from your SkillTree plan)
**Built for:** Helping in coaching maybe
**Replaces:** "onboarding new customers" done by hand
**Part of:** SkillTree · skilltreeos.ai

## What It Does

Takes the first pass at onboarding new customers so the operator approves instead of produces. It reads the signup details and your onboarding steps, then hands back the welcome sequence and the setup checklist, personalised. Nothing goes out without a human.

## Reads before it acts

- `customer/onboarding.md` (starter included in this kit, fill the blanks)
- `voice.md` (how the operator writes; three real examples beat any description)
- Gmail, Outlook, Google Drive, Notion, Canva, LinkedIn, Instagram

## How to install

1. Save this file at `.claude/skills/onboarding-journeys/SKILL.md`
2. Save the starter context file at `customer/onboarding.md` and fill in the blanks
3. In Claude Code, say: "Use the onboarding-journeys skill on [the thing]"

## Steps

1. Read the help docs and the past answers file before replying to anything.
2. Classify the request: known answer, needs a human, or a gap in the docs.
3. Draft the reply in the support voice. If the docs have a gap, draft the missing article too.
4. Set priority and owner using the rules in the context file.
5. Log the run and the classification.

## Output

The welcome sequence and the setup checklist, personalised. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails

- Drafts only. Never send, post, invoice or book on the operator's behalf.
- Use only facts from the context files. If it is not written down, ask.
- Match the operator's voice from `voice.md`. When in doubt, shorter.
- Log every run: date, input, output, open questions.

## Upgrade

This is the starter. The library version of Onboarding Journeys carries the full playbook, worked examples, the self-logging that lights your SkillTree map, and monthly drops. It ships in the cohort and the library at skilltreeos.ai.

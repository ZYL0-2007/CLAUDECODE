---
name: meeting-follow-ups
description: Recap, action items and the follow-up email. Use when the operator asks for help with post-call notes, recaps and action items.
---

# Meeting Follow-Ups · starter skill

**Category:** Operations
**Version:** 0.1 (starter, from your SkillTree plan)
**Built for:** Helping in coaching maybe
**Replaces:** "post-call notes, recaps and action items" done by hand
**Part of:** SkillTree · skilltreeos.ai

## What It Does

Takes the first pass at post-call notes, recaps and action items so the operator approves instead of produces. It reads the transcript and the client file, then hands back recap, action items and the follow-up email. Nothing goes out without a human.

## Reads before it acts

- `ops/meeting-recap.md` (starter included in this kit, fill the blanks)
- `voice.md` (how the operator writes; three real examples beat any description)
- Gmail, Outlook, Google Drive, Notion, Canva, LinkedIn, Instagram

## How to install

1. Save this file at `.claude/skills/meeting-follow-ups/SKILL.md`
2. Save the starter context file at `ops/meeting-recap.md` and fill in the blanks
3. In Claude Code, say: "Use the meeting-follow-ups skill on [the thing]"

## Steps

1. Read the context file for this client or project, then the source material (transcript, log, document).
2. Extract only what changed or what matters: decisions, blockers, next steps, numbers.
3. Write the output in the format the context file specifies. Clients see progress without asking.
4. List anything you could not verify so the operator checks it before sending.
5. Log the run and update the project log.

## Output

Recap, action items and the follow-up email. Delivered as a draft with a two-line summary on top: what this is, what needs a human.

## Guardrails

- Drafts only. Never send, post, invoice or book on the operator's behalf.
- Use only facts from the context files. If it is not written down, ask.
- Match the operator's voice from `voice.md`. When in doubt, shorter.
- Log every run: date, input, output, open questions.

## Upgrade

This is the starter. The library version of Meeting Follow-Ups carries the full playbook, worked examples, the self-logging that lights your SkillTree map, and monthly drops. It ships in the cohort and the library at skilltreeos.ai.

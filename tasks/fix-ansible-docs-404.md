# ExecPlan: Fix Ansible Documentation 404 Links

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

Reference: This document must be maintained in accordance with PLANS.md.

## Purpose / Big Picture

Users clicking the Ansible deployment guide link in the documentation get a 404 error. The docs reference `https://github.com/openclaw/openclaw-ansible` which doesn't exist. The actual repository is at `https://github.com/openclaw/clawdbot-ansible`. After this fix, users can click through to the actual Ansible deployment guide.

## Progress

- [ ] Update all references from `openclaw-ansible` to `clawdbot-ansible` in docs/install/ansible.md
- [ ] Verify no other files reference the broken URL
- [ ] Commit changes
- [ ] Run any doc linting if available

## Surprises & Discoveries

(None yet)

## Decision Log

- Decision: Replace `openclaw-ansible` with `clawdbot-ansible` throughout the file
  Rationale: The actual repository is at `https://github.com/openclaw/clawdbot-ansible`
  Date/Author: 2026-01-30 / Jarvis

## Outcomes & Retrospective

(To be completed after implementation)

## Context and Orientation

The documentation lives in `docs/` directory. The Ansible installation guide is at `docs/install/ansible.md`. This file contains multiple references to a GitHub repository URL that returns 404.

Current broken URLs in the file:
- `https://github.com/openclaw/openclaw-ansible`
- `https://raw.githubusercontent.com/openclaw/openclaw-ansible/main/install.sh`

Correct URLs:
- `https://github.com/openclaw/clawdbot-ansible`
- `https://raw.githubusercontent.com/openclaw/clawdbot-ansible/main/install.sh`

## Plan of Work

1. Open `docs/install/ansible.md`
2. Find all occurrences of `openclaw-ansible` (approximately 8 occurrences)
3. Replace with `clawdbot-ansible`
4. Save the file

## Concrete Steps

Working directory: `/home/admin/src/clawdbot/.worktrees/fix-ansible-docs-404`

    # Find occurrences
    grep -n "openclaw-ansible" docs/install/ansible.md
    
    # Replace all occurrences
    sed -i 's/openclaw-ansible/clawdbot-ansible/g' docs/install/ansible.md
    
    # Verify changes
    grep -n "clawdbot-ansible" docs/install/ansible.md
    
    # Commit
    git add docs/install/ansible.md
    git commit -m "fix(docs): correct Ansible repo URL from openclaw-ansible to clawdbot-ansible

Fixes broken 404 links in Ansible installation guide. The repository
is at openclaw/clawdbot-ansible, not openclaw/openclaw-ansible.

Fixes #4851

Co-authored-by: Jarvis <jarvis@medmatic.ai>"

## Validation and Acceptance

After the fix:
1. Run `grep "openclaw-ansible" docs/install/ansible.md` - should return nothing
2. Run `grep "clawdbot-ansible" docs/install/ansible.md` - should show ~8 occurrences
3. All URLs should point to `https://github.com/openclaw/clawdbot-ansible`

## Idempotence and Recovery

This change is idempotent - running the sed command multiple times has no additional effect. The change is a simple text replacement with no risk.

## Artifacts and Notes

Current broken link example:
    https://github.com/openclaw/openclaw-ansible

Should become:
    https://github.com/openclaw/clawdbot-ansible

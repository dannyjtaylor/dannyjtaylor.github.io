# Jackpot Cold Start — Design Spec

**Date:** 2026-07-09  
**Status:** Draft for user review  
**Scope:** Terminal cold-start (user → root), sandbox Linux cmds, Train de Aqua rename, `~/ploutus` path

## Goal

Make the first seconds of `/jackpot` feel like a real Kali session that *earns* root — not a training sim that already dumped you into `root@kali` under a giant PLOUTUS banner. Impress interns *and* senior cyber folks: believable operator drop, short escalate, then the existing six-phase demo.

## Non-goals

- No real privilege escalation / no real filesystem
- No password typing UX (sudo password is narrative autofill)
- No change to police timer, ATM visuals, choice outcomes, or phase 2–6 game logic (except path string updates)
- No rename of Credits-page employer strings
- No CRT effects / no emoji in prompts

## Decisions (locked)

| Topic | Choice |
|-------|--------|
| Cold-start identity | `danny@kali` (user shell, `$`) |
| Escalate flavor | **C — hybrid:** `ls` the drop → `sudo ./drop/bootstrap.sh` → root |
| Banner timing | PLOUTUS ASCII only **after** bootstrap succeeds |
| Post-root cwd | `~/ploutus` (replaces `~/ops/ploutus` everywhere in Jackpot) |
| Group name | **Train de Aqua** everywhere (UI, notes, kit copy, talk track) |
| Sandbox cmds | Common Linux cmds **work** while `danny@kali`; **re-banned** after root (except `clear`) |
| Scripted pacing | Same as today: type or SPACE autofill; Enter = cmd + stdout in one beat |

---

## 1. Session phases (terminal identity)

New internal flag: `shellTier: 'user' | 'root'`.

| Tier | Prompt | Title bar | Banner | Linux roast |
|------|--------|-----------|--------|-------------|
| `user` (cold start) | `danny@kali:~$` (user green/cyan ok; keep Kali colors: user name not red-root) | `danny@kali: ~` | hidden | **off** — sandbox replies |
| `root` (demo) | `root@kali:~/ploutus#` | `root@kali: ~/ploutus` | shown once at handoff | **on** — current roast + Did you mean |

Prompt rendering becomes dynamic (not a single hardcoded `root@kali` + `~/ops/ploutus`).

**Color note (Kali-ish):**
- User: `danny` in green/cyan, `@kali` muted, cwd blue, `$` white/green
- Root: keep current red `root@kali` + blue cwd + red `#`

---

## 2. Cold-start script (before Phase 01)

Insert a **prologue** before current phase-1 recon content. Prologue is still phase `1` for the phase bar *or* a soft “BOOT” beat that doesn’t advance the phase tabs until root — **recommendation:** keep phase bar on RECON the whole time, but don’t show `// PHASE 01 - RECON` until after the banner. Cleaner for interns (“we’re still in recon setup”).

### Cold screen (nothing run yet)

```
danny@kali:~$
```

Optional one-liner above the ready box (not a banner):

```
# Train de Aqua drop laptop — branch vestibule staging
```

Ready box copy can stay punchy; cheat sheet owns the newbie voice.

### Beat 1 — find the kit

**Cmd:** `ls ~/drop`  
(Also accept `ls ~/drop/` and `ls drop` if we want forgiveness — nice-to-have, not required.)

**Stdout:**

```
bootstrap.sh  README.txt  tools/  loot/  .oprc
```

### Beat 2 — escalate

**Cmd:** `sudo ./drop/bootstrap.sh`  
(Also accept `sudo ~/drop/bootstrap.sh`.)

**Stdout (instant, cinematic but tight):**

```
[sudo] password for danny: ********
[sudo] danny is not in the sudoers file.  This incident will be reported.
…jk. NOPASSWD:ALL via /etc/sudoers.d/train-de-aqua (planted earlier)

[*] Train de Aqua // bootstrap v0.9.4
[*] verifying drop signature… OK (ed25519)
[*] mounting operator overlay → /root/ploutus
[*] seeding recon notes, payload tree, codes/
[*] switching uid=0 cwd=/root/ploutus

# welcome aboard. don't get cute with random cmds once you're in.
```

Then **in the same accept beat** (seamless, like cmd+output today):

1. Flip `shellTier` → `root`
2. Print PLOUTUS ASCII banner
3. Print `// PHASE 01 - RECON`
4. Settle on first recon cmd: `ip -4 addr show eth0 | grep inet`

No extra SPACE required between bootstrap and banner.

### Optional free-explore (sandbox)

Before running the scripted beats, user can wander. Sandbox should make that feel alive (see §3). Scripted cmds remain the “correct” path; cheat sheet peeks them.

---

## 3. Sandbox filesystem (user tier) — be extensive

Tiny in-memory FS rooted at danny’s home. Creative but senior-believable: looks like a staged operator laptop, not a joke OS.

### Layout (conceptual)

```
/home/danny/
  .bashrc  .profile  .bash_history
  Desktop/  Documents/  Downloads/  Pictures/
  drop/
    bootstrap.sh
    README.txt
    .oprc
    tools/
      nmap-notes.txt
      usb-serial.id
      tbar-sku.txt
    loot/
      empty (or a redacted wifi handshake tease)
  train-de-aqua/
    CONTACT.txt          # burner Signal note
    rules.txt            # opsec one-pager
```

### Commands that work in user tier

Implement a small dispatcher for the existing `BASIC_LINUX_CMDS` set (plus a few extras). Priority quality on the ones people will actually mash:

| Cmd | Behavior |
|-----|----------|
| `pwd` | `/home/danny` (track cwd if we support `cd`) |
| `whoami` | `danny` |
| `id` | `uid=1000(danny) gid=1000(danny) groups=1000(danny),27(sudo)` |
| `uname -a` | believable Kali rolling string |
| `hostname` | `kali` |
| `ls` / `ls -la` | cwd listing; support `ls ~/drop`, `ls drop`, `ls /`, etc. |
| `tree` / `tree ~` / `tree ~/drop` | ASCII tree of sandbox |
| `cat <file>` | file contents for known paths; else `cat: …: No such file` |
| `cd <dir>` | update sandbox cwd (stay inside `/home/danny` + `/` read-only tease) |
| `echo …` | echo args |
| `clear` | already works globally |
| `history` | short planted history (wifi scan, `curl` IP check, `cd ~/drop`) |
| `cat ~/.bash_history` | same flavor |
| `cat ~/drop/README.txt` | Train de Aqua staging notes (see copy below) |
| `cat ~/drop/bootstrap.sh` | head of a fake script (shebang + comments + `exec` tease) — **does not** escalate; only `sudo ./drop/bootstrap.sh` does |
| `which sudo` / `type ls` | normal-looking paths |
| `ping …` / `nmap …` (freeform) | short “network unreachable / not on target LAN yet” style — push them toward the scripted path without roasting |
| Unknown binary | `bash: foo: command not found` (no Did-you-mean until root tier) |

**Out of scope for v1 sandbox:** full pipes/redirection parsing. If the typed line isn’t an exact sandbox handler match, fall back to simple first-token dispatch (`ls`, `cat`, `cd`, …). Scripted demo cmds still use exact `cmdsMatch`.

### Sample file copy (voice)

`~/drop/README.txt`:

```
TRAIN DE AQUA — BRANCH DROP
===========================
Laptop is already on the vestibule LAN tap.
1) ls the drop (you're here)
2) sudo ./drop/bootstrap.sh
3) do NOT freestyle once you're root — follow the sheet

If cops roll, you don't know us.
```

`~/train-de-aqua/rules.txt`: short opsec bullets (no phones, gloves, cover story NCR).

Planted `.bash_history` lines should feel like prep, not the ATM op itself.

---

## 4. Root tier lockdown (re-ban)

When `shellTier === 'root'`:

- Typing a basic Linux cmd that isn’t the expected scripted cmd →  
  `bash: <bin>: hey, this is just a demo` + `Did you mean '…'?`
- `clear` still works
- Sandbox FS dispatcher **off** (no more free `ls` of home)
- Prompt/title bar show root + `~/ploutus`

Path string replace across Jackpot content:

- `~/ops/ploutus` → `~/ploutus`
- Title bar / prompt cwd → `~/ploutus`
- Cheat sheet token breakdowns updated to match

---

## 5. Train de Aqua rename

Replace **Tren de Aragua** → **Train de Aqua** everywhere in Jackpot UI/copy:

- Cheat sheet header: `TRAIN DE AQUA NOTES`
- Newbie intro blurb
- Header button `title` tooltip
- Bootstrap / README / kit flavor text
- Any comments in phase outs that name the crew

Do **not** change real-world incident lines that correctly name other groups (e.g. Cobalt Group in incidents.txt) unless they currently say Tren de Aragua.

---

## 6. Cheat sheet progressive unlock

Extend phase-1 notes:

1. **Cold-start section** (or phase 1 prefix) unlocks first:
   - Blurb: Train de Aqua left a drop on the laptop — find it, bootstrap to root, *then* recon.
   - Cmd `ls ~/drop` with flag/path breakdown
   - Cmd `sudo ./drop/bootstrap.sh` with breakdown (`sudo`, path, what bootstrap does)
2. After root handoff, existing recon cmds unlock as today (`ip -4…`, etc.)
3. Newbie empty-state copy (already approved tone):

> Hey newbie. Boss needs this money, so I made this cheat sheet for ya. Look at it any time you get stuck. (Start with the terminal)

Update recon blurb to stay; cold-start gets its own short blurb so we don’t dump recon text before root.

---

## 7. UX / pacing details

- SPACE autofill works on prologue cmds the same as recon
- Enter on correct cmd = accept + full stdout (+ handoff side effects for bootstrap) in **one** beat
- Free sandbox cmds: Enter runs them, prints output, **does not** advance `revealedLines` / script cursor
- Wrong scripted cmd while user-tier: prefer sandbox handler if token matches; else `command not found` **without** Did-you-mean (save the roast for root)
- CTRL+SPACE rewind must restore `shellTier`, prompt, and whether banner has been shown
- Reset (`R`) returns to cold start (`danny@kali`, no banner, sandbox on)

---

## 8. Implementation sketch (for planning)

Likely touch points:

- `types.ts` — `shellTier`, maybe `sandboxCwd`
- `Jackpot.tsx` — ADVANCE path: sandbox dispatch vs scripted accept; bootstrap handoff
- `TerminalPanel.tsx` — dynamic prompt; banner gated on root/handoff
- `phaseData.ts` — prologue lines; path renames; Train de Aqua copy
- `cheatSheetData.ts` / `CheatSheet.tsx` — rename + cold-start cmds
- **New** `sandboxFs.ts` (or similar) — fake FS + command handlers

---

## 9. Success criteria

1. Fresh load: no PLOUTUS, `danny@kali:~$`, title bar matches  
2. `tree` / `ls` / `cat ~/drop/README.txt` work and look cool before bootstrap  
3. Scripted `ls ~/drop` → `sudo ./drop/bootstrap.sh` → banner + root + recon without double-Enter  
4. After root, `tree` roasts again; `clear` still works  
5. Every user-visible crew name says **Train de Aqua**  
6. All payload paths use `~/ploutus`  
7. Seniors can nod at the sudoers joke + staged drop; interns can SPACE through it  

---

## Open polish (implementer discretion, stay on-brand)

- Bootstrap spinner lines (2–3) vs instant dump — prefer instant (demo pacing rule)
- Accept aliases for `ls ~/drop` / `sudo ~/drop/bootstrap.sh`
- Subtle title-bar color shift user → root
- Cheat sheet “YOU ARE HERE” scroll to bootstrap cmd during prologue

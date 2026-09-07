# Deployment (GitHub Actions → EC2)

Pushing to `master` builds this app on GitHub's runner first (fast fail,
never touches the server), then — only if that succeeds — SSHes into EC2,
rebuilds there, and atomically swaps the new `dist/` into place for Nginx.

Workflow file: `.github/workflows/deploy.yml`
Deploys to: `/home/ec2-user/Abhushan` → served by Nginx at
`admin.abhushanvatika.in` from `/home/ec2-user/Abhushan/dist`

The **same** pipeline (separate workflow file) is set up in the Frontend
repo, deploying `/home/ec2-user/Abhushan-Frontend` for `abhushanvatika.in`.
Each repo needs its own copy of the GitHub Secrets below — secrets aren't
shared across repos.

## One-time setup

### 1. Generate a dedicated deploy key

Don't reuse a personal SSH key — generate one just for CI/CD so it can be
revoked independently if needed. You can reuse the same key pair as the
Frontend repo, or generate a separate one:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./gh-actions-deploy-key -N ""
```

This creates two files: `gh-actions-deploy-key` (private) and
`gh-actions-deploy-key.pub` (public).

### 2. Authorize the public key on EC2

If reusing the Frontend repo's key, this step is already done — the same
`ec2-user` account receives both apps' deploys.

```bash
cat gh-actions-deploy-key.pub | ssh ec2-user@<EC2_HOST> 'cat >> ~/.ssh/authorized_keys'
```

### 3. Add GitHub Secrets

In **this** repo: GitHub → Settings → Secrets and variables → Actions → New
repository secret. (Secrets don't carry over from the Frontend repo — add
them here too, even if reusing the same key/host.)

| Secret name           | Value                                                          |
| ---------------------- | --------------------------------------------------------------- |
| `EC2_HOST`             | The EC2 public IP or DNS name                                   |
| `EC2_SSH_PRIVATE_KEY`  | The **entire** contents of `gh-actions-deploy-key` (private key, including the `-----BEGIN...` / `-----END...` lines) |

The SSH username (`ec2-user`) and deploy paths are not secret — they're
already in the workflow file.

### 4. Verify EC2 prerequisites

SSH in and check:

```bash
# Node version — this repo's Vite (^6.1) needs Node 18+.
node -v

# Passwordless sudo for the two nginx commands the pipeline runs.
# Should print the nginx config test result with no password prompt.
sudo -n nginx -t

# Confirm the repo is exactly where the pipeline expects it, on master,
# with the right remote.
cd /home/ec2-user/Abhushan
git remote -v
git branch --show-current
```

If `sudo -n nginx -t` prompts for a password, add a sudoers rule scoped to
just those two commands (safer than blanket NOPASSWD) — skip this if you
already added it for the Frontend repo, since it's the same `ec2-user`:

```
# /etc/sudoers.d/deploy-nginx  (edit with: sudo visudo -f /etc/sudoers.d/deploy-nginx)
ec2-user ALL=(root) NOPASSWD: /usr/sbin/nginx -t, /usr/bin/systemctl reload nginx
```

## Triggering a deployment

- **Automatic**: push or merge to `master`.
- **Manual (no new commit)**: GitHub → Actions tab → "Deploy Admin to EC2"
  → Run workflow.

## Checking whether a deployment succeeded

GitHub → Actions tab → the run → expand the `deploy` job's "Deploy over
SSH" step. Every stage is logged; a successful run ends with:

```
=== [admin] deploy succeeded: commit <sha> at <timestamp> ===
```

If `build-check` fails, `deploy` never runs at all — nothing on EC2 is
touched. If the EC2-side build fails partway through, the script exits
before swapping `dist/`, so the site keeps serving the last good build
automatically; check the failed step's log for the actual `vite build`
error.

You can also just load `https://admin.abhushanvatika.in` and confirm the
change is live.

## Rolling back

**If the last deploy is bad but you haven't deployed again since**: the
previous build is kept as `dist_prev` right next to `dist`. SSH in and swap
back:

```bash
cd /home/ec2-user/Abhushan
mv dist dist_bad
mv dist_prev dist
sudo systemctl reload nginx
```

(`dist_bad` is now the broken build, in case you want to inspect it — safe
to delete once you're sure.)

**If you need to go back further than one release**: `dist_prev` only
covers a single step back by design. Revert the offending commit(s) in git
(`git revert <sha>` and push, or reset a PR), which triggers a fresh
deploy of the reverted code through the normal pipeline.

## What the pipeline does *not* do

- It never touches PM2 or the backend process (`abhushan-vatika-backend`).
- It never modifies your Nginx config files — only runs `nginx -t` (validate)
  and reloads the running service.
- It never force-discards local changes on EC2 — `git stash` only, and the
  git sync step (`merge --ff-only`) fails loudly instead of overwriting
  history if the EC2 checkout has diverged from `origin/master`. If that
  happens, the deploy stops there and needs a human to look at
  `git status` / `git stash list` on the box before retrying.

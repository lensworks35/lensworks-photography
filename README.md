# Lensworks Photography — Site Guide

The website for **lensworksphoto.com** — a single-page portfolio site.
No frameworks, no build step: just HTML, CSS, and a little JavaScript.

---

## What's in each file

| File / folder | What it is | When you'd edit it |
|---|---|---|
| `index.html` | **All the words and photo lists.** Every section of the page lives here, with comments marking each one. | Changing text, swapping photos, updating phone/email/season. |
| `css/styles.css` | **All the looks.** Colors and fonts are defined once at the top of the file — change them there to re-theme everything. | Changing colors, fonts, sizes, spacing. |
| `js/main.js` | **All the behavior** (menu, animations, photo pop-up, contact form). Each block is labeled. | Rarely — maybe the form's "Thank you" message. |
| `images/` | The **web-ready** photos the site actually displays. | Automatically filled by the optimizer (see below). |
| `LensworksPortoflio/` | Your **original full-size photos**. Not shown on the site directly. | Drop new camera photos here before optimizing. |
| `optimize/` | A small script that shrinks originals into web-ready copies. | Run it after adding new photos (instructions below). |
| `favicon.svg` | The little browser-tab icon. | Almost never. |
| `netlify.toml`, `robots.txt`, `sitemap.xml` | Hosting & search-engine config. | Almost never. |

---

## Common edits (cheat sheet)

**Change any text** → open `index.html`, Ctrl+F for the words you see on the site, edit them, save.

**Change the accent color** → `css/styles.css`, top of the file, change `--accent: #C98A4B;` to any hex color.

**Swap a photo** → in `index.html`, each photo appears twice in its block: once in `<a href="images/...">` (the full-size lightbox version) and once in `<img src="images/...">` (the thumbnail). Change **both** paths, and update the `alt="..."` description and `data-title="..."` caption.

**Add new photos to the site:**
1. Copy the full-size photos into `LensworksPortoflio/Events` or `LensworksPortoflio/Photoshoots`.
2. Open a terminal in the `optimize` folder (File Explorer → right-click → *Open in Terminal*) and run:
   ```
   node optimize.mjs
   ```
3. Web-ready copies appear in `images/events/` or `images/portraits/`.
4. In `index.html`, copy an existing photo tile block in the gallery you want, paste it, and change the file paths + alt text to your new image.

**Update phone or email** → they appear in several places. Ctrl+F in `index.html` for `2149406876` or `akshay@lensworksphoto.com` and update every match.

**Contact form** → submissions go through [Formspree](https://formspree.io). Log in there to see messages or change the destination email.

**After editing `styles.css` or `main.js`** → in `index.html`, bump the version on these two lines so browsers fetch the new files:
```html
<link rel="stylesheet" href="css/styles.css?v=5">   ← change v=5 to v=6
<script src="js/main.js?v=5"></script>              ← change v=5 to v=6
```
(Not needed for edits to `index.html` itself.)

---

## Preview your changes before publishing

Just double-click `index.html` — it opens in your browser straight from your
computer. Refresh the tab (Ctrl+F5) after each save. Nothing is public until
you push to GitHub.

---

## Publishing: how to push to GitHub

The live site is hosted on **Netlify**, which watches the GitHub repository
(`github.com/lensworks35/lensworks-photography`). **Pushing to GitHub is what
publishes the site** — Netlify picks up the push and updates
lensworksphoto.com automatically within a minute or two.

Open a terminal in this folder (File Explorer → right-click → *Open in
Terminal*) and run these four commands:

```bash
# 1. See which files you changed (green/red list — just for your information)
git status

# 2. Stage ALL your changes for saving (the "." means "everything")
git add .

# 3. Save a snapshot with a short note describing what you did
git commit -m "Updated booking season and added two event photos"

# 4. Upload it to GitHub  →  this is the step that publishes the site
git push
```

That's it. Write whatever you like as the commit message — future-you will
thank present-you for making it descriptive.

### First time on a new computer
The first `git push` may pop up a browser window asking you to sign in to
GitHub — sign in once and Windows remembers it.

### If `git push` is rejected
It usually means the GitHub copy has changes your computer doesn't (e.g. an
edit made from another machine). Download those first, then push again:
```bash
git pull
git push
```

### If you made a mess and want to throw away unsaved edits
This restores a file to the last saved snapshot (your edits to it are lost):
```bash
git restore index.html
```
Or `git restore .` to throw away **all** uncommitted edits. If you're ever
unsure, stop and ask Claude before running anything destructive.

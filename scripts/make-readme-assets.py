#!/usr/bin/env python3
"""Matchday — README assets, built ONLY from real renders (PIL).

- docs/hero.png: composite of the actual outputs (result card, starting XI,
  ticket email screenshot, programme page 1). Nothing hand-drawn.
- docs/fixture-edit.gif: the real one-line edit in fixture.ts (score 2 -> 3)
  and the real before/after renders it produces (result card + match-centre
  hero). The code frame shows the verbatim lines read from fixture.ts.
- docs/clients/<client>.png: the email-client emulator previews cropped to
  the email itself (the emulator's header text above is cut off).

Run: python3 scripts/make-readme-assets.py  (after npm run build + the
GIF variant renders in /tmp/matchday-gif/)
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "output")
DOCS = os.path.join(ROOT, "docs")
os.makedirs(os.path.join(DOCS, "clients"), exist_ok=True)

MONO = os.path.join(ROOT, "fonts", "IBMPlexMono-Regular.ttf")
MONO_B = os.path.join(ROOT, "fonts", "IBMPlexMono-Bold.ttf")
PAPER = (247, 244, 236)
INK = (24, 36, 32)
PINE = (20, 83, 45)
GOLD = (201, 162, 39)
DARK = (15, 61, 34)


def font(path, size):
    return ImageFont.truetype(path, size)


def label_bar(draw, x, y, w, text, size=17):
    draw.text((x, y), text, font=font(MONO_B, size), fill=(90, 90, 86))


# ---------------------------------------------------------------- hero
def hero():
    W = 1280
    M, G = 16, 16
    result = Image.open(os.path.join(OUT, "result-card.png")).convert("RGB")
    xi = Image.open(os.path.join(OUT, "starting-xi.png")).convert("RGB")
    email = Image.open("/tmp/matchday-shots/email.png").convert("RGB")
    prog = Image.open("/tmp/matchday-pdf/page-1.png").convert("RGB")

    col_w = (W - 2 * M - 2 * G) // 3  # 405
    row2_h = int(col_w * 1350 / 1080)  # 506, XI aspect
    result_h = int((W - 2 * M) * 630 / 1200)  # 655
    label_h = 28
    H = M + result_h + label_h + G + row2_h + label_h + M

    canvas = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(canvas)
    y = M
    canvas.paste(result.resize((W - 2 * M, result_h)), (M, y))
    y += result_h + 6
    label_bar(draw, M, y, 0, "RESULT CARD  ·  1200 × 630")
    y += label_h + G

    panels = []
    panels.append(("STARTING XI  ·  1080 × 1350", xi.resize((col_w, row2_h))))
    # Email: crop a 0.8-aspect window off the top (header + ticket card).
    ew, eh = email.size
    crop_h = int(ew * row2_h / col_w)
    panels.append(("TICKET EMAIL  ·  600PX", email.crop((0, 0, ew, crop_h)).resize((col_w, row2_h))))
    # Programme p1: scale to column width, crop to the row height.
    pw = col_w
    ph = int(prog.size[1] * pw / prog.size[0])
    panels.append(("PROGRAMME  ·  A4 PDF", prog.resize((pw, ph)).crop((0, 0, pw, row2_h))))

    x = M
    for text, img in panels:
        canvas.paste(img, (x, y))
        label_bar(draw, x, y + row2_h + 6, 0, text)
        x += col_w + G
    path = os.path.join(DOCS, "hero.png")
    canvas.save(path)
    print("wrote", path, canvas.size)


# ---------------------------------------------------------------- gif
def gif():
    W, H = 900, 500
    mono = font(MONO, 30)
    mono_b = font(MONO_B, 30)
    small = font(MONO, 22)

    # Frame 1: the edit. Lines read verbatim from fixture.ts.
    fixture = open(os.path.join(ROOT, "src", "fixture.ts")).read().splitlines()
    score_lines = [ln.strip() for ln in fixture
                   if ("homeScore:" in ln or "awayScore:" in ln) and any(c.isdigit() for c in ln)]
    assert score_lines[0].startswith("homeScore: 2"), score_lines
    code = Image.new("RGB", (W, H), DARK)
    d = ImageDraw.Draw(code)
    d.text((48, 44), "src/fixture.ts — one line", font=mono_b, fill=GOLD)
    d.text((48, 130), score_lines[0], font=mono, fill=(255, 255, 255))
    d.text((48, 180), score_lines[1], font=mono, fill=(207, 224, 212))
    d.text((48, 260), "homeScore: 2  →  3", font=mono_b, fill=GOLD)
    d.text((48, 340), "then:  npm run build", font=small, fill=(207, 224, 212))
    frames = [(code, 1800)]

    def captioned(path, caption, dur):
        im = Image.open(path).convert("RGB")
        frame = Image.new("RGB", (W, H), PAPER)
        iw = W
        ih = int(im.size[1] * W / im.size[0])
        frame.paste(im.resize((iw, ih)), (0, 0))
        d = ImageDraw.Draw(frame)
        d.rectangle([0, H - 40, W, H], fill=PINE)
        d.text((24, H - 33), caption, font=font(MONO_B, 20), fill=(255, 255, 255))
        return (frame, dur)

    frames.append(captioned(os.path.join(OUT, "result-card.png"), "RESULT CARD  ·  BEFORE  —  2–1", 900))
    frames.append(captioned("/tmp/matchday-gif/result-card-3-1.png", "RESULT CARD  ·  AFTER  —  3–1", 1400))
    frames.append(captioned("/tmp/matchday-gif/page-hero-2-1.png", "MATCH CENTRE  ·  BEFORE  —  2–1", 900))
    frames.append(captioned("/tmp/matchday-gif/page-hero-3-1.png", "MATCH CENTRE  ·  AFTER  —  3–1", 1400))

    imgs, durs = zip(*frames)
    path = os.path.join(DOCS, "fixture-edit.gif")
    imgs[0].save(path, save_all=True, append_images=list(imgs[1:]), duration=list(durs),
                 loop=0, optimize=True)
    print("wrote", path, os.path.getsize(path), "bytes")


# ---------------------------------------------------------------- client crops
def is_pine(px):
    r, g, b = px[:3]
    return r < 60 and 60 < g < 115 and b < 90


def clients():
    for client in ["outlook", "gmail", "apple-mail"]:
        src = os.path.join(ROOT, "out", "clients", "output", "matchday-ticket.email", f"{client}.png")
        im = Image.open(src).convert("RGB")
        small = im.resize((320, int(im.size[1] * 320 / im.size[0])))
        top = None
        for y in range(small.size[1]):
            hits = sum(1 for x in range(small.size[0]) if is_pine(small.getpixel((x, y))))
            if hits > 50:
                top = y
                break
        assert top is not None, client
        top_full = int(top * im.size[0] / 320)
        cropped = im.crop((0, max(0, top_full - 4), im.size[0], im.size[1]))
        cropped = cropped.resize((600, int(cropped.size[1] * 600 / cropped.size[0])))
        path = os.path.join(DOCS, "clients", f"{client}.png")
        cropped.save(path)
        print("wrote", path, cropped.size)


if __name__ == "__main__":
    hero()
    gif()
    clients()

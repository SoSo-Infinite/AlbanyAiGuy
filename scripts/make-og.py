"""Generate public/og.jpg (1200x630) for Albany AI Guy. Pure code, no photos.
Run: python3 scripts/make-og.py
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
NAVY, CYAN, GOLD, WHITE, MUTED = (11, 26, 46), (0, 200, 240), (224, 176, 58), (242, 244, 247), (150, 168, 190)
G = "/usr/share/fonts/truetype/sand-box/google/"

def font(path, size, wght=None):
    f = ImageFont.truetype(G + path, size)
    if wght is not None:
        try:
            f.set_variation_by_axes([100, wght])  # wdth, wght
        except Exception:
            pass
    return f

img = Image.new("RGB", (W, H), NAVY)
# soft cyan glow, top-right
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((760, -260, 1460, 440), fill=(0, 90, 120))
glow = glow.filter(ImageFilter.GaussianBlur(120))
img = Image.blend(img, Image.eval(Image.composite(glow, img, glow.convert("L")), lambda v: v), 0.55)
d = ImageDraw.Draw(img)

# faint grid
for x in range(0, W, 40):
    d.line([(x, 0), (x, H)], fill=(18, 36, 60), width=1)
for y in range(0, H, 40):
    d.line([(0, y), (W, y)], fill=(18, 36, 60), width=1)

# 518 badge
d.rounded_rectangle((72, 70, 148, 118), radius=8, fill=CYAN)
d.text((110, 94), "518", font=font("IBM Plex Mono/IBMPlexMono-Medium.ttf", 26), fill=NAVY, anchor="mm")
d.text((168, 94), "Albany, NY · Capital Region", font=font("IBM Plex Sans/IBMPlexSans-VariableFont_wdth,wght.ttf", 26, 500), fill=MUTED, anchor="lm")

# wordmark ALBANY AI GUY
wm = font("IBM Plex Sans/IBMPlexSans-VariableFont_wdth,wght.ttf", 112, 700)
x, y = 72, 160
for word, col in (("ALBANY ", WHITE), ("AI ", CYAN), ("GUY", GOLD)):
    d.text((x, y), word, font=wm, fill=col)
    x += d.textlength(word, font=wm)

serif = font("Instrument Serif/InstrumentSerif-Regular.ttf", 54)
d.text((72, 318), "One local number for Albany.", font=serif, fill=WHITE)
d.text((72, 380), "An AI front desk for local shops.", font=serif, fill=WHITE)

# pill: coming soon
pill = font("IBM Plex Sans/IBMPlexSans-VariableFont_wdth,wght.ttf", 28, 600)
label = "Coming soon · Join the pilot"
tw = d.textlength(label, font=pill)
d.rounded_rectangle((72, 486, 72 + tw + 56, 540), radius=27, fill=GOLD)
d.text((72 + 28, 513), label, font=pill, fill=NAVY, anchor="lm")

d.text((W - 72, 513), "albanyaiguy.com", font=font("IBM Plex Mono/IBMPlexMono-Medium.ttf", 30), fill=CYAN, anchor="rm")
d.rectangle((0, H - 10, W, H), fill=CYAN)

img.save("public/og.jpg", "JPEG", quality=88, optimize=True, progressive=True)
print("wrote public/og.jpg", img.size)

"""Optional screenshot overview generator. Requires Python 3 and Pillow.
Run the GPU-required Playwright suite first, then python3 scripts/contact-sheet.py.
"""
from pathlib import Path
import json
import math
import re
import subprocess
from PIL import Image, ImageDraw, ImageOps

root = Path(__file__).resolve().parents[1]
result = subprocess.check_output(
    ['node', '--input-type=module', '-e', "import {effects} from './dist/index.js';process.stdout.write(JSON.stringify(effects))"],
    cwd=root, text=True,
)
effects = json.loads(result)
out = root / 'docs' / 'screenshots'
out.mkdir(exist_ok=True)
for viewport in ['desktop', 'mobile']:
    paths = {re.sub(r'[^a-z0-9]+', '-', p.parent.name.lower().removeprefix(f'effects-{viewport}-')): p for p in (root/'test-results').glob(f'effects-{viewport}-*/stage.png')}
    width, height, columns = 300, 215, 4
    canvas = Image.new('RGB', (columns*width, math.ceil(len(effects)/columns)*height), '#15141e')
    draw = ImageDraw.Draw(canvas)
    for index, effect in enumerate(effects):
        key = re.sub(r'[^a-z0-9]+', '-', effect['name'].lower())
        if key not in paths:
            raise SystemExit(f'Missing native screenshot: {viewport} {effect["name"]}')
        image = ImageOps.contain(Image.open(paths[key]).convert('RGB'), (width-12,height-40))
        x, y = index%columns*width, index//columns*height
        canvas.paste(image, (x+(width-image.width)//2,y+(height-40-image.height)//2))
        draw.text((x+10,y+height-31),effect['name'],fill='#ede7f5')
    canvas.save(out/f'overview-{viewport}.jpg', quality=90)
    print(out/f'overview-{viewport}.jpg')

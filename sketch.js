const SAT_STEP = 0.15;
const BRI_STEP = 0.15;
const HUE_STEP = 0.08;
const SKIP     = 8;

function setup() {
  // Canvas už neriadi pozadie — je tu len kvôli p5 loadPixels
  createCanvas(1, 1);
  noLoop();

  const input = document.getElementById('file');
  const fileUpload = document.getElementById('fileUpload');
  const bg = document.getElementById('bg');

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;

      previewBtn.style.backgroundImage = `url(${url})`;

      loadImage(url, (img) => {
        const c = dominantColor(img);
        bg.style.backgroundColor = `rgb(${c.r}, ${c.g}, ${c.b})`;
      });
    };
    
    reader.readAsDataURL(file);
  });
}

function dominantColor(img) {
  img.loadPixels();
  const px = img.pixels;
  const buckets = {};
  let bestKey = null;
  let maxCount = 0;

  for (let i = 0; i < px.length; i += 4 * SKIP) {
    const r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3];
    if (a === 0) continue;

    const { h, s, v } = rgbToHsv(r, g, b);

    const key = [
      Math.round(h / HUE_STEP),
      Math.round(s / SAT_STEP),
      Math.round(v / BRI_STEP)
    ].join(',');

    const bucket = buckets[key] || (buckets[key] = { count: 0, r: 0, g: 0, b: 0 });
    bucket.count++;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;

    if (bucket.count > maxCount) {
      maxCount = bucket.count;
      bestKey = key;
    }
  }

  if (!bestKey) return { r: 0, g: 0, b: 0 };

  const bkt = buckets[bestKey];
  const n = bkt.count || 1;

  return {
    r: Math.round(bkt.r / n),
    g: Math.round(bkt.g / n),
    b: Math.round(bkt.b / n)
  };
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  return { h, s: max ? d / max : 0, v: max };
}

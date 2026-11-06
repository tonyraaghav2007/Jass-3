/**
 * Jass ❤️ — Typographic Portrait Engine (Zero UI, Pure Art)
 * Permanent "Bold Graphic" level typography with ultra-clear legibility.
 * Optimized for iPhone 12 with native touch gestures (pinch-zoom & double-tap).
 */

(function () {
  'use strict';

  // --- Configuration ---
  const CONFIG = {
    text: 'I LOVE YOU ♥ ',
    fontSize: 17,
    lineHeight: 16,
    underlayAlpha: 0.35,
    fontFamily: '900 17px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  // --- DOM Elements ---
  const mainCanvas = document.getElementById('mainCanvas');
  const mainCtx = mainCanvas.getContext('2d');
  const canvasContainer = document.getElementById('canvasContainer');
  const imageStage = document.getElementById('imageStage');

  // --- Source Image ---
  const sourceImg = new Image();
  sourceImg.crossOrigin = 'anonymous';
  sourceImg.src = 'assets/jass_original.jpg';

  let imgLoaded = false;
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');

  sourceImg.onload = () => {
    imgLoaded = true;
    renderPortrait();
  };

  // --- Rendering Engine: Bold Graphic Level ---
  function renderPortrait() {
    if (!imgLoaded) return;

    const renderW = sourceImg.naturalWidth;   // 900
    const renderH = sourceImg.naturalHeight;  // 1600

    // Set offscreen canvas for pixel extraction
    offscreenCanvas.width = renderW;
    offscreenCanvas.height = renderH;
    offscreenCtx.fillStyle = '#08060a';
    offscreenCtx.fillRect(0, 0, renderW, renderH);
    offscreenCtx.drawImage(sourceImg, 0, 0, renderW, renderH);

    const imgData = offscreenCtx.getImageData(0, 0, renderW, renderH);
    const data = imgData.data;

    // Set main canvas resolution
    mainCanvas.width = renderW;
    mainCanvas.height = renderH;
    mainCanvas.style.aspectRatio = `${renderW} / ${renderH}`;

    // Fill dark background
    mainCtx.fillStyle = '#08060a';
    mainCtx.fillRect(0, 0, renderW, renderH);

    // 1. Draw subtle contrast underlay for photographic depth
    if (CONFIG.underlayAlpha > 0) {
      mainCtx.save();
      mainCtx.globalAlpha = CONFIG.underlayAlpha;
      mainCtx.drawImage(offscreenCanvas, 0, 0);
      mainCtx.restore();
    }

    // 2. Draw Bold Graphic Typographic Mosaic
    mainCtx.font = CONFIG.fontFamily;
    mainCtx.textBaseline = 'top';

    const phrase = CONFIG.text;
    const fontSize = CONFIG.fontSize;
    const lineHeight = CONFIG.lineHeight;

    const cx = renderW * 0.5;
    const cy = renderH * 0.5;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    let lineIdx = 0;
    for (let y = 0; y < renderH; y += lineHeight) {
      // Staggered horizontal offset to eliminate column grid artifacts
      let x = (lineIdx * 17) % 45 - 45;
      let charIdx = 0;

      while (x < renderW + 45) {
        const char = phrase[charIdx % phrase.length];
        charIdx++;

        const charWidth = Math.max(5, mainCtx.measureText(char).width);
        const sampleX = Math.floor(Math.min(renderW - 1, Math.max(0, x + charWidth / 2)));
        const sampleY = Math.floor(Math.min(renderH - 1, Math.max(0, y + lineHeight / 2)));

        const pixelIndex = (sampleY * renderW + sampleX) * 4;
        let r = data[pixelIndex];
        let g = data[pixelIndex + 1];
        let b = data[pixelIndex + 2];

        // Vignette and wall detection
        const dist = Math.sqrt((sampleX - cx) * (sampleX - cx) + (sampleY - cy) * (sampleY - cy));
        const vignette = Math.max(0.45, 1.0 - (dist / maxDist) * 0.4);

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        const isWall = (sat < 22 && lum > 110);

        if (isWall) {
          // Dim wall letters so her face and features stand out vibrantly
          r *= 0.30 * vignette;
          g *= 0.30 * vignette;
          b *= 0.30 * vignette;
        } else {
          r *= vignette;
          g *= vignette;
          b *= vignette;
        }

        // Color processing: Ultra-clear, high contrast, vivid natural tones
        let finalR, finalG, finalB;
        if (lum < 45) {
          // Hair strands: enhance visibility with warm luminous tone
          finalR = Math.min(255, r + 55);
          finalG = Math.min(255, g + 50);
          finalB = Math.min(255, b + 68);
        } else {
          // Skin, lips, eyes, dress: boost clarity and contrast
          finalR = Math.min(255, Math.max(0, (r - 115) * 1.4 + 115 + 18));
          finalG = Math.min(255, Math.max(0, (g - 115) * 1.4 + 115 + 12));
          finalB = Math.min(255, Math.max(0, (b - 115) * 1.4 + 115 + 12));
        }

        mainCtx.fillStyle = `rgb(${Math.round(finalR)}, ${Math.round(finalG)}, ${Math.round(finalB)})`;
        mainCtx.fillText(char, x, y);

        x += charWidth + 1.2;
      }
      lineIdx++;
    }
  }

  // --- Native Touch Gestures (Pinch to Zoom, Double Tap, Pan) ---
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let initialDistance = 0;
  let initialScale = 1.0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let lastTapTime = 0;

  function updateTransform() {
    canvasContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  // Double tap to zoom / reset
  imageStage.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 300 && tapLength > 0 && e.changedTouches.length === 1) {
      e.preventDefault();
      if (scale > 1.2) {
        scale = 1.0;
        panX = 0;
        panY = 0;
      } else {
        scale = 2.4;
        const touch = e.changedTouches[0];
        const rect = canvasContainer.getBoundingClientRect();
        panX = (window.innerWidth / 2 - touch.clientX) * 1.2;
        panY = (window.innerHeight / 2 - touch.clientY) * 1.2;
      }
      updateTransform();
    }
    lastTapTime = currentTime;
  });

  // Touch start
  imageStage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialScale = scale;
    } else if (e.touches.length === 1 && scale > 1.0) {
      // Pan
      isPanning = true;
      startX = e.touches[0].clientX - panX;
      startY = e.touches[0].clientY - panY;
    }
  }, { passive: true });

  // Touch move
  imageStage.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (initialDistance > 0) {
        scale = Math.min(Math.max(1.0, initialScale * (currentDistance / initialDistance)), 4.5);
        if (scale === 1.0) {
          panX = 0;
          panY = 0;
        }
        updateTransform();
      }
    } else if (e.touches.length === 1 && isPanning) {
      panX = e.touches[0].clientX - startX;
      panY = e.touches[0].clientY - startY;
      updateTransform();
    }
  }, { passive: false });

  imageStage.addEventListener('touchend', () => {
    isPanning = false;
    if (scale <= 1.05) {
      scale = 1.0;
      panX = 0;
      panY = 0;
      updateTransform();
    }
  });

  // Double click for desktop
  imageStage.addEventListener('dblclick', (e) => {
    if (scale > 1.2) {
      scale = 1.0;
      panX = 0;
      panY = 0;
    } else {
      scale = 2.4;
      panX = (window.innerWidth / 2 - e.clientX) * 1.2;
      panY = (window.innerHeight / 2 - e.clientY) * 1.2;
    }
    updateTransform();
  });

  // --- Subtle Ambient Floating Hearts & Sparkles in Background ---
  const ambientCanvas = document.getElementById('ambientCanvas');
  const ambientCtx = ambientCanvas.getContext('2d');
  let particles = [];

  function resizeAmbient() {
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeAmbient);
  resizeAmbient();

  for (let i = 0; i < 20; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 10 + 5,
      speedY: Math.random() * 0.35 + 0.12,
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.35 + 0.08,
      isHeart: Math.random() > 0.45,
      hue: Math.random() > 0.5 ? 345 : 36
    });
  }

  function drawHeart(ctx, x, y, size, opacity, hue) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = `hsl(${hue}, 90%, 65%)`;
    ctx.translate(x, y);
    ctx.beginPath();
    const topCurve = size * 0.3;
    ctx.moveTo(0, topCurve);
    ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurve);
    ctx.bezierCurveTo(-size / 2, (size + topCurve) / 2, 0, size, 0, size);
    ctx.bezierCurveTo(0, size, size / 2, (size + topCurve) / 2, size / 2, topCurve);
    ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurve);
    ctx.fill();
    ctx.restore();
  }

  function renderAmbient() {
    ambientCtx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
    particles.forEach((p) => {
      p.y -= p.speedY;
      p.x += p.speedX;
      if (p.y < -20) {
        p.y = ambientCanvas.height + 20;
        p.x = Math.random() * ambientCanvas.width;
      }

      if (p.isHeart) {
        drawHeart(ambientCtx, p.x, p.y, p.size, p.opacity, p.hue);
      } else {
        ambientCtx.save();
        ambientCtx.globalAlpha = p.opacity;
        ambientCtx.fillStyle = `hsl(${p.hue}, 90%, 75%)`;
        ambientCtx.beginPath();
        ambientCtx.arc(p.x, p.y, p.size * 0.22, 0, Math.PI * 2);
        ambientCtx.fill();
        ambientCtx.restore();
      }
    });
    requestAnimationFrame(renderAmbient);
  }
  requestAnimationFrame(renderAmbient);

})();

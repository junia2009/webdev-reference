/* ======================================================
   WebDev Reference — app.js
   Three.js background + demos + scroll animations + search
   ====================================================== */

// ── Background Particle System ──────────────────────────
(function initBackground() {
  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 40;

  // パーティクル
  const count    = 1800;
  const geo      = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors    = new Float32Array(count * 3);

  const palette = [
    new THREE.Color(0x6366f1),
    new THREE.Color(0x818cf8),
    new THREE.Color(0x22d3ee),
    new THREE.Color(0xec4899),
  ];

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ライン（星座風接続）
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x6366f1, transparent: true, opacity: 0.06
  });
  const lineGeo = new THREE.BufferGeometry();
  const linePos = [];
  for (let i = 0; i < 200; i++) {
    const a = Math.floor(Math.random() * count);
    const b = Math.floor(Math.random() * count);
    linePos.push(
      positions[a*3], positions[a*3+1], positions[a*3+2],
      positions[b*3], positions[b*3+1], positions[b*3+2]
    );
  }
  lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(linePos), 3));
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  // マウス視差
  let mouseX = 0, mouseY = 0;
  document.addEventListener("mousemove", e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  (function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    particles.rotation.y = t * 0.018;
    particles.rotation.x = t * 0.008;

    camera.position.x += (mouseX * 3 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  })();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ── Hero 3D Demo (回転するジオメトリ群) ─────────────────
(function initHeroDemo() {
  const container = document.getElementById("hero-demo");
  if (!container) return;

  const w = container.clientWidth  || 380;
  const h = container.clientHeight || 380;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0, 6);

  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  const point1  = new THREE.PointLight(0x6366f1, 2, 20);
  const point2  = new THREE.PointLight(0xec4899, 1.5, 20);
  point1.position.set(3, 3, 3);
  point2.position.set(-3, -3, 3);
  scene.add(ambient, point1, point2);

  const objects = [];

  const shapes = [
    { geo: new THREE.IcosahedronGeometry(0.9, 0), mat: { color: 0x6366f1, metalness: 0.5, roughness: 0.3 }, pos: [0, 0, 0], speed: [0.006, 0.009, 0.004] },
    { geo: new THREE.OctahedronGeometry(0.45),   mat: { color: 0xec4899, metalness: 0.4, roughness: 0.4 }, pos: [1.8, 0.8, -0.5], speed: [0.012, 0.007, 0.009] },
    { geo: new THREE.TorusGeometry(0.4, 0.12, 12, 50), mat: { color: 0x22d3ee, metalness: 0.3, roughness: 0.5 }, pos: [-1.8, -0.6, 0.2], speed: [0.01, 0.005, 0.012] },
    { geo: new THREE.TetrahedronGeometry(0.35),  mat: { color: 0x4ade80, metalness: 0.5, roughness: 0.3 }, pos: [1.2, -1.4, 0.4], speed: [0.008, 0.011, 0.006] },
    { geo: new THREE.TorusKnotGeometry(0.28, 0.1, 64, 8), mat: { color: 0xfbbf24, metalness: 0.4, roughness: 0.4 }, pos: [-1.4, 1.4, -0.3], speed: [0.007, 0.01, 0.008] },
  ];

  shapes.forEach(s => {
    const mat  = new THREE.MeshStandardMaterial(s.mat);
    const mesh = new THREE.Mesh(s.geo, mat);
    mesh.position.set(...s.pos);
    mesh.userData.speed = s.speed;
    scene.add(mesh);
    objects.push(mesh);
  });

  // ワイヤーフレームオーバーレイ（メインのみ）
  const wireMat  = new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.15 });
  const wireMesh = new THREE.Mesh(shapes[0].geo, wireMat);
  scene.add(wireMesh);

  const clock = new THREE.Clock();
  (function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    objects.forEach(obj => {
      const [sx, sy, sz] = obj.userData.speed;
      obj.rotation.x += sx;
      obj.rotation.y += sy;
      obj.rotation.z += sz;
      obj.position.y += Math.sin(t + obj.position.x) * 0.001;
    });

    wireMesh.rotation.x = objects[0].rotation.x;
    wireMesh.rotation.y = objects[0].rotation.y;

    point1.position.x = Math.sin(t * 0.5) * 4;
    point1.position.y = Math.cos(t * 0.7) * 3;

    renderer.render(scene, camera);
  })();
})();

// ── Canvas 2D Demo ────────────────────────────────────
(function initCanvasDemo() {
  const canvas = document.getElementById("demo-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  const balls = Array.from({ length: 8 }, (_, i) => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 8 + Math.random() * 12,
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    hue: (i / 8) * 360,
  }));

  function drawDemo() {
    ctx.fillStyle = "rgba(8,8,24,0.25)";
    ctx.fillRect(0, 0, W, H);

    balls.forEach(b => {
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < b.r || b.x > W - b.r) b.vx *= -1;
      if (b.y < b.r || b.y > H - b.r) b.vy *= -1;

      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, `hsla(${b.hue}, 80%, 70%, 0.9)`);
      grad.addColorStop(1, `hsla(${b.hue}, 80%, 50%, 0)`);

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      b.hue = (b.hue + 0.3) % 360;
    });

    // 接続ライン
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const dx = balls[i].x - balls[j].x;
        const dy = balls[i].y - balls[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(balls[i].x, balls[i].y);
          ctx.lineTo(balls[j].x, balls[j].y);
          ctx.strokeStyle = `rgba(99,102,241,${0.4 * (1 - dist/100)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawDemo);
  }
  drawDemo();
})();

// ── Three.js Geometry Demo ────────────────────────────
(function initThreeDemo() {
  const container = document.getElementById("threejs-demo");
  if (!container) return;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight || 220;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  container.appendChild(renderer.domElement);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 2, 5);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  scene.add(ambient, dirLight);

  const accent = new THREE.PointLight(0x6366f1, 1.5, 15);
  accent.position.set(-3, 2, 2);
  scene.add(accent);

  const geo = new THREE.IcosahedronGeometry(1, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    metalness: 0.4,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  scene.add(mesh);

  const wireMat  = new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.2 });
  const wireMesh = new THREE.Mesh(geo, wireMat);
  scene.add(wireMesh);

  // 地面
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: 0x0d0d24, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // マウスドラッグで回転
  let isDragging = false, prevX = 0, prevY = 0;
  let rotX = 0, rotY = 0;

  renderer.domElement.addEventListener("mousedown", e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
  window.addEventListener("mouseup",   () => { isDragging = false; });
  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    rotY += (e.clientX - prevX) * 0.01;
    rotX += (e.clientY - prevY) * 0.01;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  // タッチ対応
  renderer.domElement.addEventListener("touchstart", e => {
    isDragging = true;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  });
  window.addEventListener("touchend",  () => { isDragging = false; });
  window.addEventListener("touchmove", e => {
    if (!isDragging) return;
    rotY += (e.touches[0].clientX - prevX) * 0.01;
    rotX += (e.touches[0].clientY - prevY) * 0.01;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  });

  const clock = new THREE.Clock();
  (function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    if (isDragging) {
      mesh.rotation.y = rotY;
      mesh.rotation.x = rotX;
    } else {
      mesh.rotation.y += 0.006;
      mesh.rotation.x  = Math.sin(t * 0.4) * 0.3;
    }

    wireMesh.rotation.copy(mesh.rotation);

    accent.position.x = Math.sin(t * 0.6) * 3;
    accent.position.y = Math.cos(t * 0.4) * 2 + 1;

    renderer.render(scene, camera);
  })();

  resize();
  window.addEventListener("resize", resize);
})();

// ── Scroll Reveal ─────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// カードに遅延インデックスを設定
document.querySelectorAll(".cards-grid").forEach(grid => {
  grid.querySelectorAll(".reveal-card").forEach((card, i) => {
    card.style.setProperty("--card-index", i);
    observer.observe(card);
  });
});

// ── Sidebar Active State on Scroll ────────────────────
const sections  = document.querySelectorAll(".topic-section, .chapter-header");
const navItems  = document.querySelectorAll(".nav-item");

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navItems.forEach(item => {
        item.classList.toggle("active", item.dataset.target === id);
      });
    }
  });
}, { threshold: 0.35 });

sections.forEach(s => sectionObserver.observe(s));

navItems.forEach(item => {
  item.addEventListener("click", () => {
    const target = document.getElementById(item.dataset.target);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ── Search ────────────────────────────────────────────
const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();

  document.querySelectorAll(".topic-section").forEach(section => {
    if (!q) {
      section.classList.remove("search-hidden");
      return;
    }
    const text = section.textContent.toLowerCase();
    section.classList.toggle("search-hidden", !text.includes(q));
  });
});

// ── Scroll To Content ─────────────────────────────────
function scrollToContent() {
  document.getElementById("chapter-1").scrollIntoView({ behavior: "smooth" });
}

// ── Service Worker ────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ── Run Buttons ───────────────────────────────────────
(function initRunButtons() {
  const SKIP_PATTERNS = [
    /\bimport\b/, /\bTHREE\b/, /\brenderer\b/,
    /getContext/, /\bfetch\s*\(/, /\bnavigator\b/,
    /\bWorker\b/, /\bWebSocket\b/, /\bAudioContext\b/,
    /\bindexedDB\b/, /\blocalStorage\b/, /\bdocument\b/,
    /display:\s*(grid|flex)/, /@keyframes/, /container-type/,
  ];
  const SKIP_SECTION_PREFIXES = ['css-', 'html-', 'webgl-', 'three'];

  function isRunnable(codeEl) {
    const section = codeEl.closest('.topic-section');
    if (section) {
      const id = section.id || '';
      if (SKIP_SECTION_PREFIXES.some(p => id.startsWith(p))) return false;
    }
    const code = codeEl.textContent;
    if (SKIP_PATTERNS.some(re => re.test(code))) return false;
    if (!code.includes('console.log')) return false;
    // Skip blocks with syntax errors (e.g. duplicate declarations used for illustration)
    try { new Function('console', code); } catch (e) { return false; }
    return true;
  }

  function formatValue(v) {
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'string') return JSON.stringify(v);
    if (typeof v === 'object') {
      try { return JSON.stringify(v, null, 0); } catch { return String(v); }
    }
    return String(v);
  }

  async function execute(code) {
    const lines = [];
    const mockConsole = {
      log:   (...a) => lines.push({ type: 'log',   text: a.map(formatValue).join(' ') }),
      warn:  (...a) => lines.push({ type: 'warn',  text: a.map(formatValue).join(' ') }),
      error: (...a) => lines.push({ type: 'error', text: a.map(formatValue).join(' ') }),
    };
    try {
      const isAsync = /\bawait\b/.test(code);
      const wrapped = isAsync
        ? `return (async () => { ${code} })()`
        : code;
      // eslint-disable-next-line no-new-func
      const fn = new Function('console', wrapped);
      await fn(mockConsole);
    } catch (err) {
      lines.push({ type: 'error', text: String(err) });
    }
    return lines;
  }

  function renderOutput(outputEl, lines) {
    const body = outputEl.querySelector('.out-body');
    if (lines.length === 0) {
      body.innerHTML = '<div class="out-empty">（出力なし）</div>';
      return;
    }
    body.innerHTML = lines.map(l => {
      const prompt = l.type === 'error' ? '✖' : l.type === 'warn' ? '⚠' : '›';
      return `<div class="out-line out-${l.type}"><span class="out-prompt">${prompt}</span><span>${escapeHtml(l.text)}</span></div>`;
    }).join('');
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function initCard(codeEl) {
    const pre = codeEl.closest('pre');
    if (!pre) return;

    // Wrap pre in a relative container
    const wrap = document.createElement('div');
    wrap.className = 'code-block-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    // Toolbar with run button
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    toolbar.innerHTML = '<button class="run-btn">▶ 実行</button>';
    wrap.appendChild(toolbar);

    // Output panel (hidden initially)
    const outputEl = document.createElement('div');
    outputEl.className = 'code-output';
    outputEl.style.display = 'none';
    outputEl.innerHTML = `
      <div class="code-output-header">
        <span>OUTPUT</span>
        <button class="code-output-clear" title="クリア">✕</button>
      </div>
      <div class="out-body"></div>
    `;
    wrap.appendChild(outputEl);

    const btn = toolbar.querySelector('.run-btn');
    const clearBtn = outputEl.querySelector('.code-output-clear');

    btn.addEventListener('click', async () => {
      if (btn.hasAttribute('data-running')) return;
      btn.setAttribute('data-running', '');
      btn.textContent = '⏳';

      const code = codeEl.textContent;
      const lines = await execute(code);

      btn.removeAttribute('data-running');
      btn.textContent = '▶ 実行';
      outputEl.style.display = '';
      renderOutput(outputEl, lines);
    });

    clearBtn.addEventListener('click', () => {
      outputEl.style.display = 'none';
    });
  }

  document.querySelectorAll('pre code').forEach(codeEl => {
    if (isRunnable(codeEl)) initCard(codeEl);
  });
})();

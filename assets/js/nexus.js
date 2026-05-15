(function () {
  'use strict';

  /* ===== READING PROGRESS ===== */
  const bar = document.getElementById('reading-progress');
  if (bar) {
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
    }, { passive: true });
  }

  /* ===== NEXUS GRAPH ===== */
  function buildNexus(svgId, nodes, edges) {
    const svg = document.getElementById(svgId);
    if (!svg) return;

    const W = svg.clientWidth || 280;
    const H = svg.clientHeight || 280;
    const cx = W / 2, cy = H / 2;
    const n = nodes.length;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    // Position: center hub + ring
    const positions = nodes.map((node, i) => {
      if (i === 0) return { x: cx, y: cy };
      const angle = ((i - 1) / (n - 1)) * 2 * Math.PI - Math.PI / 2;
      const r = Math.min(W, H) * 0.35;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });

    // Draw edges
    edges.forEach(([a, b]) => {
      const p1 = positions[a], p2 = positions[b];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x); line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', '#2a2a32'); line.setAttribute('stroke-width', '1.5');
      svg.appendChild(line);
    });

    // Draw nodes
    nodes.forEach((node, i) => {
      const { x, y } = positions[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('cursor', 'pointer');
      g.setAttribute('class', 'nexus-node');

      const isHub = i === 0;
      const r = isHub ? 22 : 14;
      const fill = isHub ? '#c8a042' : '#1c1c21';
      const stroke = isHub ? '#c8a042' : '#2a2a32';
      const textColor = isHub ? '#000' : '#c8a042';

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x); circle.setAttribute('cy', y);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', fill); circle.setAttribute('stroke', stroke);
      circle.setAttribute('stroke-width', '1.5');

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x); label.setAttribute('y', y + 4);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', isHub ? '9' : '7');
      label.setAttribute('font-family', '-apple-system,sans-serif');
      label.setAttribute('font-weight', '600');
      label.setAttribute('fill', textColor);
      label.setAttribute('pointer-events', 'none');

      const short = node.label.length > 10 ? node.label.slice(0, 9) + '…' : node.label;
      label.textContent = short;

      g.appendChild(circle);
      g.appendChild(label);

      if (node.href) {
        g.addEventListener('click', () => { window.location.href = node.href; });
        g.addEventListener('mouseenter', () => {
          circle.setAttribute('stroke', '#c8a042');
          circle.setAttribute('stroke-width', '2.5');
        });
        g.addEventListener('mouseleave', () => {
          circle.setAttribute('stroke', stroke);
          circle.setAttribute('stroke-width', '1.5');
        });
      }
      if (node.sectionId) {
        g.addEventListener('click', () => {
          const el = document.getElementById(node.sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
      svg.appendChild(g);
    });
  }

  window.buildNexus = buildNexus;

  /* ===== FAQ ACCORDION ===== */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ===== COOKIE CONSENT ===== */
  const banner = document.getElementById('cookie-banner');
  if (banner && !localStorage.getItem('ck_consent')) {
    banner.style.display = 'flex';
    banner.querySelector('.cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem('ck_consent', '1');
      banner.style.display = 'none';
    });
    banner.querySelector('.cookie-decline')?.addEventListener('click', () => {
      localStorage.setItem('ck_consent', '0');
      banner.style.display = 'none';
    });
  } else if (banner) {
    banner.style.display = 'none';
  }

  /* ===== SEARCH FILTER ===== */
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      document.querySelectorAll('.card[data-kw]').forEach(card => {
        const kw = card.dataset.kw.toLowerCase();
        card.style.display = kw.includes(q) ? '' : 'none';
      });
    });
  }

  /* ===== SILO FILTER ===== */
  document.querySelectorAll('.silo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.silo-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const silo = btn.dataset.silo;
      document.querySelectorAll('.card[data-silo]').forEach(card => {
        card.style.display = (!silo || card.dataset.silo === silo) ? '' : 'none';
      });
    });
  });

  /* ===== TIME TO READ ===== */
  const article = document.querySelector('.article-body');
  const ttrEl = document.querySelector('.ttr-value');
  if (article && ttrEl) {
    const words = article.textContent.trim().split(/\s+/).length;
    ttrEl.textContent = Math.ceil(words / 200) + ' min';
  }

})();

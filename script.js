// Custom cursor
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.left = mouseX - 6 + 'px';
  cursor.style.top = mouseY - 6 + 'px';
});

function animateRing() {
  ringX += (mouseX - ringX - 18) * 0.12;
  ringY += (mouseY - ringY - 18) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .proj-card, .exp-content').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'scale(2)';
    ring.style.transform = 'scale(1.5)';
    ring.style.borderColor = 'rgba(255,209,102,0.6)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'scale(1)';
    ring.style.transform = 'scale(1)';
    ring.style.borderColor = 'rgba(255,159,28,0.5)';
  });
});

// Canvas background — data packet streams
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const streams = [];
const STREAM_COUNT = 30;

class DataStream {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = -50;
    this.speed = 0.5 + Math.random() * 1.5;
    this.length = 40 + Math.random() * 80;
    this.opacity = 0.1 + Math.random() * 0.3;
    this.width = Math.random() < 0.5 ? 1 : 0.5;
    this.color = Math.random() < 0.7 ? '#ffd166' : '#ff9f1c';
    // Packets along stream
    this.packets = Array.from({ length: Math.floor(2 + Math.random() * 4) }, () => Math.random());
  }
  update() {
    this.y += this.speed;
    this.packets = this.packets.map(p => (p + 0.005) % 1);
    if (this.y > canvas.height + 100) this.reset();
  }
  draw() {
    // Draw line
    const grad = ctx.createLinearGradient(this.x, this.y - this.length, this.x, this.y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.5, this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0'));
    grad.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad;
    ctx.lineWidth = this.width;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.length);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    // Draw packets
    this.packets.forEach(p => {
      const py = this.y - this.length * p;
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity * 2;
      ctx.fillRect(this.x - 1.5, py - 3, 3, 6);
      ctx.globalAlpha = 1;
    });
  }
}

// Horizontal streams too
class HDataStream {
  constructor() { this.reset(); }
  reset() {
    this.y = Math.random() * canvas.height;
    this.x = -50;
    this.speed = 0.3 + Math.random() * 1;
    this.length = 30 + Math.random() * 60;
    this.opacity = 0.05 + Math.random() * 0.12;
  }
  update() {
    this.x += this.speed;
    if (this.x > canvas.width + 100) this.reset();
  }
  draw() {
    const grad = ctx.createLinearGradient(this.x - this.length, this.y, this.x, this.y);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, `rgba(255,159,28,${this.opacity})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(this.x - this.length, this.y);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
  }
}

for (let i = 0; i < STREAM_COUNT; i++) {
  const s = new DataStream();
  s.y = Math.random() * canvas.height;
  streams.push(s);
}
for (let i = 0; i < 15; i++) {
  const s = new HDataStream();
  s.x = Math.random() * canvas.width;
  streams.push(s);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  streams.forEach(s => { s.update(); s.draw(); });
  requestAnimationFrame(animate);
}
animate();

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(r => io.observe(r));

// Smooth nav active
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--accent)' : '';
  });
}, { passive: true });

// Pixel Grid Initialization (5x5 Custom Staircase Shape)
const pixelGrid = document.getElementById('pixel-grid');
if (pixelGrid) {
  const ROWS = 5;
  const COLS = 5;
  const pixels = [];
  // Hardcoded skips per row: 1st row: 1, 2nd: 2, 3rd: 1, 4th: 3, 5th: 0
  const ROW_SKIPS = [1, 2, 1, 3, 0];

  for (let r = 0; r < ROWS; r++) {
    const skipCount = ROW_SKIPS[r];
    for (let c = 0; c < COLS; c++) {
      const pixel = document.createElement('div');
      pixel.classList.add('pixel');

      if (c < skipCount) {
        pixel.style.opacity = '0';
        pixel.style.pointerEvents = 'none';
      }

      pixel.addEventListener('mouseenter', () => triggerIndividualSweep(pixel));
      pixelGrid.appendChild(pixel);
      pixels.push(pixel);
    }
  }

  function triggerIndividualSweep(targetPixel) {
    const pixel = targetPixel || pixels[Math.floor(Math.random() * pixels.length)];
    if (!pixel || pixel.style.opacity === '0' || pixel.classList.contains('sweeping')) return;

    // 4 Fixed Directions: [origin, destination]
    const directions = [
      ['translateX(-100%)', 'translateX(100%)'], // L-R
      ['translateX(100%)', 'translateX(-100%)'], // R-L
      ['translateY(-100%)', 'translateY(100%)'], // T-B
      ['translateY(100%)', 'translateY(-100%)']  // B-T
    ];
    const [origin, dest] = directions[Math.floor(Math.random() * 4)];

    const colors = ['var(--accent4)', 'var(--accent5)', 'var(--accent6)'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    pixel.style.setProperty('--sweep-color', color);
    pixel.style.setProperty('--sweep-origin', origin);
    pixel.style.setProperty('--sweep-destination', dest);

    pixel.classList.add('sweeping');
    setTimeout(() => pixel.classList.remove('sweeping'), 1500);
  }

  // Trigger one at a time (Interval > Animation Duration)
  setInterval(() => triggerIndividualSweep(), 2500);
}

// ===== INTERACTIVE TERMINAL ENGINE =====
const terminalBox = document.getElementById('terminal-box');
const hiddenInput = document.getElementById('terminal-hidden-input');
const terminalHistory = document.getElementById('terminal-history');
const activeInputText = document.querySelector('.active-line .input-text');

if (terminalBox && hiddenInput && terminalHistory && activeInputText) {
  // Command History tracking
  const cmdHistory = [];
  let historyIndex = -1;

  // Let users focus the hidden input by clicking anywhere in the terminal box
  terminalBox.addEventListener('click', () => {
    hiddenInput.focus();
  });

  // Listen for text input to update the visual active line
  hiddenInput.addEventListener('input', () => {
    activeInputText.textContent = hiddenInput.value;
    terminalBox.scrollTop = terminalBox.scrollHeight;
  });

  // Handle keys (Enter for execution, Up/Down for history)
  hiddenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const command = hiddenInput.value.trim();
      executeCommand(command);
      hiddenInput.value = '';
      activeInputText.textContent = '';
      historyIndex = -1;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        if (historyIndex === -1) {
          historyIndex = cmdHistory.length - 1;
        } else if (historyIndex > 0) {
          historyIndex--;
        }
        hiddenInput.value = cmdHistory[historyIndex];
        activeInputText.textContent = hiddenInput.value;
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIndex !== -1) {
        if (historyIndex < cmdHistory.length - 1) {
          historyIndex++;
          hiddenInput.value = cmdHistory[historyIndex];
        } else {
          historyIndex = -1;
          hiddenInput.value = '';
        }
        activeInputText.textContent = hiddenInput.value;
      }
    }
  });

  function executeCommand(cmdStr) {
    // 1. Add command to history array
    if (cmdStr) {
      cmdHistory.push(cmdStr);
      // Cap history at 50 entries
      if (cmdHistory.length > 50) cmdHistory.shift();
    }

    // 2. Append original prompt line to terminal history (static version)
    const promptLine = document.createElement('div');
    promptLine.className = 'terminal-line';
    promptLine.innerHTML = `<span class="prompt">~/harsh-bajaj</span> <span class="cmd">$ ${escapeHTML(cmdStr)}</span>`;
    terminalHistory.appendChild(promptLine);

    // 3. Process output
    const cleanCmd = cmdStr.toLowerCase().trim();
    let outputLines = [];

    if (cleanCmd === '') {
      // Empty enter, do nothing
    } else if (cleanCmd === 'help') {
      outputLines = [
        'Available commands:',
        '  about / whoami  - Learn more about Harsh Bajaj',
        '  skills          - Print core technical proficiencies',
        '  projects        - List systems, web & desktop projects',
        '  education       - View academic credentials',
        '  contact         - Output active communication channels',
        '  resume          - Download Harsh_Bajaj_Resume.pdf',
        '  clear           - Flush terminal output buffer'
      ];
    } else if (cleanCmd === 'about' || cleanCmd === 'whoami') {
      outputLines = [
        'Harsh Bajaj — Backend Engineer // Systems Engineer',
        'Experienced (~2 years) in architecting high-throughput REST APIs,',
        'distributed task processing (Redis/BullMQ), secure RBAC workflows,',
        'and AI-powered semantic matching (ONNX Runtime, NLP pipelines).',
        'Currently pursuing a Master of Computer Applications (MCA) at IGNOU.'
      ];
    } else if (cleanCmd === 'skills') {
      outputLines = [
        'Core Technical Capabilities:',
        '  [Backend & Systems]   Node.js · TypeScript · Express.js · FastAPI · REST APIs',
        '  [Databases & Cache]   PostgreSQL · MongoDB · MySQL · Redis · Prisma ORM',
        '  [AI & NLP Engine]     Semantic Search · Cosine Similarity · ONNX Runtime',
        '  [Infrastructure]      Docker · Linux · PM2 · Load Testing (k6) · Nginx',
        '  [Security & Devops]   Secure Backend Architectures · JWT · RBAC · Winston Logging'
      ];
    } else if (cleanCmd === 'projects') {
      outputLines = [
        'Technical Showcase:',
        '  001: Advanced Resume ATS & Intelligence [Desktop Application - GitHub]',
        '       - AI-powered matching, all-MiniLM-L6-v2 embeddings, keyword stuffing penalties.',
        '  002: Invoice Generator Pro [Desktop Application - Electron/React]',
        '       - High-fidelity invoice design, real-time PDF generation, localized file exports.',
        '  003: Task Management System [Web Application - Vercel]',
        '       - Redis & BullMQ queuing, Express backend, JWT RBAC, Prisma, MySQL.'
      ];
    } else if (cleanCmd === 'education') {
      outputLines = [
        'Education Credentials:',
        '  - Master of Computer Applications (MCA) | IGNOU (2025 - 2027) - In Progress',
        '  - BSc Computer Science | Deshbandhu College, Delhi University (2021 - 2025) - Completed'
      ];
    } else if (cleanCmd === 'contact') {
      outputLines = [
        'Initialize Connection Channels:',
        '  - Email:    harshbajaj544@gmail.com',
        '  - GitHub:   github.com/dexten32',
        '  - LinkedIn: linkedin.com/in/harsh-bajajb'
      ];
    } else if (cleanCmd === 'resume') {
      outputLines = ['Locating artifact... Triggering download for Harsh_Bajaj_Resume.pdf...'];
      // Virtual anchor to download resume
      const downloadLink = document.createElement('a');
      downloadLink.href = 'Harsh_Bajaj_Resume.pdf';
      downloadLink.download = 'Harsh_Bajaj_Resume.pdf';
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } else if (cleanCmd === 'clear') {
      terminalHistory.innerHTML = '';
    } else {
      outputLines = [
        `sh: command not found: ${escapeHTML(cmdStr)}`,
        'Type "help" to see all valid systems commands.'
      ];
    }

    // 4. Print output lines
    outputLines.forEach(lineText => {
      const outLine = document.createElement('div');
      outLine.className = 'terminal-line output';
      outLine.textContent = lineText;
      terminalHistory.appendChild(outLine);
    });

    // 5. Scroll terminal box to the bottom
    terminalBox.scrollTop = terminalBox.scrollHeight;
  }

  // Pre-load prompt focus
  terminalBox.scrollTop = terminalBox.scrollHeight;

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// ===== CONTACT FORM TRANSMISSION ENGINE =====
const contactForm = document.getElementById('contact-form');
const formStatusBox = document.getElementById('form-status-box');
const formSubmitBtn = document.getElementById('form-submit-btn');

if (contactForm && formStatusBox && formSubmitBtn) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check honeypot spam filter
    const botcheck = contactForm.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      console.warn("Spam detection triggered.");
      return;
    }

    // Set initial loading state
    formStatusBox.style.display = 'block';
    formStatusBox.className = 'form-status-box transmitting';
    formStatusBox.innerHTML = `
      [INITIALIZING TRANSMISSION...]<br>
      [CONNECTING TO SECURE RELAY...]<br>
      [TRANSMITTING PAYLOAD...]
    `;
    
    // Disable submit button during transmission
    formSubmitBtn.disabled = true;
    formSubmitBtn.textContent = 'Transmitting...';

    // Prepare FormData
    const formData = new FormData(contactForm);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.status === 200 && result.success) {
        // Success
        formStatusBox.className = 'form-status-box success';
        formStatusBox.innerHTML = `
          [CONNECTION STABILIZED]<br>
          [PAYLOAD RECEIVED SUCCESSFULLY]<br>
          [MESSAGE TRANSMITTED SECURELY TO ENGINE CORE]
        `;
        // Clear form values
        contactForm.reset();
      } else {
        // Error response
        throw new Error(result.message || 'Transmission hand-shake failed.');
      }
    } catch (error) {
      console.error(error);
      formStatusBox.className = 'form-status-box error';
      formStatusBox.innerHTML = `
        [ERROR: TRANSMISSION FAULT DETECTED]<br>
        [HANDSHAKE FAILED: ${error.message}]<br>
        [PLEASE RETRY LATER OR DIRECT EMAIL]
      `;
    } finally {
      // Re-enable submit button
      formSubmitBtn.disabled = false;
      formSubmitBtn.textContent = '→ Transmit Message';
    }
  });
}
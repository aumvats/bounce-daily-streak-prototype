// ========== CONFETTI ENGINE ==========
// Lightweight canvas-based confetti burst for celebration popup

class ConfettiEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animating = false;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    launch(count = 120) {
        if (!this.canvas) return;
        this.resizeCanvas();
        this.particles = [];

        const colors = [
            '#ed3833', '#f04a36', '#ffcc02', '#34c759',
            '#f5a623', '#af52de', '#d42f2a', '#ffffff',
            '#f04a36', '#5ac8fa'
        ];

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height * 0.35;

        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const velocity = 8 + Math.random() * 12;
            const isRibbon = Math.random() > 0.5;

            this.particles.push({
                x: cx + (Math.random() - 0.5) * 40,
                y: cy + (Math.random() - 0.5) * 40,
                w: isRibbon ? 3 + Math.random() * 3 : 5 + Math.random() * 7,
                h: isRibbon ? 12 + Math.random() * 18 : 5 + Math.random() * 7,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 12,
                vx: Math.cos(angle) * velocity * (0.5 + Math.random() * 0.5),
                vy: Math.sin(angle) * velocity * (0.5 + Math.random() * 0.5) - 4,
                gravity: 0.12 + Math.random() * 0.08,
                friction: 0.98 + Math.random() * 0.015,
                opacity: 1,
                fadeRate: 0.003 + Math.random() * 0.004,
                shape: isRibbon ? 'ribbon' : (Math.random() > 0.5 ? 'rect' : 'circle'),
                delay: Math.random() * 8 // staggered start
            });
        }

        if (!this.animating) {
            this.animating = true;
            this.frame = 0;
            this.animate();
        }
    }

    animate() {
        if (!this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let alive = false;
        this.frame++;

        for (const p of this.particles) {
            if (p.opacity <= 0) continue;
            if (this.frame < p.delay) { alive = true; continue; }

            alive = true;
            p.vx *= p.friction;
            p.vy += p.gravity;
            p.vy *= p.friction;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotSpeed;

            // Fade out when past 70% of screen
            if (p.y > this.canvas.height * 0.7) {
                p.opacity -= p.fadeRate * 3;
            } else {
                p.opacity -= p.fadeRate;
            }

            if (p.opacity <= 0) continue;

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.globalAlpha = Math.max(0, p.opacity);
            this.ctx.fillStyle = p.color;

            if (p.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            }

            this.ctx.restore();
        }

        if (alive && this.frame < 400) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.animating = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    stop() {
        this.animating = false;
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        this.particles = [];
    }
}

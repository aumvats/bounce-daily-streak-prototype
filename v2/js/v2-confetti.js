// ========== V2 ENHANCED CONFETTI ==========
// Extends the base ConfettiEngine with tier-colored particles

function getV2ConfettiColors() {
    var tier = getTier(V2_CONFIG.currentStreak);
    if (!tier) return ['#ed3833', '#f04a36', '#ffcc02', '#34c759', '#f5a623', '#af52de', '#ffffff'];

    var tierColors = {
        orange: ['#FF8C42', '#FF6B1A', '#FFB347', '#ffcc02', '#34c759', '#ffffff', '#FFA07A'],
        redorange: ['#FF4D2E', '#E8381A', '#FF6347', '#ffcc02', '#34c759', '#ffffff', '#FF7F50'],
        blue: ['#4A9EFF', '#2563EB', '#60A5FA', '#93C5FD', '#34c759', '#ffffff', '#BFDBFE'],
        purple: ['#A855F7', '#7C3AED', '#C084FC', '#DDD6FE', '#34c759', '#ffffff', '#E9D5FF'],
        gold: ['#FFD700', '#F59E0B', '#FBBF24', '#FDE68A', '#34c759', '#ffffff', '#FEF3C7']
    };

    return tierColors[tier.id] || tierColors.orange;
}

// Override confetti colors for v2 by patching the launch if a v2 engine is used
// The base ConfettiEngine from confetti.js is used directly
// We enhance by setting custom colors before launch
(function () {
    var originalLaunch = ConfettiEngine.prototype.launch;
    ConfettiEngine.prototype.launchV2 = function (count) {
        if (!this.canvas) return;
        this.resizeCanvas();
        this.particles = [];

        var colors = getV2ConfettiColors();
        var cx = this.canvas.width / 2;
        var cy = this.canvas.height * 0.35;

        for (var i = 0; i < count; i++) {
            var angle = Math.random() * Math.PI * 2;
            var velocity = 8 + Math.random() * 12;
            var isRibbon = Math.random() > 0.5;

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
                delay: Math.random() * 8
            });
        }

        if (!this.animating) {
            this.animating = true;
            this.frame = 0;
            this.animate();
        }
    };
})();

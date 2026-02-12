// ========== V2 STREAK BADGE ==========

function initBadgeV2() {
    const badge = document.getElementById('v2StreakBadge');
    const count = document.getElementById('v2BadgeCount');
    const lottie = document.getElementById('v2BadgeLottie');
    if (!badge || !count) return;

    const streak = V2_CONFIG.currentStreak;

    if (streak <= 0) {
        badge.setAttribute('data-hidden', 'true');
        badge.setAttribute('aria-label', 'No active streak');
        return;
    }

    badge.removeAttribute('data-hidden');

    // Update count
    count.textContent = streak;

    // Update ARIA
    badge.setAttribute('aria-label', 'Your riding streak: ' + streak + ' days. Tap to see details.');

    // Apply tier filter to Lottie
    const tier = getTier(streak);
    if (lottie && tier) {
        lottie.style.filter = getLottieFilter(tier.id);
    }

    // Set tier on body
    setStreakTier(streak);
}

function updateBadgeCount(count, animate) {
    const countEl = document.getElementById('v2BadgeCount');
    const badge = document.getElementById('v2StreakBadge');
    if (!countEl) return;

    countEl.textContent = count;

    if (animate && badge) {
        badge.classList.add('v2-badge--pop');
        setTimeout(function () {
            badge.classList.remove('v2-badge--pop');
        }, 400);
    }
}

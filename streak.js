// ========== STREAK CONFIGURATION (Simulated Backend Data) ==========
const STREAK_CONFIG = {
    currentStreak: 15,
    longestStreak: 22,
    hasNewDiscount: true,
    currentDiscountPercent: 10,
    // 30-day activity: 1 = active, 0 = missed
    activityDays: [
        1, 1, 1, 0, 1, 1, 1,
        1, 1, 0, 1, 1, 1, 1,
        1, 1, 0, 0, 1, 1, 1,
        1, 1, 1, 1, 0, 1, 1,
        1, 1
    ],
    milestones: [
        { days: 7, discount: 5, label: '5% off next renewal', icon: 'star', unlocked: true },
        { days: 15, discount: 10, label: '10% off next renewal', icon: 'fire', unlocked: true },
        { days: 30, discount: 15, label: '15% off + free helmet rental', icon: 'trophy', unlocked: false },
        { days: 60, discount: 20, label: '20% off + priority support', icon: 'crown', unlocked: false },
    ],
    celebrationSeen: false,
    restoresLeft: 1
};

// ========== PRESET SCENARIOS ==========
const PRESET_SCENARIOS = {
    newUser: {
        label: 'New User',
        currentStreak: 0,
        longestStreak: 0,
        hasNewDiscount: false,
        restoresLeft: 0,
        activityDays: [
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0
        ]
    },
    buildingUp: {
        label: 'Building Up',
        currentStreak: 5,
        longestStreak: 5,
        hasNewDiscount: false,
        restoresLeft: 1,
        activityDays: [
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 1, 1, 1,
            1, 1
        ]
    },
    firstMilestone: {
        label: '7-Day',
        currentStreak: 7,
        longestStreak: 7,
        hasNewDiscount: true,
        restoresLeft: 1,
        activityDays: [
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0, 1, 1, 1, 1, 1,
            1, 1
        ]
    },
    regularRider: {
        label: 'Regular',
        currentStreak: 15,
        longestStreak: 22,
        hasNewDiscount: true,
        restoresLeft: 1,
        activityDays: [
            1, 1, 1, 0, 1, 1, 1,
            1, 1, 0, 1, 1, 1, 1,
            1, 1, 0, 0, 1, 1, 1,
            1, 1, 1, 1, 0, 1, 1,
            1, 1
        ]
    },
    powerUser: {
        label: 'Power',
        currentStreak: 30,
        longestStreak: 30,
        hasNewDiscount: true,
        restoresLeft: 2,
        activityDays: [
            1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 0, 1,
            1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1,
            1, 1
        ]
    },
    maxStreak: {
        label: 'Max',
        currentStreak: 60,
        longestStreak: 60,
        hasNewDiscount: true,
        restoresLeft: 3,
        activityDays: [
            1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 1, 1, 1,
            1, 1
        ]
    },
    lapsed: {
        label: 'Lapsed',
        currentStreak: 0,
        longestStreak: 18,
        hasNewDiscount: false,
        restoresLeft: 1,
        activityDays: [
            0, 0, 1, 1, 1, 1, 1,
            1, 1, 1, 1, 0, 1, 1,
            1, 1, 1, 1, 1, 0, 0,
            0, 0, 0, 0, 0, 0, 0,
            0, 0
        ]
    }
};

function applyScenario(name) {
    const scenario = PRESET_SCENARIOS[name];
    if (!scenario) return;

    STREAK_CONFIG.currentStreak = scenario.currentStreak;
    STREAK_CONFIG.longestStreak = scenario.longestStreak;
    STREAK_CONFIG.hasNewDiscount = scenario.hasNewDiscount;
    STREAK_CONFIG.restoresLeft = scenario.restoresLeft;
    STREAK_CONFIG.activityDays = [...scenario.activityDays];
    STREAK_CONFIG.celebrationSeen = false;

    // Update milestone unlock states
    STREAK_CONFIG.milestones.forEach(m => {
        m.unlocked = STREAK_CONFIG.currentStreak >= m.days;
    });

    // Refresh UI
    resetPlanCardPrices();
    initStreakBadge();
    applyStreakDiscounts();
    showCelebration();

    // Update active button state
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.scenario === name);
    });
}

// Milestone icon map
const MILESTONE_ICONS = {
    star: '⭐',
    fire: '🔥',
    trophy: '🏆',
    crown: '👑'
};

// ========== DISCOUNT CALCULATION ==========
function getActiveDiscount() {
    const streak = STREAK_CONFIG.currentStreak;
    let discount = 0;
    for (const m of STREAK_CONFIG.milestones) {
        if (streak >= m.days) discount = m.discount;
    }
    return discount;
}

function calcDiscountedPrice(originalPrice) {
    const discount = getActiveDiscount();
    if (discount === 0) return { original: originalPrice, discounted: originalPrice, discount: 0 };
    const discounted = Math.round(originalPrice * (1 - discount / 100));
    return { original: originalPrice, discounted, discount };
}

// Store original prices for reset
const originalPrices = {};

// ========== STREAK BADGE ==========
function initStreakBadge() {
    const badge = document.getElementById('streakBadge');
    const count = document.getElementById('streakBadgeCount');
    if (!badge || !count) return;

    if (STREAK_CONFIG.currentStreak === 0) {
        badge.style.display = 'none';
    } else {
        badge.style.display = 'flex';
        count.textContent = STREAK_CONFIG.currentStreak;
    }
}

// ========== APPLY DISCOUNTS TO PLAN CARDS ==========
function applyStreakDiscounts() {
    const discount = getActiveDiscount();
    if (discount === 0) return;

    // Regular plan cards
    document.querySelectorAll('.plan-card').forEach(card => {
        const originalPrice = parseInt(card.getAttribute('data-price'));
        const { discounted } = calcDiscountedPrice(originalPrice);

        // Store original
        const duration = card.getAttribute('data-duration');
        if (!originalPrices[duration]) {
            originalPrices[duration] = originalPrice;
        }

        const priceEl = card.querySelector('.plan-price');
        const priceBox = card.querySelector('.plan-price-box');

        if (priceEl) {
            priceEl.innerHTML = `
                <span class="plan-price-original">₹${originalPrice}</span>
                <span class="plan-price discounted">₹${discounted}</span>
            `;
        }

        // Add streak badge
        if (priceBox && !priceBox.querySelector('.streak-discount-badge')) {
            const badge = document.createElement('div');
            badge.className = 'streak-discount-badge';
            badge.innerHTML = '🔥 ' + discount + '% off';
            priceBox.appendChild(badge);
        }

        card.setAttribute('data-discounted-price', discounted);
    });

    // Hero card
    const heroCard = document.querySelector('.hero-plan-card');
    if (heroCard) {
        const originalPrice = parseInt(heroCard.getAttribute('data-price'));
        const { discounted } = calcDiscountedPrice(originalPrice);

        if (!originalPrices['hero']) {
            originalPrices['hero'] = originalPrice;
        }

        const badge = heroCard.querySelector('.hero-badge');
        if (badge) {
            badge.innerHTML = `
                <span class="hero-price-original">₹${originalPrice}/week</span>
                <span class="hero-price-new">₹${discounted}/week</span>
                <span class="hero-discount-tag">${discount}% OFF</span>
            `;
        }

        const details = heroCard.querySelector('.hero-details');
        if (details) {
            const perDay = Math.round(discounted / 7);
            details.innerHTML = `<span class="hero-details-original">₹250/day</span> ₹${perDay}/day • Unlimited km`;
        }

        heroCard.setAttribute('data-discounted-price', discounted);
    }

    // Bottom sheet option cards
    document.querySelectorAll('.review-sheet .option-card').forEach(optionCard => {
        const pricingEl = optionCard.querySelector('.option-pricing h3');
        if (!pricingEl) return;

        const priceText = pricingEl.textContent;
        const priceMatch = priceText.match(/₹(\d+)/);
        if (!priceMatch) return;

        const origPrice = parseInt(priceMatch[1]);
        const { discounted: newPrice } = calcDiscountedPrice(origPrice);

        // Only apply if not already applied
        if (!pricingEl.querySelector('.option-price-original')) {
            pricingEl.innerHTML = `
                <span class="option-price-original">₹${origPrice}</span>
                <span class="option-price-new">₹${newPrice}</span>
            `;
        }

        // Add discount tag if not present
        const pricingContainer = optionCard.querySelector('.option-pricing');
        if (pricingContainer && !pricingContainer.querySelector('.option-discount-tag')) {
            const tag = document.createElement('div');
            tag.className = 'option-discount-tag';
            tag.textContent = '🔥 ' + discount + '% off';
            pricingContainer.appendChild(tag);
        }
    });
}

// Reset plan card prices (for demo toggling)
function resetPlanCardPrices() {
    document.querySelectorAll('.plan-card').forEach(card => {
        const originalPrice = parseInt(card.getAttribute('data-price'));
        const priceEl = card.querySelector('.plan-price');
        const priceBox = card.querySelector('.plan-price-box');

        if (priceEl) {
            priceEl.innerHTML = `₹${originalPrice}`;
            priceEl.classList.remove('discounted');
        }

        if (priceBox) {
            const badge = priceBox.querySelector('.streak-discount-badge');
            if (badge) badge.remove();
        }
    });

    const heroCard = document.querySelector('.hero-plan-card');
    if (heroCard) {
        const originalPrice = parseInt(heroCard.getAttribute('data-price'));
        const badge = heroCard.querySelector('.hero-badge');
        if (badge) badge.innerHTML = `₹${originalPrice}/week`;

        const details = heroCard.querySelector('.hero-details');
        if (details) details.textContent = '₹250/day • Unlimited km';
    }

    // Reset option cards
    document.querySelectorAll('.review-sheet .option-card').forEach(optionCard => {
        const pricingEl = optionCard.querySelector('.option-pricing h3');
        if (!pricingEl) return;
        const origEl = pricingEl.querySelector('.option-price-original');
        if (origEl) {
            const origPrice = origEl.textContent;
            pricingEl.innerHTML = origPrice;
        }
        const tag = optionCard.querySelector('.option-discount-tag');
        if (tag) tag.remove();
    });
}

// ========== CELEBRATION POPUP ==========
let confettiEngine = null;

function showCelebration() {
    if (!STREAK_CONFIG.hasNewDiscount || STREAK_CONFIG.celebrationSeen) return;
    if (getActiveDiscount() === 0) return;

    const overlay = document.getElementById('streakCelebration');
    if (!overlay) return;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Populate
    document.getElementById('celebrationCount').textContent = STREAK_CONFIG.currentStreak;

    const heroPrice = parseInt(document.querySelector('.hero-plan-card')?.getAttribute('data-price') || '1749');
    const { original, discounted, discount } = calcDiscountedPrice(heroPrice);
    document.getElementById('celebrationOriginal').textContent = '₹' + original;
    document.getElementById('celebrationNew').textContent = '₹' + discounted;
    document.getElementById('celebrationDiscountTag').textContent = discount + '% OFF';

    // Confetti
    if (!confettiEngine) {
        confettiEngine = new ConfettiEngine('confettiCanvas');
    }
    setTimeout(() => confettiEngine.launch(150), 300);
}

function claimDiscount() {
    STREAK_CONFIG.celebrationSeen = true;
    dismissCelebration();
}

function dismissCelebration() {
    STREAK_CONFIG.celebrationSeen = true;
    const overlay = document.getElementById('streakCelebration');
    if (!overlay) return;

    overlay.style.animation = 'none';
    overlay.style.transition = 'opacity 0.3s ease-out';
    overlay.style.opacity = '0';

    setTimeout(() => {
        overlay.classList.remove('active');
        overlay.style.animation = '';
        overlay.style.transition = '';
        overlay.style.opacity = '';
        document.body.style.overflow = 'auto';
        if (confettiEngine) confettiEngine.stop();
    }, 300);
}

// ========== STREAK HISTORY PANEL ==========
function openStreakHistory() {
    const overlay = document.getElementById('streakHistory');
    if (!overlay) return;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Populate
    document.getElementById('historyStreakCount').textContent = STREAK_CONFIG.currentStreak;
    document.getElementById('historyLongest').textContent = 'Longest: ' + STREAK_CONFIG.longestStreak + ' days';

    // Discount display
    const discountValue = document.getElementById('historyDiscountValue');
    const discountLabel = document.getElementById('historyDiscountLabel');
    const activeDiscount = getActiveDiscount();
    if (discountValue) {
        discountValue.textContent = activeDiscount > 0 ? activeDiscount + '%' : '—';
    }
    if (discountLabel) {
        discountLabel.textContent = activeDiscount > 0 ? 'discount on next renewal' : 'No active discount';
    }

    // Restores
    const restoresCount = document.getElementById('restoresCount');
    if (restoresCount) {
        restoresCount.textContent = STREAK_CONFIG.restoresLeft;
    }

    renderActivityGrid();
    renderMilestones();
}

function closeStreakHistory() {
    const overlay = document.getElementById('streakHistory');
    if (!overlay) return;

    overlay.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
    overlay.style.transform = 'translateY(100%)';

    setTimeout(() => {
        overlay.classList.remove('active');
        overlay.style.transition = '';
        overlay.style.transform = '';
        document.body.style.overflow = 'auto';
    }, 350);
}

function renderActivityGrid() {
    const grid = document.getElementById('activityGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const days = STREAK_CONFIG.activityDays;
    // Pad to fill complete rows
    const padStart = (7 - (days.length % 7)) % 7;

    for (let i = 0; i < padStart; i++) {
        const cell = document.createElement('div');
        cell.className = 'activity-cell';
        cell.style.visibility = 'hidden';
        grid.appendChild(cell);
    }

    days.forEach((active, index) => {
        const cell = document.createElement('div');
        const classes = ['activity-cell'];

        if (active) {
            classes.push('active');
        }

        if (index === days.length - 1) {
            classes.push('today');
        }

        cell.className = classes.join(' ');
        grid.appendChild(cell);
    });

    // Fill remaining cells for future days to complete the row
    const totalCells = padStart + days.length;
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remaining; i++) {
        const cell = document.createElement('div');
        cell.className = 'activity-cell future';
        grid.appendChild(cell);
    }
}

function renderMilestones() {
    const list = document.getElementById('milestonesList');
    if (!list) return;
    list.innerHTML = '';

    STREAK_CONFIG.milestones.forEach(m => {
        const isUnlocked = m.unlocked;
        const isCurrent = STREAK_CONFIG.currentStreak >= m.days &&
            (STREAK_CONFIG.milestones.indexOf(m) === STREAK_CONFIG.milestones.length - 1 ||
                STREAK_CONFIG.currentStreak < STREAK_CONFIG.milestones[STREAK_CONFIG.milestones.indexOf(m) + 1]?.days);

        const item = document.createElement('div');
        item.className = 'milestone-item' + (isUnlocked ? '' : ' locked');

        let statusClass, statusText;
        if (isCurrent) {
            statusClass = 'current';
            statusText = 'Current';
        } else if (isUnlocked) {
            statusClass = 'unlocked';
            statusText = '✓ Unlocked';
        } else {
            statusClass = 'locked';
            const daysLeft = m.days - STREAK_CONFIG.currentStreak;
            statusText = daysLeft + 'd left';
        }

        const iconClass = isCurrent ? 'current' : (isUnlocked ? 'unlocked' : 'locked');

        item.innerHTML = `
            <div class="milestone-icon ${iconClass}">
                ${MILESTONE_ICONS[m.icon] || '🎯'}
            </div>
            <div class="milestone-info">
                <div class="milestone-days">${m.days}-Day Streak</div>
                <div class="milestone-reward">${m.label}</div>
            </div>
            <div class="milestone-status ${statusClass}">
                ${statusText}
            </div>
        `;
        list.appendChild(item);
    });
}

// ========== SCENARIO TOOLBAR ==========
function renderScenarioToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'scenario-toolbar';
    toolbar.innerHTML = `
        <button class="scenario-toggle" onclick="this.parentElement.classList.toggle('expanded')">
            <span class="scenario-toggle-icon">🎛</span>
        </button>
        <div class="scenario-buttons"></div>
    `;

    const container = toolbar.querySelector('.scenario-buttons');
    for (const [key, scenario] of Object.entries(PRESET_SCENARIOS)) {
        const btn = document.createElement('button');
        btn.className = 'scenario-btn';
        btn.dataset.scenario = key;
        btn.textContent = scenario.label;
        btn.onclick = () => applyScenario(key);
        container.appendChild(btn);
    }

    document.body.appendChild(toolbar);
}

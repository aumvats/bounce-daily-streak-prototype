// ========== APP STATE ==========
let selectedScooter = 'high';
let selectedPlan = null;
let selectedPrice = 0;
let selectedPerDay = '';
let selectedValidity = '';
let selectedDistance = '';

// ========== SCOOTER SELECTION ==========
function selectScooter(type) {
    selectedScooter = type;
    document.querySelectorAll('.scooter-card').forEach(card => {
        card.classList.remove('selected');
        const btn = card.querySelector('.scooter-btn');
        btn.textContent = 'Select';
        btn.className = 'scooter-btn secondary';
    });

    const card = document.getElementById('scooter-' + type);
    card.classList.add('selected');
    const btn = card.querySelector('.scooter-btn');
    btn.textContent = 'Selected';
    btn.className = 'scooter-btn primary';
}

// ========== NAVIGATION ==========
function goToPlans() {
    document.getElementById('screen-scooter').classList.remove('active');
    document.getElementById('screen-plans').classList.add('active');
    window.scrollTo(0, 0);

    // Streak features
    applyStreakDiscounts();
    setTimeout(() => {
        showCelebration();
    }, 400);
}

function goToScooter() {
    document.getElementById('screen-plans').classList.remove('active');
    document.getElementById('screen-scooter').classList.add('active');
    window.scrollTo(0, 0);
}

// ========== PLAN SELECTION ==========
function openPlanSheet(duration, price) {
    selectedPlan = duration;
    document.getElementById('overlay').classList.add('active');
    document.getElementById('sheet-' + duration).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function selectOption(duration, price, perDay, validity, distance) {
    // Apply streak discount
    const discount = getActiveDiscount();
    if (discount > 0) {
        const { discounted } = calcDiscountedPrice(price);
        selectedPrice = discounted;
        const days = parseInt(validity);
        if (!isNaN(days) && days > 0) {
            selectedPerDay = '₹' + Math.round(discounted / days);
        } else {
            selectedPerDay = perDay;
        }
    } else {
        selectedPrice = price;
        selectedPerDay = perDay;
    }

    selectedValidity = validity;
    selectedDistance = distance;

    // Highlight selected option
    const sheet = document.getElementById('sheet-' + duration);
    sheet.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Close options sheet and open confirmation
    setTimeout(() => {
        sheet.classList.remove('active');
        updateReviewConfirmation();
        setTimeout(() => {
            document.getElementById('review-confirmation').classList.add('active');
        }, 100);
    }, 300);
}

function updateReviewConfirmation() {
    document.getElementById('review-bike').textContent = selectedScooter === 'high' ? 'High Speed' : 'Low Speed';
    document.getElementById('review-plan-price').textContent = selectedPerDay + '/day';
    document.getElementById('review-validity').textContent = selectedValidity;
    document.getElementById('review-distance').textContent = selectedDistance;
    document.getElementById('review-total').textContent = '₹' + selectedPrice;

    // Show original price if discount active
    const discount = getActiveDiscount();
    const totalEl = document.getElementById('review-total');
    const existingOriginal = document.getElementById('review-total-original');
    if (existingOriginal) existingOriginal.remove();

    if (discount > 0) {
        totalEl.style.color = '#34c759';
    } else {
        totalEl.style.color = '#ed3833';
    }
}

function closeAllSheets() {
    document.getElementById('overlay').classList.remove('active');
    document.querySelectorAll('.review-sheet').forEach(sheet => {
        sheet.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

function confirmPlan() {
    alert('Plan confirmed! Proceeding to payment...');
    closeAllSheets();
}

// ========== EVENT LISTENERS ==========
document.addEventListener('DOMContentLoaded', function () {
    // Init streak badge
    initStreakBadge();

    // Init scenario toolbar
    renderScenarioToolbar();

    // Handle card clicks (for selection)
    document.querySelectorAll('.plan-card, .hero-plan-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('plan-cta-btn') ||
                e.target.classList.contains('hero-cta-btn')) {
                return;
            }
            document.querySelectorAll('.plan-card, .hero-plan-card').forEach(c => {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });

    // Handle CTA button clicks (for opening bottom sheet)
    document.querySelectorAll('.plan-cta-btn, .hero-cta-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const card = this.closest('.plan-card') || this.closest('.hero-plan-card');
            const duration = card.getAttribute('data-duration');
            const price = card.getAttribute('data-price');
            openPlanSheet(duration, price);
        });
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllSheets();
            closeStreakHistory();
        }
    });

    // Debug: triple-tap "Select your plan" to cycle streak values
    let debugTapCount = 0;
    let debugTapTimer = null;
    const headerTitle = document.querySelector('#screen-plans .header-title');
    if (headerTitle) {
        headerTitle.addEventListener('click', () => {
            debugTapCount++;
            clearTimeout(debugTapTimer);
            debugTapTimer = setTimeout(() => { debugTapCount = 0; }, 500);
            if (debugTapCount === 3) {
                debugTapCount = 0;
                const streaks = [0, 5, 7, 15, 30, 60];
                const currentIdx = streaks.indexOf(STREAK_CONFIG.currentStreak);
                const nextIdx = (currentIdx + 1) % streaks.length;
                STREAK_CONFIG.currentStreak = streaks[nextIdx];
                STREAK_CONFIG.hasNewDiscount = STREAK_CONFIG.currentStreak >= 7;
                STREAK_CONFIG.celebrationSeen = false;

                // Update milestones unlock state
                STREAK_CONFIG.milestones.forEach(m => {
                    m.unlocked = STREAK_CONFIG.currentStreak >= m.days;
                });

                // Re-apply everything
                initStreakBadge();
                resetPlanCardPrices();
                applyStreakDiscounts();
                showCelebration();
            }
        });
    }
});

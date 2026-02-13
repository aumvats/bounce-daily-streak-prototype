// ========== V0 STREAK CONFIG ==========
var V0_STREAK = {
    currentDays: 47,          // Change this to test different streak states
    baseRate: 300,
    tiers: [
        { days: 30, rate: 285, flames: 1 },
        { days: 60, rate: 270, flames: 2 },
        { days: 90, rate: 255, flames: 3 }
    ]
};

function getStreakTier(days) {
    var current = null;
    var next = V0_STREAK.tiers[0]; // default next is first tier
    for (var i = 0; i < V0_STREAK.tiers.length; i++) {
        if (days >= V0_STREAK.tiers[i].days) {
            current = V0_STREAK.tiers[i];
            next = V0_STREAK.tiers[i + 1] || null;
        }
    }
    return { current: current, next: next };
}

function getCurrentRate() {
    var tier = getStreakTier(V0_STREAK.currentDays);
    return tier.current ? tier.current.rate : V0_STREAK.baseRate;
}

function getFlameCount() {
    var tier = getStreakTier(V0_STREAK.currentDays);
    return tier.current ? tier.current.flames : 0;
}

// ========== V0 APP STATE ==========
let selectedPlan = null;
let selectedPrice = 0;
let selectedPerDay = '';
let selectedValidity = '';
let selectedDistance = '';

// ========== NAVIGATION ==========
function goToPlans() {
    document.getElementById('screen-booking').classList.remove('active');
    document.getElementById('screen-plans').classList.add('active');
    window.scrollTo(0, 0);
}

function goToBooking() {
    document.getElementById('screen-plans').classList.remove('active');
    document.getElementById('screen-booking').classList.add('active');
    window.scrollTo(0, 0);
}

// ========== PLAN SELECTION ==========
function openPlanSheet(duration) {
    selectedPlan = duration;
    document.getElementById('overlay').classList.add('active');
    document.getElementById('sheet-' + duration).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function selectOption(duration, price, perDay, validity, distance) {
    selectedPrice = price;
    selectedPerDay = perDay;
    selectedValidity = validity;
    selectedDistance = distance;

    // Highlight selected option
    var sheet = document.getElementById('sheet-' + duration);
    sheet.querySelectorAll('.option-card').forEach(function (card) {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');

    // Close options sheet and open confirmation
    setTimeout(function () {
        sheet.classList.remove('active');
        updateReviewConfirmation();
        setTimeout(function () {
            document.getElementById('review-confirmation').classList.add('active');
        }, 100);
    }, 300);
}

function updateReviewConfirmation() {
    document.getElementById('review-bike').textContent = 'High Speed';
    document.getElementById('review-plan-price').textContent = selectedPerDay + '/day';
    document.getElementById('review-validity').textContent = selectedValidity;
    document.getElementById('review-distance').textContent = selectedDistance;
    document.getElementById('review-total').textContent = '₹' + selectedPrice;
}

function closeAllSheets() {
    document.getElementById('overlay').classList.remove('active');
    document.querySelectorAll('.review-sheet').forEach(function (sheet) {
        sheet.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

function confirmPlan() {
    alert('Plan confirmed! Proceeding to payment...');
    closeAllSheets();
}

// ========== EXPLAINER POPUP ==========
function openExplainer() {
    document.getElementById('v0ExplainerOverlay').classList.add('active');
    document.getElementById('v0ExplainerSheet').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeExplainer() {
    document.getElementById('v0ExplainerOverlay').classList.remove('active');
    document.getElementById('v0ExplainerSheet').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ========== COUNTDOWN TIMER ==========
function startCountdown() {
    // Prototype: hardcoded 14h 17m 28s countdown from page load
    var totalSeconds = (14 * 3600) + (17 * 60) + 28;
    var countdownEl = document.getElementById('v0-countdown');
    if (!countdownEl) return;

    function update() {
        if (totalSeconds <= 0) {
            countdownEl.textContent = 'Booking expired';
            return;
        }
        var h = Math.floor(totalSeconds / 3600);
        var m = Math.floor((totalSeconds % 3600) / 60);
        var s = totalSeconds % 60;
        countdownEl.textContent = 'Booking expires until ' +
            String(h).padStart(2, '0') + ':' +
            String(m).padStart(2, '0') + ':' +
            String(s).padStart(2, '0');
        totalSeconds--;
    }

    update();
    setInterval(update, 1000);
}

// ========== STREAK UI ==========
function renderStreakBadge() {
    var el = document.getElementById('v0-streak-count');
    var lottie = document.getElementById('v0-streak-lottie');
    if (!el) return;

    el.textContent = V0_STREAK.currentDays + '-day streak';

    // Show/hide lottie based on streak
    if (lottie) {
        lottie.style.display = V0_STREAK.currentDays > 0 ? 'block' : 'none';
    }

    // Hide streak section if 0 days
    var section = document.getElementById('v0-streak-section');
    if (section) {
        section.style.display = V0_STREAK.currentDays > 0 ? 'flex' : 'none';
    }
}

function renderProgressBar() {
    var barFill = document.getElementById('v0-progress-fill');
    var label = document.getElementById('v0-progress-label');
    var priceLabel = document.getElementById('v0-progress-price');
    var section = document.getElementById('v0-progress-section');
    if (!barFill || !label || !priceLabel || !section) return;

    var tier = getStreakTier(V0_STREAK.currentDays);
    var currentRate = getCurrentRate();
    var savingsPct = Math.round(((V0_STREAK.baseRate - currentRate) / V0_STREAK.baseRate) * 100);

    if (!tier.next) {
        // Already at max tier
        barFill.style.width = '100%';
        label.textContent = 'Saving ' + savingsPct + '% — max reached!';
        priceLabel.textContent = '₹' + currentRate + '/day';
        return;
    }

    var prevDays = tier.current ? tier.current.days : 0;
    var nextDays = tier.next.days;
    var progress = ((V0_STREAK.currentDays - prevDays) / (nextDays - prevDays)) * 100;
    progress = Math.min(Math.max(progress, 0), 100);

    barFill.style.width = progress + '%';

    var daysLeft = nextDays - V0_STREAK.currentDays;
    var nextSavingsPct = Math.round(((V0_STREAK.baseRate - tier.next.rate) / V0_STREAK.baseRate) * 100);

    if (savingsPct > 0) {
        label.textContent = 'Saving ' + savingsPct + '% — next drop in ' + daysLeft + ' days';
    } else {
        label.textContent = daysLeft + ' more days to save ' + nextSavingsPct + '%';
    }
    priceLabel.textContent = '₹' + tier.next.rate + '/day';
}

function applyStrikethroughPricing() {
    var currentRate = getCurrentRate();
    if (currentRate >= V0_STREAK.baseRate) return; // No discount

    // Hero card
    var heroCard = document.querySelector('.hero-plan-card');
    if (heroCard) {
        var heroPrice = parseInt(heroCard.getAttribute('data-price'));
        var heroDays = 7;
        var heroOrigPerDay = Math.round(heroPrice / heroDays);
        var heroNewPerDay = currentRate;
        var heroNewTotal = heroNewPerDay * heroDays;

        var heroDetails = heroCard.querySelector('.hero-details');
        if (heroDetails) {
            heroDetails.innerHTML = '<span class="v0-strike">₹' + heroOrigPerDay + '/day</span> ₹' + heroNewPerDay + '/day &bull; Unlimited km';
        }

        var heroBadge = heroCard.querySelector('.hero-badge');
        if (heroBadge) {
            heroBadge.innerHTML = '<span class="v0-strike-light">₹' + heroPrice + '</span> ₹' + heroNewTotal + '/week';
        }
    }

    // Regular plan cards
    document.querySelectorAll('.plan-card').forEach(function (card) {
        var origTotal = parseInt(card.getAttribute('data-price'));
        var duration = card.getAttribute('data-duration');
        var days = parseInt(duration);
        if (isNaN(days)) {
            if (duration === '3day') days = 3;
            else if (duration === '7day') days = 7;
            else if (duration === '14day') days = 14;
            else if (duration === '1day') days = 1;
        }

        var newTotal = currentRate * days;
        var priceEl = card.querySelector('.plan-price');
        if (priceEl && newTotal < origTotal) {
            priceEl.innerHTML = '<span class="v0-price-original">₹' + origTotal + '</span>₹' + newTotal;
            priceEl.classList.add('v0-price-discounted');
        }

        var detailsEl = card.querySelector('.plan-details');
        if (detailsEl && newTotal < origTotal) {
            var origPerDay = Math.round(origTotal / days);
            var kmText = detailsEl.textContent.split('•')[1] || '';
            detailsEl.innerHTML = '<span class="v0-strike-small">₹' + origPerDay + '/day</span> ₹' + currentRate + '/day &bull;' + kmText;
        }
    });
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function () {
    startCountdown();
    renderStreakBadge();
    renderProgressBar();
    applyStrikethroughPricing();

    // Plan card selection (visual toggle)
    document.querySelectorAll('.plan-card, .hero-plan-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('plan-cta-btn') ||
                e.target.classList.contains('hero-cta-btn')) {
                return;
            }
            document.querySelectorAll('.plan-card, .hero-plan-card').forEach(function (c) {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });

    // CTA buttons open bottom sheets
    document.querySelectorAll('.plan-cta-btn, .hero-cta-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var card = this.closest('.plan-card') || this.closest('.hero-plan-card');
            var duration = card.getAttribute('data-duration');
            openPlanSheet(duration);
        });
    });

    // Escape key closes sheets and explainer
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllSheets();
            closeExplainer();
        }
    });
});

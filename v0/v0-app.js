// ========== V0 SMARTRENT CONFIG ==========
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

function highlightOption(el, duration, price, perDay, validity, distance) {
    selectedPrice = price;
    selectedPerDay = perDay;
    selectedValidity = validity;
    selectedDistance = distance;

    // Highlight selected option
    var sheet = document.getElementById('sheet-' + duration);
    sheet.querySelectorAll('.option-card').forEach(function (card) {
        card.classList.remove('selected');
    });
    el.classList.add('selected');

    // Enable Continue button
    var continueBtn = sheet.querySelector('.sheet-continue-btn');
    if (continueBtn) {
        continueBtn.disabled = false;
    }
}

function continueWithPlan() {
    var sheet = document.getElementById('sheet-' + selectedPlan);
    if (sheet) {
        sheet.classList.remove('active');
    }
    updateReviewConfirmation();
    setTimeout(function () {
        document.getElementById('review-confirmation').classList.add('active');
    }, 100);
}

function switchBikeTab(el) {
    document.querySelectorAll('.bike-tab').forEach(function (tab) {
        tab.classList.remove('active');
    });
    el.classList.add('active');
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
        // Reset selections and Continue buttons
        sheet.querySelectorAll('.option-card').forEach(function (card) {
            card.classList.remove('selected');
        });
        var btn = sheet.querySelector('.sheet-continue-btn');
        if (btn) btn.disabled = true;
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
    animatePriceCounter();
}

function animatePriceCounter() {
    var el = document.getElementById('v0-price-counter');
    if (!el) return;
    var start = V0_STREAK.baseRate; // 300
    var end = V0_STREAK.tiers[V0_STREAK.tiers.length - 1].rate; // 255
    var duration = 1500;
    var startTime = null;

    function tick(ts) {
        if (!startTime) startTime = ts;
        var elapsed = ts - startTime;
        var progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.round(start - (start - end) * eased);
        el.textContent = current;
        if (progress < 1) {
            requestAnimationFrame(tick);
        }
    }

    el.textContent = start;
    setTimeout(function () {
        requestAnimationFrame(tick);
    }, 400); // small delay so sheet is visible first
}

function closeExplainer() {
    document.getElementById('v0ExplainerOverlay').classList.remove('active');
    document.getElementById('v0ExplainerSheet').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function switchExplainerTab(tabId) {
    // Toggle active tab
    document.querySelectorAll('.v0-tab').forEach(function (tab) {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
    });
    // Toggle active panel
    document.querySelectorAll('.v0-panel').forEach(function (panel) {
        panel.classList.toggle('active', panel.getAttribute('data-panel') === tabId);
    });
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

// ========== SMARTRENT UI ==========
function renderStreakBadge() {
    var el = document.getElementById('v0-streak-count');
    var lottie = document.getElementById('v0-streak-lottie');
    if (!el) return;

    el.textContent = 'SmartRent: Day ' + V0_STREAK.currentDays;

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
        var monthlySaving = (V0_STREAK.baseRate - currentRate) * 30;
        label.textContent = 'Lowest rate unlocked';
        priceLabel.textContent = '₹' + monthlySaving.toLocaleString('en-IN') + '/mo saved';
        return;
    }

    var prevDays = tier.current ? tier.current.days : 0;
    var nextDays = tier.next.days;
    var progress = ((V0_STREAK.currentDays - prevDays) / (nextDays - prevDays)) * 100;
    progress = Math.min(Math.max(progress, 0), 100);

    barFill.style.width = progress + '%';

    var daysLeft = nextDays - V0_STREAK.currentDays;

    label.textContent = daysLeft + ' days to ₹' + tier.next.rate + '/day';
    priceLabel.textContent = '₹' + (V0_STREAK.baseRate - tier.next.rate) * 30 + '/mo saved';
}

function getDurationDays(duration) {
    var days = parseInt(duration);
    if (!isNaN(days)) return days;
    if (duration === '1day') return 1;
    if (duration === '3day') return 3;
    if (duration === '7day') return 7;
    if (duration === '14day') return 14;
    if (duration === '30day') return 30;
    return 0;
}

function applyStrikethroughPricing() {
    var currentRate = getCurrentRate();
    if (currentRate >= V0_STREAK.baseRate) return; // No discount

    var savingsPct = Math.round(((V0_STREAK.baseRate - currentRate) / V0_STREAK.baseRate) * 100);

    // Hero card
    var heroCard = document.querySelector('.hero-plan-card');
    if (heroCard) {
        var heroOrigPerDay = parseInt(heroCard.getAttribute('data-perday'));
        if (currentRate < heroOrigPerDay) {
            var heroDays = getDurationDays(heroCard.getAttribute('data-duration'));
            var heroNewTotal = currentRate * heroDays;

            var heroDetails = heroCard.querySelector('.hero-details');
            if (heroDetails) {
                heroDetails.innerHTML = '<span class="v0-strike">₹' + heroOrigPerDay + '/day</span> ₹' + currentRate + '/day &bull; Unlimited Kilometers';
            }
            heroCard.setAttribute('data-price', heroNewTotal);
        }
    }

    // Regular plan cards
    document.querySelectorAll('.plan-card').forEach(function (card) {
        var origPerDay = parseInt(card.getAttribute('data-perday'));
        if (currentRate < origPerDay) {
            var detailsEl = card.querySelector('.plan-details');
            if (detailsEl) {
                detailsEl.innerHTML = '<span class="v0-strike-small">₹' + origPerDay + '/day</span> Pricing starts from ₹' + currentRate + '/day';
            }

            // Add SmartRent discount badge
            if (!card.querySelector('.streak-discount-badge')) {
                var badge = document.createElement('div');
                badge.className = 'streak-discount-badge';
                badge.textContent = 'SmartRent -' + savingsPct + '%';
                card.querySelector('.plan-left').appendChild(badge);
            }
        }
    });

    // Option cards in bottom sheets
    document.querySelectorAll('.review-sheet .option-card').forEach(function (card) {
        var origPerDay = parseInt(card.getAttribute('data-perday'));
        var origTotal = parseInt(card.getAttribute('data-orig-total'));
        if (!origPerDay || !origTotal || currentRate >= origPerDay) return;

        var sheet = card.closest('.review-sheet');
        var sheetId = sheet.id;
        var duration = sheetId.replace('sheet-', '');
        var days = getDurationDays(duration);
        if (!days) return;

        var newTotal = currentRate * days;
        var pricingH3 = card.querySelector('.option-pricing h3');
        var pricingP = card.querySelector('.option-pricing p');
        if (pricingH3 && newTotal < origTotal) {
            pricingH3.innerHTML = '<span class="option-price-original">₹' + origTotal.toLocaleString('en-IN') + '</span><span class="option-price-new">₹' + newTotal.toLocaleString('en-IN') + '</span>';
            if (pricingP) {
                pricingP.textContent = '₹' + currentRate + ' × ' + days + ' days';
            }

            // Add discount tag
            if (!card.querySelector('.option-discount-tag')) {
                var tag = document.createElement('div');
                tag.className = 'option-discount-tag';
                tag.textContent = 'SMARTRENT -' + savingsPct + '%';
                card.querySelector('.option-pricing').appendChild(tag);
            }
        }

        // Update onclick with new price
        if (newTotal < origTotal) {
            var onclickStr = card.getAttribute('onclick');
            if (onclickStr) {
                card.setAttribute('onclick', onclickStr.replace(origTotal, newTotal).replace('₹' + origPerDay, '₹' + currentRate));
            }
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

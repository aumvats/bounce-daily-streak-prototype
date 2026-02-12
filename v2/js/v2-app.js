// ========== V2 APP ORCHESTRATOR ==========

// App State
var selectedScooter = 'high';
var selectedPlan = null;
var selectedPrice = 0;
var selectedPerDay = '';
var selectedValidity = '';
var selectedDistance = '';

// ========== SCOOTER SELECTION ==========
function selectScooter(type) {
    selectedScooter = type;
    document.querySelectorAll('.scooter-card').forEach(function (card) {
        card.classList.remove('selected');
        var btn = card.querySelector('.scooter-btn');
        btn.textContent = 'Select';
        btn.className = 'scooter-btn secondary';
    });

    var card = document.getElementById('scooter-' + type);
    card.classList.add('selected');
    var btn = card.querySelector('.scooter-btn');
    btn.textContent = 'Selected';
    btn.className = 'scooter-btn primary';
}

// ========== NAVIGATION ==========
function goToPlans() {
    document.getElementById('screen-scooter').classList.remove('active');
    document.getElementById('screen-plans').classList.add('active');
    window.scrollTo(0, 0);

    // V2 Streak features
    applyDiscountsV2();
    setTimeout(function () {
        showCelebrationV2();
    }, 400);

    // Schedule nudges
    setTimeout(function () {
        scheduleContextualNudges();
    }, 2000);
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
    var discount = getActiveDiscountV2();
    if (discount > 0) {
        var result = calcDiscountedPriceV2(price);
        selectedPrice = result.discounted;
        var days = parseInt(validity);
        if (!isNaN(days) && days > 0) {
            selectedPerDay = '₹' + Math.round(result.discounted / days);
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
    document.getElementById('review-bike').textContent = selectedScooter === 'high' ? 'High Speed' : 'Low Speed';
    document.getElementById('review-plan-price').textContent = selectedPerDay + '/day';
    document.getElementById('review-validity').textContent = selectedValidity;
    document.getElementById('review-distance').textContent = selectedDistance;
    document.getElementById('review-total').textContent = '₹' + selectedPrice;

    var discount = getActiveDiscountV2();
    var totalEl = document.getElementById('review-total');
    if (discount > 0) {
        totalEl.style.color = '#34c759';
    } else {
        totalEl.style.color = '#ed3833';
    }
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

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function () {
    // 1. Set tier on body
    setStreakTier(V2_CONFIG.currentStreak);

    // 2. Init badge
    initBadgeV2();

    // 3. Render scenario toolbar
    renderScenarioToolbarV2();

    // 4. Wire event listeners

    // Dashboard close
    var dashClose = document.getElementById('v2DashClose');
    if (dashClose) {
        dashClose.addEventListener('click', closeDashboardV2);
    }

    // Celebration CTA
    var celebCTA = document.getElementById('v2CelebCTA');
    if (celebCTA) {
        celebCTA.addEventListener('click', claimDiscountV2);
    }

    // Celebration skip
    var celebSkip = document.getElementById('v2CelebSkip');
    if (celebSkip) {
        celebSkip.addEventListener('click', dismissCelebrationV2);
    }

    // Gift box tap
    var giftBox = document.getElementById('v2GiftBox');
    if (giftBox) {
        giftBox.addEventListener('click', revealGiftBox);
    }

    // Nudge close
    var nudgeClose = document.getElementById('v2NudgeClose');
    if (nudgeClose) {
        nudgeClose.addEventListener('click', dismissNudge);
    }

    // Plan card clicks (selection)
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

    // CTA button clicks (open bottom sheets)
    document.querySelectorAll('.plan-cta-btn, .hero-cta-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var card = this.closest('.plan-card') || this.closest('.hero-plan-card');
            var duration = card.getAttribute('data-duration');
            var price = card.getAttribute('data-price');
            openPlanSheet(duration, price);
        });
    });

    // Escape key handler
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // Close in order of z-index priority
            var celebration = document.getElementById('v2Celebration');
            if (celebration && celebration.classList.contains('is-active')) {
                dismissCelebrationV2();
                return;
            }

            var dashboard = document.getElementById('v2Dashboard');
            if (dashboard && dashboard.classList.contains('is-active')) {
                closeDashboardV2();
                return;
            }

            closeAllSheets();
            dismissNudge();
        }
    });

    // Debug: triple-tap header title to cycle streaks
    var debugTapCount = 0;
    var debugTapTimer = null;
    var headerTitle = document.querySelector('#screen-plans .header-title');
    if (headerTitle) {
        headerTitle.addEventListener('click', function () {
            debugTapCount++;
            clearTimeout(debugTapTimer);
            debugTapTimer = setTimeout(function () { debugTapCount = 0; }, 500);
            if (debugTapCount === 3) {
                debugTapCount = 0;
                var streaks = [0, 5, 7, 15, 30, 60];
                var currentIdx = streaks.indexOf(V2_CONFIG.currentStreak);
                var nextIdx = (currentIdx + 1) % streaks.length;

                V2_CONFIG.currentStreak = streaks[nextIdx];
                V2_CONFIG.hasNewMilestone = V2_CONFIG.currentStreak >= 7;
                V2_CONFIG.celebrationSeen = false;

                if (V2_CONFIG.currentStreak > V2_CONFIG.longestStreak) {
                    V2_CONFIG.longestStreak = V2_CONFIG.currentStreak;
                }

                setStreakTier(V2_CONFIG.currentStreak);
                initBadgeV2();
                resetPricesV2();
                applyDiscountsV2();
                showCelebrationV2();
            }
        });
    }
});

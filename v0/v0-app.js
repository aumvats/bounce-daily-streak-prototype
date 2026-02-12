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

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function () {
    startCountdown();

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

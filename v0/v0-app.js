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
    var fs = document.getElementById('v0ExplainerFullscreen');
    fs.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Populate milestone track
    var trackEl = document.getElementById('v0-exp-milestone-track');
    if (trackEl) trackEl.innerHTML = buildMilestoneTrackHTML(false);

    // Populate progress header
    var titleEl = document.getElementById('v0-exp-progress-title');
    var subEl = document.getElementById('v0-exp-progress-sub');
    if (titleEl) titleEl.textContent = 'Day ' + V0_STREAK.currentDays;
    if (subEl) {
        var rate = getCurrentRate();
        subEl.textContent = rate < V0_STREAK.baseRate
            ? "You\u2019re paying \u20B9" + rate + '/day'
            : 'Starting rate: \u20B9' + V0_STREAK.baseRate + '/day';
    }
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
    var fs = document.getElementById('v0ExplainerFullscreen');
    fs.classList.remove('active');
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
var currentLayout = 'a';

function getMilestones() {
    var milestones = [{ days: 0, rate: V0_STREAK.baseRate, label: 'Start' }];
    for (var i = 0; i < V0_STREAK.tiers.length; i++) {
        var t = V0_STREAK.tiers[i];
        milestones.push({ days: t.days, rate: t.rate, label: t.days + 'd' });
    }
    return milestones;
}

function buildMilestoneTrackHTML(compact) {
    var milestones = getMilestones();
    var days = V0_STREAK.currentDays;
    var html = '<div class="v0-milestone-track' + (compact ? ' compact' : '') + '">';

    for (var m = 0; m < milestones.length; m++) {
        var ms = milestones[m];
        var completed = days >= ms.days && m < milestones.length - 1;
        var isCurrent = false;
        var isFuture = days < ms.days;

        if (days >= ms.days && (m === milestones.length - 1 || days < milestones[m + 1].days)) {
            isCurrent = true;
            completed = false;
        }

        var dotClass = 'v0-milestone-dot';
        var dotContent = '';
        if (completed) { dotClass += ' completed'; dotContent = '&#10003;'; }
        else if (isCurrent) { dotClass += ' current'; dotContent = '&#10003;'; }
        else { dotClass += ' future'; }

        var daysClass = 'v0-milestone-days' + (completed || isCurrent ? ' active' : '');
        var rateClass = 'v0-milestone-rate';
        if (isCurrent) rateClass += ' active';
        else if (isFuture && m === milestones.length - 1) rateClass += ' future-highlight';

        html += '<div class="v0-milestone">';
        html += '<div class="' + dotClass + '">' + dotContent + '</div>';
        html += '<div class="' + daysClass + '">' + ms.label + '</div>';
        html += '<div class="' + rateClass + '">₹' + ms.rate + '</div>';
        html += '</div>';

        if (m < milestones.length - 1) {
            var nextMs = milestones[m + 1];
            var segFill = 0;
            if (days >= nextMs.days) segFill = 100;
            else if (days > ms.days) segFill = ((days - ms.days) / (nextMs.days - ms.days)) * 100;

            var hasMarker = segFill > 0 && segFill < 100;
            html += '<div class="v0-milestone-segment">';
            html += '<div class="v0-milestone-segment-fill" style="width:' + segFill + '%"></div>';
            if (hasMarker) {
                html += '<div class="v0-milestone-marker" style="left:' + segFill + '%">';
                html += '<div class="v0-milestone-marker-dot"></div>';
                html += '<div class="v0-milestone-marker-label">Day ' + days + '</div>';
                html += '</div>';
            }
            html += '</div>';
        }
    }
    html += '</div>';
    return html;
}

function buildBadgeHTML() {
    return '<dotlottie-wc src="../Fire Streak Orange.lottie" autoplay loop class="v0-streak-lottie"></dotlottie-wc>' +
        '<span class="v0-streak-text">SmartRent: Day ' + V0_STREAK.currentDays + '</span>';
}

function buildMiniProgressHTML() {
    var tier = getStreakTier(V0_STREAK.currentDays);
    var currentRate = getCurrentRate();
    var savingsPct = Math.round(((V0_STREAK.baseRate - currentRate) / V0_STREAK.baseRate) * 100);
    var overall = 0;
    var maxDays = V0_STREAK.tiers[V0_STREAK.tiers.length - 1].days;
    overall = Math.min((V0_STREAK.currentDays / maxDays) * 100, 100);

    var label = '';
    if (!tier.next) {
        label = 'Max tier — saving ' + savingsPct + '%';
    } else {
        var daysLeft = tier.next.days - V0_STREAK.currentDays;
        label = daysLeft + 'd to ₹' + tier.next.rate + '/day';
    }

    return '<div class="v0-mini-progress">' +
        '<div class="v0-mini-bar"><div class="v0-mini-fill" style="width:' + overall + '%"></div></div>' +
        '<div class="v0-mini-label">' + label + '</div>' +
        '</div>';
}

// ========== LAYOUT A: Frame the card ==========
function renderLayoutA() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-a';

    // Top: streak badge on top border
    var top = document.getElementById('v0-sr-top');
    top.style.display = '';
    top.innerHTML = '<div class="v0-frame-top">' +
        '<div class="v0-streak-badge">' + buildBadgeHTML() + '</div>' +
        '<button class="v0-info-trigger-circle" onclick="event.stopPropagation(); openExplainer()" aria-label="About SmartRent">' +
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5.5v-.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '</button></div>';

    // Bottom: milestone track on bottom border
    var bottom = document.getElementById('v0-sr-bottom');
    bottom.style.display = '';
    bottom.innerHTML = buildMilestoneTrackHTML(false);

    // Hide inner zones
    document.getElementById('v0-sr-inner-top').style.display = 'none';
    document.getElementById('v0-sr-inner-bottom').style.display = 'none';
}

// ========== LAYOUT B: Unified top banner ==========
function renderLayoutB() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-b';

    // Inner top: badge + inline milestones
    var innerTop = document.getElementById('v0-sr-inner-top');
    innerTop.style.display = '';
    innerTop.innerHTML = '<div class="v0-unified-top">' +
        '<div class="v0-unified-top-header">' +
            '<div class="v0-streak-badge">' + buildBadgeHTML() + '</div>' +
            '<button class="v0-info-trigger-circle" onclick="event.stopPropagation(); openExplainer()" aria-label="About SmartRent">' +
                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5.5v-.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            '</button></div>' +
        buildMilestoneTrackHTML(true) +
        '</div>';

    // Hide outer zones and inner bottom
    document.getElementById('v0-sr-top').style.display = 'none';
    document.getElementById('v0-sr-bottom').style.display = 'none';
    document.getElementById('v0-sr-inner-bottom').style.display = 'none';
}

// ========== LAYOUT C: Unified bottom only ==========
function renderLayoutC() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-c';

    // Inner bottom: fire icon integrated into milestone section
    var innerBottom = document.getElementById('v0-sr-inner-bottom');
    innerBottom.style.display = '';
    innerBottom.innerHTML = '<div class="v0-unified-bottom">' +
        '<div class="v0-unified-bottom-header">' +
            '<dotlottie-wc src="../Fire Streak Orange.lottie" autoplay loop class="v0-streak-lottie-sm"></dotlottie-wc>' +
            '<span class="v0-unified-bottom-title">SmartRent: Day ' + V0_STREAK.currentDays + '</span>' +
            '<button class="v0-info-trigger-circle" onclick="event.stopPropagation(); openExplainer()" aria-label="About SmartRent">' +
                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5.5v-.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            '</button></div>' +
        buildMilestoneTrackHTML(false) +
        '</div>';

    // Hide everything else
    document.getElementById('v0-sr-top').style.display = 'none';
    document.getElementById('v0-sr-bottom').style.display = 'none';
    document.getElementById('v0-sr-inner-top').style.display = 'none';
}

// ========== LAYOUT D: Floating collar ==========
function renderLayoutD() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-d';

    // Top: collar that straddles the card edge
    var top = document.getElementById('v0-sr-top');
    top.style.display = '';
    top.innerHTML = '<div class="v0-collar">' +
        '<dotlottie-wc src="../Fire Streak Orange.lottie" autoplay loop class="v0-streak-lottie-sm"></dotlottie-wc>' +
        '<span class="v0-collar-text">SmartRent: Day ' + V0_STREAK.currentDays + '</span>' +
        buildMiniProgressHTML() +
        '<button class="v0-info-trigger-circle v0-collar-info" onclick="event.stopPropagation(); openExplainer()" aria-label="About SmartRent">' +
            '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5.5v-.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '</button></div>';

    // Hide everything else
    document.getElementById('v0-sr-bottom').style.display = 'none';
    document.getElementById('v0-sr-inner-top').style.display = 'none';
    document.getElementById('v0-sr-inner-bottom').style.display = 'none';
}

// ========== LAYOUT E: Unified warm header (badge + milestones in card top) ==========
function renderLayoutE() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-e';

    // Inner top: warm zone with large capsule badge + milestones below
    var innerTop = document.getElementById('v0-sr-inner-top');
    innerTop.style.display = '';
    innerTop.innerHTML = '<div class="v0-warm-header">' +
        '<div class="v0-warm-header-row">' +
            '<div class="v0-warm-badge">' +
                '<dotlottie-wc src="../Fire Streak Orange.lottie" autoplay loop class="v0-streak-lottie"></dotlottie-wc>' +
                '<span class="v0-warm-badge-text">SmartRent: Day ' + V0_STREAK.currentDays + '</span>' +
            '</div>' +
            '<button class="v0-info-trigger-circle" onclick="event.stopPropagation(); openExplainer()" aria-label="About SmartRent">' +
                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5.5v-.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            '</button>' +
        '</div>' +
        '<div class="v0-warm-milestones">' + buildMilestoneTrackHTML(false) + '</div>' +
    '</div>';

    // Hide all other zones
    document.getElementById('v0-sr-top').style.display = 'none';
    document.getElementById('v0-sr-bottom').style.display = 'none';
    document.getElementById('v0-sr-inner-bottom').style.display = 'none';
}

// ========== LAYOUT F: Simple benefit-first (CTO feedback) ==========
function renderLayoutF() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-f';

    var tier = getStreakTier(V0_STREAK.currentDays);
    var currentRate = getCurrentRate();
    var days = V0_STREAK.currentDays;

    // Build the benefit message
    var rateHTML = '';
    var subtitleHTML = '';
    var nudgeHTML = '';

    if (currentRate < V0_STREAK.baseRate) {
        // User has a discount
        rateHTML = '<span class="v0-bf-strike">' + V0_STREAK.baseRate + '/day</span>' +
            '<span class="v0-bf-rate">' + currentRate + '/day</span>';
        subtitleHTML = 'Your reward for ' + days + ' days with Bounce';
    } else {
        // No discount yet
        rateHTML = '<span class="v0-bf-rate">' + V0_STREAK.baseRate + '/day</span>';
        subtitleHTML = days + ' days with Bounce — keep going!';
    }

    if (tier.next) {
        var daysLeft = tier.next.days - days;
        nudgeHTML = '<div class="v0-bf-nudge">' + daysLeft + ' more days to unlock ₹' + tier.next.rate + '/day</div>';
    } else {
        nudgeHTML = '<div class="v0-bf-nudge v0-bf-nudge--max">Lowest rate unlocked</div>';
    }

    var innerTop = document.getElementById('v0-sr-inner-top');
    innerTop.style.display = '';
    innerTop.innerHTML = '<div class="v0-benefit-first">' +
        '<div class="v0-bf-main">' +
            '<div class="v0-bf-left">' +
                '<dotlottie-wc src="../Fire Streak Orange.lottie" autoplay loop class="v0-streak-lottie"></dotlottie-wc>' +
            '</div>' +
            '<div class="v0-bf-content">' +
                '<div class="v0-bf-prices">₹' + rateHTML + '</div>' +
                '<div class="v0-bf-subtitle">' + subtitleHTML + '</div>' +
            '</div>' +
            '<button class="v0-info-trigger-circle" onclick="event.stopPropagation(); openExplainer()" aria-label="About SmartRent">' +
                '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5.5v-.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
            '</button>' +
        '</div>' +
        nudgeHTML +
    '</div>';

    // Hide all other zones
    document.getElementById('v0-sr-top').style.display = 'none';
    document.getElementById('v0-sr-bottom').style.display = 'none';
    document.getElementById('v0-sr-inner-bottom').style.display = 'none';
}

// ========== LAYOUT G: Minimal one-liner ==========
function renderLayoutG() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-g';

    var currentRate = getCurrentRate();
    var days = V0_STREAK.currentDays;
    var hasDiscount = currentRate < V0_STREAK.baseRate;

    var priceHTML = hasDiscount
        ? '<span class="v0-mg-strike">₹' + V0_STREAK.baseRate + '</span> <span class="v0-mg-rate">₹' + currentRate + '/day</span>'
        : '<span class="v0-mg-rate">₹' + V0_STREAK.baseRate + '/day</span>';

    var tagHTML = '<span class="v0-mg-tag">SmartRent</span>';

    var innerTop = document.getElementById('v0-sr-inner-top');
    innerTop.style.display = '';
    innerTop.innerHTML = '<div class="v0-minimal-g">' +
        '<dotlottie-wc src="../Fire Streak Orange.lottie" autoplay loop class="v0-mg-lottie"></dotlottie-wc>' +
        '<div class="v0-mg-body">' + priceHTML + tagHTML + '</div>' +
        '<button class="v0-info-trigger-circle" onclick="event.stopPropagation(); openExplainer()" aria-label="About SmartRent">' +
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5.5v-.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '</button>' +
    '</div>';

    document.getElementById('v0-sr-top').style.display = 'none';
    document.getElementById('v0-sr-bottom').style.display = 'none';
    document.getElementById('v0-sr-inner-bottom').style.display = 'none';
}

// ========== LAYOUT H: Savings-focused one-liner ==========
function renderLayoutH() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-h';

    var currentRate = getCurrentRate();
    var hasDiscount = currentRate < V0_STREAK.baseRate;
    var saving = V0_STREAK.baseRate - currentRate;

    var textHTML = hasDiscount
        ? '<span class="v0-sh-text">Saving <strong>\u20B9' + saving + '/day</strong> with SmartRent</span>'
        : '<span class="v0-sh-text">Stay longer, pay less with <strong>SmartRent</strong></span>';

    var innerTop = document.getElementById('v0-sr-inner-top');
    innerTop.style.display = '';
    innerTop.innerHTML = '<div class="v0-savings-h">' +
        '<dotlottie-wc src="../Fire Streak Orange.lottie" autoplay loop class="v0-sh-lottie"></dotlottie-wc>' +
        textHTML +
        '<button class="v0-info-trigger-circle" onclick="event.stopPropagation(); openExplainer()" aria-label="About SmartRent">' +
            '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v4M8 5.5v-.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '</button>' +
    '</div>';

    document.getElementById('v0-sr-top').style.display = 'none';
    document.getElementById('v0-sr-bottom').style.display = 'none';
    document.getElementById('v0-sr-inner-bottom').style.display = 'none';
}

// ========== LAYOUT I: Just the streak label ==========
function renderLayoutI() {
    var wrapper = document.getElementById('v0-card-wrapper');
    wrapper.className = 'v0-card-wrapper layout-i';

    var innerTop = document.getElementById('v0-sr-inner-top');
    innerTop.style.display = '';
    innerTop.innerHTML = '<div class="v0-just-label">' +
        '<dotlottie-wc src="../Fire Streak Orange.lottie" autoplay loop class="v0-jl-lottie"></dotlottie-wc>' +
        '<span class="v0-jl-text">SmartRent: Day ' + V0_STREAK.currentDays + '</span>' +
    '</div>';

    document.getElementById('v0-sr-top').style.display = 'none';
    document.getElementById('v0-sr-bottom').style.display = 'none';
    document.getElementById('v0-sr-inner-bottom').style.display = 'none';
}

function switchLayout(layout) {
    currentLayout = layout;

    // Update active button
    document.querySelectorAll('.v0-layout-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.textContent.charAt(0).toLowerCase() === layout);
    });

    // Render selected layout
    if (layout === 'a') renderLayoutA();
    else if (layout === 'b') renderLayoutB();
    else if (layout === 'c') renderLayoutC();
    else if (layout === 'd') renderLayoutD();
    else if (layout === 'e') renderLayoutE();
    else if (layout === 'f') renderLayoutF();
    else if (layout === 'g') renderLayoutG();
    else if (layout === 'h') renderLayoutH();
    else if (layout === 'i') renderLayoutI();
}

function renderStreakBadge() {
    // Now handled by switchLayout
}

function renderProgressBar() {
    // Now handled by switchLayout
    switchLayout(currentLayout);
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

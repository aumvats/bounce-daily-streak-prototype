// ========== V2 STREAK DASHBOARD ==========

function openDashboardV2() {
    var dashboard = document.getElementById('v2Dashboard');
    if (!dashboard) return;

    dashboard.classList.remove('is-closing');
    dashboard.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Populate all sections
    populateDashboardHero();
    renderWeekStrip();
    renderMonthHeatmap();
    renderJourneyRoad();
    populateShieldCard();
    populateStats();

    // Apply Lottie filter
    var tier = getTier(V2_CONFIG.currentStreak);
    var dashLottie = document.getElementById('v2DashLottie');
    if (dashLottie && tier) {
        dashLottie.style.filter = getLottieFilter(tier.id);
    }
}

function closeDashboardV2() {
    var dashboard = document.getElementById('v2Dashboard');
    if (!dashboard) return;

    dashboard.classList.add('is-closing');

    setTimeout(function () {
        dashboard.classList.remove('is-active');
        dashboard.classList.remove('is-closing');
        document.body.style.overflow = 'auto';
    }, 350);
}

function populateDashboardHero() {
    var streak = V2_CONFIG.currentStreak;
    var tier = getTier(streak);

    var countEl = document.getElementById('v2DashCount');
    if (countEl) countEl.textContent = streak;

    var tierEl = document.getElementById('v2DashTier');
    if (tierEl && tier) {
        tierEl.textContent = tier.emoji + ' ' + tier.label;
        tierEl.style.display = '';
    } else if (tierEl) {
        tierEl.style.display = 'none';
    }
}

function renderWeekStrip() {
    var strip = document.getElementById('v2WeekStrip');
    if (!strip) return;
    strip.innerHTML = '';

    var weekData = computeWeekStrip();

    weekData.forEach(function (day, index) {
        var dayEl = document.createElement('div');
        dayEl.className = 'v2-week-day' + (day.isToday ? ' v2-week-day--today' : '');

        var circle = document.createElement('div');
        circle.className = 'v2-week-day__circle v2-week-day__circle--' + day.status;

        // Content based on status
        if (day.status === 'done') {
            circle.textContent = '✓';
        } else if (day.status === 'missed') {
            circle.textContent = '✕';
        } else if (day.status === 'today') {
            circle.innerHTML = '<span style="font-size:16px;">🔥</span>';
        }

        // Staggered animation
        circle.style.animation = 'v2-cell-appear 0.3s ease-out ' + (index * 0.05) + 's both';

        var label = document.createElement('div');
        label.className = 'v2-week-day__label';
        label.textContent = day.label;

        dayEl.appendChild(circle);
        dayEl.appendChild(label);
        strip.appendChild(dayEl);
    });
}

function renderMonthHeatmap() {
    var grid = document.getElementById('v2HeatmapGrid');
    var titleEl = document.getElementById('v2HeatmapTitle');
    var labelsEl = document.getElementById('v2HeatmapLabels');
    if (!grid) return;

    var data = computeMonthHeatmap();

    if (titleEl) titleEl.textContent = data.monthLabel;

    // Day labels
    if (labelsEl) {
        labelsEl.innerHTML = '';
        var labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        labels.forEach(function (l) {
            var el = document.createElement('div');
            el.className = 'v2-dashboard__heatmap-day-label';
            el.textContent = l;
            labelsEl.appendChild(el);
        });
    }

    // Grid cells
    grid.innerHTML = '';
    data.cells.forEach(function (cell, index) {
        var cellEl = document.createElement('div');
        var classes = ['v2-heatmap-cell'];

        if (cell.status === 'empty') {
            classes.push('v2-heatmap-cell--empty');
        } else if (cell.status === 'active') {
            classes.push('v2-heatmap-cell--active');
        } else if (cell.status === 'missed') {
            classes.push('v2-heatmap-cell--missed');
        } else if (cell.status === 'future') {
            classes.push('v2-heatmap-cell--future');
        }

        if (cell.isToday) {
            classes.push('v2-heatmap-cell--today');
        }

        cellEl.className = classes.join(' ');

        if (cell.date) {
            cellEl.textContent = cell.date;
        }

        // Staggered animation
        cellEl.style.animation = 'v2-cell-appear 0.2s ease-out ' + (index * 0.02) + 's both';

        grid.appendChild(cellEl);
    });
}

function renderJourneyRoad() {
    var road = document.getElementById('v2JourneyRoad');
    if (!road) return;

    var streak = V2_CONFIG.currentStreak;
    var allNodes = [{ days: 0, icon: '🚀', label: 'Start', reward: '', isMilestone: false }];

    V2_MILESTONES.forEach(function (m) {
        allNodes.push({
            days: m.days,
            icon: m.icon,
            label: m.days + ' Days',
            reward: m.reward,
            isMilestone: true
        });
    });

    // Calculate progress percentage
    var maxDays = V2_MILESTONES[V2_MILESTONES.length - 1].days;
    var progressPercent = Math.min((streak / maxDays) * 100, 100);

    // Calculate path fill width
    var totalNodeSpacing = allNodes.length - 1;
    var fillSegments = 0;
    for (var i = 1; i < allNodes.length; i++) {
        if (streak >= allNodes[i].days) {
            fillSegments = i;
        } else if (streak > allNodes[i - 1].days) {
            // Partial segment
            var segmentRange = allNodes[i].days - allNodes[i - 1].days;
            var progressInSegment = streak - allNodes[i - 1].days;
            fillSegments = (i - 1) + (progressInSegment / segmentRange);
            break;
        }
    }
    var fillPercent = (fillSegments / totalNodeSpacing) * 100;

    // Build HTML
    var html = '<div class="v2-journey__track">';
    html += '<div class="v2-journey__path-line"></div>';
    html += '<div class="v2-journey__path-fill" style="width: ' + fillPercent + '%;"></div>';

    allNodes.forEach(function (node) {
        var isCompleted = streak >= node.days && node.days > 0;
        var isCurrent = false;

        // Find if this is the current milestone
        if (node.isMilestone) {
            var nextMilestone = getNextMilestone();
            if (!nextMilestone && streak >= node.days) {
                // All milestones done, last one is "current"
                var lastMilestone = V2_MILESTONES[V2_MILESTONES.length - 1];
                isCurrent = node.days === lastMilestone.days;
            } else {
                var currentMilestone = getCurrentMilestone();
                isCurrent = currentMilestone && node.days === currentMilestone.days;
            }
        }

        var isStart = node.days === 0;
        var isLocked = !isCompleted && !isCurrent && !isStart;

        var stateClass = '';
        if (isStart) stateClass = 'v2-journey__node--completed';
        else if (isCurrent) stateClass = 'v2-journey__node--current';
        else if (isCompleted) stateClass = 'v2-journey__node--completed';
        else stateClass = 'v2-journey__node--locked';

        html += '<div class="v2-journey__node ' + stateClass + '"' +
            (isCurrent ? ' id="v2JourneyCurrentNode"' : '') + '>';

        // YOU badge for current
        if (isCurrent) {
            html += '<div class="v2-journey__node-you" aria-label="You are here">YOU</div>';
        }

        html += '<div class="v2-journey__node-circle">';
        if (isCompleted && !isCurrent) {
            html += '<span class="v2-journey__node-checkmark">✓</span>';
        } else {
            html += node.icon;
        }
        html += '</div>';

        html += '<div class="v2-journey__node-label">' + node.label + '</div>';

        if (node.reward) {
            html += '<div class="v2-journey__node-reward">' + node.reward + '</div>';
        }

        if (isLocked && node.isMilestone) {
            var daysLeft = node.days - streak;
            html += '<div class="v2-journey__node-remaining">' + daysLeft + 'd left</div>';
        }

        html += '</div>';
    });

    html += '</div>';
    road.innerHTML = html;

    // Auto-scroll to current node
    setTimeout(function () {
        var currentNode = document.getElementById('v2JourneyCurrentNode');
        if (currentNode) {
            currentNode.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, 400);
}

function populateShieldCard() {
    var shieldNumber = document.querySelector('.v2-dashboard__shield-number');
    if (shieldNumber) {
        shieldNumber.textContent = V2_CONFIG.restoresLeft;
    }
}

function populateStats() {
    var currentEl = document.getElementById('v2StatCurrent');
    var longestEl = document.getElementById('v2StatLongest');
    var discountEl = document.getElementById('v2StatDiscount');

    if (currentEl) currentEl.textContent = V2_CONFIG.currentStreak;
    if (longestEl) longestEl.textContent = V2_CONFIG.longestStreak;

    var discount = getActiveDiscountV2();
    if (discountEl) discountEl.textContent = discount > 0 ? discount + '%' : '—';
}

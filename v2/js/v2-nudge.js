// ========== V2 NUDGE TOAST SYSTEM ==========

var v2NudgeTimer = null;

function showNudge(type, data) {
    data = data || {};
    var messages = V2_NUDGE_MESSAGES[type];
    if (!messages || messages.length === 0) return;

    var message = messages[Math.floor(Math.random() * messages.length)];

    // Interpolate variables
    message = message.replace('{days}', data.days || V2_CONFIG.currentStreak);
    message = message.replace('{remaining}', data.remaining || '');
    message = message.replace('{discount}', data.discount || '');

    var nudge = document.getElementById('v2Nudge');
    var textEl = document.getElementById('v2NudgeText');
    if (!nudge || !textEl) return;

    textEl.textContent = message;

    // Pick icon based on type
    var iconEl = nudge.querySelector('.v2-nudge__icon');
    if (iconEl) {
        var icons = {
            encouragement: '🔥',
            milestoneClose: '🎯',
            comeBack: '🔄',
            newUser: '🚀'
        };
        iconEl.textContent = icons[type] || '🔥';
    }

    nudge.classList.add('is-visible');

    // Auto-dismiss after 4 seconds
    clearTimeout(v2NudgeTimer);
    v2NudgeTimer = setTimeout(function () {
        dismissNudge();
    }, 4000);
}

function dismissNudge() {
    var nudge = document.getElementById('v2Nudge');
    if (nudge) {
        nudge.classList.remove('is-visible');
    }
    clearTimeout(v2NudgeTimer);
}

function scheduleContextualNudges() {
    var streak = V2_CONFIG.currentStreak;

    if (streak === 0 && V2_CONFIG.longestStreak > 0) {
        // Lapsed user
        setTimeout(function () {
            showNudge('comeBack');
        }, 2000);
    } else if (streak === 0) {
        // New user
        setTimeout(function () {
            showNudge('newUser');
        }, 2000);
    } else {
        // Active user - check if close to milestone
        var next = getNextMilestone();
        if (next && next.daysRemaining <= 3) {
            setTimeout(function () {
                showNudge('milestoneClose', {
                    remaining: next.daysRemaining,
                    discount: next.milestone.discount
                });
            }, 3000);
        } else {
            setTimeout(function () {
                showNudge('encouragement', { days: streak });
            }, 5000);
        }
    }
}

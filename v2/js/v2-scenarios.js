// ========== V2 SCENARIO TOOLBAR ==========

var V2_PRESET_SCENARIOS = {
    newUser: {
        label: 'New User',
        currentStreak: 0,
        longestStreak: 0,
        hasNewMilestone: false,
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
        label: 'Building',
        currentStreak: 5,
        longestStreak: 5,
        hasNewMilestone: false,
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
        hasNewMilestone: true,
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
        hasNewMilestone: true,
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
        hasNewMilestone: true,
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
        hasNewMilestone: true,
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
        hasNewMilestone: false,
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

function applyScenarioV2(name) {
    var scenario = V2_PRESET_SCENARIOS[name];
    if (!scenario) return;

    V2_CONFIG.currentStreak = scenario.currentStreak;
    V2_CONFIG.longestStreak = scenario.longestStreak;
    V2_CONFIG.hasNewMilestone = scenario.hasNewMilestone;
    V2_CONFIG.restoresLeft = scenario.restoresLeft;
    V2_CONFIG.activityDays = scenario.activityDays.slice();
    V2_CONFIG.celebrationSeen = false;

    // Set tier
    setStreakTier(scenario.currentStreak);

    // Refresh UI
    resetPricesV2();
    initBadgeV2();
    applyDiscountsV2();

    // Close dashboard if open
    var dashboard = document.getElementById('v2Dashboard');
    if (dashboard && dashboard.classList.contains('is-active')) {
        closeDashboardV2();
    }

    // Show celebration
    setTimeout(function () {
        showCelebrationV2();
    }, 300);

    // Update active button state
    document.querySelectorAll('#v2ScenarioButtons .scenario-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.scenario === name);
    });
}

function renderScenarioToolbarV2() {
    var container = document.getElementById('v2ScenarioButtons');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(V2_PRESET_SCENARIOS).forEach(function (key) {
        var scenario = V2_PRESET_SCENARIOS[key];
        var btn = document.createElement('button');
        btn.className = 'scenario-btn';
        btn.dataset.scenario = key;
        btn.textContent = scenario.label;
        if (key === 'regularRider') btn.classList.add('active');
        btn.addEventListener('click', function () {
            applyScenarioV2(key);
        });
        container.appendChild(btn);
    });
}

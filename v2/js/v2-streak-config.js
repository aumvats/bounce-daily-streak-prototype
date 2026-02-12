// ========== V2 STREAK CONFIGURATION ==========

// ===== TIER DEFINITIONS =====
const V2_TIERS = [
    { id: 'orange', minDays: 1, maxDays: 6, label: 'Starter Rider', emoji: '🔥' },
    { id: 'redorange', minDays: 7, maxDays: 14, label: 'Rising Rider', emoji: '🔥' },
    { id: 'blue', minDays: 15, maxDays: 29, label: 'Consistent Rider', emoji: '💎' },
    { id: 'purple', minDays: 30, maxDays: 59, label: 'Champion Rider', emoji: '👑' },
    { id: 'gold', minDays: 60, maxDays: Infinity, label: 'Legend Rider', emoji: '⚡' },
];

// ===== MILESTONE DEFINITIONS =====
const V2_MILESTONES = [
    { days: 7, discount: 5, reward: '5% off next renewal', icon: '⭐', bonusText: null },
    { days: 15, discount: 10, reward: '10% off next renewal', icon: '🔥', bonusText: null },
    { days: 30, discount: 15, reward: '15% off + free helmet rental', icon: '🏆', bonusText: 'Free helmet' },
    { days: 60, discount: 20, reward: '20% off + priority support', icon: '👑', bonusText: 'VIP support' },
];

// ===== HINGLISH CELEBRATION MESSAGES =====
const V2_CELEBRATION_MESSAGES = {
    7: [
        'Kya baat hai! 🎉',
        '7 din, non-stop ride!',
        'Pehla milestone unlock ho gaya!'
    ],
    15: [
        '15 din ka kamaal! 🔥',
        'Delivery king ban rahe ho!',
        'Zabardast! Rukte nahi ho tum!'
    ],
    30: [
        '30 din! Champion rider! 🏆',
        'Ek mahina, full power!',
        'Boss level rider ho tum!'
    ],
    60: [
        '60 din! Legend status! 👑',
        'Do mahine ka zabardast streak!',
        'Sabse aage, sabse tez!'
    ],
    default: [
        'Mast chal raha hai! 💪',
        'Ruk mat, aage badh!',
        'Har din ride = zyada savings!'
    ]
};

// ===== SOCIAL PROOF STATS =====
const V2_SOCIAL_PROOF = {
    7: 'Sirf 35% riders yahan tak pahunchte hain',
    15: 'Top 20% riders mein aap ho!',
    30: 'Top 5% riders! Bohot kam log yahan tak aate hain',
    60: 'Top 1%! Aap legend rider ho!',
};

// ===== NUDGE MESSAGES =====
const V2_NUDGE_MESSAGES = {
    encouragement: [
        '{days} din ka streak! Keep going! 💪',
        'Har din ride = zyada savings! 🤑',
        'Fire streak! Ruk mat! 🔥',
    ],
    milestoneClose: [
        'Bas {remaining} din aur, phir {discount}% off milega! 🎯',
        '{remaining} din mein next reward unlock hoga!',
        'Itne paas ho! {remaining} din aur bas!',
    ],
    comeBack: [
        'Wapas aao! Naya streak start karo 🔄',
        'Ek ride se sab shuru hota hai. Aaj se phir se!',
        'Miss kar diya? Koi nahi, aaj se restart!',
    ],
    newUser: [
        'Pehli ride karo, streak shuru hoga! 🚀',
        'Daily ride karo, discounts unlock karo!',
    ]
};

// ===== CONFIGURATION OBJECT =====
const V2_CONFIG = {
    currentStreak: 15,
    longestStreak: 22,
    hasNewMilestone: true,
    celebrationSeen: false,
    restoresLeft: 1,
    maxRestores: 3,
    userName: 'Rider',
    activityDays: [
        1, 1, 1, 0, 1, 1, 1,
        1, 1, 0, 1, 1, 1, 1,
        1, 1, 0, 0, 1, 1, 1,
        1, 1, 1, 1, 0, 1, 1,
        1, 1
    ],
};

// ===== CORE FUNCTIONS =====

function getTier(days) {
    if (days <= 0) return null;
    for (const tier of V2_TIERS) {
        if (days >= tier.minDays && days <= tier.maxDays) return tier;
    }
    return V2_TIERS[V2_TIERS.length - 1];
}

function setStreakTier(days) {
    const tier = getTier(days);
    if (tier) {
        document.body.setAttribute('data-streak-tier', tier.id);
    } else {
        document.body.removeAttribute('data-streak-tier');
    }
}

function getActiveDiscountV2() {
    const streak = V2_CONFIG.currentStreak;
    let discount = 0;
    for (const m of V2_MILESTONES) {
        if (streak >= m.days) discount = m.discount;
    }
    return discount;
}

function calcDiscountedPriceV2(originalPrice) {
    const discount = getActiveDiscountV2();
    if (discount === 0) return { original: originalPrice, discounted: originalPrice, discount: 0, savings: 0 };
    const discounted = Math.round(originalPrice * (1 - discount / 100));
    return { original: originalPrice, discounted, discount, savings: originalPrice - discounted };
}

function getNextMilestone() {
    const streak = V2_CONFIG.currentStreak;
    for (const m of V2_MILESTONES) {
        if (streak < m.days) {
            return { milestone: m, daysRemaining: m.days - streak };
        }
    }
    return null;
}

function getCurrentMilestone() {
    const streak = V2_CONFIG.currentStreak;
    let current = null;
    for (const m of V2_MILESTONES) {
        if (streak >= m.days) current = m;
    }
    return current;
}

function getCelebrationMessage(days) {
    // Find the milestone bracket
    let bracket = null;
    for (const m of V2_MILESTONES) {
        if (days >= m.days) bracket = m.days;
    }
    const messages = V2_CELEBRATION_MESSAGES[bracket] || V2_CELEBRATION_MESSAGES.default;
    return messages[Math.floor(Math.random() * messages.length)];
}

function getSocialProof(days) {
    let proof = null;
    for (const key of Object.keys(V2_SOCIAL_PROOF).sort((a, b) => b - a)) {
        if (days >= parseInt(key)) {
            proof = V2_SOCIAL_PROOF[key];
            break;
        }
    }
    return proof;
}

function computeWeekStrip() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekDays = [];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + mondayOffset + i);

        const daysAgo = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        const isToday = daysAgo === 0;
        const isFuture = date > today && !isToday;

        let status;
        if (isFuture) {
            status = 'upcoming';
        } else if (isToday) {
            status = V2_CONFIG.activityDays[V2_CONFIG.activityDays.length - 1] ? 'done' : 'today';
        } else {
            const activityIndex = V2_CONFIG.activityDays.length - 1 - daysAgo;
            status = activityIndex >= 0 && V2_CONFIG.activityDays[activityIndex] ? 'done' : 'missed';
        }

        weekDays.push({
            label: dayLabels[i],
            date: date,
            status: status,
            isToday: isToday
        });
    }

    return weekDays;
}

function computeMonthHeatmap() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const todayDate = today.getDate();

    // Day of week for first day (0=Sun -> shift to Mon=0)
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const cells = [];

    // Empty padding cells for days before the 1st
    for (let i = 0; i < startDow; i++) {
        cells.push({ date: null, status: 'empty', intensity: 0 });
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const isFuture = d > todayDate;
        const isToday = d === todayDate;
        const daysAgo = todayDate - d;
        const activityIndex = V2_CONFIG.activityDays.length - 1 - daysAgo;

        let status;
        if (isFuture) {
            status = 'future';
        } else if (activityIndex >= 0 && activityIndex < V2_CONFIG.activityDays.length && V2_CONFIG.activityDays[activityIndex]) {
            status = 'active';
        } else if (!isFuture) {
            status = 'missed';
        }

        cells.push({
            date: d,
            status: status,
            isToday: isToday,
            intensity: status === 'active' ? 1 : 0
        });
    }

    return { monthLabel, cells };
}

function getLottieFilter(tierId) {
    switch (tierId) {
        case 'orange': return 'none';
        case 'redorange': return 'hue-rotate(-10deg) saturate(1.3)';
        case 'blue': return 'hue-rotate(200deg) saturate(1.3)';
        case 'purple': return 'hue-rotate(260deg) saturate(1.2)';
        case 'gold': return 'hue-rotate(340deg) saturate(1.5) brightness(1.2)';
        default: return 'none';
    }
}

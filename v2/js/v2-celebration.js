// ========== V2 CELEBRATION POPUP ==========

var v2ConfettiEngine = null;

function showCelebrationV2() {
    if (!V2_CONFIG.hasNewMilestone || V2_CONFIG.celebrationSeen) return;
    if (getActiveDiscountV2() === 0) return;

    var overlay = document.getElementById('v2Celebration');
    if (!overlay) return;

    var streak = V2_CONFIG.currentStreak;
    var tier = getTier(streak);

    // Reset steps
    document.getElementById('v2CelebStep1').classList.add('is-visible');
    document.getElementById('v2CelebStep2').classList.remove('is-visible');
    document.getElementById('v2CelebStep3').classList.remove('is-visible');

    // Reset gift box
    var giftBox = document.getElementById('v2GiftBox');
    if (giftBox) {
        giftBox.classList.remove('is-opened');
        giftBox.style.display = '';
    }

    // Apply Lottie filter
    var celebLottie = document.getElementById('v2CelebLottie');
    if (celebLottie && tier) {
        celebLottie.style.filter = getLottieFilter(tier.id);
    }

    // Show overlay
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Animate count up
    var countEl = document.getElementById('v2CelebCount');
    if (countEl) {
        animateCountUp(countEl, streak, 800);
    }

    // Set celebration message
    var titleEl = document.getElementById('v2CelebrationTitle');
    if (titleEl) {
        titleEl.textContent = getCelebrationMessage(streak);
    }

    // Set social proof
    var proofEl = document.getElementById('v2SocialProof');
    var proofText = getSocialProof(streak);
    if (proofEl) {
        if (proofText) {
            proofEl.textContent = proofText;
            proofEl.style.display = '';
        } else {
            proofEl.style.display = 'none';
        }
    }

    // Calculate price info
    var heroPrice = parseInt(document.querySelector('.hero-plan-card')?.getAttribute('data-price') || '1749');
    var priceInfo = calcDiscountedPriceV2(heroPrice);

    // Set price elements
    document.getElementById('v2SavingsTag').textContent = priceInfo.discount + '% OFF';
    document.getElementById('v2PriceOld').textContent = '₹' + priceInfo.original;
    document.getElementById('v2PriceNew').textContent = '₹' + priceInfo.discounted;
    document.getElementById('v2SavingsAmount').textContent = 'Aapne ₹' + priceInfo.savings + ' bachaye! 🎉';

    // Launch confetti
    if (!v2ConfettiEngine) {
        v2ConfettiEngine = new ConfettiEngine('v2ConfettiCanvas');
    }

    var particleCount = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? 80 : 150;
    setTimeout(function () {
        v2ConfettiEngine.launchV2(particleCount);
    }, 500);

    // Show gift box after a delay
    setTimeout(function () {
        document.getElementById('v2CelebStep2').classList.add('is-visible');
    }, 1800);
}

function animateCountUp(el, target, duration) {
    var start = 0;
    var startTime = null;

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var easedProgress = easeOutExpo(progress);
        var current = Math.round(easedProgress * target);

        el.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function revealGiftBox() {
    var giftBox = document.getElementById('v2GiftBox');
    if (!giftBox || giftBox.classList.contains('is-opened')) return;

    giftBox.classList.add('is-opened');

    // After gift animation, show savings card
    setTimeout(function () {
        giftBox.style.display = 'none';
        document.getElementById('v2CelebStep2').classList.remove('is-visible');
        document.getElementById('v2CelebStep3').classList.add('is-visible');

        // Burst more confetti for the reveal
        if (v2ConfettiEngine) {
            var count = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ? 40 : 80;
            v2ConfettiEngine.launchV2(count);
        }
    }, 600);
}

function claimDiscountV2() {
    V2_CONFIG.celebrationSeen = true;
    dismissCelebrationV2();

    // Show a confirmation nudge
    setTimeout(function () {
        showNudge('encouragement', { days: V2_CONFIG.currentStreak });
    }, 500);
}

function dismissCelebrationV2() {
    V2_CONFIG.celebrationSeen = true;
    var overlay = document.getElementById('v2Celebration');
    if (!overlay) return;

    overlay.style.transition = 'opacity 0.3s ease-out';
    overlay.style.opacity = '0';

    setTimeout(function () {
        overlay.classList.remove('is-active');
        overlay.style.transition = '';
        overlay.style.opacity = '';
        document.body.style.overflow = 'auto';
        if (v2ConfettiEngine) v2ConfettiEngine.stop();
    }, 300);
}

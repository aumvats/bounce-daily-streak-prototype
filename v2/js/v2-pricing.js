// ========== V2 PRICING DISCOUNT INTEGRATION ==========

var v2OriginalPrices = {};

function applyDiscountsV2() {
    var discount = getActiveDiscountV2();
    if (discount === 0) return;

    // Regular plan cards
    document.querySelectorAll('.plan-card').forEach(function (card) {
        var originalPrice = parseInt(card.getAttribute('data-price'));
        var result = calcDiscountedPriceV2(originalPrice);
        var duration = card.getAttribute('data-duration');

        if (!v2OriginalPrices[duration]) {
            v2OriginalPrices[duration] = originalPrice;
        }

        var priceEl = card.querySelector('.plan-price');
        var priceBox = card.querySelector('.plan-price-box');

        if (priceEl) {
            priceEl.innerHTML =
                '<span class="v2-price-original">₹' + originalPrice + '</span>' +
                '<span class="plan-price v2-price-discounted v2-price-sparkle v2-price-reveal">₹' + result.discounted + '</span>';
        }

        // Add discount badge
        if (priceBox && !priceBox.querySelector('.v2-discount-badge')) {
            var badge = document.createElement('div');
            badge.className = 'v2-discount-badge';
            badge.innerHTML = '🔥 ' + discount + '% off';
            priceBox.appendChild(badge);
        }

        // Add savings callout
        if (priceBox && !priceBox.querySelector('.v2-savings-callout')) {
            var callout = document.createElement('div');
            callout.className = 'v2-savings-callout';
            callout.textContent = '₹' + result.savings + ' saved!';
            priceBox.appendChild(callout);
        }

        card.setAttribute('data-discounted-price', result.discounted);
    });

    // Hero card
    var heroCard = document.querySelector('.hero-plan-card');
    if (heroCard) {
        var heroOriginal = parseInt(heroCard.getAttribute('data-price'));
        var heroResult = calcDiscountedPriceV2(heroOriginal);

        if (!v2OriginalPrices['hero']) {
            v2OriginalPrices['hero'] = heroOriginal;
        }

        var heroBadge = heroCard.querySelector('.hero-badge');
        if (heroBadge) {
            heroBadge.innerHTML =
                '<span class="v2-price-original" style="font-size:12px;color:rgba(255,255,255,0.5);text-decoration-color:rgba(255,255,255,0.5);">₹' + heroOriginal + '/week</span>' +
                '<span class="v2-price-discounted v2-price-reveal" style="color:white;">₹' + heroResult.discounted + '/week</span>' +
                '<span class="v2-hero-discount-tag">' + discount + '% OFF</span>';
        }

        var heroDetails = heroCard.querySelector('.hero-details');
        if (heroDetails) {
            var perDay = Math.round(heroResult.discounted / 7);
            heroDetails.innerHTML = '<span style="color:rgba(255,255,255,0.4);text-decoration:line-through;">₹250/day</span> ₹' + perDay + '/day &bull; Unlimited km';
        }

        heroCard.setAttribute('data-discounted-price', heroResult.discounted);
    }

    // Bottom sheet option cards
    document.querySelectorAll('.review-sheet .option-card').forEach(function (optionCard) {
        var pricingEl = optionCard.querySelector('.option-pricing h3');
        if (!pricingEl) return;

        var priceText = pricingEl.textContent;
        var priceMatch = priceText.match(/₹(\d+)/);
        if (!priceMatch) return;

        var origPrice = parseInt(priceMatch[1]);
        var optResult = calcDiscountedPriceV2(origPrice);

        if (!pricingEl.querySelector('.v2-option-price-original')) {
            pricingEl.innerHTML =
                '<span class="v2-option-price-original">₹' + origPrice + '</span>' +
                '<span class="v2-option-price-new v2-price-reveal">₹' + optResult.discounted + '</span>';
        }

        var pricingContainer = optionCard.querySelector('.option-pricing');
        if (pricingContainer && !pricingContainer.querySelector('.v2-option-discount-tag')) {
            var tag = document.createElement('div');
            tag.className = 'v2-option-discount-tag';
            tag.textContent = '🔥 ' + discount + '% off';
            pricingContainer.appendChild(tag);
        }
    });
}

function resetPricesV2() {
    document.querySelectorAll('.plan-card').forEach(function (card) {
        var originalPrice = parseInt(card.getAttribute('data-price'));
        var priceEl = card.querySelector('.plan-price');
        var priceBox = card.querySelector('.plan-price-box');

        if (priceEl) {
            priceEl.innerHTML = '₹' + originalPrice;
            priceEl.classList.remove('v2-price-discounted');
        }

        if (priceBox) {
            var badge = priceBox.querySelector('.v2-discount-badge');
            if (badge) badge.remove();
            var callout = priceBox.querySelector('.v2-savings-callout');
            if (callout) callout.remove();
        }
    });

    var heroCard = document.querySelector('.hero-plan-card');
    if (heroCard) {
        var heroOriginal = parseInt(heroCard.getAttribute('data-price'));
        var heroBadge = heroCard.querySelector('.hero-badge');
        if (heroBadge) heroBadge.innerHTML = '₹' + heroOriginal + '/week';

        var heroDetails = heroCard.querySelector('.hero-details');
        if (heroDetails) heroDetails.textContent = '₹250/day \u2022 Unlimited km';
    }

    // Reset option cards
    document.querySelectorAll('.review-sheet .option-card').forEach(function (optionCard) {
        var pricingEl = optionCard.querySelector('.option-pricing h3');
        if (!pricingEl) return;
        var origEl = pricingEl.querySelector('.v2-option-price-original');
        if (origEl) {
            pricingEl.innerHTML = origEl.textContent;
        }
        var tag = optionCard.querySelector('.v2-option-discount-tag');
        if (tag) tag.remove();
    });
}

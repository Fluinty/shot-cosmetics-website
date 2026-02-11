/**
 * Shot Cosmetics — UI Enhancements
 * Scroll animations, micro-interactions, back-to-top
 */
(function () {
    if (window.SHOT_UI_INIT) return;
    window.SHOT_UI_INIT = true;

    // ─── SCROLL REVEAL ANIMATIONS ────────────────────────────────────
    // Elements with .reveal class fade-in-up when scrolled into view
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    function initRevealAnimations() {
        // Auto-tag sections and cards for reveal
        const selectors = [
            'section:not(.hero):not(#map-section)',
            '.card',
            '.stat-card',
            '.program-section > div',
            '.value-card',
            '.educator-card',
            '.event-card',
            '.distributor-region',
            '.news-card',
            '.product-card',
            '.about-history',
            '.about-values',
            '.about-team',
            '.contact-info',
            '.bestseller-card'
        ];

        document.querySelectorAll(selectors.join(',')).forEach((el, i) => {
            if (!el.classList.contains('reveal')) {
                el.classList.add('reveal');
                // Stagger cards within the same parent
                const siblings = el.parentElement.querySelectorAll('.card, .stat-card, .value-card, .educator-card, .event-card, .news-card, .product-card, .bestseller-card');
                if (siblings.length > 1) {
                    const idx = Array.from(siblings).indexOf(el);
                    if (idx > 0) el.style.transitionDelay = `${idx * 0.1}s`;
                }
            }
            revealObserver.observe(el);
        });

        // Safety: on mobile, reveal all elements after 3s to prevent scroll deadlock
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
                    el.classList.add('revealed');
                });
            }, 3000);
        }
    }

    // ─── BACK TO TOP BUTTON ──────────────────────────────────────────
    function createBackToTop() {
        const btn = document.createElement('button');
        btn.id = 'back-to-top';
        btn.innerHTML = '&#8593;';
        btn.setAttribute('aria-label', 'Wróć na górę');
        btn.title = 'Wróć na górę';
        document.body.appendChild(btn);

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    btn.classList.toggle('visible', window.scrollY > 400);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── IMAGE LAZY LOADING ──────────────────────────────────────────
    function initLazyLoading() {
        document.querySelectorAll('img:not([loading])').forEach(img => {
            // Don't lazy-load above-the-fold hero images
            const hero = img.closest('.hero, #hero-section, #about-hero, #edu-hero, #products-hero');
            if (!hero) {
                img.loading = 'lazy';
            }
        });
    }

    // ─── INIT ────────────────────────────────────────────────────────
    function init() {
        initRevealAnimations();
        createBackToTop();
        initLazyLoading();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small delay to ensure CMS content is rendered
        setTimeout(init, 500);
    }
})();

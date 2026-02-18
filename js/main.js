/* Global Menu Handler - Uses Event Delegation for maximum reliability */
(function () {
    // Prevent double loading
    if (window.SHOT_MENU_INIT) return;
    window.SHOT_MENU_INIT = true;

    // --- DESKTOP BACK BUTTON FAILSAFE ---
    function checkDesktopBackVisibility() {
        const desktopWidth = 992;
        const buttons = document.querySelectorAll('.menu-back');
        if (window.innerWidth > desktopWidth) {
            buttons.forEach(btn => {
                btn.style.setProperty('display', 'none', 'important');
            });
            document.body.classList.remove('menu-open');
        } else {
            buttons.forEach(btn => {
                if (btn.style.display === 'none') {
                    btn.style.removeProperty('display');
                }
            });
        }
    }

    // Drill-down Menu Handler
    const initDrillDown = () => {

        document.querySelectorAll('.dropdown-menu, .submenu').forEach(menu => {
            if (!menu.querySelector('.menu-back')) {
                const backItem = document.createElement('li');
                backItem.className = 'menu-back';
                // Use HTML entities for icons to survive server-side encoding issues
                backItem.innerHTML = '<span class="icon" style="margin-right: 15px; font-size: 1.5rem; display: inline-block;">&#8592;</span><span class="text" style="display: inline-block;">POWRÓT</span>';
                menu.insertBefore(backItem, menu.firstChild);
            }
        });
        checkDesktopBackVisibility();
    };

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDrillDown);
    } else {
        initDrillDown();
    }

    window.addEventListener('resize', checkDesktopBackVisibility);

    // Helper to toggle body lock
    const toggleBodyLock = (isLocked) => {
        if (isLocked) {
            document.body.classList.add('menu-open');
        } else {
            // Only unlock if no menus are active
            const anyActive = document.querySelector('.nav-links.active, .dropdown-menu.active, .submenu.active');
            if (!anyActive) {
                document.body.classList.remove('menu-open');
            }
        }
    };

    // SINGLE Global Click/Touch Listener
    // Note: iOS Safari handles click events on non-interactive elements only if they have cursor:pointer
    document.addEventListener('click', function (e) {


        // 1. Hamburger Toggle
        const toggle = e.target.closest('.menu-toggle');
        if (toggle) {
            e.preventDefault();
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                const isActive = navLinks.classList.toggle('active');
                toggleBodyLock(isActive);

            }
            return;
        }

        // 2. Back Button Logic
        const backBtn = e.target.closest('.menu-back');
        if (backBtn) {
            e.preventDefault();
            e.stopPropagation();

            let activeMenu = backBtn.closest('.submenu');
            if (!activeMenu) activeMenu = backBtn.closest('.dropdown-menu');

            if (activeMenu && activeMenu.classList.contains('active')) {
                activeMenu.classList.remove('active');

                // Healer: ensure parent is treated correctly
                if (activeMenu.classList.contains('submenu')) {
                    const parentDropdown = activeMenu.closest('.dropdown-menu');
                    if (parentDropdown) parentDropdown.classList.add('active');
                } else {
                    // It was a main dropdown-menu, we're back to main nav
                    toggleBodyLock(true); // Body remains locked as main nav is still active
                }
            }
            return;
        }

        // 3. Dropdown Toggle Logic
        const dropdownToggle = e.target.closest('.dropdown-toggle');
        if (dropdownToggle) {
            const isMobile = window.innerWidth <= 992;
            if (isMobile) {
                // Mobile: open drill-down menu
                e.preventDefault();
                e.stopPropagation();
                const dropdown = dropdownToggle.closest('.dropdown');
                const menu = dropdown ? dropdown.querySelector('.dropdown-menu') : null;
                if (menu) {
                    menu.classList.add('active');
                    toggleBodyLock(true);
                }
            } else {
                // Desktop: navigate to the link
                window.location.href = dropdownToggle.href;
            }
            return;
        }

        // 3b. Mobile submenu drill-down
        const isMobile = window.innerWidth <= 992;
        if (isMobile) {
            const hasSubmenuLink = e.target.closest('.has-submenu > a');
            if (hasSubmenuLink) {
                e.preventDefault();
                e.stopPropagation();
                const submenu = hasSubmenuLink.nextElementSibling;
                if (submenu && submenu.classList.contains('submenu')) {
                    submenu.classList.add('active');
                    toggleBodyLock(true);
                }
                return;
            }
        }

        // 4. Category Link Navigation Enforcer
        if (!e.defaultPrevented) {
            const categoryLink = e.target.closest('a[href*="?cat="]');
            if (categoryLink) {
                e.preventDefault();
                window.location.href = categoryLink.href;
            }
        }
    }, { passive: false });


})();


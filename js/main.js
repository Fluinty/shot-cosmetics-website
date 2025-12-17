/* Global Menu Handler - Uses Event Delegation for maximum reliability */
(function () {
    document.addEventListener('click', function (e) {
        // Check if the clicked element is the menu toggle or inside it
        const toggle = e.target.closest('.menu-toggle');

        if (toggle) {
            e.preventDefault(); // Prevent default link actions

            // Find the nav-links relative to the toggle or globally
            const navLinks = document.querySelector('.nav-links');

            if (navLinks) {
                navLinks.classList.toggle('active');
                console.log('Menu toggled via delegation. Active state:', navLinks.classList.contains('active'));
            } else {
                console.error('Nav links container not found!');
            }
            return;
        }

        // Close menu if clicking outside or on a link
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && navLinks.classList.contains('active')) {
            // If click is on a link inside nav-links
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                navLinks.classList.remove('active');
            }
            // Optional: Close if clicking outside (complex to detect "outside" safely on mobile, skipping for now)
        }
    });

    console.log('Global menu delegation initialized');
})();

/**
 * Amruta Yadav | Professional Portfolio Script
 * Uses jQuery for simplified DOM manipulation, event handling, and AJAX logic.
 * Clean, modularized logic targeting performance and UX.
 */

$(document).ready(function() {
    
    // === Caching jQuery Selectors for Performance ===
    const $window       = $(window);
    const $body         = $('body');
    const $navbar       = $('#navbar');
    const $mobileMenu   = $('#mobile-menu');
    const $mobileBtn    = $('#mobile-menu-btn');
    const $navLinks     = $('.nav-link');
    const $sections     = $('section');
    
    // --- 1. Smooth Scrolling System ---
    
    // Smooth scrolling for all internal anchor links
    $('a[href^="#"]').on('click', function(event) {
        event.preventDefault(); // Prevent native jump
        
        const targetID = this.getAttribute('href');
        if (targetID === "#") return;
        
        const $target = $(targetID);
        
        if ($target.length) {
            // Close mobile menu gracefully if it's open
            if ($mobileMenu.hasClass('open')) {
                toggleMobileMenu();
            }
            
            // Animate scroll (offsetting 70px to account for sticky navbar)
            $('html, body').stop().animate({
                scrollTop: $target.offset().top - 70 
            }, 800, 'swing'); // 'swing' creates a natural deceleration curve
        }
    });


    // --- 2. Mobile Responsive Navigation Logic ---
    
    let isMenuOpen = false;
    
    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            $mobileMenu.addClass('open border-b border-white/10').removeClass('translate-x-full');
            // Animate hamburger icon to "X" natively configured via tailwind/css
            $mobileBtn.children('#bar1').css('transform', 'translateY(8px) rotate(45deg)');
            $mobileBtn.children('#bar2').css('opacity', '0');
            $mobileBtn.children('#bar3').css('transform', 'translateY(-8px) rotate(-45deg)');
            $body.css('overflow', 'hidden'); // Prevent background scrolling
        } else {
            $mobileMenu.removeClass('open').addClass('translate-x-full');
            $mobileBtn.children('#bar1').css('transform', 'translateY(0) rotate(0)');
            $mobileBtn.children('#bar2').css('opacity', '1');
            $mobileBtn.children('#bar3').css('transform', 'translateY(0) rotate(0)');
            $body.css('overflow', '');
        }
    }

    $mobileBtn.on('click', toggleMobileMenu);


    // --- 3. Scroll Dynamics (Navbar Shading & Active Spy) ---
    
    $window.on('scroll', function() {
        const scrollPos = $(this).scrollTop();
        
        // Dynamic Navbar Background
        if (scrollPos > 20) {
            $navbar.removeClass('bg-dark-900/40').addClass('bg-dark-900/95 shadow-md shadow-white/5');
        } else {
            $navbar.removeClass('bg-dark-900/95 shadow-md shadow-white/5').addClass('bg-dark-900/40');
        }

        // Active Link Highlights (ScrollSpy implementation)
        $sections.each(function() {
            const top = $(this).offset().top - 100;
            const bottom = top + $(this).outerHeight();
            
            if (scrollPos >= top && scrollPos <= bottom) {
                const id = $(this).attr('id');
                // Remove active from all, add to currently scrolled section
                $navLinks.removeClass('active text-white').addClass('text-slate-400');
                $(`.nav-link[href="#${id}"]`).addClass('active text-white').removeClass('text-slate-400');
            }
        });
    });


    // --- 4. High-Performance Scroll Reveal (Intersection Observer) ---
    // Avoids costly scroll event listeners for purely visual fade-ins
    
    const appearOptions = { threshold: 0.15, rootMargin: "0px 0px -40px 0px" };
    
    // Only works natively in modern browsers
    if ('IntersectionObserver' in window) {
        const appearOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    $(entry.target).addClass('appear'); // Triggers CSS transition
                    observer.unobserve(entry.target);   // Only fade-in once
                }
            });
        }, appearOptions);

        $('.fade-in').each(function() {
            appearOnScroll.observe(this);
        });
    } else {
        // Fallback for extremely old browsers: just show everything
        $('.fade-in').addClass('appear');
    }


    // --- 5. Project Filtering Logic ---
    
    $('.filter-btn').on('click', function() {
        const filterValue = $(this).attr('data-filter');
        
        // Visual toggle for active button state
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        // Execute filter: Use jQuery fadeOut/fadeIn for smooth DOM rearrangement
        if (filterValue === 'all') {
            $('.project-item').fadeIn(300);
        } else {
            $('.project-item').each(function() {
                if ($(this).attr('data-category') === filterValue) {
                    $(this).fadeIn(300);
                } else {
                    $(this).fadeOut(300);
                }
            });
        }
    });


    // --- 6. Contact Form Validation & AJAX System ---
    
    const $contactForm = $('#contactForm');
    const $formOverlay = $('#formOverlay');

    function resetErrorStates() {
        $('.error-msg').addClass('hidden');
        $('.form-input').removeClass('input-error');
    }

    function validateEmail(email) {
        // Broad regex standard covering valid emails
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    $contactForm.on('submit', function(e) {
        e.preventDefault(); // Stop native HTML submission navigation
        
        resetErrorStates();
        let isValid = true;
        
        // Obtain Form Data
        const nameData    = $('#name').val().trim();
        const emailData   = $('#email').val().trim();
        const messageData = $('#message').val().trim();

        // Check Identifiers
        if (!nameData) {
            $('#nameError').removeClass('hidden');
            $('#name').addClass('input-error');
            isValid = false;
        }

        if (!emailData || !validateEmail(emailData)) {
            $('#emailError').removeClass('hidden');
            $('#email').addClass('input-error');
            isValid = false;
        }

        if (!messageData) {
            $('#messageError').removeClass('hidden');
            $('#message').addClass('input-error');
            isValid = false;
        }

        // Logic executes only if form completely passes front-end validation
        if (isValid) {
            // UI State mapping: Loading
            const $submitBtn = $('#submitBtn');
            $('#btnText').text('Authorizing...');
            $('#loadingIcon').removeClass('hidden');
            $submitBtn.prop('disabled', true).addClass('opacity-50 cursor-wait');

            // --- AJAX Sequence ---
            $.ajax({
                // Directly querying the dummy API for response simulation
                url: 'dummy-api.json',
                type: 'GET', 
                dataType: 'json',
                success: function(response) {
                    // Timeout purely simulates network latency (~1200ms)
                    setTimeout(function() {
                        if(response.status === 'success') {
                            // Clear fields
                            $contactForm[0].reset();
                            
                            // Modify Overlay for Success
                            $('#overlayIcon').removeClass('ph-warning ph-x-circle text-neon-pink').addClass('ph-check-circle text-neon-teal');
                            $('#overlayTitle').text('Transmission Successful');
                            $('#overlayMessage').text(response.message || "I have received your message.");
                            
                            // Display Form Overlay
                            $formOverlay.removeClass('hidden').addClass('flex');
                        } else {
                            // If API returned a custom failure flag internally
                            handleFormError('Internal system reported unexpected parameters.');
                        }
                        revertSubmitBtn();
                    }, 1200);
                },
                error: function() {
                    // Captures explicit HTTP network errors 
                    setTimeout(function() {
                        handleFormError('Could not reach backend protocol. Ensure server is active.');
                        revertSubmitBtn();
                    }, 1200);
                }
            });

            // Reusable helper function to revert button state
            function revertSubmitBtn() {
                $('#btnText').text('Send Transmission');
                $('#loadingIcon').addClass('hidden');
                $submitBtn.prop('disabled', false).removeClass('opacity-50 cursor-wait');
            }

            // Reusable helper function to display error inside overlay
            function handleFormError(errStr) {
                $('#overlayIcon').removeClass('ph-check-circle text-neon-teal').addClass('ph-x-circle text-neon-pink');
                $('#overlayTitle').text('Transmission Failed');
                $('#overlayMessage').text(errStr);
                $formOverlay.removeClass('hidden').addClass('flex');
            }
        }
    });

    // Handle Reset / Exit Overlay State
    $('#resetFormBtn').on('click', function() {
        $formOverlay.removeClass('flex').addClass('hidden');
    });

});

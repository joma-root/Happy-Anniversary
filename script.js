/*
Project: For My Nica Anniversary Website
File: script.js
Description: Password validation, automatic slideshow, flipbook controls, gallery modal, music toggle, and reminders

Developer Notes:
- To change password, edit the const PASSWORD = "10-21-2024"; line
- To add slides, update the .hero-slides container in index.html
- To add flipbook pages, duplicate the .leaf block in the flipbook section
- To replace media, swap files in /images/, /videos/, /audio/
- Works fully offline - just open index.html in any browser
*/

(function () {
    'use strict';

    // Configuration
    const PASSWORD = '10-21-2024'; // Change this to update the password

    // DOM Elements
    const passwordScreen = document.getElementById('passwordScreen');
    const mainContent = document.getElementById('mainContent');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const navLinks = document.querySelectorAll('.nav-link');
    const bgMusic = document.getElementById('bgMusic');
    const musicButton = document.getElementById('musicButton');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const modal = document.getElementById('galleryModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const modalClose = document.getElementById('modalClose');

    // Hero Slideshow elements
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentHeroSlide = 0;
    let heroInterval;

    // Password validation
    function validatePassword() {
        const input = passwordInput.value;

        if (input === PASSWORD) {
            // Correct password - fade out password screen and show main content
            passwordScreen.style.opacity = '0';
            passwordScreen.style.pointerEvents = 'none';

            setTimeout(() => {
                passwordScreen.style.display = 'none';
                mainContent.style.display = 'block';

                // Start background music after password entry
                bgMusic.play().catch(e => console.log('Audio play prevented by browser policy'));

                // Start hero slideshow
                startHeroSlideshow();
            }, 300);
        } else {
            // Incorrect password - show error and shake animation
            passwordError.textContent = 'Incorrect password. Please try again.';
            passwordInput.style.borderColor = '#ff0000';

            // Add shake animation
            passwordInput.classList.add('shake');
            setTimeout(() => {
                passwordInput.classList.remove('shake');
                passwordInput.style.borderColor = '#ffffff';
            }, 500);
        }
    }

    // Add shake animation class to CSS
    const style = document.createElement('style');
    style.textContent = `
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);

    // Navigation
    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();

                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));

                // Add active class to clicked link
                this.classList.add('active');

                // Scroll to target section
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Keyboard navigation for flipbook
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', function (e) {
            // Only respond to keys when on main content (not password screen)
            if (mainContent.style.display !== 'block') return;

            if (e.key === 'ArrowLeft') {
                document.getElementById('prevPage').click();
            } else if (e.key === 'ArrowRight') {
                document.getElementById('nextPage').click();
            }
        });
    }

    // Hero Slideshow functionality
    function showHeroSlide(index) {
        // Remove active class from all slides
        heroSlides.forEach(slide => slide.classList.remove('active'));

        // Add active class to current slide
        heroSlides[index].classList.add('active');
    }

    function nextHeroSlide() {
        currentHeroSlide = (currentHeroSlide + 1) % heroSlides.length;
        showHeroSlide(currentHeroSlide);
    }

    function prevHeroSlide() {
        currentHeroSlide = (currentHeroSlide - 1 + heroSlides.length) % heroSlides.length;
        showHeroSlide(currentHeroSlide);
    }

    function startHeroSlideshow() {
        // Clear any existing interval to prevent multiple intervals
        if (heroInterval) {
            clearInterval(heroInterval);
        }

        // Start the slideshow with 3-second intervals
        heroInterval = setInterval(nextHeroSlide, 3000);
    }

    function stopHeroSlideshow() {
        clearInterval(heroInterval);
    }

    function setupHeroSlideshow() {
        // Add touch events for mobile
        let startX = 0;
        let endX = 0;

        document.querySelector('.hero-slideshow').addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        });

        document.querySelector('.hero-slideshow').addEventListener('touchend', e => {
            endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    nextHeroSlide();
                } else {
                    prevHeroSlide();
                }
                stopHeroSlideshow();
                startHeroSlideshow();
            }
        });

        // Add mouse events for desktop
        document.querySelector('.hero-slideshow').addEventListener('mouseenter', () => {
            stopHeroSlideshow();
        });

        document.querySelector('.hero-slideshow').addEventListener('mouseleave', () => {
            startHeroSlideshow();
        });
    }

    // Gallery modal
    function setupGalleryModal() {
        galleryItems.forEach(item => {
            item.addEventListener('click', function () {
                const img = this.querySelector('img');
                const video = this.querySelector('video');

                if (img) {
                    modalImage.src = img.src;
                    modalImage.alt = img.alt;
                    modalImage.style.display = 'block';
                    modalVideo.style.display = 'none';
                } else if (video) {
                    modalVideo.src = video.querySelector('source').src;
                    modalVideo.style.display = 'block';
                    modalImage.style.display = 'none';
                    modalVideo.play();
                }

                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';

                // Stop slideshow when modal is open
                stopHeroSlideshow();
            });
        });

        // Close modal
        modalClose.addEventListener('click', closeModal);

        // Close modal with ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });

        // Close modal when clicking outside content
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        modalVideo.pause();

        // Resume slideshow when modal is closed
        if (mainContent.style.display === 'block') {
            startHeroSlideshow();
        }
    }

    // Music toggle
    function setupMusicToggle() {
        let isPlaying = true;

        musicButton.addEventListener('click', function () {
            if (isPlaying) {
                bgMusic.pause();
                musicButton.textContent = '🔇';
                isPlaying = false;
            } else {
                bgMusic.play().catch(e => console.log('Audio play prevented by browser policy'));
                musicButton.textContent = '🔊';
                isPlaying = true;
            }
        });
    }

    // Flipbook class
    class FlipBook {
        constructor(bookElem) {
            this.elems = {
                book: bookElem,
                leaves: bookElem.querySelectorAll(".leaf"),
                buttons: {
                    next: document.getElementById("nextPage"),
                    prev: document.getElementById("prevPage")
                }
            };
            this.setupEvents();
            this.currentPagePosition = 0;
            this.turnPage(0);
        }

        setPagePosition(page, position, index) {
            let transform = "";

            transform = `translate3d(0,0,${(position < 0 ? 1 : -1) * Math.abs(index)}px)`;
            if (position < 0) {
                transform += "rotate3d(0,1,0,-180deg)";
                page.classList.add("turned");
            } else {
                page.classList.remove("turned");
            }
            if (page.style.transform !== transform) {
                page.style.transform = transform;
            }
        }

        turnPage(delta) {
            this.currentPagePosition += delta;

            if (this.currentPagePosition < 0) {
                this.currentPagePosition = 0;
                return;
            }

            if (this.currentPagePosition >= this.elems.leaves.length) {
                this.currentPagePosition = this.elems.leaves.length - 1;
                return;
            }

            this.elems.leaves.forEach((page, index) => {
                const pageNumber = index;
                this.setPagePosition(page, pageNumber - this.currentPagePosition, index);
            });

            if (this.currentPagePosition === 0) {
                this.elems.buttons.prev.setAttribute("disabled", "disabled");
            } else if (this.currentPagePosition === this.elems.leaves.length - 1) {
                this.elems.buttons.next.setAttribute("disabled", "disabled");
            } else {
                this.elems.buttons.next.removeAttribute("disabled");
                this.elems.buttons.prev.removeAttribute("disabled");
            }
        }

        setupEvents() {
            this.elems.buttons.next.addEventListener("click", () => {
                this.turnPage(1);
            });

            this.elems.buttons.prev.addEventListener("click", () => {
                this.turnPage(-1);
            });
        }
    }

    // Initialize the app
    function init() {
        // Password input event
        passwordInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                validatePassword();
            }
        });

        // Setup other components
        setupNavigation();
        setupKeyboardNavigation();
        setupHeroSlideshow();
        setupGalleryModal();
        setupMusicToggle();

        // Initialize flipbook if element exists
        const flipbookElement = document.getElementById('flipbook');
        if (flipbookElement) {
            new FlipBook(flipbookElement);
        }
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
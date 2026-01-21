document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        mirror: false,
        offset: 120
    });

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const storedTheme = localStorage.getItem('theme');

    // Check for saved user preference, if any, on load
    if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let targetTheme = 'light';

        if (currentTheme === 'light') {
            targetTheme = 'dark';
        }

        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('theme', targetTheme);
    });
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    window.addEventListener('mousemove', function (e) {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Animate outline with slight delay
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        navList.classList.toggle('active');
        hamburger.classList.toggle('active');

        // Prevent scrolling when menu is open
        document.body.style.overflow = navList.classList.contains('active') ? 'hidden' : 'auto';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Smooth Scrolling for anchor links (JS Backup for Safari/Older Browsers)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active Link Highlight on Scroll
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: "-100px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
    // Typing Effect
    const roles = ["Python Full Stack Developer", "Django Specialist", "React Developer", "AWS Architect"];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.querySelector('.typing');

    function type() {
        if (!typingElement) return;

        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 150;

        if (!isDeleting && charIndex === currentRole.length) {
            isDeleting = true;
            typeSpeed = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // Start typing
    type();

    // Card Glow Effect
    const cards = document.querySelectorAll('.project-card, .skill-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });

    // Scroll Progress
    const progressBar = document.querySelector('.scroll-progress-bar');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    // Preloader
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    /* ------------------------------------------------ */
    /* NEW CODE: Header Scroll Effect                   */
    /* ------------------------------------------------ */
    const header = document.querySelector('.header');

    if (header) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY > 50) {
                header.style.background = 'rgba(5, 5, 5, 0.95)';
                header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(5, 5, 5, 0.7)';
                header.style.boxShadow = 'none';
            }
        });
    }

    /* ------------------------------------------------ */
    /* NEW CODE: Contact Form Handling (Web3Forms)      */
    /* ------------------------------------------------ */
    const contactForm = document.getElementById('contact-form');
    const resultDiv = document.getElementById('result');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // 1. Show Loading State
            resultDiv.innerHTML = "Sending...";
            resultDiv.style.color = "var(--text-muted)";
            const btn = contactForm.querySelector('button');
            btn.disabled = true;

            // 2. Prepare Data
            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // 3. Send to Web3Forms
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
                .then(async (response) => {
                    let json = await response.json();
                    if (response.status === 200) {
                        // Success
                        resultDiv.innerHTML = "Message sent successfully!";
                        resultDiv.style.color = "#28c840"; // Green
                        contactForm.reset();
                    } else {
                        // Error
                        console.log(response);
                        resultDiv.innerHTML = json.message;
                        resultDiv.style.color = "#ff5f57"; // Red
                    }
                })
                .catch(error => {
                    console.log(error);
                    resultDiv.innerHTML = "Something went wrong!";
                    resultDiv.style.color = "#ff5f57";
                })
                .then(function () {
                    // Re-enable button
                    btn.disabled = false;
                    // clear message after 5 seconds
                    setTimeout(() => {
                        resultDiv.style.display = "none";
                        // Reset display for next time
                        setTimeout(() => {
                            resultDiv.innerHTML = "";
                            resultDiv.style.display = "block";
                        }, 100);
                    }, 5000);
                });
        });
    }
});
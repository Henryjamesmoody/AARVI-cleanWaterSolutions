// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Preloader
    const preloader = document.querySelector('.preloader');
    
    // Hide preloader when page is loaded
    window.addEventListener('load', function() {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Sticky navbar on scroll
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
            
            // Hide navbar on scroll down, show on scroll up
            if (currentScroll > lastScroll && currentScroll > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.transform = 'translateY(0)';
        }
        
        // Show/hide back to top button
        const backToTop = document.querySelector('.back-to-top');
        if (window.pageYOffset > 300) {
            backToTop.classList.add('active');
        } else {
            backToTop.classList.remove('active');
        }
        
        lastScroll = currentScroll;
    });
    
    // Back to top button
    document.querySelector('.back-to-top').addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active navigation on scroll
    const sections = document.querySelectorAll('section');
    
    function setActiveNav() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
            }
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', setActiveNav);
    
    // Initialize GSAP animations
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero section animation
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    heroTimeline
        .from('.hero h1', { 
            y: 30, 
            opacity: 0, 
            duration: 0.8, 
            delay: 0.5 
        })
        .from('.hero p', { 
            y: 30, 
            opacity: 0, 
            duration: 0.8 
        }, '-=0.4')

    
    // Animate elements on scroll
    const animateOnScroll = (elements, start = 'top 80%') => {
        elements.forEach(element => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: start,
                    toggleActions: 'play none none none'
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });
    };
    
    // Animate service cards
    animateOnScroll(document.querySelectorAll('.service-card'));
    
    // Animate project cards with stagger
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: 'power3.out'
        });
    });
    
    // Animate about section
    gsap.from('.about-image', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%',
            toggleActions: 'play none none none'
        },
        x: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
    
    gsap.from('.about-text', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top 70%',
            toggleActions: 'play none none none'
        },
        x: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // Here you would typically send the form data to your Java backend
            console.log('Form submitted:', formObject);
            
            // Show success message (in a real app, handle server response)
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
            
            // In a real application, you would make an AJAX request to your Java backend
            /*
            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObject)
            })
            .then(response => response.json())
            .then(data => {
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error sending your message. Please try again later.');
            });
            */
        });
    }
    
    // Load projects dynamically (in a real app, this would come from your backend)
 const projectsGrid = document.querySelector('.projects-grid');

    if (projectsGrid) {
        loadProjectsOptimized();
    }

    async function loadProjectsOptimized() {
        // Show loading state
        projectsGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Loading projects...</div>';

        try {
            // Try to load from API first with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

            const response = await fetch('/api/projects', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.projects && data.projects.length > 0) {
                    renderProjects(data.projects);
                    return;
                }
            }
        } catch (error) {
            console.log('API not available, using default projects');
        }

        // Fallback to default projects with fast-loading placeholder images
        renderProjects(getDefaultProjects());
    }

    function getDefaultProjects() {
        return [
                           {
                               title: 'Industrial Structure',
                               description: 'Complete fabrication and installation for a large-scale industrial client',
                               image: 'images/project1.jpg'
                           },
                           {
                               title: 'Making Heavy structure',
                               'description': 'Specialized in the design, fabrication, and installation of heavy structural components for industrial and commercial projects',
                               'image': 'images/project2.jpg'
                           },
                           {
                               'title': 'Entrance Porch',
                               'description': 'Designing & installing suitable / Attractive porch',
                               'image': 'images/project3.jpg'
                           },
                           {
                               'title': 'Industrial Shed Construction',
                               'description': 'Making & installing heavy industrial shed',
                               'image': 'images/project4.jpg'
                           },
                           {
                               'title': 'PEB Work',
                               'description': 'Constructing Pre Fabricated structure',
                               'image': 'images/project5.jpg'
                           },
                           {
                               'title': 'Stainless steel works',
                               'description': 'Installing SS Railing for staircas ,walkways etc',
                               'image': 'images/project6.jpg'
                           }
                       ];
    }

    function renderProjects(projects) {
        const projectsHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-image">
                    <img src="${project.image}"
                         alt="${project.title}"
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/400x300/6c757d/ffffff?text=No+Image'">
                    <div class="project-overlay">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        ${project.client ? `<div class="project-meta" style="margin-top: 10px; font-size: 14px;"><strong>Client:</strong> ${project.client}</div>` : ''}
                        ${project.location ? `<div class="project-meta" style="font-size: 14px;"><strong>Location:</strong> ${project.location}</div>` : ''}
                        ${project.category ? `<div class="project-category" style="margin-top: 10px; padding: 4px 8px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 12px;">${project.category}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        projectsGrid.innerHTML = projectsHTML;

        // Re-trigger animations after content is loaded
        setTimeout(() => {
            if (typeof gsap !== 'undefined' && gsap.utils) {
                gsap.utils.toArray('.project-card').forEach((card, i) => {
                    gsap.from(card, {
                        scrollTrigger: {
                            trigger: card,
                            start: 'top 85%',
                            toggleActions: 'play none none none'
                        },
                        y: 50,
                        opacity: 0,
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: 'power3.out'
                    });
                });
            }
        }, 100);
    }
});

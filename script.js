/* === THEME === */
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });
}

/* === READING PROGRESS === */
const progressBar = document.getElementById('progressBar');

function updateProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

/* === NAV === */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const links = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    links.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

const sections = document.querySelectorAll('section[id]');
function updateActiveNav() {
    let current = '';
    const scrollPos = window.scrollY + 150;
    sections.forEach(section => {
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.clientHeight) {
            current = section.getAttribute('id');
        }
    });
    links.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

/* === SMOOTH SCROLL === */
function smoothScrollTo(target, duration = 800) {
    const start = window.pageYOffset;
    const targetY = target.getBoundingClientRect().top + start - 80;
    const distance = targetY - start;
    let startTime = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(time) {
        if (startTime === null) startTime = time;
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, start + distance * ease(progress));
        if (elapsed < duration) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            smoothScrollTo(target);
        }
    });
});

/* === HERO TEXT REVEAL === */
function initHeroAnimation() {
    const title = document.querySelector('[data-split-text]');
    if (!title) return;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => title.classList.add('animate'));
    });
}
if (document.fonts) {
    document.fonts.ready.then(initHeroAnimation);
} else {
    window.addEventListener('load', initHeroAnimation);
}

/* === REVEAL ON SCROLL === */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.getAttribute('data-reveal-delay')) || 0;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

/* === BACK TO TOP === */
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* === BUTTON MAGNETIC EFFECT === */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 900px)').matches;
const magneticElements = document.querySelectorAll('.btn');

if (!prefersReduced && !isMobile) {
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.08}px, ${y * 0.15}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

/* === GITHUB REPO COUNT === */
const githubCountEl = document.getElementById('githubRepoCount');
const githubBanner = document.getElementById('githubBanner');

async function fetchGitHubRepos() {
    if (!githubCountEl) return;
    try {
        const response = await fetch('https://api.github.com/users/rajvvv/repos?per_page=100');
        if (!response.ok) throw new Error('GitHub API error');
        const repos = await response.json();
        const count = repos.length;
        let current = 0;
        const increment = Math.max(1, Math.ceil(count / 15));
        const timer = setInterval(() => {
            current += increment;
            if (current >= count) { current = count; clearInterval(timer); }
            githubCountEl.textContent = current + '+';
        }, 40);
    } catch (err) {
        githubCountEl.textContent = 'many';
        githubCountEl.style.fontStyle = 'italic';
    }
}

if (githubBanner && githubCountEl) {
    const githubObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                fetchGitHubRepos();
                githubObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    githubObserver.observe(githubBanner);
    setTimeout(() => {
        if (githubCountEl.textContent === '—') fetchGitHubRepos();
    }, 3000);
}

/* === KEYBOARD / FOCUS MANAGEMENT === */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    }
    document.body.classList.add('keyboard-user');
});
document.addEventListener('mousedown', () => document.body.classList.remove('keyboard-user'));

/* === RESIZE HANDLER === */
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 780 && navLinks) {
            navLinks.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    }, 250);
});

console.log('%c Rajvardhan Wakharade ', 'background:#4d6bfb;color:#fff;padding:4px 8px;border-radius:4px;font-weight:600;');
console.log('%c Software Engineer — Vishwakarma University ', 'color:#8a8a92;font-style:italic;');
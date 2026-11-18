// Gestión del consentimiento de cookies.
// Google Analytics y Google Maps solo se cargan si el usuario acepta.
(function () {
    var STORAGE_KEY = 'cb_cookie_consent'; // 'accepted' | 'rejected'
    var GA_ID = 'G-JNHDDGL425';
    var gaLoaded = false;

    function getConsent() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
    }

    function saveConsent(value) {
        try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* almacenamiento no disponible */ }
    }

    function loadAnalytics() {
        if (gaLoaded) return;
        gaLoaded = true;
        window['ga-disable-' + GA_ID] = false;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', GA_ID);
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(s);
    }

    function disableAnalytics() {
        window['ga-disable-' + GA_ID] = true;
        // Borra las cookies de Analytics que pudieran existir de una aceptación anterior
        var host = location.hostname;
        var domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
        document.cookie.split(';').forEach(function (c) {
            var name = c.split('=')[0].trim();
            if (name.indexOf('_ga') !== 0 && name !== '_gid') return;
            domains.forEach(function (d) {
                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
            });
        });
    }

    function loadMaps() {
        document.querySelectorAll('iframe[data-src]').forEach(function (frame) {
            frame.src = frame.getAttribute('data-src');
            frame.removeAttribute('data-src');
            frame.style.display = 'block';
        });
        document.querySelectorAll('[data-map-consent]').forEach(function (el) {
            el.style.display = 'none';
        });
    }

    function applyConsent(value) {
        if (value === 'accepted') {
            loadAnalytics();
            loadMaps();
        } else if (value === 'rejected') {
            disableAnalytics();
        }
    }

    function hideBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.remove();
    }

    function showBanner() {
        if (document.getElementById('cookie-banner')) return;
        var banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.className = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Aviso de cookies');
        banner.innerHTML =
            '<div class="cookie-banner__text">' +
            '<strong>Cookies</strong>' +
            '<p>Usamos cookies de terceros (Google Analytics y Google Maps) para medir las visitas y mostrar el mapa, ' +
            'solo si las aceptas. Puedes cambiar tu elección cuando quieras desde «Configurar cookies». ' +
            '<a href="politica-cookies.html">Más información</a></p>' +
            '</div>' +
            '<div class="cookie-banner__actions">' +
            '<button type="button" class="cookie-banner__btn" data-cookie-choice="rejected">Rechazar</button>' +
            '<button type="button" class="cookie-banner__btn" data-cookie-choice="accepted">Aceptar</button>' +
            '</div>';
        banner.addEventListener('click', function (e) {
            var choice = e.target.getAttribute && e.target.getAttribute('data-cookie-choice');
            if (!choice) return;
            saveConsent(choice);
            applyConsent(choice);
            hideBanner();
        });
        document.body.appendChild(banner);
    }

    function init() {
        var consent = getConsent();
        if (consent === 'accepted' || consent === 'rejected') {
            applyConsent(consent);
        } else {
            showBanner();
        }

        // Enlaces «Configurar cookies»: vuelven a mostrar el banner
        document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                showBanner();
            });
        });

        // Botón para cargar solo el mapa, sin aceptar el resto
        document.querySelectorAll('[data-map-load]').forEach(function (el) {
            el.addEventListener('click', loadMaps);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

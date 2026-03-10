
/**
 * Universal i18n Initialization Script
 * Usage: <script src="../assets/js/i18n.js" data-i18n-ns="pageName"></script>
 */
(function() {
  var scriptTag = document.currentScript || document.querySelector('script[data-i18n-ns]') || document.querySelector('script[src*="i18n.js"]');
  if (!scriptTag || typeof i18next === 'undefined') return console.error("i18n.js: Missing script tag or i18next library.");

  // 1. Auto-detect base path from src (e.g., "../../")
  var src = scriptTag.getAttribute('src') || '';
  var basePath = scriptTag.getAttribute('data-i18n-base') || (src.startsWith('/') ? '/' : (src.match(/^(\.\.\/)+/) || ['./'])[0]);
  if (!basePath.endsWith('/')) basePath += '/';

  // 2. Get Configuration
  var ns = scriptTag.getAttribute('data-i18n-ns') || 'index';
  var lng = scriptTag.getAttribute('data-i18n-lng') || 'en';
  var pathStructure = scriptTag.getAttribute('data-i18n-path') || 'i18n/{{lng}}/{{- ns}}.json';

  // 3. Initialize & Translate
  i18next.use(i18nextHttpBackend).init({
    lng: lng, fallbackLng: lng, load: 'languageOnly', ns: [ns], defaultNS: ns,
    backend: { loadPath: basePath + pathStructure }
  }, function() {
    
    // Core translation function
    window.updateI18nContent = function() {
      var attrs = { '': 'innerHTML', '-placeholder': 'placeholder', '-value': 'value', '-alt': 'alt' };
      
      for (var suffix in attrs) {
        document.querySelectorAll('[data-i18n' + suffix + ']').forEach(function(el) {
          var key = el.getAttribute('data-i18n' + suffix);
          if (key) el[attrs[suffix]] = i18next.t(key);
        });
      }
    };

    // Run immediately
    window.updateI18nContent();
  });
})();

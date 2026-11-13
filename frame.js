// Refuses to run inside another site's frame (GitHub Pages cannot send frame-ancestors or X-Frame-Options,
// and browsers ignore frame-ancestors in a meta tag). Loaded first, before anything else on the page.
(function () {
  "use strict";
  if (window.top !== window.self) {
    try { window.top.location = window.self.location.href; } catch (e) { /* the page stays hidden */ }
    return;
  }
  document.documentElement.className += " unframed";
})();

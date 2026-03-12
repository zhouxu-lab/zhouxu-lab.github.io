// Loads data/theme.json and applies values as CSS variables
(function () {
  fetch('/data/theme.json')
    .then(function (r) { return r.json(); })
    .then(function (theme) {
      var root = document.documentElement;
      if (theme.font_body)       root.style.setProperty('--font-body', theme.font_body);
      if (theme.font_heading)    root.style.setProperty('--font-heading', theme.font_heading);
      if (theme.color_accent)    root.style.setProperty('--color-accent', theme.color_accent);
      if (theme.color_text)      root.style.setProperty('--color-text', theme.color_text);
      if (theme.color_navbar_bg) root.style.setProperty('--color-navbar-bg', theme.color_navbar_bg);
      if (theme.font_size_base)  root.style.setProperty('--font-size-base', theme.font_size_base);
    })
    .catch(function () { /* keep CSS defaults on error */ });
})();

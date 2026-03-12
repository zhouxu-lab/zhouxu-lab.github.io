/* Content loader — fetches JSON from /data/ and renders page sections */

// Minimal markdown → HTML (bold, italic, links, paragraphs, lists)
function mdToHtml(md) {
  if (!md) return '';
  var lines = md.split('\n');
  var html = '';
  var inList = false;

  lines.forEach(function (line) {
    var trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul class="interest-list">'; inList = true; }
      html += '<li>' + inline(trimmed.slice(2)) + '</li>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (trimmed === '') {
        // skip blank lines between paragraphs — handled by wrapping
      } else {
        html += '<p>' + inline(trimmed) + '</p>';
      }
    }
  });
  if (inList) html += '</ul>';
  return html;
}

function inline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

// ── ABOUT PAGE ────────────────────────────────────────────────────────────────
function loadAbout() {
  var aboutRoot = document.getElementById('about-content');
  var newsRoot  = document.getElementById('news-content');
  if (!aboutRoot && !newsRoot) return;

  if (aboutRoot) {
    fetch('/data/about.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        // Header
        document.getElementById('about-name').textContent = d.name || '';
        var deptEl = document.getElementById('about-dept');
        if (deptEl) {
          deptEl.href = d.department_url || '#';
          deptEl.innerHTML = (d.department || '') + '<br>' + (d.university || '');
        }
        var emailEl = document.getElementById('about-email');
        if (emailEl) {
          emailEl.href = 'mailto:' + (d.email || '');
          emailEl.textContent = d.email || '';
        }
        // Photo
        var photoEl = document.getElementById('about-photo');
        if (photoEl) photoEl.src = d.photo || '';

        // Bio
        var bioEl = document.getElementById('about-bio');
        if (bioEl) bioEl.innerHTML = mdToHtml(d.bio || '');

        // Navbar icons
        updateNavLinks(d);

        // Footer
        updateFooter(d.copyright_year);
      });
  }

  if (newsRoot) {
    fetch('/data/news.json')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var items = d.items || [];
        var html = '';
        items.forEach(function (item) {
          var text = item.link
            ? '<a href="' + item.link + '" target="_blank" rel="noopener">' + item.text + '</a>'
            : item.text;
          html += '<div class="row p-0">' +
            '<div class="col-sm-2 p-0">' +
              '<span class="badge light-blue darken-1 font-weight-bold text-uppercase align-middle date ml-3">' + item.date + '</span>' +
            '</div>' +
            '<div class="col-sm-10 mt-2 mt-sm-0 ml-3 ml-md-0 p-0 font-weight-light text">' +
              '<p>' + text + '</p>' +
            '</div>' +
          '</div>';
        });
        newsRoot.innerHTML = html;
      });
  }
}

// ── PUBLICATIONS PAGE ─────────────────────────────────────────────────────────
function loadPublications() {
  var root = document.getElementById('publications-content');
  if (!root) return;

  fetch('/data/publications.json')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var entries = (d.entries || []).slice().sort(function (a, b) { return b.number - a.number; });

      // Group by year
      var byYear = {};
      entries.forEach(function (e) {
        if (!byYear[e.year]) byYear[e.year] = [];
        byYear[e.year].push(e);
      });

      var years = Object.keys(byYear).sort(function (a, b) { return b - a; });
      var html = '';
      years.forEach(function (year) {
        html += '<h3 class="year-heading">' + year + '</h3>';
        byYear[year].forEach(function (e) {
          var citHtml = inline(e.citation.replace(/\*(.+?)\*/g, '<em>$1</em>'));
          var linkHtml = e.url
            ? ' <a href="' + e.url + '" class="pdf-link" target="_blank" rel="noopener">' + (e.url_label || '[full text]') + '</a>'
            : '';
          html += '<p class="publication-entry">' + e.number + '. ' + citHtml + linkHtml + '</p>';
        });
      });
      root.innerHTML = html;
      updateFooter();
    });
}

// ── TEAM PAGE ─────────────────────────────────────────────────────────────────
function loadTeam() {
  var piRoot      = document.getElementById('team-pi');
  var membersRoot = document.getElementById('team-members');
  if (!piRoot && !membersRoot) return;

  fetch('/data/team.json')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (piRoot && d.pi) {
        var pi = d.pi;
        var photo = pi.photo || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(pi.name) + '&size=300&background=0D8ABC&color=fff');
        piRoot.innerHTML =
          '<div class="col-sm-12 col-md-10 text-center">' +
            '<h3 class="mb-4 text-left">Principal Investigator</h3>' +
            '<div class="row align-items-center">' +
              '<div class="col-md-4">' +
                '<img src="' + photo + '" class="member-img" alt="' + pi.name + '">' +
              '</div>' +
              '<div class="col-md-8 text-left">' +
                '<h4 class="font-weight-bold">' + pi.name + '</h4>' +
                '<p class="mb-1 text-primary font-weight-bold">' + pi.title + '</p>' +
                '<p class="mb-2">' + pi.department + '</p>' +
                '<p class="mb-0"><i class="fas fa-envelope mr-2"></i><a href="mailto:' + pi.email + '">' + pi.email + '</a></p>' +
              '</div>' +
            '</div>' +
          '</div>';
      }

      if (membersRoot && d.members) {
        var html = '';
        d.members.forEach(function (m) {
          var photo = m.photo || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(m.name) + '&size=200&background=eee&color=333');
          html +=
            '<div class="col-sm-6 col-md-4 member-card">' +
              '<img src="' + photo + '" class="member-img" alt="' + m.name + '">' +
              '<div class="member-name">' + m.name + '</div>' +
              '<div class="member-role">' + m.role + '</div>' +
              '<div class="member-email"><a href="mailto:' + m.email + '">' + m.email + '</a></div>' +
              '<p class="text-muted small">Research: ' + m.research + '</p>' +
            '</div>';
        });
        membersRoot.innerHTML = html;
      }

      updateFooter();
    });
}

// ── POSITIONS PAGE ────────────────────────────────────────────────────────────
function loadPositions() {
  var root = document.getElementById('positions-content');
  if (!root) return;

  fetch('/data/positions.json')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var html = '';
      (d.positions || []).forEach(function (pos) {
        html +=
          '<div class="position-section">' +
            '<div class="position-title">' + pos.title + '</div>' +
            '<div class="position-body">' + mdToHtml(pos.body) + '</div>' +
          '</div>';
      });
      root.innerHTML = html;
      updateFooter();
    });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function updateNavLinks(d) {
  if (!d) return;
  var emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink && d.email) emailLink.href = 'mailto:' + d.email;

  var scholarLink = document.querySelector('a[title="Google Scholar"]');
  if (scholarLink && d.google_scholar_url) scholarLink.href = d.google_scholar_url;

  var ghLink = document.querySelector('a[title="GitHub"]');
  if (ghLink && d.github_url) ghLink.href = d.github_url;

  var liLink = document.querySelector('a[title="LinkedIn"]');
  if (liLink && d.linkedin_url) liLink.href = d.linkedin_url;
}

function updateFooter(year) {
  var footer = document.querySelector('footer');
  if (footer && year) footer.innerHTML = '&copy; Copyright ' + year + ' Xu Zhou';
}

// ── AUTO-DETECT & RUN ─────────────────────────────────────────────────────────
(function () {
  var path = window.location.pathname;
  if (path === '/' || path === '/index.html' || path === '') {
    loadAbout();
  } else if (path.indexOf('/publications') !== -1) {
    loadPublications();
  } else if (path.indexOf('/team') !== -1) {
    loadTeam();
  } else if (path.indexOf('/positions') !== -1) {
    loadPositions();
  }
})();

/* Progressive enhancement for the jemdoc-generated pages.
 *
 * Everything here is optional polish layered on top of plain jemdoc output --
 * with JavaScript disabled the site still renders correctly, just without
 * pill-styled links, date badges, and the theme switch.
 *
 * The point of doing this in JS rather than in the .jemdoc sources is that the
 * markup stays plain jemdoc: keep writing \[PDF\] and \[Mar 2026\] exactly as
 * before, and new entries pick up the styling automatically.
 */
(function () {
  'use strict';

  var content = document.getElementById('layout-content');

  /* ---------------------------------------------------------------------
   * 1. Bracketed links -> pills.   [PDF] [Code] [slides]  ->  chips
   * ------------------------------------------------------------------ */
  if (content) {
    var links = content.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var label = a.textContent.trim();
      var m = /^\[(.+)\]$/.exec(label);
      if (m) {
        a.textContent = m[1];
        a.className = a.className ? a.className + ' chip' : 'chip';
      }
    }
  }

  /* ---------------------------------------------------------------------
   * 1b. A paragraph made up of nothing but links -> a row of icons.
   *
   * That shape only occurs in the contact block: publication entries always
   * mix their chips with title and author text in the same paragraph, so they
   * are never picked up here. Links with no matching icon stay text pills, so
   * adding a new profile link degrades gracefully.
   * ------------------------------------------------------------------ */
  function letter(text, cx) {
    return '<text x="' + cx + '" y="73.73" text-anchor="middle" font-size="100"'
      + ' font-weight="700"'
      + ' font-family="Inter, system-ui, -apple-system, Helvetica, Arial, sans-serif"'
      + '>' + text + '</text>';
  }

  /* Each viewBox is cropped to that mark's own ink bounds (measured, not
   * eyeballed), so the CSS can fix a single height and let widths vary --
   * which is what makes the row read as one optical size.
   * The lettermarks use font-size 100 with the baseline at the cap height,
   * so their box height is exactly the cap height too. */
  var ICONS = {
    github: {
      box: '0 0 16 15.61',
      inner: '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>'
    },
    linkedin: {
      box: '0 0 24 24',
      inner: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>'
    },
    x: {
      box: '0 1.153 24 21.693',
      inner: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932zM17.61 20.644h2.039L6.486 3.24H4.298z"/>'
    },
    /* Google Scholar, Simple Icons mark. Tinted with the brand colour via
     * .icon-scholar in the stylesheet. */
    scholar: {
      box: '0 0 24 24',
      inner: '<path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>'
    },
    /* Kept for whenever the CV link lands back on the page. */
    cv: { box: '0 0 150 73.73', inner: letter('CV', 75) }
  };

  /* Returns the ICONS key, which also becomes an "icon-<key>" class so a mark
     can be tinted individually in the stylesheet. */
  function iconFor(href, label) {
    var h = href.toLowerCase();
    var l = label.toLowerCase();
    if (h.indexOf('github.com') > -1) return 'github';
    if (h.indexOf('linkedin.com') > -1) return 'linkedin';
    if (/(^|\/\/|\.)(x\.com|twitter\.com)/.test(h) || l === 'x') return 'x';
    if (h.indexOf('scholar.google.') > -1) return 'scholar';
    if (/\.pdf($|[?#])/.test(h) || l === 'cv' || l === 'resume') return 'cv';
    return null;
  }

  if (content) {
    var paras = content.querySelectorAll('p');
    for (var k = 0; k < paras.length; k++) {
      var p = paras[k];
      var kids = p.childNodes;
      var found = [];
      var onlyLinks = true;

      for (var n = 0; n < kids.length && onlyLinks; n++) {
        var node = kids[n];
        if (node.nodeType === 3) {
          if (node.nodeValue.trim() !== '') onlyLinks = false;
        } else if (node.nodeType === 1) {
          if (node.tagName === 'BR') continue;
          if (node.tagName === 'A' && node.className.indexOf('chip') > -1) {
            found.push(node);
          } else {
            onlyLinks = false;
          }
        }
      }
      if (!onlyLinks || found.length < 2) continue;

      var converted = 0;
      for (var q = 0; q < found.length; q++) {
        var link = found[q];
        var text = link.textContent.trim();
        var key = iconFor(link.getAttribute('href') || '', text);
        if (!key) continue;
        var icon = ICONS[key];

        link.className = 'icon-link icon-' + key;
        link.setAttribute('title', text);
        link.setAttribute('aria-label', text);
        link.innerHTML = '<svg viewBox="' + icon.box + '" aria-hidden="true"'
          + ' focusable="false">' + icon.inner + '</svg>';
        converted++;
      }
      if (converted) p.className = p.className ? p.className + ' icon-row' : 'icon-row';
    }
  }

  /* ---------------------------------------------------------------------
   * 2. Leading [Mon YYYY] in a list item -> date badge.
   * Runs on the first text node only, so links inside the item are untouched.
   * ------------------------------------------------------------------ */
  if (content) {
    var items = content.querySelectorAll('li');
    for (var j = 0; j < items.length; j++) {
      var li = items[j];
      var host = li.firstElementChild && li.firstElementChild.tagName === 'P'
        ? li.firstElementChild
        : li;
      var node = host.firstChild;
      if (!node || node.nodeType !== 3) continue;

      var dm = /^\s*\[([^\]]{2,30})\]\s*/.exec(node.nodeValue);
      if (!dm) continue;

      node.nodeValue = node.nodeValue.slice(dm[0].length);
      var badge = document.createElement('span');
      badge.className = 'date-badge';
      badge.textContent = dm[1];
      host.insertBefore(badge, host.firstChild);
      li.className = li.className ? li.className + ' dated' : 'dated';
    }
  }

  /* ---------------------------------------------------------------------
   * 2b. Hero layout: move the Contact block under the photo.
   *
   * jemdoc's img_left block puts the image in the left cell and *everything*
   * else in the right one, so the split has to happen here. The Contact
   * heading and every element after it move into the left cell; the source
   * keeps its natural order, and with JS off the page simply reads as before.
   * ------------------------------------------------------------------ */
  var hero = content && content.querySelector('table.imgtable');
  if (hero) {
    var cells = hero.getElementsByTagName('td');
    if (cells.length >= 2) {
      var leftCell = cells[0];
      var rightCell = cells[1];
      var heads = rightCell.getElementsByTagName('h3');
      var contactHead = null;

      for (var c = 0; c < heads.length; c++) {
        if (/^contact\b/i.test(heads[c].textContent.trim())) {
          contactHead = heads[c];
          break;
        }
      }

      if (contactHead && contactHead.parentNode === rightCell) {
        var box = document.createElement('div');
        box.className = 'hero-contact';
        var cur = contactHead;
        while (cur) {
          var after = cur.nextSibling;
          box.appendChild(cur);
          cur = after;
        }
        leftCell.appendChild(box);
      }
    }
  }

  /* ---------------------------------------------------------------------
   * 3. Light / dark switch. Defaults to the OS setting; the choice is
   * remembered, and applied before paint by the inline script in jemdoc.conf.
   * ------------------------------------------------------------------ */
  var menu = document.querySelector('#layout-menu .menu-inner');
  if (menu) {
    var root = document.documentElement;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';

    var sun = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
      + '<circle cx="12" cy="12" r="4.2"/>'
      + '<path d="M12 2.6v2.6M12 18.8v2.6M2.6 12h2.6M18.8 12h2.6'
      + 'M5.3 5.3l1.9 1.9M16.8 16.8l1.9 1.9M18.7 5.3l-1.9 1.9M7.2 16.8l-1.9 1.9"/></svg>';
    var moon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
      + '<path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.6 6.6 0 0 0 10.2 10.2z"/></svg>';

    var render = function () {
      var dark = root.getAttribute('data-theme') === 'dark'
        || (!root.getAttribute('data-theme')
            && window.matchMedia('(prefers-color-scheme: dark)').matches);
      btn.innerHTML = (dark ? sun : moon)
        + '<span>' + (dark ? 'Light' : 'Dark') + '</span>';
      btn.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
      return dark;
    };

    btn.addEventListener('click', function () {
      var nowDark = root.getAttribute('data-theme') === 'dark'
        || (!root.getAttribute('data-theme')
            && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = nowDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      render();
    });

    render();
    menu.appendChild(btn);
  }
})();

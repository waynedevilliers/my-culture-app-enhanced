# Sticky navbar

Pattern taken from salon77 (`components/Navbar.tsx`, commit "sticky menu bar, logo scrolls away"):

- The big grow logo sits centred above the menu and scrolls away with the page.
- The menu bar below it is centred and sticks to the top of the window (`position: sticky`).
- Once the big logo is out of view (IntersectionObserver), a small logo slides in on the left of the bar. It links to the start page. While hidden it is `inert`, so it cannot be focused. With reduced motion there is no slide.
- Phones and tablets keep the existing drawer menu; the menu button sits on the right of the bar.

The header used to be `position: absolute` over the page, and each page made room for it with its own top padding. The header is now in the page flow, so that padding was reduced (Organisations, Join us, Set password, organisation details, start page hero, Impressum, Datenschutz). This also stops the start page headline from running into the navbar line.

Screenshots: `desktop-top.png`, `desktop-scrolled.png`, `mobile-top.png`, `mobile-scrolled.png`.

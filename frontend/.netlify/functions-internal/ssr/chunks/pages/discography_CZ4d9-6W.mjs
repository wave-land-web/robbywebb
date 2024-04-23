import { a as albumData, $ as $$MainContent, b as $$PageHeader, c as $$Layout } from './__B3YH6M5T.mjs';
import { e as createAstro, f as createComponent, r as renderTemplate, n as defineScriptVars, i as renderComponent, m as maybeRenderHead } from '../astro_AKpy6RvW.mjs';
import 'kleur/colors';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://www.robbywebb.com");
const prerender = false;
const $$Discography = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Discography;
  return renderTemplate(_a || (_a = __template(["", " <style>\n  .discography {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n    gap: clamp(1.5rem, 2vw, 2rem);\n    min-height: 100vh;\n    margin-bottom: clamp(1.5rem, 2vw, 2rem);\n    text-align: center;\n  }\n\n  @media (min-width: 1024px) {\n    .discography {\n      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n    }\n  }\n\n  @media (min-width: 1800px) {\n    .discography {\n      min-height: auto;\n    }\n  }\n\n  .discography-album {\n    position: relative;\n  }\n\n  .discography-album figure {\n    width: 100%;\n    margin: auto;\n  }\n\n  .discography-album h2 {\n    padding: 1rem 0;\n    font-size: var(--size-xs);\n    font-weight: 300;\n    text-align: left;\n  }\n\n  .load-more {\n    transition: all var(--transition-normal);\n  }\n\n  .load-more.disabled {\n    color: var(--color-grey);\n    border: 1px solid var(--color-grey);\n    cursor: not-allowed;\n\n    &:hover {\n      background-color: var(--color-black);\n    }\n  }\n</style> <script>(function(){", `
  document.addEventListener(
    'astro:page-load',
    () => {
      // Grab necessary DOM elements
      const discography = document.querySelector('.discography')
      const loadMoreButton = document.querySelector('.load-more')
      const discographyNavLinks = document.querySelectorAll('a[href^="/discography"]')

      // Set pagination data
      const albumLimit = albumData.length
      const albumIncrease = 16
      const pageCount = Math.ceil(albumLimit / albumIncrease)
      let currentPage = 1

      /**
       * Create album with image, artist, record, and slug
       * @param {Object} album
       * @returns {String} Album HTML template string
       */
      function createAlbum(album) {
        const { image, artist, title, slug } = album

        return \`
          <article class="discography-album">
            <a href="/discography/\${slug}">
              <figure>
                <img
                  src="\${image}"
                  width="632"
                  height="632"
                  title="\${artist.name} - \${title}"
                  alt="\${artist.name} - \${title} album cover"
                />
                <figcaption>
                  <h2>\${artist.name} - \${title}</h2>
                </figcaption>
              </figure>
            </a>
          </article>
        \`
      }

      /**
       * Load and append albums to the DOM based on the current page
       * @param {Number} page
       */
      function loadAlbums(page) {
        const start = (page - 1) * albumIncrease
        const end = start + albumIncrease
        const albums = albumData.slice(start, end)

        albums.forEach((album) => {
          discography.innerHTML += createAlbum(album)
        })
      }

      /**
       * Increase the number of albums displayed
       */
      function increaseAlbums() {
        // Load more albums if there are more to display
        if (currentPage <= pageCount) {
          loadAlbums(currentPage)
          currentPage++
        }

        // Disable load more button when all albums are displayed
        if (currentPage > pageCount) {
          loadMoreButton.classList.add('disabled')
          return
        }
      }

      // Load initial albums
      loadAlbums(currentPage)

      // Load more albums
      loadMoreButton.addEventListener('click', increaseAlbums)

      // [Edge Case] If user clicks on a discography link while on the discography page, reload the page
      discographyNavLinks.forEach((link) => link.addEventListener('click', () => location.reload()))
    },
    { once: true }
  )
})();<\/script>`], ["", " <style>\n  .discography {\n    display: grid;\n    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n    gap: clamp(1.5rem, 2vw, 2rem);\n    min-height: 100vh;\n    margin-bottom: clamp(1.5rem, 2vw, 2rem);\n    text-align: center;\n  }\n\n  @media (min-width: 1024px) {\n    .discography {\n      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n    }\n  }\n\n  @media (min-width: 1800px) {\n    .discography {\n      min-height: auto;\n    }\n  }\n\n  .discography-album {\n    position: relative;\n  }\n\n  .discography-album figure {\n    width: 100%;\n    margin: auto;\n  }\n\n  .discography-album h2 {\n    padding: 1rem 0;\n    font-size: var(--size-xs);\n    font-weight: 300;\n    text-align: left;\n  }\n\n  .load-more {\n    transition: all var(--transition-normal);\n  }\n\n  .load-more.disabled {\n    color: var(--color-grey);\n    border: 1px solid var(--color-grey);\n    cursor: not-allowed;\n\n    &:hover {\n      background-color: var(--color-black);\n    }\n  }\n</style> <script>(function(){", `
  document.addEventListener(
    'astro:page-load',
    () => {
      // Grab necessary DOM elements
      const discography = document.querySelector('.discography')
      const loadMoreButton = document.querySelector('.load-more')
      const discographyNavLinks = document.querySelectorAll('a[href^="/discography"]')

      // Set pagination data
      const albumLimit = albumData.length
      const albumIncrease = 16
      const pageCount = Math.ceil(albumLimit / albumIncrease)
      let currentPage = 1

      /**
       * Create album with image, artist, record, and slug
       * @param {Object} album
       * @returns {String} Album HTML template string
       */
      function createAlbum(album) {
        const { image, artist, title, slug } = album

        return \\\`
          <article class="discography-album">
            <a href="/discography/\\\${slug}">
              <figure>
                <img
                  src="\\\${image}"
                  width="632"
                  height="632"
                  title="\\\${artist.name} - \\\${title}"
                  alt="\\\${artist.name} - \\\${title} album cover"
                />
                <figcaption>
                  <h2>\\\${artist.name} - \\\${title}</h2>
                </figcaption>
              </figure>
            </a>
          </article>
        \\\`
      }

      /**
       * Load and append albums to the DOM based on the current page
       * @param {Number} page
       */
      function loadAlbums(page) {
        const start = (page - 1) * albumIncrease
        const end = start + albumIncrease
        const albums = albumData.slice(start, end)

        albums.forEach((album) => {
          discography.innerHTML += createAlbum(album)
        })
      }

      /**
       * Increase the number of albums displayed
       */
      function increaseAlbums() {
        // Load more albums if there are more to display
        if (currentPage <= pageCount) {
          loadAlbums(currentPage)
          currentPage++
        }

        // Disable load more button when all albums are displayed
        if (currentPage > pageCount) {
          loadMoreButton.classList.add('disabled')
          return
        }
      }

      // Load initial albums
      loadAlbums(currentPage)

      // Load more albums
      loadMoreButton.addEventListener('click', increaseAlbums)

      // [Edge Case] If user clicks on a discography link while on the discography page, reload the page
      discographyNavLinks.forEach((link) => link.addEventListener('click', () => location.reload()))
    },
    { once: true }
  )
})();<\/script>`])), renderComponent($$result, "Layout", $$Layout, { "title": "Robby Webb | Discography" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MainContent", $$MainContent, {}, { "default": ($$result3) => renderTemplate` ${renderComponent($$result3, "PageHeader", $$PageHeader, { "text": "Discography" })} ${maybeRenderHead()}<section id="discography" class="discography aol-fade"></section> <button class="load-more site-cta aol-fade">Load More</button> ` })} ` }), defineScriptVars({ albumData }));
}, "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/pages/discography.astro", void 0);

const $$file = "/Users/joshnussbaum/Sites/robby-webb-astro/frontend/src/pages/discography.astro";
const $$url = "/discography";

export { $$Discography as default, $$file as file, prerender, $$url as url };

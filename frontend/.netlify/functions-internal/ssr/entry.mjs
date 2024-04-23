import { renderers } from './renderers.mjs';
import { manifest } from './manifest_I8gPJJLP.mjs';
import * as serverEntrypointModule from '@astrojs/netlify/ssr-function.js';
import { onRequest } from './_noop-middleware.mjs';

const _page0 = () => import('./chunks/generic_CjxyrDsp.mjs');
const _page1 = () => import('./chunks/404_BWgxDXBA.mjs');
const _page2 = () => import('./chunks/contact_ziw-YR8O.mjs');
const _page3 = () => import('./chunks/discography_DGiS8uRs.mjs');
const _page4 = () => import('./chunks/_.._SEzYhOCH.mjs');
const _page5 = () => import('./chunks/mixing_CB8QCHYo.mjs');
const _page6 = () => import('./chunks/privacy-policy_K8Mrfr_u.mjs');
const _page7 = () => import('./chunks/production_Bj-ZQGSF.mjs');
const _page8 = () => import('./chunks/success_Dfv_-5zz.mjs');
const _page9 = () => import('./chunks/index_qLRB50NV.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/contact.astro", _page2],
    ["src/pages/discography.astro", _page3],
    ["src/pages/discography/[...slug].astro", _page4],
    ["src/pages/mixing.astro", _page5],
    ["src/pages/privacy-policy.astro", _page6],
    ["src/pages/production.astro", _page7],
    ["src/pages/success.astro", _page8],
    ["src/pages/index.astro", _page9]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    renderers,
    middleware: onRequest
});
const _args = {
    "middlewareSecret": "7d25e26f-b8bb-4e02-8b16-659e551df20f"
};
const _exports = serverEntrypointModule.createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };

// La home es contenido estático (datos de build: paquetes, posts, FAQ; el idioma se resuelve en
// cliente). Prerenderizarla la sirve como HTML estático desde el edge en vez de SSR on-demand del
// Worker → TTFB más bajo y FCP/LCP más rápidos, sin cambiar el comportamiento.
export const prerender = true;

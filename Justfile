# Málaga Event Gear (MEG) - comandos del proyecto

# Levanta el servidor de desarrollo de Vite
dev:
    npm run dev

# Compila el sitio para producción optimizado para Cloudflare Pages
build:
    npm run build

# Previsualiza localmente la compilación de producción simulando Cloudflare Edge
preview:
    npm run preview

# Realiza chequeos estáticos de tipos (TypeScript) y validación de componentes de Svelte
check:
    npm run check

# Genera los tipos automáticos de Cloudflare (D1, R2) a partir de wrangler.toml
gen:
    npm run gen

# Instala las dependencias del proyecto usando npm
install:
    npm install

# Formatea todo el código fuente utilizando Prettier de forma consistente
format:
    npx prettier --write .

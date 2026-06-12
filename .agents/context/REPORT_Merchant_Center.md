# Reporte Estratégico: Integración de Google Merchant Center para Servicios y Alquileres

Este reporte evalúa la viabilidad, ventajas, desafíos y el proceso de implementación técnica para integrar el catálogo de servicios de **Malaga Event Gear (MEG)** en **Google Merchant Center**, habilitando la presencia en Google Shopping y búsquedas asistidas por Inteligencia Artificial (Agentic Commerce).

---

## 1. Introducción y Relevancia en el SEO Moderno

**Google Merchant Center (GMC)** es la plataforma que permite a los negocios enviar la información de su catálogo a Google para alimentar las experiencias transaccionales del buscador (Google Shopping, carruseles de productos en imágenes, búsquedas locales y anuncios patrocinados).

En el ecosistema actual de **Agentic Commerce** (comercio a través de agentes de IA como Gemini), Google Merchant Center actúa como la base de datos de confianza y tiempo real que consultan los modelos de lenguaje para comparar precios, evaluar stock y realizar compras o reservas en nombre del usuario.

---

## 2. Aplicabilidad en un Modelo de Alquiler de Servicios

Aunque GMC está diseñado para el comercio tradicional de productos físicos (retail), es **perfectamente aplicable y altamente recomendado** para los servicios de alquiler de MEG, bajo la condición de estructurarlos como **paquetes de servicios de tarifa fija**.

### Lo que se debe subir a GMC:
* **Packs cerrados estandarizados**: Eco Pack, Wedding Pack, Product Presentation Pack, Basic MICE Pack, MICE Pack.
* **Add-ons o complementos con tarifa fija**: Alquiler de proyector por día, máquina de humo, horas extras de técnico.

### Lo que NO se debe subir a GMC:
* **Equipos sueltos o cableado**: Artículos de bajo valor unitario que solo se rentan como parte de un servicio mayor.
* **Servicios de cotización variable completa**: Montajes a medida que no tengan un precio de partida claro.

---

## 3. Análisis de Tradeoffs (Pros y Contras)

### Ventajas (Pros)
1. **Presencia en Google Shopping Orgánico**: Las fichas en la pestaña de Shopping de Google Search son gratuitas. MEG aparecerá junto a grandes e-commerce locales en búsquedas transaccionales (ej. *"alquiler sonido boda malaga"*).
2. **Rich Snippets de Producto**: Aprobando los productos en GMC, Google premia las páginas individuales de paquetes con fragmentos enriquecidos (estrellas, precio, disponibilidad) que mejoran drásticamente el CTR en las SERPs.
3. **Elegibilidad de Universal Cart**: Gemini podrá recuperar y parsear la oferta, procesando el pre-llenado de carritos a través del Universal Commerce Protocol.

### Desafíos Técnicos y Logísticos (Contras)
1. **Inventario Dinámico (Calendario)**: GMC exige declarar el stock como `in_stock` (disponible) o `out_of_stock` (sin stock). Los servicios de MEG dependen de la disponibilidad en agenda y fecha de evento. Para evitar suspensiones, se deben marcar los packs como `in_stock` de forma generalizada, y gestionar la exclusión de fecha directamente en la Checkout Page de la web.
2. **Políticas de Entrega Complejas**: Google audita de forma estricta las tarifas de envío. Como MEG tiene montajes gratis en Málaga capital y Costa del Sol, pero un mínimo de compra de 400 € en Granada y Sevilla, estas reglas deben modelarse con precisión matemática en la consola de GMC (mediante zonas de entrega por códigos postales) para que coincidan al 100% con los cálculos de la web.
3. **Riesgo de Suspensión por Discrepancias**: Si el precio del Wedding Pack cambia en la base de datos de MEG pero no se actualiza en el feed de Merchant Center, Google suspenderá la ficha del producto en un plazo de 24-48 horas por discrepancia de datos.

---

## 4. Guía de Implementación Técnica Paso a Paso

### Paso 1: Configurar el Tipo de Marcado Híbrido en la Web
Para que los rastreadores de Merchant Center aprueben los paquetes de alquiler sin problemas, debemos indicarle a Google que el paquete se comporta como un producto adquirible. Modificaremos los esquemas dinámicos para utilizar tipos múltiples en JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Product", "Service"],
      "@id": "https://malagaeventgear.com/packages/wedding-pack/#product",
      "name": "Wedding Pack",
      "description": "Premium sound and lighting package for weddings in Malaga and Costa del Sol.",
      "image": "https://cdn.malagaeventgear.com/packages/wedding-desktop.webp",
      "brand": {
        "@type": "Brand",
        "name": "Malaga Event Gear"
      },
      "offers": {
        "@type": "Offer",
        "price": "650.00",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "650.00",
          "priceCurrency": "EUR",
          "valueAddedTaxIncluded": true
        }
      }
    }
  ]
}
```

### Paso 2: Generar el Feed de Datos XML/JSON
Se debe crear un endpoint dinámico en SvelteKit (ej. `src/routes/(public)/merchant-feed.xml/+server.ts`) que serialice de forma automatizada los paquetes del archivo `src/lib/data/packages.ts` al formato estándar de Merchant Center (**Google Shopping RSS 2.0**).

**Campos obligatorios que debe mapear el feed:**
* `<g:id>`: El ID único del paquete (ej. `wedding`).
* `<g:title>`: El nombre del paquete.
* `<g:description>`: La descripción SEO.
* `<g:link>`: La URL absoluta con trailing slash.
* `<g:image_link>`: La URL absoluta del crop de imagen en CDN R2.
* `<g:availability>`: Siempre `in stock`.
* `<g:price>`: El precio base (ej. `650.00 EUR`).
* `<g:condition>`: Declararlo como `new` (requerido por Shopping, aplicable a la contratación de un servicio).

### Paso 3: Configurar las Zonas de Envío en la Consola de GMC
En la configuración de envío de GMC, se debe establecer la tarifa base de entrega:
1. **Zona Costa del Sol (Málaga capital, Marbella, Coín, etc.)**: Configurar como "Envío Gratis".
2. **Zonas Limitadas (Granada, Sevilla)**: Configurar una regla de envío con recargo de logística o exclusión para pedidos inferiores a 400 €, coincidiendo exactamente con la lógica de negocio documentada en `BUSINESS.md`.

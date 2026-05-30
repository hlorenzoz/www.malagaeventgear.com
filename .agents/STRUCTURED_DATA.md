# Guía y Arquitectura de Datos Estructurados (Structured Data)

Para un sitio web centrado en la prestación de servicios, la estrategia de datos estructurados según las directrices de Google varía respecto a una tienda online. El núcleo de la arquitectura deja de ser el producto físico y la tienda virtual, pasando a enfocarse en la entidad que presta el servicio (`LocalBusiness` u `Organization`) y en la descripción detallada de la actividad (`Service`).

A continuación, se detalla la unión y asociación completa de los datos estructurados recomendados por Google, organizados por tipo de contenido y página para un sitio de servicios.

## Arquitectura de Datos Estructurados para un Sitio de Servicios

### 1. Página de Inicio (Home)

Es la carta de presentación de la entidad. Aquí se define quién es el proveedor y qué autoridad tiene.

* **Obligatorio / Principal:** `LocalBusiness` (o un subtipo más específico como `ProfessionalService`, `LegalService`, `PlumbingService`, etc.) u `Organization` si opera a nivel global sin ubicaciones físicas relevantes para el cliente.
* **Complementario:** `PostalAddress` (anidado), `GeoCoordinates` (anidado), `OpeningHoursSpecification` (anidado) y `SiteNavigationElement`.

### 2. Páginas de Servicios Individuales

Cada servicio específico debe tener su propia URL y su propio marcado jerárquico.

* **Obligatorio / Principal:** `Service` (define la actividad, el tipo de servicio con `serviceType` y el proveedor con `provider`).
* **Complementario:** 
  * `Offer` o `PriceSpecification` (para indicar tarifas o rangos de precios).
  * `AggregateRating` o `Review` (si el servicio cuenta con testimonios específicos, lo cual puede activar fragmentos enriquecidos de estrellas en las SERPs).

### 3. Páginas de Categorías de Servicios

Páginas que agrupan diferentes prestaciones (por ejemplo: `/packages/`).

* **Obligatorio / Principal:** `ItemList` (un listado ordenado o detallado que apunta a las URLs de cada `Service` individual).

### 4. Secciones de Soporte o FAQs

Páginas dedicadas a resolver dudas frecuentes sobre la contratación o ejecución de los servicios.

* **Obligatorio / Principal:** `FAQPage` (compuesto por elementos anidados de tipo `Question` y `Answer`).

### 5. Blog o Artículos de Actualidad (Contenido Informativo)

Esencial para captar tráfico inbound y demostrar conocimiento del sector (*Topic Authority*).

* **Obligatorio / Principal:** `Article` o `BlogPosting`.
* **Complementario:** `Author` (tipo `Person` para cumplir con las directrices de E-E-A-T de Google).

### 6. Elementos Globales (Presentes en todas las páginas de la navegación)

* **Complementario:** `BreadcrumbList` (esencial para que Google entienda la jerarquía de navegación y la replique en los resultados de búsqueda).

---

## Tabla Resumen de Asociación

| Tipo de Página / Contenido | Esquema Principal (Google Docs) | Esquemas Complementarios / Anidados | Beneficio en SERPs |
| --- | --- | --- | --- |
| **Home (Inicio)** | `LocalBusiness` / `Organization` | `PostalAddress`, `GeoCoordinates` | Panel de Conocimiento (Knowledge Graph) |
| **Servicio Individual** | `Service` | `Offer`, `AggregateRating`, `Review` | Rich Snippets (Estrellas, Precios) |
| **Categoría de Servicios** | `ItemList` | Enlaces a elementos `Service` | Comprensión de arquitectura web |
| **Blog / Post** | `Article` o `BlogPosting` | `Person` (Autor), `Organization` | Rich Snippets de Noticias / Carruseles |
| **Preguntas Frecuentes** | `FAQPage` | `Question`, `Answer` | Desplegables de FAQ en las SERPs |
| **Cualquier página con ruta** | `BreadcrumbList` | `ListItem` | Fragmento de migas de pan en la URL |

# Reporte Técnico: Soporte de Universal Cart y Agentic Commerce

Este reporte detalla cómo habilitar la compatibilidad del sitio web de **Malaga Event Gear (MEG)** con la tecnología **Universal Cart** de Google y la optimización de esquemas estructurados para búsquedas con agentes de Inteligencia Artificial (Gemini).

---

## 1. ¿Qué es Universal Cart?

**Universal Cart** es un protocolo abierto y agnóstico de comercio electrónico desarrollado por Google (bajo la especificación **Universal Commerce Protocol - UCP**) que permite a agentes de IA (como Gemini o Shopping Buddy) y a los propios servicios de Google (Search, YouTube, Gmail) añadir productos directamente a un carrito de compra persistente del usuario sin que este tenga que abandonar la interfaz de búsqueda.

---

## 2. Plan de Implementación de Universal Cart (UCP)

Para habilitar esta funcionalidad en Malaga Event Gear, se deben cubrir tres pilares de integración:

### A. Publicación del Manifiesto UCP
Google requiere un archivo de configuración estático que anuncie que el servidor es compatible con el protocolo. Debe alojarse en la ruta estándar de tu dominio:
```bash
https://malagaeventgear.com/.well-known/ucp
```
**Ejemplo de contenido del manifiesto (`ucp.json`):**
```json
{
  "version": "1.0",
  "capabilities": {
    "cart": {
      "endpoint": "https://malagaeventgear.com/api/cart",
      "methods": ["POST"]
    }
  }
}
```

### B. Endpoint de Integración de Carrito (`CreateCart`)
El backend (a través de Cloudflare Workers/Pages en SvelteKit) debe exponer una API compatible con la llamada `CreateCart` del UCP:
1. **Entrada**: Google envía una solicitud POST con un payload JSON de los ítems seleccionados por el agente (ID de producto, cantidad, variantes y metadatos).
2. **Proceso**: El endpoint de SvelteKit crea una sesión de carrito activa en base de datos.
3. **Salida**: Retorna una URL de checkout temporal en el sitio web (ej. `https://malagaeventgear.com/checkout?cartId=XYZ`). El usuario es redirigido a esta página con todos sus servicios pre-cargados y la fecha del evento solicitada lista para finalizar el pago o la cotización.

### C. Google Merchant Center Feed
El inventario de paquetes de servicios debe registrarse en **Google Merchant Center**. Los datos de precios, impuestos (el 21% de IVA aplicado) y estado de disponibilidad en el feed deben sincronizarse en tiempo real y coincidir exactamente con lo inyectado en el HTML mediante datos estructurados.

---

## 3. Auditoría de Esquemas de Ofertas (`Offer`)

Hemos verificado y validado los esquemas de ofertas en las páginas correspondientes del sitio:

* **Páginas de Detalle de Paquete (`/packages/[slug]/`)**: El helper `buildServiceSchema()` en [schema.ts](file:///Users/hlorenzoz/databank/Development/%5BMEG%20-%20Malaga%20Event%20Gear%20%28malagaeventgear.com%29%5D/projects/website/src/lib/utils/schema.ts) ya genera correctamente la entidad `offers` de tipo `Offer`.
* **Propiedades Inyectadas**:
  - `@type`: `Offer`
  - `price`: Precio base en formato decimal (ej. `650.00`).
  - `priceCurrency`: `EUR`
  - `availability`: `https://schema.org/InStock` (indica disponibilidad inmediata del servicio para cotizar).
  - `priceSpecification`: Tipo `UnitPriceSpecification` detallando explícitamente el desglose de IVA de España (`valueAddedTaxIncluded: true`).
  - `url`: Enlace absoluto a la página de compra/reserva.

---

## 4. ¿Es recomendado usar el esquema `Product` para Servicios?

**SÍ, es altamente recomendado.**

Aunque desde el punto de vista semántico estricto de Schema.org un paquete de alquiler es un `Service` (y así está declarado actualmente), las plataformas de compras de Google (Google Shopping y Google Merchant Center) exigen que las entidades catalogadas hereden propiedades del tipo **`Product`** para calificar para resultados enriquecidos de compra, carruseles de ofertas y soporte para **Universal Cart**.

### Recomendación de Marcado Híbrido:
Para no perder la precisión semántica de que proveemos servicios de alquiler pero permitiendo a los motores de Google y Gemini procesar las transacciones de Universal Cart, se debe implementar una entidad híbrida en las páginas de paquetes:

```json
{
  "@context": "https://schema.org",
  "@type": ["Product", "Service"],
  "@id": "https://malagaeventgear.com/packages/wedding-pack/#product",
  "name": "Wedding Pack",
  "description": "Professional sound & lighting system rental for weddings...",
  "offers": {
    "@type": "Offer",
    "price": "650.00",
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock"
  }
}
```

Google procesa las declaraciones de tipos múltiples de forma limpia, habilitando los snippets de Shopping (estrellas, rango de precios) y asegurando la elegibilidad del producto en los feeds transaccionales de Universal Cart.

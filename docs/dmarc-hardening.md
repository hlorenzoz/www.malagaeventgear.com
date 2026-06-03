# DMARC — Plan de endurecimiento (para retomar por etapas)

Endurecer DMARC protege a `malagaeventgear.com` contra spoofing (que alguien falsifique tu
dominio para enviar phishing). Se hace **por etapas, a lo largo de semanas**: nunca saltar
directo a `p=reject`, porque podrías bloquear tus propios correos legítimos.

Este documento permite retomar el proceso sin recordar el contexto.

## Estado actual (al documentar)

- **DNS**: gestionado por Cloudflare (`carmelo/pola.ns.cloudflare.com`).
- **DMARC**: **Etapa 1 — monitoreo** activa. Registro `_dmarc.malagaeventgear.com` = `p=none`
  (no rebota nada). **Cloudflare DMARC Management** habilitado (Email → DMARC Management) →
  recolecta reportes `rua` y los muestra en dashboard, sin buzón propio.
- **Emisores legítimos del dominio**:
  - **Hostinger** — correo normal (`@malagaeventgear.com`). SPF `include:_spf.mail.hostinger.com`, MX raíz `mx1/mx2.hostinger.com`, DKIM propio de Hostinger.
  - **Resend** — confirmaciones / notificaciones de leads / recordatorios de reseña. DKIM selector `resend._domainkey` (alinea con `d=malagaeventgear.com`); SPF/return-path en el subdominio `send.malagaeventgear.com` (Amazon SES).

> Recordatorio: los registros de Resend viven en el subdominio `send.` + un selector DKIM
> propio, así que **no afectan** el correo de Hostinger. Hay un único SPF en la raíz (Hostinger).

## Etapa 1 — Monitoreo (EN CURSO)

**Objetivo**: juntar datos ~1–2 semanas y confirmar que todos los emisores legítimos alinean,
ANTES de endurecer. No cambia el comportamiento del correo.

**Qué mirar en el dashboard de Cloudflare DMARC Management:**
Confirmá que estos 2 emisores aparecen **alineados (pass)**:
- [ ] **Hostinger** — pass SPF + DKIM.
- [ ] **Resend** — pass DKIM (`resend._domainkey`, alineado con `d=malagaeventgear.com`).

**Si un emisor legítimo aparece fallando** → se ajusta **SU** registro (SPF/DKIM), **NO** se toca
la política DMARC todavía. Emisores desconocidos fallando = probablemente spoofing/spam: es
justo lo que DMARC luego bloqueará.

**Criterio para avanzar a Etapa 2**: ~1–2 semanas con Hostinger y Resend consistentemente en
`pass`, y sin emisores legítimos faltantes.

## Etapa 2 — Cuarentena gradual

Cuando la Etapa 1 esté limpia, pasar el registro `_dmarc.malagaeventgear.com` a:

```
v=DMARC1; p=quarantine; pct=25; rua=mailto:<el rua que puso Cloudflare>
```

- `pct=25` aplica la política solo al 25% del correo no alineado (mitiga el riesgo).
- Monitorear ~1 semana. Si los reportes siguen limpios, **subir `pct` gradualmente**: 25 → 50 → 100.
- En Cloudflare DMARC Management se puede ajustar la política desde la UI (o editando el TXT).

**Criterio para avanzar a Etapa 3**: `pct=100; p=quarantine` estable, sin correo legítimo
yendo a spam.

## Etapa 3 — Rechazo (protección completa)

```
v=DMARC1; p=reject; rua=mailto:<el rua que puso Cloudflare>
```

- El correo que falla alineación se **rechaza** (no se entrega). Protección anti-spoofing total.
- Mantener el `rua` para seguir recibiendo reportes y detectar regresiones.

## Notas

- Mantener SIEMPRE un único registro SPF por dominio (regla DMARC/SPF). Hoy la raíz tiene solo
  el de Hostinger; el de Resend está aislado en `send.`.
- Si en el futuro se agrega otro emisor (ej. Google Workspace, otro ESP), antes de endurecer
  hay que verificar que también alinee en los reportes.
- Verificación rápida del registro actual:
  ```bash
  dig +short TXT _dmarc.malagaeventgear.com
  ```

## Historial

- **Etapa 1 activada**: Cloudflare DMARC Management habilitado, `p=none` + `rua`. (Ver fecha en git.)

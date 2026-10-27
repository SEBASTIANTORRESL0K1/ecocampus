# Flujo de ramas

| Rama | Uso |
|------|-----|
| `dev` | Desarrollo. Origen de los cambios. |
| `pages` | Sitio publico (GitHub Pages). Antes `main`. |
| `production` | Modo experimento desplegado en Lightsail. |

## Flujos de PR permitidos

```
dev   -> pages
dev   -> production
pages -> production
```

`production` nunca se fusiona en `pages`: el sitio publico no debe recibir el modo experimento. El workflow `.github/workflows/flujo-ramas.yml` falla cualquier otro PR hacia `pages` o `production`, y la proteccion de ramas exige que ese chequeo pase.

# Shinseikan Karate - Landing + Admin (sin backend)

Sitio estatico (HTML/CSS/JS puro) con:

- Rutas separadas: `/dojo/`, `/shop/`, `/contacto/`
- Shop KAI con encargo por WhatsApp (producto + variante)
- Panel admin en `/admin/` con login basico y persistencia en `localStorage`

## Rutas

- Inicio: `/` (home con accesos rapidos)
- Dojo: `/dojo/` (Dojo, Disciplinas, Clases, Cintos, Inscribite)
- Contacto: `/contacto/` (WhatsApp, direccion, mapa)
- Shop: `/shop/` (productos + filtros + buscador)
- Admin: `/admin/`

## Como ejecutar (Windows)

Opcion recomendada (sin usar terminal del IDE):

- Doble click en `start-server.cmd`

Se abre:

- `http://localhost:5500/dojo/`
- `http://localhost:5500/admin/`

Para detenerlo: cerrar esa ventana o `Ctrl+C`.

## Como ejecutar (Node)

En la carpeta del proyecto:

```bash
node serve.mjs 5500
```

## Acceso al admin

- URL: `/admin/`
- Usuario: `admin`
- Contrasena: `karatedo`

## Persistencia

Todo se guarda en el navegador del dispositivo donde editas:

- Config: `shinseikan_site_v1`
- Sesion admin: `shinseikan_admin_authed_v1`

Nota: `localStorage` suele tener limite (~5MB). Imagenes grandes pueden no guardar.


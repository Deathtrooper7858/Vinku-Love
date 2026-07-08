# Vinku-love — App de pareja

App móvil (React Native + Expo) con conexión real entre tú y tu pareja vía Supabase
(autenticación, base de datos y sincronización en tiempo real). Tema oscuro de base.

## Estructura de la app (4 pestañas)

- **Ahora** (Home): racha de días, estado contextual (batería real + estado manual),
  ánimo comparado, "Te extraño" con patrón háptico, mini-vista de la mascota.
- **Mural**: Pregunta del Día (bloqueada hasta que ambos respondan) + notas del historial.
- **Planes**: Citas pendientes (bucket list), calendario de eventos importantes,
  gastos compartidos con balance automático, y cápsula del tiempo (texto + foto opcional
  bloqueada hasta una fecha).
- **Mascota**: vista completa de Migo + tienda de accesorios (comprados con el XP que
  generan juntos).

## 1) Configura Supabase (una sola vez)

1. Crea un proyecto gratis en <https://supabase.com> si no tienes uno.
2. Ve a **SQL Editor** y pega el contenido completo de `supabase/schema.sql`. Ejecútalo.
   Esto crea todas las tablas (incluidas las nuevas: `daily_answers`, `capsule_entries`,
   `bucket_list_items`, `calendar_events`, `expenses`, `member_status`,
   `pet_accessories_owned`), los permisos (RLS), Realtime, **y el bucket de Storage**
   `vinku-love-media` que usa la cápsula del tiempo para las fotos.
3. Ve a **Project Settings → API** y copia `Project URL` y `anon public key`.
4. Abre `app.json` y reemplaza:

   ```json
   "supabaseUrl": "PON_AQUI_TU_SUPABASE_URL",
   "supabaseAnonKey": "PON_AQUI_TU_SUPABASE_ANON_KEY",
   ```

5. En **Authentication → Providers**, confirma que "Email" esté habilitado.

## 2) Instala dependencias y prueba en tu celular

```bash
npm install
npx expo start
```

Escanea el QR con **Expo Go** en tu celular y en el de tu pareja. Todas las funciones
nuevas (batería, hápticos, selector de fotos) funcionan dentro de Expo Go — no necesitas
compilar nada todavía para probarlas.

## 3) Genera el APK real

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

Compila en los servidores de Expo (gratis, ~10-15 min) y te da un link para descargar
el `.apk`.

## 4) Instalar el APK en los dos celulares

Descarga el `.apk`, envíalo por WhatsApp/Drive a tu pareja, y en ambos celulares
permitan "instalar apps de orígenes desconocidos" la primera vez.

---

## Qué se implementó de tu lista, y qué quedó afuera (y por qué)

✅ **Mascota con accesorios desbloqueables** — tienda en la pestaña Mascota, se
compran con el XP acumulado por los dos, se equipan tocándolos.

✅ **Pregunta del Día** — misma pregunta para ambos cada día (banco local de 30
preguntas en `src/data/dailyPrompts.ts`, rota automáticamente); la respuesta de cada
quien queda oculta hasta que los dos hayan respondido.

✅ **Cápsula del tiempo** — nota + foto opcional, bloqueada hasta la fecha que
elijan. *Nota de voz queda pendiente para una siguiente iteración* (agrega
`expo-av` y más complejidad de grabación/reproducción; mejor hacerlo aparte).

✅ **Toques hápticos sincronizados** — 3 patrones (suave, doble toque, SOS-cariño)
que se sienten igual en ambos celulares vía `expo-haptics` + Realtime.

✅ **Estado contextual** — batería real del teléfono (automática, vía
`expo-battery`) + estado manual (libre/ocupado/durmiendo/silencio). *La detección
automática de "en movimiento" se dejó fuera a propósito*: requeriría tener el
acelerómetro corriendo en segundo plano todo el tiempo, lo cual gasta batería y es
poco confiable — el estado manual cubre la misma necesidad sin ese costo.

✅ **Bucket list, calendario y gastos compartidos** — en la pestaña Planes.

❌ **Widgets nativos en la pantalla de inicio del celular** — esto es lo único que
no pude construir de verdad. No es algo que Expo managed workflow pueda hacer sin
escribir código nativo real (WidgetKit en Swift para iOS, App Widgets en Kotlin
para Android), y no tengo forma de compilar/probar eso en este entorno. Si más
adelante quieres explorarlo, es un proyecto aparte que necesita bare workflow +
Xcode/Android Studio. Como alternativa que sí funciona hoy: se le pueden agregar
notificaciones push (`expo-notifications`) para que un cambio de ánimo o un "te
extraño" lleguen como notificación aunque la app esté cerrada — el mismo efecto de
"verlo sin abrir la app", sin necesitar ese código nativo.

## Siguientes pasos posibles

- Notificaciones push como alternativa a los widgets nativos.
- Nota de voz en la cápsula del tiempo.
- Ícono y splash screen personalizados.

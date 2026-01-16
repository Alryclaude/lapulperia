# Sonidos de Notificación

Esta carpeta debe contener los archivos de audio para las notificaciones.

## Archivos requeridos

| Archivo | Uso | Formato recomendado |
|---------|-----|---------------------|
| `notification.mp3` | Notificación general | MP3, <100KB, ~0.5s |
| `order.mp3` | Nueva orden (pulpero) | MP3, <100KB, ~1s |
| `success.mp3` | Acción exitosa | MP3, <100KB, ~0.3s |
| `achievement.mp3` | Logro desbloqueado | MP3, <100KB, ~1.5s |

## Fallback

Si los archivos no existen, el sistema usa **Web Audio API** para generar tonos sintéticos.

## Recursos gratuitos

- [Mixkit](https://mixkit.co/free-sound-effects/)
- [Freesound](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)

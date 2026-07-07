export const DAILY_PROMPTS: string[] = [
  '¿Cuál es tu recuerdo favorito de nuestras primeras citas?',
  'Si ganáramos la lotería mañana, ¿qué es lo primero que comprarías?',
  '¿Qué canción te recuerda a mí?',
  '¿Cuál ha sido el mejor viaje que te gustaría que hiciéramos juntos?',
  '¿Qué es algo pequeño que hago que te hace muy feliz?',
  '¿Cómo te imaginas que seremos en 10 años?',
  '¿Cuál es tu comida favorita que preparo (o que preparamos)?',
  '¿Qué película verías conmigo una y otra vez sin cansarte?',
  '¿Cuál fue el momento en que supiste que te gustaba de verdad?',
  '¿Qué palabra usarías para describir nuestra relación hoy?',
  '¿Qué es algo que quieres que hagamos juntos este año?',
  '¿Cuál es tu apodo favorito que te pongo?',
  '¿Qué recuerdo de la infancia te gustaría compartir conmigo?',
  '¿Qué animal crees que representa mejor nuestra relación y por qué?',
  '¿Cuál ha sido el mejor regalo que te he dado?',
  '¿Qué es lo que más admiras de mí?',
  '¿Qué ciudad del mundo te gustaría conocer conmigo?',
  '¿Cuál fue tu primera impresión de mí?',
  '¿Qué tradición nueva te gustaría que empezáramos como pareja?',
  '¿Qué es algo que te hace reír cada vez que lo recuerdas de nosotros?',
  '¿Prefieres una noche de películas o una cena afuera? ¿Por qué?',
  '¿Qué es lo más loco que harías por mí?',
  '¿Cuál crees que es nuestra mejor cualidad como equipo?',
  '¿Qué mascota te gustaría que tuviéramos algún día?',
  '¿Qué canción pondrías si bailáramos en nuestra boda?',
  '¿Cuál ha sido el reto más grande que hemos superado juntos?',
  '¿Qué es algo que aún no sabes de mí y quieres preguntar?',
  '¿Qué comida nunca has probado y te gustaría que probáramos juntos?',
  '¿Cuál es tu forma favorita de que te consuele cuando estás triste?',
  '¿Qué superpoder te gustaría que tuviéramos como pareja?',
];

// Devuelve la misma pregunta para ambos el mismo día del año,
// sin necesitar un servidor que la genere.
export function getPromptForDate(date: Date): { text: string; dateKey: string } {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  const index = dayOfYear % DAILY_PROMPTS.length;
  const dateKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
  return { text: DAILY_PROMPTS[index], dateKey };
}

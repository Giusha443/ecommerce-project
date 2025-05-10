export function getRandomId(): string {
  return Date.now().toString() + Math.random().toFixed(5);
}

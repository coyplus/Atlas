/** Keep Home Screen display, but all content now needs an online password check. */
export async function installPwa(_onUpdate: (apply: () => Promise<void>) => void) {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration('/');
  if (registration) await registration.update();
}

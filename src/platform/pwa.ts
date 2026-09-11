import { saveSession } from './session';
/** Updates wait for an explicit restart so a stakeholder never loses a task mid-flow. */
export async function installPwa(onUpdate: (apply: () => Promise<void>) => void) {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.register('/sw.js');
  let updateRequested = false;
  const offer = () => {
    if (!registration.waiting) return;
    onUpdate(async () => {
      await saveSession(window.atlas.getState(), window.ATLAS_VERSION);
      updateRequested = true;
      registration.waiting?.postMessage('ACTIVATE_UPDATE');
    });
  };
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading || !updateRequested) return;
    reloading = true;
    location.reload();
  });
  offer();
  registration.addEventListener('updatefound', () => {
    const installing = registration.installing;
    installing?.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) offer();
    });
  });
}

import { useEffect, useRef, useState } from 'react';
import { materialIcons, materialViewBoxes } from '../design-system/icons.mjs';

interface InstallPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
// Capture early: browsers may offer installation before the chooser is mounted.
let installPrompt: InstallPrompt | null = null;
let installed = false;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event as InstallPrompt;
});
window.addEventListener('appinstalled', () => {
  installed = true;
  installPrompt = null;
});
const standalone = () =>
  installed ||
  matchMedia('(display-mode: standalone)').matches ||
  !!(navigator as Navigator & { standalone?: boolean }).standalone;

export function HomeScreenInstall() {
  const trigger = useRef<HTMLButtonElement>(null);
  const [hidden, setHidden] = useState(standalone);
  const [guide, setGuide] = useState(false);
  const [busy, setBusy] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const ios =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/.test(navigator.userAgent);
  useEffect(() => {
    if (guide) document.getElementById('install-guide')?.scrollIntoView({ block: 'nearest' });
  }, [guide]);
  useEffect(() => {
    const display = matchMedia('(display-mode: standalone)');
    const update = () => setHidden(standalone());
    display.addEventListener('change', update);
    window.addEventListener('appinstalled', update);
    return () => {
      display.removeEventListener('change', update);
      window.removeEventListener('appinstalled', update);
    };
  }, []);
  if (hidden) return null;
  async function add() {
    if (!installPrompt) {
      setAccepted(false);
      setGuide(!guide);
      return;
    }
    const prompt = installPrompt;
    installPrompt = null; // A browser prompt can only be used once.
    setBusy(true);
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      setAccepted(choice.outcome === 'accepted');
      setGuide(false);
    } catch {
      setGuide(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="welcome-install">
      <button
        ref={trigger}
        onClick={() => void add()}
        disabled={busy}
        aria-expanded={guide}
        aria-controls="install-guide"
      >
        <svg
          aria-hidden="true"
          className="icon"
          data-material="add"
          viewBox={materialViewBoxes.add}
          fill="currentColor"
          dangerouslySetInnerHTML={{ __html: materialIcons.add }}
        />
        <span>{busy ? 'Opening install…' : 'Add to Home Screen'}</span>
      </button>
      <p>Keep Atlas close. Explore without browser bars.</p>
      {accepted && <p role="status">Once added, open Atlas from your device’s app icon.</p>}
      {guide && (
        <div className="welcome-install-guide" id="install-guide">
          <h2>
            {ios
              ? 'Add Atlas on your iPhone or iPad'
              : android
                ? 'Add Atlas on your phone'
                : 'Install Atlas from your browser'}
          </h2>
          {ios ? (
            <ol>
              <li>
                Open this page in <strong>Safari</strong> and tap <strong>Share</strong> (the square
                with an arrow pointing up).
              </li>
              <li>
                Choose <strong>Add to Home Screen</strong>. You may need to scroll down.
              </li>
              <li>
                Keep <strong>Open as Web App</strong> on, if shown, then tap <strong>Add</strong>.
              </li>
            </ol>
          ) : android ? (
            <ol>
              <li>
                Open this page in <strong>Chrome</strong>.
              </li>
              <li>
                Open the browser menu and choose <strong>Add to Home screen</strong> or{' '}
                <strong>Install app</strong>, if available.
              </li>
              <li>
                Confirm, then open <strong>Atlas</strong> from its app icon.
              </li>
            </ol>
          ) : (
            <p>
              Look for <strong>Install</strong> in your browser’s address bar or menu. In Safari on
              Mac, choose <strong>File → Add to Dock</strong>. On a phone, open this page to see the
              Home Screen steps.
            </p>
          )}
          <button
            className="welcome-install-done"
            onClick={() => {
              setGuide(false);
              trigger.current?.focus();
            }}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}

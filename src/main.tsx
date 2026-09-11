import { useEffect, useState, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { materialIcons, materialViewBoxes } from './design-system/icons.mjs';
import './app/contracts';
import { loadSession, scheduleSave, saveSession } from './platform/session';
import { feedback } from './platform/haptics';
import { installPwa } from './platform/pwa';
import { installViewport, syncThemeChrome } from './platform/viewport';
import './design-system/fonts.css';
import './design-system/foundations.css';
import './design-system/components.css';
import './design-system/workbench.css';
import './design-system/themes.css';
import './design-system/numbers-actions.css';
import './design-system/support.css';
import './design-system/accounts.css';
import './design-system/pots.css';
import './design-system/status.css';
import './design-system/number-cards.css';
import './features/now/editor.css';
import './design-system/media.css';
import './design-system/mobile.css';
import './features/stories/stories.css';
class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="launch-state">
        <h1>Let’s try that again</h1>
        <p>Your demo is saved on this device where available.</p>
        <button onClick={() => location.reload()}>Reload Atlas</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function DemoMenu({ close }: { close: () => void }) {
  const [haptics, setHaptics] = useState(() => {
    try {
      return localStorage.getItem('atlas-haptics') === 'on';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = [
        ...document.querySelectorAll<HTMLElement>(
          '.demo-menu button,.demo-menu a,.demo-menu input,.demo-menu select',
        ),
      ];
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && index <= 0) {
        e.preventDefault();
        items.at(-1)?.focus();
      } else if (!e.shiftKey && index === items.length - 1) {
        e.preventDefault();
        items[0]?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-demo-menu]')?.focus());
    };
  }, [close]);
  return (
    <div className="demo-menu-layer">
      <button className="demo-menu-scrim" aria-label="Close demo options" onClick={close} />
      <section className="demo-menu" role="dialog" aria-modal="true" aria-labelledby="demo-title">
        <header>
          <h2 id="demo-title">Explore Atlas</h2>
          <button onClick={close} autoFocus aria-label="Close">
            ×
          </button>
        </header>
        <p>Four lives. One relationship.</p>
        <div className="demo-people">
          {(['alex', 'jordan', 'sam', 'elena'] as const).map((id) => (
            <button
              key={id}
              data-scenario={id}
              onClick={() => {
                window.atlas.go(id, 'now');
                window.dispatchEvent(
                  new CustomEvent('atlas:change', {
                    detail: { action: 'person:' + id, state: window.atlas.getState() },
                  }),
                );
                close();
              }}
            >
              {id[0].toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
        <label>
          Art direction
          <select
            defaultValue={document.body.dataset.direction}
            onChange={(e) => {
              const u = new URL(location.href);
              u.searchParams.set('theme', e.target.value);
              location.assign(u);
            }}
          >
            <option value="vanilla">Vanilla</option>
            <option value="bento">Bento</option>
            <option value="metro">Metro</option>
          </select>
        </label>
        <button
          onClick={() => {
            window.atlas.reset();
            close();
          }}
        >
          Reset this scenario
        </button>
        <label>
          Haptic feedback
          <input
            type="checkbox"
            checked={haptics}
            onChange={(e) => {
              setHaptics(e.target.checked);
              try {
                localStorage.setItem('atlas-haptics', e.target.checked ? 'on' : 'off');
              } catch {}
              if (e.target.checked) feedback('selection');
            }}
          />
        </label>
        <small>Where supported by your browser and device.</small>
        <a href="/?mode=workbench">Component workbench</a>
        <small>Fictional demo data · no real payments</small>
      </section>
    </div>
  );
}
function ScenarioWelcome({ close, initial }: { close: () => void; initial: boolean }) {
  const scenarios = [
    ['alex', 'Alex', 'A new beginning', 'Join · day 9'],
    ['jordan', 'Jordan', 'Finding a steady rhythm', 'Stabilise · month 7'],
    ['sam', 'Sam', 'A busy life. Bigger plans.', 'Grow · month 8'],
    ['elena', 'Elena', 'More possibilities ahead', 'Graduate · year 12'],
  ];
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.scenario-welcome');
    section?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !initial) close();
      if (event.key !== 'Tab') return;
      const buttons = [...(section?.querySelectorAll<HTMLButtonElement>('button') || [])];
      if (
        event.shiftKey &&
        (document.activeElement === buttons[0] || document.activeElement === section)
      ) {
        event.preventDefault();
        buttons.at(-1)?.focus();
      } else if (!event.shiftKey && document.activeElement === buttons.at(-1)) {
        event.preventDefault();
        buttons[0]?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [initial, close]);
  return (
    <section
      className="scenario-welcome"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      tabIndex={-1}
    >
      <div className="welcome-inner">
        <header className="welcome-brand">
          <svg viewBox="0 0 60 30" aria-hidden="true">
            <path fill="#db0011" d="M0 15 15 0h30l15 15-15 15H15Z" />
            <path fill="white" d="m15 0 15 15L45 0v30L30 15 15 30Z" />
          </svg>
          <b>HSBC</b>
          <span>Atlas</span>
          {!initial && (
            <button onClick={close} aria-label="Back to prototype">
              ×
            </button>
          )}
        </header>
        <div className="welcome-heading">
          <p className="eyebrow">FOUR MOMENTS · ONE RELATIONSHIP</p>
          <h1 id="welcome-title">Making banking a relationship again</h1>
          <p>
            Building better customers
            <br />
            builds a better bank.
          </p>
        </div>
        <nav aria-label="Choose a scenario" className="welcome-scenarios">
          {[
            { title: 'Start here', people: scenarios.filter(([id]) => id === 'sam') },
            { title: 'Explore other lives', people: scenarios.filter(([id]) => id !== 'sam') },
          ].map(({ title, people }) => (
            <section className="welcome-scenario-group" key={title} aria-label={title}>
              <h2>{title}</h2>
              {people.map(([id, name, description, stage]) => (
                <button
                  key={id}
                  data-scenario={id}
                  onClick={() => {
                    window.atlas.go(id, 'now');
                    window.dispatchEvent(
                      new CustomEvent('atlas:change', {
                        detail: { action: 'person:' + id, state: window.atlas.getState() },
                      }),
                    );
                    try {
                      sessionStorage.setItem('atlas-welcome-seen', 'yes');
                    } catch {}
                    close();
                  }}
                >
                  <span className="welcome-person">
                    <span className="welcome-name">
                      <b>{name}</b>
                    </span>
                    <span>{description}</span>
                    <small>{stage}</small>
                  </span>
                  <span className="welcome-arrow" aria-hidden="true">
                    <svg
                      className="icon"
                      data-material="arrow_forward"
                      viewBox={materialViewBoxes.arrow_forward}
                      fill="currentColor"
                      dangerouslySetInnerHTML={{ __html: materialIcons.arrow_forward }}
                    />
                  </span>
                </button>
              ))}
            </section>
          ))}
        </nav>
        <p className="welcome-footnote">Switch lives any time using the name at the top.</p>
      </div>
    </section>
  );
}
let booted = false;
function App() {
  const [status, setStatus] = useState('loading'),
    [menu, setMenu] = useState(false),
    [welcome, setWelcome] = useState<false | 'initial' | 'switch'>(false),
    [update, setUpdate] = useState<null | (() => Promise<void>)>(null);
  useEffect(() => {
    if (booted) return;
    booted = true;
    void (async () => {
      try {
        const query = new URLSearchParams(location.search),
          path = location.pathname.split('/').filter(Boolean);
        if (path[0] === 'app' && path[1]) query.set('p', path[1]);
        if (path[2]) query.set('tab', path[2]);
        if (!query.has('theme') && /\/(bento|metro)\.html$/.test(location.pathname))
          query.set('theme', location.pathname.includes('bento') ? 'bento' : 'metro');
        document.body.dataset.direction = ['vanilla', 'bento', 'metro'].includes(
          query.get('theme') || '',
        )
          ? query.get('theme')!
          : 'vanilla';
        document.body.dataset.mode =
          query.get('mode') ||
          (location.pathname.includes('workbench')
            ? 'workbench'
            : location.pathname.includes('blueprint')
              ? 'blueprint'
              : 'prototype');
        const [data, media, version] = await Promise.all(
          ['/scenarios.json', '/media.json', '/scenario-version.json'].map(async (url) => {
            const r = await fetch(url);
            if (!r.ok) throw new Error('Unable to load the demo.');
            return r.json();
          }),
        );
        window.ATLAS_DATA = data;
        window.ATLAS_MEDIA = media;
        window.ATLAS_PORTRAITS = media.portraits;
        window.ATLAS_BANK_LOGOS = media.bankLogos;
        window.ATLAS_AUDIO = media.audio;
        window.ATLAS_VERSION = version.version;
        if (!window.__ATLAS_TEST__) {
          const saved = await loadSession(version.version);
          if (saved && typeof saved === 'object' && 'people' in saved)
            window.ATLAS_RESTORED = saved;
        }
        // Normalize launch URLs before the runtime reads them.
        if (query.toString() !== location.search.slice(1))
          history.replaceState(null, '', location.pathname + '?' + query.toString());
        await import('./app/runtime.mjs');
        const nav = await import('./platform/navigation');
        nav.installNavigation();
        installViewport();
        syncThemeChrome();
        window.addEventListener('atlas:change', ((e: CustomEvent) => {
          syncThemeChrome();
          if (!window.__ATLAS_TEST__) scheduleSave(e.detail.state, window.ATLAS_VERSION);
          if (/confirm|save|done/.test(e.detail.action)) feedback('success');
        }) as EventListener);
        document.addEventListener('click', (e) => {
          if ((e.target as Element).closest('[data-demo-menu]')) setMenu(true);
          if ((e.target as Element).closest('[data-scenario-picker]')) setWelcome('switch');
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') setMenu(false);
          if (e.key === 'Enter' && (e.target as Element).matches('[data-demo-menu]')) setMenu(true);
        });
        document.addEventListener('visibilitychange', () => {
          if (document.hidden && !window.__ATLAS_TEST__)
            void saveSession(window.atlas.getState(), window.ATLAS_VERSION);
        });
        setStatus('ready');
        if (
          !window.__ATLAS_TEST__ &&
          document.body.dataset.mode === 'prototype' &&
          matchMedia('(max-width: 730px), (hover: none) and (pointer: coarse)').matches
        ) {
          let seen = false;
          try {
            seen = sessionStorage.getItem('atlas-welcome-seen') === 'yes';
          } catch {}
          if (!seen) setWelcome('initial');
        }
        if (import.meta.env.PROD && !window.__ATLAS_TEST__ && 'serviceWorker' in navigator)
          void installPwa((apply) => setUpdate(() => apply)).catch(console.warn);
      } catch (e) {
        console.error(e);
        setStatus('error');
      }
    })();
  }, []);
  useEffect(() => {
    const app = document.querySelector('#app') as HTMLElement | null;
    if (app) app.inert = status !== 'ready' || menu || !!welcome;
    return () => {
      if (app) app.inert = false;
    };
  }, [menu, welcome, status]);
  return (
    <>
      <div id="app" />
      {status === 'loading' ? (
        <div className="launch-state" role="status">
          <span className="launch-mark">◆</span>
          <h1>HSBC Atlas</h1>
          <p>Getting your experience ready…</p>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="launch-state" role="alert">
          <h1>Unable to open Atlas</h1>
          <p>We couldn’t load the prototype. Check your connection and try again.</p>
          <button onClick={() => location.reload()}>Try again</button>
        </div>
      ) : null}
      {update ? (
        <div className="update-notice" role="status">
          <span>An updated Atlas is ready.</span>
          <button onClick={() => void update()}>Save & restart</button>
          <button aria-label="Later" onClick={() => setUpdate(null)}>
            ×
          </button>
        </div>
      ) : null}
      {welcome ? (
        <ScenarioWelcome initial={welcome === 'initial'} close={() => setWelcome(false)} />
      ) : null}
      {menu ? <DemoMenu close={() => setMenu(false)} /> : null}
    </>
  );
}
window.__consoleErrors = [];
window.addEventListener('error', (e) => window.__consoleErrors?.push(e.message));
window.addEventListener('unhandledrejection', (e) =>
  window.__consoleErrors?.push(String(e.reason)),
);
createRoot(document.querySelector('#root')!).render(
  <AppBoundary>
    <App />
  </AppBoundary>,
);

import './design-system/number-visual.css';

import './features/now/refinement.css';

import './features/you/portrait.css';
import './features/you/portrait-story.css';
import './features/you/portrait-metrics.css';

import './features/you/feelings.css';

import './design-system/screen-header.css';

import './features/membership/membership.css';

import './features/badges/badges.css';

import './features/journey/journey.css';

import './features/checkin/checkin.css';
import './design-system/glass-headers.css';

import './design-system/data-colour.css';

import './features/now/background.css';

import './features/future/future.css';

import './features/pots/appearance.css';

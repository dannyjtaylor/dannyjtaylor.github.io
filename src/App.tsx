import { useDesktopStore } from './stores/desktopStore';
import { BootScreen } from './components/BootScreen/BootScreen';
import { Desktop } from './components/Desktop/Desktop';
import { ShutdownDialog } from './components/ShutdownDialog/ShutdownDialog';
import { Credits } from './pages/Credits';

// GitHub Pages SPA redirect: convert /?/credits back to /credits
(function () {
  const { search } = window.location;
  if (search.startsWith('?/')) {
    const decoded = search
      .slice(2)
      .split('&')
      .map((s) => s.replace(/~and~/g, '&'))
      .join('?');
    window.history.replaceState(null, '', '/' + decoded + window.location.hash);
  }
})();

export function App() {
  const phase = useDesktopStore((s) => s.phase);

  // Route /credits to the standalone credits page
  if (window.location.pathname === '/credits') {
    return <Credits />;
  }

  if (phase === 'boot') {
    return <BootScreen />;
  }

  if (phase === 'sleep' || phase === 'restarting') {
    return <ShutdownDialog />;
  }

  return <Desktop />;
}

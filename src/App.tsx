import { useDesktopStore } from './stores/desktopStore';
import { BootScreen } from './components/BootScreen/BootScreen';
import { Desktop } from './components/Desktop/Desktop';

export function App() {
  const phase = useDesktopStore((s) => s.phase);

  if (phase === 'boot') {
    return <BootScreen />;
  }

  return <Desktop />;
}

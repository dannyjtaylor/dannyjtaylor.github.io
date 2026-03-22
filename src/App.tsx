import { useDesktopStore } from './stores/desktopStore';
import { BootScreen } from './components/BootScreen/BootScreen';
import { Desktop } from './components/Desktop/Desktop';
import { ShutdownDialog } from './components/ShutdownDialog/ShutdownDialog';

export function App() {
  const phase = useDesktopStore((s) => s.phase);

  if (phase === 'boot') {
    return <BootScreen />;
  }

  if (phase === 'sleep' || phase === 'restarting') {
    return <ShutdownDialog />;
  }

  return <Desktop />;
}

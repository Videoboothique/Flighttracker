import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import { AppWeb } from './src/web/AppWeb';
import './src/web/app.css';

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <AppWeb />
    </AppProvider>
  );
}


import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AdminPanel from './components/admin/AdminPanel.tsx'

// Inject AdminPanel into the document
const adminPanelContainer = document.createElement('div');
adminPanelContainer.id = 'admin-panel-container';
document.body.appendChild(adminPanelContainer);

createRoot(document.getElementById("root")!).render(<App />);

// Render AdminPanel in its own container
const adminPanelRoot = createRoot(adminPanelContainer);
adminPanelRoot.render(<AdminPanel />);

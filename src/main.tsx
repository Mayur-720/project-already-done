
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import AdminPanel from './components/admin/AdminPanel.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.tsx'

// Inject AdminPanel into the document
const adminPanelContainer = document.createElement('div');
adminPanelContainer.id = 'admin-panel-container';
document.body.appendChild(adminPanelContainer);

// Render main app with its own AuthProvider
createRoot(document.getElementById("root")!).render(<App />);

// Render AdminPanel with its own AuthProvider for proper context
const adminPanelRoot = createRoot(adminPanelContainer);
adminPanelRoot.render(
  <BrowserRouter>
    <AuthProvider>
      <AdminPanel />
    </AuthProvider>
  </BrowserRouter>
);

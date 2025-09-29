import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router/Routes';

function App() {
  return (
    <BrowserRouter>
      <div className="app-div-container min-h-screen py-4 place-content-center bg-slate-900">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;
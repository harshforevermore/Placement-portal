import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/Routes";
import { AuthProvider } from "./context/AuthContext";
import {Toaster} from "sonner";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-div-container min-h-screen py-4 place-content-center bg-slate-900">
          <Toaster richColors />
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

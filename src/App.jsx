import MainRoutes from "./pages/routes/MainRoutes";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>

      
      <ToastContainer 
        position="top-right"
        autoClose={2000}
        theme="colored"
      />
    </>
  );
}

export default App;
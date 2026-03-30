import MainRoutes from "./pages/routes/MainRoutes";
import { BrowserRouter } from "react-router-dom";
function App() {

  return (
    <>
    <BrowserRouter>
      <MainRoutes />
    </BrowserRouter>
    </>
  )
}

export default App

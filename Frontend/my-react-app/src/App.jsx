import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./Signin/signin";
import Home from "./Home/home";
import Register from "./Register/Register";
import ProtectedRoute from "./ProtectedRoute";

import UserProtectedRoute from "./UserProtectedRoute";
import { AdminDashboard } from "./AdminDashboard";
import AdminProtectedRoute from "./AdminProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute/>}>
          <Route element={<UserProtectedRoute/>}>
            <Route path="/" element={<Home />} />
          </Route>

          <Route element={<AdminProtectedRoute/>}>
            <Route path="/admin" element={<AdminDashboard/>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

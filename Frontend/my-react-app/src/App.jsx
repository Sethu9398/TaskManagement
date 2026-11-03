import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signin from "./Signin/signin";
import Register from "./Register/Register";
import ProtectedRoute from "./ProtectedRoute";

import UserProtectedRoute from "./UserProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import { UserLayout } from "./Layouts/UserLayout";
import AdminLayouts from "./Layouts/Adminlayout";
import AdminTask from "./Components/Admin/Task";
import AdminDashboard from "./Components/Admin/AdminDashboard";
import UserDashboard from "./Components/User/UserDashboard";
import MyTask from "./Components/User/MyTask";
import UserList from "./Components/Admin/Userlist";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<UserProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/" element={<UserDashboard />} />
              <Route path="/user/my-task" element={<MyTask />} />
              <Route />
            </Route>
          </Route>

          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayouts />}>
              <Route index element={<AdminDashboard />} />
              <Route path="task" element={<AdminTask />} />
              <Route path="user-list" element={<UserList />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

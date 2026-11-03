import { Outlet } from "react-router-dom";
import CommonNavbar from "../Components/Common/Navbar";

const AdminLayouts = () => {
  return (
    <div>
      <CommonNavbar role="admin" />
      <main className="pt-5 mt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayouts;

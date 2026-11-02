import CommonNavbar from "../Components/Common/Navbar";
import { Outlet } from "react-router-dom";

export const UserLayout = () => {
  return (
    <div>
      <CommonNavbar role="user" />
      <main className="pt-5 mt-4">
        <Outlet />
      </main>
    </div>
  );
};

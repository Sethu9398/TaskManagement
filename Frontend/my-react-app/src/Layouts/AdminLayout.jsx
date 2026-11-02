import { Outlet } from "react-router-dom";
import CommonNavbar from "../Components/Common/Navbar";

const AdminLayouts = () => {
    return (
        <div>
            <CommonNavbar role="admin"/>
                <Outlet/>
        </div>
    );
};

export default AdminLayouts
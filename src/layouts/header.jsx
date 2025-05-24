import { useTheme } from "@/hooks/use-theme";
import { ChevronsLeft, Moon, Search, Sun, LogOut } from "lucide-react"; // Importing LogOut from lucide-react
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import profileImg from "@/assets/profile-image.jpg";
import PropTypes from "prop-types";

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleLogout = () => {
        // Clear the token or any authentication data
        localStorage.removeItem("token"); // or any other storage mechanism you're using
        // Redirect to the login page
        navigate("/"); // Use navigate to redirect to the login page
    };

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed && "rotate-180"} />
                </button>
             
            </div>
           
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};

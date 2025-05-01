
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/authUtils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authUtils";

export default function Header() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-medical-blue flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1 
            className="text-xl font-semibold cursor-pointer" 
            onClick={() => navigate("/")}
          >
            SkinSense ML
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-9 w-16 bg-gray-200 animate-pulse rounded-md"></div>
          ) : user ? (
            <>
              <div className="hidden md:block text-sm text-gray-600">
                Welcome, <span className="font-medium">{user.email?.split('@')[0]}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/history")}
              >
                History
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

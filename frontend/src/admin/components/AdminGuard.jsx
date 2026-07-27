import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { authAPI } from "../../utils/api";
import { logout, setUser } from "../../redux/authSlice";

const AdminGuard = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(Boolean(token) && !user);

  useEffect(() => {
    if (!token || user) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        dispatch(setUser(response.data.user));
      } catch (error) {
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [dispatch, token, user]);

  if (!token) {
    return <Navigate to="/store/admin/login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f1217] text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          <p className="mt-4 text-sm text-white/70">Loading admin workspace...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/store/admin/login" replace />;
  }

  return children;
};

export default AdminGuard;

import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: "pointer" ,fontFamily: 'cursive'}}
          onClick={() => navigate("/")}
        >
          🏨 GrandBookings.com
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Typography sx={{ my: "auto", color: "#02fde4" }}>
                Welcome, {user?.name}!
              </Typography>
              <Button color="inherit" onClick={() => navigate("/hotels")}>
                Hotels
              </Button>
              <Button color="inherit" onClick={() => navigate("/my-bookings")}>
                My Bookings
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate("/register")}>
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;

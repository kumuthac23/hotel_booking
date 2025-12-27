import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HotelListing from "./pages/HotelListing";
import HotelDetails from "./pages/HotelDetails";
import MyBookings from "./pages/MyBookings";

function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: "#143030",
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            backgroundColor: "#02fde4",
            color: "#000",
            '&:hover': {
              backgroundColor: "#01d9c9",
            },
          },
          contained: {
            backgroundColor: "#02fde4",
            color: "#000",
            '&:hover': {
              backgroundColor: "#01d9c9",
            },
          },
        },
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Navigation />
            <Box sx={{ flex: 1 }}>
              <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/hotels" element={<HotelListing />} />
                <Route
                  path="/hotel/:hotelId"
                  element={
                    <ProtectedRoute>
                      <HotelDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/hotels" replace />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

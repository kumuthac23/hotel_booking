import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
} from "@mui/material";
import { hotelService, bookingService } from "../services/api";
import { IHotel } from "../interface/type";
import { useAuth } from "../context/AuthContext";

const HotelDetails: React.FC = () => {
  const { hotelId } = useParams<{ hotelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<IHotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [checkAvailability, setCheckAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error";
  }>({ open: false, msg: "", sev: "success" });
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfRooms: 1,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
  });

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await hotelService.getHotel(hotelId || "");
        setHotel(response.data);
        if (response.data.rooms.length > 0) {
          setSelectedRoomType(response.data.rooms[0].type);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch hotel");
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchHotel();
    }
  }, [hotelId]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        guestName: user.name,
        guestEmail: user.email,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfRooms" ? parseInt(value) : value,
    }));
    if (["checkInDate", "checkOutDate", "numberOfRooms"].includes(name)) {
      setAvailabilityResult(null);
      setCheckAvailability(false);
      setError("");
    }
    if (name === "guestPhone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length === 0) {
        setPhoneError(null);
      } else if (!/^\d{10}$/.test(digits)) {
        setPhoneError("Phone number must be exactly 10 digits");
      } else {
        setPhoneError(null);
      }
    }
  };

  const handleRoomSelect = (type: string) => {
    setSelectedRoomType(type);
    setAvailabilityResult(null);
    setCheckAvailability(false);
    setError("");
  };

  const handleCheckAvailability = async () => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setError("Please select both check-in and check-out dates");
      return;
    }

    if (new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
      setError("Check-out date must be after check-in date");
      return;
    }

    try {
      const result = await hotelService.checkAvailability(
        hotelId || "",
        selectedRoomType,
        formData.checkInDate,
        formData.checkOutDate,
        formData.numberOfRooms
      );
      setAvailabilityResult(result);
      setError("");
      setCheckAvailability(true);
      if (result.available) {
        setSnack({
          open: true,
          msg: `✓ ${result.availableRooms} rooms available`,
          sev: "success",
        });
        setTimeout(() => confirmRef.current?.focus(), 300);
      } else {
        setSnack({
          open: true,
          msg: "✗ No rooms available for selected dates",
          sev: "error",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to check availability");
      setCheckAvailability(false);
      setSnack({
        open: true,
        msg: "Failed to check availability",
        sev: "error",
      });
    }
  };

  const handleBooking = async () => {
    if (!formData.guestPhone) {
      setError("Please provide your phone number");
      return;
    }

    // Validate phone: must be exactly 10 digits
    const phoneDigits = formData.guestPhone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(phoneDigits)) {
      setPhoneError("Phone number must be exactly 10 digits");
      setError("Phone number must be exactly 10 digits");
      phoneRef.current?.focus();
      return;
    } else {
      setPhoneError(null);
    }

    if (!availabilityResult?.available) {
      setError("Selected rooms are not available for the chosen dates");
      return;
    }

    setBookingLoading(true);
    try {
      await bookingService.createBooking({
        hotelId: hotelId || "",
        roomType: selectedRoomType,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfRooms: formData.numberOfRooms,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
      });
      navigate("/my-bookings");
    } catch (err: any) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!hotel) {
    return (
      <Container>
        <Alert severity="error">Hotel not found</Alert>
      </Container>
    );
  }

  const selectedRoom = hotel.rooms.find((r) => r.type === selectedRoomType);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {hotel.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                📍 {hotel.location}
              </Typography>
              {hotel.description && (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {hotel.description}
                </Typography>
              )}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Available Room Types:
                </Typography>
                {hotel.rooms.map((room) => (
                  <Button
                    key={room.type}
                    variant={
                      selectedRoomType === room.type ? "contained" : "outlined"
                    }
                    fullWidth
                    sx={{ mb: 1 }}
                    onClick={() => handleRoomSelect(room.type)}
                  >
                    {room.type} - ${room.price}/night
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Book Your Stay
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Check-in Date"
                name="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
              />
              <TextField
                fullWidth
                label="Check-out Date"
                name="checkOutDate"
                type="date"
                value={formData.checkOutDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
              />
              <TextField
                fullWidth
                label="Number of Rooms"
                name="numberOfRooms"
                type="number"
                value={formData.numberOfRooms}
                onChange={handleChange}
                margin="normal"
                inputProps={{ min: 1, max: 10 }}
              />
              <TextField
                fullWidth
                label="Guest Name"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                margin="normal"
                disabled
              />
              <TextField
                fullWidth
                label="Guest Email"
                name="guestEmail"
                type="email"
                value={formData.guestEmail}
                onChange={handleChange}
                margin="normal"
                disabled
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="guestPhone"
                value={formData.guestPhone}
                onChange={handleChange}
                margin="normal"
                placeholder="+1234567890"
                error={!!phoneError}
                helperText={phoneError || ""}
                inputRef={(el) => (phoneRef.current = el)}
              />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleCheckAvailability}
              sx={{ mb: 2 }}
            >
              {availabilityResult
                ? availabilityResult.available
                  ? "Available ✓"
                  : "Not available ✗"
                : "Check Availability"}
            </Button>

            {availabilityResult && (
              <Card
                sx={{
                  mb: 2,
                  bgcolor: availabilityResult.available ? "#e8f5e9" : "#ffebee",
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {availabilityResult.available
                      ? "✓ Available"
                      : "✗ Not Available"}
                  </Typography>
                  <Typography variant="body2">
                    Available Rooms: {availabilityResult.availableRooms}
                  </Typography>
                  {selectedRoom && availabilityResult.available && (
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, fontWeight: "bold" }}
                    >
                      Total Price: $
                      {selectedRoom.price *
                        formData.numberOfRooms *
                        Math.ceil(
                          (new Date(formData.checkOutDate).getTime() -
                            new Date(formData.checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}

            <Button
              ref={confirmRef}
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleBooking}
              disabled={
                !(availabilityResult && availabilityResult.available) ||
                bookingLoading
              }
            >
              {bookingLoading ? "Booking..." : "Confirm Booking"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HotelDetails;

import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { bookingService } from "../services/api";
import { IBooking, IHotel } from "../interface/type";

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await bookingService.getUserBookings();
        setBookings(response.bookings || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelClick = (bookingId: string) => {
    setSelectedBooking(bookingId);
    setOpenDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    setCancelLoading(true);
    try {
      await bookingService.cancelBooking(selectedBooking);
      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === selectedBooking
            ? { ...booking, status: "Cancelled" }
            : booking
        )
      );
      setOpenDialog(false);
      setSelectedBooking(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const days = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        My Bookings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookings.length === 0 ? (
        <Alert severity="info">You have no bookings yet</Alert>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => {
            const hotel = booking.hotelId as unknown as IHotel;
            const nights = calculateNights(
              booking.checkInDate,
              booking.checkOutDate
            );

            return (
              <Grid item xs={12} md={6} key={booking._id}>
                <Card
                  sx={{
                    opacity: booking.status === "Cancelled" ? 0.6 : 1,
                  }}
                >
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                      mb={2}
                    >
                      <Typography variant="h5" component="h2">
                        {hotel?.name || "Hotel"}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          bgcolor:
                            booking.status === "Booked" ? "#e8f5e9" : "#ffebee",
                          color:
                            booking.status === "Booked" ? "#2e7d32" : "#c62828",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {booking.status}
                      </Typography>
                    </Box>

                    <Typography color="textSecondary" gutterBottom>
                      📍 {hotel?.location || "Location"}
                    </Typography>

                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>Room Type:</strong> {booking.roomType}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Check-in:</strong>{" "}
                        {formatDate(booking.checkInDate)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Check-out:</strong>{" "}
                        {formatDate(booking.checkOutDate)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Number of Rooms:</strong>{" "}
                        {booking.numberOfRooms}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Duration:</strong> {nights} night
                        {nights !== 1 ? "s" : ""}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Guest Name:</strong> {booking.guestName}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Guest Email:</strong> {booking.guestEmail}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Guest Phone:</strong> {booking.guestPhone}
                      </Typography>
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid #eee",
                        color: "#1976d2",
                      }}
                    >
                      Total Price: ${booking.totalPrice}
                    </Typography>
                  </CardContent>

                  <CardActions>
                    {booking.status === "Booked" && (
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => handleCancelClick(booking._id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No, Keep It</Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={cancelLoading}
          >
            {cancelLoading ? "Cancelling..." : "Yes, Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookings;

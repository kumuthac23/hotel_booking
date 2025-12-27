import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};

// Hotel Services
export const hotelService = {
  getAllHotels: async () => {
    const response = await apiClient.get("/hotels");
    return response.data;
  },

  getHotel: async (id: string) => {
    const response = await apiClient.get(`/hotels/${id}`);
    return response.data;
  },

  checkAvailability: async (
    hotelId: string,
    roomType: string,
    checkInDate: string,
    checkOutDate: string,
    numberOfRooms: number
  ) => {
    const response = await apiClient.post("/hotels/check-availability", {
      hotelId,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfRooms,
    });
    return response.data;
  },
};

// Booking Services
export const bookingService = {
  createBooking: async (bookingData: {
    hotelId: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfRooms: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
  }) => {
    const response = await apiClient.post("/bookings", bookingData);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await apiClient.get("/bookings/my");
    return response.data;
  },

  getBooking: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  cancelBooking: async (id: string) => {
    const response = await apiClient.put(`/bookings/${id}/cancel`);
    return response.data;
  },
};

export default apiClient;

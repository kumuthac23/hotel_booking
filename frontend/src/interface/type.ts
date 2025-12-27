export interface IEnquiry {
  fullName: string;
  email: string;
  mobileNumber: string;
  message?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface IRoom {
  type: string;
  price: number;
  totalRooms: number;
}

export interface IHotel {
  _id: string;
  name: string;
  location: string;
  description?: string;
  rooms: IRoom[];
  createdAt: string;
  updatedAt: string;
}

export interface IBooking {
  _id: string;
  userId: string | IUser;
  hotelId: string | IHotel;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  totalPrice: number;
  status: "Booked" | "Cancelled";
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  status: string;
  message: string;
  token: string;
  user: IUser;
}

export interface IBookingRequest {
  hotelId: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}

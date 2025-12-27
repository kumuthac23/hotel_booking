# Mini Hotel Booking Dashboard

A full-stack hotel booking application built with React, Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Hotel Listing**: Browse available hotels with room types and prices
- **Room Availability**: Real-time availability checking for selected dates
- **Booking Management**: Book rooms, view booking history, and cancel bookings
- **User Dashboard**: View all your bookings with detailed information

## Technology Stack

### Frontend

- React 19 with TypeScript
- Vite (build tool)
- Material-UI (MUI) for components
- React Router for navigation
- Axios for API calls
- React Hook Form for forms

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the Api directory:

```bash
cd Api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string:

```
CONNECTION_STRING=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your_secret_key_here
```

5. Seed the database with sample hotels:

```bash
node seedHotels.js
```

6. Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. In a new terminal, navigate to the Frontend directory:

```bash
cd Frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Hotels

- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/hotels/check-availability` - Check room availability

### Bookings

- `POST /api/bookings` - Create a new booking (Protected)
- `GET /api/bookings/my` - Get user's bookings (Protected)
- `GET /api/bookings/:id` - Get booking details (Protected)
- `PUT /api/bookings/:id/cancel` - Cancel a booking (Protected)

## Usage

1. **Register**: Create a new account with name, email, and password
2. **Login**: Sign in with your email and password
3. **Browse Hotels**: View all available hotels and their room types
4. **Check Availability**: Select dates and number of rooms to check availability
5. **Book**: Confirm booking with guest information
6. **View Bookings**: Access your booking history from the dashboard
7. **Cancel**: Cancel any active booking if needed

## Room Availability Logic

The system prevents overbooking by:

1. Checking existing bookings for the selected date range
2. Comparing available rooms with requested quantity
3. Preventing booking if not enough rooms are available
4. Calculating total price based on room rate, number of rooms, and duration

## Deployment URLs

When deployed, your frontend and backend will be hosted on separate URLs (or the same domain with different paths). Example placeholders (replace with your actual deployment addresses):

- Frontend (Vite build): https://your-frontend-host.example.com
- Backend (API): https://your-api-host.example.com (serving /api/\*)

How to publish:

- Frontend: run `npm run build` in `Frontend/` and deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, S3 + CloudFront).
- Backend: deploy `Api/` to a Node host (Heroku, Render, DigitalOcean App Platform, Railway) and set the `CONNECTION_STRING` and `JWT_SECRET` env vars.

When deploying, update the frontend API base URL to point to your backend (in `Frontend/src/services/api.ts`) and set proper CORS origins on the API.

## Room Availability Logic (detailed)

Overview:

- Input: `hotelId`, `roomType`, `checkInDate`, `checkOutDate`, `numberOfRooms`
- Goal: determine if there are at least `numberOfRooms` free rooms of the requested `roomType` for the entire date range.

Algorithm (as implemented):

1. Validate inputs: ensure all fields are present and dates are valid (`checkOutDate` > `checkInDate`).
2. Load the `Hotel` document by `hotelId` and find the `room` object for `roomType` (contains `price` and `totalRooms`).
3. Count existing bookings that would occupy rooms during the requested date range:

- A booking is considered overlapping if `booking.checkInDate < requestedCheckOut` AND `booking.checkOutDate > requestedCheckIn`.
- Only bookings with `status: "Booked"` are counted (cancelled bookings are ignored).

4. Compute `availableRooms = room.totalRooms - bookedRooms`.
5. If `availableRooms >= numberOfRooms`, the API returns available=true, availableRooms, requiredRooms, and price.

Notes and edge cases:
- Time boundaries: treat `checkInDate` as the first night and `checkOutDate` as the morning the guest leaves — bookings that check out on the same day others check in do not overlap.
- Price calculation: frontend calculates total price as `room.price * numberOfRooms * nights` where `nights = (checkOut - checkIn)` in days.

## Database Schemas

### User

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Hotel

```javascript
{
  name: String,
  location: String,
  description: String,
  rooms: [
    {
      type: String,
      price: Number,
      totalRooms: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Booking

```javascript
{
  userId: ObjectId,
  hotelId: ObjectId,
  roomType: String,
  checkInDate: Date,
  checkOutDate: Date,
  numberOfRooms: Number,
  totalPrice: Number,
  status: String (Booked/Cancelled),
  guestName: String,
  guestEmail: String,
  guestPhone: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features Implementation

### Authentication

- JWT tokens for secure authentication
- Password hashing with bcryptjs
- Protected routes requiring valid tokens
- Token stored in localStorage

### Room Availability

- Real-time availability checking
- Prevents double-booking
- Calculates duration automatically
- Dynamic price calculation

### Booking Management

- Create bookings with guest details
- View complete booking history
- Cancel bookings (mark as Cancelled, not deleted)
- Prevents unauthorized access to other users' bookings

## Building for Production

### Backend

```bash
cd Api
npm install
# Update .env for production
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm run build
# Output in dist/ directory
```

## Security Considerations

1. JWT tokens are used for authentication
2. Passwords are hashed using bcryptjs
3. Protected routes check for valid tokens
4. CORS is configured for specific origins
5. Environment variables store sensitive data
6. Passwords are not returned in API responses

## Future Enhancements

- Admin panel for hotel management
- Payment gateway integration
- Email notifications for bookings
- User profile management
- Hotel reviews and ratings
- Multi-language support
- Mobile app version
- Advanced search and filtering

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in .env
- Verify network access if using cloud MongoDB

### CORS Errors

- Check that frontend URL is in CORS whitelist
- Update app.js with your frontend URL if needed

### Authentication Issues

- Clear localStorage and re-login
- Check JWT_SECRET matches between requests
- Verify token is being sent in Authorization header

## Support

For issues or questions, please check the code comments or create an issue in the repository.

## License

ISC

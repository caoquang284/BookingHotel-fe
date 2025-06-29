import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import AppLayout from "./components/common/AppLayout";
import BookingHistory from "./pages/BookingHistory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import BookingPage from "./pages/BookingPage";
import { AuthProvider } from "./contexts/AuthContext";
import RoomDetail from "./pages/RoomDetail";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import RentalHistory from "./pages/RentalHistory";
import Policy from "./pages/Policy";
import HotelDetail from "./pages/HotelDetail";
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      { path: "/booking-history", element: <BookingHistory /> },
      { path: "/rooms", element: <Rooms /> },
      { path: "/booking", element: <BookingPage /> },
      { path: "/room-detail/:id", element: <RoomDetail /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/profile", element: <Profile /> },
      { path: "/rental-history", element: <RentalHistory /> },
      { path: "/policy", element: <Policy /> },
      { path: "/hotel-detail", element: <HotelDetail /> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;

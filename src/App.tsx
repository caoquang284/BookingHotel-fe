import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import AppLayout from "./components/common/AppLayout";
import BookingHistory from "./pages/BookingHistory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import BookingPage from "./pages/BookingPage";
import { AuthProvider } from "./contexts/AuthContext";
import RoomDetail from "./pages/RoomDetail";

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
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

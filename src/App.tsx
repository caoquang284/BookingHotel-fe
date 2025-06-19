import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home";
import AppLayout from "./components/common/AppLayout";
import BookingHistory from "./pages/BookingHistory";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      { path: "/dashboard", element: <AdminDashboard /> },
      { path: "/booking-history", element: <BookingHistory /> },
      { path: "/login", element: <Login /> },
      { path: "/profile", element: <Profile /> },
      { path: "/register", element: <Register /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

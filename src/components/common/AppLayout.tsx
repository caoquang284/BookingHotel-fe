import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {" "}
        <Outlet />
        <ScrollToTop />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;

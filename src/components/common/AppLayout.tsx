import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-8 pb-8">
        {" "}
        <div className="container mx-auto px-4">
          <Outlet /> 
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;

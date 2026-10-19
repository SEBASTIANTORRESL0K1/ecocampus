import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PageLayout = ({ children, className = "", navTransparent = false }) => {
  return (
    <div className={`min-h-screen flex flex-col ${navTransparent ? "" : "pt-16"} ${className}`}>
      <Navbar transparent={navTransparent} />
      {children}
      <Footer />
    </div>
  );
};

export default PageLayout;

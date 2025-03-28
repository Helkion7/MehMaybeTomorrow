import React from "react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <main className="flex-1 p-2 md:p-4 relative z-10">{children}</main>
    </div>
  );
};

export default Layout;

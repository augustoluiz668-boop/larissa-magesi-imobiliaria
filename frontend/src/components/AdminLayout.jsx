import React from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children, title, subtitle, actions }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="border-b border-[#d1dde8] bg-white">
          <div className="px-6 md:px-10 py-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl text-[#071d34] leading-none">{title}</h1>
              {subtitle && <p className="text-sm text-[#5C5C5C] mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
          </div>
        </div>
        <div className="px-6 md:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full py-stack-lg border-t border-outline-variant/20 bg-surface-container-low mt-auto text-on-surface-variant">
      <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
          <span className="font-headline-md text-headline-md text-primary font-bold">
            StayWise.ai
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
            Elevating travel through intelligent design and seamless booking.
          </p>
          <p className="font-body-md text-body-md text-slate-500">
            © 2026 StayWise.ai. All rights reserved.
          </p>
        </div>
        
        {/* Company Column */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-2">Company</h4>
          <a href="#" className="font-body-md text-body-md hover:text-primary hover:underline transition-all">About Us</a>
          <a href="#" className="font-body-md text-body-md hover:text-primary hover:underline transition-all">Careers</a>
          <a href="#" className="font-body-md text-body-md hover:text-primary hover:underline transition-all">Contact</a>
        </div>

        {/* Legal Column */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-2">Legal</h4>
          <a href="#" className="font-body-md text-body-md hover:text-primary hover:underline transition-all">Privacy Policy</a>
          <a href="#" className="font-body-md text-body-md hover:text-primary hover:underline transition-all">Terms of Service</a>
          <a href="#" className="font-body-md text-body-md hover:text-primary hover:underline transition-all">Cookie Policy</a>
        </div>

        {/* Admin Link Column */}
        <div className="flex flex-col gap-3">
          <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-2">Administrative</h4>
          <Link to="/admin/login" className="font-body-md text-body-md hover:text-primary hover:underline text-teal-vibrant transition-all font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            Admin Portal Login
          </Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

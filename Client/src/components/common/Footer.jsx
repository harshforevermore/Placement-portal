import { Link } from 'react-router-dom';

const Footer = () => {
  
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <span className="text-white font-bold text-xl">PP</span>
              </div>
              <span className="ml-3 text-white text-xl font-semibold">Placement Portal</span>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Connecting talent with opportunity through innovative placement solutions for educational institutions worldwide.
            </p>
          </div>
          
          {/* Platform Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/find-institution" className="text-slate-400 hover:text-white transition-colors duration-200">
                  For Students
                </Link>
              </li>
              <li>
                <Link to="/institution-register" className="text-slate-400 hover:text-white transition-colors duration-200">
                  For Institutions
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors duration-200">
                  For Companies
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/support" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-400">&copy; {new Date().getFullYear()} Placement Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
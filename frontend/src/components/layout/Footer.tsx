import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t-2 border-[#AEC3B0] mt-auto pt-16">
      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/assets/images/connecto-logo.png" 
                alt="ConnectO Logo" 
                className="w-9 h-9 rounded-full object-cover"
              />
              <h3 className="text-xl font-bold text-[#0D2B1D]">ConnectO</h3>
            </div>
            <p className="text-[#345635]">
              Service marketplace for trusted providers and clients.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#0D2B1D]">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-[#345635] hover:text-[#6B8F71] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-[#345635] hover:text-[#6B8F71] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#345635] hover:text-[#6B8F71] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-[#0D2B1D]">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className="text-[#345635] hover:text-[#6B8F71] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-[#345635] hover:text-[#6B8F71] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t-2 border-[#E3EFD3] text-center">
          <p className="text-[#6B8F71]">&copy; 2025 ConnectO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

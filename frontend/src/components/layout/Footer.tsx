import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0D2B1D] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/assets/images/connecto-logo.png" 
                alt="ConnectO Logo" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <h3 className="text-2xl font-bold">ConnectO</h3>
            </div>
            <p className="text-[#AEC3B0]">
              Connecting service providers with clients seamlessly across India
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#E3EFD3]">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-[#AEC3B0] hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-[#AEC3B0] hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#AEC3B0] hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-[#E3EFD3]">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-[#AEC3B0] hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-[#AEC3B0] hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#345635] text-center text-[#AEC3B0]">
          <p>&copy; 2025 ConnectO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

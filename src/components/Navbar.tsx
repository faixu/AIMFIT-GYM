import { motion } from "motion/react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);

  const isHome = location.pathname === "/";

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastClickTime.current < 500) {
      clickCount.current += 1;
    } else {
      clickCount.current = 1;
    }
    lastClickTime.current = now;

    if (clickCount.current === 5) {
      navigate("/admin");
      clickCount.current = 0;
    } else if (clickCount.current === 1) {
      navigate("/");
    }
  };

  const navLinks = [
    { name: "About", href: isHome ? "#about" : "/#about" },
    { name: "Services", href: isHome ? "#services" : "/#services" },
    { name: "Gallery", href: isHome ? "#gallery" : "/#gallery" },
    { name: "Pricing", href: isHome ? "#pricing" : "/#pricing" },
    { name: "Trainers", href: isHome ? "#trainers" : "/#trainers" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-dark/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <button 
              onClick={handleLogoClick}
              className="flex items-center gap-2 focus:outline-none cursor-default"
            >
              <span className="text-2xl font-display font-black tracking-tighter italic">
                AIM<span className="text-brand-accent">FIT</span>
              </span>
            </button>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className="hover:text-brand-accent transition-colors uppercase text-sm font-semibold"
                >
                  {link.name}
                </a>
              ))}
              <Link 
                to="/shop" 
                className={`flex items-center gap-2 uppercase text-sm font-semibold transition-colors ${
                  location.pathname === "/shop" ? "text-brand-accent" : "hover:text-brand-accent"
                }`}
              >
                <ShoppingBag size={18} />
                Shop
              </Link>
              <a href="#contact" className="btn-primary !py-2 !px-6">Join Now</a>
            </div>
          </div>
          
          <div className="md:hidden flex items-center gap-4">
            <Link 
              to="/shop" 
              className={`p-2 rounded-md ${location.pathname === "/shop" ? "text-brand-accent" : "text-white"}`}
            >
              <ShoppingBag size={24} />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-brand-accent focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-brand-dark border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)} 
                className="block px-3 py-4 text-base font-medium hover:bg-white/5 uppercase"
              >
                {link.name}
              </a>
            ))}
            <Link 
              to="/shop" 
              onClick={() => setIsOpen(false)} 
              className={`block px-3 py-4 text-base font-medium hover:bg-white/5 uppercase flex items-center gap-2 ${
                location.pathname === "/shop" ? "text-brand-accent" : ""
              }`}
            >
              <ShoppingBag size={20} />
              Shop
            </Link>
            <a href="#contact" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-bold text-brand-accent uppercase">Join Now</a>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

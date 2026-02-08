const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-primary via-primary-light to-primary text-white py-20 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
      <div className="absolute top-10 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div className="md:col-span-2 animate-fade-in">
            <div className="flex items-center space-x-4 mb-6 group">
              <div className="relative">
                {/* Logo with animated ring */}
                <div className="absolute inset-0 rounded-full bg-white/10 group-hover:scale-125 transition-all duration-300"></div>
                <img
                  src="/images/logo.png"
                  alt="ELOCAB"
                  className="h-16 w-auto relative z-10 group-hover:scale-105 transition-all duration-500 drop-shadow-2xl"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-white to-secondary-light bg-clip-text text-transparent">ELOCAB</h3>
                <p className="text-sm text-white/70 font-medium">Ride with Ease</p>
              </div>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed text-lg">
              Your trusted ride partner in Kumasi. Reliable rides anytime, your journey our priority.
            </p>
            <div className="glass-dark rounded-xl p-4 inline-block">
              <p className="text-sm text-white/90 flex items-center gap-2">
                <svg className="w-5 h-5 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Based in Kumasi, Ghana
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-secondary rounded-full"></div>
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="/login"
                  className="text-white/80 hover:text-secondary transition-all inline-flex items-center group text-base"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Login
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="text-white/80 hover:text-secondary transition-all inline-flex items-center group text-base"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Register
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <div className="w-1 h-6 bg-secondary rounded-full"></div>
              Contact Us
            </h3>
            <ul className="space-y-4 text-white/80">
              <li>
                <a
                  href="https://wa.me/233240786555"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-all flex items-center space-x-3 group text-base glass-dark rounded-lg p-3 hover:bg-white/20"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">💬</span>
                  <div>
                    <div className="font-semibold text-white">WhatsApp</div>
                    <div className="text-sm">0240786555</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="tel:0257160074"
                  className="hover:text-secondary transition-all flex items-center space-x-3 group text-base glass-dark rounded-lg p-3 hover:bg-white/20"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                  <div>
                    <div className="font-semibold text-white">Call Us</div>
                    <div className="text-sm">0257160074</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="mailto:obedelobed@gmail.com"
                  className="hover:text-secondary transition-all flex items-center space-x-3 group text-base glass-dark rounded-lg p-3 hover:bg-white/20"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">✉️</span>
                  <div>
                    <div className="font-semibold text-white text-xs sm:text-sm">Email</div>
                    <div className="text-xs sm:text-sm">obedelobed@gmail.com</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} ELOCAB. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-sm">Made with</span>
              <span className="text-secondary text-lg animate-pulse">❤️</span>
              <span className="text-white/40 text-sm">in Kumasi</span>
            </div>
            {/* Secret admin access - triple click/tap the copyright */}
            <div 
              onClick={(e) => {
                if (e.detail === 3) {
                  window.location.href = '/admin/login';
                }
              }}
              className="mt-4 cursor-default select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              title="Triple click for admin access"
            >
              <p className="text-xs text-white/30">© 2026 ELOCAB. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

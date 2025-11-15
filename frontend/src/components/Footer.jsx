import { Facebook, Instagram, Youtube, Mail } from 'lucide-react';

function Footer() {
  const footerSections = [
    {
      title: 'HELP',
      links: ['Contact Us', 'Shipping', 'Returns', 'FAQ', 'Size Guide']
    },
    {
      title: 'ABOUT',
      links: ['Our Story', 'Our Commitment', 'Our Stores', 'Careers', 'Press']
    },
    {
      title: 'LEGAL',
      links: ['Terms & Conditions', 'Shipping Policy', 'Privacy Policy', 'Cookies', 'Sitemap']
    }
  ];

  return (
    <footer className="bg-[#efebe3] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-serif mb-6 text-[#2b3349] tracking-wider">
              FitZone
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Creator of timeless and personalizable pieces.
              Handcrafted in France since 2011.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-green-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-red-400 transition-colors">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-cyan-400 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-extrabold text-[#2b3349] tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#5a647e] transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Maison Labiche. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png"
                alt="Visa"
                className="h-6 opacity-70"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/200px-MasterCard_Logo.svg.png"
                alt="Mastercard"
                className="h-6 opacity-70"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png"
                alt="American Express"
                className="h-6 opacity-70"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

import { Globe, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600 mt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 sm:gap-8 mb-12">
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Help Center
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Safety Information
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Cancellation Options
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Report Neighborhood
                </button>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Airbnb Magazine
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Community Guidelines
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Community Center
                </button>
              </li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Hosting
            </h3>
            <ul className="space-y-3">
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Try Hosting
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Host Resources
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Community Forum
                </button>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              About
            </h3>
            <ul className="space-y-3">
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Newsroom
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Careers
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  Investors
                </button>
              </li>
            </ul>
          </div>

          {/* Settings */}
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Settings
            </h3>
            <ul className="space-y-3">
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-2">
                  <Globe size={16} /> English (US)
                </button>
              </li>
              <li>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition">
                  $ USD
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <p className="text-xs text-gray-500 order-2 sm:order-1">
              © {new Date().getFullYear()} Airbnb Clone. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4 order-1 sm:order-2">
              <button className="p-2 hover:bg-gray-200 rounded-full transition" aria-label="Facebook">
                <Facebook size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-full transition" aria-label="Twitter">
                <Twitter size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-full transition" aria-label="Instagram">
                <Instagram size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 text-xs text-gray-500 order-3">
              <button className="hover:text-gray-900 transition">Privacy</button>
              <span>•</span>
              <button className="hover:text-gray-900 transition">Terms</button>
              <span>•</span>
              <button className="hover:text-gray-900 transition">Sitemap</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
import React from "react";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

const footerLinks = {
  Shop: [
    { label: "Featured", href: "/#featured" },
    { label: "New Arrivals", href: "/#new-arrivals" },
    { label: "Sale Picks", href: "/#sale-picks" },
    { label: "Collections", href: "/#collections" },
  ],
  Company: [
    { label: "About the Edit", href: "/#story" },
    { label: "Contact", href: "/#footer" },
    { label: "Profile", href: "/profile" },
    { label: "Orders", href: "/orders" },
  ],
};

const shellClass = "mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8";

const Footer = () => {
  return (
    <footer id="footer" className="mt-20 bg-[#161211] text-white">
      <div className={`${shellClass} py-14`}>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1fr]">
          <div>
            <p className="font-serif text-5xl leading-none tracking-[-0.06em]">
              Style
              <span className="text-[#ef5b5b]">Up.</span>
            </p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/[0.65]">
              A polished storefront for modern wardrobes, elevated essentials,
              and smooth shopping flows from discovery to checkout.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href="https://facebook.com"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-[#ef5b5b] hover:text-white"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-[#ef5b5b] hover:text-white"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:border-[#ef5b5b] hover:text-white"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-[#f6b7ad]">
                {title}
              </h3>
              <ul className="mt-5 space-y-3 text-sm text-white/[0.65]">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition hover:text-white">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-[#f6b7ad]">
              Contact
            </h3>

            <ul className="mt-5 space-y-4 text-sm text-white/[0.65]">
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-[#ef5b5b]" />
                <span>info@styleup.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 text-[#ef5b5b]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-[#ef5b5b]" />
                <span>Hyderabad,Telanagana,India</span>
              </li>
            </ul>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">
                Need help with an order?
              </p>
              <p className="mt-2 text-sm text-white/60">
                Reach out any time and we'll help you with fit, delivery, or
                returns.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/[0.45] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 StyleUp. Crafted for modern fashion storefronts.</p>
          <p>
            Responsive landing page experience built with React and Tailwind.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

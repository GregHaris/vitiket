import { COMPANY_INFO, LINK_SECTIONS } from "@/constants/footerData";
import { LinkList } from "./FooterLinks";

export default function Footer() {
  return (
    <footer className="w-full relative bg-gray-900 px-4 lg:px-10 md:pt-20 pt-10">
      <div className="max-w-[1950px] mx-auto space-y-10">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="space-y-2 text-sm text-gray-50">
              {COMPANY_INFO.address.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <div>
                <span className="text-gray-50">Phone number</span>
                <p className="text-gray-400">{COMPANY_INFO.contact.phone}</p>
              </div>
              <div>
                <span className="text-gray-50">Email</span>
                <p className="text-gray-400">{COMPANY_INFO.contact.email}</p>
              </div>
            </div>
          </div>

          {/* Link Sections */}
          {LINK_SECTIONS.map((section) => (
            <LinkList key={section.title} {...section} />
          ))}
        </div>

        <div className="flex items-center mb-6">
          <h1 className="text-[100px] md:text-[240px] lg:text-[262px] font-bold text-neutral-white">
            {COMPANY_INFO.name}
          </h1>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 py-8">
          <p className="text-center text-sm text-gray-50">
            © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

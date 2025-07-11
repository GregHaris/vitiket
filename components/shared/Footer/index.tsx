import { Button } from "@/components/ui/button";
import { COMPANY_INFO, LINK_SECTIONS } from "@/constants/footerData";
import { Input } from "@/components/ui/input";
import { LinkList } from "./FooterLinks";
export default function Footer() {
  return (
    <footer className="w-full relative bg-neutral-black px-12 md:pt-20 pt-10">
      <div className="max-w-[1950px] mx-auto space-y-10">
        {/* Newsletter Section */}
        <div>
          <div className="space-y-4">
            <h2 className="text-neutral-white h2-bold mb-4">
              Subscribe to our newsletter
            </h2>
            <p className="mb-8 text-gray-400">
              Join now for exclusive event insights, industry trends and
              platform updates delivered weekly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="h-11 px-4 border-gray-300 bg-neutral-white md:w-xl w-full"
            />
            <Button className="light-btn">Get started</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-8">
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

        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-8xl lg:text-[262px] font-bold text-neutral-white">
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

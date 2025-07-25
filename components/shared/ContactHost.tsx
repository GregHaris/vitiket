import Image from "next/image";
import Link from "next/link";

import { ContactHostProps } from "@/types";
import { Mail, Phone } from "lucide-react";

const ContactHost = ({ contactDetails }: ContactHostProps) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xl font-bold">Contact Host</h3>
      <div className="flex flex-wrap gap-4">
        {/* Phone Number */}
        {contactDetails.phoneNumber && (
          <div className="flex items-center gap-2">
            <Phone className="text-neutral-white fill-primary" />
            <span className="p-regular-16">{contactDetails.phoneNumber}</span>
          </div>
        )}

        {/* Email */}
        {contactDetails.email && (
          <Link
            href={`mailto:${contactDetails.email}`}
            className="flex items-center gap-2"
          >
            <Mail className="text-neutral-white fill-primary" />
            <span className="p-regular-16 truncate">
              {contactDetails.email}
            </span>
          </Link>
        )}

        {/* Website */}
        {contactDetails.website && (
          <Link
            href={contactDetails.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Image
              src="/assets/icons/web.svg"
              width={24}
              height={24}
              alt="website"
            />
            <span className="p-regular-16 truncate">
              {contactDetails.website}
            </span>
          </Link>
        )}

        <div className="flex flex-wrap gap-4">
          {/* LinkedIn */}
          {contactDetails.linkedin && (
            <Link
              href={contactDetails.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Image
                src="/assets/icons/linkedIn.svg"
                width={30}
                height={30}
                alt="linkedin"
              />
            </Link>
          )}
          {/* Instagram */}
          {contactDetails.instagram && (
            <Link
              href={contactDetails.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Image
                src="/assets/icons/instagram.svg"
                width={24}
                height={24}
                alt="instagram"
              />
            </Link>
          )}
          {/* Facebook */}
          {contactDetails.facebook && (
            <Link
              href={contactDetails.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Image
                src="/assets/icons/facebook.svg"
                width={24}
                height={24}
                alt="facebook"
              />
            </Link>
          )}
          {/* X (Twitter) */}
          {contactDetails.x && (
            <Link
              href={contactDetails.x}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Image src="/assets/icons/x.svg" width={24} height={24} alt="x" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactHost;

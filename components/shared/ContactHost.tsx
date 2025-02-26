import Image from 'next/image';
import Link from 'next/link';

import { ContactHostProps } from '@/types';


const ContactHost = ({ contactDetails }: ContactHostProps) => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xl font-bold">Contact Host</h3>
      <div className="flex flex-wrap gap-4">
        {/* Phone Number */}
        {contactDetails.phoneNumber && (
          <div className="flex items-center gap-2">
            <Image
              src="/assets/icons/phone.svg"
              width={24}
              height={24}
              alt="phone"
            />
            <span className="p-regular-16">{contactDetails.phoneNumber}</span>
          </div>
        )}

        {/* Email */}
        {contactDetails.email && (
          <Link
            href={`mailto:${contactDetails.email}`}
            className="flex items-center gap-2"
          >
            <Image
              src="/assets/icons/email.svg"
              width={24}
              height={24}
              alt="email"
            />
            <span className="p-regular-16">{contactDetails.email}</span>
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
              src="/assets/icons/website.svg"
              width={24}
              height={24}
              alt="website"
            />
          </Link>
        )}

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
              width={24}
              height={24}
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
  );
};

export default ContactHost;

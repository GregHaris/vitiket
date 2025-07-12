import Link from "next/link";

export const LinkList = ({
  title,
  links,
}: {
  title: string;
  links: { text: string; href: string }[];
}) => (
  <div>
    <h4 className="font-semibold mb-4 text-gray-400">{title}</h4>
    <ul className="space-y-3 text-sm text-gray-200">
      {links.map((link) => (
        <li key={link.text}>
          <Link
            href={link.href}
            className="footerLinks hover:text-neutral-white transition-colors"
            target={link.href.startsWith("http") ? "_blank" : "_self"}
            rel={
              link.href.startsWith("http") ? "noopener noreferrer" : undefined
            }
          >
            {link.text}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

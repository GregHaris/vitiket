import Link from "next/link";

export const LinkList = ({
  title,
  links,
}: {
  title: string;
  links: string[];
}) => (
  <div>
    <h4 className="font-semibold mb-4 text-gray-400">{title}</h4>
    <ul className="space-y-3 text-sm text-gray-200">
      {links.map((link) => (
        <li key={link}>
          <Link href="#" className="hover:text-white">
            {link}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

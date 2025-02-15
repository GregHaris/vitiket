import Link from 'next/link';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="flex flex-col gap-4 p-5 text-center sm:flex-row sm:justify-between sm:items-center">
        <p className="text-sm">©{currentYear} Vitiket</p>
        <p className="p-bold-20">
          Created by:{' '}
          <Link
            href="https://x.com/IamAbovExcuse"
            className="p-regular-20  text-primary-500"
          >
            Grëg Häris{' '}
          </Link>
        </p>
      </div>
    </footer>
  );
};

import Header from '@shared/Header';
import Footer from '@shared/Footer';
import DisplayAdmin from './admin/displayAdminButton';
import MobileNavAndUserButton from '@/components/shared/MobilNavAndUserButtons';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <div className='flex items-center justify-between'>
        <Header /> <div className='whitespace-nowrap flex items-center justify-end'> <DisplayAdmin /> <MobileNavAndUserButton/></div>
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { LoginModal } from '@/components/auth/LoginModal';
import CustomModal from '@/components/CustomModal';

export const metadata: Metadata = {
  title: "Suryodaya Farms | Nature's Superfoods for Modern Living",
  description: "Suryodaya Farms brings you Pure, Natural and Nutritious superfoods inspired by nature. Discover our carefully crafted range of quality products and experience nutrition you can trust.",
  icons: {
    icon: 'https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Suryodaya Farms',
    title: "Suryodaya Farms | Nature's Superfoods for Modern Living",
    description: "Suryodaya Farms brings you Pure, Natural and Nutritious superfoods inspired by nature. Discover our carefully crafted range of quality products and experience nutrition you can trust.",
    images: ['https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Suryodaya Farms | Nature's Superfoods for Modern Living",
    description: "Suryodaya Farms brings you Pure, Natural and Nutritious superfoods inspired by nature. Discover our carefully crafted range of quality products and experience nutrition you can trust.",
    images: ['https://i.ibb.co/Pz01P9Y5/Whats-App-Image-2026-05-29-at-6-51-48-PM-removebg-preview.png'],
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-[#F6F3ED] text-[#1E1E1E]">
        <AuthProvider>
          {/* Main App content wrapper */}
          <div className="min-h-screen flex flex-col justify-between">
            {children}
          </div>
          
          {/* Global Mobile OTP Authentication Modal */}
          <LoginModal />

          {/* Global Modal system */}
          <CustomModal />
        </AuthProvider>
      </body>
    </html>
  );
}

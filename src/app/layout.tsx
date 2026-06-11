import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Deep Study Bible',
  description: 'A beautiful, distraction-free Bible reading and deep study application.',
  manifest: '/manifest.json',
};

import Navbar from '@/components/layout/Navbar';
import PWARegistration from '@/components/PWARegistration';
import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="font-sans antialiased bg-[#FCFBF8] text-stone-800 selection:bg-stone-200 min-h-screen flex flex-col">
        <PWARegistration />
        <Navbar />
        <main className="flex-grow pt-16">
          {children}
        </main>
        
        {/* BibleRefLink Integration */}
        <Script 
          src="https://www.bibleref.com/tools/biblereflink.js" 
          strategy="lazyOnload"
        />
        <Script id="biblereflink-init" strategy="lazyOnload">
          {`
            window.addEventListener('load', function() {
              if (typeof BibleRefLink !== 'undefined') {
                BibleRefLink.init({ siteKey: 'public-demo' }); // Replace with actual siteKey if required
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}

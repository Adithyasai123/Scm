import type { Metadata } from 'next';
import { Manrope, Source_Serif_4, Source_Code_Pro } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { AppLayout } from '@/components/layout/AppLayout';

/* Public stand-ins for Atlas: Euclid Circular A (UI) + MongoDB Value Serif (H1/H2) + Source Code Pro */
const atlasSans = Manrope({
  subsets: ['latin'],
  variable: '--font-atlas-sans',
  display: 'swap',
});

const atlasSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-atlas-serif',
  display: 'swap',
});

const atlasMono = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-atlas-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SCM Telecom Channel Management Portal',
  description: 'AI-Native UI Developer Hackathon - Sales Channel Management Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${atlasSans.variable} ${atlasSerif.variable} ${atlasMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          <AppLayout>{children}</AppLayout>
        </Providers>
      </body>
    </html>
  );
}


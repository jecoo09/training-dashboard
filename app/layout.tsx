import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import Providers from './providers';
import './global.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Training Dashboard',
  description: 'TND 2026 Training Dashboard',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} ${plusJakarta.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

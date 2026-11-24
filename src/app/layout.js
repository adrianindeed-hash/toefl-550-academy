import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'TOEFL 550 Academy — AI Lecturer & Quiz App',
  description:
    'Aplikasi Persiapan TOEFL ITP Target Skor 550+ dengan AI Dosen Bilingual, Bank 300+ Soal, dan Simulasi Interaktif.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TOEFL 550'
  }
};

export const viewport = {
  themeColor: '#1E3A8A',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='40' fill='%231E3A8A'/><text x='96' y='118' font-family='sans-serif' font-size='70' font-weight='900' fill='%23FBBF24' text-anchor='middle'>550</text></svg>"
        />
        <link
          rel="apple-touch-icon"
          href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' rx='40' fill='%231E3A8A'/><text x='96' y='118' font-family='sans-serif' font-size='70' font-weight='900' fill='%23FBBF24' text-anchor='middle'>550</text></svg>"
        />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased">
        {children}

        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}

import "./globals.css";

export const metadata = {
  title: "My Next App",
  description: "Generated with Next.js and Tailwind",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

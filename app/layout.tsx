import { GeistSans } from "geist/font/sans";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Netcompany-Intrasoft ERP Discovery Questionnaire",
  description: "Netcompany-Intrasoft ERP Discovery Questionnaire",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="text-foreground">
        <main className="items-center">
          {children}
        </main>
      </body>
    </html>
  );
}

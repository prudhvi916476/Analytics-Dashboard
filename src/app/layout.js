import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ["400", "500", "600", "700", "800"] });

export const metadata = {
  title: "Business Analytics Dashboard",
  description: "A fast, insightful, and well-presented analytics application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}

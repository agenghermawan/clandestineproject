import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "../components/navbar";
import { AuthProvider } from "../context/AuthContext";
import LoaderWrapper from "../components/ui/loader-wrapper";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
    title: "Clandestine Project",
    description: "Clandestine Project.",
    icons: { icon: "image/favicon.ico" }
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={poppins.variable}>
        <body className="antialiased">
        <AuthProvider>
            <Navbar />
            <LoaderWrapper>
                {children}
            </LoaderWrapper>
        </AuthProvider>
        </body>
        </html>
    );
}
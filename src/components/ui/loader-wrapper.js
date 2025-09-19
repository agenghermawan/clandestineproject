'use client'
import { useAuth } from "../../context/AuthContext";
import SlideLoader from "../../components/ui/loader-page";

export default function LoaderWrapper({ children }) {
    const { authState } = useAuth();
    if (authState === "loading") return <SlideLoader />;
    return children;
}
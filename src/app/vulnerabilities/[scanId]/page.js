"use client";
import { use } from "react";
import ScanDetailPage from '../../../components/va/va_scan_detail_page';

export default function Page({ params }) {
    // Unwrap the promise!
    const unwrappedParams = use(params);
    return <ScanDetailPage scanId={unwrappedParams.scanId} />;
}
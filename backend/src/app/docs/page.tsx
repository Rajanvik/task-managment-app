'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Using dynamic import to avoid SSR issues with swagger-ui-react
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
    const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
        fetch('/api/swagger')
            .then((res) => res.json())
            .then((data) => setSpec(data));
    }, []);

    if (!mounted || !spec) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-medium animate-pulse">Initializing API Documentation...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <style jsx global>{`
                .swagger-ui .topbar { display: none; }
                .swagger-ui .info { margin: 20px 0; }
                .swagger-ui .info .title { color: #1e293b; font-family: 'Inter', sans-serif; margin-bottom: 10px; }
                .swagger-ui .info .description { margin-bottom: 15px; }
                .swagger-ui .scheme-container { background: transparent; box-shadow: none; border-bottom: 1px solid #f1f5f9; padding: 10px 0; margin-bottom: 10px; }
                .swagger-ui .opblock { border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
                .swagger-ui .opblock-summary { padding: 10px 20px; }
                .swagger-ui .opblock-tag { margin: 15px 0 10px; }
                .swagger-ui section.models { margin-top: 20px; }
            `}</style>
            <div className="max-w-5xl mx-auto px-4 py-4">
                <SwaggerUI 
                    spec={spec} 
                    deepLinking={true} 
                    displayRequestDuration={true} 
                    docExpansion="list"
                    filter={true}
                />
            </div>
        </div>
    );
}

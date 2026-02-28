
import React from 'react';

interface LegalPageProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, lastUpdated, children }) => {
    return (
        <div className="max-w-[680px] mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-12">
                {title}
            </h2>

            <div className="space-y-10 text-slate-500 leading-relaxed text-lg">
                {children}

                <footer className="pt-8 border-t border-slate-100">
                    <p className="text-sm italic text-slate-400">
                        Last updated: {lastUpdated}
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default LegalPage;

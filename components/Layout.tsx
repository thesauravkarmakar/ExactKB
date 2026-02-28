
import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-24 animate-in fade-in duration-700 min-h-screen flex flex-col">
            <header className="text-center mb-16">
                <Link to="/" className="inline-block group">
                    <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 transition-transform group-hover:scale-[1.02]">
                        Exact<span className="text-blue-600">KB</span>
                    </h1>
                </Link>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                    Set the size you want. We handle the rest automatically.
                </p>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="mt-20 pb-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <div className="flex items-center">
                    <p className="text-slate-400 text-sm">
                        Made by <a href="https://github.com/thesauravkarmakar" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-600 hover:text-blue-600 transition-colors">Saurav Karmakar</a>
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <Link to="/compliance" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">Compliance</Link>
                    <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">Terms</a>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

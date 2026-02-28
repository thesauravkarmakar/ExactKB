
import React from 'react';

const Terms: React.FC = () => {
    return (
        <div className="max-w-[680px] mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-12">
                Terms of Use
            </h2>

            <div className="space-y-10 text-slate-500 leading-relaxed text-lg">
                <p className="font-medium text-slate-600">
                    ExactKB is a free, browser-based image compression tool. By using it, you agree to these terms.
                </p>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">The service</h3>
                    <p>
                        ExactKB is provided as-is, free of charge. We may update, pause, or discontinue it at any time without notice.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Your files</h3>
                    <p>
                        All processing happens locally in your browser. We have no access to your images at any point.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Acceptable use</h3>
                    <p>
                        Use ExactKB for lawful purposes only. Don't attempt to reverse engineer, abuse, or disrupt the service.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Liability</h3>
                    <p>
                        We're not liable for any loss or damage arising from your use of ExactKB. Always keep originals of files you compress.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Changes</h3>
                    <p>
                        We may update these terms occasionally. Continued use of the service means you accept the current terms.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Contact</h3>
                    <p>
                        Reach us at <a href="mailto:mail@sauravkarmakar.in" className="text-blue-600 hover:text-blue-700 font-medium decoration-slate-200 decoration-2 underline-offset-4 hover:underline">mail@sauravkarmakar.in</a>
                    </p>
                </section>

                <footer className="pt-8 border-t border-slate-100">
                    <p className="text-sm italic text-slate-400">
                        Last updated: February 2026
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Terms;

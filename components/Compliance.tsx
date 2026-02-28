
import React from 'react';

const Compliance: React.FC = () => {
    return (
        <div className="max-w-[680px] mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-12">
                Compliance
            </h2>

            <div className="space-y-10 text-slate-500 leading-relaxed text-lg">
                <p className="font-medium text-slate-600">
                    ExactKB is built on a simple principle: your files are yours.
                </p>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">How it works</h3>
                    <p>
                        All image processing happens entirely in your browser using client-side JavaScript. Your images are never uploaded to any server, never stored, and never transmitted anywhere.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Data we collect</h3>
                    <p>
                        Nothing. We don't use cookies, analytics scripts, or tracking pixels. We don't collect your IP address, device information, or usage patterns.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Third parties</h3>
                    <p>
                        We have no third-party integrations that receive your data. No Google Analytics, no ad networks, no telemetry.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">GDPR & Privacy laws</h3>
                    <p>
                        Because we collect no personal data, most data protection regulations don't apply. But the spirit of privacy-first is exactly how ExactKB was designed.
                    </p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Contact</h3>
                    <p>
                        Questions? Reach us at <a href="mailto:mail@sauravkarmakar.in" className="text-blue-600 hover:text-blue-700 font-medium decoration-slate-200 decoration-2 underline-offset-4 hover:underline">mail@sauravkarmakar.in</a>
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

export default Compliance;

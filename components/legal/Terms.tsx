import React from 'react';
import LegalPage from './LegalPage';

const Terms: React.FC = () => {
    return (
        <LegalPage title="Terms of Use" lastUpdated="February 2026">
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
        </LegalPage>
    );
};

export default Terms;

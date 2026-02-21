import React from 'react';

const TypographyShowcase = () => {
    return (
        <div className="p-8 space-y-8 max-w-2xl mx-auto bg-slate-900 rounded-xl border border-slate-800">
            <section className="space-y-2">
                <p className="text-tiny-accent">Hierarchy: Heading</p>
                <h1 className="text-4xl font-bold tracking-tight text-white">Outfit: Modern Heading</h1>
                <h2 className="text-2xl font-semibold text-slate-200">Outfit: Subtitle Style</h2>
            </section>

            <section className="space-y-4">
                <p className="text-tiny-accent">Hierarchy: Body</p>
                <p className="text-lg text-slate-300 leading-relaxed">
                    Inter is utilized for body text, providing exceptional legibility across all screen sizes.
                    It supports multiple weights like <span className="font-medium text-white">Medium (500)</span> and
                    <span className="font-semibold text-white"> Semibold (600)</span> for clear hierarchy.
                </p>
                <p className="text-sm text-slate-400">
                    <em>Italics are used only for semantic emphasis within the body text.</em>
                </p>
            </section>

            <section className="flex flex-wrap gap-4 items-center">
                <div>
                    <p className="text-tiny-accent mb-2">Button Role</p>
                    <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors">
                        Inter Medium
                    </button>
                </div>

                <div>
                    <p className="text-tiny-accent mb-2">Caption Role</p>
                    <span className="text-xs text-slate-500">
                        Captions use Inter at a smaller scale.
                    </span>
                </div>
            </section>

            <section className="p-4 bg-slate-950 rounded border border-slate-800">
                <p className="text-tiny-accent mb-2">Code Role</p>
                <code className="text-indigo-400 font-mono">--font-heading: "Outfit"</code>
            </section>
        </div>
    );
};

export default TypographyShowcase;

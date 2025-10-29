/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface FooterProps {
    bookCount: number;
}

const Footer: React.FC<FooterProps> = ({ bookCount }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-neutral-900/80 backdrop-blur-sm p-3 z-40 text-neutral-400 text-xs sm:text-sm border-t border-white/10">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center gap-4 px-4">
                <p>
                    {bookCount} {bookCount === 1 ? 'book' : 'books'} in library
                </p>
                <a
                    href="https://aistudio.google.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-center text-black bg-yellow-400 py-2 px-4 rounded-md transform transition-transform duration-200 hover:scale-105 hover:bg-yellow-300 shadow-[1px_1px_0px_1px_rgba(0,0,0,0.2)] whitespace-nowrap"
                >
                    Apps on AI Studio
                </a>
            </div>
        </footer>
    );
};

export default Footer;

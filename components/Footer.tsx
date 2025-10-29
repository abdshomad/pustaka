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
            </div>
        </footer>
    );
};

export default Footer;
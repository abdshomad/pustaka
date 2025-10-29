/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
    bookCount: number;
}

const Footer: React.FC<FooterProps> = ({ bookCount }) => {
    const { t } = useLanguage();

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-neutral-900/80 backdrop-blur-sm p-3 z-40 text-neutral-400 text-xs sm:text-sm border-t border-white/10">
            <div className="max-w-screen-xl mx-auto flex justify-between items-center gap-4 px-4">
                <p>
                    {t('bookCount', { count: bookCount })}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
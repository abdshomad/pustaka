/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    const buttonClasses = (lang: 'en' | 'id') => 
        `px-3 py-1 text-sm font-bold rounded-md transition-colors ${
            language === lang
                ? 'bg-yellow-500 text-black'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
        }`;

    return (
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20 flex items-center gap-2 bg-neutral-800 p-1 rounded-lg">
            <button onClick={() => setLanguage('en')} className={buttonClasses('en')}>
                EN
            </button>
            <button onClick={() => setLanguage('id')} className={buttonClasses('id')}>
                ID
            </button>
        </div>
    );
};

export default LanguageSwitcher;

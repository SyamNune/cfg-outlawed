import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown, Sparkles } from 'lucide-react';

export const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', region: 'National / Official' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', region: 'Karnataka (DLSA Lead)' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'Northern / Central India' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', region: 'Andhra Pradesh & Telangana' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', region: 'Tamil Nadu & Puducherry' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', region: 'Maharashtra & Goa' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'West Bengal & Tripura' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', region: 'Gujarat' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', region: 'Kerala & Lakshadweep' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', region: 'Odisha' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', region: 'Punjab & Chandigarh' },
  { code: 'ur', name: 'Urdu', native: 'اردو', region: 'National' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', region: 'Assam' },
];

export default function GoogleTranslator({ compact = false, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Initialize Google Translate Script
  useEffect(() => {
    // Read saved language from cookie or localStorage
    const savedCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('googtrans='));
    if (savedCookie) {
      const langCode = savedCookie.split('=')[1]?.split('/')[2];
      if (langCode) setSelectedLang(langCode);
    } else {
      const stored = localStorage.getItem('appLanguage');
      if (stored) setSelectedLang(stored);
    }

    // Set up Google Translate callback function
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: INDIAN_LANGUAGES.map((l) => l.code).join(','),
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // Load Google script if not present
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    setSelectedLang(langCode);
    localStorage.setItem('appLanguage', langCode);
    setIsOpen(false);

    // Set Google Translate cookie
    const cookieVal = langCode === 'en' ? '' : `/en/${langCode}`;
    const domain = window.location.hostname;
    
    // Set for current path and root domain
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; domain=.${domain}; path=/;`;

    // Trigger select element change if present in DOM
    const selectElem = document.querySelector('.goog-te-combo');
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      // Refresh to apply new language cleanly
      window.location.reload();
    }
  };

  const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === selectedLang) || INDIAN_LANGUAGES[0];

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.native.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Hidden Google Translate container */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>

      {/* Modern Custom Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border border-sand-300 bg-white/90 backdrop-blur-sm text-charcoal-900 shadow-sm hover:bg-sand-50 hover:border-sand-400 transition-all font-medium focus:outline-none focus:ring-2 focus:ring-charcoal-700 ${
          compact ? 'py-1.5 px-2.5 text-xs' : 'py-2 px-3 text-xs sm:text-sm'
        }`}
        title="Translate platform into Indian regional languages"
      >
        <Globe className="h-4 w-4 text-taupe-700 shrink-0" />
        <div className="flex items-center gap-1.5 text-left">
          <span className="font-bold text-charcoal-900">{currentLangObj.native}</span>
          <span className="text-[11px] text-charcoal-500 hidden sm:inline">({currentLangObj.name})</span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-charcoal-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Selection Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-white border border-sand-300 shadow-corporate z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-3 bg-charcoal-950 text-sand-50 border-b border-charcoal-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-bold tracking-tight">Select Indian Language</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-sand-300 font-mono">
                13 Languages
              </span>
            </div>

            {/* Quick Search */}
            <input
              type="text"
              placeholder="Search language (e.g. Kannada, हिन्दी)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs rounded-md bg-charcoal-900 text-sand-50 placeholder-charcoal-400 border border-charcoal-700 focus:outline-none focus:ring-1 focus:ring-amber-400"
              autoFocus
            />
          </div>

          {/* Languages Grid / List */}
          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1 divide-y divide-sand-100">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === selectedLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-sand-200/70 text-charcoal-950 font-bold'
                      : 'hover:bg-sand-100/80 text-charcoal-800'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal-950">{lang.native}</span>
                      <span className="text-[11px] text-charcoal-500 font-medium">{lang.name}</span>
                    </div>
                    <span className="text-[10px] text-charcoal-400">{lang.region}</span>
                  </div>

                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-charcoal-900 text-sand-50 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="p-4 text-center text-xs text-charcoal-500">
                No matching Indian languages found.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-sand-50 border-t border-sand-200 text-[10px] text-charcoal-500 flex items-center justify-between">
            <span>Powered by Neural Machine Translation</span>
            <button
              type="button"
              onClick={() => changeLanguage('en')}
              className="text-charcoal-800 hover:text-charcoal-950 font-bold underline"
            >
              Reset to English
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

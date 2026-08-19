import { useEffect, useRef, useState } from 'react';

const SEARCH_DELAY = 300;

export default function GeoapifyAddressInput({
  id,
  value,
  onChange,
  className,
  placeholder,
  language,
}) {
  const wrapperRef = useRef(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  useEffect(() => () => {
    window.clearTimeout(timerRef.current);
    abortRef.current?.abort();
  }, []);

  const search = (text) => {
    window.clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (text.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY?.trim();
    if (!apiKey) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    timerRef.current = window.setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          text: text.trim(),
          apiKey,
          format: 'json',
          filter: 'countrycode:de',
          limit: '5',
          lang: language === 'de' ? 'de' : 'en',
        });
        const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error('Geoapify request failed');
        const data = await response.json();
        const results = Array.isArray(data.results)
          ? data.results.filter((result) => result.formatted).slice(0, 5)
          : [];

        setSuggestions(results);
        setActiveIndex(-1);
        setOpen(results.length > 0);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSuggestions([]);
          setOpen(false);
        }
      }
    }, SEARCH_DELAY);
  };

  const selectSuggestion = (suggestion) => {
    onChange(suggestion.formatted);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!open || suggestions.length === 0) {
      if (event.key === 'Escape') setOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        id={id}
        autoComplete="street-address"
        className={className}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          search(event.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls={`${id}-suggestions`}
        aria-expanded={open}
      />

      {open && suggestions.length > 0 && (
        <ul
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-auto border border-white/10 bg-secondary shadow-xl"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.place_id || suggestion.formatted}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-4 py-3 text-sm text-lunar transition-colors ${index === activeIndex ? 'bg-gold/10 text-ivory' : 'hover:bg-white/5 hover:text-ivory'}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion.formatted}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

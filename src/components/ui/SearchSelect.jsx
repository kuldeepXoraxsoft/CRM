import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, X, Check, Search } from 'lucide-react'
import { cn } from '../../lib/cn'
import Field from './Field'
import Spinner from './Spinner'

/**
 * SearchSelect - a searchable dropdown (combobox). Supports single or
 * multi-select, local filtering, and async/server-driven search.
 *
 * Props:
 * - label: string
 * - options: Array<{ value, label, disabled? }> - used as the source list
 *   for local filtering, and as the initial list before any async search.
 * - value: the selected value - a single value, or an array of values when
 *   `isMulti` is true
 * - onChange(newValue): called with the new value (or array, if isMulti)
 * - isMulti: bool (default false)
 * - onSearch(query): optional async function returning an options array.
 *   When provided, search is server-driven (debounced) instead of filtering
 *   `options` locally.
 * - debounceMs: number - debounce delay for onSearch (default 300)
 * - placeholder: string - shown in the control when nothing is selected
 * - searchPlaceholder: string - shown in the search input
 * - noOptionsMessage: string
 * - clearable: bool (default true)
 * - error / helperText / required / disabled
 * - containerClassName / className
 */
export default function SearchSelect({
  label,
  options = [],
  value,
  onChange,
  isMulti = false,
  onSearch = null,
  debounceMs = 300,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  noOptionsMessage = 'No options found',
  clearable = true,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  containerClassName = '',
  className = '',
}) {
  const autoId = useId()
  const controlId = autoId
  const rootRef = useRef(null)
  const searchInputRef = useRef(null)

  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [asyncOptions, setAsyncOptions] = useState(options)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)

  const selectedValues = isMulti ? value || [] : value ? [value] : []

  // Local filtering (only used when no onSearch is supplied)
  const localFiltered = useMemo(() => {
    if (onSearch) return asyncOptions
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [onSearch, asyncOptions, options, query])

  // Debounced async search
  useEffect(() => {
    if (!onSearch) return
    let cancelled = false
    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const results = await onSearch(query)
        if (!cancelled) setAsyncOptions(results || [])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, debounceMs)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, onSearch])

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0)
      requestAnimationFrame(() => searchInputRef.current?.focus())
    }
  }, [isOpen])

  function openDropdown() {
    if (disabled) return
    setIsOpen(true)
  }

  function isSelected(optValue) {
    return selectedValues.includes(optValue)
  }

  function selectOption(opt) {
    if (opt.disabled) return
    if (isMulti) {
      const next = isSelected(opt.value)
        ? selectedValues.filter((v) => v !== opt.value)
        : [...selectedValues, opt.value]
      onChange?.(next)
      // keep dropdown open for multi-select so users can pick several
    } else {
      onChange?.(opt.value)
      setIsOpen(false)
      setQuery('')
    }
  }

  function removeValue(v, e) {
    e?.stopPropagation()
    if (isMulti) {
      onChange?.(selectedValues.filter((x) => x !== v))
    } else {
      onChange?.(null)
    }
  }

  function clearAll(e) {
    e.stopPropagation()
    onChange?.(isMulti ? [] : null)
  }

  function handleKeyDown(e) {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault()
      openDropdown()
      return
    }
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, localFiltered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = localFiltered[highlightedIndex]
      if (opt) selectOption(opt)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
    }
  }

  // Resolve label(s) for the control's collapsed display
  const allKnownOptions = onSearch ? [...options, ...asyncOptions] : options
  const selectedOptions = selectedValues
    .map((v) => allKnownOptions.find((o) => o.value === v))
    .filter(Boolean)

  return (
    <Field
      label={label}
      htmlFor={controlId}
      required={required}
      error={error}
      helperText={helperText}
      className={containerClassName}
    >
      <div ref={rootRef} className="relative">
        {/* Control */}
        <div
          id={controlId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          onClick={openDropdown}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border bg-surface px-3 py-1.5 cursor-pointer',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
            disabled && 'bg-canvas text-ink-faint cursor-not-allowed pointer-events-none',
            error
              ? 'border-danger-500 focus:ring-danger-500/30'
              : 'border-border-strong',
            className,
          )}
        >
          {selectedOptions.length === 0 && (
            <span className="text-sm text-ink-faint select-none">
              {placeholder}
            </span>
          )}

          {isMulti
            ? selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={(e) => removeValue(opt.value, e)}
                    className="text-primary-600 hover:text-primary-700"
                    aria-label={`Remove ${opt.label}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            : selectedOptions[0] && (
                <span className="text-sm text-ink">{selectedOptions[0].label}</span>
              )}

          <span className="ml-auto flex items-center gap-1 pl-1">
            {clearable && selectedValues.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                aria-label="Clear selection"
                className="text-ink-faint hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown size={16} className="text-ink-faint" />
          </span>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-surface shadow-lg">
            <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
              <Search size={14} className="text-ink-faint shrink-0" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
              {isLoading && <Spinner size="sm" className="text-ink-faint shrink-0" />}
            </div>

            <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
              {!isLoading && localFiltered.length === 0 && (
                <li className="px-3 py-2 text-sm text-ink-faint">
                  {noOptionsMessage}
                </li>
              )}

              {localFiltered.map((opt, index) => (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(opt)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between px-3 py-2 text-sm',
                    opt.disabled && 'cursor-not-allowed text-ink-faint',
                    !opt.disabled && index === highlightedIndex && 'bg-canvas',
                    !opt.disabled && isSelected(opt.value) && 'font-medium text-primary-600',
                  )}
                >
                  {opt.label}
                  {isSelected(opt.value) && <Check size={14} />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Field>
  )
}

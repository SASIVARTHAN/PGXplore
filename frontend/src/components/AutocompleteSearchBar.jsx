import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SEARCH_PLACEHOLDER_EXAMPLES, useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder'
import { useListings } from '../contexts/AdminContext'
import { getSearchSuggestions } from '../utils/pgSearch'
import { getSearchValidationMessage, isValidSearchQuery } from '../utils/searchValidation'
import { redirectToLogin } from '../utils/navigation'

export default function AutocompleteSearchBar({
  value,
  onChange,
  placeholder = 'Search PGs by name, area, budget, food…',
  rotatePlaceholder = true,
  placeholderExamples = SEARCH_PLACEHOLDER_EXAMPLES,
  navigateOnSearch = false,
  requireAuth = false,
  onSearch,
  onInvalidSearch,
  maxSuggestions = 8,
  dropdownElevated = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { listings } = useListings()
  const listboxId = useId()
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const showRotatingPlaceholder = rotatePlaceholder && !value.trim() && !focused
  const rotating = useRotatingPlaceholder(showRotatingPlaceholder, placeholderExamples)

  const suggestions = useMemo(
    () => getSearchSuggestions(value, listings, maxSuggestions),
    [value, listings, maxSuggestions],
  )

  const showDropdown = open && value.trim().length > 0 && suggestions.length > 0

  const runSearch = useCallback(
    (searchValue = value) => {
      const q = searchValue.trim()
      if (!isValidSearchQuery(q)) {
        onInvalidSearch?.(getSearchValidationMessage())
        return
      }
      setOpen(false)
      setHighlightIndex(-1)
      if (onSearch) {
        onSearch(q)
        return
      }
      if (navigateOnSearch) {
        const target = `/listings?q=${encodeURIComponent(q)}`
        if (requireAuth && !isAuthenticated) {
          redirectToLogin(navigate, {
            from: target,
            location,
          })
          return
        }
        navigate(target)
      }
    },
    [value, onInvalidSearch, onSearch, navigateOnSearch, requireAuth, isAuthenticated, navigate, location.pathname],
  )

  const selectSuggestion = useCallback(
    (item) => {
      onChange(item.value)
      runSearch(item.value)
    },
    [onChange, runSearch],
  )

  useEffect(() => {
    setHighlightIndex(-1)
  }, [value, suggestions.length])

  useEffect(() => {
    const handlePointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === 'Enter') runSearch()
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setOpen(true)
        setHighlightIndex(0)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        selectSuggestion(suggestions[highlightIndex])
      } else {
        runSearch()
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlightIndex(-1)
    }
  }

  const dropdownClass = dropdownElevated
    ? 'absolute left-0 right-0 top-full z-[200] mt-1 max-h-72 overflow-y-auto rounded-xl border border-app bg-card py-1 shadow-xl ring-1 ring-black/5 dark:ring-white/10'
    : 'absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-app bg-card py-1 shadow-lg'

  return (
    <div ref={rootRef} className="relative z-20 w-full">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          {showRotatingPlaceholder && (
            <span
              className="pointer-events-none absolute inset-0 flex items-center px-4 text-sm font-normal text-neutral-400 transition-opacity duration-300 dark:text-stone-500"
              style={{ opacity: rotating.visible ? 1 : 0 }}
              aria-hidden
            >
              {rotating.text}....
            </span>
          )}
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-label={placeholder}
            aria-activedescendant={
              highlightIndex >= 0 ? `${listboxId}-option-${highlightIndex}` : undefined
            }
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              setFocused(true)
              if (value.trim()) setOpen(true)
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={showRotatingPlaceholder ? '' : placeholder}
            className="input-app w-full"
            autoComplete="off"
          />
        </div>
        <button type="button" onClick={() => runSearch()} className="btn-primary shrink-0 px-5 py-3">
          Search
        </button>
      </div>

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          className={dropdownClass}
        >
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === highlightIndex}
            >
              <button
                type="button"
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => selectSuggestion(item)}
                className={`flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition ${
                  index === highlightIndex ? 'bg-card-muted' : 'hover:bg-card-muted'
                }`}
              >
                <span className="text-sm font-medium text-main">{item.label}</span>
                {item.sublabel && <span className="text-xs text-muted">{item.sublabel}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { Check, ChevronsUpDown, Loader2, Plus, Search, X } from 'lucide-react';
import * as React from 'react';
import { cn } from '../lib/utils';
import { Badge } from './badge';
import type { ComboboxOption } from './combobox';

export interface AsyncComboboxSingleProps {
  multiple?: false;
  value?: string | null;
  onChange: (value: string, selectedOption?: ComboboxOption) => void;
  loadOptions: (query: string) => Promise<ComboboxOption[]>;
  initialOptions?: ComboboxOption[];
  minSearchLength?: number;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onCreate?: (
    search: string,
  ) => Promise<string | ComboboxOption | void> | string | ComboboxOption | void;
  isCreating?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  id?: string;
}

export interface AsyncComboboxMultipleProps {
  multiple: true;
  value: string[];
  onChange: (value: string[], selectedOptions?: ComboboxOption[]) => void;
  loadOptions: (query: string) => Promise<ComboboxOption[]>;
  initialOptions?: ComboboxOption[];
  minSearchLength?: number;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onCreate?: (
    search: string,
  ) => Promise<string | ComboboxOption | void> | string | ComboboxOption | void;
  isCreating?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  id?: string;
}

export type AsyncComboboxProps =
  AsyncComboboxSingleProps | AsyncComboboxMultipleProps;

export function AsyncCombobox(props: AsyncComboboxProps) {
  const {
    loadOptions,
    initialOptions = [],
    minSearchLength = 3,
    placeholder = 'Select option...',
    searchPlaceholder = 'Type at least 3 letters to search...',
    emptyText = 'No options found',
    onCreate,
    isCreating = false,
    disabled = false,
    allowClear = true,
    className,
    id,
  } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [options, setOptions] = React.useState<ComboboxOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [internalCreating, setInternalCreating] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

  // Cache of known value -> ComboboxOption to always display human-readable labels
  const [optionCache, setOptionCache] = React.useState<
    Map<string, ComboboxOption>
  >(() => {
    const map = new Map<string, ComboboxOption>();
    initialOptions.forEach((opt) => map.set(opt.value, opt));
    return map;
  });

  // Sync cache with any new initialOptions
  React.useEffect(() => {
    if (initialOptions.length > 0) {
      setOptionCache((prev) => {
        const next = new Map(prev);
        initialOptions.forEach((opt) => next.set(opt.value, opt));
        return next;
      });
    }
  }, [initialOptions]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const optionsListRef = React.useRef<HTMLDivElement>(null);
  const activeQueryRef = React.useRef<string>('');

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when popover opens
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
      setOptions([]);
      setIsLoading(false);
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Debounced search with minSearchLength
  React.useEffect(() => {
    if (!isOpen) return;

    const trimmed = search.trim();
    if (trimmed.length < minSearchLength) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    activeQueryRef.current = trimmed;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await loadOptions(trimmed);
        if (activeQueryRef.current === trimmed) {
          setOptions(results);
          // Store results in optionCache
          setOptionCache((prev) => {
            const next = new Map(prev);
            results.forEach((opt) => next.set(opt.value, opt));
            return next;
          });
        }
      } catch {
        if (activeQueryRef.current === trimmed) {
          setOptions([]);
        }
      } finally {
        if (activeQueryRef.current === trimmed) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search, isOpen, minSearchLength, loadOptions]);

  const creating = isCreating || internalCreating;
  const trimmedSearch = search.trim();
  const searchTooShort = trimmedSearch.length < minSearchLength;
  const exactMatchExists = options.some(
    (opt) => opt.label.trim().toLowerCase() === trimmedSearch.toLowerCase(),
  );
  const canCreate = Boolean(
    onCreate && !searchTooShort && !exactMatchExists && !creating,
  );

  // Automatically reset highlighted index to 0 whenever options change or create option appears
  React.useEffect(() => {
    if (options.length > 0) {
      setHighlightedIndex(0);
    } else if (canCreate) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [options, canCreate]);

  // Keep highlighted item visible in view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && optionsListRef.current) {
      const items = optionsListRef.current.querySelectorAll(
        '[data-combobox-item="true"]',
      );
      const activeItem = items[highlightedIndex] as HTMLElement | undefined;
      activeItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = (optionValue: string) => {
    const selectedOpt =
      optionCache.get(optionValue) ||
      options.find((o) => o.value === optionValue);

    const updatedCache = new Map(optionCache);
    if (selectedOpt) {
      updatedCache.set(optionValue, selectedOpt);
      setOptionCache(updatedCache);
    }

    if (props.multiple) {
      const current = props.value || [];
      let updated: string[];
      if (current.includes(optionValue)) {
        updated = current.filter((v) => v !== optionValue);
      } else {
        updated = [...current, optionValue];
      }
      const allSelectedOpts = updated
        .map((val) => updatedCache.get(val))
        .filter(Boolean) as ComboboxOption[];
      props.onChange(updated, allSelectedOpts);

      // Reset search and keep input auto-focused for continuous addition
      setSearch('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    } else {
      props.onChange(optionValue, selectedOpt);
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleCreate = async () => {
    if (!onCreate || !search.trim() || creating) return;
    const query = search.trim();
    try {
      setInternalCreating(true);
      const res = await onCreate(query);
      if (res) {
        const newOption: ComboboxOption =
          typeof res === 'object' && res !== null
            ? res
            : { value: res, label: query };

        const newId = newOption.value;
        const updatedCache = new Map(optionCache);
        updatedCache.set(newId, newOption);
        setOptionCache(updatedCache);

        if (props.multiple) {
          const current = props.value || [];
          if (!current.includes(newId)) {
            const updated = [...current, newId];
            const allSelectedOpts = updated
              .map((val) => updatedCache.get(val) || { value: val, label: val })
              .filter(Boolean) as ComboboxOption[];
            props.onChange(updated, allSelectedOpts);
          }
        } else {
          props.onChange(newId, newOption);
          setIsOpen(false);
        }
      }
      setSearch('');
      if (props.multiple) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);
      }
    } finally {
      setInternalCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (options.length > 0) {
        const maxIndex = canCreate ? options.length : options.length - 1;
        setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
      } else if (canCreate) {
        setHighlightedIndex(0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (options.length > 0) {
        const maxIndex = canCreate ? options.length : options.length - 1;
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
      } else if (canCreate) {
        setHighlightedIndex(0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      if (isLoading) return;

      if (options.length > 0) {
        // If the user navigated down to the Create option
        if (canCreate && highlightedIndex === options.length) {
          handleCreate();
        } else {
          // Auto-select first item or highlighted item
          const targetIndex =
            highlightedIndex >= 0 && highlightedIndex < options.length
              ? highlightedIndex
              : 0;
          const opt = options[targetIndex];
          if (opt) {
            handleSelect(opt.value);
          }
        }
      } else if (canCreate) {
        // No search results and create option is present -> Enter triggers create!
        handleCreate();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Resolve display labels using optionCache
  const selectedDisplay = React.useMemo(() => {
    if (props.multiple) {
      const values = props.value || [];
      return values.map((val) => {
        const cached = optionCache.get(val);
        return { value: val, label: cached ? cached.label : val };
      });
    } else {
      if (!props.value) return null;
      const cached = optionCache.get(props.value);
      return cached ? cached.label : props.value;
    }
  }, [props.multiple, props.value, optionCache]);

  const isCreateHighlighted =
    canCreate && (options.length === 0 || highlightedIndex === options.length);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full text-[12px]', className)}
      id={id}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'w-full min-h-[34px] px-2.5 py-1 text-left bg-white border border-zinc-200/90 rounded-md shadow-2xs flex items-center justify-between gap-1.5 transition-colors cursor-pointer',
          'focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200',
          disabled && 'opacity-60 cursor-not-allowed bg-zinc-50',
          isOpen && 'ring-1 ring-zinc-200 border-zinc-400',
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex flex-wrap items-center gap-1 overflow-hidden flex-1 py-0.5">
          {props.multiple ? (
            Array.isArray(selectedDisplay) && selectedDisplay.length > 0 ? (
              selectedDisplay.map((item) => (
                <Badge
                  key={item.value}
                  variant="secondary"
                  className="font-normal normal-case text-[11px] py-0 px-1.5 flex items-center gap-1 bg-zinc-100 text-zinc-800 border-zinc-200"
                >
                  <span className="truncate max-w-[140px]">{item.label}</span>
                  {!disabled && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          handleSelect(item.value);
                        }
                      }}
                      className="cursor-pointer hover:text-rose-600 rounded-xs"
                      title="Remove"
                    >
                      <X className="w-2.5 h-2.5" />
                    </span>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-zinc-400 select-none">{placeholder}</span>
            )
          ) : selectedDisplay ? (
            <span className="text-zinc-800 truncate select-none">
              {selectedDisplay as string}
            </span>
          ) : (
            <span className="text-zinc-400 select-none">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-zinc-400">
          {!props.multiple && props.value && allowClear && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                props.onChange('');
              }}
              className="cursor-pointer hover:text-zinc-700 p-0.5"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronsUpDown className="w-3.5 h-3.5 opacity-60" />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Input Box */}
          <div className="p-2 border-b border-zinc-100 bg-zinc-50/70">
            <div className="relative flex items-center w-full bg-white border border-zinc-200/90 rounded-md px-2.5 py-1.5 shadow-2xs transition-colors focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-200">
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0 pointer-events-none" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-[12px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none outline-none border-none p-0"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    searchInputRef.current?.focus();
                  }}
                  className="text-zinc-400 hover:text-zinc-700 p-0.5 ml-1 rounded-sm cursor-pointer focus:outline-none"
                  title="Clear"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={optionsListRef}
            className="max-h-56 overflow-y-auto p-1 custom-scrollbar"
          >
            {searchTooShort ? (
              <div className="px-3 py-4 text-center text-zinc-400 text-[11px]">
                <span>
                  Type at least {minSearchLength} characters to search
                </span>
              </div>
            ) : isLoading ? (
              <div className="px-3 py-4 text-center text-zinc-400 text-[11px] flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </div>
            ) : options.length > 0 ? (
              options.map((opt, idx) => {
                const isSelected = props.multiple
                  ? (props.value || []).includes(opt.value)
                  : props.value === opt.value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    data-combobox-item="true"
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      'px-2 py-1.5 rounded-sm flex items-center justify-between cursor-pointer select-none transition-colors text-[12px]',
                      isSelected
                        ? isHighlighted
                          ? 'bg-zinc-200 font-medium text-zinc-900'
                          : 'bg-zinc-100 font-medium text-zinc-900'
                        : isHighlighted
                          ? 'bg-zinc-100 text-zinc-900 font-medium'
                          : 'hover:bg-zinc-50 text-zinc-700',
                    )}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="text-[10px] text-zinc-400 truncate">
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-3 text-center text-zinc-400 text-[11px]">
                {emptyText}
              </div>
            )}

            {/* Inline Quick Create Option */}
            {canCreate && (
              <div
                data-combobox-item="true"
                onClick={!creating ? handleCreate : undefined}
                onMouseEnter={() => setHighlightedIndex(options.length)}
                className={cn(
                  'mt-1 pt-1 border-t border-zinc-100 px-2 py-1.5 rounded-sm flex items-center gap-1.5 text-zinc-700 cursor-pointer select-none text-[12px] transition-colors',
                  isCreateHighlighted
                    ? 'bg-zinc-100 text-zinc-900 font-medium'
                    : 'hover:bg-zinc-100/70',
                  creating && 'opacity-60 cursor-not-allowed',
                )}
              >
                {creating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-zinc-500" />
                )}
                <span className="truncate">
                  Create &ldquo;
                  <span className="font-semibold text-zinc-900">{search}</span>
                  &rdquo;
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

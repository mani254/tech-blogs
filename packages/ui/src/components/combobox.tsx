import * as React from 'react';
import { Check, ChevronsUpDown, Loader2, Plus, Search, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge } from './badge';

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

export interface ComboboxSingleProps {
  multiple?: false;
  value?: string | null;
  onChange: (value: string, selectedOption?: ComboboxOption) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onCreate?: (
    search: string,
  ) => Promise<string | ComboboxOption | void> | string | ComboboxOption | void;
  isCreating?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  id?: string;
}

export interface ComboboxMultipleProps {
  multiple: true;
  value: string[];
  onChange: (value: string[], selectedOptions?: ComboboxOption[]) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  onCreate?: (
    search: string,
  ) => Promise<string | ComboboxOption | void> | string | ComboboxOption | void;
  isCreating?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
  id?: string;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

export function Combobox(props: ComboboxProps) {
  const {
    options = [],
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    emptyText = 'No options found',
    onCreate,
    isCreating = false,
    isLoading = false,
    disabled = false,
    allowClear = true,
    className,
    id,
  } = props;

  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [internalCreating, setInternalCreating] = React.useState(false);
  const [extraOptions, setExtraOptions] = React.useState<ComboboxOption[]>([]);
  const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const optionsListRef = React.useRef<HTMLDivElement>(null);

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
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const allOptions = React.useMemo(() => {
    const map = new Map<string, ComboboxOption>();
    options.forEach((opt) => map.set(opt.value, opt));
    extraOptions.forEach((opt) => map.set(opt.value, opt));
    return Array.from(map.values());
  }, [options, extraOptions]);

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return allOptions;
    const query = search.toLowerCase();
    return allOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        (opt.description && opt.description.toLowerCase().includes(query)),
    );
  }, [allOptions, search]);

  const exactMatchExists = React.useMemo(() => {
    if (!search.trim()) return true;
    const query = search.trim().toLowerCase();
    return allOptions.some((opt) => opt.label.trim().toLowerCase() === query);
  }, [allOptions, search]);

  const creating = isCreating || internalCreating;
  const canCreate = Boolean(
    onCreate && search.trim() && !exactMatchExists && !creating,
  );

  // Reset highlighted index when filtered options or canCreate changes
  React.useEffect(() => {
    if (filteredOptions.length > 0) {
      setHighlightedIndex(0);
    } else if (canCreate) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [filteredOptions, canCreate]);

  // Keep highlighted item in view
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
    const selectedOpt = allOptions.find((o) => o.value === optionValue);

    if (props.multiple) {
      const current = props.value || [];
      let updated: string[];
      if (current.includes(optionValue)) {
        updated = current.filter((v) => v !== optionValue);
      } else {
        updated = [...current, optionValue];
      }
      const allSelectedOpts = updated
        .map((val) => allOptions.find((o) => o.value === val))
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

        setExtraOptions((prev) => [...prev, newOption]);

        if (props.multiple) {
          const current = props.value || [];
          if (!current.includes(newOption.value)) {
            const updated = [...current, newOption.value];
            const allSelectedOpts = [
              ...updated
                .map((val) =>
                  val === newOption.value
                    ? newOption
                    : allOptions.find((o) => o.value === val),
                )
                .filter(Boolean),
            ] as ComboboxOption[];
            props.onChange(updated, allSelectedOpts);
          }
        } else {
          props.onChange(newOption.value, newOption);
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
      if (filteredOptions.length > 0) {
        const maxIndex = canCreate
          ? filteredOptions.length
          : filteredOptions.length - 1;
        setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
      } else if (canCreate) {
        setHighlightedIndex(0);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredOptions.length > 0) {
        const maxIndex = canCreate
          ? filteredOptions.length
          : filteredOptions.length - 1;
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
      } else if (canCreate) {
        setHighlightedIndex(0);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      if (isLoading) return;

      if (filteredOptions.length > 0) {
        if (canCreate && highlightedIndex === filteredOptions.length) {
          handleCreate();
        } else {
          const targetIndex =
            highlightedIndex >= 0 && highlightedIndex < filteredOptions.length
              ? highlightedIndex
              : 0;
          const opt = filteredOptions[targetIndex];
          if (opt) {
            handleSelect(opt.value);
          }
        }
      } else if (canCreate) {
        handleCreate();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Find labels for display
  const selectedLabels = React.useMemo(() => {
    if (props.multiple) {
      const values = props.value || [];
      return values.map((val) => {
        const found = allOptions.find((o) => o.value === val);
        return { value: val, label: found ? found.label : val };
      });
    } else {
      if (!props.value) return null;
      const found = allOptions.find((o) => o.value === props.value);
      return found ? found.label : props.value;
    }
  }, [props.multiple, props.value, allOptions]);

  const isCreateHighlighted =
    canCreate &&
    (filteredOptions.length === 0 ||
      highlightedIndex === filteredOptions.length);

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
            Array.isArray(selectedLabels) && selectedLabels.length > 0 ? (
              selectedLabels.map((item) => (
                <Badge
                  key={item.value}
                  variant="secondary"
                  className="font-normal normal-case text-[11px] py-0 px-1.5 flex items-center gap-1 bg-zinc-100 text-zinc-800 border-zinc-200"
                >
                  <span className="truncate max-w-[120px]">{item.label}</span>
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
                      className="cursor-pointer hover:text-rose-600 rounded-sm"
                    >
                      <X className="w-2.5 h-2.5" />
                    </span>
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-zinc-400 select-none">{placeholder}</span>
            )
          ) : selectedLabels ? (
            <span className="text-zinc-800 truncate select-none">
              {selectedLabels as string}
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200/90 rounded-md shadow-lg overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Search Input Box */}
          <div className="p-2 border-b border-zinc-100 bg-zinc-50/70">
            <div className="relative flex items-center w-full bg-white border border-zinc-200/90 rounded-md px-2.5 py-1.5 shadow-2xs transition-colors focus-within:border-zinc-400 focus-within:ring-1 focus-within:ring-zinc-200">
              <Search className="w-3.5 h-3.5 text-zinc-400 mr-2 shrink-0 pointer-events-none" />
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
            className="max-h-56 overflow-y-auto p-1 divide-y divide-transparent"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-zinc-400 gap-1.5 text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading options...</span>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = props.multiple
                  ? (props.value || []).includes(opt.value)
                  : props.value === opt.value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <div
                    key={opt.value}
                    data-combobox-item="true"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={cn(
                      'flex items-center justify-between px-2 py-1.5 rounded text-[12px] cursor-pointer select-none transition-colors',
                      isSelected
                        ? isHighlighted
                          ? 'bg-zinc-200 font-medium text-zinc-900'
                          : 'bg-zinc-100 font-medium text-zinc-900'
                        : isHighlighted
                          ? 'bg-zinc-100 text-zinc-900 font-medium'
                          : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900',
                    )}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="text-[10px] text-zinc-400 truncate font-normal">
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
            ) : !onCreate || !search.trim() ? (
              <div className="py-4 text-center text-zinc-400 text-[11px]">
                {emptyText}
              </div>
            ) : null}

            {/* Inline Creatable Option */}
            {canCreate && (
              <div className="p-1 pt-1 border-t border-zinc-100 mt-1">
                <button
                  type="button"
                  data-combobox-item="true"
                  disabled={creating}
                  onClick={handleCreate}
                  onMouseEnter={() =>
                    setHighlightedIndex(filteredOptions.length)
                  }
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 text-left text-[12px] text-zinc-900 rounded transition-colors disabled:opacity-60 cursor-pointer',
                    isCreateHighlighted
                      ? 'bg-zinc-100 font-semibold'
                      : 'hover:bg-zinc-100 font-medium',
                  )}
                >
                  {creating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-600" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-zinc-900" />
                  )}
                  <span className="truncate">
                    Create <span className="underline">"{search.trim()}"</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

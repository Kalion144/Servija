interface CitySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  onUseMyCity?: () => void;
  accentColor: string;
  placeholder?: string;
  myCityLabel?: string;
}

export default function CitySearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  onUseMyCity,
  accentColor,
  placeholder = 'Buscar por cidade...',
  myCityLabel,
}: CitySearchBarProps) {
  return (
    <div className="city-search-bar">
      <div className="city-search-input-wrap">
        <i className="fas fa-search city-search-icon"></i>
        <input
          type="text"
          className="city-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        {value && (
          <button type="button" className="city-search-clear" onClick={onClear} title="Limpar">
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
      <button
        type="button"
        className="city-search-btn"
        style={{ background: accentColor }}
        onClick={onSearch}
      >
        Buscar
      </button>
      {onUseMyCity && myCityLabel && (
        <button type="button" className="city-search-my-city" onClick={onUseMyCity}>
          <i className="fas fa-location-dot"></i> {myCityLabel}
        </button>
      )}
    </div>
  );
}

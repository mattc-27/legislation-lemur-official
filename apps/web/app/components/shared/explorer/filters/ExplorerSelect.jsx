export default function ExplorerSelect({ label, name, value, defaultValue, options = [], placeholder, className = "", ...props }) {
  return (
    <label className={["ll3-field", className].filter(Boolean).join(" ")}>
      {label ? <span className="ll3-label">{label}</span> : null}
      <select className="ll3-input ll3-select" name={name} value={value} defaultValue={defaultValue} {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => <option key={opt.value ?? opt.label} value={opt.value ?? ""}>{opt.label}</option>)}
      </select>
    </label>
  );
}

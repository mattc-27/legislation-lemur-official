export default function ExplorerCheckbox({ name, value = "true", defaultChecked, label, hint }) {
  return <label className="ll3-checkRow"><input className="ll3-checkRow__input" type="checkbox" name={name} value={value} defaultChecked={defaultChecked} /><span className="ll3-checkRow__body"><strong className="ll3-checkRow__label">{label}</strong>{hint ? <small className="ll3-checkRow__hint">{hint}</small> : null}</span></label>;
}

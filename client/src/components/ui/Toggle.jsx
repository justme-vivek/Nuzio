export default function Toggle({ checked = false, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`tap relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-200 ${
        checked ? 'border-primary bg-primary' : 'border-line bg-card2'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-4.5 w-4.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

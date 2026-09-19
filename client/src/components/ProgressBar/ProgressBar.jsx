export default function ProgressBar({ step = 0, total = 5 }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            i < step ? 'bg-accent' : i === step ? 'bg-primary' : 'bg-line'
          }`}
        />
      ))}
    </div>
  );
}

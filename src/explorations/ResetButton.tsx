type ResetButtonProps = {
  onReset: () => void;
  label?: string;
};

export function ResetButton({ onReset, label = "Reset" }: ResetButtonProps) {
  return (
    <button type="button" className="btn" onClick={onReset}>
      {label}
    </button>
  );
}

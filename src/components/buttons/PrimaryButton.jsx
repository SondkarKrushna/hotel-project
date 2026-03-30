const PrimaryButton = ({ children, variant = "blue", icon: Icon, disabled, bgcolor }) => {
  const base =
    "flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium shadow-sm index-0";
  return (
    <button
      disabled={disabled}
      className={`${base} ${bgcolor} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
};


export default PrimaryButton;

function ThemeToggle({ theme, onToggle, className = "" }) {
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={onToggle}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
    >
      <span aria-hidden="true">{theme === "dark" ? "☾" : "☼"}</span>
      <span>{theme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}

export default ThemeToggle;
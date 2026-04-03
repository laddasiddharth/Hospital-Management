export default function LoadingSpinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeMap = {
    sm: "h-5 w-5",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`${sizeMap[size]} rounded-full border-2 border-surface-700`}
        />
        {/* Spinning arc */}
        <div
          className={`${sizeMap[size]} absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin`}
        />
        {/* Inner glow */}
        <div
          className={`absolute inset-1 rounded-full bg-primary-500/10 blur-sm`}
        />
      </div>
    </div>
  );
}

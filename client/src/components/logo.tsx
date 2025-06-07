interface LogoProps {
  size?: "sm" | "header" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    header: "w-7 h-7", // 25% larger than sm for header use
    md: "w-8 h-8", 
    lg: "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <circle cx="12" cy="12" r="10" fill="#FF6B9D" />
        <path 
          d="M8 12l2 2 4-4" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
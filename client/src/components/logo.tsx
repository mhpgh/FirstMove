interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex items-center justify-center`}>
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <defs>
          <clipPath id="intersection">
            <path d="M12 8c-2.5 0-4.5 2-4.5 4.5 0 3 2.5 6.5 4.5 9.5 2-3 4.5-6.5 4.5-9.5C16.5 10 14.5 8 12 8z" />
          </clipPath>
        </defs>
        
        {/* Left heart - white */}
        <path 
          d="M12 8c-2.5 0-4.5 2-4.5 4.5 0 3 2.5 6.5 4.5 9.5 2-3 4.5-6.5 4.5-9.5C16.5 10 14.5 8 12 8z" 
          fill="white" 
          stroke="#E91E63" 
          strokeWidth="1"
        />
        
        {/* Right heart - white */}
        <path 
          d="M20 8c-2.5 0-4.5 2-4.5 4.5 0 3 2.5 6.5 4.5 9.5 2-3 4.5-6.5 4.5-9.5C24.5 10 22.5 8 20 8z" 
          fill="white" 
          stroke="#E91E63" 
          strokeWidth="1"
        />
        
        {/* Intersection overlay - pink */}
        <path 
          d="M20 8c-2.5 0-4.5 2-4.5 4.5 0 3 2.5 6.5 4.5 9.5 2-3 4.5-6.5 4.5-9.5C24.5 10 22.5 8 20 8z" 
          fill="#E91E63" 
          clipPath="url(#intersection)"
        />
      </svg>
    </div>
  );
}
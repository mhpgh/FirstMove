import logoImage from "@assets/icon.png";

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
    <div className={`${sizeClasses[size]} ${className} gradient-bg rounded-full relative flex items-center justify-center`}>
      <img 
        src={logoImage} 
        alt="Hintly Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
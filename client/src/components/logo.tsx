import logoImage from "@assets/logo-transparent.png";

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
      <img 
        src={logoImage} 
        alt="FirstMove Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
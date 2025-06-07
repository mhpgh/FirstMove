import logoImage from "@assets/FirstMoveLogo_1749308421855.png";

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
      <img 
        src={logoImage} 
        alt="FirstMove Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
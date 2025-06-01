import { cn } from "@/lib/utils";

interface MoodCardProps {
  emoji: string;
  label: string;
  moodType: string;
  isSelected: boolean;
  onClick: (moodType: string) => void;
}

export function MoodCard({ emoji, label, moodType, isSelected, onClick }: MoodCardProps) {
  return (
    <button
      className={cn(
        "mood-card bg-gray-50 rounded-xl p-4 text-center border-2 border-transparent",
        isSelected && "selected"
      )}
      onClick={() => onClick(moodType)}
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-white" : "text-gray-700"
      )}>
        {label}
      </span>
    </button>
  );
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  moodType: string;
  onStartConversation: () => void;
}

export function MatchModal({ 
  isOpen, 
  onClose, 
  partnerName, 
  moodType, 
  onStartConversation 
}: MatchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <div className="text-center animate-slide-up">
          <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-white text-xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">It's a Match!</h3>
          <p className="text-gray-600 mb-6">
            You and {partnerName} are both feeling {moodType} right now
          </p>
          <Button 
            onClick={onClose}
            className="w-full gradient-bg text-white py-3 rounded-xl font-medium hover:opacity-90"
          >
            I'll take it from here!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

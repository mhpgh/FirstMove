import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

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
        <DialogTitle className="sr-only">Match Found</DialogTitle>
        <DialogDescription className="sr-only">
          You and {partnerName} are both ready to connect
        </DialogDescription>
        <div className="text-center animate-slide-up">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Logo size="lg" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">It's time!</h3>
          <p className="text-gray-600 mb-6">
            {partnerName} is ready to connect
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

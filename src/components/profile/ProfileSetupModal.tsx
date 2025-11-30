import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileSetup } from "./ProfileSetup";
import { useProfile } from "@/store/useProfile";

interface ProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileSetupModal = ({ open, onOpenChange }: ProfileSetupModalProps) => {
  const { completeSetup } = useProfile();

  const handleComplete = (profile: any) => {
    completeSetup(profile);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        <ProfileSetup onComplete={handleComplete} />
      </DialogContent>
    </Dialog>
  );
};
























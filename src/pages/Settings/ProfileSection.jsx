import { useState } from "react";
import { Button } from "../../components/ui";
import ChangePasswordModal from "../../components/changePasswordModal";

export default function ProfileSection({ profile, onChange }) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* Personal Information */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-ink">
          Personal Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* your existing inputs */}
        </div>
      </div>

      {/* Change Password */}
      <div className="border-t border-border pt-6">
        <h3 className="mb-2 text-sm font-semibold text-ink">
          Password
        </h3>

        <p className="mb-4 text-sm text-ink-faint">
          Change your account password.
        </p>

        <Button
          variant="outline"
          onClick={() => setIsPasswordModalOpen(true)}
        >
          Change Password
        </Button>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={(message) => {
          console.log(message);
        }}
      />
    </div>
  );
}
import { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Textarea } from "../../../components/ui";
import DateSelector from "../../../components/ui/DateSelector";


import {
  createEmptyAccount,
  ACCOUNT_STATUS_OPTIONS,
  AGREEMENT_STATUS_OPTIONS,
  PAYMENT_OPTIONS,
} from "../../../data/Accountdata";

import { useEmployees } from "../../../hooks/useEmployees";

export default function AccountModal({
  isOpen,
  onClose,
  mode,
  account,
  onSave,
}) {
  const [form, setForm] = useState(createEmptyAccount());
  const [errors, setErrors] = useState({});

  const { employees, isLoading: employeesLoading } = useEmployees();

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && account) {
      setForm(account);
    } else {
      setForm(createEmptyAccount());
    }

    setErrors({});
  }, [isOpen, mode, account]);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.customerName.trim()) {
      nextErrors.customerName = "Customer Name is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
  if (!validate()) return;

  try {
    await onSave(form);
    onClose();
  } catch (err) {
    console.error("Account save failed:", err);
  }
}

  const companyAMOptions = employees
    .filter((employee) => employee.status === "Active")
    .map((employee) => ({
      value: employee.id,
      label: employee.name,
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Account" : "Add New Account"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {mode === "edit" ? "Save Changes" : "Add Account"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">

          <Input
            label="Customer Name"
            required
            value={form.customerName}
            error={errors.customerName}
            onChange={(e) =>
              update("customerName", e.target.value)
            }
          />

          {/* Company AM */}
          <Select
            label="Company AM"
            options={companyAMOptions}
            value={form.cyvoraAMId || ""}
            disabled={employeesLoading}
            onChange={(e) =>
              update("cyvoraAMId", e.target.value)
            }
          />

          <Input
            label="Client AM"
            value={form.clientAM}
            onChange={(e) =>
              update("clientAM", e.target.value)
            }
          />

          <Select
            label="Status"
            options={ACCOUNT_STATUS_OPTIONS}
            value={form.status}
            onChange={(e) =>
              update("status", e.target.value)
            }
          />

          <Input
            label="Traffic"
            value={form.traffic}
            onChange={(e) =>
              update("traffic", e.target.value)
            }
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Date Added
            </label>

            <DateSelector
              mode="single"
              value={form.dateAdded}
              onChange={(date) =>
                update("dateAdded", date)
              }
            />
          </div>

          <Input
            label="Follow-up Date"
            value={form.followUpDate || "Not set"}
            disabled
          />

          <Select
            label="Agreement Status"
            options={AGREEMENT_STATUS_OPTIONS}
            value={form.agreementStatus}
            onChange={(e) =>
              update("agreementStatus", e.target.value)
            }
          />

          <Select
            label="Payment"
            options={PAYMENT_OPTIONS}
            value={form.payment}
            onChange={(e) =>
              update("payment", e.target.value)
            }
          />

          <Input
            label="Credit Limit"
            value={form.creditLimit}
            onChange={(e) =>
              update("creditLimit", e.target.value)
            }
          />

          <Input
            label="Phone Number"
            value={form.phoneNumber}
            onChange={(e) =>
              update("phoneNumber", e.target.value)
            }
          />

          <Input
            label="Teams"
            value={form.teams}
            onChange={(e) =>
              update("teams", e.target.value)
            }
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              update("email", e.target.value)
            }
          />
        </div>

        <Input
          label="Their Routes"
          value={form.theirRoutes}
          onChange={(e) =>
            update("theirRoutes", e.target.value)
          }
        />

        <Input
          label="Their Requirements"
          value={form.theirRequirements}
          onChange={(e) =>
            update("theirRequirements", e.target.value)
          }
        />

        <Input
          label="Rates We Offered"
          value={form.ratesOffered}
          onChange={(e) =>
            update("ratesOffered", e.target.value)
          }
        />

        <Textarea
          label="Status Notes"
          rows={3}
          value={form.statusNotes}
          onChange={(e) =>
            update("statusNotes", e.target.value)
          }
        />
      </div>
    </Modal>
  );
}
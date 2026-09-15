
import { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Textarea } from "../../components/ui";
import DateSelector from "../../components/ui/DateSelector";

import {
  createEmptyLead,
  LEAD_STATUS_OPTIONS,
  AGREEMENT_STATUS_OPTIONS,
  PAYMENT_OPTIONS,
  LEAD_SOURCE_OPTIONS,
} from "../../data/leadData";

import { useEmployees } from "../../hooks/useEmployees";

export default function LeadModal({
  isOpen,
  onClose,
  mode,
  lead,
  onSave,
}) {
  const [form, setForm] = useState(createEmptyLead());
  const [errors, setErrors] = useState({});

  const { employees, isLoading: employeesLoading } = useEmployees();

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && lead) {
      setForm(lead);
    } else {
      setForm(createEmptyLead());
    }

    setErrors({});
  }, [isOpen, mode, lead]);

  function update(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.customerName?.trim()) {
      nextErrors.customerName = "Customer Name is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    onSave(form);
    onClose();
  }

  const companyAMValue =
    form.cyvoraAMId ||
    (typeof form.cyvoraAM === "object"
      ? form.cyvoraAM?.id || ""
      : form.cyvoraAM || "");

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
      title={mode === "edit" ? "Edit Lead" : "Add New Lead"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button onClick={handleSubmit}>
            {mode === "edit" ? "Save Changes" : "Add Lead"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            required
            value={form.customerName || ""}
            error={errors.customerName}
            onChange={(e) =>
              update("customerName", e.target.value)
            }
          />

          {/* Company AM */}
          <Select
            label="Company AM"
            options={companyAMOptions}
            value={companyAMValue}
            disabled={employeesLoading}
            onChange={(e) => {
              const amId = e.target.value;

              const selectedAM = employees.find(
                (employee) => employee.id === amId
              );

              setForm((prev) => ({
                ...prev,
                cyvoraAMId: amId,
                cyvoraAM: selectedAM
                  ? {
                      id: selectedAM.id,
                      name: selectedAM.name,
                    }
                  : null,
              }));
            }}
          />

          <Input
            label="Client AM"
            value={form.clientAM || ""}
            onChange={(e) =>
              update("clientAM", e.target.value)
            }
          />

          <Select
            label="Status"
            options={LEAD_STATUS_OPTIONS}
            value={form.status || ""}
            onChange={(e) =>
              update("status", e.target.value)
            }
          />

          <Input
            label="Traffic"
            value={form.traffic || ""}
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

          {mode === "edit" ? (
            <Input
              label="Follow-up Date"
              value={form.followUpDate || "Not set"}
              disabled
            />
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Follow-up Date
              </label>

              <DateSelector
                mode="single"
                includeTime
                value={form.followUpDate}
                onChange={(date) =>
                  update("followUpDate", date)
                }
              />
            </div>
          )}

          <Input
            label="Next Step"
            value={form.nextStep || ""}
            onChange={(e) =>
              update("nextStep", e.target.value)
            }
          />

          <Input
            label="Deals in Progress"
            value={form.dealsInProgress || ""}
            onChange={(e) =>
              update("dealsInProgress", e.target.value)
            }
          />

          <Select
            label="Agreement Status"
            options={AGREEMENT_STATUS_OPTIONS}
            value={form.agreementStatus || ""}
            onChange={(e) =>
              update("agreementStatus", e.target.value)
            }
          />

          <Select
            label="Payment"
            options={PAYMENT_OPTIONS}
            value={form.payment || ""}
            onChange={(e) =>
              update("payment", e.target.value)
            }
          />

          <Input
            label="Credit Limit"
            value={form.creditLimit || ""}
            onChange={(e) =>
              update("creditLimit", e.target.value)
            }
          />

          <Select
            label="Lead Source"
            options={LEAD_SOURCE_OPTIONS}
            value={form.leadSource || ""}
            onChange={(e) =>
              update("leadSource", e.target.value)
            }
          />

          <Input
            label="Phone Number"
            value={form.phoneNumber || ""}
            onChange={(e) =>
              update("phoneNumber", e.target.value)
            }
          />

          <Input
            label="Teams"
            value={form.teams || ""}
            onChange={(e) =>
              update("teams", e.target.value)
            }
          />

          <Input
            label="Email"
            type="email"
            value={form.email || ""}
            onChange={(e) =>
              update("email", e.target.value)
            }
          />
        </div>

        <Input
          label="Their Routes"
          value={form.theirRoutes || ""}
          onChange={(e) =>
            update("theirRoutes", e.target.value)
          }
        />

        <Input
          label="Their Requirements"
          value={form.theirRequirements || ""}
          onChange={(e) =>
            update("theirRequirements", e.target.value)
          }
        />

        <Input
          label="Rates We Offered"
          value={form.ratesOffered || ""}
          onChange={(e) =>
            update("ratesOffered", e.target.value)
          }
        />

        <Input
          label="Route List On Sheets"
          value={form.routeListOnSheets || ""}
          onChange={(e) =>
            update("routeListOnSheets", e.target.value)
          }
        />

        <Textarea
          label="Status Notes"
          rows={3}
          value={form.statusNotes || ""}
          onChange={(e) =>
            update("statusNotes", e.target.value)
          }
        />
      </div>
    </Modal>
  );
}


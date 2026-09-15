import { useEffect, useState } from "react";
import { Modal, Button, Input, Select, Textarea } from "../../components/ui";
import DateSelector from "../../components/ui/DateSelector";

import {
  createEmptyRoute,
  ROUTE_TYPE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  ROUTE_STATUS_OPTIONS,
} from "../../data/routeData";

export default function RouteModal({ isOpen, onClose, mode, route, onSave }) {
  const [form, setForm] = useState(createEmptyRoute());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && route) {
      setForm(route);
    } else {
      setForm(createEmptyRoute());
    }
    setErrors({});
  }, [isOpen, mode, route]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.destination.trim()) nextErrors.destination = "Destination is required.";
    if (!form.vendor.trim()) nextErrors.vendor = "Vendor is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave(form);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Route" : "Add New Route"}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "edit" ? "Save Changes" : "Add Route"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Destination (Country)"
          required
          value={form.destination}
          error={errors.destination}
          onChange={(e) => update("destination", e.target.value)}
        />

        <Input
          label="Network / Operator"
          placeholder="All, MTN, Vodafone..."
          value={form.network}
          onChange={(e) => update("network", e.target.value)}
        />

        <Select
          label="Route Type"
          options={ROUTE_TYPE_OPTIONS}
          value={form.routeType}
          onChange={(e) => update("routeType", e.target.value)}
        />

        <Select
          label="Content Type"
          options={CONTENT_TYPE_OPTIONS}
          value={form.contentType}
          onChange={(e) => update("contentType", e.target.value)}
        />

        <Input
          label="SID"
          placeholder="Only for WhatsApp / branded SID routes"
          value={form.sid}
          onChange={(e) => update("sid", e.target.value)}
        />

        <Input
          label="Vendor"
          required
          value={form.vendor}
          error={errors.vendor}
          onChange={(e) => update("vendor", e.target.value)}
        />

        <Input
          label="Cost (what we pay vendor)"
          placeholder="0.0015"
          value={form.costRate}
          onChange={(e) => update("costRate", e.target.value)}
        />

        <Input
          label="Selling Rate (offered to clients)"
          placeholder="0.0022"
          value={form.sellingRate}
          onChange={(e) => update("sellingRate", e.target.value)}
        />

        <Input
          label="Capacity"
          placeholder="e.g. 50k/day"
          value={form.capacity}
          onChange={(e) => update("capacity", e.target.value)}
        />

        <Input
          label="DLR % (delivery rate)"
          placeholder="e.g. 95"
          value={form.dlr}
          onChange={(e) => update("dlr", e.target.value)}
        />

        <Select
          label="Status"
          options={ROUTE_STATUS_OPTIONS}
          value={form.status}
          onChange={(e) => update("status", e.target.value)}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Last Tested</label>
          <DateSelector
            mode="single"
            value={form.lastTested}
            onChange={(date) => update("lastTested", date)}
          />
        </div>

        <div className="col-span-2">
          <Textarea
            label="Notes"
            rows={3}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
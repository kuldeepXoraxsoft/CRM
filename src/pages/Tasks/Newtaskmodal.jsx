import { useState } from 'react'
import { Modal, Button, Input, Select, SearchSelect } from '../../components/ui'
import { TEAM_MEMBERS } from '../../data/mockData'

const TYPE_OPTIONS = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'follow-up', label: 'Follow-up' },
]

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const EMPTY_FORM = {
  title: '',
  relatedTo: '',
  type: 'call',
  priority: 'medium',
  dueDate: new Date().toISOString().slice(0, 10),
  assignee: '',
}

/**
 * NewTaskModal - form for creating a task, in a Modal.
 *
 * Props:
 * - isOpen, onClose
 * - onCreate(task): called with the new task's fields when submitted
 */
export default function NewTaskModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit() {
    const nextErrors = {}
    if (!form.title.trim()) nextErrors.title = 'Task title is required'
    if (!form.assignee) nextErrors.assignee = 'Assign this task to someone'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    onCreate({ ...form, id: `t${Date.now()}`, status: 'pending' })
    setForm(EMPTY_FORM)
    setErrors({})
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New task"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create task</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Task title"
          placeholder="e.g. Follow up on proposal"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          error={errors.title}
          required
        />

        <Input
          label="Related to"
          placeholder="Contact or company name"
          value={form.relatedTo}
          onChange={(e) => update('relatedTo', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
          />
          <Select
            label="Priority"
            options={PRIORITY_OPTIONS}
            value={form.priority}
            onChange={(e) => update('priority', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(e) => update('dueDate', e.target.value)}
          />
          <SearchSelect
            label="Assignee"
            placeholder="Select a teammate"
            options={TEAM_MEMBERS}
            value={form.assignee}
            onChange={(v) => update('assignee', v)}
            error={errors.assignee}
            clearable={false}
          />
        </div>
      </div>
    </Modal>
  )
}
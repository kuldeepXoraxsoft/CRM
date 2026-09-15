import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  X,
} from "lucide-react";

import "./dateSelector.css";

/**
 * Reusable calendar component for single-date and date-range picking.
 *
 * SINGLE DATE:
 * <DateSelector
 *   mode="single"
 *   value={date}
 *   onChange={(newDate) => setDate(newDate)}
 * />
 *
 * SINGLE DATE + TIME:
 * <DateSelector
 *   mode="single"
 *   includeTime
 *   value={dateTime}
 *   onChange={(newDateTime) => setDateTime(newDateTime)}
 * />
 *
 * DATE RANGE:
 * <DateSelector
 *   mode="range"
 *   value={range}
 *   onChange={(newRange) => setRange(newRange)}
 * />
 *
 * Single date values:
 *   date only  -> "YYYY-MM-DD"
 *   date+time  -> "YYYY-MM-DDTHH:mm"
 */

const WEEKDAY_LABELS = [
  "Su",
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
];

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const RANGE_PRESETS = [
  {
    label: "Today",
    getRange: () => {
      const today = new Date();

      return {
        start: today,
        end: today,
      };
    },
  },
  {
    label: "Last 7 Days",
    getRange: () => {
      const end = new Date();
      const start = new Date();

      start.setDate(end.getDate() - 6);

      return {
        start,
        end,
      };
    },
  },
  {
    label: "Last 30 Days",
    getRange: () => {
      const end = new Date();
      const start = new Date();

      start.setDate(end.getDate() - 29);

      return {
        start,
        end,
      };
    },
  },
  {
    label: "This Month",
    getRange: () => {
      const now = new Date();

      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      );

      return {
        start,
        end,
      };
    },
  },
];

function toDateString(date) {
  if (!date) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function toTimeString(date) {
  if (!date) return "";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function parseDateString(str) {
  if (!str) return null;

  const value = String(str);

  const datePart = value.split("T")[0];

  const parts = datePart.split("-").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((n) => Number.isNaN(n))
  ) {
    return null;
  }

  const [y, m, d] = parts;

  return new Date(y, m - 1, d);
}

function parseDateTimeString(str) {
  if (!str) return null;

  const value = String(str);

  const [datePart, timePart = "00:00"] =
    value.split("T");

  const dateParts = datePart.split("-").map(Number);

  if (
    dateParts.length !== 3 ||
    dateParts.some((n) => Number.isNaN(n))
  ) {
    return null;
  }

  const [y, m, d] = dateParts;

  const [hours = 0, minutes = 0] =
    timePart.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return new Date(
    y,
    m - 1,
    d,
    hours,
    minutes,
    0,
    0
  );
}

function isSameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(date, boundA, boundB) {
  if (!boundA || !boundB) return false;

  const [start, end] =
    boundA < boundB
      ? [boundA, boundB]
      : [boundB, boundA];

  return date > start && date < end;
}

function buildCalendarCells(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);

  const startWeekday = firstOfMonth.getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const cells = [];

  // Previous month's trailing days
  for (let i = 0; i < startWeekday; i++) {
    cells.push(
      new Date(
        year,
        month,
        i - startWeekday + 1
      )
    );
  }

  // Current month's days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  // Next month's leading days
  while (cells.length < 42) {
    const nextIndex =
      cells.length -
      (startWeekday + daysInMonth) +
      1;

    cells.push(
      new Date(
        year,
        month + 1,
        nextIndex
      )
    );
  }

  return cells;
}

function formatDisplayDate(date) {
  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");

  const month = MONTH_LABELS[date.getMonth()].slice(
    0,
    3
  );

  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function formatDisplayTime(date) {
  if (!date) return "";

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(
    2,
    "0"
  );

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${String(hours).padStart(
    2,
    "0"
  )}:${minutes} ${period}`;
}

export default function DateSelector({
  mode = "single",
  value,
  onChange,
  label,
  placeholder = "Select date",
  clearable = true,

  // NEW
  includeTime = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const [popoverPosition, setPopoverPosition] = useState({
    top: 0,
    left: 0,
  });

  const singleSelected =
    mode === "single"
      ? includeTime
        ? parseDateTimeString(value)
        : parseDateString(value)
      : null;

  const rangeSelected =
    mode === "range"
      ? {
          start: parseDateString(
            value?.startDate
          ),
          end: parseDateString(
            value?.endDate
          ),
        }
      : {
          start: null,
          end: null,
        };

  const [viewDate, setViewDate] = useState(() => {
    if (
      mode === "single" &&
      singleSelected
    ) {
      return singleSelected;
    }

    if (
      mode === "range" &&
      rangeSelected.start
    ) {
      return rangeSelected.start;
    }

    return new Date();
  });

  const [draftStart, setDraftStart] =
    useState(rangeSelected.start);

  const [draftEnd, setDraftEnd] =
    useState(rangeSelected.end);

  const [hoverDate, setHoverDate] =
    useState(null);

  // Time state for single + includeTime
  const [selectedTime, setSelectedTime] =
    useState("09:00");

  useEffect(() => {
    if (
      mode === "single" &&
      includeTime &&
      singleSelected
    ) {
      setSelectedTime(toTimeString(singleSelected));
    }
  }, [
    mode,
    includeTime,
    value,
  ]);

  const updatePopoverPosition = () => {
    if (!triggerRef.current) return;

    const rect =
      triggerRef.current.getBoundingClientRect();

    const popoverWidth =
      popoverRef.current?.offsetWidth || 320;

    const popoverHeight =
      popoverRef.current?.offsetHeight || 450;

    const gap = 6;

    let left = rect.left;
    let top = rect.bottom + gap;

    if (
      left + popoverWidth >
      window.innerWidth - 8
    ) {
      left =
        window.innerWidth -
        popoverWidth -
        8;
    }

    if (left < 8) {
      left = 8;
    }

    if (
      top + popoverHeight >
      window.innerHeight - 8
    ) {
      const topAbove =
        rect.top -
        popoverHeight -
        gap;

      if (topAbove >= 8) {
        top = topAbove;
      }
    }

    setPopoverPosition({
      top,
      left,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(e) {
      const target = e.target;

      const clickedInsideTrigger =
        containerRef.current?.contains(target);

      const clickedInsidePopover =
        popoverRef.current?.contains(target);

      if (
        !clickedInsideTrigger &&
        !clickedInsidePopover
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    updatePopoverPosition();

    const handleResize = () => {
      updatePopoverPosition();
    };

    const handleScroll = () => {
      updatePopoverPosition();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(() => {
      updatePopoverPosition();
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isOpen, mode, includeTime]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "range") {
      setDraftStart(rangeSelected.start);
      setDraftEnd(rangeSelected.end);

      if (rangeSelected.start) {
        setViewDate(rangeSelected.start);
      }
    }

    if (
      mode === "single" &&
      singleSelected
    ) {
      setViewDate(singleSelected);

      if (includeTime) {
        setSelectedTime(
          toTimeString(singleSelected)
        );
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleTriggerClick() {
    setIsOpen((prev) => !prev);
  }

  function goToPrevMonth() {
    setViewDate(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() - 1,
          1
        )
    );
  }

  function goToNextMonth() {
    setViewDate(
      (prev) =>
        new Date(
          prev.getFullYear(),
          prev.getMonth() + 1,
          1
        )
    );
  }

  function handleDayClick(date) {
    if (mode === "single") {
      if (includeTime) {
        const time =
          selectedTime || "09:00";

        onChange(
          `${toDateString(date)}T${time}`
        );

        return;
      }

      onChange(toDateString(date));
      setIsOpen(false);
      return;
    }

    // Range mode
    if (
      !draftStart ||
      (draftStart && draftEnd)
    ) {
      setDraftStart(date);
      setDraftEnd(null);
      return;
    }

    if (date < draftStart) {
      setDraftStart(date);
      setDraftEnd(null);
      return;
    }

    setDraftEnd(date);
  }

  function handleTimeChange(e) {
    const time = e.target.value;

    setSelectedTime(time);

    if (
      mode === "single" &&
      includeTime &&
      singleSelected
    ) {
      onChange(
        `${toDateString(singleSelected)}T${time}`
      );
    }
  }

  function handleApplySingle() {
    if (
      mode !== "single" ||
      !singleSelected
    ) {
      return;
    }

    if (includeTime) {
      const time =
        selectedTime || "09:00";

      onChange(
        `${toDateString(
          singleSelected
        )}T${time}`
      );
    }

    setIsOpen(false);
  }

  function handleApplyRange() {
    if (!draftStart) return;

    onChange({
      startDate: toDateString(
        draftStart
      ),
      endDate: toDateString(
        draftEnd || draftStart
      ),
    });

    setIsOpen(false);
  }

  function handleClear(e) {
    e.stopPropagation();

    if (mode === "single") {
      onChange(null);
    } else {
      setDraftStart(null);
      setDraftEnd(null);

      onChange({
        startDate: null,
        endDate: null,
      });
    }
  }

  function handlePresetClick(preset) {
    const { start, end } =
      preset.getRange();

    setDraftStart(start);
    setDraftEnd(end);
    setViewDate(start);

    onChange({
      startDate: toDateString(start),
      endDate: toDateString(end),
    });

    setIsOpen(false);
  }

  const cells =
    buildCalendarCells(viewDate);

  const displayLabel =
    mode === "single"
      ? singleSelected
        ? includeTime
          ? `${formatDisplayDate(
              singleSelected
            )}, ${formatDisplayTime(
              singleSelected
            )}`
          : toDateString(singleSelected)
        : ""
      : rangeSelected.start
      ? `${toDateString(
          rangeSelected.start
        )}${
          rangeSelected.end
            ? "  →  " +
              toDateString(
                rangeSelected.end
              )
            : ""
        }`
      : "";

  return (
    <>
      <div
        className="date-selector"
        ref={containerRef}
      >
        {label && (
          <label className="date-selector-label">
            {label}
          </label>
        )}

        <button
          ref={triggerRef}
          type="button"
          className="date-selector-trigger"
          onClick={handleTriggerClick}
        >
          <Calendar
            size={15}
            className="date-selector-icon"
          />

          <span
            className={
              displayLabel
                ? ""
                : "date-selector-placeholder"
            }
          >
            {displayLabel ||
              placeholder}
          </span>

          {clearable &&
            displayLabel && (
              <span
                className="date-selector-clear"
                onClick={handleClear}
                role="button"
                aria-label="Clear date"
              >
                <X size={13} />
              </span>
            )}
        </button>
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            className="date-selector-popover"
            style={{
              position: "fixed",
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              zIndex: 99999,
            }}
          >
            {mode === "range" && (
              <div className="date-selector-presets">
                {RANGE_PRESETS.map(
                  (preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="date-selector-preset-btn"
                      onClick={() =>
                        handlePresetClick(
                          preset
                        )
                      }
                    >
                      {preset.label}
                    </button>
                  )
                )}
              </div>
            )}

            <div className="date-selector-calendar">
              <div className="date-selector-nav">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                <span className="date-selector-nav-label">
                  {
                    MONTH_LABELS[
                      viewDate.getMonth()
                    ]
                  }{" "}
                  {viewDate.getFullYear()}
                </span>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>

              <div className="date-selector-weekdays">
                {WEEKDAY_LABELS.map(
                  (day) => (
                    <span key={day}>
                      {day}
                    </span>
                  )
                )}
              </div>

              <div className="date-selector-grid">
                {cells.map(
                  (date, idx) => {
                    const isOutside =
                      date.getMonth() !==
                      viewDate.getMonth();

                    const isToday =
                      isSameDay(
                        date,
                        new Date()
                      );

                    let isSelected = false;
                    let isRangeStart = false;
                    let isRangeEnd = false;
                    let isInRange = false;

                    if (
                      mode === "single"
                    ) {
                      isSelected =
                        isSameDay(
                          date,
                          singleSelected
                        );
                    } else {
                      isRangeStart =
                        isSameDay(
                          date,
                          draftStart
                        );

                      isRangeEnd =
                        isSameDay(
                          date,
                          draftEnd
                        );

                      const effectiveEnd =
                        draftEnd ||
                        hoverDate;

                      isInRange =
                        isBetween(
                          date,
                          draftStart,
                          effectiveEnd
                        );
                    }

                    const classNames = [
                      "date-selector-cell",
                      isOutside
                        ? "date-selector-cell-outside"
                        : "",
                      isToday
                        ? "date-selector-cell-today"
                        : "",
                      isSelected
                        ? "date-selector-cell-selected"
                        : "",
                      isRangeStart
                        ? "date-selector-cell-range-start"
                        : "",
                      isRangeEnd
                        ? "date-selector-cell-range-end"
                        : "",
                      isInRange
                        ? "date-selector-cell-in-range"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <button
                        type="button"
                        key={idx}
                        className={
                          classNames
                        }
                        onClick={() =>
                          handleDayClick(
                            date
                          )
                        }
                        onMouseEnter={() =>
                          mode ===
                            "range" &&
                          setHoverDate(
                            date
                          )
                        }
                      >
                        {date.getDate()}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* TIME PICKER */}
            {mode === "single" &&
              includeTime && (
                <div className="date-selector-time">
                  <div className="date-selector-time-header">
                    <Clock3 size={15} />
                    <span>
                      Follow-up Time
                    </span>
                  </div>

                  <input
                    type="time"
                    value={selectedTime}
                    onChange={
                      handleTimeChange
                    }
                    className="date-selector-time-input"
                  />

                  <p className="date-selector-time-hint">
                    Reminder will be generated
                    around this time.
                  </p>
                </div>
              )}

            {/* SINGLE DATE FOOTER */}
            {mode === "single" &&
              includeTime && (
                <div className="date-selector-footer">
                  <button
                    type="button"
                    className="date-selector-footer-cancel"
                    onClick={() =>
                      setIsOpen(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="date-selector-footer-apply"
                    onClick={
                      handleApplySingle
                    }
                    disabled={
                      !singleSelected
                    }
                  >
                    Apply
                  </button>
                </div>
              )}

            {/* RANGE FOOTER */}
            {mode === "range" && (
              <div className="date-selector-footer">
                <button
                  type="button"
                  className="date-selector-footer-cancel"
                  onClick={() =>
                    setIsOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="date-selector-footer-apply"
                  onClick={
                    handleApplyRange
                  }
                  disabled={!draftStart}
                >
                  Apply
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
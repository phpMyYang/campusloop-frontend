import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { sileo } from "sileo";
import GlobalSpinner from "../../components/Shared/GlobalSpinner";
import { Modal } from "bootstrap";
import CalendarEventModal from "./CalendarEventModal";

const darkToast = {
  fill: "#242424",
  styles: { title: "sileo-toast-title", description: "sileo-toast-desc" },
};

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/calendar/admin/events`,
      );
      setEvents(response.data);
    } catch (error) {
      sileo.error({
        title: "Error",
        description: "Failed to load calendar events.",
        ...darkToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      content: clickInfo.event.extendedProps.content,
      status: clickInfo.event.extendedProps.status,
      type: clickInfo.event.extendedProps.type,
      link: clickInfo.event.extendedProps.link,
      files: clickInfo.event.extendedProps.files || [],
    });

    const modal = new Modal(document.getElementById("eventDetailsModal"));
    modal.show();
  };

  return (
    <>
      <GlobalSpinner isLoading={isLoading} text="Loading Calendar..." />

      {/* PREMIUM CUSTOM FULLCALENDAR STYLES */}
      <style>{`
        /* =========================================
           1. TOOLBAR & BUTTONS STYLING
           ========================================= */
        .fc .fc-button-primary {
          background-color: var(--primary-color) !important;
          border-color: var(--primary-color) !important;
          box-shadow: none !important;
          border-radius: 8px;
          text-transform: capitalize;
          font-weight: 600;
          padding: 8px 16px;
        }
        .fc .fc-button-primary:hover,
        .fc .fc-button-primary:active,
        .fc .fc-button-primary.fc-button-active {
          background-color: #4a5435 !important;
          border-color: #4a5435 !important;
        }
        .fc .fc-toolbar-title {
          font-weight: 800;
          color: var(--primary-color);
          font-size: 1.5rem;
          text-transform: uppercase; /* GINAWANG CAPITAL ANG MONTH NAME */
          letter-spacing: 1px;
        }

        /* =========================================
           2. MONTH VIEW (PROFESSIONAL DESIGN)
           ========================================= */
        /* Calendar Border Setup */
        .fc-theme-standard .fc-scrollgrid {
          border: 1px solid #eaecf0 !important;
          border-radius: 12px;
          overflow: hidden;
        }
        .fc-theme-standard td {
          border-color: #f1f3f5 !important;
        }

        /* Day Headers (Mon, Tue, Wed...) */
        .fc-theme-standard th {
          border-right: none !important;
          border-left: none !important;
          background-color: #ffffff;
          padding: 16px 0;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 1px;
          color: #6c757d;
        }
        .fc-col-header-cell-cushion {
          color: #6c757d !important;
          text-decoration: none !important;
          font-weight: 700;
        }

        /* Day Numbers Configuration */
        .fc .fc-daygrid-day-top {
          justify-content: center !important; /* Centered Dates */
          padding-top: 8px;
          padding-bottom: 4px;
        }
        .fc-daygrid-day-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.95rem;
          font-weight: 600;
          color: #495057 !important;
          text-decoration: none !important;
          transition: all 0.2s ease;
          margin: 0 auto;
        }
        .fc-daygrid-day-number:hover {
          background-color: rgba(98, 111, 71, 0.1);
          color: var(--primary-color) !important;
        }

        /* "Today" Highlight Style */
        .fc .fc-daygrid-day.fc-day-today {
          background-color: transparent !important; /* Remove full block highlight */
        }
        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background-color: var(--primary-color);
          color: #ffffff !important;
          box-shadow: 0 4px 10px rgba(98, 111, 71, 0.3);
        }

        /* Event Pills (Month View Floating Effect) */
        .fc-direction-ltr .fc-daygrid-event.fc-h-event.fc-daygrid-block-event {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          border: none !important;
          margin: 2px 8px 4px 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .fc-direction-ltr .fc-daygrid-event.fc-h-event.fc-daygrid-block-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        .fc-event-main {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =========================================
           3. TO-DO LIST VIEW (WEEK / DAY)
           ========================================= */
        .fc-list {
          border-radius: 12px !important;
          border: 1px solid #eaecf0 !important;
          overflow: hidden;
        }
        .fc .fc-list-sticky .fc-list-day > * {
          background-color: #f8f9fa !important;
          border-color: #eaecf0 !important;
          padding: 12px 16px !important;
          font-weight: 700;
          color: var(--primary-color);
          font-size: 0.95rem;
        }
        .fc-list-event:hover td {
          background-color: rgba(98, 111, 71, 0.05) !important;
          cursor: pointer;
        }
        .fc-list-event td {
          padding: 14px 16px !important;
          border-color: #eaecf0 !important;
          font-weight: 500;
          color: #495057;
        }
        .fc-list-event-time {
          color: #6c757d !important;
          font-weight: 600;
          width: 120px;
        }
        .fc-list-event-dot {
          border-color: inherit; 
          border-width: 5px !important;
          border-radius: 50%;
        }
      `}</style>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3
            className="fw-bold mb-1"
            style={{ color: "var(--primary-color)" }}
          >
            System Calendar <i className="bi bi-calendar-check ms-1"></i>
          </h3>
          <p className="text-muted small mb-0">
            View all scheduled announcements and deadlines.
          </p>
        </div>

        {/* LEGEND COLOR INDICATORS SA UPPER RIGHT */}
        <div className="d-flex align-items-center gap-3 bg-white px-4 py-2 rounded-pill shadow-sm border">
          <span className="small fw-bold text-muted me-1 border-end pe-3">
            Legend
          </span>
          <div className="d-flex align-items-center gap-1 small text-dark fw-medium">
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#fd7e14",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>{" "}
            Pending
          </div>
          <div className="d-flex align-items-center gap-1 small text-dark fw-medium">
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#198754",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>{" "}
            Published
          </div>
          <div className="d-flex align-items-center gap-1 small text-dark fw-medium">
            <span
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#6c757d",
                borderRadius: "50%",
                display: "inline-block",
              }}
            ></span>{" "}
            Done
          </div>
        </div>
      </div>

      {/* CALENDAR CONTAINER */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek,listDay",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          contentHeight={700}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week Schedule",
            day: "Day Schedule",
          }}
        />
      </div>

      <CalendarEventModal selectedEvent={selectedEvent} />
    </>
  );
};

export default AdminCalendar;

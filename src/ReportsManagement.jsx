import { useState } from "react";
import CalendarControl from "./CalendarControl.jsx";
import "./ReportsManagement.css";
import notificationIcon from "./assets/notification.png";

const reportPeriods = ["Daily", "Weekly", "Monthly", "Annual"];
const TOTAL_ROOMS = 50;

export default function ReportsManagement({
  bookings,
  calendarDate,
  setCalendarDate,
  onOpenNotifications,
  unreadCount
}) {
  const [period, setPeriod] = useState("Daily");

  const pending = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const confirmed = bookings.filter(
    (booking) => booking.status === "Confirmed"
  ).length;

  const checkedIn = bookings.filter(
    (booking) => booking.status === "Checked-in"
  ).length;

  const checkedOut = bookings.filter(
    (booking) => booking.status === "Checked-out"
  ).length;

  const cancelled = bookings.filter(
    (booking) => booking.status === "Cancelled"
  ).length;

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status === "Confirmed" ||
      booking.status === "Checked-in"
  );

  const revenue = bookings
    .filter((booking) => booking.status !== "Cancelled")
    .reduce(
      (total, booking) =>
        total +
        Number(String(booking.amount || "").replace(/[^\d]/g, "")),
      0
    );

  const occupancyCount = Math.min(activeBookings.length, TOTAL_ROOMS);
  const occupancyPercentage =
    TOTAL_ROOMS > 0
      ? Math.round((occupancyCount / TOTAL_ROOMS) * 100)
      : 0;

  const periodCopy = {
    Daily: "Today at a glance",
    Weekly: "This week at a glance",
    Monthly: "This month at a glance",
    Annual: "This year at a glance"
  };

  const reportRows = bookings.map((booking) => ({
    booking: booking.id,
    guest: booking.guest,
    room: booking.room,
    amount: booking.amount,
    status: booking.status
  }));

  const trendBookings = bookings.slice(0, 7);

  const maxTrendValue = Math.max(
    ...trendBookings.map(() => 1),
    1
  );

  const downloadExcel = () => {
    const header = [
      "Report period",
      "Booking",
      "Guest",
      "Room",
      "Amount",
      "Status"
    ];

    const rows = reportRows.map((row) => [
      period,
      row.booking,
      row.guest,
      row.room,
      row.amount,
      row.status
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `stayease-${period.toLowerCase()}-report.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const downloadPdf = () => {
    window.print();
  };

  return (
    <main className="admin-main reports-page">
      <header className="admin-topbar">
        <div className="admin-welcome">
          <span className="admin-page-label">
            STAYEASE ADMINISTRATION / REPORTS
          </span>

          <h1>Reports &amp; Analytics</h1>

          <p>
            View booking, payment, and occupancy performance across every reporting period.
          </p>
        </div>

        <div className="admin-topbar-right">
          <button
            className="admin-notification-box"
            onClick={onOpenNotifications}
          >
            <img
              className="notification-icon-box"
              src={notificationIcon}
              alt="Notifications"
            />

            <div>
              <strong>{unreadCount} Notifications</strong>
              <span>{unreadCount} unread notifications</span>
            </div>
          </button>

          <CalendarControl
            value={calendarDate}
            onChange={setCalendarDate}
          />
        </div>
      </header>

      <section className="reports-hero">
        <div>
          <span>OPERATIONS INTELLIGENCE</span>

          <h2>{periodCopy[period]}</h2>

          <p>
            Use the period controls to compare reservations, revenue, payments, and occupancy.
          </p>
        </div>

        <div className="reports-controls">
          <div className="report-period-tabs">
            {reportPeriods.map((item) => (
              <button
                key={item}
                className={period === item ? "active" : ""}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="report-download-actions">
            <button onClick={downloadPdf}>Download PDF</button>
            <button onClick={downloadExcel}>Download Excel</button>
          </div>
        </div>
      </section>

      <section className="reports-metric-grid">
        <article>
          <span>RESERVATIONS</span>
          <strong>{bookings.length}</strong>
          <small>{pending} pending review</small>
        </article>

        <article>
          <span>CONFIRMED BOOKINGS</span>
          <strong>{confirmed}</strong>
          <small>{cancelled} cancelled</small>
        </article>

        <article>
          <span>REVENUE</span>
          <strong>₱{revenue.toLocaleString()}</strong>
          <small>From active bookings</small>
        </article>

        <article>
          <span>OCCUPANCY</span>
          <strong>{occupancyPercentage}%</strong>
          <small>
            {occupancyCount} of {TOTAL_ROOMS} rooms
          </small>
        </article>
      </section>

      <section className="reports-content-grid">
        <article className="report-panel report-chart-panel">
          <div className="report-panel-heading">
            <div>
              <span>BOOKING TREND</span>
              <h3>{period} reservations</h3>
            </div>

            <strong>{bookings.length} total</strong>
          </div>

          {trendBookings.length > 0 ? (
            <div className="report-bars">
              {trendBookings.map((booking) => {
                const bookingValue = 1;
                const barHeight =
                  (bookingValue / maxTrendValue) * 100;

                return (
                  <div
                    className="report-bar-column"
                    key={booking.id}
                  >
                    <div
                      className={`report-bar ${booking.status.toLowerCase()}`}
                      style={{
                        height: `${Math.max(barHeight, 8)}%`
                      }}
                    ></div>

                    <small>
                      {booking.id.replace("SE-", "")}
                    </small>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="report-empty-state">
              <strong>No booking data yet</strong>
              <span>
                New reservations will appear here once they are added.
              </span>
            </div>
          )}
        </article>

        <article className="report-panel">
          <div className="report-panel-heading">
            <div>
              <span>STATUS MIX</span>
              <h3>Reservation health</h3>
            </div>
          </div>

          <div className="report-status-list">
            <div>
              <span className="report-dot confirmed"></span>
              <span>Confirmed</span>
              <strong>{confirmed}</strong>
            </div>

            <div>
              <span className="report-dot pending"></span>
              <span>Pending</span>
              <strong>{pending}</strong>
            </div>

            <div>
              <span className="report-dot confirmed"></span>
              <span>Checked-in</span>
              <strong>{checkedIn}</strong>
            </div>

            <div>
              <span className="report-dot cancelled"></span>
              <span>Checked-out</span>
              <strong>{checkedOut}</strong>
            </div>

            <div>
              <span className="report-dot cancelled"></span>
              <span>Cancelled</span>
              <strong>{cancelled}</strong>
            </div>
          </div>

          <div className="report-occupancy-band">
            <span>ROOM OCCUPANCY</span>

            <strong>{occupancyPercentage}%</strong>

            <div>
              <i
                style={{
                  width: `${occupancyPercentage}%`
                }}
              ></i>
            </div>

            <small>
              {checkedIn > 0
                ? `${checkedIn} checked-in reservation${checkedIn > 1 ? "s" : ""}`
                : activeBookings.length > 0
                ? `${activeBookings.length} active reservation${activeBookings.length > 1 ? "s" : ""}`
                : "No occupied rooms yet"}
            </small>
          </div>
        </article>
      </section>

      <section className="report-panel reports-table-panel">
        <div className="report-panel-heading">
          <div>
            <span>{period.toUpperCase()} REPORT VIEW</span>
            <h3>Recent booking performance</h3>
          </div>

          <strong>{reportRows.length} rows</strong>
        </div>

        <div className="reports-table-scroll">
          {bookings.length > 0 ? (
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Guest</th>
                  <th>Stay</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.guest}</td>
                    <td>{booking.room}</td>
                    <td>{booking.amount}</td>
                    <td>
                      <span
                        className={`report-status ${booking.status.toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="report-empty-table">
              <strong>No reservations yet</strong>
              <span>
                Reports will automatically update when you add actual reservations.
              </span>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
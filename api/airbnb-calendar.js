const AIRBNB_ICAL_URL = "https://www.airbnb.com/calendar/ical/1467535611813456162.ics?t=54884f33dff140aa838034767fa94ce8";

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function parseICalEvents(icsText) {
  const blocks = icsText.split("BEGIN:VEVENT").slice(1);
  const events = [];

  for (const block of blocks) {
    const startMatch = block.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/);
    const endMatch = block.match(/DTEND(?:;VALUE=DATE)?:(\d{8})/);

    if (!startMatch || !endMatch) continue;

    const startRaw = startMatch[1];
    const endRaw = endMatch[1];

    const start = new Date(
      `${startRaw.slice(0,4)}-${startRaw.slice(4,6)}-${startRaw.slice(6,8)}T00:00:00`
    );

    const end = new Date(
      `${endRaw.slice(0,4)}-${endRaw.slice(4,6)}-${endRaw.slice(6,8)}T00:00:00`
    );

    events.push({ start, end });
  }

  return events.sort((a, b) => a.start - b.start);
}

module.exports = async function handler(req, res) {
  try {
    const response = await fetch(AIRBNB_ICAL_URL);

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        error: `Calendar fetch failed: ${response.status}`
      });
    }

    const icsText = await response.text();
    const events = parseICalEvents(icsText);
    const today = new Date();

    const upcomingBookings = events
      .filter(event => event.end >= today)
      .map(event => ({
        checkIn: formatDate(event.start),
        checkOut: formatDate(event.end)
      }));

    return res.status(200).json({
      success: true,
      bookings: upcomingBookings
    });
  } catch (error) {
    console.error("Calendar error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Unable to read Airbnb calendar"
    });
  }
};

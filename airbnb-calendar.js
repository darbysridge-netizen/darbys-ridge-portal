const AIRBNB_ICAL_URL = "https://www.airbnb.com/calendar/ical/1467535611813456162.ics?t=54884f33dff140aa838034767fa94ce8";

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
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

    const start = `${startRaw.slice(0,4)}-${startRaw.slice(4,6)}-${startRaw.slice(6,8)}T00:00:00`;
    const end = `${endRaw.slice(0,4)}-${endRaw.slice(4,6)}-${endRaw.slice(6,8)}T00:00:00`;

    events.push({
      start: new Date(start),
      end: new Date(end)
    });
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

    const upcoming = events.find(event => event.end >= today);

    if (!upcoming) {
      return res.status(200).json({
        success: true,
        nextCheckout: "No upcoming reservation found",
        nextCheckin: "No upcoming reservation found",
        turnoverWindow: "No turnover window available"
      });
    }

    return res.status(200).json({
      success: true,
      nextCheckout: formatDate(upcoming.start),
      nextCheckin: formatDate(upcoming.end),
      turnoverWindow: `${formatDate(upcoming.start)} to ${formatDate(upcoming.end)}`
    });
  } catch (error) {
    console.error("Calendar error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Unable to read Airbnb calendar"
    });
  }
};

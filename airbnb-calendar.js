const ical = require("node-ical");

const AIRBNB_ICAL_URL = "https://www.airbnb.com/calendar/ical/1467535611813456162.ics?t=54884f33dff140aa838034767fa94ce8";

function formatDate(date){
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

module.exports = async function handler(req, res) {
  try {
    const response = await fetch(AIRBNB_ICAL_URL);
    const icsText = await response.text();

    const events = Object.values(ical.parseICS(icsText))
      .filter(event => event.type === "VEVENT" && event.start && event.end)
      .sort((a, b) => new Date(a.start) - new Date(b.start));

    const now = new Date();

    const upcoming = events.find(event => new Date(event.end) >= now);

    if (!upcoming) {
      return res.status(200).json({
        success: true,
        nextCheckout: null,
        nextCheckin: null,
        turnoverWindow: null
      });
    }

    const nextCheckout = formatDate(upcoming.start);
    const nextCheckin = formatDate(upcoming.end);

    return res.status(200).json({
      success: true,
      nextCheckout,
      nextCheckin,
      turnoverWindow: `${nextCheckout} to ${nextCheckin}`
    });
  } catch (error) {
    console.error("Calendar error:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to read Airbnb calendar"
    });
  }
};

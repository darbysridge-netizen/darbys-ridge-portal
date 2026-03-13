const twilio = require("twilio");

module.exports = async function handler(req, res) {

if (req.method !== "POST") {
return res.status(405).json({ success:false });
}

try {

const client = twilio(
process.env.TWILIO_ACCOUNT_SID,
process.env.TWILIO_AUTH_TOKEN
);

const data = req.body;

let message = "";

if(data.type === "supply"){

message = `Darby's Ridge Supply Request

Cleaner: ${data.requestedBy}
Category: ${data.category}
Item: ${data.item}
Quantity: ${data.quantity}
Urgency: ${data.urgency}
Notes: ${data.notes}`;

}

if(data.type === "maintenance"){

message = `Darby's Ridge Maintenance Request

Cleaner: ${data.reportedBy}
Area: ${data.area}
Issue: ${data.issueType}
Priority: ${data.priority}
Notes: ${data.description}`;

}

await client.messages.create({
body: message,
from: process.env.TWILIO_PHONE,
to: "+13217949581"
});

return res.status(200).json({ success:true });

}
catch(error){

console.log(error);

return res.status(500).json({ success:false });

}

};

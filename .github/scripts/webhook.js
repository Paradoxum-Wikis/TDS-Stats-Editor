const https = require("https");

async function sendDiscordNotification(webhookUrl, commits, fileCount) {
  if (!webhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL secret is missing");
  }

  if (!commits || commits.length === 0) {
    throw new Error("No commits found in this push event");
  }

  const fields = commits
    .map((commit) => {
      const commitFields = [
        { name: `Commit ${commit.sha}`, value: commit.message, inline: false },
      ];

      const body = commit.full_message.split("\n").slice(1).join("\n").trim();
      if (body !== "") {
        commitFields.push({ name: "Details", value: body, inline: false });
      }

      commitFields.push({ name: "By", value: commit.author, inline: true });

      return commitFields;
    })
    .flat();

  fields.push({
    name: "Files Updated",
    value: `${fileCount} file(s)`,
    inline: true,
  });

  const embed = {
    title: "TDS Statistics Editor Update",
    description: `Push contains ${commits.length} commit(s)`,
    color: 5763719,
    fields,
    footer: { text: "Thank you for using the Statistics Editor!" },
    timestamp: new Date().toISOString(),
  };

  const payload = { embeds: [embed] };
  const data = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        "User-Agent": "github-actions/discord-notify",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (d) => (body += d));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(
            new Error(
              `Failed to post to Discord: HTTP ${res.statusCode} ${body}`,
            ),
          );
        } else {
          resolve("Discord webhook posted successfully");
        }
      });
    });

    req.on("error", (err) =>
      reject(new Error(`Failed to post to Discord: ${err.message}`)),
    );
    req.write(data);
    req.end();
  });
}

module.exports = { sendDiscordNotification };
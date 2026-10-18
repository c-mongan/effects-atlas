# Security

Do not place credentials, tokens or personal media in stories. The Storybook/MCP development server binds to loopback and is not a production service. The included static server is for local tests only.

For a suspected security issue, contact the repository owner privately through their GitHub profile or use GitHub private vulnerability reporting if enabled after publication. Avoid posting exploit details publicly until a fix is available. There is no published support SLA or hosted production service.

Use the lockfile, review dependency changes and run `npm audit`. Reports should include the affected version, reproduction steps and impact, with secrets removed.

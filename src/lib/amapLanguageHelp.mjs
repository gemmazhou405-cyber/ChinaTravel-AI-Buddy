export function getAmapLanguageFix(content, deviceId, issueId) {
  if (!content.devices.some((device) => device.id === deviceId)) return null;
  const issue = content.issues.find((item) => item.id === issueId);
  if (!issue) return null;
  const fix = issue.platformSpecific ? content.platformFixes[deviceId] : issue.fix;
  if (!fix) return null;
  return { ...fix, steps: [...(issue.beforeSteps || []), ...fix.steps] };
}

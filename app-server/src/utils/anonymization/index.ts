export function buildAnonymizedIdentifiers(userId: number, timestamp: number = Date.now()) {
  return {
    username: `deleted_user_${userId}_${timestamp}`,
    email: `deleted_${userId}_${timestamp}@anonymized.local`
  };
}

export function isAnonymizedUsername(username: string): boolean {
  return /^deleted_user_\d+_\d+$/.test(username);
}

export function isAnonymizedEmail(email: string): boolean {
  return /^deleted_\d+_\d+@anonymized\.local$/.test(email);
}

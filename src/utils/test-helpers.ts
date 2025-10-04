export function createMockAuthToken(firebaseId: string): string {
  // Mock token for testing - bypasses actual Firebase verification
  return `mock-token-${firebaseId}`;
}

export function createAuthHeaders(firebaseId: string) {
  return {
    authorization: `Bearer ${createMockAuthToken(firebaseId)}`
  };
}

export function createInvalidAuthHeaders(): { authorization: string } {
  return {
    authorization: 'Bearer invalid-token'
  };
}

export function createMissingAuthHeaders(): Record<string, never> {
  return {};
}

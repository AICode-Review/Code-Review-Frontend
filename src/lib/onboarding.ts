/**
 * Persist onboarding choices so Finish survives a refresh in demo mode,
 * and so live mode can POST when the backend route exists.
 */
const KEY = "codeferret.onboarding";

export interface OnboardingState {
  completed: boolean;
  repoIds: string[];
  preset: "chill" | "standard" | "strict";
  completedAt?: string;
}

export function loadOnboarding(): OnboardingState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

export function saveOnboarding(state: OnboardingState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearOnboarding(): void {
  localStorage.removeItem(KEY);
}

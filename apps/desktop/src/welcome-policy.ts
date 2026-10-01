/**
 * Kasyun: whether the shell opens its native welcome window.
 *
 * Upstream opens a DeepSeek sign-in window whenever neither an account nor an
 * API key is configured: at startup, after signing out, when the session
 * expires, and after a cancelled quit before the workspace opened. Kasyun
 * installs configure model providers inside the workspace instead, so the
 * window stays closed and startup goes straight to the workspace.
 * `DSH_DESKTOP_NATIVE_WELCOME=1` restores the upstream behaviour.
 */

/** Environment variable that restores the upstream native welcome window. */
export const NATIVE_WELCOME_ENV = 'DSH_DESKTOP_NATIVE_WELCOME'

/**
 * Decide whether the native welcome window may open.
 * @param env - Process environment, read at each decision so tests and launches can opt in.
 * @returns true only when the launch environment explicitly opted in.
 */
export function nativeWelcomeEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[NATIVE_WELCOME_ENV] === '1'
}

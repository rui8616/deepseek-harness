/**
 * Kasyun: launch defaults applied before anything resolves the Harness home.
 *
 * The Kasyun build keeps its data apart from an official DeepSeek Harness
 * installation on the same machine: the home defaults to `~/.ks` instead of
 * `~/.dsh`. The upstream constant (`DSH_HOME_DIR_NAME`) is deliberately left
 * alone — `agent-instructions` recognizes the user-global `AGENTS.md` only as
 * `~/.dsh/AGENTS.md` or `$DSH_HOME/AGENTS.md`, and setting the variable keeps
 * the second form valid.
 *
 * Call it from the entry's function body, never rely on import order: bundled
 * entries evaluate their external imports before any inlined module body.
 */

import { homedir } from 'node:os'
import { join } from 'node:path'

/** Directory name of the Kasyun Harness home under the OS home. */
export const KASYUN_HOME_DIR_NAME = '.ks'

/**
 * Default `DSH_HOME` to `~/.ks` when unset or blank (an explicit value wins),
 * and turn off session telemetry unless the launch environment already decided.
 * `DSH_*` variables cannot come from `.env` files, so the entry is the only place
 * a build-wide default can be set.
 * @param env - environment to update (defaults to process.env).
 */
export function applyKasyunEnvironment(env: NodeJS.ProcessEnv = process.env): void {
  const home = env.DSH_HOME
  if (home === undefined || home.trim() === '') env.DSH_HOME = join(homedir(), KASYUN_HOME_DIR_NAME)
  if (env.DSH_TELEMETRY_DISABLED === undefined) env.DSH_TELEMETRY_DISABLED = '1'
}

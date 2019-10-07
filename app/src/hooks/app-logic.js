import React, { useMemo, useCallback } from 'react'
import {
  AragonApi,
  useAppState,
  useApi,
  useCurrentApp,
  useInstalledApps,
} from '@aragon/api-react'

import { EMPTY_ADDRESS } from '../web3-utils'
import appStateReducer from '../app-state-reducer'
import { canExecute } from '..//lib/script-utils'
import { useNow, useSidePanel } from './utils-hooks'

// Temporary fix to make sure executionTargets always returns an array, until
// we find out the reason why it can sometimes be missing in the cached data.
function getScriptExecutionTargets(script) {
  return script.executionTargets || []
}

function useDecoratedScripts() {
  const { delayedScripts } = useAppState()
  const currentApp = useCurrentApp()
  const installedApps = useInstalledApps()

  return useMemo(() => {
    if (!delayedScripts) {
      return [[], []]
    }

    const decoratedScripts = delayedScripts.map((script, i) => {
      const executionTargets = getScriptExecutionTargets(script)

      let targetApp

      if (executionTargets.length > 1) {
        // If there's multiple targets, make a "multiple" version
        targetApp = {
          appAddress: EMPTY_ADDRESS,
          name: 'Multiple',
        }
      } else {
        // Otherwise, try to find the target from the installed apps
        const [targetAddress] = executionTargets

        targetApp = installedApps.find(app => app.appAddress === targetAddress)
        if (!targetApp) {
          targetApp = {
            appAddress: targetAddress,
            icon: () => null,
            name: 'External',
          }
        }
      }

      let executionTargetData = {}
      if (targetApp) {
        const { appAddress, icon, identifier, name } = targetApp
        executionTargetData = {
          address: appAddress,
          name,
          iconSrc: icon(24),
          identifier,
        }
      }

      return {
        ...script,
        executionTargetData,
      }
    })

    // Reduce the list of installed apps to just those that have been targetted by apps
    const executionTargets = installedApps
      .filter(app =>
        delayedScripts.some(script =>
          getScriptExecutionTargets(script).includes(app.appAddress)
        )
      )
      .map(({ appAddress, identifier, name }) => ({
        appAddress,
        identifier,
        name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return [decoratedScripts, executionTargets]
  }, [delayedScripts, currentApp, installedApps])
}

function useScripts() {
  const [delayedScripts, executionTargets] = useDecoratedScripts()
  const now = useNow()

  const scriptStatus = (delayedScripts || []).map(script =>
    canExecute(script, now)
  )
  const scriptStatusKey = scriptStatus.join('')

  return [
    useMemo(
      () =>
        (delayedScripts || []).map((script, index) => ({
          ...script,
          canExecute: scriptStatus[index],
        })),
      [delayedScripts, scriptStatusKey]
    ),
    executionTargets,
  ]
}

export function useScriptAction(action, onDone) {
  const api = useApi()

  return useCallback(
    scriptId => {
      api[`${action}Execution`](scriptId).toPromise()
      onDone()
    },
    [api, onDone]
  )
}

export function useExecuteAction() {
  const api = useApi()

  return useCallback(
    scriptId => {
      api.execute(scriptId).toPromise()
    },
    [api]
  )
}

export function useAppLogic() {
  const { isSyncing } = useAppState()

  const [delayedScripts, executionTargets] = useScripts()
  const panelState = useSidePanel()

  const actions = {
    pause: useScriptAction('pause', panelState.requestClose),
    resume: useScriptAction('resume', panelState.requestClose),
    cancel: useScriptAction('cancel', panelState.requestClose),
    execute: useExecuteAction(),
  }

  return {
    delayedScripts,
    executionTargets,
    panelState,
    isSyncing,
    actions,
  }
}

export function AppLogicProvider({ children }) {
  return <AragonApi reducer={appStateReducer}>{children}</AragonApi>
}
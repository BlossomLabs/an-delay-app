import gql from 'graphql-tag'

type OperationType = 'query' | 'subscription'

export const GET_DELAY_APP = (
  type: OperationType
): ReturnType<typeof gql> => gql`
  ${type} Delay($id: String!) {
    delayApp(id: $id) {
      id
      executionDelay
      appAddress
      orgAddress
      feeAmount
      feeDestination
      feeToken {
        address
        decimals
        name
        symbol
      }
    }
  }
`

export const GET_DELAYED_SCRIPT = (
  type: OperationType
): ReturnType<typeof gql> => gql`
  ${type} DelayedScript($id: String!) {
    delayedScript(id: $id) {
      index
      creator
      evmCallScript
      executionTime
      pausedAt
      timeSubmitted
      totalTimePaused
      feeAmount
    }
  }
`

export const GET_DELAYED_SCRIPTS = (
  type: OperationType
): ReturnType<typeof gql> => gql`
  ${type} DelayedScripts($appAddress: String, $first: Int!, $skip: Int!) {
    delayedScripts(where: { delayApp_: { id: $appAddress }}, orderBy: index, orderDirection: desc, first: $first, skip: $skip) {
      index
      creator
      evmCallScript
      executionTime
      pausedAt
      timeSubmitted
      totalTimePaused
    }
  }
`

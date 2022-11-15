import gql from 'graphql-tag'

type OperationType = 'query' | 'subscription'

export const GET_DELAY_APP = (type: OperationType): ReturnType<typeof gql> => gql`
  ${type} Delay($id: String!) {
    delayApp(id: $id) {
      id
      executionDelay
      appAddress
      orgAddress
    }
  }
`

export const GET_DELAYED_SCRIPT = (type: OperationType): ReturnType<typeof gql> => gql`
  ${type} DelayedScript($id: String!) {
    delayedScript(id: $id) {
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

export const GET_DELAYED_SCRIPTS = (type: OperationType): ReturnType<typeof gql> => gql`
  ${type} DelayedScripts($appAddress: String, $first: Int!, $skip: Int!) {
    delayedScripts(first: $first, skip: $skip, where: { delayApp_: { id: $appAddress }}) {
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

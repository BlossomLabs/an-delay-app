import gql from 'graphql-tag'

type OperationType = 'query' | 'subscription'

export const GET_DELAY_APP = (type: OperationType): any => gql`
  ${type} Delay($id: String!) {
    delayApp(id: $id) {
      id
      executionDelay
      appAddress
      orgAddress
    }
  }
`

export const GET_DELAYED_SCRIPTS = (type: OperationType): any => gql`
  ${type} DelayedScripts($appAddress: String, $first: Int!, $skip: Int!) {
    delayedScripts(first: $first, skip: $skip, where: { delayApp_: { id: $appAddress }}) {
      creator
      evmCallScript
      executionTime
      pausedAt
      timeSubmitted
      totalTimePaused
    }
  }
`

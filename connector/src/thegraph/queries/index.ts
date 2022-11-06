import gql from 'graphql-tag'

type OperationType = 'query' | 'subscription'

export const GET_DELAY_APP = (type: OperationType) => gql`
  ${type} Delay($id: String!) {
    delayApp(id: $id) {
      id
      executionDelay
      appAddress
      orgAddress
    }
  }
`

export const GET_DELAY_SCRIPTS = (type: OperationType) => gql`
  ${type} DelayScripts($appAddress: String, $first: Int!, $skip: Int!) {
    delayScripts(first: $first, skip: $skip, where: { delayApp_: { id: $appAddress }}) {
      executionTime
      pausedAt
      evmCallScript
    }
  }
`

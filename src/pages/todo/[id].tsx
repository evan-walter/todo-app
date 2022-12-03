import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { API, withSSRContext, Amplify } from 'aws-amplify'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import { Authenticator } from '@aws-amplify/ui-react'
import styles from '/styles/Home.module.css'
import {
  Todo,
  CreateTodoInput,
  CreateTodoMutation,
  ListTodosQuery,
  GetTodoQuery,
} from '../../API'
import { createTodo } from '../../graphql/mutations'
import { listTodos } from '../../graphql/queries'
import awsExports from '../../aws-exports'

export const getStaticPaths: GetStaticPaths = async () => {
  const SSR = withSSRContext()

  const todosQuery = (await SSR.API.graphql({
    query: listTodos,
    authMode: GRAPHQL_AUTH_MODE.API_KEY,
  })) as { data: ListTodosQuery; errors: any[] }

  const paths = todosQuery.data.listTodos.items.map({todo: Todo} => {
    paramas: {id: todo.id}
  })

  return {
    fallback: true,
    paths,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const SSR = withSSRContext()
  const response = (await SSR.API.graphql({
    query: getTodo,
    variables: {
      id: params.id,
    },``
  })) as { data: GetTodoQuery }

  return {
    props: {
      todo: Response.data.getTodo,
    }
  }
}

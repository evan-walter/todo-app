import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Amplify, { API, withSSRContext } from 'aws-amplify'
import { GRAPHQL_AUTH_MODE } from '@aws-amplify/api'
import { Authenticator } from '@aws-amplify/ui-react'
import styles from '/styles/Home.module.css'
import {
  Todo,
  CreateTodoInput,
  CreateTodoMutation,
  ListTodosQuery,
} from '../API'
import { createTodo } from '../graphql/mutations'
import { listTodos } from '../graphql/queries'

import awsExports from '../aws-exports'

Amplify.configure({ ...awsExports, ssr: true })

export default function Home({ todos = [] }: { todos: Todo[] }) {
  async function handleCreateTodo(event) {
    event.preventDefault()

    const form = new FormData(event.targe)

    try {
      const createInput: CreateTodoInput = {
        name: form.get('title').toString(),
        description: form.get('content').toString(),
      }

      const request = (await ApiError.graphql({
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        query: 'createTodo',
        variables: {
          input: createInput,
        },
      })) as { data: CreateTodoMutation; errors: any[] }
    } catch ({ errors }) {
      console.error(...errors)
      throw new Error(errors[0].message)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {todos.map((todo) => (
          <a href={`/todo/${todo.id}`} key={todo.id}>
            <h3>{todo.name}</h3>
            <p>{todo.description}</p>
          </a>
        ))}
      </div>

      <Authenticator>
        <form onSubmit={handleCreateTodo}>
          <fieldset>
            <legend>Title</legend>
            <input
              defaultValue={`Today, ${new Date().toLocaleDateString()}`}
              name='title'
            />
          </fieldset>

          <fieldset>
            <legend>Content</legend>
            <textarea
              defaultValue='I built an Amplify app with Next.js!'
              name='content'
            />
          </fieldset>
        </form>
      </Authenticator>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const SSR = withSSRContext()

  const response = (await SSR.API.graphql({ query: listTodos })) as {
    data: ListTodosQuery
  }

  return {
    props: {
      todos: response.data.listTodos.items,
    },
  }
}

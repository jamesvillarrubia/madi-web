export interface ChatMessage {
  content: string
  role: ChatRole
  tool_calls?:ToolCall[]
  tool_call_id?: string
  name?:string
}

export interface ResponseSet{
  currentStream: ReadableStream<Uint8Array> | null
  additionalMessages: ChatMessage[]
}

export interface Message {
  role: string
  content: string
}

export interface ToolCall {
  function:{
    arguments:string
    name:string
  }
  type:string
  id:string
}

export interface Persona {
  id?: string
  role: ChatRole
  avatar?: string
  name?: string
  prompt?: string
  key?: string
  isDefault?: boolean
}

export interface ToolObject {
  description:string
  name: string
  parameters: object
}

export interface Tool {
  type: string
  function: ToolObject
  plugin?: string
  display?: string
}

export interface Chat {
  id: string
  persona?: Persona
  messages?: ChatMessage[]
  name?: string
}

export type ChatRole = 'assistant' | 'user' | 'system' | 'tool'

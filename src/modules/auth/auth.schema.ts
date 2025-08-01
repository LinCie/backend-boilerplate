import * as z from "zod"

const authSchema = z.object({
  username: z.string(),
  password: z.string(),
})

const refreshSchema = z.object({
  refreshToken: z.string(),
})

export { authSchema, refreshSchema }
export type AuthSchema = z.infer<typeof authSchema>
export type RefreshSchema = z.infer<typeof refreshSchema>

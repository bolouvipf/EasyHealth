import { createParamDecorator, ExecutionContext } from "@nestjs/common"

export const Language = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()
  const acceptLang = request.headers["accept-language"]
  if (!acceptLang) return "fr"
  const primary = acceptLang.split(",")[0].trim().substring(0, 2).toLowerCase()
  return ["fr", "en"].includes(primary) ? primary : "fr"
})

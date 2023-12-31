import { Console } from 'console'
import { Context, Schema } from 'koishi'

export const name = 'auto-denied'

export interface Config {
  群聊列表:string[]
  拒绝理由:string
  自动同意:boolean
}

export const Config: Schema<Config> = Schema.object({
  群聊列表:Schema.array(Schema.string())
    .description("自动拒绝这些群聊内的人进群"),
  拒绝理由:Schema.string()
    .description("拒绝时向被拒者展示的信息")
    .default("你已经在其他群了，不需要来这里"),
  自动同意:Schema.boolean()
    .description("自动同意不在群聊列表内的用户进群")
    .default(false)
})

export function apply(ctx: Context, config: Config) {
  ctx.on("guild-member-request", async (session) => {
    for (let i of config.群聊列表) {
      for await (let j of session.bot.getGuildMemberIter(i)) {
        if (session.event.user.id === j.user.id) {
          await session.bot.handleGuildMemberRequest(session.event.message.id, false, config.拒绝理由)
          return
        }
      }
    }
    if (config.自动同意) await session.bot.handleGuildMemberRequest(session.event.message.id, true)
    
  })
}

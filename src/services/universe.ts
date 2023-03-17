import type { GetUniverse } from '@guidojw/bloxy/dist/client/apis/DevelopAPI'
import { robloxAdapter } from '../adapters'

export async function getUniverse (universeId: number): Promise<GetUniverse> {
  return (await robloxAdapter('GET', 'develop', `v1/universes/${universeId}`)).data
}

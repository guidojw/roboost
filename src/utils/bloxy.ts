import type { RESTRequestOptions, RESTResponseDataType } from '@guidojw/bloxy/dist/interfaces/RESTInterfaces'
import axios, { type Method } from 'axios'

export async function requester (options: RESTRequestOptions): Promise<RESTResponseDataType> {
  try {
    const response = await axios({
      url: options.url,
      method: options.method as Method,
      headers: options.headers as Record<string, string>,
      params: options.qs,
      data: options.body
    })
    return {
      body: response.data,
      statusMessage: response.statusText,
      statusCode: response.status,
      headers: response.headers
    }
  } catch (err) {
    if (axios.isAxiosError(err) && typeof err.response !== 'undefined') {
      // Don't throw token validation errors because Bloxy's token refresh
      // mechanism relies on these being successfully returned.
      if ((options.xcsrf === false && options.url === 'https://auth.roblox.com/v2/login') ||
        (err.response.status === 403 && err.response.statusText.includes('Token Validation Failed'))) {
        return {
          body: err.response.data,
          statusMessage: err.response.statusText,
          statusCode: err.response.status,
          headers: err.response.headers
        }
      }
    }
    throw err
  }
}

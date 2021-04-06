'use strict'

const { Structures } = require('discord.js')
const { bloxlinkAdapter, roVerAdapter } = require('../adapters')
const { VerificationProviders } = require('../util').Constants

const VerifiableGuildMember = Structures.extend('GuildMember', GuildMember => {
  class VerifiableGuildMember extends GuildMember {
    constructor (...args) {
      super(...args)

      this.verificationData = undefined
    }

    get robloxId () {
      return this.verificationData?.robloxId
    }

    get robloxUsername () {
      return this.verificationData?.robloxUsername
    }

    async fetchVerificationData (verificationPreference = VerificationProviders.ROVER) {
      let data, error
      try {
        const fetch = verificationPreference === VerificationProviders.ROVER ? fetchRoVerData : fetchBloxlinkData
        data = await fetch(this.id, this.guild.id)
      } catch (err) {
        error = err
      }
      if ((data ?? false) === false) {
        try {
          const fetch = verificationPreference === VerificationProviders.ROVER ? fetchBloxlinkData : fetchRoVerData
          data = await fetch(this.id, this.guild.id)
        } catch (err) {
          throw error ?? err
        }
      }
      if (typeof data === 'number') {
        data = {
          robloxId: data,
          provider: VerificationProviders.BLOXLINK
        }
      } else if (data) {
        data.provider = VerificationProviders.ROVER
      }

      this.verificationData = data
      return data
    }
  }

  return VerifiableGuildMember
})

async function fetchRoVerData (userId) {
  let response
  try {
    response = (await roVerAdapter('get', `/user/${userId}`)).data
  } catch (err) {
    if (err.response?.data?.errorCode === 404) {
      return null
    }
    throw err.response?.data?.error ?? err
  }

  return {
    robloxUsername: response.robloxUsername,
    robloxId: response.robloxId
  }
}

async function fetchBloxlinkData (userId, guildId) {
  const response = (await bloxlinkAdapter('get', `/user/${userId}${guildId ? `?guild=${guildId}` : ''}`)).data
  if (response.status === 'error') {
    if (response.error.includes('not linked')) {
      return null
    }
    return response.status
  }

  return (response.matchingAccount !== null || response.primaryAccount !== null)
    ? parseInt(response.matchingAccount ?? response.primaryAccount)
    : null
}

module.exports = VerifiableGuildMember

'use strict'

require('dotenv').config()

const { Client: BloxyClient } = require('bloxy')
const { Client: DiscordClient } = require('discord.js')
const { userService } = require('./src/services')
const { makeCommaSeparatedString } = require('./src/util').util

// Update these constants:
const UNIVERSE_ID = 0
const IGNORE_USERS = []
const GAME_NAME = ''

const GUILD_ID = ''
const OUTPUT_CHANNEL_ID = ''

require('./src/extensions')

async function updatePlaytesters () {
  const discordClient = new DiscordClient()
  await discordClient.login(process.env.DISCORD_TOKEN)

  const guild = discordClient.guilds.cache.get(GUILD_ID)
  const members = (await guild.members.fetch()).filter(member => member.premiumSince !== null)

  const bloxyClient = new BloxyClient({
    credentials: {
      cookie: process.env.ROBLOX_COOKIE
    }
  })
  await bloxyClient.login()

  const collaborators = await getCollaborators(bloxyClient)
  const usernames = {}

  const addedCollaborators = []
  const notVerifieds = []
  for (const member of members.values()) {
    const verificationData = await member.fetchVerificationData()
    if (!verificationData) {
      console.log(`Member ${member.user.tag} is not verified, adding to the not-verifieds array`)
      notVerifieds.push(member)
      continue
    }

    if (await shouldAdd(collaborators, verificationData.robloxId)) {
      addedCollaborators.push({ subjectType: 'User', subjectId: verificationData.robloxId, action: 'Play' })
      usernames[verificationData.robloxId] = verificationData.robloxUsername ?? verificationData.robloxId
    }
  }

  const removedCollaborators = []
  for (const collaborator of collaborators) {
    if (typeof collaborator.userId !== 'undefined' && shouldRemove(members, collaborator.userId)) {
      removedCollaborators.push(collaborator)
      usernames[collaborator.subjectId] = collaborator.username ?? collaborator.userId
    }
  }

  if (addedCollaborators.length > 0) {
    await addCollaborators(bloxyClient, addedCollaborators)
  }
  if (removedCollaborators.length > 0) {
    for (const collaborator of removedCollaborators) {
      collaborator.subjectType = 'User'
      collaborator.subjectId = collaborator.userId
      delete collaborator.userId
      delete collaborator.userName
      delete collaborator.allowedPermissions
    }
    await removeCollaborators(bloxyClient, removedCollaborators)
  }

  const gameName = GAME_NAME !== '' ? GAME_NAME : 'your game'
  const channel = guild.channels.cache.get(OUTPUT_CHANNEL_ID)
  if (channel) {
    let message = ''
    if (addedCollaborators.length > 0) {
      message += `Added ${makeCommaSeparatedString(addedCollaborators.map(collaborator => usernames[collaborator.subjectId]).map(username => `**${username}**`))} to ${gameName}.\n`
    }
    if (removedCollaborators.length > 0) {
      message += `Removed ${makeCommaSeparatedString(removedCollaborators.map(collaborator => usernames[collaborator.subjectId]).map(username => `**${username}**`))} from ${gameName}.\n`
    }
    if (notVerifieds.length > 0) {
      message += `Couldn't add ${makeCommaSeparatedString(notVerifieds)} to ${gameName}. Verify with RoVer or Bloxlink in order to be added.`
    }
    if (message !== '') {
      await channel.send(message, { allowedMentions: { parse: [] } })
    }
  }

  console.log(`Successfully added ${addedCollaborators.length} and removed ${removedCollaborators.length} users from ${gameName}. ${notVerifieds.length} users weren't added because they aren't verified with RoVer or Bloxlink.`)

  discordClient.destroy()
}

async function shouldAdd (collaborators, userId) {
  const groupsRoles = await userService.getGroupsRoles(userId)
  return !collaborators.some(collaborator => (
    collaborator.userId === userId ||
    (typeof collaborator.groupId !== 'undefined' &&
    groupsRoles.find(group => group.group.id === collaborator.groupId)?.role.rank === collaborator.rank &&
    collaborator.action?.includes('Play'))
  ))
}

function shouldRemove (members, userId) {
  return !IGNORE_USERS.includes(userId) && !members.some(member => member.robloxId === userId)
}

async function getCollaborators (client) {
  return (await client.apis.developAPI.request({
    requiresAuth: false,
    request: {
      path: `v2/universes/${UNIVERSE_ID}/permissions`,
      method: 'GET',
      allowedStatusCodes: [200]
    },
    json: true
  })).body.data.map(collaborator => {
    if (typeof collaborator.userId !== 'undefined') {
      collaborator.userId = parseInt(collaborator.userId)
    }
    if (typeof collaborator.rolesetId !== 'undefined') {
      collaborator.rolesetId = parseInt(collaborator.rolesetId)
    }
    if (typeof collaborator.groupId !== 'undefined') {
      collaborator.groupId = parseInt(collaborator.groupId)
    }
    if (typeof collaborator.rank !== 'undefined') {
      collaborator.rank = parseInt(collaborator.rank)
    }
    return collaborator
  })
}

function addCollaborators (client, collaborators) {
  return client.apis.developAPI.request({
    requiresAuth: false,
    request: {
      path: `v2/universes/${UNIVERSE_ID}/permissions`,
      method: 'POST',
      json: collaborators,
      allowedStatusCodes: [200]
    },
    json: true
  })
}

function removeCollaborators (client, collaborators) {
  return client.apis.developAPI.request({
    requiresAuth: false,
    request: {
      path: `v2/universes/${UNIVERSE_ID}/permissions`,
      method: 'DELETE',
      json: collaborators,
      allowedStatusCodes: [200]
    },
    json: true
  })
}

updatePlaytesters()

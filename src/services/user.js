'use strict'

const { robloxAdapter } = require('../adapters')

async function getGroupsRoles (userId) {
  return (await robloxAdapter('GET', 'groups', `v1/users/${userId}/groups/roles`)).data.data
}

async function getUser (userId) {
  return (await robloxAdapter('GET', 'users', `v1/users/${userId}`)).data
}

module.exports = {
  getGroupsRoles,
  getUser
}

'use strict'

const { robloxAdapter } = require('../adapters')

async function getGroupsRoles (userId) {
  return (await robloxAdapter('get', 'groups', `v1/users/${userId}/groups/roles`)).data.data
}

module.exports = {
  getGroupsRoles
}

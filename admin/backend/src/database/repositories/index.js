/**
 * Repository Index
 * Exports all repository modules
 */

module.exports = {
  userRepository: require('./userRepository'),
  skillRepository: require('./skillRepository'),
  eventRepository: require('./eventRepository'),
  historyRepository: require('./historyRepository'),
  notificationRepository: require('./notificationRepository')
};

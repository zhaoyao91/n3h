const {connect} = require('nats-ex')

module.exports = natsExItem = {
  name: 'natsEx',
  build: async () => {
    const natsEx = await connect()
    return {
      item: natsEx,
      stop: () => natsEx.close()
    }
  }
}

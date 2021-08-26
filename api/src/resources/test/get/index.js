async function handler(ctx) {
  ctx.body = {
    message: 'This is test message. Everything is fine.',
  };
}

module.exports.register = (router) => {
  router.get('/', handler);
};

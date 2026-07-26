function send(res, statusCode, data, meta) {
  const body = { success: true, data: data === undefined ? null : data };
  if (meta) {
    body.meta = meta;
  }
  return res.status(statusCode).json(body);
}

module.exports = {
  ok: function (res, data, meta) {
    return send(res, 200, data, meta);
  },
  created: function (res, data, meta) {
    return send(res, 201, data, meta);
  },
  noContent: function (res) {
    return res.status(204).end();
  }
};

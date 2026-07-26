const { google } = require("googleapis");
const stream = require("stream");
const env = require("../config/env");
const logger = require("../utils/logger");

function getAuth() {
  const oauth2Client = new google.auth.OAuth2(
    env.google.clientId,
    env.google.clientSecret,
    env.google.redirectUri
  );

  oauth2Client.setCredentials({
    refresh_token: env.google.refreshToken,
  });

  return oauth2Client;
}

function getDriveClient() {
  return google.drive({ version: "v3", auth: getAuth() });
}

module.exports = {
  async uploadFile(buffer, filename, mimeType) {
    // NOTE: previously this logged env.google.driveFolderId and
    // env.google.clientEmail on every upload. Those are configuration/
    // credential-adjacent values and should never be written to logs.
    const drive = getDriveClient();
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: env.google.driveFolderId
          ? [env.google.driveFolderId]
          : undefined,
      },
      media: {
        mimeType: mimeType,
        body: bufferStream,
      },
      fields: "id, size",
    });

    return {
      driveFileId: response.data.id,
      sizeBytes: Number(response.data.size) || buffer.length,
    };
  },

  async streamFile(driveFileId, res) {
    const drive = getDriveClient();
    const driveResponse = await drive.files.get(
      { fileId: driveFileId, alt: "media" },
      { responseType: "stream" }
    );

    return new Promise(function (resolve, reject) {
      driveResponse.data
        .on("end", function () {
          resolve();
        })
        .on("error", function (err) {
          logger.error("Drive stream error for file " + driveFileId, err);
          reject(err);
        })
        .pipe(res);
    });
  },

  async deleteFile(driveFileId) {
    const drive = getDriveClient();
    try {
      await drive.files.delete({ fileId: driveFileId });
    } catch (err) {
      logger.error("Failed to delete Drive file " + driveFileId, err);
    }
  },
};

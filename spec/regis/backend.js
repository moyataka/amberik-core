const FUNCTIONS_URL = 'http://localhost:8010'

const image_upload = [
  {
    $$map: [{
      $$applySpec: [{
        headers: [{
          Authorization: [{$always: ['Bearer ' + process.env.RECEIPTS_TOKEN]}],
        }],
        body: ['$identity'],
        _paths: [{
          bucket: [{ $always: [process.env.BUCKET_RECEIPTS] }],
        }]
      }]
    }]
  },
  { $$useStream: {
      name: 'image_upload_to_bucket',
      type: 'post',
      url: FUNCTIONS_URL + '/line/:bucket',
    },
  },
]

module.exports = {
  image_upload,
}
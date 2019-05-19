module.exports = {
  name: 'myapp',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/myapp/',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};

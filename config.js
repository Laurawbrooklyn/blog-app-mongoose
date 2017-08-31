exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://test:test123@ds163053.mlab.com:63053/blog-app';
exports.PORT = process.env.PORT || 8080;
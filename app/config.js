var env = process.env;

var envTelegramMasterUserId = env.OPENSHIFT_TELEGRAM_MASTER_USER_ID
var envTelegramToken = env.OPENSHIFT_TELEGRAM_TOKEN;
var envDbUsername = env.OPENSHIFT_MONGODB_DB_USERNAME;
var envDbPassword = env.OPENSHIFT_MONGODB_DB_PASSWORD;
var envDbHost = env.OPENSHIFT_MONGODB_DB_HOST;
var envDbPort = env.OPENSHIFT_MONGODB_DB_PORT;

if (!envTelegramMasterUserId || !envTelegramToken || !envDbUsername || !envDbPassword || !envDbHost || !envDbPort) {
    // console.error('not all environment variables are set');
    var evars = ['TELEGRAM_TOKEN', 'MONGODB_DB_USERNAME', 'MONGODB_DB_PASSWORD', 'MONGODB_DB_HOST', 'MONGODB_DB_PORT'].map(function(v) {
        return 'OPENSHIFT_' + v;
    }).filter(function(v) {
        return !env[v];
    });
    throw new Error('not all environment variables are set ' + evars.join(' '));
    return;
}

module.exports = {
    telegram: {
        token: envTelegramToken,
        masterUserId: envTelegramMasterUserId / 1
    },
    mongodb: {
        username: envDbUsername,
        password: envDbPassword,
        host: envDbHost,
        port: envDbPort
    },
    web: {
        port: env.NODE_PORT || 3000,
        ip: env.NODE_IP || 'localhost'
    },
    messages: {
        ok: '⚡️👌',
        error: 'апшибка😁',
        accessDenied: '🙈access denied🙈'
    }
}

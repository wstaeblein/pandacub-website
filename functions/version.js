exports.version = async function (event, context) {

/*     if (event.httpMethod == 'GET') {
        
    }
    var version = require('../package.json').version;
    var beta = version[0] == '0' ? ' Beta' : ''; */
    return {
        statusCode: 200,
        //body: JSON.stringify({ version: version + beta })
        body: JSON.stringify({ version: '0.7.7' })
    };
};
const { Client } = require('pg');
const { dbConfig } = require('/opt/config');

exports.handler = (event, context, callback) => {
    
    const logs = `select * from workflow_logs wl 
    where workflow_id = ${event.pathParameters.id};`;    
        
    var statusCode = 200;
    var resBody = [];

    const client = new Client(dbConfig);

    client.connect((err) => {
        if (err) {
            callback(err);
        }
    });
    
    client.query(logs, (err, res) => {
        if (err) {
            callback(err);
        }
        else {
            // Check if the data exists in the database
            if (res.rows) {
            for (let i = 0; i < res.rows.length; i++) {
                resBody.push(res.rows[i]);
            }
            }
            else {
                statusCode = 404;
                resBody = {
                    errorMessage: "Data source not found"
                };
            }

            const response = {
                statusCode,
                body: JSON.stringify(resBody),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                },
            };
            
            callback(null, response);
            client.end();
        }
    });
    
};

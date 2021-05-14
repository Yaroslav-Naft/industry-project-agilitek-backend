const { Client } = require('pg');
const { dbConfig } = require('/opt/config');

exports.handler = (event, context, callback) => {
    const query = `SELECT c.column_name
	               FROM information_schema.table_constraints tc 
	                    JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
	                    JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
	               AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
	               WHERE constraint_type = 'PRIMARY KEY' and tc.table_name = '${event.pathParameters.table_name}'
                   `;

    const client = new Client(dbConfig);

    client.connect((err) => {
        if (err) {
            callback(err);
        }
    });

    client.query(query, (err, res) => {
        if (err) {
            callback(err);
        }
        else {
            const response = {
                statusCode: 200,
                body: JSON.stringify(res.rows),
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

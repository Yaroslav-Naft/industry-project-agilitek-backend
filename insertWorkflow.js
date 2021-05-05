const { Client } = require('pg');
const { dbConfig } = require('/opt/config');

exports.handler = (event, context, callback) => {
    const query =
        `
        insert into workflows
        (
            name,
            description,
            flow_url,
            "table",
            "column",
            "label",
            "type",
            sobject_type,
            where_clause,
            "mapping",
            active,
            run_again
        )
        values
        (
            '${event.name}',
            '${event.desc}',
            '${event.flowUrl}',
            '${event.table}',
            '${event.column}',
            '${event.label}',
            '${event.type}',
            '${event.sObjectType}',
            '${event.whereClause}',
            '${JSON.stringify(event.mapping)}',
            ${event.active},
            ${event.runAgain}
        );
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
                body: JSON.stringify(res),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            };
            callback(null, response);
            client.end();
        }
    });
};

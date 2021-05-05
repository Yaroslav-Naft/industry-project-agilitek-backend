const { Client } = require('pg');
const { dbConfig } = require('/opt/config');

exports.handler = async(event, context, callback) => {

    let {
        id,
        flow_url,
        mapping,
        table,
        where_clause,
        column,
        sobject_type,
        type,
        label,
        run_again,
        pk_column
    } = event;

    let query;
    let columns;

    if (Object.keys(mapping).length > 0) {
        query = "select ";
        columns = "";

        for (const key in mapping) {
            columns += `${mapping[key]} as "${key}", `;
        }

        columns = columns.replace(/,\s*$/, "");
        query += `${columns} from "${table}" where ${where_clause};`;
    }
    else {
        columns = `${column} as "Id"`;

        query = `
            select ${columns}
            from "${table}"
            where ${where_clause};`;
    }

    const client = new Client(dbConfig);

    await client.connect((err) => {
        if (err) {
            callback(err);
        }
    });

    let queryResponse = {};

    if (run_again) {
        queryResponse = await client.query(query);
    }
    else {
        const checkContactWorkflows = await client.query('select * from contact_workflows');

        if (checkContactWorkflows.rows.length > 0) {
            queryResponse = await client.query(`select ${columns}
                                                from "${table}"
                                                where ${where_clause}
                                                and ${pk_column} in (select contact_id from contact_workflows where contact_id not in (select contact_id
                                                			   from contact_workflows
                                                			   where workflow_id = ${id}))`);
        }
        else {
            queryResponse = await client.query(query);
        }
    }

    let resultSet = queryResponse.rows;

    for (let i = 0; i < resultSet.length; i++) {
        // Get record
        const record = await client.query(`
                select contact_id from contact_workflows cw 
                where workflow_id = ${id} and contact_id = '${resultSet[i].Id}';`);


        // check if record already exists
        // If FALSE, insert a new record
        // If TRUE, don't do anything
        if (record.rows.length === 0) {
            console.log(resultSet);
            await client.query(
                `insert into contact_workflows values (${id}, '${resultSet[i].Id}');`
            );
        }
    }

    client.end();

    return {
        workflowId: id,
        resultSet,
        flowUrl: flow_url,
        type,
        label,
        sObjectType: sobject_type,
    };
};

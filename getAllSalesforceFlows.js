const axios = require('axios');
const OAuth = require('/opt/OAuth');

exports.handler = async (event) => {

  try {
    const resp = await OAuth();
    const data = await resp.getOAuthToken();

    const res = await axios.get(
      `${process.env.INSTANCE_URL}/services/data/v51.0/actions/custom/flow`,
      {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      }
    );
    
    const response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        },
        body: res.data,
    };
    return response.body;
  } catch(err) {
    console.log(err)
  }
};
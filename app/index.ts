const IS_DEV = process.env.NODE_ENV !== "production";
const http = require("http");
if (IS_DEV) {
  require("dotenv").config();
} else {
  setInterval(() => {
    http
      .get(
        `http://${process.env.HEROKU_APP_NAME}.herokuapp.com`,
        (res: any) => {
          const { statusCode } = res;
          let error;

          if (statusCode !== 200) {
            error = new Error(
              "Request Failed.\n" + `Status Code: ${statusCode}`
            );
          }

          if (error) {
            console.error(error.message);
            // consume response data to free up memory
            res.resume();
            return;
          }
        }
      )
      .on("error", function (err: any) {
        console.log("Error: " + err.message);
      });
  }, 20 * 60 * 1000); // ping every 20 minutes
}

require("./server");
require("./app");

import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * *", function () {
    https
    .get(process.env.API_URL, (res) =>{
        if (res.statusCode === 200) console.log("Get request sent successfully");
        else console.log("Get resquet failed", res.statusCode);
    })
    .on("error", (e) => console.error("error while sending request", e));
    
});

export default job;

//CRON JOB EXPLANATION
//CRON jobs are scheduled tasks run periodically at fixed intervals
// we want to send 1 Get request for every 14 minutes so that our api never gets inactive on render.com

//how to define a "schedule?"
// you define a schedule using a cron expression, which consists of 5 fields representing

//! MiNUTE, HOUR, DAY OF THE MOUNTH, MONTH DAY OF THE WEEK

//? EXAMPLES && EXPLANATION:
//* 14 * * * * -EVERY 14 minutes
//* 0 0 * * 0 - At midnight on every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th of every month
//* 0 0 1 1 - At midnght, on january 1st
//* 0 * * * * - Every hour

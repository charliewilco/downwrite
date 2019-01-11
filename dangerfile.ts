import { message, danger, schedule, Scheduleable } from "danger";
import noConsole from "danger-plugin-no-console";

const modifiedMD = danger.git.modified_files.join("- ");
message("Changed Files in this PR: \n - " + modifiedMD);

schedule(noConsole({ whitelist: ["error", "warn"] }));

import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.js";
import { data } from "./data/resource.js";

const backend = defineBackend({
  auth,
  data,
});

const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.deletionProtection = "ACTIVE";

const { amplifyDynamoDbTables } = backend.data.resources.cfnResources;
for (const table of Object.values(amplifyDynamoDbTables)) {
  table.deletionProtectionEnabled = true;
  table.pointInTimeRecoveryEnabled = true;
}

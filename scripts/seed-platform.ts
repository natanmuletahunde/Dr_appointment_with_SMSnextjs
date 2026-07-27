import { seedPlatformData } from "../lib/services/seed.service";

seedPlatformData()
  .then((result) => {
    console.log("Seed complete", result);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

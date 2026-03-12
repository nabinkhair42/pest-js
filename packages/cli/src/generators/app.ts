import type { GeneratorContext } from "../types.js";
import { writeFile } from "../utils/fs.js";
import { appTemplate } from "../templates/app.js";
import { serverTemplate } from "../templates/server.js";
import { healthRouteTemplate } from "../templates/health-route.js";
import { errorHandlerTemplate } from "../templates/error-handler.js";
import { envConfigTemplate } from "../templates/env-config.js";
import { appTestTemplate } from "../templates/app-test.js";
import { errorsTemplate } from "../templates/errors.js";
import { loggerTemplate } from "../templates/logger.js";
import { validateTemplate } from "../templates/validate.js";
import { exampleRouteTemplate } from "../templates/example-route.js";
import { exampleRouteTestTemplate } from "../templates/example-route-test.js";
import { rateLimitTemplate } from "../templates/rate-limit.js";
import { swaggerTemplate } from "../templates/swagger.js";

export function generateApp(ctx: GeneratorContext): void {
  const { config, projectDir } = ctx;

  writeFile(projectDir, "src/app.ts", appTemplate(config));
  writeFile(projectDir, "src/server.ts", serverTemplate(config));
  writeFile(projectDir, "src/routes/health.ts", healthRouteTemplate());
  writeFile(projectDir, "src/routes/tasks.ts", exampleRouteTemplate(config));
  writeFile(projectDir, "src/middleware/error-handler.ts", errorHandlerTemplate());
  writeFile(projectDir, "src/middleware/validate.ts", validateTemplate());
  writeFile(projectDir, "src/middleware/rate-limit.ts", rateLimitTemplate());
  writeFile(projectDir, "src/config/env.ts", envConfigTemplate(config));
  writeFile(projectDir, "src/lib/errors.ts", errorsTemplate());
  writeFile(projectDir, "src/lib/logger.ts", loggerTemplate());
  writeFile(projectDir, "tests/app.test.ts", appTestTemplate());

  if (config.swagger) {
    writeFile(projectDir, "src/lib/swagger.ts", swaggerTemplate(config));
  }

  // Only generate example route test for in-memory variant (no DB)
  if (config.database === "none") {
    writeFile(projectDir, "tests/tasks.test.ts", exampleRouteTestTemplate());
  }
}

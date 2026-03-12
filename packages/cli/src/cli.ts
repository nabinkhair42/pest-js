import * as p from "@clack/prompts";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { rmSync, existsSync } from "node:fs";
import type { ProjectConfig, DatabaseORM, DatabaseProvider, PackageManager } from "./types.js";
import { VERSION, BANNER } from "./constants.js";
import { generateProject } from "./generators/index.js";
import { getDependencies } from "./generators/package-json.js";
import { gitInit, getGitUser, isGitInstalled } from "./utils/git.js";
import { validateProjectName, isPackageManagerInstalled } from "./utils/validation.js";

function cleanupOnFailure(projectDir: string): void {
  try {
    if (existsSync(projectDir)) {
      rmSync(projectDir, { recursive: true, force: true });
    }
  } catch {
    // Ignore cleanup errors
  }
}

interface CliArgs {
  yes: boolean;
  name?: string;
  database?: DatabaseORM;
  dbProvider?: DatabaseProvider;
  docker?: boolean;
  swagger?: boolean;
  packageManager?: PackageManager;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { yes: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--yes" || arg === "-y") {
      args.yes = true;
    } else if (arg === "--name" && argv[i + 1]) {
      args.name = argv[++i];
    } else if (arg === "--database" && argv[i + 1]) {
      const val = argv[++i];
      const valid: DatabaseORM[] = ["prisma", "drizzle", "typeorm", "none"];
      if (!valid.includes(val as DatabaseORM)) {
        console.error(`Invalid --database value: "${val}". Must be one of: ${valid.join(", ")}`);
        process.exit(1);
      }
      args.database = val as DatabaseORM;
    } else if (arg === "--db-provider" && argv[i + 1]) {
      const val = argv[++i];
      const valid: DatabaseProvider[] = ["postgresql", "mysql", "sqlite"];
      if (!valid.includes(val as DatabaseProvider)) {
        console.error(`Invalid --db-provider value: "${val}". Must be one of: ${valid.join(", ")}`);
        process.exit(1);
      }
      args.dbProvider = val as DatabaseProvider;
    } else if (arg === "--docker") {
      args.docker = true;
    } else if (arg === "--no-docker") {
      args.docker = false;
    } else if (arg === "--swagger") {
      args.swagger = true;
    } else if (arg === "--no-swagger") {
      args.swagger = false;
    } else if (arg === "--package-manager" && argv[i + 1]) {
      const val = argv[++i];
      const valid: PackageManager[] = ["npm", "pnpm", "yarn"];
      if (!valid.includes(val as PackageManager)) {
        console.error(`Invalid --package-manager value: "${val}". Must be one of: ${valid.join(", ")}`);
        process.exit(1);
      }
      args.packageManager = val as PackageManager;
    } else if (arg === "--version" || arg === "-v") {
      console.log(`pest-js-app v${VERSION}`);
      process.exit(0);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp(): void {
  console.log(`
${BANNER}
  pest-js-app v${VERSION} - Progressive Express Starter Template

  Usage:
    npx pest-js-app [options]

  Options:
    --name <name>              Project name (kebab-case)
    --database <orm>           Database ORM: prisma | drizzle | typeorm | none
    --db-provider <db>         Database provider: postgresql | mysql | sqlite
    --docker                   Enable Docker support
    --no-docker                Disable Docker support
    --swagger                  Enable Swagger API docs (default with --yes)
    --no-swagger               Disable Swagger API docs
    --package-manager <pm>     Package manager: npm | pnpm | yarn
    -y, --yes                  Use defaults for all prompts (non-interactive)
    -v, --version              Show version
    -h, --help                 Show help

  Examples:
    npx pest-js-app
    npx pest-js-app --yes --name my-api
    npx pest-js-app --name my-api --database prisma --db-provider postgresql --docker
    npx pest-js-app --yes --name my-api --package-manager pnpm
`);
}

function getInstallCommand(pm: PackageManager, deps: string[], dev: boolean): string {
  const devFlag = dev ? "-D" : "";
  const depsStr = deps.join(" ");

  switch (pm) {
    case "pnpm":
      return `pnpm add ${devFlag} ${depsStr}`.replace(/\s+/g, " ").trim();
    case "yarn":
      return `yarn add ${devFlag} ${depsStr}`.replace(/\s+/g, " ").trim();
    default:
      return `npm install ${devFlag} ${depsStr}`.replace(/\s+/g, " ").trim();
  }
}

function runCommand(command: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, { cwd, stdio: "ignore", shell: true });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`Exit code ${code}`))));
    child.on("error", reject);
  });
}

export async function runCli(args: CliArgs): Promise<void> {
  p.intro(`${BANNER}\n  v${VERSION} - Progressive Express Starter Template`);

  let config: ProjectConfig;

  if (args.yes) {
    config = {
      name: args.name || "my-app",
      description: "A PEST.js application",
      author: getGitUser() || "developer",
      database: args.database || "none",
      dbProvider: args.dbProvider || "postgresql",
      docker: args.docker ?? (args.database !== undefined && args.database !== "none"),
      swagger: args.swagger ?? true,
      git: true,
      install: true,
      packageManager: args.packageManager || "npm",
    };
  } else {
    config = await collectInteractiveConfig(args);
  }

  // Validate name
  const nameError = validateProjectName(config.name);
  if (nameError) {
    p.cancel(nameError);
    process.exit(1);
  }

  const projectDir = resolve(config.name);

  // Generate project
  const s = p.spinner();
  s.start("Creating project structure");

  try {
    const ctx = { config, projectDir };
    generateProject(ctx);
  } catch (err) {
    s.stop("Failed to create project structure");
    cleanupOnFailure(projectDir);
    p.cancel(err instanceof Error ? err.message : "Unknown error during project generation");
    process.exit(1);
  }

  s.stop("Project structure created");

  // Git init
  if (config.git) {
    if (!isGitInstalled()) {
      p.log.warn("git is not installed. Skipping repository initialization.");
    } else {
      s.start("Initializing git repository");
      gitInit(projectDir);
      s.stop("Git repository initialized");
    }
  }

  // Install dependencies
  if (config.install) {
    const pm = config.packageManager;

    if (!isPackageManagerInstalled(pm)) {
      p.log.warn(`${pm} is not installed. Run '${pm} install' manually after installing ${pm}.`);
    } else {
      const { deps, devDeps } = getDependencies(config);
      s.start(`Installing ${deps.join(", ")}`);
      try {
        const prodCmd = getInstallCommand(pm, deps, false);
        await runCommand(prodCmd, projectDir);
        s.message(`Installing dev: ${devDeps.join(", ")}`);
        const devCmd = getInstallCommand(pm, devDeps, true);
        await runCommand(devCmd, projectDir);
        s.stop("Dependencies installed");
      } catch {
        s.stop(`Failed to install dependencies - run '${pm} install' manually`);
      }
    }
  }

  // Show next steps
  const pmRun = config.packageManager === "npm" ? "npm run" : config.packageManager;
  const nextSteps = [
    `cd ${config.name}`,
    ...(!config.install ? [`${config.packageManager} install`] : []),
    `${pmRun} dev`,
  ];

  if (config.database === "prisma") {
    nextSteps.push("npx prisma migrate dev --name init");
  } else if (config.database === "drizzle") {
    nextSteps.push(`${pmRun} db:push`);
  }

  if (config.swagger) {
    nextSteps.push("# API docs at http://localhost:3000/api/docs");
  }

  p.note(nextSteps.join("\n"), "Next steps");

  p.outro("Happy coding!");
}

async function collectInteractiveConfig(args: CliArgs): Promise<ProjectConfig> {
  const name = await p.text({
    message: "Project name",
    placeholder: "my-app",
    defaultValue: args.name || "my-app",
    validate: (value) => validateProjectName(value ?? ""),
  });

  if (p.isCancel(name)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const description = await p.text({
    message: "Project description",
    placeholder: "A PEST.js application",
    defaultValue: "A PEST.js application",
  });

  if (p.isCancel(description)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const defaultAuthor = getGitUser() || "developer";
  const author = await p.text({
    message: "Author",
    placeholder: defaultAuthor,
    defaultValue: defaultAuthor,
  });

  if (p.isCancel(author)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const database = await p.select({
    message: "Database ORM",
    options: [
      { value: "none" as const, label: "None", hint: "No database" },
      { value: "prisma" as const, label: "Prisma", hint: "Type-safe ORM with migrations" },
      { value: "drizzle" as const, label: "Drizzle", hint: "Lightweight SQL-first ORM" },
      { value: "typeorm" as const, label: "TypeORM", hint: "Decorator-based ORM" },
    ],
  });

  if (p.isCancel(database)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  let dbProvider: DatabaseProvider = "postgresql";

  if (database !== "none") {
    const provider = await p.select({
      message: "Database provider",
      options: [
        { value: "postgresql" as const, label: "PostgreSQL", hint: "Recommended for production" },
        { value: "mysql" as const, label: "MySQL" },
        { value: "sqlite" as const, label: "SQLite", hint: "File-based, great for development" },
      ],
    });

    if (p.isCancel(provider)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    dbProvider = provider;
  }

  const defaultDocker = database !== "none";
  const docker = await p.confirm({
    message: "Add Docker support?",
    initialValue: defaultDocker,
  });

  if (p.isCancel(docker)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const swagger = await p.confirm({
    message: "Add Swagger API docs?",
    initialValue: true,
  });

  if (p.isCancel(swagger)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const packageManager = await p.select({
    message: "Package manager",
    options: [
      { value: "npm" as const, label: "npm", hint: "Default" },
      { value: "pnpm" as const, label: "pnpm", hint: "Fast, disk efficient" },
      { value: "yarn" as const, label: "yarn", hint: "Reliable, feature rich" },
    ],
  });

  if (p.isCancel(packageManager)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const git = await p.confirm({
    message: "Initialize git repository?",
    initialValue: true,
  });

  if (p.isCancel(git)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const install = await p.confirm({
    message: "Install dependencies now?",
    initialValue: true,
  });

  if (p.isCancel(install)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return {
    name: name as string,
    description: description as string,
    author: author as string,
    database: database as DatabaseORM,
    dbProvider,
    docker: docker as boolean,
    swagger: swagger as boolean,
    git: git as boolean,
    install: install as boolean,
    packageManager: packageManager as PackageManager,
  };
}

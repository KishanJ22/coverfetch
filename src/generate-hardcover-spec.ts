import { generate } from "@genql/cli";

const RESET = "\x1b[0m";
const green = (text: string) => `${Bun.color("green", "ansi")}${text}${RESET}`;
const red = (text: string) => `${Bun.color("red", "ansi")}${text}${RESET}`;
const dim = (text: string) => `${Bun.color("gray", "ansi")}${text}${RESET}`;

function envCheck() {
  const requiredVars = ["GITHUB_BASE_URL"];
  const missingVars: string[] = [];

  requiredVars.forEach((varName) => {
    if (!Bun.env[varName] || Bun.env[varName].length < 1) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log(
      red("The following variables are missing from your environment:"),
    );

    missingVars.forEach((varName) => {
      console.log(red(`  - ${varName}`));
    });

    process.exit(1);
  } else {
    console.log(green("All variables are set!"));
  }
}

async function retrieveSchema() {
  const url = `${process.env.GITHUB_BASE_URL}/repos/hardcoverapp/hardcover-docs/contents/schema.graphql`;
  const headers = new Headers();
  headers.append("accept", "application/vnd.github.raw+json");

  const response = await Bun.fetch(url, {
    method: "GET",
    headers,
  });

  const newSchema = await response.text();

  const filePath = `${import.meta.dir}/clients/hardcover/schema.graphql`;

  const schemaFile = Bun.file(filePath);

  const currentSchema = (await schemaFile.exists())
    ? await schemaFile.text()
    : null;

  if (currentSchema === newSchema) {
    console.log(dim("Schema is already up to date, skipping write"));
    return;
  }
  
  await generateGraphqlTypes();
  await Bun.write(filePath, newSchema);

  console.log(green("Saved graphql schema successfully"));
}

async function generateGraphqlTypes() {
  const schema = await Bun.file(
    `${import.meta.dir}/clients/hardcover/schema.graphql`,
  ).text();

  generate({
    schema,
    output: `${import.meta.dir}/clients/hardcover/hardcover-graphql`,
  }).catch((err) => {
    console.error(red(err));
    throw err;
  });
}

(async () => {
  envCheck();

  await retrieveSchema();
})();

import { runPublicApiConsumerSmoke } from "../fixtures/public-api-consumer.tsx";

const result = runPublicApiConsumerSmoke();
const violations: string[] = [];

if (!result.compatibilityOk) {
  violations.push("public consumer fixture observed a compatibility failure");
}

if (result.qualityGrade !== "A") {
  violations.push(
    `public consumer fixture expected quality grade 'A' but received '${result.qualityGrade}'`
  );
}

if (result.formType !== "form") {
  violations.push(
    "MetadataForm did not resolve to a form root for the consumer fixture"
  );
}

if (result.sectionStackType !== "div") {
  violations.push(
    "MetadataSectionStack did not resolve to the expected consumer root element"
  );
}

if (result.stateBoundaryType === null) {
  violations.push(
    "MetadataStateBoundary did not return a renderable consumer element"
  );
}

if (violations.length > 0) {
  console.error("metadata-ui public consumer fixture failed:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exit(1);
}

console.log("metadata-ui public consumer fixture passed");

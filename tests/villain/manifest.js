const villainManifest = TestDefinitions.get("villain");

if (!villainManifest) {
  throw new Error("Missing shared test definition: villain");
}

if (!TestRegistry.get("villain")) {
  TestRegistry.register(villainManifest);
}
